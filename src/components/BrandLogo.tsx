import React from 'react';

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function BrandLogo({ className = '', showText = true, size = 'md' }: BrandLogoProps) {
  // Map size keys to dimensions
  const dims = {
    sm: { h: 'h-8', textS: 'text-lg' },
    md: { h: 'h-10', textS: 'text-2xl' },
    lg: { h: 'h-16', textS: 'text-4xl' },
    xl: { h: 'h-24', textS: 'text-6xl' },
  };

  const currentDims = dims[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Dynamic Logo Symbol */}
      <svg
        viewBox="0 0 100 100"
        className={`${currentDims.h} w-auto flex-shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradients */}
        <defs>
          <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8A3D" />
            <stop offset="100%" stopColor="#FF4D6D" />
          </linearGradient>
          <linearGradient id="bagLine" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF4D6D" />
            <stop offset="100%" stopColor="#FF8A3D" />
          </linearGradient>
          <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Top Handle - Orange to Pink gradient arch */}
        <path
          d="M 32 42 C 32 18, 68 18, 68 42"
          stroke="url(#brandGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Small tabs for bag handle attachment points */}
        <path
          d="M 28 42 L 36 42"
          stroke="#FF8A3D"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 64 42 L 72 42"
          stroke="#FF8A3D"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Bottom stylized bag body / smile outline in brand pink */}
        <path
          d="M 30 58 L 30 70 C 30 78, 70 78, 70 70 L 70 58"
          stroke="#FF4D6D"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* The golden premium swoosh - #D4AF37 */}
        <path
          d="M 23 58 C 30 45, 52 48, 66 56"
          stroke="#D4AF37"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          filter="url(#glowGold)"
        />
        
        {/* Sparkle star elements */}
        <path
          d="M 15 25 L 18 28 L 15 31 L 12 28 Z"
          fill="#D4AF37"
        />
        <path
          d="M 82 20 L 84 22 L 82 24 L 80 22 Z"
          fill="#FF8A3D"
        />
      </svg>

      {/* Dynamic Text */}
      {showText && (
        <span className={`font-display font-black tracking-tight ${currentDims.textS} transition-colors flex items-baseline leading-none`}>
          <span className="text-brand-orange">Vibe</span>
          <span className="text-brand-pink">bazar</span>
          <span className="text-brand-gold ml-0.5 font-sans">.</span>
        </span>
      )}
    </div>
  );
}
