import * as XLSX from 'xlsx';
import { JournalEntry, Teacher } from '../types';

/**
 * Export Journals to Excel (.xlsx) file
 */
export function exportJournalsToExcel(journals: JournalEntry[], filename = 'Jurnal_Mengajar_SMAN1Tuntang.xlsx') {
  const formattedData = journals.map((j, index) => ({
    'No': index + 1,
    'Tanggal': j.date,
    'Nama Guru': j.teacherName,
    'NIP': j.teacherNip,
    'Kelas': j.kelas,
    'Mata Pelajaran': j.mapel,
    'Jam Ke- (JP)': j.jamPelajaran.sort((a, b) => a - b).join(', '),
    'Materi / Agenda': j.materi,
    'Hadir': j.attendance.hadir,
    'Sakit': j.attendance.sakit,
    'Izin': j.attendance.izin,
    'Alpa': j.attendance.alpa,
    'Catatan Presensi / Siswa': j.attendance.notes || '-',
    'Hambatan / Catatan': j.hambatan || '-',
    'Metode Pembelajaran': j.metodePembelajaran || '-',
    'Media Pembelajaran': j.mediaPembelajaran || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Set column widths for readability
  const wscols = [
    { wch: 5 },  // No
    { wch: 12 }, // Tanggal
    { wch: 28 }, // Nama Guru
    { wch: 20 }, // NIP
    { wch: 10 }, // Kelas
    { wch: 22 }, // Mapel
    { wch: 15 }, // JP
    { wch: 40 }, // Materi
    { wch: 8 },  // H
    { wch: 8 },  // S
    { wch: 8 },  // I
    { wch: 8 },  // A
    { wch: 30 }, // Catatan Siswa
    { wch: 30 }, // Hambatan
    { wch: 22 }, // Metode
    { wch: 22 }, // Media
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Jurnal Harian');

  XLSX.writeFile(workbook, filename);
}

/**
 * Export Teachers list to Excel
 */
export function exportTeachersToExcel(teachers: Teacher[], filename = 'Data_Guru_SMAN1Tuntang.xlsx') {
  const formattedData = teachers.map((t, index) => ({
    'No': index + 1,
    'NIP': t.nip,
    'Nama Lengkap': t.name,
    'Mata Pelajaran Utama': t.primarySubject,
    'Password Default': t.defaultPassword || 'guru123',
    'Status': t.isActive ? 'Aktif' : 'Non-Aktif',
    'Email': t.email || '-',
    'No HP': t.phone || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Guru');
  XLSX.writeFile(workbook, filename);
}

/**
 * Download Excel template for importing teacher accounts
 */
export function downloadTeacherImportTemplate() {
  const templateData = [
    {
      'NIP': '198501012010011005',
      'Nama Lengkap': 'Drs. Supriyadi, M.Pd.',
      'Password Default': 'guru123',
      'Mapel Utama': 'Matematika Umum',
    },
    {
      'NIP': '199205152020122018',
      'Nama Lengkap': 'Nurul Hidayah, S.Pd.',
      'Password Default': 'guru123',
      'Mapel Utama': 'Bahasa Inggris',
    },
    {
      'NIP': '198708242011011009',
      'Nama Lengkap': 'Rudi Hermawan, S.Kom.',
      'Password Default': 'guru123',
      'Mapel Utama': 'Informatika / TIK',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  worksheet['!cols'] = [
    { wch: 22 },
    { wch: 30 },
    { wch: 18 },
    { wch: 25 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Guru');
  XLSX.writeFile(workbook, 'Template_Import_Data_Guru_SMAN1Tuntang.xlsx');
}

/**
 * Parse Excel file uploaded by user
 */
export function parseTeacherExcelFile(file: File): Promise<Array<{ nip: string; name: string; defaultPassword?: string; primarySubject?: string }>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        const teachersParsed = rawRows.map((row) => {
          // Normalize column headers
          const nip = row['NIP'] || row['nip'] || row['Nip'] || row['Nomor Induk Pegawai'] || '';
          const name = row['Nama Lengkap'] || row['Nama'] || row['nama'] || row['Nama Guru'] || '';
          const defaultPassword = row['Password Default'] || row['Password'] || row['password'] || 'guru123';
          const primarySubject = row['Mapel Utama'] || row['Mata Pelajaran'] || row['Mapel'] || 'Matematika Umum';

          return {
            nip: String(nip).trim(),
            name: String(name).trim(),
            defaultPassword: String(defaultPassword).trim(),
            primarySubject: String(primarySubject).trim(),
          };
        }).filter((t) => t.nip && t.name);

        resolve(teachersParsed);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
