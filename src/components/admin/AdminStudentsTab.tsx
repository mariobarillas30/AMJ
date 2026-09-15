import React, { useState } from 'react';
import { AdminStudent, INITIAL_ADMIN_STUDENTS } from '../../data/adminManagementData';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  UserX, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  X,
  Music,
  Clock,
  BookOpen
} from 'lucide-react';

interface AdminStudentsTabProps {
  onQuickEnroll?: (studentId: string, studentName: string) => void;
}

export const AdminStudentsTab: React.FC<AdminStudentsTabProps> = ({ onQuickEnroll }) => {
  const [students, setStudents] = useState<AdminStudent[]>(() => {
    const saved = localStorage.getItem('jud_admin_students');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_ADMIN_STUDENTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<AdminStudent | null>(null);

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    primaryInstrument: 'Piano',
    status: 'active' as AdminStudent['status'],
    phone: '+502 4444-0000',
    notes: 'Alumno matriculado regular.'
  });

  const saveStudents = (list: AdminStudent[]) => {
    setStudents(list);
    localStorage.setItem('jud_admin_students', JSON.stringify(list));
  };

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setFormData({
      displayName: '',
      email: '',
      primaryInstrument: 'Piano',
      status: 'active',
      phone: '+502 4444-0000',
      notes: 'Matrícula inicial ciclo 2026.'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: AdminStudent) => {
    setEditingStudent(s);
    setFormData({
      displayName: s.displayName,
      email: s.email,
      primaryInstrument: s.primaryInstrument,
      status: s.status,
      phone: s.phone,
      notes: s.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim()) return;

    if (editingStudent) {
      const updated = students.map(s => s.uid === editingStudent.uid ? {
        ...s,
        ...formData
      } : s);
      saveStudents(updated);
    } else {
      const newStudent: AdminStudent = {
        uid: `student-${Date.now()}`,
        displayName: formData.displayName,
        email: formData.email,
        primaryInstrument: formData.primaryInstrument,
        status: formData.status,
        enrolledCoursesCount: 1,
        attendanceRate: 100,
        joinedAt: new Date().toISOString().split('T')[0],
        phone: formData.phone,
        notes: formData.notes
      };
      saveStudents([...students, newStudent]);
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (uid: string) => {
    const updated = students.map(s => {
      if (s.uid === uid) {
        const nextStatus = s.status === 'active' ? 'suspended' : 'active';
        return { ...s, status: nextStatus as any };
      }
      return s;
    });
    saveStudents(updated);
  };

  const handleDelete = (uid: string) => {
    if (confirm('¿Eliminar registro del estudiante de la base de datos?')) {
      saveStudents(students.filter(s => s.uid !== uid));
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.primaryInstrument.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Registro General de Estudiantes
          </h3>
          <p className="text-xs text-stone-500">
            Padrón estudiantil, estado de matrícula, rendimiento de asistencia e instrumento.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Alumno</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o instrumento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-stone-500" />
          <span className="text-xs text-stone-600 font-medium">Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="pending">Pendiente</option>
            <option value="suspended">Suspendido</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Alumno</th>
                <th className="py-3 px-4">Instrumento</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Cursos Activos</th>
                <th className="py-3 px-4">Asistencia</th>
                <th className="py-3 px-4">Ingreso</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredStudents.map((student) => (
                <tr key={student.uid} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-800 font-bold flex items-center justify-center text-xs border border-stone-200">
                        {student.displayName.charAt(0)}
                      </div>
                      <div>
                        <strong className="text-stone-900 block font-semibold">{student.displayName}</strong>
                        <span className="text-[11px] text-stone-400 font-mono">{student.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-medium text-stone-800">
                      <Music className="w-3.5 h-3.5 text-amber-600" />
                      <span>{student.primaryInstrument}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      student.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : student.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        student.status === 'active' ? 'bg-emerald-500' : student.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                      }`}></span>
                      <span className="capitalize">{student.status === 'active' ? 'Activo' : student.status === 'pending' ? 'Pendiente' : 'Suspendido'}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-stone-900">{student.enrolledCoursesCount} cursos</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${student.attendanceRate > 85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${student.attendanceRate}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-[11px] font-semibold">{student.attendanceRate}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500">
                    {student.joinedAt}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onQuickEnroll && (
                        <button
                          onClick={() => onQuickEnroll(student.uid, student.displayName)}
                          className="px-2.5 py-1 text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold rounded-lg border border-amber-200 transition-colors"
                          title="Matricular alumno en curso"
                        >
                          Matricular
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStatus(student.uid)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          student.status === 'active' 
                            ? 'text-amber-600 hover:bg-amber-50' 
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={student.status === 'active' ? 'Suspender alumno' : 'Activar alumno'}
                      >
                        {student.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(student)}
                        className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Editar alumno"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.uid)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar alumno"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingStudent ? 'Editar Registro de Estudiante' : 'Registrar Nuevo Estudiante'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  placeholder="Ej: Sofía Gómez"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="sofia.gomez@example.com"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Instrumento Principal</label>
                  <select
                    value={formData.primaryInstrument}
                    onChange={(e) => setFormData({...formData, primaryInstrument: e.target.value})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Piano">Piano</option>
                    <option value="Canto">Canto</option>
                    <option value="Guitarra">Guitarra</option>
                    <option value="Violín">Violín</option>
                    <option value="Batería">Batería</option>
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
                    <option value="pending">Pendiente</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+502 4444-0000"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Notas de Expediente</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Observaciones de ingreso, nivel previo, etc."
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
                  {editingStudent ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
