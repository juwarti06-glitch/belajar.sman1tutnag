export type UserRole = 'ADMIN' | 'GURU';

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  email?: string;
  phone?: string;
  primarySubject: string;
  defaultPassword?: string;
  passwordHash?: string;
  mustChangePassword?: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Attendance {
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  notes?: string; // Names of absent/problematic students
}

export interface JournalEntry {
  id: string;
  teacherId: string;
  teacherNip: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  kelas: string; // e.g., 'X-1', 'XI-MIPA-2', 'XII-IPS-1'
  mapel: string; // Subject name
  jamPelajaran: number[]; // Array of JP numbers, e.g., [1, 2, 3]
  materi: string; // Learning material / agenda
  attendance: Attendance;
  hambatan?: string; // Learning obstacles / notes
  metodePembelajaran?: string; // e.g., 'Diskusi Kelompok, Praktikum'
  mediaPembelajaran?: string; // e.g., 'LCD Projector, Google Classroom'
  createdAt: string;
  updatedAt: string;
  syncedToSheets?: boolean;
}

export interface AdminSettings {
  schoolName: string;
  schoolNpsn: string;
  headmasterName: string;
  headmasterNip: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  googleSheetsWebhookUrl?: string;
  autoSyncSheets: boolean;
}

export type ActiveTab = 'INPUT_JURNAL' | 'RIWAYAT_GURU' | 'ADMIN_GURU' | 'ADMIN_MONITORING' | 'ADMIN_SETTINGS';
