# ATK GIAT - Stock Management

Aplikasi manajemen stok ATK gudang berbasis React/Vite, Express, dan MySQL. Project sudah dipisah menjadi frontend dan backend agar lebih modular, mudah di-deploy, dan scalable.

## Struktur

```text
.
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   ├── types.ts
│   │   └── services/
│   ├── public/assets/
│   ├── .env.example
│   └── package.json
├── ecosystem.config.cjs
└── package.json
```

## Fitur

- Dashboard stok dengan filter tanggal/rentang periode.
- Master barang: tambah, edit, hapus, pencarian, pagination.
- Transaksi stok masuk/keluar dengan validasi stok frontend dan backend.
- Riwayat transaksi dengan filter tanggal, pencarian, pagination.
- Backend memakai transaksi MySQL untuk mencegah stok minus/race condition.
- UI responsif desktop, laptop, tablet, dan mobile dengan bottom navigation khusus HP.

## Setup

Install semua dependency workspace:

```bash
npm install
```

Salin env:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Contoh `frontend/.env` untuk production satu domain dengan reverse proxy `/api`:

```env
VITE_API_URL=https://domain-kamu.com/api
```

Contoh `backend/.env`:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=atk_giat_user
DB_PASSWORD=password_kamu
DB_NAME=atk_giat
DB_CONNECTION_LIMIT=10
CORS_ORIGIN=https://domain-kamu.com,https://www.domain-kamu.com
```

## Menjalankan Lokal

```bash
npm run dev
```

Atau terpisah:

```bash
npm run backend
npm run frontend
```

Frontend default: `http://localhost:3000`.
Backend default: `http://localhost:3001`.
Health check backend: `http://localhost:3001/health`.

## Build Dan Deploy

```bash
npm run build
npm run preview
```

PM2:

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

Jika memakai Nginx satu domain, proxy `/api` ke backend:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3001/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Struktur Database

Aplikasi memakai dua tabel utama:

- `master_barang`: `IDBarang`, `NamaBarang`, `Kategori`, `StokSaatIni`, `MinimumStok`, `Satuan`, `UpdateTerakhir`
- `log_transaksi`: `IDTransaksi`, `IDBarang`, `NamaBarang`, `Tipe`, `Jumlah`, `Catatan`, `Waktu`

## Catatan

Login masih hardcoded di frontend sesuai kebutuhan saat ini. Untuk production publik, backend auth tetap direkomendasikan pada fase berikutnya.
