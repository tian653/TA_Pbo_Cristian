import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDesa } from '../api'
import { Desa, JenisLaporan } from '../api/types'
import LongsorIcon from '../components/icons/LongsorIcon'
import BanjirIcon from '../components/icons/BanjirIcon'
import RetakanTanahIcon from '../components/icons/RetakanTanahIcon'
import JalanRusakIcon from '../components/icons/JalanRusakIcon'

const jenisConfig: Record<JenisLaporan, { Icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  [JenisLaporan.LONGSOR]: { Icon: LongsorIcon, label: 'Longsor', color: 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100' },
  [JenisLaporan.BANJIR]: { Icon: BanjirIcon, label: 'Banjir', color: 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' },
  [JenisLaporan.RETAKAN_TANAH]: { Icon: RetakanTanahIcon, label: 'Retakan Tanah', color: 'border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100' },
  [JenisLaporan.JALAN_RUSAK]: { Icon: JalanRusakIcon, label: 'Jalan Rusak', color: 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100' },
}

interface FormErrors {
  jenis?: string
  deskripsi?: string
  desaId?: string
}

export default function FormLaporan() {
  const navigate = useNavigate()
  const [desaList, setDesaList] = useState<Desa[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  const [form, setForm] = useState<{
    jenis: string
    deskripsi: string
    desaId: string
    lat: string
    lng: string
  }>({
    jenis: '',
    deskripsi: '',
    desaId: '',
    lat: '',
    lng: '',
  })

  const [foto, setFoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    getDesa().then(setDesaList).catch(() => {})
  }, [])

  useEffect(() => {
    // Cleanup preview URL when component unmounts or foto changes
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi tipe
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Format foto harus JPG, PNG, atau WebP')
      e.target.value = ''
      return
    }

    // Validasi ukuran (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto maksimal 5MB')
      e.target.value = ''
      return
    }

    // Revoke old URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setFoto(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function handleRemoveFoto() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setFoto(null)
    setPreviewUrl(null)
  }

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!form.jenis) newErrors.jenis = 'Jenis laporan wajib dipilih'
    if (!form.deskripsi.trim()) newErrors.deskripsi = 'Deskripsi wajib diisi'
    else if (form.deskripsi.length > 500) newErrors.deskripsi = 'Deskripsi maksimal 500 karakter'
    if (!form.desaId) newErrors.desaId = 'Desa wajib dipilih'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setSubmitError(null)

    const formData = new FormData()
    formData.append('jenis', form.jenis)
    formData.append('deskripsi', form.deskripsi.trim())
    formData.append('desaId', form.desaId)
    if (form.lat) formData.append('lat', form.lat)
    if (form.lng) formData.append('lng', form.lng)
    if (foto) formData.append('foto', foto)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/laporan`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Gagal mengirim laporan')
      }
      navigate('/laporan')
    } catch (err) {
      setSubmitError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 md:px-6 pt-12 pb-4 flex items-center gap-3">
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
          <h1 className="text-xl font-bold text-gray-800">Buat Laporan Baru</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 md:px-6 py-6 space-y-6">
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-card p-4 text-red-700 text-sm flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold">Gagal mengirim laporan</p>
              <p className="text-xs mt-1">{submitError}</p>
            </div>
          </div>
        )}

        {/* Jenis Laporan - Button Grid */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Jenis Laporan <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(jenisConfig).map(([jenis, config]) => {
              const IconComponent = config.Icon
              const isSelected = form.jenis === jenis
              return (
                <button
                  key={jenis}
                  type="button"
                  onClick={() => {
                    setForm((f) => ({ ...f, jenis }))
                    setErrors((e) => ({ ...e, jenis: undefined }))
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-card-lg border-2 transition-all ${
                    isSelected
                      ? `${config.color} ring-2 ring-offset-2`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? '' : 'text-gray-700'}`}>
                    {config.label}
                  </span>
                </button>
              )
            })}
          </div>
          {errors.jenis && <p className="text-red-500 text-xs mt-2">{errors.jenis}</p>}
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Deskripsi Kejadian <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Jelaskan apa yang terjadi, kapan, dan seberapa parah kerusakannya
          </p>
          <textarea
            value={form.deskripsi}
            onChange={(e) => {
              setForm((f) => ({ ...f, deskripsi: e.target.value }))
              setErrors((e) => ({ ...e, deskripsi: undefined }))
            }}
            rows={5}
            maxLength={500}
            placeholder="Contoh: Terjadi longsor di belakang rumah warga sekitar pukul 14.00 WIB. Material tanah dan batu menutupi jalan setapak sepanjang 5 meter. Tidak ada korban jiwa."
            className={`w-full border rounded-card-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
              errors.deskripsi ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between mt-2">
            {errors.deskripsi
              ? <p className="text-red-500 text-xs">{errors.deskripsi}</p>
              : <span />
            }
            <p className={`text-xs ${form.deskripsi.length > 450 ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
              {form.deskripsi.length}/500
            </p>
          </div>
        </div>

        {/* Foto (opsional) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Foto Kejadian (opsional)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Lampirkan foto untuk memperjelas kondisi. Format: JPG, PNG, WebP. Maksimal 5MB.
          </p>
          
          {!previewUrl ? (
            <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-card-lg hover:border-primary-400 hover:bg-primary-50/30 transition-colors cursor-pointer">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Klik untuk pilih foto</p>
                <p className="text-xs text-gray-500 mt-1">atau drag & drop file di sini</p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFotoChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative rounded-card-lg overflow-hidden border-2 border-gray-200">
              <img
                src={previewUrl}
                alt="Preview foto laporan"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 flex items-end p-4">
                <p className="text-white text-sm font-medium">{foto?.name}</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFoto}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Hapus foto"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Desa */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Lokasi Desa <span className="text-red-500">*</span>
          </label>
          <select
            value={form.desaId}
            onChange={(e) => {
              setForm((f) => ({ ...f, desaId: e.target.value }))
              setErrors((e) => ({ ...e, desaId: undefined }))
            }}
            className={`w-full border rounded-card-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.desaId ? 'border-red-400' : 'border-gray-300'
            }`}
          >
            <option value="">-- Pilih Desa --</option>
            {desaList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama} — Kec. {d.kecamatan}
              </option>
            ))}
          </select>
          {errors.desaId && <p className="text-red-500 text-xs mt-2">{errors.desaId}</p>}
        </div>

        {/* Koordinat */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Koordinat (opsional)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Jika mengetahui koordinat GPS lokasi kejadian, isi kolom di bawah
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={form.lat}
                onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                placeholder="contoh: 2.75"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={form.lng}
                onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                placeholder="contoh: 98.38"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 text-white rounded-card-lg py-3.5 font-semibold text-sm hover:bg-primary-700 active:scale-[.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Mengirim Laporan...
              </span>
            ) : (
              'Kirim Laporan'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
