import { useState, useEffect } from 'react'

const info = [
  { label: 'Sumber Data', value: 'BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)' },
  { label: 'Tahun', value: '2026' },
]

export default function Profil() {
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [inputKey, setInputKey] = useState('')

  useEffect(() => {
    // Cek apakah sudah ada kunci di sessionStorage
    const storedKey = sessionStorage.getItem('admin_key')
    if (storedKey) {
      setIsAdminMode(true)
    }
  }, [])

  const handleActivate = () => {
    if (!inputKey.trim()) {
      alert('Kunci petugas tidak boleh kosong')
      return
    }
    sessionStorage.setItem('admin_key', inputKey)
    setIsAdminMode(true)
    setInputKey('')
  }

  const handleDeactivate = () => {
    sessionStorage.removeItem('admin_key')
    setIsAdminMode(false)
    setInputKey('')
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header dengan gradasi biru */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 text-white">
        <div className="px-4 md:px-6 pt-16 pb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Sistem Informasi Pelaporan Bencana</h1>
              <p className="text-primary-200 text-sm mt-0.5">Kabupaten Dairi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6 space-y-6">
        {/* Mode Petugas Section */}
        <div className="bg-white rounded-card-lg shadow-card border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Mode Petugas</h2>
          </div>
          
          {!isAdminMode ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-600 leading-relaxed">
                Masukkan kunci petugas untuk mengakses fitur update status laporan.
              </p>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Masukkan kunci petugas"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                onKeyPress={(e) => e.key === 'Enter' && handleActivate()}
              />
              <button
                onClick={handleActivate}
                className="w-full bg-primary-600 text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-primary-700 active:scale-[.98] transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm"
              >
                Aktifkan Mode Petugas
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold">Mode Petugas Aktif</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Anda dapat mengubah status laporan di halaman detail laporan.
              </p>
              <button
                onClick={handleDeactivate}
                className="w-full bg-gray-600 text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-gray-700 active:scale-[.98] transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm"
              >
                Keluar dari Mode Petugas
              </button>
            </div>
          )}
        </div>

        {/* Tentang Aplikasi */}
        <div className="bg-white rounded-card-lg shadow-card border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Tentang Aplikasi</h2>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            Aplikasi ini dibuat untuk membantu masyarakat Kabupaten Dairi dalam memantau
            status indikator awal kewaspadaan longsor dan melaporkan kejadian bencana di lingkungan sekitar.
          </p>
          
          {/* Catatan Metodologi */}
          <div className="bg-primary-50 border-2 border-primary-100 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-2">
              <svg className="w-5 h-5 text-primary-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs font-bold text-primary-900 mb-1">Catatan Metodologi:</p>
                <p className="text-xs text-primary-800 leading-relaxed">
                  Aplikasi ini tidak memprediksi kejadian longsor, melainkan menyajikan <strong>indikator awal kewaspadaan</strong> berdasarkan gabungan laporan warga terkini dan prakiraan cuaca.
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-primary-200">
              <p className="text-xs font-semibold text-primary-800">
                Sumber data cuaca dan gempa: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
              </p>
            </div>
          </div>
        </div>

        {/* Info Aplikasi */}
        <div className="bg-white rounded-card-lg shadow-card border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Informasi Aplikasi</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {info.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <span className="text-sm text-gray-600 font-medium">{label}</span>
                <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">
            © 2024 Peringatan Dini Longsor Kabupaten Dairi
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Dibuat dengan <span className="text-red-500">♥</span> untuk masyarakat Dairi
          </p>
        </div>
      </div>
    </div>
  )
}
