import React, { useState } from 'react';
import { Teacher } from '../types';
import { Key, CheckCircle, AlertCircle } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Teacher;
  onPasswordChanged: (newPassword: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  user,
  onPasswordChanged,
}) => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPass.length < 6) {
      setError('Password baru minimal terdiri dari 6 karakter.');
      return;
    }

    if (newPass !== confirmPass) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }

    onPasswordChanged(newPass);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Ubah Password Akun</h3>
            <p className="text-xs text-slate-500">NIP: {user.nip} ({user.name})</p>
          </div>
        </div>

        {user.mustChangePassword && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg mb-4">
            ⚠️ Anda masih menggunakan password default. Demi keamanan, silakan buat password baru Anda.
          </div>
        )}

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto animate-bounce" />
            <p className="font-semibold text-sm">Password Berhasil Diperbarui!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password Lama</label>
              <input
                type="password"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                placeholder="Password saat ini"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password Baru</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Ketik ulang password baru"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium shadow-md transition-all"
              >
                Simpan Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
