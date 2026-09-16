import React from 'react';
import { useSiteBranding } from '../../context/SiteBrandingContext';

interface JudaLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  variant?: 'full' | 'emblem' | 'horizontal';
  theme?: 'light' | 'dark' | 'auto';
  showSubtitle?: boolean;
}

/**
 * Componente del Logo Oficial de la "Academia Musical Judá"
 * Utiliza dinámicamente el logo cargado por el Super Administrador o /logo-amj.png por defecto.
 */
export const JudaLogo: React.FC<JudaLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  theme = 'light',
  showSubtitle = true,
}) => {
  let logoSrc = '/logo-amj.png';
  try {
    const { branding } = useSiteBranding();
    if (branding?.logoUrl) {
      logoSrc = branding.logoUrl;
    }
  } catch {
    // fallback
  }

  const isDark = theme === 'dark';

  const logoSizes = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
    custom: '',
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Official PNG Logo Container */}
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl shadow-xs transition-transform duration-200 ${
          logoSizes[size]
        } ${
          isDark
            ? 'ring-1 ring-amber-500/30 shadow-amber-950/40'
            : 'ring-1 ring-stone-200 shadow-stone-300/40'
        }`}
      >
        <img
          src={logoSrc}
          alt="Academia Musical Judá"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Tipografía Institucional */}
      {variant !== 'emblem' && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-baseline gap-1.5 font-serif font-bold tracking-tight">
            <span className={`text-base sm:text-lg ${isDark ? 'text-white' : 'text-stone-900'}`}>
              Academia Judá
            </span>
          </div>
          {showSubtitle && (
            <span
              className={`font-sans tracking-widest uppercase font-semibold text-[10px] ${
                isDark ? 'text-amber-400' : 'text-amber-800'
              }`}
            >
              Formación Musical
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default JudaLogo;
