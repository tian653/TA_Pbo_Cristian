# Sistem Informasi Bencana Alam

Aplikasi PWA (Progressive Web App) untuk monitoring indikator awal kewaspadaan longsor dan pelaporan bencana di Kabupaten Dairi, Sumatera Utara.

## Stack Teknologi

- **Backend**: NestJS 10.x + TypeORM + PostgreSQL 16
- **Frontend**: React 18.2 + React Router 6.21 + Vite 5 + Tailwind CSS 3.4
- **PWA**: vite-plugin-pwa dengan Workbox
- **Database**: PostgreSQL 16 (via Docker)
- **Sumber Data Eksternal**: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)

## Fitur

- ✅ Monitoring status desa (Aman, Waspada, Siaga, Awas)
- ✅ Pelaporan kejadian (Longsor, Banjir, Retakan Tanah, Jalan Rusak)
- ✅ Prakiraan cuaca per desa (data real-time dari BMKG)
- ✅ Informasi gempa terkini (radius 150 km dari Kabupaten Dairi)
- ✅ Progressive Web App (bisa diinstall di perangkat mobile)
- ✅ Offline-capable dengan service worker

## Cara Menjalankan

### 1. Prasyarat

- Node.js 18+ dan npm
- Akun Supabase (gratis) untuk database PostgreSQL

### 2. Setup Database (Supabase)

Ikuti panduan lengkap di **`SUPABASE_SETUP.md`**

Ringkas:
1. Buka https://supabase.com dan sign up
2. Buat project baru (region: Southeast Asia)
3. Copy connection string dari Settings → Database
4. Paste ke `backend/.env` pada baris `DATABASE_URL=`

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# File .env sudah ada, tinggal ganti DATABASE_URL dengan connection string Supabase

# Build backend
npm run build

# Jalankan backend (development mode)
npm run start:dev

# Backend akan berjalan di http://localhost:3000
```

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Jalankan frontend (development mode)
npm run dev

# Frontend akan berjalan di http://localhost:5173
```

### 5. Build untuk Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview  # preview production build
```

## Endpoint API Backend

### Desa
- `GET /desa` - Ambil semua desa
- `GET /desa/:id` - Ambil detail desa
- `GET /desa/:id/cuaca` - Ambil cuaca desa (dengan skor gabungan)

### Laporan
- `GET /laporan` - Ambil semua laporan (query: `?jenis=LONGSOR&desaId=xxx`)
- `GET /laporan/:id` - Ambil detail laporan
- `POST /laporan` - Buat laporan baru
- `PATCH /laporan/:id/status` - Update status laporan

### Cuaca (BMKG)
- `GET /cuaca?adm4=12.11.01.1010` - Ambil prakiraan cuaca per kode desa

### Gempa (BMKG)
- `GET /gempa/terkini` - Ambil gempa M 5.0+ dalam radius 150 km dari Dairi
- `GET /gempa/dirasakan` - Ambil gempa yang dirasakan dalam radius 150 km dari Dairi

## Sumber Data

### BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
- **Prakiraan Cuaca**: `https://api.bmkg.go.id/publik/prakiraan-cuaca`
- **Gempa Terkini (M 5.0+)**: `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json`
- **Gempa Dirasakan**: `https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json`
- **Shakemap**: `https://data.bmkg.go.id/DataMKG/TEWS/{filename}`

**Catatan**: Aplikasi backend melakukan caching untuk mematuhi rate limit BMKG (maksimal 60 request/menit/IP).

## Konfigurasi

### Environment Variables (Backend)

File `.env` di folder `backend/`:

```env
# Port server
PORT=3000

# Supabase Database (ganti dengan connection string dari Supabase)
DATABASE_URL=postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

# Radius filter gempa dari Sidikalang (km)
GEMPA_RADIUS_KM=150
```

### Environment Variables (Frontend)

Buat file `.env` di folder `frontend/` (opsional):

```env
# URL backend API (default: http://localhost:3000)
VITE_API_URL=http://localhost:3000
```

## Data Wilayah

Aplikasi ini mencakup 15 kecamatan resmi di Kabupaten Dairi dengan kode wilayah adm4 terverifikasi dari repository cahyadsn/wilayah:

1. Sidikalang (12.11.01.1010)
2. Sumbul (12.11.02.1007)
3. Tigalingga (12.11.03.2001)
4. Siempat Nempu (12.11.04.2002)
5. Silima Pungga Pungga (12.11.05.1014)
6. Tanah Pinem (12.11.06.2001)
7. Siempat Nempu Hulu (12.11.07.2002)
8. Siempat Nempu Hilir (12.11.08.2001)
9. Pegagan Hilir (12.11.09.2001)
10. Parbuluan (12.11.10.2002)
11. Lae Parira (12.11.11.2003)
12. Gunung Sitember (12.11.12.2002)
13. Berampu (12.11.13.2001)
14. Silahisabungan (12.11.14.2002)
15. Sitinjo (12.11.15.2001)

## Testing

### Test Manual dengan curl

```bash
# Test endpoint desa
curl http://localhost:3000/desa

# Test endpoint cuaca (contoh kode adm4 Sidikalang)
curl "http://localhost:3000/cuaca?adm4=12.11.01.1010"

# Test endpoint gempa terkini
curl http://localhost:3000/gempa/terkini

# Test endpoint gempa dirasakan
curl http://localhost:3000/gempa/dirasakan

# Test endpoint laporan
curl http://localhost:3000/laporan
```

## Struktur Proyek

```
TugasAkhirPPB/
├── backend/
│   ├── src/
│   │   ├── bmkg/          # Service cuaca & gempa BMKG
│   │   ├── desa/          # Module desa
│   │   ├── laporan/       # Module laporan
│   │   ├── seeder/        # Data seed 15 kecamatan
│   │   └── main.ts
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # 7 halaman utama
│   │   └── App.tsx
│   ├── public/
│   │   └── icons/         # PWA icons
│   ├── package.json
│   └── vite.config.ts     # PWA config
├── docker-compose.yml
└── README.md
```

## Catatan Penting

1. **Tidak Ada Prediksi Longsor**: Aplikasi ini hanya menampilkan indikator awal kewaspadaan berdasarkan laporan warga dan prakiraan cuaca, bukan prediksi ilmiah kejadian longsor.

2. **Filter Gempa**: Gempa difilter berdasarkan radius 150 km dari titik pusat Sidikalang (2.74997, 98.31191) menggunakan rumus Haversine.

3. **Cache BMKG**: Backend melakukan caching:
   - Prakiraan cuaca: 1 jam
   - Data gempa: 5 menit

4. **PWA Installable**: Aplikasi bisa diinstall di mobile device melalui browser (Chrome/Edge/Safari).

## Lisensi

Aplikasi ini dibuat untuk keperluan tugas akhir mata kuliah Pemrograman Perangkat Bergerak.

---

© 2024 Peringatan Dini Longsor Kabupaten Dairi


## Mode Petugas (Update Status Laporan)

Aplikasi ini memiliki fitur **Mode Petugas** untuk petugas/admin yang bertugas memverifikasi dan menangani laporan masyarakat.

### Setup Kunci Admin

1. Generate kunci admin yang kuat:
   ```bash
   openssl rand -hex 32
   ```

2. Tambahkan kunci ke file `backend/.env`:
   ```
   ADMIN_KEY=your_generated_key_here
   ```

3. **JANGAN commit** file `.env` ke repository!

### Menggunakan Mode Petugas

1. Buka aplikasi dan navigasi ke **halaman Profil** (icon profil di bottom navigation)

2. Di bagian **"Mode Petugas"**:
   - Masukkan kunci admin yang sama dengan `ADMIN_KEY` di backend
   - Klik **"Aktifkan Mode Petugas"**

3. Setelah aktif, buka **Detail Laporan** mana pun:
   - Tombol untuk mengubah status akan muncul
   - Status hanya bisa maju: **BARU → DIVERIFIKASI → DITANGANI → SELESAI**
   - Tidak bisa lompat atau mundur

4. Untuk keluar dari mode petugas:
   - Kembali ke halaman Profil
   - Klik **"Keluar dari Mode Petugas"**

### Catatan Keamanan

⚠️ **Ini adalah sistem otorisasi sederhana untuk keperluan praktikum/demo**, bukan sistem login production-ready.

- Kunci disimpan di `sessionStorage` (hilang saat tab ditutup)
- Tidak ada enkripsi end-to-end
- Tidak ada manajemen user/role
- Cocok untuk demo dan tugas praktikum, **bukan untuk production**

Untuk production, gunakan:
- JWT authentication
- Refresh token
- Role-based access control (RBAC)
- OAuth2 / OpenID Connect
- Database user dengan password hashing (bcrypt/argon2)
# TA_PBO_Cristian
