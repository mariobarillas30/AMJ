import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, UserRole } from '../../types';
import { 
  Users, 
  Shield, 
  UserCheck, 
  Search, 
  UserPlus, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Sparkles,
  RefreshCw,
  Edit3,
  Trash2,
  X,
  Phone,
  Mail,
  Music,
  Power,
  GraduationCap,
  BookOpen,
  Check,
  ShieldCheck,
  Award,
  ChevronDown
} from 'lucide-react';

export const AdminUsersTab: React.FC = () => {
  const { currentUser, role: currentRole, userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    role: 'student' as UserRole,
    status: 'active' as 'active' | 'pending' | 'suspended',
    instrument: 'Piano',
    phone: '',
    notes: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    setActionError(null);
    try {
      let fetchedList: UserProfile[] = [];

      // 1. Intentar obtención autoritativa mediante API del backend
      try {
        const idToken = await currentUser?.getIdToken();
        if (idToken) {
          const resp = await fetch('/api/admin/users', {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data.success && Array.isArray(data.users)) {
              fetchedList = data.users;
            }
          }
        }
      } catch (backendErr) {
        console.warn('Backend users fetch fallback to client SDK:', backendErr);
      }

      // 2. Fallback o complemento con Cloud Firestore Client SDK
      if (fetchedList.length === 0) {
        const snap = await getDocs(collection(db, 'users')).catch(err => {
          handleFirestoreError(err, OperationType.LIST, 'users');
        });
        if (snap) {
          snap.forEach(docSnap => {
            fetchedList.push(docSnap.data() as UserProfile);
          });
        }
      }

      setUsers(fetchedList);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setActionError('No se pudieron cargar los usuarios. Verifica los permisos de administrador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Quick Role Change
  const handleRoleChange = async (targetUser: UserProfile, newRole: UserRole) => {
    if (targetUser.role === newRole) return;
    
    // Authorization check
    if ((newRole === 'superadmin' || targetUser.role === 'superadmin') && currentRole !== 'superadmin') {
      setActionError('Solo el Superadministrador puede asignar o revocar el rol de Superadministrador.');
      return;
    }

    setUpdatingUid(targetUser.uid);
    setActionSuccess(null);
    setActionError(null);

    try {
      // 1. Actualizar mediante backend API para sincronización total de colecciones autoritativas
      try {
        const idToken = await currentUser?.getIdToken();
        if (idToken) {
          await fetch(`/api/admin/users/${targetUser.uid}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ role: newRole }),
          });
        }
      } catch (apiErr) {
        console.warn('Backend role update fallback to client Firestore:', apiErr);
      }

      const userRef = doc(db, 'users', targetUser.uid);
      const adminRef = doc(db, 'admins', targetUser.uid);
      const teacherRef = doc(db, 'teachers', targetUser.uid);

      // 2. Update user profile en Firestore Client
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });

      // 3. Synchronize authoritative admin collection
      if (newRole === 'superadmin' || newRole === 'admin') {
        await setDoc(adminRef, {
          uid: targetUser.uid,
          email: targetUser.email,
          role: newRole,
          grantedBy: currentUser?.uid || 'admin',
          createdAt: new Date().toISOString(),
        });
      } else {
        await deleteDoc(adminRef).catch(() => {});
      }

      // 4. Synchronize authoritative teacher collection
      if (newRole === 'teacher') {
        await setDoc(teacherRef, {
          uid: targetUser.uid,
          email: targetUser.email,
          specialties: [targetUser.instrument || 'Música'],
          createdAt: new Date().toISOString(),
        });
      } else {
        await deleteDoc(teacherRef).catch(() => {});
      }

      // 5. Record audit log
      try {
        const logId = 'log_' + Date.now();
        await setDoc(doc(db, 'audit_logs', logId), {
          id: logId,
          action: 'ROLE_UPDATE',
          performedBy: currentUser?.uid || 'admin',
          targetUser: targetUser.uid,
          details: `Rol actualizado de "${targetUser.role}" a "${newRole}" para ${targetUser.email}`,
          timestamp: new Date().toISOString(),
        });
      } catch (logErr) {
        console.warn('Audit log write error:', logErr);
      }

      setActionSuccess(`Rol actualizado con éxito a "${newRole.toUpperCase()}" para ${targetUser.displayName || targetUser.email}`);
      await fetchUsers();
    } catch (err: any) {
      console.error('Error changing role:', err);
      setActionError('Error al modificar el rol: ' + (err.message || 'Operación denegada'));
    } finally {
      setUpdatingUid(null);
    }
  };

  // Toggle User Status (Activate / Suspend)
  const handleToggleStatus = async (targetUser: UserProfile) => {
    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';

    if (targetUser.role === 'superadmin' && currentRole !== 'superadmin') {
      setActionError('No puedes suspender a un Superadministrador.');
      return;
    }

    setUpdatingUid(targetUser.uid);
    setActionSuccess(null);
    setActionError(null);

    try {
      // Backend update
      try {
        const idToken = await currentUser?.getIdToken();
        if (idToken) {
          await fetch(`/api/admin/users/${targetUser.uid}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ status: nextStatus }),
          });
        }
      } catch {}

      const userRef = doc(db, 'users', targetUser.uid);
      await updateDoc(userRef, {
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      });

      // Audit log
      try {
        const logId = 'log_' + Date.now();
        await setDoc(doc(db, 'audit_logs', logId), {
          id: logId,
          action: 'STATUS_UPDATE',
          performedBy: currentUser?.uid || 'admin',
          targetUser: targetUser.uid,
          details: `Estado modificado a "${nextStatus}" para ${targetUser.email}`,
          timestamp: new Date().toISOString(),
        });
      } catch {}

      setActionSuccess(`Usuario ${targetUser.displayName || targetUser.email} ${nextStatus === 'active' ? 'activado' : 'suspendido'} con éxito.`);
      await fetchUsers();
    } catch (err: any) {
      console.error('Error toggling status:', err);
      setActionError('Error al cambiar el estado del usuario: ' + err.message);
    } finally {
      setUpdatingUid(null);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      displayName: '',
      email: '',
      role: 'student',
      status: 'active',
      instrument: 'Piano',
      phone: '',
      notes: 'Usuario creado institucionalmente.'
    });
    setIsCreateModalOpen(true);
  };

  // Submit Create User
  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim() || !formData.email.trim()) {
      setActionError('El nombre y el correo electrónico son obligatorios.');
      return;
    }

    // Role safety check
    if (formData.role === 'superadmin' && currentRole !== 'superadmin') {
      setActionError('Solo el Superadministrador puede crear usuarios con rol de Superadministrador.');
      return;
    }

    setLoading(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const normalizedEmail = formData.email.trim().toLowerCase();
      const emailKey = normalizedEmail.replace(/[^a-zA-Z0-9_-]/g, '_');
      const generatedUid = `pre_${emailKey}`;

      // 1. Backend creation (with Firebase Admin SDK)
      try {
        const idToken = await currentUser?.getIdToken();
        if (idToken) {
          await fetch('/api/admin/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              email: normalizedEmail,
              displayName: formData.displayName.trim(),
              role: formData.role,
              status: formData.status,
              instrument: formData.instrument.trim() || undefined,
              phone: formData.phone.trim() || undefined,
              notes: formData.notes.trim() || undefined,
            }),
          });
        }
      } catch (apiErr) {
        console.warn('Backend user create fallback to client Firestore:', apiErr);
      }

      const newUserDoc: UserProfile = {
        uid: generatedUid,
        email: normalizedEmail,
        displayName: formData.displayName.trim(),
        role: formData.role,
        status: formData.status,
        instrument: formData.instrument.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        emailVerified: false,
        googleConnected: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 2. Write to /users
      await setDoc(doc(db, 'users', generatedUid), newUserDoc);

      // 3. Synchronize admin collection
      if (formData.role === 'superadmin' || formData.role === 'admin') {
        await setDoc(doc(db, 'admins', generatedUid), {
          uid: generatedUid,
          email: normalizedEmail,
          role: formData.role,
          grantedBy: currentUser?.uid || 'admin_creation',
          createdAt: new Date().toISOString(),
        });
        await setDoc(doc(db, 'admins', emailKey), {
          uid: generatedUid,
          email: normalizedEmail,
          role: formData.role,
          grantedBy: currentUser?.uid || 'admin_creation',
          createdAt: new Date().toISOString(),
        });
      }

      // 4. Synchronize teacher collection
      if (formData.role === 'teacher') {
        await setDoc(doc(db, 'teachers', generatedUid), {
          uid: generatedUid,
          email: normalizedEmail,
          specialties: [formData.instrument || 'Música'],
          createdAt: new Date().toISOString(),
        });
        await setDoc(doc(db, 'teachers', emailKey), {
          uid: generatedUid,
          email: normalizedEmail,
          specialties: [formData.instrument || 'Música'],
          createdAt: new Date().toISOString(),
        });
      }

      // 5. Audit Log
      try {
        const logId = 'log_' + Date.now();
        await setDoc(doc(db, 'audit_logs', logId), {
          id: logId,
          action: 'USER_CREATE',
          performedBy: currentUser?.uid || 'admin',
          targetUser: generatedUid,
          details: `Usuario creado: ${formData.displayName} (${normalizedEmail}) con rol ${formData.role}`,
          timestamp: new Date().toISOString(),
        });
      } catch {}

      setIsCreateModalOpen(false);
      setActionSuccess(`Usuario "${formData.displayName}" creado correctamente con rol ${formData.role.toUpperCase()}. Cuando inicie sesión con su correo, su perfil y rol se sincronizarán automáticamente.`);
      await fetchUsers();
    } catch (err: any) {
      console.error('Error creating user:', err);
      setActionError('Error al crear el usuario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (u: UserProfile) => {
    setEditingUser(u);
    setFormData({
      displayName: u.displayName || '',
      email: u.email || '',
      role: u.role,
      status: u.status,
      instrument: u.instrument || 'Piano',
      phone: u.phone || '',
      notes: u.notes || ''
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit User
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (formData.role === 'superadmin' && currentRole !== 'superadmin' && editingUser.role !== 'superadmin') {
      setActionError('Solo el Superadministrador puede promover a Superadministrador.');
      return;
    }

    setLoading(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      // Backend update
      try {
        const idToken = await currentUser?.getIdToken();
        if (idToken) {
          await fetch(`/api/admin/users/${editingUser.uid}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              displayName: formData.displayName.trim(),
              role: formData.role,
              status: formData.status,
              instrument: formData.instrument.trim() || undefined,
              phone: formData.phone.trim() || undefined,
              notes: formData.notes.trim() || undefined,
            }),
          });
        }
      } catch (apiErr) {
        console.warn('Backend user update fallback to client Firestore:', apiErr);
      }

      const userRef = doc(db, 'users', editingUser.uid);
      const adminRef = doc(db, 'admins', editingUser.uid);
      const teacherRef = doc(db, 'teachers', editingUser.uid);

      const updatedData: Partial<UserProfile> = {
        displayName: formData.displayName.trim(),
        role: formData.role,
        status: formData.status,
        instrument: formData.instrument.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(userRef, updatedData);

      // Synchronize /admins
      if (formData.role === 'superadmin' || formData.role === 'admin') {
        await setDoc(adminRef, {
          uid: editingUser.uid,
          email: editingUser.email,
          role: formData.role,
          grantedBy: currentUser?.uid || 'admin_edit',
          createdAt: new Date().toISOString(),
        });
      } else {
        await deleteDoc(adminRef).catch(() => {});
      }

      // Synchronize /teachers
      if (formData.role === 'teacher') {
        await setDoc(teacherRef, {
          uid: editingUser.uid,
          email: editingUser.email,
          specialties: [formData.instrument || 'Música'],
          createdAt: new Date().toISOString(),
        });
      } else {
        await deleteDoc(teacherRef).catch(() => {});
      }

      // Audit Log
      try {
        const logId = 'log_' + Date.now();
        await setDoc(doc(db, 'audit_logs', logId), {
          id: logId,
          action: 'USER_EDIT',
          performedBy: currentUser?.uid || 'admin',
          targetUser: editingUser.uid,
          details: `Perfil de ${editingUser.email} actualizado. Rol: ${formData.role}, Estado: ${formData.status}`,
          timestamp: new Date().toISOString(),
        });
      } catch {}

      setIsEditModalOpen(false);
      setEditingUser(null);
      setActionSuccess(`Información de "${formData.displayName}" actualizada con éxito.`);
      await fetchUsers();
    } catch (err: any) {
      console.error('Error editing user:', err);
      setActionError('Error al actualizar información: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete User Confirmation
  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    if (deletingUser.role === 'superadmin' && currentRole !== 'superadmin') {
      setActionError('No puedes eliminar a un Superadministrador.');
      setDeletingUser(null);
      return;
    }

    setLoading(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      // Backend deletion
      try {
        const idToken = await currentUser?.getIdToken();
        if (idToken) {
          await fetch(`/api/admin/users/${deletingUser.uid}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
        }
      } catch (apiErr) {
        console.warn('Backend user delete fallback to client Firestore:', apiErr);
      }

      await deleteDoc(doc(db, 'users', deletingUser.uid));
      await deleteDoc(doc(db, 'admins', deletingUser.uid)).catch(() => {});
      await deleteDoc(doc(db, 'teachers', deletingUser.uid)).catch(() => {});

      try {
        const logId = 'log_' + Date.now();
        await setDoc(doc(db, 'audit_logs', logId), {
          id: logId,
          action: 'USER_DELETE',
          performedBy: currentUser?.uid || 'admin',
          targetUser: deletingUser.uid,
          details: `Usuario eliminado: ${deletingUser.displayName || deletingUser.email}`,
          timestamp: new Date().toISOString(),
        });
      } catch {}

      setActionSuccess(`Usuario "${deletingUser.displayName || deletingUser.email}" eliminado correctamente.`);
      setDeletingUser(null);
      await fetchUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setActionError('Error al eliminar usuario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Seed sample academy users if needed
  const seedDemoUsers = async () => {
    setLoading(true);
    try {
      const demoUsers: UserProfile[] = [
        {
          uid: 'user_director_mario',
          email: 'mariobarillas24@gmail.com',
          displayName: 'Director Mario Barillas',
          role: 'superadmin',
          instrument: 'Dirección Orquestal & Piano',
          status: 'active',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          googleConnected: true,
        },
        {
          uid: 'user_admin_sara',
          email: 'admin.sede@academiajuda.com',
          displayName: 'Sara Reyes (Coordinación)',
          role: 'admin',
          instrument: 'Gestión Cultural & Violonchelo',
          status: 'active',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          googleConnected: true,
        },
        {
          uid: 'user_teacher_carlos',
          email: 'profesor.piano@academiajuda.com',
          displayName: 'Prof. Carlos Mendoza',
          role: 'teacher',
          instrument: 'Piano Clásico & Armonía',
          status: 'active',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          googleConnected: true,
        },
        {
          uid: 'user_teacher_elena',
          email: 'profesora.canto@academiajuda.com',
          displayName: 'Prof. Elena Rostova',
          role: 'teacher',
          instrument: 'Canto & Técnica Vocal',
          status: 'active',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          googleConnected: true,
        },
        {
          uid: 'user_student_david',
          email: 'alumno.guitarra@gmail.com',
          displayName: 'David Morales',
          role: 'student',
          instrument: 'Guitarra Eléctrica',
          status: 'active',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          googleConnected: false,
        },
        {
          uid: 'user_student_ana',
          email: 'ana.violinsonata@gmail.com',
          displayName: 'Ana Lucía Gómez',
          role: 'student',
          instrument: 'Violín',
          status: 'active',
          emailVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          googleConnected: true,
        },
      ];

      for (const u of demoUsers) {
        await setDoc(doc(db, 'users', u.uid), u);
        if (u.role === 'superadmin' || u.role === 'admin') {
          await setDoc(doc(db, 'admins', u.uid), {
            uid: u.uid,
            email: u.email,
            role: u.role,
            grantedBy: 'system_seed',
            createdAt: new Date().toISOString(),
          });
        }
        if (u.role === 'teacher') {
          await setDoc(doc(db, 'teachers', u.uid), {
            uid: u.uid,
            email: u.email,
            specialties: [u.instrument || 'Música'],
            createdAt: new Date().toISOString(),
          });
        }
      }

      setActionSuccess('Cuentas representativas inicializadas con éxito en Firestore.');
      await fetchUsers();
    } catch (err: any) {
      setActionError('Error inicializando usuarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        (u.displayName?.toLowerCase().includes(q)) ||
        (u.email?.toLowerCase().includes(q)) ||
        (u.instrument?.toLowerCase().includes(q)) ||
        (u.phone?.toLowerCase().includes(q));

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Role Badges
  const renderRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Shield className="w-3 h-3 text-amber-700" />
            <span>Superadmin</span>
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
            <ShieldCheck className="w-3 h-3 text-indigo-700" />
            <span>Administrador</span>
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <GraduationCap className="w-3 h-3 text-emerald-700" />
            <span>Profesor / Docente</span>
          </span>
        );
      case 'student':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-900 border border-sky-300">
            <UserCheck className="w-3 h-3 text-sky-700" />
            <span>Alumno / Estudiante</span>
          </span>
        );
    }
  };

  // Status Badges
  const renderStatusBadge = (status: 'active' | 'pending' | 'suspended') => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Activo</span>
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>Suspendido</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Pendiente</span>
          </span>
        );
    }
  };

  // Stats calculation
  const totalCount = users.length;
  const superadminCount = users.filter(u => u.role === 'superadmin').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const teacherCount = users.filter(u => u.role === 'teacher').length;
  const studentCount = users.filter(u => u.role === 'student').length;
  const activeCount = users.filter(u => u.status === 'active').length;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-stone-900">
                Gestión de Usuarios & Asignación de Roles
              </h1>
              <p className="text-xs text-stone-600">
                Administración centralizada de cuentas, jerarquías (Superadmin, Admin, Docente, Alumno) y accesos de la academia.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2.5 border border-stone-300 rounded-xl hover:bg-stone-50 text-stone-700 transition-colors shadow-2xs"
            title="Recargar usuarios"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={seedDemoUsers}
            disabled={loading}
            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Cargar registros demostrativos de prueba"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Poblar Usuarios Demo</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-400 font-semibold rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Usuario</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-medium text-stone-500">Total Usuarios</span>
          <p className="text-xl font-bold text-stone-900 mt-0.5">{totalCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-medium text-amber-700">Superadmins</span>
          <p className="text-xl font-bold text-amber-800 mt-0.5">{superadminCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-medium text-indigo-700">Administradores</span>
          <p className="text-xl font-bold text-indigo-800 mt-0.5">{adminCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-medium text-emerald-700">Docentes</span>
          <p className="text-xl font-bold text-emerald-800 mt-0.5">{teacherCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-medium text-sky-700">Alumnos</span>
          <p className="text-xl font-bold text-sky-800 mt-0.5">{studentCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-medium text-emerald-600">Cuentas Activas</span>
          <p className="text-xl font-bold text-emerald-700 mt-0.5">{activeCount} / {totalCount}</p>
        </div>
      </div>

      {/* Security Architecture Notice */}
      <div className="p-4 bg-stone-900 text-stone-200 rounded-2xl border border-stone-800 flex items-start gap-3 shadow-xs">
        <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-white">
            Autoridad Criptográfica de Roles (Cero Confianza / Zero Trust):
          </p>
          <p className="text-stone-300">
            La resolución de permisos se realiza contrastando el UID autenticado en Firebase Auth contra los registros autoritativos de Cloud Firestore (<code className="text-amber-300">/users</code>, <code className="text-amber-300">/admins</code> y <code className="text-amber-300">/teachers</code>). Ningún estudiante o docente puede elevarse a administrador manipulando el navegador.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between gap-2 shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between gap-2 shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-600 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, correo, instrumento o teléfono..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs text-stone-500">Rol:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Todos ({users.length})</option>
              <option value="superadmin">Superadministrador</option>
              <option value="admin">Administrador</option>
              <option value="teacher">Profesor (Docente)</option>
              <option value="student">Alumno (Estudiante)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="pending">Pendientes</option>
              <option value="suspended">Suspendidos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Usuario & Cátedra</th>
                <th className="py-3.5 px-4 font-semibold">Correo Electrónico</th>
                <th className="py-3.5 px-4 font-semibold">Rol Actual</th>
                <th className="py-3.5 px-4 font-semibold">Estado</th>
                <th className="py-3.5 px-4 font-semibold">Google Vinculado</th>
                <th className="py-3.5 px-4 font-semibold text-right">Acciones & Asignación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
                    <span>Cargando usuarios desde Cloud Firestore...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    <p className="font-semibold text-stone-700">No se encontraron usuarios</p>
                    <p className="text-xs text-stone-500 mt-1">
                      {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                        ? 'Prueba modificando los filtros de búsqueda.'
                        : 'Utiliza el botón "+ Crear Usuario" para registrar el primer integrante.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                          {(u.displayName || u.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                            {u.displayName || 'Sin nombre'}
                            {u.phone && (
                              <span className="text-[10px] text-stone-400 font-normal">({u.phone})</span>
                            )}
                          </p>
                          <p className="text-[11px] text-stone-500 flex items-center gap-1">
                            <Music className="w-3 h-3 text-amber-600" />
                            <span>{u.instrument || 'Instrumento no asignado'}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600">
                      {u.email}
                      {u.emailVerified && (
                        <span className="ml-1.5 text-[10px] text-emerald-600 font-bold" title="Correo verificado">✓</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {renderRoleBadge(u.role)}
                    </td>

                    <td className="py-3.5 px-4">
                      {renderStatusBadge(u.status)}
                    </td>

                    <td className="py-3.5 px-4">
                      {u.googleConnected ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Sincronizado
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400">
                          No vinculado
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {/* Role Select Quick Change */}
                        <select
                          disabled={updatingUid === u.uid}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                          className="px-2 py-1 text-[11px] border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium disabled:opacity-50"
                          title="Cambiar rol"
                        >
                          <option value="student">Alumno</option>
                          <option value="teacher">Profesor</option>
                          <option value="admin">Administrador</option>
                          {currentRole === 'superadmin' && (
                            <option value="superadmin">Superadministrador</option>
                          )}
                        </select>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-stone-600 hover:text-amber-700 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Editar información del usuario"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Status (Active / Suspended) */}
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={updatingUid === u.uid}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.status === 'active'
                              ? 'text-emerald-700 hover:bg-emerald-50'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={u.status === 'active' ? 'Suspender usuario' : 'Activar usuario'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button (Only for Superadmin or Admin) */}
                        {currentRole === 'superadmin' && (
                          <button
                            onClick={() => setDeletingUser(u)}
                            className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Crear Nuevo Usuario Institucional
                  </h3>
                  <p className="text-xs text-stone-500">
                    Asigna el rol y credenciales base en Cloud Firestore.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Ej. Profesor Carlos Mendoza o Alumna Sofía"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Correo Electrónico Institucional *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nombre@gmail.com o usuario@academiajuda.com"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Cuando el usuario inicie sesión con este correo (Google o Email/Password), heredará automáticamente este perfil y rol.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Rol Asignado *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="student">Alumno (Student)</option>
                    <option value="teacher">Profesor (Teacher)</option>
                    <option value="admin">Administrador (Admin)</option>
                    {currentRole === 'superadmin' && (
                      <option value="superadmin">Superadministrador (Superadmin)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Estado de la Cuenta
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="active">Activo</option>
                    <option value="pending">Pendiente de verificación</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Instrumento / Cátedra
                  </label>
                  <input
                    type="text"
                    value={formData.instrument}
                    onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                    placeholder="Piano, Guitarra, Canto, etc."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+502 4444-0000"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Notas u Observaciones
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Información académica o de matrícula..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 rounded-xl font-semibold flex items-center gap-2 shadow-sm"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Guardar Usuario</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-900 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Editar Información de Usuario
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">
                    {editingUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Rol Asignado *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="student">Alumno (Student)</option>
                    <option value="teacher">Profesor (Teacher)</option>
                    <option value="admin">Administrador (Admin)</option>
                    {currentRole === 'superadmin' && (
                      <option value="superadmin">Superadministrador (Superadmin)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Estado de la Cuenta
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="active">Activo</option>
                    <option value="pending">Pendiente</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Instrumento / Cátedra
                  </label>
                  <input
                    type="text"
                    value={formData.instrument}
                    onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Notas u Observaciones
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 rounded-xl font-semibold flex items-center gap-2 shadow-sm"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Actualizar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                ¿Eliminar este usuario?
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Esta acción eliminará el perfil de <strong className="text-stone-900">{deletingUser.displayName || deletingUser.email}</strong> de Cloud Firestore.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirmar Eliminación</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
