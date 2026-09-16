import React, { useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { 
  AcademicCourse, 
  AcademicProgressRecord, 
  CourseProgressSummary,
  ActiveNavRoute 
} from '../../types';
import { INITIAL_ADMIN_STUDENTS, INITIAL_ADMIN_ENROLLMENTS } from '../../data/adminManagementData';
import { 
  getStoredProgressRecords, 
  toggleClassCompletion, 
  syncComplementaryWorkspaceData, 
  calculateStudentCourseProgress 
} from '../../data/progressData';
import { 
  CheckCircle2, 
  Clock, 
  Award, 
  BookOpen, 
  Layers, 
  Video, 
  FolderCheck, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronDown, 
  ShieldCheck, 
  Smartphone, 
  Laptop, 
  RefreshCw, 
  Calendar, 
  Check, 
  X, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';

interface AcademicProgressViewProps {
  onNavigate?: (route: ActiveNavRoute) => void;
}

export const AcademicProgressView: React.FC<AcademicProgressViewProps> = ({ onNavigate }) => {
  const { currentUser, role, userProfile } = useAuth();

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

  // Progress records state
  const [records, setRecords] = useState<AcademicProgressRecord[]>(() => getStoredProgressRecords());

  // Filter states
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (role === 'student' && currentUser) {
      return currentUser.email === 'mariobarillas24@gmail.com' ? 'student-mario' : 'student-mario';
    }
    return 'student-mario';
  });

  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(courses[0]?.id || null);

  // Sync notification toast
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Current selected student profile
  const currentStudent = useMemo(() => {
    return INITIAL_ADMIN_STUDENTS.find(s => s.uid === selectedStudentId) || INITIAL_ADMIN_STUDENTS[0];
  }, [selectedStudentId]);

  // Courses where selected student is enrolled
  const studentEnrolledCourses = useMemo(() => {
    const activeEnrollmentCourseIds = new Set(
      INITIAL_ADMIN_ENROLLMENTS
        .filter(e => e.studentId === selectedStudentId && e.status === 'active')
        .map(e => e.courseId)
    );
    return courses.filter(c => activeEnrollmentCourseIds.has(c.id));
  }, [courses, selectedStudentId]);

  // Summaries of progress by course for selected student
  const courseSummaries = useMemo(() => {
    return studentEnrolledCourses.map(course => 
      calculateStudentCourseProgress(selectedStudentId, course, records)
    );
  }, [studentEnrolledCourses, selectedStudentId, records]);

  // Overall academy progress metrics for this student
  const overallMetrics = useMemo(() => {
    let totalClasses = 0;
    let completedClasses = 0;
    courseSummaries.forEach(s => {
      totalClasses += s.totalClasses;
      completedClasses += s.completedClasses;
    });
    const percentage = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0;
    return { totalClasses, completedClasses, percentage };
  }, [courseSummaries]);

  // Filtered list of detailed records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Role & Student filter
      if (role === 'student') {
        if (r.studentId !== selectedStudentId) return false;
      } else {
        if (selectedStudentId !== 'all' && r.studentId !== selectedStudentId) return false;
      }

      // Course filter
      if (selectedCourseFilter !== 'all' && r.courseId !== selectedCourseFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'completed' && !r.completed) return false;
      if (statusFilter === 'pending' && r.completed) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = r.classTitle.toLowerCase().includes(query);
        const matchModule = r.moduleTitle.toLowerCase().includes(query);
        const matchCourse = r.courseTitle.toLowerCase().includes(query);
        const matchStudent = r.studentName.toLowerCase().includes(query);
        if (!matchTitle && !matchModule && !matchCourse && !matchStudent) return false;
      }

      return true;
    });
  }, [records, role, selectedStudentId, selectedCourseFilter, statusFilter, searchQuery]);

  // Handle manual toggle of completion
  const handleToggleClass = (
    studentId: string,
    studentName: string,
    courseId: string,
    courseTitle: string,
    moduleId: string,
    moduleTitle: string,
    classId: string,
    classTitle: string,
    currentCompleted: boolean
  ) => {
    const updated = toggleClassCompletion(
      studentId,
      studentName,
      courseId,
      courseTitle,
      moduleId,
      moduleTitle,
      classId,
      classTitle,
      !currentCompleted
    );
    setRecords(updated);
  };

  // Simulate or sync complementary data from Classroom / Meet
  // Demonstrates clearly: "Cuando sea técnicamente viable, se podrán utilizar eventos o acciones de Classroom como información complementaria, pero la plataforma debe mantener su propio registro académico."
  const handleSyncClassroomComplementary = (classId: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updated = syncComplementaryWorkspaceData(selectedStudentId, classId, {
      classroomActivityCompleted: true,
      classroomSubmissionDate: now,
      meetSessionAttended: true,
      driveMaterialConsulted: true,
      notes: 'Sincronización complementaria de Classroom (Tarea entregada) registrada como metadato.'
    });
    setRecords(updated);
    setSyncToast('¡Evento complementario de Classroom sincronizado con éxito! El registro oficial interno se preserva como fuente principal.');
    setTimeout(() => setSyncToast(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-stone-900 text-white p-4 rounded-2xl shadow-2xl border border-amber-500/40 flex items-start gap-3 animate-slideUp">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <strong className="text-amber-400 block font-semibold">Fuente Principal Protegida</strong>
            <p className="text-stone-300 leading-relaxed">{syncToast}</p>
          </div>
          <button 
            onClick={() => setSyncToast(null)}
            className="text-stone-400 hover:text-white ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner: Soberanía del Sistema Interno */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                SEGUIMIENTO ACADÉMICO
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Fuente Principal Autorizada</span>
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Registro Oficial de Avance & Completitud
            </h1>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              La plataforma mantiene la <strong>soberanía del historial académico</strong> (alumno, curso, módulo, clase, estado completado, fecha y porcentaje). Las herramientas de <strong>Google Meet, Drive y Classroom</strong> aportan información complementaria sin sustituir nuestro sistema.
            </p>
          </div>

          {/* Student Selector (for teachers and admins) */}
          <div className="bg-stone-800/90 border border-stone-700/80 rounded-2xl p-4 shrink-0 flex flex-col gap-2 min-w-[240px]">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-amber-400" />
              <span>Estudiante en Consulta:</span>
            </span>

            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold text-stone-200 focus:border-amber-400 focus:outline-none"
            >
              {INITIAL_ADMIN_STUDENTS.map(s => (
                <option key={s.uid} value={s.uid}>
                  {s.displayName} ({s.primaryInstrument})
                </option>
              ))}
            </select>

            <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1 border-t border-stone-700/60">
              <span>Dispositivo:</span>
              <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> Móvil & Escritorio
              </span>
            </div>
          </div>
        </div>

        {/* Global Key Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-800">
          <div className="p-3 bg-stone-800/50 rounded-2xl border border-stone-700/40">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Cursos Matriculados</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-amber-400">
              {studentEnrolledCourses.length}
            </span>
          </div>

          <div className="p-3 bg-stone-800/50 rounded-2xl border border-stone-700/40">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Clases Completadas</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-emerald-400">
              {overallMetrics.completedClasses} / {overallMetrics.totalClasses}
            </span>
          </div>

          <div className="p-3 bg-stone-800/50 rounded-2xl border border-stone-700/40">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Avance Global</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-white">
              {overallMetrics.percentage}%
            </span>
          </div>

          <div className="p-3 bg-stone-800/50 rounded-2xl border border-stone-700/40">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Sincronización</span>
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1 mt-1">
              <Check className="w-3.5 h-3.5" /> En tiempo real
            </span>
          </div>
        </div>
      </div>

      {/* Course Overall Progress Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <span>Resumen Curricular por Cátedra</span>
          </h2>
          <span className="text-xs text-stone-500 font-semibold">
            {courseSummaries.length} cursos activos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courseSummaries.map((summary) => (
            <div 
              key={summary.courseId}
              className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-4 hover:border-amber-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                    {summary.instrument}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg">
                    {summary.overallPercentage}% completado
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug">
                  {summary.courseTitle}
                </h3>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${summary.overallPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span>{summary.completedClasses} de {summary.totalClasses} clases</span>
                    <span>Último avance: {summary.lastActivityDate.substring(0, 10)}</span>
                  </div>
                </div>

                {/* Modules breakdown pills */}
                <div className="pt-2 border-t border-stone-100 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                    Avance por Módulos:
                  </span>
                  <div className="space-y-1.5">
                    {summary.modules.map((m, idx) => (
                      <div key={m.moduleId} className="flex items-center justify-between text-xs">
                        <span className="text-stone-700 font-medium truncate max-w-[180px]">
                          M{idx + 1}: {m.moduleTitle}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-stone-400 text-[10px]">
                            {m.completedClasses}/{m.totalClasses}
                          </span>
                          <span className="font-mono font-bold text-stone-800 text-[11px]">
                            {m.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCourseFilter(summary.courseId);
                  setExpandedCourseId(summary.courseId);
                }}
                className="w-full mt-4 py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Ver Detalle de Clases</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por clase, módulo o curso..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            
            {/* Course Filter */}
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:border-amber-400 focus:outline-none"
            >
              <option value="all">Todos los Cursos</option>
              {studentEnrolledCourses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>

            {/* Status Filter */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                  statusFilter === 'completed' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>Completadas</span>
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === 'pending' ? 'bg-amber-600 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Pendientes
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Authoritative Detailed Matrix (Mandated Fields: alumno, curso, módulo, clase, completada, fecha, porcentaje) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-700" />
              <span>Matriz Oficial de Clases & Estado de Completitud</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Registro obligatorio e inmutable administrado por la Academia Musical Judá.
            </p>
          </div>

          <span className="text-xs font-semibold text-stone-500">
            {filteredRecords.length} registros cargados
          </span>
        </div>

        {filteredRecords.length > 0 ? (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  record.completed ? 'border-emerald-200/80 bg-emerald-50/10' : 'border-stone-200'
                }`}
              >
                {/* Main Mandatory Metadata Block */}
                <div className="space-y-2 flex-1">
                  
                  {/* Tags: Course + Module */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                      {record.courseTitle}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-50 text-stone-600 border border-stone-200">
                      {record.moduleTitle}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-stone-500">
                      Estudiante: {record.studentName}
                    </span>
                  </div>

                  {/* Class Title */}
                  <h3 className="font-serif text-base font-bold text-stone-900">
                    {record.classTitle}
                  </h3>

                  {/* Status, Date, Percentage row */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-400 font-medium">Estado:</span>
                      {record.completed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Completada</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>Pendiente de estudio</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-400 font-medium">Fecha:</span>
                      <span className="font-mono text-stone-800 font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{record.completedAt || 'Sin fecha'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-400 font-medium">Porcentaje Clase:</span>
                      <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {record.percentage}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-mono">
                      <span>Fuente:</span>
                      <strong className="text-stone-600 uppercase">{record.sourceOfTruth}</strong>
                    </div>
                  </div>

                  {/* COMPLEMENTARY GOOGLE WORKSPACE DATA BAR */}
                  <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="text-stone-400 font-semibold uppercase text-[10px]">
                      Datos Complementarios Google:
                    </span>

                    {/* Classroom Complementary Badge */}
                    <span className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold border ${
                      record.classroomActivityCompleted 
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                        : 'bg-stone-50 text-stone-400 border-stone-200'
                    }`}>
                      <Award className="w-3 h-3" />
                      <span>Classroom: {record.classroomActivityCompleted ? 'Tarea Entregada' : 'Sin entrega'}</span>
                    </span>

                    {/* Meet Complementary Badge */}
                    <span className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold border ${
                      record.meetSessionAttended 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-stone-50 text-stone-400 border-stone-200'
                    }`}>
                      <Video className="w-3 h-3" />
                      <span>Meet: {record.meetSessionAttended ? 'Asistencia Verificada' : 'No asistida'}</span>
                    </span>

                    {/* Drive Complementary Badge */}
                    <span className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold border ${
                      record.driveMaterialConsulted 
                        ? 'bg-sky-50 text-sky-700 border-sky-200' 
                        : 'bg-stone-50 text-stone-400 border-stone-200'
                    }`}>
                      <FolderCheck className="w-3 h-3" />
                      <span>Drive: {record.driveMaterialConsulted ? 'Material Urtext Consultado' : 'Pendiente'}</span>
                    </span>
                  </div>

                  {record.notes && (
                    <p className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-xl border border-stone-100">
                      "{record.notes}"
                    </p>
                  )}

                </div>

                {/* Direct Action Buttons */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                  <button
                    onClick={() => handleToggleClass(
                      record.studentId,
                      record.studentName,
                      record.courseId,
                      record.courseTitle,
                      record.moduleId,
                      record.moduleTitle,
                      record.classId,
                      record.classTitle,
                      record.completed
                    )}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                      record.completed
                        ? 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    }`}
                  >
                    {record.completed ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
                        <span>Marcar como Pendiente</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Marcar como Completada ✓</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleSyncClassroomComplementary(record.classId)}
                    className="w-full sm:w-auto px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    title="Registrar evento complementario de Google Classroom"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Sincronizar Classroom</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-stone-400 mx-auto" />
            <h4 className="font-serif font-bold text-stone-800 text-sm">
              No se encontraron clases con los filtros seleccionados
            </h4>
            <p className="text-xs text-stone-500">
              Prueba cambiando el filtro de estado o la búsqueda.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
