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
  if (mins < 60) return `${mins} mnt lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

const statusConfig: Record<StatusDesa, {
  bg: string
  border: string
  text: string
  dot: string
  label: string
}> = {
  [StatusDesa.AMAN]: {
    bg: 'bg-emerald-50/90',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
    label: 'Aman',
  },
  [StatusDesa.WASPADA]: {
    bg: 'bg-amber-50/90',
    border: 'border-amber-200',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
    label: 'Waspada',
  },
  [StatusDesa.SIAGA]: {
    bg: 'bg-orange-50/90',
    border: 'border-orange-200',
    text: 'text-orange-800',
    dot: 'bg-orange-500',
    label: 'Siaga',
  },
  [StatusDesa.AWAS]: {
    bg: 'bg-rose-50/90',
    border: 'border-rose-200',
    text: 'text-rose-800',
    dot: 'bg-rose-500',
    label: 'Awas',
  },
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

    // Fetch gempa terkini BMKG (non-blocking)
    setGempaLoading(true)
    getGempaTerkini()
      .then((response) => {
        if (response.data && response.data.length > 0) {
          setGempa(response.data[0])
        }
      })
      .catch(() => {})
      .finally(() => setGempaLoading(false))
  }, [])

  // Status tertinggi di kabupaten
  const statusPriority: Record<StatusDesa, number> = {
    [StatusDesa.AWAS]: 4,
    [StatusDesa.SIAGA]: 3,
    [StatusDesa.WASPADA]: 2,
    [StatusDesa.AMAN]: 1,
  }

  const highestStatus = desaList.reduce((highest, desa) => {
    return statusPriority[desa.status] > statusPriority[highest] ? desa.status : highest
  }, StatusDesa.AMAN)

  const statusCounts = Object.values(StatusDesa).map((s) => ({
    status: s,
    count: desaList.filter((d) => d.status === s).length,
  }))

  const recentLaporan = laporan.slice(0, 5)

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* App Header Banner */}
      <header className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 pt-12 pb-6 relative z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <span className="text-2xl">🏔️</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white">SiagaDairi</h1>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/30 text-blue-100">
                    PWA
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-0.5 font-medium">
                  Peringatan Dini Longsor & Bencana Kab. Dairi
                </p>
              </div>
            </div>

            {/* Quick action button */}
            <button
              onClick={() => navigate('/laporan/baru')}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-white text-blue-700 px-3.5 py-2 rounded-xl shadow-sm hover:bg-blue-50 active:scale-95 transition-all"
            >
              <span>+</span>
              <span>Buat Laporan</span>
            </button>
          </div>

          {/* Status Alert Banner */}
          {!loading && desaList.length > 0 && (
            <div className="mt-5 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      highestStatus === StatusDesa.AMAN ? 'bg-emerald-400' :
                      highestStatus === StatusDesa.WASPADA ? 'bg-amber-400' :
                      highestStatus === StatusDesa.SIAGA ? 'bg-orange-400' : 'bg-rose-400'
                    }`} />
                    <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                      highestStatus === StatusDesa.AMAN ? 'bg-emerald-400' :
                      highestStatus === StatusDesa.WASPADA ? 'bg-amber-400' :
                      highestStatus === StatusDesa.SIAGA ? 'bg-orange-400' : 'bg-rose-400'
                    }`} />
                  </span>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-blue-200 font-semibold">
                      Status Keseluruhan Kabupaten
                    </p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      Status {highestStatus} — {desaList.length} Kecamatan Dipantau
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/desa')}
                  className="text-xs text-blue-200 hover:text-white font-medium underline-offset-2 hover:underline whitespace-nowrap"
                >
                  Lihat Peta →
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-5 space-y-6">
        {loading && <LoadingSpinner />}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm shadow-sm">
            <div className="flex items-start gap-2.5">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-semibold">Gagal memuat data</p>
                <p className="text-xs mt-0.5 text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Status Summary - 4 Kartu Responsif */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Indikator Kerawanan Wilayah
                </h2>
                <span className="text-[11px] text-gray-400">Total: {desaList.length} Desa/Kecamatan</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {statusCounts.map(({ status, count }) => {
                  const cfg = statusConfig[status]
                  return (
                    <div
                      key={status}
                      onClick={() => navigate('/desa')}
                      className={`${cfg.bg} border ${cfg.border} rounded-2xl p-3.5 transition-all hover:shadow-sm cursor-pointer active:scale-95`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${cfg.text}`}>
                          {status}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className={`text-2xl sm:text-3xl font-extrabold ${cfg.text}`}>
                          {count}
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">wilayah</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Grid 2 Kolom di Tablet/Desktop: Gempa & Laporan */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Kolom 1: Gempa Terkini */}
              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📡</span>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Gempa Terkini BMKG
                    </h2>
                  </div>
                  <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    Radius 150 km
                  </span>
                </div>

                {gempaLoading && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center text-xs text-gray-400">
                    <div className="animate-spin inline-block w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full mb-2" />
                    <p>Memeriksa aktivitas sensor BMKG...</p>
                  </div>
                )}

                {!gempaLoading && !gempa && (
                  <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/80 p-5 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-2.5">
                      <span className="text-2xl text-emerald-600">✓</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800">Tidak Ada Gempa Terkini</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs">
                      Tidak terdeteksi aktivitas gempa berkekuatan signifikan di sekitar Kabupaten Dairi dalam 24 jam terakhir.
                    </p>
                    <div className="mt-4 pt-3 border-t border-gray-100 w-full flex items-center justify-between text-[10px] text-gray-400">
                      <span>Sumber: BMKG TEWS</span>
                      <span className="text-emerald-600 font-medium">Normal</span>
                    </div>
                  </div>
                )}

                {!gempaLoading && gempa && (
                  <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-base font-extrabold text-rose-700 leading-none">
                            {gempa.Magnitude}
                          </span>
                          <span className="text-[9px] font-bold text-rose-600 tracking-tighter">SR</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-bold text-rose-700 uppercase tracking-wide">
                              Peringatan Gempa
                            </span>
                            <span className="text-[10px] text-gray-400">• {gempa.Jam}</span>
                          </div>
                          <p className="text-xs font-semibold text-gray-800 line-clamp-2">
                            {gempa.Wilayah}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-600">
                            <span className="bg-gray-100 px-2 py-0.5 rounded-md font-medium">
                              Kedalaman: {gempa.Kedalaman}
                            </span>
                            {gempa.Potensi && (
                              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                                {gempa.Potensi}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {gempa.Shakemap && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <img
                            src={`https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}`}
                            alt="Peta Guncangan BMKG"
                            className="w-full rounded-xl border border-gray-200 object-cover max-h-48"
                            onError={(e) => {
                              ;(e.target as HTMLElement).style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-50/80 px-4 py-2.5 text-[10px] text-gray-500 flex items-center justify-between border-t border-gray-100">
                      <span>Sumber data resmi: BMKG</span>
                      <span className="text-blue-600 font-medium">Radius 150 km</span>
                    </div>
                  </div>
                )}
              </section>

              {/* Kolom 2: Laporan Terbaru */}
              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📋</span>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Laporan Kejadian Terkini
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate('/laporan')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                  >
                    Lihat Semua →
                  </button>
                </div>

                {recentLaporan.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-2.5">
                      <span className="text-xl">📝</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800">Belum Ada Laporan</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mb-3">
                      Laporan banjir, longsor, atau retakan tanah dari warga akan tampil di sini.
                    </p>
                    <button
                      onClick={() => navigate('/laporan/baru')}
                      className="text-xs font-semibold bg-blue-600 text-white px-3.5 py-2 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                    >
                      + Buat Laporan Pertama
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentLaporan.map((l) => {
                      const IconComponent = jenisIcons[l.jenis]
                      return (
                        <button
                          key={l.id}
                          onClick={() => navigate(`/laporan/${l.id}`)}
                          className="w-full text-left bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-3.5 transition-all group active:scale-[0.99]"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-xs font-bold text-gray-900 truncate">
                                  {jenisLabel[l.jenis]}
                                </span>
                                <StatusBadge status={l.status} type="laporan" />
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-1 leading-relaxed">
                                {l.deskripsi}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400 font-medium">
                                <span>📍 {l.desa?.nama || 'Kab. Dairi'}</span>
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
      </main>
    </div>
  )
}
