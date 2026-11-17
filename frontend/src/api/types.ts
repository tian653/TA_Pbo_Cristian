
export enum StatusDesa {
  AMAN = 'AMAN',
  WASPADA = 'WASPADA',
  SIAGA = 'SIAGA',
  AWAS = 'AWAS',
}

export enum JenisLaporan {
  LONGSOR = 'LONGSOR',
  BANJIR = 'BANJIR',
  RETAKAN_TANAH = 'RETAKAN_TANAH',
  JALAN_RUSAK = 'JALAN_RUSAK',
}

export enum StatusLaporan {
  BARU = 'BARU',
  DIVERIFIKASI = 'DIVERIFIKASI',
  DITANGANI = 'DITANGANI',
  SELESAI = 'SELESAI',
}

export interface Desa {
  id: string;
  nama: string;
  kecamatan: string;
  status: StatusDesa;
  skor: number;
  adm4?: string | null;
  createdAt: string;
  laporan?: Laporan[];
}

export interface SlotCuaca {
  local_datetime: string;
  utc_datetime: string;
  weather_desc: string;
  suhu: number;
  kelembaban: number;
  ikonUrl: string;
}

export interface CuacaDesaResponse {
  desa: {
    id: string;
    nama: string;
    kecamatan: string;
  };
  skorLaporan: number;
  skorCuaca: number;
  skor: number;
  status: StatusDesa;
  prakiraan: SlotCuaca[] | null;
  sumber: 'BMKG';
  pesan?: string;
}

export interface Laporan {
  id: string;
  jenis: JenisLaporan;
  deskripsi: string;
  lat?: number;
  lng?: number;
  status: StatusLaporan;
  desa: Desa;
  adm4?: string | null;
  fotoUrl?: string | null;
  createdAt: string;
}

export interface CreateLaporanPayload {
  jenis: JenisLaporan;
  deskripsi: string;
  lat?: number;
  lng?: number;
  desaId: string;
  adm4?: string;
}

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

export interface BmkgCuacaResponse {
  source: 'BMKG';
  lokasi: {
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
  };
  cuaca: BmkgSlotCuaca[][];
  diperbarui: string;
}

export interface GempaData {
  Tanggal: string;
  Jam: string;
  DateTime: string;
  Coordinates: string;
  Lintang: string;
  Bujur: string;
  Magnitude: string;
  Kedalaman: string;
  Wilayah: string;
  Potensi?: string;
  Dirasakan?: string;
  Shakemap?: string;
}

export interface GempaResponse {
  sumber: 'BMKG';
  waktuAmbil: string;
  data: GempaData[];
}
