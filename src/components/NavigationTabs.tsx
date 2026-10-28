import React from 'react';
import { ActiveTab, UserRole } from '../types';
import {
  DoodleHomework,
  DoodleQuizBulb,
  DoodleTrophy,
  DoodleReflectionChat,
  DoodleChart,
  DoodleShield,
} from './DoodleIcons';
import {
  Users,
  BookOpen,
  Layers,
  FileText,
  Award,
  CheckSquare,
  MessageSquare,
  Printer,
  Sparkles,
  BarChart3,
  Star,
} from 'lucide-react';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  userRole: UserRole;
  pendingHomeworkCount?: number;
  hasActiveReflectionLive?: boolean;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  pendingHomeworkCount = 0,
  hasActiveReflectionLive = false,
}) => {
  // -------------------------------------------------------------
  // 1. ADMIN MAIN MENU (Admin ใช้แบนเนอร์ศูนย์ควบคุมและแถบเมนูใน AdminView เป็นเมนูหลักด้านบนสุดโดยตรง)
  // -------------------------------------------------------------
  if (userRole === 'admin') {
    return null;
  }

  // -------------------------------------------------------------
  // 2. TEACHER & STUDENT TABS (ครูจะไม่มีเมนู Admin จัดการระบบอีกต่อไป)
  // -------------------------------------------------------------
  const isTeacher = userRole === 'teacher';

  const regularTabs: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge: string;
    isLiveAlert: boolean;
  }[] = [
    {
      id: 'homework',
      label: 'เพิ่มชิ้นงาน',
      icon: DoodleHomework,
      badge: isTeacher
        ? pendingHomeworkCount > 0
          ? `${pendingHomeworkCount} รอตรวจ`
          : 'โพสต์ & ตรวจงาน'
        : 'รับมอบหมายงาน',
      isLiveAlert: false,
    },
    {
      id: 'quiz',
      label: 'แบบทดสอบ',
      icon: DoodleQuizBulb,
      badge: isTeacher ? 'ดูคะแนนนักเรียน' : '2 บทเรียน',
      isLiveAlert: false,
    },
    {
      id: 'scorebook',
      label: 'สมุดคะแนน',
      icon: DoodleTrophy,
      badge: isTeacher ? 'ให้สติกเกอร์' : 'เกียรติยศ',
      isLiveAlert: false,
    },
    {
      id: 'reflection',
      label: 'มุมสะท้อนความคิด',
      icon: DoodleReflectionChat,
      badge: isTeacher
        ? hasActiveReflectionLive
          ? '🟢 เปิดสนทนาสด'
          : 'กระดานสนทนา'
        : hasActiveReflectionLive
        ? '🔴 สนทนาสด!'
        : 'กระดานสนทนา',
      isLiveAlert: userRole === 'student' && hasActiveReflectionLive,
    },
    ...(isTeacher
      ? [
          {
            id: 'dashboard' as ActiveTab,
            label: 'Dashboard',
            icon: DoodleChart,
            badge: 'กราฟประเมิน',
            isLiveAlert: false,
          },
        ]
      : []),
  ];

  return (
    <nav
      className={`grid ${
        isTeacher
          ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
          : 'grid-cols-2 md:grid-cols-4'
      } gap-2 sm:gap-3 w-full mb-6`}
    >
      {regularTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComp = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`w-full min-h-[54px] sm:min-h-[60px] flex items-center justify-center gap-2 px-3 py-3 rounded-xl border text-base sm:text-lg font-bold transition-all cursor-pointer select-none ${
              isActive
                ? 'bg-amber-400 text-stone-900 border-amber-500 shadow-sm'
                : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-50/70 shadow-2xs'
            }`}
          >
            <IconComp className="w-6 h-6 shrink-0" />
            <span className="tracking-tight text-center truncate font-bold text-base sm:text-lg md:text-xl">
              {tab.label}
            </span>
            {tab.badge && (
              <span
                className={`text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full border shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 transition-all ${
                  tab.isLiveAlert
                    ? 'bg-rose-500 text-white border-rose-600 shadow-sm animate-pulse ring-2 ring-rose-300'
                    : isActive
                    ? 'bg-white text-stone-900 border-amber-300 shadow-2xs'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {tab.isLiveAlert && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                )}
                <span>{tab.badge}</span>
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
