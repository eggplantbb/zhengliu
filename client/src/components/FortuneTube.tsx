interface FortuneTubeProps {
  shaking?: boolean;
}

export function FortuneTube({ shaking = false }: FortuneTubeProps) {
  return (
    <div className={`mx-auto w-24 ${shaking ? 'animate-tube-shake' : ''}`}>
      <svg viewBox="0 0 80 120" fill="none" aria-label="签筒" className="mx-auto w-full">
        {/* 筒身 */}
        <path
          d="M20 35 L16 105 Q16 112 24 112 L56 112 Q64 112 64 105 L60 35 Z"
          stroke="#991B1B"
          strokeWidth="2"
          fill="#FDFBF7"
        />
        {/* 筒口 */}
        <ellipse cx="40" cy="35" rx="22" ry="8" stroke="#991B1B" strokeWidth="2" fill="#F7F3EB" />
        <ellipse cx="40" cy="33" rx="18" ry="5" stroke="#B91C1C" strokeWidth="1" fill="none" opacity="0.5" />
        {/* 签条 */}
        <rect x="34" y="18" width="4" height="22" rx="1" stroke="#B91C1C" strokeWidth="1.2" fill="#FDFBF7" />
        <rect x="40" y="14" width="4" height="26" rx="1" stroke="#B91C1C" strokeWidth="1.2" fill="#FDFBF7" />
        <rect x="46" y="20" width="4" height="20" rx="1" stroke="#991B1B" strokeWidth="1.2" fill="#FDFBF7" opacity="0.8" />
        {/* 装饰线 */}
        <line x1="24" y1="70" x2="56" y2="70" stroke="#E8DFD0" strokeWidth="1" />
        <line x1="26" y1="85" x2="54" y2="85" stroke="#E8DFD0" strokeWidth="1" />
      </svg>
    </div>
  );
}
