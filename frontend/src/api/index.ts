import {
  CreateLaporanPayload,
  CuacaDesaResponse,
  BmkgCuacaResponse,
  GempaResponse,
  Desa,
  Laporan,
  StatusDesa,
  StatusLaporan,
} from './types'

// Deteksi otomatis URL backend: jika diakses dari HP via IP lokal (misal 192.168.x.x),
// jangan tembak localhost HP, melainkan tembak IP laptop/host tempat backend berjalan.
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      const envUrl = import.meta.env.VITE_API_URL
      if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
        return `http://${host}:3000`
      }
    }
  }
  return import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
}

const BASE_URL = getBaseUrl()

// Master fallback 15 kecamatan resmi Kabupaten Dairi (agar jika offline pertama kali tetap tampil sempurna)
export const DEFAULT_DESA_LIST: Desa[] = [
  { id: '1', nama: 'Sidikalang', kecamatan: 'Sidikalang', status: StatusDesa.AMAN, skor: 0, adm4: '12.11.01.1010', createdAt: new Date().toISOString() },
  { id: '2', nama: 'Pegagan Julu I', kecamatan: 'Sumbul', status: StatusDesa.AMAN, skor: 0, adm4: '12.11.02.1007', createdAt: new Date().toISOString() },
  { id: '3', nama: 'Sumbul Tengah', kecamatan: 'Tigalingga', status: StatusDesa.AMAN, skor: 0, adm4: '12.11.03.2001', createdAt: new Date().toISOString() },
  { id: '4', nama: 'Sihorbo', kecamatan: 'Siempat Nempu', status: StatusDesa.AMAN, skor: 0, adm4: '12.11.04.2002', createdAt: new Date().toISOString() },
  { id: '5', nama: 'Parongil', kecamatan: 'Silima Pungga Pungga', status: StatusDesa.AMAN, skor: 0, adm4: '12.11.05.1014', createdAt: new Date().toISOString() },
  { id: '6', nama: 'Sukadame', kecamatan: 'Tanah Pinem', status: StatusDesa.AMAN, skor: 0, adm4: '12.11.06.2001', createdAt: new Date().toISOString() },
  { id: '7', nama: 'Kuta Tengah', kecamatan: 'Siempat Nempu Hulu', status: StatusDesa.AMAN, skor: 0, adm4: '12.11.07.2002', createdAt: new Date().toISOString() },
  { id: '8', nama: 'Lae Itam', kecamatan: 'Siempat Nempu Hilir', status: StatusDesa.AMAN, skor: 0, adm4: '12.11.08.2001', createdAt: new Date().toISOString() },
  { id: '9', nama: 'Simanduma', kecamatan: 'Pegagan Hilir', status: StatusDesa.AMAN, skor: 0, adm4: '12.11.09.2001', createdAt: new Date().toISOString() },
  { id: '10', nama: 'Lae Hole', kecamatan: 'Parbuluan', status: StatusDesa.AMAN, skor: 0, adm4: '12.11.10.2002', createdAt: new Date().toISOString() },
  { id: '11', nama: 'Lae Parira', kecamatan: 'Lae Parira', status: StatusDesa.AMAN, skor: 0, adm4: '12.11.11.2003', createdAt: new Date().toISOString() },
  { id: '12', nama: 'Gunung Sitember', kecamatan: 'Gunung Sitember', status: StatusDesa.AMAN, skor: 0, adm4: '12.11.12.2002', createdAt: new Date().toISOString() },
  { id: '13', nama: 'Sambaliang', kecamatan: 'Berampu', status: StatusDesa.AMAN, skor: 0, adm4: '12.11.13.2001', createdAt: new Date().toISOString() },
  { id: '14', nama: 'Silalahi I', kecamatan: 'Silahisabungan', status: StatusDesa.AMAN, skor: 0, adm4: '12.11.14.2002', createdAt: new Date().toISOString() },
  { id: '15', nama: 'Sitinjo', kecamatan: 'Sitinjo', status: StatusDesa.AMAN, skor: 0, adm4: '12.11.15.2001', createdAt: new Date().toISOString() },
]

// Helper simpan cache offline
export function getLocalCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`siaga_cache_${key}`)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function setLocalCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`siaga_cache_${key}`, JSON.stringify(data))
  } catch {
    // Ignore quota errors
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export async function getDesa(): Promise<Desa[]> {
  try {
    const res = await fetch(`${BASE_URL}/desa`)
    const data = await handleResponse<Desa[]>(res)
    setLocalCache('desa', data)
    return data
  } catch {
    const cached = getLocalCache<Desa[]>('desa')
    if (cached && cached.length > 0) return cached
    return DEFAULT_DESA_LIST
  }
}

export async function getDesaById(id: string): Promise<Desa> {
  try {
    const res = await fetch(`${BASE_URL}/desa/${id}`)
    const data = await handleResponse<Desa>(res)
    setLocalCache(`desa_${id}`, data)
    return data
  } catch (err) {
    const cached = getLocalCache<Desa>(`desa_${id}`)
    if (cached) return cached
    const allDesa = getLocalCache<Desa[]>('desa') ?? DEFAULT_DESA_LIST
    const found = allDesa.find((d) => d.id === id || String(d.id) === String(id))
    if (found) return found
    throw err
  }
}

export async function getLaporan(params?: { jenis?: string; desaId?: string }): Promise<Laporan[]> {
  try {
    const url = new URL(`${BASE_URL}/laporan`)
    if (params?.jenis) url.searchParams.set('jenis', params.jenis)
    if (params?.desaId) url.searchParams.set('desaId', params.desaId)
    const res = await fetch(url.toString())
    const data = await handleResponse<Laporan[]>(res)
    if (!params || (!params.jenis && !params.desaId)) {
      setLocalCache('laporan', data)
    }
    return data
  } catch {
    const cached = getLocalCache<Laporan[]>('laporan') ?? []
    let result = cached
    if (params?.jenis) result = result.filter((l) => l.jenis === params.jenis)
    if (params?.desaId) result = result.filter((l) => l.desa?.id === params.desaId)
    return result
  }
}

export async function getLaporanById(id: string): Promise<Laporan> {
  try {
    const res = await fetch(`${BASE_URL}/laporan/${id}`)
    const data = await handleResponse<Laporan>(res)
    setLocalCache(`laporan_${id}`, data)
    return data
  } catch (err) {
    const cached = getLocalCache<Laporan>(`laporan_${id}`)
    if (cached) return cached
    const allLaporan = getLocalCache<Laporan[]>('laporan')
    const found = allLaporan?.find((l) => l.id === id)
    if (found) return found
    throw err
  }
}

export async function createLaporan(data: CreateLaporanPayload): Promise<Laporan> {
  if (!navigator.onLine) {
    throw new Error('Perangkat sedang offline. Sambungkan internet untuk mengirim laporan.')
  }
  const res = await fetch(`${BASE_URL}/laporan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<Laporan>(res)
}

export async function updateLaporanStatus(id: string, status: StatusLaporan, adminKey?: string): Promise<Laporan> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  if (adminKey) {
    headers['x-admin-key'] = adminKey;
  }

  const res = await fetch(`${BASE_URL}/laporan/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  })
  return handleResponse<Laporan>(res)
}

export async function deleteLaporan(id: string, adminKey: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/laporan/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-key': adminKey,
    },
  })
  return handleResponse<{ message: string }>(res)
}

export async function getCuacaDesa(id: string): Promise<CuacaDesaResponse> {
  try {
    const res = await fetch(`${BASE_URL}/desa/${id}/cuaca`)
    const data = await handleResponse<CuacaDesaResponse>(res)
    setLocalCache(`cuaca_desa_${id}`, data)
    return data
  } catch (err) {
    const cached = getLocalCache<CuacaDesaResponse>(`cuaca_desa_${id}`)
    if (cached) return cached
    throw err
  }
}

export async function getCuacaByAdm4(adm4: string): Promise<BmkgCuacaResponse> {
  try {
    const res = await fetch(`${BASE_URL}/cuaca?adm4=${encodeURIComponent(adm4)}`)
    const data = await handleResponse<BmkgCuacaResponse>(res)
    setLocalCache(`cuaca_adm4_${adm4}`, data)
    return data
  } catch (err) {
    const cached = getLocalCache<BmkgCuacaResponse>(`cuaca_adm4_${adm4}`)
    if (cached) return cached
    throw err
  }
}

export async function getGempaTerkini(): Promise<GempaResponse> {
  try {
    const res = await fetch(`${BASE_URL}/gempa/terkini`)
    const data = await handleResponse<GempaResponse>(res)
    setLocalCache('gempa_terkini', data)
    return data
  } catch (err) {
    const cached = getLocalCache<GempaResponse>('gempa_terkini')
    if (cached) return cached
    return { sumber: 'BMKG', waktuAmbil: new Date().toISOString(), data: [] }
  }
}

export async function getGempaDirasakan(): Promise<GempaResponse> {
  try {
    const res = await fetch(`${BASE_URL}/gempa/dirasakan`)
    const data = await handleResponse<GempaResponse>(res)
    setLocalCache('gempa_dirasakan', data)
    return data
  } catch (err) {
    const cached = getLocalCache<GempaResponse>('gempa_dirasakan')
    if (cached) return cached
    return { sumber: 'BMKG', waktuAmbil: new Date().toISOString(), data: [] }
  }
}
