import React from 'react';
import { ActiveTab, UserRole } from '../types';
import {
  DoodleHomework,
  DoodleQuizBulb,
  DoodleTrophy,
  DoodleReflectionChat,
  DoodleChart,
} from './DoodleIcons';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  userRole: UserRole;
  pendingHomeworkCount?: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  pendingHomeworkCount = 0,
}) => {
  const tabs = [
    {
      id: 'homework' as ActiveTab,
      label: 'เพิ่มชิ้นงาน',
      icon: DoodleHomework,
      badge: userRole === 'teacher' 
        ? (pendingHomeworkCount > 0 ? `${pendingHomeworkCount} รอตรวจ` : 'โพสต์ & ตรวจงาน') 
        : 'รับมอบหมายงาน',
    },
    {
      id: 'quiz' as ActiveTab,
      label: 'แบบทดสอบ',
      icon: DoodleQuizBulb,
      badge: userRole === 'teacher' ? 'ดูคะแนนนักเรียน' : '2 บทเรียน',
    },
    {
      id: 'scorebook' as ActiveTab,
      label: 'สมุดคะแนน',
      icon: DoodleTrophy,
      badge: userRole === 'teacher' ? 'ให้สติกเกอร์' : 'เกียรติยศ',
    },
    {
      id: 'reflection' as ActiveTab,
      label: 'มุมสะท้อน',
      icon: DoodleReflectionChat,
      badge: userRole === 'teacher' ? 'อ่านเสียงสะท้อน' : '+20 ดาว',
    },
    ...(userRole === 'teacher'
      ? [
          {
            id: 'dashboard' as ActiveTab,
            label: 'Dashboard',
            icon: DoodleChart,
            badge: 'กราฟประเมิน',
          },
        ]
      : []),
  ];

  return (
    <nav className={`grid ${userRole === 'teacher' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'} gap-2 sm:gap-3 w-full mb-6`}>
      {tabs.map((tab) => {
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
            <span className="tracking-tight text-center truncate font-bold text-base sm:text-lg md:text-xl">{tab.label}</span>
            {tab.badge && (
              <span
                className={`text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-full border shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-stone-900 border-amber-300 shadow-2xs'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};


