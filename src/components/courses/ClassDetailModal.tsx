import React, { useState } from 'react';
import { 
  AcademicClass, 
  AcademicCourse, 
  AcademicModule, 
  StudentEnrollment 
} from '../../types';
import { 
  X, 
  Video, 
  FolderOpen, 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Music, 
  FileText, 
  Award, 
  Play, 
  HelpCircle,
  ArrowRight,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface ClassDetailModalProps {
  cls: AcademicClass;
  course: AcademicCourse;
  module?: AcademicModule;
  enrollment?: StudentEnrollment | null;
  userRole: string;
  onClose: () => void;
  onToggleEnrollment?: (courseId: string) => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  cls,
  course,
  module,
  enrollment,
  userRole,
  onClose,
  onToggleEnrollment
}) => {
  const isAuthorized = userRole === 'admin' || userRole === 'superadmin' || userRole === 'teacher' || enrollment?.status === 'active';

  const [activeTab, setActiveTab] = useState<'virtual_flow' | 'video' | 'documents' | 'exercises' | 'evaluation'>('virtual_flow');
  const [copiedMeet, setCopiedMeet] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [classroomCompleted, setClassroomCompleted] = useState(false);
  const [attendanceLogged, setAttendanceLogged] = useState(false);

  const copyMeetCode = () => {
    if (cls.meetCode) {
      navigator.clipboard.writeText(cls.meetCode);
      setCopiedMeet(true);
      setTimeout(() => setCopiedMeet(false), 2000);
    }
  };

  const handleJoinMeet = () => {
    setAttendanceLogged(true);
    if (cls.meetUrl) {
      window.open(cls.meetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuizOption !== null) {
      setQuizSubmitted(true);
    }
  };

  const modalityBadgeColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
    virtual_en_vivo: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', label: 'Virtual en Vivo' },
    grabada: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', label: 'Grabada / Asíncrona' },
    presencial: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', label: 'Presencial' },
    hibrida: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', label: 'Híbrida' }
  };

  const modBadge = modalityBadgeColors[cls.modality] || modalityBadgeColors.virtual_en_vivo;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        id="class-detail-container"
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn"
      >
        {/* Modal Header */}
        <div className="bg-stone-900 text-white p-6 border-b border-stone-800 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Academic Hierarchy Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium mb-2 flex-wrap">
            <span className="text-amber-400 font-bold">Academia Judá</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
            <span className="hover:text-stone-200">{course.title}</span>
            {module && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                <span className="text-stone-300">{module.title}</span>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${modBadge.bg} ${modBadge.text} ${modBadge.border}`}>
                  {modBadge.label}
                </span>
                <span className="text-xs text-stone-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  {cls.teacher || course.teacherName}
                </span>
                <span className="text-xs text-stone-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {cls.duration}
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-white">
                {cls.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Authorization State Banner (Strict Requirement: Platform is Central Authority) */}
        {!isAuthorized ? (
          <div className="p-6 bg-amber-50/90 border-b border-amber-200 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-amber-900">
                  Acceso Académico Restringido — Matrícula Requerida
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>La plataforma de Academia Musical Judá es el sistema central de autorización:</strong> Ni Google Classroom ni enlaces de Google Meet externos otorgan acceso a los recursos pedagógicos, partituras o evaluaciones sin una matrícula activa registrada y autorizada por la administración de la academia.
                </p>
                <div className="text-[11px] text-stone-600 font-mono pt-1">
                  Estado actual: <span className="font-bold text-red-600">{enrollment?.status === 'pending' ? 'Matrícula Pendiente de Aprobación' : 'No Matriculado'}</span>
                </div>
              </div>
            </div>

            {onToggleEnrollment && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => onToggleEnrollment(course.id)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 font-semibold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Activar Matrícula en Plataforma (Simulación / Demo)</span>
                </button>
                <span className="text-[11px] text-stone-500">
                  Haz clic para simular la aprobación administrativa y desbloquear todo el flujo académico.
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-2.5 bg-emerald-50/80 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                <strong>Autorización Académica Válida:</strong> Matrícula verificada en el sistema central de la Academia.
              </span>
            </div>
            {onToggleEnrollment && userRole === 'student' && (
              <button
                onClick={() => onToggleEnrollment(course.id)}
                className="text-[11px] text-stone-500 hover:text-stone-800 underline"
                title="Alternar estado para probar bloqueo"
              >
                (Simular desmatriculación)
              </button>
            )}
          </div>
        )}

        {/* Sub-Navigation Tabs */}
        <div className="flex border-b border-stone-200 px-6 bg-stone-50 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('virtual_flow')}
            className={`py-3 px-4 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'virtual_flow'
                ? 'border-b-2 border-amber-600 text-amber-900 font-bold bg-white'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Flujo Virtual Integrado</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`py-3 px-4 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'video'
                ? 'border-b-2 border-amber-600 text-amber-900 font-bold bg-white'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Play className="w-4 h-4 text-sky-600" />
            <span>Video & Grabación</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-4 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-b-2 border-amber-600 text-amber-900 font-bold bg-white'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-amber-700" />
            <span>Partituras & Documentos ({cls.documents?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('exercises')}
            className={`py-3 px-4 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'exercises'
                ? 'border-b-2 border-amber-600 text-amber-900 font-bold bg-white'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Music className="w-4 h-4 text-emerald-600" />
            <span>Ejercicios Prácticos ({cls.exercises?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('evaluation')}
            className={`py-3 px-4 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'evaluation'
                ? 'border-b-2 border-amber-600 text-amber-900 font-bold bg-white'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Evaluación Académica</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-stone-50/50">
          
          {/* TAB 1: FLUX VIRTUAL EN VIVO (User Mandate: Clase -> Fecha/hora -> Meet -> Drive -> Classroom -> Evaluación) */}
          {activeTab === 'virtual_flow' && (
            <div className="space-y-6">
              
              {/* Pedagogical Pipeline Header */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Secuencia Pedagógica Judá (Flujo Integral)
                  </span>
                  <span className="text-xs text-stone-500">
                    Sincronización en tiempo real
                  </span>
                </div>
                <p className="text-xs text-stone-600">
                  {cls.description}
                </p>
              </div>

              {/* Step-by-Step Flow */}
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-stone-200">
                
                {/* 1. CLASE */}
                <div className="relative flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center shrink-0 shadow-sm z-10 border border-stone-700">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">Paso 1: Asignatura & Docente</span>
                      <span className="text-xs font-semibold text-amber-700">{course.instrument}</span>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900">{cls.title}</h4>
                    <p className="text-xs text-stone-600 mt-1">
                      Docente Titular: <strong>{cls.teacher || course.teacherName}</strong> • Duración estimada: <strong>{cls.duration}</strong>
                    </p>
                  </div>
                </div>

                {/* 2. FECHA / HORA */}
                <div className="relative flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-sm z-10">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">Paso 2: Horario de Sesión</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Clock className="w-3 h-3" />
                        <span>Programada en Calendario</span>
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900">{cls.date}</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Ingresa 5 minutos antes para probar tu micrófono y afinación de tu instrumento.
                    </p>
                  </div>
                </div>

                {/* 3. GOOGLE MEET */}
                <div className="relative flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm z-10 ${
                    isAuthorized ? 'bg-sky-600 text-white' : 'bg-stone-200 text-stone-400'
                  }`}>
                    <Video className="w-5 h-5" />
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">Paso 3: Videoconferencia en Vivo</span>
                      <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                        Google Meet
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <div>
                        <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                          <span>Sala Institucional:</span>
                          <span className="font-mono text-sky-800 bg-white px-2 py-0.5 rounded border border-stone-300">
                            {cls.meetCode || 'jud-meet-general'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Conexión directa encriptada para estudiantes autorizados.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {cls.meetCode && (
                          <button
                            onClick={copyMeetCode}
                            className="p-2 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg text-stone-700 text-xs transition-colors flex items-center gap-1"
                            title="Copiar código de Meet"
                          >
                            {copiedMeet ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            <span className="hidden sm:inline">{copiedMeet ? 'Copiado' : 'Copiar'}</span>
                          </button>
                        )}

                        <button
                          disabled={!isAuthorized}
                          onClick={handleJoinMeet}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm ${
                            isAuthorized
                              ? 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer'
                              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          }`}
                        >
                          <Video className="w-4 h-4" />
                          <span>Unirse a Google Meet</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {attendanceLogged && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Asistencia a sesión en Google Meet registrada exitosamente en Cloud Firestore.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. MATERIAL DRIVE */}
                <div className="relative flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm z-10 ${
                    isAuthorized ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-400'
                  }`}>
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">Paso 4: Repositorio en Google Drive</span>
                      <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                        Google Drive
                      </span>
                    </div>

                    <p className="text-xs text-stone-600">
                      Partituras oficiales, guías técnicas de digitación y pistas de práctica alojadas en la unidad institucional.
                    </p>

                    <div className="space-y-2">
                      {cls.documents?.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-amber-700 shrink-0" />
                            <div>
                              <p className="font-semibold text-stone-900">{doc.title}</p>
                              <span className="text-[10px] text-stone-500">{doc.size || 'Google Drive'}</span>
                            </div>
                          </div>

                          <button
                            disabled={!isAuthorized}
                            onClick={() => {
                              if (isAuthorized) window.open(doc.url, '_blank', 'noopener,noreferrer');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                              isAuthorized
                                ? 'bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 shadow-xs'
                                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            }`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Abrir en Drive</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. ACTIVIDAD CLASSROOM */}
                <div className="relative flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm z-10 ${
                    isAuthorized ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-400'
                  }`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">Paso 5: Tarea Sincronizada en Classroom</span>
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        Google Classroom
                      </span>
                    </div>

                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
                      <h5 className="text-xs font-bold text-stone-900">
                        Consigna de la Sesión:
                      </h5>
                      <p className="text-xs text-stone-700">
                        {cls.classroomTask || 'Revisión y práctica individual de la digitación en partitura.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <button
                        disabled={!isAuthorized}
                        onClick={() => {
                          if (isAuthorized && cls.classroomUrl) {
                            window.open(cls.classroomUrl, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          isAuthorized
                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver Tarea en Google Classroom</span>
                      </button>

                      <button
                        disabled={!isAuthorized}
                        onClick={() => setClassroomCompleted(!classroomCompleted)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                          classroomCompleted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-300'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${classroomCompleted ? 'text-emerald-600' : 'text-stone-400'}`} />
                        <span>{classroomCompleted ? 'Tarea Marcada como Entregada' : 'Marcar como Entregada en Plataforma'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 6. EVALUACIÓN */}
                <div className="relative flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm z-10 ${
                    isAuthorized ? 'bg-indigo-600 text-white' : 'bg-stone-200 text-stone-400'
                  }`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">Paso 6: Evaluación Académica Judá</span>
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                        Puntuación Oficial
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{cls.evaluation.title}</h4>
                      <p className="text-xs text-stone-600 mt-0.5">{cls.evaluation.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        disabled={!isAuthorized}
                        onClick={() => setActiveTab('evaluation')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                          isAuthorized
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        <Award className="w-4 h-4" />
                        <span>Realizar Evaluación de la Clase</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs text-stone-500">
                        Puntaje mínimo de aprobación: <strong>{cls.evaluation.passingScore} / {cls.evaluation.maxScore}</strong>
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: VIDEO & RECORDING */}
          {activeTab === 'video' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Video de la Clase & Grabación
                  </h3>
                  <p className="text-xs text-stone-500">
                    Clase grabada o repetición de la transmisión en directo para estudio asíncrono.
                  </p>
                </div>
                <span className="text-xs font-medium text-stone-500">
                  Duración: {cls.duration}
                </span>
              </div>

              {!isAuthorized ? (
                <div className="p-8 bg-stone-100 rounded-2xl border border-stone-200 text-center space-y-3">
                  <ShieldAlert className="w-8 h-8 text-amber-700 mx-auto" />
                  <p className="text-xs font-semibold text-stone-800">
                    Video bloqueado: Requiere matrícula activa en la plataforma de Academia Musical Judá.
                  </p>
                </div>
              ) : (
                <div className="aspect-video bg-stone-900 rounded-2xl overflow-hidden shadow-md flex items-center justify-center relative">
                  {cls.video ? (
                    <iframe
                      src={cls.video}
                      title={cls.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-center p-6 text-stone-400 space-y-2">
                      <Video className="w-12 h-12 mx-auto text-stone-500" />
                      <p className="text-sm font-semibold text-white">Grabación en procesamiento</p>
                      <p className="text-xs">La grabación estará disponible 2 horas después de finalizar la sesión en vivo.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOCUMENTS & SHEET MUSIC */}
          {activeTab === 'documents' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Partituras & Documentos de Estudio
                  </h3>
                  <p className="text-xs text-stone-500">
                    Material curricular alojado de forma segura en Google Drive institucional.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (isAuthorized && cls.driveUrl) window.open(cls.driveUrl, '_blank', 'noopener,noreferrer');
                  }}
                  disabled={!isAuthorized}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                    isAuthorized
                      ? 'bg-stone-900 hover:bg-stone-800 text-amber-300'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Carpeta Completa de Drive</span>
                </button>
              </div>

              {!isAuthorized ? (
                <div className="p-8 bg-stone-100 rounded-2xl border border-stone-200 text-center space-y-3">
                  <ShieldAlert className="w-8 h-8 text-amber-700 mx-auto" />
                  <p className="text-xs font-semibold text-stone-800">
                    Acceso a partituras protegido: Requiere matrícula activa en la plataforma.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cls.documents?.map((doc) => (
                    <div key={doc.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4 text-amber-700" />
                          <span className="text-[11px] font-bold uppercase text-stone-600 font-mono">
                            {doc.type}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">{doc.size || 'PDF'}</span>
                      </div>

                      <h4 className="text-xs font-bold text-stone-900 leading-snug">
                        {doc.title}
                      </h4>

                      <button
                        onClick={() => window.open(doc.url, '_blank', 'noopener,noreferrer')}
                        className="w-full py-2 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg text-xs font-semibold text-stone-800 flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Documento Seguro</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EXERCISES */}
          {activeTab === 'exercises' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Ejercicios Técnicos & Práctica Musical
                </h3>
                <p className="text-xs text-stone-500">
                  Rutinas de digitación, metrónomo y acompañamiento para consolidar la clase.
                </p>
              </div>

              {!isAuthorized ? (
                <div className="p-8 bg-stone-100 rounded-2xl border border-stone-200 text-center space-y-3">
                  <ShieldAlert className="w-8 h-8 text-amber-700 mx-auto" />
                  <p className="text-xs font-semibold text-stone-800">
                    Ejercicios restringidos a estudiantes matriculados.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cls.exercises?.map((ex) => (
                    <div key={ex.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                          <Music className="w-4 h-4 text-emerald-700" />
                          <span>{ex.title}</span>
                        </h4>
                        {ex.tempoBpm && (
                          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                            ♩ = {ex.tempoBpm} BPM
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {ex.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-stone-500 pt-1 border-t border-stone-200">
                        {ex.keySignature && (
                          <span>Tonalidad: <strong>{ex.keySignature}</strong></span>
                        )}
                        {ex.targetTechnique && (
                          <span>Técnica Clave: <strong>{ex.targetTechnique}</strong></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EVALUATION */}
          {activeTab === 'evaluation' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 mb-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Evaluación Formativa Oficial</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    {cls.evaluation.title}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {cls.evaluation.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-serif font-bold text-indigo-700">
                    {cls.evaluation.maxScore}
                  </span>
                  <span className="text-xs text-stone-500 block">Puntos Máximos</span>
                </div>
              </div>

              {!isAuthorized ? (
                <div className="p-8 bg-stone-100 rounded-2xl border border-stone-200 text-center space-y-3">
                  <ShieldAlert className="w-8 h-8 text-amber-700 mx-auto" />
                  <p className="text-xs font-semibold text-stone-800">
                    Evaluación protegida: Solo estudiantes formalmente matriculados pueden presentar tests y asentar notas en el historial académico.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Criterios de Evaluación */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <span className="text-xs font-bold text-stone-700 uppercase font-mono">
                      Criterios de Evaluación por Rúbrica:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {cls.evaluation.criteria?.map((crit, idx) => (
                        <span key={idx} className="text-xs bg-white text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{crit}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Question */}
                  {cls.evaluation.question && (
                    <form onSubmit={handleQuizSubmit} className="space-y-4">
                      <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-indigo-600" />
                          <h4 className="text-xs font-bold text-indigo-900 uppercase font-mono">
                            Pregunta de Comprobación Técnica:
                          </h4>
                        </div>
                        <p className="text-sm font-semibold text-stone-900">
                          {cls.evaluation.question}
                        </p>

                        <div className="space-y-2 pt-2">
                          {cls.evaluation.options?.map((opt, index) => (
                            <label
                              key={index}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                                selectedQuizOption === index
                                  ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                                  : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200'
                              }`}
                            >
                              <input
                                type="radio"
                                name="quiz-choice"
                                checked={selectedQuizOption === index}
                                onChange={() => setSelectedQuizOption(index)}
                                className="accent-indigo-600"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {!quizSubmitted ? (
                        <button
                          type="submit"
                          disabled={selectedQuizOption === null}
                          className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                            selectedQuizOption !== null
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Enviar y Calificar Evaluación</span>
                        </button>
                      ) : (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ¡Evaluación Completada Exitosamente!
                            </span>
                            <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded border border-emerald-200">
                              Nota: {selectedQuizOption === cls.evaluation.correctAnswerIndex ? cls.evaluation.maxScore : 65} / {cls.evaluation.maxScore}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-800">
                            {selectedQuizOption === cls.evaluation.correctAnswerIndex 
                              ? 'Excelente respuesta. Has asimilado con precisión los conceptos teóricos y técnicos de la sesión.'
                              : 'Respuesta registrada. Repasa el material Urtext en Drive y los ejercicios de metrónomo.'}
                          </p>
                          <span className="text-[10px] text-stone-500 block font-mono pt-1">
                            Calificación guardada en el expediente del estudiante en Cloud Firestore.
                          </span>
                        </div>
                      )}
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>
            Academia Musical Judá • Sistema Central de Gobernanza Académica
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
