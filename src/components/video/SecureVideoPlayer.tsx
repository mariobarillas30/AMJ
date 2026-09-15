import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Radio, 
  Sparkles,
  CreditCard,
  EyeOff
} from 'lucide-react';
import { VideoStreamTicket } from '../../types';
import { apiFetch } from '../../lib/api';

interface SecureVideoPlayerProps {
  courseId: string;
  classId?: string;
  videoId?: string;
  title: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  isAuthorized: boolean;
  onRenewPayment?: () => void;
}

export const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  courseId,
  classId,
  videoId,
  title,
  studentId,
  studentName,
  studentEmail,
  isAuthorized,
  onRenewPayment
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ticketData, setTicketData] = useState<VideoStreamTicket | null>(null);
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState<'idle' | 'auth_check' | 'matricula_check' | 'token_issued' | 'streaming' | 'blocked'>('idle');
  const [remainingTtl, setRemainingTtl] = useState<number>(0);

  // Floating watermark position to deter screen recorders
  const [watermarkPos, setWatermarkPos] = useState({ top: 20, left: 20 });

  // Floating watermark drifting effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Random coordinates between 10% and 80%
      const newTop = 15 + Math.floor(Math.random() * 65);
      const newLeft = 10 + Math.floor(Math.random() * 60);
      setWatermarkPos({ top: newTop, left: newLeft });
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Request Ephemeral Tokenized Stream from Backend (FASE 12)
  const requestStreamToken = async () => {
    if (!isAuthorized) {
      setAuthStep('blocked');
      setErrorReason('Matrícula inactiva o vencida. El acceso a streaming de video premium está restringido en el servidor.');
      return;
    }

    setLoading(true);
    setErrorReason(null);
    setAuthStep('auth_check');

    try {
      // Step 1: Simulate rapid visual verification feedback
      await new Promise(r => setTimeout(r, 250));
      setAuthStep('matricula_check');
      await new Promise(r => setTimeout(r, 300));

      const res = await apiFetch('/api/videos/request-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          courseId,
          classId,
          videoId
        })
      });

      const data = await res.json();

      if (!res.ok || !data.authorized) {
        setAuthStep('blocked');
        setErrorReason(data.reason || 'No se autorizó la reproducción de video.');
        setTicketData(null);
        return;
      }

      setAuthStep('token_issued');
      setTicketData(data);
      setRemainingTtl(data.ttlSeconds || 900);

      await new Promise(r => setTimeout(r, 200));
      setAuthStep('streaming');

      // Set video source to ephemeral stream endpoint
      if (videoRef.current) {
        videoRef.current.src = data.streamEndpoint;
        videoRef.current.load();
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Autoplay blocked by browser policy; user can click play
          setIsPlaying(false);
        });
      }
    } catch (err: any) {
      setAuthStep('blocked');
      setErrorReason('Error de conexión con el servicio de streaming institucional.');
    } finally {
      setLoading(false);
    }
  };

  // TTL Countdown ticker
  useEffect(() => {
    if (!ticketData || remainingTtl <= 0) return;
    const timer = setInterval(() => {
      setRemainingTtl(prev => {
        if (prev <= 1) {
          // Token expired, re-request seamlessly
          requestStreamToken();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [ticketData, remainingTtl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-4">
      
      {/* Security Architecture Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-4 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-serif font-bold text-amber-400 uppercase tracking-wider">
              Streaming Institucional Judá • Zero-Trust
            </h4>
            <p className="text-[11px] text-stone-400">
              Videos premium tokenizados • Nunca expuestos en URLs públicas ni en Google Drive
            </p>
          </div>
        </div>

        {/* Security badges */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700">
            DRM: Cifrado HMAC
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Anti-Piracy Watermark</span>
          </span>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div 
        ref={containerRef}
        className="relative bg-stone-950 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl aspect-video flex items-center justify-center select-none group"
        onContextMenu={(e) => e.preventDefault()} // Antipiracy: Prevent right-click save video
      >
        {/* Hidden / Streamed HTML5 Video Element */}
        <video
          ref={videoRef}
          className={`w-full h-full object-contain ${authStep === 'streaming' ? 'block' : 'hidden'}`}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
              setDuration(videoRef.current.duration || 0);
            }
          }}
          onEnded={() => setIsPlaying(false)}
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          playsInline
        />

        {/* Dynamic Forensic Anti-Piracy Watermark (Drifting subtle overlay) */}
        {authStep === 'streaming' && ticketData && (
          <div 
            className="absolute pointer-events-none transition-all duration-1000 z-30 opacity-30 hover:opacity-50 text-[10px] font-mono text-stone-300 bg-stone-900/60 px-2 py-1 rounded-md border border-stone-700/50 backdrop-blur-xs"
            style={{ top: `${watermarkPos.top}%`, left: `${watermarkPos.left}%` }}
          >
            <span>{studentEmail} • ID:{studentId} • #{ticketData.watermark.sessionNonce}</span>
          </div>
        )}

        {/* STATE 1: IDLE / NOT STARTED */}
        {authStep === 'idle' && (
          <div className="absolute inset-0 bg-stone-950/90 flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Play className="w-8 h-8 ml-1" />
            </div>

            <div className="max-w-md space-y-1">
              <h3 className="font-serif text-lg font-bold text-white">
                {title}
              </h3>
              <p className="text-xs text-stone-400">
                Masterclass de alto rendimiento musical • Formato 1080p 60fps con audio acústico calibrado.
              </p>
            </div>

            <button
              onClick={requestStreamToken}
              disabled={loading}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all transform hover:scale-105"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span>Reproducir Masterclass (Streaming Seguro)</span>
            </button>

            <p className="text-[10px] text-stone-500 max-w-xs">
              Requiere validación de matrícula institucional en tiempo real.
            </p>
          </div>
        )}

        {/* STATE 2: AUTHENTICATING & VERIFYING ENROLLMENT */}
        {(authStep === 'auth_check' || authStep === 'matricula_check' || authStep === 'token_issued') && (
          <div className="absolute inset-0 bg-stone-950 flex flex-col items-center justify-center p-6 text-center space-y-5 z-20">
            <RefreshCw className="w-10 h-10 text-amber-400 animate-spin" />

            <div className="space-y-2">
              <h4 className="font-serif text-base font-bold text-white">
                Autorizando Sesión de Streaming Cifrada
              </h4>
              <p className="text-xs text-stone-400">
                Verificando autenticación de alumno y vigencia soberana de matrícula...
              </p>
            </div>

            {/* Pipeline Step-by-Step Status */}
            <div className="flex flex-col sm:flex-row items-center gap-2 text-xs font-mono">
              <span className={`px-2.5 py-1 rounded-lg border ${
                authStep === 'auth_check' || authStep === 'matricula_check' || authStep === 'token_issued'
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                  : 'bg-stone-900 text-stone-500 border-stone-800'
              }`}>
                1. Alumno Autenticado ✓
              </span>
              <span className="text-stone-600 hidden sm:inline">→</span>
              <span className={`px-2.5 py-1 rounded-lg border ${
                authStep === 'matricula_check' || authStep === 'token_issued'
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                  : 'bg-stone-900 text-stone-500 border-stone-800'
              }`}>
                2. Matrícula Vigente ✓
              </span>
              <span className="text-stone-600 hidden sm:inline">→</span>
              <span className={`px-2.5 py-1 rounded-lg border ${
                authStep === 'token_issued'
                  ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                  : 'bg-stone-900 text-stone-500 border-stone-800'
              }`}>
                3. Token Efímero HMAC
              </span>
            </div>
          </div>
        )}

        {/* STATE 3: BLOCKED / ACCESS DENIED (FASE 10/11/12 Integration) */}
        {authStep === 'blocked' && (
          <div className="absolute inset-0 bg-stone-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
            <div className="w-14 h-14 rounded-2xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400 shadow-lg">
              <Lock className="w-7 h-7 text-red-500" />
            </div>

            <div className="max-w-md space-y-1">
              <h4 className="font-serif text-lg font-bold text-red-400">
                Streaming Bloqueado por Seguridad
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                {errorReason}
              </p>
              <p className="text-[11px] text-stone-500 pt-2 italic">
                «Un alumno con matrícula vencida NO debe recibir acceso a videos premium aunque conserve enlaces previos.»
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {onRenewPayment && (
                <button
                  onClick={onRenewPayment}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Renovar Matrícula para Desbloquear</span>
                </button>
              )}

              <button
                onClick={requestStreamToken}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded-xl text-xs transition-colors"
              >
                Reintentar Validación
              </button>
            </div>
          </div>
        )}

        {/* STATE 4: STREAMING CUSTOM CONTROLS OVERLAY */}
        {authStep === 'streaming' && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent z-20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
            
            {/* Progress Bar */}
            <div 
              className="w-full bg-stone-700/50 h-1.5 rounded-full cursor-pointer overflow-hidden"
              onClick={(e) => {
                if (!videoRef.current || !duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                videoRef.current.currentTime = pos * duration;
              }}
            >
              <div 
                className="bg-amber-400 h-full rounded-full transition-all"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              ></div>
            </div>

            {/* Bottom Control Buttons */}
            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-1.5 hover:text-amber-400 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-1.5 hover:text-amber-400 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <span className="text-[11px] font-mono text-stone-300">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Ephemeral Token Countdown */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono bg-stone-900/80 px-2 py-1 rounded-lg border border-stone-700 text-amber-300" title="Validez de autorización temporal efímera">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Token: {Math.floor(remainingTtl / 60)}:{(remainingTtl % 60).toString().padStart(2, '0')} min</span>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 hover:text-amber-400 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Token & Streaming Audit Footnote */}
      {ticketData && authStep === 'streaming' && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-xs text-stone-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold text-stone-900">Streaming Activo Autorizado por Matrícula</span>
              <span className="text-stone-400 block text-[11px]">
                Endpoint efímero firmado: <code className="font-mono text-amber-800">{ticketData.streamEndpoint}</code>
              </span>
            </div>
          </div>

          <div className="text-[10px] text-stone-500 font-mono self-end sm:self-auto">
            Driver: <strong>{ticketData.storageDriver}</strong> • No permanent URL exposed
          </div>
        </div>
      )}

    </div>
  );
};
