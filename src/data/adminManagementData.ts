import { 
  AdminScheduleItem, 
  AdminMaterialItem, 
  GoogleWorkspaceServiceStatus,
  StudentEnrollment,
  PaymentTransaction,
  UserProfile,
  AcademicCourse
} from '../types';

export interface AdminTeacher {
  uid: string;
  displayName: string;
  email: string;
  instrument: string;
  specialties: string[];
  status: 'active' | 'leave' | 'pending';
  assignedCoursesCount: number;
  weeklyHours: number;
  phone: string;
  hireDate: string;
}

export interface AdminStudent {
  uid: string;
  displayName: string;
  email: string;
  primaryInstrument: string;
  status: 'active' | 'pending' | 'suspended';
  enrolledCoursesCount: number;
  attendanceRate: number;
  joinedAt: string;
  phone: string;
  notes?: string;
}

export const INITIAL_ADMIN_TEACHERS: AdminTeacher[] = [
  {
    uid: 'teacher-carlos',
    displayName: 'Prof. Carlos Mendoza',
    email: 'carlos.mendoza@judamusic.edu',
    instrument: 'Piano',
    specialties: ['Piano Clásico', 'Solfeo y Entrenamiento Auditivo', 'Armonía Funcional'],
    status: 'active',
    assignedCoursesCount: 2,
    weeklyHours: 18,
    phone: '+503 7751-0101',
    hireDate: '2023-01-15'
  },
  {
    uid: 'teacher-elena',
    displayName: 'Prof. Elena Valenzuela',
    email: 'elena.valenzuela@judamusic.edu',
    instrument: 'Canto',
    specialties: ['Técnica Vocal', 'Canto Lírico', 'Impostación & Respiración'],
    status: 'active',
    assignedCoursesCount: 1,
    weeklyHours: 14,
    phone: '+503 7751-0202',
    hireDate: '2023-03-20'
  },
  {
    uid: 'teacher-david',
    displayName: 'Prof. David Arana',
    email: 'david.arana@judamusic.edu',
    instrument: 'Guitarra',
    specialties: ['Guitarra Clásica', 'Armonía Moderna', 'Música de Cámara'],
    status: 'active',
    assignedCoursesCount: 1,
    weeklyHours: 12,
    phone: '+503 7751-0303',
    hireDate: '2023-06-10'
  },
  {
    uid: 'teacher-andres',
    displayName: 'Prof. Andrés Villalobos',
    email: 'andres.villalobos@judamusic.edu',
    instrument: 'Violín',
    specialties: ['Violín Suzuki', 'Práctica Orquestal', 'Postura y Arco'],
    status: 'active',
    assignedCoursesCount: 1,
    weeklyHours: 10,
    phone: '+503 7751-0404',
    hireDate: '2024-01-08'
  },
  {
    uid: 'teacher-rebeca',
    displayName: 'Prof. Rebeca Morales',
    email: 'rebeca.morales@judamusic.edu',
    instrument: 'Batería',
    specialties: ['Batería & Percusión', 'Lectura Rítmica', 'Independencia de Extremidades'],
    status: 'active',
    assignedCoursesCount: 1,
    weeklyHours: 8,
    phone: '+503 7751-0505',
    hireDate: '2024-05-12'
  }
];

export const INITIAL_ADMIN_STUDENTS: AdminStudent[] = [
  {
    uid: 'student-mario',
    displayName: 'Mario Barillas (Alumno Demo)',
    email: 'mariobarillas24@gmail.com',
    primaryInstrument: 'Piano',
    status: 'active',
    enrolledCoursesCount: 1,
    attendanceRate: 98,
    joinedAt: '2026-01-10',
    phone: '+503 7757-3023',
    notes: 'Estudiante avanzado en repertorio clásico Bach/Chopin.'
  },
  {
    uid: 'student-sofia',
    displayName: 'Sofía Delgado',
    email: 'sofia.delgado@example.com',
    primaryInstrument: 'Canto',
    status: 'active',
    enrolledCoursesCount: 1,
    attendanceRate: 95,
    joinedAt: '2026-02-14',
    phone: '+503 7444-2222',
    notes: 'En preparación para audición lírica de fin de ciclo.'
  },
  {
    uid: 'student-mateo',
    displayName: 'Mateo Rivera',
    email: 'mateo.rivera@example.com',
    primaryInstrument: 'Guitarra',
    status: 'active',
    enrolledCoursesCount: 1,
    attendanceRate: 91,
    joinedAt: '2026-03-01',
    phone: '+503 7444-3333',
    notes: 'Interés en arreglos fingerstyle y música barroca.'
  },
  {
    uid: 'student-valentina',
    displayName: 'Valentina Castro',
    email: 'valentina.castro@example.com',
    primaryInstrument: 'Piano',
    status: 'pending',
    enrolledCoursesCount: 0,
    attendanceRate: 0,
    joinedAt: '2026-08-25',
    phone: '+503 7444-4444',
    notes: 'Solicitud de matrícula pendiente de confirmación de pago.'
  },
  {
    uid: 'student-lucas',
    displayName: 'Lucas Méndez',
    email: 'lucas.mendez@example.com',
    primaryInstrument: 'Violín',
    status: 'active',
    enrolledCoursesCount: 1,
    attendanceRate: 88,
    joinedAt: '2026-04-12',
    phone: '+503 7444-5555',
    notes: 'Buen desempeño en método Suzuki volumen 2.'
  },
  {
    uid: 'student-camila',
    displayName: 'Camila Soto',
    email: 'camila.soto@example.com',
    primaryInstrument: 'Batería',
    status: 'suspended',
    enrolledCoursesCount: 0,
    attendanceRate: 65,
    joinedAt: '2026-02-05',
    phone: '+503 7444-6666',
    notes: 'Matrícula pausada temporalmente por viaje académico.'
  }
];

export const INITIAL_ADMIN_ENROLLMENTS: StudentEnrollment[] = [
  {
    id: 'enr-001',
    studentId: 'student-mario',
    studentName: 'Mario Barillas',
    studentEmail: 'mariobarillas24@gmail.com',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    startDate: '2026-01-15',
    expiresAt: '2026-12-31',
    status: 'active',
    modality: 'hybrid',
    accessType: 'full_access',
    paymentMethod: 'stripe',
    enrolledAt: '2026-01-15T10:00:00Z',
    validUntil: '2026-12-31T23:59:59Z',
    approvedBy: 'Dirección General (Superadmin)',
    paymentId: 'pay-001',
    lastValidatedAt: '2026-09-01T12:00:00Z',
    notes: 'Matrícula anual regular al día.'
  },
  {
    id: 'enr-002',
    studentId: 'student-sofia',
    studentName: 'Sofía Morales',
    studentEmail: 'sofia.morales@estudiante.juda.edu',
    courseId: 'course-vocal',
    courseTitle: 'Técnica Vocal & Canto Lírico Contemporáneo',
    startDate: '2026-02-15',
    expiresAt: '2026-12-31',
    status: 'active',
    modality: 'live_virtual',
    accessType: 'full_access',
    paymentMethod: 'tarjeta',
    enrolledAt: '2026-02-15T11:30:00Z',
    validUntil: '2026-12-31T23:59:59Z',
    approvedBy: 'Secretaría Académica',
    paymentId: 'pay-002',
    lastValidatedAt: '2026-09-01T14:30:00Z',
    notes: 'Acceso completo verificado por webhook.'
  },
  {
    id: 'enr-003',
    studentId: 'student-mateo',
    studentName: 'Mateo Sandoval',
    studentEmail: 'mateo.sandoval@estudiante.juda.edu',
    courseId: 'course-guitar',
    courseTitle: 'Guitarra Acústica & Fingerstyle Avanzado',
    startDate: '2026-03-02',
    expiresAt: '2026-12-31',
    status: 'active',
    modality: 'presential',
    accessType: 'materials_only',
    paymentMethod: 'transferencia',
    enrolledAt: '2026-03-02T16:00:00Z',
    validUntil: '2026-12-31T23:59:59Z',
    approvedBy: 'Secretaría Académica',
    paymentId: 'pay-003',
    lastValidatedAt: '2026-08-30T10:00:00Z',
    notes: 'Matrícula especial modalidad presencial con acceso a partituras y materiales.'
  },
  {
    id: 'enr-004',
    studentId: 'student-valentina',
    studentName: 'Valentina Ruiz',
    studentEmail: 'valentina.ruiz@estudiante.juda.edu',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    startDate: '2026-08-28',
    expiresAt: '2026-09-28',
    status: 'pending',
    modality: 'online_recorded',
    accessType: 'full_access',
    paymentMethod: 'paypal',
    enrolledAt: '2026-08-28T09:15:00Z',
    validUntil: '2026-09-28T23:59:59Z',
    approvedBy: 'Pendiente de Validación Webhook',
    notes: 'Esperando confirmación del pago en la pasarela.'
  },
  {
    id: 'enr-005',
    studentId: 'student-camila',
    studentName: 'Camila Herrera',
    studentEmail: 'camila.herrera@estudiante.juda.edu',
    courseId: 'course-guitar',
    courseTitle: 'Guitarra Acústica & Fingerstyle Avanzado',
    startDate: '2026-02-10',
    expiresAt: '2026-06-30',
    status: 'cancelled',
    modality: 'hybrid',
    accessType: 'restricted',
    paymentMethod: 'efectivo',
    enrolledAt: '2026-02-10T14:00:00Z',
    validUntil: '2026-06-30T23:59:59Z',
    approvedBy: 'Administración (Cancelación formal)',
    notes: 'Matrícula cancelada por cambio de residencia.'
  },
  {
    id: 'enr-006',
    studentId: 'student-mario',
    studentName: 'Mario Barillas',
    studentEmail: 'mariobarillas24@gmail.com',
    courseId: 'course-vocal',
    courseTitle: 'Técnica Vocal & Canto Lírico Contemporáneo',
    startDate: '2026-06-01',
    expiresAt: '2026-08-31', // Vencida intencionalmente para pruebas de FASE 10 & 11
    status: 'expired',
    modality: 'live_virtual',
    accessType: 'full_access',
    paymentMethod: 'stripe',
    enrolledAt: '2026-06-01T10:00:00Z',
    validUntil: '2026-08-31T23:59:59Z',
    approvedBy: 'Sistema Central (Expirada autom.)',
    paymentId: 'pay-004',
    lastValidatedAt: '2026-06-01T10:05:00Z',
    notes: 'Periodo de vigencia culminado. Acceso a Meet y Drive bloqueado.'
  },
  {
    id: 'enr-007',
    studentId: 'student-mateo',
    studentName: 'Mateo Sandoval',
    studentEmail: 'mateo.sandoval@estudiante.juda.edu',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    startDate: '2026-05-01',
    expiresAt: '2026-11-30',
    status: 'suspended',
    modality: 'hybrid',
    accessType: 'restricted',
    paymentMethod: 'transferencia',
    enrolledAt: '2026-05-01T11:00:00Z',
    validUntil: '2026-11-30T23:59:59Z',
    approvedBy: 'Coordinación Académica',
    notes: 'Suspendida por mora de colegiatura. Requiere validación de pago.'
  }
];

export const INITIAL_ADMIN_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'pay-001',
    studentId: 'student-mario',
    studentName: 'Mario Barillas',
    studentEmail: 'mariobarillas24@gmail.com',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    amount: 350,
    currency: 'USD',
    gateway: 'stripe',
    status: 'paid',
    gatewayTransactionId: 'ch_3NxStripe9821JudahPiano',
    gatewaySignature: 'sig_sec_sha256_9b83f0d238a9e',
    webhookReceivedAt: '2026-01-15T10:02:14Z',
    validatedByBackend: true,
    validationDetails: 'Webhook Stripe validado por backend. Matrícula enr-001 activada.',
    createdAt: '2026-01-15T10:00:00Z',
    paidAt: '2026-01-15T10:02:15Z'
  },
  {
    id: 'pay-002',
    studentId: 'student-sofia',
    studentName: 'Sofía Morales',
    studentEmail: 'sofia.morales@estudiante.juda.edu',
    courseId: 'course-vocal',
    courseTitle: 'Técnica Vocal & Canto Lírico Contemporáneo',
    amount: 320,
    currency: 'USD',
    gateway: 'tarjeta',
    status: 'paid',
    gatewayTransactionId: 'ch_cybersource_771928_vocal',
    gatewaySignature: 'sig_sec_sha256_10a7b44d211',
    webhookReceivedAt: '2026-02-15T11:32:00Z',
    validatedByBackend: true,
    validationDetails: 'Pasarela aprobada, webhook verificado por servidor central.',
    createdAt: '2026-02-15T11:30:00Z',
    paidAt: '2026-02-15T11:32:05Z'
  },
  {
    id: 'pay-003',
    studentId: 'student-mateo',
    studentName: 'Mateo Sandoval',
    studentEmail: 'mateo.sandoval@estudiante.juda.edu',
    courseId: 'course-guitar',
    courseTitle: 'Guitarra Acústica & Fingerstyle Avanzado',
    amount: 300,
    currency: 'USD',
    gateway: 'transferencia',
    status: 'paid',
    gatewayTransactionId: 'bank_agricola_trans_8829102',
    gatewaySignature: 'sig_sec_manual_audit_secret',
    webhookReceivedAt: '2026-03-02T16:05:00Z',
    validatedByBackend: true,
    validationDetails: 'Boleta de transferencia Banco Agrícola (El Salvador) conciliada por tesorería central.',
    createdAt: '2026-03-02T16:00:00Z',
    paidAt: '2026-03-02T16:05:00Z'
  },
  {
    id: 'pay-004',
    studentId: 'student-mario',
    studentName: 'Mario Barillas',
    studentEmail: 'mariobarillas24@gmail.com',
    courseId: 'course-vocal',
    courseTitle: 'Técnica Vocal & Canto Lírico Contemporáneo',
    amount: 320,
    currency: 'USD',
    gateway: 'stripe',
    status: 'paid',
    gatewayTransactionId: 'ch_stripe_old_expired_session',
    gatewaySignature: 'sig_sec_sha256_expired_cycle',
    webhookReceivedAt: '2026-06-01T10:05:00Z',
    validatedByBackend: true,
    validationDetails: 'Pago correspondiente al ciclo anterior (Jun-Ago 2026). Requiere nueva mensualidad.',
    createdAt: '2026-06-01T10:00:00Z',
    paidAt: '2026-06-01T10:05:00Z'
  }
];

export const INITIAL_ADMIN_SCHEDULES: AdminScheduleItem[] = [
  {
    id: 'sch-001',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    teacherId: 'teacher-carlos',
    teacherName: 'Prof. Carlos Mendoza',
    dayOfWeek: 'Martes',
    startTime: '18:00',
    endTime: '19:30',
    room: 'Aula Acústica 101 (Cabina Gran Piano Yamaha C3)',
    modality: 'live_virtual',
    meetCode: 'jud-bach-piano',
    studentsEnrolled: 14
  },
  {
    id: 'sch-002',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    teacherId: 'teacher-carlos',
    teacherName: 'Prof. Carlos Mendoza',
    dayOfWeek: 'Jueves',
    startTime: '18:00',
    endTime: '19:30',
    room: 'Aula Acústica 101 (Cabina Gran Piano Yamaha C3)',
    modality: 'live_virtual',
    meetCode: 'jud-bach-piano',
    studentsEnrolled: 14
  },
  {
    id: 'sch-003',
    courseId: 'course-vocal',
    courseTitle: 'Técnica Vocal, Canto Lírico & Respiración Diafragmática',
    teacherId: 'teacher-elena',
    teacherName: 'Prof. Elena Valenzuela',
    dayOfWeek: 'Miércoles',
    startTime: '17:00',
    endTime: '18:30',
    room: 'Estudio Vocal 203 (Insonorizado & Monitor de Retorno)',
    modality: 'hybrid',
    meetCode: 'jud-vocal-live',
    studentsEnrolled: 11
  },
  {
    id: 'sch-004',
    courseId: 'course-vocal',
    courseTitle: 'Técnica Vocal, Canto Lírico & Respiración Diafragmática',
    teacherId: 'teacher-elena',
    teacherName: 'Prof. Elena Valenzuela',
    dayOfWeek: 'Viernes',
    startTime: '17:00',
    endTime: '18:30',
    room: 'Estudio Vocal 203 (Insonorizado & Monitor de Retorno)',
    modality: 'hybrid',
    meetCode: 'jud-vocal-live',
    studentsEnrolled: 11
  },
  {
    id: 'sch-005',
    courseId: 'course-guitar',
    courseTitle: 'Guitarra Clásica, Rítmica & Armonía Moderna',
    teacherId: 'teacher-david',
    teacherName: 'Prof. David Arana',
    dayOfWeek: 'Sábado',
    startTime: '09:00',
    endTime: '11:00',
    room: 'Auditorio Central Judá (Ensamble y Trastes)',
    modality: 'presencial',
    meetCode: 'jud-guitar-live',
    studentsEnrolled: 16
  }
];

export const INITIAL_ADMIN_MATERIALS: AdminMaterialItem[] = [
  {
    id: 'mat-001',
    title: 'Hanon: El Pianista Virtuoso en 60 Ejercicios (Edición Urtext Completa)',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    instrument: 'Piano',
    type: 'sheet_music',
    level: 'Intermedio',
    driveFolderId: 'drive-folder-piano-scores',
    driveUrl: 'https://drive.google.com/drive/folders/hanon-urtext-jud',
    size: '8.4 MB',
    isPublic: false,
    uploadedAt: '2026-08-10'
  },
  {
    id: 'mat-002',
    title: 'J.S. Bach: Pequeños Preludios y Fugas (Partituras Digitadas)',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    instrument: 'Piano',
    type: 'sheet_music',
    level: 'Intermedio',
    driveFolderId: 'drive-folder-piano-scores',
    driveUrl: 'https://drive.google.com/drive/folders/bach-preludios-jud',
    size: '12.1 MB',
    isPublic: false,
    uploadedAt: '2026-08-15'
  },
  {
    id: 'mat-003',
    title: 'Nicola Vaccai: Método Práctico de Canto Italiano (Partituras y Pistas)',
    courseId: 'course-vocal',
    courseTitle: 'Técnica Vocal, Canto Lírico & Respiración Diafragmática',
    instrument: 'Canto',
    type: 'sheet_music',
    level: 'Iniciación',
    driveFolderId: 'drive-folder-vocal-scores',
    driveUrl: 'https://drive.google.com/drive/folders/vaccai-metodo-jud',
    size: '24.6 MB',
    isPublic: false,
    uploadedAt: '2026-08-20'
  },
  {
    id: 'mat-004',
    title: 'Guía Anatómica del Soporte Respiratorio y Resonadores Faciales',
    courseId: 'course-vocal',
    courseTitle: 'Técnica Vocal, Canto Lírico & Respiración Diafragmática',
    instrument: 'Canto',
    type: 'pdf_guide',
    level: 'Iniciación',
    driveFolderId: 'drive-folder-vocal-guides',
    driveUrl: 'https://drive.google.com/drive/folders/anatomia-vocal-jud',
    size: '4.2 MB',
    isPublic: true,
    uploadedAt: '2026-08-22'
  },
  {
    id: 'mat-005',
    title: 'Leo Brouwer: Estudios Sencillos del 1 al 10 (Digitación Clásica)',
    courseId: 'course-guitar',
    courseTitle: 'Guitarra Clásica, Rítmica & Armonía Moderna',
    instrument: 'Guitarra',
    type: 'sheet_music',
    level: 'Avanzado',
    driveFolderId: 'drive-folder-guitar-scores',
    driveUrl: 'https://drive.google.com/drive/folders/brouwer-estudios-jud',
    size: '6.8 MB',
    isPublic: false,
    uploadedAt: '2026-08-28'
  },
  {
    id: 'mat-006',
    title: 'Pistas de Práctica Rítmica y Metrónomo para Guitarra Acústica (Audio MP3 320kbps)',
    courseId: 'course-guitar',
    courseTitle: 'Guitarra Clásica, Rítmica & Armonía Moderna',
    instrument: 'Guitarra',
    type: 'audio_backing',
    level: 'Intermedio',
    driveFolderId: 'drive-folder-guitar-audio',
    driveUrl: 'https://drive.google.com/drive/folders/pistas-guitarra-jud',
    size: '45.0 MB',
    isPublic: false,
    uploadedAt: '2026-09-02'
  }
];

export const INITIAL_WORKSPACE_SERVICES: GoogleWorkspaceServiceStatus[] = [
  {
    service: 'meet',
    name: 'Google Meet API',
    status: 'connected',
    activeAccount: 'coordinacion.academica@judamusic.edu',
    organizationDomain: 'judamusic.edu',
    authorizedScopes: [
      'https://www.googleapis.com/auth/meetings.space.created',
      'https://www.googleapis.com/auth/meetings.space.readonly'
    ],
    latencyMs: 38,
    lastSyncAt: '2026-09-10 20:55',
    resourceCount: 12,
    features: [
      'Creación dinámica de salas con prefijo jud-*',
      'Salas virtuales con cifrado WebRTC',
      'Integración automática con horario académico',
      'Registro de asistencia en Firestore'
    ]
  },
  {
    service: 'drive',
    name: 'Google Drive API (Storage)',
    status: 'connected',
    activeAccount: 'coordinacion.academica@judamusic.edu',
    organizationDomain: 'judamusic.edu',
    authorizedScopes: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.file'
    ],
    latencyMs: 44,
    lastSyncAt: '2026-09-10 20:54',
    resourceCount: 128,
    features: [
      'Carpeta central Drive-Judá-Academic-Root/2026',
      'Permisos de solo lectura para alumnos matriculados',
      'Edición exclusiva para docentes titulares',
      'Sincronización de partituras Urtext y métodos PDF'
    ]
  },
  {
    service: 'classroom',
    name: 'Google Classroom API',
    status: 'connected',
    activeAccount: 'coordinacion.academica@judamusic.edu',
    organizationDomain: 'judamusic.edu',
    authorizedScopes: [
      'https://www.googleapis.com/auth/classroom.courses.readonly',
      'https://www.googleapis.com/auth/classroom.coursework.students',
      'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
      'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly'
    ],
    latencyMs: 51,
    lastSyncAt: '2026-09-10 20:52',
    resourceCount: 3,
    features: [
      'Aulas satélite vinculadas con sincronización de tareas',
      'Soberanía de matrícula: solo alumnos aprobados en Judá acceden',
      'Publicación programada de actividades prácticas',
      'Calificaciones sincronizadas con expediente académico central'
    ]
  }
];
