import { Injectable, BadGatewayException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Interface sesuai struktur JSON BMKG yang terverifikasi dari curl
export interface GempaData {
  Tanggal: string;           // "13 Nov 2026"
  Jam: string;               // "14:31:39 WIB"
  DateTime: string;          // ISO "2026-11-13T07:31:39+00:00"
  Coordinates: string;       // "-5.56,102.24"
  Lintang: string;           // "5.56 LS"
  Bujur: string;             // "102.24 BT"
  Magnitude: string;         // "4.1"
  Kedalaman: string;         // "24 km"
  Wilayah: string;           // deskripsi lokasi
  Potensi?: string;          // "Tidak berpotensi tsunami" (hanya gempaterkini)
  Dirasakan?: string;        // "II - III Enggano" (hanya gempadirasakan)
  Shakemap?: string;         // "20261113143139.mmi.jpg" (hanya autogempa)
}

export interface GempaResponse {
  sumber: 'BMKG';
  waktuAmbil: string;
  data: GempaData[];
}

interface CacheItem {
  data: GempaResponse;
  expiresAt: number;
}

@Injectable()
export class GempaService {
  private readonly logger = new Logger(GempaService.name);
  
  // Cache minimal 5 menit untuk semua endpoint gempa
  private cacheAutogempa: CacheItem | null = null;
  private cacheTerkini: CacheItem | null = null;
  private cacheDirasakan: CacheItem | null = null;
  private readonly TTL_MS = 5 * 60 * 1000; // 5 menit

  // Titik acuan: Sidikalang (ibukota Kab. Dairi)
  private readonly DAIRI_CENTER_LAT = 2.74997;
  private readonly DAIRI_CENTER_LNG = 98.31191;
  
  // Radius filter (km), bisa diubah via env var GEMPA_RADIUS_KM
  private readonly radiusKm: number;

  constructor(private readonly configService: ConfigService) {
    // Default 150 km, bisa override dari env
    this.radiusKm = this.configService.get<number>('GEMPA_RADIUS_KM', 150);
  }

  /**
   * Menghitung jarak antara dua titik koordinat dengan rumus Haversine (km)
   */
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius bumi dalam km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Parse koordinat dari string "lat,lng" menjadi {lat, lng}
   */
  private parseCoordinates(coordStr: string): { lat: number; lng: number } | null {
    const parts = coordStr.split(',');
    if (parts.length !== 2) return null;
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  }

  /**
   * Filter gempa dalam radius tertentu dari Kabupaten Dairi
   */
  private filterByRadius(gempaList: GempaData[]): GempaData[] {
    return gempaList.filter((g) => {
      const coord = this.parseCoordinates(g.Coordinates);
      if (!coord) return false;
      const distance = this.haversineDistance(
        this.DAIRI_CENTER_LAT,
        this.DAIRI_CENTER_LNG,
        coord.lat,
        coord.lng,
      );
      return distance <= this.radiusKm;
    });
  }

  /**
   * Fetch data gempa dari URL BMKG (JSON)
   */
  private async fetchGempa(url: string): Promise<GempaData[]> {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        throw new Error(`BMKG HTTP ${res.status}`);
      }

      const json = (await res.json()) as {
        Infogempa?: {
          gempa?: GempaData | GempaData[];
        };
      };

      if (!json.Infogempa?.gempa) {
        throw new Error('Data gempa kosong dari BMKG');
      }

      // autogempa.json mengembalikan object tunggal, yang lain array
      const gempaData = Array.isArray(json.Infogempa.gempa)
        ? json.Infogempa.gempa
        : [json.Infogempa.gempa];

      return gempaData;
    } catch (err) {
      this.logger.warn(`Gagal fetch ${url}: ${(err as Error).message}. Menggunakan fallback data kosong.`);
      return [];
    }
  }

  /**
   * GET /gempa/terkini
   * Mengembalikan gempa M 5.0+ dalam radius dari Kabupaten Dairi
   */
  async getGempaTerkini(): Promise<GempaResponse> {
    if (this.cacheTerkini && Date.now() < this.cacheTerkini.expiresAt) {
      return this.cacheTerkini.data;
    }

    const url = 'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json';
    const allGempa = await this.fetchGempa(url);
    const filtered = this.filterByRadius(allGempa);

    // Tambahkan base URL untuk shakemap (jika ada field Shakemap di terkini, biasanya tidak ada)
    // gempaterkini tidak punya shakemap, tapi tetap kita kembalikan struktur konsisten
    const response: GempaResponse = {
      sumber: 'BMKG',
      waktuAmbil: new Date().toISOString(),
      data: filtered,
    };

    this.cacheTerkini = {
      data: response,
      expiresAt: Date.now() + this.TTL_MS,
    };

    return response;
  }

  /**
   * GET /gempa/dirasakan
   * Mengembalikan gempa yang dirasakan dalam radius dari Kabupaten Dairi
   */
  async getGempaDirasakan(): Promise<GempaResponse> {
    if (this.cacheDirasakan && Date.now() < this.cacheDirasakan.expiresAt) {
      return this.cacheDirasakan.data;
    }

    const url = 'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json';
    const allGempa = await this.fetchGempa(url);
    const filtered = this.filterByRadius(allGempa);

    const response: GempaResponse = {
      sumber: 'BMKG',
      waktuAmbil: new Date().toISOString(),
      data: filtered,
    };

    this.cacheDirasakan = {
      data: response,
      expiresAt: Date.now() + this.TTL_MS,
    };

    return response;
  }

  /**
   * Helper untuk mendapatkan URL shakemap lengkap
   */
  getShakemapUrl(filename: string | undefined): string | null {
    if (!filename) return null;
    return `https://data.bmkg.go.id/DataMKG/TEWS/${filename}`;
  }
}
