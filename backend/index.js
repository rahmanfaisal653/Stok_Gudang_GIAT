const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const pool = require('./db');
const app  = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
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
      const now = new Date().toISOString();

      // 1. Catat transaksi ke log_transaksi
      await pool.query(
        `INSERT INTO log_transaksi
           (IDTransaksi, IDBarang, NamaBarang, Tipe, Jumlah, Catatan, Waktu)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.idTransaksi,
          data.idBarang,
          data.namaBarang,
          data.tipe,
          Number(data.jumlah),
          data.catatan || '',
          now
        ]
      );

      // 2. Update stok di master_barang
      const jumlah = Number(data.jumlah);
      if (data.tipe === 'Masuk' || data.tipe === 'MASUK') {
        await pool.query(
          `UPDATE master_barang
           SET StokSaatIni = StokSaatIni + ?, UpdateTerakhir = ?
           WHERE IDBarang = ?`,
          [jumlah, now, data.idBarang]
        );
      } else if (data.tipe === 'Keluar' || data.tipe === 'KELUAR') {
        await pool.query(
          `UPDATE master_barang
           SET StokSaatIni = StokSaatIni - ?, UpdateTerakhir = ?
           WHERE IDBarang = ?`,
          [jumlah, now, data.idBarang]
        );
      }

      return res.json({ success: true });
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
