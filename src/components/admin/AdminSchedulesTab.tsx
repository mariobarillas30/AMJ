import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { AcademicCourse, AdminScheduleItem } from '../../types';
import { INITIAL_ADMIN_SCHEDULES } from '../../data/adminManagementData';
import { 
  Calendar, 
  Plus, 
  Clock, 
  MapPin, 
  Video, 
  Users, 
  Edit3, 
  Trash2, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Filter,
  Layers
} from 'lucide-react';

export const AdminSchedulesTab: React.FC = () => {
  const [schedules, setSchedules] = useState<AdminScheduleItem[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  const [courses, setCourses] = useState<AcademicCourse[]>([]);

  // Real-time Firestore onSnapshot for schedules collection
  useEffect(() => {
    setLoadingSchedules(true);
    const path = 'schedules';
    const col = collection(db, path);
    const unsubscribe = onSnapshot(
      col,
      async (snapshot) => {
        if (!snapshot.empty) {
          const list: AdminScheduleItem[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              courseId: data.courseId || '',
              courseTitle: data.courseTitle || '',
              teacherName: data.teacherName || '',
              teacherId: data.teacherId || '',
              dayOfWeek: data.dayOfWeek || 'Lunes',
              startTime: data.startTime || '17:00',
              endTime: data.endTime || '18:30',
              room: data.room || 'Aula Acústica 101',
              modality: data.modality || 'live_virtual',
              meetCode: data.meetCode || 'jud-sala-horario',
              studentsEnrolled: typeof data.studentsEnrolled === 'number' ? data.studentsEnrolled : 0
            } as AdminScheduleItem);
          });
          setSchedules(list);
          setLoadingSchedules(false);
        } else {
          // Initialize empty collection with default institutional schedules
          try {
            for (const sch of INITIAL_ADMIN_SCHEDULES) {
              await setDoc(doc(db, 'schedules', sch.id), sch);
            }
          } catch (seedErr) {
            console.warn('Fallback seeding schedules:', seedErr);
            setSchedules(INITIAL_ADMIN_SCHEDULES);
            setLoadingSchedules(false);
          }
        }
      },
      (error) => {
        setLoadingSchedules(false);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const path = 'courses';
    const col = collection(db, path);
    const unsubscribe = onSnapshot(
      col,
      (snapshot) => {
        const list: AcademicCourse[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            title: data.title || '',
            description: data.description || '',
            instrument: data.instrument || 'Instrumento',
            teacherName: data.teacherName || '',
            teacherId: data.teacherId || '',
            modality: data.modality || 'live_virtual',
            schedule: data.schedule || '',
            priceMonthly: typeof data.priceMonthly === 'number' ? data.priceMonthly : 0,
            status: data.status || 'active',
            modules: data.modules || []
          } as AcademicCourse);
        });
        setCourses(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return () => unsubscribe();
  }, []);

  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<AdminScheduleItem | null>(null);

  const [formData, setFormData] = useState({
    courseId: courses[0]?.id || 'course-piano',
    dayOfWeek: 'Lunes' as AdminScheduleItem['dayOfWeek'],
    startTime: '17:00',
    endTime: '18:30',
    room: 'Aula Acústica 101',
    modality: 'live_virtual' as AdminScheduleItem['modality'],
    meetCode: 'jud-sala-horario',
    studentsEnrolled: 12
  });

  const handleOpenCreate = () => {
    setEditingSchedule(null);
    setFormData({
      courseId: courses[0]?.id || 'course-piano',
      dayOfWeek: 'Lunes',
      startTime: '17:00',
      endTime: '18:30',
      room: 'Aula Acústica 101',
      modality: 'live_virtual',
      meetCode: 'jud-sala-horario',
      studentsEnrolled: 10
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AdminScheduleItem) => {
    setEditingSchedule(item);
    setFormData({
      courseId: item.courseId,
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      room: item.room,
      modality: item.modality,
      meetCode: item.meetCode || '',
      studentsEnrolled: item.studentsEnrolled
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find(c => c.id === formData.courseId);
    const courseTitle = course ? course.title : 'Curso Académico';
    const teacherName = course ? course.teacherName : 'Docente Asignado';
    const teacherId = course ? course.teacherId : 'teacher-carlos';

    if (editingSchedule) {
      const updatedFields = {
        ...formData,
        courseTitle,
        teacherName,
        teacherId
      };
      try {
        await updateDoc(doc(db, 'schedules', editingSchedule.id), updatedFields);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `schedules/${editingSchedule.id}`);
      }
    } else {
      const newSchedule: AdminScheduleItem = {
        id: `sch-${Date.now()}`,
        ...formData,
        courseTitle,
        teacherName,
        teacherId
      };
      try {
        await setDoc(doc(db, 'schedules', newSchedule.id), newSchedule);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `schedules/${newSchedule.id}`);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar bloque de horario en Firestore?')) {
      try {
        await deleteDoc(doc(db, 'schedules', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `schedules/${id}`);
      }
    }
  };

  const days: AdminScheduleItem['dayOfWeek'][] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const filteredSchedules = selectedDay === 'all' 
    ? schedules 
    : schedules.filter(s => s.dayOfWeek === selectedDay);

  // Simple conflict checker: same day + same room + overlapping time
  const detectConflicts = (item: AdminScheduleItem) => {
    return schedules.filter(other => 
      other.id !== item.id &&
      other.dayOfWeek === item.dayOfWeek &&
      other.room === item.room &&
      ((item.startTime >= other.startTime && item.startTime < other.endTime) ||
       (item.endTime > other.startTime && item.endTime <= other.endTime))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Parrilla Semanal de Horarios & Aulas
          </h3>
          <p className="text-xs text-stone-500">
            Distribución temporal de cátedras, asignación de cabinas acústicas y salas virtuales Meet.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Programar Horario</span>
        </button>
      </div>

      {/* Days Tabs Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200">
        <button
          onClick={() => setSelectedDay('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedDay === 'all' 
              ? 'bg-stone-900 text-amber-400' 
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          Todos los Días
        </button>
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedDay === day 
                ? 'bg-stone-900 text-amber-400' 
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Schedules List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSchedules.map((item) => {
          const conflicts = detectConflicts(item);
          const hasConflict = conflicts.length > 0;

          return (
            <div 
              key={item.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs space-y-3 transition-all ${
                hasConflict ? 'border-red-300 ring-2 ring-red-100' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900 text-amber-400 uppercase tracking-wider">
                    {item.dayOfWeek}
                  </span>
                  <span className="font-mono text-xs font-bold text-stone-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{item.startTime} - {item.endTime}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
                    title="Editar horario"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Eliminar horario"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-serif font-bold text-stone-900 text-sm line-clamp-1">
                  {item.courseTitle}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Docente: <strong className="text-stone-700">{item.teacherName}</strong>
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
                <div className="flex items-center gap-1 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate max-w-[180px]">{item.room}</span>
                </div>

                {item.meetCode && (
                  <div className="flex items-center gap-1 font-mono text-[11px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                    <Video className="w-3 h-3" />
                    <span>{item.meetCode}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-[11px] text-stone-500">
                  <Users className="w-3 h-3" />
                  <span>{item.studentsEnrolled} alumnos</span>
                </div>
              </div>

              {hasConflict && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>Conflicto de espacio detectado: Esta aula se encuentra ocupada por otra sesión simultánea.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingSchedule ? 'Editar Bloque de Horario' : 'Programar Nuevo Horario'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Curso</label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.teacherName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Día</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({...formData, dayOfWeek: e.target.value as any})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Inicio</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Fin</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Aula / Espacio Físico</label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({...formData, room: e.target.value})}
                  placeholder="Aula 101, Auditorio Central, etc."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Código Google Meet</label>
                  <input
                    type="text"
                    value={formData.meetCode}
                    onChange={(e) => setFormData({...formData, meetCode: e.target.value})}
                    placeholder="jud-bach-piano"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Cupo Estimado</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.studentsEnrolled}
                    onChange={(e) => setFormData({...formData, studentsEnrolled: Number(e.target.value)})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-colors shadow-sm"
                >
                  Guardar Horario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
