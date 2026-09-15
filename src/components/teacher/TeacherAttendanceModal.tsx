import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AcademicClass, StudentEnrollment } from '../../types';
import { AdminStudent } from '../../data/adminManagementData';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Save, 
  Users, 
  Calendar, 
  Music,
  Check
} from 'lucide-react';

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  note?: string;
}

interface TeacherAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  academicClass: AcademicClass | null;
  courseTitle: string;
  enrolledStudents: AdminStudent[];
  onSaveAttendance: (classId: string, records: AttendanceRecord[]) => void;
}

export const TeacherAttendanceModal: React.FC<TeacherAttendanceModalProps> = ({
  isOpen,
  onClose,
  academicClass,
  courseTitle,
  enrolledStudents,
  onSaveAttendance
}) => {
  if (!isOpen || !academicClass) return null;

  // Initialize attendance state for each enrolled student
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    return enrolledStudents.map(s => ({
      studentId: s.uid,
      studentName: s.displayName,
      status: 'present' as const,
      note: ''
    }));
  });

  // Fetch saved attendance from Firestore if exists
  useEffect(() => {
    if (!academicClass?.id) return;
    const fetchSaved = async () => {
      try {
        const snap = await getDoc(doc(db, 'attendance', `att_${academicClass.id}`));
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.records) && data.records.length > 0) {
            setRecords(data.records);
          }
        }
      } catch (e) {
        console.warn('Attendance load fallback:', e);
      }
    };
    fetchSaved();
  }, [academicClass?.id]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
    setRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r));
    setSavedSuccess(false);
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, note } : r));
    setSavedSuccess(false);
  };

  const handleMarkAll = (status: AttendanceRecord['status']) => {
    setRecords(prev => prev.map(r => ({ ...r, status })));
    setSavedSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAttendance(academicClass.id, records);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const lateCount = records.filter(r => r.status === 'late').length;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
              Control Pedagógico
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-1">
              Registro de Asistencia
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Clase: <strong>{academicClass.title}</strong> • {academicClass.date} ({academicClass.duration})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick bulk actions & metrics */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-stone-500 font-medium">Resumen:</span>
            <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {presentCount} Presentes
            </span>
            <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {lateCount} Tardanzas
            </span>
            <span className="text-red-800 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
              {absentCount} Ausentes
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMarkAll('present')}
              className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 rounded-lg font-semibold border border-stone-200 transition-colors"
            >
              Marcar Todos Presentes
            </button>
          </div>
        </div>

        {/* Form list of students */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {records.map((rec) => (
              <div
                key={rec.studentId}
                className="p-3 bg-white rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-300 transition-colors"
              >
                <div>
                  <h5 className="text-xs font-bold text-stone-900">
                    {rec.studentName}
                  </h5>
                  <span className="text-[10px] text-stone-400">
                    Alumno Matriculado
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(rec.studentId, 'present')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      rec.status === 'present'
                        ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Presente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(rec.studentId, 'late')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      rec.status === 'late'
                        ? 'bg-amber-500 text-stone-950 shadow-2xs font-bold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Tardanza</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(rec.studentId, 'absent')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      rec.status === 'absent'
                        ? 'bg-red-600 text-white shadow-2xs font-bold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Ausente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(rec.studentId, 'excused')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      rec.status === 'excused'
                        ? 'bg-sky-600 text-white shadow-2xs font-bold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Justificado</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Asistencia guardada y sincronizada en el expediente</span>
              </span>
            ) : (
              <span className="text-[11px] text-stone-400">
                Los cambios se registrarán inmediatamente en la ficha del alumno.
              </span>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Asistencia</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
