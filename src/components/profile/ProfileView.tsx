import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { 
  User, 
  Mail, 
  Phone, 
  Music, 
  Shield, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Video, 
  FolderOpen, 
  BookOpen, 
  Calendar, 
  Save, 
  RefreshCw, 
  Terminal, 
  Lock,
  ExternalLink,
  Info
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { 
    currentUser, 
    userProfile, 
    role, 
    isEmailVerified, 
    resendVerificationEmail, 
    updateProfileData,
    linkGoogleServices,
    disconnectGoogleService,
    simulateClientTampering
  } = useAuth();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || currentUser?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [instrument, setInstrument] = useState(userProfile?.instrument || 'Piano & Teclados');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);
  
  // Anti-tampering simulation test state
  const [tamperingResult, setTamperingResult] = useState<any | null>(null);

  const getRoleInfo = (r: UserRole) => {
    switch (r) {
      case 'superadmin':
        return {
          title: 'Superadministrador',
          description: 'Control y soberanía total del sistema, roles, integraciones Google y finanzas.',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        };
      case 'admin':
        return {
          title: 'Administrador Académico',
          description: 'Gestión de matrículas, alumnos, pagos, sedes y asignación de profesores.',
          badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300',
        };
      case 'teacher':
        return {
          title: 'Profesor Titular',
          description: 'Gestión de aulas virtuales en Google Meet, subida de partituras a Drive y calificaciones.',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        };
      case 'student':
      default:
        return {
          title: 'Estudiante de Música',
          description: 'Acceso a cursos inscritos, materiales de Drive, salas de Meet en vivo y certificados.',
          badgeClass: 'bg-sky-100 text-sky-900 border-sky-300',
        };
    }
  };

  const roleInfo = getRoleInfo(role);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfileData({
        displayName,
        phone,
        instrument,
        bio,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch {
      alert('Error al actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendVerification = async () => {
    setVerifying(true);
    setVerifyNotice(null);
    try {
      await resendVerificationEmail();
      setVerifyNotice('Se ha enviado un enlace de verificación a tu correo.');
    } catch (err: any) {
      setVerifyNotice('Error al enviar correo de verificación: ' + (err.message || 'Intenta más tarde'));
    } finally {
      setVerifying(false);
    }
  };

  const runTamperingTest = () => {
    const res = simulateClientTampering();
    setTamperingResult(res);
  };

  const googleServices = userProfile?.googleServices || {
    meet: true,
    drive: true,
    classroom: false,
    calendar: true,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Title & Introduction */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Mi Perfil de la Academia
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Información de cuenta, credenciales de autorización y servicios vinculados de Google Workspace.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Role & Security Card */}
        <div className="space-y-6">
          
          {/* Identity & Verified Role Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <div className="text-center pb-6 border-b border-stone-100">
              <div className="relative inline-block mb-3">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={displayName}
                    className="w-20 h-20 rounded-full border-2 border-amber-500 object-cover shadow-sm mx-auto"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-stone-900 text-amber-400 font-bold text-2xl flex items-center justify-center mx-auto shadow-sm">
                    {(displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 p-1 bg-amber-500 text-white rounded-full border-2 border-white">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>

              <h2 className="font-serif text-lg font-bold text-stone-900">
                {displayName || 'Usuario de la Academia'}
              </h2>
              <p className="text-xs text-stone-500 font-mono mt-0.5 truncate">
                {currentUser?.email}
              </p>

              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs">
                <span className={`px-2.5 py-0.5 rounded-full ${roleInfo.badgeClass}`}>
                  {roleInfo.title}
                </span>
              </div>
            </div>

            <div className="pt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Estado de Cuenta:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Activa & Autorizada
                </span>
              </div>

              <div className="flex items-center justify-between text-stone-600">
                <span>Identificador (UID):</span>
                <span className="font-mono text-[10px] text-stone-400 max-w-[130px] truncate" title={currentUser?.uid}>
                  {currentUser?.uid}
                </span>
              </div>

              <div className="flex items-center justify-between text-stone-600">
                <span>Proveedor de Login:</span>
                <span className="font-medium text-stone-800 capitalize">
                  {currentUser?.providerData[0]?.providerId === 'google.com' ? 'Google OAuth' : 'Email & Password'}
                </span>
              </div>
            </div>
          </div>

          {/* Email Verification Status Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <Mail className="w-5 h-5 text-stone-700" />
              <h3 className="font-serif text-base font-bold text-stone-900">
                Verificación de Correo
              </h3>
            </div>

            {isEmailVerified ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tu correo electrónico ha sido verificado con éxito.</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Correo no verificado. Es obligatorio para la emisión de diplomas y acceso a partituras reservadas.
                  </span>
                </div>

                <button
                  onClick={handleSendVerification}
                  disabled={verifying}
                  className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
                  <span>{verifying ? 'Enviando...' : 'Reenviar Enlace de Verificación'}</span>
                </button>

                {verifyNotice && (
                  <p className="text-[11px] text-stone-600 text-center">
                    {verifyNotice}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Security & Anti-Tampering Card (Demonstration of Rule Security) */}
          <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 shadow-md border border-stone-800">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif text-base font-bold text-white">
                Defensa Anti-Manipulación
              </h3>
            </div>
            
            <p className="text-xs text-stone-400 mb-4 leading-relaxed">
              La plataforma no confía en el navegador del cliente. Incluso si alguien ejecuta <code className="text-amber-300 font-mono bg-stone-800 px-1 py-0.5 rounded">localStorage.role = "admin"</code>, Firestore rechaza cualquier mutación no autorizada.
            </p>

            <button
              onClick={runTamperingTest}
              className="w-full py-2 px-3 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Simular Ataque de Elevación</span>
            </button>

            {tamperingResult && (
              <div className="mt-4 p-3 bg-stone-950 border border-stone-800 rounded-xl text-xs space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-400">Intento manipulado:</span>
                  <span className="font-mono text-red-400 font-bold">superadmin</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-400">Validado en Firestore:</span>
                  <span className="font-mono text-emerald-400 font-bold">{tamperingResult.serverValidatedRole}</span>
                </div>
                <p className="text-[11px] text-stone-300 border-t border-stone-800 pt-2">
                  {tamperingResult.message}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Edit Profile & Google Workspace Linking */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information Form */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-amber-700" />
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Datos del Estudiante / Profesor
                </h3>
              </div>
              {saveSuccess && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Cambios guardados
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Correo Electrónico (Solo Lectura)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || ''}
                    className="w-full px-3 py-2 text-sm border border-stone-200 bg-stone-50 text-stone-500 rounded-lg cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Instrumento o Especialidad Musical
                  </label>
                  <div className="relative">
                    <Music className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={instrument}
                      onChange={(e) => setInstrument(e.target.value)}
                      placeholder="Ej. Piano Clásico, Violín, Técnica Vocal"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Teléfono / WhatsApp de Contacto
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+502 1234-5678"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Biografía / Objetivos Musicales
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Cuéntanos sobre tu trayectoria o qué te motiva a aprender en Academia Judá..."
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2.5 px-5 bg-stone-900 hover:bg-stone-800 text-amber-400 font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Google Workspace Services Linking */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Video className="w-5 h-5 text-sky-600" />
                  <span>Servicios Integrados de Google Workspace</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Conexión segura y modular para salas virtuales, partituras en Drive y tareas académicas.
                </p>
              </div>

              <div className="px-2.5 py-1 bg-stone-100 text-stone-700 text-xs font-medium rounded-full border border-stone-200">
                Sistema Satélite
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Google Meet Card */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-900 text-sm">Google Meet</h4>
                        <span className="text-[11px] text-stone-500">Clases Virtuales en Vivo</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      googleServices.meet ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {googleServices.meet ? 'Conectado' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mb-4">
                    Permite unirse y programar salas de videoconferencia con cifrado y control de asistencia automática.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => googleServices.meet ? disconnectGoogleService('meet') : linkGoogleServices('meet')}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
                    googleServices.meet 
                      ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' 
                      : 'bg-stone-900 text-amber-300 hover:bg-stone-800'
                  }`}
                >
                  {googleServices.meet ? 'Desconectar Servicio' : 'Vincular Google Meet'}
                </button>
              </div>

              {/* Google Drive Card */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-900 text-sm">Google Drive</h4>
                        <span className="text-[11px] text-stone-500">Partituras, Audios & Guías</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      googleServices.drive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {googleServices.drive ? 'Conectado' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mb-4">
                    Visualiza y descarga recursos educativos en PDF protegidos sin salir de la plataforma.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => googleServices.drive ? disconnectGoogleService('drive') : linkGoogleServices('drive')}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
                    googleServices.drive 
                      ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' 
                      : 'bg-stone-900 text-amber-300 hover:bg-stone-800'
                  }`}
                >
                  {googleServices.drive ? 'Desconectar Servicio' : 'Vincular Google Drive'}
                </button>
              </div>

              {/* Google Classroom Card */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-900 text-sm">Google Classroom</h4>
                        <span className="text-[11px] text-stone-500">Tareas & Entregas Académicas</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      googleServices.classroom ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {googleServices.classroom ? 'Conectado' : 'Opcional'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mb-4">
                    Sincronización de tareas y actividades prácticas complementarias cuando el curso lo requiera.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => googleServices.classroom ? disconnectGoogleService('classroom') : linkGoogleServices('classroom')}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
                    googleServices.classroom 
                      ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' 
                      : 'bg-stone-900 text-amber-300 hover:bg-stone-800'
                  }`}
                >
                  {googleServices.classroom ? 'Desconectar Servicio' : 'Vincular Google Classroom'}
                </button>
              </div>

              {/* Google Calendar Card */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-900 text-sm">Google Calendar</h4>
                        <span className="text-[11px] text-stone-500">Horarios & Recordatorios</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      googleServices.calendar ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {googleServices.calendar ? 'Conectado' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mb-4">
                    Sincroniza automáticamente los horarios de tus clases en vivo y ensayos presenciales.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => googleServices.calendar ? disconnectGoogleService('calendar') : linkGoogleServices('calendar')}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
                    googleServices.calendar 
                      ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' 
                      : 'bg-stone-900 text-amber-300 hover:bg-stone-800'
                  }`}
                >
                  {googleServices.calendar ? 'Desconectar Servicio' : 'Vincular Google Calendar'}
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
