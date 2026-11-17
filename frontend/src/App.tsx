import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Beranda from './pages/Beranda'
import ListLaporan from './pages/ListLaporan'
import DetailLaporan from './pages/DetailLaporan'
import FormLaporan from './pages/FormLaporan'
import ListDesa from './pages/ListDesa'
import DetailDesa from './pages/DetailDesa'
import Profil from './pages/Profil'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <main className="pb-24 lg:pb-28">
          <Routes>
            <Route path="/" element={<Beranda />} />
            <Route path="/laporan" element={<ListLaporan />} />
            <Route path="/laporan/baru" element={<FormLaporan />} />
            <Route path="/laporan/:id" element={<DetailLaporan />} />
            <Route path="/desa" element={<ListDesa />} />
            <Route path="/desa/:id" element={<DetailDesa />} />
            <Route path="/profil" element={<Profil />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
