import {
  Injectable,
  BadRequestException,
  BadGatewayException,
  Logger,
} from '@nestjs/common';

export interface BmkgSlotCuaca {
  datetime: string;
  t: number;
  tcc: number;
  tp: number;
  weather: number;
  weather_desc: string;
  weather_desc_en: string;
  wd_deg: number;
  wd: string;
  wd_to: string;
  ws: number;
  hu: number;
  vs: number | null;
  vs_text: string | null;
  time_index: string;
  analysis_date: string;
  image: string;
  utc_datetime: string;
  local_datetime: string;
}

export interface BmkgLokasi {
  adm1: string;
  adm2: string;
  adm3: string;
  adm4: string;
  desa: string;
  kecamatan: string;
  kotkab: string;
  lat: number;
  lon: number;
  provinsi: string;
  timezone: string;
  type: string;
}

export interface BmkgCuacaResponse {
  source: 'BMKG';
  lokasi: BmkgLokasi;
  cuaca: BmkgSlotCuaca[][];
  diperbarui: string;
}

interface CacheItem {
  data: BmkgCuacaResponse;
  expiresAt: number;
}

@Injectable()
export class BmkgService {
  private readonly logger = new Logger(BmkgService.name);
  // Cache in-memory per adm4 dengan TTL minimal 1 jam (3600000 ms)
  // Mematuhi batas BMKG: maks 60 request/menit/IP
  private readonly cache = new Map<string, CacheItem>();
  private readonly TTL_MS = 60 * 60 * 1000; // 1 jam

  async getPrakiraanCuaca(adm4: string): Promise<BmkgCuacaResponse> {
    // 1. Validasi format adm4: xx.xx.xx.xxxx (10 digit terpisah titik)
    if (!adm4 || !/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/.test(adm4)) {
      throw new BadRequestException(
        'Format adm4 tidak valid. Gunakan format xx.xx.xx.xxxx (contoh: 12.11.01.1010)',
      );
    }

    // 2. Cek Cache in-memory
    const cached = this.cache.get(adm4);
    if (cached && Date.now() < cached.expiresAt) {
      this.logger.debug(`Menggunakan cache BMKG untuk adm4=${adm4}`);
      return cached.data;
    }

    // 3. Request ke API BMKG
    const url = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${encodeURIComponent(adm4)}`;

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(10_000), // timeout 10 detik
      });

      if (!res.ok) {
        throw new Error(`BMKG upstream HTTP ${res.status}`);
      }

      const json = (await res.json()) as {
        data?: Array<{
          lokasi: BmkgLokasi;
          cuaca: BmkgSlotCuaca[][];
        }>;
      };

      if (!json.data || json.data.length === 0) {
        throw new Error('Data BMKG untuk adm4 ini kosong');
      }

      const responseData: BmkgCuacaResponse = {
        source: 'BMKG',
        lokasi: json.data[0].lokasi,
        cuaca: json.data[0].cuaca,
        diperbarui: new Date().toISOString(),
      };

      // Simpan di cache
      this.cache.set(adm4, {
        data: responseData,
        expiresAt: Date.now() + this.TTL_MS,
      });

      return responseData;
    } catch (err) {
      this.logger.error(
        `Gagal memanggil BMKG untuk adm4=${adm4}: ${(err as Error).message}`,
      );

      // Jika ada stale cache, kembalikan stale cache
      if (cached) {
        this.logger.warn(`Mengembalikan stale cache untuk adm4=${adm4}`);
        return cached.data;
      }

      // 4. Return HTTP 502 Bad Gateway jika BMKG gagal
      throw new BadGatewayException(
        'Gagal mengambil data prakiraan cuaca dari server BMKG. Coba beberapa saat lagi.',
      );
    }
  }
}

