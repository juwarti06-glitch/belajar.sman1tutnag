import { Teacher, JournalEntry, AdminSettings } from '../types';
import { INITIAL_TEACHERS, INITIAL_JOURNALS, INITIAL_SETTINGS } from '../data/initialData';

const KEYS = {
  TEACHERS: 'sman1_tuntang_teachers_v1',
  JOURNALS: 'sman1_tuntang_journals_v1',
  SETTINGS: 'sman1_tuntang_settings_v1',
  CURRENT_USER: 'sman1_tuntang_current_user_v1',
};

// Settings
export function getStoredSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveStoredSettings(settings: AdminSettings): void {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// Teachers
export function getStoredTeachers(): Teacher[] {
  try {
    const raw = localStorage.getItem(KEYS.TEACHERS);
    if (!raw) {
      localStorage.setItem(KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
      return INITIAL_TEACHERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TEACHERS;
  }
}

export function saveStoredTeachers(teachers: Teacher[]): void {
  localStorage.setItem(KEYS.TEACHERS, JSON.stringify(teachers));
}

export function addTeacher(teacher: Omit<Teacher, 'id' | 'createdAt'>): Teacher {
  const teachers = getStoredTeachers();
  const newTeacher: Teacher = {
    ...teacher,
    id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  teachers.push(newTeacher);
  saveStoredTeachers(teachers);
  return newTeacher;
}

export function batchImportTeachers(newTeachersData: Array<{ nip: string; name: string; defaultPassword?: string; primarySubject?: string }>): { added: number; updated: number } {
  const existing = getStoredTeachers();
  let added = 0;
  let updated = 0;

  newTeachersData.forEach((item) => {
    const nipClean = item.nip.toString().trim();
    if (!nipClean) return;

    const index = existing.findIndex((t) => t.nip === nipClean);
    if (index >= 0) {
      // Update
      existing[index] = {
        ...existing[index],
        name: item.name || existing[index].name,
        primarySubject: item.primarySubject || existing[index].primarySubject,
        defaultPassword: item.defaultPassword || existing[index].defaultPassword || 'guru123',
      };
      updated++;
    } else {
      // Create new
      existing.push({
        id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        nip: nipClean,
        name: item.name,
        email: `${nipClean}@sman1tuntang.sch.id`,
        primarySubject: item.primarySubject || 'Matematika Umum',
        defaultPassword: item.defaultPassword || 'guru123',
        passwordHash: item.defaultPassword || 'guru123',
        mustChangePassword: true,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      added++;
    }
  });

  saveStoredTeachers(existing);
  return { added, updated };
}

// Journals
export function getStoredJournals(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(KEYS.JOURNALS);
    if (!raw) {
      localStorage.setItem(KEYS.JOURNALS, JSON.stringify(INITIAL_JOURNALS));
      return INITIAL_JOURNALS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_JOURNALS;
  }
}

export function saveStoredJournals(journals: JournalEntry[]): void {
  localStorage.setItem(KEYS.JOURNALS, JSON.stringify(journals));
}

export function addJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): JournalEntry {
  const journals = getStoredJournals();
  const newEntry: JournalEntry = {
    ...entry,
    id: `j-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  journals.unshift(newEntry);
  saveStoredJournals(journals);
  return newEntry;
}

export function updateJournalEntry(id: string, updated: Partial<JournalEntry>): JournalEntry | null {
  const journals = getStoredJournals();
  const index = journals.findIndex((j) => j.id === id);
  if (index === -1) return null;

  journals[index] = {
    ...journals[index],
    ...updated,
    updatedAt: new Date().toISOString(),
  };
  saveStoredJournals(journals);
  return journals[index];
}

export function deleteJournalEntry(id: string): boolean {
  const journals = getStoredJournals();
  const filtered = journals.filter((j) => j.id !== id);
  saveStoredJournals(filtered);
  return filtered.length < journals.length;
}

// Session
export function getStoredSessionUser(): Teacher | null {
  try {
    const raw = localStorage.getItem(KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredSessionUser(user: Teacher | null): void {
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
}

// Reset sample data capability
export function resetDataToDefault(): void {
  localStorage.setItem(KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
  localStorage.setItem(KEYS.JOURNALS, JSON.stringify(INITIAL_JOURNALS));
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
}
