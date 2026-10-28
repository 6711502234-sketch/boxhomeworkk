import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { AvatarDisplay } from './DoodleAvatars';
import { triggerFestiveConfetti } from '../utils/confetti';
import {
  Shield,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building,
  Phone,
  X,
  Save,
  CheckCircle2,
} from 'lucide-react';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

const ADMIN_AVATAR_PRESETS = [
  '🛡️',
  '👨‍💼',
  '👩‍💼',
  '👑',
  '⭐',
  '🚀',
  'teacher-male-glasses',
  'teacher-female-glasses',
  'student-boy-glasses',
  'student-girl-glasses',
  'student-boy-cap',
  'student-girl-hairband',
];

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState(user.usernameOrEmail || 'admin');
  const [email, setEmail] = useState(user.googleEmail || '');
  const [password, setPassword] = useState(user.password || 'admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState(user.subjectDepartment || 'กลุ่มบริหารงานวิชาการและวัดผล');
  const [phone, setPhone] = useState(user.phone || '02-123-4567');
  const [avatar, setAvatar] = useState(user.avatar || '🛡️');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(user.name || '');
      setUsername(user.usernameOrEmail || 'admin');
      setEmail(user.googleEmail || '');
      setPassword(user.password || 'admin123');
      setShowPassword(false);
      setDepartment(user.subjectDepartment || 'กลุ่มบริหารงานวิชาการและวัดผล');
      setPhone(user.phone || '02-123-4567');
      setAvatar(user.avatar || '🛡️');
      setSavedSuccess(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
      return;
    }

    const updatedProfile: UserProfile = {
      ...user,
      name: name.trim(),
      usernameOrEmail: username.trim(),
      googleEmail: email.trim() || undefined,
      password: password.trim(),
      subjectDepartment: department.trim(),
      phone: phone.trim(),
      avatar,
      role: 'admin',
    };

    onUpdateUser(updatedProfile);
    triggerFestiveConfetti();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 border-4 border-stone-900 shadow-[8px_8px_0px_#000] relative my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b-2 border-stone-200 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 border-2 border-stone-900 flex items-center justify-center text-xl shadow-[2px_2px_0px_#000] shrink-0">
              <Shield className="w-6 h-6 text-stone-950" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-950 leading-tight">
                ตั้งค่าข้อมูลส่วนตัวผู้ดูแลระบบ (Admin Profile)
              </h2>
              <p className="text-xs font-bold text-stone-500">
                แก้ไขชื่อผู้ใช้งาน รหัสผ่าน อีเมล และข้อมูลหน่วยงานประจำตัว
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-xl text-stone-500 hover:text-stone-900 transition-colors cursor-pointer shrink-0"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {savedSuccess && (
            <div className="p-3 bg-emerald-100 border-2 border-emerald-500 rounded-2xl flex items-center gap-2 text-xs font-black text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>บันทึกการเปลี่ยนแปลงข้อมูลส่วนตัว Admin เรียบร้อยแล้ว!</span>
            </div>
          )}

          {/* Current Avatar & Selector */}
          <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-black text-amber-950">
                รูปประจำตัว / สัญลักษณ์ Admin (Avatar):
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-stone-600">แสดงผลปัจจุบัน:</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-stone-400 flex items-center justify-center shadow-xs">
                  <AvatarDisplay avatar={avatar} className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {ADMIN_AVATAR_PRESETS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-lg cursor-pointer transition-all ${
                    avatar === av
                      ? 'border-stone-900 bg-amber-300 shadow-[2px_2px_0px_#000] scale-110'
                      : 'border-stone-300 bg-white hover:bg-stone-50'
                  }`}
                  title={av}
                >
                  <AvatarDisplay avatar={av} className="w-6 h-6" />
                </button>
              ))}
            </div>
          </div>

          {/* Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-black text-stone-800 mb-1">
                ชื่อ-นามสกุล ที่แสดง (Display Name) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น ผู้ดูแลระบบ TaskHub"
                  className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border-2 border-stone-300 text-xs font-bold text-stone-900 focus:bg-white focus:border-stone-900 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-stone-800 mb-1">
                ชื่อผู้ใช้ (Admin Username สำหรับล็อกอิน) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="เช่น admin"
                  className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border-2 border-stone-300 text-xs font-bold font-mono text-stone-900 focus:bg-white focus:border-stone-900 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-stone-800 mb-1">
                อีเมลผู้ดูแลระบบ (Admin Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="เช่น admin@school.ac.th"
                  className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border-2 border-stone-300 text-xs font-bold font-mono text-stone-900 focus:bg-white focus:border-stone-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-stone-800 mb-1">
                รหัสผ่านเข้าสู่ระบบ (Password) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่าน Admin"
                  className="w-full bg-stone-50 pl-9 pr-9 py-2 rounded-xl border-2 border-stone-300 text-xs font-bold font-mono text-stone-900 focus:bg-white focus:border-stone-900 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer p-0.5"
                  title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-stone-800 mb-1">
                กลุ่มงาน / ฝ่ายบริหาร (Department)
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="เช่น กลุ่มบริหารงานวิชาการ"
                  className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border-2 border-stone-300 text-xs font-bold text-stone-900 focus:bg-white focus:border-stone-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-stone-800 mb-1">
                เบอร์โทรศัพท์ติดต่อ (Phone)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="เช่น 02-123-4567"
                  className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border-2 border-stone-300 text-xs font-bold text-stone-900 focus:bg-white focus:border-stone-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t-2 border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl border border-stone-300 cursor-pointer transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer transition-all active:translate-y-0.5"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกข้อมูลส่วนตัว</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
