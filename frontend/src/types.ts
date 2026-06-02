
export interface MasterBarang {
  IDBarang: string | number;
  NamaBarang: string;
  Kategori: string;
  StokSaatIni: number;
  MinimumStok: number;
  Satuan: string;
  UpdateTerakhir: string;
}

export interface LogTransaksi {
  IDTransaksi: string | number;
  IDBarang: string | number;
  NamaBarang: string;
  Tipe: 'Masuk' | 'Keluar';
  Jumlah: number;
  Catatan: string;
  Waktu: string;
}

export interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  totalTransactions: number;
  categoryCount: Record<string, number>;
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  MASTER_BARANG = 'master',
  TRANSAKSI = 'transaksi',
  LOGS = 'logs'
}
