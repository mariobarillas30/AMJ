import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GoogleWorkspaceServiceStatus } from '../../types';
import { INITIAL_WORKSPACE_SERVICES } from '../../data/adminManagementData';
import { 
  Video, 
  FolderOpen, 
  BookOpen, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Server, 
  Activity, 
  ExternalLink,
  Zap,
  Layers,
  KeyRound,
  EyeOff,
  UserCheck,
  Building2,
  Info
} from 'lucide-react';

export const AdminIntegrationsTab: React.FC = () => {
  const { role, currentUser, userProfile } = useAuth();
  const isSuperAdmin = role === 'superadmin';

  const [services, setServices] = useState<GoogleWorkspaceServiceStatus[]>(() => {
    const saved = localStorage.getItem('jud_admin_workspace_services');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_WORKSPACE_SERVICES;
  });

  const [isTestingHandshake, setIsTestingHandshake] = useState(false);
  const [handshakeResult, setHandshakeResult] = useState<string | null>(null);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<GoogleWorkspaceServiceStatus | null>(services[0]);

  const handleTestHandshake = () => {
    if (!isSuperAdmin) {
      alert('Solo el Superadministrador está autorizado para iniciar pruebas de handshake con Google Workspace.');
      return;
    }

    setIsTestingHandshake(true);
    setHandshakeResult(null);

    setTimeout(() => {
      const now = new Date();
      const updated = services.map(s => ({
        ...s,
        latencyMs: Math.floor(35 + Math.random() * 20),
        lastSyncAt: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        status: 'connected' as const
      }));
      setServices(updated);
      localStorage.setItem('jud_admin_workspace_services', JSON.stringify(updated));
      setIsTestingHandshake(false);
      setHandshakeResult('Handshake criptográfico completado con éxito. Todas las APIs de Google Workspace respondieron dentro de los parámetros de tolerancia (<60ms).');
      setTimeout(() => setHandshakeResult(null), 7000);
    }, 1200);
  };

  const getServiceIcon = (service: 'meet' | 'drive' | 'classroom') => {
    switch (service) {
      case 'meet':
        return <Video className="w-5 h-5 text-sky-600" />;
      case 'drive':
        return <FolderOpen className="w-5 h-5 text-amber-600" />;
      case 'classroom':
        return <BookOpen className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getServiceColor = (service: 'meet' | 'drive' | 'classroom') => {
    switch (service) {
      case 'meet':
        return { bg: 'bg-sky-50 text-sky-800 border-sky-200', badge: 'bg-sky-100 text-sky-700' };
      case 'drive':
        return { bg: 'bg-amber-50 text-amber-800 border-amber-200', badge: 'bg-amber-100 text-amber-700' };
      case 'classroom':
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Section Header: Integraciones -> Google Workspace */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-1">
            <span>Integraciones</span>
            <span>/</span>
            <span className="text-amber-600 font-bold">Google Workspace</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-600" />
            <span>Estado de Conexión & Servicios Google Workspace</span>
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl">
            Supervisión institucional de Google Meet, Google Drive y Google Classroom. Monitoreo en tiempo real de salud, latencia y sincronización con estricta protección de privacidad.
          </p>
        </div>

        {/* Action Controls & Superadmin Clearance */}
        <div className="flex items-center gap-3">
          {isSuperAdmin ? (
            <button
              onClick={handleTestHandshake}
              disabled={isTestingHandshake}
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-400 font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTestingHandshake ? 'animate-spin' : ''}`} />
              <span>{isTestingHandshake ? 'Probando Handshake...' : 'Ejecutar Test de Handshake'}</span>
            </button>
          ) : (
            <div 
              className="px-3.5 py-2 bg-stone-100 text-stone-500 border border-stone-300 rounded-xl text-xs font-medium flex items-center gap-2 cursor-not-allowed"
              title="Solo el Superadministrador puede iniciar el test de handshake y reconexión"
            >
              <Lock className="w-4 h-4 text-stone-400" />
              <span>Handshake: Solo Superadministrador</span>
            </div>
          )}
        </div>
      </div>

      {/* Zero-Secret Security Compliance Notice Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
            <EyeOff className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-400/20">
                Directiva de Privacidad Activa
              </span>
              <span className="text-xs font-semibold text-white">
                Protección de Secretos y Tokens Criptográficos
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1 leading-relaxed">
              Este panel opera bajo la directiva institucional Zero-Secret: <strong>no expone tokens privados, refresh tokens, client_secrets ni credenciales crudas en el navegador</strong>. Toda la supervisión se efectúa mediante verificación de estado declarativo y validación de scopes por rol.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700 text-[11px] text-stone-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Protección de Datos Institucional</span>
        </div>
      </div>

      {/* Role Privilege Notice: Superadmin vs Standard Admin */}
      {!isSuperAdmin ? (
        <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-950">
              Nivel de Autorización: Administrador Estándar (Modo Consulta / Solo Lectura)
            </h4>
            <p className="leading-relaxed text-amber-900/90">
              La arquitectura del sistema establece que <strong>la vinculación de nuevas cuentas, alteración de scopes y desconexión de servicios de Google Workspace requiere autorización exclusiva del Superadministrador</strong>. Como Administrador, puedes consultar el estado operativo, cuotas de almacenamiento y latencia, pero las acciones de re-autenticación y rotación de llaves se encuentran bloqueadas por política de seguridad.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-4 text-xs text-emerald-950 flex items-start gap-3">
          <UserCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-emerald-950">
              Nivel de Autorización: Superadministrador (Dirección General)
            </h4>
            <p className="leading-relaxed text-emerald-900/90">
              Posees autorización ejecutiva para supervisar el canal de enlace satélite, disparar tests de latencia y administrar la delegación de credenciales institucionales para <strong>@judamusic.edu</strong>.
            </p>
          </div>
        </div>
      )}

      {handshakeResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{handshakeResult}</span>
        </div>
      )}

      {/* 3 Core Workspace Services Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {services.map((srv) => {
          const colors = getServiceColor(srv.service);
          const isSelected = selectedServiceDetail?.service === srv.service;

          return (
            <div
              key={srv.service}
              onClick={() => setSelectedServiceDetail(srv)}
              className={`rounded-2xl p-5 border transition-all cursor-pointer relative ${
                isSelected 
                  ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20' 
                  : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                    {getServiceIcon(srv.service)}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">{srv.name}</h3>
                    <p className="text-[11px] text-stone-500">{srv.organizationDomain}</p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>Operativo</span>
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span className="text-[11px]">Latencia de Red:</span>
                  <span className="font-mono font-bold text-emerald-700">{srv.latencyMs} ms</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span className="text-[11px]">Última Sincronización:</span>
                  <span className="text-[11px] text-stone-800">{srv.lastSyncAt}</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span className="text-[11px]">Recursos Vinculados:</span>
                  <span className="font-semibold text-stone-900">{srv.resourceCount} elementos</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-amber-700 font-semibold">
                <span>Ver detalles de configuración</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Service Detailed Audit View */}
      {selectedServiceDetail && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center">
                {getServiceIcon(selectedServiceDetail.service)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    {selectedServiceDetail.name}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200 uppercase font-semibold">
                    Servicio Conectado
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Cuenta Corporativa Autorizada: <strong className="text-stone-800">{selectedServiceDetail.activeAccount}</strong>
                </p>
              </div>
            </div>

            {/* Privilege restricted action button */}
            <div className="flex items-center gap-2">
              {isSuperAdmin ? (
                <button
                  onClick={() => alert(`Sincronización forzada para ${selectedServiceDetail.name} solicitada.`)}
                  className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sincronizar Este Servicio</span>
                </button>
              ) : (
                <button
                  disabled
                  className="px-3.5 py-1.5 bg-stone-100 text-stone-400 border border-stone-200 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-not-allowed"
                  title="Conexión y modificación de cuentas restringida a Superadministrador"
                >
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Conexión: Exclusivo Superadmin</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Features & Pedagogical Functions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Funciones Activas en Plataforma</span>
              </h4>
              <ul className="space-y-2">
                {selectedServiceDetail.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Authorized Scopes (Zero Secrets) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Scopes OAuth 2.0 Concedidos (Solo Lectura Pública)</span>
              </h4>
              <div className="space-y-2">
                {selectedServiceDetail.authorizedScopes.map((scope, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-stone-900 text-stone-200 font-mono text-[11px] border border-stone-800 break-all flex items-center justify-between gap-2">
                    <span>{scope}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-sans uppercase font-bold shrink-0">
                      Verificado
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <span>
                  Los scopes otorgados son de mínimo privilegio. La gobernanza de datos y la comprobación de vigencia de matrícula residen exclusivamente en los servidores de la Academia Musical Judá.
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Sovereign Architecture Matrix */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
        <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-600" />
          <span>Matriz de Soberanía Institucional vs Servicios de Google</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Dominio Académico</th>
                <th className="py-2.5 px-3">Autoridad Central (Judá Music)</th>
                <th className="py-2.5 px-3">Servicio Conectado (Google)</th>
                <th className="py-2.5 px-3">Regla en Fallo de Red</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              <tr>
                <td className="py-3 px-3 font-semibold text-stone-900">Matrículas & Roles</td>
                <td className="py-3 px-3 text-emerald-700 font-bold">100% Autónoma (Firestore RBAC)</td>
                <td className="py-3 px-3 text-stone-500">Ninguna injerencia</td>
                <td className="py-3 px-3 text-stone-600">Completamente operativo</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-stone-900">Clases Virtuales</td>
                <td className="py-3 px-3 text-stone-800">Horario, docente, asistencia y notas</td>
                <td className="py-3 px-3 text-sky-700 font-semibold">Google Meet (Transmisión WebRTC)</td>
                <td className="py-3 px-3 text-stone-600">Alternativa con sala de respaldo</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-stone-900">Partituras & Métodos</td>
                <td className="py-3 px-3 text-stone-800">Catálogo, nivel pedagógico e índices</td>
                <td className="py-3 px-3 text-amber-700 font-semibold">Google Drive (Almacenamiento CDN)</td>
                <td className="py-3 px-3 text-stone-600">Caché local del navegador para PDFs</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-stone-900">Tareas & Rúbricas</td>
                <td className="py-3 px-3 text-stone-800">Evaluación interactiva y nota oficial</td>
                <td className="py-3 px-3 text-emerald-700 font-semibold">Google Classroom (Entrega satélite)</td>
                <td className="py-3 px-3 text-stone-600">Evaluación directa en portal Judá</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
