import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { AcademicCourse, AdminMaterialItem } from '../../types';
import { INITIAL_ADMIN_MATERIALS } from '../../data/adminManagementData';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Music, 
  Headphones, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  X, 
  Lock, 
  Globe,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

export const AdminMaterialsTab: React.FC = () => {
  const [materials, setMaterials] = useState<AdminMaterialItem[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  const [courses, setCourses] = useState<AcademicCourse[]>([]);

  // Real-time Firestore onSnapshot for materials collection
  useEffect(() => {
    setLoadingMaterials(true);
    const path = 'materials';
    const col = collection(db, path);
    const unsubscribe = onSnapshot(
      col,
      async (snapshot) => {
        if (!snapshot.empty) {
          const list: AdminMaterialItem[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              title: data.title || '',
              courseId: data.courseId || '',
              courseTitle: data.courseTitle || '',
              instrument: data.instrument || 'Piano',
              type: data.type || 'sheet_music',
              level: data.level || 'Intermedio',
              driveFolderId: data.driveFolderId || '',
              driveUrl: data.driveUrl || '',
              size: data.size || '1.0 MB',
              uploadedAt: data.uploadedAt || new Date().toISOString().split('T')[0],
              isPublic: Boolean(data.isPublic)
            } as AdminMaterialItem);
          });
          setMaterials(list);
          setLoadingMaterials(false);
        } else {
          // Initialize empty collection with default institutional sheet music and materials
          try {
            for (const mat of INITIAL_ADMIN_MATERIALS) {
              await setDoc(doc(db, 'materials', mat.id), mat);
            }
          } catch (seedErr) {
            console.warn('Fallback seeding materials:', seedErr);
            setMaterials(INITIAL_ADMIN_MATERIALS);
            setLoadingMaterials(false);
          }
        }
      },
      (error) => {
        setLoadingMaterials(false);
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

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [instrumentFilter, setInstrumentFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<AdminMaterialItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    courseId: courses[0]?.id || 'course-piano',
    instrument: 'Piano',
    type: 'sheet_music' as AdminMaterialItem['type'],
    level: 'Intermedio' as AdminMaterialItem['level'],
    driveFolderId: 'drive-folder-piano-scores',
    driveUrl: 'https://drive.google.com/drive/folders/partituras-jud',
    size: '5.2 MB',
    isPublic: false
  });

  const handleOpenCreate = () => {
    setEditingMaterial(null);
    setFormData({
      title: '',
      courseId: courses[0]?.id || 'course-piano',
      instrument: 'Piano',
      type: 'sheet_music',
      level: 'Intermedio',
      driveFolderId: 'drive-folder-piano-scores',
      driveUrl: 'https://drive.google.com/drive/folders/partituras-jud',
      size: '5.2 MB',
      isPublic: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: AdminMaterialItem) => {
    setEditingMaterial(m);
    setFormData({
      title: m.title,
      courseId: m.courseId,
      instrument: m.instrument,
      type: m.type,
      level: m.level,
      driveFolderId: m.driveFolderId,
      driveUrl: m.driveUrl,
      size: m.size,
      isPublic: m.isPublic
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const course = courses.find(c => c.id === formData.courseId);
    const courseTitle = course ? course.title : 'Curso General';

    if (editingMaterial) {
      const updatedFields = {
        ...formData,
        courseTitle
      };
      try {
        await updateDoc(doc(db, 'materials', editingMaterial.id), updatedFields);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `materials/${editingMaterial.id}`);
      }
    } else {
      const newMaterial: AdminMaterialItem = {
        id: `mat-${Date.now()}`,
        ...formData,
        courseTitle,
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      try {
        await setDoc(doc(db, 'materials', newMaterial.id), newMaterial);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `materials/${newMaterial.id}`);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar material del repositorio en Firestore?')) {
      try {
        await deleteDoc(doc(db, 'materials', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `materials/${id}`);
      }
    }
  };

  const getTypeBadge = (type: AdminMaterialItem['type']) => {
    switch (type) {
      case 'sheet_music': return { label: 'Partitura Urtext', icon: <Music className="w-3.5 h-3.5 text-amber-600" />, color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'pdf_guide': return { label: 'Guía PDF', icon: <FileText className="w-3.5 h-3.5 text-sky-600" />, color: 'bg-sky-50 text-sky-800 border-sky-200' };
      case 'audio_backing': return { label: 'Pista Audio', icon: <Headphones className="w-3.5 h-3.5 text-purple-600" />, color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'exercise': return { label: 'Ejercicio', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.instrument.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    const matchesInstrument = instrumentFilter === 'all' || m.instrument === instrumentFilter;
    return matchesSearch && matchesType && matchesInstrument;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Repositorio Académico & Partituras
          </h3>
          <p className="text-xs text-stone-500">
            Biblioteca de partituras Urtext, guías teóricas y pistas sincronizadas con Google Drive.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Material</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título, compositor o curso..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-medium">Tipo:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500 text-xs"
            >
              <option value="all">Todos los tipos</option>
              <option value="sheet_music">Partituras</option>
              <option value="pdf_guide">Guías PDF</option>
              <option value="audio_backing">Pistas Audio</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-medium">Instrumento:</span>
            <select
              value={instrumentFilter}
              onChange={(e) => setInstrumentFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500 text-xs"
            >
              <option value="all">Todos</option>
              <option value="Piano">Piano</option>
              <option value="Canto">Canto</option>
              <option value="Guitarra">Guitarra</option>
            </select>
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((mat) => {
          const badge = getTypeBadge(mat.type);

          return (
            <div 
              key={mat.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-all space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                    {badge.icon}
                    <span>{badge.label}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                    {mat.level}
                  </span>
                </div>

                <h4 className="font-serif font-bold text-stone-900 text-sm line-clamp-2">
                  {mat.title}
                </h4>
                <p className="text-xs text-amber-800 font-semibold mt-1">
                  {mat.courseTitle}
                </p>

                <div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-stone-500">Google Drive:</span>
                    <span className="font-mono text-[11px] text-stone-800 truncate max-w-[120px]">{mat.driveFolderId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-stone-500">Tamaño archivo:</span>
                    <span className="font-mono text-[11px] text-stone-700">{mat.size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-stone-500">Visibilidad:</span>
                    <span className="flex items-center gap-1 text-[11px] text-stone-700">
                      {mat.isPublic ? <Globe className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-amber-600" />}
                      <span>{mat.isPublic ? 'Público' : 'Solo Alumnos Matriculados'}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <a
                  href={mat.driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir en Drive</span>
                </a>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(mat)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
                    title="Editar material"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(mat.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Eliminar material"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
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
                {editingMaterial ? 'Editar Material Académico' : 'Registrar Nuevo Material'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Título del Recurso / Partitura</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ej: Chopin Nocturno Op. 9 No. 2 (Urtext)"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Curso Vinculado</label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tipo de Recurso</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  >
                    <option value="sheet_music">Partitura Urtext</option>
                    <option value="pdf_guide">Guía Teórica PDF</option>
                    <option value="audio_backing">Pista de Acompañamiento</option>
                    <option value="exercise">Ejercicio Técnico</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nivel Pedagógico</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value as any})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Iniciación">Iniciación</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ID Carpeta Google Drive</label>
                  <input
                    type="text"
                    value={formData.driveFolderId}
                    onChange={(e) => setFormData({...formData, driveFolderId: e.target.value})}
                    placeholder="drive-folder-piano"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tamaño Estimado</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    placeholder="8.5 MB"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Enlace a Google Drive</label>
                <input
                  type="text"
                  value={formData.driveUrl}
                  onChange={(e) => setFormData({...formData, driveUrl: e.target.value})}
                  placeholder="https://drive.google.com/..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
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
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
