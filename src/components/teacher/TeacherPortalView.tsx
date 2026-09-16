import React, { useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { 
  AcademicCourse, 
  AcademicModule, 
  AcademicClass, 
  StudentEnrollment,
  ActiveNavRoute 
} from '../../types';
import { 
  INITIAL_ADMIN_ENROLLMENTS, 
  INITIAL_ADMIN_STUDENTS,
  INITIAL_ADMIN_TEACHERS,
  AdminStudent 
} from '../../data/adminManagementData';
import { TeacherAttendanceModal } from './TeacherAttendanceModal';
import { TeacherEvaluationModal, StudentEvaluationRecord } from './TeacherEvaluationModal';
import { TeacherScheduleClassModal } from './TeacherScheduleClassModal';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Video, 
  FolderPlus, 
  Award, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Plus, 
  Layers, 
  Music, 
  ChevronRight, 
  ChevronDown, 
  Check, 
  FileText, 
  Search,
  UserCheck,
  Edit3,
  Link2,
  Loader2
} from 'lucide-react';

interface TeacherPortalViewProps {
  onNavigate?: (route: ActiveNavRoute) => void;
}

export type TeacherTab = 
  | 'cursos'
  | 'alumnos'
  | 'clases'
  | 'evaluaciones';

export const TeacherPortalView: React.FC<TeacherPortalViewProps> = ({ onNavigate }) => {
  const { currentUser, userProfile } = useAuth();

  // Load real-time courses from Firestore as single source of truth
  const [courses, setCourses] = useState<AcademicCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    setLoadingCourses(true);
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
        setLoadingCourses(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        setLoadingCourses(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Real-time enrollments from Firestore
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  useEffect(() => {
    const path = 'enrollments';
    const col = collection(db, path);
    const unsubscribe = onSnapshot(
      col,
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
  }, []);

  const [students] = useState<AdminStudent[]>(INITIAL_ADMIN_STUDENTS);

  // Current Teacher Selector (allows verifying strict authorization across faculty members)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('teacher-carlos');
  const [activeTab, setActiveTab] = useState<TeacherTab>('cursos');

  // Selected Course for filtered views
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<AcademicClass | null>(null);

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceClass, setAttendanceClass] = useState<AcademicClass | null>(null);

  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [evalClass, setEvalClass] = useState<AcademicClass | null>(null);

  // Real-time Evaluations from Firestore
  const [evaluations, setEvaluations] = useState<StudentEvaluationRecord[]>([]);

  useEffect(() => {
    const path = 'evaluations';
    const col = collection(db, path);
    const unsubscribe = onSnapshot(
      col,
      async (snapshot) => {
        if (!snapshot.empty) {
          const list: StudentEvaluationRecord[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              studentId: data.studentId || '',
              studentName: data.studentName || '',
              classId: data.classId || '',
              classTitle: data.classTitle || '',
              date: data.date || '',
              scoreTechnique: typeof data.scoreTechnique === 'number' ? data.scoreTechnique : 80,
              scoreRhythm: typeof data.scoreRhythm === 'number' ? data.scoreRhythm : 80,
              scoreMusicality: typeof data.scoreMusicality === 'number' ? data.scoreMusicality : 80,
              finalGrade: typeof data.finalGrade === 'number' ? data.finalGrade : 80,
              feedback: data.feedback || '',
              status: data.status || 'aprobado'
            } as StudentEvaluationRecord);
          });
          setEvaluations(list);
        } else {
          // Initialize sample institutional evaluation
          const initialRecord: StudentEvaluationRecord = {
            id: 'eval-init-1',
            studentId: 'student-mario',
            studentName: 'Mario Barillas',
            classId: 'class-p-101',
            classTitle: 'Mecanismo de Mano, Ejercicios Hanon y Escala de Do Mayor',
            date: '2026-09-08',
            scoreTechnique: 88,
            scoreRhythm: 85,
            scoreMusicality: 90,
            finalGrade: 88,
            feedback: 'Excelente relajación muscular en brazos. Mantener la altura uniforme de dedos en la escala.',
            status: 'aprobado'
          };
          try {
            await setDoc(doc(db, 'evaluations', initialRecord.id), initialRecord);
          } catch (e) {
            setEvaluations([initialRecord]);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return () => unsubscribe();
  }, []);

  // Current active teacher
  const currentTeacher = useMemo(() => {
    return INITIAL_ADMIN_TEACHERS.find(t => t.uid === selectedTeacherId) || INITIAL_ADMIN_TEACHERS[0];
  }, [selectedTeacherId]);

  // STRICT AUTHORIZATION GUARD:
  // The teacher can ONLY view and manage courses assigned to them!
  // "No permitas que el profesor acceda a cursos ajenos."
  const authorizedCourses = useMemo(() => {
    return courses.filter(c => 
      c.teacherId === currentTeacher.uid || 
      c.teacherName.toLowerCase().includes(currentTeacher.displayName.toLowerCase().replace('prof. ', ''))
    );
  }, [courses, currentTeacher]);

  // Set initial selected course if not set or if current selected doesn't belong to teacher
  const activeCourse = useMemo(() => {
    if (selectedCourseId) {
      const found = authorizedCourses.find(c => c.id === selectedCourseId);
      if (found) return found;
    }
    return authorizedCourses[0] || null;
  }, [authorizedCourses, selectedCourseId]);

  // Students enrolled in ANY of this teacher's authorized courses
  const assignedStudents = useMemo(() => {
    const authorizedCourseIds = new Set(authorizedCourses.map(c => c.id));
    const activeStudentIds = new Set(
      enrollments
        .filter(e => authorizedCourseIds.has(e.courseId) && e.status === 'active')
        .map(e => e.studentId)
    );
    return students.filter(s => activeStudentIds.has(s.uid));
  }, [authorizedCourses, enrollments, students]);

  // Students enrolled in the CURRENT active course
  const activeCourseStudents = useMemo(() => {
    if (!activeCourse) return [];
    const courseStudentIds = new Set(
      enrollments
        .filter(e => e.courseId === activeCourse.id && e.status === 'active')
        .map(e => e.studentId)
    );
    return students.filter(s => courseStudentIds.has(s.uid));
  }, [activeCourse, enrollments, students]);

  // Save new or updated class
  const handleSaveClass = async (courseId: string, moduleId: string, classData: AcademicClass) => {
    // Authorization check
    if (!authorizedCourses.some(c => c.id === courseId)) {
      alert('Error de Seguridad: No tienes autorización para modificar un curso ajeno.');
      return;
    }

    const targetCourse = courses.find(c => c.id === courseId);
    if (!targetCourse) return;

    const updatedModules = (targetCourse.modules || []).map(m => {
      if (m.id !== moduleId) return m;
      const existingClassIndex = (m.classes || []).findIndex(cl => cl.id === classData.id);
      let updatedClasses = [...(m.classes || [])];
      if (existingClassIndex >= 0) {
        updatedClasses[existingClassIndex] = classData;
      } else {
        updatedClasses.push(classData);
      }
      return { ...m, classes: updatedClasses };
    });

    try {
      await updateDoc(doc(db, 'courses', courseId), {
        modules: updatedModules
      });
      setIsScheduleModalOpen(false);
      setEditingClass(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `courses/${courseId}`);
    }
  };

  const handleOpenScheduleModal = (cls?: AcademicClass) => {
    setEditingClass(cls || null);
    setIsScheduleModalOpen(true);
  };

  const handleOpenAttendance = (cls: AcademicClass) => {
    setAttendanceClass(cls);
    setIsAttendanceModalOpen(true);
  };

  const handleOpenEvaluation = (cls: AcademicClass) => {
    setEvalClass(cls);
    setIsEvalModalOpen(true);
  };

  const handleSaveEvaluation = async (record: StudentEvaluationRecord) => {
    try {
      await setDoc(doc(db, 'evaluations', record.id), record);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `evaluations/${record.id}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Teacher Top Governance Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src="/logo-amj.png"
              alt="Academia Musical Judá"
              className="w-14 h-14 object-contain rounded-xl shadow-xs shrink-0 mt-1"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Portal Docente Institucional
                </span>
                <span className="text-stone-400 text-xs font-serif italic">
                  Cátedra Autorizada
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {currentTeacher.displayName}
              </h1>

              <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
                Especialidad: <strong className="text-emerald-400">{currentTeacher.instrument}</strong>. Gestión de cátedras autorizadas, programación de Google Meet, sincronización con Google Drive, tareas en Classroom, asistencia y evaluación.
              </p>
            </div>
          </div>

          {/* Teacher Selector Simulator for RBAC testing */}
          <div className="bg-stone-800/90 border border-stone-700/80 rounded-2xl p-4 shrink-0 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Docente Titular Activo:</span>
              </span>
            </div>

            <select
              value={selectedTeacherId}
              onChange={(e) => {
                setSelectedTeacherId(e.target.value);
                setSelectedCourseId(null);
              }}
              className="bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-200 focus:border-emerald-400 focus:outline-none"
            >
              {INITIAL_ADMIN_TEACHERS.map(t => (
                <option key={t.uid} value={t.uid}>
                  {t.displayName} ({t.instrument})
                </option>
              ))}
            </select>

            <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1">
              <span>Cursos Bajo su Tutoría:</span>
              <strong className="text-emerald-400 font-mono">{authorizedCourses.length}</strong>
            </div>
          </div>
        </div>

        {/* Global Google Workspace Satellite Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-stone-800 text-xs">
          <div className="p-3 bg-stone-800/50 rounded-xl border border-stone-700/40 flex items-center justify-between">
            <span className="flex items-center gap-2 text-stone-300 font-semibold">
              <Video className="w-4 h-4 text-emerald-400" />
              <span>Google Meet</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Generador Activo
            </span>
          </div>

          <div className="p-3 bg-stone-800/50 rounded-xl border border-stone-700/40 flex items-center justify-between">
            <span className="flex items-center gap-2 text-stone-300 font-semibold">
              <FolderPlus className="w-4 h-4 text-sky-400" />
              <span>Google Drive</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              Partituras Urtext
            </span>
          </div>

          <div className="p-3 bg-stone-800/50 rounded-xl border border-stone-700/40 flex items-center justify-between">
            <span className="flex items-center gap-2 text-stone-300 font-semibold">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Google Classroom</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Tareas & Evaluaciones
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('cursos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'cursos'
                ? 'bg-stone-900 text-amber-400 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Mis Cursos ({authorizedCourses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clases')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'clases'
                ? 'bg-stone-900 text-amber-400 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Administrar Clases</span>
          </button>

          <button
            onClick={() => setActiveTab('alumnos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'alumnos'
                ? 'bg-stone-900 text-amber-400 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Alumnos Asignados ({assignedStudents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('evaluaciones')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'evaluaciones'
                ? 'bg-stone-900 text-amber-400 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Evaluaciones ({evaluations.length})</span>
          </button>
        </div>

        <button
          onClick={() => handleOpenScheduleModal()}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Programar Clase Virtual + Google</span>
        </button>
      </div>

      {/* SUB-VIEW 1: MIS CURSOS ASIGNADOS */}
      {activeTab === 'cursos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              <span>Cursos Bajo Mi Tutoría Pedagógica</span>
            </h2>
            <span className="text-xs text-stone-500 font-semibold">
              {authorizedCourses.length} cursos asignados
            </span>
          </div>

          {loadingCourses ? (
            <div className="py-12 bg-white rounded-3xl border border-stone-200 flex flex-col items-center justify-center text-center space-y-2">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
              <p className="text-xs text-stone-500 font-medium">Sincronizando cátedras asignadas en tiempo real desde Firestore...</p>
            </div>
          ) : authorizedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {authorizedCourses.map(course => {
                const totalClasses = course.modules.reduce((acc, m) => acc + (m.classes?.length || 0), 0);
                const studentsCount = enrollments.filter(e => e.courseId === course.id && e.status === 'active').length;

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4 hover:border-emerald-400 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {course.instrument}
                        </span>
                        <span className="text-xs text-stone-500 font-semibold flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-stone-400" />
                          <span>{studentsCount} Alumnos Matriculados</span>
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-stone-900">
                        {course.title}
                      </h3>

                      <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                        {course.description}
                      </p>

                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-xs text-stone-600 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-stone-400">Horario oficial:</span>
                          <span className="font-semibold text-stone-800">{course.schedule}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">Estructura curricular:</span>
                          <span className="font-semibold text-stone-800">
                            {course.modules.length} Módulos • {totalClasses} Clases
                          </span>
                        </div>
                        {course.meetUrl && (
                          <div className="flex justify-between items-center pt-1 border-t border-stone-200">
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <Video className="w-3.5 h-3.5" />
                              <span>Meet Vinculado:</span>
                            </span>
                            <span className="font-mono text-[11px] text-emerald-900 font-bold truncate max-w-[140px]">
                              {course.meetCode || 'jud-live-room'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => {
                          setSelectedCourseId(course.id);
                          setActiveTab('clases');
                        }}
                        className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Layers className="w-4 h-4" />
                        <span>Ver Clases & Material</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedCourseId(course.id);
                          setActiveTab('alumnos');
                        }}
                        className="py-2.5 px-3.5 border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        <span>Ver Alumnos</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center space-y-3">
              <Lock className="w-10 h-10 text-amber-700 mx-auto" />
              <h3 className="font-serif text-base font-bold text-amber-950">
                No tienes cursos asignados en esta especialidad
              </h3>
              <p className="text-xs text-amber-900/80 max-w-md mx-auto">
                Selecciona otro docente en la barra superior para auditar las cátedras autorizadas.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: ADMINISTRAR CLASES AUTORIZADAS */}
      {activeTab === 'clases' && (
        <div className="space-y-6">
          
          {/* Active Course Selector Bar */}
          <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-700">Cátedra Activa:</span>
              <select
                value={activeCourse?.id || ''}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-900 focus:border-emerald-500 focus:outline-none"
              >
                {authorizedCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleOpenScheduleModal()}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Clase para este Curso</span>
            </button>
          </div>

          {activeCourse ? (
            <div className="space-y-6">
              {activeCourse.modules.map((mod, modIdx) => (
                <div key={mod.id} className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Módulo {modIdx + 1}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-stone-900 mt-1">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-stone-500">{mod.description}</p>
                    </div>

                    <span className="text-xs font-semibold text-stone-400">
                      {mod.classes?.length || 0} Clases
                    </span>
                  </div>

                  {/* List of classes in module */}
                  <div className="space-y-4">
                    {mod.classes && mod.classes.length > 0 ? (
                      mod.classes.map((cls, classIdx) => (
                        <div 
                          key={cls.id}
                          className="p-5 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-3 hover:border-stone-300 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 uppercase">
                                  Clase {classIdx + 1}
                                </span>
                                <span className="text-[10px] font-bold bg-white text-stone-800 border border-stone-200 px-2 py-0.5 rounded-md">
                                  {cls.modality}
                                </span>
                                <span className="text-xs text-stone-500">
                                  {cls.date} • {cls.duration}
                                </span>
                              </div>
                              <h4 className="font-serif font-bold text-stone-900 text-base">
                                {cls.title}
                              </h4>
                            </div>

                            <button
                              onClick={() => handleOpenScheduleModal(cls)}
                              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-white rounded-xl transition-colors self-start sm:self-auto"
                              title="Editar clase"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-xs text-stone-600">
                            {cls.description}
                          </p>

                          {/* RELATIONAL SATELLITE GOOGLE STATUS BAR */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-stone-200 text-xs">
                            
                            {/* Relación 1: Meet */}
                            <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between">
                              <div className="truncate pr-2">
                                <span className="text-[10px] text-stone-400 uppercase font-bold block">Google Meet</span>
                                {cls.meetUrl ? (
                                  <a 
                                    href={cls.meetUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="font-mono text-emerald-700 font-bold truncate block hover:underline"
                                  >
                                    {cls.meetCode || 'Sesión Activa'}
                                  </a>
                                ) : (
                                  <span className="text-stone-400 italic">No requerida</span>
                                )}
                              </div>
                              {cls.meetUrl && (
                                <a
                                  href={cls.meetUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shrink-0"
                                  title="Abrir sala de Meet"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>

                            {/* Relación 2: Drive */}
                            <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between">
                              <div className="truncate pr-2">
                                <span className="text-[10px] text-stone-400 uppercase font-bold block">Google Drive</span>
                                <span className="font-semibold text-stone-800 truncate block">
                                  {cls.documents?.[0]?.title || 'Material de sesión'}
                                </span>
                              </div>
                              {cls.driveUrl && (
                                <a
                                  href={cls.driveUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg transition-colors shrink-0"
                                  title="Abrir carpeta en Drive"
                                >
                                  <FolderPlus className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>

                            {/* Relación 3: Classroom */}
                            <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between">
                              <div className="truncate pr-2">
                                <span className="text-[10px] text-stone-400 uppercase font-bold block">Classroom Tarea</span>
                                <span className="font-semibold text-stone-800 truncate block">
                                  {cls.classroomTask ? 'Consigna Registrada' : 'Sin tarea'}
                                </span>
                              </div>
                              {cls.classroomUrl && (
                                <a
                                  href={cls.classroomUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors shrink-0"
                                  title="Abrir en Classroom"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>

                          </div>

                          {/* ACTION BUTTONS: ATTENDANCE & EVALUATION */}
                          <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenAttendance(cls)}
                                className="px-3 py-1.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-800 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                              >
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Registrar Asistencia</span>
                              </button>

                              <button
                                onClick={() => handleOpenEvaluation(cls)}
                                className="px-3 py-1.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-800 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                              >
                                <Award className="w-3.5 h-3.5 text-amber-600" />
                                <span>Evaluar Alumno</span>
                              </button>
                            </div>

                            {cls.meetUrl && (
                              <a
                                href={cls.meetUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Iniciar Google Meet</span>
                                <ExternalLink className="w-3 h-3 text-emerald-200" />
                              </a>
                            )}
                          </div>

                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-stone-400 italic p-3">
                        No hay clases registradas en este módulo.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500">Selecciona un curso para ver sus clases.</p>
          )}

        </div>
      )}

      {/* SUB-VIEW 3: ALUMNOS ASIGNADOS */}
      {activeTab === 'alumnos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                <span>Alumnos Matriculados en Mis Cátedras</span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Padrón oficial de estudiantes activos en los cursos del {currentTeacher.displayName}.
              </p>
            </div>
            <span className="text-xs font-semibold text-stone-500">
              {assignedStudents.length} estudiantes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedStudents.map((student) => {
              // Find the student's enrollments in this teacher's courses
              const studentCourseEnrollments = enrollments.filter(e => 
                e.studentId === student.uid && 
                authorizedCourses.some(c => c.id === e.courseId)
              );

              return (
                <div 
                  key={student.uid}
                  className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-3 hover:border-stone-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-stone-900 text-base">
                        {student.displayName}
                      </h4>
                      <span className="text-xs text-stone-500">
                        {student.email} • {student.phone}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Activo
                    </span>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Instrumento Principal:</span>
                      <span className="font-semibold text-stone-800">{student.primaryInstrument}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Tasa de Asistencia:</span>
                      <span className="font-mono text-emerald-700 font-bold">{student.attendanceRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Cursos con este docente:</span>
                      <span className="font-semibold text-stone-800">
                        {studentCourseEnrollments.map(e => {
                          const c = authorizedCourses.find(ac => ac.id === e.courseId);
                          return c ? c.instrument : '';
                        }).join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        const firstClass = authorizedCourses[0]?.modules[0]?.classes?.[0] || null;
                        setEvalClass(firstClass);
                        setIsEvalModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Calificar Desempeño</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: EVALUACIONES */}
      {activeTab === 'evaluaciones' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span>Expediente de Calificaciones & Rúbricas</span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Registro de notas por técnica, precisión rítmica y expresividad musical.
              </p>
            </div>

            <button
              onClick={() => {
                const firstClass = authorizedCourses[0]?.modules[0]?.classes?.[0] || null;
                setEvalClass(firstClass);
                setIsEvalModalOpen(true);
              }}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Evaluación</span>
            </button>
          </div>

          <div className="space-y-3">
            {evaluations.map((ev) => (
              <div 
                key={ev.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-stone-900 text-sm">
                      {ev.studentName}
                    </span>
                    <span className="text-[10px] text-stone-400">• {ev.date}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                      {ev.status}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 font-medium">
                    Clase: {ev.classTitle}
                  </p>

                  <p className="text-xs text-stone-500 italic bg-stone-50 p-2.5 rounded-xl border border-stone-100 max-w-2xl">
                    "{ev.feedback}"
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0 bg-stone-50 p-3 rounded-2xl border border-stone-200 text-center">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase block">Técnica</span>
                    <strong className="font-mono text-xs text-stone-800">{ev.scoreTechnique}</strong>
                  </div>
                  <div className="h-6 w-px bg-stone-200"></div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase block">Ritmo</span>
                    <strong className="font-mono text-xs text-stone-800">{ev.scoreRhythm}</strong>
                  </div>
                  <div className="h-6 w-px bg-stone-200"></div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase block">Expresión</span>
                    <strong className="font-mono text-xs text-stone-800">{ev.scoreMusicality}</strong>
                  </div>
                  <div className="h-6 w-px bg-stone-200"></div>
                  <div>
                    <span className="text-[10px] text-amber-800 uppercase block font-bold">Final</span>
                    <strong className="font-mono text-sm text-amber-900 font-bold">{ev.finalGrade} pts</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Schedule Virtual Class + Google Relations */}
      <TeacherScheduleClassModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingClass(null);
        }}
        courses={authorizedCourses}
        editingClass={editingClass}
        onSaveClass={handleSaveClass}
      />

      {/* MODAL 2: Take Attendance */}
      <TeacherAttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => {
          setIsAttendanceModalOpen(false);
          setAttendanceClass(null);
        }}
        academicClass={attendanceClass}
        courseTitle={activeCourse?.title || 'Cátedra'}
        enrolledStudents={activeCourseStudents.length > 0 ? activeCourseStudents : assignedStudents}
        onSaveAttendance={async (classId, records) => {
          try {
            await setDoc(doc(db, 'attendance', `att_${classId}`), {
              id: `att_${classId}`,
              classId,
              courseTitle: activeCourse?.title || 'Cátedra',
              date: attendanceClass?.date || new Date().toISOString().split('T')[0],
              records,
              updatedAt: new Date().toISOString()
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `attendance/att_${classId}`);
          }
        }}
      />

      {/* MODAL 3: Student Musical Evaluation */}
      <TeacherEvaluationModal
        isOpen={isEvalModalOpen}
        onClose={() => {
          setIsEvalModalOpen(false);
          setEvalClass(null);
        }}
        academicClass={evalClass || authorizedCourses[0]?.modules[0]?.classes?.[0] || null}
        enrolledStudents={assignedStudents}
        onSaveEvaluation={handleSaveEvaluation}
      />

    </div>
  );
};
