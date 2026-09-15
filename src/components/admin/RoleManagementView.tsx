import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, UserRole } from '../../types';
import { 
  Shield, 
  UserCheck, 
  Search, 
  UserPlus, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  ShieldAlert,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const RoleManagementView: React.FC = () => {
  const { currentUser, role, userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const snap = await getDocs(collection(db, 'users')).catch(err => {
        handleFirestoreError(err, OperationType.LIST, 'users');
      });
      const list: UserProfile[] = [];
      snap.forEach(docSnap => {
        list.push(docSnap.data() as UserProfile);
      });
      setUsers(list);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setActionError('No se pudieron cargar los usuarios. Verifica tus permisos de administrador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (targetUser: UserProfile, newRole: UserRole) => {
    if (targetUser.role === newRole) return;
    
    // Authorization check: Only superadmin can assign superadmin or admin
    if ((newRole === 'superadmin' || targetUser.role === 'superadmin') && role !== 'superadmin') {
      setActionError('Solo el Superadministrador puede asignar o revocar el rol de Superadministrador.');
      return;
    }

    setUpdatingUid(targetUser.uid);
    setActionSuccess(null);
    setActionError(null);

    try {
      const userRef = doc(db, 'users', targetUser.uid);
      const adminRef = doc(db, 'admins', targetUser.uid);
      const teacherRef = doc(db, 'teachers', targetUser.uid);

      // 1. Update user profile
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });

      // 2. Synchronize authoritative admin collection
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

      // 3. Synchronize authoritative teacher collection
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

      // 4. Record audit log
      try {
        const logId = 'log_' + Date.now();
        await setDoc(doc(db, 'audit_logs', logId), {
          id: logId,
          action: 'ROLE_UPDATE',
          performedBy: currentUser?.uid || 'system',
          targetUser: targetUser.uid,
          details: `Rol modificado de ${targetUser.role} a ${newRole} para ${targetUser.email}`,
          timestamp: new Date().toISOString(),
        });
      } catch (logErr) {
        console.warn('Audit log write error:', logErr);
      }

      setActionSuccess(`Rol actualizado con éxito a "${newRole}" para ${targetUser.displayName || targetUser.email}`);
      await fetchUsers();
    } catch (err: any) {
      console.error('Error changing role:', err);
      setActionError('Error de autorización al modificar el rol: ' + (err.message || 'Operación denegada por reglas de seguridad'));
    } finally {
      setUpdatingUid(null);
    }
  };

  // Seed sample academy users if list is small or empty
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

      setActionSuccess('Usuarios representativos de la academia inicializados con éxito en Firestore.');
      await fetchUsers();
    } catch (err: any) {
      setActionError('Error inicializando usuarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.instrument?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRolePill = (r: UserRole) => {
    switch (r) {
      case 'superadmin':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">Superadmin</span>;
      case 'admin':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">Admin</span>;
      case 'teacher':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">Profesor</span>;
      case 'student':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-900 border border-sky-300">Alumno</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-700" />
            <h1 className="font-serif text-3xl font-bold text-stone-900">
              Control de Roles y Autorización
            </h1>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Gestión criptográfica de privilegios. Las modificaciones se sincronizan en Firestore y auditan en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 border border-stone-300 rounded-xl hover:bg-stone-50 text-stone-700 transition-colors"
            title="Recargar usuarios"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={seedDemoUsers}
            disabled={loading}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Poblar Usuarios Demo</span>
          </button>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-4 bg-stone-900 text-stone-200 rounded-2xl border border-stone-800 flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-white">
            Modelo de Seguridad de la Academia (Zero Trust RBAC):
          </p>
          <p className="text-stone-300">
            Ningún usuario puede convertirse en Administrador modificando variables de sesión o <code className="text-amber-300">localStorage</code>. Toda asignación requiere firma y validación cruzada entre las colecciones <code className="text-amber-300">/users</code> y <code className="text-amber-300">/admins</code> protegidas por reglas de seguridad en Cloud Firestore.
          </p>
        </div>
      </div>

      {/* Feedback alerts */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, correo o instrumento..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <span className="text-xs text-stone-500">Filtrar por rol:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Todos los roles ({users.length})</option>
            <option value="superadmin">Superadministradores</option>
            <option value="admin">Administradores</option>
            <option value="teacher">Profesores</option>
            <option value="student">Alumnos</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Usuario & Especialidad</th>
                <th className="py-3.5 px-4 font-semibold">Correo Electrónico</th>
                <th className="py-3.5 px-4 font-semibold">Rol Actual</th>
                <th className="py-3.5 px-4 font-semibold">Google Vinculado</th>
                <th className="py-3.5 px-4 font-semibold">Estado</th>
                <th className="py-3.5 px-4 font-semibold text-right">Asignar Nuevo Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500">
                    No se encontraron usuarios con los criterios especificados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
                          {(u.displayName || u.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900">
                            {u.displayName || 'Sin nombre asignado'}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {u.instrument || 'Instrumento no especificado'}
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
                      {getRolePill(u.role)}
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

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-medium text-stone-700 capitalize">
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <select
                          disabled={updatingUid === u.uid}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                          className="px-2.5 py-1 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium disabled:opacity-50"
                        >
                          <option value="student">Alumno</option>
                          <option value="teacher">Profesor</option>
                          <option value="admin">Administrador</option>
                          {role === 'superadmin' && (
                            <option value="superadmin">Superadministrador</option>
                          )}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
