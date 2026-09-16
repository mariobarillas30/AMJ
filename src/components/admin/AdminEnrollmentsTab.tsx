import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  StudentEnrollment, 
  EnrollmentStatus, 
  AccessType, 
  PaymentMethod, 
  EnrollmentModality,
  evaluateEnrollmentAccess,
  AcademicCourse
} from '../../types';
import { INITIAL_ADMIN_ENROLLMENTS, INITIAL_ADMIN_STUDENTS } from '../../data/adminManagementData';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  XCircle, 
  Edit3, 
  Trash2, 
  X,
  User,
  BookOpen,
  Calendar,
  Lock,
  CreditCard,
  Video,
  FolderOpen,
  Award,
  Film,
  RefreshCw,
  Ban,
  Check
} from 'lucide-react';

interface AdminEnrollmentsTabProps {
  preselectedStudentId?: string;
}

export const AdminEnrollmentsTab: React.FC<AdminEnrollmentsTabProps> = ({ preselectedStudentId }) => {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState<boolean>(true);

  const [students] = useState(() => {
    return INITIAL_ADMIN_STUDENTS;
  });

  const [courses, setCourses] = useState<AcademicCourse[]>([]);

  // Real-time Firestore onSnapshot for enrollments collection
  useEffect(() => {
    setLoadingEnrollments(true);
    const path = 'enrollments';
    const col = collection(db, path);
    const unsubscribe = onSnapshot(
      col,
      async (snapshot) => {
        if (!snapshot.empty) {
          const list: StudentEnrollment[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              studentId: data.studentId || '',
              studentName: data.studentName || '',
              studentEmail: data.studentEmail || '',
              courseId: data.courseId || '',
              courseTitle: data.courseTitle || '',
              startDate: data.startDate || '',
              expiresAt: data.expiresAt || '',
              status: data.status || 'active',
              modality: data.modality || 'hybrid',
              accessType: data.accessType || 'full_access',
              paymentMethod: data.paymentMethod || 'stripe',
              enrolledAt: data.enrolledAt || new Date().toISOString(),
              validUntil: data.validUntil || (data.expiresAt ? `${data.expiresAt}T23:59:59Z` : undefined),
              approvedBy: data.approvedBy,
              paymentId: data.paymentId,
              lastValidatedAt: data.lastValidatedAt,
              notes: data.notes
            } as StudentEnrollment);
          });
          // Sort most recent first
          list.sort((a, b) => new Date(b.enrolledAt || 0).getTime() - new Date(a.enrolledAt || 0).getTime());
          setEnrollments(list);
          setLoadingEnrollments(false);
        } else {
          // If Firestore collection is empty, initialize with default seed enrollments
          try {
            for (const enr of INITIAL_ADMIN_ENROLLMENTS) {
              await setDoc(doc(db, 'enrollments', enr.id), enr);
            }
          } catch (seedErr) {
            console.warn('Fallback seeding enrollments:', seedErr);
            setEnrollments(INITIAL_ADMIN_ENROLLMENTS);
            setLoadingEnrollments(false);
          }
        }
      },
      (error) => {
        setLoadingEnrollments(false);
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [accessFilter, setAccessFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnrollmentId, setEditingEnrollmentId] = useState<string | null>(null);

  // Verification Inspector Modal
  const [inspectEnrollment, setInspectEnrollment] = useState<StudentEnrollment | null>(null);

  // Form State with FASE 10 Required Fields
  const [formData, setFormData] = useState<{
    studentId: string;
    courseId: string;
    startDate: string;
    expiresAt: string;
    status: EnrollmentStatus;
    modality: EnrollmentModality;
    accessType: AccessType;
    paymentMethod: PaymentMethod;
    notes: string;
  }>({
    studentId: preselectedStudentId || students[0]?.uid || 'student-mario',
    courseId: courses[0]?.id || 'course-piano',
    startDate: new Date().toISOString().split('T')[0],
    expiresAt: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    status: 'active',
    modality: 'hybrid',
    accessType: 'full_access',
    paymentMethod: 'stripe',
    notes: ''
  });

  const getStudent = (uid: string) => {
    return students.find(s => s.uid === uid);
  };

  const getCourse = (courseId: string) => {
    return courses.find(c => c.id === courseId);
  };

  const handleOpenCreate = () => {
    setEditingEnrollmentId(null);
    setFormData({
      studentId: preselectedStudentId || students[0]?.uid || 'student-mario',
      courseId: courses[0]?.id || 'course-piano',
      startDate: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      status: 'active',
      modality: 'hybrid',
      accessType: 'full_access',
      paymentMethod: 'stripe',
      notes: 'Matrícula institucional creada por dirección.'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (enr: StudentEnrollment) => {
    setEditingEnrollmentId(enr.id);
    setFormData({
      studentId: enr.studentId,
      courseId: enr.courseId,
      startDate: enr.startDate || enr.enrolledAt.split('T')[0],
      expiresAt: enr.expiresAt || (enr.validUntil ? enr.validUntil.split('T')[0] : '2026-12-31'),
      status: enr.status,
      modality: enr.modality || 'hybrid',
      accessType: enr.accessType || 'full_access',
      paymentMethod: enr.paymentMethod || 'stripe',
      notes: enr.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: EnrollmentStatus) => {
    try {
      await updateDoc(doc(db, 'enrollments', id), {
        status: newStatus,
        approvedBy: newStatus === 'active' 
          ? 'Administración (Reactivada)' 
          : `Administración (Cambio a ${newStatus})`,
        lastValidatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `enrollments/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar definitivamente este registro de matrícula en Firestore?')) {
      try {
        await deleteDoc(doc(db, 'enrollments', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `enrollments/${id}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = getStudent(formData.studentId);
    const course = getCourse(formData.courseId);

    if (editingEnrollmentId) {
      const updatedFields = {
        studentId: formData.studentId,
        studentName: student?.displayName || 'Estudiante',
        studentEmail: student?.email || '',
        courseId: formData.courseId,
        courseTitle: course?.title || 'Curso Académico',
        startDate: formData.startDate,
        expiresAt: formData.expiresAt,
        validUntil: `${formData.expiresAt}T23:59:59Z`,
        status: formData.status,
        modality: formData.modality,
        accessType: formData.accessType,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        lastValidatedAt: new Date().toISOString()
      };

      try {
        await updateDoc(doc(db, 'enrollments', editingEnrollmentId), updatedFields);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `enrollments/${editingEnrollmentId}`);
      }
    } else {
      const newEnrollment: StudentEnrollment = {
        id: `enr-${Date.now()}`,
        studentId: formData.studentId,
        studentName: student?.displayName || 'Estudiante',
        studentEmail: student?.email || '',
        courseId: formData.courseId,
        courseTitle: course?.title || 'Curso Académico',
        startDate: formData.startDate,
        expiresAt: formData.expiresAt,
        validUntil: `${formData.expiresAt}T23:59:59Z`,
        status: formData.status,
        modality: formData.modality,
        accessType: formData.accessType,
        paymentMethod: formData.paymentMethod,
        enrolledAt: new Date().toISOString(),
        approvedBy: 'Secretaría Académica (Manual)',
        notes: formData.notes
      };

      try {
        await setDoc(doc(db, 'enrollments', newEnrollment.id), newEnrollment);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `enrollments/${newEnrollment.id}`);
      }
    }
    setIsModalOpen(false);
  };

  // Filter list
  const filteredEnrollments = enrollments.filter(item => {
    const sName = (item.studentName || getStudent(item.studentId)?.displayName || '').toLowerCase();
    const cTitle = (item.courseTitle || getCourse(item.courseId)?.title || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = sName.includes(query) || cTitle.includes(query) || item.id.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesModality = modalityFilter === 'all' || item.modality === modalityFilter;
    const matchesAccess = accessFilter === 'all' || item.accessType === accessFilter;
    return matchesSearch && matchesStatus && matchesModality && matchesAccess;
  });

  const getStatusBadge = (status: EnrollmentStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Activa (Autorizada)</span>
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-800 border border-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            <span>Vencida (Bloqueada)</span>
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            <span>Suspendida (Mora)</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-300">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-500"></span>
            <span>Cancelada</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-300">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            <span>Pendiente de Pago</span>
          </span>
        );
    }
  };

  const getModalityLabel = (m?: EnrollmentModality) => {
    switch (m) {
      case 'live_virtual': return 'Virtual en Vivo';
      case 'presential': return 'Presencial';
      case 'hybrid': return 'Híbrida';
      case 'online_recorded': return 'Online Asincrónica';
      default: return 'Estándar';
    }
  };

  const getAccessTypeLabel = (a?: AccessType) => {
    switch (a) {
      case 'full_access': return 'Acceso Total';
      case 'materials_only': return 'Solo Materiales';
      case 'live_sessions': return 'Solo Sesiones en Vivo';
      case 'restricted': return 'Restringido';
      default: return 'Completo';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sovereign Notice Banner FASE 10 */}
      <div className="bg-stone-900 text-white border border-stone-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                CONTROL DE MATRÍCULAS
              </span>
              <span className="text-xs text-stone-400 font-serif italic">
                Regla de Acceso Institucional
              </span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              La Matrícula Determina el Acceso Académico
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
              El estado de la matrícula gobierna el acceso en tiempo real a: <strong>clases, Google Meet, material didáctico, Google Classroom y videos</strong>. Un alumno con matrícula <em>vencida, suspendida o cancelada</em> NO recibe acceso a contenido restringido, aunque conserve un antiguo enlace de Google.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shrink-0 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Matrícula</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Registradas', count: enrollments.length, color: 'text-stone-900 bg-white border-stone-200' },
          { label: 'Activas (Vigentes)', count: enrollments.filter(e => e.status === 'active').length, color: 'text-emerald-800 bg-emerald-50/70 border-emerald-200' },
          { label: 'Vencidas (Bloqueadas)', count: enrollments.filter(e => e.status === 'expired').length, color: 'text-red-800 bg-red-50/70 border-red-200' },
          { label: 'Suspendidas (Mora)', count: enrollments.filter(e => e.status === 'suspended').length, color: 'text-amber-800 bg-amber-50/70 border-amber-200' },
          { label: 'Pendientes (Pago)', count: enrollments.filter(e => e.status === 'pending').length, color: 'text-sky-800 bg-sky-50/70 border-sky-200' }
        ].map((stat, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border shadow-2xs space-y-1 ${stat.color}`}>
            <span className="text-[11px] font-medium opacity-80 block">{stat.label}</span>
            <span className="text-2xl font-bold font-mono">{stat.count}</span>
          </div>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por alumno, curso o ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Estado */}
            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1 text-xs">
              <Filter className="w-3 h-3 text-stone-400" />
              <span className="text-stone-500 text-[11px]">Estado:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-semibold text-stone-800 focus:outline-none text-xs"
              >
                <option value="all">Todos</option>
                <option value="active">Activas</option>
                <option value="expired">Vencidas</option>
                <option value="suspended">Suspendidas</option>
                <option value="cancelled">Canceladas</option>
                <option value="pending">Pendientes</option>
              </select>
            </div>

            {/* Modalidad */}
            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1 text-xs">
              <span className="text-stone-500 text-[11px]">Modalidad:</span>
              <select
                value={modalityFilter}
                onChange={(e) => setModalityFilter(e.target.value)}
                className="bg-transparent font-semibold text-stone-800 focus:outline-none text-xs"
              >
                <option value="all">Todas</option>
                <option value="hybrid">Híbrida</option>
                <option value="live_virtual">Virtual en Vivo</option>
                <option value="presential">Presencial</option>
                <option value="online_recorded">Asincrónica</option>
              </select>
            </div>

            {/* Tipo de Acceso */}
            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1 text-xs">
              <span className="text-stone-500 text-[11px]">Acceso:</span>
              <select
                value={accessFilter}
                onChange={(e) => setAccessFilter(e.target.value)}
                className="bg-transparent font-semibold text-stone-800 focus:outline-none text-xs"
              >
                <option value="all">Todos</option>
                <option value="full_access">Acceso Total</option>
                <option value="materials_only">Solo Materiales</option>
                <option value="live_sessions">Solo Sesiones</option>
                <option value="restricted">Restringido</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollments Table with All 8 Required Fields */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-600 uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-bold">1. Alumno</th>
                <th className="py-3.5 px-4 font-bold">2. Curso</th>
                <th className="py-3.5 px-4 font-bold">3 & 4. Inicio / Vencimiento</th>
                <th className="py-3.5 px-4 font-bold">5. Estado</th>
                <th className="py-3.5 px-4 font-bold">6. Modalidad</th>
                <th className="py-3.5 px-4 font-bold">7. Tipo de Acceso</th>
                <th className="py-3.5 px-4 font-bold">8. Método Pago</th>
                <th className="py-3.5 px-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredEnrollments.map((enr) => {
                const s = getStudent(enr.studentId);
                const c = getCourse(enr.courseId);
                const sName = enr.studentName || s?.displayName || enr.studentId;
                const sEmail = enr.studentEmail || s?.email || '';
                const cTitle = enr.courseTitle || c?.title || enr.courseId;

                const accessEval = evaluateEnrollmentAccess(enr);

                return (
                  <tr key={enr.id} className="hover:bg-stone-50/60 transition-colors">
                    
                    {/* 1. Alumno */}
                    <td className="py-3.5 px-4">
                      <div>
                        <strong className="text-stone-900 block font-semibold text-xs">{sName}</strong>
                        <span className="text-[11px] text-stone-400 font-mono">{sEmail || enr.studentId}</span>
                      </div>
                    </td>

                    {/* 2. Curso */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <span className="font-semibold text-stone-800 line-clamp-1" title={cTitle}>
                        {cTitle}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">ID: {enr.id}</span>
                    </td>

                    {/* 3 & 4. Fecha Inicio y Vencimiento */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono text-[11px] space-y-0.5">
                        <div className="text-stone-500">
                          <span className="text-stone-400">Inicio:</span> {enr.startDate || enr.enrolledAt.split('T')[0]}
                        </div>
                        <div className={accessEval.isExpired || enr.status === 'expired' ? 'text-red-700 font-bold' : 'text-stone-800 font-medium'}>
                          <span className="text-stone-400">Vence:</span> {enr.expiresAt || (enr.validUntil ? enr.validUntil.split('T')[0] : 'Indefinido')}
                        </div>
                      </div>
                    </td>

                    {/* 5. Estado */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(enr.status)}
                    </td>

                    {/* 6. Modalidad */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md font-medium text-[11px]">
                        {getModalityLabel(enr.modality)}
                      </span>
                    </td>

                    {/* 7. Tipo de Acceso */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="font-semibold text-stone-800 text-[11px] block">
                          {getAccessTypeLabel(enr.accessType)}
                        </span>
                        
                        {/* Resource Icons Indicators */}
                        <div className="flex items-center gap-1 text-stone-400">
                          <span title="Clases" className={accessEval.allowedResources.classes ? 'text-emerald-600 font-bold' : 'text-stone-300 line-through'}>
                            Clase
                          </span>
                          <span>•</span>
                          <span title="Meet" className={accessEval.allowedResources.meet ? 'text-emerald-600 font-bold' : 'text-stone-300 line-through'}>
                            Meet
                          </span>
                          <span>•</span>
                          <span title="Drive" className={accessEval.allowedResources.materials ? 'text-emerald-600 font-bold' : 'text-stone-300 line-through'}>
                            Drive
                          </span>
                          <span>•</span>
                          <span title="Videos" className={accessEval.allowedResources.videos ? 'text-emerald-600 font-bold' : 'text-stone-300 line-through'}>
                            Video
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 8. Método de Pago */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-stone-50 border border-stone-200 rounded-md text-stone-700 text-[11px] font-mono capitalize">
                        <CreditCard className="w-3 h-3 text-stone-400" />
                        <span>{enr.paymentMethod || 'stripe'}</span>
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Quick Inspector */}
                        <button
                          onClick={() => setInspectEnrollment(enr)}
                          className="px-2.5 py-1 text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-lg transition-colors flex items-center gap-1"
                          title="Auditar permisos y acceso a recursos Google"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
                          <span>Auditar</span>
                        </button>

                        {/* Status toggles */}
                        {enr.status === 'expired' && (
                          <button
                            onClick={() => handleStatusChange(enr.id, 'active')}
                            className="px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-2xs"
                            title="Renovar matrícula y restaurar acceso"
                          >
                            Reactivar
                          </button>
                        )}

                        {enr.status === 'active' && (
                          <button
                            onClick={() => handleStatusChange(enr.id, 'expired')}
                            className="px-2 py-1 text-[11px] bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors"
                            title="Marcar como vencida para verificar restricción de acceso"
                          >
                            Expirar
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEdit(enr)}
                          className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Editar todos los campos"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(enr.id)}
                          className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar matrícula"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auditor / Inspector Modal */}
      {inspectEnrollment && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Diagnóstico de Acceso por Matrícula
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">
                  Verificación de Recursos Institucionales
                </h3>
              </div>
              <button 
                onClick={() => setInspectEnrollment(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const evalRes = evaluateEnrollmentAccess(inspectEnrollment);
              return (
                <div className="space-y-4 text-xs">
                  {/* Verdict Card */}
                  <div className={`p-4 rounded-2xl border ${
                    evalRes.hasAccess 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                      : 'bg-red-50 border-red-300 text-red-950'
                  }`}>
                    <div className="flex items-start gap-3">
                      {evalRes.hasAccess ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Ban className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong className="text-sm font-bold block">
                          {evalRes.hasAccess ? 'ACCESO INSTITUCIONAL CONCEDIDO' : 'ACCESO BLOQUEADO / DENEGADO'}
                        </strong>
                        <p className="text-xs mt-1 leading-relaxed">
                          {evalRes.reason}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Resource-by-Resource Breakdown */}
                  <div className="space-y-2">
                    <h4 className="font-bold uppercase tracking-wider text-[11px] text-stone-400">
                      Estado de Acceso por Recurso Satélite
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { title: 'Clases Pedagógicas', icon: <BookOpen className="w-4 h-4" />, allowed: evalRes.allowedResources.classes },
                        { title: 'Google Meet en Vivo', icon: <Video className="w-4 h-4" />, allowed: evalRes.allowedResources.meet },
                        { title: 'Material & Drive', icon: <FolderOpen className="w-4 h-4" />, allowed: evalRes.allowedResources.materials },
                        { title: 'Google Classroom', icon: <Award className="w-4 h-4" />, allowed: evalRes.allowedResources.classroom },
                        { title: 'Videos Grabados', icon: <Film className="w-4 h-4" />, allowed: evalRes.allowedResources.videos },
                      ].map((item, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-xl border flex items-center justify-between ${
                            item.allowed ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-stone-50 border-stone-200 text-stone-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {item.icon}
                            <span className="font-medium text-xs">{item.title}</span>
                          </div>
                          {item.allowed ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                              Habilitado
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                              Bloqueado
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-stone-600 text-[11px] leading-relaxed">
                    <strong>Control de Acceso Institucional:</strong> Los enlaces dinámicos de la academia no se generarán y los servicios de la plataforma denegarán el acceso si la matrícula no está en estado activo vigente.
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectEnrollment(null)}
                className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
              >
                Cerrar Diagnóstico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal with all 8 FASE 10 Fields */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                {editingEnrollmentId ? 'Editar Matrícula Académica' : 'Nueva Matrícula de Alumno'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              
              {/* 1. Alumno */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  1. Alumno
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                >
                  {students.map(s => (
                    <option key={s.uid} value={s.uid}>
                      {s.displayName} ({s.email || s.primaryInstrument})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Curso */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  2. Curso
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.teacherName})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3 & 4. Fechas de Inicio y Vencimiento */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    3. Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    4. Vencimiento
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* 5. Estado */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  5. Estado de la Matrícula
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as EnrollmentStatus})}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none font-semibold"
                >
                  <option value="active">active — Matrícula activa con acceso total autorizado</option>
                  <option value="expired">expired — Matrícula vencida (acceso revocado)</option>
                  <option value="suspended">suspended — Matrícula suspendida temporalmente</option>
                  <option value="cancelled">cancelled — Matrícula cancelada definitivamente</option>
                  <option value="pending">pending — Matrícula pendiente de validación de pago</option>
                </select>
              </div>

              {/* 6. Modalidad */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    6. Modalidad
                  </label>
                  <select
                    value={formData.modality}
                    onChange={(e) => setFormData({...formData, modality: e.target.value as EnrollmentModality})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  >
                    <option value="hybrid">Híbrida (Virtual + Presencial)</option>
                    <option value="live_virtual">Virtual en Vivo</option>
                    <option value="presential">Presencial</option>
                    <option value="online_recorded">Online Asincrónica</option>
                  </select>
                </div>

                {/* 7. Tipo de Acceso */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    7. Tipo de Acceso
                  </label>
                  <select
                    value={formData.accessType}
                    onChange={(e) => setFormData({...formData, accessType: e.target.value as AccessType})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  >
                    <option value="full_access">Acceso Total</option>
                    <option value="materials_only">Solo Materiales</option>
                    <option value="live_sessions">Solo Sesiones en Vivo</option>
                    <option value="restricted">Restringido</option>
                  </select>
                </div>
              </div>

              {/* 8. Método de Pago */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  8. Método de Pago
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                >
                  <option value="stripe">Stripe (Pasarela en Línea)</option>
                  <option value="tarjeta">Tarjeta de Crédito / Débito</option>
                  <option value="transferencia">Transferencia Bancaria / Depósito</option>
                  <option value="efectivo">Efectivo en Sede</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Notas de Matrícula (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Beca parcial, plan anual, ciclo intensivo..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[11px] text-stone-700 leading-relaxed">
                <strong>Políticas de Acceso:</strong> La matrícula determina el acceso a clases, Google Meet, material didáctico, Google Classroom y videos.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all shadow-sm"
                >
                  {editingEnrollmentId ? 'Guardar Cambios' : 'Registrar Matrícula'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
