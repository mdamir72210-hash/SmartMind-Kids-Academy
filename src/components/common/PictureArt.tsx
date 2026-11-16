import React from 'react';

interface PictureArtProps {
  artKey: string;
  label: string;
  colorHex?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PictureArt: React.FC<PictureArtProps> = ({
  artKey,
  label,
  colorHex,
  size = 'md',
}) => {
  const sizeClass =
    size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-44 h-44 sm:w-52 sm:h-52' : 'w-28 h-28';

  if (artKey === 'color-swatch' && colorHex) {
    return (
      <div
        className={`${sizeClass} rounded-3xl border-4 border-white shadow-md flex items-center justify-center relative overflow-hidden`}
        style={{ backgroundColor: colorHex }}
        role="img"
        aria-label={label}
      >
        <div className="w-1/2 h-1/2 rounded-full bg-white/25 -translate-x-2 -translate-y-2" />
      </div>
    );
  }

  const renderSvg = () => {
    switch (artKey) {
      case 'apple':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <path d="M60 32 C60 20, 68 14, 72 14" stroke="#78350F" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M62 24 C74 14, 90 18, 86 30 C78 34, 68 30, 62 24 Z" fill="#22C55E" />
            <path d="M60 34 C38 26, 20 44, 24 72 C28 96, 46 106, 60 100 C74 106, 92 96, 96 72 C100 44, 82 26, 60 34 Z" fill="#EF4444" />
            <ellipse cx="42" cy="54" rx="7" ry="12" transform="rotate(-15 42 54)" fill="#FCA5A5" opacity="0.65" />
            <circle cx="48" cy="64" r="3" fill="#1E293B" />
            <circle cx="72" cy="64" r="3" fill="#1E293B" />
            <path d="M53 74 Q60 80 67 74" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
          </svg>
        );
      case 'ball':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <circle cx="60" cy="60" r="44" fill="#38BDF8" stroke="#0284C7" strokeWidth="4" />
            <path d="M22 44 Q60 58 98 44" stroke="#FACC15" strokeWidth="10" fill="none" />
            <path d="M22 76 Q60 62 98 76" stroke="#FB7185" strokeWidth="10" fill="none" />
            <circle cx="60" cy="60" r="44" fill="none" stroke="#0284C7" strokeWidth="4" />
            <ellipse cx="44" cy="36" rx="10" ry="5" transform="rotate(-25 44 36)" fill="#FFFFFF" opacity="0.55" />
          </svg>
        );
      case 'cat':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <polygon points="28,52 24,20 50,36" fill="#F59E0B" />
            <polygon points="92,52 96,20 70,36" fill="#F59E0B" />
            <polygon points="31,45 29,27 44,37" fill="#FDE68A" />
            <polygon points="89,45 91,27 76,37" fill="#FDE68A" />
            <circle cx="60" cy="65" r="36" fill="#FBBF24" />
            <circle cx="46" cy="60" r="4.5" fill="#1E293B" />
            <circle cx="74" cy="60" r="4.5" fill="#1E293B" />
            <polygon points="60,68 55,73 65,73" fill="#EC4899" />
            <path d="M52 77 Q60 83 68 77" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M20 65 L38 68 M20 73 L38 73 M100 65 L82 68 M100 73 L82 73" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
      case 'dog':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <ellipse cx="26" cy="58" rx="12" ry="26" transform="rotate(14 26 58)" fill="#92400E" />
            <ellipse cx="94" cy="58" rx="12" ry="26" transform="rotate(-14 94 58)" fill="#92400E" />
            <circle cx="60" cy="60" r="34" fill="#D97706" />
            <ellipse cx="60" cy="72" rx="18" ry="14" fill="#FDE68A" />
            <circle cx="46" cy="54" r="4.5" fill="#1E293B" />
            <circle cx="74" cy="54" r="4.5" fill="#1E293B" />
            <ellipse cx="60" cy="66" rx="7" ry="5" fill="#1E293B" />
            <path d="M56 76 Q60 85 64 76" fill="#F43F5E" />
          </svg>
        );
      case 'elephant':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <ellipse cx="24" cy="58" rx="18" ry="26" fill="#94A3B8" />
            <ellipse cx="96" cy="58" rx="18" ry="26" fill="#94A3B8" />
            <ellipse cx="24" cy="60" rx="11" ry="17" fill="#FBCFE8" />
            <ellipse cx="96" cy="60" rx="11" ry="17" fill="#FBCFE8" />
            <circle cx="60" cy="56" r="30" fill="#CBD5E1" />
            <path d="M54 64 C54 88, 66 96, 78 88 C82 85, 79 78, 72 80 C66 82, 65 72, 66 64 Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="48" cy="50" r="4" fill="#1E293B" />
            <circle cx="72" cy="50" r="4" fill="#1E293B" />
            <path d="M44 68 Q40 78 48 80" stroke="#FFFBEB" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M76 68 Q80 78 72 80" stroke="#FFFBEB" strokeWidth="4" strokeLinecap="round" fill="none" />
          </svg>
        );
      case 'fish':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <polygon points="84,60 108,40 108,80" fill="#FB923C" />
            <ellipse cx="56" cy="60" rx="36" ry="24" fill="#38BDF8" />
            <path d="M46 36 Q58 20 68 38" fill="#FACC15" />
            <circle cx="34" cy="54" r="5" fill="#FFFFFF" />
            <circle cx="33" cy="54" r="2.5" fill="#1E293B" />
            <path d="M54 44 Q48 60 54 76" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.7" />
            <path d="M68 46 Q62 60 68 74" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.7" />
            <circle cx="14" cy="40" r="4" fill="#BAE6FD" />
            <circle cx="10" cy="28" r="2.5" fill="#BAE6FD" />
          </svg>
        );
      case 'grapes':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <path d="M60 16 L60 32" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
            <path d="M60 22 C74 14, 88 22, 82 32 C72 34, 64 28, 60 22 Z" fill="#16A34A" />
            {[
              [44, 42], [60, 42], [76, 42],
              [38, 58], [53, 58], [68, 58], [82, 58],
              [46, 74], [60, 74], [74, 74],
              [53, 90], [67, 90],
              [60, 102],
            ].map(([cx, cy], idx) => (
              <g key={idx}>
                <circle cx={cx} cy={cy} r="10.5" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="2" />
                <circle cx={cx - 3} cy={cy - 3} r="2.5" fill="#DDD6FE" />
              </g>
            ))}
          </svg>
        );
      case 'hen':
      case 'bird':
      case 'duck':
      case 'parrot':
      case 'eagle':
      case 'peacock':
      case 'owl':
        return renderBirdArt(artKey);
      case 'icecream':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <polygon points="40,58 80,58 60,108" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
            <line x1="46" y1="68" x2="74" y2="68" stroke="#B45309" strokeWidth="2" opacity="0.5" />
            <line x1="51" y1="80" x2="69" y2="80" stroke="#B45309" strokeWidth="2" opacity="0.5" />
            <circle cx="48" cy="48" r="16" fill="#F472B6" />
            <circle cx="72" cy="48" r="16" fill="#34D399" />
            <circle cx="60" cy="34" r="17" fill="#FDE68A" />
            <circle cx="60" cy="16" r="6" fill="#EF4444" />
          </svg>
        );
      case 'jug':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <path d="M80 42 C98 42, 98 76, 80 76" stroke="#0284C7" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M36 30 L82 30 L76 44 C84 56, 86 92, 74 100 L42 100 C30 92, 32 56, 40 44 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="3" />
            <ellipse cx="58" cy="30" rx="23" ry="6" fill="#BAE6FD" stroke="#0284C7" strokeWidth="3" />
            <path d="M40 72 Q58 66 76 72 L74 96 L42 96 Z" fill="#0EA5E9" opacity="0.45" />
          </svg>
        );
      case 'kite':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <path d="M60 88 Q50 100 64 108 Q74 114 58 118" stroke="#EF4444" strokeWidth="3" fill="none" strokeLinecap="round" />
            <polygon points="60,14 96,48 60,88 24,48" fill="#FACC15" stroke="#EA580C" strokeWidth="3" />
            <polygon points="60,14 96,48 60,48" fill="#F43F5E" />
            <polygon points="60,48 24,48 60,88" fill="#38BDF8" />
            <line x1="60" y1="14" x2="60" y2="88" stroke="#78350F" strokeWidth="2.5" />
            <line x1="24" y1="48" x2="96" y2="48" stroke="#78350F" strokeWidth="2.5" />
          </svg>
        );
      case 'lion':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <circle cx="60" cy="60" r="44" fill="#B45309" />
            <circle cx="60" cy="60" r="32" fill="#FBBF24" />
            <circle cx="36" cy="34" r="9" fill="#FBBF24" />
            <circle cx="84" cy="34" r="9" fill="#FBBF24" />
            <circle cx="48" cy="54" r="4" fill="#1E293B" />
            <circle cx="72" cy="54" r="4" fill="#1E293B" />
            <polygon points="60,62 53,68 67,68" fill="#78350F" />
            <path d="M50 74 Q60 82 70 74" stroke="#78350F" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'mango':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <path d="M62 24 C74 14, 92 20, 86 32 C76 34, 68 30, 62 24 Z" fill="#16A34A" />
            <path d="M58 26 C82 26, 94 50, 84 78 C76 98, 52 104, 40 94 C28 84, 34 64, 34 48 C34 32, 46 26, 58 26 Z" fill="#FBBF24" stroke="#EA580C" strokeWidth="3" />
            <ellipse cx="50" cy="50" rx="7" ry="14" transform="rotate(-18 50 50)" fill="#FEF08A" opacity="0.7" />
          </svg>
        );
      case 'nest':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <ellipse cx="48" cy="54" rx="10" ry="13" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2" />
            <ellipse cx="64" cy="52" rx="10" ry="13" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
            <ellipse cx="78" cy="56" rx="10" ry="13" fill="#FBCFE8" stroke="#DB2777" strokeWidth="2" />
            <path d="M20 62 Q60 76 100 62 C98 92, 80 100, 60 100 C40 100, 22 92, 20 62 Z" fill="#92400E" />
            <path d="M26 70 Q60 82 94 70 M30 82 Q60 92 90 82" stroke="#D97706" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'orange':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <path d="M60 22 C74 14, 88 22, 82 32 C72 34, 64 28, 60 22 Z" fill="#16A34A" />
            <circle cx="60" cy="64" r="36" fill="#F97316" stroke="#EA580C" strokeWidth="3" />
            <circle cx="44" cy="48" r="6" fill="#FED7AA" opacity="0.6" />
            <circle cx="72" cy="76" r="2" fill="#C2410C" />
            <circle cx="52" cy="80" r="2" fill="#C2410C" />
            <circle cx="76" cy="56" r="2" fill="#C2410C" />
          </svg>
        );
      case 'pen':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <g transform="rotate(-35 60 60)">
              <rect x="48" y="20" width="24" height="62" rx="6" fill="#2563EB" />
              <rect x="48" y="20" width="24" height="14" rx="4" fill="#FACC15" />
              <polygon points="48,82 72,82 60,104" fill="#FDE68A" />
              <polygon points="56,96 64,96 60,104" fill="#1E293B" />
            </g>
          </svg>
        );
      case 'queen':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <polygon points="28,48 36,22 50,38 60,18 70,38 84,22 92,48" fill="#FACC15" stroke="#D97706" strokeWidth="3" />
            <circle cx="60" cy="18" r="4" fill="#EC4899" />
            <circle cx="36" cy="22" r="3.5" fill="#38BDF8" />
            <circle cx="84" cy="22" r="3.5" fill="#38BDF8" />
            <circle cx="60" cy="72" r="26" fill="#FDE68A" stroke="#F59E0B" strokeWidth="3" />
            <circle cx="50" cy="68" r="3.5" fill="#1E293B" />
            <circle cx="70" cy="68" r="3.5" fill="#1E293B" />
            <path d="M52 80 Q60 86 68 80" stroke="#EC4899" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'rabbit':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <ellipse cx="44" cy="34" rx="10" ry="26" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="3" />
            <ellipse cx="76" cy="34" rx="10" ry="26" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="3" />
            <ellipse cx="44" cy="34" rx="5" ry="17" fill="#FBCFE8" />
            <ellipse cx="76" cy="34" rx="5" ry="17" fill="#FBCFE8" />
            <circle cx="60" cy="74" r="30" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3" />
            <circle cx="49" cy="68" r="4" fill="#1E293B" />
            <circle cx="71" cy="68" r="4" fill="#1E293B" />
            <ellipse cx="60" cy="76" rx="5" ry="3.5" fill="#F472B6" />
            <path d="M53 84 Q60 89 67 84" stroke="#64748B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'sun':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1="60"
                y1="14"
                x2="60"
                y2="24"
                stroke="#F59E0B"
                strokeWidth="6"
                strokeLinecap="round"
                transform={`rotate(${deg} 60 60)`}
              />
            ))}
            <circle cx="60" cy="60" r="28" fill="#FACC15" stroke="#F59E0B" strokeWidth="3" />
            <circle cx="50" cy="56" r="3.5" fill="#1E293B" />
            <circle cx="70" cy="56" r="3.5" fill="#1E293B" />
            <path d="M50 67 Q60 75 70 67" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'tiger':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <circle cx="32" cy="36" r="11" fill="#F97316" />
            <circle cx="88" cy="36" r="11" fill="#F97316" />
            <circle cx="60" cy="64" r="36" fill="#FB923C" />
            <path d="M48 30 L60 40 L72 30" stroke="#1E293B" strokeWidth="4" fill="none" />
            <path d="M26 58 L38 60 M26 68 L38 68 M94 58 L82 60 M94 68 L82 68" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
            <circle cx="46" cy="58" r="4.5" fill="#1E293B" />
            <circle cx="74" cy="58" r="4.5" fill="#1E293B" />
            <ellipse cx="60" cy="72" rx="14" ry="11" fill="#FFF7ED" />
            <polygon points="60,66 54,72 66,72" fill="#EC4899" />
          </svg>
        );
      case 'umbrella':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <path d="M60 22 L60 92 C60 102, 74 102, 74 92" stroke="#78350F" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M18 62 C18 32, 102 32, 102 62 Q88 55 74 62 Q60 55 46 62 Q32 55 18 62 Z" fill="#0D9488" />
            <path d="M44 62 C44 36, 76 36, 76 62 Q60 55 44 62 Z" fill="#FACC15" />
          </svg>
        );
      case 'van':
      case 'car':
      case 'bus':
      case 'boat':
      case 'ship':
      case 'airplane':
        return renderVehicleArt(artKey);
      case 'watch':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <rect x="46" y="14" width="28" height="92" rx="8" fill="#4F46E5" />
            <circle cx="60" cy="60" r="28" fill="#FFFFFF" stroke="#312E81" strokeWidth="4" />
            <line x1="60" y1="60" x2="60" y2="42" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="60" y1="60" x2="74" y2="64" stroke="#E11D48" strokeWidth="3" strokeLinecap="round" />
            <circle cx="60" cy="60" r="3.5" fill="#1E293B" />
          </svg>
        );
      case 'xylophone':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <rect x="18" y="34" width="14" height="58" rx="5" fill="#EF4444" />
            <rect x="35" y="38" width="14" height="50" rx="5" fill="#F97316" />
            <rect x="52" y="42" width="14" height="42" rx="5" fill="#FACC15" />
            <rect x="69" y="46" width="14" height="34" rx="5" fill="#22C55E" />
            <rect x="86" y="50" width="14" height="26" rx="5" fill="#3B82F6" />
            <line x1="28" y1="24" x2="64" y2="54" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
            <circle cx="64" cy="54" r="5" fill="#1E293B" />
          </svg>
        );
      case 'yak':
      case 'cow':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <path d="M28 42 Q18 22 36 28 M92 42 Q102 22 84 28" stroke="#CBD5E1" strokeWidth="6" fill="none" strokeLinecap="round" />
            <ellipse cx="60" cy="66" rx="34" ry="30" fill={artKey === 'yak' ? '#57534E' : '#F8FAFC'} stroke="#475569" strokeWidth="3" />
            <ellipse cx="60" cy="78" rx="20" ry="13" fill="#FBCFE8" />
            <circle cx="47" cy="58" r="4" fill="#1E293B" />
            <circle cx="73" cy="58" r="4" fill="#1E293B" />
            <circle cx="53" cy="78" r="2.5" fill="#9D174D" />
            <circle cx="67" cy="78" r="2.5" fill="#9D174D" />
          </svg>
        );
      case 'zebra':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <ellipse cx="60" cy="64" rx="32" ry="34" fill="#FFFFFF" stroke="#334155" strokeWidth="3" />
            <path d="M36 44 L52 52 M84 44 L68 52 M32 60 L48 64 M88 60 L72 64" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" />
            <circle cx="47" cy="56" r="4" fill="#1E293B" />
            <circle cx="73" cy="56" r="4" fill="#1E293B" />
            <ellipse cx="60" cy="78" rx="18" ry="12" fill="#E2E8F0" />
            <path d="M54 80 Q60 85 66 80" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        );
      default:
        return renderExtraArt(artKey, label);
    }
  };

  return (
    <div
      className={`${sizeClass} rounded-2xl bg-gradient-to-br from-white to-amber-50/70 border border-slate-200 p-2 flex items-center justify-center shrink-0 select-none`}
      role="img"
      aria-label={label}
    >
      {renderSvg()}
    </div>
  );
};

function renderBirdArt(artKey: string) {
  const bodyColor =
    artKey === 'hen'
      ? '#FB923C'
      : artKey === 'parrot'
      ? '#22C55E'
      : artKey === 'duck'
      ? '#FACC15'
      : artKey === 'peacock'
      ? '#0EA5E9'
      : artKey === 'owl'
      ? '#B45309'
      : '#64748B';
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {artKey === 'peacock' && (
        <circle cx="60" cy="48" r="40" fill="#10B981" opacity="0.35" />
      )}
      <circle cx="60" cy="64" r="30" fill={bodyColor} />
      <circle cx="60" cy="46" r="22" fill={bodyColor} />
      {artKey === 'hen' && <path d="M52 24 Q60 14 68 24" fill="#EF4444" />}
      <circle cx="51" cy="44" r="5" fill="#FFFFFF" />
      <circle cx="69" cy="44" r="5" fill="#FFFFFF" />
      <circle cx="51" cy="44" r="2.5" fill="#1E293B" />
      <circle cx="69" cy="44" r="2.5" fill="#1E293B" />
      <polygon points="55,52 65,52 60,60" fill="#F59E0B" />
    </svg>
  );
}

function renderVehicleArt(artKey: string) {
  if (artKey === 'boat' || artKey === 'ship') {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <polygon points="60,20 60,72 90,62" fill="#F43F5E" />
        <polygon points="56,28 56,72 30,64" fill="#FACC15" />
        <polygon points="18,74 102,74 88,96 32,96" fill="#92400E" />
        <path d="M12 102 Q30 96 48 102 Q66 108 84 102 Q98 97 108 102" stroke="#0EA5E9" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (artKey === 'airplane') {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <path d="M20 62 L94 46 L104 54 L94 64 L20 62 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="3" />
        <polygon points="48,54 70,22 78,24 66,52" fill="#0284C7" />
        <polygon points="48,62 66,94 74,92 64,62" fill="#0284C7" />
      </svg>
    );
  }
  const bodyColor = artKey === 'bus' ? '#FACC15' : artKey === 'van' ? '#38BDF8' : '#EF4444';
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <rect x="16" y="42" width="88" height="40" rx="10" fill={bodyColor} stroke="#1E293B" strokeWidth="3" />
      <rect x="26" y="48" width="22" height="16" rx="3" fill="#E0F2FE" />
      <rect x="54" y="48" width="22" height="16" rx="3" fill="#E0F2FE" />
      <rect x="82" y="48" width="14" height="16" rx="3" fill="#E0F2FE" />
      <circle cx="36" cy="84" r="10" fill="#1E293B" />
      <circle cx="36" cy="84" r="4" fill="#CBD5E1" />
      <circle cx="84" cy="84" r="10" fill="#1E293B" />
      <circle cx="84" cy="84" r="4" fill="#CBD5E1" />
    </svg>
  );
}

function renderExtraArt(artKey: string, label: string) {
  const map: Record<string, { bg: string; glyph: string }> = {
    banana: { bg: '#FEF9C3', glyph: '🍌' },
    watermelon: { bg: '#DCFCE7', glyph: '🍉' },
    tomato: { bg: '#FEE2E2', glyph: '🍅' },
    potato: { bg: '#FEF3C7', glyph: '🥔' },
    carrot: { bg: '#FFEDD5', glyph: '🥕' },
    eggplant: { bg: '#F3E8FF', glyph: '🍆' },
    onion: { bg: '#FCE7F3', glyph: '🧅' },
    leafy: { bg: '#DCFCE7', glyph: '🥬' },
    eye: { bg: '#E0F2FE', glyph: '👁️' },
    ear: { bg: '#FFEDD5', glyph: '👂' },
    nose: { bg: '#FFE4E6', glyph: '👃' },
    hand: { bg: '#FEF3C7', glyph: '✋' },
    foot: { bg: '#F1F5F9', glyph: '🦶' },
    mouth: { bg: '#FCE7F3', glyph: '👄' },
    book: { bg: '#DBEAFE', glyph: '📖' },
    python: { bg: '#DCFCE7', glyph: '🐍' },
    mouse: { bg: '#F1F5F9', glyph: '🐭' },
    camel: { bg: '#FEF3C7', glyph: '🐪' },
    medicine: { bg: '#E0F2FE', glyph: '💊' },
    frog: { bg: '#DCFCE7', glyph: '🐸' },
    moon: { bg: '#EEF2FF', glyph: '🌙' },
    basket: { bg: '#FEF3C7', glyph: '🧺' },
    egg: { bg: '#FFFBEB', glyph: '🥚' },
    drum: { bg: '#FEE2E2', glyph: '🥁' },
    deer: { bg: '#FFEDD5', glyph: '🦌' },
    star: { bg: '#FEF9C3', glyph: '⭐' },
    plate: { bg: '#F1F5F9', glyph: '🍽️' },
    rice: { bg: '#FEF9C3', glyph: '🌾' },
    flower: { bg: '#FCE7F3', glyph: '🌸' },
    bear: { bg: '#FFEDD5', glyph: '🐻' },
    rainbow: { bg: '#E0F2FE', glyph: '🌈' },
    lemon: { bg: '#FEF9C3', glyph: '🍋' },
  };
  const found = map[artKey];
  if (found) {
    return (
      <div
        className="w-full h-full rounded-xl flex items-center justify-center text-4xl sm:text-5xl"
        style={{ backgroundColor: found.bg }}
      >
        <span aria-hidden="true">{found.glyph}</span>
      </div>
    );
  }
  return (
    <div className="w-full h-full rounded-xl bg-amber-100 flex items-center justify-center font-display font-bold text-amber-800 text-lg text-center px-2">
      {label}
    </div>
  );
}
