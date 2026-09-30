import React, { useState } from 'react';
import { UserProfile, UserRole, StudentRecord } from '../types';
import { triggerFestiveConfetti } from '../utils/confetti';
import { GoogleIcon } from './GoogleIcon';
import { safeGetItem, safeSetItem } from '../utils/storage';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { saveUserProfileToFirestore } from '../services/firebaseSync';

const firebaseConfig = {
  oAuthClientId: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as string | undefined,
};
import {
  Loader2,
  AlertCircle,
  Check,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

/** ครอบ type ของไฟล์ JSON กัน TS error เวลา key ไม่ครบ */
const firebaseConfig = rawFirebaseConfig as Record<string, string> & {
  oAuthClientId?: string;
};

interface LoginViewProps {
  onLogin: (user: UserProfile) => void;
  /** ถ้าส่งมา จะใช้ตัวนี้แทน flow ภายในของ LoginView */
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

  const [rememberLogin, setRememberLogin] = useState<boolean>(
    () => safeGetItem<string>('hw_box_remember_login', 'true') === 'true'
  );

  /** สร้างโปรไฟล์จากข้อมูล Google จริง แล้วพาเข้าระบบ — ใครก็เข้าได้ ไม่มี whitelist */
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

    const userProfile: UserProfile = {
      id: (isTeacher ? 'tch-' : 'std-') + cleanId,
      name:
        googleUser.name ||
        (isTeacher
          ? `คุณครู (${emailPrefix})`
          : existingRecord?.name || `นักเรียน (${emailPrefix})`),
      role,
      classRoom: isTeacher
        ? 'กลุ่มสาระการเรียนรู้'
        : existingRecord?.classRoom || 'ห้อง 1',
      studentNo: isTeacher ? 'คุณครู' : existingRecord?.studentNo || '01',
      studentIdCode: isTeacher
        ? undefined
        : existingRecord?.studentIdCode || emailPrefix,
      avatar: googleUser.photoURL || (isTeacher ? '👩‍🏫' : '🧑‍🎓'),
      totalStars: existingRecord?.totalStars ?? (isTeacher ? 500 : 100),
      unlockedStickers: existingRecord?.unlockedStickers || ['first-step'],
      googleEmail: googleUser.email,
      usernameOrEmail: googleUser.email,
    };

    try {
      safeSetItem('hw_box_logged_in', 'true');
      safeSetItem('hw_box_remember_login', rememberLogin ? 'true' : 'false');
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

    // ถ้า parent ส่ง handler มา ให้ใช้ของ parent เป็นหลัก
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

      // ลองช่องทางสำรอง
      if (trySignInWithGis()) return;

      if (err?.code === 'auth/popup-blocked') {
        setErrorMessage('เบราว์เซอร์บล็อกป๊อปอัป กรุณาอนุญาตป๊อปอัปสำหรับเว็บไซต์นี้');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setErrorMessage('โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase Console');
      } else {
        setErrorMessage(err?.message || 'ไม่สามารถเชื่อมต่อระบบ Google ได้ กรุณาลองใหม่');
      }
      setIsLoading(false);
    }
  };

  const roleButtonClass = (target: UserRole) =>
    `py-3 px-3.5 rounded-lg font-bold text-base sm:text-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
      role === target
        ? 'bg-amber-400 text-stone-900 shadow-xs'
        : 'bg-transparent text-stone-600 hover:bg-amber-100/60'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-5 py-8 sm:py-12 bg-[#FFFDF5] font-['JaoTomato_Thin','JaoTomato','เจ้ามะเขือเทศ','Mali',sans-serif]">
      <div className="w-full max-w-md mx-auto">
        {/* หัวเรื่อง */}
        <div className="text-center mb-6">
          <div className="inline-flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight flex items-center justify-center">
              <span className="text-stone-900">Task</span>
              <span className="text-stone-900 bg-amber-400 px-3.5 py-1 rounded-2xl ml-2 shadow-xs font-semibold">
                Hub
              </span>
            </h1>
            <p className="text-sm sm:text-base text-stone-600 mt-2 font-medium">
              ระบบสารสนเทศการจัดการการเรียนรู้สำหรับนักเรียนและคุณครู
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-amber-300 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* เลือกบทบาท */}
          <div className="mb-6">
            <label className="block text-sm sm:text-base font-bold text-stone-800 mb-2.5 text-center">
              เลือกบทบาทสำหรับเข้าสู่ระบบด้วย Google:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#FFFDF5] rounded-xl border border-amber-300">
              <button
                type="button"
                onClick={() => {
                  setRole('student');
                  setErrorMessage('');
                }}
                className={roleButtonClass('student')}
              >
                <span>นักเรียน</span>
                {role === 'student' && <Check className="w-5 h-5 stroke-[3]" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('teacher');
                  setErrorMessage('');
                }}
                className={roleButtonClass('teacher')}
              >
                <span>คุณครู</span>
                {role === 'teacher' && <Check className="w-5 h-5 stroke-[3]" />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ปุ่ม Google ปุ่มเดียว */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleRealGoogleSignIn}
              disabled={isLoading}
              className="w-full py-4 px-5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 active:bg-amber-100 text-stone-800 text-base sm:text-lg font-bold flex items-center justify-center gap-3 cursor-pointer shadow-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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

            <div className="flex items-center justify-between pt-1 px-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-700 select-none font-medium">
                <input
                  type="checkbox"
                  checked={rememberLogin}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setRememberLogin(checked);
                    safeSetItem('hw_box_remember_login', checked ? 'true' : 'false');
                  }}
                  className="w-4 h-4 text-amber-500 rounded border-amber-300 focus:ring-amber-400 cursor-pointer"
                />
                <span>จดจำการเข้าระบบเสมอ</span>
              </label>

              <span className="text-xs sm:text-sm text-amber-900 font-bold">
                {role === 'teacher' ? 'คุณครู' : 'นักเรียน'}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-amber-200 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-stone-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>รองรับบัญชี @gmail.com และบัญชีธุรกิจ/การศึกษา</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-stone-600 font-medium">
          TaskHub • ระบบสารสนเทศการเรียนรู้
        </div>
      </div>
    </div>
  );
};
