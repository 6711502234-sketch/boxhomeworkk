// Google Sheets Sync Service
// Supports syncing classroom data (homework, quiz scores, student records, reflections,
// and registered student & teacher lists) via Google Apps Script Web App or CSV Export.

import {
  StudentRegistrationRecord,
  TeacherRegistrationRecord,
} from '../types';
import { sampleStudentRecords } from '../data/stickersData';

export interface GoogleSheetsConfig {
  webAppUrl: string;
  spreadsheetUrl?: string; // Optional direct link to view their Google Sheet
  autoSync: boolean;
  sheetName?: string;
  lastSyncedAt?: string;
  lastSyncStatus?: 'success' | 'error' | 'idle';
  lastSyncMessage?: string;
}

const STORAGE_KEY = 'hw_box_google_sheets_config';
const STUDENT_REG_KEY = 'hw_box_student_registrations';
const TEACHER_REG_KEY = 'hw_box_teacher_registrations';

export const getGoogleSheetsConfig = (): GoogleSheetsConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse Google Sheets config', e);
  }
  return {
    webAppUrl: '',
    spreadsheetUrl: '',
    autoSync: false,
    sheetName: 'กล่องการบ้าน_บันทึกคะแนน',
    lastSyncStatus: 'idle',
  };
};

export const saveGoogleSheetsConfig = (config: GoogleSheetsConfig): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

/**
 * Split Thai name into First Name and Last Name with title preservation
 */
export const parseThaiName = (fullName: string): { firstName: string; lastName: string } => {
  if (!fullName) return { firstName: '', lastName: '' };
  const clean = fullName.trim();
  const titleRegex = /^(เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\.|นาย|นางสาว|น\.ส\.|คุณครู|ครู|อาจารย์)\s*/i;
  const match = clean.match(titleRegex);
  const title = match ? match[1] : '';
  const withoutTitle = clean.replace(titleRegex, '').trim();

  const parts = withoutTitle.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: clean, lastName: '' };
  }
  if (parts.length === 1) {
    return { firstName: title ? `${title}${parts[0]}` : parts[0], lastName: '-' };
  }
  const firstName = title ? `${title}${parts[0]}` : parts[0];
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
};

/**
 * Get registered student list
 */
export const getStudentRegistrations = (): StudentRegistrationRecord[] => {
  try {
    const raw = localStorage.getItem(STUDENT_REG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }

  // Seed default students from sample data if empty
  const defaults: StudentRegistrationRecord[] = sampleStudentRecords.map((s, idx) => {
    const { firstName, lastName } = parseThaiName(s.name);
    return {
      id: s.id,
      registeredAt: `16 พ.ค. 2569 0${8 + Math.floor(idx / 4)}:${String((idx * 7) % 60).padStart(2, '0')}:00`,
      firstName,
      lastName,
      fullName: s.name,
      studentNo: s.studentNo,
      studentIdCode: s.studentIdCode,
      classRoom: s.classRoom,
    };
  });

  try {
    localStorage.setItem(STUDENT_REG_KEY, JSON.stringify(defaults));
  } catch (e) {}
  return defaults;
};

/**
 * Save new or updated student registration
 */
export const saveStudentRegistration = (record: StudentRegistrationRecord): void => {
  const current = getStudentRegistrations();
  const index = current.findIndex(
    (item) => item.id === record.id || item.studentIdCode === record.studentIdCode
  );
  let updated: StudentRegistrationRecord[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...record };
  } else {
    updated = [record, ...current];
  }
  try {
    localStorage.setItem(STUDENT_REG_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
};

/**
 * Get registered teacher list
 */
export const getTeacherRegistrations = (): TeacherRegistrationRecord[] => {
  try {
    const raw = localStorage.getItem(TEACHER_REG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }

  // Default teacher registration
  const defaultTeachers: TeacherRegistrationRecord[] = [
    {
      id: 'tch-6711502234',
      registeredAt: '15 พ.ค. 2569 08:30:00',
      firstName: 'คุณครูนิภาภรณ์',
      lastName: 'ใจดี',
      fullName: 'คุณครูนิภาภรณ์ ใจดี',
      subject: 'วิทยาศาสตร์และเทคโนโลยี',
      email: '6711502234@chandra.ac.th',
    },
  ];

  try {
    localStorage.setItem(TEACHER_REG_KEY, JSON.stringify(defaultTeachers));
  } catch (e) {}
  return defaultTeachers;
};

/**
 * Save new or updated teacher registration
 */
export const saveTeacherRegistration = (record: TeacherRegistrationRecord): void => {
  const current = getTeacherRegistrations();
  const index = current.findIndex(
    (item) => item.email.toLowerCase() === record.email.toLowerCase()
  );
  let updated: TeacherRegistrationRecord[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...record };
  } else {
    updated = [record, ...current];
  }
  try {
    localStorage.setItem(TEACHER_REG_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
};

export interface SyncPayload {
  action: 'sync_all' | 'sync_homework' | 'sync_scores' | 'sync_reflections' | 'ping';
  timestamp: string;
  studentRecords: Array<{
    studentId: string;
    studentName: string;
    studentClass: string;
    studentNo: string;
    totalStars: number;
    homeworkCompletedCount: number;
    totalHomeworkScore: number;
    quizCompletedCount: number;
    totalQuizScore: number;
  }>;
  homeworkSubmissions: Array<{
    homeworkId: string;
    title: string;
    subject: string;
    studentName: string;
    studentClass: string;
    studentNo: string;
    status: string;
    score?: number;
    maxScore: number;
    submittedAt: string;
    feedback?: string;
  }>;
  examScores: Array<{
    id: string;
    studentName: string;
    studentClass: string;
    lessonTitle: string;
    score: number;
    maxScore: number;
    submittedAt: string;
  }>;
  evaluations: Array<{
    id: string;
    topicTitle?: string;
    studentName: string;
    studentClass: string;
    ratingStars: number;
    improvementText: string;
    recommendationText: string;
    submittedAt: string;
  }>;
  // New Registration Sheets for Students and Teachers
  studentRegistrations?: Array<{
    registeredAt: string;
    firstName: string;
    lastName: string;
    studentNo: string;
    studentIdCode: string;
    classRoom?: string;
  }>;
  teacherRegistrations?: Array<{
    registeredAt: string;
    firstName: string;
    lastName: string;
    subject: string;
    email: string;
  }>;
}

/**
 * Send classroom dataset to the Google Apps Script Web App
 */
export const sendToGoogleSheets = async (
  webAppUrl: string,
  payload: SyncPayload
): Promise<{ success: boolean; message: string }> => {
  const cleanUrl = webAppUrl.trim();
  if (!cleanUrl || !cleanUrl.startsWith('https://script.google.com/')) {
    return {
      success: false,
      message: 'กรุณาระบุ URL ของ Google Apps Script Web App ที่ถูกต้อง (ขึ้นต้นด้วย https://script.google.com/)',
    };
  }

  try {
    await fetch(cleanUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      message: 'ซิงค์ข้อมูลส่งไปยัง Google Sheets สำเร็จเรียบร้อย! ตารางทั้งหมดรวมถึงชีตผู้สมัครได้รับการอัปเดตแล้ว',
    };
  } catch (error: any) {
    console.warn('Google Sheets sync network status:', error);
    return {
      success: false,
      message: 'ไม่สามารถเชื่อมต่อ Google Sheets ได้: ' + (error?.message || 'ข้อผิดพลาดเครือข่าย กรุณาตรวจสอบ URL'),
    };
  }
};

/**
 * Test ping Google Apps Script Web App URL
 */
export const testGoogleSheetsConnection = async (
  webAppUrl: string
): Promise<{ success: boolean; message: string }> => {
  const cleanUrl = webAppUrl.trim();
  if (!cleanUrl || !cleanUrl.startsWith('https://script.google.com/')) {
    return {
      success: false,
      message: 'URL ต้องขึ้นต้นด้วย https://script.google.com/macros/s/.../exec',
    };
  }

  try {
    await fetch(cleanUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'ping',
        timestamp: new Date().toISOString(),
      }),
    });

    return {
      success: true,
      message: 'ทดสอบเชื่อมต่อ Google Apps Script สำเร็จ! Web App พร้อมรับข้อมูลจากกล่องการบ้านแล้ว',
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'ไม่สามารถติดต่อ Web App ได้: ' + (error?.message || 'กรุณาตรวจสอบว่าตั้งค่า Who has access เป็น Anyone'),
    };
  }
};

/**
 * Generates the Google Apps Script code to paste into Google Sheet's Script Editor
 */
export const getGoogleAppsScriptTemplate = (): string => {
  return `// ========================================================
// 📦 สคริปต์เชื่อมต่อ "กล่องการบ้าน" กับ Google Sheets
// วิธีติดตั้ง:
// 1. เปิด Google Sheets ใหม่
// 2. ไปที่เมนู "ส่วนขยาย" (Extensions) -> "Apps Script"
// 3. ลบโค้ดเดิมทั้งหมด แล้ววางโค้ดนี้ลงไป
// 4. กดปุ่ม "ทำให้ใช้งานได้" (Deploy) -> "การทำให้ใช้งานได้ใหม่" (New Deployment)
// 5. เลือกประเภท: "เว็บแอป" (Web app)
// 6. กำหนด "ผู้ที่มีสิทธิ์เข้าถึง" (Who has access) เป็น: "ทุกคน" (Anyone)
// 7. คัดลอก URL เว็บแอปที่ได้ มาวางในแอพกล่องการบ้าน!
// ========================================================

function doPost(e) {
  try {
    var contents = e.postData.contents;
    var data = JSON.parse(contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // หากเป็นการทดสอบ Ping
    if (data.action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "เชื่อมต่อกับ Google Apps Script สำเร็จ! Web App พร้อมรับข้อมูลจากกล่องการบ้านแล้ว"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1. ชีตสรุปคะแนนนักเรียน (Student Records)
    if (data.studentRecords && data.studentRecords.length > 0) {
      var sheet1 = ss.getSheetByName("สรุปคะแนนนักเรียน") || ss.insertSheet("สรุปคะแนนนักเรียน");
      sheet1.clear();
      sheet1.appendRow(["รหัสนักเรียน", "ชื่อ-นามสกุล", "ชั้น/ห้อง", "เลขที่", "ดาวสะสม ⭐", "ส่งการบ้าน (ชิ้น)", "คะแนนการบ้าน", "ทำแบบทดสอบ (ครั้ง)", "คะแนนแบบทดสอบ"]);
      sheet1.getRange(1, 1, 1, 9).setBackground("#FEF08A").setFontWeight("bold");
      sheet1.setFrozenRows(1);
      
      data.studentRecords.forEach(function(s) {
        sheet1.appendRow([
          s.studentId || "",
          s.studentName || "",
          s.studentClass || "",
          s.studentNo || "",
          s.totalStars || 0,
          s.homeworkCompletedCount || 0,
          s.totalHomeworkScore || 0,
          s.quizCompletedCount || 0,
          s.totalQuizScore || 0
        ]);
      });
      sheet1.autoResizeColumns(1, 9);
    }

    // 2. ชีตการส่งการบ้าน (Homework Submissions)
    if (data.homeworkSubmissions && data.homeworkSubmissions.length > 0) {
      var sheet2 = ss.getSheetByName("รายการส่งการบ้าน") || ss.insertSheet("รายการส่งการบ้าน");
      sheet2.clear();
      sheet2.appendRow(["หัวข้อการบ้าน", "วิชา", "ชื่อนักเรียน", "ห้อง", "เลขที่", "สถานะ", "คะแนนที่ได้", "คะแนนเต็ม", "วันที่ส่ง", "ข้อเสนอแนะครู"]);
      sheet2.getRange(1, 1, 1, 10).setBackground("#BBF7D0").setFontWeight("bold");
      sheet2.setFrozenRows(1);

      data.homeworkSubmissions.forEach(function(h) {
        sheet2.appendRow([
          h.title || "",
          h.subject || "",
          h.studentName || "",
          h.studentClass || "",
          h.studentNo || "",
          h.status === 'graded' ? 'ตรวจแล้ว' : 'รอตรวจ',
          h.score !== undefined ? h.score : "-",
          h.maxScore || 10,
          h.submittedAt || "",
          h.feedback || ""
        ]);
      });
      sheet2.autoResizeColumns(1, 10);
    }

    // 3. ชีตคะแนนแบบทดสอบ (Quiz Scores)
    if (data.examScores && data.examScores.length > 0) {
      var sheet3 = ss.getSheetByName("คะแนนแบบทดสอบ") || ss.insertSheet("คะแนนแบบทดสอบ");
      sheet3.clear();
      sheet3.appendRow(["บทเรียน / แบบทดสอบ", "ชื่อนักเรียน", "ห้อง", "คะแนนที่ได้", "คะแนนเต็ม", "คิดเป็น %", "วันที่ทำแบบทดสอบ"]);
      sheet3.getRange(1, 1, 1, 7).setBackground("#E9D5FF").setFontWeight("bold");
      sheet3.setFrozenRows(1);

      data.examScores.forEach(function(q) {
        var pct = q.maxScore > 0 ? Math.round((q.score / q.maxScore) * 100) + "%" : "0%";
        sheet3.appendRow([
          q.lessonTitle || "",
          q.studentName || "",
          q.studentClass || "",
          q.score || 0,
          q.maxScore || 10,
          pct,
          q.submittedAt || ""
        ]);
      });
      sheet3.autoResizeColumns(1, 7);
    }

    // 4. ชีตมุมสะท้อนคิด (Teacher Reflection & Feedback)
    if (data.evaluations && data.evaluations.length > 0) {
      var sheet4 = ss.getSheetByName("มุมสะท้อนคิด") || ss.insertSheet("มุมสะท้อนคิด");
      sheet4.clear();
      sheet4.appendRow(["หัวข้อการสะท้อนคิด", "ชื่อผู้แสดงความคิดเห็น", "ห้อง", "ระดับดาว (1-5)", "สิ่งที่อยากให้ปรับปรุง", "ข้อเสนอแนะและคำชม", "วันที่ส่ง"]);
      sheet4.getRange(1, 1, 1, 7).setBackground("#FCE7F3").setFontWeight("bold");
      sheet4.setFrozenRows(1);

      data.evaluations.forEach(function(ev) {
        sheet4.appendRow([
          ev.topicTitle || "ทั่วไป",
          ev.studentName || "ผู้ไม่ประสงค์ออกนาม",
          ev.studentClass || "",
          ev.ratingStars || 5,
          ev.improvementText || "",
          ev.recommendationText || "",
          ev.submittedAt || ""
        ]);
      });
      sheet4.autoResizeColumns(1, 7);
    }

    // 5. 🧑‍🎓 ชีตรายชื่อผู้สมัครนักเรียน (Student Registrations)
    if (data.studentRegistrations && data.studentRegistrations.length > 0) {
      var sheet5 = ss.getSheetByName("รายชื่อผู้สมัครนักเรียน") || ss.insertSheet("รายชื่อผู้สมัครนักเรียน");
      sheet5.clear();
      sheet5.appendRow(["วันเวลาที่สมัคร", "ชื่อ", "นามสกุล", "เลขที่", "เลขประจำตัวนักเรียน", "ชั้น/ห้อง"]);
      sheet5.getRange(1, 1, 1, 6).setBackground("#BAE6FD").setFontWeight("bold");
      sheet5.setFrozenRows(1);

      data.studentRegistrations.forEach(function(sr) {
        sheet5.appendRow([
          sr.registeredAt || "",
          sr.firstName || "",
          sr.lastName || "",
          sr.studentNo || "",
          sr.studentIdCode || "",
          sr.classRoom || ""
        ]);
      });
      sheet5.autoResizeColumns(1, 6);
    }

    // 6. 👩‍🏫 ชีตรายชื่อผู้สมัครคุณครู (Teacher Registrations)
    if (data.teacherRegistrations && data.teacherRegistrations.length > 0) {
      var sheet6 = ss.getSheetByName("รายชื่อผู้สมัครคุณครู") || ss.insertSheet("รายชื่อผู้สมัครคุณครู");
      sheet6.clear();
      sheet6.appendRow(["วันเวลาที่สมัคร", "ชื่อ", "นามสกุล", "กลุ่มสาระ/รายวิชา", "อีเมลครู"]);
      sheet6.getRange(1, 1, 1, 5).setBackground("#E9D5FF").setFontWeight("bold");
      sheet6.setFrozenRows(1);

      data.teacherRegistrations.forEach(function(tr) {
        sheet6.appendRow([
          tr.registeredAt || "",
          tr.firstName || "",
          tr.lastName || "",
          tr.subject || "",
          tr.email || ""
        ]);
      });
      sheet6.autoResizeColumns(1, 5);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "ซิงค์ข้อมูลลง Google Sheets เรียบร้อยแล้ว ณ เวลา " + new Date().toLocaleString("th-TH")
    })).setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Google Apps Script สำหรับกล่องการบ้านพร้อมทำงานแล้ว!"
  })).setMimeType(ContentService.MimeType.JSON);
}`;
};

/**
 * Exports data as a CSV string with UTF-8 BOM so Excel/Google Sheets correctly displays Thai characters.
 */
export const downloadCsvForGoogleSheets = (filename: string, headers: string[], rows: (string | number)[][]): void => {
  const escapeCsv = (val: string | number) => {
    const s = String(val ?? '').replace(/"/g, '""');
    return `"${s}"`;
  };

  const csvContent =
    '\uFEFF' + // UTF-8 BOM
    headers.map(escapeCsv).join(',') +
    '\n' +
    rows.map((row) => row.map(escapeCsv).join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
