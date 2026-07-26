import React, { useState } from 'react';
import { Teacher, UserRole } from '../types';
import { LogIn, Key, UserCheck, ShieldCheck, AlertCircle, Info, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  onLoginSuccess: (user: Teacher, role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  teachers,
  onLoginSuccess,
}) => {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'GURU' | 'ADMIN'>('GURU');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const nipClean = nip.trim();
    const passClean = password.trim();

    if (!nipClean || !passClean) {
      setError('Mohon isi NIP / Username dan Password.');
      return;
    }

    // Admin shortcut check
    if (nipClean.toLowerCase() === 'admin' || (activeTab === 'ADMIN' && nipClean === '198001012005011001')) {
      const adminTeacher = teachers.find((t) => t.nip === '198001012005011001' || t.role === 'ADMIN') || teachers[0];
      if (passClean === 'admin123' || passClean === adminTeacher.passwordHash || passClean === adminTeacher.defaultPassword) {
        onLoginSuccess(adminTeacher, 'ADMIN');
        onClose();
        return;
      }
    }

    // Standard Teacher / Admin check against registered teachers
    const foundTeacher = teachers.find((t) => t.nip === nipClean || t.email === nipClean);

    if (!foundTeacher) {
      setError('NIP / Username tidak terdaftar dalam sistem.');
      return;
    }

    if (!foundTeacher.isActive) {
      setError('Akun Anda sedang dinonaktifkan oleh Admin.');
      return;
    }

    const validPass = passClean === foundTeacher.passwordHash || passClean === foundTeacher.defaultPassword || passClean === 'guru123';

    if (validPass) {
      const isUserAdmin = foundTeacher.nip === '198001012005011001' || activeTab === 'ADMIN';
      onLoginSuccess(foundTeacher, isUserAdmin ? 'ADMIN' : 'GURU');
      onClose();
    } else {
      setError('Password yang Anda masukkan salah.');
    }
  };

  const handleDemoLogin = (type: 'ADMIN' | 'GURU_BUDI' | 'GURU_SITI') => {
    if (type === 'ADMIN') {
      const admin = teachers.find((t) => t.nip === '198001012005011001') || teachers[0];
      onLoginSuccess(admin, 'ADMIN');
    } else if (type === 'GURU_BUDI') {
      const budi = teachers.find((t) => t.nip === '197508152006041002') || teachers[1];
      onLoginSuccess(budi, 'GURU');
    } else {
      const siti = teachers.find((t) => t.nip === '198203102009022005') || teachers[2];
      onLoginSuccess(siti, 'GURU');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold rounded-full w-8 h-8 flex items-center justify-center hover:bg-slate-800"
          >
            ✕
          </button>
          <div className="w-12 h-12 rounded-full bg-blue-600/30 text-teal-400 flex items-center justify-center mx-auto mb-3 border border-blue-500/30">
            <LogIn className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Login Portal SMAN 1 Tuntang</h3>
          <p className="text-xs text-slate-400 mt-1">Sistem Jurnal Mengajar Guru & Presensi Harian</p>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-slate-800 p-1 rounded-lg mt-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setActiveTab('GURU'); setError(''); }}
              className={`py-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'GURU'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Login Guru</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('ADMIN'); setError(''); }}
              className={`py-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'ADMIN'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Login Admin</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              {activeTab === 'ADMIN' ? 'Username / NIP Admin' : 'NIP / Username Guru'}
            </label>
            <input
              type="text"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder={activeTab === 'ADMIN' ? 'Masukkan admin atau NIP Admin' : 'Contoh: 197508152006041002'}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none transition-all"
                required
              />
              <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk Sekarang</span>
          </button>

          {/* Quick Demo Login Option */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Uji Coba Cepat (Akun Demo)</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('ADMIN')}
                className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs py-1.5 px-2 rounded-md font-medium text-center transition-colors"
              >
                Admin SMAN1
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('GURU_BUDI')}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs py-1.5 px-2 rounded-md font-medium text-center transition-colors truncate"
              >
                Pak Budi (MTK)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('GURU_SITI')}
                className="bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 text-xs py-1.5 px-2 rounded-md font-medium text-center transition-colors truncate"
              >
                Bu Siti (Indo)
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-start gap-1.5 font-medium text-slate-700">
              <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <span>Kredensial Default Login:</span>
            </div>
            <div className="pl-5 space-y-0.5">
              <p>• <strong>Admin:</strong> Username: <code className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded font-mono font-bold">admin</code> | Password: <code className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded font-mono font-bold">admin123</code></p>
              <p>• <strong>Guru:</strong> NIP: <code className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-mono">197508152006041002</code> | Password: <code className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-mono font-bold">guru123</code></p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
