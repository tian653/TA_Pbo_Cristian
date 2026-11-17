import { NavLink } from 'react-router-dom'
import HomeIcon from './icons/HomeIcon'
import DocumentIcon from './icons/DocumentIcon'
import MapIcon from './icons/MapIcon'
import UserIcon from './icons/UserIcon'

const tabs = [
  { to: '/', label: 'Beranda', Icon: HomeIcon, end: true },
  { to: '/laporan', label: 'Laporan', Icon: DocumentIcon, end: false },
  { to: '/desa', label: 'Desa', Icon: MapIcon, end: false },
  { to: '/profil', label: 'Profil', Icon: UserIcon, end: false },
]

export default function BottomNav() {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe-bottom"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}
    >
      <div className="max-w-md mx-auto lg:rounded-2xl lg:shadow-nav bg-white border-t border-gray-200 lg:border lg:mb-4">
        <div className="flex items-stretch h-16">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 text-xs transition-colors relative group ${
                  isActive
                    ? 'text-primary-600 font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }`
              }
              aria-label={tab.label}
            >
              {({ isActive }) => (
                <>
                  {/* Indikator aktif - pill kecil di atas ikon */}
                  {isActive && (
                    <div className="absolute top-2 w-8 h-1 bg-primary-600 rounded-full" />
                  )}
                  <tab.Icon className="w-5 h-5" />
                  <span className="text-[11px]">{tab.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
