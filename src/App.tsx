import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth, getPortalRouteForRole } from './context/AuthContext';
import { SiteBrandingProvider } from './context/SiteBrandingContext';
import { Header } from './components/common/Header';
import { AuthModal } from './components/auth/AuthModal';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { HomeCatalogView } from './components/home/HomeCatalogView';
import { ProfileView } from './components/profile/ProfileView';
import { RoleManagementView } from './components/admin/RoleManagementView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { StudentPortalView } from './components/student/StudentPortalView';
import { TeacherPortalView } from './components/teacher/TeacherPortalView';
import { AcademicProgressView } from './components/progress/AcademicProgressView';
import { GoogleIntegrationsView } from './components/google/GoogleIntegrationsView';
import { SecurityAuditView } from './components/security/SecurityAuditView';
import { CoursesAcademyView } from './components/courses/CoursesAcademyView';
import { StitchMobileNav } from './components/common/StitchMobileNav';
import { JudaLogo } from './components/common/JudaLogo';
import { ActiveNavRoute, AuthMode } from './types';
import { Music, ShieldCheck, Video, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, role, loading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<ActiveNavRoute>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');

  // Track previous authenticated user ID to detect fresh logins and redirect to their assigned portal
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;

    const currentUserId = currentUser ? currentUser.uid : null;

    // Detect user login event
    if (currentUserId && prevUserIdRef.current !== currentUserId) {
      const targetPortal = getPortalRouteForRole(role);
      // If user was at home or login modal, seamlessly navigate to their authoritative portal
      if (currentRoute === 'home') {
        setCurrentRoute(targetPortal);
      }
    } else if (!currentUserId && prevUserIdRef.current !== null) {
      // User logged out
      setCurrentRoute('home');
    }

    prevUserIdRef.current = currentUserId;
  }, [currentUser, role, loading, currentRoute]);

  const handleOpenAuth = (mode: AuthMode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-amber-200 selection:text-stone-950">
      
      {/* Top Header */}
      <Header
        activeRoute={currentRoute}
        onNavigate={setCurrentRoute}
        onOpenAuth={() => handleOpenAuth('login')}
      />

      {/* Main Content View Container */}
      <main className="flex-1">
        {currentRoute === 'home' && (
          <HomeCatalogView
            onNavigate={setCurrentRoute}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        )}

        {currentRoute === 'profile' && (
          <ProtectedRoute onOpenAuth={() => handleOpenAuth('login')} onNavigate={setCurrentRoute}>
            <ProfileView />
          </ProtectedRoute>
        )}

        {currentRoute === 'student-portal' && (
          <ProtectedRoute
            allowedRoles={['student', 'teacher', 'admin', 'superadmin']}
            onOpenAuth={() => handleOpenAuth('login')}
            onNavigate={setCurrentRoute}
          >
            <StudentPortalView onNavigate={setCurrentRoute} />
          </ProtectedRoute>
        )}

        {currentRoute === 'teacher-portal' && (
          <ProtectedRoute
            allowedRoles={['teacher', 'admin', 'superadmin']}
            onOpenAuth={() => handleOpenAuth('login')}
            onNavigate={setCurrentRoute}
          >
            <TeacherPortalView onNavigate={setCurrentRoute} />
          </ProtectedRoute>
        )}

        {currentRoute === 'academic-progress' && (
          <AcademicProgressView onNavigate={setCurrentRoute} />
        )}

        {currentRoute === 'admin-dashboard' && (
          <ProtectedRoute
            allowedRoles={['admin', 'superadmin']}
            onOpenAuth={() => handleOpenAuth('login')}
            onNavigate={setCurrentRoute}
          >
            <AdminDashboardView initialTab="usuarios" />
          </ProtectedRoute>
        )}

        {currentRoute === 'admin-roles' && (
          <ProtectedRoute
            allowedRoles={['admin', 'superadmin']}
            onOpenAuth={() => handleOpenAuth('login')}
            onNavigate={setCurrentRoute}
          >
            <AdminDashboardView initialTab="usuarios" />
          </ProtectedRoute>
        )}

        {currentRoute === 'google-integrations' && (
          <GoogleIntegrationsView />
        )}

        {currentRoute === 'courses' && (
          <CoursesAcademyView />
        )}

        {currentRoute === 'security-audit' && (
          <SecurityAuditView />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs border-t border-stone-800 mt-16 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <JudaLogo size="md" variant="full" theme="dark" className="h-10" />
            <div className="border-l border-stone-800 pl-3">
              <p className="text-[11px] text-stone-400 max-w-xs">
                Plataforma Educativa Segura | Integrada con Google Workspace
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px] text-stone-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Inicio de Sesión Seguro | Protección de Datos</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-sky-400" />
              <span>Google Meet, Drive & Classroom Integrados</span>
            </span>
          </div>

          <p className="text-[10px] text-stone-400">
            © {new Date().getFullYear()} Academia Judá. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* Stitch Mobile Bottom Navigation (Visible on mobile/tablet) */}
      <StitchMobileNav
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuth}
        initialMode={authModalMode}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SiteBrandingProvider>
        <AppContent />
      </SiteBrandingProvider>
    </AuthProvider>
  );
}
