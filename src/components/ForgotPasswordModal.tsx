import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { triggerFestiveConfetti, triggerStarBurst } from '../utils/confetti';
import {
  KeyRound,
  Mail,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  X,
  Send,
} from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole: UserRole;
  defaultUsernameOrEmail?: string;
  onPasswordResetSuccess: (account: string, newPass: string, role: UserRole) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultRole,
  defaultUsernameOrEmail = '',
  onPasswordResetSuccess,
}) => {
  // Step: 1 = Enter Email, 2 = Verify OTP, 3 = Set New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [role, setRole] = useState<UserRole>(defaultRole);

  // Step 1: Email / Username
  const [accountInput, setAccountInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Step 2: OTP State
  const [otpCode, setOtpCode] = useState('');
  const [systemGeneratedOtp, setSystemGeneratedOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isCopied, setIsCopied] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');

  // Step 3: New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync initial values
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRole(defaultRole);
      setAccountInput(defaultUsernameOrEmail);
      setErrorMessage('');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setSystemGeneratedOtp('');
    }
  }, [isOpen, defaultRole, defaultUsernameOrEmail]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  // Generate 6-digit random code
  const generateNewOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Step 1: Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmed = accountInput.trim();
    if (!trimmed) {
      setErrorMessage('กรุณาระบุอีเมลหรือชื่อผู้ใช้ที่ต้องการกู้คืนรหัสผ่าน');
      return;
    }

    // Determine target email
    const emailToUse = trimmed.includes('@')
      ? trimmed
      : trimmed.toLowerCase().startsWith('kru')
      ? `${trimmed}@school.ac.th`
      : `${trimmed}@chandra.ac.th`;

    setIsSending(true);

    // Simulate sending network request (takes 600ms)
    setTimeout(() => {
      const generated = generateNewOtp();
      setSystemGeneratedOtp(generated);
      setTargetEmail(emailToUse);
      setIsSending(false);
      setStep(2);
      setCountdown(60);
      triggerStarBurst();
    }, 600);
  };

  // Resend OTP handler
  const handleResendOtp = () => {
    if (countdown > 0) return;
    const generated = generateNewOtp();
    setSystemGeneratedOtp(generated);
    setCountdown(60);
    setErrorMessage('');
    triggerStarBurst();
  };

  // Copy simulated OTP to clipboard
  const handleCopyOtp = () => {
    if (systemGeneratedOtp) {
      navigator.clipboard.writeText(systemGeneratedOtp);
      setOtpCode(systemGeneratedOtp);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanOtp = otpCode.trim();
    if (!cleanOtp) {
      setErrorMessage('กรุณากรอกรหัสยืนยัน 6 หลักที่ได้รับในอีเมล');
      return;
    }

    if (cleanOtp !== systemGeneratedOtp) {
      setErrorMessage('รหัสยืนยันไม่ถูกต้อง กรุณาตรวจสอบรหัสในกล่องข้อความอีเมลอีกครั้ง');
      return;
    }

    // Validated successfully
    setStep(3);
    setErrorMessage('');
    triggerStarBurst();
  };

  // Step 3: Save New Password
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newPassword.trim()) {
      setErrorMessage('กรุณากรอกรหัสผ่านใหม่');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMessage('รหัสผ่านใหม่ควรมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('รหัสผ่านใหม่และช่องยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    // Save into localStorage credentials store
    try {
      const savedPassMap = localStorage.getItem('hw_box_user_passwords');
      const passMap = savedPassMap ? JSON.parse(savedPassMap) : {};
      const key = accountInput.trim().toLowerCase();
      passMap[key] = newPassword;
      localStorage.setItem('hw_box_user_passwords', JSON.stringify(passMap));
    } catch (err) {
      console.error(err);
    }

    triggerFestiveConfetti();
    setStep(4);
  };

  // Step 4: Finish & Return to Login with Auto-filled credentials
  const handleFinishAndLogin = () => {
    onPasswordResetSuccess(accountInput.trim(), newPassword, role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white sketch-border-lg rounded-[24px_18px_22px_16px] p-6 sm:p-7 shadow-[8px_8px_0px_#18181b] max-h-[92vh] overflow-y-auto">
        {/* Washi Tape */}
        <div className="washi-tape -top-3.5 left-1/2 -translate-x-1/2 bg-amber-300 rotate-[-1deg]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 border border-zinc-300 cursor-pointer transition-colors"
          title="ปิดหน้าต่าง"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-200 border-2 border-zinc-900 shadow-[2px_2px_0px_#000] flex items-center justify-center text-zinc-950 shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
              ลืมรหัสผ่าน / รีเซ็ตรหัสผ่าน
            </h2>
            <p className="text-xs font-bold text-zinc-500">
              รับรหัสยืนยันทางอีเมลเพื่อตั้งรหัสผ่านใหม่ได้อย่างปลอดภัย
            </p>
          </div>
        </div>

        {/* Stepper Indicator */}
        <div className="flex items-center justify-between mb-6 px-1">
          {/* Step 1 */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center border-2 border-zinc-900 ${
                step >= 1 ? 'bg-amber-300 text-zinc-950 shadow-[1px_1px_0px_#000]' : 'bg-zinc-100 text-zinc-400'
              }`}
            >
              {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
            </div>
            <span className="text-[11px] font-black text-zinc-700 hidden sm:inline">
              ระบุอีเมล
            </span>
          </div>

          <div className={`flex-1 h-0.5 mx-2 border-t-2 border-dashed ${step >= 2 ? 'border-amber-400' : 'border-zinc-300'}`} />

          {/* Step 2 */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center border-2 border-zinc-900 ${
                step >= 2 ? 'bg-amber-300 text-zinc-950 shadow-[1px_1px_0px_#000]' : 'bg-zinc-100 text-zinc-400'
              }`}
            >
              {step > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
            </div>
            <span className="text-[11px] font-black text-zinc-700 hidden sm:inline">
              ยืนยันรหัส OTP
            </span>
          </div>

          <div className={`flex-1 h-0.5 mx-2 border-t-2 border-dashed ${step >= 3 ? 'border-amber-400' : 'border-zinc-300'}`} />

          {/* Step 3 */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center border-2 border-zinc-900 ${
                step >= 3 ? 'bg-emerald-300 text-zinc-950 shadow-[1px_1px_0px_#000]' : 'bg-zinc-100 text-zinc-400'
              }`}
            >
              {step === 4 ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
            </div>
            <span className="text-[11px] font-black text-zinc-700 hidden sm:inline">
              ตั้งรหัสใหม่
            </span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border-2 border-rose-400 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2 shadow-[2px_2px_0px_#000] animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Enter Email / Username */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {/* Role indicator */}
            <div className="flex items-center gap-2 p-1.5 bg-zinc-100 rounded-xl border border-zinc-300">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg cursor-pointer transition-all ${
                  role === 'student'
                    ? 'bg-emerald-300 text-zinc-950 border border-zinc-900 shadow-[1px_1px_0px_#000]'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                👨‍🎓 บัญชีนักเรียน
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg cursor-pointer transition-all ${
                  role === 'teacher'
                    ? 'bg-purple-300 text-zinc-950 border border-zinc-900 shadow-[1px_1px_0px_#000]'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                👨‍🏫 บัญชีคุณครู
              </button>
            </div>

            <div>
              <label
                htmlFor="forgot-account-input"
                className="block text-xs font-black text-zinc-900 mb-1.5"
              >
                ชื่อผู้ใช้ หรือ อีเมลของบัญชีที่ต้องการกู้คืน <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="forgot-account-input"
                  type="text"
                  required
                  value={accountInput}
                  onChange={(e) => {
                    setAccountInput(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={
                    role === 'student'
                      ? 'เช่น 6711502234@chandra.ac.th หรือ std.somchai'
                      : 'เช่น kru.nipaporn@gmail.com หรือ teacher01'
                  }
                  className="w-full bg-[#FFFDF5] pl-10 pr-3 py-3 rounded-xl sketch-input text-sm font-semibold text-zinc-900 placeholder:text-zinc-400"
                  autoFocus
                />
              </div>
              <p className="text-[11px] font-semibold text-zinc-500 mt-1.5">
                💡 ระบบจะส่งรหัสยืนยัน 6 หลัก (OTP) ไปยังอีเมลของท่านโดยอัตโนมัติ
              </p>
            </div>

            {/* Quick Helper Presets */}
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block mb-1.5">
                คลิกเพื่อเลือกอีเมลตัวอย่างสำหรับทดสอบ:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setRole('student');
                    setAccountInput('6711502234@chandra.ac.th');
                  }}
                  className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 text-xs font-bold rounded-lg border border-emerald-300 cursor-pointer"
                >
                  👨‍🎓 6711502234@chandra.ac.th
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole('teacher');
                    setAccountInput('kru.nipaporn@gmail.com');
                  }}
                  className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-950 text-xs font-bold rounded-lg border border-purple-300 cursor-pointer"
                >
                  👨‍🏫 kru.nipaporn@gmail.com
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-black cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-zinc-950 text-sm font-black sketch-btn flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_#000] disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังส่งอีเมล...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ส่งรหัสยืนยันไปยังอีเมล</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Enter & Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* Simulated Email Delivery Banner */}
            <div className="p-3.5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl shadow-[3px_3px_0px_#000]">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-300 border border-zinc-900 flex items-center justify-center text-sm font-black shrink-0">
                  📨
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-950">
                      ส่งรหัสยืนยันเรียบร้อยแล้ว!
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-black px-2 py-0.5 rounded-full">
                      กล่องจดหมายเข้า
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                    ส่งไปยัง: <strong className="text-emerald-950 font-black">{targetEmail}</strong>
                  </p>

                  {/* Simulated OTP Notification Card */}
                  <div className="mt-2.5 p-2 bg-white rounded-xl border border-emerald-300 flex items-center justify-between gap-2 shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 block">
                        รหัส OTP 6 หลักของคุณ (สำหรับทดสอบ):
                      </span>
                      <span className="text-base sm:text-lg font-mono font-black text-zinc-900 tracking-widest">
                        {systemGeneratedOtp}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyOtp}
                      className="px-2.5 py-1.5 bg-amber-200 hover:bg-amber-300 text-zinc-950 text-xs font-black rounded-lg border border-zinc-900 flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>กรอกรหัสนี้</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* OTP Input */}
            <div>
              <label
                htmlFor="otp-input"
                className="block text-xs font-black text-zinc-900 mb-1.5"
              >
                กรอกรหัสยืนยัน 6 หลักที่ได้รับ <span className="text-rose-500">*</span>
              </label>
              <input
                id="otp-input"
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setOtpCode(val);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="• • • • • •"
                className="w-full bg-[#FFFDF5] text-center tracking-[0.4em] font-mono text-xl sm:text-2xl font-black py-3 rounded-xl sketch-input text-zinc-900 placeholder:text-zinc-300"
                autoFocus
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] font-semibold text-zinc-500">
                  รหัสยืนยันมีอายุ 10 นาที
                </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0}
                  className="text-xs font-black text-amber-700 hover:text-amber-900 disabled:text-zinc-400 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${countdown > 0 ? '' : 'text-amber-600'}`} />
                  <span>
                    {countdown > 0 ? `ส่งรหัสอีกครั้ง (${countdown}s)` : 'ส่งรหัสยืนยันอีกครั้ง'}
                  </span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>เปลี่ยนอีเมล</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-zinc-950 text-sm font-black sketch-btn flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_#000]"
              >
                <span>ยืนยันรหัส OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Set New Password */}
        {step === 3 && (
          <form onSubmit={handleSaveNewPassword} className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>รหัสยืนยันถูกต้อง! กรุณากำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ</span>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="new-password-input"
                className="block text-xs font-black text-zinc-900 mb-1.5"
              >
                รหัสผ่านใหม่ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="new-password-input"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="กรอกรหัสผ่านใหม่ของคุณ"
                  className="w-full bg-[#FFFDF5] pl-10 pr-11 py-3 rounded-xl sketch-input text-sm font-semibold text-zinc-900 placeholder:text-zinc-400"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70 active:scale-95 rounded-lg transition-all cursor-pointer"
                  title={showNewPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  aria-label={showNewPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5 stroke-[2.2]" /> : <Eye className="w-5 h-5 stroke-[2.2]" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="confirm-password-input"
                className="block text-xs font-black text-zinc-900 mb-1.5"
              >
                ยืนยันรหัสผ่านใหม่อีกครั้ง <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirm-password-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้งเพื่อยืนยัน"
                  className="w-full bg-[#FFFDF5] pl-10 pr-11 py-3 rounded-xl sketch-input text-sm font-semibold text-zinc-900 placeholder:text-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70 active:scale-95 rounded-lg transition-all cursor-pointer"
                  title={showConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  aria-label={showConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5 stroke-[2.2]" /> : <Eye className="w-5 h-5 stroke-[2.2]" />}
                </button>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-black cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-zinc-950 text-sm font-black sketch-btn flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_#000]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>บันทึกรหัสผ่านใหม่</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Success Message */}
        {step === 4 && (
          <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-300 border-2 border-zinc-900 flex items-center justify-center text-3xl mx-auto shadow-[3px_3px_0px_#000]">
              🎉
            </div>
            <div>
              <h3 className="text-xl font-black text-zinc-900">
                เปลี่ยนรหัสผ่านใหม่สำเร็จแล้ว!
              </h3>
              <p className="text-xs font-bold text-zinc-600 max-w-sm mx-auto mt-1">
                คุณสามารถใช้รหัสผ่านใหม่นี้ในการเข้าสู่ระบบกล่องการบ้านได้ทันที
              </p>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 max-w-xs mx-auto">
              <div>บัญชี: <strong>{accountInput}</strong></div>
              <div>รหัสผ่านใหม่: <strong>{newPassword}</strong></div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleFinishAndLogin}
                className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-sm rounded-xl sketch-btn cursor-pointer shadow-[3px_3px_0px_#000]"
              >
                เข้าสู่ระบบด้วยรหัสผ่านใหม่ทันที
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
