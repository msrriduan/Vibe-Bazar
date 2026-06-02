import React from 'react';
import { motion } from 'motion/react';
// @ts-expect-error - PNG logo graphics are resolved by Vite at build-time
import logoImg from '../assets/images/vibebazar_logo_transparent_clean_1780358222949_1780358364402.png';

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function BrandLogo({ className = '', size = 'md' }: BrandLogoProps) {
  // Map size keys to responsive height dimensions based on device size
  const dims = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-16 sm:h-20',
    xl: 'h-24 sm:h-28',
  };

  const currentHeightClass = dims[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`flex items-center justify-center select-none ${className}`}
    >
      <img
        src={logoImg}
        alt="Vibebazar Logo"
        referrerPolicy="no-referrer"
        className={`${currentHeightClass} w-auto object-contain transition-transform duration-300 hover:scale-103 active:scale-97`}
        style={{ contentVisibility: 'auto' }}
      />
    </motion.div>
  );
}


