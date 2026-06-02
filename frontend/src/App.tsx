import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  History,
  Plus,
  Menu,
  X,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
  Trash2,
  Edit2,
  Filter,
  RotateCcw,
  AlertCircle,
  LogOut,
  Lock,
  User,
  TrendingUp,
  Activity,
  Layers,
  Search,
  Box,
  BarChart2,
  PieChart as PieIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  ChevronRight,
  Bell,
  ChevronDown,
  Calendar,
  Info,
  RefreshCw,
  List,
  Clipboard,
  ArrowDown,
  Upload,
  FileText,
  ChevronLeft,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  LabelList,
} from "recharts";

import { MasterBarang, LogTransaksi } from "./types";
import { sheetService } from "./services/sheetService";

const LOGO_URL = "https://ekop.kopgiat.id//logo_giat.ico";
const POLL_INTERVAL_MS = 5000;

// ─── TOAST NOTIFICATION ───────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning';
interface Toast { id: number; message: string; type: ToastType; }

const ToastContainer = ({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) => (
  <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-[100] flex flex-col gap-3 pointer-events-none">
    {toasts.map(t => (
      <div
        key={t.id}
        className={`flex items-center gap-3 px-4 sm:px-5 py-3.5 rounded-none sm:rounded-[14px] shadow-xl text-white text-[13px] font-semibold pointer-events-auto animate-in slide-in-from-bottom-4 duration-300 min-w-full sm:min-w-[260px] sm:max-w-[360px]
          ${t.type === 'success' ? 'bg-[#1E293B]' : t.type === 'error' ? 'bg-[#E53935]' : 'bg-amber-500'}`}
      >
        <span className="text-lg">
          {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : '⚠'}
        </span>
        <span className="flex-1">{t.message}</span>
        <button onClick={() => onRemove(t.id)} className="opacity-70 hover:opacity-100 ml-2">✕</button>
      </div>
    ))}
  </div>
);

let _toastId = 0;
const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  const remove = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  return { toasts, show, remove };
};

// --- HELPERS ---
const numericSort = (a: MasterBarang, b: MasterBarang) => {
  const idA = a.IDBarang.toString();
  const idB = b.IDBarang.toString();
  return idA.localeCompare(idB, undefined, {
    numeric: true,
    sensitivity: "base",
  });
};

// --- THEME COLORS ---
const COLORS = {
  primary: "blue-600",
  primaryDark: "blue-800",
  secondary: "red-600",
  secondaryDark: "red-800",
  bgDark: "slate-950",
  sidebarItemActive: "bg-gradient-to-r from-blue-600 to-red-600",
};

// --- AUTH COMPONENTS ---

const LoginPage = ({ onLogin }: { onLogin: (remember: boolean) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulated login check
    setTimeout(() => {
      if (username === "OneDev" && password === "12345") {
        onLogin(rememberMe);
      } else {
        setError("Username atau Password salah!");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-100 p-4 lg:p-8 items-center justify-center">
      <div className="w-full max-w-[1100px] h-auto min-h-[600px] max-h-[90vh] flex bg-white rounded-[32px] overflow-hidden shadow-2xl border border-slate-100">
        {/* Left Side: Login Form */}
        <div className="w-full lg:w-[45%] flex flex-col justify-between px-8 py-8 lg:px-16 lg:py-10 bg-white relative z-10 overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-6 lg:mb-12">
              <div className="relative">
                <img
                  src="/assets/logo%20giat%20remove%20bg.png"
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                ATK<span className="text-[#E53935]">GIAT</span>
              </span>
            </div>

            <div className="max-w-md mt-8">
              <h1 className="text-3xl lg:text-[2.5rem] font-bold text-slate-900 mb-2 tracking-tight leading-tight">
                Selamat Datang di
                <br />
                ATK <span className="text-[#E53935]">GIAT</span>
              </h1>
              <p className="text-sm text-slate-500 mb-8">
                Sistem Inventaris dan Transaksi Barang Kantor
              </p>

              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-semibold animate-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#E53935] transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-[10px] focus:ring-4 focus:ring-red-500/10 focus:border-[#E53935] outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                      placeholder="Username / Email"
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#E53935] transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-[10px] focus:ring-4 focus:ring-red-500/10 focus:border-[#E53935] outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <div className="w-4 h-4 border border-slate-300 rounded peer-checked:bg-[#E53935] peer-checked:border-[#E53935] transition-colors flex items-center justify-center group-hover:border-red-400">
                        {rememberMe && (
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-slate-700">Ingat saya</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsResetOpen(true)}
                    className="text-xs font-semibold text-[#E53935] hover:text-red-700 transition-colors"
                  >
                    Lupa Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#E53935] text-white py-3.5 rounded-[10px] font-semibold text-sm hover:bg-[#D32F2F] transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-2 active:scale-[0.99] shadow-md shadow-red-600/20"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Masuk ke Dashboard"
                  )}
                  {!isLoading && <ChevronRight size={18} />}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50 space-y-4">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck size={14} className="text-slate-400" />
              <span>Aman dan terenkripsi. Data Anda terlindungi.</span>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              &copy; {new Date().getFullYear()} ATK GIAT. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Side: Illustration */}
        <div className="hidden lg:block flex-1 relative bg-slate-50">
          <img
            src="/assets/halaman_login.png"
            alt="Warehouse Management"
            className="absolute inset-0 w-full h-full object-cover object-left"
          />
        </div>
      </div>

      {isResetOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Reset Password
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Hubungi admin untuk reset password atau ganti kredensial pada
              sistem.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsResetOpen(false)}
                className="px-4 py-2 bg-[#E53935] text-white rounded-lg text-sm font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTS ---

const navigationItems = [
  { label: "Dashboard", shortLabel: "Home", path: "/", icon: LayoutDashboard },
  { label: "Stock Barang", shortLabel: "Stok", path: "/master", icon: Package },
  { label: "Transaksi Stok", shortLabel: "Mutasi", path: "/transaksi", icon: ArrowLeftRight },
  { label: "Riwayat", shortLabel: "Riwayat", path: "/logs", icon: History },
];

const Sidebar = ({
  isOpen,
  toggle,
  onLogoutClick,
}: {
  isOpen: boolean;
  toggle: () => void;
  onLogoutClick: () => void;
}) => {
  const location = useLocation();
  const menuItems = navigationItems;

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/50 z-20 lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={toggle}
      ></div>
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 z-30 transition-transform duration-300 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="h-24 flex items-center px-8 border-b border-slate-50 relative">
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo%20giat%20remove%20bg.png"
              alt="Logo GIAT"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-[18px] font-black tracking-tight text-slate-800 leading-none">
                ATK<span className="text-[#E53935]">GIAT</span>
              </h1>
            </div>
          </div>
          <button
            onClick={toggle}
            className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && toggle()}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-[12px] font-semibold text-[13px] transition-all duration-200 group ${isActive ? "bg-[#FCE8E8] text-[#E53935]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
              >
                <item.icon
                  size={20}
                  className={`transition-colors ${isActive ? "text-[#E53935]" : "text-slate-400 group-hover:text-slate-600"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onLogoutClick}
            className="flex items-center gap-4 px-4 py-3.5 w-full rounded-[12px] text-slate-500 font-semibold text-[13px] hover:bg-white hover:text-slate-700 transition-all hover:shadow-sm"
          >
            <LogOut size={20} className="text-slate-400" /> Keluar Akun
          </button>
        </div>
      </aside>
    </>
  );
};

const BottomNavigation = () => {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-12px_30px_-20px_rgba(15,23,42,0.45)]">
      <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 text-[10px] font-bold transition-all ${isActive ? "bg-[#FCE8E8] text-[#E53935]" : "text-slate-400 active:bg-slate-100"}`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.8 : 2.2} />
              <span>{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
  confirmText = "Hapus",
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
  confirmText?: string;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-sm:max-w-xs max-w-sm p-8 shadow-2xl animate-in zoom-in duration-300 border-t-8 border-red-600">
        <div className="flex flex-col items-center text-center">
          <div className="p-4 bg-red-50 text-red-600 rounded-full mb-4">
            <AlertCircle size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">
            {title}
          </h3>
          <p className="text-slate-500 text-sm font-medium mb-8">{message}</p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-slate-100 rounded-xl text-slate-400 font-bold hover:bg-slate-50 transition-colors uppercase text-xs disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-bold uppercase text-xs"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PAGES ---

const TopHeader = ({
  onRefresh,
  showBack = false,
  searchValue = "",
  onSearchChange,
  onLogoutClick,
}: {
  onRefresh?: () => void;
  showBack?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onLogoutClick?: () => void;
}) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-5 pt-5">
      <div className="flex items-center gap-4 w-full lg:w-[400px]">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-[12px] bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {onRefresh && !showBack && (
          <button
            onClick={onRefresh}
            className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-[12px] bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors shrink-0"
          >
            <RefreshCw size={18} />
          </button>
        )}
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Cari..."
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-[12px] text-[13px] font-medium focus:border-slate-300 focus:ring-1 focus:ring-slate-200 outline-none transition-all text-slate-700 bg-white placeholder:text-slate-400"
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-4 w-full md:w-auto">
        <div
          className="relative flex items-center gap-3 cursor-pointer group"
          onClick={() => setIsProfileOpen((prev) => !prev)}
        >
          <div className="w-9 h-9 rounded-full bg-[#FCE8E8] text-[#E53935] font-bold flex items-center justify-center text-[13px] shrink-0">
            AD
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[13px] font-bold text-slate-900 leading-none">
              Admin
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-1">
              Administrator
            </p>
          </div>
          <ChevronDown
            size={16}
            className="text-slate-400 group-hover:text-slate-600 ml-2"
          />

          {isProfileOpen && (
            <div className="absolute right-0 top-12 w-44 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20">
              <button
                type="button"
                onClick={onLogoutClick}
                className="w-full text-left px-4 py-2.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({
  master,
  logs,
  selectedDate,
  rangeFilter,
  onSelectedDateChange,
  onRangeFilterChange,
  searchQuery,
  onSearchChange,
  onLogoutClick,
}: {
  master: MasterBarang[];
  logs: LogTransaksi[];
  selectedDate: string;
  rangeFilter: "Hari" | "Minggu" | "Bulan" | "Tahun" | "Semua";
  onSelectedDateChange: (value: string) => void;
  onRangeFilterChange: (
    value: "Hari" | "Minggu" | "Bulan" | "Tahun" | "Semua",
  ) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onLogoutClick: () => void;
}) => {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredMaster = normalizedQuery
    ? master.filter(
        (item) =>
          item.NamaBarang.toLowerCase().includes(normalizedQuery) ||
          item.IDBarang.toString().toLowerCase().includes(normalizedQuery),
      )
    : master;
  const filteredLogs = normalizedQuery
    ? logs.filter(
        (log) =>
          log.NamaBarang.toLowerCase().includes(normalizedQuery) ||
          log.IDTransaksi.toString().toLowerCase().includes(normalizedQuery) ||
          (log.Catatan || "").toLowerCase().includes(normalizedQuery),
      )
    : logs;

  type RangeFilter = "Hari" | "Minggu" | "Bulan" | "Tahun" | "Semua";
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const parseLocalDate = (value: string) => {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  const formattedDate = parseLocalDate(selectedDate).toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );

  const getRangeBounds = (baseDate: Date, range: RangeFilter) => {
    if (range === "Semua") return null;
    const start = new Date(baseDate);
    const end = new Date(baseDate);
    if (range === "Hari") {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    if (range === "Minggu") {
      const day = start.getDay();
      const diff = (day + 6) % 7;
      start.setDate(start.getDate() - diff);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    if (range === "Bulan") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(start.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(11, 31);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const rangeBounds = getRangeBounds(parseLocalDate(selectedDate), rangeFilter);
  const dateFilteredMaster = rangeBounds
    ? filteredMaster.filter((item) => {
        const time = new Date(item.UpdateTerakhir).getTime();
        if (Number.isNaN(time)) return false;
        return (
          time >= rangeBounds.start.getTime() &&
          time <= rangeBounds.end.getTime()
        );
      })
    : filteredMaster;
  const dateFilteredLogs = rangeBounds
    ? filteredLogs.filter((log) => {
        const time = new Date(log.Waktu).getTime();
        if (Number.isNaN(time)) return false;
        return (
          time >= rangeBounds.start.getTime() &&
          time <= rangeBounds.end.getTime()
        );
      })
    : filteredLogs;

  const chartFilteredMaster = rangeBounds
    ? filteredMaster.filter((item) => {
        const time = new Date(item.UpdateTerakhir).getTime();
        if (Number.isNaN(time)) return false;
        return (
          time >= rangeBounds.start.getTime() &&
          time <= rangeBounds.end.getTime()
        );
      })
    : filteredMaster;
  const chartFilteredLogs = rangeBounds
    ? filteredLogs.filter((log) => {
        const time = new Date(log.Waktu).getTime();
        if (Number.isNaN(time)) return false;
        return (
          time >= rangeBounds.start.getTime() &&
          time <= rangeBounds.end.getTime()
        );
      })
    : filteredLogs;

  const lowStockItems = dateFilteredMaster.filter(
    (item) => item.StokSaatIni <= item.MinimumStok,
  );
  const chartLowStockItems = chartFilteredMaster.filter(
    (item) => item.StokSaatIni <= item.MinimumStok,
  );
  const totalValue = dateFilteredMaster.length;
  const rangeLabel = formattedDate;

  // ── Kalkulasi stat nyata ──────────────────────────────────
  // Total mutasi masuk & keluar periode ini
  const totalMasuk = dateFilteredLogs
    .filter(l => l.Tipe.toLowerCase() === 'masuk')
    .reduce((acc, curr) => acc + Number(curr.Jumlah), 0);
  const totalKeluar = dateFilteredLogs
    .filter(l => l.Tipe.toLowerCase() === 'keluar')
    .reduce((acc, curr) => acc + Number(curr.Jumlah), 0);

  // Hitung periode sebelumnya untuk perbandingan
  const getPrevBounds = (base: Date, range: RangeFilter) => {
    if (range === 'Semua') return null;
    const prev = new Date(base);
    if (range === 'Hari')   prev.setDate(prev.getDate() - 1);
    if (range === 'Minggu') prev.setDate(prev.getDate() - 7);
    if (range === 'Bulan')  prev.setMonth(prev.getMonth() - 1);
    if (range === 'Tahun')  prev.setFullYear(prev.getFullYear() - 1);
    return getRangeBounds(prev, range);
  };
  const prevBounds = getPrevBounds(parseLocalDate(selectedDate), rangeFilter);
  const prevLogs = prevBounds
    ? logs.filter(l => {
        const t = new Date(l.Waktu).getTime();
        return t >= prevBounds.start.getTime() && t <= prevBounds.end.getTime();
      })
    : [];
  const prevMasuk  = prevLogs.filter(l => l.Tipe.toLowerCase() === 'masuk').reduce((a, c) => a + Number(c.Jumlah), 0);
  const prevKeluar = prevLogs.filter(l => l.Tipe.toLowerCase() === 'keluar').reduce((a, c) => a + Number(c.Jumlah), 0);

  const calcPct = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? '+100%' : '0%';
    const pct = Math.round(((curr - prev) / prev) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  };
  const masukPct  = calcPct(totalMasuk, prevMasuk);
  const keluarPct = calcPct(totalKeluar, prevKeluar);
  const masukTrend  = totalMasuk  >= prevMasuk;
  const keluarTrend = totalKeluar >= prevKeluar;

  const categoryChartData = useMemo(() => {
    const targetCategories = ["Alat Tulis", "Kertas", "Arsip"];
    const counts: Record<string, number> = {
      "Alat Tulis": 0,
      Kertas: 0,
      Arsip: 0,
      Lainnya: 0,
    };

    // Mapping berdasarkan nama barang karena semua kategori di DB = 'ATK'
    const kertasKeywords = ['kertas', 'hvs', 'folio', 'buram', 'photo paper', 'kop surat', 'kop', 'looself'];
    const arsipKeywords = ['map', 'amplop', 'binder', 'clear holder', 'business file', 'bantex', 'box file', 'card case'];
    const alatTulisKeywords = ['pulpen', 'pensil', 'spidol', 'stabilo', 'tipex', 'tipe x', 'rautan', 'penghapus', 'drawing pen', 'balliner', 'bolliner', 'snowman', 'pilot', 'sarasa', 'joyko', 'kokoro', 'faster'];

    chartFilteredMaster.forEach((item) => {
      const name = (item.NamaBarang || '').toLowerCase();
      const cat = (item.Kategori || '').toLowerCase();

      if (cat !== 'atk' && targetCategories.some(tc => cat.includes(tc.toLowerCase()))) {
        const matched = targetCategories.find(tc => cat.toLowerCase().includes(tc.toLowerCase()));
        if (matched) { counts[matched] += 1; return; }
      }

      if (kertasKeywords.some(k => name.includes(k))) {
        counts['Kertas'] += 1;
      } else if (arsipKeywords.some(k => name.includes(k))) {
        counts['Arsip'] += 1;
      } else if (alatTulisKeywords.some(k => name.includes(k))) {
        counts['Alat Tulis'] += 1;
      } else {
        counts['Lainnya'] += 1;
      }
    });

    return Object.entries(counts)
      .map(([name, total]) => ({ name, total }))
      .filter((item) => item.total > 0 || targetCategories.includes(item.name))
      .sort((a, b) => b.total - a.total);
  }, [chartFilteredMaster]);

  const criticalChartData = useMemo(() => {
    return chartLowStockItems.slice(0, 5).map((item) => ({
      name:
        item.NamaBarang.length > 18
          ? item.NamaBarang.substring(0, 18) + "..."
          : item.NamaBarang,
      fullTitle: item.NamaBarang,
      current: item.StokSaatIni,
      min: item.MinimumStok,
    }));
  }, [chartLowStockItems]);

  return (
    <div className="w-full font-sans pb-10 sm:px-4 lg:px-8 bg-[#FAF9F9]">
      <TopHeader
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        onLogoutClick={onLogoutClick}
      />

      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[2rem] font-bold text-slate-900 tracking-tight leading-none mb-2">
            Ringkasan Gudang
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#E53935]"></div>
            <p className="text-[13px] font-medium text-slate-500">
              Dashboard real-time
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsDatePickerOpen((prev) => !prev)}
            className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Calendar size={16} className="text-slate-500" />
            <span>{rangeLabel}</span>
            <ChevronDown size={14} className="text-slate-400 ml-2" />
          </button>
          {isDatePickerOpen && (
            <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 bg-white border border-slate-200 rounded-xl p-4 shadow-lg z-20 w-[240px] max-w-[calc(100vw-2rem)]">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Tanggal
              </p>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  onSelectedDateChange(e.target.value);
                  setIsDatePickerOpen(false);
                }}
                className="w-full text-[12px] font-semibold text-slate-700 border border-slate-200 rounded-lg px-2 py-1.5"
              />
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[20px] shadow-[0_4px_10px_-4px_rgba(0,0,0,0.03)] border border-slate-100 relative">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-[#FCE8E8] text-[#991B1B] rounded-[12px]">
              <Package size={20} />
            </div>
            <span className="text-[10px] font-bold text-[#991B1B] bg-white border border-[#FCE8E8] px-2.5 py-1 rounded-full">
              {rangeFilter === 'Semua' ? 'Semua Data' : rangeLabel}
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Total Varian
          </p>
          <h3 className="text-[2rem] font-bold text-slate-900 leading-none mb-3">
            {totalValue}
          </h3>
          <p className="text-[12px] text-slate-500 font-medium">
            Katalog Aktif
          </p>
        </div>

        <div className="bg-white p-6 rounded-[20px] shadow-[0_4px_10px_-4px_rgba(0,0,0,0.03)] border border-red-50 relative">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-[#FCE8E8] text-[#991B1B] rounded-[12px]">
              <AlertTriangle size={20} />
            </div>
            <span className="text-[10px] font-bold text-[#991B1B] bg-[#FCE8E8] px-2.5 py-1 rounded-full">
              Update hari ini
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Stok Kritis
          </p>
          <h3 className="text-[2rem] font-bold text-[#991B1B] leading-none mb-3">
            {lowStockItems.length}
          </h3>
          <p className="text-[12px] text-[#991B1B] font-medium">Butuh Atensi</p>
        </div>

        <div className="bg-white p-6 rounded-[20px] shadow-[0_4px_10px_-4px_rgba(0,0,0,0.03)] border border-slate-100 relative">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-[#E0E7FF] text-[#3730A3] rounded-[12px]">
              <ArrowUpCircle size={20} />
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${masukTrend ? 'text-[#3730A3] bg-[#E0E7FF]' : 'text-[#991B1B] bg-[#FCE8E8]'}`}>
              {rangeFilter === 'Semua' ? 'Semua Data' : masukPct + ' vs lalu'}
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Mutasi Masuk
          </p>
          <h3 className="text-[2rem] font-bold text-slate-900 leading-none mb-3">
            {dateFilteredLogs
              .filter((l) => l.Tipe === "Masuk")
              .reduce((acc, curr) => acc + Number(curr.Jumlah), 0)
              .toLocaleString()}
          </h3>
          <p className="text-[12px] text-slate-500 font-medium">{rangeLabel}</p>
        </div>

        <div className="bg-white p-6 rounded-[20px] shadow-[0_4px_10px_-4px_rgba(0,0,0,0.03)] border border-slate-100 relative">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-[#F1F5F9] text-slate-500 rounded-[12px]">
              <ArrowDownCircle size={20} />
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${!keluarTrend ? 'text-[#3730A3] bg-[#E0E7FF]' : 'text-slate-500 bg-[#F1F5F9]'}`}>
              {rangeFilter === 'Semua' ? 'Semua Data' : keluarPct + ' vs lalu'}
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Mutasi Keluar
          </p>
          <h3 className="text-[2rem] font-bold text-slate-900 leading-none mb-3">
            {dateFilteredLogs
              .filter((l) => l.Tipe === "Keluar")
              .reduce((acc, curr) => acc + Number(curr.Jumlah), 0)
              .toLocaleString()}
          </h3>
          <p className="text-[12px] text-slate-500 font-medium">{rangeLabel}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Chart */}
        <div className="bg-white p-6 lg:p-8 rounded-[20px] shadow-[0_4px_10px_-4px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FCE8E8] text-[#991B1B] rounded-[8px]">
                <BarChart2 size={16} />
              </div>
              <h3 className="font-bold text-slate-900 text-[1.1rem] leading-tight">
                Distribusi Katalog
                <br />
                Barang
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Info size={16} className="text-slate-300" />
              <div className="relative">
                <select
                  value={rangeFilter}
                  onChange={(e) =>
                    onRangeFilterChange(e.target.value as RangeFilter)
                  }
                  className="appearance-none pr-8 pl-3 py-1.5 border border-slate-200 rounded-[8px] text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
                >
                  {(
                    [
                      "Hari",
                      "Minggu",
                      "Bulan",
                      "Tahun",
                      "Semua",
                    ] as RangeFilter[]
                  ).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div className="h-[250px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  axisLine={true}
                  stroke="#e2e8f0"
                  tickLine={false}
                  tick={{ fill: "#64748b", fontWeight: 500 }}
                  dy={12}
                />
                <YAxis
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8" }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "none",
                    boxShadow: "0 4px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value) => [value, "Jumlah Produk"]}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={32}>
                  {categoryChartData.map((entry, index) => {
                    const isMax =
                      entry.total ===
                      Math.max(...categoryChartData.map((d) => d.total));
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isMax ? "#991B1B" : "#EADFE0"}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 bg-[#F8FAFC] rounded-[12px] p-4 flex gap-3 items-center">
            <div className="text-[#3366FF] shrink-0">
              <Info size={18} />
            </div>
            <p className="text-[11px] text-[#3366FF] font-medium leading-relaxed">
              Informasi jumlah varian produk per kategori utama yang terdaftar
              dalam katalog.
            </p>
          </div>
        </div>

        {/* Right Chart */}
        <div className="bg-white p-6 lg:p-8 rounded-[20px] shadow-[0_4px_10px_-4px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FCE8E8] text-[#991B1B] rounded-[8px]">
                <TrendingUp size={16} />
              </div>
              <h3 className="font-bold text-slate-900 text-[1.1rem]">
                Analisis Stok Kritis
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Info size={16} className="text-slate-300" />
              <div className="relative">
                <select
                  value={rangeFilter}
                  onChange={(e) =>
                    onRangeFilterChange(e.target.value as RangeFilter)
                  }
                  className="appearance-none pr-8 pl-3 py-1.5 border border-slate-200 rounded-[8px] text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
                >
                  {(
                    [
                      "Hari",
                      "Minggu",
                      "Bulan",
                      "Tahun",
                      "Semua",
                    ] as RangeFilter[]
                  ).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div className="h-full w-full flex-1">
            <div className="flex flex-col justify-between h-full space-y-6">
              {criticalChartData.map((item, index) => {
                const minVal = item.min > 0 ? item.min : 1;
                const percentage = Math.min(
                  (item.current / (minVal * 2)) * 100,
                  100,
                );
                const minPercentage = Math.min(
                  (minVal / (minVal * 2)) * 100,
                  100,
                );
                const isExactlyMinimum =
                  item.current >= item.min && item.current !== 0;
                const barColor = isExactlyMinimum ? "#2563EB" : "#991B1B";
                const textColor = isExactlyMinimum ? "#2563EB" : "#991B1B";

                return (
                  <div key={index} className="w-full">
                    <div className="flex justify-between text-[11px] font-semibold mb-2">
                      <span className="text-slate-700">{item.name}</span>
                      <span>
                        <span style={{ color: textColor }}>{item.current}</span>{" "}
                        <span className="text-slate-400">/ {item.min}</span>
                      </span>
                    </div>
                    <div className="w-full h-[12px] bg-slate-50 rounded-full overflow-hidden relative border border-slate-100">
                      <div
                        className="absolute top-0 left-0 h-full bg-slate-200 rounded-full transition-all"
                        style={{ width: `${minPercentage}%` }}
                      ></div>
                      <div
                        className="absolute top-0 left-0 h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: barColor,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {criticalChartData.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-medium">
                  Tidak ada stok kritis saat ini.
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#991B1B]"></div>
              <span className="text-[11px] font-bold text-slate-600">
                Stok Fisik
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-200"></div>
              <span className="text-[11px] font-bold text-slate-600">
                Minimum
              </span>
            </div>
          </div>

          <div className="mt-6 bg-[#FCE8E8] rounded-[12px] p-4 flex gap-3 items-center border border-red-50">
            <AlertTriangle size={18} className="text-[#991B1B] shrink-0" />
            <p className="text-[11px] text-[#991B1B] font-bold">
              {lowStockItems.length} barang berada di bawah batas minimum
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MasterStok = ({
  data,
  onRefresh,
  searchQuery,
  onSearchChange,
  onLogoutClick,
  showToast,
}: {
  data: MasterBarang[];
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onLogoutClick: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning') => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterBarang | null>(null);
  const [deletingItem, setDeletingItem] = useState<MasterBarang | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const sortedData = useMemo(() => {
    return data
      .filter(
        (item) =>
          item.NamaBarang.toLowerCase().includes(normalizedQuery) ||
          item.IDBarang.toString().toLowerCase().includes(normalizedQuery),
      )
      .sort(numericSort);
  }, [data, normalizedQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, sortedData.length);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const generatePaginationNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }
    return pages;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const idBarang = editingItem
      ? editingItem.IDBarang
      : formData.get("idBarang");

    const payload = {
      idBarang: idBarang,
      namaBarang: formData.get("namaBarang"),
      kategori: formData.get("kategori"),
      stokSaatIni: Number(formData.get("stokSaatIni")),
      minimumStok: Number(formData.get("minimumStok")),
      satuan: formData.get("satuan"),
    };

    const result = editingItem
      ? await sheetService.updateBarang(payload)
      : await sheetService.addBarang(payload);

    if (!result || result.success === false) {
      setIsLoading(false);
      setFormError(result?.error || "Gagal menyimpan perubahan.");
      showToast(result?.error || "Gagal menyimpan perubahan.", "error");
      return;
    }

    setIsLoading(false);
    setIsModalOpen(false);
    setEditingItem(null);
    showToast(editingItem ? "Barang berhasil diperbarui." : "Barang baru berhasil ditambahkan.");
    onRefresh();
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsLoading(true);
    const result = await sheetService.deleteBarang(deletingItem.IDBarang);
    setIsLoading(false);
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
    if (result.success) {
      showToast(`Barang "${deletingItem.NamaBarang}" berhasil dihapus.`);
      onRefresh();
    } else {
      showToast("Gagal menghapus barang.", "error");
    }
  };

  // Stat Card Calculations
  const totalProduk = data.length;
  const totalStok = data.reduce((acc, curr) => acc + curr.StokSaatIni, 0);
  const stokKritis = data.filter(
    (item) => item.StokSaatIni <= item.MinimumStok,
  ).length;
  const barangBaru = data.filter((item) => {
    // fallback 30 days check based on UpdateTerakhir if Date is valid
    const updateDate = new Date(item.UpdateTerakhir).getTime();
    const isWithin30Days = Date.now() - updateDate <= 30 * 24 * 60 * 60 * 1000;
    return isWithin30Days;
  }).length;

  return (
    <div className="w-full font-sans pb-10 sm:px-4 lg:px-8 bg-[#FAF9F9]">
      <TopHeader
        onRefresh={onRefresh}
        searchValue={searchQuery}
        onSearchChange={(value) => {
          onSearchChange(value);
          setCurrentPage(1);
        }}
        onLogoutClick={onLogoutClick}
      />

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-[14px]">
            <Layers size={28} />
          </div>
          <div>
            <h2 className="text-[2rem] font-bold text-[#1E293B] tracking-tight leading-none mb-2">
              Database Stok
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#E53935]"></div>
              <p className="text-[13px] font-medium text-slate-500">
                Katalog barang aktif
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormError("");
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#E53935] text-white px-5 py-2.5 rounded-[10px] font-semibold text-[13px] hover:bg-red-700 transition-all shadow-sm active:scale-95 w-full md:w-auto justify-center"
        >
          <Plus size={16} />
          Barang Baru
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Produk */}
        <div className="bg-white p-6 rounded-[20px] shadow-[0_4px_10px_-4px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center gap-5">
          <div className="p-4 bg-orange-50 text-orange-500 rounded-[14px]">
            <Box size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Total Produk
            </p>
            <h3 className="text-2xl font-bold text-slate-800 leading-none mb-1">
              {totalProduk}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Barang Aktif
            </p>
          </div>
        </div>
        {/* Total Stok */}
        <div className="bg-white p-6 rounded-[20px] shadow-[0_4px_10px_-4px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center gap-5">
          <div className="p-4 bg-red-50 text-red-500 rounded-[14px]">
            <List size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Total Stok
            </p>
            <h3 className="text-2xl font-bold text-slate-800 leading-none mb-1">
              {totalStok.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Total Seluruh Stok
            </p>
          </div>
        </div>
        {/* Stok Kritis */}
        <div className="bg-white p-6 rounded-[20px] shadow-[0_4px_10px_-4px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-[14px]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Stok Kritis
            </p>
            <h3 className="text-2xl font-bold text-slate-800 leading-none mb-1">
              {stokKritis}
            </h3>
            <p className="text-[11px] text-[#E53935] font-medium">
              Butuh Perhatian
            </p>
          </div>
        </div>
        {/* Barang Baru */}
        <div className="bg-white p-6 rounded-[20px] shadow-[0_4px_10px_-4px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center gap-5">
          <div className="p-4 bg-pink-50 text-pink-500 rounded-[14px]">
            <Clipboard size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Barang Baru
            </p>
            <h3 className="text-2xl font-bold text-slate-800 leading-none mb-1">
              {barangBaru}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              30 Hari Terakhir
            </p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[20px] shadow-[0_4px_10px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-100">
              <tr>
                <th className="px-3 py-4 md:px-6 md:py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  ID Barang
                </th>
                <th className="px-3 py-4 md:px-6 md:py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Nama Produk
                </th>
                <th className="px-3 py-4 md:px-6 md:py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-3 py-4 md:px-6 md:py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  Stok Fisik
                </th>
                <th className="px-3 py-4 md:px-6 md:py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  Min. Stok
                </th>
                <th className="px-3 py-4 md:px-6 md:py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="px-3 py-4 md:px-6 md:py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map((item) => {
                const isCritical = item.StokSaatIni <= item.MinimumStok;
                return (
                  <tr
                    key={item.IDBarang}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-3 py-4 md:px-6 md:py-5">
                      <span className="text-[13px] font-bold text-blue-500">
                        #{item.IDBarang}
                      </span>
                    </td>
                    <td className="px-3 py-4 md:px-6 md:py-5">
                      <p className="text-[14px] font-bold text-slate-800 leading-tight">
                        {item.NamaBarang}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400 mt-1">
                        Update:{" "}
                        {new Date(item.UpdateTerakhir).toLocaleDateString(
                          "id-ID",
                        )}
                      </p>
                    </td>
                    <td className="px-3 py-4 md:px-6 md:py-5">
                      <span className="inline-flex items-center justify-center px-3 py-1 bg-[#F1F5F9] text-slate-500 rounded-[6px] text-[11px] font-bold uppercase tracking-wide">
                        {item.Kategori}
                      </span>
                    </td>
                    <td className="px-3 py-4 md:px-6 md:py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span
                          className={`text-[18px] font-bold leading-none mb-1 ${isCritical ? "text-[#E53935]" : "text-[#1E293B]"}`}
                        >
                          {item.StokSaatIni.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {item.Satuan}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 md:px-6 md:py-5 text-center">
                      <span className="text-[14px] font-bold text-slate-600">
                        {item.MinimumStok}
                      </span>
                    </td>
                    <td className="px-3 py-4 md:px-6 md:py-5 text-center">
                      {isCritical ? (
                        <span className="inline-flex items-center justify-center px-3 py-1 bg-red-50 text-[#E53935] rounded-full text-[11px] font-bold">
                          Kritis
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-3 py-1 bg-green-50 text-green-600 rounded-full text-[11px] font-bold">
                          Aman
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-4 md:px-6 md:py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setFormError("");
                            setIsModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-full border border-blue-200 text-blue-500 flex items-center justify-center hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingItem(item);
                            setIsDeleteModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-full border border-red-200 text-[#E53935] flex items-center justify-center hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedData.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-400 text-sm font-medium"
                  >
                    Tidak ada data produk yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {sortedData.length > 0 && (
          <div className="px-6 py-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <p className="text-[12px] font-medium text-slate-500">
              Menampilkan {startIndex + 1} – {endIndex} dari {sortedData.length}{" "}
              barang
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-[8px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {generatePaginationNumbers().map((pageNum, idx) =>
                pageNum === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => setCurrentPage(pageNum as number)}
                    className={`w-9 h-9 flex items-center justify-center rounded-[8px] text-[13px] font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-[#E53935] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                ),
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-[8px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-red-50 text-[#E53935] rounded-xl">
                  {editingItem ? <Edit2 size={20} /> : <Plus size={20} />}
                </div>
                {editingItem ? "Edit Produk" : "Barang Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[12px] font-semibold">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    ID Katalog
                  </label>
                  <input
                    name="idBarang"
                    defaultValue={editingItem?.IDBarang}
                    required
                    readOnly={!!editingItem}
                    className={`w-full px-4 py-3 border border-slate-200 rounded-[12px] focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935] outline-none transition-all text-[13px] font-medium text-slate-700 ${editingItem ? "bg-slate-50 cursor-not-allowed" : "bg-white"}`}
                    placeholder="Contoh: 1"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Kategori
                  </label>
                  <input
                    name="kategori"
                    defaultValue={editingItem?.Kategori}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-[12px] focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935] outline-none transition-all text-[13px] font-medium text-slate-700 bg-white"
                    placeholder="ATK / Kertas"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Nama Produk
                </label>
                <input
                  name="namaBarang"
                  defaultValue={editingItem?.NamaBarang}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-[12px] focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935] outline-none transition-all text-[13px] font-medium text-slate-700 bg-white"
                  placeholder="Masukkan nama barang..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    name="stokSaatIni"
                    defaultValue={editingItem?.StokSaatIni || 0}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-[12px] focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935] outline-none transition-all text-[13px] font-medium text-slate-700 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Min. Stok
                  </label>
                  <input
                    type="number"
                    name="minimumStok"
                    defaultValue={editingItem?.MinimumStok || 0}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-[12px] focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935] outline-none transition-all text-[13px] font-medium text-slate-700 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Satuan
                  </label>
                  <input
                    name="satuan"
                    defaultValue={editingItem?.Satuan}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-[12px] focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935] outline-none transition-all text-[13px] font-medium text-slate-700 bg-white"
                    placeholder="Pcs/Rim"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-6 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-[12px] text-slate-600 font-semibold text-[13px] hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-[#E53935] text-white rounded-[12px] font-semibold text-[13px] hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Box size={16} />
                  )}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
        title="Hapus Barang?"
        message={`Barang "${deletingItem?.NamaBarang}" akan dihapus permanen dari sistem.`}
      />
    </div>
  );
};

const TransaksiStok = ({
  master,
  onRefresh,
  searchQuery,
  onSearchChange,
  onLogoutClick,
  showToast,
}: {
  master: MasterBarang[];
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onLogoutClick: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning') => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tipeMutasi, setTipeMutasi] = useState<"Masuk" | "Keluar" | "">("");
  const [catatan, setCatatan] = useState("");

  // Mengurutkan master barang untuk dropdown
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const sortedMaster = useMemo(() => {
    const base = [...master].sort(numericSort);
    if (!normalizedQuery) return base;
    return base.filter(
      (item) =>
        item.NamaBarang.toLowerCase().includes(normalizedQuery) ||
        item.IDBarang.toString().toLowerCase().includes(normalizedQuery),
    );
  }, [master, normalizedQuery]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tipeMutasi) {
      showToast("Pilih tipe mutasi terlebih dahulu!", "warning");
      return;
    }
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const idBarang = formData.get("idBarang");
    const item = master.find(
      (m) => m.IDBarang.toString() === idBarang?.toString(),
    );
    const jumlah = Number(formData.get("jumlah"));

    // Validasi stok tidak bisa minus
    if (tipeMutasi === "Keluar" && item && jumlah > item.StokSaatIni) {
      showToast(
        `Stok tidak cukup! Stok "${item.NamaBarang}" saat ini hanya ${item.StokSaatIni} ${item.Satuan}.`,
        "error"
      );
      setIsLoading(false);
      return;
    }

    const payload = {
      idTransaksi: `T${Date.now()}`,
      idBarang: idBarang,
      namaBarang: item?.NamaBarang || "",
      tipe: tipeMutasi,
      jumlah,
      catatan: catatan,
    };
    const result = await sheetService.addLog(payload);
    setIsLoading(false);
    if (result?.success === false) {
      showToast(result?.error || "Transaksi gagal disimpan.", "error");
      return;
    }
    (e.target as HTMLFormElement).reset();
    setTipeMutasi("");
    setCatatan("");
    showToast("Transaksi berhasil disimpan!");
    onRefresh();
  };

  return (
    <div className="w-full font-sans pb-10 sm:px-4 lg:px-8 bg-[#FAF9F9]">
      <TopHeader
        showBack={true}
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        onLogoutClick={onLogoutClick}
      />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-[#FCE8E8] text-[#E53935] flex items-center justify-center shrink-0">
            <ArrowLeftRight size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Mutasi Persediaan
            </h2>
            <p className="text-[13px] text-slate-500 font-medium">
              Input pergerakan barang masuk dan keluar.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white p-5 sm:p-8 lg:p-10 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Pilih Produk */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                Pilih Produk
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#E53935]">
                  <Search size={18} />
                </div>
                <select
                  name="idBarang"
                  required
                  className="w-full pl-11 pr-11 py-3.5 border border-slate-200 rounded-[12px] bg-white outline-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935] transition-all text-[14px] font-medium text-slate-700 appearance-none cursor-pointer"
                >
                  <option value="">-- Cari Nama Barang --</option>
                  {sortedMaster.map((item) => (
                    <option key={item.IDBarang} value={item.IDBarang}>
                      #{item.IDBarang} - {item.NamaBarang} (Stok:{" "}
                      {item.StokSaatIni} {item.Satuan})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown size={18} />
                </div>
              </div>
              <p className="text-[11px] font-medium text-slate-400 mt-2">
                Pilih barang yang akan dimutasi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tipe Mutasi */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                  Tipe Mutasi
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`relative flex items-center p-4 border rounded-[12px] cursor-pointer transition-all group ${tipeMutasi === "Masuk" ? "border-[#E53935] bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                  >
                    <input
                      type="radio"
                      name="tipe_dummy"
                      value="Masuk"
                      checked={tipeMutasi === "Masuk"}
                      onChange={() => setTipeMutasi("Masuk")}
                      className="sr-only"
                    />
                    <div
                      className={`mr-3 transition-colors ${tipeMutasi === "Masuk" ? "text-[#E53935]" : "text-slate-400 group-hover:text-slate-600"}`}
                    >
                      <ArrowDown size={20} />
                    </div>
                    <div>
                      <p
                        className={`font-bold text-[13px] uppercase tracking-wide leading-tight ${tipeMutasi === "Masuk" ? "text-[#E53935]" : "text-slate-700"}`}
                      >
                        Masuk
                      </p>
                      <p
                        className={`text-[10px] font-medium mt-0.5 ${tipeMutasi === "Masuk" ? "text-red-400" : "text-slate-400"}`}
                      >
                        Barang masuk
                      </p>
                    </div>
                  </label>

                  <label
                    className={`relative flex items-center p-4 border rounded-[12px] cursor-pointer transition-all group ${tipeMutasi === "Keluar" ? "border-[#E53935] bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                  >
                    <input
                      type="radio"
                      name="tipe_dummy"
                      value="Keluar"
                      checked={tipeMutasi === "Keluar"}
                      onChange={() => setTipeMutasi("Keluar")}
                      className="sr-only"
                    />
                    <div
                      className={`mr-3 transition-colors ${tipeMutasi === "Keluar" ? "text-[#E53935]" : "text-slate-400 group-hover:text-slate-600"}`}
                    >
                      <Upload size={20} />
                    </div>
                    <div>
                      <p
                        className={`font-bold text-[13px] uppercase tracking-wide leading-tight ${tipeMutasi === "Keluar" ? "text-[#E53935]" : "text-slate-700"}`}
                      >
                        Keluar
                      </p>
                      <p
                        className={`text-[10px] font-medium mt-0.5 ${tipeMutasi === "Keluar" ? "text-red-400" : "text-slate-400"}`}
                      >
                        Barang keluar
                      </p>
                    </div>
                  </label>
                </div>
                <p className="text-[11px] font-medium text-slate-400 mt-2">
                  Pilih jenis pergerakan barang.
                </p>
              </div>

              {/* QTY (Jumlah) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                  Qty (Jumlah)
                </label>
                <div className="relative flex">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#E53935]">
                    <Box size={18} />
                  </div>
                  <input
                    type="number"
                    name="jumlah"
                    min="1"
                    required
                    className="w-full pl-11 pr-[60px] py-3.5 border border-slate-200 rounded-l-[12px] bg-white outline-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935] transition-all text-[14px] font-bold text-slate-800"
                    placeholder="0"
                  />
                  <div className="bg-slate-100 border border-slate-200 border-l-0 rounded-r-[12px] px-4 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-slate-500">
                      PCS
                    </span>
                  </div>
                </div>
                <p className="text-[11px] font-medium text-slate-400 mt-2">
                  Masukkan jumlah barang.
                </p>
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                Keterangan / PIC (Opsional)
              </label>
              <div className="relative">
                <div className="absolute top-4 left-4 pointer-events-none text-[#E53935]">
                  <FileText size={18} />
                </div>
                <textarea
                  name="catatan"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={3}
                  maxLength={255}
                  className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-[12px] bg-white outline-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935] transition-all text-[14px] font-medium text-slate-700 resize-none"
                  placeholder="Tujuan atau asal barang, keterangan tambahan, atau PIC..."
                ></textarea>
                <div className="absolute bottom-3 right-4 text-[10px] font-semibold text-slate-400">
                  {catatan.length} / 255
                </div>
              </div>
              <p className="text-[11px] font-medium text-slate-400 mt-2">
                Berikan keterangan untuk memudahkan pelacakan transaksi.
              </p>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0F172A] text-white py-4 rounded-[12px] font-bold text-[13px] uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-70 flex items-center justify-center gap-3 mt-4 active:scale-[0.99] shadow-lg shadow-slate-900/10"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <ArrowLeftRight size={20} />
              )}
              Validasi & Simpan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const RiwayatTransaksi = ({
  logs,
  selectedDate,
  rangeFilter,
  searchQuery,
  onSearchChange,
  onLogoutClick,
}: {
  logs: LogTransaksi[];
  selectedDate: string;
  rangeFilter: "Hari" | "Minggu" | "Bulan" | "Tahun" | "Semua";
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onLogoutClick: () => void;
}) => {
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStart, filterEnd]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredLogs = useMemo(() => {
    let result = [...logs].reverse();
    if (filterStart) {
      const start = new Date(filterStart);
      start.setHours(0, 0, 0, 0);
      result = result.filter((log) => new Date(log.Waktu) >= start);
    }
    if (filterEnd) {
      const end = new Date(filterEnd);
      end.setHours(23, 59, 59, 999);
      result = result.filter((log) => new Date(log.Waktu) <= end);
    }
    if (normalizedQuery) {
      result = result.filter(
        (log) =>
          log.NamaBarang.toLowerCase().includes(normalizedQuery) ||
          log.IDTransaksi.toString().toLowerCase().includes(normalizedQuery) ||
          (log.Catatan || "").toLowerCase().includes(normalizedQuery),
      );
    }
    return result;
  }, [logs, filterStart, filterEnd, normalizedQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredLogs.length);
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  const generatePaginationNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }
    return pages;
  };

  return (
    <div className="w-full font-sans pb-10 sm:px-4 lg:px-8 bg-[#FAF9F9]">
      <TopHeader
        showBack={true}
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        onLogoutClick={onLogoutClick}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-5 pt-5">
          <div>
            <h2 className="text-[2rem] font-bold text-[#1E293B] tracking-tight leading-none mb-2">
              Jurnal Transaksi
            </h2>
            <p className="text-[13px] font-medium text-slate-500">
              Arsip digital mutasi stok barang.
            </p>
          </div>

          {/* Filter Card */}
          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-[16px] shadow-[0_4px_10px_-4px_rgba(0,0,0,0.03)] border border-slate-200 w-full xl:w-fit">
            <div className="flex items-center px-4 py-2 border border-slate-200 rounded-[12px] bg-white flex-1 min-w-[130px]">
              <Calendar size={16} className="text-slate-400 mr-2" />
              <input
                type="date"
                value={filterStart}
                onChange={(e) => setFilterStart(e.target.value)}
                className="text-[13px] font-bold text-slate-700 bg-transparent outline-none uppercase"
              />
            </div>
            <span className="text-slate-300 font-bold">-</span>
            <div className="flex items-center px-4 py-2 border border-slate-200 rounded-[12px] bg-white flex-1 min-w-[130px]">
              <Calendar size={16} className="text-slate-400 mr-2" />
              <input
                type="date"
                value={filterEnd}
                onChange={(e) => setFilterEnd(e.target.value)}
                className="text-[13px] font-bold text-slate-700 bg-transparent outline-none uppercase"
              />
            </div>
            <button
              onClick={() => {
                setFilterStart("");
                setFilterEnd("");
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-[#E53935] rounded-[12px] text-[12px] font-bold uppercase transition-colors"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-100">
                <tr>
                  <th className="px-3 py-4 md:px-8 md:py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Waktu
                  </th>
                  <th className="px-3 py-4 md:px-8 md:py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Produk
                  </th>
                  <th className="px-3 py-4 md:px-8 md:py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    Aliran
                  </th>
                  <th className="px-3 py-4 md:px-8 md:py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    Qty
                  </th>
                  <th className="px-3 py-4 md:px-8 md:py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Catatan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLogs.map((log, idx) => {
                  const logDate = new Date(log.Waktu);
                  const dateStr = logDate.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  });
                  const timeStr = logDate
                    .toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                    .replace(/:/g, ".");

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-3 py-4 md:px-8 md:py-6">
                        <p className="text-[13px] font-bold text-slate-800">
                          {dateStr}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400 mt-1">
                          {timeStr}
                        </p>
                      </td>
                      <td className="px-3 py-4 md:px-8 md:py-6">
                        <p className="text-[14px] font-bold text-slate-800 leading-tight">
                          {log.NamaBarang}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                          REF: {log.IDTransaksi}
                        </p>
                      </td>
                      <td className="px-3 py-4 md:px-8 md:py-6 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            log.Tipe === "Masuk"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-red-50 text-[#E53935]"
                          }`}
                        >
                          {log.Tipe}
                        </span>
                      </td>
                      <td className="px-3 py-4 md:px-8 md:py-6 text-center">
                        <span
                          className={`text-[16px] font-bold ${log.Tipe === "Masuk" ? "text-blue-600" : "text-[#E53935]"}`}
                        >
                          {log.Jumlah}
                        </span>
                      </td>
                      <td className="px-3 py-4 md:px-8 md:py-6">
                        <p className="text-[13px] font-medium text-slate-500 italic">
                          "{log.Catatan || "-"}"
                        </p>
                      </td>
                    </tr>
                  );
                })}
                {paginatedLogs.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-16 md:px-8 text-center text-slate-400 text-sm font-medium"
                    >
                      Tidak ada riwayat transaksi yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredLogs.length > 0 && (
            <div className="px-8 py-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
              <p className="text-[12px] font-medium text-slate-500">
                Menampilkan {startIndex + 1} – {endIndex} dari{" "}
                {filteredLogs.length} barang
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-[8px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                {generatePaginationNumbers().map((pageNum, idx) =>
                  pageNum === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${pageNum}`}
                      onClick={() => setCurrentPage(pageNum as number)}
                      className={`w-9 h-9 flex items-center justify-center rounded-[8px] text-[13px] font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-[#E53935] text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ),
                )}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-[8px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [masterData, setMasterData] = useState<MasterBarang[]>([]);
  const [logData, setLogData] = useState<LogTransaksi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });
  const [rangeFilter, setRangeFilter] = useState<
    "Hari" | "Minggu" | "Bulan" | "Tahun" | "Semua"
  >("Hari");
  const isFetchingRef = useRef(false);
  const { toasts, show: showToast, remove: removeToast } = useToast();

  const fetchData = useCallback(async (options?: { silent?: boolean }) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (!options?.silent) setIsLoading(true);
    try {
      const data = await sheetService.getData();
      setMasterData(data.master || []);
      setLogData(data.logs || []);
    } finally {
      if (!options?.silent) setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const authStatus =
      localStorage.getItem("atk_master_auth") ||
      sessionStorage.getItem("atk_master_auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      fetchData();
    } else {
      setIsAuthenticated(false);
    }
  }, [fetchData]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const intervalId = setInterval(() => {
      fetchData({ silent: true });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchData]);

  const handleLogin = (remember: boolean) => {
    if (remember) {
      localStorage.setItem("atk_master_auth", "true");
    } else {
      sessionStorage.setItem("atk_master_auth", "true");
    }
    setIsAuthenticated(true);
    fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem("atk_master_auth");
    sessionStorage.removeItem("atk_master_auth");
    setIsAuthenticated(false);
    setIsLogoutModalOpen(false);
  };

  if (isAuthenticated === null)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="text-blue-600 animate-spin" />
      </div>
    );
  if (!isAuthenticated) return <LoginPage onLogin={handleLogin} />;

  return (
    <Router>
      <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-900">
        <Sidebar
          isOpen={isSidebarOpen}
          toggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogoutClick={() => setIsLogoutModalOpen(true)}
        />
        <main className="flex-1 lg:ml-64 transition-all pb-28 lg:pb-0">
          <nav className="h-14 flex items-center justify-between px-4 bg-white/85 backdrop-blur-md sticky top-0 z-10 lg:hidden border-b border-slate-100">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-slate-500 p-2 -ml-2 rounded-xl active:bg-slate-100"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <img src="/assets/logo%20giat%20remove%20bg.png" alt="Logo GIAT" className="w-7 h-7 object-contain" />
              <span className="font-black text-sm tracking-tight text-slate-800">ATK<span className="text-[#E53935]">GIAT</span></span>
            </div>
          </nav>
          <div className="px-3 py-4 sm:px-5 md:p-8 lg:p-10 max-w-7xl mx-auto">
            {isLoading && masterData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 size={40} className="text-blue-600 animate-spin" />
                <p className="mt-4 font-black uppercase text-xs">Loading...</p>
              </div>
            ) : (
              <Routes>
                <Route
                  path="/"
                  element={
                    <Dashboard
                      master={masterData}
                      logs={logData}
                      selectedDate={selectedDate}
                      rangeFilter={rangeFilter}
                      onSelectedDateChange={setSelectedDate}
                      onRangeFilterChange={setRangeFilter}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      onLogoutClick={() => setIsLogoutModalOpen(true)}
                    />
                  }
                />
                <Route
                  path="/master"
                  element={
                    <MasterStok
                      data={masterData}
                      onRefresh={fetchData}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      onLogoutClick={() => setIsLogoutModalOpen(true)}
                      showToast={showToast}
                    />
                  }
                />
                <Route
                  path="/transaksi"
                  element={
                    <TransaksiStok
                      master={masterData}
                      onRefresh={fetchData}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      onLogoutClick={() => setIsLogoutModalOpen(true)}
                      showToast={showToast}
                    />
                  }
                />
                <Route
                  path="/logs"
                  element={
                    <RiwayatTransaksi
                      logs={logData}
                      selectedDate={selectedDate}
                      rangeFilter={rangeFilter}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      onLogoutClick={() => setIsLogoutModalOpen(true)}
                    />
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </div>
        </main>
        <BottomNavigation />
        <ConfirmationModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogout}
          title="Keluar Akun"
          confirmText="Keluar"
          message="Yakin ingin keluar?"
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Router>
  );
};

export default App;
