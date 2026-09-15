import React, { useState } from 'react';
import { AcademicClass } from '../../types';
import { AdminStudent } from '../../data/adminManagementData';
import { 
  X, 
  Award, 
  Star, 
  CheckCircle2, 
  Save, 
  FileText, 
  Music, 
  User, 
  Sparkles 
} from 'lucide-react';

export interface StudentEvaluationRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  classTitle: string;
  date: string;
  scoreTechnique: number;     // 0-100
  scoreRhythm: number;        // 0-100
  scoreMusicality: number;     // 0-100
  finalGrade: number;         // Average
  feedback: string;
  status: 'aprobado' | 'en_progreso' | 'requiere_refuerzo';
}

interface TeacherEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  academicClass: AcademicClass | null;
  enrolledStudents: AdminStudent[];
  onSaveEvaluation: (record: StudentEvaluationRecord) => void;
}

export const TeacherEvaluationModal: React.FC<TeacherEvaluationModalProps> = ({
  isOpen,
  onClose,
  academicClass,
  enrolledStudents,
  onSaveEvaluation
}) => {
  if (!isOpen || !academicClass) return null;

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    enrolledStudents[0]?.uid || ''
  );
  const [scoreTechnique, setScoreTechnique] = useState<number>(85);
  const [scoreRhythm, setScoreRhythm] = useState<number>(80);
  const [scoreMusicality, setScoreMusicality] = useState<number>(90);
  const [feedback, setFeedback] = useState<string>(
    'Excelente colocación de muñeca y precisión rítmica. Practicar compases 12 al 16 a tempo lento con metrónomo.'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const finalGrade = Math.round((scoreTechnique + scoreRhythm + scoreMusicality) / 3);

  const getStatus = (grade: number): StudentEvaluationRecord['status'] => {
    if (grade >= 80) return 'aprobado';
    if (grade >= 65) return 'en_progreso';
    return 'requiere_refuerzo';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = enrolledStudents.find(s => s.uid === selectedStudentId);
    if (!student) return;

    const record: StudentEvaluationRecord = {
      id: `eval-${Date.now()}`,
      studentId: student.uid,
      studentName: student.displayName,
      classId: academicClass.id,
      classTitle: academicClass.title,
      date: new Date().toISOString().split('T')[0],
      scoreTechnique,
      scoreRhythm,
      scoreMusicality,
      finalGrade,
      feedback,
      status: getStatus(finalGrade)
    };

    onSaveEvaluation(record);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
              Evaluación Pedagógica
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-1">
              Calificar Desempeño Musical
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Sesión: <strong>{academicClass.title}</strong>
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
          
          {/* Select Student */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">
              Estudiante a Evaluar
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none text-xs font-semibold"
            >
              {enrolledStudents.map(s => (
                <option key={s.uid} value={s.uid}>
                  {s.displayName} ({s.primaryInstrument})
                </option>
              ))}
            </select>
          </div>

          {/* 3 Musical Evaluation Criteria Sliders */}
          <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div>
              <div className="flex justify-between font-semibold text-stone-800 mb-1">
                <span>1. Técnica Instrumental & Digitación</span>
                <span className="font-mono text-amber-700 font-bold">{scoreTechnique} / 100</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={scoreTechnique}
                onChange={(e) => setScoreTechnique(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-stone-800 mb-1">
                <span>2. Precisión Rítmica & Control del Metrónomo</span>
                <span className="font-mono text-amber-700 font-bold">{scoreRhythm} / 100</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={scoreRhythm}
                onChange={(e) => setScoreRhythm(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-stone-800 mb-1">
                <span>3. Expresividad, Fraseo & Dinámicas Musicales</span>
                <span className="font-mono text-amber-700 font-bold">{scoreMusicality} / 100</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={scoreMusicality}
                onChange={(e) => setScoreMusicality(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Average Final Score Card */}
            <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
              <span className="font-bold text-stone-800">Promedio Ponderado Final:</span>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-stone-950 font-mono">
                  {finalGrade} pts
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  finalGrade >= 80 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : finalGrade >= 65
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {getStatus(finalGrade).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback & Observations */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">
              Retroalimentación & Recomendaciones Pedagógicas
            </label>
            <textarea
              rows={3}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Escribe las fortalezas y puntos a corregir del estudiante..."
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Calificación registrada con éxito!</span>
              </span>
            ) : (
              <span className="text-[11px] text-stone-400">
                La nota se computará en el avance del alumno.
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Registrar Evaluación</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
