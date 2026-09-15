import { VirtualClassSession } from '../types';

export const INITIAL_VIRTUAL_CLASSES: VirtualClassSession[] = [
  {
    id: 'vc-piano-active-01',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    moduleId: 'mod-piano-1',
    moduleTitle: 'Módulo 1: Fundamentos del Mecanismo y Digitación',
    classId: 'class-p-101',
    classTitle: 'Clase Virtual en Vivo: Hanon, Escala de Do Mayor y Postura',
    teacherId: 'teacher-carlos',
    teacherName: 'Prof. Carlos Mendoza',
    teacherEmail: 'carlos.mendoza@judamusic.edu',
    students: [
      {
        studentId: 'student-mario',
        studentName: 'Mario Barillas',
        studentEmail: 'mariobarillas24@gmail.com',
        attendanceStatus: 'presente'
      },
      {
        studentId: 'student-sofia',
        studentName: 'Sofía Delgado',
        studentEmail: 'sofia.delgado@example.com',
        attendanceStatus: 'pendiente'
      }
    ],
    date: '2026-09-11',
    time: '18:00',
    durationMinutes: 60,
    durationFormatted: '60 min',
    status: 'activa', // En curso en este momento
    meetUrl: 'https://meet.google.com/jud-piano-vivo',
    meetCode: 'jud-piano-vivo',
    googleEventId: 'gcal_ev_piano_vivo_2026',
    googleCalendarHtmlLink: 'https://calendar.google.com/calendar/event?eid=gcal_ev_piano_vivo_2026',
    syncedWithGoogleAt: '2026-09-11T14:30:00Z',
    syncStatus: 'synced',
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-11T14:30:00Z'
  },
  {
    id: 'vc-piano-future-02',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    moduleId: 'mod-piano-2',
    moduleTitle: 'Módulo 2: Articulación Clásica y Sonatinas de Clementi',
    classId: 'class-p-102',
    classTitle: 'Taller Virtual: Fraseo Musical y Balance Dinámico en Clementi Op. 36',
    teacherId: 'teacher-carlos',
    teacherName: 'Prof. Carlos Mendoza',
    teacherEmail: 'carlos.mendoza@judamusic.edu',
    students: [
      {
        studentId: 'student-mario',
        studentName: 'Mario Barillas',
        studentEmail: 'mariobarillas24@gmail.com',
        attendanceStatus: 'pendiente'
      }
    ],
    date: '2026-09-18',
    time: '17:30',
    durationMinutes: 90,
    durationFormatted: '90 min',
    status: 'futura',
    meetUrl: 'https://meet.google.com/jud-clementi-live',
    meetCode: 'jud-clementi-live',
    googleEventId: 'gcal_ev_clementi_2026',
    googleCalendarHtmlLink: 'https://calendar.google.com/calendar/event?eid=gcal_ev_clementi_2026',
    syncedWithGoogleAt: '2026-09-10T12:00:00Z',
    syncStatus: 'synced',
    createdAt: '2026-09-02T11:00:00Z',
    updatedAt: '2026-09-10T12:00:00Z'
  },
  {
    id: 'vc-guitar-rescheduled-03',
    courseId: 'course-guitar',
    courseTitle: 'Guitarra Clásica & Armonía Moderna',
    moduleId: 'mod-guitar-1',
    moduleTitle: 'Módulo 1: Apoyando y Tirando en Mano Derecha',
    classId: 'class-g-101',
    classTitle: 'Clase Virtual: Estudios Sencillos de Leo Brouwer (Reprogramada)',
    teacherId: 'teacher-david',
    teacherName: 'Prof. David Arana',
    teacherEmail: 'david.arana@judamusic.edu',
    students: [
      {
        studentId: 'student-lucas',
        studentName: 'Lucas Méndez',
        studentEmail: 'lucas.mendez@example.com',
        attendanceStatus: 'pendiente'
      }
    ],
    date: '2026-09-16',
    time: '19:00',
    durationMinutes: 60,
    durationFormatted: '60 min',
    status: 'reprogramada',
    previousDate: '2026-09-12',
    previousTime: '16:00',
    rescheduledAt: '2026-09-10T15:00:00Z',
    rescheduledReason: 'Ajuste de agenda por recital de docentes de cuerda.',
    meetUrl: 'https://meet.google.com/jud-guitar-brouwer',
    meetCode: 'jud-guitar-brouwer',
    googleEventId: 'gcal_ev_guitar_brouwer',
    syncedWithGoogleAt: '2026-09-10T15:05:00Z',
    syncStatus: 'synced',
    createdAt: '2026-09-03T09:00:00Z',
    updatedAt: '2026-09-10T15:05:00Z'
  },
  {
    id: 'vc-vocal-cancelled-04',
    courseId: 'course-vocal',
    courseTitle: 'Técnica Vocal & Canto Lírico Contemporáneo',
    moduleId: 'mod-vocal-1',
    moduleTitle: 'Módulo 1: Respiración y Resonadores Faciales',
    classId: 'class-v-101',
    classTitle: 'Sesión Virtual: Fonación Libre de Tensión y Apoyo Diafragmático',
    teacherId: 'teacher-elena',
    teacherName: 'Prof. Elena Valenzuela',
    teacherEmail: 'elena.valenzuela@judamusic.edu',
    students: [
      {
        studentId: 'student-mario',
        studentName: 'Mario Barillas',
        studentEmail: 'mariobarillas24@gmail.com',
        attendanceStatus: 'justificado'
      }
    ],
    date: '2026-09-14',
    time: '15:00',
    durationMinutes: 60,
    durationFormatted: '60 min',
    status: 'cancelada',
    cancelledAt: '2026-09-09T18:00:00Z',
    cancellationReason: 'Afección laríngea temporal de la docente. Se repondrá sesión la siguiente semana.',
    meetUrl: 'https://meet.google.com/jud-vocal-respiracion',
    meetCode: 'jud-vocal-respiracion',
    googleEventId: 'gcal_ev_vocal_cancel_01',
    syncedWithGoogleAt: '2026-09-09T18:05:00Z',
    syncStatus: 'synced',
    createdAt: '2026-09-04T12:00:00Z',
    updatedAt: '2026-09-09T18:05:00Z'
  },
  {
    id: 'vc-piano-finished-05',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    moduleId: 'mod-piano-1',
    moduleTitle: 'Módulo 1: Fundamentos del Mecanismo y Digitación',
    classId: 'class-p-100',
    classTitle: 'Sesión Inaugural: Diagnóstico Técnico y Plan de Estudio Semestral',
    teacherId: 'teacher-carlos',
    teacherName: 'Prof. Carlos Mendoza',
    teacherEmail: 'carlos.mendoza@judamusic.edu',
    students: [
      {
        studentId: 'student-mario',
        studentName: 'Mario Barillas',
        studentEmail: 'mariobarillas24@gmail.com',
        attendanceStatus: 'presente'
      }
    ],
    date: '2026-09-05',
    time: '18:00',
    durationMinutes: 60,
    durationFormatted: '60 min',
    status: 'finalizada',
    meetUrl: 'https://meet.google.com/jud-piano-diag',
    meetCode: 'jud-piano-diag',
    googleEventId: 'gcal_ev_piano_diag_done',
    syncedWithGoogleAt: '2026-09-05T19:10:00Z',
    syncStatus: 'synced',
    createdAt: '2026-08-28T10:00:00Z',
    updatedAt: '2026-09-05T19:10:00Z'
  }
];
