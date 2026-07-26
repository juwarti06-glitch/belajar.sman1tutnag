import React, { useState, useEffect } from 'react';
import { Teacher, JournalEntry, UserRole, ActiveTab, AdminSettings } from './types';
import {
  getStoredTeachers,
  saveStoredTeachers,
  getStoredJournals,
  saveStoredJournals,
  getStoredSettings,
  saveStoredSettings,
  getStoredSessionUser,
  setStoredSessionUser,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  addTeacher,
  batchImportTeachers,
  resetDataToDefault,
} from './utils/storage';
import { syncJournalToGoogleSheets } from './utils/sheets';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { JournalForm } from './components/JournalForm';
import { JournalHistory } from './components/JournalHistory';
import { AdminDashboard } from './components/AdminDashboard';
import { PrintJournalModal } from './components/PrintJournalModal';
import { BookOpen, ShieldCheck, Sparkles, PlusCircle, History, BarChart2, Users, Settings, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Application State
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [settings, setSettings] = useState<AdminSettings>(getStoredSettings());

  // Auth & Session State
  const [currentUser, setCurrentUser] = useState<Teacher | null>(null);
  const [role, setRole] = useState<UserRole>('GURU');

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('INPUT_JURNAL');

  // Modal Controls
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // Print Modal State
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [singlePrintEntry, setSinglePrintEntry] = useState<JournalEntry | null>(null);
  const [batchPrintList, setBatchPrintList] = useState<JournalEntry[]>([]);

  // Load Initial Data
  useEffect(() => {
    const loadedTeachers = getStoredTeachers();
    const loadedJournals = getStoredJournals();
    const loadedSettings = getStoredSettings();
    const loadedUser = getStoredSessionUser();

    setTeachers(loadedTeachers);
    setJournals(loadedJournals);
    setSettings(loadedSettings);

    if (loadedUser) {
      setCurrentUser(loadedUser);
      setRole(loadedUser.nip === '198001012005011001' ? 'ADMIN' : 'GURU');
    } else {
      // Default to Budi Santoso demo account if not logged in
      const defaultDemoTeacher = loadedTeachers.find(t => t.nip === '197508152006041002') || loadedTeachers[0];
      setCurrentUser(defaultDemoTeacher);
      setRole('GURU');
    }
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (user: Teacher, newRole: UserRole) => {
    setCurrentUser(user);
    setRole(newRole);
    setStoredSessionUser(user);

    if (newRole === 'ADMIN') {
      setActiveTab('ADMIN_MONITORING');
    } else {
      setActiveTab('INPUT_JURNAL');
    }
  };

  const handleLogout = () => {
    setStoredSessionUser(null);
    setCurrentUser(null);
    setIsLoginOpen(true);
  };

  const handlePasswordChanged = (newPassword: string) => {
    if (!currentUser) return;
    const updatedTeachers = teachers.map((t) => {
      if (t.id === currentUser.id) {
        return {
          ...t,
          passwordHash: newPassword,
          mustChangePassword: false,
        };
      }
      return t;
    });

    setTeachers(updatedTeachers);
    saveStoredTeachers(updatedTeachers);

    const updatedUser = { ...currentUser, passwordHash: newPassword, mustChangePassword: false };
    setCurrentUser(updatedUser);
    setStoredSessionUser(updatedUser);
  };

  // Journal Operations
  const handleSaveJournal = async (
    entryPayload: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>,
    sendSheets: boolean
  ) => {
    let saved: JournalEntry;

    if (editingEntry) {
      const res = updateJournalEntry(editingEntry.id, entryPayload);
      saved = res || { ...entryPayload, id: editingEntry.id, createdAt: editingEntry.createdAt, updatedAt: new Date().toISOString() };
      setJournals(getStoredJournals());
      setEditingEntry(null);
    } else {
      saved = addJournalEntry(entryPayload);
      setJournals(getStoredJournals());
    }

    if (sendSheets && settings.googleSheetsWebhookUrl) {
      await syncJournalToGoogleSheets(settings.googleSheetsWebhookUrl, saved);
    }
  };

  const handleDeleteJournal = (id: string) => {
    deleteJournalEntry(id);
    setJournals(getStoredJournals());
  };

  const handleEditJournal = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setActiveTab('INPUT_JURNAL');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Teachers Handlers
  const handleAddTeacher = (teacherData: Omit<Teacher, 'id' | 'createdAt'>) => {
    addTeacher(teacherData);
    setTeachers(getStoredTeachers());
  };

  const handleBatchImport = (data: Array<{ nip: string; name: string; defaultPassword?: string; primarySubject?: string }>) => {
    const result = batchImportTeachers(data);
    setTeachers(getStoredTeachers());
    return result;
  };

  const handleResetTeacherPassword = (nip: string) => {
    const updated = teachers.map((t) => {
      if (t.nip === nip) {
        return { ...t, passwordHash: 'guru123', defaultPassword: 'guru123', mustChangePassword: true };
      }
      return t;
    });
    setTeachers(updated);
    saveStoredTeachers(updated);
  };

  const handleToggleTeacherStatus = (nip: string) => {
    const updated = teachers.map((t) => {
      if (t.nip === nip) {
        return { ...t, isActive: !t.isActive };
      }
      return t;
    });
    setTeachers(updated);
    saveStoredTeachers(updated);
  };

  const handleDeleteTeacher = (nip: string) => {
    const filtered = teachers.filter((t) => t.nip !== nip);
    setTeachers(filtered);
    saveStoredTeachers(filtered);
  };

  // Admin Settings Handler
  const handleSaveSettings = (newSettings: AdminSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Print Handlers
  const handlePrintSingle = (entry: JournalEntry) => {
    setSinglePrintEntry(entry);
    setBatchPrintList([]);
    setPrintModalOpen(true);
  };

  const handlePrintBatch = (filteredJournals: JournalEntry[]) => {
    setSinglePrintEntry(null);
    setBatchPrintList(filteredJournals);
    setPrintModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 flex flex-col selection:bg-teal-500 selection:text-white">
      
      {/* Top Main Navigation Header */}
      <Header
        user={currentUser}
        role={role}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginOpen(true)}
        onChangePassword={() => setIsChangePasswordOpen(true)}
        settings={settings}
      />

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Welcome & Role Context Banner */}
        {currentUser && (
          <div className="mb-6 bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-blue-800/40">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-400/20 text-teal-300 border border-teal-400/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight">
                  Selamat Datang, {currentUser.name}!
                </h1>
                <p className="text-xs text-slate-300">
                  Aplikasi Jurnal Mengajar Online SMAN 1 Tuntang — {role === 'ADMIN' ? 'Mode Administrator' : `Pengampu ${currentUser.primarySubject}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs self-end sm:self-center">
              <button
                onClick={() => {
                  if (confirm('Reset seluruh data jurnal dan akun ke awal sampel SMAN 1 Tuntang?')) {
                    resetDataToDefault();
                    window.location.reload();
                  }
                }}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
                title="Reset Sampel Data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Data Demo</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content Display */}
        {activeTab === 'INPUT_JURNAL' && currentUser && (
          <JournalForm
            user={currentUser}
            settings={settings}
            onSave={handleSaveJournal}
            editingEntry={editingEntry}
            onCancelEdit={() => setEditingEntry(null)}
          />
        )}

        {activeTab === 'RIWAYAT_GURU' && (
          <JournalHistory
            journals={journals}
            currentUser={currentUser}
            isAdmin={role === 'ADMIN'}
            settings={settings}
            onEdit={handleEditJournal}
            onDelete={handleDeleteJournal}
            onPrintSingle={handlePrintSingle}
            onPrintBatch={handlePrintBatch}
          />
        )}

        {role === 'ADMIN' && (activeTab === 'ADMIN_MONITORING' || activeTab === 'ADMIN_GURU' || activeTab === 'ADMIN_SETTINGS') && (
          <AdminDashboard
            teachers={teachers}
            journals={journals}
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onAddTeacher={handleAddTeacher}
            onBatchImport={handleBatchImport}
            onResetTeacherPassword={handleResetTeacherPassword}
            onToggleTeacherStatus={handleToggleTeacherStatus}
            onDeleteTeacher={handleDeleteTeacher}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="font-semibold text-slate-300">
            © {new Date().getFullYear()} {settings.schoolName} — Jurnal Mengajar Guru Online
          </p>
          <p className="text-slate-500 text-[11px]">
            Dirancang khusus untuk efisiensi presensi & jurnal mengajar harian berbasis web responsive (Mobile, Tablet & PC).
          </p>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        teachers={teachers}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Change Password Modal */}
      {currentUser && (
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          user={currentUser}
          onPasswordChanged={handlePasswordChanged}
        />
      )}

      {/* Print Official Journal Document Modal */}
      <PrintJournalModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        journals={batchPrintList.length > 0 ? batchPrintList : journals}
        settings={settings}
        singleEntry={singlePrintEntry}
        teacher={currentUser}
      />
    </div>
  );
}
