import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldAlert, LogIn, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
  onOpenAuth: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
  onOpenAuth,
}) => {
  const { currentUser, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-stone-600">Verificando credenciales de la academia...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-stone-200 rounded-2xl shadow-sm text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
          <Lock className="w-7 h-7" />
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
    return (
      <div className="max-w-lg mx-auto my-16 p-8 bg-white border border-red-200 rounded-2xl shadow-sm text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
          Permisos Insuficientes
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Esta sección requiere uno de los siguientes roles autorizados:{' '}
          <strong className="text-stone-900">{allowedRoles.join(', ')}</strong>.
        </p>
        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 mb-6">
          Tu rol actual verificado en la base de datos es:{' '}
          <span className="font-bold uppercase text-amber-800">{role}</span>.
        </div>
        <p className="text-xs text-stone-500">
          Si consideras que debes tener acceso a esta área, contacta a la coordinación académica o al Director General.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
