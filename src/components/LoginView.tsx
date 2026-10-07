import React, { useState } from 'react';
import { UserProfile, UserRole, StudentRecord } from '../types';
import { triggerFestiveConfetti } from '../utils/confetti';
import { GoogleIcon } from './GoogleIcon';
import { safeSetItem } from '../utils/storage';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { saveUserProfileToFirestore } from '../services/firebaseSync';
import appletConfig from '../../firebase-applet-config.json';
import {
  AvatarStudentBoyGlasses,
  AvatarTeacherFemaleGlasses,
} from './DoodleAvatars';
import {
  DoodleZap,
  DoodleCheck,
  DoodleShield,
} from './DoodleIcons';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const firebaseConfig = {
  oAuthClientId:
    (import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as string | undefined) ||
    appletConfig.oAuthClientId,
};

interface LoginViewProps {
  onLogin: (user: UserProfile) => void;
  onGoogleSignIn?: () => void | Promise<void>;
  initialRole?: UserRole;
  studentRecords?: StudentRecord[];
  onRegisterStudent?: (record: StudentRecord, user: UserProfile) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onGoogleSignIn,
  initialRole = 'student',
  studentRecords = [],
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

  // Direct Student Login (1-step)
  const handleStudentSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!studentFullName.trim()) {
      setErrorMessage('กรุณาระบุชื่อ-นามสกุลนักเรียน');
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
        s.name === studentFullName.trim() ||
        (s.classRoom === classRoom && s.studentNo === cleanNo)
    );

    const userProfile: UserProfile = {
      id: match ? match.id : `std-${Date.now().toString().slice(-6)}`,
      name: studentFullName.trim(),
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
    saveUserProfileToFirestore(userProfile).catch(() => {});
    triggerFestiveConfetti();
    onLogin(userProfile);
  };

  // Direct Teacher Login (1-step)
  const handleTeacherSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!teacherFullName.trim()) {
      setErrorMessage('กรุณาระบุชื่อ-นามสกุลคุณครู');
      return;
    }

    const classList = teachingClasses
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const cleanTeacherKey = teacherFullName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');

    const userProfile: UserProfile = {
      id: `tch-${cleanTeacherKey}`,
      name: teacherFullName.trim(),
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
    saveUserProfileToFirestore(userProfile).catch(() => {});
    triggerFestiveConfetti();
    onLogin(userProfile);
  };

  /** สร้างโปรไฟล์จากข้อมูล Google จริง แล้วพาเข้าระบบ */
  const handleGoogleSuccess = async (googleUser: {
    email: string;
    name?: string;
    photoURL?: string;
    uid?: string;
  }) => {
    const isTeacher = role === 'teacher';
    const emailPrefix = googleUser.email.split('@')[0];
    const cleanId = (googleUser.uid || googleUser.email).replace(/[^a-zA-Z0-9]/g, '-');

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

    const userProfile: UserProfile = {
      id: (isTeacher ? 'tch-' : 'std-') + cleanId,
      name:
        (isTeacher ? teacherFullName.trim() : studentFullName.trim()) ||
        googleUser.name ||
        (isTeacher
          ? `คุณครู (${emailPrefix})`
          : existingRecord?.name || `นักเรียน (${emailPrefix})`),
      role,
      classRoom: isTeacher ? teachingClasses.trim() || 'ทุกห้อง' : studentClass,
      gradeLevel: isTeacher ? undefined : cleanLevel,
      room: isTeacher ? undefined : studentRoom || '1',
      studentNo: isTeacher ? 'คุณครู' : existingRecord?.studentNo || studentNo || '01',
      studentIdCode: isTeacher
        ? undefined
        : existingRecord?.studentIdCode || emailPrefix,
      subjectDepartment: isTeacher ? subjectDepartment : undefined,
      teachingSubject: isTeacher ? teachingSubject.trim() || undefined : undefined,
      teachingClasses: isTeacher ? classList : undefined,
      avatar:
        googleUser.photoURL ||
        (isTeacher ? 'teacher-female-glasses' : 'student-boy-glasses'),
      totalStars: isTeacher ? 0 : (existingRecord?.totalStars ?? 100),
      unlockedStickers: isTeacher ? [] : (existingRecord?.unlockedStickers || ['first-step']),
      googleEmail: googleUser.email,
      usernameOrEmail: googleUser.email,
    };

    try {
      safeSetItem('hw_box_logged_in', 'true');
      safeSetItem('hw_box_saved_google_user', userProfile);
      safeSetItem('hw_box_user', userProfile);

      saveUserProfileToFirestore(userProfile).catch((err) =>
        console.warn('Firestore sync warning:', err)
      );

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

  /** ตัวสำรอง: Google Identity Services เมื่อ popup ของ Firebase ใช้ไม่ได้ */
  const trySignInWithGis = (): boolean => {
    const gis = (window as any).google?.accounts?.oauth2;
    if (!gis || !firebaseConfig.oAuthClientId) return false;

    try {
      const tokenClient = gis.initTokenClient({
        client_id: firebaseConfig.oAuthClientId,
        scope: 'email profile openid',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            setIsLoading(false);
            if (tokenResponse.error !== 'access_denied') {
              setErrorMessage('การเข้าสู่ระบบ Google ถูกยกเลิก หรือเกิดข้อผิดพลาด');
            }
            return;
          }
          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            const info = await res.json();
            if (!info?.email) throw new Error('ไม่พบข้อมูลอีเมลจาก Google');
            await handleGoogleSuccess({
              email: info.email,
              name: info.name,
              photoURL: info.picture,
              uid: info.sub,
            });
          } catch (fetchErr: any) {
            setErrorMessage('ดึงข้อมูลจาก Google ไม่สำเร็จ: ' + fetchErr.message);
            setIsLoading(false);
          }
        },
      });
      tokenClient.requestAccessToken({ prompt: 'select_account' });
      return true;
    } catch (gisErr) {
      console.warn('Google Identity Services fallback notice:', gisErr);
      return false;
    }
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
        setErrorMessage(err?.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
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
      console.warn('Firebase signInWithPopup error:', err);

      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('ปิดหน้าต่าง Google ก่อนดำเนินการเสร็จสิ้น');
        setIsLoading(false);
        return;
      }
      if (err?.code === 'auth/cancelled-popup-request') {
        setIsLoading(false);
        return;
      }

      if (trySignInWithGis()) return;

      if (err?.code === 'auth/popup-blocked') {
        setErrorMessage('เบราว์เซอร์บล็อกป๊อปอัป กรุณาอนุญาตป๊อปอัป หรือกดปุ่มเข้าสู่ระบบทันทีด้านบน');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setErrorMessage('โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase Console สามารถกรอกชื่อเพื่อเข้าใช้งานทันทีได้');
      } else {
        setErrorMessage(err?.message || 'ไม่สามารถเชื่อมต่อระบบ Google ได้ กรุณาลองใหม่');
      }
      setIsLoading(false);
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
                      วิชาที่สอน <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={teachingSubject}
                      onChange={(e) => setTeachingSubject(e.target.value)}
                      placeholder="เช่น วิทยาการคำนวณ"
                      className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-300 rounded-xl focus:border-stone-900 text-base font-bold"
                      required
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
                  <span>
                    เข้าสู่ระบบด้วย Google ({role === 'teacher' ? 'คุณครู' : 'นักเรียน'})
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-amber-200 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-stone-600 font-bold">
              <DoodleShield className="w-4 h-4 shrink-0" />
              <span>รองรับบัญชี @gmail.com และบัญชีธุรกิจ/การศึกษา</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-stone-600 font-bold">
          TaskHub • ระบบสารสนเทศการเรียนรู้
        </div>
      </div>
    </div>
  );
};
