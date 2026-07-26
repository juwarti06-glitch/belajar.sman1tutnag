import { JournalEntry } from '../types';

/**
 * Send a single journal entry to Google Sheets via Webhook AppScript URL
 */
export async function syncJournalToGoogleSheets(webhookUrl: string, journal: JournalEntry): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.trim()) {
    return { success: false, message: 'URL Webhook Google Sheets belum dikonfigurasi oleh Admin.' };
  }

  try {
    const payload = {
      action: 'ADD_JOURNAL',
      id: journal.id,
      tanggal: journal.date,
      nipGuru: journal.teacherNip,
      namaGuru: journal.teacherName,
      kelas: journal.kelas,
      mapel: journal.mapel,
      jamPelajaran: journal.jamPelajaran.sort((a, b) => a - b).join(', '),
      materi: journal.materi,
      presensiHadir: journal.attendance.hadir,
      presensiSakit: journal.attendance.sakit,
      presensiIzin: journal.attendance.izin,
      presensiAlpa: journal.attendance.alpa,
      catatanSiswa: journal.attendance.notes || '-',
      hambatan: journal.hambatan || '-',
      metodePembelajaran: journal.metodePembelajaran || '-',
      mediaPembelajaran: journal.mediaPembelajaran || '-',
      timestamp: new Date().toISOString()
    };

    // Use mode 'no-cors' if standard fetch triggers CORS in browser preview,
    // or standard JSON POST request
    const response = await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      message: 'Berhasil dikirim ke Google Sheets Spreadsheet!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal sinkronisasi ke Google Sheets: ${err.message || 'Network error'}`
    };
  }
}

/**
 * Generate Google Apps Script code for SMAN 1 Tuntang Google Sheets Backend
 */
export function getGoogleAppsScriptCode(): string {
  return `/**
 * Google Apps Script - SMAN 1 Tuntang Jurnal Mengajar Webhook
 * Tempelkan kode ini di Extensions > Apps Script pada Google Sheets Anda.
 * Lalu Deploy sebagai Web App (Access: Anyone / Siapa saja).
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Buat Header jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "ID Jurnal", "Tanggal", "NIP Guru", "Nama Guru", "Kelas", "Mapel", 
        "Jam ke- (JP)", "Materi / Agenda", "Hadir", "Sakit", "Izin", "Alpa", 
        "Catatan Presensi", "Hambatan", "Metode", "Media", "Waktu Input"
      ]);
      sheet.getRange(1, 1, 1, 17).setFontWeight("bold").setBackground("#1e3a8a").setFontColor("#ffffff");
    }
    
    // Append data row
    sheet.appendRow([
      data.id,
      data.tanggal,
      "'" + data.nipGuru,
      data.namaGuru,
      data.kelas,
      data.mapel,
      data.jamPelajaran,
      data.materi,
      data.presensiHadir,
      data.presensiSakit,
      data.presensiIzin,
      data.presensiAlpa,
      data.catatanSiswa,
      data.hambatan,
      data.metodePembelajaran,
      data.mediaPembelajaran,
      data.timestamp
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "message": "Jurnal berhasil disimpan" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
}
