import React from 'react';
import { UserProfile, UserRole } from '../types';
import { AvatarDisplay } from './DoodleAvatars';
import { GoogleIcon } from './GoogleIcon';
import { GoogleSheetsIcon } from './GoogleSheetsModal';
import { getGoogleSheetsConfig } from '../services/googleSheetsService';
import { Sparkles, UserCheck, GraduationCap, School, Star, Repeat, LogOut, Package, Box, Camera } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  onLogout: () => void;
  onQuickToggleRole?: () => void;
  onOpenGoogleSheets?: () => void;
  onOpenProfileModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onQuickToggleRole,
  onOpenGoogleSheets,
  onOpenProfileModal,
}) => {
  return (
    <header className="w-full bg-white border-2 border-amber-300 rounded-2xl p-4 md:p-5 mb-6 shadow-sm relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        {/* Brand - TaskHub (Large, No box icon, Warm Yellow Highlight on Hub) */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight flex items-center">
              <span className="text-stone-900">Task</span>
              <span className="text-stone-900 bg-amber-400 px-3 py-0.5 rounded-xl ml-1.5 shadow-xs font-semibold">
                Hub
              </span>
            </h1>
          </div>
        </div>

        {/* User Info & Role Actions */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 w-full md:w-auto">
          {/* Star Balance Pill - Flat Icon Style */}
          <div className="flex items-center gap-2.5 bg-[#FFFDF5] px-3.5 py-2 rounded-xl border border-amber-300 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-900 flex items-center justify-center text-sm shadow-xs font-semibold">
              ★
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                ดาวสะสม
              </div>
              <div className="text-xl md:text-2xl font-bold text-stone-900 leading-none">
                {user.totalStars}{' '}
                <span className="text-xs font-normal text-amber-700">ดวง</span>
              </div>
            </div>
          </div>

          {/* User Profile Badge with Edit Avatar Action - Flat Icon Style */}
          <div className="flex items-center gap-2.5 bg-white pl-3 pr-3.5 py-2 rounded-xl border border-amber-300 text-left shadow-xs">
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="relative shrink-0 cursor-pointer group/avatar transition-transform hover:scale-105 active:scale-95"
              title="คลิกเพื่อจัดการ Profile"
            >
              <AvatarDisplay avatar={user.avatar} className="w-10 h-10" />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 text-stone-900 rounded-full border border-white flex items-center justify-center text-[9px] shadow-xs group-hover/avatar:bg-amber-500">
                📷
              </span>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-stone-900 truncate max-w-[170px] sm:max-w-[220px]">
                  {user.name}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    user.role === 'teacher'
                      ? 'bg-amber-400 text-stone-900 font-bold'
                      : 'bg-amber-100 text-amber-950 border border-amber-300 font-bold'
                  }`}
                >
                  {user.role === 'teacher' ? 'คุณครู' : user.classRoom}
                </span>

                {onOpenProfileModal && (
                  <button
                    type="button"
                    onClick={onOpenProfileModal}
                    className="text-xs font-normal text-amber-800 hover:text-stone-900 underline decoration-amber-300 cursor-pointer ml-0.5 shrink-0"
                    title="แก้ไขรูปภาพประจำตัว"
                  >
                    เปลี่ยนรูป
                  </button>
                )}
              </div>
              <div className="text-xs font-medium text-stone-600 flex items-center gap-1.5 mt-0.5">
                {user.googleEmail ? (
                  <span className="flex items-center gap-1 text-xs text-stone-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 max-w-[200px] truncate" title={`เข้าสู่ระบบด้วย Google: ${user.googleEmail}`}>
                    <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{user.googleEmail}</span>
                  </span>
                ) : user.role === 'teacher' ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                    <span>{user.teacherIdCode ? `รหัส: ${user.teacherIdCode}` : 'คุณครู'}</span>
                  </>
                ) : (
                  <>
                    <School className="w-3.5 h-3.5 text-amber-600" />
                    <span>{user.studentIdCode ? `รหัส: ${user.studentIdCode}` : `เลขที่ ${user.studentNo}`}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Google Sheets Sync Hub Button (Teachers Only) - Flat Style */}
          {user.role === 'teacher' && onOpenGoogleSheets && (
            <button
              onClick={onOpenGoogleSheets}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-950 text-base font-bold rounded-xl border border-amber-300 cursor-pointer shadow-xs relative transition-colors"
              title="เชื่อมต่อและซิงค์ข้อมูลกับ Google Sheets (เฉพาะคุณครู)"
            >
              <GoogleSheetsIcon className="w-4 h-4" />
              <span className="hidden sm:inline font-bold">Google Sheets</span>
              {getGoogleSheetsConfig().webAppUrl ? (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white absolute -top-1 -right-1" title="เชื่อมต่อ Google Sheets เรียบร้อยแล้ว" />
              ) : null}
            </button>
          )}

          {/* Quick Role Switcher if provided */}
          {onQuickToggleRole && (
            <button
              onClick={onQuickToggleRole}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-base font-bold rounded-xl border border-amber-400 bg-amber-400 hover:bg-amber-500 text-stone-900 cursor-pointer shadow-xs transition-colors"
              title="สลับบทบาทระหว่างนักเรียนและครู"
            >
              <Repeat className="w-4 h-4" />
              <span className="hidden sm:inline font-bold">
                {user.role === 'teacher' ? 'สลับเป็นนักเรียน' : 'สลับเป็นคุณครู'}
              </span>
            </button>
          )}

          {/* Logout / Switch Account Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-amber-50 text-stone-800 text-base font-bold rounded-xl border border-amber-300 cursor-pointer transition-colors shadow-xs"
            title="ออกจากระบบ หรือเปลี่ยนบัญชีผู้ใช้งาน"
          >
            <LogOut className="w-4 h-4 text-stone-600" />
            <span className="font-bold">สลับบัญชี/ออก</span>
          </button>
        </div>
      </div>
    </header>
  );
};

