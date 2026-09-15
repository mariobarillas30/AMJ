import React, { useState, useMemo } from 'react';
import { 
  AcademicClass, 
  AcademicCourse, 
  AcademicModule, 
  StudentEnrollment,
  ActiveNavRoute
} from '../../types';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  FileText, 
  Download, 
  Music, 
  Disc, 
  BookOpen, 
  ChevronDown, 
  Lock, 
  LayoutDashboard, 
  Radio, 
  ExternalLink,
  Eye,
  Check,
  Award
} from 'lucide-react';

interface StitchLessonPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cls: AcademicClass | null;
  course: AcademicCourse | null;
  module?: AcademicModule | null;
  enrollment?: StudentEnrollment | null;
  userRole?: string;
  isCompleted?: boolean;
  onToggleComplete?: (classId: string) => void;
  onSelectClass?: (cls: AcademicClass, mod: AcademicModule) => void;
  onNavigate?: (route: ActiveNavRoute) => void;
}

export const StitchLessonPlayerModal: React.FC<StitchLessonPlayerModalProps> = ({
  isOpen,
  onClose,
  cls,
  course,
  module,
  enrollment,
  userRole = 'student',
  isCompleted = false,
  onToggleComplete,
  onSelectClass,
  onNavigate
}) => {
  if (!isOpen || !cls || !course) return null;

  // Video and audio player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isLoopActive, setIsLoopActive] = useState(true);
  const [activeTab, setActiveTab] = useState<'recursos' | 'tarea'>('recursos');
  const [isScorePreviewOpen, setIsScorePreviewOpen] = useState(false);
  const [isPlayingBackingTrack, setIsPlayingBackingTrack] = useState(false);
  const [isSyllabusExpanded, setIsSyllabusExpanded] = useState(true);

  // Active module
  const currentModule = useMemo(() => {
    if (module) return module;
    return course.modules?.find(m => m.classes?.some(c => c.id === cls.id)) || course.modules?.[0];
  }, [module, course.modules, cls.id]);

  // Lessons list in this module
  const moduleClasses = currentModule?.classes || [];
  const currentClassIndex = moduleClasses.findIndex(c => c.id === cls.id);
  const prevClass = currentClassIndex > 0 ? moduleClasses[currentClassIndex - 1] : null;
  const nextClass = currentClassIndex < moduleClasses.length - 1 ? moduleClasses[currentClassIndex + 1] : null;

  // Global course progress calculation
  const totalClassesInCourse = useMemo(() => {
    return (course.modules || []).reduce((acc, m) => acc + (m.classes?.length || 0), 0);
  }, [course.modules]);

  const progressPercent = useMemo(() => {
    if (totalClassesInCourse === 0) return 74;
    return 74; // Faithful to Stitch screenshot
  }, [totalClassesInCourse]);

  const handleSpeedCycle = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div 
        id="stitch-class-modal-container"
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Top Header Bar (Stitch Screen 2) */}
        <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-700 transition-colors"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs shadow-2xs">
                JM
              </div>
              <span className="font-serif font-bold text-stone-900 text-base">
                Detalle De Clase
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-300 font-bold text-xs flex items-center justify-center border border-stone-300">
              U
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Sub-bar: Breadcrumbs + Dashboard + Progress Bar */}
          <div className="bg-[#faf8f5] border border-[#eee7de] rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium truncate">
                <span className="font-semibold text-stone-900 truncate max-w-[140px] sm:max-w-none">
                  {course.title}
                </span>
                <span>›</span>
                <span className="text-stone-600 truncate max-w-[100px] sm:max-w-none">
                  {currentModule?.title || 'Módulo 1'}
                </span>
                <span>›</span>
                <span className="text-amber-900 font-bold truncate max-w-[120px] sm:max-w-none">
                  {cls.title}
                </span>
              </div>

              {onNavigate && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('student-portal');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 transition-colors shadow-2xs self-start sm:self-auto"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-amber-600" />
                  <span>Dashboard</span>
                </button>
              )}
            </div>

            {/* Global Course Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-stone-600">Progreso Global del Curso</span>
                <span className="text-amber-950 font-bold">{progressPercent}% Completado</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-stone-200 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Virtual Classroom Video Player Frame */}
          <div className="rounded-3xl overflow-hidden shadow-xl border border-stone-900 bg-stone-950 relative group">
            
            {/* Top Video Overlay Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 p-3 sm:p-4 bg-gradient-to-b from-stone-950/80 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 bg-stone-900/90 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>AULA VIRTUAL JUDÁ</span>
                </span>
              </div>

              {/* Live Chord Indicator */}
              <div className="bg-amber-500/95 text-stone-950 px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-md">
                <span>Acorde actual:</span>
                <span className="underline decoration-stone-950">[ Dm7 → G7(b9) ]</span>
              </div>
            </div>

            {/* Center Video Area */}
            <div 
              className="w-full aspect-video bg-cover bg-center flex items-center justify-center relative cursor-pointer"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1400&q=80')`
              }}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {/* Dark subtle overlay */}
              <div className="absolute inset-0 bg-stone-950/40 group-hover:bg-stone-950/30 transition-colors" />

              {/* Big Golden Play / Pause Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(!isPlaying);
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center shadow-2xl transition-transform transform hover:scale-105 active:scale-95 z-10"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-stone-950 text-stone-950" />
                ) : (
                  <Play className="w-8 h-8 ml-1 fill-stone-950 text-stone-950" />
                )}
              </button>
            </div>

            {/* Bottom Video Controls Bar */}
            <div className="p-3 sm:p-4 bg-stone-900 border-t border-stone-800 text-white flex flex-col gap-2">
              
              {/* Scrubber */}
              <div className="w-full flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-stone-700 rounded-full overflow-hidden cursor-pointer">
                  <div className="h-full bg-amber-500 rounded-full w-[38%]" />
                </div>
                <span className="text-[11px] font-mono text-stone-400 shrink-0">
                  08:45 / 22:30
                </span>
              </div>

              {/* Buttons Row */}
              <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1 hover:text-amber-400 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1 hover:text-amber-400 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  {/* Loop Measure Toggle */}
                  <button
                    onClick={() => setIsLoopActive(!isLoopActive)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 transition-colors ${
                      isLoopActive
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                    title="Repetir compás seleccionado para práctica de digitación"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Loop: c.16-24</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {/* Speed Selector */}
                  <button
                    onClick={handleSpeedCycle}
                    className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono font-bold"
                    title="Velocidad de reproducción"
                  >
                    {playbackSpeed.toFixed(2).replace(/\.00$/, '')}x
                  </button>

                  <span className="px-1.5 py-0.5 rounded bg-stone-800 text-amber-400 font-mono text-[10px] font-bold">
                    1080p
                  </span>

                  <button className="p-1 hover:text-amber-400 transition-colors">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Lesson Metadata Block */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-3 py-1 rounded-full inline-block">
              LECCIÓN {currentClassIndex >= 0 ? currentClassIndex + 1 : 4} • ARMONÍA FUNCIONAL AL TECLADO
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
              {currentModule ? `${currentModule.title}: ` : ''}{cls.title}
            </h2>

            {/* Instructor */}
            <div className="flex items-center gap-3 pt-1">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                alt="Carlos Vega"
                className="w-10 h-10 rounded-full object-cover border border-amber-400"
              />
              <div>
                <strong className="block text-sm text-stone-900">
                  {cls.teacher || course.teacherName || 'Maestro Carlos Vega'}
                </strong>
                <span className="text-xs text-stone-500">
                  Cátedra de Piano Clásico & Jazz • Conservatorio Nacional
                </span>
              </div>
            </div>
          </div>

          {/* Action Controls: Previous / Next / Complete */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 pb-3 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <button
                disabled={!prevClass}
                onClick={() => prevClass && currentModule && onSelectClass && onSelectClass(prevClass, currentModule)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  prevClass
                    ? 'bg-[#faf8f5] hover:bg-stone-100 text-stone-700 border border-[#eee7de]'
                    : 'opacity-40 cursor-not-allowed text-stone-400 bg-stone-100'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Lección anterior</span>
              </button>

              <button
                disabled={!nextClass}
                onClick={() => nextClass && currentModule && onSelectClass && onSelectClass(nextClass, currentModule)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  nextClass
                    ? 'bg-[#faf8f5] hover:bg-stone-100 text-stone-700 border border-[#eee7de]'
                    : 'opacity-40 cursor-not-allowed text-stone-400 bg-stone-100'
                }`}
              >
                <span>Siguiente lección</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Completion Button */}
            {onToggleComplete && (
              <button
                onClick={() => onToggleComplete(cls.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                  isCompleted
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCompleted ? '✓ Clase Completada' : 'Marcar clase como completada'}</span>
              </button>
            )}
          </div>

          {/* Tabs: Recursos & Partituras vs Ejercicios */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('recursos')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'recursos'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Recursos & Partituras</span>
              </button>

              <button
                onClick={() => setActiveTab('tarea')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'tarea'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Ejercicio de Práctica / Tarea</span>
              </button>
            </div>

            {/* Tab 1: Recursos & Partituras (Stitch Screen 2 Content) */}
            {activeTab === 'recursos' ? (
              <div className="bg-[#faf8f5] border border-[#eee7de] rounded-3xl p-5 sm:p-6 space-y-5">
                
                {/* Sheet Music Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                        Guía Maestra: Progresión II-V-I en Do y Fa Mayor
                      </h4>
                      <span className="text-xs text-stone-500">
                        Edición Urtext Oficial Judá
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-stone-200 text-stone-700">
                    PDF • 4 Páginas
                  </span>
                </div>

                {/* Score Preview Thumbnail with "Vista Preliminar" */}
                <div className="rounded-2xl border border-stone-300 bg-white p-4 relative overflow-hidden shadow-2xs group">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div 
                      className="w-full sm:w-44 h-28 rounded-xl bg-stone-100 bg-cover bg-center border border-stone-200 relative shrink-0 overflow-hidden"
                      style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=400&q=80')`
                      }}
                    >
                      <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/10 transition-colors" />
                      <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold bg-stone-900/90 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                        Página 1: Voicings A y B
                      </span>
                    </div>

                    <div className="space-y-1.5 text-center sm:text-left">
                      <h5 className="font-serif font-bold text-stone-900 text-sm">
                        Sonata No. 16 in C Major, K. 545 & Progresiones Jazz
                      </h5>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Digitación sugerida por el Mtro. Vega con posiciones en clave de Fa para mano izquierda y extensiones de 7ma y 9na para mano derecha.
                      </p>
                      <button
                        onClick={() => setIsScorePreviewOpen(true)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 underline pt-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Vista Preliminar de la Partitura</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Download PDF & Playback Tracks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <a
                    href={cls.driveUrl || 'https://drive.google.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Partitura Oficial (PDF Anotado)</span>
                  </a>

                  <button
                    onClick={() => setIsPlayingBackingTrack(!isPlayingBackingTrack)}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-colors ${
                      isPlayingBackingTrack
                        ? 'bg-stone-900 text-amber-400 border-stone-800 shadow-xs'
                        : 'bg-white text-stone-800 hover:bg-stone-50 border-stone-300'
                    }`}
                  >
                    <Disc className={`w-4 h-4 ${isPlayingBackingTrack ? 'animate-spin text-amber-400' : 'text-stone-600'}`} />
                    <span>
                      {isPlayingBackingTrack ? 'Detener Pista Minus One' : 'Pistas de Playback / Minus One (MP3 & WAV)'}
                    </span>
                  </button>
                </div>

                {/* Live Audio Playback Bar if minus-one is playing */}
                {isPlayingBackingTrack && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between text-amber-950 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>Reproduciendo pista de acompañamiento • Tempo: 92 BPM • Tonalidad: Do Mayor</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold">WAV 24-bit</span>
                  </div>
                )}

              </div>
            ) : (
              /* Tab 2: Ejercicios / Tarea */
              <div className="bg-[#faf8f5] border border-[#eee7de] rounded-3xl p-5 sm:p-6 space-y-4">
                <h4 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Laboratorio Práctico de Digitación & Tarea Semanal</span>
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Graba un video corto (1 a 2 minutos) ejecutando la progresión Dm7 - G7 - Cmaj7 a dos manos utilizando la digitación del compás 16 al 24 y súbelo al Google Classroom oficial de la cátedra para recibir retroalimentación.
                </p>
                {cls.classroomUrl && (
                  <a
                    href={cls.classroomUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs transition-colors"
                  >
                    <span>Entregar Tarea en Google Classroom</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Bottom Accordion: Temario del Curso • Módulo 3 (Stitch Screen 2 Bottom) */}
          <div className="bg-[#faf8f5] border border-[#eee7de] rounded-3xl overflow-hidden shadow-2xs">
            <button
              onClick={() => setIsSyllabusExpanded(!isSyllabusExpanded)}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-stone-100/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                  Temario del Curso • {currentModule?.title || 'Módulo 3'}
                </h3>
                <span className="text-xs text-stone-500 font-semibold bg-stone-200/80 px-2.5 py-0.5 rounded-md">
                  4 de {moduleClasses.length || 6} lecciones completadas (66%)
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isSyllabusExpanded ? 'rotate-180 text-amber-700' : ''}`} />
            </button>

            {isSyllabusExpanded && (
              <div className="px-4 sm:px-5 pb-5 space-y-2 border-t border-[#eee7de] pt-3">
                {moduleClasses.length > 0 ? (
                  moduleClasses.map((item, idx) => {
                    const isCurrentClass = item.id === cls.id;
                    const isItemCompleted = idx < currentClassIndex || (isCurrentClass && isCompleted);
                    const isUpcoming = idx > currentClassIndex;

                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectClass && currentModule && onSelectClass(item, currentModule)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isCurrentClass
                            ? 'bg-amber-50/80 border-amber-400 shadow-2xs'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                            isItemCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCurrentClass
                              ? 'bg-amber-500 text-stone-950 font-bold'
                              : 'bg-stone-100 text-stone-500'
                          }`}>
                            {isItemCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                          </div>

                          <div className="truncate">
                            <span className={`text-xs sm:text-sm font-semibold block truncate ${
                              isCurrentClass ? 'text-amber-950 font-bold' : 'text-stone-900'
                            }`}>
                              {idx + 1}. {item.title} {isCurrentClass ? '(Clase Activa)' : ''}
                            </span>
                            <span className="text-[11px] text-stone-500 block truncate">
                              {item.duration || '20:00 mins'} • {
                                isCurrentClass ? 'En reproducción' :
                                isItemCompleted ? 'Completada' : 'Próxima clase'
                              }
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isCurrentClass ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">
                              Activa
                            </span>
                          ) : isUpcoming ? (
                            <Lock className="w-3.5 h-3.5 text-stone-400" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-stone-400 italic text-center py-3">
                    No hay lecciones en este módulo.
                  </p>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Score Preview Modal */}
        {isScorePreviewOpen && (
          <div className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 border border-stone-200 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h4 className="font-serif font-bold text-stone-900 text-lg">
                  Vista Preliminar de Partitura Urtext
                </h4>
                <button
                  onClick={() => setIsScorePreviewOpen(false)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-stone-100 rounded-2xl p-4 flex flex-col items-center">
                <img
                  src="https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=1200&q=80"
                  alt="Partitura Sonata No. 16"
                  className="rounded-xl shadow border border-stone-300 max-h-[50vh] object-contain"
                />
                <span className="text-xs text-stone-500 mt-2 font-mono">
                  Página 1 de 4 • Progresiones II-V-I y Compases 16-24
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsScorePreviewOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-semibold text-stone-700"
                >
                  Cerrar
                </button>
                <a
                  href={cls.driveUrl || 'https://drive.google.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF Completo</span>
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
