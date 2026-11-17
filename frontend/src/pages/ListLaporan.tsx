import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLaporan } from '../api'
import { JenisLaporan, Laporan } from '../api/types'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LongsorIcon from '../components/icons/LongsorIcon'
import BanjirIcon from '../components/icons/BanjirIcon'
import RetakanTanahIcon from '../components/icons/RetakanTanahIcon'
import JalanRusakIcon from '../components/icons/JalanRusakIcon'

const jenisConfig: Record<JenisLaporan, { Icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  [JenisLaporan.LONGSOR]: { Icon: LongsorIcon, label: 'Longsor', color: 'bg-amber-50 text-amber-700' },
  [JenisLaporan.BANJIR]: { Icon: BanjirIcon, label: 'Banjir', color: 'bg-blue-50 text-blue-700' },
  [JenisLaporan.RETAKAN_TANAH]: { Icon: RetakanTanahIcon, label: 'Retakan Tanah', color: 'bg-orange-50 text-orange-700' },
  [JenisLaporan.JALAN_RUSAK]: { Icon: JalanRusakIcon, label: 'Jalan Rusak', color: 'bg-red-50 text-red-700' },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ListLaporan() {
  const navigate = useNavigate()
  const [laporan, setLaporan] = useState<Laporan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterJenis, setFilterJenis] = useState<string>('ALL')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setLoading(true)
    setError(null)
    getLaporan()
      .then(setLaporan)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  const filtered = filterJenis === 'ALL'
    ? laporan
    : laporan.filter((l) => l.jenis === filterJenis)

  const jenisOptions = [
    { value: 'ALL', label: 'Semua', count: laporan.length },
    ...Object.entries(jenisConfig).map(([jenis, config]) => ({
      value: jenis,
      label: config.label,
      count: laporan.filter(l => l.jenis === jenis).length,
    })),
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 md:px-6 lg:px-8 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Daftar Laporan</h1>
          
          {/* Filter Jenis - Chip horizontal */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            {jenisOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterJenis(opt.value)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filterJenis === opt.value
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.label} ({opt.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 py-6">
        {loading && <LoadingSpinner />}

        {error && <ErrorState message={error} onRetry={loadData} />}

        {!loading && !error && laporan.length === 0 && (
          <EmptyState
            icon={
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="Belum Ada Laporan Bencana"
            description="Saat ini belum ada laporan kejadian longsor, banjir, atau retakan tanah yang tercatat."
            action={
              <button
                onClick={() => navigate('/laporan/baru')}
                className="inline-flex items-center gap-2 bg-primary-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Buat Laporan Baru
              </button>
            }
          />
        )}

        {!loading && !error && laporan.length > 0 && filtered.length === 0 && (
          <EmptyState
            icon={
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            title="Tidak Ada Hasil"
            description={`Tidak ada laporan dengan jenis ${jenisConfig[filterJenis as JenisLaporan]?.label}`}
            action={
              <button
                onClick={() => setFilterJenis('ALL')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Reset Filter
              </button>
            }
          />
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Menampilkan {filtered.length} dari {laporan.length} laporan
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((l) => {
                const config = jenisConfig[l.jenis]
                const IconComponent = config.Icon
                return (
                  <button
                    key={l.id}
                    onClick={() => navigate(`/laporan/${l.id}`)}
                    className="text-left bg-white rounded-card-lg shadow-card hover:shadow-card-hover border border-gray-100 p-4 transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full ${config.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                            {config.label}
                          </h3>
                          <StatusBadge status={l.status} type="laporan" />
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
                      {l.deskripsi}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-400 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="truncate">{l.desa?.nama}</span>
                      </div>
                      <span>•</span>
                      <span>{formatDate(l.createdAt)}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* FAB - Tombol Tambah (di atas bottom nav) */}
      <button
        onClick={() => navigate('/laporan/baru')}
        className="fixed bottom-28 right-4 md:right-6 lg:right-8 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 active:scale-95 transition-all z-40 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-primary-300"
        aria-label="Buat laporan baru"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  )
}
