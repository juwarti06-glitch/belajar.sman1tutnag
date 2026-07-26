import React from 'react';
import { JournalEntry, AdminSettings, Teacher } from '../types';
import { Printer, X, FileText, Check } from 'lucide-react';

interface PrintJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  journals: JournalEntry[];
  settings: AdminSettings;
  singleEntry?: JournalEntry | null;
  teacher?: Teacher | null;
}

export const PrintJournalModal: React.FC<PrintJournalModalProps> = ({
  isOpen,
  onClose,
  journals,
  settings,
  singleEntry,
  teacher,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const printList = singleEntry ? [singleEntry] : journals;
  const currentMonthName = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Controls Bar (hidden during browser print) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-sm">
              Pratinjau Cetak Lembar Resmi SMAN 1 Tuntang
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 overflow-y-auto bg-white text-slate-900 font-sans leading-normal print:p-0 print:m-0 print:shadow-none" id="printable-area">
          
          {/* SMAN 1 Tuntang Official Kop Surat Header */}
          <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 text-center">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  PEMERINTAH PROVINSI JAWA TENGAH<br />DINAS PENDIDIKAN DAN KEBUDAYAAN
                </h4>
                <h2 className="text-xl font-extrabold uppercase text-slate-900 tracking-tight mt-0.5">
                  SMA NEGERI 1 TUNTANG
                </h2>
                <p className="text-[11px] text-slate-600 italic">
                  Jl. Raya Semarang - Solo Km. 45, Kecamatan Tuntang, Kabupaten Semarang, Kode Pos 50773<br />
                  Website: www.sman1tuntang.sch.id • NPSN: {settings.schoolNpsn}
                </p>
              </div>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center mb-6">
            <h3 className="text-base font-bold uppercase underline tracking-wider">
              REKAPITULASI JURNAL MENGAJAR GURU
            </h3>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              Tahun Ajaran {settings.academicYear} — Semester {settings.semester}
            </p>
          </div>

          {/* Teacher Profile Meta */}
          {teacher && (
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 font-normal">Nama Guru: </span>
                <span className="font-bold text-slate-900">{teacher.name}</span>
              </div>
              <div>
                <span className="text-slate-500 font-normal">NIP: </span>
                <span className="font-mono text-slate-900">{teacher.nip}</span>
              </div>
              <div>
                <span className="text-slate-500 font-normal">Mata Pelajaran: </span>
                <span className="text-slate-900">{teacher.primarySubject}</span>
              </div>
              <div>
                <span className="text-slate-500 font-normal">Periode Rekap: </span>
                <span className="text-slate-900">{currentMonthName}</span>
              </div>
            </div>
          )}

          {/* Table */}
          <table className="w-full text-left border-collapse border border-slate-900 text-[11px] mb-8">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900 font-bold text-center">
                <th className="border border-slate-900 p-2 w-8">No</th>
                <th className="border border-slate-900 p-2 w-20">Tanggal</th>
                <th className="border border-slate-900 p-2 w-14">Kelas</th>
                <th className="border border-slate-900 p-2 w-28">Mapel</th>
                <th className="border border-slate-900 p-2 w-12">JP</th>
                <th className="border border-slate-900 p-2">Materi / Agenda Pembelajaran</th>
                <th className="border border-slate-900 p-2 w-20">Presensi (H/S/I/A)</th>
                <th className="border border-slate-900 p-2 w-32">Catatan Siswa / Hambatan</th>
              </tr>
            </thead>
            <tbody>
              {printList.map((entry, idx) => (
                <tr key={entry.id} className="border-b border-slate-800">
                  <td className="border border-slate-900 p-2 text-center font-bold">{idx + 1}</td>
                  <td className="border border-slate-900 p-2 text-center whitespace-nowrap">{entry.date}</td>
                  <td className="border border-slate-900 p-2 text-center font-bold">{entry.kelas}</td>
                  <td className="border border-slate-900 p-2">{entry.mapel}</td>
                  <td className="border border-slate-900 p-2 text-center font-semibold">
                    {entry.jamPelajaran.sort((a,b)=>a-b).join(',')}
                  </td>
                  <td className="border border-slate-900 p-2 leading-tight">{entry.materi}</td>
                  <td className="border border-slate-900 p-2 text-center font-mono">
                    {entry.attendance.hadir}/{entry.attendance.sakit}/{entry.attendance.izin}/{entry.attendance.alpa}
                  </td>
                  <td className="border border-slate-900 p-2 text-[10px] italic">
                    {entry.attendance.notes || entry.hambatan || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Official Signatures Block */}
          <div className="grid grid-cols-2 gap-8 text-xs pt-4 border-t border-slate-300 print:break-inside-avoid">
            <div className="text-center">
              <p className="text-slate-600">Mengetahui,</p>
              <p className="font-bold text-slate-900">Kepala SMA Negeri 1 Tuntang</p>
              <div className="h-20"></div>
              <p className="font-bold underline text-slate-900">{settings.headmasterName}</p>
              <p className="text-slate-600 font-mono">NIP. {settings.headmasterNip}</p>
            </div>

            <div className="text-center">
              <p className="text-slate-600">Tuntang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold text-slate-900">Guru Pengampu Mata Pelajaran</p>
              <div className="h-20"></div>
              <p className="font-bold underline text-slate-900">
                {singleEntry ? singleEntry.teacherName : teacher?.name || 'Guru Pengampu'}
              </p>
              <p className="text-slate-600 font-mono">
                NIP. {singleEntry ? singleEntry.teacherNip : teacher?.nip || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
