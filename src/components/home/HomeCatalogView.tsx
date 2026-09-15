import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ActiveNavRoute } from '../../types';
import { JudaLogo } from '../common/JudaLogo';
import { 
  Music, 
  Video, 
  MapPin, 
  PlayCircle, 
  Radio, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  GraduationCap,
  CheckCircle2,
  Star,
  HelpCircle,
  Mail,
  Phone,
  Clock,
  Send,
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
  Lock,
  Headphones,
  Check
} from 'lucide-react';

interface HomeCatalogViewProps {
  onNavigate: (route: ActiveNavRoute) => void;
  onOpenAuth: () => void;
}

export const HomeCatalogView: React.FC<HomeCatalogViewProps> = ({
  onNavigate,
  onOpenAuth,
}) => {
  const { currentUser, role } = useAuth();

  // State for interactive filters and accordions
  const [selectedInstrument, setSelectedInstrument] = useState<string>('todos');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    instrumento: 'Piano',
    modalidad: 'Virtual en Vivo (Google Meet)',
    mensaje: '',
  });

  const [enrollForm, setEnrollForm] = useState({
    nombre: '',
    email: '',
    instrumento: 'Piano',
    modalidad: 'Virtual en Vivo (Google Meet)',
    horario: 'Tarde (16:00 - 18:00)',
  });
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  const modalities = [
    {
      id: 'online',
      title: 'Online Flexible',
      tag: '100% Digital',
      icon: <Video className="w-5 h-5 text-sky-600" />,
      desc: 'Formación flexible desde cualquier lugar del mundo con acceso a la plataforma 24/7 y asesoría periódica.',
      color: 'border-sky-200 bg-sky-50/50',
      highlights: ['Acceso desde cualquier dispositivo', 'Soporte vía Google Classroom', 'Certificación digital'],
    },
    {
      id: 'presencial',
      title: 'Presencial',
      tag: 'Sede Central',
      icon: <MapPin className="w-5 h-5 text-amber-600" />,
      desc: 'Instrucción directa en cabinas insonorizadas y auditorio de la academia con pianos de cola e instrumentos profesionales.',
      color: 'border-amber-200 bg-amber-50/50',
      highlights: ['Pianos de cola y cabinas acústicas', 'Prácticas de ensamble en auditorio', 'Material impreso y digital'],
    },
    {
      id: 'live_virtual',
      title: 'Clases Virtuales en Vivo',
      tag: 'Google Meet',
      icon: <Radio className="w-5 h-5 text-emerald-600" />,
      desc: 'Clases sincrónicas en tiempo real por Google Meet con retroalimentación instantánea del maestro titular.',
      color: 'border-emerald-200 bg-emerald-50/50',
      highlights: ['Salas Google Meet protegidas', 'Corrección técnica en directo', 'Grupos reducidos o individuales'],
    },
    {
      id: 'recorded',
      title: 'Cursos Grabados',
      tag: 'A tu propio ritmo',
      icon: <PlayCircle className="w-5 h-5 text-indigo-600" />,
      desc: 'Videolecciones en alta definición, partituras descargables desde Google Drive y ejercicios interactivos.',
      color: 'border-indigo-200 bg-indigo-50/50',
      highlights: ['Biblioteca de video 24/7', 'Partituras y guías descargables', 'Evaluaciones por módulo'],
    },
  ];

  const benefits = [
    {
      icon: <Award className="w-5 h-5 text-amber-600" />,
      title: 'Maestros de Conservatorio',
      desc: 'Claustro docente con formación superior en conservatorios y sólida trayectoria concertista y pedagógica.',
    },
    {
      icon: <Radio className="w-5 h-5 text-emerald-600" />,
      title: 'Clases en Google Meet',
      desc: 'Sesiones interactivas con audio optimizado para instrumentos y retroalimentación postural en tiempo real.',
    },
    {
      icon: <FileText className="w-5 h-5 text-sky-600" />,
      title: 'Material en Google Drive',
      desc: 'Acceso seguro a tu carpeta de partituras, métodos de técnica, audios de referencia y pistas de práctica.',
    },
    {
      icon: <BookOpen className="w-5 h-5 text-indigo-600" />,
      title: 'Actividades en Classroom',
      desc: 'Seguimiento de tareas, envío de videos de práctica y retroalimentación detallada de tu maestro.',
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-teal-600" />,
      title: 'Seguimiento del Progreso',
      desc: 'Monitoreo continuo lección a lección de tus avances técnicos, repertorio dominado y asistencia.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-stone-800" />,
      title: 'Certificación Oficial',
      desc: 'Diplomas acreditativos con código criptográfico de verificación y firma de dirección académica.',
    },
  ];

  const professors = [
    {
      name: 'Mtro. Carlos Mendoza',
      instrument: 'Piano',
      title: 'Licenciado en Piano Clásico & Teclados',
      origin: 'Conservatorio Nacional de Música',
      experience: '18 años de trayectoria concertista y docente',
      bio: 'Especialista en técnica rusa de piano, lectura a primera vista, contrapunto barroco y teclados contemporáneos.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Mtra. Valentina Chen',
      instrument: 'Violín',
      title: 'Solista & Pedagoga de Cuerdas',
      origin: 'Orquesta Filarmónica & Conservatorio Superior',
      experience: '14 años formando violinistas de concierto',
      bio: 'Enfoque en afinación precisa, arco expresivo, colocación corporal y repertorio desde el método Suzuki hasta sonatas.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Prof. Marcos Andrade',
      instrument: 'Guitarra',
      title: 'Magíster en Armonía Moderna & Guitarra',
      origin: 'Facultad de Bellas Artes & Jazz Institute',
      experience: '12 años en producción y docencia',
      bio: 'Domina guitarra clásica, acústica y eléctrica. Creador de metodologías de improvisación, lectura de tablaturas y fingerstyle.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Mtra. Elena Rostova',
      instrument: 'Canto',
      title: 'Soprano Lírica & Vocal Coach',
      origin: 'Academia Lírica & Master en Técnica Vocal',
      experience: '16 años en preparación vocal y coros',
      bio: 'Pionera en técnica respiratoria diafragmática, colocación de resonadores, dicción y estilo para canto lírico y popular.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const courses = [
    {
      id: 'course-piano',
      title: 'Piano Clásico & Teclados Modernos',
      instrument: 'Piano',
      level: 'Principiante a Avanzado',
      modality: 'Virtual en Vivo (Meet) & Presencial',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      duration: '4 a 6 meses por módulo',
      price: '$79 / mes',
      description: 'Postura, lectura en clave de sol y fa, independencia de manos, escalas, arpegios y obras desde Bach hasta música contemporánea.',
      highlights: ['Sesiones en Google Meet con dos ángulos de cámara', 'Partituras y ejercicios en Google Drive', 'Exámenes prácticos con informe evaluativo'],
    },
    {
      id: 'course-violin',
      title: 'Violín Acústico & Técnica de Arco',
      instrument: 'Violín',
      level: 'Inicial a Intermedio',
      modality: 'Virtual en Vivo (Meet) & Presencial',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
      duration: '4 meses por ciclo',
      price: '$79 / mes',
      description: 'Sujeción del instrumento y arco, afinación exacta, cambios de posición, vibrato y ensambles grupales de cuerdas.',
      highlights: ['Acompañamiento auditivo en Google Meet', 'Pistas de acompañamiento orquestal en Drive', 'Tareas de afinación en Classroom'],
    },
    {
      id: 'course-guitar',
      title: 'Guitarra Acústica, Eléctrica & Armonía',
      instrument: 'Guitarra',
      level: 'Todos los niveles',
      modality: 'Online, Grabado y Virtual en Vivo',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      duration: '3 a 6 meses',
      price: '$69 / mes',
      description: 'Acordes básicos y extendidos, ritmos populares, fingerpicking, solos, escalas pentatónicas e improvisación sobre pistas.',
      highlights: ['Videolecciones HD descargables', 'Tablaturas y diagramas en PDF en Drive', 'Feedback personalizado de video'],
    },
    {
      id: 'course-canto',
      title: 'Canto Contemporáneo & Técnica Vocal',
      instrument: 'Canto',
      level: 'Principiante a Avanzado',
      modality: 'Presencial & Virtual en Vivo (Meet)',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      duration: '4 meses por nivel',
      price: '$79 / mes',
      description: 'Apoyo respiratorio diafragmático, afinación, tesitura vocal, interpretación escénica y cuidado de la salud de las cuerdas vocales.',
      highlights: ['Cabinas insonorizadas o salas Meet individuales', 'Ejercicios de vocalización grabados en Drive', 'Asesoría vocal continua'],
    },
  ];

  const pricingPlans = [
    {
      name: 'Cursos Grabados',
      modality: 'Online Autoguiado',
      price: '$29',
      period: 'al mes',
      badge: 'Flexible',
      description: 'Aprende a tu propio ritmo desde cualquier lugar con acceso 24/7 a videoclases HD y partituras.',
      features: [
        'Acceso ilimitado a biblioteca de lecciones 24/7',
        'Partituras y guías descargables desde Google Drive',
        'Quizzes interactivos de teoría musical',
        'Soporte por correo de dudas académicas',
        'Certificado de finalización por módulo',
      ],
      cta: 'Elegir Plan Grabado',
      popular: false,
    },
    {
      name: 'Clases Virtuales en Vivo',
      modality: 'Google Meet en Tiempo Real',
      price: '$69',
      period: 'al mes',
      badge: 'Más Solicitado',
      description: 'Interacción directa con tu profesor titular semanalmente con retroalimentación inmediata de tu técnica.',
      features: [
        'Clases semanales sincrónicas por Google Meet',
        'Grupos reducidos (máximo 4 alumnos) o individual',
        'Carpeta personal de partituras en Google Drive',
        'Actividades, tareas y revisiones en Google Classroom',
        'Seguimiento continuo de progreso lección a lección',
        'Acceso de cortesía a las videoclases grabadas',
      ],
      cta: 'Inscribirme en Vivo',
      popular: true,
    },
    {
      name: 'Presencial en Sede',
      modality: 'En Cabinas Acústicas',
      price: '$89',
      period: 'al mes',
      badge: 'Experiencia Total',
      description: 'Clases en nuestras instalaciones con pianos de cola, cabinas insonorizadas y auditorio.',
      features: [
        'Sesiones individuales en cabina acústica profesional',
        'Uso libre de instrumentos de la academia',
        'Prácticas de ensamble orquestal y recitales en auditorio',
        'Material impreso oficial y acceso digital a Google Drive',
        'Asistencia registrada y carné institucional de alumno',
      ],
      cta: 'Elegir Plan Presencial',
      popular: false,
    },
    {
      name: 'Diplomado Integral Híbrido',
      modality: 'Presencial + Meet + Grabados',
      price: '$119',
      period: 'al mes',
      badge: 'Formación Completa',
      description: 'El programa más completo para músicos que desean dominar el instrumento y la teoría profesional.',
      features: [
        'Clases presenciales + sesiones virtuales de apoyo en Meet',
        'Curso intensivo de Solfeo, Armonía y Audio',
        'Acceso total a repositorio de partituras en Google Drive',
        'Masterclasses exclusivas con concertistas invitados',
        'Preparación para audiciones y recital final con diploma oficial',
      ],
      cta: 'Comenzar Diplomado',
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: 'Sofía Valenzuela',
      role: 'Alumna de Piano Clásico (Modalidad Virtual Meet)',
      stars: 5,
      comment: 'Pensé que aprender piano en línea sería difícil, pero con las clases en Google Meet y las correcciones de postura del maestro Carlos he avanzado más en 5 meses que en 2 años por mi cuenta.',
    },
    {
      name: 'Ing. Fernando Morales',
      role: 'Padre de Mateo (8 años, Alumno de Violín Presencial)',
      stars: 5,
      comment: 'La disciplina, el trato con los niños y la paciencia de la maestra Valentina son extraordinarios. El portal para padres nos permite ver el progreso y las partituras en Drive sin complicaciones.',
    },
    {
      name: 'Daniela Reyes',
      role: 'Alumna de Canto & Técnica Vocal (Online Híbrido)',
      stars: 5,
      comment: 'Los ejercicios diafragmáticos y las grabaciones de retroalimentación en Classroom cambiaron mi registro vocal por completo. Ya no tengo fatiga al cantar y gané mucha confianza.',
    },
    {
      name: 'Rodrigo Gómez',
      role: 'Alumno de Guitarra Eléctrica & Armonía (Cursos Grabados)',
      stars: 5,
      comment: 'Trabajo por turnos rotativos y los cursos grabados me salvaron. Practico a las 11 de la noche, descargo las tablaturas y envío mis videos para que el profesor Marcos me guíe.',
    },
  ];

  const faqs = [
    {
      q: '¿Necesito tener un instrumento propio antes de empezar?',
      a: 'Para las modalidades Online y Virtual en Vivo es muy recomendable contar con un teclado, violín o guitarra para tus prácticas diarias en casa. Para la modalidad Presencial, la academia pone a disposición pianos, cabinas y guitarras durante tus lecciones y horas de estudio en sede.',
    },
    {
      q: '¿Cómo funcionan las clases virtuales por Google Meet?',
      a: 'Una vez matriculado, recibes el acceso a tu aula virtual en nuestro portal. Al llegar la hora de tu clase, ingresas directamente a la sala de Google Meet asignada a tu curso. Tu maestro utiliza cámaras de alta definición y micrófonos calibrados para instrumentos acústicos.',
    },
    {
      q: '¿Cómo recibo las partituras y el material de estudio?',
      a: 'A través de la integración con Google Drive, cada alumno cuenta con una carpeta académica sincronizada que contiene las partituras oficiales en PDF, pistas de práctica y audios de referencia ordenados por lección.',
    },
    {
      q: '¿Qué sucede si un día no puedo asistir a mi clase virtual o presencial?',
      a: 'Puedes solicitar la reprogramación de tu clase con al menos 24 horas de anticipación a través de secretaría o tu portal de alumno. Además, tienes acceso continuo al material de refuerzo y lecciones de apoyo.',
    },
    {
      q: '¿Otorgan certificado o diploma de estudios?',
      a: 'Sí. Al culminar cada ciclo académico y aprobar la audición o entrega de actividades, se emite un certificado oficial con código de verificación criptográfico que valida tus competencias musicales.',
    },
    {
      q: '¿Cuáles son las opciones y métodos de pago?',
      a: 'Aceptamos transferencias bancarias, tarjetas de débito/crédito y depósitos locales. Los pagos son verificados y conciliados directamente por la secretaría administrativa de la academia.',
    },
  ];

  const filteredCourses = selectedInstrument === 'todos'
    ? courses
    : courses.filter(c => c.instrument.toLowerCase() === selectedInstrument.toLowerCase());

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({
        nombre: '',
        email: '',
        telefono: '',
        instrumento: 'Piano',
        modalidad: 'Virtual en Vivo (Google Meet)',
        mensaje: '',
      });
    }, 4000);
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollSuccess(true);
    setTimeout(() => {
      setEnrollSuccess(false);
      onOpenAuth();
    }, 2000);
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* HERO SECTION — FASE 16 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* Official Brand Logo presentation */}
          <div className="flex justify-center mb-4">
            <JudaLogo size="xl" variant="full" theme="dark" className="h-16 sm:h-20" />
          </div>

          {/* Top Pill: ACADEMIA MUSICAL */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-400 text-xs sm:text-sm font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>CONSERVATORIO & FORMACIÓN MUSICAL</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Aprende música desde cualquier lugar
          </h1>

          {/* Instruments subtitle */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-base sm:text-xl font-medium text-amber-200/90 tracking-wide font-serif">
            <span>Piano</span>
            <span className="text-amber-500">•</span>
            <span>Violín</span>
            <span className="text-amber-500">•</span>
            <span>Guitarra</span>
            <span className="text-amber-500">•</span>
            <span>Canto</span>
          </div>

          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Formación instrumental y vocal de alto nivel. Aprende con maestros concertistas mediante <strong>clases virtuales en vivo por Google Meet, modalidad presencial, online y cursos grabados</strong> con seguimiento integral de tu progreso y partituras en Google Drive.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#cursos"
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Music className="w-4 h-4" />
              <span>Ver cursos</span>
            </a>

            <a
              href="#inscripcion"
              className="px-8 py-3.5 bg-stone-800/80 hover:bg-stone-800 border border-stone-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Inscripción en línea</span>
            </a>

            {currentUser && (
              <button
                onClick={() => onNavigate(role === 'student' ? 'student-portal' : role === 'teacher' ? 'teacher-portal' : 'admin-dashboard')}
                className="px-6 py-3.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
              >
                <span>Ir a mi Portal ({role.toUpperCase()})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* High-level trust badges */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-stone-400 border-t border-stone-800/80 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>Google Meet en vivo</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Material en Drive</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Seguimiento lección a lección</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Certificación oficial</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

        {/* 1. MODALIDADES DE ESTUDIO */}
        <section id="modalidades" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Flexibilidad de Aprendizaje
            </span>
            <h2 className="font-serif text-3xl font-bold text-stone-900">
              Modalidades de Estudio
            </h2>
            <p className="text-sm text-stone-600">
              Elige el formato que mejor se adapta a tus horarios, ubicación y objetivos musicales.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {modalities.map((m) => (
              <div
                key={m.id}
                className={`p-6 rounded-2xl border ${m.color} shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-white shadow-xs flex items-center justify-center">
                      {m.icon}
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/80 border border-stone-200 text-stone-800">
                      {m.tag}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                    {m.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    {m.desc}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-stone-200/60">
                    {m.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-stone-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => onNavigate('courses')}
                    className="w-full py-2.5 px-3 text-center rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4 text-stone-950" />
                    <span>Ver Curso y Clase Muestra</span>
                  </button>

                  <a
                    href="#inscripcion"
                    className="w-full py-2 px-3 text-center rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs font-bold text-stone-800 transition-colors shadow-2xs block"
                  >
                    Consultar disponibilidad
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. BENEFICIOS */}
        <section id="beneficios" className="space-y-8 bg-stone-50/80 p-8 sm:p-12 rounded-3xl border border-stone-200">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              ¿Por qué elegirnos?
            </span>
            <h2 className="font-serif text-3xl font-bold text-stone-900">
              Beneficios de Estudiar en Academia Musical Judá
            </h2>
            <p className="text-sm text-stone-600">
              Una estructura académica sólida respaldada por herramientas de vanguardia y pedagogía musical personalizada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, idx) => (
              <div
                key={idx}
                className="bg-white border border-stone-200 p-6 rounded-2xl shadow-2xs hover:border-amber-300 transition-colors space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                  {b.icon}
                </div>
                <h3 className="font-serif text-base font-bold text-stone-900">
                  {b.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. CLAUSTRO DE PROFESORES */}
        <section id="profesores" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Claustro Docente
            </span>
            <h2 className="font-serif text-3xl font-bold text-stone-900">
              Nuestros Profesores & Maestros
            </h2>
            <p className="text-sm text-stone-600">
              Artistas titulados, concertistas y pedagogos dedicados a guiar tu evolución técnica e interpretativa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {professors.map((p, idx) => (
              <div
                key={idx}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3 bg-stone-900/85 backdrop-blur-xs text-amber-400 font-bold text-[10px] px-2.5 py-1 rounded-full border border-stone-700">
                      {p.instrument}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      {p.name}
                    </h3>
                    <p className="text-xs font-semibold text-amber-800">
                      {p.title}
                    </p>
                    <p className="text-[11px] text-stone-500 font-medium">
                      {p.origin} • {p.experience}
                    </p>
                    <p className="text-xs text-stone-600 leading-relaxed pt-2">
                      {p.bio}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <span className="block text-center text-[11px] font-semibold text-stone-500 bg-stone-50 py-1.5 rounded-lg border border-stone-100">
                    Cursos asignados en Meet & Sede
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. CATÁLOGO DE CURSOS */}
        <section id="cursos" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Oferta Académica
              </span>
              <h2 className="font-serif text-3xl font-bold text-stone-900">
                Cursos Disponibles
              </h2>
              <p className="text-sm text-stone-600">
                Selecciona tu instrumento para ver el detalle pedagógico, modalidades y recursos integrados.
              </p>
            </div>

            {/* Instrument Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {['todos', 'Piano', 'Violín', 'Guitarra', 'Canto'].map((inst) => (
                <button
                  key={inst}
                  onClick={() => setSelectedInstrument(inst)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors capitalize ${
                    selectedInstrument.toLowerCase() === inst.toLowerCase()
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {inst}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:border-amber-400 transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${c.badgeColor}`}>
                      {c.instrument} • {c.level}
                    </span>
                    <span className="text-xs font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg">
                      {c.price}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-stone-900">
                    {c.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                      Recursos & Integraciones Académicas:
                    </span>
                    {c.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-stone-700 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex items-center gap-3">
                  <a
                    href="#inscripcion"
                    className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-xl text-xs text-center transition-colors shadow-xs"
                  >
                    Inscribirme a este curso
                  </a>
                  <button
                    onClick={() => onNavigate('courses')}
                    className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Ver pensum
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. PRECIOS & PLANES */}
        <section id="precios" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Inversión Transparente
            </span>
            <h2 className="font-serif text-3xl font-bold text-stone-900">
              Planes & Precios
            </h2>
            <p className="text-sm text-stone-600">
              Tarifas claras sin costos ocultos. Incluyen acceso a herramientas digitales y biblioteca de partituras.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'bg-stone-900 text-white shadow-xl ring-2 ring-amber-400 relative'
                    : 'bg-white border border-stone-200 shadow-xs'
                }`}
              >
                <div>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 font-bold text-[10px] uppercase px-3 py-0.5 rounded-full shadow-xs">
                      Recomendado
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-serif text-lg font-bold ${plan.popular ? 'text-white' : 'text-stone-900'}`}>
                      {plan.name}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      plan.popular ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>

                  <p className={`text-xs mb-4 ${plan.popular ? 'text-stone-300' : 'text-stone-500'}`}>
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                      {plan.price}
                    </span>
                    <span className={`text-xs ${plan.popular ? 'text-stone-400' : 'text-stone-500'}`}>
                      {plan.period}
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-stone-200/20 mb-6">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <Check className={`w-4 h-4 shrink-0 ${plan.popular ? 'text-amber-400' : 'text-emerald-600'}`} />
                        <span className={plan.popular ? 'text-stone-300' : 'text-stone-600'}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href="#inscripcion"
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-center transition-colors shadow-xs ${
                    plan.popular
                      ? 'bg-amber-400 hover:bg-amber-300 text-stone-950'
                      : 'bg-stone-900 hover:bg-stone-800 text-amber-400'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 6. TESTIMONIOS */}
        <section id="testimonios" className="space-y-8 bg-stone-50/80 p-8 sm:p-12 rounded-3xl border border-stone-200">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Experiencias de Éxito
            </span>
            <h2 className="font-serif text-3xl font-bold text-stone-900">
              Lo que Dicen Nuestros Alumnos
            </h2>
            <p className="text-sm text-stone-600">
              Conoce el testimonio de quienes ya están transformando su talento musical junto a nosotros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white border border-stone-200 p-6 rounded-2xl shadow-2xs space-y-4"
              >
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-stone-700 text-xs sm:text-sm italic leading-relaxed">
                  "{t.comment}"
                </p>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-stone-900">
                      {t.name}
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      {t.role}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Verificado
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. PREGUNTAS FRECUENTES (FAQ) */}
        <section id="faq" className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Resolvemos tus Dudas
            </span>
            <h2 className="font-serif text-3xl font-bold text-stone-900">
              Preguntas Frecuentes (FAQ)
            </h2>
            <p className="text-sm text-stone-600">
              Todo lo que necesitas saber antes de iniciar tu proceso formativo.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-stone-200 rounded-2xl overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif text-sm sm:text-base font-bold text-stone-900 hover:text-amber-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-amber-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 bg-stone-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 8. FORMULARIO DE INSCRIPCIÓN DIRECTA */}
        <section id="inscripcion" className="bg-gradient-to-br from-stone-900 to-amber-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-stone-800 space-y-8">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold">
              <GraduationCap className="w-4 h-4" />
              <span>Matrícula & Registro Académico</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Inicia tu Formación Musical Hoy
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm">
              Completa el formulario de reserva para asegurar tu cupo y ser asignado a tu sala de Google Meet o cabina presencial.
            </p>
          </div>

          <form onSubmit={handleEnrollSubmit} className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-stone-300 font-semibold">Nombre y Apellido</label>
              <input
                type="text"
                required
                value={enrollForm.nombre}
                onChange={(e) => setEnrollForm({ ...enrollForm, nombre: e.target.value })}
                placeholder="Ej. Mateo Gómez"
                className="w-full bg-stone-800/90 border border-stone-700 rounded-xl px-3.5 py-2.5 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-300 font-semibold">Correo Electrónico</label>
              <input
                type="email"
                required
                value={enrollForm.email}
                onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                placeholder="alumno@ejemplo.com"
                className="w-full bg-stone-800/90 border border-stone-700 rounded-xl px-3.5 py-2.5 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-300 font-semibold">Instrumento de Interés</label>
              <select
                value={enrollForm.instrumento}
                onChange={(e) => setEnrollForm({ ...enrollForm, instrumento: e.target.value })}
                className="w-full bg-stone-800/90 border border-stone-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 text-xs"
              >
                <option value="Piano">Piano</option>
                <option value="Violín">Violín</option>
                <option value="Guitarra">Guitarra</option>
                <option value="Canto">Canto</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-stone-300 font-semibold">Modalidad Preferida</label>
              <select
                value={enrollForm.modalidad}
                onChange={(e) => setEnrollForm({ ...enrollForm, modalidad: e.target.value })}
                className="w-full bg-stone-800/90 border border-stone-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 text-xs"
              >
                <option value="Virtual en Vivo (Google Meet)">Virtual en Vivo (Google Meet)</option>
                <option value="Presencial (Sede Central)">Presencial (Sede Central)</option>
                <option value="Cursos Grabados (Online 24/7)">Cursos Grabados (Online 24/7)</option>
                <option value="Diplomado Integral Híbrido">Diplomado Integral Híbrido</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-stone-300 font-semibold">Horario de Preferencia</label>
              <select
                value={enrollForm.horario}
                onChange={(e) => setEnrollForm({ ...enrollForm, horario: e.target.value })}
                className="w-full bg-stone-800/90 border border-stone-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 text-xs"
              >
                <option value="Mañana (09:00 - 12:00)">Mañana (09:00 - 12:00)</option>
                <option value="Tarde (14:00 - 17:00)">Tarde (14:00 - 17:00)</option>
                <option value="Noche (18:00 - 21:00)">Noche (18:00 - 21:00)</option>
                <option value="Sábados Intensivo">Sábados Intensivo</option>
              </select>
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Continuar Inscripción & Crear Cuenta</span>
              </button>
            </div>

            {enrollSuccess && (
              <div className="sm:col-span-2 p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 rounded-xl text-center text-xs">
                ¡Pre-inscripción registrada! Abriendo el portal para vincular tu cuenta...
              </div>
            )}
          </form>
        </section>

        {/* 9. CONTACTO & SEDE */}
        <section id="contacto" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Estamos para Servirte
            </span>
            <h2 className="font-serif text-3xl font-bold text-stone-900">
              Contacto & Atención Académica
            </h2>
            <p className="text-sm text-stone-600">
              ¿Tienes preguntas sobre horarios, sedes o audiciones? Escríbenos directamente.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info Cards */}
            <div className="space-y-4">
              <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-2xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h4 className="font-serif text-sm font-bold text-stone-900">
                  Sede Central & Cabinas
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Av. Las Bellas Artes 450, Edificio Conservatorio, Sala de Conciertos Judá.
                </p>
              </div>

              <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-2xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <h4 className="font-serif text-sm font-bold text-stone-900">
                  Teléfono & WhatsApp Académico
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  +502 5555-1234 • Consultas directas de 08:00 a 20:00 hrs.
                </p>
              </div>

              <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-2xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="font-serif text-sm font-bold text-stone-900">
                  Horarios de Atención
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Lunes a Viernes: 08:00 - 20:30 hrs.<br />
                  Sábados: 08:00 - 18:00 hrs.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 bg-white border border-stone-200 p-6 sm:p-8 rounded-2xl shadow-sm">
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-4">
                Envíanos un Mensaje
              </h3>

              <form onSubmit={handleContactSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-stone-700 font-semibold">Tu Nombre</label>
                  <input
                    type="text"
                    required
                    value={contactForm.nombre}
                    onChange={(e) => setContactForm({ ...contactForm, nombre: e.target.value })}
                    placeholder="Ej. Ana Morales"
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-700 font-semibold">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="tu@correo.com"
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-700 font-semibold">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    value={contactForm.telefono}
                    onChange={(e) => setContactForm({ ...contactForm, telefono: e.target.value })}
                    placeholder="+502 ..."
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-700 font-semibold">Instrumento</label>
                  <select
                    value={contactForm.instrumento}
                    onChange={(e) => setContactForm({ ...contactForm, instrumento: e.target.value })}
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
                  >
                    <option value="Piano">Piano</option>
                    <option value="Violín">Violín</option>
                    <option value="Guitarra">Guitarra</option>
                    <option value="Canto">Canto</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-stone-700 font-semibold">Consulta o Mensaje</label>
                  <textarea
                    rows={4}
                    required
                    value={contactForm.mensaje}
                    onChange={(e) => setContactForm({ ...contactForm, mensaje: e.target.value })}
                    placeholder="Cuéntanos sobre tu nivel, disponibilidad u objetivos..."
                    className="w-full border border-stone-300 rounded-xl p-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="py-3 px-6 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Consulta a Secretaría</span>
                  </button>
                </div>

                {contactSubmitted && (
                  <div className="sm:col-span-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center text-xs">
                    ¡Gracias! Tu mensaje ha sido enviado exitosamente. Nos comunicaremos contigo en breve.
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
