import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { 
  AcademicCourse, 
  AcademicModule, 
  AcademicClass, 
  StudentEnrollment,
  ClassModality
} from '../../types';
import { 
  INITIAL_ACADEMY_COURSES, 
  INITIAL_DEMO_ENROLLMENTS 
} from '../../data/academyHierarchyData';
import { ClassDetailModal } from './ClassDetailModal';
import { ClassFormModal } from './ClassFormModal';
import { StitchCourseShowcase } from '../stitch/StitchCourseShowcase';
import { StitchLessonPlayerModal } from '../stitch/StitchLessonPlayerModal';
import { StudentPaymentModal } from '../student/StudentPaymentModal';
import { 
  Layers, 
  BookOpen, 
  FolderPlus, 
  Plus, 
  Video, 
  FolderOpen, 
  Calendar, 
  Clock, 
  User, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown, 
  Music, 
  Award, 
  FileText, 
  Play, 
  Sparkles,
  Info,
  Check,
  Search,
  Filter,
  Trash2,
  Edit3,
  RefreshCw,
  Radio,
  AlertCircle
} from 'lucide-react';

export const CoursesAcademyView: React.FC = () => {
  const { userProfile, currentUser, loading: authLoading } = useAuth();
  const role = userProfile?.role || 'student';
  const isFacultyOrAdmin = role === 'admin' || role === 'superadmin' || role === 'teacher';

  // Real-time Firestore courses state
  const [courses, setCourses] = useState<AcademicCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState<string | null>(null);

  // Real-time Firestore enrollments state
  const [enrollments, setEnrollments] = useState<Record<string, StudentEnrollment>>({});

  const [selectedCourseId, setSelectedCourseId] = useState<string>('course-piano');
  const [selectedClass, setSelectedClass] = useState<AcademicClass | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-piano-1': true,
    'mod-piano-2': true,
    'mod-vocal-1': true,
    'mod-guitar-1': true,
  });

  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Class Form Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<AcademicClass | null>(null);
  const [targetModuleForNewClass, setTargetModuleForNewClass] = useState<AcademicModule | null>(null);

  // New Module prompt state
  const [showNewModuleInput, setShowNewModuleInput] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  // Module Edit State
  const [editingModule, setEditingModule] = useState<AcademicModule | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState('');
  const [editModuleDesc, setEditModuleDesc] = useState('');

  // Stitch UI Experience States
  const [viewMode, setViewMode] = useState<'stitch' | 'admin'>('stitch');
  const [isStitchPlayerOpen, setIsStitchPlayerOpen] = useState(false);
  const [selectedStitchClass, setSelectedStitchClass] = useState<{ cls: AcademicClass; mod: AcademicModule } | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Real-time Firestore onSnapshot for enrollments collection
  useEffect(() => {
    const path = 'enrollments';
    const currentUid = currentUser?.uid || 'student-mario';
    const q = isFacultyOrAdmin
      ? collection(db, path)
      : query(collection(db, path), where('studentId', '==', currentUid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const enrMap: Record<string, StudentEnrollment> = {};
        snapshot.forEach((d) => {
          const data = d.data() as StudentEnrollment;
          // Index enrollments for the current student, or all if faculty/admin
          if (isFacultyOrAdmin || data.studentId === currentUid || data.studentId === 'student-mario') {
            if (!enrMap[data.courseId] || data.status === 'active') {
              enrMap[data.courseId] = { ...data, id: d.id };
            }
          }
        });
        setEnrollments(enrMap);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return () => unsubscribe();
  }, [currentUser, isFacultyOrAdmin]);

  // Real-time Firestore onSnapshot Listener for courses collection
  useEffect(() => {
    setLoadingCourses(true);
    setCourseError(null);
    const pathForOnSnapshot = 'courses';
    const coursesCol = collection(db, pathForOnSnapshot);

    const unsubscribe = onSnapshot(
      coursesCol,
      (snapshot) => {
        setIsSyncing(true);
        if (!snapshot.empty) {
          const fetchedCourses: AcademicCourse[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            fetchedCourses.push({
              id: docSnap.id,
              title: data.title || 'Curso Sin Título',
              description: data.description || '',
              modality: data.modality || 'live_virtual',
              instrument: data.instrument || 'Instrumento',
              teacherId: data.teacherId || '',
              teacherName: data.teacherName || 'Docente Judá',
              schedule: data.schedule || '',
              priceMonthly: typeof data.priceMonthly === 'number' ? data.priceMonthly : 0,
              status: data.status || 'active',
              meetUrl: data.meetUrl,
              meetCode: data.meetCode,
              driveFolderId: data.driveFolderId,
              classroomCourseId: data.classroomCourseId,
              modules: data.modules || [],
            } as AcademicCourse);
          });

          setCourses(fetchedCourses);
          setCourseError(null);
          setLoadingCourses(false);
          setIsSyncing(false);
        } else {
          // Firestore collection is empty - NO SILENT MOCK FALLBACK
          setCourses([]);
          setCourseError(null);
          setLoadingCourses(false);
          setIsSyncing(false);
        }
      },
      (error) => {
        setIsSyncing(false);
        setLoadingCourses(false);
        setCourses([]);
        setCourseError(`Error al consultar Firestore (${error.code || 'permission-denied'}): ${error.message}`);
        handleFirestoreError(error, OperationType.GET, pathForOnSnapshot);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handler for administrative explicit seed
  const handleExplicitSeedCourses = async () => {
    if (authLoading) {
      alert('La autenticación de Firebase Auth se está cargando. Por favor reintenta en un momento.');
      return;
    }
    if (!currentUser) {
      alert('Debes estar autenticado para sembrar los cursos iniciales en Firestore.');
      return;
    }
    if (!isFacultyOrAdmin) {
      alert('No tienes permisos de administración para escribir en Firestore.');
      return;
    }

    setIsSeeding(true);
    setCourseError(null);
    setSeedSuccessMsg(null);

    try {
      for (const initialCourse of INITIAL_ACADEMY_COURSES) {
        await setDoc(doc(db, 'courses', initialCourse.id), initialCourse);
      }
      setSeedSuccessMsg('Se han creado y sembrado exitosamente los 4 cursos iniciales en la colección /courses de Firestore.');
    } catch (err: any) {
      console.error('Error al sembrar cursos:', err);
      setCourseError(`Error al escribir en Firestore: ${err.message || err}`);
      handleFirestoreError(err, OperationType.CREATE, 'courses/seed');
    } finally {
      setIsSeeding(false);
    }
  };

  // Ensure an active course is selected once courses are loaded from Firestore
  useEffect(() => {
    if (courses.length > 0 && !courses.some(c => c.id === selectedCourseId)) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0] || null;

  const isEnrolledInActiveCourse = 
    isFacultyOrAdmin || 
    (activeCourse && enrollments[activeCourse.id]?.status === 'active');

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleToggleEnrollment = async (courseId: string) => {
    if (!isFacultyOrAdmin) {
      // Direct Firestore write forbidden for students: initiate payment checkout flow
      const course = courses.find(c => c.id === courseId);
      if (course) {
        handleEnrollCourse(course);
      }
      return;
    }

    const studentUid = currentUser?.uid || 'student-mario';
    const current = enrollments[courseId];

    if (current && current.status === 'active') {
      try {
        await updateDoc(doc(db, 'enrollments', current.id), {
          status: 'suspended',
          lastValidatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `enrollments/${current.id}`);
      }
    } else if (current) {
      try {
        await updateDoc(doc(db, 'enrollments', current.id), {
          status: 'active',
          lastValidatedAt: new Date().toISOString(),
          approvedBy: 'Dirección Académica'
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `enrollments/${current.id}`);
      }
    } else {
      const course = courses.find(c => c.id === courseId);
      const newEnrollment: StudentEnrollment = {
        id: `enr-${Date.now()}`,
        studentId: studentUid,
        studentName: userProfile?.displayName || currentUser?.displayName || 'Mario Barillas',
        studentEmail: currentUser?.email || 'mariobarillas24@gmail.com',
        courseId,
        courseTitle: course?.title || 'Curso Académico',
        startDate: new Date().toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 365 * 86400000).toISOString(),
        status: 'active',
        modality: (course?.modality as any) || 'hybrid',
        accessType: 'full_access',
        paymentMethod: 'stripe',
        enrolledAt: new Date().toISOString(),
        approvedBy: 'Dirección Académica'
      };

      try {
        await setDoc(doc(db, 'enrollments', newEnrollment.id), newEnrollment);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `enrollments/${newEnrollment.id}`);
      }
    }
  };

  const handleCreateModule = async () => {
    if (!newModuleTitle.trim() || !activeCourse) return;

    if (authLoading) {
      alert('La autenticación se está verificando. Intenta en un momento.');
      return;
    }
    if (!currentUser || !isFacultyOrAdmin) {
      alert('No tienes permisos administrativos para crear módulos.');
      return;
    }

    const docRef = doc(db, 'courses', activeCourse.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      alert(`Error: El curso "${activeCourse.title}" (ID: ${activeCourse.id}) no existe en Firestore. Créalo primero en el sistema de Cursos.`);
      return;
    }

    const newModule: AcademicModule = {
      id: 'mod-' + Date.now(),
      courseId: activeCourse.id,
      title: newModuleTitle.trim(),
      description: 'Módulo académico creado por el cuerpo docente.',
      order: (activeCourse.modules?.length || 0) + 1,
      classes: []
    };

    const updatedModules = [...(activeCourse.modules || []), newModule];

    try {
      await updateDoc(docRef, {
        modules: updatedModules
      });
      setExpandedModules(prev => ({ ...prev, [newModule.id]: true }));
      setNewModuleTitle('');
      setShowNewModuleInput(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `courses/${activeCourse.id}`);
    }
  };

  const handleOpenEditModule = (mod: AcademicModule, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingModule(mod);
    setEditModuleTitle(mod.title);
    setEditModuleDesc(mod.description || '');
  };

  const handleSaveEditModule = async () => {
    if (!editingModule || !activeCourse || !editModuleTitle.trim()) return;

    if (authLoading) {
      alert('Verificando autenticación...');
      return;
    }
    if (!currentUser || !isFacultyOrAdmin) {
      alert('No tienes permisos para editar módulos.');
      return;
    }

    const docRef = doc(db, 'courses', activeCourse.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      alert(`Error: El curso "${activeCourse.title}" (ID: ${activeCourse.id}) no existe en Firestore.`);
      return;
    }

    const updatedModules = (activeCourse.modules || []).map(m => {
      if (m.id !== editingModule.id) return m;
      return {
        ...m,
        title: editModuleTitle.trim(),
        description: editModuleDesc.trim()
      };
    });

    try {
      await updateDoc(docRef, {
        modules: updatedModules
      });
      setEditingModule(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `courses/${activeCourse.id}`);
    }
  };

  const handleDeleteModule = async (moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeCourse) return;
    if (authLoading || !currentUser || !isFacultyOrAdmin) {
      alert('No tienes permisos para eliminar módulos.');
      return;
    }

    if (!confirm('¿Eliminar este módulo académico y todas sus clases contenidas?')) return;

    const docRef = doc(db, 'courses', activeCourse.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      alert(`Error: El curso no existe en Firestore.`);
      return;
    }

    const updatedModules = (activeCourse.modules || []).filter(m => m.id !== moduleId);

    try {
      await updateDoc(docRef, {
        modules: updatedModules
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `courses/${activeCourse.id}`);
    }
  };

  const handleSaveClass = async (savedClass: AcademicClass) => {
    if (!activeCourse) return;

    if (authLoading || !currentUser || !isFacultyOrAdmin) {
      alert('No tienes permisos para guardar clases.');
      return;
    }

    const docRef = doc(db, 'courses', activeCourse.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      alert(`Error: El curso "${activeCourse.title}" (ID: ${activeCourse.id}) no existe en Firestore. Créalo primero.`);
      return;
    }

    const updatedModules = (activeCourse.modules || []).map(mod => {
      if (mod.id !== savedClass.moduleId) return mod;

      const existingClasses = mod.classes || [];
      const index = existingClasses.findIndex(c => c.id === savedClass.id);

      let updatedClasses: AcademicClass[];
      if (index >= 0) {
        updatedClasses = [...existingClasses];
        updatedClasses[index] = savedClass;
      } else {
        updatedClasses = [...existingClasses, savedClass];
      }

      return {
        ...mod,
        classes: updatedClasses
      };
    });

    try {
      await updateDoc(docRef, {
        modules: updatedModules
      });
      setIsFormModalOpen(false);
      setEditingClass(null);
      setTargetModuleForNewClass(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `courses/${activeCourse.id}`);
    }
  };

  const handleDeleteClass = async (courseId: string, moduleId: string, classId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (authLoading || !currentUser || !isFacultyOrAdmin) {
      alert('No tienes permisos para eliminar clases.');
      return;
    }
    if (!confirm('¿Estás seguro de eliminar esta clase de la estructura académica?')) return;

    const docRef = doc(db, 'courses', courseId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      alert('Error: El curso no existe en Firestore.');
      return;
    }

    const courseToUpdate = courses.find(c => c.id === courseId);
    if (!courseToUpdate) return;

    const updatedModules = (courseToUpdate.modules || []).map(mod => {
      if (mod.id !== moduleId) return mod;
      return {
        ...mod,
        classes: (mod.classes || []).filter(c => c.id !== classId)
      };
    });

    try {
      await updateDoc(docRef, {
        modules: updatedModules
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `courses/${courseId}`);
    }
  };

  const modalityLabels: Record<ClassModality, { label: string; color: string }> = {
    virtual_en_vivo: { label: 'Virtual en Vivo', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    grabada: { label: 'Grabada', color: 'bg-sky-50 text-sky-800 border-sky-200' },
    presencial: { label: 'Presencial', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    hibrida: { label: 'Híbrida', color: 'bg-purple-50 text-purple-800 border-purple-200' }
  };

  const handleSelectStitchClass = (cls: AcademicClass, mod: AcademicModule) => {
    setSelectedStitchClass({ cls, mod });
    setIsStitchPlayerOpen(true);
  };

  const handleEnrollCourse = (courseToEnroll: AcademicCourse) => {
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      
      {/* Top View Mode Switcher: Stitch Showcase vs Academic Governance */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
          <button
            onClick={() => setViewMode('stitch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'stitch'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Detalle y Matrícula</span>
          </button>

          <button
            onClick={() => setViewMode('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'admin'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-stone-600" />
            <span>Gestor de Estructura & Docencia</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 text-xs text-stone-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Firestore Sincronizado</span>
        </div>
      </div>

      {/* RENDER STITCH COURSE SHOWCASE VIEW (SCREEN 1) */}
      {viewMode === 'stitch' && activeCourse && (
        <StitchCourseShowcase
          course={activeCourse}
          coursesList={courses}
          onSelectCourse={setSelectedCourseId}
          enrollment={enrollments[activeCourse.id] || null}
          onSelectClass={handleSelectStitchClass}
          onEnroll={handleEnrollCourse}
          onToggleEnrollment={handleToggleEnrollment}
          isFacultyOrAdmin={isFacultyOrAdmin}
          onOpenNewClassForm={(mod) => {
            setTargetModuleForNewClass(mod);
            setEditingClass(null);
            setIsFormModalOpen(true);
          }}
          onOpenNewModule={() => {
            setShowNewModuleInput(true);
            setViewMode('admin');
          }}
        />
      )}

      {/* RENDER ACADEMIC GOVERNANCE VIEW */}
      {viewMode === 'admin' && (
        <>
          {/* Top Banner: FASE 05 Architecture & Central Platform Sovereignty */}
          <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Cursos e Integraciones Académicas</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Estructura Académica & Sistema Central de Clases
          </h1>

          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
            Estructura pedagógica formal: <strong>Academia ➔ Curso ➔ Módulo ➔ Clase</strong>.
            Nuestra plataforma actúa como el <strong>sistema central y soberano</strong>: la autorización académica reside exclusivamente en la matrícula registrada aquí. No se depende de Classroom ni de enlaces externos para validar el acceso de los alumnos.
          </p>
        </div>

        {/* Tree Visual Flow Diagram */}
        <div className="mt-6 pt-6 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-stone-800/50 rounded-2xl border border-stone-700/60">
            <span className="text-[10px] text-amber-400 font-mono font-bold block uppercase">Nivel 1</span>
            <span className="text-xs font-bold text-white">Academia Judá</span>
          </div>
          <div className="p-3 bg-stone-800/50 rounded-2xl border border-stone-700/60">
            <span className="text-[10px] text-amber-400 font-mono font-bold block uppercase">Nivel 2</span>
            <span className="text-xs font-bold text-white">Curso Académico</span>
          </div>
          <div className="p-3 bg-stone-800/50 rounded-2xl border border-stone-700/60">
            <span className="text-[10px] text-amber-400 font-mono font-bold block uppercase">Nivel 3</span>
            <span className="text-xs font-bold text-white">Módulo Pedagógico</span>
          </div>
          <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-400/40">
            <span className="text-[10px] text-amber-300 font-mono font-bold block uppercase">Nivel 4</span>
            <span className="text-xs font-bold text-amber-200">Clase (12 Atributos)</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Course Selection Sidebar + Module/Class Academic Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Courses Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-700" />
                <span>Cursos Disponibles ({courses.length})</span>
              </h2>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold tracking-wide" title="Sincronización en tiempo real vía Firestore onSnapshot">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Firestore En Vivo</span>
              </div>
            </div>

            <p className="text-xs text-stone-500">
              Selecciona un curso para inspeccionar sus módulos, clases y flujo virtual.
            </p>

            {courseError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-red-900">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Error de Lectura de Firestore</span>
                </div>
                <p>{courseError}</p>
              </div>
            )}

            {seedSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sincronización Completada</span>
                </div>
                <p>{seedSuccessMsg}</p>
              </div>
            )}

            {loadingCourses ? (
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-2.5 bg-stone-50/70 rounded-2xl border border-stone-200/80">
                <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
                <p className="text-xs text-stone-500 font-medium">Conectando y sincronizando con Firestore en tiempo real...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-4 bg-stone-50 rounded-2xl border border-stone-200">
                <p className="text-xs text-stone-500 italic">
                  La colección <code className="font-mono font-semibold">/courses</code> de Firestore está actualmente vacía.
                </p>

                {isFacultyOrAdmin && (
                  <div className="space-y-2 pt-2 border-t border-stone-200/60">
                    <p className="text-[11px] font-semibold text-stone-700">
                      Como Administrador, puedes sembrar los cursos iniciales en la base de datos:
                    </p>
                    <button
                      onClick={handleExplicitSeedCourses}
                      disabled={isSeeding}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shadow-xs"
                    >
                      {isSeeding ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Sembrando cursos en Firestore...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Inicializar Cursos Demo en Firestore</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((c) => {
                  const isSelected = c.id === selectedCourseId;
                  const isEnrolled = enrollments[c.id]?.status === 'active';
                  const totalClasses = (c.modules || []).reduce((acc, m) => acc + (m.classes?.length || 0), 0);

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCourseId(c.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-amber-50/70 border-amber-400 shadow-sm'
                          : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                          {c.instrument}
                        </span>

                        {/* Enrollment Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isEnrolled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-500'
                        }`}>
                          {isEnrolled ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                          <span>{isEnrolled ? 'Matriculado' : 'Sin Matrícula'}</span>
                        </span>
                      </div>

                      <h3 className={`font-serif text-sm font-bold leading-snug ${
                        isSelected ? 'text-amber-950' : 'text-stone-900'
                      }`}>
                        {c.title}
                      </h3>

                      <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
                        <span>{c.teacherName}</span>
                        <span>{c.modules?.length || 0} mód. • {totalClasses} clases</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Central Authorization Gatekeeper Testing Box */}
          <div className="bg-stone-900 text-white rounded-3xl p-6 border border-stone-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-serif text-sm font-bold">
                Principio de Soberanía Académica
              </h3>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              "No dependas de Classroom para saber si un alumno está matriculado. La matrícula de nuestra plataforma determina la autorización académica."
            </p>

            <div className="p-3 bg-stone-800 rounded-xl border border-stone-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">Curso Activo:</span>
                <span className="font-bold text-white truncate max-w-[170px]">{activeCourse?.title}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">Estado de Matrícula:</span>
                <span className={`font-bold ${isEnrolledInActiveCourse ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isEnrolledInActiveCourse ? 'Autorizado (Activo)' : 'Bloqueado (No Matriculado)'}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleToggleEnrollment(activeCourse.id)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm ${
                isEnrolledInActiveCourse
                  ? 'bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-700/50'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold'
              }`}
            >
              {isEnrolledInActiveCourse ? (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Simular Desmatriculación (Bloquear)</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Activar Matrícula Oficial en Plataforma</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Column: Active Course Modules & Classes (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Course Details Header */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {activeCourse?.instrument}
                  </span>
                  <span className="text-xs text-stone-500 flex items-center gap-1 font-medium">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    Docente: {activeCourse?.teacherName}
                  </span>
                  <span className="text-xs text-stone-500 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    {activeCourse?.schedule}
                  </span>
                </div>

                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  {activeCourse?.title}
                </h2>
              </div>

              {/* Status & Enrollment Pill */}
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
                  isEnrolledInActiveCourse
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {isEnrolledInActiveCourse ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <ShieldAlert className="w-4 h-4 text-amber-600" />}
                  <span>{isEnrolledInActiveCourse ? 'Acceso Autorizado' : 'Matrícula Requerida'}</span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {activeCourse?.description}
            </p>

            {/* Quick Actions & Modality Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              
              {/* Modality Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold py-1">
                <span className="text-stone-400 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  Modalidad:
                </span>
                {[
                  { id: 'all', label: 'Todas' },
                  { id: 'virtual_en_vivo', label: 'Virtual en Vivo' },
                  { id: 'grabada', label: 'Grabada' },
                  { id: 'presencial', label: 'Presencial' },
                  { id: 'hibrida', label: 'Híbrida' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModalityFilter(m.id)}
                    className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                      modalityFilter === m.id
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Teacher/Admin: Add Module Button */}
              {isFacultyOrAdmin && (
                <button
                  onClick={() => setShowNewModuleInput(true)}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Módulo</span>
                </button>
              )}
            </div>

            {/* New Module Inline Input */}
            {showNewModuleInput && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3 animate-fadeIn">
                <h4 className="text-xs font-bold text-emerald-900">
                  Crear Módulo en {activeCourse.title}
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    placeholder="Ej. Módulo 3: Armadura de Claves y Polifonía a Dos Voces"
                    className="flex-1 px-3 py-2 text-xs border border-emerald-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleCreateModule}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold"
                  >
                    Guardar Módulo
                  </button>
                  <button
                    onClick={() => setShowNewModuleInput(false)}
                    className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modules and Classes List */}
          <div className="space-y-6">
            {(activeCourse.modules || []).map((module, mIndex) => {
              const isExpanded = expandedModules[module.id] ?? true;

              // Filter classes inside this module
              const filteredClasses = (module.classes || []).filter(c => {
                if (modalityFilter !== 'all' && c.modality !== modalityFilter) return false;
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase();
                  return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
                }
                return true;
              });

              return (
                <div key={module.id} className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden transition-all">
                  
                  {/* Module Header */}
                  <div 
                    onClick={() => toggleModuleExpand(module.id)}
                    className="p-5 sm:p-6 bg-stone-50 hover:bg-stone-100/80 cursor-pointer flex items-center justify-between border-b border-stone-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                        {mIndex + 1}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-stone-500">
                          Módulo Académico
                        </span>
                        <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                          {module.title}
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                          {module.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-stone-500 font-medium">
                        {module.classes?.length || 0} clases
                      </span>

                      {/* Add class and module management buttons for teachers/admins */}
                      {isFacultyOrAdmin && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleOpenEditModule(module, e)}
                            className="p-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs transition-colors"
                            title="Editar título y descripción del módulo"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteModule(module.id, e)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs transition-colors"
                            title="Eliminar módulo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTargetModuleForNewClass(module);
                              setEditingClass(null);
                              setIsFormModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Añadir clase a este módulo"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Nueva Clase</span>
                          </button>
                        </div>
                      )}

                      {isExpanded ? <ChevronDown className="w-5 h-5 text-stone-400" /> : <ChevronRight className="w-5 h-5 text-stone-400" />}
                    </div>
                  </div>

                  {/* Classes Inside Module */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 space-y-4">
                      {filteredClasses.length === 0 ? (
                        <div className="p-6 text-center text-xs text-stone-400 italic">
                          No hay clases registradas que coincidan con el filtro seleccionado.
                        </div>
                      ) : (
                        filteredClasses.map((cls, cIndex) => {
                          const badge = modalityLabels[cls.modality] || modalityLabels.virtual_en_vivo;

                          return (
                            <div
                              key={cls.id}
                              onClick={() => setSelectedClass(cls)}
                              className="group p-5 rounded-2xl border border-stone-200 hover:border-amber-400 bg-stone-50/50 hover:bg-amber-50/20 transition-all cursor-pointer space-y-4 shadow-2xs hover:shadow-sm"
                            >
                              
                              {/* Class Title & Modality Row */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[11px] font-mono font-bold text-stone-500">
                                      Clase {mIndex + 1}.{cIndex + 1}
                                    </span>
                                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badge.color}`}>
                                      {badge.label}
                                    </span>
                                    {cls.date && (
                                      <span className="text-xs text-stone-500 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                        {cls.date}
                                      </span>
                                    )}
                                    <span className="text-xs text-stone-500 flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                                      {cls.duration}
                                    </span>
                                  </div>

                                  <h4 className="font-serif text-base font-bold text-stone-900 group-hover:text-amber-950 transition-colors">
                                    {cls.title}
                                  </h4>
                                </div>

                                {/* Quick Action Button */}
                                <div className="flex items-center gap-2 shrink-0">
                                  {isFacultyOrAdmin && (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setTargetModuleForNewClass(module);
                                          setEditingClass(cls);
                                          setIsFormModalOpen(true);
                                        }}
                                        className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors"
                                        title="Editar clase"
                                      >
                                        <Edit3 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={(e) => handleDeleteClass(activeCourse.id, module.id, cls.id, e)}
                                        className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                                        title="Eliminar clase"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}

                                  <button
                                    onClick={() => setSelectedClass(cls)}
                                    className="px-3.5 py-1.5 bg-stone-900 group-hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                                  >
                                    <span>Ver Clase</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <p className="text-xs text-stone-600 line-clamp-2">
                                {cls.description}
                              </p>

                              {/* Indicators of 12 required components */}
                              <div className="flex items-center gap-3 text-xs text-stone-500 pt-2 border-t border-stone-200/80 flex-wrap">
                                {cls.meetUrl && (
                                  <span className="flex items-center gap-1 text-sky-700 font-medium">
                                    <Video className="w-3.5 h-3.5" />
                                    <span>Google Meet</span>
                                  </span>
                                )}
                                {cls.driveUrl && (
                                  <span className="flex items-center gap-1 text-amber-800 font-medium">
                                    <FolderOpen className="w-3.5 h-3.5" />
                                    <span>Google Drive</span>
                                  </span>
                                )}
                                {cls.classroomUrl && (
                                  <span className="flex items-center gap-1 text-emerald-800 font-medium">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>Google Classroom</span>
                                  </span>
                                )}
                                {cls.documents && cls.documents.length > 0 && (
                                  <span className="flex items-center gap-1 text-stone-600">
                                    <FileText className="w-3.5 h-3.5 text-stone-400" />
                                    <span>{cls.documents.length} doc.</span>
                                  </span>
                                )}
                                {cls.exercises && cls.exercises.length > 0 && (
                                  <span className="flex items-center gap-1 text-stone-600">
                                    <Music className="w-3.5 h-3.5 text-stone-400" />
                                    <span>{cls.exercises.length} ejerc.</span>
                                  </span>
                                )}
                                {cls.evaluation && (
                                  <span className="flex items-center gap-1 text-indigo-700 font-medium">
                                    <Award className="w-3.5 h-3.5" />
                                    <span>Evaluación</span>
                                  </span>
                                )}
                              </div>

                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

      </div>
      </>
      )}

      {/* Stitch Lesson Player Modal (Stitch Screen 2) */}
      {selectedStitchClass && activeCourse && (
        <StitchLessonPlayerModal
          isOpen={isStitchPlayerOpen}
          onClose={() => {
            setIsStitchPlayerOpen(false);
            setSelectedStitchClass(null);
          }}
          cls={selectedStitchClass.cls}
          course={activeCourse}
          module={selectedStitchClass.mod}
          enrollment={enrollments[activeCourse.id] || null}
          userRole={role}
          isCompleted={false}
          onToggleComplete={(classId) => {
            // Functional toggle for class completion state
            console.log('Toggled class complete:', classId);
          }}
          onSelectClass={(cls, mod) => {
            setSelectedStitchClass({ cls, mod });
          }}
        />
      )}

      {/* Student Payment Modal (Wompi El Salvador) */}
      {isPaymentModalOpen && activeCourse && (
        <StudentPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          course={activeCourse}
          studentId={currentUser?.uid || 'student-mario'}
          studentName={currentUser?.displayName || 'Mario Barillas'}
          studentEmail={currentUser?.email || 'mariobarillas24@gmail.com'}
          currentEnrollment={enrollments[activeCourse.id] || null}
          onPaymentSuccess={(_updatedEnrollment) => {
            // Authoritative enrollment persistence is handled by backend webhook.
            // Real-time Firestore onSnapshot will update local state automatically.
            setIsPaymentModalOpen(false);
          }}
        />
      )}

      {/* Module Edit Modal */}
      {editingModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">Editar Módulo Académico</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Título del Módulo</label>
                <input
                  type="text"
                  value={editModuleTitle}
                  onChange={(e) => setEditModuleTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900"
                  placeholder="Ej. Módulo 1: Fundamentos Musicales"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Descripción / Objetivos</label>
                <textarea
                  value={editModuleDesc}
                  onChange={(e) => setEditModuleDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
                  placeholder="Descripción de los contenidos del módulo..."
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingModule(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEditModule}
                className="px-4 py-2 rounded-xl text-xs font-bold text-amber-400 bg-stone-900 hover:bg-stone-800 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Detail Modal (Virtual Pipeline: Clase -> Fecha/hora -> Meet -> Drive -> Classroom -> Evaluación) */}
      {selectedClass && activeCourse && (
        <ClassDetailModal
          cls={selectedClass}
          course={activeCourse}
          module={activeCourse.modules?.find(m => m.id === selectedClass.moduleId)}
          enrollment={enrollments[activeCourse.id] || null}
          userRole={role}
          onClose={() => setSelectedClass(null)}
          onToggleEnrollment={handleToggleEnrollment}
        />
      )}

      {/* Class Form Modal (for Teachers & Admins with all 12 fields) */}
      {isFormModalOpen && targetModuleForNewClass && activeCourse && (
        <ClassFormModal
          course={activeCourse}
          module={targetModuleForNewClass}
          existingClass={editingClass}
          onSave={handleSaveClass}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingClass(null);
            setTargetModuleForNewClass(null);
          }}
        />
      )}

    </div>
  );
};
