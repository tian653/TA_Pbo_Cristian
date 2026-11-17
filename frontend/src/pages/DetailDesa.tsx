import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDesaById, getCuacaDesa } from '../api'
import { Desa, CuacaDesaResponse, JenisLaporan, StatusDesa } from '../api/types'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import LongsorIcon from '../components/icons/LongsorIcon'
import BanjirIcon from '../components/icons/BanjirIcon'
import RetakanTanahIcon from '../components/icons/RetakanTanahIcon'
import JalanRusakIcon from '../components/icons/JalanRusakIcon'

const jenisIcons: Record<JenisLaporan, React.ComponentType<{ className?: string }>> = {
  [JenisLaporan.LONGSOR]: LongsorIcon,
  [JenisLaporan.BANJIR]: BanjirIcon,
  [JenisLaporan.RETAKAN_TANAH]: RetakanTanahIcon,
  [JenisLaporan.JALAN_RUSAK]: JalanRusakIcon,
}

const jenisLabel: Record<JenisLaporan, string> = {
  [JenisLaporan.LONGSOR]: 'Longsor',
  [JenisLaporan.BANJIR]: 'Banjir',
  [JenisLaporan.RETAKAN_TANAH]: 'Retakan Tanah',
  [JenisLaporan.JALAN_RUSAK]: 'Jalan Rusak',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatWaktuCuaca(localDateTimeStr: string) {
  try {
    const d = new Date(localDateTimeStr.replace(' ', 'T'))
    return (
      d.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB'
    )
  } catch {
    return localDateTimeStr + ' WIB'
  }
}

export default function DetailDesa() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [desa, setDesa] = useState<Desa | null>(null)
  const [cuaca, setCuaca] = useState<CuacaDesaResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [cuacaLoading, setCuacaLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id])

  const loadData = () => {
    setLoading(true)
    setError(null)
    setCuacaLoading(true)

    // Ambil data dasar desa
    getDesaById(id!)
      .then(setDesa)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))

    // Ambil data integrasi cuaca BMKG & skor gabungan
    getCuacaDesa(id!)
      .then(setCuaca)
      .catch(() => {
        // Jangan crash aplikasi bila endpoint cuaca gagal
        setCuaca(null)
      })
      .finally(() => setCuacaLoading(false))
  }

  const statusAktif = cuaca?.status ?? desa?.status ?? StatusDesa.AMAN
  const skorTotal = cuaca?.skor ?? desa?.skor ?? 0

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 md:px-6 lg:px-8 pt-12 pb-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg px-2 py-1"
            aria-label="Kembali"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>
          <h1 className="text-xl font-bold text-gray-800">Detail Desa</h1>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 py-6">
        {loading && <LoadingSpinner />}

        {error && <ErrorState message={error} onRetry={loadData} />}

        {!loading && desa && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Kolom Kiri: Info Desa dan Laporan */}
            <div className="lg:col-span-2 space-y-6">
              {/* Info Desa Card */}
              <div className="bg-white rounded-card-lg shadow-card border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800">{desa.nama}</h2>
                    <p className="text-sm text-gray-500 mt-1">Kecamatan {desa.kecamatan}</p>
                  </div>
                  <StatusBadge status={statusAktif} type="desa" size="md" />
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Indikator Awal Kewaspadaan
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">Skor Laporan</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {cuaca ? cuaca.skorLaporan : desa.skor}
                      </p>
                    </div>
                    <div className="bg-primary-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-primary-600 mb-1">Skor Cuaca</p>
                      <p className="text-2xl font-bold text-primary-700">
                        {cuaca ? cuaca.skorCuaca : 0}
                      </p>
                    </div>
                    <div className="bg-primary-100 rounded-lg p-3 text-center">
                      <p className="text-xs text-primary-700 font-medium mb-1">Total Skor</p>
                      <p className="text-2xl font-bold text-primary-800">{skorTotal}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-3 italic leading-relaxed">
                    * Status dihitung sebagai indikator awal kewaspadaan dari laporan warga (24 jam) dan cuaca BMKG.
                  </p>
                </div>
              </div>

              {/* Laporan di Desa */}
              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Laporan di Desa Ini
                </h3>
                {!desa.laporan || desa.laporan.length === 0 ? (
                  <EmptyState
                    icon={
                      <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    }
                    title="Belum Ada Laporan"
                    description="Belum ada laporan kejadian di desa ini"
                  />
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {desa.laporan.map((l) => {
                      const IconComponent = jenisIcons[l.jenis]
                      return (
                        <button
                          key={l.id}
                          onClick={() => navigate(`/laporan/${l.id}`)}
                          className="text-left bg-white rounded-card shadow-card hover:shadow-card-hover border border-gray-100 p-4 transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-100 transition-colors">
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-sm font-semibold text-gray-700">{jenisLabel[l.jenis]}</span>
                                <StatusBadge status={l.status} type="laporan" />
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2">{l.deskripsi}</p>
                              <p className="text-xs text-gray-400 mt-1.5">{formatDate(l.createdAt)}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Kolom Kanan: Cuaca */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-card-lg shadow-card border border-gray-100 p-5 lg:sticky lg:top-24">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.5 2a3.5 3.5 0 101.665 6.58 8.48 8.48 0 00-.774 3.427A3.5 3.5 0 1012 15.5a8.48 8.48 0 003.427-.774 3.5 3.5 0 10.658-6.56 8.48 8.48 0 00-.774-3.428A3.5 3.5 0 1012 5.5a8.48 8.48 0 00-3.427.774A3.5 3.5 0 005.5 2z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-sm font-bold text-gray-800">Prakiraan Cuaca</h3>
                  </div>
                  <span className="text-[10px] font-semibold bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
                    BMKG
                  </span>
                </div>

                {cuacaLoading ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    Memuat data cuaca BMKG...
                  </div>
                ) : !cuaca || !cuaca.prakiraan || cuaca.prakiraan.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <svg className="w-10 h-10 mx-auto text-gray-300 mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.5 2a3.5 3.5 0 101.665 6.58 8.48 8.48 0 00-.774 3.427A3.5 3.5 0 1012 15.5a8.48 8.48 0 003.427-.774 3.5 3.5 0 10.658-6.56 8.48 8.48 0 00-.774-3.428A3.5 3.5 0 1012 5.5a8.48 8.48 0 00-3.427.774A3.5 3.5 0 005.5 2z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-gray-500">Data cuaca belum tersedia</p>
                    {cuaca?.pesan && (
                      <p className="text-[11px] text-gray-400 mt-1">{cuaca.pesan}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {cuaca.prakiraan.map((slot, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg p-3"
                        >
                          {slot.ikonUrl ? (
                            <img
                              src={slot.ikonUrl}
                              alt={slot.weather_desc}
                              className="w-10 h-10 flex-shrink-0 object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-2xl">
                              ☁️
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-800">
                              {formatWaktuCuaca(slot.local_datetime)}
                            </p>
                            <p className="text-[11px] text-gray-600 truncate" title={slot.weather_desc}>
                              {slot.weather_desc}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-800">{slot.suhu}°</p>
                            <p className="text-[10px] text-gray-400">💧 {slot.kelembaban}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-gray-100 text-[10px] text-gray-500 space-y-1">
                      <p>Rentang ±24 jam ke depan</p>
                      <p className="font-medium text-primary-700">
                        Sumber data: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
