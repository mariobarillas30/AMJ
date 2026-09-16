import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthMode, UserRole } from '../../types';
import { JudaLogo } from '../common/JudaLogo';
import { InternationalPhoneInput } from '../common/InternationalPhoneInput';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Music, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle, 
  Sparkles,
  KeyRound,
  FileText
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle, 
    sendPasswordReset, 
    authError, 
    clearAuthError,
    previewAsRole
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('+503 ');
  const [documentId, setDocumentId] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [instrument, setInstrument] = useState('Piano & Teclados');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  // Pre-load from enrollment form if pending
  useEffect(() => {
    if (!isOpen) return;
    try {
      const stored = sessionStorage.getItem('pending_enrollment');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.nombre) setDisplayName(data.nombre);
        if (data.email) setEmail(data.email);
        if (data.telefono) setPhone(data.telefono);
        if (data.documentoIdentidad) setDocumentId(data.documentoIdentidad);
        if (data.tutorResponsable) setGuardianName(data.tutorResponsable);
        if (data.instrumento) {
          const match = instrumentsList.find(i => i.toLowerCase().includes(data.instrumento.toLowerCase()));
          if (match) setInstrument(match);
        }
        if (initialMode === 'register') {
          setMode('register');
        }
      }
    } catch {
      // ignore
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const instrumentsList = [
    'Piano & Teclados',
    'Guitarra Acústica / Eléctrica',
    'Canto & Técnica Vocal',
    'Bajo Eléctrico',
    'Batería & Percusión',
    'Violín',
    'Saxofón & Vientos',
    'Teoría Musical & Solfeo',
    'Iniciación Musical Infantil'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setValidationMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          setValidationMsg('Por favor completa todos los campos.');
          setLoading(false);
          return;
        }
        await loginWithEmail(email, password);
        onClose();
      } else if (mode === 'register') {
        if (!email || !password || !displayName) {
          setValidationMsg('Por favor completa los campos obligatorios.');
          setLoading(false);
          return;
        }
        if (!documentId.trim()) {
          setValidationMsg('Por favor ingresa tu DUI o Pasaporte.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setValidationMsg('La contraseña debe tener mínimo 6 caracteres.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setValidationMsg('Las contraseñas no coinciden.');
          setLoading(false);
          return;
        }
        await registerWithEmail(
          email, 
          password, 
          displayName, 
          instrument, 
          phone, 
          documentId, 
          guardianName
        );
        try {
          sessionStorage.removeItem('pending_enrollment');
        } catch {
          // ignore
        }
        onClose();
      } else if (mode === 'forgot-password') {
        if (!email) {
          setValidationMsg('Ingresa tu correo para enviarte el enlace de recuperación.');
          setLoading(false);
          return;
        }
        await sendPasswordReset(email);
        setResetSent(true);
      }
    } catch {
      // Auth error is captured in context
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearAuthError();
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoRole: UserRole, demoEmail: string, demoName: string) => {
    setEmail(demoEmail);
    setPassword('Judamusic2026!');
    setDisplayName(demoName);
    setMode('login');
    clearAuthError();
    setValidationMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-2">
            <JudaLogo size="lg" variant="full" theme="dark" className="h-14" />
          </div>
          
          <p className="text-xs text-amber-200/90 mt-1">
            Plataforma Educativa Segura | Integrada con Google Workspace
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 text-sm font-semibold bg-stone-50">
          <button
            type="button"
            onClick={() => { setMode('login'); clearAuthError(); setValidationMsg(null); }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'login' 
                ? 'bg-white text-stone-900 border-b-2 border-amber-600' 
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); clearAuthError(); setValidationMsg(null); }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'register' 
                ? 'bg-white text-stone-900 border-b-2 border-amber-600' 
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Form Container */}
        <div className="p-6">

          {/* Security Notice: Google login & roles */}
          <div className="mb-4 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">Control Estricto de Roles:</strong>
              El inicio de sesión (incluido Google) asigna rol de <em>Alumno</em> por defecto. Los roles de Profesor o Administrador son asignados por la Dirección Académica.
            </div>
          </div>

          {/* Error notifications */}
          {(authError || validationMsg) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{validationMsg || authError}</span>
            </div>
          )}

          {/* Password Reset Sent notification */}
          {resetSent && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Hemos enviado un correo a <strong>{email}</strong> con instrucciones para restablecer tu contraseña.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ej. Sofía Hernández"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    DUI o Pasaporte (Documento de Identidad) *
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={documentId}
                      onChange={(e) => setDocumentId(e.target.value)}
                      placeholder="Ej. 01234567-8 o N° Pasaporte"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <InternationalPhoneInput
                    value={phone}
                    onChange={(val) => setPhone(val)}
                    placeholder="7757-3023"
                    className="border border-stone-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Instrumento Principal
                  </label>
                  <select
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    {instrumentsList.map((inst) => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nombre del padre, madre o tutor responsable
                    <span className="text-stone-400 font-normal ml-1">(Opcional, para menores de edad)</span>
                  </label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Ej. Carlos Hernández (Padre/Tutor)"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Correo Electrónico *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@academiajuda.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            {mode !== 'forgot-password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Contraseña *
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot-password')}
                      className="text-[11px] text-amber-700 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-amber-400 font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Procesando...</span>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Entrar a la Academia'}
                    {mode === 'register' && 'Crear Cuenta Segura'}
                    {mode === 'forgot-password' && 'Enviar Correo de Recuperación'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Alternative: Google Sign-in */}
          {mode !== 'forgot-password' && (
            <div className="mt-4">
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-stone-200 w-full"></div>
                <span className="bg-white px-2 text-[11px] text-stone-400 uppercase font-semibold tracking-wider">
                  o continúa con
                </span>
                <div className="border-t border-stone-200 w-full"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 border border-stone-300 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
              >
                {/* Google "G" standard SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Acceder con Google</span>
              </button>
            </div>
          )}

          {/* Quick Demo Fillers for Testing Roles */}
          <div className="mt-5 pt-4 border-t border-stone-200">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Accesos Rápidos de Demostración:</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => fillQuickDemo('superadmin', 'mariobarillas24@gmail.com', 'Director Mario Barillas')}
                className="p-1.5 text-left border border-amber-200 bg-amber-50/70 hover:bg-amber-100 rounded-md transition-colors"
              >
                <span className="font-bold text-amber-900 block">Superadministrador</span>
                <span className="text-stone-500 text-[10px] truncate block">mariobarillas24@gmail.com</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo('admin', 'admin.sede@academiajuda.com', 'Coord. Sara Reyes')}
                className="p-1.5 text-left border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 rounded-md transition-colors"
              >
                <span className="font-bold text-indigo-900 block">Administrador</span>
                <span className="text-stone-500 text-[10px] truncate block">admin.sede@...</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo('teacher', 'profesor.piano@academiajuda.com', 'Prof. Carlos Mendoza')}
                className="p-1.5 text-left border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 rounded-md transition-colors"
              >
                <span className="font-bold text-emerald-900 block">Profesor de Música</span>
                <span className="text-stone-500 text-[10px] truncate block">profesor.piano@...</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo('student', 'alumno.guitarra@gmail.com', 'David Morales')}
                className="p-1.5 text-left border border-sky-200 bg-sky-50/70 hover:bg-sky-100 rounded-md transition-colors"
              >
                <span className="font-bold text-sky-900 block">Alumno de Música</span>
                <span className="text-stone-500 text-[10px] truncate block">alumno.guitarra@...</span>
              </button>
            </div>
          </div>

          {mode === 'forgot-password' && (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="mt-4 w-full text-center text-xs text-stone-600 hover:text-stone-900 font-semibold"
            >
              ← Volver al inicio de sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
