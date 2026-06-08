const pool = require('../config/db');

const VALID_TRANSACTION_TYPES = new Set(['Masuk', 'Keluar', 'MASUK', 'KELUAR']);
const TEXT_ONLY_PATTERN = /^[A-Za-zÀ-ÿ\s./-]+$/;

function normalizeIdBarang(value, required = true) {
  if ((value === undefined || value === null || value === '') && !required) return null;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw createHttpError(400, 'ID barang harus berupa angka bulat positif');
  }
  return id;
}

function normalizeText(value, fieldName) {
  const text = String(value || '').trim();
  if (!text) throw createHttpError(400, `${fieldName} wajib diisi`);
  if (!TEXT_ONLY_PATTERN.test(text)) {
    throw createHttpError(400, `${fieldName} hanya boleh berisi huruf dan spasi`);
  }
  return text;
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function mapMaster(row) {
  return {
    IDBarang: row.IDBarang,
    NamaBarang: row.NamaBarang,
    Kategori: row.Kategori,
    StokSaatIni: Number(row.StokSaatIni),
    MinimumStok: Number(row.MinimumStok),
    Satuan: row.Satuan,
    UpdateTerakhir: row.UpdateTerakhir,
  };
}

function mapLog(row) {
  return {
    IDTransaksi: row.IDTransaksi,
    IDBarang: row.IDBarang,
    NamaBarang: row.NamaBarang,
    Tipe: row.Tipe,
    Jumlah: Number(row.Jumlah),
    Catatan: row.Catatan,
    Waktu: row.Waktu,
  };
}

function normalizeBarangPayload(data) {
  const stokSaatIni = Number(data.stokSaatIni);
  const minimumStok = Number(data.minimumStok);

  if (!data.namaBarang || !data.kategori || !data.satuan) {
    throw createHttpError(400, 'Data barang tidak lengkap');
  }

  if (!Number.isFinite(stokSaatIni) || stokSaatIni < 0 || !Number.isFinite(minimumStok) || minimumStok < 0) {
    throw createHttpError(400, 'Stok dan minimum stok harus bernilai 0 atau lebih');
  }

  return {
    idBarang: normalizeIdBarang(data.idBarang, false),
    namaBarang: String(data.namaBarang).trim(),
    kategori: normalizeText(data.kategori, 'Kategori'),
    stokSaatIni,
    minimumStok,
    satuan: normalizeText(data.satuan, 'Satuan'),
  };
}

function normalizeLogPayload(data) {
  const jumlah = Number(data.jumlah);
  const tipe = String(data.tipe || '');

  if (!data.idBarang || !data.idTransaksi) {
    throw createHttpError(400, 'Data transaksi tidak lengkap');
  }

  if (!Number.isFinite(jumlah) || jumlah <= 0) {
    throw createHttpError(400, 'Jumlah transaksi harus lebih dari 0');
  }

  if (!VALID_TRANSACTION_TYPES.has(tipe)) {
    throw createHttpError(400, 'Tipe transaksi tidak valid');
  }

  return {
    idTransaksi: data.idTransaksi,
    idBarang: normalizeIdBarang(data.idBarang),
    namaBarang: data.namaBarang,
    tipe: tipe === 'Keluar' || tipe === 'KELUAR' ? 'Keluar' : 'Masuk',
    jumlah,
    catatan: data.catatan || '',
  };
}

async function getData() {
  const [masterRows] = await pool.query('SELECT * FROM master_barang ORDER BY IDBarang ASC');
  const [logRows] = await pool.query('SELECT * FROM log_transaksi ORDER BY Waktu ASC');

  return {
    master: masterRows.map(mapMaster),
    logs: logRows.map(mapLog),
  };
}

async function addBarang(data) {
  const payload = normalizeBarangPayload(data);

  await pool.query(
    `INSERT INTO master_barang
       (NamaBarang, Kategori, StokSaatIni, MinimumStok, Satuan, UpdateTerakhir)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      payload.namaBarang,
      payload.kategori,
      payload.stokSaatIni,
      payload.minimumStok,
      payload.satuan,
      new Date().toISOString(),
    ],
  );

  return { success: true, message: 'Barang added' };
}

async function updateBarang(data) {
  const payload = normalizeBarangPayload(data);

  const [result] = await pool.query(
    `UPDATE master_barang
     SET NamaBarang = ?, Kategori = ?, StokSaatIni = ?, MinimumStok = ?, Satuan = ?, UpdateTerakhir = ?
     WHERE IDBarang = ?`,
    [
      payload.namaBarang,
      payload.kategori,
      payload.stokSaatIni,
      payload.minimumStok,
      payload.satuan,
      new Date().toISOString(),
      payload.idBarang,
    ],
  );

  if (result.affectedRows === 0) {
    throw createHttpError(404, 'Barang tidak ditemukan');
  }

  return { success: true };
}

async function deleteBarang(idBarang) {
  const id = normalizeIdBarang(idBarang);

  const [result] = await pool.query('DELETE FROM master_barang WHERE IDBarang = ?', [id]);
  if (result.affectedRows === 0) {
    throw createHttpError(404, 'Barang tidak ditemukan');
  }

  return { success: true };
}

async function addLog(data) {
  const payload = normalizeLogPayload(data);
  const now = new Date().toISOString();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      'SELECT NamaBarang, StokSaatIni FROM master_barang WHERE IDBarang = ? FOR UPDATE',
      [payload.idBarang],
    );

    if (rows.length === 0) {
      throw createHttpError(404, 'Barang tidak ditemukan');
    }

    const currentStock = Number(rows[0].StokSaatIni);
    const isKeluar = payload.tipe === 'Keluar';

    if (isKeluar && payload.jumlah > currentStock) {
      throw createHttpError(400, `Stok tidak cukup. Stok saat ini hanya ${currentStock}`);
    }

    await connection.query(
      `INSERT INTO log_transaksi
         (IDTransaksi, IDBarang, NamaBarang, Tipe, Jumlah, Catatan, Waktu)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.idTransaksi,
        payload.idBarang,
        payload.namaBarang || rows[0].NamaBarang,
        payload.tipe,
        payload.jumlah,
        payload.catatan,
        now,
      ],
    );

    await connection.query(
      `UPDATE master_barang
       SET StokSaatIni = StokSaatIni ${isKeluar ? '-' : '+'} ?, UpdateTerakhir = ?
       WHERE IDBarang = ?`,
      [payload.jumlah, now, payload.idBarang],
    );

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getData,
  addBarang,
  updateBarang,
  deleteBarang,
  addLog,
};
