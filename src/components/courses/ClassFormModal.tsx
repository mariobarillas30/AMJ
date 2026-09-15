import React, { useState } from 'react';
import { 
  AcademicClass, 
  AcademicCourse, 
  AcademicModule, 
  ClassModality,
  ClassDocument,
  ClassExercise
} from '../../types';
import { 
  X, 
  Save, 
  Video, 
  FolderOpen, 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Trash2, 
  Sparkles,
  Music,
  Award
} from 'lucide-react';

interface ClassFormModalProps {
  course: AcademicCourse;
  module: AcademicModule;
  existingClass?: AcademicClass | null;
  onSave: (savedClass: AcademicClass) => void;
  onClose: () => void;
}

export const ClassFormModal: React.FC<ClassFormModalProps> = ({
  course,
  module,
  existingClass,
  onSave,
  onClose
}) => {
  const [title, setTitle] = useState(existingClass?.title || '');
  const [description, setDescription] = useState(existingClass?.description || '');
  const [teacher, setTeacher] = useState(existingClass?.teacher || course.teacherName);
  const [date, setDate] = useState(existingClass?.date || '2026-09-15 18:00');
  const [duration, setDuration] = useState(existingClass?.duration || '90 min');
  const [modality, setModality] = useState<ClassModality>(existingClass?.modality || 'virtual_en_vivo');
  const [video, setVideo] = useState(existingClass?.video || '');
  
  // Google Integrations
  const [meetUrl, setMeetUrl] = useState(existingClass?.meetUrl || 'https://meet.google.com/jud-' + Math.random().toString(36).substring(2, 6));
  const [meetCode, setMeetCode] = useState(existingClass?.meetCode || 'jud-' + Math.random().toString(36).substring(2, 6));
  const [driveUrl, setDriveUrl] = useState(existingClass?.driveUrl || 'https://drive.google.com/drive/folders/jud-' + course.instrument.toLowerCase());
  const [driveFolderId, setDriveFolderId] = useState(existingClass?.driveFolderId || 'drive-folder-' + course.instrument.toLowerCase());
  const [classroomUrl, setClassroomUrl] = useState(existingClass?.classroomUrl || 'https://classroom.google.com/c/jud-class');
  const [classroomId, setClassroomId] = useState(existingClass?.classroomId || 'classroom-id-' + Math.random().toString(36).substring(2, 6));
  const [classroomTask, setClassroomTask] = useState(existingClass?.classroomTask || 'Práctica grabada en video con metrónomo y entrega de partitura anotada');

  // Documents
  const [documents, setDocuments] = useState<ClassDocument[]>(
    existingClass?.documents || [
      {
        id: 'doc-auto-1',
        title: 'Partitura de estudio oficial (PDF en Google Drive)',
        type: 'sheet_music',
        url: driveUrl,
        size: '2.1 MB'
      }
    ]
  );
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<'pdf' | 'sheet_music' | 'guide' | 'audio'>('sheet_music');

  // Exercises
  const [exercises, setExercises] = useState<ClassExercise[]>(
    existingClass?.exercises || [
      {
        id: 'ex-auto-1',
        title: 'Rutina de metrónomo y digitación',
        description: 'Tocar a tempo lento con subdivisión precisa y peso libre de brazo.',
        tempoBpm: 72,
        keySignature: 'Do Mayor',
        targetTechnique: 'Sonido cantabile y relajación'
      }
    ]
  );
  const [newExTitle, setNewExTitle] = useState('');
  const [newExDesc, setNewExDesc] = useState('');
  const [newExBpm, setNewExBpm] = useState<number>(76);

  // Evaluation
  const [evalTitle, setEvalTitle] = useState(existingClass?.evaluation?.title || 'Evaluación de Rendimiento de la Clase');
  const [evalQuestion, setEvalQuestion] = useState(existingClass?.evaluation?.question || '¿Cuál es la indicación principal de articulación para este pasaje musical?');
  const [opt0, setOpt0] = useState(existingClass?.evaluation?.options?.[0] || 'Articulación legato continua con apoyo en primer tiempo');
  const [opt1, setOpt1] = useState(existingClass?.evaluation?.options?.[1] || 'Staccato seco sin pedal');
  const [opt2, setOpt2] = useState(existingClass?.evaluation?.options?.[2] || 'Acentos en tiempos débiles exclusivamente');
  const [correctIndex, setCorrectIndex] = useState<number>(existingClass?.evaluation?.correctAnswerIndex ?? 0);

  const handleAddDocument = () => {
    if (!newDocTitle.trim()) return;
    setDocuments([
      ...documents,
      {
        id: 'doc-' + Date.now(),
        title: newDocTitle.trim(),
        type: newDocType,
        url: driveUrl,
        size: '1.5 MB'
      }
    ]);
    setNewDocTitle('');
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  const handleAddExercise = () => {
    if (!newExTitle.trim()) return;
    setExercises([
      ...exercises,
      {
        id: 'ex-' + Date.now(),
        title: newExTitle.trim(),
        description: newExDesc || 'Práctica con metrónomo y postura adecuada.',
        tempoBpm: newExBpm,
        targetTechnique: 'Precisión métrica'
      }
    ]);
    setNewExTitle('');
    setNewExDesc('');
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newClass: AcademicClass = {
      id: existingClass?.id || 'class-' + Date.now(),
      courseId: course.id,
      moduleId: module.id,
      title: title.trim(),
      description: description.trim(),
      teacher: teacher.trim(),
      date,
      duration,
      modality,
      video: video.trim() || undefined,
      meetUrl,
      meetCode,
      driveUrl,
      driveFolderId,
      classroomUrl,
      classroomId,
      classroomTask,
      documents,
      exercises,
      evaluation: {
        id: existingClass?.evaluation?.id || 'eval-' + Date.now(),
        title: evalTitle,
        description: 'Evaluación formativa para validar asimilación técnica.',
        maxScore: 100,
        passingScore: 70,
        criteria: ['Digitación correcta', 'Precisión métrica', 'Comprensión teórica'],
        question: evalQuestion,
        options: [opt0, opt1, opt2],
        correctAnswerIndex: correctIndex
      },
      order: existingClass?.order || (module.classes?.length || 0) + 1,
      status: 'active'
    };

    onSave(newClass);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn">
        
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 border-b border-stone-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold mb-1">
              <span>{course.title}</span>
              <span>•</span>
              <span>{module.title}</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-white">
              {existingClass ? 'Editar Clase Académica' : 'Nueva Clase con Integraciones Google'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Section 1: General Info */}
          <div className="space-y-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>1. Información de la Clase</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">
                  Título de la Clase *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Estudio de Arpegios y Lectura a Primera Vista"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">
                  Descripción Académica / Objetivos *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe los objetivos de digitación, teoría o repertorio a tratar en la sesión."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Profesor Titular *
                </label>
                <input
                  type="text"
                  required
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Modalidad de Impartición *
                </label>
                <select
                  value={modality}
                  onChange={(e) => setModality(e.target.value as ClassModality)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="virtual_en_vivo">Virtual en Vivo (Meet + Drive + Classroom + Evaluación)</option>
                  <option value="grabada">Grabada / Asíncrona (Video + Documentos + Evaluación)</option>
                  <option value="presencial">Presencial (Sede Física + Partituras Drive)</option>
                  <option value="hibrida">Híbrida (Presencial con transmisión Meet simultánea)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Fecha y Hora de Impartición
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Ej. Martes, 18:00 - 19:30 o 2026-09-15 18:00"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
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
                  placeholder="Ej. 60 min, 90 min"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Google Workspace Integrations */}
          <div className="space-y-4 bg-sky-50/50 p-4 rounded-2xl border border-sky-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-sky-700" />
              <span>2. Google Workspace Integrado (Meet, Drive & Classroom)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Google Meet URL
                </label>
                <input
                  type="url"
                  value={meetUrl}
                  onChange={(e) => setMeetUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Código de Sala Meet
                </label>
                <input
                  type="text"
                  value={meetCode}
                  onChange={(e) => setMeetCode(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Carpeta Google Drive (Partituras / Materiales)
                </label>
                <input
                  type="url"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  ID Carpeta Drive
                </label>
                <input
                  type="text"
                  value={driveFolderId}
                  onChange={(e) => setDriveFolderId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">
                  Google Classroom — Consigna / Tarea Sincronizada
                </label>
                <input
                  type="text"
                  value={classroomTask}
                  onChange={(e) => setClassroomTask(e.target.value)}
                  placeholder="Ej. Grabar video de 1 minuto tocando la lección a tempo con metrónomo"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Video & Recording */}
          <div className="space-y-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-amber-700" />
              <span>3. Video & Grabación de la Clase</span>
            </h3>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                URL del Video (Embed de YouTube, Google Drive o Vimeo)
              </label>
              <input
                type="url"
                value={video}
                onChange={(e) => setVideo(e.target.value)}
                placeholder="https://www.youtube-nocookie.com/embed/..."
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>

          {/* Section 4: Documents */}
          <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-amber-700" />
              <span>4. Documentos & Partituras ({documents.length})</span>
            </h3>

            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-700" />
                    <span className="font-semibold text-stone-900">{doc.title}</span>
                    <span className="text-[10px] text-stone-500 uppercase font-mono">({doc.type})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(doc.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="Título del nuevo documento/partitura"
                className="flex-1 px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
              <select
                value={newDocType}
                onChange={(e) => setNewDocType(e.target.value as any)}
                className="px-3 py-2 border border-stone-300 rounded-xl bg-white"
              >
                <option value="sheet_music">Partitura</option>
                <option value="pdf">PDF Guía</option>
                <option value="audio">Pista Audio</option>
              </select>
              <button
                type="button"
                onClick={handleAddDocument}
                className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 rounded-xl font-semibold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            </div>
          </div>

          {/* Section 5: Exercises */}
          <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Music className="w-4 h-4 text-emerald-700" />
              <span>5. Ejercicios Musicales ({exercises.length})</span>
            </h3>

            <div className="space-y-2">
              {exercises.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200">
                  <div>
                    <span className="font-semibold text-stone-900">{ex.title}</span>
                    {ex.tempoBpm && <span className="text-[10px] text-emerald-700 font-mono ml-2">♩={ex.tempoBpm} BPM</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(ex.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <input
                type="text"
                value={newExTitle}
                onChange={(e) => setNewExTitle(e.target.value)}
                placeholder="Nombre del ejercicio"
                className="sm:col-span-2 px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={newExBpm}
                  onChange={(e) => setNewExBpm(Number(e.target.value))}
                  placeholder="BPM"
                  className="w-20 px-3 py-2 border border-stone-300 rounded-xl bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddExercise}
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 6: Evaluation */}
          <div className="space-y-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-700" />
              <span>6. Evaluación Académica & Test Formativo</span>
            </h3>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Pregunta del Test Teórico/Práctico
              </label>
              <input
                type="text"
                value={evalQuestion}
                onChange={(e) => setEvalQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div className="space-y-2">
              <span className="block font-semibold text-stone-700">Opciones de respuesta (marca la correcta):</span>
              
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={correctIndex === 0}
                  onChange={() => setCorrectIndex(0)}
                  className="accent-indigo-600"
                />
                <input
                  type="text"
                  value={opt0}
                  onChange={(e) => setOpt0(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-stone-300 rounded-xl bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={correctIndex === 1}
                  onChange={() => setCorrectIndex(1)}
                  className="accent-indigo-600"
                />
                <input
                  type="text"
                  value={opt1}
                  onChange={(e) => setOpt1(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-stone-300 rounded-xl bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={correctIndex === 2}
                  onChange={() => setCorrectIndex(2)}
                  className="accent-indigo-600"
                />
                <input
                  type="text"
                  value={opt2}
                  onChange={(e) => setOpt2(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-stone-300 rounded-xl bg-white"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-400 font-semibold rounded-xl flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Clase en Estructura</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
