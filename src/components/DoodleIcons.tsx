import React from 'react';

export interface DoodleIconProps {
  className?: string;
  size?: number;
}

/** ดาววาดมือลายเส้นเด็ก (แทน ⭐ / 🌟) */
export const DoodleStar: React.FC<DoodleIconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path
      d="M32 6 C34 6, 39 20, 41 22 C43 23, 58 24, 59 26 C60 28, 48 37, 47 40 C46 43, 51 56, 49 58 C47 59, 35 50, 32 50 C29 50, 17 59, 15 58 C13 56, 18 43, 17 40 C16 37, 4 28, 5 26 C6 24, 21 23, 23 22 C25 20, 30 6, 32 6 Z"
      fill="#FACC15"
      stroke="#18181B"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Cute doodle smiley inside star */}
    <circle cx="26" cy="31" r="2.2" fill="#18181B" />
    <circle cx="38" cy="31" r="2.2" fill="#18181B" />
    <ellipse cx="22" cy="35" rx="2.5" ry="1.5" fill="#F87171" opacity="0.75" />
    <ellipse cx="42" cy="35" rx="2.5" ry="1.5" fill="#F87171" opacity="0.75" />
    <path d="M28 36 Q32 40 36 36" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/** ประกายวิ้งวาดมือ (แทน ✨) */
export const DoodleSparkles: React.FC<DoodleIconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path
      d="M36 8 Q38 26 54 28 Q38 30 36 48 Q34 30 18 28 Q34 26 36 8 Z"
      fill="#FDE047"
      stroke="#18181B"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 38 Q17 47 26 48 Q17 49 16 58 Q15 49 6 48 Q15 47 16 38 Z"
      fill="#FB923C"
      stroke="#18181B"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="50" cy="14" r="3" fill="#F472B6" stroke="#18181B" strokeWidth="2.2" />
  </svg>
);

/** สมุดการบ้านและดินสอวาดมือ (แทน 📝 / 📚) */
export const DoodleHomework: React.FC<DoodleIconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    {/* Notebook */}
    <rect
      x="12"
      y="10"
      width="34"
      height="44"
      rx="5"
      fill="#FEF9C3"
      stroke="#18181B"
      strokeWidth="3.2"
    />
    {/* Spiral rings */}
    <path d="M9 18 H15 M9 27 H15 M9 36 H15 M9 45 H15" stroke="#18181B" strokeWidth="3.2" strokeLinecap="round" />
    {/* Doodle lines */}
    <path d="M20 22 H38 M20 30 H36 M20 38 H32" stroke="#18181B" strokeWidth="2.8" strokeLinecap="round" />
    {/* Cute Pencil */}
    <g transform="rotate(22 46 34)">
      <rect x="42" y="14" width="9" height="28" rx="2" fill="#FB7185" stroke="#18181B" strokeWidth="3" />
      <polygon points="42,42 51,42 46.5,51" fill="#FDE68A" stroke="#18181B" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="46.5" cy="49" r="1.5" fill="#18181B" />
    </g>
  </svg>
);

/** หลอดไฟไอเดียแบบทดสอบ (แทน 💡 / ❓) */
export const DoodleQuizBulb: React.FC<DoodleIconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    {/* Rays */}
    <path d="M32 4 V9 M11 15 L15 18 M53 15 L49 18 M6 32 H11 M58 32 H53" stroke="#F59E0B" strokeWidth="3.2" strokeLinecap="round" />
    {/* Bulb */}
    <path
      d="M20 36 C16 30, 17 16, 32 16 C47 16, 48 30, 44 36 C41 40, 40 43, 40 46 H24 C24 43, 23 40, 20 36 Z"
      fill="#FDE047"
      stroke="#18181B"
      strokeWidth="3.2"
      strokeLinejoin="round"
    />
    {/* Base */}
    <rect x="25" y="46" width="14" height="6" rx="2" fill="#E2E8F0" stroke="#18181B" strokeWidth="3" />
    <path d="M28 52 Q32 57 36 52" fill="#94A3B8" stroke="#18181B" strokeWidth="3" />
    {/* Cute eyes */}
    <circle cx="28" cy="29" r="2" fill="#18181B" />
    <circle cx="36" cy="29" r="2" fill="#18181B" />
    <path d="M29 34 Q32 37 35 34" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

/** ถ้วยรางวัลสมุดคะแนนวาดมือ (แทน 🏆 / 🎖️) */
export const DoodleTrophy: React.FC<DoodleIconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    {/* Handles */}
    <path d="M18 18 H10 C9 28, 14 32, 20 32" stroke="#18181B" strokeWidth="3.2" strokeLinecap="round" fill="none" />
    <path d="M46 18 H54 C55 28, 50 32, 44 32" stroke="#18181B" strokeWidth="3.2" strokeLinecap="round" fill="none" />
    {/* Cup */}
    <path
      d="M18 12 H46 V26 C46 37, 38 42, 32 42 C26 42, 18 37, 18 26 V12 Z"
      fill="#FACC15"
      stroke="#18181B"
      strokeWidth="3.2"
      strokeLinejoin="round"
    />
    {/* Stem & Base */}
    <path d="M32 42 V50" stroke="#18181B" strokeWidth="3.5" />
    <rect x="21" y="50" width="22" height="7" rx="3" fill="#FB923C" stroke="#18181B" strokeWidth="3.2" />
    {/* Little Star inside Trophy */}
    <polygon
      points="32,19 34,24 39,24 35,27 36.5,32 32,29 27.5,32 29,27 25,24 30,24"
      fill="#FFFBEB"
      stroke="#18181B"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

/** บอลลูนหัวใจมุมสะท้อนคิดวาดมือ (แทน 💬 / 💖) */
export const DoodleReflectionChat: React.FC<DoodleIconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path
      d="M12 16 C12 11, 18 9, 32 9 C46 9, 54 12, 54 27 C54 40, 45 45, 32 45 C27 45, 23 44, 19 49 L14 53 L16 42 C13 38, 12 33, 12 27 Z"
      fill="#FCE7F3"
      stroke="#18181B"
      strokeWidth="3.2"
      strokeLinejoin="round"
    />
    {/* Cute hand-drawn heart inside */}
    <path
      d="M32 36 C32 36, 21 29, 21 22 C21 18, 25 16, 28 18 C30 19, 32 22, 32 22 C32 22, 34 19, 36 18 C39 16, 43 18, 43 22 C43 29, 32 36, 32 36 Z"
      fill="#FB7185"
      stroke="#18181B"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
  </svg>
);

/** กราฟประเมิน Dashboard วาดมือ (แทน 📊) */
export const DoodleChart: React.FC<DoodleIconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <rect x="8" y="10" width="48" height="44" rx="8" fill="#E0F2FE" stroke="#18181B" strokeWidth="3.2" />
    <rect x="16" y="32" width="8" height="14" rx="2" fill="#FB7185" stroke="#18181B" strokeWidth="2.8" />
    <rect x="28" y="22" width="8" height="24" rx="2" fill="#FACC15" stroke="#18181B" strokeWidth="2.8" />
    <rect x="40" y="16" width="8" height="30" rx="2" fill="#34D399" stroke="#18181B" strokeWidth="2.8" />
  </svg>
);

/** โรงเรียน / ชั้นเรียนวาดมือ (แทน 🏫) */
export const DoodleSchool: React.FC<DoodleIconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <polygon points="32,10 8,28 56,28" fill="#FB7185" stroke="#18181B" strokeWidth="3.2" strokeLinejoin="round" />
    <rect x="14" y="28" width="36" height="26" rx="2" fill="#FEF08A" stroke="#18181B" strokeWidth="3.2" />
    <rect x="27" y="39" width="10" height="15" rx="2" fill="#93C5FD" stroke="#18181B" strokeWidth="2.8" />
    <circle cx="32" cy="22" r="4" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
  </svg>
);

/** หมวกบัณฑิตวาดมือ (แทน 🎓) */
export const DoodleGradCap: React.FC<DoodleIconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <polygon points="32,12 6,25 32,38 58,25" fill="#38BDF8" stroke="#18181B" strokeWidth="3.2" strokeLinejoin="round" />
    <path d="M16 31 V44 C16 49, 24 52, 32 52 C40 52, 48 49, 48 44 V31" fill="#BAE6FD" stroke="#18181B" strokeWidth="3.2" strokeLinejoin="round" />
    <path d="M54 27 V43" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="54" cy="45" r="3" fill="#FACC15" stroke="#18181B" strokeWidth="2.2" />
  </svg>
);

/** จรวด / สายฟ้าพลังวาดมือ (แทน 🚀 / ⚡) */
export const DoodleZap: React.FC<DoodleIconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <polygon
      points="36,6 14,35 30,35 26,58 50,27 34,27"
      fill="#FACC15"
      stroke="#18181B"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
  </svg>
);

/** โล่ปลอดภัยวาดมือ (แทน 🛡️ / 🔐) */
export const DoodleShield: React.FC<DoodleIconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path
      d="M32 8 L12 16 V30 C12 44, 21 52, 32 56 C43 52, 52 44, 52 30 V16 L32 8 Z"
      fill="#A7F3D0"
      stroke="#18181B"
      strokeWidth="3.2"
      strokeLinejoin="round"
    />
    <path d="M23 32 L29 38 L42 25" stroke="#18181B" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** เครื่องหมายถูกวาดมือ (แทน ✅ / ✔️) */
export const DoodleCheck: React.FC<DoodleIconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="32" cy="32" r="24" fill="#86EFAC" stroke="#18181B" strokeWidth="3.5" />
    <path d="M21 33 L29 41 L44 24" stroke="#18181B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** นักเรียนวาดมือลายเส้นเด็ก (DoodleStudent) */
export const DoodleStudent: React.FC<DoodleIconProps> = ({ className = 'w-8 h-8', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="32" cy="32" r="28" fill="#FEF08A" stroke="#18181B" strokeWidth="3" />
    <path d="M16 28 C16 16, 24 12, 32 12 C40 12, 48 16, 48 28 Z" fill="#374151" stroke="#18181B" strokeWidth="2.8" />
    <ellipse cx="32" cy="34" rx="15" ry="14" fill="#FFFBEB" stroke="#18181B" strokeWidth="2.8" />
    <circle cx="26" cy="33" r="2.2" fill="#18181B" />
    <circle cx="38" cy="33" r="2.2" fill="#18181B" />
    <path d="M28 40 Q32 44 36 40" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/** คุณครูวาดมือลายเส้นเด็ก (DoodleTeacher) */
export const DoodleTeacher: React.FC<DoodleIconProps> = ({ className = 'w-8 h-8', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="32" cy="32" r="28" fill="#BAE6FD" stroke="#18181B" strokeWidth="3" />
    <circle cx="32" cy="13" r="6" fill="#78350F" stroke="#18181B" strokeWidth="2.5" />
    <ellipse cx="32" cy="35" rx="15" ry="14" fill="#FFFBEB" stroke="#18181B" strokeWidth="2.8" />
    <circle cx="26" cy="33" r="4.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.2" />
    <circle cx="38" cy="33" r="4.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.2" />
    <path d="M30.5 33 H33.5" stroke="#18181B" strokeWidth="2.2" />
    <circle cx="26" cy="33" r="1.5" fill="#18181B" />
    <circle cx="38" cy="33" r="1.5" fill="#18181B" />
    <path d="M28 41 Q32 45 36 41" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);
