import React, { useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { 
  AcademicCourse, 
  AcademicModule, 
  AcademicClass, 
  StudentEnrollment,
  ActiveNavRoute,
  AcademicProgressRecord,
  evaluateEnrollmentAccess,
  EnrollmentAccessResult
} from '../../types';
import { INITIAL_ADMIN_ENROLLMENTS, INITIAL_ADMIN_STUDENTS } from '../../data/adminManagementData';
import { 
  getStoredProgressRecords, 
  toggleClassCompletion, 
  calculateStudentCourseProgress 
} from '../../data/progressData';
import { StudentClassDetailModal } from './StudentClassDetailModal';
import { StudentPaymentModal } from './StudentPaymentModal';
import { StudentVirtualClassesSection } from './StudentVirtualClassesSection';
import { 
  GraduationCap, 
  BookOpen, 
  Layers, 
  Video, 
  FolderOpen, 
  Award, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  Lock, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft,
  Search,
  ExternalLink,
  Music,
  Info,
  CreditCard,
  Ban,
  AlertTriangle,
  RefreshCw,
  Film,
  Radio
} from 'lucide-react';

interface StudentPortalViewProps {
  onNavigate?: (route: ActiveNavRoute) => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({ onNavigate }) => {
  const { currentUser, userProfile } = useAuth();

  // Load real-time courses from Firestore
  const [courses, setCourses] = useState<AcademicCourse[]>([]);

  useEffect(() => {
    const path = 'courses';
    const col = collection(db, path);
    const unsubscribe = onSnapshot(
      col,
      (snapshot) => {
        const list: AcademicCourse[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            title: data.title || '',
            description: data.description || '',
            instrument: data.instrument || 'Instrumento',
            teacherName: data.teacherName || '',
            teacherId: data.teacherId || '',
            modality: data.modality || 'live_virtual',
            schedule: data.schedule || '',
            priceMonthly: typeof data.priceMonthly === 'number' ? data.priceMonthly : 0,
            status: data.status || 'active',
            meetUrl: data.meetUrl || '',
            meetCode: data.meetCode || '',
            driveFolderId: data.driveFolderId || '',
            classroomCourseId: data.classroomCourseId || '',
            modules: data.modules || []
          } as AcademicCourse);
        });
        setCourses(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return () => unsubscribe();
  }, []);

  // Simulated student profile for testing all 4 authorization conditions effortlessly
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (currentUser?.email === 'mariobarillas24@gmail.com') return 'student-mario';
    return 'student-mario';
  });

  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);

  useEffect(() => {
    const studentUid = currentUser?.uid || selectedStudentId;
    if (!studentUid) {
      setEnrollments([]);
      return;
    }
    const path = 'enrollments';
    const q = query(
      collection(db, path),
      where('studentId', '==', studentUid)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: StudentEnrollment[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            studentId: data.studentId || '',
            studentName: data.studentName || '',
            studentEmail: data.studentEmail || '',
            courseId: data.courseId || '',
            courseTitle: data.courseTitle || '',
            status: data.status || 'active',
            notes: data.notes || '',
            startDate: data.startDate || '',
            expiresAt: data.expiresAt || '',
            modality: data.modality || 'live_virtual',
            accessType: data.accessType || 'full_access',
            paymentMethod: data.paymentMethod || 'stripe',
            paymentId: data.paymentId || '',
            enrolledAt: data.enrolledAt || '',
            validUntil: data.validUntil || ''
          } as StudentEnrollment);
        });
        setEnrollments(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return () => unsubscribe();
  }, [currentUser?.uid, selectedStudentId]);

  // Navigation State: Mis Cursos -> Curso -> Módulo -> Clase
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [studentSectionTab, setStudentSectionTab] = useState<'cursos' | 'virtuales'>('cursos');

  // FASE 09: Authoritative Progress Records State (Internal Platform as Primary Source)
  const [progressRecords, setProgressRecords] = useState<AcademicProgressRecord[]>(() => getStoredProgressRecords());

  // Payment Modal State (FASE 11)
  const [paymentModalCourse, setPaymentModalCourse] = useState<AcademicCourse | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  // Helper to check if class is completed in internal platform
  const isClassCompleted = (classId: string) => {
    return progressRecords.some(r => r.studentId === selectedStudentId && r.classId === classId && r.completed);
  };

  // Helper to toggle class completion
  const handleToggleClass = (cls: AcademicClass, course: AcademicCourse, mod: AcademicModule) => {
    const currentCompleted = isClassCompleted(cls.id);
    const updated = toggleClassCompletion(
      selectedStudentId,
      currentStudent.displayName,
      course.id,
      course.title,
      mod.id,
      mod.title,
      cls.id,
      cls.title,
      !currentCompleted
    );
    setProgressRecords(updated);
  };

  // Modal State for Class Material & Activities
  const [modalClass, setModalClass] = useState<AcademicClass | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'material' | 'actividad' | 'info' | 'video'>('info');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get active student data
  const currentStudent = useMemo(() => {
    return INITIAL_ADMIN_STUDENTS.find(s => s.uid === selectedStudentId) || {
      uid: selectedStudentId,
      displayName: userProfile?.displayName || currentUser?.displayName || 'Mario Barillas',
      email: currentUser?.email || 'mariobarillas24@gmail.com',
      primaryInstrument: 'Piano',
      status: 'active'
    };
  }, [selectedStudentId, currentUser, userProfile]);

  // Active student's valid enrollments
  const studentEnrollments = useMemo(() => {
    return enrollments.filter(e => e.studentId === selectedStudentId);
  }, [enrollments, selectedStudentId]);

  // FASE 10: Courses with ACTIVE, VALID enrollment (evaluateEnrollmentAccess === true)
  const activeEnrolledCourses = useMemo(() => {
    return courses.filter(c => {
      const enr = studentEnrollments.find(e => e.courseId === c.id);
      if (!enr) return false;
      const access = evaluateEnrollmentAccess(enr);
      return access.hasAccess;
    });
  }, [courses, studentEnrollments]);

  // FASE 10: Courses with EXPIRED, SUSPENDED, or CANCELLED enrollment
  const expiredOrRestrictedCourses = useMemo(() => {
    return courses.filter(c => {
      const enr = studentEnrollments.find(e => e.courseId === c.id);
      if (!enr) return false;
      const access = evaluateEnrollmentAccess(enr);
      return !access.hasAccess && access.status !== 'pending';
    });
  }, [courses, studentEnrollments]);

  // Pending enrollments
  const pendingCourses = useMemo(() => {
    return courses.filter(c => {
      const enr = studentEnrollments.find(e => e.courseId === c.id);
      return enr && enr.status === 'pending';
    });
  }, [courses, studentEnrollments]);

  // Other academy courses where student is NOT enrolled
  const otherCourses = useMemo(() => {
    return courses.filter(c => !studentEnrollments.some(e => e.courseId === c.id));
  }, [courses, studentEnrollments]);

  // Selected Course details
  const selectedCourse = useMemo(() => {
    if (!selectedCourseId) return null;
    return courses.find(c => c.id === selectedCourseId) || null;
  }, [courses, selectedCourseId]);

  // Selected Course Enrollment & Access Result
  const selectedCourseEnrollment = useMemo(() => {
    if (!selectedCourseId) return null;
    return studentEnrollments.find(e => e.courseId === selectedCourseId) || null;
  }, [selectedCourseId, studentEnrollments]);

  const selectedCourseAccess: EnrollmentAccessResult = useMemo(() => {
    return evaluateEnrollmentAccess(selectedCourseEnrollment);
  }, [selectedCourseEnrollment]);

  // Verification Helper for Google Meet
  // FASE 10: La matrícula determina el acceso. Si una matrícula vence: restringir acceso; evitar nuevos accesos a Meet.
  const evaluateClassMeetAccess = (courseId: string, classItem: AcademicClass) => {
    // 1. Usuario autenticado check
    if (!currentUser && !selectedStudentId) {
      return { allowed: false, reason: 'Debes iniciar sesión para acceder al aula virtual.' };
    }

    // 2 & 3. Matrícula y curso autorizado según evaluateEnrollmentAccess
    const enrollment = studentEnrollments.find(e => e.courseId === courseId);
    const access = evaluateEnrollmentAccess(enrollment, 'meet');

    if (!access.hasAccess || !access.allowedResources.meet) {
      return { allowed: false, reason: access.reason };
    }

    // 4. Clase correspondiente
    const isVirtual = classItem.modality === 'virtual_en_vivo' || classItem.modality === 'hibrida';
    if (!isVirtual) {
      return { allowed: false, reason: 'Esta sesión no es virtual en vivo.' };
    }

    if (!classItem.meetUrl) {
      return { allowed: false, reason: 'Enlace de Meet no programado para esta clase.' };
    }

    return { allowed: true, reason: 'Acceso autorizado por matrícula activa.' };
  };

  // Open modal with specific tab
  const handleOpenClassTab = (cls: AcademicClass, tab: 'material' | 'actividad' | 'info' | 'video') => {
    setModalClass(cls);
    setModalInitialTab(tab);
    setIsModalOpen(true);
  };

  // Open payment renewal modal
  const handleOpenRenewModal = (course: AcademicCourse) => {
    setPaymentModalCourse(course);
    setIsPaymentModalOpen(true);
  };

  // Payment completed handler: State is received via onSnapshot from the backend-persisted Firestore document
  const handlePaymentSuccess = (_updatedEnrollment: StudentEnrollment) => {
    // Authoritative persistence is handled strictly by the backend/webhook processor.
    // The onSnapshot listener will automatically receive the updated enrollment document.
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Student Top Profile & Authorization Status Bar */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src="/logo-amj.png"
              alt="Academia Musical Judá"
              className="w-14 h-14 object-contain rounded-xl shadow-xs shrink-0 mt-1"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Portal del Alumno
                </span>
                <span className="text-stone-400 text-xs font-serif italic">
                  Academia Musical Judá
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-stone-950 font-serif font-bold text-xl flex items-center justify-center shadow-md shrink-0">
                  {currentStudent.displayName.charAt(0)}
                </div>
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {currentStudent.displayName}
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-400">
                    {currentStudent.email} • Especialidad: <strong className="text-amber-400 font-semibold">{currentStudent.primaryInstrument || 'Piano'}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Profile Switcher to test access gating */}
          <div className="bg-stone-800/90 border border-stone-700/80 rounded-2xl p-3.5 shrink-0 flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
              Simulador de Perfil Alumno:
            </span>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setSelectedCourseId(null);
                setExpandedModuleId(null);
              }}
              className="bg-stone-900 border border-stone-700 text-white rounded-xl px-3 py-1.5 text-xs focus:border-amber-400 focus:outline-none"
            >
              <option value="student-mario">Mario Barillas (Piano Activo / Canto Vencido)</option>
              <option value="student-carlos">Carlos Mendoza (Armonía Activa)</option>
              <option value="student-valentina">Valentina Castro (Matrícula Pendiente)</option>
              <option value="student-guest">Visitante Sin Matrícula</option>
            </select>

            <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1">
              <span>Cursos Activos / Vencidos:</span>
              <span className="font-mono">
                <strong className="text-emerald-400">{activeEnrolledCourses.length}</strong> act. / <strong className="text-red-400">{expiredOrRestrictedCourses.length}</strong> venc.
              </span>
            </div>
          </div>
        </div>

        {/* Global summary chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-800 text-xs">
          <div className="bg-stone-800/50 p-3 rounded-xl border border-stone-700/40">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Matrículas Vigentes</span>
            <strong className="text-base font-mono font-bold text-emerald-400">{activeEnrolledCourses.length} Cursos</strong>
          </div>
          <div className="bg-stone-800/50 p-3 rounded-xl border border-stone-700/40">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Matrículas Vencidas</span>
            <strong className="text-base font-mono font-bold text-red-400">{expiredOrRestrictedCourses.length} Bloqueadas</strong>
          </div>
          <div className="bg-stone-800/50 p-3 rounded-xl border border-stone-700/40">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Aulas Google Meet</span>
            <strong className="text-base font-mono font-bold text-amber-400">Salas Privadas</strong>
          </div>
          <div className="bg-stone-800/50 p-3 rounded-xl border border-stone-700/40">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Material Urtext</span>
            <strong className="text-base font-mono font-bold text-sky-400">Google Drive Verificado</strong>
          </div>
        </div>
      </div>

      {/* Main Hierarchy Container: Mis Cursos -> Curso -> Módulo -> Clase */}
      <div className="space-y-6">

        {/* FASE 10 & 11: Security Alert Callout */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Políticas y Control de Acceso Académico</p>
              <p className="text-[11px] text-amber-900/90 mt-0.5">
                La matrícula determina el acceso soberano a clases, Google Meet, material de Drive, Classroom y videos grabados. <strong>Un alumno con matrícula vencida NO recibe acceso a contenido restringido aunque conserve un antiguo enlace de Google.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs between Curriculum and Virtual Classes */}
        {!selectedCourseId && (
          <div className="bg-white rounded-2xl border border-stone-200 p-1.5 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
            <button
              onClick={() => setStudentSectionTab('cursos')}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                studentSectionTab === 'cursos'
                  ? 'bg-stone-900 text-amber-400 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Mis Cursos & Contenido Académico</span>
            </button>
            <button
              onClick={() => setStudentSectionTab('virtuales')}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                studentSectionTab === 'virtuales'
                  ? 'bg-stone-900 text-amber-400 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-500" />
              <span>Aulas Virtuales & Google Meet</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
          </div>
        )}

        {/* Breadcrumbs Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
          <button
            onClick={() => {
              setSelectedCourseId(null);
              setExpandedModuleId(null);
            }}
            className={`hover:text-stone-900 transition-colors flex items-center gap-1.5 ${
              !selectedCourseId ? 'text-amber-900 font-bold' : ''
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>Mis Cursos</span>
          </button>

          {selectedCourse && (
            <>
              <ChevronRight className="w-4 h-4 text-stone-300" />
              <button
                onClick={() => setExpandedModuleId(null)}
                className={`hover:text-stone-900 transition-colors truncate max-w-[200px] sm:max-w-md ${
                  !expandedModuleId ? 'text-amber-900 font-bold' : ''
                }`}
              >
                {selectedCourse.title}
              </button>
            </>
          )}

          {expandedModuleId && selectedCourse && (
            <>
              <ChevronRight className="w-4 h-4 text-stone-300" />
              <span className="text-stone-900 font-bold truncate max-w-[150px] sm:max-w-xs">
                {selectedCourse.modules.find(m => m.id === expandedModuleId)?.title}
              </span>
            </>
          )}
        </div>

        {/* LEVEL 1: LIST OF "MIS CURSOS" OR "AULAS VIRTUALES" */}
        {!selectedCourseId && studentSectionTab === 'virtuales' ? (
          <StudentVirtualClassesSection
            studentId={selectedStudentId}
            studentName={currentStudent.displayName}
            enrollments={enrollments}
            courses={courses}
            onRenewCourse={handleOpenRenewModal}
          />
        ) : !selectedCourseId ? (
          <div className="space-y-8">
            
            {/* SECTION 1: ACTIVELY ENROLLED COURSES */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                  <span>Mis Cursos con Matrícula Activa</span>
                </h2>
                <span className="text-xs text-stone-500 font-medium">
                  {activeEnrolledCourses.length} cátedras vigentes
                </span>
              </div>

              {activeEnrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {activeEnrolledCourses.map((course) => {
                    const totalClasses = course.modules.reduce((acc, m) => acc + (m.classes?.length || 0), 0);
                    const enrollment = studentEnrollments.find(e => e.courseId === course.id);

                    return (
                      <div
                        key={course.id}
                        className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Matrícula Válida • Acceso Total</span>
                            </span>
                            <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-lg">
                              {course.instrument}
                            </span>
                          </div>

                          <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-emerald-900 transition-colors">
                            {course.title}
                          </h3>

                          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                            {course.description}
                          </p>

                          <div className="pt-2 border-t border-stone-100 space-y-1 text-xs text-stone-600">
                            <div className="flex items-center justify-between">
                              <span className="text-stone-400">Docente titular:</span>
                              <span className="font-semibold text-stone-800">{course.teacherName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-stone-400">Horario de clase:</span>
                              <span className="text-stone-700">{course.schedule}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-stone-400">Estructura académica:</span>
                              <span className="font-semibold text-stone-800">
                                {course.modules.length} Módulos • {totalClasses} Clases
                              </span>
                            </div>
                            {(enrollment?.expiresAt || enrollment?.validUntil) && (
                              <div className="flex items-center justify-between text-[11px] pt-1">
                                <span className="text-stone-400">Vigencia autorizada:</span>
                                <span className="text-emerald-700 font-semibold font-mono">
                                  Hasta {(enrollment.expiresAt || enrollment.validUntil)?.split('T')[0]}
                                </span>
                              </div>
                            )}

                            {/* FASE 09: Authoritative Course Progress Bar */}
                            {(() => {
                              const prog = calculateStudentCourseProgress(selectedStudentId, course, progressRecords);
                              return (
                                <div className="pt-2 border-t border-stone-100 space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-semibold text-stone-700">Progreso Oficial:</span>
                                    <span className="font-mono font-bold text-emerald-700">{prog.overallPercentage}% ({prog.completedClasses}/{prog.totalClasses})</span>
                                  </div>
                                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                                    <div 
                                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${prog.overallPercentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            if (course.modules.length > 0) {
                              setExpandedModuleId(course.modules[0].id);
                            }
                          }}
                          className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                        >
                          <span>Ingresar al Curso (Módulos & Clases)</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 text-center space-y-2">
                  <p className="text-xs text-stone-500">
                    No tienes cursos con matrícula activa en este momento.
                  </p>
                </div>
              )}
            </div>

            {/* SECTION 2: EXPIRED / RESTRICTED ENROLLMENTS (FASE 10 & 11) */}
            {expiredOrRestrictedCourses.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-red-950 flex items-center gap-2">
                    <Ban className="w-5 h-5 text-red-600" />
                    <span>Cursos con Matrícula Vencida o Suspendida (Acceso Restringido)</span>
                  </h3>
                  <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-200">
                    {expiredOrRestrictedCourses.length} restringidos
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {expiredOrRestrictedCourses.map((course) => {
                    const enrollment = studentEnrollments.find(e => e.courseId === course.id);
                    const access = evaluateEnrollmentAccess(enrollment);
                    const expiryDate = enrollment?.expiresAt || enrollment?.validUntil || 'Fecha no registrada';

                    return (
                      <div
                        key={course.id}
                        className="bg-red-50/40 border border-red-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300">
                              <Ban className="w-3.5 h-3.5 text-red-600" />
                              <span>Matrícula Vencida</span>
                            </span>
                            <span className="text-xs font-semibold text-stone-500 bg-white/80 px-2.5 py-0.5 rounded-lg border border-red-100">
                              {course.instrument}
                            </span>
                          </div>

                          <h3 className="font-serif text-lg font-bold text-stone-900">
                            {course.title}
                          </h3>

                          {/* Explanation of Restriction */}
                          <div className="p-3 bg-red-100/60 rounded-xl border border-red-200 text-xs text-red-950 space-y-1">
                            <strong className="block font-bold">Bloqueo Institucional Activo:</strong>
                            <p className="text-[11px] leading-relaxed text-red-900">
                              Tu matrícula expiró el <strong>{expiryDate.split('T')[0]}</strong>. El acceso a clases, salas de Google Meet, biblioteca Drive Urtext y videos grabados está restringido. Aunque conserves un enlace directo de Google, el sistema institucional deniega el acceso.
                            </p>
                          </div>

                          <div className="pt-2 border-t border-red-200/60 space-y-1 text-xs text-stone-600">
                            <div className="flex items-center justify-between">
                              <span className="text-stone-500">Docente titular:</span>
                              <span className="font-semibold text-stone-800">{course.teacherName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-stone-500">Colegiatura mensual:</span>
                              <span className="font-bold text-stone-900 font-serif">${course.priceMonthly || 85} USD</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-red-200/70 flex items-center gap-2">
                          <button
                            onClick={() => handleOpenRenewModal(course)}
                            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>Pagar y Renovar Matrícula</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCourseId(course.id);
                              if (course.modules.length > 0) {
                                setExpandedModuleId(course.modules[0].id);
                              }
                            }}
                            className="px-3.5 py-2.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 font-semibold rounded-xl text-xs transition-colors"
                            title="Ver temario y estado de bloqueo de clases"
                          >
                            <span>Ver Temario</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 3: PENDING ENROLLMENTS */}
            {pendingCourses.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Cursos con Matrícula en Trámite</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingCourses.map(course => (
                    <div key={course.id} className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          Matrícula Pendiente
                        </span>
                        <span className="text-xs text-stone-500">{course.instrument}</span>
                      </div>
                      <h4 className="font-serif font-bold text-stone-900 text-base">{course.title}</h4>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Tu solicitud de ingreso está en proceso de validación administrativa. El acceso a las salas de Google Meet se activará en cuanto se verifique la matrícula.
                      </p>
                      <div className="flex items-center justify-between gap-2 text-xs text-amber-900 font-semibold bg-white/70 p-2.5 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>Enlaces de Google Meet protegidos hasta confirmación</span>
                        </div>
                        <button
                          onClick={() => handleOpenRenewModal(course)}
                          className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-bold shrink-0 hover:bg-amber-700"
                        >
                          Confirmar Pago
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4: OTHER COURSES IN THE ACADEMY */}
            {otherCourses.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      Otros Cursos de la Academia Judá
                    </h3>
                    <p className="text-xs text-stone-500">
                      Cursos ofertados donde actualmente no posees matrícula.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-stone-400">
                    {otherCourses.length} cátedras
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {otherCourses.map(course => (
                    <div key={course.id} className="bg-stone-50 rounded-2xl border border-stone-200 p-5 space-y-3 opacity-90 hover:opacity-100 transition-opacity flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-200 text-stone-700">
                            No Matriculado
                          </span>
                          <span className="text-[11px] text-stone-500">{course.instrument}</span>
                        </div>
                        <h4 className="font-serif font-bold text-stone-900 text-sm">{course.title}</h4>
                        <p className="text-[11px] text-stone-500 line-clamp-2">{course.description}</p>
                      </div>

                      <div className="pt-3 border-t border-stone-200 space-y-2">
                        <div className="flex items-center justify-between text-xs text-stone-600">
                          <span>Docente: {course.teacherName}</span>
                          <span className="font-bold text-stone-800">${course.priceMonthly}/mes</span>
                        </div>
                        <button
                          onClick={() => handleOpenRenewModal(course)}
                          className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Matricularme Ahora</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          /* LEVEL 2 & 3: DRILL-DOWN INTO SELECTED COURSE -> MÓDULOS -> CLASES */
          <div className="space-y-6">
            
            {/* Course Header Banner */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <button
                    onClick={() => {
                      setSelectedCourseId(null);
                      setExpandedModuleId(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 mb-2 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Volver a Mis Cursos</span>
                  </button>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    {selectedCourse.title}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Cátedra de {selectedCourse.instrument} • Impartido por {selectedCourse.teacherName}
                  </p>
                </div>

                {selectedCourseAccess.hasAccess ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Matrícula Válida • Acceso Total</span>
                  </span>
                ) : (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300">
                      <Ban className="w-3.5 h-3.5 text-red-600" />
                      <span>Matrícula Vencida / Restringida</span>
                    </span>
                    <button
                      onClick={() => handleOpenRenewModal(selectedCourse)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Renovar</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Notice banner if expired */}
              {!selectedCourseAccess.hasAccess && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-red-800">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Acceso Restringido por Matrícula Vencida</span>
                  </div>
                  <p className="leading-relaxed text-red-900">
                    {selectedCourseAccess.reason} Los enlaces de Google Meet, carpetas de Google Drive y videos permanecen protegidos institucionalmente hasta que se registre y valide un nuevo pago.
                  </p>
                </div>
              )}

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200">
                {selectedCourse.description}
              </p>
            </div>

            {/* List of Modules for this Course */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-700" />
                <span>Módulos de Aprendizaje ({selectedCourse.modules.length})</span>
              </h3>

              <div className="space-y-4">
                {selectedCourse.modules.map((mod, modIdx) => {
                  const isExpanded = expandedModuleId === mod.id;
                  const classCount = mod.classes?.length || 0;

                  return (
                    <div
                      key={mod.id}
                      className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs transition-all"
                    >
                      {/* Module Header Bar (Accordion Trigger) */}
                      <button
                        onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                        className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                            isExpanded ? 'bg-amber-500 text-stone-950 shadow-xs' : 'bg-stone-100 text-stone-700'
                          }`}>
                            {modIdx + 1}
                          </div>
                          <div className="truncate">
                            <h4 className="font-serif font-bold text-stone-900 text-base truncate">
                              {mod.title}
                            </h4>
                            <p className="text-xs text-stone-500 truncate">
                              {mod.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
                            {classCount} {classCount === 1 ? 'Clase' : 'Clases'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-amber-600' : ''
                          }`} />
                        </div>
                      </button>

                      {/* Module Content: List of Classes */}
                      {isExpanded && (
                        <div className="p-5 sm:p-6 pt-2 border-t border-stone-100 space-y-4 bg-stone-50/40">
                          {mod.classes && mod.classes.length > 0 ? (
                            mod.classes.map((cls, classIdx) => {
                              // Evaluate Meet access for this specific class
                              const meetAuth = evaluateClassMeetAccess(selectedCourse.id, cls);
                              const isLiveVirtual = cls.modality === 'virtual_en_vivo' || cls.modality === 'hibrida';

                              return (
                                <div
                                  key={cls.id}
                                  className={`rounded-2xl border p-5 shadow-2xs space-y-4 transition-all ${
                                    selectedCourseAccess.hasAccess 
                                      ? 'bg-white border-stone-200 hover:border-stone-300' 
                                      : 'bg-red-50/20 border-red-200/80'
                                  }`}
                                >
                                  {/* Class Title & Badges */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 uppercase tracking-wider">
                                          Clase {classIdx + 1}
                                        </span>
                                        {isClassCompleted(cls.id) ? (
                                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                            <span>Completada</span>
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200 flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-stone-400" />
                                            <span>Pendiente</span>
                                          </span>
                                        )}
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                          isLiveVirtual 
                                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                            : 'bg-sky-50 text-sky-800 border border-sky-200'
                                        }`}>
                                          {cls.modality === 'virtual_en_vivo' ? 'Virtual en Vivo' :
                                           cls.modality === 'grabada' ? 'Grabada' :
                                           cls.modality === 'presencial' ? 'Presencial' : 'Híbrida'}
                                        </span>
                                      </div>

                                      <h5 className="font-serif font-bold text-stone-900 text-base">
                                        {cls.title}
                                      </h5>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-stone-500">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                                        <span>{cls.duration}</span>
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                        <span>{cls.date}</span>
                                      </span>
                                    </div>
                                  </div>

                                  {/* Class Description */}
                                  <p className="text-xs text-stone-600 leading-relaxed">
                                    {cls.description}
                                  </p>

                                  {/* Primary Actions Grid */}
                                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                                    
                                    {/* Left: Modality specific actions */}
                                    <div className="flex flex-wrap items-center gap-2">
                                      
                                      {/* [Entrar a Google Meet] button */}
                                      {isLiveVirtual && (
                                        meetAuth.allowed ? (
                                          <a
                                            href={cls.meetUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
                                            title="Abrir aula virtual de Google Meet"
                                          >
                                            <Video className="w-4 h-4" />
                                            <span>Entrar a Google Meet</span>
                                            <ExternalLink className="w-3 h-3 text-emerald-200" />
                                          </a>
                                        ) : (
                                          <div className="px-3.5 py-2 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-1.5 border border-red-200 font-semibold" title={meetAuth.reason}>
                                            <Lock className="w-3.5 h-3.5 text-red-500" />
                                            <span>Meet Bloqueado (Matrícula Vencida)</span>
                                          </div>
                                        )
                                      )}

                                      {/* [Material de clase] button */}
                                      <button
                                        onClick={() => handleOpenClassTab(cls, 'material')}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors ${
                                          selectedCourseAccess.allowedResources.materials
                                            ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                                            : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                                        }`}
                                      >
                                        <FolderOpen className="w-4 h-4" />
                                        <span>Material Urtext</span>
                                        {!selectedCourseAccess.allowedResources.materials && (
                                          <Lock className="w-3 h-3 text-stone-500" />
                                        )}
                                      </button>

                                      {/* FASE 12: [Streaming Video] button */}
                                      <button
                                        onClick={() => handleOpenClassTab(cls, 'video')}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors ${
                                          selectedCourseAccess.allowedResources.videos
                                            ? 'bg-stone-900 hover:bg-stone-800 text-amber-400'
                                            : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                                        }`}
                                        title="Reproducir video de cátedra mediante streaming autenticado"
                                      >
                                        <Radio className="w-4 h-4 text-amber-400" />
                                        <span>Streaming Video</span>
                                        {!selectedCourseAccess.allowedResources.videos && (
                                          <Lock className="w-3 h-3 text-red-500" />
                                        )}
                                      </button>

                                      {/* [Actividad] button */}
                                      <button
                                        onClick={() => handleOpenClassTab(cls, 'actividad')}
                                        className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors"
                                      >
                                        <Award className="w-4 h-4 text-indigo-700" />
                                        <span>Actividad</span>
                                      </button>

                                      {/* FASE 09: [Completar Clase] Button */}
                                      {selectedCourseAccess.hasAccess && (
                                        <button
                                          onClick={() => handleToggleClass(cls, selectedCourse, mod)}
                                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                                            isClassCompleted(cls.id)
                                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300'
                                          }`}
                                          title="Registrar avance en la plataforma (Fuente Principal)"
                                        >
                                          <CheckCircle2 className={`w-3.5 h-3.5 ${isClassCompleted(cls.id) ? 'text-emerald-700' : 'text-stone-400'}`} />
                                          <span>{isClassCompleted(cls.id) ? 'Completada ✓' : 'Completar'}</span>
                                        </button>
                                      )}
                                    </div>

                                    {/* Right: Teacher Signature */}
                                    <div className="text-right text-[11px] text-stone-500">
                                      <span>Profesor: <strong>{cls.teacher}</strong></span>
                                    </div>
                                  </div>

                                </div>
                              );
                            })
                          ) : (
                            <p className="text-xs text-stone-400 italic p-4 text-center">
                              No hay clases programadas en este módulo.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Class Detail / Material / Activity Modal */}
      <StudentClassDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        academicClass={modalClass}
        courseTitle={selectedCourse?.title || 'Curso Académico'}
        isAuthorized={selectedCourseAccess.hasAccess}
        denialReason={selectedCourseAccess.reason}
        enrollmentStatus={selectedCourseEnrollment?.status}
        allowedResources={selectedCourseAccess.allowedResources}
        studentId={selectedStudentId}
        studentName={currentStudent.displayName}
        studentEmail={currentStudent.email}
        initialTab={modalInitialTab}
        isClassCompleted={modalClass ? isClassCompleted(modalClass.id) : false}
        onToggleComplete={(classId) => {
          if (modalClass && selectedCourse) {
            const mod = selectedCourse.modules.find(m => m.classes.some(c => c.id === classId)) || selectedCourse.modules[0];
            handleToggleClass(modalClass, selectedCourse, mod);
          }
        }}
        onRenewPayment={() => {
          setIsModalOpen(false);
          if (selectedCourse) {
            handleOpenRenewModal(selectedCourse);
          }
        }}
      />

      {/* Payment Checkout & Webhook Pipeline Modal (FASE 11) */}
      <StudentPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        course={paymentModalCourse}
        studentId={selectedStudentId}
        studentName={currentStudent.displayName}
        studentEmail={currentStudent.email}
        currentEnrollment={studentEnrollments.find(e => e.courseId === paymentModalCourse?.id)}
        onPaymentSuccess={handlePaymentSuccess}
      />

    </div>
  );
};
