import React from 'react';

interface JudaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  variant?: 'full' | 'emblem' | 'horizontal';
  theme?: 'light' | 'dark' | 'auto';
  showSubtitle?: boolean;
}

/**
 * Componente del Logo Oficial de "Judá Music"
 * Reproduce fielmente la identidad visual institucional:
 * - León de Judá en trazos dorados / bronce
 * - Nota musical integrada formando la 'J'
 * - Tipografía "udá" y subtítulo "music"
 */
export const JudaLogo: React.FC<JudaLogoProps> = ({
  className = '',
  size = 'md',
  theme = 'light',
}) => {
  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24',
    custom: ''
  };

  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <div className={`relative overflow-hidden rounded-lg ${isDark ? 'bg-stone-900/90 p-1 border border-stone-800' : 'bg-transparent'}`}>
        <img
          src="/assets/logo-amj.jpg"
          alt="Judá Music"
          referrerPolicy="no-referrer"
          className={`${heightClasses[size]} w-auto object-contain transition-transform duration-200 ${
            isDark ? 'mix-blend-screen filter contrast-125 brightness-110' : 'filter contrast-105'
          }`}
          style={{
            maxHeight: size === 'xl' ? '100px' : size === 'lg' ? '64px' : size === 'md' ? '46px' : '36px'
          }}
        />
      </div>
    </div>
  );
};

export default JudaLogo;


