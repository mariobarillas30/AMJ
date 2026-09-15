import { AcademicCourse, StudentEnrollment } from '../types';

export const INITIAL_ACADEMY_COURSES: AcademicCourse[] = [
  {
    id: 'course-piano',
    title: 'Piano Clásico, Solfeo & Armonía Funcional',
    description: 'Formación instrumental de alto nivel combinando técnica pianística tradicional, análisis de partituras y práctica auditiva.',
    modality: 'live_virtual',
    instrument: 'Piano',
    teacherId: 'teacher-carlos',
    teacherName: 'Prof. Carlos Mendoza',
    schedule: 'Martes y Jueves, 18:00 - 19:30',
    priceMonthly: 75,
    status: 'active',
    meetUrl: 'https://meet.google.com/jud-bach-piano',
    meetCode: 'jud-bach-piano',
    driveFolderId: 'drive-folder-piano-2026',
    classroomCourseId: 'classroom-piano-jud',
    modules: [
      {
        id: 'mod-piano-1',
        courseId: 'course-piano',
        title: 'Módulo 1: Fundamentos Técnicos, Postura y Lectura Musical',
        description: 'Bases mecánicas de la articulación digital, lectura a primera vista en clave de Sol y Fa, y solfeo rítmico.',
        order: 1,
        classes: [
          {
            id: 'class-p-101',
            courseId: 'course-piano',
            moduleId: 'mod-piano-1',
            title: 'Mecanismo de Mano, Ejercicios Hanon y Escala de Do Mayor',
            description: 'Estudio de la relajación del peso del brazo, arco de mano natural y articulación individual de cada dedo.',
            teacher: 'Prof. Carlos Mendoza',
            teacherId: 'teacher-carlos',
            date: '2026-09-08 18:00',
            duration: '60 min',
            modality: 'grabada',
            video: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
            order: 1,
            status: 'active',
            documents: [
              {
                id: 'doc-p-1',
                title: 'Método Hanon El Pianista Virtuoso - Ejercicios 1 al 5 (PDF)',
                type: 'sheet_music',
                url: 'https://drive.google.com/drive/folders/hanon-partituras',
                driveFileId: 'drive-hanon-01',
                size: '2.4 MB'
              },
              {
                id: 'doc-p-2',
                title: 'Guía Ergonómica de Posición de Muñeca y Banco (PDF)',
                type: 'guide',
                url: 'https://drive.google.com/drive/folders/guia-postura',
                driveFileId: 'drive-guia-postura',
                size: '1.1 MB'
              }
            ],
            exercises: [
              {
                id: 'ex-p-1',
                title: 'Hanon Nº 1 con metrónomo',
                description: 'Tocar sin tensión en hombros a tempo constante de 60 BPM aumentando 4 BPM por día.',
                tempoBpm: 60,
                keySignature: 'Do Mayor',
                targetTechnique: 'Independencia de 4º y 5º dedo'
              },
              {
                id: 'ex-p-2',
                title: 'Escala de Do Mayor a dos octavas manos juntas',
                description: 'Pase de pulgar limpio y sonido legato homogéneo.',
                tempoBpm: 72,
                keySignature: 'Do Mayor',
                targetTechnique: 'Paso del pulgar'
              }
            ],
            evaluation: {
              id: 'eval-p-101',
              title: 'Autoevaluación Técnica: Digitación y Postura',
              description: 'Verificación de conocimientos sobre digitación de la escala y posición de la mano.',
              maxScore: 100,
              passingScore: 70,
              criteria: ['Postura de arco', 'Digitación 1-2-3-1-2-3-4-5', 'Ritmo constante'],
              question: '¿Cuál es la digitación correcta de la mano derecha para la Escala de Do Mayor ascendente?',
              options: [
                '1-2-3-1-2-3-4-5',
                '1-2-3-4-1-2-3-4',
                '1-2-3-4-5-1-2-3',
                '2-3-4-1-2-3-4-5'
              ],
              correctAnswerIndex: 0
            },
            meetUrl: 'https://meet.google.com/jud-bach-piano',
            meetCode: 'jud-bach-piano',
            driveUrl: 'https://drive.google.com/drive/folders/piano-clase-101',
            driveFolderId: 'drive-folder-101',
            classroomUrl: 'https://classroom.google.com/c/piano-101',
            classroomId: 'classroom-task-101',
            classroomTask: 'Subir grabación de 1 minuto tocando el ejercicio 1 de Hanon a 60 BPM'
          },
          {
            id: 'class-p-102',
            courseId: 'course-piano',
            moduleId: 'mod-piano-1',
            title: 'Solfeo Rítmico, Compases Compuestos y Dictado Melódico',
            description: 'Identificación auditiva de intervalos de 3ra y 5ta justa, y lectura rítmica en compases de 6/8 y 9/8.',
            teacher: 'Prof. Carlos Mendoza',
            teacherId: 'teacher-carlos',
            date: '2026-09-10 18:00',
            duration: '90 min',
            modality: 'virtual_en_vivo',
            video: 'https://www.youtube-nocookie.com/embed/live_demo_piano',
            order: 2,
            status: 'active',
            documents: [
              {
                id: 'doc-p-3',
                title: 'Cuaderno de Dictados Rítmicos Judá - Volumen I (PDF)',
                type: 'sheet_music',
                url: 'https://drive.google.com/drive/folders/solfeo-juda',
                driveFileId: 'drive-solfeo-vol1',
                size: '3.8 MB'
              },
              {
                id: 'doc-p-4',
                title: 'Pistas de Audio para Entrenamiento Auditivo (MP3 Zip)',
                type: 'audio',
                url: 'https://drive.google.com/drive/folders/audios-dictados',
                driveFileId: 'drive-audio-zip',
                size: '14.2 MB'
              }
            ],
            exercises: [
              {
                id: 'ex-p-3',
                title: 'Palmas y conteo en voz alta en compás de 6/8',
                description: 'Marcar los dos pulsos ternarios mientras se subdivide con precisión.',
                tempoBpm: 84,
                keySignature: '6/8',
                targetTechnique: 'Métrica ternaria'
              }
            ],
            evaluation: {
              id: 'eval-p-102',
              title: 'Cuestionario Auditivo: Reconocimiento de Intervalos',
              description: 'Escucha mental e identificación de saltos melódicos.',
              maxScore: 100,
              passingScore: 75,
              criteria: ['Afinación mental', 'Reconocimiento interválico', 'Velocidad de respuesta'],
              question: '¿Cuántos semitonos de distancia hay en un intervalo de 3ra Mayor?',
              options: [
                '4 semitonos (dos tonos enteros)',
                '3 semitonos (un tono y medio)',
                '5 semitonos (dos tonos y medio)',
                '2 semitonos (un tono entero)'
              ],
              correctAnswerIndex: 0
            },
            meetUrl: 'https://meet.google.com/jud-pian-solfeo',
            meetCode: 'jud-pian-solfeo',
            driveUrl: 'https://drive.google.com/drive/folders/solfeo-juda',
            driveFolderId: 'drive-solfeo-01',
            classroomUrl: 'https://classroom.google.com/c/solfeo-102',
            classroomId: 'classroom-task-102',
            classroomTask: 'Realizar la transcripción del dictado de audio Nº 3 y adjuntar foto del pentagrama'
          }
        ]
      },
      {
        id: 'mod-piano-2',
        courseId: 'course-piano',
        title: 'Módulo 2: Obras Clásicas y Acompañamiento Armónico',
        description: 'Polifonía barroca, técnica contrapuntística en Bach y aplicación de acordes con séptima en acompañamiento.',
        order: 2,
        classes: [
          {
            id: 'class-p-201',
            courseId: 'course-piano',
            moduleId: 'mod-piano-2',
            title: 'J.S. Bach: Invención Nº 1 en Do Mayor BWV 772',
            description: 'Análisis del sujeto contrapuntístico, respuesta a la 5ta y articulación balanceada entre mano derecha e izquierda.',
            teacher: 'Prof. Carlos Mendoza',
            teacherId: 'teacher-carlos',
            date: 'Hoy, 18:00 - 19:30 (Directo)',
            duration: '90 min',
            modality: 'virtual_en_vivo',
            video: 'https://www.youtube-nocookie.com/embed/bach_invention_live',
            order: 1,
            status: 'active',
            documents: [
              {
                id: 'doc-p-5',
                title: 'Partitura Urtext: Invención Nº 1 BWV 772 (J.S. Bach) con digitación recomendada (PDF)',
                type: 'sheet_music',
                url: 'https://drive.google.com/file/d/bach-inv-1-urtext/view',
                driveFileId: 'drive-bach-inv1',
                size: '1.8 MB'
              },
              {
                id: 'doc-p-6',
                title: 'Análisis Formal y Guía de Fraseo Barroco (PDF)',
                type: 'guide',
                url: 'https://drive.google.com/file/d/guia-fraseo-barroco/view',
                driveFileId: 'drive-fraseo-barroco',
                size: '890 KB'
              },
              {
                id: 'doc-p-7',
                title: 'Pista de Referencia de Estudio en Clavecín a tempo lento (Audio)',
                type: 'audio',
                url: 'https://drive.google.com/file/d/audio-bach-slow/view',
                driveFileId: 'drive-audio-bach',
                size: '4.5 MB'
              }
            ],
            exercises: [
              {
                id: 'ex-p-4',
                title: 'Estudio de manos separadas (Compases 1 a 7)',
                description: 'Memorizar el sujeto melódico primero con la mano derecha y luego la respuesta en la mano izquierda.',
                tempoBpm: 66,
                keySignature: 'Do Mayor',
                targetTechnique: 'Contrapunto polifónico'
              },
              {
                id: 'ex-p-5',
                title: 'Pase contrapuntístico a dos manos con metrónomo a 72 BPM',
                description: 'Mantener la dinámica no-legato típica del período barroco en las semicorcheas.',
                tempoBpm: 72,
                keySignature: 'Do Mayor',
                targetTechnique: 'Articulación no-legato'
              }
            ],
            evaluation: {
              id: 'eval-p-201',
              title: 'Evaluación Técnica y Estilística: Invención Nº 1 de Bach',
              description: 'Examen de comprensión formal y criterios interpretativos del Barroco.',
              maxScore: 100,
              passingScore: 75,
              criteria: ['Precisión de notas y digitación', 'Independencia de voces', 'Claridad métrica'],
              question: '¿Con qué figura rítmica inicia el célebre motivo o sujeto de la Invención Nº 1 de Bach en Do Mayor?',
              options: [
                'Un silencio de semicorchea seguido de cuatro semicorcheas ascendentes',
                'Una negra acentuada en el primer tiempo',
                'Un tresillo de corcheas descendente',
                'Dos corcheas con puntillo'
              ],
              correctAnswerIndex: 0
            },
            meetUrl: 'https://meet.google.com/jud-bach-piano',
            meetCode: 'jud-bach-piano',
            driveUrl: 'https://drive.google.com/drive/folders/bach-invenciones-juda',
            driveFolderId: 'drive-folder-bach',
            classroomUrl: 'https://classroom.google.com/c/bach-invencion-1',
            classroomId: 'classroom-act-bach-01',
            classroomTask: 'Grabar un video de 90 segundos ejecutando los compases 1 a 12 con metrónomo visible a 72 BPM'
          },
          {
            id: 'class-p-202',
            courseId: 'course-piano',
            moduleId: 'mod-piano-2',
            title: 'Cadencias Armónicas II-V-I y Acordes con Séptima',
            description: 'Conducción de voces, tensiones armónicas (9na, 11na) y acompañamiento en diversos estilos contemporáneos.',
            teacher: 'Prof. Carlos Mendoza',
            teacherId: 'teacher-carlos',
            date: 'Viernes, 17:00 - 18:30',
            duration: '90 min',
            modality: 'hibrida',
            video: 'https://www.youtube-nocookie.com/embed/cadencias_armonia',
            order: 2,
            status: 'active',
            documents: [
              {
                id: 'doc-p-8',
                title: 'Tabla de Progresiones II-V-I en las 12 tonalidades (PDF)',
                type: 'sheet_music',
                url: 'https://drive.google.com/file/d/armonia-251/view',
                driveFileId: 'drive-armonia-251',
                size: '2.1 MB'
              }
            ],
            exercises: [
              {
                id: 'ex-p-6',
                title: 'Ciclo de quintas con acordes Maj7, m7 y 7 dominante',
                description: 'Enlazar los acordes con movimiento de voces mínimo en mano derecha.',
                tempoBpm: 80,
                keySignature: '12 Tonalidades',
                targetTechnique: 'Voice leading'
              }
            ],
            evaluation: {
              id: 'eval-p-202',
              title: 'Test Armónico: Conducción de Voces',
              description: 'Reglas de enlace de acordes y resolución de tritono.',
              maxScore: 100,
              passingScore: 70,
              criteria: ['Resolución de sensible', 'Evitar quintas paralelas', 'Tensiones disponibles'],
              question: 'En un acorde dominante G7, ¿qué notas forman el tritono que resuelve hacia el acorde de C (Do Mayor)?',
              options: [
                'Si (3ra) y Fa (7ma)',
                'Sol (fundamental) y Re (5ta)',
                'Do y Sol',
                'Mi y La'
              ],
              correctAnswerIndex: 0
            },
            meetUrl: 'https://meet.google.com/jud-armonia-live',
            meetCode: 'jud-armonia-live',
            driveUrl: 'https://drive.google.com/drive/folders/armonia-funcional',
            driveFolderId: 'drive-armonia-juda',
            classroomUrl: 'https://classroom.google.com/c/armonia-202',
            classroomId: 'classroom-act-arm-02',
            classroomTask: 'Armonizar la melodía de 8 compases provista en el PDF aplicando la progresión II-V-I'
          }
        ]
      }
    ]
  },
  {
    id: 'course-vocal',
    title: 'Técnica Vocal, Respiración Diafragmática & Repertorio',
    description: 'Entrenamiento integral de la voz: colocación, apoyo costodiafragmático, resonancia y canto lírico/popular.',
    modality: 'hybrid',
    instrument: 'Canto',
    teacherId: 'teacher-elena',
    teacherName: 'Prof. Elena Rostova',
    schedule: 'Miércoles y Sábados, 10:00 - 11:30',
    priceMonthly: 70,
    status: 'active',
    meetUrl: 'https://meet.google.com/jud-vocal-live',
    meetCode: 'jud-vocal-live',
    driveFolderId: 'drive-vocal-master',
    classroomCourseId: 'classroom-vocal-jud',
    modules: [
      {
        id: 'mod-vocal-1',
        courseId: 'course-vocal',
        title: 'Módulo 1: Apoyo Diafragmático & Emisión Vocal Sana',
        description: 'Mecanismos de respiración baja, eliminación de tensión en cuello y laringe.',
        order: 1,
        classes: [
          {
            id: 'class-v-101',
            courseId: 'course-vocal',
            moduleId: 'mod-vocal-1',
            title: 'Anatomía de la Respiración y Ejercicios Costodiafragmáticos',
            description: 'Técnica de inhalación silenciosa, control del flujo de aire y apoyo en músculos intercostales.',
            teacher: 'Prof. Elena Rostova',
            teacherId: 'teacher-elena',
            date: '2026-09-09 10:00',
            duration: '60 min',
            modality: 'grabada',
            video: 'https://www.youtube-nocookie.com/embed/vocal_breath_master',
            order: 1,
            status: 'active',
            documents: [
              {
                id: 'doc-v-1',
                title: 'Manual de Fisiología Vocal y Rutina Diaria de Calentamiento (PDF)',
                type: 'guide',
                url: 'https://drive.google.com/file/d/vocal-manual/view',
                driveFileId: 'drive-vocal-man',
                size: '4.2 MB'
              }
            ],
            exercises: [
              {
                id: 'ex-v-1',
                title: 'Emisión continua con "S" sostenida',
                description: 'Mantener un hilo de aire homogéneo durante mínimo 30 segundos sin quebrar el apoyo.',
                tempoBpm: 60,
                targetTechnique: 'Presión subglótica constante'
              }
            ],
            evaluation: {
              id: 'eval-v-101',
              title: 'Test Teórico: Higiene y Fisiología Vocal',
              description: 'Conocimientos sobre cuidados de las cuerdas vocales y respiración.',
              maxScore: 100,
              passingScore: 70,
              criteria: ['Hidratación', 'Uso del diafragma', 'Prevención de nódulos'],
              question: '¿Qué músculo es el principal motor de la inhalación profunda y baja?',
              options: [
                'El Diafragma',
                'El Trapecio',
                'El Esternocleidomastoideo',
                'El Pectoral Mayor'
              ],
              correctAnswerIndex: 0
            },
            meetUrl: 'https://meet.google.com/jud-vocal-live',
            meetCode: 'jud-vocal-live',
            driveUrl: 'https://drive.google.com/drive/folders/vocal-juda',
            driveFolderId: 'drive-vocal-01',
            classroomUrl: 'https://classroom.google.com/c/vocal-101',
            classroomId: 'classroom-task-vocal-01',
            classroomTask: 'Grabar audio de 3 intentos de la S sostenida con cronómetro'
          },
          {
            id: 'class-v-102',
            courseId: 'course-vocal',
            moduleId: 'mod-vocal-1',
            title: 'Vocalización en Modo Mayor y Resonadores Altos',
            description: 'Uso de la máscara facial, elevación del paladar blando y pasaje de la voz de pecho a voz mixta.',
            teacher: 'Prof. Elena Rostova',
            teacherId: 'teacher-elena',
            date: 'Sábado, 10:00 - 11:30 (En Directo)',
            duration: '90 min',
            modality: 'virtual_en_vivo',
            video: 'https://www.youtube-nocookie.com/embed/vocal_resonators_live',
            order: 2,
            status: 'active',
            documents: [
              {
                id: 'doc-v-2',
                title: 'Partituras de Vocalizaciones Vaccai - Lección 1 y 2 (PDF)',
                type: 'sheet_music',
                url: 'https://drive.google.com/file/d/vaccai-metodo/view',
                driveFileId: 'drive-vaccai',
                size: '2.9 MB'
              }
            ],
            exercises: [
              {
                id: 'ex-v-2',
                title: 'Sirenas con "Ng" y arpegios con "Mi-Me-Ma-Mo-Mu"',
                description: 'Conectar el registro grave con el agudo sin quiebres ni empuje de garganta.',
                tempoBpm: 76,
                targetTechnique: 'Voz mixta'
              }
            ],
            evaluation: {
              id: 'eval-v-102',
              title: 'Evaluación Auditiva de Resonancia',
              description: 'Detección de voz engolada vs voz colocada en máscara.',
              maxScore: 100,
              passingScore: 75,
              criteria: ['Brillo (squillo)', 'Afinación precisa', 'Relajación de mandíbula'],
              question: '¿Qué acción anatómica ayuda a ampliar el espacio faríngeo durante el canto en notas agudas?',
              options: [
                'Elevar el paladar blando (sensación de bostezo incipiente)',
                'Tensar los músculos del cuello hacia adelante',
                'Bajar la barbilla contra el pecho',
                'Apretar los labios con fuerza'
              ],
              correctAnswerIndex: 0
            },
            meetUrl: 'https://meet.google.com/jud-vocal-master',
            meetCode: 'jud-vocal-master',
            driveUrl: 'https://drive.google.com/drive/folders/vocal-master',
            driveFolderId: 'drive-vocal-02',
            classroomUrl: 'https://classroom.google.com/c/vocal-102',
            classroomId: 'classroom-task-vocal-02',
            classroomTask: 'Enviar video vocalizando la Lección 1 del método Vaccai afinando con el piano'
          }
        ]
      }
    ]
  },
  {
    id: 'course-guitar',
    title: 'Guitarra Clásica, Acústica & Ensamble Instrumental',
    description: 'Técnica de cuerdas, lectura de tablaturas y partituras, arpegios, cejillas y repertorio latinoamericano.',
    modality: 'presential',
    instrument: 'Guitarra',
    teacherId: 'teacher-daniel',
    teacherName: 'Prof. Daniel Arévalo',
    schedule: 'Lunes y Miércoles, 16:30 - 18:00 (Sede Central)',
    priceMonthly: 65,
    status: 'active',
    meetUrl: 'https://meet.google.com/jud-guitar-live',
    meetCode: 'jud-guitar-live',
    driveFolderId: 'drive-guitar-2026',
    classroomCourseId: 'classroom-guitar-jud',
    modules: [
      {
        id: 'mod-guitar-1',
        courseId: 'course-guitar',
        title: 'Módulo 1: Técnica de Pulsación, Apoyando y Tirando',
        description: 'Posición clásica con apoyapié, independencia de mano derecha (p-i-m-a) y coordinación en trasteo.',
        order: 1,
        classes: [
          {
            id: 'class-g-101',
            courseId: 'course-guitar',
            moduleId: 'mod-guitar-1',
            title: 'Coordinación Mano Derecha (i-m) y Escalas en Primera Posición',
            description: 'Ataque con yema y uña, tono cálido y digitación precisa en trastes 1 al 4.',
            teacher: 'Prof. Daniel Arévalo',
            teacherId: 'teacher-daniel',
            date: 'Próximo Lunes 16:30',
            duration: '90 min',
            modality: 'presencial',
            order: 1,
            status: 'active',
            documents: [
              {
                id: 'doc-g-1',
                title: 'Estudios Sencillos de Leo Brouwer - Nº 1 y 2 (PDF)',
                type: 'sheet_music',
                url: 'https://drive.google.com/file/d/brouwer-estudios/view',
                driveFileId: 'drive-brouwer',
                size: '1.9 MB'
              }
            ],
            exercises: [
              {
                id: 'ex-g-1',
                title: 'Arpegio básico p-i-m-a de Carulli',
                description: 'Mantener el pulgar siempre adelantado respecto al índice.',
                tempoBpm: 68,
                keySignature: 'Mi Menor',
                targetTechnique: 'Posición de muñeca'
              }
            ],
            evaluation: {
              id: 'eval-g-101',
              title: 'Rúbrica de Pulsación y Sonido',
              description: 'Control de trasteo limpio sin zumbido (trasteo en el borde del traste).',
              maxScore: 100,
              passingScore: 70,
              criteria: ['Sonido limpio', 'Sin zumbido en cejilla', 'Mano derecha perpendicular'],
              question: '¿Dónde debe colocarse la yema del dedo de la mano izquierda respecto a la barra del traste para evitar ruidos parásitos?',
              options: [
                'Inmediatamente detrás del traste de metal, sin tocarlo',
                'Justo encima del traste de metal',
                'En el centro exacto del espacio entre trastes',
                'Lejos del traste hacia el clavijero'
              ],
              correctAnswerIndex: 0
            },
            meetUrl: 'https://meet.google.com/jud-guitar-live',
            meetCode: 'jud-guitar-live',
            driveUrl: 'https://drive.google.com/drive/folders/guitarra-juda',
            driveFolderId: 'drive-guitar-01',
            classroomUrl: 'https://classroom.google.com/c/guitar-101',
            classroomId: 'classroom-task-guitar-01',
            classroomTask: 'Presentación presencial en la clase del Estudio 1 de Brouwer'
          }
        ]
      }
    ]
  }
];

// Initial mock enrollments for demonstration and testing of platform authority:
// Student "currentUser" can be enrolled in Piano, but pending/un-enrolled in others,
// allowing live testing of the mandate: "La matrícula de nuestra plataforma determina la autorización académica".
export const INITIAL_DEMO_ENROLLMENTS: Record<string, StudentEnrollment> = {
  'course-piano': {
    id: 'enr-piano-active',
    studentId: 'student_current',
    courseId: 'course-piano',
    startDate: '2026-09-01',
    expiresAt: '2026-12-31',
    status: 'active',
    modality: 'hybrid',
    accessType: 'full_access',
    paymentMethod: 'stripe',
    enrolledAt: '2026-09-01T12:00:00Z',
    validUntil: '2026-12-31T23:59:59Z',
    approvedBy: 'dir_mario_barillas'
  }
};
