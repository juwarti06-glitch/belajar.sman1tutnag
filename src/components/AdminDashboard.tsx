import React, { useState } from 'react';
import { Teacher, JournalEntry, AdminSettings } from '../types';
import { exportTeachersToExcel, downloadTeacherImportTemplate, parseTeacherExcelFile } from '../utils/excel';
import { getGoogleAppsScriptCode } from '../utils/sheets';
import { Users, FileSpreadsheet, UploadCloud, RefreshCw, Key, ShieldCheck, CheckCircle2, AlertTriangle, Plus, Trash2, Settings, Send, Copy, BookOpen, BarChart3, Download, Search } from 'lucide-react';

interface AdminDashboardProps {
  teachers: Teacher[];
  journals: JournalEntry[];
  settings: AdminSettings;
  onSaveSettings: (settings: AdminSettings) => void;
  onAddTeacher: (teacher: Omit<Teacher, 'id' | 'createdAt'>) => void;
  onBatchImport: (data: Array<{ nip: string; name: string; defaultPassword?: string; primarySubject?: string }>) => { added: number; updated: number };
  onResetTeacherPassword: (nip: string) => void;
  onToggleTeacherStatus: (nip: string) => void;
  onDeleteTeacher: (nip: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  teachers,
  journals,
  settings,
  onSaveSettings,
  onAddTeacher,
  onBatchImport,
  onResetTeacherPassword,
  onToggleTeacherStatus,
  onDeleteTeacher,
}) => {
  const [adminTab, setAdminTab] = useState<'MONITORING' | 'GURU' | 'SETTINGS'>('MONITORING');

  // New Single Teacher Form
  const [newNip, setNewNip] = useState('');
  const [newName, setNewName] = useState('');
  const [newSubject, setNewSubject] = useState('Matematika Umum');
  const [newPass, setNewPass] = useState('guru123');

  // Excel Import State
  const [importedRows, setImportedRows] = useState<Array<{ nip: string; name: string; defaultPassword?: string; primarySubject?: string }>>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Settings State
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [headmasterName, setHeadmasterName] = useState(settings.headmasterName);
  const [headmasterNip, setHeadmasterNip] = useState(settings.headmasterNip);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [semester, setSemester] = useState(settings.semester);
  const [webhookUrl, setWebhookUrl] = useState(settings.googleSheetsWebhookUrl || '');
  const [copiedCode, setCopiedCode] = useState(false);

  // Search Teacher State
  const [teacherSearch, setTeacherSearch] = useState('');

  // Calculate Today Statistics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayJournals = journals.filter((j) => j.date === todayStr);
  const teachersWithJournalToday = Array.from(new Set(todayJournals.map((j) => j.teacherNip)));
  const totalTeachers = teachers.filter((t) => t.nip !== '198001012005011001').length;
  const completionRate = totalTeachers > 0 ? Math.round((teachersWithJournalToday.length / totalTeachers) * 100) : 0;

  // Handle Excel Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setImportStatus(null);

    try {
      const parsed = await parseTeacherExcelFile(file);
      setImportedRows(parsed);
      setImportStatus(`Berhasil membaca ${parsed.length} data guru dari file Excel.`);
    } catch (err: any) {
      setImportStatus(`Gagal membaca file Excel: ${err.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleExecuteImport = () => {
    if (importedRows.length === 0) return;
    const res = onBatchImport(importedRows);
    setImportStatus(`Sukses! ${res.added} akun baru dibuat, ${res.updated} akun diperbarui.`);
    setImportedRows([]);
  };

  const handleCreateSingleTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNip.trim() || !newName.trim()) return;

    onAddTeacher({
      nip: newNip.trim(),
      name: newName.trim(),
      primarySubject: newSubject,
      defaultPassword: newPass || 'guru123',
      passwordHash: newPass || 'guru123',
      mustChangePassword: true,
      isActive: true,
    });

    setNewNip('');
    setNewName('');
    alert('Akun guru baru berhasil ditambahkan!');
  };

  const handleSaveAllSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      schoolName,
      headmasterName,
      headmasterNip,
      academicYear,
      semester,
      googleSheetsWebhookUrl: webhookUrl,
    });
    alert('Pengaturan sekolah & Google Sheets berhasil disimpan!');
  };

  const copyAppsScript = () => {
    navigator.clipboard.writeText(getGoogleAppsScriptCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || 
    t.nip.includes(teacherSearch) ||
    t.primarySubject.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Sub Navbar for Admin */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200/80 flex flex-wrap gap-2 text-xs font-bold">
        <button
          onClick={() => setAdminTab('MONITORING')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            adminTab === 'MONITORING'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Monitoring Jurnal Hari Ini</span>
        </button>

        <button
          onClick={() => setAdminTab('GURU')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            adminTab === 'GURU'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manajemen Guru & Import Excel</span>
        </button>

        <button
          onClick={() => setAdminTab('SETTINGS')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            adminTab === 'SETTINGS'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Integrasi Google Sheets & Profil Sekolah</span>
        </button>
      </div>

      {/* TAB 1: MONITORING */}
      {adminTab === 'MONITORING' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Guru Terisi Hari Ini</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {teachersWithJournalToday.length} / {totalTeachers}
                </h3>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  {completionRate}% Guru sudah mengisi
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Jurnal Dibuat Hari Ini</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{todayJournals.length}</h3>
                <p className="text-[11px] text-blue-600 font-semibold mt-1">
                  Tanggal: {todayStr}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Seluruh Jurnal</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{journals.length}</h3>
                <p className="text-[11px] text-slate-500 mt-1">Semua periode</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Status Google Sheets</p>
                <h3 className="text-sm font-bold text-slate-900 mt-1 truncate max-w-[140px]">
                  {settings.googleSheetsWebhookUrl ? 'Terhubung ✓' : 'Belum Terhubung'}
                </h3>
                <p className="text-[11px] text-purple-600 font-semibold mt-1">
                  Auto-sync: Off
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Send className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Status Pengisian Guru Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">
              Status Pengisian Jurnal Mengajar Guru Hari Ini ({todayStr})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase font-bold border-b">
                    <th className="p-3">Nama Guru</th>
                    <th className="p-3">NIP</th>
                    <th className="p-3">Mapel Utama</th>
                    <th className="p-3 text-center">Status Hari Ini</th>
                    <th className="p-3 text-center">Jurnal Terisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.filter(t => t.nip !== '198001012005011001').map((t) => {
                    const filledCount = todayJournals.filter(j => j.teacherNip === t.nip).length;
                    const isDone = filledCount > 0;
                    return (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{t.name}</td>
                        <td className="p-3 text-slate-500 font-mono">{t.nip}</td>
                        <td className="p-3 text-slate-700">{t.primarySubject}</td>
                        <td className="p-3 text-center">
                          {isDone ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Mengisi
                            </span>
                          ) : (
                            <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Belum Mengisi
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-800">
                          {filledCount} Jurnal
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAJEMEN GURU & IMPORT EXCEL */}
      {adminTab === 'GURU' && (
        <div className="space-y-6">
          
          {/* Excel Import Card */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-teal-400" />
                  <span>Impor Data Guru Massal via Excel / CSV</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Format Kolom Excel: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-teal-300">[NIP, Nama Lengkap, Password Default, Mapel Utama]</code>
                </p>
              </div>

              <button
                onClick={downloadTeacherImportTemplate}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all self-start"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Template Excel</span>
              </button>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-slate-700 hover:border-teal-400 rounded-xl p-6 text-center transition-all bg-slate-900/50">
              <UploadCloud className="w-10 h-10 text-teal-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-200">
                Pilih File Excel (.xlsx / .xls / .csv) Data Guru SMAN 1 Tuntang
              </p>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-upload-input"
              />
              <label
                htmlFor="excel-upload-input"
                className="mt-3 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-md"
              >
                Pilih File dari Perangkat
              </label>
            </div>

            {/* Import Status */}
            {importStatus && (
              <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl text-xs text-teal-300 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}

            {/* Preview Parsed Rows */}
            {importedRows.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-300">
                    Preview {importedRows.length} Calon Akun Guru:
                  </span>
                  <button
                    onClick={handleExecuteImport}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                  >
                    Proses Import Akun Sekarang
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto bg-slate-950 rounded-xl p-3 border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 font-bold text-slate-400">
                        <th className="p-1">NIP</th>
                        <th className="p-1">Nama Lengkap</th>
                        <th className="p-1">Mapel Utama</th>
                        <th className="p-1">Password Default</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {importedRows.map((row, i) => (
                        <tr key={i}>
                          <td className="p-1 font-mono">{row.nip}</td>
                          <td className="p-1 font-semibold text-white">{row.name}</td>
                          <td className="p-1">{row.primarySubject}</td>
                          <td className="p-1 font-mono text-amber-300">{row.defaultPassword || 'guru123'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Add Single Teacher & Teacher List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Add Single Teacher */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4 h-fit">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Tambah Akun Guru Manual</span>
              </h4>

              <form onSubmit={handleCreateSingleTeacher} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP Guru</label>
                  <input
                    type="text"
                    value={newNip}
                    onChange={(e) => setNewNip(e.target.value)}
                    placeholder="Contoh: 198501012010011005"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Contoh: Drs. Supriyadi, M.Pd."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran Utama</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Matematika / Bahasa Indonesia"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password Default</label>
                  <input
                    type="text"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg transition-all"
                >
                  Simpan Akun Guru
                </button>
              </form>
            </div>

            {/* Registered Teachers List Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Daftar Akun Guru Terdaftar ({filteredTeachers.length})</h4>
                  <p className="text-xs text-slate-500">Kelola status aktif, reset password, dan unduh data guru</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                      placeholder="Cari guru..."
                      className="pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none bg-slate-50"
                    />
                  </div>

                  <button
                    onClick={() => exportTeachersToExcel(teachers)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-sm"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b">
                      <th className="p-2.5">Nama & NIP</th>
                      <th className="p-2.5">Mapel Utama</th>
                      <th className="p-2.5">Password</th>
                      <th className="p-2.5 text-center">Status</th>
                      <th className="p-2.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTeachers.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{t.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">NIP. {t.nip}</div>
                        </td>
                        <td className="p-2.5 font-medium text-slate-700">{t.primarySubject}</td>
                        <td className="p-2.5 font-mono text-slate-500">
                          {t.defaultPassword || 'guru123'}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => onToggleTeacherStatus(t.nip)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              t.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {t.isActive ? 'Aktif' : 'Non-Aktif'}
                          </button>
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                if (confirm(`Reset password guru ${t.name} ke 'guru123'?`)) {
                                  onResetTeacherPassword(t.nip);
                                  alert('Password berhasil direset ke guru123');
                                }
                              }}
                              title="Reset Password"
                              className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>

                            {t.nip !== '198001012005011001' && (
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus akun guru ${t.name}?`)) {
                                    onDeleteTeacher(t.nip);
                                  }
                                }}
                                title="Hapus Akun"
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS & GOOGLE SHEETS */}
      {adminTab === 'SETTINGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* School Meta Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b pb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <span>Profil Sekolah & Tahun Ajaran</span>
            </h3>

            <form onSubmit={handleSaveAllSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Satuan Pendidikan</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="2025/2026"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  value={headmasterName}
                  onChange={(e) => setHeadmasterName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  value={headmasterNip}
                  onChange={(e) => setHeadmasterNip(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 font-mono outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  URL Webhook Google Sheets (Opsi A)
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 font-mono text-[11px] outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Tempelkan URL Web App dari Google Apps Script untuk otomatisasi sync data ke spreadsheet.
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-sm"
              >
                Simpan Seluruh Pengaturan
              </button>
            </form>
          </div>

          {/* Google Sheets Apps Script Code Generator */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Send className="w-5 h-5 text-teal-400" />
                  <span>Skrip Google Apps Script</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Panduan integrasi Google Sheets (Opsi A)</p>
              </div>

              <button
                onClick={copyAppsScript}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? 'Tersalin! ✓' : 'Salin Kode'}</span>
              </button>
            </div>

            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1">
              <li>Buka Google Sheets sekolah Anda.</li>
              <li>Pilih menu <strong className="text-white">Extensions &gt; Apps Script</strong>.</li>
              <li>Hapus semua kode lama, lalu tempelkan kode skrip di bawah ini.</li>
              <li>Klik <strong className="text-white">Deploy &gt; New deployment &gt; Web app</strong>.</li>
              <li>Atur Who has access: <strong className="text-teal-400">Anyone</strong>.</li>
              <li>Salin URL Web app yang dihasilkan dan masukkan ke form sebelah kiri.</li>
            </ol>

            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] font-mono text-teal-300 overflow-x-auto max-h-64 scrollbar-none">
              {getGoogleAppsScriptCode()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
