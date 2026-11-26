import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLaporanById, getCuacaByAdm4, updateLaporanStatus, deleteLaporan } from '../api'
import { BmkgCuacaResponse, JenisLaporan, Laporan, StatusLaporan } from '../api/types'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import ErrorState from '../components/ErrorState'
import LongsorIcon from '../components/icons/LongsorIcon'
import BanjirIcon from '../components/icons/BanjirIcon'
import RetakanTanahIcon from '../components/icons/RetakanTanahIcon'
import JalanRusakIcon from '../components/icons/JalanRusakIcon'

const jenisConfig: Record<JenisLaporan, { Icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  [JenisLaporan.LONGSOR]: { Icon: LongsorIcon, label: 'Longsor', color: 'bg-amber-100 text-amber-700' },
  [JenisLaporan.BANJIR]: { Icon: BanjirIcon, label: 'Banjir', color: 'bg-blue-100 text-blue-700' },
  [JenisLaporan.RETAKAN_TANAH]: { Icon: RetakanTanahIcon, label: 'Retakan Tanah', color: 'bg-orange-100 text-orange-700' },
  [JenisLaporan.JALAN_RUSAK]: { Icon: JalanRusakIcon, label: 'Jalan Rusak', color: 'bg-red-100 text-red-700' },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatJamLokal(datetimeStr: string) {
  try {
    const d = new Date(datetimeStr.replace(' ', 'T'))
    return (
      d.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB'
    )
  } catch {
    return datetimeStr + ' WIB'
  }
}

// Stepper Timeline Component
function StatusStepper({ currentStatus }: { currentStatus: StatusLaporan }) {
  const steps = [
    { status: StatusLaporan.BARU, label: 'Baru', icon: '📝' },
    { status: StatusLaporan.DIVERIFIKASI, label: 'Diverifikasi', icon: '✓' },
    { status: StatusLaporan.DITANGANI, label: 'Ditangani', icon: '🔧' },
    { status: StatusLaporan.SELESAI, label: 'Selesai', icon: '✓' },
  ]

  const currentIndex = steps.findIndex(s => s.status === currentStatus)

  return (
    <div className="bg-white rounded-card-lg shadow-card border border-gray-100 p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Progress Penanganan</h3>
      <div className="flex items-start justify-between">
        {steps.map((step, idx) => {
          const isActive = idx <= currentIndex
          const isCurrent = idx === currentIndex
          
          return (
            <div key={step.status} className="flex-1 min-w-0 flex flex-col items-center relative px-0.5">
              {/* Line connector */}
              {idx < steps.length - 1 && (
                <div className={`absolute top-4 sm:top-5 left-1/2 w-full h-0.5 ${isActive ? 'bg-primary-600' : 'bg-gray-200'}`} style={{ zIndex: 0 }} />
              )}
              
              {/* Step circle */}
              <div className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold transition-all ${
                isActive 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-400'
              } ${isCurrent ? 'ring-4 ring-primary-200' : ''}`}>
                {step.icon}
              </div>
              
              {/* Label */}
              <p className={`mt-2 text-[11px] sm:text-xs text-center font-medium leading-tight break-words ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                {step.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function DetailLaporan() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [laporan, setLaporan] = useState<Laporan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State untuk mode petugas
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [adminKey, setAdminKey] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  // State untuk data cuaca BMKG desa terkait laporan
  const [cuaca, setCuaca] = useState<BmkgCuacaResponse | null>(null)
  const [cuacaLoading, setCuacaLoading] = useState(false)

  useEffect(() => {
    // Cek mode petugas dari sessionStorage
    const storedKey = sessionStorage.getItem('admin_key')
    if (storedKey) {
      setAdminKey(storedKey)
      setIsAdminMode(true)
    }
  }, [])

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id])

  const loadData = () => {
    setLoading(true)
    setError(null)
    getLaporanById(id!)
      .then((data) => {
        setLaporan(data)
        // Jika laporan memiliki kode adm4 desa, ambil data cuaca BMKG
        const adm4Code = data.adm4 || data.desa?.adm4
        if (adm4Code) {
          setCuacaLoading(true)
          getCuacaByAdm4(adm4Code)
            .then(setCuaca)
            .catch(() => {}) // Silent fail
            .finally(() => setCuacaLoading(false))
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow = {
      'BARU': 'DIVERIFIKASI',
      'DIVERIFIKASI': 'DITANGANI',
      'DITANGANI': 'SELESAI',
      'SELESAI': null,
    }
    return statusFlow[currentStatus as keyof typeof statusFlow] || null
  }

  const getNextStatusLabel = (currentStatus: string): string => {
    const labels = {
      'BARU': 'Verifikasi',
      'DIVERIFIKASI': 'Tandai Ditangani',
      'DITANGANI': 'Tandai Selesai',
    }
    return labels[currentStatus as keyof typeof labels] || ''
  }

  const handleUpdateStatus = async () => {
    if (!laporan || !id) return
    
    const nextStatus = getNextStatus(laporan.status)
    if (!nextStatus) return

    setUpdating(true)
    setUpdateError(null)

    try {
      const updated = await updateLaporanStatus(id, nextStatus as StatusLaporan, adminKey)
      setLaporan(updated)
      alert(`Status berhasil diubah menjadi ${nextStatus}`)
    } catch (err: any) {
      const errorMsg = err.message || 'Gagal mengubah status'
      setUpdateError(errorMsg)
      
      // Jika error 401/403, hapus mode petugas dan force re-render
      if (errorMsg.includes('401') || errorMsg.includes('403') || errorMsg.includes('tidak valid') || errorMsg.includes('diperlukan')) {
        sessionStorage.removeItem('admin_key')
        setAdminKey('')
        setIsAdminMode(false) // Set state terakhir untuk trigger re-render
        alert('Kunci petugas tidak valid. Silakan login ulang di halaman Profil.')
      }
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!laporan || !id) return
    
    const confirmed = window.confirm(
      `Yakin ingin menghapus laporan ${config.label} ini?\n\n` +
      `Deskripsi: ${laporan.deskripsi.substring(0, 50)}...\n\n` +
      `Data akan dihapus permanen dan tidak bisa dikembalikan!`
    )
    
    if (!confirmed) return

    setUpdating(true)
    setUpdateError(null)

    try {
      await deleteLaporan(id, adminKey)
      alert('Laporan berhasil dihapus')
      navigate('/laporan')
    } catch (err: any) {
      const errorMsg = err.message || 'Gagal menghapus laporan'
      setUpdateError(errorMsg)
      
      // Jika error 401/403, hapus mode petugas dan force re-render
      if (errorMsg.includes('401') || errorMsg.includes('403') || errorMsg.includes('tidak valid') || errorMsg.includes('diperlukan')) {
        sessionStorage.removeItem('admin_key')
        setAdminKey('')
        setIsAdminMode(false) // Set state terakhir untuk trigger re-render
        alert('Kunci petugas tidak valid. Silakan login ulang di halaman Profil.')
      }
    } finally {
      setUpdating(false)
    }
  }

  // Flatten slot cuaca dari cuaca (array of arrays per hari) dan ambil 8 slot pertama (±24 jam)
  const allSlots = cuaca?.cuaca ? cuaca.cuaca.flat().slice(0, 8) : []
  const hasAdm4 = Boolean(laporan?.adm4 || laporan?.desa?.adm4)

  const nextStatus = laporan ? getNextStatus(laporan.status) : null
  const showUpdateButton = isAdminMode && nextStatus !== null
  const showDeleteButton = isAdminMode

  if (!laporan) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        {loading && <LoadingSpinner />}
        {error && <ErrorState message={error} onRetry={loadData} />}
      </div>
    )
  }

  const config = jenisConfig[laporan.jenis]
  const IconComponent = config.Icon

  return (
    <div className="max-w-7xl mx-auto overflow-x-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 md:px-6 lg:px-8 pt-6 sm:pt-10 pb-3.5 sm:pb-4 flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 sm:gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg px-2 py-1 flex-shrink-0"
            aria-label="Kembali"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">Detail Laporan</h1>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {loading && <LoadingSpinner />}
        {error && <ErrorState message={error} onRetry={loadData} />}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Kolom Kiri & Tengah: Info Laporan */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 min-w-0">
              {/* Header Jenis & Status */}
              <div className={`${config.color} border-2 border-current rounded-card-lg p-4 sm:p-6`}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 sm:mb-2">
                      <h2 className="text-lg sm:text-2xl font-bold truncate">{config.label}</h2>
                      <StatusBadge status={laporan.status} type="laporan" size="md" />
                    </div>
                    <p className="text-[11px] sm:text-xs opacity-75 break-words">
                      ID: {laporan.id.slice(0, 8)}… • Dilaporkan {formatDate(laporan.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stepper Timeline */}
              <StatusStepper currentStatus={laporan.status} />

              {/* Tombol Update Status & Delete (Mode Petugas) */}
              {(showUpdateButton || showDeleteButton) && (
                <div className="bg-primary-50 border-2 border-primary-200 rounded-card-lg p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <svg className="w-6 h-6 text-primary-700 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-primary-900">Mode Petugas Aktif</p>
                      <p className="text-xs text-primary-700 mt-0.5">
                        Anda dapat mengubah status atau menghapus laporan ini
                      </p>
                    </div>
                  </div>
                  
                  {updateError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs mb-3">
                      ⚠️ {updateError}
                    </div>
                  )}

                  <div className="space-y-3">
                    {showUpdateButton && (
                      <button
                        onClick={handleUpdateStatus}
                        disabled={updating}
                        className="w-full bg-primary-600 text-white rounded-lg py-3 font-semibold text-sm hover:bg-primary-700 active:scale-[.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      >
                        {updating ? 'Memproses...' : `${getNextStatusLabel(laporan.status)}`}
                      </button>
                    )}
                    
                    {showDeleteButton && (
                      <button
                        onClick={handleDelete}
                        disabled={updating}
                        className="w-full bg-red-600 text-white rounded-lg py-3 font-semibold text-sm hover:bg-red-700 active:scale-[.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {updating ? 'Menghapus...' : 'Hapus Laporan'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Deskripsi */}
              <div className="bg-white rounded-card-lg shadow-card border border-gray-100 p-4 sm:p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Deskripsi Kejadian
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line break-words">
                  {laporan.deskripsi}
                </p>
              </div>

              {/* Foto Kejadian */}
              {laporan.fotoUrl && (
                <div className="bg-white rounded-card-lg shadow-card border border-gray-100 overflow-hidden">
                  <div className="p-4 sm:p-5 pb-3">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Foto Kejadian
                    </h3>
                  </div>
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                    <img
                      src={laporan.fotoUrl}
                      alt={`Foto laporan ${config.label}`}
                      className="w-full rounded-lg object-cover max-h-72 sm:max-h-[400px]"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              {/* Lokasi */}
              <div className="bg-white rounded-card-lg shadow-card border border-gray-100 p-4 sm:p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Lokasi
                </h3>
                <button
                  onClick={() => navigate(`/desa/${laporan.desa?.id}`)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center gap-2 mb-2 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1 -mx-2"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="break-words">{laporan.desa?.nama} — Kec. {laporan.desa?.kecamatan}</span>
                </button>
                {laporan.lat != null && laporan.lng != null && (
                  <p className="text-xs text-gray-500 mt-2">
                    Koordinat: <span className="font-mono">{laporan.lat.toFixed(5)}, {laporan.lng.toFixed(5)}</span>
                  </p>
                )}
                {(laporan.adm4 || laporan.desa?.adm4) && (
                  <p className="text-xs text-gray-400 mt-1">
                    Kode Desa: <span className="font-mono">{laporan.adm4 || laporan.desa?.adm4}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Kolom Kanan: Cuaca */}
            <div className="lg:col-span-1 min-w-0">
              {hasAdm4 && (
                <div className="bg-white rounded-card-lg shadow-card border border-gray-100 p-4 sm:p-5 lg:sticky lg:top-24">
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

                  {cuacaLoading && (
                    <div className="py-8 text-center text-xs text-gray-400">
                      Memuat data cuaca...
                    </div>
                  )}

                  {!cuacaLoading && allSlots.length === 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 text-center text-xs text-gray-500">
                      Data cuaca tidak tersedia
                    </div>
                  )}

                  {!cuacaLoading && allSlots.length > 0 && (
                    <div className="space-y-3">
                      {/* Horizontal scroll cards */}
                      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                        {allSlots.map((slot, idx) => (
                          <div
                            key={idx}
                            className="flex-shrink-0 w-28 bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-center"
                          >
                            <p className="text-[10px] font-medium text-gray-500 mb-1">
                              {formatJamLokal(slot.local_datetime)}
                            </p>
                            {slot.image && (
                              <img
                                src={slot.image}
                                alt={slot.weather_desc}
                                className="w-10 h-10 mx-auto object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none'
                                }}
                              />
                            )}
                            <p className="text-sm font-bold text-gray-800 mt-1">{slot.t}°</p>
                            <p className="text-[10px] text-gray-600 truncate" title={slot.weather_desc}>
                              {slot.weather_desc}
                            </p>
                            <p className="text-[9px] text-gray-400 mt-1">
                              💨 {slot.ws} km/j dari {slot.wd}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Atribusi BMKG */}
                      <div className="pt-3 border-t border-gray-100 text-[10px] text-gray-500 space-y-1">
                        <p>Rentang ±24 jam ke depan</p>
                        <p className="font-medium text-primary-700">
                          Sumber data: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
