import React, { useState, useMemo } from 'react';
import { 
  AcademicCourse, 
  AcademicModule, 
  AcademicClass, 
  StudentEnrollment 
} from '../../types';
import { 
  Play, 
  Share2, 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Video, 
  Radio, 
  Edit3, 
  Lock, 
  ChevronDown, 
  ShieldCheck, 
  Star, 
  FileText, 
  Volume2, 
  Sparkles, 
  Award, 
  MessageSquare,
  Copy,
  Check,
  Plus
} from 'lucide-react';

interface StitchCourseShowcaseProps {
  course: AcademicCourse;
  coursesList: AcademicCourse[];
  onSelectCourse: (courseId: string) => void;
  enrollment?: StudentEnrollment | null;
  onSelectClass: (cls: AcademicClass, mod: AcademicModule) => void;
  onEnroll: (course: AcademicCourse) => void;
  onToggleEnrollment?: (courseId: string) => void;
  isFacultyOrAdmin?: boolean;
  onOpenNewClassForm?: (mod: AcademicModule) => void;
  onOpenNewModule?: () => void;
}

export const StitchCourseShowcase: React.FC<StitchCourseShowcaseProps> = ({
  course,
  coursesList,
  onSelectCourse,
  enrollment,
  onSelectClass,
  onEnroll,
  onToggleEnrollment,
  isFacultyOrAdmin,
  onOpenNewClassForm,
  onOpenNewModule
}) => {
  const isEnrolled = enrollment?.status === 'active';
  const [copiedShare, setCopiedShare] = useState(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<'card' | 'transfer' | 'points'>('card');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (course.modules && course.modules.length > 0) {
      initial[course.modules[0].id] = true;
    }
    return initial;
  });

  const totalClasses = useMemo(() => {
    return (course.modules || []).reduce((acc, m) => acc + (m.classes?.length || 0), 0);
  }, [course.modules]);

  const toggleModule = (modId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2200);
    }
  };

  // Find sample class (first class of first module)
  const sampleClass = useMemo(() => {
    if (course.modules && course.modules.length > 0) {
      const firstMod = course.modules[0];
      if (firstMod.classes && firstMod.classes.length > 0) {
        return { cls: firstMod.classes[0], mod: firstMod };
      }
    }
    return null;
  }, [course.modules]);

  const priceDiscounted = 39.99;
  const priceOriginal = 79.99;
  const listPrice = 49.99;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Top Bar: Back to Courses, Best Seller Pill, Share Button */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={course.id}
              onChange={(e) => onSelectCourse(e.target.value)}
              className="appearance-none inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700 bg-stone-100 hover:bg-stone-200 py-2 pl-4 pr-8 rounded-full border border-stone-300/80 cursor-pointer transition-colors shadow-2xs"
            >
              {coursesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Más Vendido</span>
          </span>
        </div>

        <button
          onClick={handleShare}
          className="p-2 sm:px-3 sm:py-1.5 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          title="Compartir curso"
        >
          {copiedShare ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline text-emerald-700">¡Enlace Copiado!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Compartir</span>
            </>
          )}
        </button>
      </div>

      {/* Video Hero Banner (Cinema Frame Trailer) */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-200 bg-stone-950 group">
        <div 
          className="w-full aspect-video sm:aspect-[21/9] bg-cover bg-center relative"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1520523839898-5071270560a7?auto=format&fit=crop&w=1600&q=80')`
          }}
        >
          {/* Subtle dark vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-stone-950/60" />

          {/* Top Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white/90 bg-stone-900/80 backdrop-blur-md border border-white/10 shadow-sm">
              <span>🎬</span>
              <span>Trailer Oficial (2:15)</span>
            </span>
          </div>

          {/* Central Golden Play Button */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-10">
            <button
              onClick={() => {
                if (sampleClass) {
                  onSelectClass(sampleClass.cls, sampleClass.mod);
                }
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center shadow-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 group-hover:ring-4 group-hover:ring-amber-400/40"
              title="Reproducir clase muestra"
            >
              <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1 fill-stone-950 text-stone-950" />
            </button>

            <div className="mt-3 sm:mt-4 space-y-0.5">
              <span className="block text-white font-bold text-sm sm:text-base drop-shadow-md">
                Ver Clase Muestra
              </span>
              <span className="block text-stone-300 text-xs sm:text-sm drop-shadow-sm">
                Conoce el método interactivo Judá
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Typography & Title Block */}
      <div className="space-y-3">
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight leading-tight">
          {course.title}
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-3xl">
          {course.description || 'Aprende digitación ergonómica, interpretación armónica contemporánea y lectura de partituras con bases clásicas y sonido actual.'}
        </p>
      </div>

      {/* 4 Quick Meta Cards (2x2 on mobile, 4 columns on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#faf8f5] border border-[#eee7de] rounded-2xl p-4 text-center space-y-1">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2">
            <Edit3 className="w-4 h-4" />
          </div>
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
            Nivel
          </span>
          <strong className="text-xs sm:text-sm text-stone-900 font-semibold block">
            Principiante a Intermedio
          </strong>
        </div>

        <div className="bg-[#faf8f5] border border-[#eee7de] rounded-2xl p-4 text-center space-y-1">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
            Duración
          </span>
          <strong className="text-xs sm:text-sm text-stone-900 font-semibold block">
            8 Semanas (Paso a paso)
          </strong>
        </div>

        <div className="bg-[#faf8f5] border border-[#eee7de] rounded-2xl p-4 text-center space-y-1">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2">
            <Video className="w-4 h-4" />
          </div>
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
            Lecciones
          </span>
          <strong className="text-xs sm:text-sm text-stone-900 font-semibold block">
            {totalClasses > 0 ? `${totalClasses} Clases HD + Material` : '24 Clases HD + Material'}
          </strong>
        </div>

        <div className="bg-[#faf8f5] border border-[#eee7de] rounded-2xl p-4 text-center space-y-1">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2">
            <Radio className="w-4 h-4" />
          </div>
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
            Modalidad
          </span>
          <strong className="text-xs sm:text-sm text-stone-900 font-semibold block">
            Híbrida (Meet + Plataforma)
          </strong>
        </div>
      </div>

      {/* Instructor Card */}
      <div className="bg-[#faf8f5] border border-[#eee7de] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5">
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
          alt={course.teacherName}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-300 shadow-sm shrink-0"
        />
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-md inline-block">
            Instructor Titular
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
            {course.teacherName || 'Mtro. Carlos Vega'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600">
            Pianista Concertista • Formación Musical Avanzada & Cátedra
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-1 pt-1 text-amber-500">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-stone-800 ml-1">4.9/5</span>
            <span className="text-xs text-stone-500">(142 reseñas verificadas)</span>
          </div>
        </div>
      </div>

      {/* "Lo que aprenderás" Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-700" />
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
            Lo que aprenderás
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#faf8f5] border border-[#eee7de] rounded-2xl p-5 space-y-2">
            <div className="text-2xl">✋</div>
            <h4 className="font-bold text-stone-900 text-sm sm:text-base">
              Postura ergonómica y digitación ágil
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Ejercicios de relajación muscular y técnica de peso corporal para tocar sin tensión ni riesgo de fatiga.
            </p>
          </div>

          <div className="bg-[#faf8f5] border border-[#eee7de] rounded-2xl p-5 space-y-2">
            <div className="text-2xl">🎵</div>
            <h4 className="font-bold text-stone-900 text-sm sm:text-base">
              Lectura fluida en clave de Sol y Fa
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Método visual de reconocimiento de intervalos melódicos y patrones rítmicos en el pentagrama.
            </p>
          </div>

          <div className="bg-[#faf8f5] border border-[#eee7de] rounded-2xl p-5 space-y-2">
            <div className="text-2xl">🎹</div>
            <h4 className="font-bold text-stone-900 text-sm sm:text-base">
              Progresiones de acordes modernos y arpegios
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Dominio de acordes séptima, tensiones jazz-pop y acompañamientos rítmicos balanceados a dos manos.
            </p>
          </div>

          <div className="bg-[#faf8f5] border border-[#eee7de] rounded-2xl p-5 space-y-2">
            <div className="text-2xl">🏅</div>
            <h4 className="font-bold text-stone-900 text-sm sm:text-base">
              Interpretación de tus primeras 5 obras completas
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Repertorio progresivo que combina piezas neo-clásicas y canciones populares universales.
            </p>
          </div>
        </div>
      </div>

      {/* "Contenido del Curso" Section (Modules Accordion) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-700" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
              Contenido del Curso
            </h2>
          </div>
          <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
            {course.modules?.length || 0} Módulos • {totalClasses} Clases
          </span>
        </div>

        {/* Modules List */}
        <div className="space-y-3">
          {(course.modules || []).map((mod, modIdx) => {
            const isExpanded = !!expandedModules[mod.id];
            const classCount = mod.classes?.length || 0;

            return (
              <div 
                key={mod.id} 
                className="bg-[#faf8f5] border border-[#eee7de] rounded-2xl overflow-hidden transition-all shadow-2xs"
              >
                {/* Module Trigger Header */}
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-stone-100/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100/90 px-2 py-1 rounded-lg">
                      MÓDULO {modIdx + 1}
                    </span>
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-1">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                      {classCount} {classCount === 1 ? 'clase' : 'clases'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isExpanded ? 'rotate-180 text-amber-700' : ''}`} />
                  </div>
                </button>

                {/* Expanded Class List */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-4 space-y-2 border-t border-[#eee7de] pt-3 bg-white/60">
                    {mod.classes && mod.classes.length > 0 ? (
                      mod.classes.map((cls, clsIdx) => {
                        const isFreeSample = modIdx === 0 && clsIdx === 0;

                        return (
                          <div
                            key={cls.id}
                            onClick={() => onSelectClass(cls, mod)}
                            className="p-3 rounded-xl bg-white border border-stone-200/80 hover:border-amber-400/80 hover:bg-amber-50/40 cursor-pointer flex items-center justify-between gap-3 transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-6 h-6 rounded-full bg-stone-100 group-hover:bg-amber-100 text-stone-600 group-hover:text-amber-900 text-xs font-bold flex items-center justify-center shrink-0">
                                {clsIdx + 1}
                              </span>
                              <div className="truncate">
                                <span className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-amber-950 block truncate">
                                  {cls.title}
                                </span>
                                <span className="text-[11px] text-stone-500 block truncate">
                                  {cls.duration} • {cls.modality === 'virtual_en_vivo' ? 'Virtual en Vivo' : 'Video Grabado'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isFreeSample ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  Clase Muestra
                                </span>
                              ) : isEnrolled ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                                  Acceso Disponible
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-stone-400 flex items-center gap-1">
                                  <Lock className="w-3 h-3 text-stone-400" />
                                  <span className="hidden sm:inline">Bloqueada</span>
                                </span>
                              )}
                              <Play className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-700" />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-stone-400 italic py-2 text-center">
                        No hay clases registradas en este módulo.
                      </p>
                    )}

                    {/* Faculty: Add Class button */}
                    {isFacultyOrAdmin && onOpenNewClassForm && (
                      <button
                        onClick={() => onOpenNewClassForm(mod)}
                        className="w-full mt-2 py-2 border border-dashed border-stone-300 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:border-amber-400 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Nueva Clase a este Módulo</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Faculty: Add Module button */}
          {isFacultyOrAdmin && onOpenNewModule && (
            <button
              onClick={onOpenNewModule}
              className="w-full py-3 border-2 border-dashed border-stone-300 hover:border-amber-400 rounded-2xl text-xs font-bold text-stone-700 hover:text-stone-950 flex items-center justify-center gap-2 transition-colors bg-[#faf8f5]"
            >
              <Plus className="w-4 h-4 text-amber-700" />
              <span>Crear Nuevo Módulo Académico</span>
            </button>
          )}
        </div>
      </div>

      {/* "¿Qué incluye este curso?" Section */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
          ¿Qué incluye este curso?
        </h2>

        <div className="bg-[#faf8f5] border border-[#eee7de] rounded-3xl p-6 space-y-3.5">
          <div className="flex items-start gap-3 text-xs sm:text-sm text-stone-800">
            <span className="text-base">♾️</span>
            <div>
              <strong className="block text-stone-900">Acceso ilimitado de por vida sin cuotas mensuales</strong>
              <span className="text-stone-600">Repasa las lecciones cuantas veces necesites desde computadora, tablet o smartphone.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs sm:text-sm text-stone-800">
            <span className="text-base">🎚️</span>
            <div>
              <strong className="block text-stone-900">Pistas multitrack profesionales en audio WAV para práctica</strong>
              <span className="text-stone-600">Minus-one de batería, bajo y cuerdas para ensayar en contexto armónico real.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs sm:text-sm text-stone-800">
            <span className="text-base">📄</span>
            <div>
              <strong className="block text-stone-900">Partituras oficiales completas en formato PDF descargable</strong>
              <span className="text-stone-600">Edición Urtext anotada con digitaciones sugeridas y diagramas de acordes.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs sm:text-sm text-stone-800">
            <span className="text-base">🛡️</span>
            <div>
              <strong className="block text-stone-900">Certificado digital verificado con código QR auténtico</strong>
              <span className="text-stone-600">Acreditación académica oficial emitida por la Academia Musical Judá.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs sm:text-sm text-stone-800">
            <span className="text-base">💬</span>
            <div>
              <strong className="block text-stone-900">Retroalimentación directa del Mtro. Vega en Google Classroom</strong>
              <span className="text-stone-600">Envía tus grabaciones para corrección personalizada de técnica y estilo.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout / Pricing Card (Wompi El Salvador) */}
      <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Badges strip */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-2xs">
            <span>-38% OFF LANZAMIENTO</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>🏷️ BIENVENIDAJUDA | Cupón: -$10.00 USD</span>
          </span>
        </div>

        {/* Price headline */}
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-4xl sm:text-5xl font-bold text-stone-900">
            ${priceDiscounted}
          </span>
          <span className="text-lg sm:text-xl text-stone-400 line-through">
            ${priceOriginal} USD
          </span>
        </div>

        {/* Price breakdown box */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2 text-xs sm:text-sm text-stone-700">
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Precio de lista:</span>
            <span className="font-semibold">${listPrice} USD</span>
          </div>
          <div className="flex items-center justify-between text-emerald-700 font-medium">
            <span>Descuento código de bienvenida:</span>
            <span>-$10.00 USD</span>
          </div>
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-stone-900 font-bold text-sm sm:text-base">
            <span>Total a pagar:</span>
            <span className="text-amber-950 font-serif">${priceDiscounted} USD</span>
          </div>
        </div>

        {/* Payment Methods Selector (Wompi El Salvador) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Método de Pago Seguro • Wompi El Salvador</span>
          </div>

          <div className="space-y-2">
            <label 
              onClick={() => setSelectedPaymentOption('card')}
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedPaymentOption === 'card' 
                  ? 'border-amber-500 bg-amber-50/50 shadow-2xs' 
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment_option"
                  checked={selectedPaymentOption === 'card'}
                  onChange={() => setSelectedPaymentOption('card')}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs sm:text-sm font-semibold text-stone-900">
                  Tarjeta Crédito / Débito (Visa • MC)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-stone-500">
                Wompi Gateway
              </span>
            </label>

            <label 
              onClick={() => setSelectedPaymentOption('transfer')}
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedPaymentOption === 'transfer' 
                  ? 'border-amber-500 bg-amber-50/50 shadow-2xs' 
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment_option"
                  checked={selectedPaymentOption === 'transfer'}
                  onChange={() => setSelectedPaymentOption('transfer')}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs sm:text-sm font-semibold text-stone-900">
                  Transferencia Agrícola / Wompi Pay
                </span>
              </div>
              <span className="text-xs text-stone-500">Sin recargo</span>
            </label>

            <label 
              onClick={() => setSelectedPaymentOption('points')}
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedPaymentOption === 'points' 
                  ? 'border-amber-500 bg-amber-50/50 shadow-2xs' 
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment_option"
                  checked={selectedPaymentOption === 'points'}
                  onChange={() => setSelectedPaymentOption('points')}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs sm:text-sm font-semibold text-stone-900">
                  Puntos Banco Agrícola
                </span>
              </div>
              <span className="text-xs text-stone-500">Canje directo</span>
            </label>
          </div>
        </div>

        {/* Big Golden CTA Button */}
        <button
          onClick={() => onEnroll(course)}
          className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg transition-transform transform active:scale-98"
        >
          <Lock className="w-5 h-5 text-stone-950" />
          <span>Pagar con Wompi ${priceDiscounted} USD</span>
        </button>

        {/* Trust Badges */}
        <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encriptación SSL de 256-bit • Avalado por Banco Agrícola</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Garantía de devolución del 100% durante 7 días</span>
          </span>
        </div>
      </div>

      {/* "Comentarios de Alumnos" Section (4.9 ★) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-700" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
              Comentarios de Alumnos
            </h2>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-stone-800">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>4.9 de 5.0</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#faf8f5] border border-[#eee7de] rounded-3xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-900 text-amber-300 font-bold text-sm flex items-center justify-center">
                ER
              </div>
              <div>
                <strong className="block text-sm font-bold text-stone-900">
                  Elena Rivera
                </strong>
                <span className="text-[11px] text-stone-500">
                  San Salvador • Hace 4 días
                </span>
              </div>
              <div className="ml-auto flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
              "Empecé desde cero total y en 3 semanas ya toco con ambas manos sin bloquearme. El Mtro. Carlos responde con notas de voz en Classroom, es invaluable."
            </p>
          </div>

          <div className="bg-[#faf8f5] border border-[#eee7de] rounded-3xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-800 text-amber-100 font-bold text-sm flex items-center justify-center">
                SQ
              </div>
              <div>
                <strong className="block text-sm font-bold text-stone-900">
                  Samuel Quintanilla
                </strong>
                <span className="text-[11px] text-stone-500">
                  Santa Ana • Hace 1 semana
                </span>
              </div>
              <div className="ml-auto flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
              "Las clases en vivo por Google Meet combinadas con las pistas de acompañamiento en Drive me permitieron entender la armonía de séptimas de manera muy natural."
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
