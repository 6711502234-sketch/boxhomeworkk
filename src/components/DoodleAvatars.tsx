import React from 'react';

interface DoodleAvatarProps {
  className?: string;
  size?: number;
}

// ---------------------------------------------------------------------------
// 1. Student Doodle Avatars (ภาพวาดลายเส้นเด็ก: นักเรียน ม.3)
// ---------------------------------------------------------------------------

/** เด็กชายแว่นกลม ยิ้มสดใส */
export const AvatarStudentBoyGlasses: React.FC<DoodleAvatarProps> = ({ className = 'w-12 h-12', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#FEF08A" stroke="#18181B" strokeWidth="3" />
    {/* Hair */}
    <path
      d="M24 45 C22 26, 32 16, 50 16 C68 16, 78 26, 76 45 C70 34, 60 30, 50 34 C40 30, 30 34, 24 45 Z"
      fill="#374151"
      stroke="#18181B"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {/* Face */}
    <ellipse cx="50" cy="54" rx="24" ry="22" fill="#FFFBEB" stroke="#18181B" strokeWidth="2.5" />
    {/* Ears */}
    <ellipse cx="26" cy="54" rx="3.5" ry="5" fill="#FED7AA" stroke="#18181B" strokeWidth="2" />
    <ellipse cx="74" cy="54" rx="3.5" ry="5" fill="#FED7AA" stroke="#18181B" strokeWidth="2" />
    {/* Glasses */}
    <circle cx="40" cy="52" r="7.5" fill="#FFFFFF" fillOpacity="0.8" stroke="#18181B" strokeWidth="2.5" />
    <circle cx="60" cy="52" r="7.5" fill="#FFFFFF" fillOpacity="0.8" stroke="#18181B" strokeWidth="2.5" />
    <path d="M47.5 52 L52.5 52" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
    {/* Eyes */}
    <circle cx="40" cy="52" r="2.5" fill="#18181B" />
    <circle cx="60" cy="52" r="2.5" fill="#18181B" />
    <circle cx="41" cy="51" r="0.8" fill="#FFFFFF" />
    <circle cx="61" cy="51" r="0.8" fill="#FFFFFF" />
    {/* Cheeks */}
    <ellipse cx="33" cy="60" rx="3.5" ry="2" fill="#F87171" opacity="0.8" />
    <ellipse cx="67" cy="60" rx="3.5" ry="2" fill="#F87171" opacity="0.8" />
    {/* Smile */}
    <path d="M45 61 Q50 67 55 61" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
    {/* Collar / Tie */}
    <path d="M36 75 L45 88 L50 82 L55 88 L64 75" fill="#93C5FD" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

/** เด็กหญิงผมเปีย โบว์ชมพู */
export const AvatarStudentGirlPonytail: React.FC<DoodleAvatarProps> = ({ className = 'w-12 h-12', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#FCE7F3" stroke="#18181B" strokeWidth="3" />
    {/* Braids / Pigtails */}
    <ellipse cx="20" cy="60" rx="6" ry="10" fill="#92400E" stroke="#18181B" strokeWidth="2.5" transform="rotate(-15 20 60)" />
    <ellipse cx="80" cy="60" rx="6" ry="10" fill="#92400E" stroke="#18181B" strokeWidth="2.5" transform="rotate(15 80 60)" />
    <circle cx="21" cy="50" r="4" fill="#F43F5E" stroke="#18181B" strokeWidth="2" />
    <circle cx="79" cy="50" r="4" fill="#F43F5E" stroke="#18181B" strokeWidth="2" />
    {/* Hair Top */}
    <path
      d="M24 48 C22 28, 34 18, 50 18 C66 18, 78 28, 76 48 C70 38, 62 32, 50 36 C38 32, 30 38, 24 48 Z"
      fill="#92400E"
      stroke="#18181B"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {/* Face */}
    <ellipse cx="50" cy="53" rx="23" ry="21" fill="#FFFBEB" stroke="#18181B" strokeWidth="2.5" />
    {/* Sparkling Eyes */}
    <ellipse cx="40" cy="50" rx="3.5" ry="4.5" fill="#18181B" />
    <ellipse cx="60" cy="50" rx="3.5" ry="4.5" fill="#18181B" />
    <circle cx="41.5" cy="48.5" r="1.5" fill="#FFFFFF" />
    <circle cx="61.5" cy="48.5" r="1.5" fill="#FFFFFF" />
    {/* Cheeks */}
    <ellipse cx="32" cy="58" rx="4" ry="2.5" fill="#FB7185" opacity="0.85" />
    <ellipse cx="68" cy="58" rx="4" ry="2.5" fill="#FB7185" opacity="0.85" />
    {/* Open Smile */}
    <path d="M44 57 Q50 65 56 57" fill="#F43F5E" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
    {/* Pink Ribbon Bow on Top */}
    <path d="M43 20 C40 14, 48 12, 50 18 C52 12, 60 14, 57 20 Z" fill="#F43F5E" stroke="#18181B" strokeWidth="2" />
  </svg>
);

/** เด็กชายหมวกแก๊ป พลังล้น */
export const AvatarStudentBoyCap: React.FC<DoodleAvatarProps> = ({ className = 'w-12 h-12', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#E0F2FE" stroke="#18181B" strokeWidth="3" />
    {/* Cap */}
    <path d="M25 40 C25 22, 40 18, 55 18 C70 18, 75 25, 75 40 Z" fill="#3B82F6" stroke="#18181B" strokeWidth="3" strokeLinejoin="round" />
    <path d="M55 24 L88 30 C90 32, 85 37, 72 38 L55 36" fill="#F59E0B" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="round" />
    <circle cx="53" cy="18" r="3" fill="#F59E0B" stroke="#18181B" strokeWidth="1.5" />
    {/* Face */}
    <ellipse cx="50" cy="56" rx="23" ry="21" fill="#FFFBEB" stroke="#18181B" strokeWidth="2.5" />
    {/* Ears */}
    <ellipse cx="27" cy="56" rx="3.5" ry="5" fill="#FED7AA" stroke="#18181B" strokeWidth="2" />
    <ellipse cx="73" cy="56" rx="3.5" ry="5" fill="#FED7AA" stroke="#18181B" strokeWidth="2" />
    {/* Winking & Sparkling Eyes */}
    <path d="M35 52 Q40 48 45 52" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="60" cy="52" rx="3.5" ry="4.5" fill="#18181B" />
    <circle cx="61.5" cy="50.5" r="1.5" fill="#FFFFFF" />
    {/* Cheeks */}
    <ellipse cx="34" cy="61" rx="4" ry="2" fill="#F87171" opacity="0.8" />
    <ellipse cx="66" cy="61" rx="4" ry="2" fill="#F87171" opacity="0.8" />
    {/* Big Grin with Tongue */}
    <path d="M43 59 Q50 70 57 59 Z" fill="#EF4444" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

/** เด็กหญิงผมสั้น กิ๊บดาว */
export const AvatarStudentGirlShort: React.FC<DoodleAvatarProps> = ({ className = 'w-12 h-12', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#FEF3C7" stroke="#18181B" strokeWidth="3" />
    {/* Bob Hair */}
    <path
      d="M22 56 C20 30, 32 18, 50 18 C68 18, 80 30, 78 56 C78 68, 72 68, 70 60 C66 42, 34 42, 30 60 C28 68, 22 68, 22 56 Z"
      fill="#475569"
      stroke="#18181B"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {/* Face */}
    <ellipse cx="50" cy="53" rx="22" ry="20" fill="#FFFBEB" stroke="#18181B" strokeWidth="2.5" />
    {/* Eyes */}
    <ellipse cx="40" cy="50" rx="3.5" ry="4" fill="#18181B" />
    <ellipse cx="60" cy="50" rx="3.5" ry="4" fill="#18181B" />
    <circle cx="41.5" cy="48.5" r="1.3" fill="#FFFFFF" />
    <circle cx="61.5" cy="48.5" r="1.3" fill="#FFFFFF" />
    {/* Cheeks */}
    <ellipse cx="33" cy="58" rx="3.5" ry="2" fill="#F472B6" opacity="0.85" />
    <ellipse cx="67" cy="58" rx="3.5" ry="2" fill="#F472B6" opacity="0.85" />
    {/* Smile */}
    <path d="M45 58 Q50 64 55 58" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
    {/* Star Hairpin */}
    <g transform="translate(64, 28) rotate(15)">
      <polygon
        points="6,0 7.8,3.7 12,4.3 9,7.2 9.7,11.4 6,9.4 2.3,11.4 3,7.2 0,4.3 4.2,3.7"
        fill="#FBBF24"
        stroke="#18181B"
        strokeWidth="1.5"
      />
    </g>
  </svg>
);

/** นักวิทยาศาสตร์น้อย แว่นทดลอง */
export const AvatarStudentKidScientist: React.FC<DoodleAvatarProps> = ({ className = 'w-12 h-12', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#D1FAE5" stroke="#18181B" strokeWidth="3" />
    {/* Messy Einstein / Scientist Hair */}
    <path
      d="M20 52 C15 36, 25 18, 50 18 C75 18, 85 36, 80 52 C84 40, 75 24, 65 24 C55 14, 45 14, 35 24 C25 24, 16 40, 20 52 Z"
      fill="#64748B"
      stroke="#18181B"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {/* Face */}
    <ellipse cx="50" cy="54" rx="23" ry="21" fill="#FFFBEB" stroke="#18181B" strokeWidth="2.5" />
    {/* Safety Goggles */}
    <rect x="26" y="44" width="22" height="15" rx="6" fill="#A7F3D0" fillOpacity="0.75" stroke="#18181B" strokeWidth="2.5" />
    <rect x="52" y="44" width="22" height="15" rx="6" fill="#A7F3D0" fillOpacity="0.75" stroke="#18181B" strokeWidth="2.5" />
    <path d="M48 51 L52 51" stroke="#18181B" strokeWidth="2.5" />
    <path d="M26 51 L20 50" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
    <path d="M74 51 L80 50" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
    {/* Curious Eyes */}
    <circle cx="37" cy="51" r="3" fill="#18181B" />
    <circle cx="63" cy="51" r="3" fill="#18181B" />
    <circle cx="38" cy="49.5" r="1" fill="#FFFFFF" />
    <circle cx="64" cy="49.5" r="1" fill="#FFFFFF" />
    {/* Cheeks */}
    <ellipse cx="32" cy="62" rx="3.5" ry="2" fill="#F87171" opacity="0.8" />
    <ellipse cx="68" cy="62" rx="3.5" ry="2" fill="#F87171" opacity="0.8" />
    {/* Excited 'O' Mouth */}
    <ellipse cx="50" cy="64" rx="3.5" ry="4" fill="#EF4444" stroke="#18181B" strokeWidth="2" />
  </svg>
);

/** ศิลปินน้อย หมวกเบเร่ต์ */
export const AvatarStudentKidArtist: React.FC<DoodleAvatarProps> = ({ className = 'w-12 h-12', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#F3E8FF" stroke="#18181B" strokeWidth="3" />
    {/* Beret Hat */}
    <path d="M22 36 C24 16, 68 12, 78 28 C84 38, 70 42, 50 42 C30 42, 20 44, 22 36 Z" fill="#EC4899" stroke="#18181B" strokeWidth="3" strokeLinejoin="round" />
    <circle cx="50" cy="18" r="2.5" fill="#BE185D" stroke="#18181B" strokeWidth="1.5" />
    {/* Face */}
    <ellipse cx="50" cy="57" rx="23" ry="21" fill="#FFFBEB" stroke="#18181B" strokeWidth="2.5" />
    {/* Eyes */}
    <ellipse cx="40" cy="54" rx="3.5" ry="4" fill="#18181B" />
    <ellipse cx="60" cy="54" rx="3.5" ry="4" fill="#18181B" />
    <circle cx="41.5" cy="52.5" r="1.3" fill="#FFFFFF" />
    <circle cx="61.5" cy="52.5" r="1.3" fill="#FFFFFF" />
    {/* Cheeks with color smudges */}
    <circle cx="32" cy="63" r="3.5" fill="#38BDF8" opacity="0.85" />
    <circle cx="68" cy="63" r="3.5" fill="#FBBF24" opacity="0.85" />
    {/* Smile */}
    <path d="M45 63 Q50 69 55 63" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/** น้องแมวนักเรียน สะพายเป้ */
export const AvatarStudentCatDoodle: React.FC<DoodleAvatarProps> = ({ className = 'w-12 h-12', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#FEF08A" stroke="#18181B" strokeWidth="3" />
    {/* Cat Ears */}
    <polygon points="26,38 32,16 48,30" fill="#FBBF24" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="round" />
    <polygon points="30,34 34,22 44,30" fill="#F472B6" />
    <polygon points="74,38 68,16 52,30" fill="#FBBF24" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="round" />
    <polygon points="70,34 66,22 56,30" fill="#F472B6" />
    {/* Cat Head */}
    <ellipse cx="50" cy="52" rx="26" ry="23" fill="#FEF3C7" stroke="#18181B" strokeWidth="3" />
    {/* Big Anime Cat Eyes */}
    <ellipse cx="38" cy="48" rx="5" ry="6" fill="#18181B" />
    <ellipse cx="62" cy="48" rx="5" ry="6" fill="#18181B" />
    <circle cx="39.5" cy="45.5" r="2" fill="#FFFFFF" />
    <circle cx="63.5" cy="45.5" r="2" fill="#FFFFFF" />
    <circle cx="36.5" cy="50.5" r="1" fill="#FFFFFF" />
    <circle cx="60.5" cy="50.5" r="1" fill="#FFFFFF" />
    {/* Pink Nose & :3 Mouth */}
    <polygon points="48,54 52,54 50,56.5" fill="#F43F5E" />
    <path d="M44 57 Q47 61 50 57 Q53 61 56 57" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
    {/* Whiskers */}
    <path d="M22 50 L32 52 M20 56 L32 56 M68 52 L78 50 M68 56 L80 56" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
    {/* Blushing */}
    <ellipse cx="30" cy="58" rx="4" ry="2.5" fill="#FB7185" opacity="0.8" />
    <ellipse cx="70" cy="58" rx="4" ry="2.5" fill="#FB7185" opacity="0.8" />
    {/* Little Student Tie */}
    <polygon points="50,75 46,88 50,91 54,88" fill="#EF4444" stroke="#18181B" strokeWidth="2" />
  </svg>
);

/** น้องหมานักเรียน หูตกยิ้มแฉ่ง */
export const AvatarStudentDogDoodle: React.FC<DoodleAvatarProps> = ({ className = 'w-12 h-12', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#FFEDD5" stroke="#18181B" strokeWidth="3" />
    {/* Floppy Dog Ears */}
    <ellipse cx="22" cy="48" rx="8" ry="16" fill="#9A3412" stroke="#18181B" strokeWidth="2.5" transform="rotate(20 22 48)" />
    <ellipse cx="78" cy="48" rx="8" ry="16" fill="#9A3412" stroke="#18181B" strokeWidth="2.5" transform="rotate(-20 78 48)" />
    {/* Dog Head */}
    <ellipse cx="50" cy="52" rx="26" ry="23" fill="#FFF7ED" stroke="#18181B" strokeWidth="3" />
    {/* Brown Eye Patch */}
    <ellipse cx="38" cy="46" rx="9" ry="10" fill="#EA580C" opacity="0.25" />
    {/* Eyes */}
    <circle cx="38" cy="47" r="4" fill="#18181B" />
    <circle cx="62" cy="47" r="4" fill="#18181B" />
    <circle cx="39.5" cy="45.5" r="1.5" fill="#FFFFFF" />
    <circle cx="63.5" cy="45.5" r="1.5" fill="#FFFFFF" />
    {/* Big Nose */}
    <ellipse cx="50" cy="54" rx="5" ry="3.5" fill="#18181B" />
    <circle cx="51.5" cy="53" r="1" fill="#FFFFFF" />
    {/* Happy Tongue Out */}
    <path d="M45 58 Q50 63 55 58" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M48 60 Q50 68 53 66 Q55 64 54 60 Z" fill="#F43F5E" stroke="#18181B" strokeWidth="1.5" />
    {/* Cheeks */}
    <ellipse cx="30" cy="58" rx="4" ry="2" fill="#F97316" opacity="0.75" />
    <ellipse cx="70" cy="58" rx="4" ry="2" fill="#F97316" opacity="0.75" />
  </svg>
);

/** ไดโนน้อยรักเรียน */
export const AvatarStudentDinoDoodle: React.FC<DoodleAvatarProps> = ({ className = 'w-12 h-12', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#DCFCE7" stroke="#18181B" strokeWidth="3" />
    {/* Dino Spikes */}
    <polygon points="34,22 40,12 44,22" fill="#16A34A" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />
    <polygon points="46,20 52,10 56,20" fill="#16A34A" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />
    <polygon points="58,22 64,12 68,22" fill="#16A34A" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />
    {/* Dino Head */}
    <ellipse cx="50" cy="53" rx="26" ry="23" fill="#86EFAC" stroke="#18181B" strokeWidth="3" />
    {/* Big Dino Eyes */}
    <ellipse cx="38" cy="48" rx="4.5" ry="5.5" fill="#18181B" />
    <ellipse cx="62" cy="48" rx="4.5" ry="5.5" fill="#18181B" />
    <circle cx="39.5" cy="46" r="1.8" fill="#FFFFFF" />
    <circle cx="63.5" cy="46" r="1.8" fill="#FFFFFF" />
    {/* Cute Nostrils */}
    <circle cx="46" cy="56" r="1.5" fill="#15803D" />
    <circle cx="54" cy="56" r="1.5" fill="#15803D" />
    {/* Cute Tooth Grin */}
    <path d="M43 62 Q50 68 57 62" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
    <polygon points="48,63 50,66 52,63" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.5" />
    {/* Cheeks */}
    <ellipse cx="30" cy="58" rx="4" ry="2.5" fill="#F87171" opacity="0.8" />
    <ellipse cx="70" cy="58" rx="4" ry="2.5" fill="#F87171" opacity="0.8" />
  </svg>
);

/** โรบอทจิ๋วพลังแสงอาทิตย์ */
export const AvatarStudentRobotDoodle: React.FC<DoodleAvatarProps> = ({ className = 'w-12 h-12', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#CFFAFE" stroke="#18181B" strokeWidth="3" />
    {/* Antenna */}
    <line x1="50" y1="24" x2="50" y2="14" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="50" cy="12" r="4" fill="#EF4444" stroke="#18181B" strokeWidth="2" />
    {/* Robot Head Box */}
    <rect x="26" y="24" width="48" height="42" rx="10" fill="#E2E8F0" stroke="#18181B" strokeWidth="3" />
    {/* Bolts / Ears */}
    <rect x="20" y="38" width="6" height="12" rx="2" fill="#F59E0B" stroke="#18181B" strokeWidth="2" />
    <rect x="74" y="38" width="6" height="12" rx="2" fill="#F59E0B" stroke="#18181B" strokeWidth="2" />
    {/* Screen Eyes */}
    <rect x="32" y="34" width="14" height="12" rx="3" fill="#0284C7" stroke="#18181B" strokeWidth="2" />
    <rect x="54" y="34" width="14" height="12" rx="3" fill="#0284C7" stroke="#18181B" strokeWidth="2" />
    <circle cx="39" cy="40" r="2.5" fill="#38BDF8" />
    <circle cx="61" cy="40" r="2.5" fill="#38BDF8" />
    {/* Meter / Mouth */}
    <rect x="36" y="52" width="28" height="6" rx="2" fill="#22C55E" stroke="#18181B" strokeWidth="1.8" />
    <line x1="43" y1="52" x2="43" y2="58" stroke="#18181B" strokeWidth="1.5" />
    <line x1="50" y1="52" x2="50" y2="58" stroke="#18181B" strokeWidth="1.5" />
    <line x1="57" y1="52" x2="57" y2="58" stroke="#18181B" strokeWidth="1.5" />
  </svg>
);

/** นักบินอวกาศน้อย */
export const AvatarStudentAstronautDoodle: React.FC<DoodleAvatarProps> = ({ className = 'w-12 h-12', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#EDE9FE" stroke="#18181B" strokeWidth="3" />
    {/* Helmet */}
    <circle cx="50" cy="50" r="30" fill="#FFFFFF" stroke="#18181B" strokeWidth="3" />
    {/* Golden Visor */}
    <ellipse cx="50" cy="50" rx="21" ry="17" fill="#FBBF24" stroke="#18181B" strokeWidth="2.5" />
    {/* Visor Glare */}
    <path d="M36 43 Q45 37 56 40" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    {/* Cute Face inside visor */}
    <circle cx="43" cy="50" r="2.5" fill="#18181B" />
    <circle cx="57" cy="50" r="2.5" fill="#18181B" />
    <path d="M47 55 Q50 58 53 55" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="38" cy="54" rx="2.5" ry="1.5" fill="#F43F5E" opacity="0.8" />
    <ellipse cx="62" cy="54" rx="2.5" ry="1.5" fill="#F43F5E" opacity="0.8" />
  </svg>
);

/** คุณหมีน้อยขยันอ่าน */
export const AvatarStudentBearDoodle: React.FC<DoodleAvatarProps> = ({ className = 'w-12 h-12', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#F3E8FF" stroke="#18181B" strokeWidth="3" />
    {/* Bear Ears */}
    <circle cx="28" cy="30" r="10" fill="#B45309" stroke="#18181B" strokeWidth="2.5" />
    <circle cx="28" cy="30" r="5" fill="#FDE68A" />
    <circle cx="72" cy="30" r="10" fill="#B45309" stroke="#18181B" strokeWidth="2.5" />
    <circle cx="72" cy="30" r="5" fill="#FDE68A" />
    {/* Bear Head */}
    <ellipse cx="50" cy="54" rx="26" ry="23" fill="#D97706" stroke="#18181B" strokeWidth="3" />
    {/* Snout */}
    <ellipse cx="50" cy="59" rx="12" ry="9" fill="#FEF3C7" stroke="#18181B" strokeWidth="2" />
    {/* Nose */}
    <ellipse cx="50" cy="55" rx="4" ry="2.8" fill="#18181B" />
    {/* Mouth */}
    <path d="M50 58 L50 63 M46 62 Q50 65 54 62" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
    {/* Reading Glasses */}
    <circle cx="39" cy="48" r="6" fill="#FFFFFF" fillOpacity="0.7" stroke="#18181B" strokeWidth="2" />
    <circle cx="61" cy="48" r="6" fill="#FFFFFF" fillOpacity="0.7" stroke="#18181B" strokeWidth="2" />
    <path d="M45 48 L55 48" stroke="#18181B" strokeWidth="2" />
    {/* Eyes */}
    <circle cx="39" cy="48" r="2" fill="#18181B" />
    <circle cx="61" cy="48" r="2" fill="#18181B" />
  </svg>
);


// ---------------------------------------------------------------------------
// 2. Teacher Doodle Avatars (ภาพวาดลายเส้นน่ารัก: คุณครู)
// ---------------------------------------------------------------------------

/** คุณครูผู้หญิงใจดี เสียบดินสอ */
export const AvatarTeacherFemaleGlasses: React.FC<DoodleAvatarProps> = ({ className = 'w-12 h-12', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#FAF5FF" stroke="#18181B" strokeWidth="3" />
    {/* Bun */}
    <circle cx="50" cy="20" r="9" fill="#581C87" stroke="#18181B" strokeWidth="3" />
    {/* Hair */}
    <path
      d="M24 48 C22 28, 32 18, 50 18 C68 18, 78 28, 76 48 C76 60, 70 66, 70 66 C60 58, 40 58, 30 66 C30 66, 24 60, 24 48 Z"
      fill="#6B21A8"
      stroke="#18181B"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {/* Face */}
    <ellipse cx="50" cy="53" rx="23" ry="21" fill="#FEF3C7" stroke="#18181B" strokeWidth="2.5" />
    {/* Teacher Glasses */}
    <rect x="33" y="44" width="13" height="11" rx="4" fill="#FFFFFF" fillOpacity="0.8" stroke="#18181B" strokeWidth="2.2" />
    <rect x="54" y="44" width="13" height="11" rx="4" fill="#FFFFFF" fillOpacity="0.8" stroke="#18181B" strokeWidth="2.2" />
    <path d="M46 49 L54 49" stroke="#18181B" strokeWidth="2.2" />
    {/* Kind Eyes */}
    <ellipse cx="39.5" cy="49.5" rx="2.5" ry="3" fill="#18181B" />
    <ellipse cx="60.5" cy="49.5" rx="2.5" ry="3" fill="#18181B" />
    <circle cx="40.5" cy="48.5" r="1" fill="#FFFFFF" />
    <circle cx="61.5" cy="48.5" r="1" fill="#FFFFFF" />
    {/* Cheeks */}
    <ellipse cx="31" cy="58" rx="3.5" ry="2" fill="#F472B6" opacity="0.85" />
    <ellipse cx="69" cy="58" rx="3.5" ry="2" fill="#F472B6" opacity="0.85" />
    {/* Gentle Smile */}
    <path d="M45 59 Q50 65 55 59" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
    {/* Pencil in hair */}
    <g transform="translate(60, 14) rotate(35)">
      <rect x="0" y="0" width="5" height="16" rx="1.5" fill="#F87171" stroke="#18181B" strokeWidth="1.5" />
      <polygon points="0,16 5,16 2.5,20" fill="#FED7AA" stroke="#18181B" strokeWidth="1.5" />
    </g>
  </svg>
);

/** คุณครูผู้ชาย ผูกเนคไท */
export const AvatarTeacherMaleTie: React.FC<DoodleAvatarProps> = ({ className = 'w-12 h-12', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#F0FDF4" stroke="#18181B" strokeWidth="3" />
    {/* Hair Side Part */}
    <path
      d="M24 45 C22 24, 34 16, 50 16 C66 16, 76 24, 76 45 C70 34, 58 30, 48 30 C38 30, 28 36, 24 45 Z"
      fill="#1E293B"
      stroke="#18181B"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {/* Face */}
    <ellipse cx="50" cy="54" rx="23" ry="21" fill="#FEF3C7" stroke="#18181B" strokeWidth="2.5" />
    {/* Glasses */}
    <rect x="33" y="44" width="13" height="11" rx="3" fill="#FFFFFF" fillOpacity="0.8" stroke="#18181B" strokeWidth="2.2" />
    <rect x="54" y="44" width="13" height="11" rx="3" fill="#FFFFFF" fillOpacity="0.8" stroke="#18181B" strokeWidth="2.2" />
    <path d="M46 49 L54 49" stroke="#18181B" strokeWidth="2.2" />
    {/* Eyes */}
    <circle cx="39.5" cy="49.5" r="2.5" fill="#18181B" />
    <circle cx="60.5" cy="49.5" r="2.5" fill="#18181B" />
    <circle cx="40.5" cy="48.5" r="0.8" fill="#FFFFFF" />
    <circle cx="61.5" cy="48.5" r="0.8" fill="#FFFFFF" />
    {/* Smile */}
    <path d="M45 61 Q50 67 55 61" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
    {/* Cheeks */}
    <ellipse cx="32" cy="60" rx="3" ry="1.8" fill="#F87171" opacity="0.75" />
    <ellipse cx="68" cy="60" rx="3" ry="1.8" fill="#F87171" opacity="0.75" />
    {/* Shirt Collar & Tie */}
    <path d="M36 75 L45 88 L50 81 L55 88 L64 75" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />
    <polygon points="50,81 47,94 50,97 53,94" fill="#3B82F6" stroke="#18181B" strokeWidth="1.8" />
  </svg>
);

/** คุณครูวิทย์ เสื้อกาวน์ */
export const AvatarTeacherScienceLab: React.FC<DoodleAvatarProps> = ({ className = 'w-12 h-12', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#ECFDF5" stroke="#18181B" strokeWidth="3" />
    {/* Hair */}
    <path
      d="M24 45 C22 25, 34 16, 50 16 C66 16, 76 25, 76 45 C70 34, 58 30, 50 34 C42 30, 30 34, 24 45 Z"
      fill="#047857"
      stroke="#18181B"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {/* Face */}
    <ellipse cx="50" cy="53" rx="23" ry="21" fill="#FEF3C7" stroke="#18181B" strokeWidth="2.5" />
    {/* Eyes */}
    <ellipse cx="39" cy="49" rx="3" ry="4" fill="#18181B" />
    <ellipse cx="61" cy="49" rx="3" ry="4" fill="#18181B" />
    <circle cx="40" cy="47.5" r="1.2" fill="#FFFFFF" />
    <circle cx="62" cy="47.5" r="1.2" fill="#FFFFFF" />
    {/* Smile */}
    <path d="M44 58 Q50 64 56 58" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
    {/* Lab Coat Lapels */}
    <path d="M34 74 L44 86 L50 78 L56 86 L66 74" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.2" strokeLinejoin="round" />
    {/* Flask Icon Accessory in corner */}
    <g transform="translate(68, 62) scale(0.65)">
      <polygon points="10,4 14,4 14,10 20,20 4,20 10,10" fill="#34D399" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="round" />
    </g>
  </svg>
);

/** คุณครูนกฮูก ผู้ทรงภูมิ */
export const AvatarTeacherOwlWise: React.FC<DoodleAvatarProps> = ({ className = 'w-12 h-12', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#FEF3C7" stroke="#18181B" strokeWidth="3" />
    {/* Mortarboard Graduation Cap */}
    <polygon points="50,12 80,24 50,34 20,24" fill="#18181B" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="round" />
    <rect x="36" y="28" width="28" height="10" fill="#27272A" />
    <path d="M80 24 L82 38" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <circle cx="82" cy="40" r="2.5" fill="#F59E0B" />
    {/* Owl Body */}
    <ellipse cx="50" cy="56" rx="26" ry="24" fill="#78350F" stroke="#18181B" strokeWidth="3" />
    {/* Big Owl Eyes */}
    <circle cx="37" cy="52" r="10" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
    <circle cx="63" cy="52" r="10" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
    <circle cx="37" cy="52" r="4.5" fill="#18181B" />
    <circle cx="63" cy="52" r="4.5" fill="#18181B" />
    <circle cx="39" cy="50" r="1.5" fill="#FFFFFF" />
    <circle cx="65" cy="50" r="1.5" fill="#FFFFFF" />
    {/* Yellow Beak */}
    <polygon points="46,58 54,58 50,67" fill="#F59E0B" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

/** คุณครูดาวเด่น อบอุ่นใจดี */
export const AvatarTeacherStarMentor: React.FC<DoodleAvatarProps> = ({ className = 'w-12 h-12', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#FFFBEB" stroke="#18181B" strokeWidth="3" />
    {/* Star Head Shape */}
    <polygon
      points="50,14 59,32 80,35 64,50 68,71 50,60 32,71 36,50 20,35 41,32"
      fill="#FBBF24"
      stroke="#18181B"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {/* Friendly Eyes */}
    <ellipse cx="43" cy="44" rx="3" ry="4" fill="#18181B" />
    <ellipse cx="57" cy="44" rx="3" ry="4" fill="#18181B" />
    <circle cx="44.5" cy="42.5" r="1.2" fill="#FFFFFF" />
    <circle cx="58.5" cy="42.5" r="1.2" fill="#FFFFFF" />
    {/* Cheeks */}
    <ellipse cx="36" cy="50" rx="3.5" ry="2" fill="#F43F5E" opacity="0.85" />
    <ellipse cx="64" cy="50" rx="3.5" ry="2" fill="#F43F5E" opacity="0.85" />
    {/* Big Warm Smile */}
    <path d="M45 49 Q50 56 55 49" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/** คุณครูเหมียวน่ารัก */
export const AvatarTeacherCatMentor: React.FC<DoodleAvatarProps> = ({ className = 'w-12 h-12', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#FDF2F8" stroke="#18181B" strokeWidth="3" />
    {/* Cat Ears */}
    <polygon points="26,38 32,16 48,30" fill="#EC4899" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="round" />
    <polygon points="30,34 34,22 44,30" fill="#FDE047" />
    <polygon points="74,38 68,16 52,30" fill="#EC4899" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="round" />
    <polygon points="70,34 66,22 56,30" fill="#FDE047" />
    {/* Head */}
    <ellipse cx="50" cy="52" rx="26" ry="23" fill="#FCE7F3" stroke="#18181B" strokeWidth="3" />
    {/* Teacher Glasses on Cat */}
    <circle cx="39" cy="48" r="7" fill="#FFFFFF" fillOpacity="0.75" stroke="#18181B" strokeWidth="2" />
    <circle cx="61" cy="48" r="7" fill="#FFFFFF" fillOpacity="0.75" stroke="#18181B" strokeWidth="2" />
    <path d="M46 48 L54 48" stroke="#18181B" strokeWidth="2" />
    {/* Eyes */}
    <circle cx="39" cy="48" r="3" fill="#18181B" />
    <circle cx="61" cy="48" r="3" fill="#18181B" />
    <circle cx="40" cy="47" r="1" fill="#FFFFFF" />
    <circle cx="62" cy="47" r="1" fill="#FFFFFF" />
    {/* Nose & Smile */}
    <polygon points="48,54 52,54 50,56.5" fill="#F43F5E" />
    <path d="M44 57 Q47 61 50 57 Q53 61 56 57" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
    {/* Whiskers */}
    <path d="M22 50 L30 52 M20 56 L30 56 M70 52 L78 50 M70 56 L80 56" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
  </svg>
);


// ---------------------------------------------------------------------------
// 3. Avatar Catalog Definitions
// ---------------------------------------------------------------------------

export interface DoodleAvatarOption {
  id: string;
  name: string;
  description: string;
  component: React.FC<DoodleAvatarProps>;
  role: 'student' | 'teacher' | 'both';
  tags: string[];
}

export const STUDENT_DOODLE_AVATARS: DoodleAvatarOption[] = [
  {
    id: 'student-boy-glasses',
    name: 'เด็กชายแว่นกลม',
    description: 'ยิ้มสดใส ฉลาด ช่างสังเกต',
    component: AvatarStudentBoyGlasses,
    role: 'student',
    tags: ['เด็กชาย', 'แว่น', 'สายวิทย์']
  },
  {
    id: 'student-girl-ponytail',
    name: 'เด็กหญิงผมเปีย',
    description: 'ผูกโบว์ชมพู น่ารัก เรียบร้อย',
    component: AvatarStudentGirlPonytail,
    role: 'student',
    tags: ['เด็กหญิง', 'ผมเปีย', 'ตั้งใจ']
  },
  {
    id: 'student-kid-scientist',
    name: 'นักวิทย์น้อย ม.3',
    description: 'สวมแว่นทดลอง รักการทดลอง',
    component: AvatarStudentKidScientist,
    role: 'student',
    tags: ['วิทยาศาสตร์', 'ทดลอง', 'ฟิสิกส์']
  },
  {
    id: 'student-boy-cap',
    name: 'เด็กชายหมวกแก๊ป',
    description: 'พลังล้นเหลือ ชอบความท้าทาย',
    component: AvatarStudentBoyCap,
    role: 'student',
    tags: ['เด็กชาย', 'หมวก', 'สดใส']
  },
  {
    id: 'student-girl-short',
    name: 'เด็กหญิงผมบ็อบ',
    description: 'ติดกิ๊บดาว ช่างคิดช่างทำ',
    component: AvatarStudentGirlShort,
    role: 'student',
    tags: ['เด็กหญิง', 'ดาว', 'สร้างสรรค์']
  },
  {
    id: 'student-kid-artist',
    name: 'ศิลปินน้อย ม.3',
    description: 'หมวกเบเร่ต์ วาดรูปเก่งมาก',
    component: AvatarStudentKidArtist,
    role: 'student',
    tags: ['ศิลปะ', 'วาดรูป', 'ออกแบบ']
  },
  {
    id: 'student-cat-doodle',
    name: 'น้องแมวนักเรียน',
    description: 'เหมียวน้อยผูกไท สะพายเป้',
    component: AvatarStudentCatDoodle,
    role: 'student',
    tags: ['สัตว์น่ารัก', 'แมว', 'นักเรียน']
  },
  {
    id: 'student-dog-doodle',
    name: 'น้องหมานักเรียน',
    description: 'หูตกยิ้มแฉ่ง ขยันส่งการบ้าน',
    component: AvatarStudentDogDoodle,
    role: 'student',
    tags: ['สัตว์น่ารัก', 'หมา', 'สดใส']
  },
  {
    id: 'student-dino-doodle',
    name: 'ไดโนน้อยรักเรียน',
    description: 'ทีเร็กซ์สีเขียวสุดคิวท์',
    component: AvatarStudentDinoDoodle,
    role: 'student',
    tags: ['ไดโนเสาร์', 'น่ารัก', 'ม.3']
  },
  {
    id: 'student-robot-doodle',
    name: 'โรบอทจิ๋วพลังงานแสง',
    description: 'ประดิษฐ์จากเทคโนโลยีล้ำสมัย',
    component: AvatarStudentRobotDoodle,
    role: 'student',
    tags: ['หุ่นยนต์', 'AI', 'พลังงาน']
  },
  {
    id: 'student-astronaut-doodle',
    name: 'นักบินอวกาศน้อย',
    description: 'ทะยานสู่ดวงดาวและอนาคต',
    component: AvatarStudentAstronautDoodle,
    role: 'student',
    tags: ['อวกาศ', 'ดาว', 'ฟิสิกส์']
  },
  {
    id: 'student-bear-doodle',
    name: 'คุณหมีน้อยขยันอ่าน',
    description: 'สวมแว่นอ่านหนังสือ สมาธิดี',
    component: AvatarStudentBearDoodle,
    role: 'student',
    tags: ['หมี', 'อ่านหนังสือ', 'ฉลาด']
  }
];

export const TEACHER_DOODLE_AVATARS: DoodleAvatarOption[] = [
  {
    id: 'teacher-female-glasses',
    name: 'คุณครูผู้หญิงใจดี',
    description: 'แว่นตากลมโต ปักดินสอ ยิ้มอบอุ่น',
    component: AvatarTeacherFemaleGlasses,
    role: 'teacher',
    tags: ['ครู', 'ใจดี', 'สอนสนุก']
  },
  {
    id: 'teacher-male-tie',
    name: 'คุณครูผู้ชายผูกไท',
    description: 'สุขุม มีระเบียบ ตรวจงานไว',
    component: AvatarTeacherMaleTie,
    role: 'teacher',
    tags: ['ครู', 'วินัย', 'เป็นกันเอง']
  },
  {
    id: 'teacher-science-lab',
    name: 'คุณครูวิทยาศาสตร์',
    description: 'เสื้อกาวน์ห้องแล็บ รักการวิจัย',
    component: AvatarTeacherScienceLab,
    role: 'teacher',
    tags: ['ครูวิทย์', 'แล็บ', 'ทดลอง']
  },
  {
    id: 'teacher-owl-wise',
    name: 'คุณครูนกฮูกรอบรู้',
    description: 'สวมหมวกบัณฑิต ผู้ทรงภูมิปัญญา',
    component: AvatarTeacherOwlWise,
    role: 'teacher',
    tags: ['นกฮูก', 'รอบรู้', 'ผู้เชี่ยวชาญ']
  },
  {
    id: 'teacher-star-mentor',
    name: 'คุณครูดาวเด่น',
    description: 'สร้างแรงบันดาลใจและให้กำลังใจ',
    component: AvatarTeacherStarMentor,
    role: 'teacher',
    tags: ['ดาว', 'กำลังใจ', 'แรงบันดาลใจ']
  },
  {
    id: 'teacher-cat-mentor',
    name: 'คุณครูเหมียวน่ารัก',
    description: 'ขวัญใจนักเรียน สอนเข้าใจง่าย',
    component: AvatarTeacherCatMentor,
    role: 'teacher',
    tags: ['ครูแมว', 'น่ารัก', 'ใจดี']
  }
];

export const ALL_DOODLE_AVATARS: DoodleAvatarOption[] = [
  ...STUDENT_DOODLE_AVATARS,
  ...TEACHER_DOODLE_AVATARS
];

// Helper map for fast lookup
const AVATAR_MAP: Record<string, React.FC<DoodleAvatarProps>> = {
  // Student ID mappings
  'student-boy-glasses': AvatarStudentBoyGlasses,
  'student-girl-ponytail': AvatarStudentGirlPonytail,
  'student-kid-scientist': AvatarStudentKidScientist,
  'student-boy-cap': AvatarStudentBoyCap,
  'student-girl-short': AvatarStudentGirlShort,
  'student-kid-artist': AvatarStudentKidArtist,
  'student-cat-doodle': AvatarStudentCatDoodle,
  'student-dog-doodle': AvatarStudentDogDoodle,
  'student-dino-doodle': AvatarStudentDinoDoodle,
  'student-robot-doodle': AvatarStudentRobotDoodle,
  'student-astronaut-doodle': AvatarStudentAstronautDoodle,
  'student-bear-doodle': AvatarStudentBearDoodle,

  // Teacher ID mappings
  'teacher-female-glasses': AvatarTeacherFemaleGlasses,
  'teacher-male-tie': AvatarTeacherMaleTie,
  'teacher-science-lab': AvatarTeacherScienceLab,
  'teacher-owl-wise': AvatarTeacherOwlWise,
  'teacher-star-mentor': AvatarTeacherStarMentor,
  'teacher-cat-mentor': AvatarTeacherCatMentor,

  // Legacy emoji aliases / fallbacks
  '🧑‍🎓': AvatarStudentBoyGlasses,
  '👦': AvatarStudentBoyGlasses,
  '👩‍🎓': AvatarStudentGirlPonytail,
  '👧': AvatarStudentGirlPonytail,
  '🦊': AvatarStudentKidArtist,
  '🐱': AvatarStudentCatDoodle,
  '🐶': AvatarStudentDogDoodle,
  '🐼': AvatarStudentBearDoodle,
  '🤖': AvatarStudentRobotDoodle,
  '🚀': AvatarStudentAstronautDoodle,
  '⭐': AvatarTeacherStarMentor,
  '🦁': AvatarStudentBoyCap,
  '🦉': AvatarTeacherOwlWise,
  '👾': AvatarStudentDinoDoodle,
  '👩‍🏫': AvatarTeacherFemaleGlasses,
  '👨‍🏫': AvatarTeacherMaleTie,
  '🔬': AvatarTeacherScienceLab,
  '📚': AvatarTeacherMaleTie,
  '🎓': AvatarTeacherOwlWise,
  '✨': AvatarTeacherStarMentor,
  '🌟': AvatarTeacherStarMentor
};

// ---------------------------------------------------------------------------
// 4. Universal AvatarDisplay Component
// ---------------------------------------------------------------------------

interface AvatarDisplayProps {
  avatar?: string;
  avatarId?: string;
  className?: string;
  size?: number | 'sm' | 'md' | 'lg' | string;
  altName?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  avatarId,
  className = 'w-10 h-10',
  size,
  altName = 'Avatar'
}) => {
  const effectiveAvatar = avatar || avatarId || 'student-boy-glasses';
  const numericSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 32
      : size === 'md'
      ? 40
      : size === 'lg'
      ? 56
      : undefined;

  // Check if avatar is a custom image (Data URL, http/https, blob)
  if (
    effectiveAvatar &&
    (effectiveAvatar.startsWith('data:image/') ||
      effectiveAvatar.startsWith('http://') ||
      effectiveAvatar.startsWith('https://') ||
      effectiveAvatar.startsWith('blob:'))
  ) {
    return (
      <img
        src={effectiveAvatar}
        alt={altName}
        className={`object-cover rounded-full border-2 border-zinc-900 select-none shadow-[1.5px_1.5px_0px_#18181b] bg-amber-100 shrink-0 ${className}`}
        style={numericSize ? { width: numericSize, height: numericSize } : undefined}
      />
    );
  }

  // Check if there is an exact matching Doodle Component
  const Component = AVATAR_MAP[effectiveAvatar];

  if (Component) {
    return <Component className={className} size={numericSize} />;
  }

  // Fallback: If it's a standard text/emoji string, render it inside a cute doodle badge
  return (
    <div
      className={`inline-flex items-center justify-center bg-amber-200 border-2 border-zinc-900 rounded-full select-none shadow-[1.5px_1.5px_0px_#18181b] ${className}`}
      style={numericSize ? { width: numericSize, height: numericSize } : undefined}
      title={altName}
    >
      <span className="text-base leading-none">{effectiveAvatar || '🧑‍🎓'}</span>
    </div>
  );
};
