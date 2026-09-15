export type UserRole = 'superadmin' | 'admin' | 'teacher' | 'student';

export type UserStatus = 'active' | 'pending' | 'suspended';

export interface GoogleServicesConfig {
  meet?: boolean;
  drive?: boolean;
  classroom?: boolean;
  calendar?: boolean;
  linkedEmail?: string;
  connectedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phone?: string;
  instrument?: string;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  googleConnected?: boolean;
  googleServices?: GoogleServicesConfig;
  bio?: string;
  birthDate?: string;
}

export interface AdminRecord {
  uid: string;
  email: string;
  role: 'superadmin' | 'admin';
  grantedBy: string;
  createdAt: string;
}

export interface TeacherRecord {
  uid: string;
  email: string;
  specialties?: string[];
  createdAt: string;
}

export interface SecurityAuditLog {
  id: string;
  action: string;
  performedBy: string;
  targetUser: string;
  details: string;
  timestamp: string;
}

export type ClassModality = 'grabada' | 'presencial' | 'virtual_en_vivo' | 'hibrida';

export interface ClassDocument {
  id: string;
  title: string;
  type: 'pdf' | 'sheet_music' | 'guide' | 'audio';
  url: string;
  driveFileId?: string;
  size?: string;
}

export interface ClassExercise {
  id: string;
  title: string;
  description: string;
  tempoBpm?: number;
  keySignature?: string;
  targetTechnique?: string;
}

export interface ClassEvaluation {
  id: string;
  title: string;
  description: string;
  maxScore: number;
  passingScore: number;
  criteria: string[];
  question?: string;
  options?: string[];
  correctAnswerIndex?: number;
}

export interface AcademicClass {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  teacher: string;
  teacherId?: string;
  date: string;
  duration: string;
  modality: ClassModality;
  video?: string;
  documents: ClassDocument[];
  exercises: ClassExercise[];
  evaluation: ClassEvaluation;
  meetUrl?: string;
  meetCode?: string;
  driveUrl?: string;
  driveFolderId?: string;
  classroomUrl?: string;
  classroomId?: string;
  classroomTask?: string;
  order: number;
  status: 'active' | 'draft' | 'archived';
}

export interface AcademicModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  classes?: AcademicClass[];
}

export interface AcademicCourse {
  id: string;
  title: string;
  description: string;
  modality: 'online_recorded' | 'presential' | 'live_virtual' | 'hybrid';
  instrument: string;
  teacherId: string;
  teacherName: string;
  schedule: string;
  priceMonthly: number;
  status: 'active' | 'draft' | 'archived';
  meetUrl?: string;
  meetCode?: string;
  driveFolderId?: string;
  classroomCourseId?: string;
  modules?: AcademicModule[];
}

export type EnrollmentStatus = 'active' | 'expired' | 'cancelled' | 'suspended' | 'pending';
export type AccessType = 'full_access' | 'materials_only' | 'live_sessions' | 'restricted';
export type PaymentMethod = 'stripe' | 'tarjeta' | 'transferencia' | 'efectivo' | 'paypal';
export type EnrollmentModality = 'online_recorded' | 'presential' | 'live_virtual' | 'hybrid';

/**
 * FASE 10 — MATRÍCULAS
 * Estructura oficial:
 * alumno; curso; fecha inicio; vencimiento; estado; modalidad; tipo de acceso; método de pago.
 * Estados: active; expired; cancelled; suspended; pending.
 * La matrícula determina el acceso a: clases, Meet, material, Classroom cuando corresponda, videos.
 * Un alumno con matrícula vencida NO debe recibir acceso a contenido restringido aunque conserve un antiguo enlace de Google.
 */
export interface StudentEnrollment {
  id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  courseId: string;
  courseTitle?: string;
  startDate: string;         // Fecha inicio (YYYY-MM-DD)
  expiresAt: string;         // Vencimiento (YYYY-MM-DD o ISO)
  status: EnrollmentStatus;  // active | expired | cancelled | suspended | pending
  modality: EnrollmentModality; // online_recorded | presential | live_virtual | hybrid
  accessType: AccessType;    // full_access | materials_only | live_sessions | restricted
  paymentMethod: PaymentMethod; // stripe | tarjeta | transferencia | efectivo | paypal
  enrolledAt: string;        // Timestamp de creación
  validUntil?: string;       // Alias de vencimiento para compatibilidad
  approvedBy?: string;
  paymentId?: string;        // ID de la transacción de pago validada por el backend
  lastValidatedAt?: string;  // Fecha de última validación de pasarela/webhook
  notes?: string;
}

/**
 * FASE 11 — PAGOS & ARQUITECTURA DE VALIDACIÓN
 * Pago ↓ Pasarela ↓ Webhook ↓ Backend ↓ Validación ↓ Firestore ↓ Matrícula ↓ Acceso
 * Nunca confíes en paid = true desde el navegador.
 */
export interface PaymentTransaction {
  id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  courseId: string;
  courseTitle?: string;
  amount: number;
  currency: string;
  gateway: PaymentMethod;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  gatewayTransactionId?: string;
  gatewaySignature?: string;
  webhookReceivedAt?: string;
  validatedByBackend: boolean;
  validationDetails?: string;
  createdAt: string;
  paidAt?: string;
}

/**
 * Determina el acceso institucional a recursos basado en la matrícula.
 * Un alumno con matrícula vencida/suspendida/cancelada/pendiente NO recibe acceso a contenido restringido,
 * aunque conserve un enlace directo antiguo de Google Meet, Drive o Classroom.
 */
export interface EnrollmentAccessResult {
  hasAccess: boolean;
  isExpired: boolean;
  status: EnrollmentStatus;
  accessType: AccessType;
  allowedResources: {
    classes: boolean;
    meet: boolean;
    materials: boolean;
    classroom: boolean;
    videos: boolean;
  };
  reason: string;
}

export function evaluateEnrollmentAccess(
  enrollment?: StudentEnrollment | null,
  resource?: 'classes' | 'meet' | 'materials' | 'classroom' | 'videos'
): EnrollmentAccessResult {
  if (!enrollment) {
    return {
      hasAccess: false,
      isExpired: false,
      status: 'pending',
      accessType: 'restricted',
      allowedResources: { classes: false, meet: false, materials: false, classroom: false, videos: false },
      reason: 'No existe registro de matrícula institucional para este curso.'
    };
  }

  // 1. Verificación matemática de vencimiento temporal
  const expiryStr = enrollment.expiresAt || enrollment.validUntil;
  let isExpiredByDate = false;
  if (expiryStr) {
    const exp = new Date(expiryStr);
    if (!expiryStr.includes('T')) {
      exp.setHours(23, 59, 59, 999);
    }
    if (new Date() > exp) {
      isExpiredByDate = true;
    }
  }

  const effectiveStatus: EnrollmentStatus = (isExpiredByDate && enrollment.status === 'active')
    ? 'expired'
    : enrollment.status;

  // 2. Control de estados no activos
  if (effectiveStatus !== 'active') {
    let reasonText = 'Acceso no concedido.';
    if (effectiveStatus === 'expired') {
      reasonText = `Matrícula VENCIDA el ${expiryStr?.split('T')[0] || 'recientemente'}. El acceso a clases, Meet, partituras, Classroom y videos se encuentra bloqueado institucionalmente.`;
    } else if (effectiveStatus === 'suspended') {
      reasonText = 'Matrícula SUSPENDIDA temporalmente por administración. Acceso a recursos revocado.';
    } else if (effectiveStatus === 'cancelled') {
      reasonText = 'Matrícula CANCELADA. Se han revocado todos los permisos de acceso al curso.';
    } else if (effectiveStatus === 'pending') {
      reasonText = 'Matrícula PENDIENTE de confirmación y validación de pago por webhook backend.';
    }

    return {
      hasAccess: false,
      isExpired: effectiveStatus === 'expired',
      status: effectiveStatus,
      accessType: enrollment.accessType || 'restricted',
      allowedResources: { classes: false, meet: false, materials: false, classroom: false, videos: false },
      reason: reasonText
    };
  }

  // 3. Matrícula activa: verificar tipo de acceso
  const aType = enrollment.accessType || 'full_access';
  let allowed = {
    classes: true,
    meet: true,
    materials: true,
    classroom: true,
    videos: true
  };

  if (aType === 'materials_only') {
    allowed = {
      classes: true,
      meet: false,        // Bloqueado para acceso solo materiales
      materials: true,
      classroom: false,
      videos: false
    };
  } else if (aType === 'live_sessions') {
    allowed = {
      classes: true,
      meet: true,
      materials: false,
      classroom: false,
      videos: false
    };
  } else if (aType === 'restricted') {
    allowed = {
      classes: false,
      meet: false,
      materials: false,
      classroom: false,
      videos: false
    };
  }

  const hasSpecificAccess = resource ? allowed[resource] : allowed.classes;

  return {
    hasAccess: hasSpecificAccess,
    isExpired: false,
    status: 'active',
    accessType: aType,
    allowedResources: allowed,
    reason: hasSpecificAccess
      ? 'Acceso plenamente autorizado por matrícula activa vigente.'
      : `El tipo de acceso '${aType}' restringe este recurso pedagógico.`
  };
}

/**
 * FASE 09 — PROGRESO ACADÉMICO (Fuente Principal)
 * Registrar: alumno, curso, módulo, clase, completada, fecha, porcentaje.
 * Google Workspace (Meet, Drive, Classroom) actúa únicamente como información complementaria.
 */
export interface AcademicProgressRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  moduleId: string;
  moduleTitle: string;
  classId: string;
  classTitle: string;
  completed: boolean;
  completedAt: string; // Fecha de finalización o última actualización
  percentage: number; // Porcentaje de completitud (0-100%)
  
  // Fuente de verdad autorizada
  sourceOfTruth: 'internal_platform' | 'classroom_sync' | 'manual';

  // Información complementaria de Google Workspace (NO sustituye el progreso interno)
  classroomActivityCompleted?: boolean;
  classroomSubmissionDate?: string;
  meetSessionAttended?: boolean;
  driveMaterialConsulted?: boolean;

  notes?: string;
}

export interface CourseProgressSummary {
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  instrument: string;
  totalClasses: number;
  completedClasses: number;
  overallPercentage: number;
  lastActivityDate: string;
  modules: {
    moduleId: string;
    moduleTitle: string;
    totalClasses: number;
    completedClasses: number;
    percentage: number;
  }[];
}

export type ActiveNavRoute = 
  | 'home'
  | 'courses'
  | 'profile'
  | 'student-portal'
  | 'teacher-portal'
  | 'academic-progress'
  | 'admin-dashboard'
  | 'admin-roles'
  | 'payments'
  | 'google-integrations'
  | 'security-audit'
  | 'video-security';

// ==========================================
// FASE 12: ARQUITECTURA DE VIDEOS PREMIUM
// ==========================================
export type VideoStorageDriverType = 'academy_secure_stream' | 'specialized_cdn';
export type SpecializedCDNType = 'cloudflare_stream' | 'cloudfront' | 'mux' | 'internal_hls';

export interface PremiumVideoAsset {
  id: string;
  courseId: string;
  classId?: string;
  title: string;
  description: string;
  durationSeconds: number;
  durationFormatted: string;
  resolution: string;
  storageDriver: VideoStorageDriverType;
  cdnProvider?: SpecializedCDNType;
  drmProtection: boolean;
  antiPiracyWatermark: boolean;
  internalSourceKey: string; // Private storage key (never exposed to browser)
  createdAt: string;
}

export interface VideoStreamTicket {
  ticket: string;
  videoId: string;
  videoTitle: string;
  studentId: string;
  studentEmail: string;
  courseId: string;
  streamEndpoint: string; // Ephemeral signed stream URI e.g. /api/videos/stream/:ticket
  issuedAt: string;
  expiresAt: string;
  ttlSeconds: number;
  watermark: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    sessionNonce: string;
    ipHash: string;
    timestamp: string;
  };
  storageDriver: VideoStorageDriverType;
  cdnProvider?: SpecializedCDNType;
  allowedQualities: string[];
}

export interface VideoDriverConfig {
  activeDriver: VideoStorageDriverType;
  cdnProvider: SpecializedCDNType;
  enableDynamicWatermark: boolean;
  ticketTtlSeconds: number;
  enforceHttpRange: boolean;
  strictEnrollmentRecheck: boolean;
  antiDownloadHeaders: boolean;
  drmSimulationEnabled: boolean;
}

export interface VideoSecurityAuditResult {
  testName: string;
  description: string;
  status: 'passed' | 'failed' | 'running';
  httpStatus: number;
  details: string;
  timestamp: string;
}

export interface AdminScheduleItem {
  id: string;
  courseId: string;
  courseTitle: string;
  teacherId: string;
  teacherName: string;
  dayOfWeek: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';
  startTime: string;
  endTime: string;
  room: string;
  modality: 'presencial' | 'live_virtual' | 'hybrid' | 'online_recorded';
  meetCode?: string;
  studentsEnrolled: number;
}

export interface AdminMaterialItem {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  instrument: string;
  type: 'sheet_music' | 'pdf_guide' | 'audio_backing' | 'exercise';
  level: 'Iniciación' | 'Intermedio' | 'Avanzado';
  driveFolderId: string;
  driveUrl: string;
  size: string;
  isPublic: boolean;
  uploadedAt: string;
}

export interface GoogleWorkspaceServiceStatus {
  service: 'meet' | 'drive' | 'classroom';
  name: string;
  status: 'connected' | 'degraded' | 'syncing' | 'disconnected';
  activeAccount: string; // Institutional email (no secrets)
  organizationDomain: string;
  authorizedScopes: string[];
  latencyMs: number;
  lastSyncAt: string;
  resourceCount: number;
  features: string[];
}

export type AuthMode = 'login' | 'register' | 'forgot-password';

/**
 * FASE 13 — CLASES VIRTUALES + GOOGLE MEET
 * Estructura oficial requerida:
 * curso; módulo; clase; profesor; alumnos; fecha; hora; duración; estado; enlace Meet; identificador del evento cuando exista.
 */
export type VirtualClassStatus = 'futura' | 'activa' | 'finalizada' | 'cancelada' | 'reprogramada';

export interface VirtualClassStudentAttendee {
  studentId: string;
  studentName: string;
  studentEmail: string;
  attendanceStatus?: 'presente' | 'ausente' | 'justificado' | 'pendiente';
  joinedAt?: string;
}

export interface VirtualClassSession {
  id: string;
  // curso
  courseId: string;
  courseTitle: string;
  // módulo
  moduleId: string;
  moduleTitle: string;
  // clase
  classId: string;
  classTitle: string;
  // profesor
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  // alumnos
  students: VirtualClassStudentAttendee[];
  // fecha, hora, duración
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  durationFormatted: string;
  // estado
  status: VirtualClassStatus;
  // enlace Meet
  meetUrl?: string;
  meetCode?: string;
  // identificador del evento cuando exista
  googleEventId?: string;
  googleConferenceId?: string;
  googleCalendarHtmlLink?: string;
  googleCalendarId?: string;
  // reprogramaciones y cancelaciones
  previousDate?: string;
  previousTime?: string;
  rescheduledAt?: string;
  rescheduledReason?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  // sincronización y timestamps
  syncedWithGoogleAt?: string;
  syncStatus?: 'synced' | 'local_only' | 'error';
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// FASE 14: GOOGLE DRIVE + CLASSROOM INTEGRATIONS
// ==========================================

/**
 * GOOGLE DRIVE: Categorías oficiales obligatorias:
 * - partituras;
 * - PDFs;
 * - guías;
 * - material complementario;
 * - documentos.
 * Nuestra plataforma almacena referencias/metadatos necesarios, no duplica innecesariamente los archivos.
 * Debe controlarse quién puede acceder (soberanía de matrícula).
 */
export type DriveMaterialCategory = 
  | 'partituras' 
  | 'PDFs' 
  | 'guias' 
  | 'material_complementario' 
  | 'documentos';

export interface DriveAcademicMaterial {
  id: string;
  title: string;
  category: DriveMaterialCategory;
  categoryLabel: string;
  courseId: string;
  courseTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  classId?: string;
  classTitle?: string;
  // Metadatos de Google Drive (sin duplicación de archivo)
  googleDriveFileId: string;
  googleDriveUrl: string; // webViewLink oficial de Google Drive
  mimeType: string;
  fileSizeFormatted: string;
  metadataOnly: true; // Documenta explícitamente que no se almacena el binario
  // Control de acceso institucional por matrícula
  requiresActiveEnrollment: boolean;
  allowedAccessTypes: AccessType[];
  // Información pedagógica
  instrument?: string;
  level?: 'Iniciación' | 'Intermedio' | 'Avanzado' | 'Todos';
  authorOrComposer?: string;
  description?: string;
  uploadedAt: string;
  lastVerifiedAt?: string;
}

/**
 * GOOGLE CLASSROOM:
 * Debe utilizarse cuando resulte útil para:
 * - tareas;
 * - actividades;
 * - trabajos;
 * - entregas;
 * - comunicación académica.
 * Nuestra plataforma sigue siendo el sistema principal:
 * Clase interna ↓ Actividad Classroom ↓ Alumno autorizado ↓ Realiza actividad ↓ Resultado/estado complementario.
 * No confiere acceso académico a un usuario por el simple hecho de estar en Classroom.
 * La matrícula de nuestra plataforma continúa siendo la autoridad soberana.
 */
export type ClassroomActivityType = 
  | 'tarea' 
  | 'actividad' 
  | 'trabajo' 
  | 'entrega' 
  | 'comunicacion';

export interface ClassroomAcademicActivity {
  id: string;
  // 1. Clase interna (Sistema Principal)
  internalCourseId: string;
  internalCourseTitle: string;
  internalModuleId: string;
  internalModuleTitle: string;
  internalClassId: string;
  internalClassTitle: string;
  // 2. Actividad Classroom (Google Workspace satélite)
  classroomCourseId: string;
  classroomCourseWorkId: string;
  title: string;
  description: string;
  type: ClassroomActivityType;
  maxPoints: number;
  dueDate: string; // YYYY-MM-DD HH:mm
  alternateLink: string; // Enlace directo al trabajo en Google Classroom
  state: 'PUBLISHED' | 'DRAFT';
  createdAt: string;
  updatedAt: string;
}

export type ClassroomSubmissionState = 
  | 'PENDING' 
  | 'TURNED_IN' 
  | 'RETURNED' 
  | 'GRADED' 
  | 'NOT_STARTED';

export interface ClassroomStudentSubmission {
  id: string;
  activityId: string;
  classroomCourseWorkId: string;
  internalClassId: string;
  courseId: string;
  // Alumno
  studentId: string;
  studentName: string;
  studentEmail: string;
  // Estado y entrega
  submissionState: ClassroomSubmissionState;
  assignedGrade?: number;
  maxPoints: number;
  submissionDate?: string;
  teacherFeedback?: string;
  attachmentDriveUrl?: string;
  // Soberanía de matrícula interna
  authorizedByEnrollment: boolean;
  enrollmentWarning?: string;
  // Resultado / Estado complementario alimentado a la plataforma principal
  syncedToProgress: boolean;
  progressPercentageContribution: number; // Ej. 15% o completitud complementaria
  lastSyncedAt?: string;
}
