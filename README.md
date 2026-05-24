# ATK GIAT - Stock Management

Aplikasi manajemen stok ATK gudang berbasis React, Vite, Express, dan MySQL.

## Fitur

- Dashboard stok dengan filter tanggal dan rentang periode.
- Master barang: tambah, edit, hapus, pencarian, dan pagination.
- Transaksi stok masuk/keluar dengan validasi stok.
- Riwayat transaksi dengan filter tanggal, pencarian, dan pagination.
- UI responsif untuk desktop, laptop, tablet, dan mobile.
- Bottom navigation khusus mobile.

## Prasyarat

- Node.js 20+
- MySQL/MariaDB
- NPM

## Setup Frontend

1. Install dependency root:

```bash
npm install
```

2. Salin env frontend:

```bash
cp .env.example .env
```

3. Sesuaikan URL backend di `.env`:

```env
VITE_API_URL=http://localhost:3001
```

## Setup Backend

1. Install dependency backend jika diperlukan:

```bash
cd backend
npm install
```

2. Salin env backend:

```bash
cp .env.example .env
```

3. Sesuaikan konfigurasi database dan CORS di `backend/.env`:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=atk_giat
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

## Struktur Database

Aplikasi mengharapkan dua tabel utama:

- `master_barang`: `IDBarang`, `NamaBarang`, `Kategori`, `StokSaatIni`, `MinimumStok`, `Satuan`, `UpdateTerakhir`
- `log_transaksi`: `IDTransaksi`, `IDBarang`, `NamaBarang`, `Tipe`, `Jumlah`, `Catatan`, `Waktu`

Pastikan tipe kolom stok/jumlah numerik dan kolom ID sesuai kebutuhan data existing.

## Menjalankan Project

Jalankan backend dan frontend sekaligus:

```bash
npm run dev
```

Atau jalankan terpisah:

```bash
npm run backend
npm run frontend
```

Frontend default berjalan di `http://localhost:3000`, backend di `http://localhost:3001`.

## Build Production

```bash
npm run build
npm run preview
```

Untuk PM2, gunakan `ecosystem.config.cjs` setelah build frontend selesai.

## Catatan Keamanan

Login saat ini masih hardcoded di frontend sesuai kebutuhan project. Untuk production publik, pertimbangkan migrasi ke auth backend/session/token di fase berikutnya.
