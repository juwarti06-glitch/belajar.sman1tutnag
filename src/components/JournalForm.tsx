import React, { useState } from 'react';
import { Teacher, JournalEntry, AdminSettings } from '../types';
import { LIST_KELAS, LIST_MAPEL, JAM_PELAJARAN } from '../data/initialData';
import { syncJournalToGoogleSheets } from '../utils/sheets';
import { Calendar, BookOpen, Clock, Users, FileText, CheckCircle2, AlertTriangle, Send, Sparkles, RefreshCw, Bookmark } from 'lucide-react';

interface JournalFormProps {
  user: Teacher;
  settings: AdminSettings;
  onSave: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>, sendSheets: boolean) => Promise<void>;
  editingEntry?: JournalEntry | null;
  onCancelEdit?: () => void;
}

export const JournalForm: React.FC<JournalFormProps> = ({
  user,
  settings,
  onSave,
  editingEntry,
  onCancelEdit,
}) => {
  // Form State
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(editingEntry?.date || todayStr);
  const [kelas, setKelas] = useState(editingEntry?.kelas || 'X-1');
  const [mapel, setMapel] = useState(editingEntry?.mapel || user.primarySubject || 'Matematika Umum');
  const [selectedJP, setSelectedJP] = useState<number[]>(editingEntry?.jamPelajaran || [1, 2]);
  const [materi, setMateri] = useState(editingEntry?.materi || '');
  
  // Attendance
  const [hadir, setHadir] = useState<number>(editingEntry?.attendance.hadir ?? 34);
  const [sakit, setSakit] = useState<number>(editingEntry?.attendance.sakit ?? 0);
  const [izin, setIzin] = useState<number>(editingEntry?.attendance.izin ?? 0);
  const [alpa, setAlpa] = useState<number>(editingEntry?.attendance.alpa ?? 0);
  const [attendanceNotes, setAttendanceNotes] = useState(editingEntry?.attendance.notes || '');

  // Extras
  const [hambatan, setHambatan] = useState(editingEntry?.hambatan || '');
  const [metode, setMetode] = useState(editingEntry?.metodePembelajaran || 'Diskusi Kelompok & Ceramah Interaktif');
  const [media, setMedia] = useState(editingEntry?.mediaPembelajaran || 'LCD Projector, Papan Tulis, LKPD');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Toggle JP Multi-select
  const toggleJP = (jpNum: number) => {
    if (selectedJP.includes(jpNum)) {
      if (selectedJP.length === 1) return; // Must have at least 1 JP selected
      setSelectedJP(selectedJP.filter((j) => j !== jpNum).sort((a, b) => a - b));
    } else {
      setSelectedJP([...selectedJP, jpNum].sort((a, b) => a - b));
    }
  };

  const totalSiswa = (Number(hadir) || 0) + (Number(sakit) || 0) + (Number(izin) || 0) + (Number(alpa) || 0);

  const handleSubmit = async (e: React.FormEvent, sendToSheetsNow = false) => {
    e.preventDefault();
    setFeedback(null);

    if (!materi.trim()) {
      setFeedback({ type: 'error', message: 'Materi / Agenda Pembelajaran wajib diisi!' });
      return;
    }

    if (selectedJP.length === 0) {
      setFeedback({ type: 'error', message: 'Pilih minimal 1 Jam Pelajaran (JP).' });
      return;
    }

    setIsSubmitting(true);

    try {
      const journalPayload = {
        teacherId: user.id,
        teacherNip: user.nip,
        teacherName: user.name,
        date,
        kelas,
        mapel,
        jamPelajaran: selectedJP,
        materi,
        attendance: {
          hadir: Number(hadir) || 0,
          sakit: Number(sakit) || 0,
          izin: Number(izin) || 0,
          alpa: Number(alpa) || 0,
          notes: attendanceNotes,
        },
        hambatan,
        metodePembelajaran: metode,
        mediaPembelajaran: media,
        syncedToSheets: false,
      };

      await onSave(journalPayload, sendToSheetsNow);

      setFeedback({
        type: 'success',
        message: editingEntry
          ? 'Perubahan Jurnal Mengajar berhasil disimpan!'
          : 'Jurnal Mengajar Harian berhasil dicatat ke sistem!',
      });

      if (!editingEntry) {
        // Reset fields for new entry
        setMateri('');
        setAttendanceNotes('');
        setHambatan('');
      }

      setTimeout(() => {
        setFeedback(null);
      }, 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Gagal menyimpan jurnal: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
      
      {/* Form Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white p-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {editingEntry ? 'Edit Jurnal Mengajar' : 'Formulir Jurnal Mengajar Guru'}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Pengampu: <span className="font-semibold text-white">{user.name}</span> (NIP. {user.nip})
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-blue-950/60 backdrop-blur-sm border border-blue-800/50 px-3 py-1.5 rounded-lg text-xs">
            <Calendar className="w-4 h-4 text-teal-400" />
            <span>{new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-6">

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-xl flex items-center justify-between text-sm shadow-sm transition-all ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
            <button type="button" onClick={() => setFeedback(null)} className="text-xs font-bold hover:opacity-75">✕</button>
          </div>
        )}

        {/* SECTION 1: Tanggal, Kelas & Mata Pelajaran */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>1. Tanggal, Kelas & Mata Pelajaran</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Tanggal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Tanggal Mengajar
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                {date === todayStr ? '✓ Hari Ini' : '⚠️ Jurnal Susulan'}
              </span>
            </div>

            {/* Kelas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Pilih Kelas
              </label>
              <select
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {LIST_KELAS.map((k) => (
                  <option key={k} value={k}>
                    Kelas {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Mapel */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Mata Pelajaran
              </label>
              <select
                value={mapel}
                onChange={(e) => setMapel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {LIST_MAPEL.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Jam Pelajaran (JP 1-10 Multi-Checklist) */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>2. Jam Pelajaran (JP 1 - 10)</span>
            </div>
            <span className="text-xs text-blue-700 font-semibold bg-blue-100 px-2.5 py-0.5 rounded-full">
              Terpilih: JP {selectedJP.sort((a, b) => a - b).join(', ')} ({selectedJP.length} JP)
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Klik nomor JP yang Anda ajar pada jam pelajaran kali ini (bisa memilih lebih dari satu):
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2 pt-1">
            {JAM_PELAJARAN.map((item) => {
              const isChecked = selectedJP.includes(item.jp);
              return (
                <button
                  key={item.jp}
                  type="button"
                  onClick={() => toggleJP(item.jp)}
                  className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center cursor-pointer ${
                    isChecked
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300 scale-105'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-bold">JP {item.jp}</span>
                  <span className={`text-[10px] mt-0.5 ${isChecked ? 'text-blue-100' : 'text-slate-400'}`}>
                    {item.time.split(' - ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Agenda / Materi Pembelajaran */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>3. Agenda / Materi Pembelajaran</span>
            <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={materi}
            onChange={(e) => setMateri(e.target.value)}
            placeholder="Tuliskan topik, TP/KD, ringkasan materi, atau kegiatan pembelajaran yang telah dilaksanakan..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none transition-all shadow-sm"
            required
          />
        </div>

        {/* SECTION 4: Presensi Siswa & Catatan Ketidakhadiran */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
              <Users className="w-4 h-4 text-blue-600" />
              <span>4. Presensi Kehadiran Siswa</span>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-200 px-3 py-1 rounded-md">
              Total Siswa: {totalSiswa} Orang
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
              <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">
                Hadir (H)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={hadir}
                onChange={(e) => setHadir(Number(e.target.value))}
                className="w-full bg-white px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-900 font-bold text-lg outline-none text-center"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
              <label className="block text-xs font-bold text-amber-800 uppercase mb-1">
                Sakit (S)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={sakit}
                onChange={(e) => setSakit(Number(e.target.value))}
                className="w-full bg-white px-3 py-1.5 rounded-lg border border-amber-300 text-amber-900 font-bold text-lg outline-none text-center"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
              <label className="block text-xs font-bold text-blue-800 uppercase mb-1">
                Izin (I)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={izin}
                onChange={(e) => setIzin(Number(e.target.value))}
                className="w-full bg-white px-3 py-1.5 rounded-lg border border-blue-300 text-blue-900 font-bold text-lg outline-none text-center"
              />
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
              <label className="block text-xs font-bold text-rose-800 uppercase mb-1">
                Alpa (A)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={alpa}
                onChange={(e) => setAlpa(Number(e.target.value))}
                className="w-full bg-white px-3 py-1.5 rounded-lg border border-rose-300 text-rose-900 font-bold text-lg outline-none text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Catatan Nama Siswa Tidak Hadir / Catatan Perilaku Khusus
            </label>
            <textarea
              rows={2}
              value={attendanceNotes}
              onChange={(e) => setAttendanceNotes(e.target.value)}
              placeholder="Contoh: Sakit: Budi (ada surat), Alpa: Andi (tidak ada keterangan)...."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* SECTION 5: Hambatan & Metode / Media Pembelajaran */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Catatan Hambatan / Solusi Pembelajaran (Opsional)
            </label>
            <textarea
              rows={2}
              value={hambatan}
              onChange={(e) => setHambatan(e.target.value)}
              placeholder="Tuliskan kendala saat jam mengajar jika ada..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Metode Pembelajaran
              </label>
              <input
                type="text"
                value={metode}
                onChange={(e) => setMetode(e.target.value)}
                placeholder="misal: Problem Based Learning, Diskusi"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Media & Alat Pembelajaran
              </label>
              <input
                type="text"
                value={media}
                onChange={(e) => setMedia(e.target.value)}
                placeholder="misal: LCD, Modul Ajar, Canva, Lab"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 italic">
            * Data jurnal disimpan langsung secara aman di server / local storage.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {editingEntry && onCancelEdit && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
              >
                Batal Edit
              </button>
            )}

            {settings.googleSheetsWebhookUrl && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Simpan & Sync Google Sheets</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>{editingEntry ? 'Update Jurnal' : 'Simpan Jurnal Mengajar'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
