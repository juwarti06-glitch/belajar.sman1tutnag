import React, { useState } from 'react';
import { JournalEntry, Teacher, AdminSettings } from '../types';
import { exportJournalsToExcel } from '../utils/excel';
import { syncJournalToGoogleSheets } from '../utils/sheets';
import { Search, Filter, FileSpreadsheet, Printer, Edit2, Trash2, Send, CheckCircle2, XCircle, Calendar, Users, Eye, Sparkles, AlertCircle } from 'lucide-react';

interface JournalHistoryProps {
  journals: JournalEntry[];
  currentUser: Teacher | null;
  isAdmin: boolean;
  settings: AdminSettings;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
  onPrintSingle: (entry: JournalEntry) => void;
  onPrintBatch: (filteredJournals: JournalEntry[]) => void;
}

export const JournalHistory: React.FC<JournalHistoryProps> = ({
  journals,
  currentUser,
  isAdmin,
  settings,
  onEdit,
  onDelete,
  onPrintSingle,
  onPrintBatch,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterMapel, setFilterMapel] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [selectedJournalModal, setSelectedJournalModal] = useState<JournalEntry | null>(null);

  // Filter logic
  const filtered = journals.filter((j) => {
    // Teacher view only shows their own journals unless Admin
    if (!isAdmin && currentUser && j.teacherNip !== currentUser.nip) {
      return false;
    }

    if (filterKelas && j.kelas !== filterKelas) return false;
    if (filterMapel && j.mapel !== filterMapel) return false;

    if (filterDateFrom && j.date < filterDateFrom) return false;
    if (filterDateTo && j.date > filterDateTo) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchMateri = j.materi.toLowerCase().includes(q);
      const matchGuru = j.teacherName.toLowerCase().includes(q);
      const matchNip = j.teacherNip.toLowerCase().includes(q);
      const matchKelas = j.kelas.toLowerCase().includes(q);
      const matchMapel = j.mapel.toLowerCase().includes(q);
      if (!matchMateri && !matchGuru && !matchNip && !matchKelas && !matchMapel) {
        return false;
      }
    }

    return true;
  });

  const handleManualSync = async (journal: JournalEntry) => {
    if (!settings.googleSheetsWebhookUrl) {
      alert('URL Webhook Google Sheets belum diisi oleh Admin. Silakan atur di menu Pengaturan Google Sheets.');
      return;
    }

    setSyncingId(journal.id);
    const result = await syncJournalToGoogleSheets(settings.googleSheetsWebhookUrl, journal);
    setSyncingId(null);
    alert(result.message);
  };

  const handleExportExcel = () => {
    if (filtered.length === 0) {
      alert('Tidak ada data jurnal yang memenuhi kriteria filter.');
      return;
    }
    const namePrefix = isAdmin ? 'Rekap_Jurnal_Seluruh_Guru' : `Jurnal_${currentUser?.name || 'Guru'}`;
    exportJournalsToExcel(filtered, `${namePrefix}_SMAN1Tuntang.xlsx`);
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              {isAdmin ? 'Rekapitulasi Jurnal Mengajar Seluruh Guru' : 'Riwayat Jurnal Mengajar Saya'}
            </h3>
            <p className="text-xs text-slate-500">
              Menampilkan {filtered.length} dari total {journals.length} entri jurnal terdata
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintBatch(filtered)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Rekap PDF</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Unduh Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Search Text */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari materi / guru / kelas..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Kelas */}
          <div>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kelas</option>
              {['X-1', 'X-2', 'X-3', 'X-4', 'X-5', 'X-6', 'XI-1', 'XI-2', 'XI-3', 'XI-4', 'XI-5', 'XI-6', 'XII-1', 'XII-2', 'XII-3', 'XII-4', 'XII-5', 'XII-6'].map((k) => (
                <option key={k} value={k}>Kelas {k}</option>
              ))}
            </select>
          </div>

          {/* Filter Mapel */}
          <div>
            <select
              value={filterMapel}
              onChange={(e) => setFilterMapel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Mapel</option>
              {Array.from(new Set(journals.map(j => j.mapel))).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
              title="Dari Tanggal"
            />
          </div>

          {/* Date To */}
          <div>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
              title="Sampai Tanggal"
            />
          </div>
        </div>
      </div>

      {/* Table / List View */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700">Belum Ada Data Jurnal</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Silakan tambahkan jurnal harian baru melalui menu "Isi Jurnal Hari Ini" atau sesuaikan filter pencarian.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-200 border-b border-slate-800 uppercase tracking-wider font-bold">
                  <th className="p-3.5 w-12 text-center">No</th>
                  <th className="p-3.5 w-28">Tanggal</th>
                  {isAdmin && <th className="p-3.5">Guru Pengampu</th>}
                  <th className="p-3.5 w-20">Kelas</th>
                  <th className="p-3.5">Mata Pelajaran</th>
                  <th className="p-3.5 w-24">Jam Ke-</th>
                  <th className="p-3.5">Materi / Agenda</th>
                  <th className="p-3.5 text-center w-28">Presensi (H/S/I/A)</th>
                  <th className="p-3.5 text-center w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((entry, idx) => (
                  <tr key={entry.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-3.5 text-center font-semibold text-slate-500">{idx + 1}</td>
                    <td className="p-3.5 font-medium text-slate-800 whitespace-nowrap">
                      {entry.date}
                    </td>
                    {isAdmin && (
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{entry.teacherName}</div>
                        <div className="text-[10px] text-slate-400">NIP. {entry.teacherNip}</div>
                      </td>
                    )}
                    <td className="p-3.5">
                      <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                        {entry.kelas}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">{entry.mapel}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-medium text-slate-700">
                        JP {entry.jamPelajaran.sort((a,b)=>a-b).join(', ')}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <p className="line-clamp-2 text-slate-700">{entry.materi}</p>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1 font-mono text-[11px]">
                        <span className="text-emerald-700 font-bold" title="Hadir">{entry.attendance.hadir}H</span>/
                        <span className="text-amber-700 font-bold" title="Sakit">{entry.attendance.sakit}S</span>/
                        <span className="text-blue-700 font-bold" title="Izin">{entry.attendance.izin}I</span>/
                        <span className="text-rose-700 font-bold" title="Alpa">{entry.attendance.alpa}A</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => setSelectedJournalModal(entry)}
                          title="Lihat Detail"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onPrintSingle(entry)}
                          title="Cetak Bukti Jurnal"
                          className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {(isAdmin || currentUser?.nip === entry.teacherNip) && (
                          <>
                            <button
                              onClick={() => onEdit(entry)}
                              title="Edit Jurnal"
                              className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) {
                                  onDelete(entry.id);
                                }
                              }}
                              title="Hapus"
                              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {settings.googleSheetsWebhookUrl && (
                          <button
                            onClick={() => handleManualSync(entry)}
                            disabled={syncingId === entry.id}
                            title="Sync ke Google Sheets"
                            className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg"
                          >
                            <Send className="w-4 h-4" />
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
      )}

      {/* Modal Detail Jurnal */}
      {selectedJournalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 border border-slate-100 relative">
            <button
              onClick={() => setSelectedJournalModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-lg font-bold"
            >
              ✕
            </button>

            <div className="border-b pb-3">
              <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full uppercase">
                Kelas {selectedJournalModal.kelas} • {selectedJournalModal.mapel}
              </span>
              <h3 className="font-bold text-slate-900 text-lg mt-1">Detail Jurnal Mengajar</h3>
              <p className="text-xs text-slate-500">
                {selectedJournalModal.teacherName} (NIP. {selectedJournalModal.teacherNip})
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border">
                <div>
                  <span className="text-slate-400 font-semibold block">Tanggal</span>
                  <span className="font-bold text-slate-800">{selectedJournalModal.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Jam Pelajaran (JP)</span>
                  <span className="font-bold text-slate-800">
                    JP {selectedJournalModal.jamPelajaran.join(', ')}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Materi / Agenda Pembelajaran:</span>
                <p className="bg-slate-50 p-3 rounded-xl border text-slate-800 whitespace-pre-line leading-relaxed">
                  {selectedJournalModal.materi}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Presensi Siswa:</span>
                <div className="grid grid-cols-4 gap-2 text-center font-bold">
                  <div className="bg-emerald-50 p-2 rounded-lg text-emerald-800">
                    Hadir: {selectedJournalModal.attendance.hadir}
                  </div>
                  <div className="bg-amber-50 p-2 rounded-lg text-amber-800">
                    Sakit: {selectedJournalModal.attendance.sakit}
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-800">
                    Izin: {selectedJournalModal.attendance.izin}
                  </div>
                  <div className="bg-rose-50 p-2 rounded-lg text-rose-800">
                    Alpa: {selectedJournalModal.attendance.alpa}
                  </div>
                </div>
                {selectedJournalModal.attendance.notes && (
                  <p className="mt-2 text-[11px] text-slate-600 italic bg-slate-100 p-2 rounded-lg">
                    Catatan Siswa: {selectedJournalModal.attendance.notes}
                  </p>
                )}
              </div>

              {selectedJournalModal.hambatan && (
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">Catatan Hambatan / Solusi:</span>
                  <p className="text-slate-600 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                    {selectedJournalModal.hambatan}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  onPrintSingle(selectedJournalModal);
                  setSelectedJournalModal(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar Resmi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
