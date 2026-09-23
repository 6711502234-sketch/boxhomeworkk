import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { AvatarDisplay } from './DoodleAvatars';
import {
  STUDENT_DOODLE_AVATARS,
  TEACHER_DOODLE_AVATARS,
} from './DoodleAvatars';
import { triggerFestiveConfetti, triggerStarBurst } from '../utils/confetti';
import {
  Camera,
  Upload,
  Trash2,
  Check,
  X,
  Sparkles,
  User,
  Image as ImageIcon,
  Save,
  RotateCcw,
} from 'lucide-react';

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user.avatar || 'student-boy-glasses');
  const [displayName, setDisplayName] = useState<string>(user.name || '');
  const [classRoom, setClassRoom] = useState<string>(user.classRoom || 'ห้อง 1');
  const [studentNo, setStudentNo] = useState<string>(user.studentNo || '01');
  const [activeTab, setActiveTab] = useState<'upload' | 'doodle'>('upload');
  const [uploadError, setUploadError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedAvatar(user.avatar || 'student-boy-glasses');
      setDisplayName(user.name || '');
      setClassRoom(user.classRoom || 'ห้อง 1');
      setStudentNo(user.studentNo || '01');
      setUploadError('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const isCustomImage =
    selectedAvatar.startsWith('data:image/') ||
    selectedAvatar.startsWith('http://') ||
    selectedAvatar.startsWith('https://') ||
    selectedAvatar.startsWith('blob:');

  // Process uploaded image file: Resize to 240x240 square thumbnail to save efficiently in localStorage
  const handleFileProcess = (file: File) => {
    setUploadError('');
    if (!file.type.startsWith('image/')) {
      setUploadError('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, JPEG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('ขนาดไฟล์ใหญ่เกิน 5MB กรุณาเลือกรูปภาพที่มีขนาดเล็กลง');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        // Create canvas to crop & scale to square
        const canvas = document.createElement('canvas');
        const size = 240;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setSelectedAvatar(result);
          return;
        }

        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedAvatar(optimizedDataUrl);
        triggerStarBurst();
      };
      img.onerror = () => {
        setUploadError('ไม่สามารถอ่านไฟล์รูปภาพนี้ได้ กรุณาลองใหม่อีกครั้ง');
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  // Delete / Reset profile picture to default
  const handleDeleteAvatar = () => {
    const defaultAvatar =
      user.role === 'teacher' ? 'teacher-female-glasses' : 'student-boy-glasses';
    setSelectedAvatar(defaultAvatar);
    triggerStarBurst();
  };

  // Save changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      avatar: selectedAvatar,
      name: displayName.trim() || user.name,
      classRoom: classRoom.trim() || user.classRoom,
      studentNo: studentNo.trim() || user.studentNo,
    };

    onUpdateUser(updated);
    triggerFestiveConfetti();
    onClose();
  };

  const avatarChoices =
    user.role === 'teacher' ? TEACHER_DOODLE_AVATARS : STUDENT_DOODLE_AVATARS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white sketch-border-lg rounded-[26px_18px_24px_18px] p-5 sm:p-7 shadow-[8px_8px_0px_#18181b] max-h-[92vh] overflow-y-auto">
        {/* Washi Tape */}
        <div className="washi-tape -top-3.5 left-1/2 -translate-x-1/2 bg-pink-300 rotate-[-1deg]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 border border-zinc-300 cursor-pointer transition-colors"
          title="ปิดหน้าต่าง"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-300 border-2 border-zinc-900 shadow-[2px_2px_0px_#000] flex items-center justify-center text-zinc-950 shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
              Profile
            </h2>
            <p className="text-xs font-bold text-zinc-500">
              {user.role === 'student' ? 'จัดการรูปภาพและข้อมูลโปรไฟล์นักเรียน' : 'จัดการรูปภาพและข้อมูลโปรไฟล์คุณครู'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Large Centered Profile Picture with Interactive Change Controls */}
          <div className="p-5 bg-[#FFFDF5] rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_#18181b] flex flex-col items-center justify-center text-center">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />

            {/* Large Avatar Centerpiece */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative group cursor-pointer transition-all ${
                isDragging ? 'scale-105' : 'hover:scale-[1.02]'
              }`}
              title="คลิกเพื่อเปลี่ยนรูปภาพ Profile"
            >
              <div
                className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 ${
                  isDragging ? 'border-amber-500 bg-amber-100' : 'border-zinc-900 bg-amber-50'
                } overflow-hidden shadow-[5px_5px_0px_#18181b] flex items-center justify-center transition-colors`}
              >
                <AvatarDisplay
                  avatar={selectedAvatar}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Hover Dark Overlay with Camera Prompt */}
              <div className="absolute inset-0 rounded-full bg-zinc-950/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white font-black text-xs sm:text-sm transition-opacity pointer-events-none gap-1">
                <Camera className="w-7 h-7 drop-shadow-sm" />
                <span className="drop-shadow-sm">เปลี่ยนรูปภาพ</span>
              </div>

              {/* Floating Camera Badge at Bottom Right */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="absolute bottom-1 right-1 w-11 h-11 rounded-full bg-amber-400 hover:bg-amber-300 border-2 border-zinc-900 flex items-center justify-center text-zinc-900 shadow-[2px_2px_0px_#000] cursor-pointer transition-transform hover:scale-110 active:scale-95"
                title="เลือกรูปภาพใหม่"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Error Banner if any */}
            {uploadError && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-1.5">
                ⚠️ {uploadError}
              </div>
            )}

            {/* Quick Action Buttons Directly Under the Large Profile */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-amber-300 hover:bg-amber-400 text-zinc-950 text-xs font-black rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer transition-all active:translate-y-0.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>เปลี่ยนรูปภาพ (อัปโหลด)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'doodle' ? 'upload' : 'doodle')}
                className={`px-3.5 py-2 text-xs font-black rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === 'doodle'
                    ? 'bg-pink-300 text-zinc-950'
                    : 'bg-white hover:bg-zinc-100 text-zinc-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{activeTab === 'doodle' ? 'ซ่อนตัวเลือกตัวการ์ตูน' : 'เลือกตัวการ์ตูน'}</span>
              </button>

              {isCustomImage && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black rounded-xl border border-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                  title="ลบรูปภาพที่อัปโหลด"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>ลบรูป</span>
                </button>
              )}
            </div>

            {/* Optional Collapsible Character Grid */}
            {activeTab === 'doodle' && (
              <div className="w-full mt-4 pt-4 border-t border-zinc-200 text-left">
                <span className="text-xs font-black text-zinc-700 block mb-2">
                  คลิกเพื่อเลือกตัวการ์ตูน:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-52 overflow-y-auto p-1.5 bg-zinc-50 rounded-xl border border-zinc-300">
                  {avatarChoices.map((item) => {
                    const isSelected = selectedAvatar === item.id;
                    const IconComp = item.component;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(item.id);
                          triggerStarBurst();
                        }}
                        className={`p-2 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-300 border-zinc-900 shadow-[2px_2px_0px_#000] scale-105'
                            : 'bg-white border-zinc-300 hover:bg-amber-50 hover:border-zinc-700'
                        }`}
                        title={item.name}
                      >
                        <IconComp className="w-9 h-9" />
                        <span className="text-[10px] font-bold text-zinc-800 mt-1 truncate max-w-full">
                          {item.name}
                        </span>
                        {isSelected && (
                          <span className="mt-0.5 text-[9px] font-black bg-zinc-900 text-white px-1.5 rounded-full">
                            เลือกแล้ว
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Profile Info Edit (Display Name, Room, No.) */}
          <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-300 space-y-3">
            <span className="text-xs font-black text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-500" />
              <span>ข้อมูลประจำตัวในบัญชี:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-black text-zinc-700 mb-1">
                  ชื่อที่แสดง:
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white p-2 rounded-xl sketch-input text-xs font-semibold text-zinc-900"
                  placeholder="ชื่อ-นามสกุล"
                />
              </div>

              {user.role === 'student' ? (
                <>
                  <div>
                    <label className="block text-[11px] font-black text-zinc-700 mb-1">
                      ห้องเรียน:
                    </label>
                    <input
                      type="text"
                      list="edit-room-list"
                      value={classRoom}
                      onChange={(e) => setClassRoom(e.target.value)}
                      className="w-full bg-white p-2 rounded-xl sketch-input text-xs font-semibold text-zinc-900"
                      placeholder="ห้อง 1"
                    />
                    <datalist id="edit-room-list">
                      <option value="ห้อง 1" />
                      <option value="ห้อง 2" />
                      <option value="ห้อง 3" />
                      <option value="ห้อง 4" />
                      <option value="ห้อง 5" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-zinc-700 mb-1">
                      เลขที่:
                    </label>
                    <input
                      type="text"
                      value={studentNo}
                      onChange={(e) => setStudentNo(e.target.value)}
                      className="w-full bg-white p-2 rounded-xl sketch-input text-xs font-semibold text-zinc-900"
                      placeholder="01"
                    />
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-black text-zinc-700 mb-1">
                    กลุ่มสาระ / วิชา:
                  </label>
                  <input
                    type="text"
                    value={classRoom}
                    onChange={(e) => setClassRoom(e.target.value)}
                    className="w-full bg-white p-2 rounded-xl sketch-input text-xs font-semibold text-zinc-900"
                    placeholder="เช่น วิทยาศาสตร์และเทคโนโลยี"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-black cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-zinc-950 text-sm font-black sketch-btn flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_#000]"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกรูปภาพและข้อมูล</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
