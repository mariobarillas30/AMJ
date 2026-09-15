import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ActiveNavRoute, UserRole } from '../../types';
import { JudaLogo } from './JudaLogo';
import { 
  Music, 
  Shield, 
  User as UserIcon, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle, 
  GraduationCap, 
  BookOpen, 
  Users, 
  Video, 
  Menu, 
  X,
  ChevronDown,
  Sparkles,
  Lock,
  Layers,
  Bell
} from 'lucide-react';

interface HeaderProps {
  currentRoute: ActiveNavRoute;
  onNavigate: (route: ActiveNavRoute) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  onOpenAuth,
}) => {
  const { 
    currentUser, 
    userProfile, 
    role, 
    logout, 
    isEmailVerified, 
    resendVerificationEmail,
    previewAsRole,
    activePreviewRole
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'superadmin':
        return { label: 'Superadministrador', color: 'bg-amber-500/10 text-amber-700 border-amber-300' };
      case 'admin':
        return { label: 'Administrador', color: 'bg-indigo-500/10 text-indigo-700 border-indigo-300' };
      case 'teacher':
        return { label: 'Profesor Titular', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-300' };
      case 'student':
      default:
        return { label: 'Alumno', color: 'bg-sky-500/10 text-sky-700 border-sky-300' };
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 5000);
    } catch {
      alert('Error al enviar correo de verificación.');
    }
  };

  const badge = getRoleBadge(role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Email verification reminder bar */}
      {currentUser && !isEmailVerified && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs md:text-sm text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Tu correo <strong>{currentUser.email}</strong> aún no está verificado. Revisa tu bandeja de entrada para validar tu cuenta en la academia.
            </span>
            <button
              onClick={handleResendVerification}
              disabled={verificationSent}
              className="ml-auto underline font-semibold hover:text-amber-950 transition-colors whitespace-nowrap"
            >
              {verificationSent ? '¡Correo enviado!' : 'Reenviar enlace'}
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo Oficial */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer select-none group transition-opacity hover:opacity-90"
        >
          <JudaLogo size="md" variant="full" theme="light" className="h-10 sm:h-11" />
          <div className="hidden lg:block border-l border-stone-200 pl-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Conservatorio & Artes
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentRoute === 'home'
                ? 'bg-stone-100 text-stone-900 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            Inicio
          </button>

          {/* Cursos & Clases */}
          <button
            onClick={() => onNavigate('courses')}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all ${
              currentRoute === 'courses'
                ? 'bg-amber-500/15 text-amber-950 font-bold border border-amber-300 shadow-2xs'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-50'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Cursos</span>
          </button>

          {/* Student Portal (Visible to students and administrators) */}
          {currentUser && (role === 'student' || role === 'admin' || role === 'superadmin') && (
            <button
              onClick={() => onNavigate('student-portal')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                currentRoute === 'student-portal'
                  ? 'bg-amber-500/10 text-amber-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Mi Portal Alumno</span>
            </button>
          )}

          {/* Teacher Portal (Visible to teachers and administrators) */}
          {currentUser && (role === 'teacher' || role === 'admin' || role === 'superadmin') && (
            <button
              onClick={() => onNavigate('teacher-portal')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                currentRoute === 'teacher-portal'
                  ? 'bg-emerald-500/10 text-emerald-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Aula Docente</span>
            </button>
          )}

          {/* Progreso Académico (FASE 09 - Fuente Principal) */}
          <button
            onClick={() => onNavigate('academic-progress')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
              currentRoute === 'academic-progress'
                ? 'bg-emerald-500/15 text-emerald-950 font-bold border border-emerald-300 shadow-2xs'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Progreso FASE 09</span>
          </button>

          {/* Admin Dashboard & Governance FASE 06 (Protected: Superadmin & Admin) */}
          {currentUser && (role === 'superadmin' || role === 'admin') && (
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                currentRoute === 'admin-dashboard' || currentRoute === 'admin-roles'
                  ? 'bg-stone-900 text-amber-400 font-bold shadow-2xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-500" />
              <span>Panel Admin FASE 06</span>
            </button>
          )}

          {/* Google Workspace Integrations */}
          {currentUser && (
            <button
              onClick={() => onNavigate('google-integrations')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                currentRoute === 'google-integrations'
                  ? 'bg-sky-500/10 text-sky-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Video className="w-4 h-4 text-sky-600" />
              <span>Google Workspace</span>
            </button>
          )}

          {/* Security & Audit FASE 17 (Auditoría Final, Escalabilidad y Producción) */}
          <button
            onClick={() => onNavigate('security-audit')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
              currentRoute === 'security-audit'
                ? 'bg-amber-500/10 text-amber-900 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
            title="Centro de Auditoría FASE 17 & Salida a Producción"
          >
            <Shield className="w-4 h-4 text-amber-600" />
            <span>Auditoría FASE 17</span>
          </button>
        </nav>

        {/* Right Section: Auth / Profile */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              
              {/* Role Simulation Switcher (for testing/evaluating all roles) */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-stone-200 rounded-md bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors"
                  title="Simular visualización como otro rol para pruebas"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Probar Rol:</span>
                  <strong className="capitalize">{activePreviewRole || role}</strong>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white border border-stone-200 rounded-lg shadow-lg py-1 z-50 text-xs">
                    <div className="px-3 py-1.5 font-semibold text-stone-500 border-b border-stone-100">
                      Modo Exploración de Roles
                    </div>
                    {(['student', 'teacher', 'admin', 'superadmin'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          previewAsRole(r === role ? null : r);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-stone-50 ${
                          (activePreviewRole || role) === r ? 'font-bold text-amber-900 bg-amber-50/50' : 'text-stone-700'
                        }`}
                      >
                        <span className="capitalize">{r}</span>
                        {(activePreviewRole || role) === r && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                      </button>
                    ))}
                    {activePreviewRole && (
                      <button
                        onClick={() => {
                          previewAsRole(null);
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-amber-700 hover:bg-amber-50 border-t border-stone-100 font-medium"
                      >
                        Restablecer a mi rol real ({role})
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Verified Role Badge */}
              <div 
                onClick={() => onNavigate('profile')}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer hover:opacity-90 transition-opacity ${badge.color}`}
              >
                <Lock className="w-3 h-3" />
                <span>{badge.label}</span>
              </div>

              {/* Notifications Bell with unread dot (Stitch Design) */}
              <button
                onClick={() => onNavigate('student-portal')}
                className="relative p-2 rounded-xl text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-colors"
                title="Notificaciones de clases y avisos"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              {/* Profile Avatar / Name Button */}
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                title="Ver mi perfil seguro"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Avatar'}
                    className="w-8 h-8 rounded-full border border-stone-300 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-300 font-bold flex items-center justify-center text-xs">
                    {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-medium text-stone-800 max-w-[120px] truncate">
                  {currentUser.displayName || currentUser.email}
                </span>
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Cerrar sesión segura"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-stone-900 text-amber-400 hover:bg-stone-800 hover:text-amber-300 transition-all shadow-sm"
              >
                Iniciar Sesión / Registro
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-2">
          <button
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            Inicio
          </button>
          <button
            onClick={() => { onNavigate('courses'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-bold text-amber-900 bg-amber-50 flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-amber-600" />
            Cursos (Academia)
          </button>
          {currentUser && (
            <>
              <button
                onClick={() => { onNavigate('student-portal'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-stone-800 hover:bg-stone-50 flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-amber-600" />
                Mi Portal Alumno
              </button>
              {(role === 'teacher' || role === 'admin' || role === 'superadmin') && (
                <button
                  onClick={() => { onNavigate('teacher-portal'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-stone-800 hover:bg-stone-50 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Aula Docente
                </button>
              )}
              <button
                onClick={() => { onNavigate('academic-progress'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-bold text-emerald-950 bg-emerald-50 flex items-center gap-2 border border-emerald-200"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Progreso FASE 09 (Fuente Principal)
              </button>
              {(role === 'superadmin' || role === 'admin') && (
                <button
                  onClick={() => { onNavigate('admin-dashboard'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-bold text-amber-950 bg-amber-50 flex items-center gap-2 border border-amber-200"
                >
                  <Shield className="w-4 h-4 text-amber-600" />
                  Panel Admin FASE 06 (Gestión Total)
                </button>
              )}
              <button
                onClick={() => { onNavigate('google-integrations'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-stone-800 hover:bg-stone-50 flex items-center gap-2"
              >
                <Video className="w-4 h-4 text-sky-600" />
                Google Workspace
              </button>
              <button
                onClick={() => { onNavigate('security-audit'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-stone-800 hover:bg-stone-50 flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-amber-600" />
                Auditoría FASE 17
              </button>
              <button
                onClick={() => { onNavigate('profile'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-stone-800 hover:bg-stone-50 flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4 text-stone-600" />
                Mi Perfil ({badge.label})
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
