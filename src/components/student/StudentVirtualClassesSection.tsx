import React, { useState, useEffect } from 'react';
import { 
  VirtualClassSession, 
  VirtualClassStatus, 
  StudentEnrollment,
  AcademicCourse
} from '../../types';
import { INITIAL_VIRTUAL_CLASSES } from '../../data/virtualClassesData';
import { apiFetch } from '../../lib/api';
import { 
  Video, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RotateCcw, 
  XCircle, 
  Lock, 
  Ban, 
  ShieldCheck, 
  Radio,
  CreditCard,
  Layers,
  Info
} from 'lucide-react';

interface StudentVirtualClassesSectionProps {
  studentId: string;
  studentName: string;
  enrollments: StudentEnrollment[];
  courses: AcademicCourse[];
  onRenewCourse?: (course: AcademicCourse) => void;
}

export const StudentVirtualClassesSection: React.FC<StudentVirtualClassesSectionProps> = ({
  studentId,
  studentName,
  enrollments,
  courses,
  onRenewCourse
}) => {
  const [classes, setClasses] = useState<VirtualClassSession[]>(() => {
    const saved = localStorage.getItem('jud_virtual_classes');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_VIRTUAL_CLASSES;
  });

  const [filterTab, setFilterTab] = useState<'todas' | 'activas' | 'futuras' | 'finalizadas'>('todas');

  // Load from backend if available
  useEffect(() => {
    apiFetch(`/api/virtual-classes?studentId=${studentId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.classes?.length) {
          setClasses(data.classes);
        }
      })
      .catch(() => {});
  }, [studentId]);

  // Check student authorization for a class session
  const checkAccess = (session: VirtualClassSession) => {
    const enrollment = enrollments.find(e => e.studentId === studentId && e.courseId === session.courseId);
    
    // Si no tiene matrícula en el curso
    if (!enrollment) {
      return {
        authorized: false,
        reason: 'No matriculado en este curso.',
        enrollmentStatus: 'not_enrolled',
        course: courses.find(c => c.id === session.courseId)
      };
    }

    // Si la matrícula está vencida o suspendida
    const isExpired = enrollment.status === 'expired' || 
      (enrollment.expiresAt && new Date(enrollment.expiresAt).getTime() < Date.now()) ||
      (enrollment.validUntil && new Date(enrollment.validUntil).getTime() < Date.now());

    if (isExpired) {
      return {
        authorized: false,
        reason: 'Matrícula vencida. El acceso a Google Meet se encuentra restringido.',
        enrollmentStatus: 'expired',
        course: courses.find(c => c.id === session.courseId)
      };
    }

    if (enrollment.status === 'suspended' || enrollment.status === 'cancelled') {
      return {
        authorized: false,
        reason: 'Matrícula suspendida por administración.',
        enrollmentStatus: enrollment.status,
        course: courses.find(c => c.id === session.courseId)
      };
    }

    return {
      authorized: true,
      reason: 'Matrícula institucional activa y validada.',
      enrollmentStatus: 'active',
      course: courses.find(c => c.id === session.courseId)
    };
  };

  const filtered = classes.filter(c => {
    if (filterTab === 'activas') return c.status === 'activa';
    if (filterTab === 'futuras') return c.status === 'futura' || c.status === 'reprogramada';
    if (filterTab === 'finalizadas') return c.status === 'finalizada' || c.status === 'cancelada';
    return true;
  });

  const getStatusBadge = (status: VirtualClassStatus) => {
    switch (status) {
      case 'activa':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>CLASE EN VIVO AHORA</span>
          </span>
        );
      case 'futura':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-900 border border-sky-300">
            <Clock className="w-3.5 h-3.5 text-sky-700" />
            <span>Clase Programada</span>
          </span>
        );
      case 'reprogramada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            <span>Reprogramada</span>
          </span>
        );
      case 'finalizada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-stone-500" />
            <span>Finalizada</span>
          </span>
        );
      case 'cancelada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300">
            <XCircle className="w-3.5 h-3.5 text-red-700" />
            <span>Cancelada</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header of Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-700 animate-pulse" />
              <span>Aulas Virtuales Oficiales</span>
            </span>
            <span className="text-xs text-stone-400 font-serif italic">
              Google Meet Institucional
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mt-1">
            Clases Virtuales en Tiempo Real
          </h2>
          <p className="text-xs text-stone-500 max-w-2xl">
            Acceso directo y seguro a las sesiones sincrónicas con los maestros de la academia. El botón <strong>[Entrar a clase]</strong> se habilita exclusivamente si cuentas con matrícula institucional vigente.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="bg-white p-1 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-1 self-start sm:self-auto">
          <button
            onClick={() => setFilterTab('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'todas' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Todas ({classes.length})
          </button>
          <button
            onClick={() => setFilterTab('activas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'activas' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            En Vivo ({classes.filter(c => c.status === 'activa').length})
          </button>
          <button
            onClick={() => setFilterTab('futuras')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'futuras' ? 'bg-sky-600 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Próximas ({classes.filter(c => c.status === 'futura' || c.status === 'reprogramada').length})
          </button>
          <button
            onClick={() => setFilterTab('finalizadas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'finalizadas' ? 'bg-stone-700 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Historial ({classes.filter(c => c.status === 'finalizada' || c.status === 'cancelada').length})
          </button>
        </div>
      </div>

      {/* Classes List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-stone-200 text-stone-400 space-y-2">
            <Video className="w-8 h-8 mx-auto text-stone-300" />
            <p className="text-sm font-medium">No hay clases virtuales en esta categoría.</p>
          </div>
        ) : (
          filtered.map(item => {
            const auth = checkAccess(item);
            const isLive = item.status === 'activa';
            const isCancelled = item.status === 'cancelada';
            const isFinished = item.status === 'finalizada';
            const isRescheduled = item.status === 'reprogramada';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all space-y-4 ${
                  isLive
                    ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : isCancelled
                    ? 'border-red-200 bg-stone-50/60 opacity-90'
                    : isRescheduled
                    ? 'border-amber-300 bg-amber-50/10'
                    : 'border-stone-200 shadow-xs'
                }`}
              >
                {/* Header of session card */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
                        {item.courseTitle}
                      </span>
                      <span className="text-xs text-stone-400 font-medium">
                        • {item.moduleTitle}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-stone-900 pt-0.5">
                      {item.classTitle}
                    </h3>
                  </div>

                  {/* ACTION BUTTON: [Entrar a clase] ONLY IF AUTHORIZED AND NOT CANCELLED/FINISHED */}
                  <div className="shrink-0 self-start sm:self-auto">
                    {auth.authorized ? (
                      !isCancelled && !isFinished ? (
                        <a
                          href={item.meetUrl}
                          target="_blank"
                          rel="noreferrer"
                          id={`join-meet-${item.id}`}
                          className={`px-6 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                            isLive
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-600/30 animate-pulse'
                              : 'bg-stone-900 hover:bg-stone-800 text-white'
                          }`}
                        >
                          <Video className="w-4 h-4" />
                          <span>[Entrar a clase]</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : isFinished ? (
                        <span className="px-4 py-2 bg-stone-100 text-stone-500 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-stone-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-stone-400" />
                          <span>Sesión Finalizada</span>
                        </span>
                      ) : (
                        <span className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-red-200">
                          <Ban className="w-3.5 h-3.5 text-red-500" />
                          <span>Clase Cancelada</span>
                        </span>
                      )
                    ) : (
                      /* Denied access: NO MEET LINK EXPOSED */
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="px-4 py-2 bg-stone-100 text-stone-500 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-stone-300">
                          <Lock className="w-3.5 h-3.5 text-red-500" />
                          <span>Meet Bloqueado</span>
                        </span>
                        {auth.course && onRenewCourse && (
                          <button
                            onClick={() => onRenewCourse(auth.course!)}
                            className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Renovar Matrícula</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Reprogramming Banner */}
                {isRescheduled && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
                    <RotateCcw className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Aviso de Reprogramación:</span>
                      <p className="mt-0.5 text-amber-900">
                        Esta clase cambió de fecha. Horario anterior: <del>{item.previousDate} {item.previousTime}</del> → <strong className="text-amber-950">Nuevo horario: {item.date} a las {item.time}</strong>.
                      </p>
                      {item.rescheduledReason && (
                        <p className="text-[11px] text-amber-800 italic mt-0.5">Nota: {item.rescheduledReason}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Cancellation Banner */}
                {isCancelled && (
                  <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-950 text-xs flex items-start gap-2.5">
                    <Ban className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Notificación de Cancelación Oficial:</span>
                      <p className="mt-0.5 text-red-900">
                        {item.cancellationReason || 'Sesión suspendida. Se notificará la fecha de reposición.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Unauthorized Warning Banner */}
                {!auth.authorized && (
                  <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-200 text-stone-700 text-xs flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-900">Acceso Restringido por Matrícula:</span>
                      <p className="mt-0.5 text-stone-600">
                        {auth.reason} Para salvaguardar la exclusividad académica de la Academia Musical Judá, el enlace seguro de Google Meet se mantiene estrictamente protegido.
                      </p>
                    </div>
                  </div>
                )}

                {/* Session Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs pt-1">
                  <div className="space-y-1">
                    <span className="text-stone-400 block font-medium">Profesor Titular</span>
                    <p className="font-bold text-stone-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span>{item.teacherName}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-stone-400 block font-medium">Fecha y Horario</span>
                    <p className="font-bold text-stone-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{item.date} • {item.time} hrs</span>
                    </p>
                    <span className="text-[11px] text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>Duración: {item.durationFormatted}</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-stone-400 block font-medium">Estado de Convocatoria</span>
                    <p className="font-bold text-stone-800 flex items-center gap-1.5">
                      {auth.authorized ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Convocatoria Confirmada</span>
                        </span>
                      ) : (
                        <span className="text-stone-500 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-stone-400" />
                          <span>Sin Convocatoria Activa</span>
                        </span>
                      )}
                    </p>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {auth.authorized && item.meetCode ? `Sala: ${item.meetCode}` : 'Sala privada protegida'}
                    </span>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
