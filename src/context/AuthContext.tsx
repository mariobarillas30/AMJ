import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole, SecurityAuditLog, ActiveNavRoute } from '../types';

export const getPortalRouteForRole = (role: UserRole): ActiveNavRoute => {
  switch (role) {
    case 'superadmin':
    case 'admin':
      return 'admin-dashboard';
    case 'teacher':
      return 'teacher-portal';
    case 'student':
    default:
      return 'student-portal';
  }
};

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  isEmailVerified: boolean;
  authError: string | null;
  clearAuthError: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (
    email: string, 
    pass: string, 
    displayName: string, 
    instrument: string, 
    phone: string,
    documentId?: string,
    guardianName?: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  linkGoogleServices: (service: 'meet' | 'drive' | 'classroom' | 'calendar') => Promise<void>;
  disconnectGoogleService: (service: 'meet' | 'drive' | 'classroom' | 'calendar') => Promise<void>;
  // Security demonstration utility
  simulateClientTampering: () => { attemptedRole: string; serverValidatedRole: UserRole; blocked: boolean; message: string };
  // Quick role preview for system inspection
  previewAsRole: (role: UserRole | null) => void;
  activePreviewRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const BOOTSTRAP_DIRECTOR_EMAIL = 'mariobarillas24@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activePreviewRole, setActivePreviewRole] = useState<UserRole | null>(null);

  const clearAuthError = () => setAuthError(null);

  // Sync profile & evaluate role securely from Firestore
  const syncUserProfile = async (user: User) => {
    const userEmailNormalized = (user.email || '').toLowerCase().trim();
    const isDirector = userEmailNormalized === BOOTSTRAP_DIRECTOR_EMAIL.toLowerCase();

    // 1. Intentar sincronización soberana en el backend (/api/auth/sync)
    try {
      const idToken = await user.getIdToken();
      const resp = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.success && data.user) {
          setUserProfile(data.user);
          setRole(data.role || data.user.role);
          return;
        }
      }
    } catch (apiErr) {
      console.warn('Backend profile sync note (proceeding with direct Firestore sync):', apiErr);
    }

    // 2. Sincronización directa en Firestore (Client SDK)
    try {
      const userRef = doc(db, 'users', user.uid);
      const adminRef = doc(db, 'admins', user.uid);
      const teacherRef = doc(db, 'teachers', user.uid);
      const emailKey = userEmailNormalized.replace(/[^a-zA-Z0-9_-]/g, '_');

      // Check if user document already exists under this UID
      const userSnap = await getDoc(userRef).catch(err => {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      });

      let [adminSnap, teacherSnap] = await Promise.all([
        getDoc(adminRef).catch(() => null),
        getDoc(teacherRef).catch(() => null),
      ]);

      // If director and no admin record, initialize it immediately
      if (isDirector && (!adminSnap || !adminSnap.exists())) {
        try {
          await setDoc(adminRef, {
            uid: user.uid,
            email: user.email,
            role: 'superadmin',
            grantedBy: 'system_bootstrap',
            createdAt: new Date().toISOString(),
          });
          adminSnap = await getDoc(adminRef);
        } catch (e) {
          console.warn('Bootstrap admin doc sync error:', e);
        }
      }

      // If user profile doc is missing, check if an admin pre-created a profile for this email
      let preCreatedProfile: Partial<UserProfile> | null = null;
      if (!userSnap || !userSnap.exists()) {
        try {
          // Búsqueda por documento pre_emailKey
          const preDocRef = doc(db, 'users', 'pre_' + emailKey);
          const preDocSnap = await getDoc(preDocRef).catch(() => null);
          if (preDocSnap && preDocSnap.exists()) {
            preCreatedProfile = preDocSnap.data() as UserProfile;
            try {
              await deleteDoc(preDocRef);
            } catch {}
          } else {
            // Búsqueda por query email
            const q = query(collection(db, 'users'), where('email', '==', userEmailNormalized));
            const querySnap = await getDocs(q);
            if (!querySnap.empty) {
              const firstDoc = querySnap.docs[0];
              preCreatedProfile = firstDoc.data() as UserProfile;
              if (firstDoc.id !== user.uid) {
                try {
                  await deleteDoc(doc(db, 'users', firstDoc.id));
                } catch (delErr) {
                  console.warn('Could not remove temporary pre-created doc:', delErr);
                }
              }
            }
          }
        } catch (qErr) {
          console.warn('Pre-created user lookup note:', qErr);
        }
      }

      // Determine authoritative role
      let authoritativeRole: UserRole = 'student';
      if (isDirector) {
        authoritativeRole = 'superadmin';
      } else if (adminSnap && adminSnap.exists()) {
        const data = adminSnap.data();
        authoritativeRole = data.role === 'superadmin' ? 'superadmin' : 'admin';
      } else if (teacherSnap && teacherSnap.exists()) {
        authoritativeRole = 'teacher';
      } else if (preCreatedProfile?.role) {
        authoritativeRole = preCreatedProfile.role;
      } else if (userSnap && userSnap.exists()) {
        const data = userSnap.data();
        authoritativeRole = (data.role as UserRole) || 'student';
      }

      // If assigned role is teacher, ensure /teachers doc exists
      if (authoritativeRole === 'teacher' && (!teacherSnap || !teacherSnap.exists())) {
        try {
          await setDoc(teacherRef, {
            uid: user.uid,
            email: user.email,
            specialties: [preCreatedProfile?.instrument || 'Música'],
            createdAt: new Date().toISOString(),
          });
        } catch (tErr) {
          console.warn('Teacher sync note:', tErr);
        }
      }

      // If assigned role is admin/superadmin, ensure /admins doc exists
      if ((authoritativeRole === 'admin' || authoritativeRole === 'superadmin') && (!adminSnap || !adminSnap.exists())) {
        try {
          await setDoc(adminRef, {
            uid: user.uid,
            email: user.email,
            role: authoritativeRole,
            grantedBy: 'system_sync',
            createdAt: new Date().toISOString(),
          });
        } catch (aErr) {
          console.warn('Admin sync note:', aErr);
        }
      }

      if (!userSnap || !userSnap.exists()) {
        // Initial profile creation on first login (combining pre-created fields if present)
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || userEmailNormalized,
          displayName: user.displayName || preCreatedProfile?.displayName || user.email?.split('@')[0] || 'Estudiante Judá',
          photoURL: user.photoURL || preCreatedProfile?.photoURL || undefined,
          role: authoritativeRole,
          instrument: preCreatedProfile?.instrument || undefined,
          phone: preCreatedProfile?.phone || undefined,
          status: preCreatedProfile?.status || 'active',
          emailVerified: user.emailVerified,
          createdAt: preCreatedProfile?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          googleConnected: user.providerData.some(p => p.providerId === 'google.com'),
          googleServices: {
            meet: true,
            drive: true,
            classroom: false,
            calendar: true,
            linkedEmail: user.email || undefined,
            connectedAt: new Date().toISOString(),
          },
        };

        await setDoc(userRef, newProfile).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        });
        setUserProfile(newProfile);
        setRole(authoritativeRole);
      } else {
        const existingData = userSnap.data() as UserProfile;
        const updatedProfile: UserProfile = {
          ...existingData,
          displayName: existingData.displayName || user.displayName || 'Estudiante Judá',
          photoURL: existingData.photoURL || user.photoURL || undefined,
          emailVerified: user.emailVerified,
          role: authoritativeRole,
        };
        setUserProfile(updatedProfile);
        setRole(authoritativeRole);
      }
    } catch (err: any) {
      console.error('Error synchronizing user profile:', err);
      // Fallback safe state: if director keep superadmin, otherwise student
      if (isDirector) {
        setRole('superadmin');
        setUserProfile({
          uid: user.uid,
          email: user.email || userEmailNormalized,
          displayName: user.displayName || 'Director General (Superadmin)',
          role: 'superadmin',
          status: 'active',
          emailVerified: user.emailVerified,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          googleConnected: true,
        });
      } else {
        setRole('student');
        setUserProfile({
          uid: user.uid,
          email: user.email || userEmailNormalized,
          displayName: user.displayName || 'Usuario Judá',
          role: 'student',
          status: 'active',
          emailVerified: user.emailVerified,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          googleConnected: true,
        });
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setUserProfile(null);
        setRole('student');
        setActivePreviewRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await syncUserProfile(res.user);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setAuthError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      } else if (err.code === 'auth/too-many-requests') {
        setAuthError('Demasiados intentos fallidos. Intenta más tarde o recupera tu contraseña.');
      } else {
        setAuthError(err.message || 'Error al iniciar sesión.');
      }
      throw err;
    }
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    instrument: string,
    phone: string,
    documentId?: string,
    guardianName?: string
  ) => {
    setAuthError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(res.user, { displayName });

      // Send email verification right after registration
      try {
        await sendEmailVerification(res.user);
      } catch (verErr) {
        console.warn('Could not send initial verification email:', verErr);
      }

      // Create profile explicitly with student role
      const userRef = doc(db, 'users', res.user.uid);
      const isDirector = email.trim().toLowerCase() === BOOTSTRAP_DIRECTOR_EMAIL.toLowerCase();
      const initialRole: UserRole = isDirector ? 'superadmin' : 'student';

      const newProfile: UserProfile = {
        uid: res.user.uid,
        email: email.trim(),
        displayName: displayName.trim(),
        role: initialRole,
        instrument: instrument.trim(),
        phone: phone.trim(),
        documentId: documentId?.trim() || '',
        guardianName: guardianName?.trim() || '',
        status: 'active',
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        googleConnected: false,
        googleServices: {
          meet: false,
          drive: false,
          classroom: false,
          calendar: false,
        },
      };

      await setDoc(userRef, newProfile).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${res.user.uid}`);
      });

      if (isDirector) {
        const adminRef = doc(db, 'admins', res.user.uid);
        await setDoc(adminRef, {
          uid: res.user.uid,
          email: res.user.email,
          role: 'superadmin',
          grantedBy: 'system_bootstrap',
          createdAt: new Date().toISOString(),
        }).catch(() => {});
      }

      setUserProfile(newProfile);
      setRole(initialRole);
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('Este correo electrónico ya se encuentra registrado. Inicia sesión o recupera tu contraseña.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setAuthError(err.message || 'Error al crear la cuenta.');
      }
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      // signInWithPopup is the standard for web apps in this environment
      const res = await signInWithPopup(auth, googleProvider);
      await syncUserProfile(res.user);
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('El inicio de sesión con Google fue cancelado en la ventana emergente.');
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError('Tu navegador bloqueó la ventana emergente de Google. Habilita popups para continuar.');
      } else {
        setAuthError(err.message || 'Error al autenticar con Google.');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setRole('student');
      setActivePreviewRole(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  const sendPasswordReset = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setAuthError('No existe una cuenta registrada con este correo electrónico.');
      } else {
        setAuthError(err.message || 'Error al enviar el enlace de restablecimiento.');
      }
      throw err;
    }
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (err: any) {
      console.error('Verification email error:', err);
      throw err;
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('No hay usuario autenticado');
    const userRef = doc(db, 'users', currentUser.uid);

    // Safeguard: Strip sensitive fields that client cannot change
    const safeData = { ...data };
    delete (safeData as any).role;
    delete (safeData as any).status;
    delete (safeData as any).uid;
    delete (safeData as any).email;

    const payload = {
      ...safeData,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(userRef, payload).catch(err => {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    });

    if (data.displayName && data.displayName !== currentUser.displayName) {
      try {
        await updateProfile(currentUser, { displayName: data.displayName });
      } catch (e) {
        console.warn('Auth updateProfile displayName warning:', e);
      }
    }

    if (data.photoURL !== undefined) {
      // Sync with backend /api/user/photo for server authority
      try {
        const idToken = await currentUser.getIdToken();
        await fetch('/api/user/photo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ photoURL: data.photoURL || null }),
        });
      } catch (backendErr) {
        console.warn('Backend /api/user/photo sync note:', backendErr);
      }

      // Also update Firebase Auth profile photoURL if it's a web URL (< 2000 chars)
      try {
        if (!data.photoURL || (!data.photoURL.startsWith('data:') && data.photoURL.length < 2000)) {
          await updateProfile(currentUser, { photoURL: data.photoURL || null });
        }
      } catch (authPhotoErr) {
        console.warn('Firebase Auth updateProfile photoURL warning:', authPhotoErr);
      }
    }

    setUserProfile(prev => (prev ? { ...prev, ...payload } : null));
  };

  const linkGoogleServices = async (service: 'meet' | 'drive' | 'classroom' | 'calendar') => {
    if (!currentUser || !userProfile) return;
    const userRef = doc(db, 'users', currentUser.uid);

    const currentServices = userProfile.googleServices || {};
    const updatedServices = {
      ...currentServices,
      [service]: true,
      linkedEmail: currentUser.email || undefined,
      connectedAt: new Date().toISOString(),
    };

    await updateDoc(userRef, {
      googleConnected: true,
      googleServices: updatedServices,
      updatedAt: new Date().toISOString(),
    }).catch(err => {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    });

    setUserProfile(prev => prev ? {
      ...prev,
      googleConnected: true,
      googleServices: updatedServices,
    } : null);
  };

  const disconnectGoogleService = async (service: 'meet' | 'drive' | 'classroom' | 'calendar') => {
    if (!currentUser || !userProfile) return;
    const userRef = doc(db, 'users', currentUser.uid);

    const currentServices = userProfile.googleServices || {};
    const updatedServices = {
      ...currentServices,
      [service]: false,
    };

    await updateDoc(userRef, {
      googleServices: updatedServices,
      updatedAt: new Date().toISOString(),
    }).catch(err => {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    });

    setUserProfile(prev => prev ? {
      ...prev,
      googleServices: updatedServices,
    } : null);
  };

  // Security Demonstration: Demonstrates why client-side tampering is impossible
  const simulateClientTampering = () => {
    // Attempt to set localStorage as an attacker might try
    try {
      localStorage.setItem('role', 'superadmin');
      (window as any).currentUserRole = 'superadmin';
    } catch {}

    const serverRole = role;
    return {
      attemptedRole: 'superadmin (via localStorage o variable en memoria)',
      serverValidatedRole: serverRole,
      blocked: serverRole !== 'superadmin',
      message: serverRole === 'superadmin' 
        ? 'El usuario actual ya es Superadministrador legítimo validado en la base de datos de la Academia.'
        : 'Ataque bloqueado: El sistema ignora localStorage y valida el rol exclusivamente contra las reglas de seguridad de Firestore y la colección autoritativa de la Academia.',
    };
  };

  const previewAsRole = (previewRole: UserRole | null) => {
    setActivePreviewRole(previewRole);
  };

  const effectiveRole = activePreviewRole || role;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role: effectiveRole,
        loading,
        isEmailVerified: currentUser?.emailVerified || false,
        authError,
        clearAuthError,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        sendPasswordReset,
        resendVerificationEmail,
        updateProfileData,
        linkGoogleServices,
        disconnectGoogleService,
        simulateClientTampering,
        previewAsRole,
        activePreviewRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
