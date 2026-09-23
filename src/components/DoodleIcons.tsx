import React from 'react';

interface DoodleIconProps {
  className?: string;
  size?: number;
}

/**
 * Adorable Kawaii Doodle Sketch - Student Icon (ภาพวาดลายเส้นน่ารัก: นักเรียน ม.3)
 */
export const DoodleStudent: React.FC<DoodleIconProps> = ({ className = 'w-16 h-16', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    {/* Background Soft Glow / Aura */}
    <circle cx="50" cy="50" r="44" fill="#ECFDF5" />

    {/* Back Hair */}
    <path
      d="M26 48 C24 32, 34 20, 50 20 C66 20, 76 32, 74 48 C74 58, 70 65, 70 65 C62 55, 38 55, 30 65 C30 65, 26 58, 26 48 Z"
      fill="#374151"
      stroke="#18181B"
      strokeWidth="3"
      strokeLinejoin="round"
    />

    {/* Ears */}
    <ellipse cx="26" cy="50" rx="4" ry="5" fill="#FED7AA" stroke="#18181B" strokeWidth="2.5" />
    <ellipse cx="74" cy="50" rx="4" ry="5" fill="#FED7AA" stroke="#18181B" strokeWidth="2.5" />

    {/* Round Face */}
    <path
      d="M28 46 C28 34, 38 28, 50 28 C62 28, 72 34, 72 46 C72 61, 62 70, 50 70 C38 70, 28 61, 28 46 Z"
      fill="#FEF3C7"
      stroke="#18181B"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Front Bangs Hair */}
    <path
      d="M28 42 C33 33, 40 33, 45 37 C48 33, 56 32, 62 38 C66 34, 70 38, 72 42 C70 32, 62 26, 50 26 C38 26, 30 32, 28 42 Z"
      fill="#374151"
      stroke="#18181B"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />

    {/* Eyebrows */}
    <path d="M37 41 Q41 39 45 41" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
    <path d="M55 41 Q59 39 63 41" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />

    {/* Sparkling Eyes */}
    <ellipse cx="41" cy="48" rx="4" ry="4.5" fill="#18181B" />
    <ellipse cx="59" cy="48" rx="4" ry="4.5" fill="#18181B" />
    <circle cx="42.5" cy="46.5" r="1.5" fill="#FFFFFF" />
    <circle cx="60.5" cy="46.5" r="1.5" fill="#FFFFFF" />
    <circle cx="39.5" cy="49.5" r="0.8" fill="#FFFFFF" />
    <circle cx="57.5" cy="49.5" r="0.8" fill="#FFFFFF" />

    {/* Blushing Cheeks */}
    <ellipse cx="34" cy="54" rx="4.5" ry="2.5" fill="#F87171" opacity="0.75" />
    <ellipse cx="66" cy="54" rx="4.5" ry="2.5" fill="#F87171" opacity="0.75" />

    {/* Sweet Smile */}
    <path
      d="M44 54 Q50 62 56 54"
      stroke="#18181B"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="#EF4444"
    />

    {/* School Uniform Shoulders & Body */}
    <path
      d="M24 88 C26 75, 36 71, 50 71 C64 71, 74 75, 76 88 Z"
      fill="#FFFFFF"
      stroke="#18181B"
      strokeWidth="3"
      strokeLinejoin="round"
    />

    {/* Blue Student Collar */}
    <path
      d="M36 71 L45 83 L50 77 L55 83 L64 71"
      fill="#93C5FD"
      stroke="#18181B"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />

    {/* Student Tie */}
    <polygon
      points="50,77 47,88 50,91 53,88"
      fill="#3B82F6"
      stroke="#18181B"
      strokeWidth="2"
      strokeLinejoin="round"
    />

    {/* Cute Star Hairclip / Cap Deco */}
    <g transform="translate(62, 28)">
      <polygon
        points="6,0 7.8,3.7 12,4.3 9,7.2 9.7,11.4 6,9.4 2.3,11.4 3,7.2 0,4.3 4.2,3.7"
        fill="#FBBF24"
        stroke="#18181B"
        strokeWidth="1.5"
      />
    </g>
  </svg>
);

/**
 * Adorable Kawaii Doodle Sketch - Teacher Icon (ภาพวาดลายเส้นน่ารัก: คุณครู)
 */
export const DoodleTeacher: React.FC<DoodleIconProps> = ({ className = 'w-16 h-16', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    {/* Background Soft Glow */}
    <circle cx="50" cy="50" r="44" fill="#FAF5FF" />

    {/* Hair Bun / Elegant Teacher Hairstyle */}
    <circle cx="50" cy="22" r="9" fill="#581C87" stroke="#18181B" strokeWidth="3" />
    <path
      d="M24 50 C22 30, 32 20, 50 20 C68 20, 78 30, 76 50 C76 64, 70 70, 70 70 C60 62, 40 62, 30 70 C30 70, 24 64, 24 50 Z"
      fill="#6B21A8"
      stroke="#18181B"
      strokeWidth="3"
      strokeLinejoin="round"
    />

    {/* Ears */}
    <ellipse cx="26" cy="50" rx="4" ry="5" fill="#FED7AA" stroke="#18181B" strokeWidth="2.5" />
    <ellipse cx="74" cy="50" rx="4" ry="5" fill="#FED7AA" stroke="#18181B" strokeWidth="2.5" />

    {/* Round Face */}
    <path
      d="M28 46 C28 34, 38 28, 50 28 C62 28, 72 34, 72 46 C72 61, 62 70, 50 70 C38 70, 28 61, 28 46 Z"
      fill="#FEF3C7"
      stroke="#18181B"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Teacher Fringe / Hair wave */}
    <path
      d="M28 40 C34 32, 44 32, 50 36 C56 32, 66 32, 72 40 C70 30, 62 26, 50 26 C38 26, 30 30, 28 40 Z"
      fill="#7E22CE"
      stroke="#18181B"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />

    {/* Stylish Round Glasses */}
    <rect
      x="33"
      y="43"
      width="14"
      height="12"
      rx="5"
      fill="#FFFFFF"
      fillOpacity="0.75"
      stroke="#18181B"
      strokeWidth="2.5"
    />
    <rect
      x="53"
      y="43"
      width="14"
      height="12"
      rx="5"
      fill="#FFFFFF"
      fillOpacity="0.75"
      stroke="#18181B"
      strokeWidth="2.5"
    />
    <path d="M47 48 L53 48" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M33 48 L27 47" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
    <path d="M67 48 L73 47" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />

    {/* Gentle Smiling Eyes behind glasses */}
    <ellipse cx="40" cy="49" rx="3" ry="3.5" fill="#18181B" />
    <ellipse cx="60" cy="49" rx="3" ry="3.5" fill="#18181B" />
    <circle cx="41" cy="47.5" r="1.2" fill="#FFFFFF" />
    <circle cx="61" cy="47.5" r="1.2" fill="#FFFFFF" />

    {/* Cheeks */}
    <ellipse cx="32" cy="55" rx="4" ry="2.5" fill="#F472B6" opacity="0.8" />
    <ellipse cx="68" cy="55" rx="4" ry="2.5" fill="#F472B6" opacity="0.8" />

    {/* Warm Smile */}
    <path
      d="M45 57 Q50 63 55 57"
      stroke="#18181B"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="#F87171"
    />

    {/* Teacher Outfit / Blazer & Shirt */}
    <path
      d="M24 88 C26 75, 36 71, 50 71 C64 71, 74 75, 76 88 Z"
      fill="#E9D5FF"
      stroke="#18181B"
      strokeWidth="3"
      strokeLinejoin="round"
    />

    {/* Yellow/Gold Scarf Collar */}
    <path
      d="M38 71 L45 84 L50 78 L55 84 L62 71"
      fill="#FDE047"
      stroke="#18181B"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />

    {/* Teacher Pencil Hair Ornament */}
    <g transform="translate(60, 16) rotate(35)">
      <rect x="0" y="0" width="5" height="18" rx="1.5" fill="#F87171" stroke="#18181B" strokeWidth="1.5" />
      <polygon points="0,18 5,18 2.5,23" fill="#FED7AA" stroke="#18181B" strokeWidth="1.5" />
      <polygon points="1.5,21 3.5,21 2.5,23" fill="#18181B" />
    </g>
  </svg>
);

/**
 * Children Hand-Drawn Doodle - Homework Box
 */
export const DoodleHomeworkBox: React.FC<DoodleIconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    {/* Box Top */}
    <path
      d="M7 16 L24 6 L41 16 L24 26 Z"
      fill="#FDE047"
      stroke="#18181B"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    {/* Box Left */}
    <path
      d="M7 16 L7 34 L24 44 L24 26 Z"
      fill="#FBBF24"
      stroke="#18181B"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    {/* Box Right */}
    <path
      d="M41 16 L41 34 L24 44 L24 26 Z"
      fill="#F59E0B"
      stroke="#18181B"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    {/* Ribbon Band */}
    <path
      d="M15 11 L15 39 L20 42 L20 14 Z"
      fill="#EF4444"
      stroke="#18181B"
      strokeWidth="1.8"
      strokeLinejoin="round"
      opacity="0.9"
    />
    <path d="M24 16 L24 26" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

