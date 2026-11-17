import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDesa } from '../api'
import { Desa, StatusDesa } from '../api/types'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'

export default function ListDesa() {
  const navigate = useNavigate()
  const [desaList, setDesaList] = useState<Desa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter & pencarian
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setLoading(true)
    setError(null)
    getDesa()
      .then(setDesaList)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  // Filter dan urutkan desa
  const filtered = desaList
    .filter((desa) => {
      const matchSearch = desa.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          desa.kecamatan.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'ALL' || desa.status === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a, b) => b.skor - a.skor) // Urutkan dari skor tertinggi

  const statusOptions = [
    { value: 'ALL', label: 'Semua', count: desaList.length },
    { value: StatusDesa.AWAS, label: 'Awas', count: desaList.filter(d => d.status === StatusDesa.AWAS).length },
    { value: StatusDesa.SIAGA, label: 'Siaga', count: desaList.filter(d => d.status === StatusDesa.SIAGA).length },
    { value: StatusDesa.WASPADA, label: 'Waspada', count: desaList.filter(d => d.status === StatusDesa.WASPADA).length },
    { value: StatusDesa.AMAN, label: 'Aman', count: desaList.filter(d => d.status === StatusDesa.AMAN).length },
  ]

  const statusDotColor: Record<string, string> = {
    [StatusDesa.AMAN]: 'bg-status-aman-solid',
    [StatusDesa.WASPADA]: 'bg-status-waspada-solid',
    [StatusDesa.SIAGA]: 'bg-status-siaga-solid',
    [StatusDesa.AWAS]: 'bg-status-awas-solid',
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 md:px-6 lg:px-8 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Daftar Desa</h1>
          
          {/* Pencarian */}
          <div className="relative mb-3">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama desa atau kecamatan..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Hapus pencarian"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Status Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  statusFilter === opt.value
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

        {!loading && !error && filtered.length === 0 && desaList.length === 0 && (
          <EmptyState
            icon={
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
            title="Belum Ada Data Desa"
            description="Data desa belum tersedia di sistem"
          />
        )}

        {!loading && !error && filtered.length === 0 && desaList.length > 0 && (
          <EmptyState
            icon={
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            title="Tidak Ada Hasil"
            description={`Tidak ditemukan desa dengan kata kunci "${searchQuery}"${statusFilter !== 'ALL' ? ` dan status ${statusFilter}` : ''}`}
            action={
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('ALL')
                }}
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
              Menampilkan {filtered.length} dari {desaList.length} desa • Diurutkan dari skor tertinggi
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((desa) => (
                <button
                  key={desa.id}
                  onClick={() => navigate(`/desa/${desa.id}`)}
                  className="text-left bg-white rounded-card-lg shadow-card hover:shadow-card-hover border border-gray-100 p-4 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    {/* Indikator status di sisi kiri */}
                    <div className={`flex-shrink-0 w-1 h-12 rounded-full ${statusDotColor[desa.status]}`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate group-hover:text-primary-600 transition-colors">
                            {desa.nama}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">Kec. {desa.kecamatan}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <StatusBadge status={desa.status} type="desa" size="md" />
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Skor</p>
                          <p className="text-lg font-bold text-gray-800">{desa.skor}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
