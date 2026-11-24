import { NavLink } from 'react-router-dom'
import HomeIcon from './icons/HomeIcon'
import DocumentIcon from './icons/DocumentIcon'
import PlusIcon from './icons/PlusIcon'
import MapIcon from './icons/MapIcon'
import UserIcon from './icons/UserIcon'

export default function BottomNav() {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 px-2 sm:px-4"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
    >
      <div className="max-w-md mx-auto rounded-2xl shadow-nav bg-white/95 backdrop-blur-md border border-gray-200/80 mb-2">
        <div className="flex items-center justify-around h-16 px-1">
          {/* 1. Beranda */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-1 text-xs transition-all relative ${
                isActive
                  ? 'text-primary-600 font-semibold scale-105'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
            aria-label="Beranda"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute top-0 w-6 h-1 bg-primary-600 rounded-full" />
                )}
                <HomeIcon className="w-5 h-5" />
                <span className="text-[11px] tracking-tight">Beranda</span>
              </>
            )}
          </NavLink>

          {/* 2. Daftar Laporan */}
          <NavLink
            to="/laporan"
            end
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-1 text-xs transition-all relative ${
                isActive
                  ? 'text-primary-600 font-semibold scale-105'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
            aria-label="Laporan"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute top-0 w-6 h-1 bg-primary-600 rounded-full" />
                )}
                <DocumentIcon className="w-5 h-5" />
                <span className="text-[11px] tracking-tight">Laporan</span>
              </>
            )}
          </NavLink>

          {/* 3. Tombol Aksi Sentral: Buat Laporan (+) */}
          <NavLink
            to="/laporan/baru"
            className="flex-1 flex flex-col items-center justify-center relative -top-3 group"
            aria-label="Buat Laporan Baru"
          >
            {({ isActive }) => (
              <>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${
                    isActive
                      ? 'bg-primary-700 text-white ring-4 ring-primary-100'
                      : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/30'
                  }`}
                >
                  <PlusIcon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span
                  className={`text-[11px] mt-0.5 tracking-tight font-medium ${
                    isActive ? 'text-primary-700 font-bold' : 'text-gray-600'
                  }`}
                >
                  Lapor
                </span>
              </>
            )}
          </NavLink>

          {/* 4. Daftar Desa */}
          <NavLink
            to="/desa"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-1 text-xs transition-all relative ${
                isActive
                  ? 'text-primary-600 font-semibold scale-105'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
            aria-label="Desa"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute top-0 w-6 h-1 bg-primary-600 rounded-full" />
                )}
                <MapIcon className="w-5 h-5" />
                <span className="text-[11px] tracking-tight">Desa</span>
              </>
            )}
          </NavLink>

          {/* 5. Profil / Info */}
          <NavLink
            to="/profil"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-1 text-xs transition-all relative ${
                isActive
                  ? 'text-primary-600 font-semibold scale-105'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
            aria-label="Profil"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute top-0 w-6 h-1 bg-primary-600 rounded-full" />
                )}
                <UserIcon className="w-5 h-5" />
                <span className="text-[11px] tracking-tight">Profil</span>
              </>
            )}
          </NavLink>
        </div>
      </div>
    </nav>
  )
}
