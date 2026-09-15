import React, { useState } from 'react';
import { AdminTeacher, INITIAL_ADMIN_TEACHERS } from '../../data/adminManagementData';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Clock, 
  Award, 
  BookOpen, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  Music,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const AdminTeachersTab: React.FC = () => {
  const [teachers, setTeachers] = useState<AdminTeacher[]>(() => {
    const saved = localStorage.getItem('jud_admin_teachers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_ADMIN_TEACHERS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<AdminTeacher | null>(null);

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    instrument: 'Piano',
    specialties: 'Piano Clásico, Solfeo, Armonía',
    status: 'active' as AdminTeacher['status'],
    weeklyHours: 12,
    phone: '+502 5555-0000',
    assignedCoursesCount: 1
  });

  const saveTeachers = (list: AdminTeacher[]) => {
    setTeachers(list);
    localStorage.setItem('jud_admin_teachers', JSON.stringify(list));
  };

  const handleOpenCreate = () => {
    setEditingTeacher(null);
    setFormData({
      displayName: '',
      email: '',
      instrument: 'Piano',
      specialties: 'Técnica instrumental, Lectura de partituras',
      status: 'active',
      weeklyHours: 10,
      phone: '+502 5555-0000',
      assignedCoursesCount: 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: AdminTeacher) => {
    setEditingTeacher(t);
    setFormData({
      displayName: t.displayName,
      email: t.email,
      instrument: t.instrument,
      specialties: t.specialties.join(', '),
      status: t.status,
      weeklyHours: t.weeklyHours,
      phone: t.phone,
      assignedCoursesCount: t.assignedCoursesCount
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim()) return;

    const specs = formData.specialties.split(',').map(s => s.trim()).filter(Boolean);

    if (editingTeacher) {
      const updated = teachers.map(t => t.uid === editingTeacher.uid ? {
        ...t,
        ...formData,
        specialties: specs
      } : t);
      saveTeachers(updated);
    } else {
      const newTeacher: AdminTeacher = {
        uid: `teacher-${Date.now()}`,
        displayName: formData.displayName,
        email: formData.email,
        instrument: formData.instrument,
        specialties: specs,
        status: formData.status,
        weeklyHours: Number(formData.weeklyHours),
        phone: formData.phone,
        assignedCoursesCount: Number(formData.assignedCoursesCount),
        hireDate: new Date().toISOString().split('T')[0]
      };
      saveTeachers([...teachers, newTeacher]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (uid: string) => {
    if (confirm('¿Eliminar este profesor del cuerpo docente?')) {
      saveTeachers(teachers.filter(t => t.uid !== uid));
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.instrument.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Claustro de Profesores & Especialistas
          </h3>
          <p className="text-xs text-stone-500">
            Control de docentes titulares, especialidades pedagógicas, carga horaria y contacto.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Profesor</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 flex items-center gap-3 shadow-2xs">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Buscar profesor por nombre, instrumento o correo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-none"
        />
      </div>

      {/* Teachers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.map((teacher) => (
          <div 
            key={teacher.uid}
            className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-all space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 font-serif font-bold text-base flex items-center justify-center border border-emerald-200 shadow-2xs">
                    {teacher.displayName.split(' ').map(n => n[0]).slice(-2).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{teacher.displayName}</h4>
                    <span className="text-[11px] text-amber-800 font-semibold">{teacher.instrument}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  teacher.status === 'active' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {teacher.status === 'active' ? 'Activo' : 'En Licencia'}
                </span>
              </div>

              {/* Specialties */}
              <div className="space-y-1 mt-3">
                <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">
                  Especialidades Académicas
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {teacher.specialties.map((spec, idx) => (
                    <span 
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Meta Info */}
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                <div className="flex items-center gap-2 text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{teacher.phone}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Carga semanal:</span>
                  </span>
                  <strong className="text-stone-800">{teacher.weeklyHours} hrs/sem</strong>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                    <span>Cursos asignados:</span>
                  </span>
                  <strong className="text-stone-800">{teacher.assignedCoursesCount}</strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(teacher)}
                className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                title="Editar profesor"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(teacher.uid)}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar profesor"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingTeacher ? 'Editar Información Docente' : 'Registrar Nuevo Docente'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nombre Completo y Título</label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  placeholder="Ej: Prof. Roberto Morales"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Correo Institucional</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="roberto.morales@judamusic.edu"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Instrumento Principal</label>
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
                    <option value="Teoría">Teoría</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  >
                    <option value="active">Activo</option>
                    <option value="leave">En Licencia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Especialidades (separadas por coma)</label>
                <input
                  type="text"
                  value={formData.specialties}
                  onChange={(e) => setFormData({...formData, specialties: e.target.value})}
                  placeholder="Piano Clásico, Solfeo, Improvisación"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Horas Semanales</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.weeklyHours}
                    onChange={(e) => setFormData({...formData, weeklyHours: Number(e.target.value)})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
                  {editingTeacher ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
