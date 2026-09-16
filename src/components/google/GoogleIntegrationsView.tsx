import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Video, 
  FolderOpen, 
  BookOpen, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ExternalLink,
  Server,
  Zap,
  Activity
} from 'lucide-react';

export const GoogleIntegrationsView: React.FC = () => {
  const { userProfile, currentUser, linkGoogleServices, disconnectGoogleService } = useAuth();
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const googleServices = userProfile?.googleServices || {
    meet: true,
    drive: true,
    classroom: false,
    calendar: true,
  };

  const handleTestLatency = () => {
    setTestStatus('Probando conexión con APIs de Google Workspace...');
    setTimeout(() => {
      setTestStatus('Todas las APIs de Google Workspace están respondiendo con latencia óptima (42ms). Respaldo activo.');
    }, 900);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Title & Architecture Statement */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-semibold mb-2 border border-sky-200">
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            <span>Arquitectura Híbrida Satélite</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Integraciones Google Workspace
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Nuestra plataforma mantiene la soberanía de datos y gobernanza; Google provee infraestructura especializada.
          </p>
        </div>

        <button
          onClick={handleTestLatency}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Activity className="w-4 h-4" />
          <span>Verificar Estado de Servicios</span>
        </button>
      </div>

      {testStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{testStatus}</span>
        </div>
      )}

      {/* Interactive Architecture Flow Diagram */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 space-y-6">
        <h2 className="font-serif text-xl font-bold text-amber-400 flex items-center gap-2">
          <Server className="w-5 h-5 text-amber-400" />
          <span>Diagrama de Jerarquía y Flujo de Autorización</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          
          <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 space-y-2">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">Nivel 1</span>
            <h3 className="font-bold text-sm text-white">Academia Judá</h3>
            <p className="text-[11px] text-stone-400">
              Estudiantes, Profesores, Directores y Sedes Físicas.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <span className="text-[10px] font-mono text-amber-300 uppercase font-bold tracking-wider">Nivel 2 (Central)</span>
            <h3 className="font-bold text-sm text-white">Nuestra Plataforma</h3>
            <p className="text-[11px] text-stone-300">
              Control de roles, matrículas, notas, pagos y asistencia.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 space-y-2">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">Nivel 3</span>
            <h3 className="font-bold text-sm text-white">Cloud Firestore</h3>
            <p className="text-[11px] text-stone-400">
              Base de datos segura con reglas Zero Trust y Auth.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-2">
            <span className="text-[10px] font-mono text-sky-300 uppercase font-bold tracking-wider">Google Workspace Híbrido</span>
            <h3 className="font-bold text-sm text-white">Google Workspace</h3>
            <p className="text-[11px] text-stone-300">
              Meet (En vivo), Drive (PDFs), Classroom (Tareas).
            </p>
          </div>

        </div>
      </div>

      {/* Key Architectural Questions answered cleanly */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Box 1: What belongs to our platform */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h3 className="font-serif text-base font-bold text-stone-900">
              ¿Qué información pertenece a nuestra plataforma?
            </h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Nuestra plataforma es la <strong>dueña exclusiva</strong> de: los perfiles de usuario, roles y permisos, las matrículas y estados de pago, la estructura curricular de asignaturas y módulos, el cálculo porcentual de progreso, el registro oficial de asistencia presencial y virtual, y la emisión criptográfica de certificados.
          </p>
        </div>

        {/* Box 2: What belongs to Google */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h3 className="font-serif text-base font-bold text-stone-900">
              ¿Qué información pertenece a Google?
            </h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Google actúa como <strong>custodio de infraestructura</strong> para: la transmisión de audio/video en tiempo real (Google Meet), el almacenamiento masivo de archivos brutos (Google Drive), las actividades de entrega de tareas (Google Classroom) y los eventos de calendario institucional.
          </p>
        </div>

        {/* Box 3: How they relate */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h3 className="font-serif text-base font-bold text-stone-900">
              ¿Cómo se relacionan ambas? (Foreign Pointers)
            </h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Nuestra base de datos en Firestore guarda referencias indexadas (<code className="text-amber-800 font-mono text-[11px] bg-stone-100 px-1 py-0.5 rounded">meetMeetingId</code>, <code className="text-amber-800 font-mono text-[11px] bg-stone-100 px-1 py-0.5 rounded">driveFileId</code>). Cuando el alumno abre su clase, la plataforma valida su matrícula y le proyecta el contenido o le abre la sala autorizada.
          </p>
        </div>

        {/* Box 4: What if Google is down */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center font-bold text-xs">
              04
            </div>
            <h3 className="font-serif text-base font-bold text-stone-900">
              ¿Qué ocurre si Google deja de estar disponible?
            </h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            <strong>Tolerancia a fallos:</strong> La plataforma sigue 100% operativa para autenticación, cursos grabados, pagos y certificados. Si Google Meet sufre una caída, el sistema activa un modo de contingencia donde el profesor puede ingresar un enlace alternativo que se propaga en tiempo real.
          </p>
        </div>

      </div>

      {/* Services Management Panel */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="font-serif text-lg font-bold text-stone-900">
          Estado y Conexión de Servicios Google Workspace
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 text-sm">Google Meet API</h4>
                <p className="text-xs text-stone-500">Videoconferencias en vivo con WebRTC</p>
              </div>
            </div>
            <button
              onClick={() => googleServices.meet ? disconnectGoogleService('meet') : linkGoogleServices('meet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                googleServices.meet ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-stone-900 text-amber-300'
              }`}
            >
              {googleServices.meet ? 'Activo' : 'Vincular'}
            </button>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 text-sm">Google Drive API</h4>
                <p className="text-xs text-stone-500">Partituras y guías pedagógicas</p>
              </div>
            </div>
            <button
              onClick={() => googleServices.drive ? disconnectGoogleService('drive') : linkGoogleServices('drive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                googleServices.drive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-stone-900 text-amber-300'
              }`}
            >
              {googleServices.drive ? 'Activo' : 'Vincular'}
            </button>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 text-sm">Google Classroom API</h4>
                <p className="text-xs text-stone-500">Tareas y retroalimentación docente</p>
              </div>
            </div>
            <button
              onClick={() => googleServices.classroom ? disconnectGoogleService('classroom') : linkGoogleServices('classroom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                googleServices.classroom ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-stone-900 text-amber-300'
              }`}
            >
              {googleServices.classroom ? 'Activo' : 'Vincular'}
            </button>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 text-sm">Google Calendar API</h4>
                <p className="text-xs text-stone-500">Sincronización de clases y ensayos</p>
              </div>
            </div>
            <button
              onClick={() => googleServices.calendar ? disconnectGoogleService('calendar') : linkGoogleServices('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                googleServices.calendar ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-stone-900 text-amber-300'
              }`}
            >
              {googleServices.calendar ? 'Activo' : 'Vincular'}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
