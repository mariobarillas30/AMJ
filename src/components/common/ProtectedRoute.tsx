import React from 'react';
import { useAuth, getPortalRouteForRole } from '../../context/AuthContext';
import { UserRole, ActiveNavRoute } from '../../types';
import { ShieldAlert, LogIn, Lock, ArrowRight, Home } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
  onOpenAuth: () => void;
  onNavigate?: (route: ActiveNavRoute) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
  onOpenAuth,
  onNavigate,
}) => {
  const { currentUser, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <img
          src="/logo-amj.png"
          alt="Academia Musical Judá"
          className="w-16 h-16 object-contain mb-4 rounded-xl shadow-xs"
        />
        <div className="w-8 h-8 border-3 border-amber-600/20 border-t-amber-600 rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-stone-600">Verificando credenciales de la academia...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-stone-200 rounded-2xl shadow-sm text-center">
        <div className="flex justify-center mb-4">
          <img
            src="/logo-amj.png"
            alt="Academia Musical Judá"
            className="w-14 h-14 object-contain rounded-xl shadow-xs"
          />
        </div>
        <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
          Acceso Restringido a Miembros
        </h3>
        <p className="text-sm text-stone-600 mb-6">
          Para acceder a esta sección debes iniciar sesión con tu cuenta de la Academia Musical Judá.
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-amber-400 font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Iniciar Sesión / Registrarse</span>
        </button>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const targetPortal = getPortalRouteForRole(role);
    const portalName = role === 'teacher' ? 'Aula Docente' : role === 'student' ? 'Mi Portal Alumno' : 'Panel Principal';

    return (
      <div className="max-w-lg mx-auto my-16 p-8 bg-white border border-red-200 rounded-2xl shadow-sm text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
          Área Restringida
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Esta sección requiere autorización de perfil:{' '}
          <strong className="text-stone-900">{allowedRoles.join(', ')}</strong>.
        </p>
        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 mb-6">
          Tu rol activo en la base de datos es:{' '}
          <span className="font-bold uppercase text-amber-800">{role}</span>.
        </div>

        {onNavigate && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <button
              onClick={() => onNavigate(targetPortal)}
              className="w-full sm:w-auto px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-400 font-semibold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span>Ir a {portalName}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto px-4 py-2.5 border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Volver al Inicio</span>
            </button>
          </div>
        )}

        <p className="text-xs text-stone-500">
          Si consideras que requieres acceso a esta área, contacta a la coordinación académica de la Academia Judá.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
