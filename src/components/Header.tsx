import React from 'react';
import { Teacher, UserRole, ActiveTab, AdminSettings } from '../types';
import { BookOpen, UserCheck, ShieldCheck, LogOut, Key, FileSpreadsheet, PlusCircle, History, Users, Settings, BarChart2 } from 'lucide-react';

interface HeaderProps {
  user: Teacher | null;
  role: UserRole;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLogout: () => void;
  onOpenLogin: () => void;
  onChangePassword: () => void;
  settings: AdminSettings;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  role,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenLogin,
  onChangePassword,
  settings,
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 border-b border-slate-800">
      {/* Top Banner / Identity Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* School Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('INPUT_JURNAL')}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-teal-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white leading-tight">
                  {settings.schoolName || 'SMA Negeri 1 Tuntang'}
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Resmi
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span>Jurnal Mengajar Guru Online</span>
                <span className="hidden md:inline">• TP {settings.academicYear} ({settings.semester})</span>
              </p>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="hidden lg:flex flex-col text-right mr-1">
                  <span className="text-sm font-semibold text-slate-100">{user.name}</span>
                  <span className="text-xs text-slate-400">NIP. {user.nip}</span>
                </div>

                <div className="flex items-center space-x-1.5 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 ${
                    role === 'ADMIN' 
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {role === 'ADMIN' ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">ADMIN</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">GURU</span>
                      </>
                    )}
                  </span>

                  <button
                    onClick={onChangePassword}
                    title="Ubah Password"
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                  >
                    <Key className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onLogout}
                    title="Keluar / Logout"
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-md transition-colors flex items-center gap-1 text-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline font-medium">Keluar</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Masuk Sistem</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800 scrollbar-none text-sm">
          {/* Teacher Navigation */}
          {role === 'GURU' && (
            <>
              <button
                onClick={() => setActiveTab('INPUT_JURNAL')}
                className={`px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === 'INPUT_JURNAL'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Isi Jurnal Hari Ini</span>
              </button>

              <button
                onClick={() => setActiveTab('RIWAYAT_GURU')}
                className={`px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === 'RIWAYAT_GURU'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Riwayat & Rekap Jurnal Saya</span>
              </button>
            </>
          )}

          {/* Admin Navigation */}
          {role === 'ADMIN' && (
            <>
              <button
                onClick={() => setActiveTab('ADMIN_MONITORING')}
                className={`px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === 'ADMIN_MONITORING'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Monitoring Jurnal Harian</span>
              </button>

              <button
                onClick={() => setActiveTab('INPUT_JURNAL')}
                className={`px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === 'INPUT_JURNAL'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Input Jurnal</span>
              </button>

              <button
                onClick={() => setActiveTab('ADMIN_GURU')}
                className={`px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === 'ADMIN_GURU'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Manajemen Guru & Impor Excel</span>
              </button>

              <button
                onClick={() => setActiveTab('ADMIN_SETTINGS')}
                className={`px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === 'ADMIN_SETTINGS'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Google Sheets & Pengaturan</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
