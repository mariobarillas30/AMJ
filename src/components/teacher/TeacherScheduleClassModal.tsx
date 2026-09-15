import React, { useState } from 'react';
import { AcademicCourse, AcademicClass, ClassModality } from '../../types';
import { 
  X, 
  Video, 
  FolderPlus, 
  Award, 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Music,
  ExternalLink,
  Layers,
  Save,
  Link2
} from 'lucide-react';

interface TeacherScheduleClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: AcademicCourse[]; // STRICT: Only the teacher's assigned courses!
  editingClass?: AcademicClass | null;
  onSaveClass: (courseId: string, moduleId: string, classData: AcademicClass) => void;
}

export const TeacherScheduleClassModal: React.FC<TeacherScheduleClassModalProps> = ({
  isOpen,
  onClose,
  courses,
  editingClass,
  onSaveClass
}) => {
  if (!isOpen || courses.length === 0) return null;

  const defaultCourse = courses[0];
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    editingClass?.courseId || defaultCourse.id
  );

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || defaultCourse;
  const modules = selectedCourse.modules || [];

  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    editingClass?.moduleId || modules[0]?.id || ''
  );

  const [title, setTitle] = useState(editingClass?.title || '');
  const [description, setDescription] = useState(
    editingClass?.description || ''
  );
  const [date, setDate] = useState(editingClass?.date || '2026-09-15 18:00');
  const [duration, setDuration] = useState(editingClass?.duration || '90 min');
  const [modality, setModality] = useState<ClassModality>(
    editingClass?.modality || 'virtual_en_vivo'
  );

  // Relational Google Workspace Integrations
  // 1. Google Meet
  const [meetUrl, setMeetUrl] = useState(
    editingClass?.meetUrl || 'https://meet.google.com/jud-' + selectedCourse.instrument.toLowerCase() + '-live'
  );
  const [meetCode, setMeetCode] = useState(
    editingClass?.meetCode || 'jud-' + selectedCourse.instrument.toLowerCase() + '-live'
  );

  // 2. Google Drive Material
  const [driveMaterialTitle, setDriveMaterialTitle] = useState(
    editingClass?.documents?.[0]?.title || `Partitura y Guía Técnica de ${selectedCourse.instrument} (Urtext)`
  );
  const [driveUrl, setDriveUrl] = useState(
    editingClass?.driveUrl || 'https://drive.google.com/drive/folders/material-' + selectedCourse.instrument.toLowerCase()
  );

  // 3. Google Classroom Activity
  const [classroomTask, setClassroomTask] = useState(
    editingClass?.classroomTask || 'Grabar video de práctica de 2 minutos ejecutando el estudio rítmico con metrónomo.'
  );
  const [classroomUrl, setClassroomUrl] = useState(
    editingClass?.classroomUrl || 'https://classroom.google.com/c/jud-' + selectedCourse.instrument.toLowerCase()
  );
  const [evaluationQuestion, setEvaluationQuestion] = useState(
    editingClass?.evaluation?.question || '¿Cuál es el compás y pulso métrico de la obra estudiada en esta sesión?'
  );

  const isVirtual = modality === 'virtual_en_vivo' || modality === 'hibrida';

  // Generate new Google Meet corporate room
  const handleGenerateNewMeet = () => {
    const slug = Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 5);
    const fullCode = `jud-${selectedCourse.instrument.toLowerCase()}-${slug}`;
    setMeetCode(fullCode);
    setMeetUrl(`https://meet.google.com/${fullCode}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedModuleId) return;

    const classData: AcademicClass = {
      id: editingClass?.id || `cls-${Date.now()}`,
      courseId: selectedCourseId,
      moduleId: selectedModuleId,
      title,
      description,
      teacher: selectedCourse.teacherName,
      teacherId: selectedCourse.teacherId,
      date,
      duration,
      modality,
      order: editingClass?.order || 1,
      status: 'active',
      // Relationship: Clase ↔ Meet
      meetUrl: isVirtual ? meetUrl : undefined,
      meetCode: isVirtual ? meetCode : undefined,
      // Relationship: Clase ↔ Drive
      driveUrl,
      driveFolderId: `drive-folder-${selectedCourse.instrument.toLowerCase()}`,
      documents: [
        {
          id: `doc-${Date.now()}`,
          title: driveMaterialTitle,
          type: 'sheet_music',
          url: driveUrl,
          size: '3.4 MB'
        }
      ],
      exercises: [
        {
          id: `ex-${Date.now()}`,
          title: 'Rutina de Calentamiento y Articulación',
          description: 'Ejecución con metrónomo a 72 BPM durante 15 minutos diarios.'
        }
      ],
      // Relationship: Clase ↔ Classroom
      classroomUrl,
      classroomId: `task-${Date.now()}`,
      classroomTask,
      evaluation: {
        id: `eval-${Date.now()}`,
        title: 'Evaluación Formativa de Sesión',
        description: 'Control de comprensión pedagógica y auditiva.',
        maxScore: 100,
        passingScore: 70,
        criteria: ['Comprensión Rítmica', 'Articulación Instrumental', 'Lectura Musical'],
        question: evaluationQuestion,
        options: [
          'Compás de 4/4 en tempo Andante',
          'Compás de 6/8 en tempo Allegro',
          'Compás de 3/4 en tempo Moderato',
          'Compás de 2/4 en tempo Vivace'
        ],
        correctAnswerIndex: 0
      }
    };

    onSaveClass(selectedCourseId, selectedModuleId, classData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                Planificación Académica
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {selectedCourse.teacherName}
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
              {editingClass ? 'Editar Clase Programada' : 'Programar Nueva Clase + Google'}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Configuración de sesión interna vinculada con Google Meet, Drive y Classroom.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Course & Module Selectors (Restricted strictly to the teacher's courses) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Curso Asignado (Solo Cursos Propios) *
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  const found = courses.find(c => c.id === e.target.value);
                  if (found && found.modules.length > 0) {
                    setSelectedModuleId(found.modules[0].id);
                  }
                }}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Módulo Académico *
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              >
                {modules.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Título de la Clase *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Articulación de Manos, Escala de Sol y Polifonía a 2 Voces"
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Descripción & Objetivos Pedagógicos *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué competencias musicales se desarrollarán en esta sesión..."
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Date, Duration, Modality */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Fecha y Hora de Sesión
              </label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="2026-09-15 18:00"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Duración
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="90 min"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Modalidad
              </label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value as ClassModality)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              >
                <option value="virtual_en_vivo">Virtual en Vivo</option>
                <option value="hibrida">Híbrida</option>
                <option value="grabada">Grabada</option>
                <option value="presencial">Presencial</option>
              </select>
            </div>
          </div>

          {/* GOOGLE INTEGRATION RELATIONSHIPS */}
          <div className="pt-2 border-t border-stone-200 space-y-4">
            <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-emerald-600" />
              <span>Relaciones Google Workspace de la Clase</span>
            </h4>

            {/* 1. Google Meet Relationship */}
            {isVirtual && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-emerald-700" />
                    <strong className="text-emerald-950">Clase Interna ↔ Evento/Sesión Google Meet</strong>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateNewMeet}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Regenerar Sala Meet</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-emerald-800 block mb-0.5">Enlace Directo Google Meet:</span>
                    <input
                      type="text"
                      value={meetUrl}
                      onChange={(e) => setMeetUrl(e.target.value)}
                      className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-xs font-mono text-emerald-900"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800 block mb-0.5">Código de Sesión Meet:</span>
                    <input
                      type="text"
                      value={meetCode}
                      onChange={(e) => setMeetCode(e.target.value)}
                      className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-xs font-mono text-emerald-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Google Drive Relationship */}
            <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-sky-700" />
                <strong className="text-sky-950">Clase Interna ↔ Material Google Drive</strong>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-sky-800 block mb-0.5">Título del Material / Partitura Urtext:</span>
                  <input
                    type="text"
                    value={driveMaterialTitle}
                    onChange={(e) => setDriveMaterialTitle(e.target.value)}
                    className="w-full p-2 bg-white border border-sky-300 rounded-lg text-xs text-stone-800"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-sky-800 block mb-0.5">URL Carpeta / Archivo Drive:</span>
                  <input
                    type="text"
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    className="w-full p-2 bg-white border border-sky-300 rounded-lg text-xs font-mono text-stone-800"
                  />
                </div>
              </div>
            </div>

            {/* 3. Google Classroom Relationship */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-700" />
                <strong className="text-indigo-950">Clase Interna ↔ Actividad Google Classroom</strong>
              </div>

              <div>
                <span className="text-[10px] text-indigo-800 block mb-0.5">Consigna de Tarea para los Alumnos:</span>
                <input
                  type="text"
                  value={classroomTask}
                  onChange={(e) => setClassroomTask(e.target.value)}
                  className="w-full p-2 bg-white border border-indigo-300 rounded-lg text-xs text-stone-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-indigo-800 block mb-0.5">Enlace a Google Classroom:</span>
                  <input
                    type="text"
                    value={classroomUrl}
                    onChange={(e) => setClassroomUrl(e.target.value)}
                    className="w-full p-2 bg-white border border-indigo-300 rounded-lg text-xs font-mono text-stone-800"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-indigo-800 block mb-0.5">Pregunta de Evaluación Rápida:</span>
                  <input
                    type="text"
                    value={evaluationQuestion}
                    onChange={(e) => setEvaluationQuestion(e.target.value)}
                    className="w-full p-2 bg-white border border-indigo-300 rounded-lg text-xs text-stone-800"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Guardar & Sincronizar Clase</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
