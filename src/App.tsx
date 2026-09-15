import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
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
  const [currentRoute, setCurrentRoute] = useState<ActiveNavRoute>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');

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
          <ProtectedRoute onOpenAuth={() => handleOpenAuth('login')}>
            <ProfileView />
          </ProtectedRoute>
        )}

        {currentRoute === 'student-portal' && (
          <ProtectedRoute
            allowedRoles={['student', 'teacher', 'admin', 'superadmin']}
            onOpenAuth={() => handleOpenAuth('login')}
          >
            <StudentPortalView onNavigate={setCurrentRoute} />
          </ProtectedRoute>
        )}

        {currentRoute === 'teacher-portal' && (
          <ProtectedRoute
            allowedRoles={['teacher', 'admin', 'superadmin']}
            onOpenAuth={() => handleOpenAuth('login')}
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
          >
            <AdminDashboardView initialTab="integraciones" />
          </ProtectedRoute>
        )}

        {currentRoute === 'admin-roles' && (
          <ProtectedRoute
            allowedRoles={['admin', 'superadmin']}
            onOpenAuth={() => handleOpenAuth('login')}
          >
            <AdminDashboardView initialTab="roles" />
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
                Sistema Central de Formación Musical & Google Workspace Satélite
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px] text-stone-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Autorización Zero-Trust & Firestore Criptográfico</span>
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
      <AppContent />
    </AuthProvider>
  );
}
