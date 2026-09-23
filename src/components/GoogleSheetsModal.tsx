import React, { useState, useEffect } from 'react';
import {
  GoogleSheetsConfig,
  getGoogleSheetsConfig,
  saveGoogleSheetsConfig,
  sendToGoogleSheets,
  testGoogleSheetsConnection,
  getGoogleAppsScriptTemplate,
  downloadCsvForGoogleSheets,
  SyncPayload,
  getStudentRegistrations,
  getTeacherRegistrations,
} from '../services/googleSheetsService';
import {
  Homework,
  StudentExamScore,
  TeacherEvaluation,
  StudentRecord,
  StudentRegistrationRecord,
  TeacherRegistrationRecord,
} from '../types';
import { triggerFestiveConfetti, triggerStarBurst } from '../utils/confetti';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Download,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Link,
  PlusCircle,
  CheckCircle,
  UserCheck,
  GraduationCap,
  Users,
} from 'lucide-react';

export const GoogleSheetsIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="8" fill="#0F9D58" />
    <path
      d="M31 12H17C15.3431 12 14 13.3431 14 15V33C14 34.6569 15.3431 36 17 36H31C32.6569 36 34 34.6569 34 33V15C34 13.3431 32.6569 12 31 12Z"
      fill="white"
    />
    <path d="M19 19H29M19 24H29M19 29H29M24 16V32" stroke="#0F9D58" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentRecords?: StudentRecord[];
  homeworkList?: Homework[];
  examScores?: StudentExamScore[];
  evaluations?: TeacherEvaluation[];
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  studentRecords = [],
  homeworkList = [],
  examScores = [],
  evaluations = [],
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'guide' | 'csv'>('sync');
  const [config, setConfig] = useState<GoogleSheetsConfig>(getGoogleSheetsConfig());
  const [urlInput, setUrlInput] = useState(config.webAppUrl);
  const [spreadsheetUrlInput, setSpreadsheetUrlInput] = useState(config.spreadsheetUrl || '');
  const [autoSyncInput, setAutoSyncInput] = useState(config.autoSync);

  // Status indicators
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Registrations state for quick stats & CSV download
  const [studentRegs, setStudentRegs] = useState<StudentRegistrationRecord[]>([]);
  const [teacherRegs, setTeacherRegs] = useState<TeacherRegistrationRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      const current = getGoogleSheetsConfig();
      setConfig(current);
      setUrlInput(current.webAppUrl);
      setSpreadsheetUrlInput(current.spreadsheetUrl || '');
      setAutoSyncInput(current.autoSync);
      setStatusMessage(null);
      setIsError(false);
      setStudentRegs(getStudentRegistrations());
      setTeacherRegs(getTeacherRegistrations());
    }
  }, [isOpen]);

  const handleSaveSettings = () => {
    const updated: GoogleSheetsConfig = {
      ...config,
      webAppUrl: urlInput.trim(),
      spreadsheetUrl: spreadsheetUrlInput.trim(),
      autoSync: autoSyncInput,
    };
    saveGoogleSheetsConfig(updated);
    setConfig(updated);
    setStatusMessage('บันทึกการตั้งค่า Google Sheets เรียบร้อยแล้ว!');
    setIsError(false);
    triggerStarBurst();
  };

  const handleTestConnection = async () => {
    const url = urlInput.trim();
    if (!url) {
      setStatusMessage('กรุณากรอก Web App URL ของ Google Apps Script ก่อนทำการทดสอบ');
      setIsError(true);
      return;
    }

    setIsTesting(true);
    setStatusMessage('กำลังทดสอบติดต่อกับ Google Apps Script Web App...');
    setIsError(false);

    const res = await testGoogleSheetsConnection(url);
    setIsTesting(false);
    setStatusMessage(res.message);
    setIsError(!res.success);

    if (res.success) {
      triggerStarBurst();
      const updated: GoogleSheetsConfig = {
        ...config,
        webAppUrl: url,
        spreadsheetUrl: spreadsheetUrlInput.trim(),
        autoSync: autoSyncInput,
        lastSyncStatus: 'success',
      };
      saveGoogleSheetsConfig(updated);
      setConfig(updated);
    }
  };

  const handleSyncNow = async () => {
    const url = urlInput.trim() || config.webAppUrl;
    if (!url) {
      setStatusMessage('กรุณาระบุ Web App URL เพื่อส่งข้อมูลไปยัง Google Sheets');
      setIsError(true);
      return;
    }

    setIsSyncing(true);
    setStatusMessage('กำลังส่งข้อมูลไปยัง Google Sheets...');
    setIsError(false);

    const freshStudentRegs = getStudentRegistrations();
    const freshTeacherRegs = getTeacherRegistrations();
    setStudentRegs(freshStudentRegs);
    setTeacherRegs(freshTeacherRegs);

    const payload: SyncPayload = {
      action: 'sync_all',
      timestamp: new Date().toLocaleString('th-TH'),
      studentRecords: studentRecords.map((s) => ({
        studentId: s.id,
        studentName: s.name,
        studentClass: s.classRoom,
        studentNo: s.studentNo,
        totalStars: s.totalStars,
        homeworkCompletedCount: s.homeworkCompletedCount ?? s.homeworkCount,
        totalHomeworkScore: s.totalHomeworkScore ?? 0,
        quizCompletedCount: s.quizCompletedCount ?? Object.keys(s.quizScores || {}).length,
        totalQuizScore: s.totalQuizScore ?? 0,
      })),
      homeworkSubmissions: homeworkList.map((h) => ({
        homeworkId: h.id,
        title: h.title,
        subject: h.subject,
        studentName: h.studentName,
        studentClass: h.studentClass,
        studentNo: h.studentNo || '',
        status: h.status,
        score: h.teacherScore ?? h.score,
        maxScore: h.maxScore || 10,
        submittedAt: h.submittedAt,
        feedback: h.teacherComment ?? h.feedback,
      })),
      examScores: examScores.map((e) => ({
        id: e.id,
        studentName: e.studentName,
        studentClass: e.studentClass,
        lessonTitle: e.lessonTitle,
        score: e.score,
        maxScore: e.maxScore,
        submittedAt: e.submittedAt,
      })),
      evaluations: evaluations.map((ev) => ({
        id: ev.id,
        topicTitle: ev.topicTitle,
        studentName: ev.studentName,
        studentClass: ev.studentClass,
        ratingStars: ev.ratingStars,
        improvementText: ev.improvementText,
        recommendationText: ev.recommendationText,
        submittedAt: ev.submittedAt,
      })),
      // 5. 🧑‍🎓 ชีตรายชื่อผู้สมัครนักเรียน
      studentRegistrations: freshStudentRegs.map((sr) => ({
        registeredAt: sr.registeredAt,
        firstName: sr.firstName,
        lastName: sr.lastName,
        studentNo: sr.studentNo,
        studentIdCode: sr.studentIdCode,
        classRoom: sr.classRoom,
      })),
      // 6. 👩‍🏫 ชีตรายชื่อผู้สมัครคุณครู
      teacherRegistrations: freshTeacherRegs.map((tr) => ({
        registeredAt: tr.registeredAt,
        firstName: tr.firstName,
        lastName: tr.lastName,
        subject: tr.subject,
        email: tr.email,
      })),
    };

    const res = await sendToGoogleSheets(url, payload);
    setIsSyncing(false);

    if (res.success) {
      triggerFestiveConfetti();
      const updated: GoogleSheetsConfig = {
        ...config,
        webAppUrl: url,
        spreadsheetUrl: spreadsheetUrlInput.trim(),
        autoSync: autoSyncInput,
        lastSyncedAt: new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }),
        lastSyncStatus: 'success',
        lastSyncMessage: res.message,
      };
      saveGoogleSheetsConfig(updated);
      setConfig(updated);
      setStatusMessage(res.message);
      setIsError(false);
    } else {
      setStatusMessage(res.message);
      setIsError(true);
    }
  };

  const handleCopyCode = () => {
    const code = getGoogleAppsScriptTemplate();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    triggerStarBurst();
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // =========================================================================
  // CSV Export functions (UTF-8 with BOM for Thai support)
  // =========================================================================

  // 1. ผู้สมัครนักเรียน (วันเวลาที่สมัคร, ชื่อ, นามสกุล, เลขที่, เลขประจำตัวนักเรียน, ชั้น/ห้อง)
  const handleExportStudentRegistrationCsv = () => {
    const headers = [
      'วันเวลาที่สมัคร',
      'ชื่อ',
      'นามสกุล',
      'เลขที่',
      'เลขประจำตัวนักเรียน',
      'ชั้น/ห้อง',
    ];
    const data = getStudentRegistrations();
    const rows = data.map((sr) => [
      sr.registeredAt,
      sr.firstName,
      sr.lastName,
      sr.studentNo,
      sr.studentIdCode,
      sr.classRoom || '',
    ]);
    downloadCsvForGoogleSheets('กล่องการบ้าน_รายชื่อผู้สมัครนักเรียน', headers, rows);
    triggerStarBurst();
  };

  // 2. ผู้สมัครคุณครู (วันเวลาที่สมัคร, ชื่อ, นามสกุล, กลุ่มสาระ/รายวิชา, อีเมลครู)
  const handleExportTeacherRegistrationCsv = () => {
    const headers = [
      'วันเวลาที่สมัคร',
      'ชื่อ',
      'นามสกุล',
      'กลุ่มสาระ/รายวิชา',
      'อีเมลครู',
    ];
    const data = getTeacherRegistrations();
    const rows = data.map((tr) => [
      tr.registeredAt,
      tr.firstName,
      tr.lastName,
      tr.subject,
      tr.email,
    ]);
    downloadCsvForGoogleSheets('กล่องการบ้าน_รายชื่อผู้สมัครคุณครู', headers, rows);
    triggerStarBurst();
  };

  // 3. สรุปคะแนนนักเรียน
  const handleExportStudentRecordCsv = () => {
    const headers = [
      'รหัสนักเรียน',
      'ชื่อ-นามสกุล',
      'ชั้น/ห้อง',
      'เลขที่',
      'ดาวสะสม ⭐',
      'การบ้านที่ส่งแล้ว',
      'คะแนนการบ้านสะสม',
      'ทำแบบทดสอบ (ครั้ง)',
      'คะแนนแบบทดสอบสะสม',
    ];
    const rows = studentRecords.map((s) => [
      s.id,
      s.name,
      s.classRoom,
      s.studentNo,
      s.totalStars,
      s.homeworkCompletedCount ?? s.homeworkCount,
      s.totalHomeworkScore ?? 0,
      s.quizCompletedCount ?? Object.keys(s.quizScores || {}).length,
      s.totalQuizScore ?? 0,
    ]);
    downloadCsvForGoogleSheets('กล่องการบ้าน_สรุปคะแนนนักเรียน', headers, rows);
    triggerStarBurst();
  };

  // 4. รายการส่งการบ้าน
  const handleExportHomeworkCsv = () => {
    const headers = [
      'หัวข้อการบ้าน',
      'วิชา',
      'ชื่อนักเรียน',
      'ห้อง',
      'เลขที่',
      'สถานะ',
      'คะแนนที่ได้',
      'คะแนนเต็ม',
      'วันที่ส่ง',
      'ข้อคิดเห็นคุณครู',
    ];
    const rows = homeworkList.map((h) => [
      h.title,
      h.subject,
      h.studentName,
      h.studentClass,
      h.studentNo || '',
      h.status === 'graded' ? 'ตรวจแล้ว' : 'รอตรวจ',
      h.teacherScore ?? h.score ?? '-',
      h.maxScore || 10,
      h.submittedAt,
      h.teacherComment ?? h.feedback ?? '',
    ]);
    downloadCsvForGoogleSheets('กล่องการบ้าน_รายการส่งการบ้าน', headers, rows);
    triggerStarBurst();
  };

  // 5. คะแนนแบบทดสอบ
  const handleExportQuizCsv = () => {
    const headers = ['บทเรียน/แบบทดสอบ', 'ชื่อนักเรียน', 'ห้อง', 'คะแนนที่ได้', 'คะแนนเต็ม', 'วันที่ทำ'];
    const rows = examScores.map((e) => [
      e.lessonTitle,
      e.studentName,
      e.studentClass,
      e.score,
      e.maxScore,
      e.submittedAt,
    ]);
    downloadCsvForGoogleSheets('กล่องการบ้าน_คะแนนแบบทดสอบ', headers, rows);
    triggerStarBurst();
  };

  // 6. มุมสะท้อนคิด
  const handleExportReflectionCsv = () => {
    const headers = [
      'หัวข้อสะท้อนคิด',
      'ชื่อผู้เขียน',
      'ห้อง',
      'ดาวความพึงพอใจ',
      'สิ่งที่อยากให้ปรับปรุง',
      'ข้อความกำลังใจ/คำชม',
      'วันที่ส่ง',
      'ครูตอบกลับ',
    ];
    const rows = evaluations.map((ev) => [
      ev.topicTitle || 'ทั่วไป',
      ev.studentName,
      ev.studentClass,
      ev.ratingStars,
      ev.improvementText,
      ev.recommendationText,
      ev.submittedAt,
      ev.teacherReply || '',
    ]);
    downloadCsvForGoogleSheets('กล่องการบ้าน_มุมสะท้อนคิด', headers, rows);
    triggerStarBurst();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFDF5] sketch-border-lg rounded-[26px_18px_24px_20px] p-5 sm:p-7 max-w-2xl w-full relative shadow-[8px_8px_0px_#18181b] max-h-[92vh] overflow-y-auto">
        {/* Washi Tape */}
        <div className="washi-tape -top-3.5 left-12 bg-emerald-200 rotate-[-2deg]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border border-zinc-300 cursor-pointer shadow-[1px_1px_0px_#000]"
          title="ปิดหน้าต่าง"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b-2 border-zinc-200">
          <div className="w-13 h-13 rounded-2xl bg-emerald-100 border-2 border-zinc-900 flex items-center justify-center p-2 shadow-[2px_2px_0px_#000] shrink-0">
            <GoogleSheetsIcon className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-zinc-900">
                เชื่อมต่อกับ Google Sheets
              </h3>
              <span className="bg-emerald-200 text-emerald-950 font-black text-[11px] px-2.5 py-0.5 rounded-full border border-zinc-900">
                Live Sync 6 ชีต
              </span>
            </div>
            <p className="text-xs font-semibold text-zinc-600 mt-0.5">
              ส่งออกและซิงค์ข้อมูลสมุดคะแนน การส่งงาน และชีตรายชื่อผู้สมัครนักเรียน & คุณครูแยกกันลง Google Spreadsheet
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-zinc-200 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('sync')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'sync'
                ? 'bg-emerald-300 text-emerald-950 border-2 border-zinc-900 shadow-[2px_2px_0px_#000]'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ซิงค์ข้อมูล (Live Sync)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('csv')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'csv'
                ? 'bg-emerald-300 text-emerald-950 border-2 border-zinc-900 shadow-[2px_2px_0px_#000]'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>ดาวน์โหลด CSV (6 หมวดหมู่)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'guide'
                ? 'bg-emerald-300 text-emerald-950 border-2 border-zinc-900 shadow-[2px_2px_0px_#000]'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>คู่มือติดตั้ง & สคริปต์</span>
          </button>
        </div>

        {/* Status Message Banner */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl border-2 text-xs font-bold flex items-center gap-2 ${
              isError
                ? 'bg-rose-50 border-rose-400 text-rose-800'
                : 'bg-emerald-50 border-emerald-400 text-emerald-900'
            }`}
          >
            {isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}

        {/* TAB 1: LIVE SYNC & CONFIG */}
        {activeTab === 'sync' && (
          <div className="mt-4 space-y-4">
            {/* Direct Spreadsheet Link if set */}
            {config.spreadsheetUrl && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950 truncate">
                  <ExternalLink className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="truncate">เข้าชม Google Spreadsheet ของคุณ:</span>
                </div>
                <a
                  href={config.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-white hover:bg-amber-100 text-amber-950 text-xs font-black rounded-lg border border-zinc-900 shadow-2xs inline-flex items-center gap-1 shrink-0"
                >
                  <span>เปิดดูใน Sheets</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* URL Input */}
            <div>
              <label className="block text-xs font-black text-zinc-900 mb-1">
                Google Apps Script Web App URL <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-white px-3 py-2.5 rounded-xl sketch-input text-xs font-mono text-zinc-900 placeholder:text-zinc-400"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                นำ URL ที่ได้จากการกด "ทำให้ใช้งานได้" (Deploy as Web App) ใน Apps Script มาวางที่นี่
              </p>
            </div>

            {/* Optional Direct Sheet Link */}
            <div>
              <label className="block text-xs font-black text-zinc-900 mb-1">
                ลิงก์ Google Sheets (สำหรับเปิดดูโดยตรง)
              </label>
              <input
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                value={spreadsheetUrlInput}
                onChange={(e) => setSpreadsheetUrlInput(e.target.value)}
                className="w-full bg-white px-3 py-2.5 rounded-xl sketch-input text-xs font-semibold text-zinc-900 placeholder:text-zinc-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="flex-1 py-3 px-4 bg-emerald-400 hover:bg-emerald-500 text-zinc-950 font-black text-sm rounded-xl sketch-btn flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#18181b] disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'กำลังซิงค์ข้อมูล...' : '✨ ซิงค์ 6 ชีตขึ้น Google Sheets ทันที'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="py-3 px-4 bg-white hover:bg-zinc-100 text-zinc-900 font-black text-xs sm:text-sm rounded-xl sketch-btn flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000] border border-zinc-900 disabled:opacity-60"
              >
                {isTesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>ทดสอบเชื่อมต่อ</span>
              </button>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs sm:text-sm rounded-xl border border-zinc-300 cursor-pointer"
              >
                บันทึก URL
              </button>
            </div>

            {/* Data to be Synced Summary Overview */}
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-zinc-800">
                <span>📊 รายการข้อมูลที่จะถูกส่งและแยก 6 แผ่นชีตอัตโนมัติ:</span>
                {config.lastSyncedAt && (
                  <span className="text-[11px] text-zinc-500 font-semibold">
                    ซิงค์ล่าสุด: {config.lastSyncedAt}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-2.5 bg-sky-50 rounded-lg border border-sky-300">
                  <span className="text-sky-800 block text-[10px] font-black">🧑‍🎓 1. ผู้สมัครนักเรียน</span>
                  <span className="font-black text-zinc-900 text-sm">{studentRegs.length} คน</span>
                  <span className="text-[9px] text-sky-700 block mt-0.5">วันเวลา, ชื่อ, นามสกุล, เลขที่, รหัส</span>
                </div>

                <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-300">
                  <span className="text-purple-800 block text-[10px] font-black">👩‍🏫 2. ผู้สมัครคุณครู</span>
                  <span className="font-black text-zinc-900 text-sm">{teacherRegs.length} ท่าน</span>
                  <span className="text-[9px] text-purple-700 block mt-0.5">วันเวลา, ชื่อ, นามสกุล, สาระ, Email</span>
                </div>

                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-zinc-500 block text-[10px]">3. สรุปคะแนนนักเรียน</span>
                  <span className="font-black text-zinc-900 text-sm">{studentRecords.length} คน</span>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-zinc-500 block text-[10px]">4. การส่งการบ้าน</span>
                  <span className="font-black text-zinc-900 text-sm">{homeworkList.length} รายการ</span>
                </div>

                <div className="p-2.5 bg-indigo-50 rounded-lg border border-indigo-200">
                  <span className="text-zinc-500 block text-[10px]">5. คะแนนแบบทดสอบ</span>
                  <span className="font-black text-zinc-900 text-sm">{examScores.length} ครั้ง</span>
                </div>

                <div className="p-2.5 bg-pink-50 rounded-lg border border-pink-200">
                  <span className="text-zinc-500 block text-[10px]">6. มุมสะท้อนคิด</span>
                  <span className="font-black text-zinc-900 text-sm">{evaluations.length} รายการ</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STEP-BY-STEP SETUP GUIDE */}
        {activeTab === 'guide' && (
          <div className="mt-4 space-y-4">
            <div className="bg-emerald-50 p-4 rounded-xl border-2 border-emerald-300">
              <h4 className="text-sm font-black text-emerald-950 flex items-center gap-2 mb-2">
                <span>📋 ขั้นตอนการเชื่อมต่อ Google Sheets ใน 3 นาที</span>
              </h4>
              <ol className="text-xs font-semibold text-zinc-800 space-y-2.5 list-decimal pl-4">
                <li>
                  เปิดเว็บ{' '}
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 underline font-bold"
                  >
                    sheets.new
                  </a>{' '}
                  เพื่อสร้าง Google Sheets แผ่นใหม่
                </li>
                <li>
                  ที่เมนูด้านบน คลิก <strong>"ส่วนขยาย" (Extensions)</strong> &gt; <strong>"Apps Script"</strong>
                </li>
                <li>
                  ลบโค้ดเดิมในหน้าต่างออกทั้งหมด แล้วกดปุ่ม <strong>"คัดลอกโค้ดสคริปต์"</strong> ด้านล่างนี้ไปวางแทนที่
                </li>
                <li>
                  กดปุ่มสีฟ้า <strong>"ทำให้ใช้งานได้" (Deploy)</strong> มุมบนขวา &gt; เลือก <strong>"การทำให้ใช้งานได้ใหม่" (New deployment)</strong>
                </li>
                <li>
                  คลิกรูปฟันเฟือง ⚙️ เลือกประเภท <strong>"เว็บแอป" (Web app)</strong>
                </li>
                <li>
                  ตั้งค่าช่อง <strong>"ผู้ที่มีสิทธิ์เข้าถึง" (Who has access)</strong> เป็น:{' '}
                  <span className="bg-amber-200 px-1.5 py-0.5 rounded font-black text-zinc-950">
                    "ทุกคน" (Anyone)
                  </span>
                </li>
                <li>
                  กด <strong>"ทำให้ใช้งานได้" (Deploy)</strong> และคัดลอก <strong>Web app URL</strong> ที่ได้มาวางในแท็บ "ซิงค์ข้อมูล" ของระบบนี้!
                </li>
              </ol>
            </div>

            {/* Script Code Block with 1-Click Copy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-zinc-800">
                  💻 โค้ด Google Apps Script (พร้อมแยก 6 แผ่นชีตอัตโนมัติ):
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'คัดลอกเรียบร้อยแล้ว!' : 'คัดลอกโค้ดสคริปต์'}</span>
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-[11px] font-mono text-emerald-400">
                <pre>{getGoogleAppsScriptTemplate()}</pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CSV DOWNLOADS (UTF-8 with BOM for Thai support) */}
        {activeTab === 'csv' && (
          <div className="mt-4 space-y-4">
            <div className="p-3.5 bg-blue-50 rounded-xl border-2 border-blue-200 text-xs text-blue-950 font-semibold">
              💡 ไฟล์ CSV เหล่านี้ถูกสร้างด้วยรหัส <strong>UTF-8 พร้อม BOM</strong> ทำให้เปิดใน Google Sheets และ Microsoft Excel ได้ทันทีโดยภาษาไทยไม่เพี้ยนหรือเป็นภาษาต่างดาว
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. ผู้สมัครนักเรียน */}
              <button
                type="button"
                onClick={handleExportStudentRegistrationCsv}
                className="p-4 bg-white hover:bg-sky-50 rounded-xl sketch-border text-left shadow-[2px_2px_0px_#000] cursor-pointer group transition-all border-sky-300"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">🧑‍🎓</span>
                  <Download className="w-4 h-4 text-sky-600 group-hover:text-sky-950" />
                </div>
                <div className="text-sm font-black text-zinc-900">รายชื่อผู้สมัครนักเรียน</div>
                <p className="text-[11px] font-semibold text-zinc-600 mt-0.5">
                  วันเวลาที่สมัคร, ชื่อ, นามสกุล, เลขที่, เลขประจำตัวนักเรียน, ชั้น/ห้อง ({studentRegs.length} รายการ)
                </p>
              </button>

              {/* 2. ผู้สมัครคุณครู */}
              <button
                type="button"
                onClick={handleExportTeacherRegistrationCsv}
                className="p-4 bg-white hover:bg-purple-50 rounded-xl sketch-border text-left shadow-[2px_2px_0px_#000] cursor-pointer group transition-all border-purple-300"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">👩‍🏫</span>
                  <Download className="w-4 h-4 text-purple-600 group-hover:text-purple-950" />
                </div>
                <div className="text-sm font-black text-zinc-900">รายชื่อผู้สมัครคุณครู</div>
                <p className="text-[11px] font-semibold text-zinc-600 mt-0.5">
                  วันเวลาที่สมัคร, ชื่อ, นามสกุล, กลุ่มสาระ/รายวิชา, อีเมลครู ({teacherRegs.length} รายการ)
                </p>
              </button>

              {/* 3. สรุปคะแนนนักเรียน */}
              <button
                type="button"
                onClick={handleExportStudentRecordCsv}
                className="p-4 bg-white hover:bg-yellow-50 rounded-xl sketch-border text-left shadow-[2px_2px_0px_#000] cursor-pointer group transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">📊</span>
                  <Download className="w-4 h-4 text-zinc-600 group-hover:text-zinc-950" />
                </div>
                <div className="text-sm font-black text-zinc-900">สรุปคะแนนนักเรียน</div>
                <p className="text-[11px] font-semibold text-zinc-600 mt-0.5">
                  รหัส, ชื่อ, ห้อง, เลขที่, ดาวสะสม, สรุปคะแนนการบ้านและข้อสอบ
                </p>
              </button>

              {/* 4. รายการส่งการบ้าน */}
              <button
                type="button"
                onClick={handleExportHomeworkCsv}
                className="p-4 bg-white hover:bg-emerald-50 rounded-xl sketch-border text-left shadow-[2px_2px_0px_#000] cursor-pointer group transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">📦</span>
                  <Download className="w-4 h-4 text-zinc-600 group-hover:text-zinc-950" />
                </div>
                <div className="text-sm font-black text-zinc-900">รายการส่งการบ้าน</div>
                <p className="text-[11px] font-semibold text-zinc-600 mt-0.5">
                  หัวข้อ, ผู้ส่ง, สถานะ, คะแนน, วันที่ส่ง และคอมเมนต์ตรวจงาน
                </p>
              </button>

              {/* 5. ผลคะแนนแบบทดสอบ */}
              <button
                type="button"
                onClick={handleExportQuizCsv}
                className="p-4 bg-white hover:bg-indigo-50 rounded-xl sketch-border text-left shadow-[2px_2px_0px_#000] cursor-pointer group transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">📝</span>
                  <Download className="w-4 h-4 text-zinc-600 group-hover:text-zinc-950" />
                </div>
                <div className="text-sm font-black text-zinc-900">ผลคะแนนแบบทดสอบ</div>
                <p className="text-[11px] font-semibold text-zinc-600 mt-0.5">
                  ชื่อแบบทดสอบ, นักเรียน, คะแนนที่ได้, คะแนนเต็ม, วันที่ทำ
                </p>
              </button>

              {/* 6. มุมสะท้อนคิด */}
              <button
                type="button"
                onClick={handleExportReflectionCsv}
                className="p-4 bg-white hover:bg-pink-50 rounded-xl sketch-border text-left shadow-[2px_2px_0px_#000] cursor-pointer group transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">💬</span>
                  <Download className="w-4 h-4 text-zinc-600 group-hover:text-zinc-950" />
                </div>
                <div className="text-sm font-black text-zinc-900">มุมสะท้อนคิด</div>
                <p className="text-[11px] font-semibold text-zinc-600 mt-0.5">
                  หัวข้อ, ดาวความสุข, สิ่งที่อยากให้ปรับปรุง, คำชม, คำตอบครู
                </p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
