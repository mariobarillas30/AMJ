import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminIntegrationsTab } from './AdminIntegrationsTab';
import { AdminCoursesTab } from './AdminCoursesTab';
import { AdminTeachersTab } from './AdminTeachersTab';
import { AdminStudentsTab } from './AdminStudentsTab';
import { AdminClassesTab } from './AdminClassesTab';
import { AdminEnrollmentsTab } from './AdminEnrollmentsTab';
import { AdminPaymentsTab } from './AdminPaymentsTab';
import { AdminSchedulesTab } from './AdminSchedulesTab';
import { AdminMaterialsTab } from './AdminMaterialsTab';
import { AdminAcademicWorkspaceTab } from './AdminAcademicWorkspaceTab';
import { AdminVideosTab } from './AdminVideosTab';
import { AdminVirtualClassesTab } from './AdminVirtualClassesTab';
import { RoleManagementView } from './RoleManagementView';
import { 
  Building2, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Video, 
  FileCheck, 
  CreditCard,
  Calendar, 
  FolderOpen, 
  ShieldCheck, 
  Lock, 
  Layers, 
  Sparkles,
  UserCheck,
  Award,
  Film,
  Radio
} from 'lucide-react';

export type AdminTab = 
  | 'integraciones'
  | 'virtuales'
  | 'cursos'
  | 'profesores'
  | 'alumnos'
  | 'clases'
  | 'matriculas'
  | 'pagos'
  | 'videos'
  | 'horarios'
  | 'material'
  | 'roles';

interface AdminDashboardViewProps {
  initialTab?: AdminTab;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ initialTab = 'integraciones' }) => {
  const { role, currentUser, previewAsRole } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [selectedCourseForClasses, setSelectedCourseForClasses] = useState<string | undefined>(undefined);
  const [preselectedStudentForEnrollment, setPreselectedStudentForEnrollment] = useState<string | undefined>(undefined);

  const isSuperAdmin = role === 'superadmin';

  const handleNavigateToClasses = (courseId: string) => {
    setSelectedCourseForClasses(courseId);
    setActiveTab('clases');
  };

  const handleQuickEnrollStudent = (studentId: string) => {
    setPreselectedStudentForEnrollment(studentId);
    setActiveTab('matriculas');
  };

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'integraciones', label: 'Integraciones Workspace', icon: <Building2 className="w-4 h-4" /> },
    { id: 'virtuales', label: 'Clases Virtuales & Meet', icon: <Radio className="w-4 h-4 text-emerald-500" /> },
    { id: 'cursos', label: 'Cursos', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'profesores', label: 'Profesores', icon: <Users className="w-4 h-4" /> },
    { id: 'alumnos', label: 'Alumnos', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'clases', label: 'Clases', icon: <Video className="w-4 h-4" /> },
    { id: 'matriculas', label: 'Matrículas', icon: <FileCheck className="w-4 h-4" /> },
    { id: 'pagos', label: 'Pagos & Webhooks', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'videos', label: 'Videos & CDN', icon: <Film className="w-4 h-4" /> },
    { id: 'horarios', label: 'Horarios', icon: <Calendar className="w-4 h-4" /> },
    { id: 'material', label: 'Material', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'roles', label: 'Roles & Permisos', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header Panel */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Gobernanza Central
              </span>
              <span className="text-stone-400 text-xs font-serif italic">
                Academia Musical Judá
              </span>
            </div>
            
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Panel de Administración Académica
            </h1>

            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Gestión soberana de cursos, cuerpo docente, alumnado, clases, matrículas, parrilla de horarios, repositorio de partituras y estado de servicios satélite Google Workspace.
            </p>
          </div>

          {/* Role Status & Role Switcher Simulator */}
          <div className="bg-stone-800/90 border border-stone-700/80 rounded-2xl p-4 shrink-0 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                Nivel de Autorización
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                isSuperAdmin 
                  ? 'bg-amber-400 text-stone-950 shadow-xs' 
                  : 'bg-stone-700 text-stone-200'
              }`}>
                {isSuperAdmin ? <Award className="w-3.5 h-3.5 text-stone-950" /> : <Lock className="w-3 h-3 text-stone-400" />}
                <span>{isSuperAdmin ? 'Superadministrador' : 'Administrador'}</span>
              </span>
            </div>

            {/* Quick role simulator to test security restriction */}
            <div className="pt-2 border-t border-stone-700/60 text-[11px] text-stone-400">
              <span className="block mb-1.5 font-medium">Probar Políticas de Seguridad:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => previewAsRole('superadmin')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    isSuperAdmin 
                      ? 'bg-amber-500 text-stone-950' 
                      : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                  }`}
                  title="Permite vincular cuentas y gestionar credenciales institucionales"
                >
                  Superadmin
                </button>
                <button
                  onClick={() => previewAsRole('admin')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    !isSuperAdmin 
                      ? 'bg-amber-500 text-stone-950' 
                      : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                  }`}
                  title="Solo auditoría de estado; no permite conectar ni alterar cuentas"
                >
                  Admin Estándar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Global KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-800">
          <div className="bg-stone-800/50 p-3 rounded-xl border border-stone-700/40">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Cursos Activos</span>
            <strong className="text-lg font-mono font-bold text-amber-400">3 Cátedras</strong>
          </div>
          <div className="bg-stone-800/50 p-3 rounded-xl border border-stone-700/40">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Cuerpo Docente</span>
            <strong className="text-lg font-mono font-bold text-white">5 Profesores</strong>
          </div>
          <div className="bg-stone-800/50 p-3 rounded-xl border border-stone-700/40">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Alumnado Padrón</span>
            <strong className="text-lg font-mono font-bold text-white">6 Estudiantes</strong>
          </div>
          <div className="bg-stone-800/50 p-3 rounded-xl border border-stone-700/40">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Google Workspace</span>
            <strong className="text-lg font-mono font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% Operativo</span>
            </strong>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-stone-200 p-1.5 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'clases') setSelectedCourseForClasses(undefined);
                  if (tab.id !== 'matriculas') setPreselectedStudentForEnrollment(undefined);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-stone-900 text-amber-400 shadow-xs' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Rendering */}
      <div className="min-h-[500px]">
        {activeTab === 'integraciones' && <AdminIntegrationsTab />}
        {activeTab === 'virtuales' && <AdminVirtualClassesTab />}
        {activeTab === 'cursos' && <AdminCoursesTab onSelectCourseForClasses={handleNavigateToClasses} />}
        {activeTab === 'profesores' && <AdminTeachersTab />}
        {activeTab === 'alumnos' && <AdminStudentsTab onQuickEnroll={handleQuickEnrollStudent} />}
        {activeTab === 'clases' && <AdminClassesTab initialCourseFilter={selectedCourseForClasses} />}
        {activeTab === 'matriculas' && <AdminEnrollmentsTab preselectedStudentId={preselectedStudentForEnrollment} />}
        {activeTab === 'pagos' && <AdminPaymentsTab />}
        {activeTab === 'videos' && <AdminVideosTab />}
        {activeTab === 'horarios' && <AdminSchedulesTab />}
        {activeTab === 'material' && <AdminMaterialsTab />}
        {activeTab === 'roles' && <RoleManagementView />}
      </div>

    </div>
  );
};
