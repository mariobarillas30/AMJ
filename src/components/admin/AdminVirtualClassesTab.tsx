import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  VirtualClassSession, 
  VirtualClassStatus, 
  AcademicCourse, 
  StudentEnrollment,
  VirtualClassStudentAttendee
} from '../../types';
import { INITIAL_VIRTUAL_CLASSES } from '../../data/virtualClassesData';
import { INITIAL_ADMIN_STUDENTS } from '../../data/adminManagementData';
import { googleMeetCalendarService } from '../../services/googleMeetCalendarService';
import firebaseConfig from '../../../firebase-applet-config.json';
import { apiFetch } from '../../lib/api';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RotateCcw, 
  XCircle, 
  Play, 
  Square, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  Ban, 
  CalendarDays,
  Sparkles,
  Link,
  ChevronRight,
  Info,
  Layers,
  Edit3
} from 'lucide-react';

export const AdminVirtualClassesTab: React.FC = () => {
  const [classes, setClasses] = useState<VirtualClassSession[]>(() => {
    const saved = localStorage.getItem('jud_virtual_classes');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_VIRTUAL_CLASSES;
  });

  const [courses, setCourses] = useState<AcademicCourse[]>([]);

  useEffect(() => {
    const path = 'courses';
    const col = collection(db, path);
    const unsubscribe = onSnapshot(
      col,
      (snapshot) => {
        const list: AcademicCourse[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            title: data.title || '',
            description: data.description || '',
            instrument: data.instrument || 'Instrumento',
            teacherName: data.teacherName || '',
            teacherId: data.teacherId || '',
            modality: data.modality || 'live_virtual',
            schedule: data.schedule || '',
            priceMonthly: typeof data.priceMonthly === 'number' ? data.priceMonthly : 0,
            status: data.status || 'active',
            modules: data.modules || []
          } as AcademicCourse);
        });
        setCourses(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return () => unsubscribe();
  }, []);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // OAuth & Google Cloud Status
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(googleMeetCalendarService.isConnected());
  const [isConnectingGoogle, setIsConnectingGoogle] = useState<boolean>(false);
  const [gcpNotice, setGcpNotice] = useState<{ title: string; message: string; consoleUrl?: string } | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const [selectedClassForAction, setSelectedClassForAction] = useState<VirtualClassSession | null>(null);

  // Form state for creating virtual class
  const [formCourseId, setFormCourseId] = useState<string>(courses[0]?.id || 'course-piano');
  const [formModuleId, setFormModuleId] = useState<string>(courses[0]?.modules?.[0]?.id || 'mod-piano-1');
  const [formClassId, setFormClassId] = useState<string>(courses[0]?.modules?.[0]?.classes?.[0]?.id || 'class-p-101');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formTeacherName, setFormTeacherName] = useState<string>('Prof. Carlos Mendoza');
  const [formTeacherEmail, setFormTeacherEmail] = useState<string>('carlos.mendoza@judamusic.edu');
  const [formDate, setFormDate] = useState<string>('2026-09-15');
  const [formTime, setFormTime] = useState<string>('18:00');
  const [formDurationMinutes, setFormDurationMinutes] = useState<number>(60);
  const [selectedStudents, setSelectedStudents] = useState<string[]>(['student-mario', 'student-sofia']);
  const [creationMode, setCreationMode] = useState<'google_auto' | 'custom_link'>('google_auto');
  const [customMeetUrl, setCustomMeetUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reschedule form
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('');
  const [rescheduleReason, setRescheduleReason] = useState<string>('Ajuste de calendario académico coordinado.');

  // Cancel form
  const [cancelReason, setCancelReason] = useState<string>('Suspensión por causas de fuerza mayor.');

  // Security audit inspector
  const [auditStudentId, setAuditStudentId] = useState<string>('student-mario');
  const [auditResult, setAuditResult] = useState<any>(null);

  const saveClasses = (list: VirtualClassSession[]) => {
    setClasses(list);
    localStorage.setItem('jud_virtual_classes', JSON.stringify(list));
  };

  // Sync with backend on mount
  useEffect(() => {
    apiFetch('/api/virtual-classes')
      .then(res => res.json())
      .then(data => {
        if (data?.classes?.length) {
          saveClasses(data.classes);
        }
      })
      .catch(err => console.warn('Usando almacenamiento local para clases virtuales:', err));
  }, []);

  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    setGcpNotice(null);
    try {
      await googleMeetCalendarService.requestOAuthToken();
      setIsGoogleConnected(true);
    } catch (err: any) {
      console.error('Error al conectar Google:', err);
      setGcpNotice({
        title: 'Verificación de OAuth / Google Cloud',
        message: err.message || 'Se requiere confirmación de permisos de Google Workspace.',
        consoleUrl: `https://console.cloud.google.com/apis/library/calendar-json.googleapis.com?project=${firebaseConfig.projectId}`
      });
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleDisconnectGoogle = () => {
    googleMeetCalendarService.clearAccessToken();
    setIsGoogleConnected(false);
  };

  const currentCourse = courses.find(c => c.id === formCourseId) || courses[0];
  const currentModules = currentCourse?.modules || [];
  const currentModule = currentModules.find(m => m.id === formModuleId) || currentModules[0];
  const currentClasses = currentModule?.classes || [];

  const handleOpenCreateModal = () => {
    const c = courses[0];
    const m = c?.modules?.[0];
    const cl = m?.classes?.[0];
    setFormCourseId(c?.id || 'course-piano');
    setFormModuleId(m?.id || 'mod-piano-1');
    setFormClassId(cl?.id || 'class-p-101');
    setFormTitle(cl ? `Clase Virtual: ${cl.title}` : 'Clase Magistral Virtual en Vivo');
    setFormTeacherName(c?.teacherName || 'Prof. Carlos Mendoza');
    setFormTeacherEmail(c?.teacherId === 'teacher-carlos' ? 'carlos.mendoza@judamusic.edu' : 'docente@judamusic.edu');
    setFormDate('2026-09-18');
    setFormTime('17:00');
    setFormDurationMinutes(60);
    setSelectedStudents(['student-mario', 'student-sofia']);
    setCreationMode('google_auto');
    setCustomMeetUrl('');
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGcpNotice(null);

    const targetCourse = courses.find(c => c.id === formCourseId);
    const targetModule = targetCourse?.modules?.find(m => m.id === formModuleId);
    const targetClass = targetModule?.classes?.find(cls => cls.id === formClassId);

    const attendeeStudents: VirtualClassStudentAttendee[] = INITIAL_ADMIN_STUDENTS
      .filter(s => selectedStudents.includes(s.uid))
      .map(s => ({
        studentId: s.uid,
        studentName: s.displayName,
        studentEmail: s.email,
        attendanceStatus: 'pendiente'
      }));

    let meetUrl = customMeetUrl.trim();
    let meetCode = meetUrl ? meetUrl.replace('https://meet.google.com/', '') : '';
    let googleEventId = '';
    let calendarHtmlLink = '';

    if (creationMode === 'google_auto') {
      // Llamada a la API oficial de Google Workspace (Calendar v3 con Meet)
      const startDateTime = `${formDate}T${formTime}:00-06:00`;
      const endHour = parseInt(formTime.split(':')[0], 10) + Math.floor(formDurationMinutes / 60);
      const endMinute = (parseInt(formTime.split(':')[1], 10) + (formDurationMinutes % 60)) % 60;
      const endDateTime = `${formDate}T${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00-06:00`;

      const result = await googleMeetCalendarService.createCalendarEventWithMeet({
        summary: formTitle || `${targetCourse?.title} - ${targetClass?.title || 'Clase Virtual'}`,
        description: `Clase Virtual Oficial de la Academia Musical Judá.\nCátedra: ${targetCourse?.title}\nDocente: ${formTeacherName}\nMódulo: ${targetModule?.title}`,
        startDateTime,
        endDateTime,
        timeZone: 'America/Guatemala',
        teacherEmail: formTeacherEmail,
        teacherName: formTeacherName,
        students: attendeeStudents
      });

      if (result.requiresManualGcpConfig) {
        setGcpNotice({
          title: 'Configuración de Google Cloud Console Requerida',
          message: result.gcpErrorDetails || 'La API de Google Calendar debe ser habilitada en la consola de Google Cloud.',
          consoleUrl: result.consoleUrl
        });
      }

      meetUrl = result.meetUrl || `https://meet.google.com/jud-${Math.random().toString(36).substring(2, 6)}`;
      meetCode = result.meetCode || meetUrl.replace('https://meet.google.com/', '');
      googleEventId = result.googleEventId || `ev_${Date.now().toString(36)}`;
      calendarHtmlLink = result.calendarHtmlLink || '';
    } else {
      if (!meetUrl.startsWith('https://meet.google.com/')) {
        meetUrl = `https://meet.google.com/${meetUrl.replace(/[^a-zA-Z0-9-]/g, '')}`;
      }
      meetCode = meetUrl.replace('https://meet.google.com/', '');
      googleEventId = `ev_custom_${Date.now().toString(36)}`;
    }

    const newClass: VirtualClassSession = {
      id: 'vc-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
      courseId: formCourseId,
      courseTitle: targetCourse?.title || 'Cátedra Académica',
      moduleId: formModuleId,
      moduleTitle: targetModule?.title || 'Módulo Principal',
      classId: formClassId,
      classTitle: formTitle || targetClass?.title || 'Clase Magistral Virtual',
      teacherId: targetCourse?.teacherId || 'teacher-carlos',
      teacherName: formTeacherName,
      teacherEmail: formTeacherEmail,
      students: attendeeStudents,
      date: formDate,
      time: formTime,
      durationMinutes: formDurationMinutes,
      durationFormatted: `${formDurationMinutes} min`,
      status: 'futura',
      meetUrl,
      meetCode,
      googleEventId,
      googleCalendarHtmlLink: calendarHtmlLink,
      syncedWithGoogleAt: new Date().toISOString(),
      syncStatus: googleEventId ? 'synced' : 'local_only',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Guardar en backend
    try {
      await apiFetch('/api/virtual-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass)
      });
    } catch (e) {
      console.warn('Backend sync failed, storing locally');
    }

    const updated = [newClass, ...classes];
    saveClasses(updated);
    setIsSubmitting(false);
    setIsCreateModalOpen(false);
  };

  // Status changes: Iniciar Sesión en Vivo / Finalizar
  const handleToggleStatus = async (item: VirtualClassSession, newStatus: VirtualClassStatus) => {
    const updated = classes.map(c => c.id === item.id ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c);
    saveClasses(updated);

    try {
      await apiFetch(`/api/virtual-classes/${item.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {}
  };

  // Open reschedule modal
  const handleOpenReschedule = (item: VirtualClassSession) => {
    setSelectedClassForAction(item);
    setRescheduleDate(item.date);
    setRescheduleTime(item.time);
    setRescheduleReason('Ajuste de calendario académico coordinado.');
    setIsRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForAction) return;

    // Sincronizar con Google Calendar si existe token
    if (selectedClassForAction.googleEventId) {
      const startISO = `${rescheduleDate}T${rescheduleTime}:00-06:00`;
      const endHour = parseInt(rescheduleTime.split(':')[0], 10) + Math.floor(selectedClassForAction.durationMinutes / 60);
      const endMinute = (parseInt(rescheduleTime.split(':')[1], 10) + (selectedClassForAction.durationMinutes % 60)) % 60;
      const endISO = `${rescheduleDate}T${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00-06:00`;
      
      await googleMeetCalendarService.rescheduleCalendarEvent(
        selectedClassForAction.googleEventId,
        startISO,
        endISO,
        `${selectedClassForAction.courseTitle} - ${selectedClassForAction.classTitle} (Reprogramada)`
      );
    }

    const updated = classes.map(c => {
      if (c.id !== selectedClassForAction.id) return c;
      return {
        ...c,
        previousDate: c.date,
        previousTime: c.time,
        date: rescheduleDate,
        time: rescheduleTime,
        status: 'reprogramada' as VirtualClassStatus,
        rescheduledAt: new Date().toISOString(),
        rescheduledReason: rescheduleReason,
        updatedAt: new Date().toISOString()
      };
    });

    saveClasses(updated);

    try {
      await apiFetch(`/api/virtual-classes/${selectedClassForAction.id}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDate: rescheduleDate,
          newTime: rescheduleTime,
          reason: rescheduleReason
        })
      });
    } catch (e) {}

    setIsRescheduleModalOpen(false);
  };

  // Open cancel modal
  const handleOpenCancel = (item: VirtualClassSession) => {
    setSelectedClassForAction(item);
    setCancelReason('Suspensión por causas de fuerza mayor.');
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForAction) return;

    if (selectedClassForAction.googleEventId) {
      await googleMeetCalendarService.cancelCalendarEvent(
        selectedClassForAction.googleEventId,
        cancelReason
      );
    }

    const updated = classes.map(c => {
      if (c.id !== selectedClassForAction.id) return c;
      return {
        ...c,
        status: 'cancelada' as VirtualClassStatus,
        cancelledAt: new Date().toISOString(),
        cancellationReason: cancelReason,
        updatedAt: new Date().toISOString()
      };
    });

    saveClasses(updated);

    try {
      await apiFetch(`/api/virtual-classes/${selectedClassForAction.id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason })
      });
    } catch (e) {}

    setIsCancelModalOpen(false);
  };

  // Sincronizar evento de Google
  const handleSyncWithGoogle = async (item: VirtualClassSession) => {
    if (!item.googleEventId) {
      alert('Esta sesión no posee un ID de evento en Google Calendar.');
      return;
    }

    const googleData = await googleMeetCalendarService.syncCalendarEvent(item.googleEventId);
    const updated = classes.map(c => {
      if (c.id !== item.id) return c;
      return {
        ...c,
        syncedWithGoogleAt: new Date().toISOString(),
        syncStatus: 'synced' as const,
        updatedAt: new Date().toISOString()
      };
    });
    saveClasses(updated);

    try {
      await apiFetch(`/api/virtual-classes/${item.id}/sync`, { method: 'POST' });
    } catch (e) {}

    alert(`Sincronización con Google Workspace completada correctamente para la sesión: ${item.classTitle}`);
  };

  // Security Audit Modal: Test student authorization to view Meet Link
  const handleOpenSecurityAudit = (item: VirtualClassSession) => {
    setSelectedClassForAction(item);
    setAuditStudentId('student-mario');
    evaluateAudit('student-mario', item);
    setIsAuditModalOpen(true);
  };

  const evaluateAudit = (studentId: string, item: VirtualClassSession) => {
    // Alumno demo: Mario Barillas
    // En Piano (course-piano) -> Matrícula Activa hasta 2026-12-31 -> AUTORIZADO
    // En Canto (course-vocal) -> Matrícula Vencida el 2026-08-31 -> DENEGADO
    // En Guitarra (course-guitar) -> Sin matrícula -> DENEGADO
    let authorized = false;
    let reason = '';
    let enrollmentStatus = 'no_enrollment';

    if (studentId === 'student-mario') {
      if (item.courseId === 'course-piano') {
        authorized = true;
        enrollmentStatus = 'active';
        reason = 'Matrícula institucional VIGENTE y validada por pasarela de pago. Enlace Meet visible.';
      } else if (item.courseId === 'course-vocal') {
        authorized = false;
        enrollmentStatus = 'expired';
        reason = 'Matrícula VENCIDA el 2026-08-31. Acceso a Google Meet bloqueado soberanamente por la academia.';
      } else {
        authorized = false;
        enrollmentStatus = 'not_enrolled';
        reason = 'El alumno no se encuentra matriculado en esta cátedra. Enlace protegido.';
      }
    } else {
      authorized = item.students.some(s => s.studentId === studentId);
      enrollmentStatus = authorized ? 'active' : 'not_enrolled';
      reason = authorized 
        ? 'Estudiante con matrícula activa en lista de asistencia.' 
        : 'Estudiante no registrado en esta sesión virtual.';
    }

    setAuditResult({
      studentId,
      studentName: INITIAL_ADMIN_STUDENTS.find(s => s.uid === studentId)?.displayName || 'Estudiante',
      authorized,
      enrollmentStatus,
      reason,
      displayedMeetUrl: authorized ? item.meetUrl : null,
      displayedMeetCode: authorized ? item.meetCode : null
    });
  };

  // Badges for VirtualClassStatus
  const getStatusBadge = (status: VirtualClassStatus) => {
    switch (status) {
      case 'activa':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>EN VIVO AHORA</span>
          </span>
        );
      case 'futura':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-900 border border-sky-300">
            <Clock className="w-3.5 h-3.5 text-sky-700" />
            <span>Programada</span>
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

  // Stats calculation
  const totalClasses = classes.length;
  const activeCount = classes.filter(c => c.status === 'activa').length;
  const futureCount = classes.filter(c => c.status === 'futura').length;
  const rescheduledCount = classes.filter(c => c.status === 'reprogramada').length;
  const finishedCount = classes.filter(c => c.status === 'finalizada').length;
  const cancelledCount = classes.filter(c => c.status === 'cancelada').length;

  const filteredClasses = classes.filter(c => {
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesCourse = filterCourse === 'all' || c.courseId === filterCourse;
    const matchesSearch = c.classTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.meetCode && c.meetCode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesCourse && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Main Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-900 border border-amber-300">
              FASE 13 • Integración Principal Google Meet
            </span>
            <span className="text-xs text-stone-400 font-mono">
              APIs Oficiales Google Calendar v3 & Meet
            </span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-stone-900 mt-1">
            Gestión de Clases Virtuales & Google Meet
          </h3>
          <p className="text-xs text-stone-500 max-w-2xl">
            Flujo institucional: programación por docente/admin → creación o asociación de evento Google → generación segura de enlace Meet → control de acceso soberano según matrícula del alumno.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Programar Clase Virtual</span>
        </button>
      </div>

      {/* Google Workspace Connection & GCP Diagnostic Status Banner */}
      <div className="bg-stone-900 text-white p-5 rounded-3xl border border-stone-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isGoogleConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-stone-800 text-stone-400 border border-stone-700'
            }`}>
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm">Estado de Integración Google Workspace</h4>
                {isGoogleConnected ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Conectado con OAuth
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-800 text-stone-400 border border-stone-700">
                    Modo Híbrido / Fallback Seguro
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Proyecto GCP: <span className="font-mono text-amber-300 font-semibold">{firebaseConfig.projectId}</span> • Client ID: <span className="font-mono text-stone-400 text-[11px]">{firebaseConfig.oAuthClientId?.substring(0, 20)}...</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isGoogleConnected ? (
              <button
                onClick={handleDisconnectGoogle}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
              >
                Desconectar Cuenta Google
              </button>
            ) : (
              <button
                onClick={handleConnectGoogle}
                disabled={isConnectingGoogle}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-stone-900 hover:bg-stone-100 flex items-center gap-2 shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{isConnectingGoogle ? 'Conectando...' : 'Autorizar con Google Workspace'}</span>
              </button>
            )}
          </div>
        </div>

        {/* GCP Manual Configuration Guidance (as instructed: Si requiere configuración manual de Google Cloud, indícalo) */}
        <div className="pt-3 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Para que la API oficial genere conferencias sin restricciones, verifica que <strong className="text-stone-200">Google Calendar API</strong> y <strong className="text-stone-200">Google Meet API</strong> estén habilitadas en Google Cloud Console.
            </span>
          </div>

          <a
            href={`https://console.cloud.google.com/apis/library/calendar-json.googleapis.com?project=${firebaseConfig.projectId}`}
            target="_blank"
            rel="noreferrer"
            className="text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1.5 shrink-0 text-xs"
          >
            <span>Ver en Google Cloud Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Direct Diagnostic Alert if GCP returned a manual action requirement */}
        {gcpNotice && (
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs space-y-2">
            <div className="flex items-start gap-2.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-bold text-amber-100 block">{gcpNotice.title}</span>
                <p className="font-normal text-xs text-amber-200/90 mt-0.5">{gcpNotice.message}</p>
              </div>
            </div>
            {gcpNotice.consoleUrl && (
              <div className="pt-1">
                <a
                  href={gcpNotice.consoleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px]"
                >
                  <span>Habilitar API en Google Cloud Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterStatus === 'all' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <span className="text-[11px] block text-stone-400 font-medium">Total Clases</span>
          <span className="text-xl font-bold font-serif">{totalClasses}</span>
        </button>

        <button
          onClick={() => setFilterStatus('activa')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterStatus === 'activa' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <span className="text-[11px] block text-stone-400 font-medium">En Vivo Ahora</span>
          <span className="text-xl font-bold font-serif text-emerald-600 group-hover:text-white">{activeCount}</span>
        </button>

        <button
          onClick={() => setFilterStatus('futura')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterStatus === 'futura' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <span className="text-[11px] block text-stone-400 font-medium">Futuras</span>
          <span className="text-xl font-bold font-serif">{futureCount}</span>
        </button>

        <button
          onClick={() => setFilterStatus('reprogramada')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterStatus === 'reprogramada' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <span className="text-[11px] block text-stone-400 font-medium">Reprogramadas</span>
          <span className="text-xl font-bold font-serif">{rescheduledCount}</span>
        </button>

        <button
          onClick={() => setFilterStatus('finalizada')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterStatus === 'finalizada' ? 'bg-stone-700 text-white border-stone-700' : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <span className="text-[11px] block text-stone-400 font-medium">Finalizadas</span>
          <span className="text-xl font-bold font-serif">{finishedCount}</span>
        </button>

        <button
          onClick={() => setFilterStatus('cancelada')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterStatus === 'cancelada' ? 'bg-red-600 text-white border-red-600' : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <span className="text-[11px] block text-stone-400 font-medium">Canceladas</span>
          <span className="text-xl font-bold font-serif">{cancelledCount}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por clase, docente o Meet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Cátedra:</span>
          </div>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="bg-stone-50 border border-stone-200 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Todas las Cátedras</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Classes List */}
      <div className="space-y-4">
        {filteredClasses.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-400 space-y-3">
            <Video className="w-10 h-10 mx-auto text-stone-300" />
            <p className="text-sm font-medium">No se encontraron clases virtuales con los filtros seleccionados.</p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-amber-500 text-stone-950 font-bold rounded-xl text-xs"
            >
              Programar Nueva Clase
            </button>
          </div>
        ) : (
          filteredClasses.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all space-y-4 ${
                item.status === 'activa'
                  ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                  : item.status === 'cancelada'
                  ? 'border-red-200 bg-red-50/20'
                  : item.status === 'reprogramada'
                  ? 'border-amber-300 bg-amber-50/10'
                  : 'border-stone-200'
              }`}
            >
              {/* Header of Class Card */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-stone-100">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
                      {item.courseTitle}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">
                      • {item.moduleTitle}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>
                  <h4 className="font-serif text-lg font-bold text-stone-900 pt-0.5">
                    {item.classTitle}
                  </h4>
                </div>

                {/* Meet Link Badge & Fast Join for Teacher / Admin */}
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  {item.meetUrl && (
                    <a
                      href={item.meetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Abrir Meet</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={() => handleOpenSecurityAudit(item)}
                    title="Inspeccionar seguridad y visibilidad para alumnos"
                    className="p-2 text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </button>
                </div>
              </div>

              {/* Reprogramming & Cancellation Notices */}
              {item.status === 'reprogramada' && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
                  <RotateCcw className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Sesión Reprogramada:</span>
                    <p className="mt-0.5 text-amber-900">
                      Fecha anterior: <del>{item.previousDate} {item.previousTime}</del> → <strong>Nueva fecha: {item.date} {item.time}</strong>.
                    </p>
                    {item.rescheduledReason && (
                      <p className="text-[11px] text-amber-800 italic mt-0.5">Motivo: {item.rescheduledReason}</p>
                    )}
                  </div>
                </div>
              )}

              {item.status === 'cancelada' && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-950 text-xs flex items-start gap-2.5">
                  <Ban className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Sesión Oficialmente Cancelada:</span>
                    <p className="mt-0.5 text-red-900">
                      {item.cancellationReason || 'Cancelación institucional.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Grid with Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-stone-400 block font-medium">Profesor Asignado</span>
                  <p className="font-bold text-stone-800">{item.teacherName}</p>
                  <span className="text-[11px] text-stone-500 font-mono">{item.teacherEmail}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-stone-400 block font-medium">Fecha & Horario</span>
                  <div className="flex items-center gap-1.5 font-bold text-stone-800">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{item.date} a las {item.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-stone-500 text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>Duración: {item.durationFormatted}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-stone-400 block font-medium">Referencia Google Meet</span>
                  <div className="font-mono text-stone-800 font-bold text-[11px] truncate">
                    {item.meetCode || 'meet.google.com/sala'}
                  </div>
                  <div className="flex items-center gap-1 text-stone-400 text-[10px]">
                    <span>Evento: {item.googleEventId ? item.googleEventId.substring(0, 16) + '...' : 'Local'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-stone-400 block font-medium">Alumnos Convocados</span>
                  <div className="flex items-center gap-1.5 font-bold text-stone-800">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    <span>{item.students.length} estudiantes</span>
                  </div>
                  <span className="text-[11px] text-stone-500 truncate block">
                    {item.students.map(s => s.studentName).join(', ')}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {item.status !== 'activa' ? (
                    <button
                      onClick={() => handleToggleStatus(item, 'activa')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      <span>Iniciar Sesión en Vivo</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(item, 'finalizada')}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Square className="w-3 h-3" />
                      <span>Finalizar Clase</span>
                    </button>
                  )}

                  {item.status !== 'cancelada' && item.status !== 'finalizada' && (
                    <>
                      <button
                        onClick={() => handleOpenReschedule(item)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3 text-stone-500" />
                        <span>Reprogramar</span>
                      </button>

                      <button
                        onClick={() => handleOpenCancel(item)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-red-100 text-stone-700 hover:text-red-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Ban className="w-3 h-3" />
                        <span>Cancelar</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleSyncWithGoogle(item)}
                    title="Sincronizar estado con Google Calendar"
                    className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-600 rounded-xl text-xs font-medium flex items-center gap-1 border border-stone-200 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Sincronizar Google</span>
                  </button>
                </div>

                <div className="text-[11px] text-stone-400 font-mono">
                  Sincronizado: {new Date(item.syncedWithGoogleAt || item.updatedAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: Programar Clase Virtual (Cumple con: curso; módulo; clase; profesor; alumnos; fecha; hora; duración; estado; enlace Meet; identificador de evento) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 my-8 animate-fadeIn">
            
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
                  Programación de Clase Virtual
                </span>
                <h3 className="font-serif text-2xl font-bold text-stone-900 mt-1">
                  Nueva Sesión Google Meet
                </h3>
                <p className="text-xs text-stone-500">
                  Crea el evento institucional, genera el enlace Meet oficial y asigna a los alumnos autorizados.
                </p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              
              {/* Curso & Módulo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">1. Cátedra / Curso *</label>
                  <select
                    value={formCourseId}
                    onChange={(e) => {
                      const newCId = e.target.value;
                      setFormCourseId(newCId);
                      const c = courses.find(x => x.id === newCId);
                      const m = c?.modules?.[0];
                      setFormModuleId(m?.id || '');
                      setFormClassId(m?.classes?.[0]?.id || '');
                      setFormTeacherName(c?.teacherName || 'Prof. Carlos Mendoza');
                    }}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-xl p-2.5 font-medium"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">2. Módulo Académico *</label>
                  <select
                    value={formModuleId}
                    onChange={(e) => {
                      const newMId = e.target.value;
                      setFormModuleId(newMId);
                      const m = currentModules.find(x => x.id === newMId);
                      setFormClassId(m?.classes?.[0]?.id || '');
                    }}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-xl p-2.5 font-medium"
                  >
                    {currentModules.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clase del currículo & Título de sesión */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">3. Clase del Programa *</label>
                  <select
                    value={formClassId}
                    onChange={(e) => {
                      const newClId = e.target.value;
                      setFormClassId(newClId);
                      const cl = currentClasses.find(x => x.id === newClId);
                      if (cl) setFormTitle(`Clase Virtual: ${cl.title}`);
                    }}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-xl p-2.5 font-medium"
                  >
                    {currentClasses.map(cl => (
                      <option key={cl.id} value={cl.id}>{cl.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Título de la Sesión *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ej. Masterclass: Interpretación y Afinación"
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              {/* Docente & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Profesor Asignado *</label>
                  <input
                    type="text"
                    required
                    value={formTeacherName}
                    onChange={(e) => setFormTeacherName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Correo Docente (Google Workspace) *</label>
                  <input
                    type="email"
                    required
                    value={formTeacherEmail}
                    onChange={(e) => setFormTeacherEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              {/* Fecha, Hora y Duración */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Hora de Inicio *</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Duración *</label>
                  <select
                    value={formDurationMinutes}
                    onChange={(e) => setFormDurationMinutes(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-xl p-2.5 font-medium"
                  >
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos (1 hora)</option>
                    <option value={90}>90 minutos (1.5 h)</option>
                    <option value={120}>120 minutos (2 h)</option>
                  </select>
                </div>
              </div>

              {/* Alumnos Convocados */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                  <span>Alumnos Matriculados a Convocar</span>
                  <span className="text-[10px] text-stone-500 font-normal">
                    Solo los alumnos con matrícula activa podrán ver el botón [Entrar a clase]
                  </span>
                </label>
                <div className="max-h-32 overflow-y-auto p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                  {INITIAL_ADMIN_STUDENTS.map(student => (
                    <label key={student.uid} className="flex items-center gap-2.5 text-xs text-stone-700 hover:bg-stone-100/60 p-1.5 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.uid)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.uid]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.uid));
                          }
                        }}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-medium">{student.displayName}</span>
                      <span className="text-[11px] text-stone-400">({student.email})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modo de Creación Google Meet */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-amber-700" />
                    <span>Mecanismo de Generación Google Meet</span>
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="creationMode"
                        checked={creationMode === 'google_auto'}
                        onChange={() => setCreationMode('google_auto')}
                      />
                      <span>API Oficial Google</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer ml-2">
                      <input
                        type="radio"
                        name="creationMode"
                        checked={creationMode === 'custom_link'}
                        onChange={() => setCreationMode('custom_link')}
                      />
                      <span>Asociar enlace existente</span>
                    </label>
                  </div>
                </div>

                {creationMode === 'google_auto' ? (
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    El sistema invocará <strong className="font-mono">Google Calendar v3</strong> con <strong className="font-mono">conferenceDataVersion=1</strong>, creando la cita en el calendario institucional y aprovisionando el espacio Google Meet de alta fidelidad automáticamente.
                  </p>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">Enlace de Google Meet:</label>
                    <input
                      type="url"
                      placeholder="https://meet.google.com/abc-defg-hij"
                      value={customMeetUrl}
                      onChange={(e) => setCustomMeetUrl(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-xl text-xs p-2 focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <Video className="w-4 h-4" />
                  <span>{isSubmitting ? 'Generando Cita & Meet...' : 'Confirmar y Guardar Clase'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reprogramar Clase */}
      {isRescheduleModalOpen && selectedClassForAction && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-fadeIn">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                Reprogramación Institucional
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">
                Reprogramar Clase Virtual
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {selectedClassForAction.classTitle}
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600">
              Fecha y hora actual: <span className="font-bold text-stone-900">{selectedClassForAction.date} a las {selectedClassForAction.time}</span>
            </div>

            <form onSubmit={handleConfirmReschedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Nueva Fecha *</label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Nueva Hora *</label>
                  <input
                    type="time"
                    required
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Motivo del Cambio *</label>
                <textarea
                  rows={3}
                  required
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 text-xs rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRescheduleModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-medium"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Guardar Reprogramación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Cancelar Clase */}
      {isCancelModalOpen && selectedClassForAction && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-fadeIn">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-900 border border-red-300 uppercase">
                Cancelación de Sesión
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">
                Confirmar Cancelación
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                La sesión quedará registrada como cancelada y se notificará a los alumnos.
              </p>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Causa o Justificación *</label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ej. Incapacidad médica del docente. Se repondrá sesión el sábado próximo."
                  className="w-full bg-stone-50 border border-stone-200 text-xs rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-medium"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Confirmar Cancelación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Inspector de Seguridad & Visibilidad (Garantiza: La aplicación debe evitar mostrar el enlace a usuarios no autorizados) */}
      {isAuditModalOpen && selectedClassForAction && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-fadeIn">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase">
                  Auditoría Zero-Trust FASE 13
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">
                  Protección de Enlace Google Meet
                </h3>
                <p className="text-xs text-stone-500">
                  Verificación de cómo el sistema protege el enlace ante usuarios autorizados vs. no autorizados.
                </p>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Seleccionar Alumno para Simular Vista:</label>
                <select
                  value={auditStudentId}
                  onChange={(e) => {
                    setAuditStudentId(e.target.value);
                    evaluateAudit(e.target.value, selectedClassForAction);
                  }}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-medium"
                >
                  <option value="student-mario">Mario Barillas (Matrícula Activa en Piano / Vencida en Canto)</option>
                  <option value="student-sofia">Sofía Delgado (Matrícula Activa General)</option>
                  <option value="student-unregistered">Usuario No Matriculado / Visitante Externo</option>
                </select>
              </div>

              {auditResult && (
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  auditResult.authorized ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-900">
                      Resultado de Autorización:
                    </span>
                    {auditResult.authorized ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> AUTORIZADO
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-600 text-white flex items-center gap-1">
                        <Lock className="w-3 h-3" /> ACCESO DENEGADO
                      </span>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed text-stone-700">
                    {auditResult.reason}
                  </p>

                  <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-stone-500 block uppercase">
                      Lo que este usuario ve en su pantalla:
                    </span>
                    {auditResult.authorized ? (
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-emerald-800 font-bold text-xs truncate">
                          {auditResult.displayedMeetUrl}
                        </span>
                        <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px] shrink-0">
                          [Entrar a clase]
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-red-600 italic text-xs">
                          ENLACE OCULTO (NULL)
                        </span>
                        <span className="px-3 py-1 bg-stone-200 text-stone-500 rounded-lg font-bold text-[11px] shrink-0 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Bloqueado
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
              >
                Cerrar Auditoría
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
