import { AcademicProgressRecord, CourseProgressSummary, AcademicCourse } from '../types';
import { INITIAL_ACADEMY_COURSES } from './academyHierarchyData';

export const INITIAL_ACADEMIC_PROGRESS_RECORDS: AcademicProgressRecord[] = [
  // Mario Barillas - Piano Clásico
  {
    id: 'prog-mario-p101',
    studentId: 'student-mario',
    studentName: 'Mario Barillas',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    moduleId: 'mod-piano-1',
    moduleTitle: 'Módulo 1: Fundamentos Técnicos, Postura y Lectura Musical',
    classId: 'class-p-101',
    classTitle: 'Mecanismo de Mano, Ejercicios Hanon y Escala de Do Mayor',
    completed: true,
    completedAt: '2026-09-08 19:15',
    percentage: 100,
    sourceOfTruth: 'internal_platform',
    classroomActivityCompleted: true,
    classroomSubmissionDate: '2026-09-08 20:30',
    meetSessionAttended: true,
    driveMaterialConsulted: true,
    notes: 'Completado y evaluado por Prof. Carlos Mendoza.'
  },
  {
    id: 'prog-mario-p102',
    studentId: 'student-mario',
    studentName: 'Mario Barillas',
    courseId: 'course-piano',
    courseTitle: 'Piano Clásico, Solfeo & Armonía Funcional',
    moduleId: 'mod-piano-1',
    moduleTitle: 'Módulo 1: Fundamentos Técnicos, Postura y Lectura Musical',
    classId: 'class-p-102',
    classTitle: 'Clave de Fa, Coordinación Bimanual y Pequeño Preludio en Do Mayor',
    completed: false,
    completedAt: '2026-09-10 17:00',
    percentage: 45,
    sourceOfTruth: 'internal_platform',
    classroomActivityCompleted: false,
    meetSessionAttended: false,
    driveMaterialConsulted: true,
    notes: 'Partitura descargada de Drive. Pendiente práctica con metrónomo.'
  },
  // Lucía Méndez - Canto Lírico
  {
    id: 'prog-lucia-c101',
    studentId: 'student-lucia',
    studentName: 'Lucía Méndez',
    courseId: 'course-voice',
    courseTitle: 'Canto Lírico, Respiración Diafragmática & Técnica Vocal',
    moduleId: 'mod-voice-1',
    moduleTitle: 'Módulo 1: Anatomía del Aparato Fonador y Respiración',
    classId: 'class-v-101',
    classTitle: 'Gimnasia Respiratoria, Apoyo Costodiafragmático y Relajación Mandibular',
    completed: true,
    completedAt: '2026-09-07 11:30',
    percentage: 100,
    sourceOfTruth: 'internal_platform',
    classroomActivityCompleted: true,
    classroomSubmissionDate: '2026-09-07 12:00',
    meetSessionAttended: true,
    driveMaterialConsulted: true,
    notes: 'Excelente apoyo diafragmático.'
  },
  // Andrés Castillo - Guitarra Acústica
  {
    id: 'prog-andres-g101',
    studentId: 'student-andres',
    studentName: 'Andrés Castillo',
    courseId: 'course-guitar',
    courseTitle: 'Guitarra Acústica & Fingerstyle Contemporáneo',
    moduleId: 'mod-guitar-1',
    moduleTitle: 'Módulo 1: Postura, Afinación y Técnica de Mano Derecha',
    classId: 'class-g-101',
    classTitle: 'Postura Clásica vs Moderna, Afinación por Armónicos y Ejercicios Giuliani',
    completed: true,
    completedAt: '2026-09-09 17:45',
    percentage: 100,
    sourceOfTruth: 'internal_platform',
    classroomActivityCompleted: true,
    classroomSubmissionDate: '2026-09-09 18:30',
    meetSessionAttended: false,
    driveMaterialConsulted: true,
    notes: 'Clase grabada completada y aprobada.'
  }
];

const STORAGE_KEY = 'jud_academic_progress_records';

/**
 * Recupera todos los registros de progreso asegurando el almacenamiento local como caché de alta velocidad.
 */
export function getStoredProgressRecords(): AcademicProgressRecord[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error al parsear el progreso académico:', e);
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ACADEMIC_PROGRESS_RECORDS));
  return INITIAL_ACADEMIC_PROGRESS_RECORDS;
}

/**
 * Guarda o actualiza un registro individual de clase.
 * Mantiene la plataforma interna como FUENTE PRINCIPAL.
 */
export function saveClassProgress(record: Omit<AcademicProgressRecord, 'id'> & { id?: string }): AcademicProgressRecord[] {
  const current = getStoredProgressRecords();
  const id = record.id || `prog-${record.studentId}-${record.classId}`;
  
  const updatedRecord: AcademicProgressRecord = {
    ...record,
    id,
    sourceOfTruth: 'internal_platform', // Invariable: la plataforma es la fuente principal
  };

  const index = current.findIndex(r => r.studentId === record.studentId && r.classId === record.classId);
  let updatedList: AcademicProgressRecord[];

  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = updatedRecord;
  } else {
    updatedList = [updatedRecord, ...current];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  return updatedList;
}

/**
 * Alterna el estado de completitud de una clase específica para un alumno.
 */
export function toggleClassCompletion(
  studentId: string,
  studentName: string,
  courseId: string,
  courseTitle: string,
  moduleId: string,
  moduleTitle: string,
  classId: string,
  classTitle: string,
  targetCompleted?: boolean
): AcademicProgressRecord[] {
  const current = getStoredProgressRecords();
  const existing = current.find(r => r.studentId === studentId && r.classId === classId);
  
  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const isCompleted = targetCompleted !== undefined ? targetCompleted : !(existing?.completed || false);
  const percentage = isCompleted ? 100 : 0;

  return saveClassProgress({
    id: existing?.id,
    studentId,
    studentName,
    courseId,
    courseTitle,
    moduleId,
    moduleTitle,
    classId,
    classTitle,
    completed: isCompleted,
    completedAt: formattedDate,
    percentage,
    sourceOfTruth: 'internal_platform',
    classroomActivityCompleted: existing?.classroomActivityCompleted || false,
    classroomSubmissionDate: existing?.classroomSubmissionDate,
    meetSessionAttended: existing?.meetSessionAttended || false,
    driveMaterialConsulted: existing?.driveMaterialConsulted || false,
    notes: existing?.notes || (isCompleted ? 'Marcada como completada en la plataforma institucional.' : 'Progreso restablecido.')
  });
}

/**
 * Registra información complementaria proveniente de Google Classroom / Meet / Drive
 * SIN reemplazar el estado principal de completitud de la plataforma.
 */
export function syncComplementaryWorkspaceData(
  studentId: string,
  classId: string,
  data: {
    classroomActivityCompleted?: boolean;
    classroomSubmissionDate?: string;
    meetSessionAttended?: boolean;
    driveMaterialConsulted?: boolean;
    notes?: string;
  }
): AcademicProgressRecord[] {
  const current = getStoredProgressRecords();
  const existingIndex = current.find(r => r.studentId === studentId && r.classId === classId);

  if (!existingIndex) {
    return current;
  }

  const updated: AcademicProgressRecord = {
    ...existingIndex,
    classroomActivityCompleted: data.classroomActivityCompleted !== undefined ? data.classroomActivityCompleted : existingIndex.classroomActivityCompleted,
    classroomSubmissionDate: data.classroomSubmissionDate || existingIndex.classroomSubmissionDate,
    meetSessionAttended: data.meetSessionAttended !== undefined ? data.meetSessionAttended : existingIndex.meetSessionAttended,
    driveMaterialConsulted: data.driveMaterialConsulted !== undefined ? data.driveMaterialConsulted : existingIndex.driveMaterialConsulted,
    notes: data.notes ? `${existingIndex.notes || ''} | ${data.notes}` : existingIndex.notes
  };

  const updatedList = current.map(r => (r.id === existingIndex.id ? updated : r));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  return updatedList;
}

/**
 * Calcula el resumen curricular exacto (porcentaje total y por módulos) de un curso para un alumno.
 */
export function calculateStudentCourseProgress(
  studentId: string,
  course: AcademicCourse,
  records: AcademicProgressRecord[]
): CourseProgressSummary {
  let totalClasses = 0;
  let completedClasses = 0;
  let lastActivity = 'Sin actividad';

  const modulesProgress = (course.modules || []).map(mod => {
    const modClasses = mod.classes || [];
    const modTotal = modClasses.length;
    let modCompleted = 0;

    modClasses.forEach(cls => {
      totalClasses++;
      const rec = records.find(r => r.studentId === studentId && r.classId === cls.id);
      if (rec && rec.completed) {
        completedClasses++;
        modCompleted++;
        if (rec.completedAt && rec.completedAt > lastActivity) {
          lastActivity = rec.completedAt;
        }
      }
    });

    const modPct = modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;
    return {
      moduleId: mod.id,
      moduleTitle: mod.title,
      totalClasses: modTotal,
      completedClasses: modCompleted,
      percentage: modPct
    };
  });

  const overallPercentage = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0;

  return {
    studentId,
    studentName: records.find(r => r.studentId === studentId)?.studentName || 'Estudiante',
    courseId: course.id,
    courseTitle: course.title,
    instrument: course.instrument,
    totalClasses,
    completedClasses,
    overallPercentage,
    lastActivityDate: lastActivity,
    modules: modulesProgress
  };
}
