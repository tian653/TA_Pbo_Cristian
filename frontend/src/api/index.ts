import {
  CreateLaporanPayload,
  CuacaDesaResponse,
  BmkgCuacaResponse,
  GempaResponse,
  Desa,
  Laporan,
  StatusLaporan,
} from './types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export async function getDesa(): Promise<Desa[]> {
  const res = await fetch(`${BASE_URL}/desa`)
  return handleResponse<Desa[]>(res)
}

export async function getDesaById(id: string): Promise<Desa> {
  const res = await fetch(`${BASE_URL}/desa/${id}`)
  return handleResponse<Desa>(res)
}

export async function getLaporan(params?: { jenis?: string; desaId?: string }): Promise<Laporan[]> {
  const url = new URL(`${BASE_URL}/laporan`)
  if (params?.jenis) url.searchParams.set('jenis', params.jenis)
  if (params?.desaId) url.searchParams.set('desaId', params.desaId)
  const res = await fetch(url.toString())
  return handleResponse<Laporan[]>(res)
}

export async function getLaporanById(id: string): Promise<Laporan> {
  const res = await fetch(`${BASE_URL}/laporan/${id}`)
  return handleResponse<Laporan>(res)
}

export async function createLaporan(data: CreateLaporanPayload): Promise<Laporan> {
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
  const res = await fetch(`${BASE_URL}/desa/${id}/cuaca`)
  return handleResponse<CuacaDesaResponse>(res)
}

export async function getCuacaByAdm4(adm4: string): Promise<BmkgCuacaResponse> {
  const res = await fetch(`${BASE_URL}/cuaca?adm4=${encodeURIComponent(adm4)}`)
  return handleResponse<BmkgCuacaResponse>(res)
}

export async function getGempaTerkini(): Promise<GempaResponse> {
  const res = await fetch(`${BASE_URL}/gempa/terkini`)
  return handleResponse<GempaResponse>(res)
}

export async function getGempaDirasakan(): Promise<GempaResponse> {
  const res = await fetch(`${BASE_URL}/gempa/dirasakan`)
  return handleResponse<GempaResponse>(res)
}
