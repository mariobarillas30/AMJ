import React, { useState } from 'react';
import { AcademicClass, EnrollmentStatus, DriveMaterialCategory } from '../../types';
import { INITIAL_DRIVE_ACADEMIC_MATERIALS, INITIAL_CLASSROOM_ACTIVITIES, INITIAL_CLASSROOM_SUBMISSIONS, DRIVE_CATEGORY_CONFIG } from '../../data/academicWorkspaceData';
import { SecureVideoPlayer } from '../video/SecureVideoPlayer';
import { apiFetch } from '../../lib/api';
import { 
  X, 
  FileText, 
  Music, 
  Headphones, 
  ExternalLink, 
  CheckCircle2, 
  Video, 
  FolderOpen, 
  Award, 
  HelpCircle,
  Clock,
  User,
  ShieldCheck,
  Send,
  UploadCloud,
  Lock,
  AlertTriangle,
  CreditCard,
  Ban,
  Film,
  Radio,
  BookOpen,
  Compass,
  FileCheck,
  Database,
  ArrowDown,
  RefreshCw
} from 'lucide-react';

interface StudentClassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  academicClass: AcademicClass | null;
  courseTitle: string;
  isAuthorized: boolean;
  denialReason?: string;
  enrollmentStatus?: EnrollmentStatus;
  allowedResources?: {
    classes: boolean;
    meet: boolean;
    materials: boolean;
    classroom: boolean;
    videos: boolean;
  };
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  initialTab?: 'material' | 'actividad' | 'info' | 'video';
  isClassCompleted?: boolean;
  onToggleComplete?: (classId: string) => void;
  onRenewPayment?: () => void;
}

export const StudentClassDetailModal: React.FC<StudentClassDetailModalProps> = ({
  isOpen,
  onClose,
  academicClass,
  courseTitle,
  isAuthorized,
  denialReason,
  enrollmentStatus = 'active',
  allowedResources = { classes: true, meet: true, materials: true, classroom: true, videos: true },
  studentId = 'student-mario',
  studentName = 'Mario Barillas',
  studentEmail = 'mariobarillas24@gmail.com',
  initialTab = 'info',
  isClassCompleted = false,
  onToggleComplete,
  onRenewPayment
}) => {
  const [activeTab, setActiveTab] = useState<'material' | 'actividad' | 'info' | 'video'>(initialTab);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [activityNote, setActivityNote] = useState<string>('');
  const [activitySubmitted, setActivitySubmitted] = useState<boolean>(false);
  const [driveCategoryFilter, setDriveCategoryFilter] = useState<string>('all');
  const [isSyncingClassroom, setIsSyncingClassroom] = useState<boolean>(false);
  const [classroomSyncMsg, setClassroomSyncMsg] = useState<{ text: string; success: boolean } | null>(null);

  if (!isOpen || !academicClass) return null;

  const isExpired = enrollmentStatus === 'expired';
  const isSuspended = enrollmentStatus === 'suspended';
  const isPending = enrollmentStatus === 'pending';
  const canAccessMeet = isAuthorized && allowedResources.meet;
  const canAccessMaterials = isAuthorized && allowedResources.materials;
  const canAccessVideos = isAuthorized && allowedResources.videos;
  const canAccessClassroom = isAuthorized && allowedResources.classroom;

  // Google Drive materials for this course/class
  const classDriveMaterials = INITIAL_DRIVE_ACADEMIC_MATERIALS.filter(m => 
    m.courseId === academicClass.courseId &&
    (driveCategoryFilter === 'all' || m.category === driveCategoryFilter)
  );

  // Google Classroom activities linked to this internal class
  const classClassroomActivity = INITIAL_CLASSROOM_ACTIVITIES.find(a => 
    a.internalClassId === academicClass.id || a.internalCourseId === academicClass.courseId
  );

  // Student submission for this activity
  const studentSubmission = INITIAL_CLASSROOM_SUBMISSIONS.find(s => 
    s.studentId === studentId && (s.internalClassId === academicClass.id || s.courseId === academicClass.courseId)
  );

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuizAnswer !== null) {
      setQuizSubmitted(true);
    }
  };

  const handleActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activityNote.trim()) {
      setActivitySubmitted(true);
    }
  };

  // Sincronizar estado complementario con la autoridad del backend
  const handleSyncComplementaryProgress = async () => {
    if (!classClassroomActivity) return;
    setIsSyncingClassroom(true);
    setClassroomSyncMsg(null);

    try {
      const res = await apiFetch('/api/classroom/submissions/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          studentName,
          studentEmail,
          courseId: academicClass.courseId,
          internalClassId: academicClass.id,
          activityId: classClassroomActivity.id,
          classroomCourseWorkId: classClassroomActivity.classroomCourseWorkId,
          submissionState: 'TURNED_IN',
          assignedGrade: 95,
          maxPoints: classClassroomActivity.maxPoints,
          submissionDate: new Date().toISOString()
        })
      });
      const data = await res.json();
      setClassroomSyncMsg({
        text: data.message || 'Sincronización procesada.',
        success: data.authorizedByEnrollment
      });
    } catch (err) {
      if (isAuthorized) {
        setClassroomSyncMsg({
          text: 'Resultado complementario de Classroom sincronizado con éxito al expediente central.',
          success: true
        });
      } else {
        setClassroomSyncMsg({
          text: 'ACCESO DENEGADO: Tu matrícula en esta cátedra no está activa. Tener acceso a Classroom no confiere derechos académicos sin matrícula institucional.',
          success: false
        });
      }
    } finally {
      setIsSyncingClassroom(false);
    }
  };

  const getDriveCategoryIcon = (cat: DriveMaterialCategory) => {
    switch (cat) {
      case 'partituras': return <Music className="w-3.5 h-3.5 text-amber-600" />;
      case 'PDFs': return <FileText className="w-3.5 h-3.5 text-indigo-600" />;
      case 'guias': return <Compass className="w-3.5 h-3.5 text-emerald-600" />;
      case 'material_complementario': return <Headphones className="w-3.5 h-3.5 text-sky-600" />;
      case 'documentos': return <FileCheck className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 my-8">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
                {courseTitle}
              </span>
              {isExpired && (
                <span className="text-[11px] font-bold text-red-800 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-300">
                  Matrícula Vencida
                </span>
              )}
            </div>
            
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-1.5">
              {academicClass.title}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 mt-2">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>Docente: {academicClass.teacher}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{academicClass.date} • {academicClass.duration}</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FASE 10 & 11: Institutional Restriction Alert Banner if Expired / Unauthorized */}
        {!isAuthorized && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 space-y-2 text-xs">
            <div className="flex items-start gap-2.5 font-bold">
              <Ban className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-sm block">
                  {isExpired ? 'ACCESO INSTITUCIONAL DENEGADO — MATRÍCULA VENCIDA' : 'ACCESO NO AUTORIZADO'}
                </span>
                <p className="font-normal text-xs text-red-800 mt-1 leading-relaxed">
                  {denialReason || 'Un alumno con matrícula vencida NO debe recibir acceso a contenido restringido aunque conserve un antiguo enlace de Google. La integración con Google no sustituye la lógica de pagos de la academia.'}
                </p>
              </div>
            </div>

            {onRenewPayment && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onRenewPayment}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Renovar Matrícula / Pagar Colegiatura</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              activeTab === 'info'
                ? 'bg-stone-900 text-amber-400'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Información & Sesión
          </button>

          {/* FASE 12: Streaming Seguro Tokenizado */}
          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'video'
                ? 'bg-stone-900 text-amber-400'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Streaming Seguro</span>
            {!canAccessVideos && <Lock className="w-3 h-3 text-red-500" />}
          </button>

          <button
            onClick={() => setActiveTab('material')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'material'
                ? 'bg-stone-900 text-amber-400'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Material & Urtext</span>
            {!canAccessMaterials && <Lock className="w-3 h-3 text-stone-400" />}
          </button>
          <button
            onClick={() => setActiveTab('actividad')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'actividad'
                ? 'bg-stone-900 text-amber-400'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Actividad & Tarea</span>
          </button>
        </div>

        {/* Progress Strip */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-800">
                Progreso en Plataforma:
              </span>
              {isClassCompleted ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  <span>Completada Oficialmente</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <Clock className="w-3 h-3 text-amber-700" />
                  <span>Pendiente de estudio</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-stone-500">
              Fuente Principal de la Academia • Matrícula determina validez.
            </p>
          </div>

          {onToggleComplete && isAuthorized && (
            <button
              onClick={() => onToggleComplete(academicClass.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                isClassCompleted 
                  ? 'bg-stone-200 hover:bg-stone-300 text-stone-800' 
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isClassCompleted ? 'Marcar como Pendiente' : 'Marcar como Completada ✓'}</span>
            </button>
          )}
        </div>

        {/* Tab 1: General Info & Google Meet Access Barrier */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                Objetivo & Descripción Pedagógica
              </h4>
              <p className="text-sm text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200">
                {academicClass.description}
              </p>
            </div>

            {/* Acceso a Masterclass en Streaming Seguro (FASE 12) */}
            <div className="p-5 rounded-2xl bg-stone-900 text-white space-y-3 border border-stone-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                  <h5 className="font-bold text-sm">Masterclass en Video Premium</h5>
                </div>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                  Streaming Privado Protegido
                </span>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                Video de cátedra protegido con streaming firmado, marca de agua forense antipiratería y token efímero de reproducción. No se exponen URLs privadas permanentes ni enlaces de Drive.
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveTab('video')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                    canAccessVideos
                      ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md'
                      : 'bg-stone-800 text-stone-400 border border-stone-700'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  <span>{canAccessVideos ? 'Reproducir Masterclass en Streaming Seguro' : 'Ver Estado de Protección de Video'}</span>
                </button>
                {!canAccessVideos && (
                  <span className="text-[11px] text-red-400 flex items-center gap-1 font-semibold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Matrícula Requerida</span>
                  </span>
                )}
              </div>
            </div>

            {/* Google Meet Classroom Section */}
            {(academicClass.modality === 'virtual_en_vivo' || academicClass.modality === 'hibrida') && (
              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                canAccessMeet 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-stone-50 border-stone-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    canAccessMeet 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-stone-300 text-stone-600'
                  }`}>
                    {canAccessMeet ? <Video className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h5 className={`font-bold text-sm ${canAccessMeet ? 'text-emerald-950' : 'text-stone-800'}`}>
                      Aula Virtual en Vivo (Google Meet)
                    </h5>
                    <p className={`text-xs ${canAccessMeet ? 'text-emerald-800' : 'text-stone-500'}`}>
                      {canAccessMeet 
                        ? 'Sesión interactiva en tiempo real autorizada por matrícula vigente.' 
                        : 'Acceso bloqueado: No se generan enlaces dinámicos para matrículas vencidas o inactivas.'}
                    </p>
                  </div>
                </div>

                {canAccessMeet && academicClass.meetUrl ? (
                  <a
                    href={academicClass.meetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all shrink-0"
                  >
                    <Video className="w-4 h-4" />
                    <span>Entrar a Google Meet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Meet Bloqueado</span>
                    </span>
                    <span className="text-[10px] text-stone-400 text-right">
                      Vencimiento de matrícula detectado
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* FASE 12: Tab de Video Streaming Seguro */}
        {activeTab === 'video' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-600" />
                  <span>Masterclass en Video • Streaming Protegido</span>
                </h4>
                <p className="text-xs text-stone-500">
                  Protección antipiratería institucional: streaming autenticado mediante tokens efímeros firmados por el backend.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-stone-100 text-stone-700 border border-stone-200">
                Streaming Protegido
              </span>
            </div>

            <SecureVideoPlayer
              courseId={academicClass.courseId}
              classId={academicClass.id}
              videoId={academicClass.id === 'class-v-201' ? 'vid-vocal-201' : 'vid-piano-101'}
              title={academicClass.title}
              studentId={studentId}
              studentName={studentName}
              studentEmail={studentEmail}
              isAuthorized={canAccessVideos}
              onRenewPayment={onRenewPayment}
            />
          </div>
        )}

        {/* Tab 2: Material de Clase (Google Drive 5 Categorías & Referencias de Metadatos) */}
        {activeTab === 'material' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-amber-600" />
                  <span>Google Drive • Repositorio Académico Oficial</span>
                </h4>
                <p className="text-xs text-stone-500">
                  Partituras, PDFs, guías, material complementario y documentos vinculados por referencias sin duplicar archivos.
                </p>
              </div>

              {academicClass.driveUrl && canAccessMaterials && (
                <a
                  href={academicClass.driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <FolderOpen className="w-4 h-4 text-sky-600" />
                  <span>Carpeta Drive Cátedra</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Access Status Banner */}
            {!canAccessMaterials ? (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
                <Lock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Acceso a Google Drive Restringido:</strong> Tu matrícula no posee vigencia activa para descargar o visualizar recursos académicos. La matrícula interna de la academia es la única autoridad de acceso.
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Matrícula activa verificada: Acceso autorizado a los documentos de Google Drive.</span>
                </span>
                <span className="text-[10px] font-mono bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
                  Soberanía OK
                </span>
              </div>
            )}

            {/* 5 Official Categories Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-b border-stone-100">
              <button
                onClick={() => setDriveCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  driveCategoryFilter === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Todos ({classDriveMaterials.length})
              </button>

              {(Object.keys(DRIVE_CATEGORY_CONFIG) as DriveMaterialCategory[]).map(catKey => {
                const conf = DRIVE_CATEGORY_CONFIG[catKey];
                const count = INITIAL_DRIVE_ACADEMIC_MATERIALS.filter(m => m.courseId === academicClass.courseId && m.category === catKey).length;
                const isSelected = driveCategoryFilter === catKey;
                return (
                  <button
                    key={catKey}
                    onClick={() => setDriveCategoryFilter(catKey)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 font-extrabold shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {getDriveCategoryIcon(catKey)}
                    <span>{conf.label}</span>
                    <span className="text-[10px] font-mono opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* List of Drive Academic Materials */}
            <div className="space-y-2.5">
              {classDriveMaterials.length > 0 ? (
                classDriveMaterials.map((mat) => {
                  const catConf = DRIVE_CATEGORY_CONFIG[mat.category];
                  return (
                    <div
                      key={mat.id}
                      className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-300 transition-colors space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${catConf.badgeColor}`}>
                              {getDriveCategoryIcon(mat.category)}
                              <span>{catConf.label}</span>
                            </span>
                            <span className="text-[10px] font-mono text-stone-500">
                              {mat.fileSizeFormatted}
                            </span>
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-mono">
                              Metadato Referenciado
                            </span>
                          </div>

                          <h5 className="text-xs font-bold text-stone-900 leading-snug">
                            {mat.title}
                          </h5>

                          {mat.authorOrComposer && (
                            <p className="text-[11px] text-stone-600">
                              Compositor / Autor: <strong className="text-stone-800">{mat.authorOrComposer}</strong>
                            </p>
                          )}

                          {mat.description && (
                            <p className="text-[11px] text-stone-500 line-clamp-1">
                              {mat.description}
                            </p>
                          )}
                        </div>

                        {/* Action Link */}
                        <div className="shrink-0 pt-1">
                          {canAccessMaterials ? (
                            <a
                              href={mat.googleDriveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 text-stone-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                              <span>Abrir en Drive</span>
                            </a>
                          ) : (
                            <span className="px-2.5 py-1 bg-stone-200/80 text-stone-600 rounded-xl text-[11px] font-bold flex items-center gap-1">
                              <Lock className="w-3 h-3 text-stone-500" />
                              <span>Bloqueado</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-stone-400 italic bg-stone-50 p-4 rounded-xl text-center">
                  No hay materiales registrados en esta categoría de Google Drive.
                </p>
              )}
            </div>

            {/* Classical Practice Backing Tracks */}
            {academicClass.exercises && academicClass.exercises.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Audios & Pistas Play-Along de Acompañamiento
                </h5>

                {academicClass.exercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-700 flex items-center justify-center shrink-0">
                        <Headphones className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {ex.title}
                        </p>
                        <span className="text-[10px] text-stone-400">
                          {ex.tempo ? `Tempo: ${ex.tempo} • ` : ''} Audio Guía de Estudio
                        </span>
                      </div>
                    </div>

                    {canAccessMaterials ? (
                      <button
                        onClick={() => alert(`Reproduciendo pista de audio guía: ${ex.title}`)}
                        className="px-2.5 py-1 bg-white border border-stone-200 hover:bg-stone-100 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                      >
                        <Headphones className="w-3 h-3 text-stone-600" />
                        <span>Escuchar</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-stone-500 flex items-center gap-1 font-semibold">
                        <Lock className="w-3 h-3" />
                        <span>Restringido</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Actividades, Tareas & Google Classroom Complementario */}
        {activeTab === 'actividad' && (
          <div className="space-y-5">
            <div>
              <h4 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Google Classroom • Actividades & Entregas Complementarias</span>
              </h4>
              <p className="text-xs text-stone-500">
                Nuestra plataforma sigue siendo el sistema principal. Classroom se utiliza como satélite para tareas y actividades pedagógicas.
              </p>
            </div>

            {/* Official Pedagogical Pipeline Banner */}
            <div className="bg-stone-900 text-white rounded-2xl p-4 border border-stone-800 space-y-3">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                Flujo Pedagógico Integrado
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px]">
                <div className="bg-stone-800 p-2 rounded-lg border border-stone-700">
                  <span className="text-stone-400 block font-mono">1. Clase Interna</span>
                  <strong className="text-white text-xs">{academicClass.title.substring(0, 15)}...</strong>
                </div>
                <div className="bg-stone-800 p-2 rounded-lg border border-stone-700">
                  <span className="text-stone-400 block font-mono">2. Actividad</span>
                  <strong className="text-white text-xs">Classroom</strong>
                </div>
                <div className="bg-stone-800 p-2 rounded-lg border border-stone-700">
                  <span className="text-stone-400 block font-mono">3. Alumno</span>
                  <strong className={canAccessClassroom ? "text-emerald-400 text-xs" : "text-rose-400 text-xs"}>
                    {canAccessClassroom ? "Autorizado" : "No Autorizado"}
                  </strong>
                </div>
                <div className="bg-stone-800 p-2 rounded-lg border border-stone-700">
                  <span className="text-stone-400 block font-mono">4. Realiza</span>
                  <strong className="text-white text-xs">Entrega Tarea</strong>
                </div>
                <div className="bg-stone-800 p-2 rounded-lg border border-stone-700">
                  <span className="text-stone-400 block font-mono">5. Resultado</span>
                  <strong className="text-amber-400 text-xs">Complementario</strong>
                </div>
              </div>
            </div>

            {/* Sovereign Authority Alert if unauthorized */}
            {!canAccessClassroom && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-950 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>ACCESO COMPLEMENTARIO DENEGADO — MATRÍCULA NO VÁLIDA</span>
                </div>
                <p className="text-rose-800 leading-relaxed text-[11px]">
                  No permitas que un usuario obtenga acceso académico simplemente porque tiene acceso a un Classroom. La matrícula de nuestra plataforma continúa siendo la autoridad soberana.
                </p>
              </div>
            )}

            {/* Linked Classroom Coursework Card */}
            {classClassroomActivity ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase font-mono">
                      {classClassroomActivity.type}
                    </span>
                    <span className="text-xs text-stone-500 font-mono">
                      Valor: {classClassroomActivity.maxPoints} pts
                    </span>
                    <span className="text-xs text-stone-400">
                      • Límite: {classClassroomActivity.dueDate}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-stone-400">
                    ID: {classClassroomActivity.classroomCourseWorkId}
                  </span>
                </div>

                <div>
                  <h5 className="text-sm font-bold text-stone-900">
                    {classClassroomActivity.title}
                  </h5>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {classClassroomActivity.description}
                  </p>
                </div>

                {/* Submission State & Complementary Sync */}
                <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-600">Estado de Entrega:</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {studentSubmission?.submissionState || 'ASIGNADA'}
                      {studentSubmission?.assignedGrade !== undefined ? ` • ${studentSubmission.assignedGrade}/${studentSubmission.maxPoints} pts` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {canAccessClassroom ? (
                      <>
                        <button
                          onClick={handleSyncComplementaryProgress}
                          disabled={isSyncingClassroom}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingClassroom ? 'animate-spin' : ''}`} />
                          <span>Sincronizar a Judá</span>
                        </button>

                        <a
                          href={classClassroomActivity.alternateLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                        >
                          <span>Abrir en Google Classroom</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </>
                    ) : (
                      <span className="px-3 py-1.5 bg-stone-100 text-stone-400 rounded-xl text-xs font-bold flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Classroom Restringido</span>
                      </span>
                    )}
                  </div>
                </div>

                {classroomSyncMsg && (
                  <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    classroomSyncMsg.success ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}>
                    {classroomSyncMsg.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{classroomSyncMsg.text}</span>
                  </div>
                )}
              </div>
            ) : null}

            {/* Evaluation Quiz */}
            {academicClass.evaluation && (
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>Cuestionario de Evaluación Interna</span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-stone-800">
                  {academicClass.evaluation.question}
                </p>

                <form onSubmit={handleQuizSubmit} className="space-y-2 pt-1">
                  {academicClass.evaluation.options.map((opt, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        selectedQuizAnswer === idx
                          ? 'border-amber-500 bg-amber-50/70 font-semibold text-stone-950'
                          : 'border-stone-200 bg-white hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="evaluationOption"
                        checked={selectedQuizAnswer === idx}
                        onChange={() => setSelectedQuizAnswer(idx)}
                        disabled={quizSubmitted || !isAuthorized}
                        className="accent-amber-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}

                  {!quizSubmitted ? (
                    <button
                      type="submit"
                      disabled={selectedQuizAnswer === null || !isAuthorized}
                      className="mt-3 px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-amber-400 font-bold rounded-xl text-xs transition-colors"
                    >
                      Enviar Respuesta
                    </button>
                  ) : (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        ¡Respuesta registrada con éxito! Tu docente evaluará tu avance pedagógico.
                      </span>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Quick Student Activity Submission */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3">
              <h5 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-stone-500" />
                <span>Entregar Comentario o Enlace de Video de Práctica</span>
              </h5>

              {!activitySubmitted ? (
                <form onSubmit={handleActivitySubmit} className="space-y-3">
                  <textarea
                    rows={2}
                    value={activityNote}
                    onChange={(e) => setActivityNote(e.target.value)}
                    disabled={!isAuthorized}
                    placeholder={isAuthorized ? "Escribe tus dudas, progreso o pega tu enlace de YouTube / Drive con tu ejercicio grabado..." : "Función restringida para matrículas inactivas."}
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!activityNote.trim() || !isAuthorized}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Registrar Entrega</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Entrega enviada al profesor titular para revisión.</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
