import { Injectable, Logger } from '@nestjs/common';

// Struktur satu slot prakiraan dari BMKG (field sesuai hasil curl nyata)
export interface SlotCuaca {
  local_datetime: string;  // "2026-11-14 21:00:00"
  utc_datetime: string;    // "2026-11-14 14:00:00"
  weather_desc: string;    // "Hujan Ringan"
  suhu: number;            // t °C
  kelembaban: number;      // hu %
  ikonUrl: string;         // image URL dari BMKG
}

export interface HasilCuaca {
  adm4: string;
  lokasi: string;
  prakiraan: SlotCuaca[];
  skorCuaca: number;        // 0-3
  diperbarui: string;       // ISO timestamp cache
  sumber: 'BMKG';
}

interface CacheEntry {
  data: HasilCuaca;
  expiresAt: number; // Date.now() + TTL
}

@Injectable()
export class CuacaService {
  private readonly logger = new Logger(CuacaService.name);
  // Cache in-memory per adm4, TTL 3 jam (batas 60 req/menit BMKG)
  private readonly cache = new Map<string, CacheEntry>();
  private readonly TTL_MS = 3 * 60 * 60 * 1000; // 3 jam
  private readonly SLOT_LIMIT = 8; // ±24 jam ke depan

  /**
   * Hitung skor cuaca 0-3 dari deskripsi terburuk dalam daftar slot.
   * petir/lebat=3, sedang=2, hujan=1, selain itu=0.
   * Alasan: metode paling sederhana tanpa butuh tabel weather code.
   */
  hitungSkorCuaca(slots: SlotCuaca[]): number {
    let skor = 0;
    for (const s of slots) {
      const desc = s.weather_desc.toLowerCase();
      let skorSlot = 0;
      if (desc.includes('petir') || desc.includes('lebat')) {
        skorSlot = 3;
      } else if (desc.includes('sedang')) {
        skorSlot = 2;
      } else if (desc.includes('hujan')) {
        skorSlot = 1;
      }
      if (skorSlot > skor) skor = skorSlot;
    }
    return skor;
  }

  async getCuaca(adm4: string): Promise<HasilCuaca | null> {
    if (!adm4) {
      return null;
    }

    // Kembalikan cache bila masih valid
    const cached = this.cache.get(adm4);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    try {
      const url = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${encodeURIComponent(adm4)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        throw new Error(`BMKG HTTP ${res.status}`);
      }

      const json = await res.json() as {
        data: Array<{
          lokasi: { desa: string; kecamatan: string };
          // cuaca adalah array of arrays (per hari, lalu per slot 3 jam)
          cuaca: Array<Array<{
            local_datetime: string;
            utc_datetime: string;
            weather_desc: string;
            t: number;
            hu: number;
            image: string;
          }>>;
        }>;
      };

      if (!json.data || json.data.length === 0) {
        throw new Error('BMKG: data kosong');
      }

      const item = json.data[0];
      // Flatten array of arrays menjadi daftar slot
      const allSlots = (item.cuaca ?? []).flat();

      // Ambil SLOT_LIMIT slot ke depan saja
      const slots: SlotCuaca[] = allSlots.slice(0, this.SLOT_LIMIT).map((s) => ({
        local_datetime: s.local_datetime,
        utc_datetime: s.utc_datetime,
        weather_desc: s.weather_desc,
        suhu: s.t,
        kelembaban: s.hu,
        ikonUrl: s.image,
      }));

      const skorCuaca = this.hitungSkorCuaca(slots);
      const lokasiNama = `${item.lokasi.desa}, ${item.lokasi.kecamatan}`;

      const hasil: HasilCuaca = {
        adm4,
        lokasi: lokasiNama,
        prakiraan: slots,
        skorCuaca,
        diperbarui: new Date().toISOString(),
        sumber: 'BMKG',
      };

      this.cache.set(adm4, { data: hasil, expiresAt: Date.now() + this.TTL_MS });
      return hasil;
    } catch (err) {
      this.logger.warn(`Gagal mengambil data BMKG untuk adm4=${adm4}: ${(err as Error).message}`);

      // Kembalikan cache lama bila ada (meskipun expired) agar tidak crash
      if (cached) {
        this.logger.warn(`Mengembalikan cache lama untuk adm4=${adm4}`);
        return cached.data;
      }
      return null;
    }
  }
}

