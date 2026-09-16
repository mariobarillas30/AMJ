import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { AcademicCourse } from '../../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  BookOpen, 
  Video, 
  FolderOpen, 
  CheckCircle2, 
  Clock, 
  X,
  Music,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface AdminCoursesTabProps {
  onSelectCourseForClasses?: (courseId: string) => void;
}

export const AdminCoursesTab: React.FC<AdminCoursesTabProps> = ({ onSelectCourseForClasses }) => {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const isFacultyOrAdmin = userProfile?.role === 'admin' || userProfile?.role === 'superadmin' || userProfile?.role === 'teacher';

  const [courses, setCourses] = useState<AcademicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AcademicCourse | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instrument: 'Piano',
    teacherName: 'Prof. Carlos Mendoza',
    teacherId: 'teacher-carlos',
    modality: 'live_virtual' as AcademicCourse['modality'],
    schedule: 'Lunes y Miércoles, 17:00 - 18:30',
    priceMonthly: 75,
    status: 'active' as AcademicCourse['status'],
    meetUrl: 'https://meet.google.com/jud-clase-nueva',
    meetCode: 'jud-clase-nueva',
    driveFolderId: 'drive-folder-instrumento',
    classroomCourseId: 'classroom-juda-01'
  });

  // Real-time Firestore synchronization
  useEffect(() => {
    setLoading(true);
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
            meetUrl: data.meetUrl || '',
            meetCode: data.meetCode || '',
            driveFolderId: data.driveFolderId || '',
            classroomCourseId: data.classroomCourseId || '',
            modules: data.modules || []
          } as AcademicCourse);
        });
        setCourses(list);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      instrument: 'Piano',
      teacherName: 'Prof. Carlos Mendoza',
      teacherId: 'teacher-carlos',
      modality: 'live_virtual',
      schedule: 'Lunes y Miércoles, 17:00 - 18:30',
      priceMonthly: 75,
      status: 'active',
      meetUrl: 'https://meet.google.com/jud-clase-nueva',
      meetCode: 'jud-clase-nueva',
      driveFolderId: 'drive-folder-instrumento',
      classroomCourseId: 'classroom-juda-01'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: AcademicCourse) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      instrument: course.instrument,
      teacherName: course.teacherName,
      teacherId: course.teacherId,
      modality: course.modality,
      schedule: course.schedule,
      priceMonthly: course.priceMonthly,
      status: course.status,
      meetUrl: course.meetUrl || '',
      meetCode: course.meetCode || '',
      driveFolderId: course.driveFolderId || '',
      classroomCourseId: course.classroomCourseId || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (authLoading) {
      alert('La autenticación se está verificando. Por favor reintenta en un momento.');
      return;
    }
    if (!currentUser || !isFacultyOrAdmin) {
      alert('No tienes permisos de administración para realizar esta acción.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCourse) {
        // Edit existing in Firestore
        const docRef = doc(db, 'courses', editingCourse.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          // Document does not exist in Firestore - create via setDoc to prevent "No document to update"
          const newCourseObj: AcademicCourse = {
            id: editingCourse.id,
            title: formData.title.trim(),
            description: formData.description,
            instrument: formData.instrument,
            teacherName: formData.teacherName,
            teacherId: formData.teacherId,
            modality: formData.modality,
            schedule: formData.schedule,
            priceMonthly: Number(formData.priceMonthly) || 0,
            status: formData.status,
            meetUrl: formData.meetUrl || '',
            meetCode: formData.meetCode || '',
            driveFolderId: formData.driveFolderId || '',
            classroomCourseId: formData.classroomCourseId || '',
            modules: editingCourse.modules || []
          };
          await setDoc(docRef, newCourseObj);
        } else {
          await updateDoc(docRef, {
            title: formData.title.trim(),
            description: formData.description,
            instrument: formData.instrument,
            teacherName: formData.teacherName,
            teacherId: formData.teacherId,
            modality: formData.modality,
            schedule: formData.schedule,
            priceMonthly: Number(formData.priceMonthly) || 0,
            status: formData.status,
            meetUrl: formData.meetUrl || '',
            meetCode: formData.meetCode || '',
            driveFolderId: formData.driveFolderId || '',
            classroomCourseId: formData.classroomCourseId || ''
          });
        }
      } else {
        // Create new in Firestore
        const courseId = `course-${Date.now()}`;
        const newCourse: AcademicCourse = {
          id: courseId,
          title: formData.title.trim(),
          description: formData.description,
          instrument: formData.instrument,
          teacherName: formData.teacherName,
          teacherId: formData.teacherId,
          modality: formData.modality,
          schedule: formData.schedule,
          priceMonthly: Number(formData.priceMonthly) || 0,
          status: formData.status,
          meetUrl: formData.meetUrl || '',
          meetCode: formData.meetCode || '',
          driveFolderId: formData.driveFolderId || '',
          classroomCourseId: formData.classroomCourseId || '',
          modules: [
            {
              id: `mod-${Date.now()}-1`,
              courseId: courseId,
              title: 'Módulo 1: Fundamentos y Técnica Inicial',
              description: 'Conceptos base del instrumento y desarrollo de destreza motriz.',
              order: 1,
              classes: []
            }
          ]
        };
        await setDoc(doc(db, 'courses', courseId), newCourse);
      }
      setIsModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, editingCourse ? OperationType.UPDATE : OperationType.CREATE, `courses/${editingCourse?.id || 'new'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (authLoading) {
      alert('Verificando autenticación...');
      return;
    }
    if (!currentUser || !isFacultyOrAdmin) {
      alert('No tienes permisos para eliminar cursos.');
      return;
    }
    if (confirm('¿Estás seguro de eliminar este curso del plan académico?')) {
      try {
        await deleteDoc(doc(db, 'courses', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `courses/${id}`);
      }
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.instrument.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModality = modalityFilter === 'all' || c.modality === modalityFilter;
    return matchesSearch && matchesModality;
  });

  const getModalityLabel = (m: string) => {
    switch (m) {
      case 'live_virtual': return { label: 'Virtual en Vivo', color: 'bg-sky-100 text-sky-800' };
      case 'online_recorded': return { label: 'Grabada', color: 'bg-purple-100 text-purple-800' };
      case 'presencial': return { label: 'Presencial', color: 'bg-emerald-100 text-emerald-800' };
      case 'hybrid': return { label: 'Híbrida', color: 'bg-amber-100 text-amber-800' };
      default: return { label: m, color: 'bg-stone-100 text-stone-800' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Gestión Académica de Cursos
          </h3>
          <p className="text-xs text-stone-500">
            Administra el catálogo curricular, asignación de docentes, aranceles y recursos satélite.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Curso</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por curso, instrumento o profesor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-stone-500" />
          <span className="text-xs text-stone-600 font-medium">Modalidad:</span>
          <select
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todas las modalidades</option>
            <option value="live_virtual">Virtual en Vivo</option>
            <option value="online_recorded">Grabada</option>
            <option value="presencial">Presencial</option>
            <option value="hybrid">Híbrida</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 bg-stone-50 rounded-2xl border border-stone-200">
          <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
          <p className="text-xs text-stone-500 font-medium">Sincronizando cursos en tiempo real con Firestore...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-12 text-center text-xs text-stone-400 italic bg-stone-50 rounded-2xl border border-stone-200">
          No se encontraron cursos coincidentes en Firestore.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const mod = getModalityLabel(course.modality);
            const totalClasses = course.modules?.reduce((acc, m) => acc + (m.classes?.length || 0), 0) || 0;

            return (
              <div 
                key={course.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${mod.color}`}>
                      {mod.label}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      course.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {course.status === 'active' ? 'Activo' : 'Borrador'}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-stone-900 text-base line-clamp-1">
                    {course.title}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                    <div className="flex items-center justify-between">
                      <span>Instrumento:</span>
                      <strong className="text-stone-900">{course.instrument}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Profesor Asignado:</span>
                      <span className="text-stone-800">{course.teacherName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Horario Semanal:</span>
                      <span className="text-stone-700">{course.schedule}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mensualidad:</span>
                      <span className="font-bold text-amber-700 font-mono">${course.priceMonthly} USD</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Estructura:</span>
                      <span>{course.modules?.length || 0} módulos ({totalClasses} clases)</span>
                    </div>
                  </div>

                  {/* Google Workspace Pointers */}
                  <div className="mt-3 p-2 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <div className="flex items-center gap-1.5" title="Google Meet">
                      <Video className="w-3.5 h-3.5 text-sky-600" />
                      <span className="font-mono">{course.meetCode || 'No asignado'}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Google Drive Folder">
                      <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                      <span className="font-mono truncate max-w-[90px]">{course.driveFolderId || 'drive-root'}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  {onSelectCourseForClasses && (
                    <button
                      onClick={() => onSelectCourseForClasses(course.id)}
                      className="text-xs text-amber-700 hover:text-amber-900 font-semibold"
                    >
                      Ver Clases →
                    </button>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => handleOpenEdit(course)}
                      className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Editar curso"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar curso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingCourse ? 'Editar Curso Académico' : 'Crear Nuevo Curso Académico'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nombre del Curso</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ej: Violín Clásico y Ensamble de Cuerdas"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Descripción Pedagógica</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Objetivos de aprendizaje, técnica instrumental y repertorio..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Instrumento</label>
                  <select
                    value={formData.instrument}
                    onChange={(e) => setFormData({...formData, instrument: e.target.value})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Piano">Piano</option>
                    <option value="Canto">Canto</option>
                    <option value="Guitarra">Guitarra</option>
                    <option value="Violín">Violín</option>
                    <option value="Batería">Batería</option>
                    <option value="Teoría">Teoría & Armonía</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Modalidad</label>
                  <select
                    value={formData.modality}
                    onChange={(e) => setFormData({...formData, modality: e.target.value as any})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  >
                    <option value="live_virtual">Virtual en Vivo (Google Meet)</option>
                    <option value="online_recorded">Grabada (Asíncrona)</option>
                    <option value="presencial">Presencial (Sede Física)</option>
                    <option value="hybrid">Híbrida (Presencial + Streaming)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Profesor Responsable</label>
                  <select
                    value={formData.teacherName}
                    onChange={(e) => {
                      const name = e.target.value;
                      let id = 'teacher-carlos';
                      if (name.includes('Elena')) id = 'teacher-elena';
                      if (name.includes('David')) id = 'teacher-david';
                      if (name.includes('Andrés')) id = 'teacher-andres';
                      if (name.includes('Rebeca')) id = 'teacher-rebeca';
                      setFormData({...formData, teacherName: name, teacherId: id});
                    }}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Prof. Carlos Mendoza">Prof. Carlos Mendoza (Piano)</option>
                    <option value="Prof. Elena Valenzuela">Prof. Elena Valenzuela (Canto)</option>
                    <option value="Prof. David Arana">Prof. David Arana (Guitarra)</option>
                    <option value="Prof. Andrés Villalobos">Prof. Andrés Villalobos (Violín)</option>
                    <option value="Prof. Rebeca Morales">Prof. Rebeca Morales (Batería)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Precio Mensual (USD)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.priceMonthly}
                    onChange={(e) => setFormData({...formData, priceMonthly: Number(e.target.value)})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Horario de Impartición</label>
                <input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                  placeholder="Ej: Lunes y Miércoles, 18:00 - 19:30"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Workspace References */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <span className="font-bold text-stone-800 text-[11px] block">
                  Punteros Satélite Google Workspace
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-500 text-[10px] mb-0.5">Código Google Meet</label>
                    <input
                      type="text"
                      value={formData.meetCode}
                      onChange={(e) => setFormData({...formData, meetCode: e.target.value, meetUrl: `https://meet.google.com/${e.target.value}`})}
                      placeholder="jud-violin-live"
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-[10px] mb-0.5">Carpeta Google Drive (ID)</label>
                    <input
                      type="text"
                      value={formData.driveFolderId}
                      onChange={(e) => setFormData({...formData, driveFolderId: e.target.value})}
                      placeholder="drive-folder-violin"
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
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
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingCourse ? 'Guardar Cambios' : 'Crear Curso'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
