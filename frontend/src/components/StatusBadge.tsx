import { StatusDesa, StatusLaporan } from '../api/types'

type Status = StatusDesa | StatusLaporan

interface StatusBadgeProps {
  status: Status
  type: 'desa' | 'laporan'
  size?: 'sm' | 'md'
}

const desaColors: Record<StatusDesa, string> = {
  [StatusDesa.AMAN]: 'bg-status-aman-bg text-status-aman-text border-status-aman-border',
  [StatusDesa.WASPADA]: 'bg-status-waspada-bg text-status-waspada-text border-status-waspada-border',
  [StatusDesa.SIAGA]: 'bg-status-siaga-bg text-status-siaga-text border-status-siaga-border',
  [StatusDesa.AWAS]: 'bg-status-awas-bg text-status-awas-text border-status-awas-border',
}

const laporanColors: Record<StatusLaporan, string> = {
  [StatusLaporan.BARU]: 'bg-laporan-baru-bg text-laporan-baru-text border-laporan-baru-border',
  [StatusLaporan.DIVERIFIKASI]: 'bg-laporan-diverifikasi-bg text-laporan-diverifikasi-text border-laporan-diverifikasi-border',
  [StatusLaporan.DITANGANI]: 'bg-laporan-ditangani-bg text-laporan-ditangani-text border-laporan-ditangani-border',
  [StatusLaporan.SELESAI]: 'bg-laporan-selesai-bg text-laporan-selesai-text border-laporan-selesai-border',
}

const laporanLabels: Record<StatusLaporan, string> = {
  [StatusLaporan.BARU]: 'Baru',
  [StatusLaporan.DIVERIFIKASI]: 'Diverifikasi',
  [StatusLaporan.DITANGANI]: 'Ditangani',
  [StatusLaporan.SELESAI]: 'Selesai',
}

export default function StatusBadge({ status, type, size = 'sm' }: StatusBadgeProps) {
  let colorClass: string
  let label: string

  if (type === 'desa') {
    colorClass = desaColors[status as StatusDesa] ?? 'bg-gray-100 text-gray-700 border-gray-200'
    label = status
  } else {
    colorClass = laporanColors[status as StatusLaporan] ?? 'bg-gray-100 text-gray-700 border-gray-200'
    label = laporanLabels[status as StatusLaporan] ?? status
  }

  const sizeClass = size === 'md' 
    ? 'px-3 py-1 text-xs' 
    : 'px-2 py-0.5 text-xs'

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${sizeClass} ${colorClass}`}>
      {label}
    </span>
  )
}
