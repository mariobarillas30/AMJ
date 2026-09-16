import { DriveAcademicMaterial, ClassroomAcademicActivity, ClassroomStudentSubmission } from '../types';

/**
 * FASE 14 — GOOGLE DRIVE & GOOGLE CLASSROOM ACADEMIC DATA
 * Almacena referencias/metadatos necesarios, no duplica innecesariamente los archivos.
 * La matrícula de la plataforma es la única autoridad soberana.
 */

export const INITIAL_DRIVE_ACADEMIC_MATERIALS: DriveAcademicMaterial[] = [
  // ==========================================
  // 1. PARTITURAS (Sheet Music)
  // ==========================================
  {
    id: 'mat-drive-part-01',
    title: 'J.S. Bach - Preludio en Do Mayor BWV 846 (Edición Urtext Digital)',
    category: 'partituras',
    categoryLabel: 'Partitura',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    moduleId: 'mod-piano-1',
    moduleTitle: 'Módulo 1: Fundamentos Técnicos, Postura y Lectura Musical',
    classId: 'class-p-101',
    classTitle: 'Mecanismo de Mano, Ejercicios Hanon y Escala de Do Mayor',
    googleDriveFileId: '1AbC_Bach_Prelude_C_Urtext_Jud2026',
    googleDriveUrl: 'https://drive.google.com/file/d/1AbC_Bach_Prelude_C_Urtext_Jud2026/view?usp=sharing',
    mimeType: 'application/pdf',
    fileSizeFormatted: '1.8 MB',
    metadataOnly: true,
    requiresActiveEnrollment: true,
    allowedAccessTypes: ['full_access', 'materials_only'],
    instrument: 'Piano',
    level: 'Intermedio',
    authorOrComposer: 'Johann Sebastian Bach',
    description: 'Edición Urtext con digitaciones recomendadas por el cuerpo docente para desarrollo de legato polifónico.',
    uploadedAt: '2026-09-01T10:00:00Z',
    lastVerifiedAt: '2026-09-10T14:20:00Z'
  },
  {
    id: 'mat-drive-part-02',
    title: 'W.A. Mozart - Sonata Fácil KV 545 en Do Mayor - Allegro (Partitura)',
    category: 'partituras',
    categoryLabel: 'Partitura',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    moduleId: 'mod-piano-1',
    moduleTitle: 'Módulo 1: Fundamentos Técnicos, Postura y Lectura Musical',
    classId: 'class-p-101',
    classTitle: 'Mecanismo de Mano, Ejercicios Hanon y Escala de Do Mayor',
    googleDriveFileId: '1MzT_KV545_Sonata_Allegro_Jud2026',
    googleDriveUrl: 'https://drive.google.com/file/d/1MzT_KV545_Sonata_Allegro_Jud2026/view?usp=sharing',
    mimeType: 'application/pdf',
    fileSizeFormatted: '3.4 MB',
    metadataOnly: true,
    requiresActiveEnrollment: true,
    allowedAccessTypes: ['full_access', 'materials_only'],
    instrument: 'Piano',
    level: 'Intermedio',
    authorOrComposer: 'Wolfgang Amadeus Mozart',
    description: 'Partitura clásica para perfeccionar el bajo de Alberti en mano izquierda y escalas transparentes en mano derecha.',
    uploadedAt: '2026-09-02T11:30:00Z',
    lastVerifiedAt: '2026-09-10T14:20:00Z'
  },
  {
    id: 'mat-drive-part-03',
    title: 'C.L. Hanon - El Pianista Virtuoso - Ejercicios 1 al 10 (Partitura Digitada)',
    category: 'partituras',
    categoryLabel: 'Partitura',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    moduleId: 'mod-piano-1',
    moduleTitle: 'Módulo 1: Fundamentos Técnicos, Postura y Lectura Musical',
    classId: 'class-p-101',
    classTitle: 'Mecanismo de Mano, Ejercicios Hanon y Escala de Do Mayor',
    googleDriveFileId: '1Hnn_PianistaVirtuoso_1_10_Jud2026',
    googleDriveUrl: 'https://drive.google.com/file/d/1Hnn_PianistaVirtuoso_1_10_Jud2026/view?usp=sharing',
    mimeType: 'application/pdf',
    fileSizeFormatted: '2.4 MB',
    metadataOnly: true,
    requiresActiveEnrollment: true,
    allowedAccessTypes: ['full_access', 'materials_only'],
    instrument: 'Piano',
    level: 'Iniciación',
    authorOrComposer: 'Charles-Louis Hanon',
    description: 'Gimnasia pianística fundamental para la agilidad, fuerza e independencia de los 5 dedos.',
    uploadedAt: '2026-08-25T09:00:00Z',
    lastVerifiedAt: '2026-09-10T14:20:00Z'
  },
  {
    id: 'mat-drive-part-04',
    title: 'Nicola Vaccai - Método Práctico de Canto Italiano (Partitura Vocal)',
    category: 'partituras',
    categoryLabel: 'Partitura',
    courseId: 'course-vocal',
    courseTitle: 'Técnica Vocal & Canto Lírico Contemporáneo',
    googleDriveFileId: '1Vcc_MetodoPracticoCanto_Jud2026',
    googleDriveUrl: 'https://drive.google.com/file/d/1Vcc_MetodoPracticoCanto_Jud2026/view?usp=sharing',
    mimeType: 'application/pdf',
    fileSizeFormatted: '4.1 MB',
    metadataOnly: true,
    requiresActiveEnrollment: true,
    allowedAccessTypes: ['full_access', 'materials_only'],
    instrument: 'Canto',
    level: 'Intermedio',
    authorOrComposer: 'Nicola Vaccai',
    description: 'Lecciones vocales con acompañamiento para colocación de la voz, dicción italiana y respiración costo-diafragmática.',
    uploadedAt: '2026-08-20T15:00:00Z',
    lastVerifiedAt: '2026-09-10T14:20:00Z'
  },
  {
    id: 'mat-drive-part-05',
    title: 'Francisco Tárrega - Lágrima y Adelita (Partituras y Tablaturas)',
    category: 'partituras',
    categoryLabel: 'Partitura',
    courseId: 'course-guitar',
    courseTitle: 'Guitarra Acústica & Eléctrica Contemporánea',
    googleDriveFileId: '1Trg_Lagrima_Adelita_Jud2026',
    googleDriveUrl: 'https://drive.google.com/file/d/1Trg_Lagrima_Adelita_Jud2026/view?usp=sharing',
    mimeType: 'application/pdf',
    fileSizeFormatted: '2.9 MB',
    metadataOnly: true,
    requiresActiveEnrollment: true,
    allowedAccessTypes: ['full_access', 'materials_only'],
    instrument: 'Guitarra',
    level: 'Intermedio',
    authorOrComposer: 'Francisco Tárrega',
    description: 'Obras maestras de la guitarra española con digitación completa para mano derecha (tirando/apoyando) y cejillas.',
    uploadedAt: '2026-08-18T10:00:00Z',
    lastVerifiedAt: '2026-09-10T14:20:00Z'
  },

  // ==========================================
  // 2. PDFs (Métodos pedagógicos & manuales)
  // ==========================================
  {
    id: 'mat-drive-pdf-01',
    title: 'Manual Integral de Armonía Funcional y Enlaces de Acordes (PDF)',
    category: 'PDFs',
    categoryLabel: 'Manual PDF',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    googleDriveFileId: '1Arm_ManualArmoniaFuncional_Jud2026',
    googleDriveUrl: 'https://drive.google.com/file/d/1Arm_ManualArmoniaFuncional_Jud2026/view?usp=sharing',
    mimeType: 'application/pdf',
    fileSizeFormatted: '6.5 MB',
    metadataOnly: true,
    requiresActiveEnrollment: true,
    allowedAccessTypes: ['full_access', 'materials_only'],
    instrument: 'Teoría Musical',
    level: 'Avanzado',
    authorOrComposer: 'Cátedra de Armonía Judá',
    description: 'Texto pedagógico completo sobre funciones armónicas, dominantes secundarias, sustitución tritonal y modulaciones.',
    uploadedAt: '2026-08-15T12:00:00Z',
    lastVerifiedAt: '2026-09-10T14:20:00Z'
  },
  {
    id: 'mat-drive-pdf-02',
    title: 'Tratado de Solfeo Rítmico y Métrica Musical en Compases Compuestos (PDF)',
    category: 'PDFs',
    categoryLabel: 'Manual PDF',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    moduleId: 'mod-piano-1',
    moduleTitle: 'Módulo 1: Fundamentos Técnicos, Postura y Lectura Musical',
    classId: 'class-p-102',
    classTitle: 'Solfeo Rítmico, Compases Compuestos y Dictado Melódico',
    googleDriveFileId: '1Slf_SolfeoRitmoMetrica_Jud2026',
    googleDriveUrl: 'https://drive.google.com/file/d/1Slf_SolfeoRitmoMetrica_Jud2026/view?usp=sharing',
    mimeType: 'application/pdf',
    fileSizeFormatted: '3.8 MB',
    metadataOnly: true,
    requiresActiveEnrollment: true,
    allowedAccessTypes: ['full_access', 'materials_only'],
    instrument: 'Solfeo',
    level: 'Intermedio',
    authorOrComposer: 'Prof. Carlos Mendoza',
    description: 'Ejercicios de lectura rítmica sincopada, contratiempos y polirritmia 3 contra 2 en claves de Sol y Fa.',
    uploadedAt: '2026-09-03T16:00:00Z',
    lastVerifiedAt: '2026-09-10T14:20:00Z'
  },

  // ==========================================
  // 3. GUÍAS (Study Guides & Rutinas)
  // ==========================================
  {
    id: 'mat-drive-guia-01',
    title: 'Guía Ergonómica de Posición Corporal, Altura de Banco y Relajación (PDF)',
    category: 'guias',
    categoryLabel: 'Guía de Estudio',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    moduleId: 'mod-piano-1',
    moduleTitle: 'Módulo 1: Fundamentos Técnicos, Postura y Lectura Musical',
    classId: 'class-p-101',
    classTitle: 'Mecanismo de Mano, Ejercicios Hanon y Escala de Do Mayor',
    googleDriveFileId: '1Erg_GuiaErgonomiaTeclado_Jud2026',
    googleDriveUrl: 'https://drive.google.com/file/d/1Erg_GuiaErgonomiaTeclado_Jud2026/view?usp=sharing',
    mimeType: 'application/pdf',
    fileSizeFormatted: '1.2 MB',
    metadataOnly: true,
    requiresActiveEnrollment: true,
    allowedAccessTypes: ['full_access', 'materials_only'],
    instrument: 'Piano',
    level: 'Iniciación',
    authorOrComposer: 'Departamento Pedagógico Judá',
    description: 'Directrices anatómicas para la relajación de hombros, posición de antebrazo y prevención de tendinitis.',
    uploadedAt: '2026-09-05T09:00:00Z',
    lastVerifiedAt: '2026-09-10T14:20:00Z'
  },
  {
    id: 'mat-drive-guia-02',
    title: 'Guía Metodológica de Rutina Diaria de Estudio Técnico y Concentración',
    category: 'guias',
    categoryLabel: 'Guía de Estudio',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    googleDriveFileId: '1Rut_GuiaEstudioDiario_Jud2026',
    googleDriveUrl: 'https://drive.google.com/file/d/1Rut_GuiaEstudioDiario_Jud2026/view?usp=sharing',
    mimeType: 'application/pdf',
    fileSizeFormatted: '850 KB',
    metadataOnly: true,
    requiresActiveEnrollment: true,
    allowedAccessTypes: ['full_access', 'materials_only'],
    instrument: 'Metodología',
    level: 'Todos',
    authorOrComposer: 'Dirección Académica',
    description: 'Estructuración del tiempo diario de práctica: calentamiento (15 min), técnica (20 min), repertorio (40 min) y lectura.',
    uploadedAt: '2026-08-28T14:00:00Z',
    lastVerifiedAt: '2026-09-10T14:20:00Z'
  },

  // ==========================================
  // 4. MATERIAL COMPLEMENTARIO (Audios, backing tracks, infografías)
  // ==========================================
  {
    id: 'mat-drive-comp-01',
    title: 'Pistas Play-Along con Metrónomo Gradual para Hanon 1-5 (Audio Pack)',
    category: 'material_complementario',
    categoryLabel: 'Material Complementario',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    moduleId: 'mod-piano-1',
    moduleTitle: 'Módulo 1: Fundamentos Técnicos, Postura y Lectura Musical',
    classId: 'class-p-101',
    classTitle: 'Mecanismo de Mano, Ejercicios Hanon y Escala de Do Mayor',
    googleDriveFileId: '1Aud_PistasPlayAlongHanon_Jud2026',
    googleDriveUrl: 'https://drive.google.com/file/d/1Aud_PistasPlayAlongHanon_Jud2026/view?usp=sharing',
    mimeType: 'audio/mpeg',
    fileSizeFormatted: '18.4 MB',
    metadataOnly: true,
    requiresActiveEnrollment: true,
    allowedAccessTypes: ['full_access', 'materials_only'],
    instrument: 'Piano',
    level: 'Iniciación',
    description: 'Grabaciones de referencia a 60, 72, 84 y 96 BPM con chasquido de metrónomo para práctica con pulso estable.',
    uploadedAt: '2026-09-06T18:00:00Z',
    lastVerifiedAt: '2026-09-10T14:20:00Z'
  },
  {
    id: 'mat-drive-comp-02',
    title: 'Pistas de Dictado Melódico e Intervalos para Entrenamiento Auditivo',
    category: 'material_complementario',
    categoryLabel: 'Material Complementario',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    moduleId: 'mod-piano-1',
    moduleTitle: 'Módulo 1: Fundamentos Técnicos, Postura y Lectura Musical',
    classId: 'class-p-102',
    classTitle: 'Solfeo Rítmico, Compases Compuestos y Dictado Melódico',
    googleDriveFileId: '1Aud_DictadosIntervalosAudio_Jud2026',
    googleDriveUrl: 'https://drive.google.com/file/d/1Aud_DictadosIntervalosAudio_Jud2026/view?usp=sharing',
    mimeType: 'audio/mpeg',
    fileSizeFormatted: '14.2 MB',
    metadataOnly: true,
    requiresActiveEnrollment: true,
    allowedAccessTypes: ['full_access', 'materials_only'],
    instrument: 'Entrenamiento Auditivo',
    level: 'Intermedio',
    description: '20 pistas de audio con intervalos armónicos y melódicos para resolver los cuestionarios auditivos.',
    uploadedAt: '2026-09-07T12:00:00Z',
    lastVerifiedAt: '2026-09-10T14:20:00Z'
  },
  {
    id: 'mat-drive-comp-03',
    title: 'Infografía Resumen del Círculo de Quintas y Armaduras de Clave (PNG Alta Res)',
    category: 'material_complementario',
    categoryLabel: 'Material Complementario',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    googleDriveFileId: '1Img_CirculoQuintasInfografia_Jud2026',
    googleDriveUrl: 'https://drive.google.com/file/d/1Img_CirculoQuintasInfografia_Jud2026/view?usp=sharing',
    mimeType: 'image/png',
    fileSizeFormatted: '3.1 MB',
    metadataOnly: true,
    requiresActiveEnrollment: true,
    allowedAccessTypes: ['full_access', 'materials_only'],
    instrument: 'Teoría Musical',
    level: 'Todos',
    description: 'Mapa visual de tonalidades mayores y relativas menores con sus sostenidos y bemoles correspondientes.',
    uploadedAt: '2026-08-30T10:00:00Z',
    lastVerifiedAt: '2026-09-10T14:20:00Z'
  },

  // ==========================================
  // 5. DOCUMENTOS (Documentos Oficiales, Reglamentos y Programas)
  // ==========================================
  {
    id: 'mat-drive-doc-01',
    title: 'Programa Curricular Oficial de la Cátedra de Piano 2026 (Documento)',
    category: 'documentos',
    categoryLabel: 'Documento Oficial',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    googleDriveFileId: '1Doc_ProgramaCurricularPiano2026_Jud',
    googleDriveUrl: 'https://drive.google.com/file/d/1Doc_ProgramaCurricularPiano2026_Jud/view?usp=sharing',
    mimeType: 'application/vnd.google-apps.document',
    fileSizeFormatted: '420 KB',
    metadataOnly: true,
    requiresActiveEnrollment: true,
    allowedAccessTypes: ['full_access', 'materials_only'],
    instrument: 'Piano',
    level: 'Todos',
    authorOrComposer: 'Dirección General Judá',
    description: 'Desglose oficial de competencias técnicas, obras obligatorias y fechas de exámenes semestrales.',
    uploadedAt: '2026-01-10T08:00:00Z',
    lastVerifiedAt: '2026-09-10T14:20:00Z'
  },
  {
    id: 'mat-drive-doc-02',
    title: 'Reglamento de Evaluación, Asistencia y Certificación Judá',
    category: 'documentos',
    categoryLabel: 'Documento Oficial',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    googleDriveFileId: '1Doc_ReglamentoEvaluacionCertificacion_Jud',
    googleDriveUrl: 'https://drive.google.com/file/d/1Doc_ReglamentoEvaluacionCertificacion_Jud/view?usp=sharing',
    mimeType: 'application/pdf',
    fileSizeFormatted: '1.5 MB',
    metadataOnly: true,
    requiresActiveEnrollment: false, // Accesible a la comunidad
    allowedAccessTypes: ['full_access', 'materials_only', 'live_sessions', 'restricted'],
    instrument: 'Normativa',
    level: 'Todos',
    authorOrComposer: 'Junta Directiva',
    description: 'Bases de acreditación, baremo de calificaciones y políticas de derechos académicos.',
    uploadedAt: '2026-01-05T08:00:00Z',
    lastVerifiedAt: '2026-09-10T14:20:00Z'
  }
];

// ==========================================
// GOOGLE CLASSROOM ACADEMIC ACTIVITIES
// Sistema Principal: Clase interna -> Actividad Classroom -> Alumno autorizado -> Realiza actividad -> Resultado/estado complementario
// ==========================================

export const INITIAL_CLASSROOM_ACTIVITIES: ClassroomAcademicActivity[] = [
  {
    id: 'act-classroom-piano-101',
    // 1. Clase Interna (Nuestra Plataforma como Sistema Principal)
    internalCourseId: 'course-piano',
    internalCourseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    internalModuleId: 'mod-piano-1',
    internalModuleTitle: 'Módulo 1: Fundamentos Técnicos, Postura y Lectura Musical',
    internalClassId: 'class-p-101',
    internalClassTitle: 'Mecanismo de Mano, Ejercicios Hanon y Escala de Do Mayor',
    // 2. Actividad en Google Classroom
    classroomCourseId: '682910482910',
    classroomCourseWorkId: 'cwk-hanon-60bpm-101',
    title: 'Grabación en Video: Ejercicio Nº 1 de Hanon a 60 BPM con Metrónomo',
    description: 'Graba una toma frontal donde se observe claramente el arco de la mano y los hombros relajados ejecutando el ejercicio Nº 1 de Hanon sin acelerar.',
    type: 'entrega',
    maxPoints: 100,
    dueDate: '2026-09-20 23:59',
    alternateLink: 'https://classroom.google.com/c/NjgyOTEwNDgyOTEw/a/cwk-hanon-60bpm-101/details',
    state: 'PUBLISHED',
    createdAt: '2026-09-08T10:00:00Z',
    updatedAt: '2026-09-09T12:00:00Z'
  },
  {
    id: 'act-classroom-piano-102',
    internalCourseId: 'course-piano',
    internalCourseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    internalModuleId: 'mod-piano-1',
    internalModuleTitle: 'Módulo 1: Fundamentos Técnicos, Postura y Lectura Musical',
    internalClassId: 'class-p-102',
    internalClassTitle: 'Solfeo Rítmico, Compases Compuestos y Dictado Melódico',
    classroomCourseId: '682910482910',
    classroomCourseWorkId: 'cwk-dictado-6-8-102',
    title: 'Transcripción del Dictado Melódico en Compás de 6/8',
    description: 'Escucha la pista Nº 4 adjunta en Google Drive y transcribe en pentagrama la melodía de 8 compases en clave de Sol con las alteraciones correspondientes.',
    type: 'trabajo',
    maxPoints: 100,
    dueDate: '2026-09-24 23:59',
    alternateLink: 'https://classroom.google.com/c/NjgyOTEwNDgyOTEw/a/cwk-dictado-6-8-102/details',
    state: 'PUBLISHED',
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-09-10T10:00:00Z'
  },
  {
    id: 'act-classroom-vocal-201',
    internalCourseId: 'course-vocal',
    internalCourseTitle: 'Técnica Vocal & Canto Lírico Contemporáneo',
    internalModuleId: 'mod-vocal-1',
    internalModuleTitle: 'Módulo 1: Anatomía Vocal, Respiración Diafragmática y Emisión',
    internalClassId: 'class-v-201',
    internalClassTitle: 'Mecánica de la Respiración Costo-Diafragmática y Apoyo',
    classroomCourseId: '791048291054',
    classroomCourseWorkId: 'cwk-vocal-apoyo-201',
    title: 'Audio de Vocalización: Escala Pentatónica con Sonido de Fricción "S"',
    description: 'Envía una grabación en audio de 2 minutos demostrando el control del flujo aéreo constante sin colapso torácico.',
    type: 'tarea',
    maxPoints: 100,
    dueDate: '2026-09-18 20:00',
    alternateLink: 'https://classroom.google.com/c/NzkxMDQ4MjkxMDU0/a/cwk-vocal-apoyo-201/details',
    state: 'PUBLISHED',
    createdAt: '2026-09-05T14:00:00Z',
    updatedAt: '2026-09-06T09:00:00Z'
  }
];

// ==========================================
// GOOGLE CLASSROOM STUDENT SUBMISSIONS
// Demuestra el control de matrícula:
// Mario Barillas en Piano (Matrícula Activa): Autorizado -> Estado Sincronizado
// Mario Barillas en Canto (Matrícula Vencida): NO Autorizado -> Bloqueado aunque exista en Classroom
// ==========================================

export const INITIAL_CLASSROOM_SUBMISSIONS: ClassroomStudentSubmission[] = [
  {
    id: 'sub-mario-p-101',
    activityId: 'act-classroom-piano-101',
    classroomCourseWorkId: 'cwk-hanon-60bpm-101',
    internalClassId: 'class-p-101',
    courseId: 'course-piano',
    studentId: 'student-mario',
    studentName: 'Mario Barillas',
    studentEmail: 'mariobarillas24@gmail.com',
    submissionState: 'GRADED',
    assignedGrade: 96,
    maxPoints: 100,
    submissionDate: '2026-09-09T18:45:00Z',
    teacherFeedback: 'Excelente estabilidad de tempo y relajación en muñecas. Buen ataque en el 4º dedo.',
    attachmentDriveUrl: 'https://drive.google.com/file/d/1Vid_Hanon_Mario_Barillas_Take1_Jud/view',
    authorizedByEnrollment: true,
    syncedToProgress: true,
    progressPercentageContribution: 10,
    lastSyncedAt: '2026-09-10T12:00:00Z'
  },
  {
    id: 'sub-mario-p-102',
    activityId: 'act-classroom-piano-102',
    classroomCourseWorkId: 'cwk-dictado-6-8-102',
    internalClassId: 'class-p-102',
    courseId: 'course-piano',
    studentId: 'student-mario',
    studentName: 'Mario Barillas',
    studentEmail: 'mariobarillas24@gmail.com',
    submissionState: 'TURNED_IN',
    assignedGrade: undefined,
    maxPoints: 100,
    submissionDate: '2026-09-11T08:30:00Z',
    teacherFeedback: 'Entrega recibida en Classroom. Pendiente de corrección por el docente.',
    attachmentDriveUrl: 'https://drive.google.com/file/d/1Doc_Dictado_Mario_Barillas_Scan/view',
    authorizedByEnrollment: true,
    syncedToProgress: true,
    progressPercentageContribution: 5,
    lastSyncedAt: '2026-09-11T08:35:00Z'
  },
  {
    id: 'sub-mario-v-201',
    activityId: 'act-classroom-vocal-201',
    classroomCourseWorkId: 'cwk-vocal-apoyo-201',
    internalClassId: 'class-v-201',
    courseId: 'course-vocal',
    studentId: 'student-mario',
    studentName: 'Mario Barillas',
    studentEmail: 'mariobarillas24@gmail.com',
    submissionState: 'NOT_STARTED',
    maxPoints: 100,
    authorizedByEnrollment: false, // ¡ATENCIÓN: Matrícula VENCIDA en Técnica Vocal!
    enrollmentWarning: 'ACCESO DENEGADO POR LA PLATAFORMA: El alumno tiene la matrícula vencida el 2026-08-31 para este curso. Aunque el alumno esté agregado a Google Classroom, la matrícula de la Academia Judá es la única autoridad de acceso académico.',
    syncedToProgress: false,
    progressPercentageContribution: 0
  }
];

export const DRIVE_CATEGORY_CONFIG: Record<
  string, 
  { label: string; iconName: string; badgeColor: string; description: string }
> = {
  partituras: {
    label: 'Partituras & Urtext',
    iconName: 'Music',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Ediciones Urtext críticas, digitaciones docentes y transcripciones oficiales.'
  },
  PDFs: {
    label: 'PDFs & Métodos',
    iconName: 'FileText',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    description: 'Tratados pedagógicos, métodos instrumentales y cuadernos de solfeo.'
  },
  guias: {
    label: 'Guías de Estudio',
    iconName: 'Compass',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Instrucciones ergonómicas, rutinas de práctica y directrices de análisis.'
  },
  material_complementario: {
    label: 'Material Complementario',
    iconName: 'Headphones',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    description: 'Pistas de audio backing tracks, infografías de armonía y muestras auditivas.'
  },
  documentos: {
    label: 'Documentos Oficiales',
    iconName: 'FileCheck',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Programas curriculares de cátedra, reglamentos y normativas institucionales.'
  }
};
