const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const pool = require('./db');
const app  = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  }
}));
app.use(express.json());

// ─────────────────────────────────────────────
// Helper: map DB row ke format yang diharapkan frontend
// Kolom DB: IDBarang, NamaBarang, Kategori, StokSaatIni, MinimumStok, Satuan, UpdateTerakhir
// ─────────────────────────────────────────────
function mapMaster(row) {
  return {
    IDBarang:       row.IDBarang,
    NamaBarang:     row.NamaBarang,
    Kategori:       row.Kategori,
    StokSaatIni:    Number(row.StokSaatIni),
    MinimumStok:    Number(row.MinimumStok),
    Satuan:         row.Satuan,
    UpdateTerakhir: row.UpdateTerakhir
  };
}

// Kolom DB: IDTransaksi, IDBarang, NamaBarang, Tipe, Jumlah, Catatan, Waktu
function mapLog(row) {
  return {
    IDTransaksi: row.IDTransaksi,
    IDBarang:    row.IDBarang,
    NamaBarang:  row.NamaBarang,
    Tipe:        row.Tipe,
    Jumlah:      Number(row.Jumlah),
    Catatan:     row.Catatan,
    Waktu:       row.Waktu
  };
}

// ─────────────────────────────────────────────
// GET /?action=getData
// Menggantikan doGet di GAS
// ─────────────────────────────────────────────
app.get('/', async (req, res) => {
  if (req.query.action !== 'getData') {
    return res.status(400).json({ success: false, error: 'Unknown action' });
  }

  try {
    const [masterRows] = await pool.query('SELECT * FROM master_barang ORDER BY CAST(IDBarang AS UNSIGNED)');
    const [logRows]    = await pool.query('SELECT * FROM log_transaksi ORDER BY Waktu ASC');

    res.json({
      master: masterRows.map(mapMaster),
      logs:   logRows.map(mapLog)
    });
  } catch (err) {
    console.error('getData error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /
// Menggantikan doPost di GAS
// ─────────────────────────────────────────────
app.post('/', async (req, res) => {
  const data   = req.body;
  const action = data.action;

  try {
    // ── addBarang ──────────────────────────────
    if (action === 'addBarang') {
      const stokSaatIni = Number(data.stokSaatIni);
      const minimumStok = Number(data.minimumStok);

      if (!data.idBarang || !data.namaBarang || !data.kategori || !data.satuan) {
        return res.status(400).json({ success: false, error: 'Data barang tidak lengkap' });
      }
      if (!Number.isFinite(stokSaatIni) || stokSaatIni < 0 || !Number.isFinite(minimumStok) || minimumStok < 0) {
        return res.status(400).json({ success: false, error: 'Stok dan minimum stok harus bernilai 0 atau lebih' });
      }

      await pool.query(
        `INSERT INTO master_barang
           (IDBarang, NamaBarang, Kategori, StokSaatIni, MinimumStok, Satuan, UpdateTerakhir)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.idBarang,
          data.namaBarang,
          data.kategori,
          Number(data.stokSaatIni),
          Number(data.minimumStok),
          data.satuan,
          new Date().toISOString()
        ]
      );
      return res.json({ success: true, message: 'Barang added' });
    }

    // ── updateBarang ───────────────────────────
    if (action === 'updateBarang') {
      const stokSaatIni = Number(data.stokSaatIni);
      const minimumStok = Number(data.minimumStok);

      if (!data.idBarang || !data.namaBarang || !data.kategori || !data.satuan) {
        return res.status(400).json({ success: false, error: 'Data barang tidak lengkap' });
      }
      if (!Number.isFinite(stokSaatIni) || stokSaatIni < 0 || !Number.isFinite(minimumStok) || minimumStok < 0) {
        return res.status(400).json({ success: false, error: 'Stok dan minimum stok harus bernilai 0 atau lebih' });
      }

      await pool.query(
        `UPDATE master_barang
         SET NamaBarang = ?, Kategori = ?, StokSaatIni = ?, MinimumStok = ?, Satuan = ?, UpdateTerakhir = ?
         WHERE IDBarang = ?`,
        [
          data.namaBarang,
          data.kategori,
          Number(data.stokSaatIni),
          Number(data.minimumStok),
          data.satuan,
          new Date().toISOString(),
          data.idBarang
        ]
      );
      return res.json({ success: true });
    }

    // ── deleteBarang ───────────────────────────
    if (action === 'deleteBarang') {
      await pool.query(
        'DELETE FROM master_barang WHERE IDBarang = ?',
        [data.idBarang]
      );
      return res.json({ success: true });
    }

    // ── addLog ─────────────────────────────────
    if (action === 'addLog') {
      const jumlah = Number(data.jumlah);
      const tipe = String(data.tipe || '');

      if (!data.idBarang || !data.idTransaksi) {
        return res.status(400).json({ success: false, error: 'Data transaksi tidak lengkap' });
      }
      if (!Number.isFinite(jumlah) || jumlah <= 0) {
        return res.status(400).json({ success: false, error: 'Jumlah transaksi harus lebih dari 0' });
      }
      if (!['Masuk', 'Keluar', 'MASUK', 'KELUAR'].includes(tipe)) {
        return res.status(400).json({ success: false, error: 'Tipe transaksi tidak valid' });
      }

      const now = new Date().toISOString();
      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        const [rows] = await connection.query(
          'SELECT NamaBarang, StokSaatIni FROM master_barang WHERE IDBarang = ? FOR UPDATE',
          [data.idBarang]
        );

        if (rows.length === 0) {
          throw new Error('Barang tidak ditemukan');
        }

        const currentStock = Number(rows[0].StokSaatIni);
        const isKeluar = tipe === 'Keluar' || tipe === 'KELUAR';

        if (isKeluar && jumlah > currentStock) {
          throw new Error(`Stok tidak cukup. Stok saat ini hanya ${currentStock}`);
        }

        await connection.query(
          `INSERT INTO log_transaksi
             (IDTransaksi, IDBarang, NamaBarang, Tipe, Jumlah, Catatan, Waktu)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            data.idTransaksi,
            data.idBarang,
            data.namaBarang || rows[0].NamaBarang,
            isKeluar ? 'Keluar' : 'Masuk',
            jumlah,
            data.catatan || '',
            now
          ]
        );

        await connection.query(
          `UPDATE master_barang
           SET StokSaatIni = StokSaatIni ${isKeluar ? '-' : '+'} ?, UpdateTerakhir = ?
           WHERE IDBarang = ?`,
          [jumlah, now, data.idBarang]
        );

        await connection.commit();
        return res.json({ success: true });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    }

    // ── unknown action ─────────────────────────
    return res.status(400).json({ success: false, error: `Unknown action: ${action}` });

  } catch (err) {
    console.error(`${action} error:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ATK GIAT Backend running on http://localhost:${PORT}`);
});
