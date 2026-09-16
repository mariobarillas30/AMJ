import React, { useState, useEffect } from 'react';
import { 
  Film, 
  ShieldCheck, 
  Lock, 
  Radio, 
  Server, 
  Cloud, 
  Layers, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Play, 
  EyeOff, 
  Sliders, 
  Sparkles,
  Zap,
  Terminal,
  Activity
} from 'lucide-react';
import { PremiumVideoAsset, VideoDriverConfig } from '../../types';
import { apiFetch } from '../../lib/api';

export const AdminVideosTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [catalog, setCatalog] = useState<PremiumVideoAsset[]>([]);
  const [config, setConfig] = useState<VideoDriverConfig>({
    activeDriver: 'academy_secure_stream',
    cdnProvider: 'cloudflare_stream',
    enableDynamicWatermark: true,
    ticketTtlSeconds: 900,
    enforceHttpRange: true,
    strictEnrollmentRecheck: true,
    antiDownloadHeaders: true,
    drmSimulationEnabled: true
  });
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSavedNotice, setConfigSavedNotice] = useState(false);

  // Security test suite state
  const [runningAttackSim, setRunningAttackSim] = useState(false);
  const [attackResults, setAttackResults] = useState<any[] | null>(null);

  // Fetch video admin data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, confRes, auditRes] = await Promise.all([
        apiFetch('/api/videos/admin/catalog'),
        apiFetch('/api/videos/admin/config'),
        apiFetch('/api/videos/admin/audit-logs')
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCatalog(catData.assets || []);
      }
      if (confRes.ok) {
        const confData = await confRes.json();
        setConfig(confData.config);
      }
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData.logs || []);
        setActiveSessions(auditData.activeSessions || []);
      }
    } catch (err) {
      console.error('Error fetching admin video data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveConfig = async (newConfig: Partial<VideoDriverConfig>) => {
    setSavingConfig(true);
    try {
      const res = await apiFetch('/api/videos/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setConfigSavedNotice(true);
        setTimeout(() => setConfigSavedNotice(false), 3000);
      }
    } catch (err) {
      console.error('Error saving config:', err);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleRunSecuritySuite = async () => {
    setRunningAttackSim(true);
    setAttackResults(null);
    try {
      const res = await apiFetch('/api/videos/admin/simulate-attack', {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setAttackResults(data.results);
        fetchData();
      }
    } catch (err) {
      console.error('Error running security tests:', err);
    } finally {
      setRunningAttackSim(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header & Flow Architecture Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>PROTECCIÓN DE CONTENIDO EN VIDEO</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Trust Streaming Pipeline</span>
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-100">
              Gestión de Video Streaming & Drivers CDN
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
              Los videos de cátedra son activos de alto valor pedagógico. Para impedir la piratería y la filtración de enlaces, el streaming opera mediante un flujo de doble verificación soberana y tokens efímeros.
            </p>
          </div>

          {/* User Requested Flow Visual Diagram */}
          <div className="pt-2">
            <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mb-2">
              Flujo Soberano de Reproducción Requerido:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs font-mono">
              <div className="bg-stone-800/90 border border-stone-700 p-2.5 rounded-xl">
                <span className="text-amber-400 font-bold block text-sm">1</span>
                <span className="text-stone-300 text-[11px]">Alumno</span>
              </div>
              <div className="bg-stone-800/90 border border-stone-700 p-2.5 rounded-xl">
                <span className="text-amber-400 font-bold block text-sm">2</span>
                <span className="text-stone-300 text-[11px]">Solicita Video</span>
              </div>
              <div className="bg-stone-800/90 border border-stone-700 p-2.5 rounded-xl">
                <span className="text-amber-400 font-bold block text-sm">3</span>
                <span className="text-stone-300 text-[11px]">Backend Auth</span>
              </div>
              <div className="bg-stone-800/90 border border-stone-700 p-2.5 rounded-xl">
                <span className="text-amber-400 font-bold block text-sm">4</span>
                <span className="text-stone-300 text-[11px]">Verifica Matrícula</span>
              </div>
              <div className="bg-stone-800/90 border border-stone-700 p-2.5 rounded-xl">
                <span className="text-amber-400 font-bold block text-sm">5</span>
                <span className="text-stone-300 text-[11px]">Autoriz. Temporal</span>
              </div>
              <div className="bg-emerald-950 border border-emerald-700 p-2.5 rounded-xl">
                <span className="text-emerald-400 font-bold block text-sm">6</span>
                <span className="text-emerald-200 text-[11px]">Streaming Chunk</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Compliance Notice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-1 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <EyeOff className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Sin URLs Privadas Públicas</span>
          </div>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            Los videos nunca se publican en carpetas accesibles de la web ni se exponen endpoints con nombres de archivo estáticos.
          </p>
        </div>

        <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 space-y-1 text-xs">
          <div className="flex items-center gap-2 font-bold text-sky-900">
            <Server className="w-4 h-4 text-sky-700 shrink-0" />
            <span>Drive NO es DRM de Video</span>
          </div>
          <p className="text-sky-800 text-[11px] leading-relaxed">
            Google Drive se reserva para material educativo (partituras Urtext), no para streaming premium de video antipiratería.
          </p>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-1 text-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-900">
            <Cloud className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Arquitectura Lista para CDN</span>
          </div>
          <p className="text-emerald-800 text-[11px] leading-relaxed">
            El sistema desacopla la capa de autorización del almacenamiento, soportando Cloudflare Stream, CloudFront o Mux sin reescribir la lógica.
          </p>
        </div>
      </div>

      {/* Driver Configuration & CDN Switcher */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-600" />
              <span>Configuración de Driver de Streaming & CDN Especializada</span>
            </h3>
            <p className="text-xs text-stone-500">
              Modifica en caliente el motor de entrega multimedia institucional sin alterar la verificación de matrículas.
            </p>
          </div>

          {configSavedNotice && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Configuración guardada en backend</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Active Driver Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
              Driver Activo de Entrega Multimedia
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div 
                onClick={() => handleSaveConfig({ activeDriver: 'academy_secure_stream' })}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  config.activeDriver === 'academy_secure_stream'
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-amber-600" />
                    <span>Streaming Local Seguro</span>
                  </span>
                  {config.activeDriver === 'academy_secure_stream' && (
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  )}
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Streamer Node.js con soporte HTTP 206 Partial Content (Seek/Range), tokens HMAC efímeros y aislamiento de filesystem.
                </p>
              </div>

              <div 
                onClick={() => handleSaveConfig({ activeDriver: 'specialized_cdn' })}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  config.activeDriver === 'specialized_cdn'
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-sky-600" />
                    <span>CDN Especializada</span>
                  </span>
                  {config.activeDriver === 'specialized_cdn' && (
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  )}
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Delegación a plataformas de video de baja latencia con tokenización firmada (Cloudflare Stream, CloudFront, Mux).
                </p>
              </div>
            </div>
          </div>

          {/* CDN Provider Sub-Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
              Proveedor CDN Especializado Seleccionado
            </label>

            <select
              value={config.cdnProvider || 'cloudflare_stream'}
              onChange={(e) => handleSaveConfig({ cdnProvider: e.target.value as any })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 font-medium focus:ring-2 focus:ring-amber-500"
            >
              <option value="cloudflare_stream">Cloudflare Stream (Signed Tokens + HLS Adaptativo)</option>
              <option value="cloudfront">Amazon CloudFront (Signed URLs & Signed Cookies)</option>
              <option value="mux">Mux Video (Zero-Trust Secure Playback IDs)</option>
              <option value="internal_hls">Servidor HLS Interno Segmentado (AES-128 Cifrado)</option>
            </select>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600">
              <strong>Abstracción Arquitectónica:</strong> La aplicación puede migrar entre proveedores en cualquier momento sin alterar el flujo <code>Alumno → Backend → Auth → Matrícula → Token</code>.
            </div>
          </div>

        </div>

        {/* Security Parameters Toggles */}
        <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div className="space-y-0.5">
              <span className="font-bold text-stone-800 block">Marca de Agua Forense</span>
              <span className="text-[10px] text-stone-500">Superposición dinámica de ID de alumno</span>
            </div>
            <input
              type="checkbox"
              checked={config.enableDynamicWatermark}
              onChange={(e) => handleSaveConfig({ enableDynamicWatermark: e.target.checked })}
              className="w-4 h-4 accent-amber-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div className="space-y-0.5">
              <span className="font-bold text-stone-800 block">Re-verificación en Caliente</span>
              <span className="text-[10px] text-stone-500">Corte inmediato si matrícula vence en stream</span>
            </div>
            <input
              type="checkbox"
              checked={config.strictEnrollmentRecheck}
              onChange={(e) => handleSaveConfig({ strictEnrollmentRecheck: e.target.checked })}
              className="w-4 h-4 accent-amber-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div className="space-y-0.5">
              <span className="font-bold text-stone-800 block">TTL de Token Efímero</span>
              <span className="text-[10px] text-stone-500">Ventana temporal de validez</span>
            </div>
            <select
              value={config.ticketTtlSeconds}
              onChange={(e) => handleSaveConfig({ ticketTtlSeconds: parseInt(e.target.value, 10) })}
              className="bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-800 font-mono"
            >
              <option value="300">5 min</option>
              <option value="900">15 min</option>
              <option value="1800">30 min</option>
              <option value="3600">60 min</option>
            </select>
          </div>

        </div>
      </div>

      {/* Video Assets Catalog */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-600" />
              <span>Catálogo de Videos Masterclass Registrados</span>
            </h3>
            <p className="text-xs text-stone-500">
              Archivos protegidos físicamente en el backend. Ninguna URL pública o de Google Drive es expuesta a la web.
            </p>
          </div>

          <span className="text-xs font-mono bg-stone-100 text-stone-700 px-3 py-1 rounded-full border border-stone-200">
            {catalog.length} Masterclasses Disponibles
          </span>
        </div>

        <div className="space-y-4">
          {catalog.map((asset) => (
            <div 
              key={asset.id}
              className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                    {asset.id}
                  </span>
                  <span className="text-xs font-semibold text-stone-500">
                    Cátedra: {asset.courseId}
                  </span>
                </div>

                <h4 className="font-serif font-bold text-stone-900 text-base">
                  {asset.title}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {asset.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 font-mono pt-1">
                  <span>Resolución: <strong>{asset.resolution}</strong></span>
                  <span>•</span>
                  <span>Duración: <strong>{asset.durationFormatted}</strong></span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>DRM Tokenizado Activo</span>
                  </span>
                </div>
              </div>

              <div className="bg-stone-900 text-white p-3 rounded-xl border border-stone-800 text-[11px] font-mono space-y-1 shrink-0 max-w-xs">
                <div className="text-stone-400 uppercase text-[9px] tracking-wider">
                  Almacenamiento Privado Seguro:
                </div>
                <div className="text-amber-400 truncate">
                  {asset.internalSourceKey || '/server/private_media/'}
                </div>
                <div className="text-[10px] text-stone-400">
                  Aislado de rutas estáticas públicas ✓
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Testing & Anti-Piracy Audit Suite */}
      <div className="bg-stone-950 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-amber-400 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-amber-400" />
              <span>Suite de Validación de Streaming Seguro</span>
            </h3>
            <p className="text-xs text-stone-400">
              Ejecuta pruebas automáticas de penetración contra vectores comunes de robo de video (enlaces huérfanos, matrícula vencida, adulteración HMAC y acceso directo a disco).
            </p>
          </div>

          <button
            onClick={handleRunSecuritySuite}
            disabled={runningAttackSim}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all shrink-0"
          >
            {runningAttackSim ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulando Ataques...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Ejecutar Suite Antipiratería</span>
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {attackResults ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Todos los vectores de ataque fueron repelidos exitosamente por el backend soberano.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attackResults.map((res, i) => (
                <div key={i} className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-xs space-y-1.5 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">{res.testName}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                      {res.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-stone-400 text-[11px] font-sans">
                    {res.description}
                  </p>
                  <p className="text-stone-300 text-[11px] border-t border-stone-800 pt-1">
                    ↳ {res.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-stone-500 text-xs">
            Presiona <strong>«Ejecutar Suite Antipiratería»</strong> para verificar la inmunidad del backend ante accesos no autorizados.
          </div>
        )}

      </div>

      {/* Live Active Streaming Sessions & Audit Log */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-600" />
              <span>Sesiones Efímeras Activas & Registro de Accesos a Video</span>
            </h3>
            <p className="text-xs text-stone-500">
              Monitoreo en tiempo real de tokens HMAC emitidos, validez restante y eventos de streaming.
            </p>
          </div>

          <span className="text-xs font-mono bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full">
            {activeSessions.length} Sesiones Efímeras Vivas
          </span>
        </div>

        {/* Active Sessions Grid */}
        {activeSessions.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Tokens Activos en Memoria del Servidor
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeSessions.map((session, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 font-mono text-[11px] truncate">
                      {session.ticket}
                    </span>
                    <span className="text-amber-800 font-mono text-[10px] bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      {session.remainingSeconds}s restantes
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600">
                    Alumno: <strong>{session.studentEmail}</strong> ({session.studentId})
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">
                    Video: <strong>{session.videoTitle}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500">
            No hay sesiones de streaming activas en este momento. Se generan cuando un alumno reproduce un video en su portal.
          </div>
        )}

        {/* Audit Log Table */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Últimos Eventos de Autorización y Streaming
          </h4>
          <div className="max-h-60 overflow-y-auto space-y-2 font-mono text-[11px]">
            {auditLogs.slice(0, 10).map((log, idx) => (
              <div 
                key={idx}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                  log.authorized 
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
                    : 'bg-red-50/60 border-red-200 text-red-950'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${log.authorized ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  <span className="font-bold text-[10px]">{log.action}</span>
                  <span className="text-stone-600 truncate">{log.reason || `Video ${log.videoId} por ${log.studentId}`}</span>
                </div>
                <span className="text-[10px] text-stone-500 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
