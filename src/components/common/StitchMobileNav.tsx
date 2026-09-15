import React from 'react';
import { ActiveNavRoute } from '../../types';
import { Home, BookOpen, GraduationCap, Calendar, User } from 'lucide-react';

interface StitchMobileNavProps {
  currentRoute: ActiveNavRoute;
  onNavigate: (route: ActiveNavRoute) => void;
}

export const StitchMobileNav: React.FC<StitchMobileNavProps> = ({
  currentRoute,
  onNavigate
}) => {
  const navItems: { id: ActiveNavRoute; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'courses', label: 'Cursos', icon: BookOpen },
    { id: 'student-portal', label: 'Mi Aula', icon: GraduationCap },
    { id: 'google-integrations', label: 'Agenda', icon: Calendar },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav 
      aria-label="Navegación móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-2 shadow-lg"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id || (item.id === 'student-portal' && currentRoute === 'academic-progress');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-amber-800 font-bold'
                  : 'text-stone-500 hover:text-stone-900 font-medium'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${
                isActive ? 'bg-amber-100 text-amber-900' : ''
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
