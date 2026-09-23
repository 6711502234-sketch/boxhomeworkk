import React from 'react';
import { ActiveTab, UserRole } from '../types';

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
      icon: '📦',
      badge: userRole === 'teacher' 
        ? (pendingHomeworkCount > 0 ? `${pendingHomeworkCount} รอตรวจ` : 'โพสต์ & ตรวจงาน') 
        : 'รับมอบหมายงาน',
      color: 'hover:bg-amber-100',
      activeColor: 'bg-amber-300 text-zinc-950 font-black shadow-[4px_4px_0px_#18181b] rotate-[-1deg]',
    },
    {
      id: 'quiz' as ActiveTab,
      label: 'แบบทดสอบ',
      icon: '🧪',
      badge: userRole === 'teacher' ? 'ดูคะแนนนักเรียน' : '2 บทเรียน',
      color: 'hover:bg-sky-100',
      activeColor: 'bg-sky-300 text-zinc-950 font-black shadow-[4px_4px_0px_#18181b] rotate-[1deg]',
    },
    {
      id: 'scorebook' as ActiveTab,
      label: 'สมุดคะแนน',
      icon: '🌟',
      badge: userRole === 'teacher' ? 'ให้สติกเกอร์ ⭐' : 'เกียรติยศ',
      color: 'hover:bg-emerald-100',
      activeColor: 'bg-emerald-300 text-zinc-950 font-black shadow-[4px_4px_0px_#18181b] rotate-[-1deg]',
    },
    {
      id: 'reflection' as ActiveTab,
      label: 'มุมสะท้อน',
      badge: userRole === 'teacher' ? 'อ่านเสียงสะท้อน' : '+20 ⭐',
      icon: '💬',
      color: 'hover:bg-pink-100',
      activeColor: 'bg-pink-300 text-zinc-950 font-black shadow-[4px_4px_0px_#18181b] rotate-[1deg]',
    },
    ...(userRole === 'teacher'
      ? [
          {
            id: 'dashboard' as ActiveTab,
            label: 'Dashboard',
            badge: 'กราฟประเมิน',
            icon: '📊',
            color: 'hover:bg-indigo-100',
            activeColor: 'bg-indigo-300 text-zinc-950 font-black shadow-[4px_4px_0px_#18181b] rotate-[-1deg]',
          },
        ]
      : []),
  ];

  return (
    <nav className={`grid ${userRole === 'teacher' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'} gap-2 sm:gap-3 w-full mb-5 sm:mb-6`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`w-full min-h-[58px] sm:min-h-[64px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-[16px_12px_18px_14px] border-2 border-zinc-900 text-xs sm:text-sm md:text-base font-black transition-all cursor-pointer select-none active:scale-[0.98] ${
              isActive
                ? `${tab.activeColor} translate-y-[-2px]`
                : `bg-white/95 text-zinc-800 ${tab.color} hover:translate-y-[-1px] shadow-[3px_3px_0px_#18181b]`
            }`}
          >
            <span className="text-xl sm:text-2xl shrink-0 leading-none">{tab.icon}</span>
            <span className="tracking-tight text-center truncate max-w-full">{tab.label}</span>
            {tab.badge && (
              <span
                className={`text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-full border border-zinc-900 shadow-[1px_1px_0px_#000] shrink-0 whitespace-nowrap ${
                  tab.id === 'reflection'
                    ? 'bg-amber-300 text-zinc-950'
                    : 'bg-rose-400 text-zinc-950'
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


