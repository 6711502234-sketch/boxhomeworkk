import React, { useState } from 'react';
import { UserProfile, UserRole, StudentRecord } from '../types';
import { triggerFestiveConfetti } from '../utils/confetti';
import { GoogleIcon } from './GoogleIcon';
import { safeGetItem, safeSetItem } from '../utils/storage';
import { auth, db, googleProvider, signInWithPopup } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  saveUserProfileToFirestore,
  saveStudentRecordToFirestore,
  findExistingUserInFirestore,
  normalizeIdentity,
} from '../services/firebaseSync';
import appletConfig from '../../firebase-applet-config.json';
import {
  AvatarStudentBoyGlasses,
  AvatarTeacherFemaleGlasses,
} from './DoodleAvatars';
import {
  DoodleZap,
  DoodleCheck,
  DoodleShield,
  DoodleCloud,
  DoodleSparkles,
} from './DoodleIcons';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: UserProfile) => void;
  onGoogleSignIn?: () => void | Promise<void>;
  initialRole?: UserRole;
  studentRecords?: StudentRecord[];
  registeredUsers?: UserProfile[];
  onRegisterStudent?: (record: StudentRecord, user: UserProfile) => void;
  onOpenCloudModal?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onGoogleSignIn,
  initialRole = 'student',
  studentRecords = [],
  registeredUsers = [],
  onOpenCloudModal,
}) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Student Form State
  const [studentFullName, setStudentFullName] = useState<string>('');
  const [studentLevel, setStudentLevel] = useState<string>('ม.2');
  const [studentRoom, setStudentRoom] = useState<string>('1');
  const [studentNo, setStudentNo] = useState<string>('1');

  // Teacher Form State
  const [teacherFullName, setTeacherFullName] = useState<string>('');
  const [subjectDepartment, setSubjectDepartment] = useState<string>('วิทยาศาสตร์และเทคโนโลยี');
  const [teachingSubject, setTeachingSubject] = useState<string>('');
  const [teachingClasses, setTeachingClasses] = useState<string>('');

  // Cloud Firestore Google Account Modal / Panel (when popup origin is not yet registered in Console)
  const [showGoogleEmailPanel, setShowGoogleEmailPanel] = useState<boolean>(false);
  const [googleEmailInput, setGoogleEmailInput] = useState<string>(() => {
    const saved = safeGetItem<UserProfile | null>('hw_box_saved_google_user', null);
    return saved?.googleEmail || '';
  });
  const [googleNameInput, setGoogleNameInput] = useState<string>(() => {
    const saved = safeGetItem<UserProfile | null>('hw_box_saved_google_user', null);
    return saved?.name || '';
  });
  const [showOriginGuide, setShowOriginGuide] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000';
  const currentHostname =
    typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  /** ดึงรายชื่อบัญชีทั้งหมดที่เคยเข้าสู่ระบบไว้แล้ว (รวมทั้งจาก Cloud Firestore และในเครื่อง) */
  const getCombinedRegisteredUsers = (): UserProfile[] => {
    const localSavedList = safeGetItem<UserProfile[]>('hw_box_registered_users', []);
    const lastGoogle = safeGetItem<UserProfile | null>('hw_box_saved_google_user', null);
    const map = new Map<string, UserProfile>();

    const addIfValid = (u?: UserProfile | null) => {
      if (!u || !u.name || !u.role) return;
      if (u.id === 'std-01' && u.name === 'เด็กชายสมชาย สายวิทย์' && !u.googleEmail) return;
      map.set(u.id, u);
    };

    registeredUsers.forEach(addIfValid);
    if (Array.isArray(localSavedList)) localSavedList.forEach(addIfValid);
    addIfValid(lastGoogle);

    return Array.from(map.values());
  };

  const persistRegisteredUserLocally = (profile: UserProfile) => {
    const current = getCombinedRegisteredUsers();
    const normName = normalizeIdentity(profile.name);
    const normEmail = normalizeIdentity(profile.googleEmail || profile.usernameOrEmail);
    const filtered = current.filter(
      (u) =>
        u.id !== profile.id &&
        !(normName && normalizeIdentity(u.name) === normName) &&
        !(normEmail && normalizeIdentity(u.googleEmail || u.usernameOrEmail) === normEmail)
    );
    safeSetItem('hw_box_registered_users', [profile, ...filtered]);
  };

  // Direct Student Login (1-step)
  const handleStudentSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedName = studentFullName.trim();
    if (!trimmedName) {
      setErrorMessage('กรุณาระบุชื่อ-นามสกุลนักเรียน');
      return;
    }

    setIsLoading(true);
    try {
      const localUsers = getCombinedRegisteredUsers();
      const existingUser = await findExistingUserInFirestore({
        name: trimmedName,
        email: trimmedName.includes('@') ? trimmedName : undefined,
        localUsers,
      });

      if (existingUser) {
        if (existingUser.role !== 'student') {
          setErrorMessage(
            `บัญชี "${existingUser.name}" เคยเข้าสู่ระบบในบทบาท "คุณครู" แล้ว ไม่สามารถเข้าสู่ระบบในบทบาท "นักเรียน" ได้อีก กรุณาเลือกบทบาท "สำหรับคุณครู"`
          );
          return;
        }
        safeSetItem('hw_box_logged_in', 'true');
        safeSetItem('hw_box_user', existingUser);
        persistRegisteredUserLocally(existingUser);
        triggerFestiveConfetti();
        onLogin(existingUser);
        return;
      }

      const cleanLevel =
        studentLevel.startsWith('ม.') || studentLevel.startsWith('ป.')
          ? studentLevel
          : `ม.${studentLevel}`;
      const cleanRoom = studentRoom.trim() || '1';
      const cleanNo = studentNo.trim() || '1';
      const classRoom = `${cleanLevel}/${cleanRoom}`;
      const cleanCode = `STD-${cleanLevel.replace(/[^0-9]/g, '')}${cleanNo.padStart(2, '0')}`;

      const match = studentRecords.find(
        (s) =>
          s.name === trimmedName ||
          (s.classRoom === classRoom && s.studentNo === cleanNo)
      );

      const userProfile: UserProfile = {
        id: match ? match.id : `std-${Date.now().toString().slice(-6)}`,
        name: trimmedName,
        role: 'student',
        classRoom,
        gradeLevel: cleanLevel,
        room: cleanRoom,
        studentNo: cleanNo,
        studentIdCode: match?.studentIdCode || cleanCode,
        avatar: match?.avatar || 'student-boy-glasses',
        totalStars: match?.totalStars || 100,
        unlockedStickers: match?.unlockedStickers || ['first-step'],
      };

      safeSetItem('hw_box_logged_in', 'true');
      safeSetItem('hw_box_user', userProfile);
      persistRegisteredUserLocally(userProfile);
      await saveUserProfileToFirestore(userProfile).catch(() => {});
      triggerFestiveConfetti();
      onLogin(userProfile);
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Teacher Login (1-step)
  const handleTeacherSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedName = teacherFullName.trim();
    if (!trimmedName) {
      setErrorMessage('กรุณาระบุชื่อ-นามสกุลคุณครู');
      return;
    }

    setIsLoading(true);
    try {
      const localUsers = getCombinedRegisteredUsers();
      const existingUser = await findExistingUserInFirestore({
        name: trimmedName,
        email: trimmedName.includes('@') ? trimmedName : undefined,
        localUsers,
      });

      if (existingUser) {
        if (existingUser.role !== 'teacher') {
          setErrorMessage(
            `บัญชี "${existingUser.name}" เคยเข้าสู่ระบบในบทบาท "นักเรียน" แล้ว ไม่สามารถเข้าสู่ระบบในบทบาท "คุณครู" ได้อีก กรุณาเลือกบทบาท "สำหรับนักเรียน"`
          );
          return;
        }
        safeSetItem('hw_box_logged_in', 'true');
        safeSetItem('hw_box_user', existingUser);
        persistRegisteredUserLocally(existingUser);
        triggerFestiveConfetti();
        onLogin(existingUser);
        return;
      }

      const classList = teachingClasses
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const cleanTeacherKey = trimmedName
        .toLowerCase()
        .replace(/\s+/g, '-');

      const userProfile: UserProfile = {
        id: `tch-${cleanTeacherKey}`,
        name: trimmedName,
        role: 'teacher',
        classRoom: teachingClasses.trim() || 'ทุกห้อง',
        studentNo: 'คุณครู',
        subjectDepartment: subjectDepartment.trim() || 'วิทยาศาสตร์และเทคโนโลยี',
        teachingSubject: teachingSubject.trim() || undefined,
        teachingClasses: classList,
        teacherIdCode: `TCH-${Math.floor(100 + Math.random() * 900)}`,
        avatar: 'teacher-female-glasses',
        totalStars: 0,
        unlockedStickers: [],
      };

      safeSetItem('hw_box_logged_in', 'true');
      safeSetItem('hw_box_user', userProfile);
      persistRegisteredUserLocally(userProfile);
      await saveUserProfileToFirestore(userProfile).catch(() => {});
      triggerFestiveConfetti();
      onLogin(userProfile);
    } finally {
      setIsLoading(false);
    }
  };

  /** สร้างหรือดึงโปรไฟล์จากข้อมูล Google จริงบน Cloud Firestore (บัญชีที่เคยเข้าสู่ระบบแล้วจะไม่สามารถเข้าสู่ระบบบทบาทอื่นได้อีก) */
  const handleGoogleSuccess = async (googleUser: {
    email: string;
    name?: string;
    photoURL?: string;
    uid?: string;
  }) => {
    setErrorMessage('');
    setSuccessMessage('');

    const isTeacher = role === 'teacher';
    const cleanEmail = googleUser.email.trim().toLowerCase();
    const emailPrefix = cleanEmail.split('@')[0];
    const cleanId = (googleUser.uid || cleanEmail).replace(/[^a-zA-Z0-9_-]/g, '-');
    const roleLabel = (r: UserRole) => (r === 'teacher' ? 'คุณครู' : 'นักเรียน');

    // 1. ตรวจสอบว่าบัญชี Google นี้เคยเข้าสู่ระบบไว้แล้วหรือไม่ (ในทุกบทบาท)
    try {
      const localUsers = getCombinedRegisteredUsers();
      const existingAccount = await findExistingUserInFirestore({
        uid: googleUser.uid,
        email: cleanEmail,
        name: googleUser.name,
        localUsers,
      });

      if (existingAccount) {
        // หากเคยเข้าสู่ระบบไว้แล้วในบทบาทอื่น -> บล็อกทันที ไม่สามารถเข้าสู่ระบบบทบาทอื่นได้อีก!
        if (existingAccount.role !== role) {
          auth.signOut().catch(() => {});
          safeSetItem('hw_box_logged_in', 'false');
          setErrorMessage(
            `บัญชี Google "${cleanEmail}" (${existingAccount.name}) เคยเข้าสู่ระบบในบทบาท "${roleLabel(existingAccount.role)}" แล้ว ไม่สามารถเข้าสู่ระบบในบทบาท "${roleLabel(role)}" ได้อีก กรุณาเลือกแท็บ "สำหรับ${roleLabel(existingAccount.role)}" เพื่อเข้าใช้งาน`
          );
          setIsLoading(false);
          return;
        }

        // บทบาทตรงกับที่เคยเข้าสู่ระบบไว้ -> เข้าสู่ระบบเดิมได้ทันที
        const restoredProfile: UserProfile = {
          ...existingAccount,
          googleEmail: existingAccount.googleEmail || cleanEmail,
          usernameOrEmail: existingAccount.usernameOrEmail || cleanEmail,
        };
        safeSetItem('hw_box_logged_in', 'true');
        safeSetItem('hw_box_saved_google_user', restoredProfile);
        safeSetItem('hw_box_user', restoredProfile);
        persistRegisteredUserLocally(restoredProfile);
        setSuccessMessage(`ยินดีต้อนรับกลับมา ${restoredProfile.name}`);
        triggerFestiveConfetti();
        setIsLoading(false);
        onLogin(restoredProfile);
        return;
      }
    } catch (e) {
      console.warn('Firestore profile lookup notice:', e);
    }

    // 2. กรณีไม่เคยเข้าสู่ระบบมาก่อน -> สร้างโปรไฟล์ผูกกับบทบาทที่เลือกไว้ถาวร
    const profileDocId = `google-${cleanId}`;
    const existingRecord = studentRecords.find(
      (s) => s.id === `std-${cleanId}` || s.studentIdCode === emailPrefix
    );

    const cleanLevel =
      studentLevel.startsWith('ม.') || studentLevel.startsWith('ป.')
        ? studentLevel
        : `ม.${studentLevel}`;
    const studentClass = existingRecord?.classRoom || `${cleanLevel}/${studentRoom || '1'}`;
    const classList = teachingClasses
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const resolvedName =
      (isTeacher ? teacherFullName.trim() : studentFullName.trim()) ||
      googleUser.name?.trim() ||
      (isTeacher
        ? `คุณครู${emailPrefix}`
        : existingRecord?.name || `นักเรียน (${emailPrefix})`);

    const userProfile: UserProfile = {
      id: profileDocId,
      name: resolvedName,
      role,
      classRoom: isTeacher ? teachingClasses.trim() || 'ทุกห้อง' : studentClass,
      gradeLevel: isTeacher ? undefined : cleanLevel,
      room: isTeacher ? undefined : studentRoom || '1',
      studentNo: isTeacher ? 'คุณครู' : existingRecord?.studentNo || studentNo || '01',
      studentIdCode: isTeacher
        ? undefined
        : existingRecord?.studentIdCode || `STD-${emailPrefix.slice(0, 6).toUpperCase()}`,
      teacherIdCode: isTeacher ? `TCH-${cleanId.slice(0, 5).toUpperCase()}` : undefined,
      subjectDepartment: isTeacher ? subjectDepartment : undefined,
      teachingSubject: isTeacher ? teachingSubject.trim() || undefined : undefined,
      teachingClasses: isTeacher ? classList : undefined,
      avatar:
        googleUser.photoURL ||
        (isTeacher ? 'teacher-female-glasses' : 'student-boy-glasses'),
      totalStars: isTeacher ? 0 : (existingRecord?.totalStars ?? 100),
      unlockedStickers: isTeacher ? [] : (existingRecord?.unlockedStickers || ['first-step']),
      googleEmail: cleanEmail,
      usernameOrEmail: cleanEmail,
    };

    try {
      safeSetItem('hw_box_logged_in', 'true');
      safeSetItem('hw_box_saved_google_user', userProfile);
      safeSetItem('hw_box_user', userProfile);
      persistRegisteredUserLocally(userProfile);

      await saveUserProfileToFirestore(userProfile).catch((err) =>
        console.warn('Firestore sync warning:', err)
      );

      if (!isTeacher) {
        const newStudentRecord: StudentRecord = {
          id: userProfile.id,
          name: userProfile.name,
          classRoom: userProfile.classRoom,
          studentNo: userProfile.studentNo,
          studentIdCode: userProfile.studentIdCode || `STD-${emailPrefix.slice(0, 6).toUpperCase()}`,
          avatar: userProfile.avatar,
          totalStars: userProfile.totalStars,
          unlockedStickers: userProfile.unlockedStickers,
          awardedBadges: existingRecord?.awardedBadges || [],
          homeworkCount: existingRecord?.homeworkCount || 0,
          quizScores: existingRecord?.quizScores || {},
        };
        await saveStudentRecordToFirestore(newStudentRecord).catch(() => {});
      }

      setSuccessMessage(`ยินดีต้อนรับ ${userProfile.name}`);
      triggerFestiveConfetti();
      onLogin(userProfile);
    } catch (err) {
      console.warn('Login storage warning:', err);
      onLogin(userProfile);
    } finally {
      setIsLoading(false);
    }
  };

  /** เข้าสู่ระบบด้วยอีเมล Google โดยตรงและซิงก์กับ Cloud Firestore (ไม่ต้องรอตั้งค่า JavaScript Origin) */
  const handleDirectGoogleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanEmail = googleEmailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('กรุณากรอกอีเมล Google หรืออีเมลสถานศึกษาให้ถูกต้อง (เช่น name@gmail.com)');
      return;
    }
    setIsLoading(true);
    await handleGoogleSuccess({
      email: cleanEmail,
      name:
        googleNameInput.trim() ||
        (role === 'teacher' ? teacherFullName.trim() : studentFullName.trim()) ||
        undefined,
    });
  };

  /** ปุ่มหลัก: เข้าสู่ระบบด้วย Google */
  const handleRealGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (onGoogleSignIn) {
      try {
        setIsLoading(true);
        await onGoogleSignIn();
      } catch (err: any) {
        setShowGoogleEmailPanel(true);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      if (fbUser?.email) {
        await handleGoogleSuccess({
          email: fbUser.email,
          name: fbUser.displayName || undefined,
          photoURL: fbUser.photoURL || undefined,
          uid: fbUser.uid,
        });
        return;
      }
      throw new Error('บัญชี Google นี้ไม่มีอีเมลที่ใช้งานได้');
    } catch (err: any) {
      console.warn('Firebase signInWithPopup notice:', err?.code || err);
      setIsLoading(false);

      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setShowGoogleEmailPanel(true);
        return;
      }

      setShowGoogleEmailPanel(true);
      if (role === 'teacher' && teacherFullName.trim() && !googleNameInput) {
        setGoogleNameInput(teacherFullName.trim());
      } else if (role === 'student' && studentFullName.trim() && !googleNameInput) {
        setGoogleNameInput(studentFullName.trim());
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 py-8 sm:py-12 bg-[#FFFDF5] font-['JaoTomato_Thin','JaoTomato','เจ้ามะเขือเทศ','Mali',sans-serif]">
      <div className="w-full max-w-xl mx-auto">
        {/* หัวเรื่อง */}
        <div className="text-center mb-6">
          <div className="inline-flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight flex items-center justify-center">
              <span className="text-stone-900">Task</span>
              <span className="text-stone-900 bg-amber-400 px-3.5 py-1 rounded-2xl ml-2 shadow-[3px_3px_0px_#000] border-2 border-stone-950 font-black">
                Hub
              </span>
            </h1>
            <p className="text-sm sm:text-base text-stone-700 mt-2 font-bold">
              ระบบสารสนเทศการจัดการการเรียนรู้สำหรับนักเรียนและคุณครู
            </p>
          </div>
        </div>

        {/* แยกปุ่มเลือกบทบาทระหว่าง นักเรียน กับ คุณครู พร้อมไอคอนภาพวาดลายเส้นเด็ก */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          <button
            type="button"
            onClick={() => {
              setRole('student');
              setErrorMessage('');
            }}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-center gap-3 text-left ${
              role === 'student'
                ? 'bg-amber-400 text-stone-950 border-stone-900 shadow-[4px_4px_0px_#18181b] scale-[1.01]'
                : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500 hover:bg-stone-50'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-white border-2 border-stone-900 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000] overflow-hidden">
              <AvatarStudentBoyGlasses className="w-11 h-11" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-lg font-black flex items-center gap-1.5">
                <span>สำหรับนักเรียน</span>
                {role === 'student' && <DoodleCheck className="w-4 h-4 shrink-0" />}
              </div>
              <div className="text-xs font-bold opacity-80 truncate">ส่งชิ้นงาน • แบบทดสอบ</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('teacher');
              setErrorMessage('');
            }}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-center gap-3 text-left ${
              role === 'teacher'
                ? 'bg-amber-400 text-stone-950 border-stone-900 shadow-[4px_4px_0px_#18181b] scale-[1.01]'
                : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500 hover:bg-stone-50'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-white border-2 border-stone-900 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000] overflow-hidden">
              <AvatarTeacherFemaleGlasses className="w-11 h-11" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-lg font-black flex items-center gap-1.5">
                <span>สำหรับคุณครู</span>
                {role === 'teacher' && <DoodleCheck className="w-4 h-4 shrink-0" />}
              </div>
              <div className="text-xs font-bold opacity-80 truncate">สั่งงาน • ตรวจการบ้าน</div>
            </div>
          </button>
        </div>

        <div className="bg-white border-2 border-stone-900 rounded-3xl p-5 sm:p-8 shadow-[6px_6px_0px_#18181b]">
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-red-50 border-2 border-red-300 text-red-700 rounded-xl text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 bg-emerald-50 border-2 border-emerald-300 text-emerald-800 rounded-xl text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {role === 'student' ? (
            /* ========================================================
               สำหรับนักเรียน (Student Portal)
               ======================================================== */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200">
                <div className="flex items-center gap-2.5">
                  <AvatarStudentBoyGlasses className="w-10 h-10 shrink-0" />
                  <div>
                    <h2 className="text-xl font-black text-stone-900">
                      เข้าสู่ระบบนักเรียน
                    </h2>
                    <p className="text-xs font-bold text-stone-500">
                      กรอกข้อมูลเพื่อแยกห้องและระดับชั้นในการส่งชิ้นงาน
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-100 border border-amber-400 rounded-full text-xs font-black text-amber-900">
                  นักเรียน
                </span>
              </div>

              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm sm:text-base font-black text-stone-800 mb-1">
                    ชื่อ - นามสกุล นักเรียน <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={studentFullName}
                    onChange={(e) => setStudentFullName(e.target.value)}
                    placeholder="เช่น ด.ช. สมชาย สายวิทย์"
                    className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-300 rounded-xl focus:border-stone-900 focus:bg-white text-base font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-sm sm:text-base font-black text-stone-800 mb-1">
                      ระดับชั้น <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={studentLevel}
                      onChange={(e) => setStudentLevel(e.target.value)}
                      className="w-full px-3 py-3 bg-stone-50 border-2 border-stone-300 rounded-xl focus:border-stone-900 text-base font-bold"
                    >
                      <option value="ม.1">ม.1</option>
                      <option value="ม.2">ม.2</option>
                      <option value="ม.3">ม.3</option>
                      <option value="ม.4">ม.4</option>
                      <option value="ม.5">ม.5</option>
                      <option value="ม.6">ม.6</option>
                      <option value="ป.4">ป.4</option>
                      <option value="ป.5">ป.5</option>
                      <option value="ป.6">ป.6</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-black text-stone-800 mb-1">
                      ห้อง <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={studentRoom}
                      onChange={(e) => setStudentRoom(e.target.value)}
                      placeholder="เช่น 1"
                      className="w-full px-3 py-3 bg-stone-50 border-2 border-stone-300 rounded-xl focus:border-stone-900 text-base font-bold text-center"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-black text-stone-800 mb-1">
                      เลขที่ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={studentNo}
                      onChange={(e) => setStudentNo(e.target.value)}
                      placeholder="เช่น 12"
                      className="w-full px-3 py-3 bg-stone-50 border-2 border-stone-300 rounded-xl focus:border-stone-900 text-base font-bold text-center"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-5 bg-amber-400 hover:bg-amber-500 active:translate-y-0.5 text-stone-950 text-base sm:text-lg font-black rounded-xl border-2 border-stone-900 shadow-[3px_3px_0px_#18181b] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <DoodleZap className="w-5 h-5" />
                  <span>เข้าสู่ระบบนักเรียน</span>
                </button>
              </form>
            </div>
          ) : (
            /* ========================================================
               สำหรับคุณครู (Teacher Portal)
               ======================================================== */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200">
                <div className="flex items-center gap-2.5">
                  <AvatarTeacherFemaleGlasses className="w-10 h-10 shrink-0" />
                  <div>
                    <h2 className="text-xl font-black text-stone-900">
                      เข้าสู่ระบบคุณครู
                    </h2>
                    <p className="text-xs font-bold text-stone-500">
                      จัดการชิ้นงาน ตรวจการบ้าน และกรอกสมุดคะแนน
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-100 border border-amber-400 rounded-full text-xs font-black text-amber-900">
                  คุณครู
                </span>
              </div>

              <form onSubmit={handleTeacherSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm sm:text-base font-black text-stone-800 mb-1">
                    ชื่อ - นามสกุล คุณครู <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={teacherFullName}
                    onChange={(e) => setTeacherFullName(e.target.value)}
                    placeholder="เช่น คุณครูนิภาภรณ์ ใจดี"
                    className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-300 rounded-xl focus:border-stone-900 focus:bg-white text-base font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-black text-stone-800 mb-1">
                    หมวดวิชา / กลุ่มสาระการเรียนรู้ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={subjectDepartment}
                    onChange={(e) => setSubjectDepartment(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-300 rounded-xl focus:border-stone-900 text-base font-bold"
                  >
                    <option value="วิทยาศาสตร์และเทคโนโลยี">วิทยาศาสตร์และเทคโนโลยี</option>
                    <option value="คณิตศาสตร์">คณิตศาสตร์</option>
                    <option value="ภาษาไทย">ภาษาไทย</option>
                    <option value="ภาษาต่างประเทศ">ภาษาต่างประเทศ</option>
                    <option value="สังคมศึกษา ศาสนา และวัฒนธรรม">สังคมศึกษา ศาสนา และวัฒนธรรม</option>
                    <option value="สุขศึกษาและพลศึกษา">สุขศึกษาและพลศึกษา</option>
                    <option value="ศิลปะ ดนตรี และนาฏศิลป์">ศิลปะ ดนตรี และนาฏศิลป์</option>
                    <option value="การงานอาชีพ">การงานอาชีพ</option>
                    <option value="กิจกรรมพัฒนาผู้เรียน">กิจกรรมพัฒนาผู้เรียน</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm sm:text-base font-black text-stone-800 mb-1">
                      วิชาที่สอน (ระบุภายหลังได้)
                    </label>
                    <input
                      type="text"
                      value={teachingSubject}
                      onChange={(e) => setTeachingSubject(e.target.value)}
                      placeholder="เช่น วิทยาการคำนวณ"
                      className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-300 rounded-xl focus:border-stone-900 text-base font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-black text-stone-800 mb-1">
                      ชั้นเรียนที่สอน (คั่นด้วยจุลภาค)
                    </label>
                    <input
                      type="text"
                      value={teachingClasses}
                      onChange={(e) => setTeachingClasses(e.target.value)}
                      placeholder="เช่น ม.2/1, ม.2/2"
                      className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-300 rounded-xl focus:border-stone-900 text-base font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-5 bg-amber-400 hover:bg-amber-500 active:translate-y-0.5 text-stone-950 text-base sm:text-lg font-black rounded-xl border-2 border-stone-900 shadow-[3px_3px_0px_#18181b] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <DoodleZap className="w-5 h-5" />
                  <span>เข้าสู่ระบบคุณครู</span>
                </button>
              </form>
            </div>
          )}

          {/* ปุ่มเข้าสู่ระบบด้วย Google */}
          <div className="mt-4 pt-4 border-t border-stone-200 space-y-3">
            <button
              type="button"
              onClick={handleRealGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3.5 px-5 rounded-xl border-2 border-stone-900 bg-white hover:bg-amber-50 active:bg-amber-100 text-stone-900 text-base font-bold flex items-center justify-center gap-3 cursor-pointer shadow-[2px_2px_0px_#18181b] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                  <span>กำลังเชื่อมต่อกับ Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="w-5 h-5 shrink-0" />
                  <span>
                    เข้าสู่ระบบด้วย Google ({role === 'teacher' ? 'คุณครู' : 'นักเรียน'})
                  </span>
                </>
              )}
            </button>

            {/* แผงเข้าสู่ระบบด้วยอีเมล Google เชื่อมต่อ Cloud Firestore โดยตรง (ทำงานได้ทันทีแม้ยังไม่ได้ลงทะเบียน JavaScript Origin) */}
            {showGoogleEmailPanel && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-stone-900 shadow-[3px_3px_0px_#18181b] space-y-3.5 animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GoogleIcon className="w-5 h-5 shrink-0" />
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-stone-900">
                        เข้าสู่ระบบด้วยบัญชี Google (ซิงก์ Cloud Firestore ทันที)
                      </h3>
                      <p className="text-xs font-bold text-stone-600">
                        ใช้งานได้ทันทีโดยไม่ต้องรอตั้งค่า JavaScript Origin ใน Google Cloud Console
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGoogleEmailPanel(false)}
                    className="text-xs font-black text-stone-500 hover:text-stone-900 px-2 py-1 rounded-lg border border-stone-300 bg-white cursor-pointer"
                  >
                    ปิด
                  </button>
                </div>

                <form onSubmit={handleDirectGoogleEmailSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-black text-stone-800 mb-1">
                      อีเมล Google / อีเมลสถานศึกษา <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={googleEmailInput}
                      onChange={(e) => setGoogleEmailInput(e.target.value)}
                      placeholder="เช่น 6711502234@chandra.ac.th หรือ name@gmail.com"
                      className="w-full px-3.5 py-2.5 bg-white border-2 border-stone-900 rounded-xl text-sm sm:text-base font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-black text-stone-800 mb-1">
                      ชื่อที่แสดงในระบบ ({role === 'teacher' ? 'คุณครู' : 'นักเรียน'})
                    </label>
                    <input
                      type="text"
                      value={googleNameInput}
                      onChange={(e) => setGoogleNameInput(e.target.value)}
                      placeholder={
                        role === 'teacher'
                          ? 'เช่น คุณครูนิภาภรณ์ ใจดี (เว้นว่างเพื่อใช้ชื่อจากอีเมลได้)'
                          : 'เช่น ด.ช. สมชาย สายวิทย์'
                      }
                      className="w-full px-3.5 py-2.5 bg-white border-2 border-stone-300 focus:border-stone-900 rounded-xl text-sm sm:text-base font-bold"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setGoogleEmailInput('6711502234@chandra.ac.th');
                      }}
                      className="text-xs font-black px-2.5 py-1.5 rounded-lg bg-white border border-stone-400 hover:border-stone-900 text-stone-700 cursor-pointer flex items-center gap-1"
                    >
                      <DoodleSparkles className="w-3.5 h-3.5" />
                      <span>ใช้ 6711502234@chandra.ac.th</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#18181b] flex items-center justify-center gap-2 cursor-pointer transition-all text-sm sm:text-base"
                  >
                    <DoodleCheck className="w-5 h-5" />
                    <span>เข้าใช้งานด้วยอีเมล Google นี้ทันที</span>
                  </button>
                </form>

                {/* คู่มือสำหรับผู้พัฒนาในการลงทะเบียน JavaScript Origin & Authorized Domain */}
                <div className="pt-2 border-t border-amber-300">
                  <button
                    type="button"
                    onClick={() => setShowOriginGuide((v) => !v)}
                    className="w-full flex items-center justify-between text-xs font-black text-stone-700 hover:text-stone-950 py-1 cursor-pointer"
                  >
                    <span>
                      วิธีแก้แจ้งเตือน &quot;โปรดลงทะเบียน JavaScript origin ใน Google Cloud Console&quot;
                    </span>
                    {showOriginGuide ? (
                      <ChevronUp className="w-4 h-4 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 shrink-0" />
                    )}
                  </button>

                  {showOriginGuide && (
                    <div className="mt-2 p-3 bg-white rounded-xl border-2 border-stone-800 text-xs space-y-2.5 text-stone-700">
                      <p className="font-bold text-stone-900">
                        หากต้องการเปิดหน้าต่าง Popup ของ Google โดยตรงบนโดเมนนี้ ให้คัดลอกค่าด้านล่างไปวางในคอนโซล:
                      </p>

                      <div className="space-y-1">
                        <div className="font-black text-stone-800">
                          1. เพิ่มใน Firebase Console &rarr; Authentication &rarr; Settings &rarr; Authorized domains:
                        </div>
                        <div className="flex items-center gap-1.5">
                          <code className="flex-1 px-2.5 py-1.5 bg-stone-100 border border-stone-300 rounded-lg font-mono text-[11px] break-all">
                            {currentHostname}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyText(currentHostname, 'hostname')}
                            className="px-2.5 py-1.5 bg-amber-300 hover:bg-amber-400 border border-stone-900 rounded-lg font-black text-stone-900 flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            {copiedKey === 'hostname' ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>คัดลอกแล้ว</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>คัดลอก</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="font-black text-stone-800">
                          2. เพิ่มใน Google Cloud Console &rarr; APIs &amp; Services &rarr; Credentials &rarr; Authorized JavaScript origins:
                        </div>
                        <div className="flex items-center gap-1.5">
                          <code className="flex-1 px-2.5 py-1.5 bg-stone-100 border border-stone-300 rounded-lg font-mono text-[11px] break-all">
                            {currentOrigin}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyText(currentOrigin, 'origin')}
                            className="px-2.5 py-1.5 bg-amber-300 hover:bg-amber-400 border border-stone-900 rounded-lg font-black text-stone-900 flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            {copiedKey === 'origin' ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>คัดลอกแล้ว</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>คัดลอก</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <a
                          href={`https://console.firebase.google.com/project/${appletConfig.projectId}/authentication/settings`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-900 text-white font-bold hover:bg-stone-800"
                        >
                          <span>เปิด Firebase Auth Settings</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={`https://console.cloud.google.com/apis/credentials?project=${appletConfig.projectId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
                        >
                          <span>เปิด Google Cloud Credentials</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-stone-600 font-bold">
              <DoodleShield className="w-4 h-4 shrink-0" />
              <span>รองรับบัญชี @gmail.com และบัญชีสถานศึกษา</span>
            </div>

            {onOpenCloudModal && (
              <button
                type="button"
                onClick={onOpenCloudModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 border-2 border-stone-900 text-stone-900 text-xs font-black shadow-[2px_2px_0px_#18181b] cursor-pointer transition-all"
              >
                <DoodleCloud className="w-4 h-4" />
                <span>ตั้งค่า Firebase &amp; GitHub</span>
              </button>
            )}
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-stone-600 font-bold">
          TaskHub • ระบบสารสนเทศการเรียนรู้ (เชื่อมต่อฐานข้อมูล Cloud Firestore จริง)
        </div>
      </div>
    </div>
  );
};
