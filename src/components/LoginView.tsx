import React, { useState } from 'react';
import { UserProfile, UserRole, StudentRecord } from '../types';
import { sampleStudentRecords } from '../data/stickersData';
import { triggerFestiveConfetti, triggerStarBurst } from '../utils/confetti';
import { DoodleStudent, DoodleTeacher, DoodleHomeworkBox } from './DoodleIcons';
import { AvatarDisplay } from './DoodleAvatars';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { safeGetItem, safeSetItem } from '../utils/storage';
import {
  parseThaiName,
  saveStudentRegistration,
  saveTeacherRegistration,
} from '../services/googleSheetsService';
import {
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Check,
  ShieldCheck,
  User as UserIcon,
  HelpCircle,
  Sparkles,
  Loader2,
  Hash,
  CreditCard,
  Mail,
  UserPlus,
  School,
  CheckCircle2,
  AlertCircle,
  Info,
  KeyRound,
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: UserProfile) => void;
  initialRole?: UserRole;
  studentRecords?: StudentRecord[];
  onRegisterStudent?: (record: StudentRecord, user: UserProfile) => void;
}

// Student selectable avatars
const STUDENT_AVATAR_OPTIONS = [
  { id: 'student-boy-glasses', label: 'เด็กชายแว่นกลม' },
  { id: 'student-girl-ponytail', label: 'เด็กหญิงผมเปีย' },
  { id: 'student-boy-cap', label: 'เด็กชายหมวกแก๊ป' },
  { id: 'student-kid-artist', label: 'นักเรียนจิตรกร' },
  { id: 'student-cat-doodle', label: 'แมวน้อยแสนรู้' },
  { id: 'student-dog-doodle', label: 'น้องหมานักคิด' },
  { id: 'student-robot-doodle', label: 'หุ่นยนต์อัจฉริยะ' },
  { id: 'student-astronaut-doodle', label: 'นักบินอวกาศ' },
  { id: 'student-dino-doodle', label: 'ไดโนเสาร์ขยัน' },
  { id: 'student-bear-doodle', label: 'หมีน้อยน่ารัก' },
];

// Quick classrooms
const CLASSROOM_PRESETS = ['ห้อง 1', 'ห้อง 2', 'ห้อง 3', 'ม.3/1', 'ม.3/2', 'ม.1/1', 'ม.2/1'];

// Known default teacher passwords
const DEFAULT_ACCOUNT_PASSWORDS: Record<string, string> = {
  '6711502234@chandra.ac.th': '123456',
  '6711502234': '123456',
  'kru.nipaporn@gmail.com': 'teacher123',
  'std-30112': '123456',
};

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  initialRole = 'student',
  studentRecords = [],
  onRegisterStudent,
}) => {
  // Main Role (Student vs Teacher)
  const [role, setRole] = useState<UserRole>(initialRole);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Sub-mode:
  // For Student: 'login' | 'register'
  // For Teacher: 'login' | 'register'
  const [studentMode, setStudentMode] = useState<'login' | 'register'>('login');
  const [teacherMode, setTeacherMode] = useState<'login' | 'register'>('login');

  // =========================================================================
  // Student Login Fields
  // =========================================================================
  const [studentLoginId, setStudentLoginId] = useState('');
  const [studentLoginPassword, setStudentLoginPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // =========================================================================
  // Student Registration Fields (สมัครสมาชิกเพื่อป้องกันคนอื่นเข้าบัญชี)
  // =========================================================================
  const [regFullName, setRegFullName] = useState('');
  const [regClassRoom, setRegClassRoom] = useState('ห้อง 1');
  const [regCustomClass, setRegCustomClass] = useState('');
  const [regStudentNo, setRegStudentNo] = useState('');
  const [regStudentIdCode, setRegStudentIdCode] = useState('');
  const [regAvatar, setRegAvatar] = useState('student-boy-glasses');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // =========================================================================
  // Teacher Login Fields (Email & Password)
  // =========================================================================
  const [teacherEmail, setTeacherEmail] = useState('6711502234@chandra.ac.th');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);

  // Teacher Registration Fields (New Teacher)
  const [teacherRegName, setTeacherRegName] = useState('');
  const [teacherRegEmail, setTeacherRegEmail] = useState('');
  const [teacherRegSubject, setTeacherRegSubject] = useState('วิทยาศาสตร์และเทคโนโลยี');
  const [teacherRegPassword, setTeacherRegPassword] = useState('');
  const [teacherRegConfirmPassword, setTeacherRegConfirmPassword] = useState('');
  const [showTeacherRegPassword, setShowTeacherRegPassword] = useState(false);

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Role toggle
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Helper: Retrieve all student records from prop & storage
  const getCombinedStudentRecords = (): StudentRecord[] => {
    const map = new Map<string, StudentRecord>();
    sampleStudentRecords.forEach((s) => map.set(s.id, s));
    if (studentRecords && studentRecords.length > 0) {
      studentRecords.forEach((s) => map.set(s.id, s));
    }
    const stored = safeGetItem<StudentRecord[]>('hw_box_student_records', []);
    if (Array.isArray(stored)) {
      stored.forEach((s) => map.set(s.id, s));
    }
    return Array.from(map.values());
  };

  // Helper: Get stored password for any account (student id, email, username)
  const getStoredPassword = (accountKey: string): string | null => {
    const clean = accountKey.trim().toLowerCase();
    try {
      const passMap = safeGetItem<Record<string, string>>('hw_box_user_passwords', {});
      if (passMap[clean]) return passMap[clean];
      const digits = clean.replace(/\D/g, '');
      if (digits && passMap[digits]) return passMap[digits];
      const prefix = clean.split('@')[0];
      if (passMap[prefix]) return passMap[prefix];
    } catch (e) {
      console.error(e);
    }
    if (DEFAULT_ACCOUNT_PASSWORDS[clean]) return DEFAULT_ACCOUNT_PASSWORDS[clean];
    const digits = clean.replace(/\D/g, '');
    if (digits && DEFAULT_ACCOUNT_PASSWORDS[digits]) return DEFAULT_ACCOUNT_PASSWORDS[digits];
    const prefix = clean.split('@')[0];
    if (DEFAULT_ACCOUNT_PASSWORDS[prefix]) return DEFAULT_ACCOUNT_PASSWORDS[prefix];
    return null;
  };

  // Helper: Save password securely to storage
  const saveAccountPassword = (accountKey: string, pass: string) => {
    const clean = accountKey.trim().toLowerCase();
    try {
      const passMap = safeGetItem<Record<string, string>>('hw_box_user_passwords', {});
      passMap[clean] = pass;
      const digits = clean.replace(/\D/g, '');
      if (digits) passMap[digits] = pass;
      safeSetItem('hw_box_user_passwords', passMap);
    } catch (e) {
      console.error(e);
    }
  };

  // =========================================================================
  // 1. SUBMIT: STUDENT REGISTRATION (สมัครสมาชิก & ตั้งรหัสผ่าน)
  // =========================================================================
  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const fullName = regFullName.trim();
    const finalClass = regCustomClass.trim() || regClassRoom;
    const studentNo = regStudentNo.trim();
    const studentIdCode = regStudentIdCode.trim();
    const password = regPassword;
    const confirmPassword = regConfirmPassword;

    if (!fullName) {
      setErrorMessage('กรุณากรอก "ชื่อ - นามสกุล" นักเรียน');
      return;
    }
    if (!studentNo) {
      setErrorMessage('กรุณากรอก "เลขที่" ของนักเรียน');
      return;
    }
    if (!studentIdCode) {
      setErrorMessage('กรุณากรอก "รหัสประจำตัวนักเรียน" (เช่น STD-30112 หรือ 6711502234)');
      return;
    }
    if (!password) {
      setErrorMessage('กรุณากำหนด "รหัสผ่านส่วนตัว" เพื่อป้องกันไม่ให้คนอื่นเข้าบัญชี');
      return;
    }
    if (password.length < 4) {
      setErrorMessage('รหัสผ่านควรมีความยาวอย่างน้อย 4 ตัวอักษรหรือตัวเลข');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('รหัสผ่านและช่องยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean ID
      const cleanId = studentIdCode.toLowerCase().replace(/[\s-]/g, '');
      const existingRoster = getCombinedStudentRecords();

      // Check if student with this ID already registered with a password
      const existingRecord = existingRoster.find((s) => {
        const sId = (s.studentIdCode || s.id).toLowerCase().replace(/[\s-]/g, '');
        return sId === cleanId || s.studentIdCode.toLowerCase() === studentIdCode.toLowerCase();
      });

      const studentId = existingRecord?.id || `std-${studentIdCode.replace(/[^a-zA-Z0-9]/g, '') || Date.now()}`;

      // Save password into credentials store
      saveAccountPassword(studentIdCode, password);
      saveAccountPassword(studentId, password);
      saveAccountPassword(fullName, password);

      const newStudentRecord: StudentRecord = {
        id: studentId,
        name: fullName,
        studentIdCode: studentIdCode,
        classRoom: finalClass,
        studentNo: studentNo,
        avatar: regAvatar,
        totalStars: existingRecord?.totalStars ?? 100,
        unlockedStickers: existingRecord?.unlockedStickers?.length ? existingRecord.unlockedStickers : ['first-step'],
        awardedBadges: existingRecord?.awardedBadges || [],
        homeworkCount: existingRecord?.homeworkCount || 0,
        quizScores: existingRecord?.quizScores || {},
      };

      const studentUser: UserProfile = {
        id: studentId,
        name: fullName,
        role: 'student',
        studentIdCode: studentIdCode,
        classRoom: finalClass,
        studentNo: studentNo,
        avatar: regAvatar,
        totalStars: newStudentRecord.totalStars,
        unlockedStickers: newStudentRecord.unlockedStickers,
        usernameOrEmail: studentIdCode,
      };

      // Save to student registration records for Google Sheets sync
      const { firstName, lastName } = parseThaiName(fullName);
      const regTime = new Date().toLocaleString('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      });
      saveStudentRegistration({
        id: studentId,
        registeredAt: regTime,
        firstName,
        lastName,
        fullName,
        studentNo,
        studentIdCode,
        classRoom: finalClass,
      });

      // Save to student records
      if (onRegisterStudent) {
        onRegisterStudent(newStudentRecord, studentUser);
      } else {
        const updatedList = [newStudentRecord, ...existingRoster.filter((s) => s.id !== studentId)];
        safeSetItem('hw_box_student_records', updatedList);
        onLogin(studentUser);
      }

      triggerFestiveConfetti();
      triggerStarBurst();
      setSuccessMessage(`🎉 สมัครสมาชิกและตั้งรหัสผ่านสำเร็จ! บัญชีของคุณได้รับการปกป้องเรียบร้อย`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // 2. SUBMIT: STUDENT LOGIN (เข้าสู่ระบบด้วยรหัสประจำตัว + รหัสผ่านส่วนตัว)
  // =========================================================================
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const inputIdOrName = studentLoginId.trim();
    const inputPassword = studentLoginPassword;

    if (!inputIdOrName) {
      setErrorMessage('กรุณากรอก "รหัสประจำตัวนักเรียน" หรือ "ชื่อ-นามสกุล"');
      return;
    }
    if (!inputPassword) {
      setErrorMessage('กรุณากรอก "รหัสผ่านส่วนตัว" เพื่อยืนยันตัวตนและป้องกันคนอื่นเข้าบัญชี');
      return;
    }

    setIsSubmitting(true);
    try {
      const roster = getCombinedStudentRecords();

      // Normalization helpers
      const stripTitle = (name: string) => {
        return name
          .replace(/^(เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\.|นาย|นางสาว|น\.ส\.)\s*/gi, '')
          .replace(/\s+/g, ' ')
          .trim()
          .toLowerCase();
      };

      const cleanInput = inputIdOrName.toLowerCase().replace(/[\s-]/g, '');
      const rawDigits = inputIdOrName.replace(/\D/g, '');
      const cleanName = stripTitle(inputIdOrName);

      // Search student by ID or Name
      const candidate = roster.find((s) => {
        const sId = (s.studentIdCode || s.id).toLowerCase().replace(/[\s-]/g, '');
        const sDigits = (s.studentIdCode || s.id).replace(/\D/g, '');
        const sName = stripTitle(s.name);
        return (
          sId === cleanInput ||
          (rawDigits && sDigits === rawDigits) ||
          s.studentIdCode.toLowerCase() === inputIdOrName.toLowerCase() ||
          s.id.toLowerCase() === inputIdOrName.toLowerCase() ||
          sName === cleanName ||
          sName.includes(cleanName) ||
          cleanName.includes(sName)
        );
      });

      if (!candidate) {
        setErrorMessage(
          `❌ ไม่พบรหัสหรือชื่อนักเรียน "${inputIdOrName}" ในระบบ กรุณาตรวจสอบหรือกดแท็บ "สมัครสมาชิก / ตั้งรหัสผ่าน" เพื่อลงทะเบียนใหม่`
        );
        return;
      }

      // Check stored password for this student
      const storedPass =
        getStoredPassword(candidate.studentIdCode) ||
        getStoredPassword(candidate.id) ||
        getStoredPassword(candidate.name);

      if (storedPass) {
        // Password exists - verify it!
        if (storedPass !== inputPassword) {
          setErrorMessage(
            `❌ รหัสผ่านไม่ถูกต้อง! บัญชีของ ${candidate.name} ได้รับการปกป้องด้วยรหัสผ่านส่วนตัว กรุณาตรวจสอบรหัสผ่าน หรือกด "ลืมรหัสผ่าน?"`
          );
          return;
        }
      } else {
        // First-time login without a set password:
        // Automatically save their entered password now to lock the account for them!
        saveAccountPassword(candidate.studentIdCode, inputPassword);
        saveAccountPassword(candidate.id, inputPassword);
        saveAccountPassword(candidate.name, inputPassword);
      }

      // Successful student login
      const studentUser: UserProfile = {
        id: candidate.id,
        name: candidate.name,
        role: 'student',
        studentIdCode: candidate.studentIdCode,
        classRoom: candidate.classRoom || 'ห้อง 1',
        studentNo: candidate.studentNo || '01',
        avatar: candidate.avatar || 'student-boy-glasses',
        totalStars: candidate.totalStars ?? 100,
        unlockedStickers: candidate.unlockedStickers?.length ? candidate.unlockedStickers : ['first-step'],
        usernameOrEmail: candidate.studentIdCode,
      };

      triggerFestiveConfetti();
      safeSetItem('hw_box_logged_in', 'true');
      safeSetItem('hw_box_user', studentUser);
      onLogin(studentUser);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // 3. SUBMIT: TEACHER LOGIN (เข้าสู่ระบบคุณครูด้วย Email และ รหัสผ่าน)
  // =========================================================================
  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const email = teacherEmail.trim().toLowerCase();
    const pass = teacherPassword;

    if (!email) {
      setErrorMessage('กรุณากรอก "อีเมลคุณครู"');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('รูปแบบอีเมลไม่ถูกต้อง กรุณากรอกอีเมลที่มี @ และโดเมนที่ถูกต้อง เช่น teacher@school.ac.th');
      return;
    }

    if (!pass) {
      setErrorMessage('กรุณากรอก "รหัสผ่านคุณครู"');
      return;
    }

    setIsSubmitting(true);
    try {
      const expectedPass = getStoredPassword(email);

      if (expectedPass && expectedPass !== pass) {
        setErrorMessage('❌ รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านของคุณครู หรือคลิก "ลืมรหัสผ่าน?" เพื่อรับรหัสยืนยัน');
        return;
      }

      // If no stored pass was found, save the entered password for future logins
      if (!expectedPass) {
        saveAccountPassword(email, pass);
      }

      const emailPrefix = email.split('@')[0];
      const displayName =
        email === '6711502234@chandra.ac.th'
          ? 'คุณครูนิภาภรณ์ ใจดี'
          : `คุณครู (${emailPrefix})`;

      // Save teacher registration record
      const { firstName: tFirst, lastName: tLast } = parseThaiName(displayName);
      saveTeacherRegistration({
        id: 'tch-' + email.replace(/[^a-zA-Z0-9]/g, '-'),
        registeredAt: new Date().toLocaleString('th-TH', {
          dateStyle: 'medium',
          timeStyle: 'medium',
        }),
        firstName: tFirst,
        lastName: tLast,
        fullName: displayName,
        subject: 'วิทยาศาสตร์และเทคโนโลยี',
        email,
      });

      const teacherUser: UserProfile = {
        id: 'tch-' + email.replace(/[^a-zA-Z0-9]/g, '-'),
        name: displayName,
        role: 'teacher',
        teacherIdCode: 'TCH-' + Math.floor(100 + Math.random() * 900),
        classRoom: 'วิทยาศาสตร์และเทคโนโลยี',
        studentNo: 'ครูผู้สอน',
        avatar: '👩‍🏫',
        totalStars: 500,
        unlockedStickers: ['first-step', 'super-critic', 'century-star'],
        usernameOrEmail: email,
        googleEmail: email,
      };

      triggerFestiveConfetti();
      safeSetItem('hw_box_logged_in', 'true');
      safeSetItem('hw_box_user', teacherUser);
      onLogin(teacherUser);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // 4. SUBMIT: TEACHER REGISTER (สมัครสมาชิกคุณครูใหม่)
  // =========================================================================
  const handleTeacherRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const name = teacherRegName.trim();
    const email = teacherRegEmail.trim().toLowerCase();
    const subject = teacherRegSubject.trim() || 'วิทยาศาสตร์และเทคโนโลยี';
    const pass = teacherRegPassword;
    const confirmPass = teacherRegConfirmPassword;

    if (!name) {
      setErrorMessage('กรุณาระบุชื่อ-นามสกุลของคุณครู');
      return;
    }
    if (!email) {
      setErrorMessage('กรุณาระบุอีเมลของคุณครู');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('รูปแบบอีเมลไม่ถูกต้อง กรุณากรอกอีเมลที่มี @ และโดเมน');
      return;
    }
    if (!pass) {
      setErrorMessage('กรุณากำหนดรหัสผ่าน');
      return;
    }
    if (pass.length < 4) {
      setErrorMessage('รหัสผ่านควรมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }
    if (pass !== confirmPass) {
      setErrorMessage('รหัสผ่านและช่องยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsSubmitting(true);
    try {
      saveAccountPassword(email, pass);

      const fullTeacherName = name.startsWith('คุณครู') ? name : `คุณครู${name}`;
      const { firstName: tFirst, lastName: tLast } = parseThaiName(fullTeacherName);
      saveTeacherRegistration({
        id: 'tch-' + email.replace(/[^a-zA-Z0-9]/g, '-'),
        registeredAt: new Date().toLocaleString('th-TH', {
          dateStyle: 'medium',
          timeStyle: 'medium',
        }),
        firstName: tFirst,
        lastName: tLast,
        fullName: fullTeacherName,
        subject,
        email,
      });

      const teacherUser: UserProfile = {
        id: 'tch-' + email.replace(/[^a-zA-Z0-9]/g, '-'),
        name: fullTeacherName,
        role: 'teacher',
        teacherIdCode: 'TCH-' + Math.floor(100 + Math.random() * 900),
        classRoom: subject,
        studentNo: 'ครูผู้สอน',
        avatar: '👩‍🏫',
        totalStars: 500,
        unlockedStickers: ['first-step', 'super-critic', 'century-star'],
        usernameOrEmail: email,
        googleEmail: email,
      };

      triggerFestiveConfetti();
      safeSetItem('hw_box_logged_in', 'true');
      safeSetItem('hw_box_user', teacherUser);
      onLogin(teacherUser);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password Reset Completion Callback
  const handlePasswordResetSuccess = (
    account: string,
    newPass: string,
    resetRole: UserRole
  ) => {
    setRole(resetRole);
    if (resetRole === 'teacher') {
      setTeacherEmail(account);
      setTeacherPassword(newPass);
    } else {
      setStudentLoginId(account);
      setStudentLoginPassword(newPass);
    }
    setSuccessMessage(`รีเซ็ตรหัสผ่านสำเร็จแล้ว! สามารถกด "เข้าสู่ระบบ" ได้ทันที`);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-5 py-6 sm:py-10">
      <div className="w-full max-w-lg mx-auto">
        {/* App Title Header */}
        <div className="text-center mb-5 relative">
          <div className="inline-flex flex-col items-center">
            <div className="relative mb-2.5 group">
              <div className="w-18 h-18 sm:w-20 sm:h-20 bg-amber-300 sketch-border rounded-[22px_18px_20px_16px] flex items-center justify-center text-3xl sm:text-4xl shadow-[4px_4px_0px_#18181b] rotate-[-2deg] group-hover:rotate-0 transition-transform">
                <DoodleHomeworkBox className="w-12 h-12 sm:w-14 sm:h-14" />
              </div>
              <div className="washi-tape -top-2.5 -right-3 rotate-[12deg] bg-pink-300" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 tracking-tight drop-shadow-xs">
                กล่องการบ้าน
              </h1>
            </div>

            <p className="text-xs sm:text-sm md:text-base font-bold text-zinc-600 max-w-md mx-auto">
              ระบบส่งการบ้าน แบบทดสอบ และสมุดบันทึกคะแนน
            </p>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-white sketch-border-lg rounded-[26px_18px_24px_20px] p-5 sm:p-7 md:p-8 shadow-[6px_6px_0px_#18181b] relative">
          {/* Washi Tape */}
          <div
            className={`washi-tape -top-3.5 left-1/2 -translate-x-1/2 ${
              role === 'student' ? 'bg-emerald-200' : 'bg-purple-200'
            } rotate-[-1deg]`}
          />

          {/* Primary Role Chooser Tabs (นักเรียน vs คุณครู) */}
          <div className="mb-5">
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-2xl border-2 border-zinc-900 shadow-[2px_2px_0px_#000]">
              <button
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`py-2.5 sm:py-3 px-3 rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all ${
                  role === 'student'
                    ? 'bg-emerald-300 text-zinc-950 border-2 border-zinc-900 shadow-[2px_2px_0px_#000] scale-[1.02]'
                    : 'bg-transparent text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                <DoodleStudent className="w-5 h-5 shrink-0" />
                <span>นักเรียน</span>
                {role === 'student' && <Check className="w-4 h-4 stroke-[3] shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('teacher')}
                className={`py-2.5 sm:py-3 px-3 rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all ${
                  role === 'teacher'
                    ? 'bg-purple-300 text-zinc-950 border-2 border-zinc-900 shadow-[2px_2px_0px_#000] scale-[1.02]'
                    : 'bg-transparent text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                <DoodleTeacher className="w-5 h-5 shrink-0" />
                <span>คุณครูผู้สอน</span>
                {role === 'teacher' && <Check className="w-4 h-4 stroke-[3] shrink-0" />}
              </button>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SUB-TABS: For Student (เข้าสู่ระบบ vs สมัครสมาชิก / ตั้งรหัสผ่าน) */}
          {/* ================================================================= */}
          {role === 'student' && (
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-amber-50 rounded-xl border border-amber-300 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className={`py-2 px-2.5 rounded-lg text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    studentMode === 'login'
                      ? 'bg-amber-400 text-zinc-950 border border-zinc-900 shadow-[1px_1px_0px_#000]'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-amber-100/50'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('register');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className={`py-2 px-2.5 rounded-lg text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all relative ${
                    studentMode === 'register'
                      ? 'bg-emerald-300 text-zinc-950 border border-zinc-900 shadow-[1px_1px_0px_#000]'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-emerald-100/50'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>สมัครสมาชิก / ตั้งรหัสผ่าน</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping absolute top-1.5 right-1.5" />
                </button>
              </div>

              {/* Sub-tab description banner */}
              <div className="mt-2.5 text-center">
                {studentMode === 'login' ? (
                  <p className="text-[11px] sm:text-xs font-bold text-zinc-600 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>เข้าสู่ระบบด้วยรหัสประจำตัวและรหัสผ่านส่วนตัวเพื่อปกป้องบัญชีของคุณ</span>
                  </p>
                ) : (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-300 text-[11px] font-bold text-emerald-950 text-left flex items-start gap-2 shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-emerald-900">🛡️ ป้องกันไม่ให้ผู้อื่นเข้าใช้งานแทน:</span>{' '}
                      กำหนดรหัสผ่านเฉพาะของคุณ เพื่อไม่ให้เพื่อนคนอื่นแอบเข้าบัญชี ส่งงาน หรือแก้ไขข้อมูลของคุณ
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SUB-TABS: For Teacher (เข้าสู่ระบบด้วย Email & รหัสผ่าน vs สมัครใหม่) */}
          {/* ================================================================= */}
          {role === 'teacher' && (
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-purple-50 rounded-xl border border-purple-300 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setTeacherMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className={`py-2 px-2.5 rounded-lg text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    teacherMode === 'login'
                      ? 'bg-purple-300 text-zinc-950 border border-zinc-900 shadow-[1px_1px_0px_#000]'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-purple-100/50'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>เข้าสู่ระบบด้วย Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTeacherMode('register');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className={`py-2 px-2.5 rounded-lg text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    teacherMode === 'register'
                      ? 'bg-purple-300 text-zinc-950 border border-zinc-900 shadow-[1px_1px_0px_#000]'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-purple-100/50'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>ลงทะเบียนคุณครูใหม่</span>
                </button>
              </div>

              <div className="mt-2 text-center">
                <p className="text-[11px] sm:text-xs font-bold text-zinc-600 flex items-center justify-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  <span>คุณครูเข้าสู่ระบบด้วย Email และรหัสผ่านที่กำหนด</span>
                </p>
              </div>
            </div>
          )}

          {/* Feedback Banners */}
          {successMessage && (
            <div className="mb-3.5 p-3 bg-emerald-50 border-2 border-emerald-400 text-emerald-900 text-xs sm:text-sm font-bold rounded-xl shadow-[2px_2px_0px_#000] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-3.5 p-3 bg-rose-50 border-2 border-rose-400 text-rose-800 text-xs sm:text-sm font-bold rounded-xl shadow-[2px_2px_0px_#000] leading-snug flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* 1. STUDENT LOGIN FORM */}
          {/* ================================================================= */}
          {role === 'student' && studentMode === 'login' && (
            <form onSubmit={handleStudentLogin} className="space-y-3.5">
              {/* Student ID Code or Name */}
              <div>
                <label
                  htmlFor="student-login-id"
                  className="block text-xs font-black text-zinc-900 mb-1"
                >
                  รหัสประจำตัวนักเรียน หรือ ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <input
                    id="student-login-id"
                    type="text"
                    required
                    value={studentLoginId}
                    onChange={(e) => {
                      setStudentLoginId(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="เช่น STD-30112 หรือ 6711502234 หรือ เด็กชายสมชาย"
                    className="w-full bg-[#FFFDF5] pl-10 pr-3 py-3 rounded-xl sketch-input text-sm font-bold text-zinc-900 placeholder:text-zinc-400"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Student Password / PIN */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="student-login-pass"
                    className="block text-xs font-black text-zinc-900"
                  >
                    รหัสผ่านส่วนตัว (Password / PIN) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-xs font-black text-amber-800 hover:text-amber-950 underline decoration-amber-400 cursor-pointer"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="student-login-pass"
                    type={showStudentPassword ? 'text' : 'password'}
                    required
                    value={studentLoginPassword}
                    onChange={(e) => {
                      setStudentLoginPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="กรอกรหัสผ่านของคุณ (เพื่อป้องกันเพื่อนแอบเข้าบัญชี)"
                    className="w-full bg-[#FFFDF5] pl-10 pr-11 py-3 rounded-xl sketch-input text-sm font-bold text-zinc-900 placeholder:text-zinc-400"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70 active:scale-95 rounded-lg transition-all cursor-pointer"
                    title={showStudentPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 font-black text-sm sm:text-base rounded-xl sketch-btn bg-amber-400 hover:bg-amber-500 text-zinc-950 flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_#18181b] transition-transform active:translate-y-0.5 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>กำลังตรวจสอบข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>เข้าสู่ระบบ (นักเรียน)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick switch to register */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setStudentMode('register')}
                  className="text-xs font-black text-emerald-700 hover:text-emerald-900 underline decoration-emerald-400 cursor-pointer"
                >
                  ยังไม่มีรหัสผ่าน หรือยังไม่ได้สมัครสมาชิก? คลิกที่นี่เพื่อสมัครและตั้งรหัสผ่าน
                </button>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* 2. STUDENT REGISTRATION FORM (สมัครสมาชิกนักเรียน & ตั้งรหัสผ่าน) */}
          {/* ================================================================= */}
          {role === 'student' && studentMode === 'register' && (
            <form onSubmit={handleStudentRegister} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="reg-fullname"
                  className="block text-xs font-black text-zinc-900 mb-1"
                >
                  1. ชื่อ - นามสกุล นักเรียน <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => {
                      setRegFullName(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="เช่น เด็กชายสมชาย สายวิทย์ หรือ ด.ญ. กานดา"
                    className="w-full bg-[#FFFDF5] pl-10 pr-3 py-2.5 rounded-xl sketch-input text-sm font-bold text-zinc-900 placeholder:text-zinc-400"
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Classroom & Student No */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Classroom */}
                <div className="sm:col-span-7">
                  <label className="block text-xs font-black text-zinc-900 mb-1">
                    2. ชั้นเรียน / ห้องเรียน <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                      <School className="w-4 h-4" />
                    </div>
                    <select
                      value={regClassRoom}
                      onChange={(e) => setRegClassRoom(e.target.value)}
                      className="w-full bg-[#FFFDF5] pl-10 pr-3 py-2.5 rounded-xl sketch-input text-sm font-bold text-zinc-900 cursor-pointer"
                    >
                      {CLASSROOM_PRESETS.map((cr) => (
                        <option key={cr} value={cr}>
                          {cr}
                        </option>
                      ))}
                      <option value="custom">-- กำหนดห้องเรียนเอง --</option>
                    </select>
                  </div>
                  {regClassRoom === 'custom' && (
                    <input
                      type="text"
                      placeholder="ระบุห้องเรียน เช่น ม.3/5"
                      value={regCustomClass}
                      onChange={(e) => setRegCustomClass(e.target.value)}
                      className="mt-1.5 w-full bg-[#FFFDF5] px-3 py-2 rounded-lg sketch-input text-xs font-bold"
                    />
                  )}
                </div>

                {/* Student Number */}
                <div className="sm:col-span-5">
                  <label
                    htmlFor="reg-student-no"
                    className="block text-xs font-black text-zinc-900 mb-1"
                  >
                    3. เลขที่ <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                      <Hash className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-student-no"
                      type="text"
                      required
                      value={regStudentNo}
                      onChange={(e) => {
                        setRegStudentNo(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="เช่น 12 หรือ 01"
                      className="w-full bg-[#FFFDF5] pl-10 pr-3 py-2.5 rounded-xl sketch-input text-sm font-bold text-zinc-900 placeholder:text-zinc-400"
                    />
                  </div>
                </div>
              </div>

              {/* Student ID Code */}
              <div>
                <label
                  htmlFor="reg-student-idcode"
                  className="block text-xs font-black text-zinc-900 mb-1"
                >
                  4. รหัสประจำตัวนักเรียน <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-student-idcode"
                    type="text"
                    required
                    value={regStudentIdCode}
                    onChange={(e) => {
                      setRegStudentIdCode(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="เช่น STD-30112 หรือ 6711502234"
                    className="w-full bg-[#FFFDF5] pl-10 pr-3 py-2.5 rounded-xl sketch-input text-sm font-bold text-zinc-900 placeholder:text-zinc-400"
                  />
                </div>
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block text-xs font-black text-zinc-900 mb-1.5">
                  5. เลือกลายตัวการ์ตูนประจำตัว (Avatar)
                </label>
                <div className="grid grid-cols-5 gap-2 p-2 bg-amber-50/70 rounded-xl border border-amber-300 max-h-36 overflow-y-auto">
                  {STUDENT_AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setRegAvatar(av.id)}
                      className={`p-1.5 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        regAvatar === av.id
                          ? 'bg-amber-300 border-2 border-zinc-900 shadow-[2px_2px_0px_#000] scale-105'
                          : 'bg-white hover:bg-amber-100/60 border border-zinc-300'
                      }`}
                      title={av.label}
                    >
                      <AvatarDisplay avatar={av.id} className="w-8 h-8" />
                      <span className="text-[9px] font-black text-zinc-800 truncate w-full text-center">
                        {av.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Password & Confirmation (Security Shield) */}
              <div className="p-3 bg-emerald-50 rounded-xl border-2 border-emerald-400 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>ตั้งรหัสผ่านความปลอดภัย (ป้องกันคนอื่นแอบเข้าบัญชี)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Password */}
                  <div>
                    <label
                      htmlFor="reg-password"
                      className="block text-[11px] font-black text-zinc-900 mb-1"
                    >
                      รหัสผ่านส่วนตัว (อย่างน้อย 4 ตัว) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="เช่น 1234 หรือ pin"
                        className="w-full bg-white pl-3 pr-8 py-2 rounded-lg sketch-input text-xs font-bold"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="reg-confirm-password"
                      className="block text-[11px] font-black text-zinc-900 mb-1"
                    >
                      ยืนยันรหัสผ่านอีกครั้ง <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-confirm-password"
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="กรอกรหัสผ่านซ้ำ"
                        className="w-full bg-white pl-3 pr-8 py-2 rounded-lg sketch-input text-xs font-bold"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 cursor-pointer"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Registration Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 font-black text-sm sm:text-base rounded-xl sketch-btn bg-emerald-400 hover:bg-emerald-500 text-zinc-950 flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_#18181b] transition-transform active:translate-y-0.5 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>กำลังบันทึกและสร้างบัญชี...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>ยืนยันการสมัครสมาชิก & เข้าสู่ระบบทันที</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setStudentMode('login')}
                  className="text-xs font-black text-zinc-600 hover:text-zinc-900 underline cursor-pointer"
                >
                  มีบัญชีอยู่แล้ว? กดที่นี่เพื่อเข้าสู่ระบบ
                </button>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* 3. TEACHER LOGIN FORM (เข้าสู่ระบบด้วย Email และ รหัสผ่าน) */}
          {/* ================================================================= */}
          {role === 'teacher' && teacherMode === 'login' && (
            <form onSubmit={handleTeacherLogin} className="space-y-3.5">
              {/* Teacher Email */}
              <div>
                <label
                  htmlFor="teacher-email-input"
                  className="block text-xs font-black text-zinc-900 mb-1"
                >
                  อีเมลคุณครู (Teacher Email) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="teacher-email-input"
                    type="email"
                    required
                    value={teacherEmail}
                    onChange={(e) => {
                      setTeacherEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="เช่น 6711502234@chandra.ac.th หรือ kru.nipaporn@gmail.com"
                    className="w-full bg-[#FFFDF5] pl-10 pr-3 py-3 rounded-xl sketch-input text-sm font-semibold text-zinc-900 placeholder:text-zinc-400"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Teacher Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="teacher-password-input"
                    className="block text-xs font-black text-zinc-900"
                  >
                    รหัสผ่านคุณครู (Password) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-xs font-black text-purple-800 hover:text-purple-950 underline decoration-purple-400 cursor-pointer"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="teacher-password-input"
                    type={showTeacherPassword ? 'text' : 'password'}
                    required
                    value={teacherPassword}
                    onChange={(e) => {
                      setTeacherPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="กรอกรหัสผ่านของคุณครู (เช่น 123456 หรือ teacher123)"
                    className="w-full bg-[#FFFDF5] pl-10 pr-11 py-3 rounded-xl sketch-input text-sm font-semibold text-zinc-900 placeholder:text-zinc-400"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70 active:scale-95 rounded-lg transition-all cursor-pointer"
                    title={showTeacherPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showTeacherPassword ? <EyeOff className="w-5 h-5 stroke-[2.2]" /> : <Eye className="w-5 h-5 stroke-[2.2]" />}
                  </button>
                </div>
              </div>

              {/* Submit Teacher Login Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 font-black text-sm sm:text-base rounded-xl sketch-btn bg-purple-400 hover:bg-purple-500 text-zinc-950 flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_#18181b] transition-transform active:translate-y-0.5 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>กำลังตรวจสอบข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>เข้าสู่ระบบ (คุณครูผู้สอน)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setTeacherMode('register')}
                  className="text-xs font-black text-purple-700 hover:text-purple-900 underline decoration-purple-400 cursor-pointer"
                >
                  คุณครูท่านใหม่? คลิกที่นี่เพื่อลงทะเบียนบัญชีใหม่
                </button>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* 4. TEACHER REGISTRATION FORM (ลงทะเบียนคุณครูใหม่) */}
          {/* ================================================================= */}
          {role === 'teacher' && teacherMode === 'register' && (
            <form onSubmit={handleTeacherRegister} className="space-y-3.5">
              {/* Teacher Name */}
              <div>
                <label className="block text-xs font-black text-zinc-900 mb-1">
                  ชื่อ - นามสกุล คุณครู <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={teacherRegName}
                    onChange={(e) => setTeacherRegName(e.target.value)}
                    placeholder="เช่น คุณครูพรทิพย์ สุขเกษม"
                    className="w-full bg-[#FFFDF5] pl-10 pr-3 py-2.5 rounded-xl sketch-input text-sm font-bold text-zinc-900"
                  />
                </div>
              </div>

              {/* Subject / Department */}
              <div>
                <label className="block text-xs font-black text-zinc-900 mb-1">
                  กลุ่มสาระ / รายวิชาที่สอน
                </label>
                <input
                  type="text"
                  value={teacherRegSubject}
                  onChange={(e) => setTeacherRegSubject(e.target.value)}
                  placeholder="เช่น วิทยาศาสตร์และเทคโนโลยี"
                  className="w-full bg-[#FFFDF5] px-3 py-2.5 rounded-xl sketch-input text-sm font-bold text-zinc-900"
                />
              </div>

              {/* Teacher Email */}
              <div>
                <label className="block text-xs font-black text-zinc-900 mb-1">
                  อีเมลคุณครู (Email) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={teacherRegEmail}
                    onChange={(e) => setTeacherRegEmail(e.target.value)}
                    placeholder="เช่น kru.somporn@school.ac.th"
                    className="w-full bg-[#FFFDF5] pl-10 pr-3 py-2.5 rounded-xl sketch-input text-sm font-bold text-zinc-900"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-black text-zinc-900 mb-1">
                    กำหนดรหัสผ่าน <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showTeacherRegPassword ? 'text' : 'password'}
                      required
                      value={teacherRegPassword}
                      onChange={(e) => setTeacherRegPassword(e.target.value)}
                      placeholder="อย่างน้อย 4 ตัวอักษร"
                      className="w-full bg-[#FFFDF5] pl-3 pr-8 py-2 rounded-xl sketch-input text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTeacherRegPassword(!showTeacherRegPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 cursor-pointer"
                    >
                      {showTeacherRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-zinc-900 mb-1">
                    ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showTeacherRegPassword ? 'text' : 'password'}
                    required
                    value={teacherRegConfirmPassword}
                    onChange={(e) => setTeacherRegConfirmPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านซ้ำ"
                    className="w-full bg-[#FFFDF5] px-3 py-2 rounded-xl sketch-input text-xs font-bold"
                  />
                </div>
              </div>

              {/* Submit Teacher Register Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 font-black text-sm sm:text-base rounded-xl sketch-btn bg-purple-400 hover:bg-purple-500 text-zinc-950 flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_#18181b] transition-transform active:translate-y-0.5 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>กำลังสร้างบัญชีคุณครู...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>ลงทะเบียนคุณครู & เข้าสู่ระบบทันที</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setTeacherMode('login')}
                  className="text-xs font-black text-zinc-600 hover:text-zinc-900 underline cursor-pointer"
                >
                  มีบัญชีอยู่แล้ว? กลับไปเข้าสู่ระบบ
                </button>
              </div>
            </form>
          )}

          {/* Security & Protection Footer Badge */}
          <div className="mt-5 pt-3 border-t border-dashed border-zinc-200 text-center">
            <span className="text-[11px] font-bold text-zinc-500 inline-flex items-center justify-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ระบบป้องกันบัญชีด้วยรหัสผ่านส่วนตัว ปลอดภัยสำหรับนักเรียนและคุณครูทุกคน</span>
            </span>
          </div>
        </div>
      </div>

      {/* Forgot Password / OTP Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        defaultRole={role}
        defaultUsernameOrEmail={role === 'teacher' ? teacherEmail : studentLoginId}
        onPasswordResetSuccess={handlePasswordResetSuccess}
      />
    </div>
  );
};
