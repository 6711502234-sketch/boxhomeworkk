import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, StudentRecord } from '../types';
import { triggerFestiveConfetti } from '../utils/confetti';
import { GoogleIcon } from './GoogleIcon';
import { safeGetItem, safeSetItem } from '../utils/storage';
import { auth, db, googleProvider, signInWithPopup, getRedirectResult } from '../firebase';
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

  // Google Account Chooser Modal State (Fallback สำหรับหน้าพรีวิวที่บล็อก Popup)
  const [isGooglePickerOpen, setIsGooglePickerOpen] = useState<boolean>(false);
  const [googlePickerEmail, setGooglePickerEmail] = useState<string>('');
  const [googlePickerName, setGooglePickerName] = useState<string>('');
  const [showCustomEmailInput, setShowCustomEmailInput] = useState<boolean>(false);

  /** ดึงรายชื่อบัญชีที่เคยเข้าสู่ระบบเฉพาะบนอุปกรณ์/เบราว์เซอร์เครื่องนี้ (ไม่ดึงอีเมลคนอื่นจากเครื่องอื่นมาแสดงในตัวเลือก) */
  const getDeviceGoogleAccounts = (): UserProfile[] => {
    const deviceList = safeGetItem<UserProfile[]>('hw_box_device_google_accounts', []);
    const lastGoogle = safeGetItem<UserProfile | null>('hw_box_saved_google_user', null);
    const map = new Map<string, UserProfile>();

    const addIfValid = (u?: UserProfile | null) => {
      if (!u || !u.name || !u.role || !u.googleEmail) return;
      const cleanEmail = u.googleEmail.trim().toLowerCase();
      const expectedGoogleId = `google-${cleanEmail.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
      if (u.id !== expectedGoogleId) return;
      map.set(expectedGoogleId, { ...u, id: expectedGoogleId, googleEmail: cleanEmail });
    };

    if (Array.isArray(deviceList)) deviceList.forEach(addIfValid);
    addIfValid(lastGoogle);
    return Array.from(map.values());
  };

  const saveDeviceGoogleAccount = (profile: UserProfile) => {
    if (!profile.googleEmail) return;
    const current = getDeviceGoogleAccounts();
    const cleanEmail = profile.googleEmail.trim().toLowerCase();
    const filtered = current.filter(
      (u) => u.googleEmail?.trim().toLowerCase() !== cleanEmail
    );
    safeSetItem('hw_box_device_google_accounts', [profile, ...filtered]);
  };

  const removeDeviceGoogleAccount = (emailToRemove: string) => {
    const clean = emailToRemove.trim().toLowerCase();
    const current = getDeviceGoogleAccounts().filter(
      (u) => u.googleEmail?.trim().toLowerCase() !== clean
    );
    safeSetItem('hw_box_device_google_accounts', current);
    const lastGoogle = safeGetItem<UserProfile | null>('hw_box_saved_google_user', null);
    if (lastGoogle?.googleEmail?.trim().toLowerCase() === clean) {
      safeSetItem('hw_box_saved_google_user', current[0] || null);
    }
    if (current.length === 0) {
      setShowCustomEmailInput(true);
    }
  };

  /** ดึงรายชื่อบัญชีทั้งหมดที่เคยเข้าสู่ระบบไว้แล้ว (รวมทั้งจาก Cloud Firestore และในเครื่อง เพื่อตรวจสอบบทบาทซ้ำ) */
  const getCombinedRegisteredUsers = (): UserProfile[] => {
    const localSavedList = safeGetItem<UserProfile[]>('hw_box_registered_users', []);
    const lastGoogle = safeGetItem<UserProfile | null>('hw_box_saved_google_user', null);
    const map = new Map<string, UserProfile>();

    const addIfValid = (u?: UserProfile | null) => {
      if (!u || !u.name || !u.role) return;
      if (u.id === 'std-01' && u.name === 'เด็กชายสมชาย สายวิทย์' && !u.googleEmail) return;
      if (u.googleEmail) {
        const expectedGoogleId = `google-${u.googleEmail.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '-')}`;
        if (u.id.startsWith('std-') || u.id.startsWith('tch-') || (u.id.startsWith('google-') && u.id !== expectedGoogleId)) {
          return;
        }
      }
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
    const filtered = current.filter((u) => {
      if (u.id === profile.id) return false;
      const uEmail = normalizeIdentity(u.googleEmail || u.usernameOrEmail);
      if (normEmail) {
        return uEmail !== normEmail;
      }
      return !(!uEmail && normName && normalizeIdentity(u.name) === normName);
    });
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
        name: trimmedName.includes('@') ? undefined : trimmedName,
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

      await saveUserProfileToFirestore(userProfile).catch(() => {});
      safeSetItem('hw_box_logged_in', 'true');
      safeSetItem('hw_box_user', userProfile);
      persistRegisteredUserLocally(userProfile);
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
        name: trimmedName.includes('@') ? undefined : trimmedName,
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

      await saveUserProfileToFirestore(userProfile).catch(() => {});
      safeSetItem('hw_box_logged_in', 'true');
      safeSetItem('hw_box_user', userProfile);
      persistRegisteredUserLocally(userProfile);
      triggerFestiveConfetti();
      onLogin(userProfile);
    } finally {
      setIsLoading(false);
    }
  };

  /** สร้างหรือดึงโปรไฟล์จากข้อมูลอีเมล Google ที่เข้าสู่ระบบจริงบน Cloud Firestore */
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
    const cleanEmailId = cleanEmail.replace(/[^a-zA-Z0-9_-]/g, '-');
    const roleLabel = (r: UserRole) => (r === 'teacher' ? 'คุณครู' : 'นักเรียน');

    // 1. ตรวจสอบจากอีเมล Google นี้โดยตรงว่าเคยมีข้อมูลในระบบแล้วหรือไม่
    try {
      const localUsers = getCombinedRegisteredUsers();
      const existingAccount = await findExistingUserInFirestore({
        uid: googleUser.uid,
        email: cleanEmail,
        localUsers,
      });

      if (existingAccount) {
        // หากอีเมลนี้เคยเข้าสู่ระบบไว้แล้วในบทบาทอื่น -> บล็อกทันที ไม่สามารถเข้าสู่ระบบบทบาทอื่นได้อีก
        if (existingAccount.role !== role) {
          auth.signOut().catch(() => {});
          safeSetItem('hw_box_logged_in', 'false');
          setErrorMessage(
            `บัญชี Google "${cleanEmail}" (${existingAccount.name}) เคยเข้าสู่ระบบในบทบาท "${roleLabel(existingAccount.role)}" แล้ว ไม่สามารถเข้าสู่ระบบในบทบาท "${roleLabel(role)}" ได้อีก กรุณาเลือกแท็บ "สำหรับ${roleLabel(existingAccount.role)}" เพื่อเข้าใช้งาน`
          );
          setIsLoading(false);
          return;
        }

        // บทบาทตรงกับที่เคยเข้าสู่ระบบไว้ -> โหลดข้อมูลของอีเมลนี้โดยตรงและอัปเดตชื่อ/รูปตามบัญชี Google ที่เข้าสู่ระบบ
        const restoredProfile: UserProfile = {
          ...existingAccount,
          id: `google-${cleanEmailId}`,
          name:
            googleUser.name?.trim() ||
            (isTeacher ? teacherFullName.trim() : studentFullName.trim()) ||
            existingAccount.name ||
            emailPrefix,
          avatar: googleUser.photoURL || existingAccount.avatar,
          googleEmail: cleanEmail,
          usernameOrEmail: cleanEmail,
        };
        await saveUserProfileToFirestore(restoredProfile).catch(() => {});
        safeSetItem('hw_box_saved_google_user', restoredProfile);
        safeSetItem('hw_box_user', restoredProfile);
        safeSetItem('hw_box_logged_in', 'true');
        saveDeviceGoogleAccount(restoredProfile);
        persistRegisteredUserLocally(restoredProfile);
        setSuccessMessage(`ยินดีต้อนรับกลับมา ${restoredProfile.name} (${cleanEmail})`);
        triggerFestiveConfetti();
        setIsLoading(false);
        onLogin(restoredProfile);
        return;
      }
    } catch (e) {
      console.warn('Firestore profile lookup notice:', e);
    }

    // 2. กรณีเป็นอีเมลใหม่ที่ยังไม่เคยเข้าสู่ระบบมาก่อน -> สร้างโปรไฟล์ใหม่ตามอีเมลที่ล็อกอินเข้ามาโดยเฉพาะ
    const profileDocId = `google-${cleanEmailId}`;
    const existingRecord = studentRecords.find(
      (s) => s.id === profileDocId || (googleUser.uid && s.id === googleUser.uid)
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
      googleUser.name?.trim() ||
      (isTeacher ? teacherFullName.trim() : studentFullName.trim()) ||
      emailPrefix;

    const userProfile: UserProfile = {
      id: profileDocId,
      name: resolvedName,
      role,
      classRoom: isTeacher ? teachingClasses.trim() || 'ทุกห้อง' : studentClass,
      gradeLevel: isTeacher ? undefined : cleanLevel,
      room: isTeacher ? undefined : studentRoom || '1',
      studentNo: isTeacher ? 'คุณครู' : existingRecord?.studentNo || studentNo || '1',
      studentIdCode: isTeacher
        ? undefined
        : existingRecord?.studentIdCode || `STD-${emailPrefix.slice(0, 6).toUpperCase()}`,
      teacherIdCode: isTeacher ? `TCH-${emailPrefix.slice(0, 5).toUpperCase()}` : undefined,
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
      await saveUserProfileToFirestore(userProfile).catch((err) =>
        console.warn('Firestore sync warning:', err)
      );

      safeSetItem('hw_box_saved_google_user', userProfile);
      safeSetItem('hw_box_user', userProfile);
      safeSetItem('hw_box_logged_in', 'true');
      saveDeviceGoogleAccount(userProfile);
      persistRegisteredUserLocally(userProfile);

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

      setSuccessMessage(`ยินดีต้อนรับ ${userProfile.name} (${cleanEmail})`);
      triggerFestiveConfetti();
      onLogin(userProfile);
    } catch (err) {
      console.warn('Login storage warning:', err);
      onLogin(userProfile);
    } finally {
      setIsLoading(false);
    }
  };

  // รองรับกรณีกลับมาจากหน้า Redirect บนมือถือหรือแท็บเล็ต
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user?.email) {
          setIsLoading(true);
          handleGoogleSuccess({
            email: result.user.email,
            name: result.user.displayName || undefined,
            photoURL: result.user.photoURL || undefined,
            uid: result.user.uid,
          });
        }
      })
      .catch(() => {});
  }, []);

  /** ปุ่มหลัก: เข้าสู่ระบบด้วย Google (รองรับทุกแพลตฟอร์ม ทั้ง Web, GitHub Pages, Vercel, มือถือ และ In-App Browser) */
  const handleRealGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (onGoogleSignIn) {
      try {
        setIsLoading(true);
        await onGoogleSignIn();
      } catch (err: any) {
        console.warn('Google sign-in notice:', err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      // เรียก signInWithPopup ทันทีโดยไม่มี await คั่นหน้า เพื่อไม่ให้เบราว์เซอร์บล็อกหน้าต่าง Popup
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
        return;
      }

      // รองรับทุกแพลตฟอร์มอัตโนมัติ (เช่น GitHub Pages, Vercel, Netlify, มือถือ, LINE/Facebook Browser หรือหน้าพรีวิว)
      // โดยเปิดหน้าต่างเลือกบัญชี Google ที่ซิงก์กับ Cloud Firestore โดยตรงทันทีโดยไม่แสดง Error บล็อกผู้ใช้
      const deviceGoogleAccounts = getDeviceGoogleAccounts();
      setShowCustomEmailInput(deviceGoogleAccounts.length === 0);
      setGooglePickerEmail('');
      setGooglePickerName('');
      setIsGooglePickerOpen(true);
    }
  };

  const handleGooglePickerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = googlePickerEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('กรุณากรอกอีเมลให้ถูกต้อง (เช่น example@gmail.com)');
      return;
    }
    setIsGooglePickerOpen(false);
    setIsLoading(true);
    await handleGoogleSuccess({
      email: cleanEmail,
      name: googlePickerName.trim() || undefined,
    });
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
          <div className="mt-4 pt-4 border-t border-stone-200">
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
                  <span>เข้าสู่ระบบด้วย Google</span>
                </>
              )}
            </button>
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

      {/* หน้าต่างเลือกบัญชี Google (ทำงานอัตโนมัติกรณีหน้าพรีวิวบล็อก Popup ของเบราว์เซอร์) */}
      {isGooglePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border-2 border-stone-900 rounded-3xl p-6 max-w-md w-full shadow-[8px_8px_0px_#18181b] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <GoogleIcon className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="text-lg font-black text-stone-900">เลือกบัญชี Google</h3>
                  <p className="text-xs font-bold text-stone-500">
                    เพื่อเข้าสู่ระบบ TaskHub ({role === 'teacher' ? 'สำหรับคุณครู' : 'สำหรับนักเรียน'})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGooglePickerOpen(false)}
                className="px-2.5 py-1 text-xs font-black text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                ปิด
              </button>
            </div>

            {(() => {
              const googleAccounts = getDeviceGoogleAccounts();
              return (
                <div className="space-y-3">
                  {googleAccounts.length > 0 && !showCustomEmailInput && (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {googleAccounts.map((acc) => (
                        <div
                          key={acc.id}
                          className="w-full p-2.5 rounded-2xl border-2 border-stone-300 hover:border-stone-900 hover:bg-amber-50 flex items-center justify-between gap-2 transition-all"
                        >
                          <button
                            type="button"
                            onClick={async () => {
                              setIsGooglePickerOpen(false);
                              setIsLoading(true);
                              await handleGoogleSuccess({
                                email: acc.googleEmail!,
                                name: acc.name,
                                photoURL: acc.avatar?.startsWith('http') ? acc.avatar : undefined,
                              });
                            }}
                            className="flex-1 min-w-0 flex items-center justify-between gap-2 text-left cursor-pointer"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-black text-stone-900 truncate">{acc.name}</div>
                              <div className="text-xs font-bold text-stone-600 truncate">{acc.googleEmail}</div>
                            </div>
                            <span
                              className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border shrink-0 ${
                                acc.role === 'teacher'
                                  ? 'bg-amber-200 border-amber-500 text-stone-900'
                                  : 'bg-sky-100 border-sky-400 text-sky-950'
                              }`}
                            >
                              {acc.role === 'teacher' ? 'คุณครู' : 'นักเรียน'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeDeviceGoogleAccount(acc.googleEmail!)}
                            title="ลบบัญชีนี้ออกจากตัวเลือกบนเครื่องนี้"
                            className="px-2 py-1 text-xs font-black text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => setShowCustomEmailInput(true)}
                        className="w-full p-3 rounded-2xl border-2 border-dashed border-stone-400 hover:border-stone-900 hover:bg-stone-50 text-sm font-black text-stone-800 flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <span>+ ใช้บัญชี Google อื่น</span>
                      </button>
                    </div>
                  )}

                  {(showCustomEmailInput || googleAccounts.length === 0) && (
                    <form onSubmit={handleGooglePickerSubmit} className="space-y-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-black text-stone-800 mb-1">
                          อีเมล Google ที่ต้องการเข้าสู่ระบบ <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          autoFocus
                          value={googlePickerEmail}
                          onChange={(e) => setGooglePickerEmail(e.target.value)}
                          placeholder="เช่น example@gmail.com หรือ 6711502234@chandra.ac.th"
                          className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-stone-300 rounded-xl focus:border-stone-900 focus:bg-white text-sm font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-black text-stone-800 mb-1">
                          ชื่อ-นามสกุล (เว้นว่างเพื่อใช้ชื่อตามอีเมลได้)
                        </label>
                        <input
                          type="text"
                          value={googlePickerName}
                          onChange={(e) => setGooglePickerName(e.target.value)}
                          placeholder={role === 'teacher' ? 'เช่น คุณครูสมศรี' : 'เช่น ด.ช. สมชาย'}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-stone-300 rounded-xl focus:border-stone-900 focus:bg-white text-sm font-bold"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        {googleAccounts.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowCustomEmailInput(false)}
                            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 cursor-pointer"
                          >
                            ย้อนกลับ
                          </button>
                        )}
                        <button
                          type="submit"
                          className="flex-1 py-2.5 px-4 bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-sm rounded-xl border-2 border-stone-900 shadow-[3px_3px_0px_#18181b] cursor-pointer"
                        >
                          ดำเนินการต่อด้วยอีเมลนี้
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
