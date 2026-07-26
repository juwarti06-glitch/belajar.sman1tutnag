import { Teacher, JournalEntry, AdminSettings } from '../types';

export const INITIAL_SETTINGS: AdminSettings = {
  schoolName: 'SMA Negeri 1 Tuntang',
  schoolNpsn: '20320432',
  headmasterName: 'Dra. Endang Werdiningsih, M.Pd.',
  headmasterNip: '196805121994032008',
  academicYear: '2025/2026',
  semester: 'Ganjil',
  googleSheetsWebhookUrl: '',
  autoSyncSheets: false,
};

export const LIST_KELAS = [
  'X-1', 'X-2', 'X-3', 'X-4', 'X-5', 'X-6',
  'XI-1', 'XI-2', 'XI-3', 'XI-4', 'XI-5', 'XI-6',
  'XII-1', 'XII-2', 'XII-3', 'XII-4', 'XII-5', 'XII-6'
];

export const LIST_MAPEL = [
  'Matematika Umum',
  'Matematika Tingkat Lanjut',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Fisika',
  'Kimia',
  'Biologi',
  'Sejarah Indonesia',
  'Ekonomi',
  'Sosiologi',
  'Geografi',
  'Pendidikan Pancasila (PPKn)',
  'PJOK (Pendidikan Jasmani)',
  'Seni Budaya',
  'Pendidikan Agama & Budi Pekerti',
  'Bahasa Jawa',
  'Informatika / TIK',
  'Bimbingan Konseling (BK)'
];

export const JAM_PELAJARAN = [
  { jp: 1, time: '07.00 - 07.45' },
  { jp: 2, time: '07.45 - 08.30' },
  { jp: 3, time: '08.30 - 09.15' },
  { jp: 4, time: '09.30 - 10.15' },
  { jp: 5, time: '10.15 - 11.00' },
  { jp: 6, time: '11.00 - 11.45' },
  { jp: 7, time: '12.30 - 13.15' },
  { jp: 8, time: '13.15 - 14.00' },
  { jp: 9, time: '14.00 - 14.45' },
  { jp: 10, time: '14.45 - 15.30' },
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 't-admin',
    nip: '198001012005011001',
    name: 'Administrator SMAN 1 Tuntang',
    email: 'admin@sman1tuntang.sch.id',
    phone: '081234567890',
    primarySubject: 'Informatika / TIK',
    defaultPassword: 'admin123',
    passwordHash: 'admin123',
    mustChangePassword: false,
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 't-1',
    nip: '197508152006041002',
    name: 'Budi Santoso, S.Pd., M.Si.',
    email: 'budi.santoso@sman1tuntang.sch.id',
    phone: '081223344556',
    primarySubject: 'Matematika Umum',
    defaultPassword: 'guru123',
    passwordHash: 'guru123',
    mustChangePassword: true,
    isActive: true,
    createdAt: '2026-01-02T08:00:00Z',
  },
  {
    id: 't-2',
    nip: '198203102009022005',
    name: 'Siti Rahmawati, S.Pd.',
    email: 'siti.rahmawati@sman1tuntang.sch.id',
    phone: '081334455667',
    primarySubject: 'Bahasa Indonesia',
    defaultPassword: 'guru123',
    passwordHash: 'guru123',
    mustChangePassword: true,
    isActive: true,
    createdAt: '2026-01-02T08:30:00Z',
  },
  {
    id: 't-3',
    nip: '198811202014031003',
    name: 'Ahmad Fauzi, M.Pd.',
    email: 'ahmad.fauzi@sman1tuntang.sch.id',
    phone: '081445566778',
    primarySubject: 'Fisika',
    defaultPassword: 'guru123',
    passwordHash: 'guru123',
    mustChangePassword: false,
    isActive: true,
    createdAt: '2026-01-03T09:00:00Z',
  },
  {
    id: 't-4',
    nip: '199004052019032011',
    name: 'Dewi Lestari, S.Si.',
    email: 'dewi.lestari@sman1tuntang.sch.id',
    phone: '081556677889',
    primarySubject: 'Biologi',
    defaultPassword: 'guru123',
    passwordHash: 'guru123',
    mustChangePassword: false,
    isActive: true,
    createdAt: '2026-01-03T10:00:00Z',
  },
  {
    id: 't-5',
    nip: '197906182008011009',
    name: 'Eko Prasetyo, S.Pd.',
    email: 'eko.prasetyo@sman1tuntang.sch.id',
    phone: '081667788990',
    primarySubject: 'Sejarah Indonesia',
    defaultPassword: 'guru123',
    passwordHash: 'guru123',
    mustChangePassword: false,
    isActive: true,
    createdAt: '2026-01-04T11:00:00Z',
  }
];

export const INITIAL_JOURNALS: JournalEntry[] = [
  {
    id: 'j-1',
    teacherId: 't-1',
    teacherNip: '197508152006041002',
    teacherName: 'Budi Santoso, S.Pd., M.Si.',
    date: '2026-07-25',
    kelas: 'XI-1',
    mapel: 'Matematika Umum',
    jamPelajaran: [1, 2],
    materi: 'Logika Matematika: Penarikan kesimpulan Modus Ponens, Modus Tollens, dan Silogisme.',
    attendance: {
      hadir: 34,
      sakit: 1,
      izin: 1,
      alpa: 0,
      notes: 'Sakit: Anita (surat), Izin: Bagas (lomba OSN Matematika)'
    },
    hambatan: 'Beberapa siswa masih terkecoh pada pemisahan klausa negasi p dan q.',
    metodePembelajaran: 'Diskusi Kelompok & Problem Based Learning',
    mediaPembelajaran: 'LKPD, LCD Projector',
    createdAt: '2026-07-25T08:30:00Z',
    updatedAt: '2026-07-25T08:30:00Z',
    syncedToSheets: true
  },
  {
    id: 'j-2',
    teacherId: 't-2',
    teacherNip: '198203102009022005',
    teacherName: 'Siti Rahmawati, S.Pd.',
    date: '2026-07-25',
    kelas: 'X-2',
    mapel: 'Bahasa Indonesia',
    jamPelajaran: [3, 4, 5],
    materi: 'Analisis Struktur Teks Laporan Hasil Observasi (LHO) Lingkungan Sekolah.',
    attendance: {
      hadir: 35,
      sakit: 0,
      izin: 0,
      alpa: 1,
      notes: 'Alpa: Candra (Tanpa keterangan, sudah disampaikan ke Wali Kelas/BK)'
    },
    hambatan: 'Siswa antusias melakukan observasi di taman sekolah SMAN 1 Tuntang.',
    metodePembelajaran: 'Observasi Lapangan & Presentasi',
    mediaPembelajaran: 'Papan Tulis, Modul Ajar',
    createdAt: '2026-07-25T11:15:00Z',
    updatedAt: '2026-07-25T11:15:00Z',
    syncedToSheets: true
  },
  {
    id: 'j-3',
    teacherId: 't-3',
    teacherNip: '198811202014031003',
    teacherName: 'Ahmad Fauzi, M.Pd.',
    date: '2026-07-24',
    kelas: 'XII-1',
    mapel: 'Fisika',
    jamPelajaran: [6, 7],
    materi: 'Hukum Ohm dan Rangkaian Hambatan Seri-Paralel.',
    attendance: {
      hadir: 32,
      sakit: 2,
      izin: 0,
      alpa: 0,
      notes: 'Sakit: Dimas, Erna'
    },
    hambatan: 'Praktikum berjalan lancar di Lab Fisika.',
    metodePembelajaran: 'Praktikum Laboratorium',
    mediaPembelajaran: 'Multimeter, Kit Listrik, Virtual Lab PhET',
    createdAt: '2026-07-24T14:00:00Z',
    updatedAt: '2026-07-24T14:00:00Z',
    syncedToSheets: false
  }
];
