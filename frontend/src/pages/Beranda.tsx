import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDesa, getLaporan, getGempaTerkini } from '../api'
import { Desa, Laporan, StatusDesa, JenisLaporan, GempaData } from '../api/types'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
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

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const statusConfig: Record<StatusDesa, { bg: string; text: string; icon: string }> = {
  [StatusDesa.AMAN]: { bg: 'bg-status-aman-bg', text: 'text-status-aman-text', icon: '✓' },
  [StatusDesa.WASPADA]: { bg: 'bg-status-waspada-bg', text: 'text-status-waspada-text', icon: '⚠' },
  [StatusDesa.SIAGA]: { bg: 'bg-status-siaga-bg', text: 'text-status-siaga-text', icon: '!' },
  [StatusDesa.AWAS]: { bg: 'bg-status-awas-bg', text: 'text-status-awas-text', icon: '⚠' },
}

export default function Beranda() {
  const navigate = useNavigate()
  const [desaList, setDesaList] = useState<Desa[]>([])
  const [laporan, setLaporan] = useState<Laporan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State untuk data gempa
  const [gempa, setGempa] = useState<GempaData | null>(null)
  const [gempaLoading, setGempaLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([getDesa(), getLaporan()])
      .then(([d, l]) => {
        setDesaList(d)
        setLaporan(l)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))

    // Fetch gempa terkini secara paralel (tidak blocking)
    setGempaLoading(true)
    getGempaTerkini()
      .then((response) => {
        // Ambil gempa pertama saja (terbaru)
        if (response.data && response.data.length > 0) {
          setGempa(response.data[0])
        }
      })
      .catch(() => {}) // Silent fail untuk gempa
      .finally(() => setGempaLoading(false))
  }, [])

  // Hitung status tertinggi di kabupaten
  const statusPriority = { AWAS: 4, SIAGA: 3, WASPADA: 2, AMAN: 1 }
  const highestStatus = desaList.reduce((highest, desa) => {
    return statusPriority[desa.status] > statusPriority[highest] ? desa.status : highest
  }, StatusDesa.AMAN)

  const statusCounts = Object.values(StatusDesa).map((s) => ({
    status: s,
    count: desaList.filter((d) => d.status === s).length,
  }))

  const recentLaporan = laporan.slice(0, 5)

  return (
    <div>
      {/* Header dengan gradasi biru */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-12 pb-8">
          <div className="flex items-start gap-3 mb-4">
            <svg className="w-10 h-10 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
            </svg>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Peringatan Dini Longsor</h1>
              <p className="text-primary-200 mt-1 text-sm md:text-base">Kabupaten Dairi</p>
            </div>
          </div>

          {/* Status Tertinggi Ringkasan */}
          {!loading && desaList.length > 0 && (
            <div className={`${statusConfig[highestStatus].bg} border-2 ${statusConfig[highestStatus].text} rounded-card-lg p-4 mt-4`}>
              <div className="flex items-center gap-3">
                <div className="text-4xl">{statusConfig[highestStatus].icon}</div>
                <div>
                  <p className="text-xs font-medium opacity-75">Status Tertinggi Kabupaten</p>
                  <p className="text-2xl font-bold">{highestStatus}</p>
                  <p className="text-xs mt-0.5 opacity-90">
                    Dari {desaList.length} desa yang dipantau
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
        {loading && <LoadingSpinner />}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-card p-4 text-red-700 text-sm">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold">Gagal memuat data</p>
                <p className="text-xs mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Status Summary - 4 kartu */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Ringkasan Status Desa
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {statusCounts.map(({ status, count }) => (
                  <div
                    key={status}
                    className={`${statusConfig[status].bg} border-2 border-${status.toLowerCase()}-200 rounded-card-lg p-4 transition-transform hover:scale-[1.02]`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full bg-status-${status.toLowerCase()}-solid`} />
                      <p className={`text-xs font-semibold ${statusConfig[status].text} uppercase tracking-wide`}>
                        {status}
                      </p>
                    </div>
                    <p className={`text-3xl font-bold ${statusConfig[status].text}`}>{count}</p>
                    <p className={`text-xs mt-1 ${statusConfig[status].text} opacity-75`}>Desa</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Grid 2 kolom di lg untuk Gempa dan Laporan */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Gempa Terkini */}
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                  </svg>
                  Gempa Terkini
                </h2>
                {gempaLoading && (
                  <div className="bg-white rounded-card-lg shadow-card border border-gray-100 p-4 text-center text-xs text-gray-400">
                    Memuat data gempa dari BMKG...
                  </div>
                )}

                {!gempaLoading && !gempa && (
                  <div className="bg-white rounded-card-lg shadow-card border border-gray-100 p-4 text-center">
                    <svg className="w-12 h-12 mx-auto text-green-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700">Tidak ada gempa terkini</p>
                    <p className="text-xs text-gray-500 mt-1">Di sekitar Kabupaten Dairi</p>
                  </div>
                )}

                {!gempaLoading && gempa && (
                  <div className="bg-white rounded-card-lg shadow-card border border-gray-100 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold text-red-700">
                            {gempa.Magnitude}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 mb-1">
                            Gempa Magnitudo {gempa.Magnitude} SR
                          </p>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{gempa.Wilayah}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{gempa.Jam}</span>
                            </div>
                            <p>Kedalaman: {gempa.Kedalaman}</p>
                            {gempa.Dirasakan && (
                              <p className="text-amber-700 font-medium">
                                Dirasakan: {gempa.Dirasakan}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {gempa.Shakemap && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <img
                            src={`https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}`}
                            alt="Peta Guncangan (Shakemap)"
                            className="w-full rounded-lg border border-gray-200"
                            onError={(e) => {
                              ;(e.target as HTMLElement).style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-50 px-4 py-2 text-[10px] text-gray-500 flex items-center justify-between border-t border-gray-100">
                      <span>Sumber: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)</span>
                      <span className="text-primary-600 font-medium">
                        Radius 150 km
                      </span>
                    </div>
                  </div>
                )}
              </section>

              {/* Laporan Terbaru */}
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Laporan Terbaru
                </h2>
                {recentLaporan.length === 0 ? (
                  <div className="bg-white rounded-card-lg shadow-card border border-gray-100 p-8 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">Belum ada laporan</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentLaporan.map((l) => {
                      const IconComponent = jenisIcons[l.jenis]
                      return (
                        <button
                          key={l.id}
                          onClick={() => navigate(`/laporan/${l.id}`)}
                          className="w-full text-left bg-white rounded-card shadow-card hover:shadow-card-hover border border-gray-100 p-3 transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-100 transition-colors">
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="text-sm font-semibold text-gray-800">
                                  {jenisLabel[l.jenis]}
                                </p>
                                <StatusBadge status={l.status} type="laporan" />
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-1">{l.deskripsi}</p>
                              <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                <span>{l.desa?.nama}</span>
                                <span>•</span>
                                <span>{relativeTime(l.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
