import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  getDoc,
  updateDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { AcademicCourse, AcademicClass, ClassModality } from '../../types';
import { 
  Video, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  FolderOpen, 
  BookOpen, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  Layers,
  Sparkles,
  Award,
  Music,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface AdminClassesTabProps {
  initialCourseFilter?: string;
}

export const AdminClassesTab: React.FC<AdminClassesTabProps> = ({ initialCourseFilter }) => {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const isFacultyOrAdmin = userProfile?.role === 'admin' || userProfile?.role === 'superadmin' || userProfile?.role === 'teacher';

  const [courses, setCourses] = useState<AcademicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>(initialCourseFilter || 'all');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<{ courseId: string; moduleId: string; classItem: AcademicClass } | null>(null);

  // Form state
  const [formCourseId, setFormCourseId] = useState<string>('');
  const [formModuleId, setFormModuleId] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    teacher: 'Prof. Carlos Mendoza',
    date: '2026-09-15 18:00',
    duration: '60 min',
    modality: 'virtual_en_vivo' as ClassModality,
    meetCode: 'jud-meet-sala',
    driveFolderId: 'drive-folder-clase',
    classroomTask: 'Práctica técnica de digitación',
    evaluationQuestion: '¿Cuál es la postura correcta de muñeca?'
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
        if (list.length > 0) {
          setFormCourseId(prev => prev || list[0].id);
          setFormModuleId(prev => prev || list[0].modules?.[0]?.id || '');
        }
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Flatten all classes across all courses and modules for admin overview
  const allClasses = courses.flatMap(course => 
    (course.modules || []).flatMap(mod => 
      (mod.classes || []).map(cls => ({
        ...cls,
        courseTitle: course.title,
        courseId: course.id,
        moduleTitle: mod.title,
        moduleId: mod.id
      }))
    )
  );

  const filteredClasses = allClasses.filter(c => {
    const matchesCourse = selectedCourseFilter === 'all' || c.courseId === selectedCourseFilter;
    const matchesModality = modalityFilter === 'all' || c.modality === modalityFilter;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesModality && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingClass(null);
    const targetCourse = courses[0];
    const targetModule = targetCourse?.modules?.[0];
    setFormCourseId(targetCourse?.id || '');
    setFormModuleId(targetModule?.id || '');
    setFormData({
      title: '',
      description: '',
      teacher: targetCourse?.teacherName || 'Prof. Carlos Mendoza',
      date: '2026-09-15 18:00',
      duration: '60 min',
      modality: 'virtual_en_vivo',
      meetCode: 'jud-meet-sala',
      driveFolderId: 'drive-folder-clase',
      classroomTask: 'Práctica técnica asignada',
      evaluationQuestion: '¿Cuál es el criterio técnico de evaluación para esta sesión?'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: typeof allClasses[0]) => {
    setEditingClass({
      courseId: item.courseId,
      moduleId: item.moduleId,
      classItem: item
    });
    setFormCourseId(item.courseId);
    setFormModuleId(item.moduleId);
    setFormData({
      title: item.title,
      description: item.description,
      teacher: item.teacher,
      date: item.date,
      duration: item.duration,
      modality: item.modality,
      meetCode: item.meetCode || '',
      driveFolderId: item.driveFolderId || '',
      classroomTask: item.classroomTask || '',
      evaluationQuestion: item.evaluation?.question || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (authLoading) {
      alert('La autenticación se está cargando. Intenta en un momento.');
      return;
    }
    if (!currentUser || !isFacultyOrAdmin) {
      alert('No tienes permisos de administración.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingClass) {
        // Edit class in corresponding course and module
        const targetCourse = courses.find(c => c.id === editingClass.courseId);
        if (!targetCourse) {
          alert('El curso objetivo no existe en el cliente.');
          return;
        }

        const docRef = doc(db, 'courses', editingClass.courseId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          alert(`Error: El curso seleccionado (ID: ${editingClass.courseId}) no existe en Firestore.`);
          return;
        }

        const updatedModules = (targetCourse.modules || []).map(m => {
          if (m.id !== editingClass.moduleId) return m;
          return {
            ...m,
            classes: (m.classes || []).map(cls => {
              if (cls.id !== editingClass.classItem.id) return cls;
              return {
                ...cls,
                title: formData.title.trim(),
                description: formData.description,
                teacher: formData.teacher,
                date: formData.date,
                duration: formData.duration,
                modality: formData.modality,
                meetCode: formData.meetCode,
                meetUrl: `https://meet.google.com/${formData.meetCode}`,
                driveFolderId: formData.driveFolderId,
                classroomTask: formData.classroomTask,
                evaluation: {
                  ...cls.evaluation,
                  question: formData.evaluationQuestion
                }
              };
            })
          };
        });

        await updateDoc(docRef, {
          modules: updatedModules
        });
      } else {
        // Create new class in selected module
        const targetCourse = courses.find(c => c.id === formCourseId);
        if (!targetCourse) {
          alert('Por favor selecciona un curso válido.');
          return;
        }

        const docRef = doc(db, 'courses', formCourseId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          alert(`Error: El curso seleccionado no existe en Firestore. Créalo primero.`);
          return;
        }

        const newClass: AcademicClass = {
          id: `class-${Date.now()}`,
          courseId: formCourseId,
          moduleId: formModuleId,
          title: formData.title.trim(),
          description: formData.description,
          teacher: formData.teacher,
          date: formData.date,
          duration: formData.duration,
          modality: formData.modality,
          order: 99,
          status: 'active',
          meetCode: formData.meetCode,
          meetUrl: `https://meet.google.com/${formData.meetCode}`,
          driveFolderId: formData.driveFolderId,
          classroomTask: formData.classroomTask,
          documents: [],
          exercises: [],
          evaluation: {
            id: `eval-${Date.now()}`,
            title: 'Evaluación Técnica de Sesión',
            description: 'Comprobación interactiva del contenido visto en clase.',
            maxScore: 100,
            passingScore: 70,
            criteria: ['Comprensión auditiva', 'Control del metrónomo'],
            question: formData.evaluationQuestion,
            options: ['Opción A (Correcta)', 'Opción B', 'Opción C', 'Opción D'],
            correctAnswerIndex: 0
          }
        };

        const updatedModules = (targetCourse.modules || []).map(m => {
          if (m.id !== formModuleId) return m;
          return {
            ...m,
            classes: [...(m.classes || []), newClass]
          };
        });

        await updateDoc(docRef, {
          modules: updatedModules
        });
      }

      setIsModalOpen(false);
    } catch (err) {
      handleFirestoreError(
        err, 
        OperationType.UPDATE, 
        `courses/${editingClass?.courseId || formCourseId}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (courseId: string, moduleId: string, classId: string) => {
    if (authLoading || !currentUser || !isFacultyOrAdmin) {
      alert('No tienes permisos para eliminar clases.');
      return;
    }
    if (confirm('¿Eliminar esta clase del módulo académico?')) {
      const docRef = doc(db, 'courses', courseId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        alert('Error: El curso no existe en Firestore.');
        return;
      }

      const targetCourse = courses.find(c => c.id === courseId);
      if (!targetCourse) return;

      const updatedModules = (targetCourse.modules || []).map(m => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          classes: (m.classes || []).filter(cls => cls.id !== classId)
        };
      });

      try {
        await updateDoc(docRef, {
          modules: updatedModules
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `courses/${courseId}`);
      }
    }
  };

  const getModalityBadge = (m: ClassModality) => {
    switch (m) {
      case 'virtual_en_vivo': return { label: 'Virtual en Vivo', color: 'bg-sky-100 text-sky-800' };
      case 'grabada': return { label: 'Grabada', color: 'bg-purple-100 text-purple-800' };
      case 'presencial': return { label: 'Presencial', color: 'bg-emerald-100 text-emerald-800' };
      case 'hibrida': return { label: 'Híbrida', color: 'bg-amber-100 text-amber-800' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Control de Clases Académicas
          </h3>
          <p className="text-xs text-stone-500">
            Supervisión de sesiones, modalidad de impartición, enlaces Google Meet y evaluación.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Clase</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar clase o profesor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-medium">Curso:</span>
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500 text-xs"
            >
              <option value="all">Todos los cursos</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-medium">Modalidad:</span>
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500 text-xs"
            >
              <option value="all">Todas</option>
              <option value="virtual_en_vivo">Virtual en Vivo</option>
              <option value="grabada">Grabada</option>
              <option value="presencial">Presencial</option>
              <option value="hibrida">Híbrida</option>
            </select>
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
            <p className="text-xs text-stone-500 font-medium">Sincronizando clases en tiempo real desde Firestore...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
            No se encontraron clases con los filtros aplicados.
          </div>
        ) : (
          filteredClasses.map((item) => {
            const badge = getModalityBadge(item.modality);

            return (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs hover:border-stone-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {item.courseTitle}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {item.moduleTitle}
                    </span>
                  </div>

                  <h4 className="font-bold text-stone-900 text-sm">
                    {item.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{item.date} ({item.duration})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-stone-400" />
                      <span>{item.teacher}</span>
                    </span>
                    {item.meetCode && (
                      <span className="flex items-center gap-1 font-mono text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                        <Video className="w-3 h-3" />
                        <span>{item.meetCode}</span>
                      </span>
                    )}
                    {item.driveFolderId && (
                      <span className="flex items-center gap-1 font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                        <FolderOpen className="w-3 h-3" />
                        <span>Drive</span>
                      </span>
                    )}
                    {item.evaluation && (
                      <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        <Award className="w-3 h-3" />
                        <span>Evaluación interactiva</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
                    title="Editar clase"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.courseId, item.moduleId, item.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                    title="Eliminar clase"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingClass ? 'Editar Clase Académica' : 'Nueva Clase Académica'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              {!editingClass && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Curso Académico</label>
                    <select
                      value={formCourseId}
                      onChange={(e) => {
                        const cId = e.target.value;
                        setFormCourseId(cId);
                        const c = courses.find(item => item.id === cId);
                        if (c?.modules?.[0]) {
                          setFormModuleId(c.modules[0].id);
                        }
                      }}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Módulo Temático</label>
                    <select
                      value={formModuleId}
                      onChange={(e) => setFormModuleId(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                    >
                      {courses.find(c => c.id === formCourseId)?.modules?.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Título de la Sesión</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ej: Análisis de la Invención a 2 voces y digitación Hanon"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Descripción y Objetivos</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Desarrollo de articulación digital..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Profesor Asignado</label>
                  <input
                    type="text"
                    value={formData.teacher}
                    onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Modalidad</label>
                  <select
                    value={formData.modality}
                    onChange={(e) => setFormData({...formData, modality: e.target.value as any})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  >
                    <option value="virtual_en_vivo">Virtual en Vivo</option>
                    <option value="grabada">Grabada</option>
                    <option value="presencial">Presencial</option>
                    <option value="hibrida">Híbrida</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Fecha y Hora</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    placeholder="2026-09-15 18:00"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Duración</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="60 min"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Google Workspace & Evaluation */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
                <span className="font-bold text-stone-800 text-[11px] block">
                  Google Workspace & Evaluación
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-500 text-[10px] mb-0.5">Google Meet Code</label>
                    <input
                      type="text"
                      value={formData.meetCode}
                      onChange={(e) => setFormData({...formData, meetCode: e.target.value})}
                      placeholder="jud-bach-piano"
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-[10px] mb-0.5">Google Drive Folder ID</label>
                    <input
                      type="text"
                      value={formData.driveFolderId}
                      onChange={(e) => setFormData({...formData, driveFolderId: e.target.value})}
                      placeholder="drive-piano-partituras"
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-stone-500 text-[10px] mb-0.5">Pregunta de Evaluación Interactiva</label>
                  <input
                    type="text"
                    value={formData.evaluationQuestion}
                    onChange={(e) => setFormData({...formData, evaluationQuestion: e.target.value})}
                    placeholder="Ej: ¿Qué dedo inicia el paso del pulgar en la escala de Do Mayor?"
                    className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs"
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
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingClass ? 'Guardar Cambios' : 'Crear Clase'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
