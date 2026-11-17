# Bugfix Requirements Document

## Introduction

Aplikasi PWA pelaporan bencana mengalami kegagalan memuat data di semua halaman (Beranda, List Desa, List Laporan). Error terjadi karena backend NestJS tidak dapat terhubung ke database Supabase PostgreSQL. Backend menampilkan error "ENOTFOUND tenant/user postgres.xxxxx not found" yang mengindikasikan DATABASE_URL di file `.env` masih menggunakan nilai placeholder atau tidak valid.

**Dampak Bug:**
- Semua halaman frontend menampilkan pesan "⚠️ Gagal memuat data"
- Backend tidak dapat melayani request API karena koneksi database gagal
- Aplikasi tidak dapat digunakan sama sekali

**Root Cause:**
- File `backend/.env` berisi DATABASE_URL dengan nilai placeholder `postgres.xxxxx` atau password yang tidak valid
- TypeORM gagal melakukan koneksi ke database saat aplikasi startup
- Semua endpoint API tidak dapat berfungsi tanpa koneksi database yang valid

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN backend dijalankan dengan DATABASE_URL yang berisi placeholder (postgres.xxxxx) atau credentials yang tidak valid THEN TypeORM gagal terhubung ke database dan menampilkan error "ENOTFOUND tenant/user postgres.xxxxx not found"

1.2 WHEN koneksi database gagal THEN semua endpoint API (/desa, /laporan, /gempa/terkini, dll) tidak dapat melayani request

1.3 WHEN frontend memanggil API endpoint yang gagal THEN frontend menampilkan pesan error "⚠️ Gagal memuat data" di setiap halaman

1.4 WHEN user membuka aplikasi PWA THEN data tidak dapat dimuat dan aplikasi tidak dapat digunakan

### Expected Behavior (Correct)

2.1 WHEN backend dijalankan dengan DATABASE_URL yang valid dan lengkap THEN TypeORM SHALL berhasil terhubung ke database Supabase PostgreSQL tanpa error

2.2 WHEN koneksi database berhasil THEN semua endpoint API (/desa, /laporan, /gempa/terkini, dll) SHALL dapat melayani request dengan response data yang benar

2.3 WHEN frontend memanggil API endpoint yang berfungsi THEN frontend SHALL menampilkan data dengan benar (daftar desa, daftar laporan, data gempa terkini, dll)

2.4 WHEN user membuka aplikasi PWA THEN semua halaman (Beranda, List Desa, List Laporan) SHALL memuat dan menampilkan data dengan benar

2.5 WHEN DATABASE_URL di .env tidak dikonfigurasi (masih placeholder) THEN aplikasi SHALL memberikan pesan error yang jelas dan panduan cara mengonfigurasi database di console log saat startup

### Unchanged Behavior (Regression Prevention)

3.1 WHEN backend sudah terhubung ke database yang valid THEN CORS configuration SHALL CONTINUE TO mengizinkan request dari origin mana pun (origin: '*')

3.2 WHEN API endpoint dipanggil dengan parameter yang benar THEN response format dan struktur data SHALL CONTINUE TO sama seperti sebelumnya (Desa[], Laporan[], GempaResponse, dll)

3.3 WHEN frontend memanggil API dengan error handling yang ada THEN error handling di frontend SHALL CONTINUE TO menampilkan pesan error user-friendly jika terjadi masalah koneksi

3.4 WHEN validation error terjadi di backend THEN ValidationPipe SHALL CONTINUE TO mengembalikan error response yang sesuai

3.5 WHEN backend berjalan di port yang dikonfigurasi THEN backend SHALL CONTINUE TO listen pada port tersebut (default 3000) di 0.0.0.0

## Bug Condition and Property

### Bug Condition Function

```pascal
FUNCTION isBugCondition(DATABASE_URL: string)
  INPUT: DATABASE_URL of type string
  OUTPUT: boolean
  
  // Returns true when DATABASE_URL is invalid or contains placeholders
  RETURN (
    DATABASE_URL is empty OR
    DATABASE_URL contains "postgres.xxxxx" OR
    DATABASE_URL contains "[YOUR-PASSWORD]" OR
    DATABASE_URL is not a valid PostgreSQL connection string OR
    credentials in DATABASE_URL are invalid/expired
  )
END FUNCTION
```

### Fix Checking Property

```pascal
// Property: Backend Database Connection Success
FOR ALL DATABASE_URL WHERE isBugCondition(DATABASE_URL) DO
  // After fix applied:
  startup_result ← startBackend'(DATABASE_URL)
  
  ASSERT (
    startup_result.database_connected = false AND
    startup_result.error_message contains "DATABASE_URL tidak dikonfigurasi dengan benar" AND
    startup_result.help_message contains "Silakan cek SUPABASE_SETUP.md untuk panduan setup"
  ) OR (
    user_configures_valid_database_url AND
    THEN startup_result.database_connected = true AND
    ALL API endpoints are functional
  )
END FOR
```

### Preservation Checking Property

```pascal
// Property: Valid Database Configuration Unchanged
FOR ALL DATABASE_URL WHERE NOT isBugCondition(DATABASE_URL) DO
  // F = original backend, F' = fixed backend
  ASSERT (
    F(DATABASE_URL).database_connected = true 
    AND F'(DATABASE_URL).database_connected = true
    AND F(DATABASE_URL).api_endpoints_functional = F'(DATABASE_URL).api_endpoints_functional
    AND F(DATABASE_URL).cors_config = F'(DATABASE_URL).cors_config
  )
END FOR
```

### Counterexample

**Buggy Input:**
```
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**Current Behavior (Defect):**
- Backend crashes atau retry connection infinitely
- Error: "ENOTFOUND tenant/user postgres.xxxxx not found"
- API endpoints tidak dapat diakses
- Frontend menampilkan "Gagal memuat data" di semua halaman

**Expected Behavior (Correct):**
- Backend mendeteksi DATABASE_URL invalid saat startup
- Menampilkan error message yang jelas dengan panduan setup
- Atau: User mengonfigurasi DATABASE_URL yang valid → semua berfungsi normal
