import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { triggerFestiveConfetti } from '../utils/confetti';
import { saveUserProfileToFirestore } from '../services/firebaseSync';
import {
  X,
  Minus,
  Square,
  Lock,
  ChevronDown,
  Loader2,
  ChevronRight,
} from 'lucide-react';

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
  defaultRole?: UserRole;
  initialEmail?: string;
}

interface GoogleAccountItem {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarLetter: string;
  avatarColor: string;
  badge: string;
}

export const GoogleLoginModal: React.FC<GoogleLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  defaultRole = 'student',
  initialEmail = '',
}) => {
  const [isSigningInEmail, setIsSigningInEmail] = useState<string | null>(null);
  const [selectedLang] = useState('ภาษาไทย');

  if (!isOpen) return null;

  // Preset Google Accounts list
  const presetAccounts: GoogleAccountItem[] = [
    {
      id: 'acc-chandra',
      email: '6711502234@chandra.ac.th',
      name: '6711502234',
      role: 'student',
      avatarLetter: '6',
      avatarColor: 'bg-[#1a73e8]',
      badge: 'นักเรียน (รหัส 6711502234)',
    },
    {
      id: 'acc-somchai',
      email: 'somchai.science@gmail.com',
      name: 'สมชาย สายวิทย์',
      role: 'student',
      avatarLetter: 'ส',
      avatarColor: 'bg-[#0f9d58]',
      badge: 'นักเรียน (ม.3/1 เลขที่ 12)',
    },
    {
      id: 'acc-teacher',
      email: 'kru.nipaporn@gmail.com',
      name: 'คุณครูนิภาพร สอนสนุก',
      role: 'teacher',
      avatarLetter: 'น',
      avatarColor: 'bg-[#8430ce]',
      badge: 'คุณครู (กลุ่มสาระวิทย์-เทคโนโลยี)',
    },
  ];

  // If initialEmail was provided and not already in preset, add it to top
  const allAccounts: GoogleAccountItem[] = [...presetAccounts];
  if (initialEmail && initialEmail.includes('@') && !allAccounts.some(a => a.email.toLowerCase() === initialEmail.toLowerCase())) {
    const prefix = initialEmail.split('@')[0];
    const initialRole: UserRole = defaultRole === 'teacher' ? 'teacher' : 'student';
    allAccounts.unshift({
      id: 'acc-initial',
      email: initialEmail,
      name: prefix,
      role: initialRole,
      avatarLetter: prefix.charAt(0).toUpperCase() || 'U',
      avatarColor: 'bg-[#ea4335]',
      badge: initialRole === 'student' ? 'นักเรียน' : 'คุณครู',
    });
  }

  // Handle Account Selection and instant login
  const handleSelectAccount = async (account: {
    email: string;
    name: string;
    role: UserRole;
  }) => {
    setIsSigningInEmail(account.email);
    const isTeacher = account.role === 'teacher';
    const emailPrefix = account.email.split('@')[0];

    const userProfile: UserProfile = {
      id: (isTeacher ? 'tch-' : 'std-') + account.email.replace(/[^a-zA-Z0-9]/g, '-'),
      name: account.name || (isTeacher ? `คุณครู (${emailPrefix})` : `นักเรียน (${emailPrefix})`),
      role: account.role,
      classRoom: isTeacher ? 'กลุ่มสาระการเรียนรู้' : 'ห้อง 1',
      studentNo: isTeacher ? 'ครูผู้สอน' : '01',
      studentIdCode: isTeacher ? undefined : emailPrefix,
      avatar: isTeacher ? '👩‍🏫' : '🧑‍🎓',
      totalStars: isTeacher ? 500 : 100,
      unlockedStickers: isTeacher ? ['first-step', 'century-star'] : ['first-step'],
      googleEmail: account.email,
      usernameOrEmail: account.email,
    };

    try {
      triggerFestiveConfetti();
      localStorage.setItem('hw_box_logged_in', 'true');
      localStorage.setItem('hw_box_user', JSON.stringify(userProfile));
      await saveUserProfileToFirestore(userProfile);
      onLogin(userProfile);
      onClose();
    } finally {
      setIsSigningInEmail(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
      {/* Authentic Chrome Window Container */}
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-300 w-full max-w-[460px] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* 1. Chrome Window Bar */}
        <div className="bg-[#dee1e6] px-3 py-2 flex items-center justify-between border-b border-zinc-300 select-none">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0">
              <svg viewBox="0 0 48 48" className="w-4 h-4">
                <circle cx="24" cy="24" r="20" fill="#4285F4" />
                <path d="M24 4 L44 24 L24 24 Z" fill="#EA4335" />
                <path d="M44 24 L24 44 L24 24 Z" fill="#34A853" />
                <path d="M4 24 L24 44 L24 24 Z" fill="#FBBC05" />
                <circle cx="24" cy="24" r="9" fill="#ffffff" />
              </svg>
            </div>
            <span className="text-xs font-normal text-zinc-800 truncate">
              ลงชื่อเข้าใช้ - บัญชี Google - Google Chrome
            </span>
          </div>

          {/* Window Control Buttons */}
          <div className="flex items-center gap-2 shrink-0 text-zinc-600">
            <button
              type="button"
              className="w-5 h-5 flex items-center justify-center hover:bg-zinc-300/80 rounded"
              title="ย่อหน้าต่าง"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="w-5 h-5 flex items-center justify-center hover:bg-zinc-300/80 rounded"
              title="ขยายหน้าต่าง"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-5 h-5 flex items-center justify-center hover:bg-rose-500 hover:text-white rounded transition-colors"
              title="ปิดหน้าต่าง"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Chrome Address Bar */}
        <div className="bg-[#f1f3f4] px-3 py-1.5 border-b border-zinc-200 flex items-center gap-2">
          <div className="flex-1 bg-white rounded-full border border-zinc-300 px-3 py-1 flex items-center gap-2 overflow-hidden shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-xs text-zinc-600 truncate font-mono select-all">
              accounts.google.com/signin/oauth/identifier?client_id=hwbox
            </span>
          </div>
          <div className="flex items-center gap-1 text-zinc-500 shrink-0">
            <span className="text-[11px] font-sans px-1.5 py-0.5 rounded border border-zinc-300 bg-zinc-100">
              文/A
            </span>
          </div>
        </div>

        {/* 3. Main Google Account Selector Content */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 bg-white space-y-5">
          {/* Google Logo & Title */}
          <div className="flex flex-col items-center text-center">
            <GoogleIcon className="w-10 h-10 mb-2" />
            <h2 className="text-xl sm:text-2xl font-normal text-zinc-900 tracking-tight">
              เลือกบัญชี
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1">
              คลิกเลือกบัญชีเพื่อเข้าสู่ระบบ <span className="font-bold text-zinc-800">กล่องการบ้าน</span>
            </p>
          </div>

          {/* Accounts List (Click to choose account and sign in normally) */}
          <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
            {allAccounts.map((account) => {
              const isSelected = isSigningInEmail === account.email;
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => handleSelectAccount(account)}
                  disabled={Boolean(isSigningInEmail)}
                  className="w-full text-left p-3.5 hover:bg-zinc-50 transition-colors flex items-center justify-between gap-3 group cursor-pointer disabled:opacity-60"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* User Avatar Circle */}
                    <div
                      className={`w-10 h-10 rounded-full ${account.avatarColor} text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs`}
                    >
                      {account.avatarLetter}
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-bold text-zinc-900 truncate group-hover:text-blue-600 transition-colors">
                        {account.name}
                      </div>
                      <div className="text-xs text-zinc-500 truncate">
                        {account.email}
                      </div>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                        {account.badge}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-zinc-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
                    {isSelected ? (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Privacy Note */}
          <div className="text-[11px] text-zinc-500 leading-relaxed text-center pt-2">
            หากต้องการดำเนินการต่อ Google จะแชร์ชื่อ ที่อยู่อีเมล การตั้งค่าภาษา และรูปโปรไฟล์ของคุณกับ <span className="font-semibold text-zinc-700">กล่องการบ้าน</span>
          </div>
        </div>

        {/* 4. Google Window Footer */}
        <div className="bg-[#f8f9fa] px-6 py-3 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600 select-none">
          <div className="relative inline-flex items-center gap-1 cursor-pointer hover:text-zinc-900 text-xs">
            <span>{selectedLang}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="hover:text-zinc-800 cursor-pointer">ความช่วยเหลือ</span>
            <span className="hover:text-zinc-800 cursor-pointer">ความเป็นส่วนตัว</span>
            <span className="hover:text-zinc-800 cursor-pointer">ข้อกำหนด</span>
          </div>
        </div>

      </div>
    </div>
  );
};
