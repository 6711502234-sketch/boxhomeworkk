import React, { useState } from 'react';
import { UserProfile, UserRole, StudentRecord } from '../types';
import { triggerFestiveConfetti } from '../utils/confetti';
import { GoogleIcon } from './GoogleIcon';
import { safeGetItem, safeSetItem } from '../utils/storage';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { saveUserProfileToFirestore } from '../services/firebaseSync';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Loader2,
  AlertCircle,
  Check,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: UserProfile) => void;
  initialRole?: UserRole;
  studentRecords?: StudentRecord[];
  onRegisterStudent?: (record: StudentRecord, user: UserProfile) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  initialRole = 'student',
  studentRecords = [],
}) => {
  // Selected Role: Student or Teacher (Text-only, no icons per instructions)
  const [role, setRole] = useState<UserRole>(initialRole);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Always remember Google login session
  const [rememberLogin, setRememberLogin] = useState<boolean>(() => {
    return safeGetItem<string>('hw_box_remember_login', 'true') === 'true';
  });

  // Construct and finalize UserProfile from real Google Auth data
  const handleGoogleSuccess = async (googleUser: {
    email: string;
    name?: string;
    photoURL?: string;
    uid?: string;
  }) => {
    const isTeacher = role === 'teacher';
    const emailPrefix = googleUser.email.split('@')[0];
    const cleanId = (googleUser.uid || googleUser.email).replace(/[^a-zA-Z0-9]/g, '-');

    // Check if there is an existing student record matching this email/id
    const existingRecord = studentRecords.find(
      (s) => s.id === `std-${cleanId}` || s.studentIdCode === emailPrefix
    );

    const userProfile: UserProfile = {
      id: (isTeacher ? 'tch-' : 'std-') + cleanId,
      name: googleUser.name || (isTeacher ? `คุณครู (${emailPrefix})` : (existingRecord?.name || `นักเรียน (${emailPrefix})`)),
      role: role,
      classRoom: isTeacher ? 'กลุ่มสาระการเรียนรู้' : (existingRecord?.classRoom || 'ห้อง 1'),
      studentNo: isTeacher ? 'คุณครู' : (existingRecord?.studentNo || '01'),
      studentIdCode: isTeacher ? undefined : (existingRecord?.studentIdCode || emailPrefix),
      avatar: googleUser.photoURL || (isTeacher ? '👩‍🏫' : '🧑‍🎓'),
      totalStars: existingRecord?.totalStars || (isTeacher ? 500 : 100),
      unlockedStickers: existingRecord?.unlockedStickers || ['first-step'],
      googleEmail: googleUser.email,
      usernameOrEmail: googleUser.email,
    };

    try {
      safeSetItem('hw_box_logged_in', 'true');
      safeSetItem('hw_box_remember_login', 'true');
      safeSetItem('hw_box_saved_google_user', userProfile);
      safeSetItem('hw_box_user', userProfile);

      // Background sync to Firestore without delaying navigation
      saveUserProfileToFirestore(userProfile).catch((err) => console.warn('Firestore sync warning:', err));
      triggerFestiveConfetti();
      
      // Instant login entry
      onLogin(userProfile);
    } catch (err) {
      console.warn('Login storage warning:', err);
      onLogin(userProfile);
    }
  };

  // Real Google Authentication - Opens official Google sign-in window
  const handleRealGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // 1. Try Firebase Auth signInWithPopup first
      googleProvider.setCustomParameters({
        prompt: 'select_account',
      });

      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      if (fbUser && fbUser.email) {
        await handleGoogleSuccess({
          email: fbUser.email,
          name: fbUser.displayName || undefined,
          photoURL: fbUser.photoURL || undefined,
          uid: fbUser.uid,
        });
        return;
      }
    } catch (err: any) {
      console.warn('Firebase signInWithPopup result/error:', err);

      // If user closed the popup intentionally
      if (err.code === 'auth/popup-closed-by-user') {
        setIsLoading(false);
        setErrorMessage('ปิดหน้าต่างการเข้าสู่ระบบ Google ก่อนดำเนินการเสร็จสิ้น');
        return;
      }
      if (err.code === 'auth/cancelled-popup-request') {
        setIsLoading(false);
        return;
      }

      // If Firebase domain is restricted in this frame, use Google Identity Services OAuth popup
      if ((window as any).google?.accounts?.oauth2 && firebaseConfig.oAuthClientId) {
        try {
          const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
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
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoRes.json();
                if (userInfo && userInfo.email) {
                  await handleGoogleSuccess({
                    email: userInfo.email,
                    name: userInfo.name,
                    photoURL: userInfo.picture,
                    uid: userInfo.sub,
                  });
                } else {
                  throw new Error('ไม่พบข้อมูลอีเมลจาก Google');
                }
              } catch (fetchErr: any) {
                setErrorMessage('เกิดข้อผิดพลาดในการดึงข้อมูลจาก Google: ' + fetchErr.message);
              } finally {
                setIsLoading(false);
              }
            },
          });

          tokenClient.requestAccessToken({ prompt: 'select_account' });
          return;
        } catch (gisErr: any) {
          console.warn('Google Identity Services fallback notice:', gisErr);
        }
      }

      if (err.code === 'auth/popup-blocked') {
        setErrorMessage('เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป กรุณาอนุญาตป๊อปอัปสำหรับเว็บไซต์นี้');
      } else {
        setErrorMessage(
          err.message || 'ไม่สามารถเชื่อมต่อระบบ Google ได้ กรุณาลองใหม่อีกครั้ง'
        );
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-5 py-8 sm:py-12 bg-[#FFFDF5] font-['JaoTomato_Thin','JaoTomato','เจ้ามะเขือเทศ','Mali',sans-serif]">
      <div className="w-full max-w-md mx-auto">
        {/* App Title Header */}
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

        {/* Main Card Container */}
        <div className="bg-white border-2 border-amber-300 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Role Chooser Tabs (Text only - NO icons per instruction) */}
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
                className={`py-3 px-3.5 rounded-lg font-bold text-base sm:text-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  role === 'student'
                    ? 'bg-amber-400 text-stone-900 shadow-xs'
                    : 'bg-transparent text-stone-600 hover:bg-amber-100/60'
                }`}
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
                className={`py-3 px-3.5 rounded-lg font-bold text-base sm:text-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  role === 'teacher'
                    ? 'bg-amber-400 text-stone-900 shadow-xs'
                    : 'bg-transparent text-stone-600 hover:bg-amber-100/60'
                }`}
              >
                <span>คุณครู</span>
                {role === 'teacher' && <Check className="w-5 h-5 stroke-[3]" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ONLY ONE Google Login Button */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleRealGoogleSignIn}
              disabled={isLoading}
              className="w-full py-4 px-5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 active:bg-amber-100 text-stone-800 text-base sm:text-lg font-bold flex items-center justify-center gap-3 cursor-pointer shadow-xs transition-all disabled:opacity-60"
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

            {/* Remember Me Checkbox */}
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

          {/* Security & Authenticity Footnote */}
          <div className="mt-6 pt-5 border-t border-amber-200 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-stone-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>รองรับบัญชี @gmail.com และบัญชีธุรกิจ/การศึกษา</span>
            </div>
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="text-center mt-6 text-sm text-stone-600 font-medium">
          TaskHub • ระบบสารสนเทศการเรียนรู้
        </div>
      </div>
    </div>
  );
};
