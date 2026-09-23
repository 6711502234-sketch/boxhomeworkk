import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { UserCheck, GraduationCap, X, Sparkles, Check } from 'lucide-react';
import { DoodleStudent, DoodleTeacher } from './DoodleIcons';

interface RoleSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

const AVATAR_OPTIONS = ['🧑‍🎓', '👩‍🎓', '🦊', '🐱', '🐶', '🐼', '🤖', '🚀', '⭐', '👾', '🦁', '🦉'];

export const RoleSwitchModal: React.FC<RoleSwitchModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
}) => {
  if (!isOpen) return null;

  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [name, setName] = useState<string>(currentUser.name);
  const [classRoom, setClassRoom] = useState<string>(currentUser.classRoom || 'ห้อง 1');
  const [studentNo, setStudentNo] = useState<string>(currentUser.studentNo || '12');
  const [avatar, setAvatar] = useState<string>(currentUser.avatar || '🧑‍🎓');

  const handleSelectRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'teacher' && name === 'เด็กชายสมชาย สายวิทย์') {
      setName('คุณครูนิภาภรณ์ ใจดี (ครูผู้สอน)');
      setAvatar('👩‍🏫');
    } else if (newRole === 'student' && name.includes('ครู')) {
      setName('เด็กชายสมชาย สายวิทย์');
      setAvatar('🧑‍🎓');
    }
  };

  const handleSave = () => {
    onSaveProfile({
      ...currentUser,
      role,
      name: name.trim() || (role === 'teacher' ? 'คุณครูผู้สอน' : 'นักเรียน'),
      classRoom,
      studentNo,
      avatar,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFDF5] sketch-border-lg rounded-[24px_16px_28px_18px] p-6 md:p-8 max-w-lg w-full relative animate-in fade-in zoom-in-95 duration-200">
        {/* Washi Tape */}
        <div className="washi-tape -top-3 left-1/2 -translate-x-1/2 bg-amber-300" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-rose-200 hover:bg-rose-300 border-2 border-zinc-900 flex items-center justify-center font-bold text-zinc-900 cursor-pointer transition-transform hover:scale-105"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block p-2 bg-yellow-200 border-2 border-zinc-900 rounded-2xl text-3xl mb-2 rotate-2">
            🎭
          </div>
          <h2 className="text-2xl font-black text-zinc-900">
            ระบบสลับสถานะและโปรไฟล์ผู้ใช้งาน
          </h2>
          <p className="text-sm font-semibold text-zinc-600 mt-1">
            เลือกบทบาทเพื่อทดสอบการใช้งานระบบกล่องการบ้าน ม.3
          </p>
        </div>

        {/* Role Toggle Cards */}
        <div className="grid grid-cols-2 gap-3.5 mb-6">
          <button
            type="button"
            onClick={() => handleSelectRole('student')}
            className={`p-4 rounded-[18px_12px_16px_14px] text-left border-3 cursor-pointer transition-all ${
              role === 'student'
                ? 'bg-emerald-100 border-zinc-900 shadow-[4px_4px_0px_#18181b] scale-[1.02]'
                : 'bg-white border-zinc-300 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-200 border-2 border-zinc-900 flex items-center justify-center p-1">
                <DoodleStudent className="w-8 h-8" />
              </div>
              {role === 'student' && (
                <span className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-zinc-900 text-white flex items-center justify-center text-xs">
                  <Check className="w-4 h-4" />
                </span>
              )}
            </div>
            <div className="font-black text-zinc-900 text-base">นักเรียน ม.3</div>
            <div className="text-xs font-semibold text-zinc-600">
              ส่งการบ้าน • ทำควิซ • ประเมินครู • สะสมดาว
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRole('teacher')}
            className={`p-4 rounded-[12px_18px_14px_16px] text-left border-3 cursor-pointer transition-all ${
              role === 'teacher'
                ? 'bg-purple-100 border-zinc-900 shadow-[4px_4px_0px_#18181b] scale-[1.02]'
                : 'bg-white border-zinc-300 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-200 border-2 border-zinc-900 flex items-center justify-center p-1">
                <DoodleTeacher className="w-8 h-8" />
              </div>
              {role === 'teacher' && (
                <span className="w-6 h-6 rounded-full bg-purple-500 border-2 border-zinc-900 text-white flex items-center justify-center text-xs">
                  <Check className="w-4 h-4" />
                </span>
              )}
            </div>
            <div className="font-black text-zinc-900 text-base">คุณครูผู้สอน</div>
            <div className="text-xs font-semibold text-zinc-600">
              ตรวจการบ้าน • ดูผลประเมิน • สถิติควิซ
            </div>
          </button>
        </div>

        {/* Profile Details Form */}
        <div className="space-y-4 bg-amber-50/70 p-4 rounded-[16px_14px_18px_12px] border-2 border-zinc-900/40 mb-6">
          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-1">
              {role === 'teacher' ? 'ชื่อคุณครูผู้สอน' : 'ชื่อ-นามสกุล นักเรียน'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white px-3 py-2 rounded-xl sketch-input text-sm font-semibold text-zinc-900"
              placeholder="กรอกชื่อของคุณ"
            />
          </div>

          {role === 'student' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  ห้องเรียน
                </label>
                <input
                  type="text"
                  list="roleswitch-classroom-list"
                  value={classRoom}
                  onChange={(e) => setClassRoom(e.target.value)}
                  placeholder="เช่น ห้อง 1, ห้อง 2, ป.6/1"
                  className="w-full bg-white px-3 py-2 rounded-xl sketch-input text-sm font-semibold text-zinc-900"
                />
                <datalist id="roleswitch-classroom-list">
                  <option value="ห้อง 1" />
                  <option value="ห้อง 2" />
                  <option value="ห้อง 3" />
                  <option value="ห้อง 4" />
                  <option value="ห้อง 5" />
                  <option value="ห้อง 6" />
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  เลขที่
                </label>
                <input
                  type="text"
                  value={studentNo}
                  onChange={(e) => setStudentNo(e.target.value)}
                  className="w-full bg-white px-3 py-2 rounded-xl sketch-input text-sm font-semibold text-zinc-900"
                  placeholder="เช่น 12"
                />
              </div>
            </div>
          )}

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-2">
              เลือกอีโมจิประจำตัว (Avatar)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAvatar(item)}
                  className={`w-9 h-9 rounded-xl border-2 text-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                    avatar === item
                      ? 'bg-amber-300 border-zinc-900 shadow-[2px_2px_0px_#000]'
                      : 'bg-white border-zinc-300'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold rounded-xl sketch-btn text-sm cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black rounded-xl sketch-btn text-sm cursor-pointer shadow-[3px_3px_0px_#18181b]"
          >
            บันทึกและเริ่มใช้งาน 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
