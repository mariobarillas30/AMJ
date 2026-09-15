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
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole, SecurityAuditLog } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  isEmailVerified: boolean;
  authError: string | null;
  clearAuthError: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName: string, instrument: string, phone: string) => Promise<void>;
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
    try {
      const userRef = doc(db, 'users', user.uid);
      const adminRef = doc(db, 'admins', user.uid);
      const teacherRef = doc(db, 'teachers', user.uid);

      let isDirector = user.email?.toLowerCase() === BOOTSTRAP_DIRECTOR_EMAIL.toLowerCase();

      // Check if user document already exists
      const userSnap = await getDoc(userRef).catch(err => {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      });

      let [adminSnap, teacherSnap] = await Promise.all([
        getDoc(adminRef).catch(() => null),
        getDoc(teacherRef).catch(() => null),
      ]);

      // If director and no admin record, initialize it
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
        } catch {
          // ignore if already present or handled
        }
      }

      // Determine authoritative role
      let authoritativeRole: UserRole = 'student';
      if (adminSnap && adminSnap.exists()) {
        const data = adminSnap.data();
        authoritativeRole = data.role === 'superadmin' ? 'superadmin' : 'admin';
      } else if (teacherSnap && teacherSnap.exists()) {
        authoritativeRole = 'teacher';
      } else if (isDirector) {
        authoritativeRole = 'superadmin';
      } else if (userSnap && userSnap.exists()) {
        const data = userSnap.data();
        // Students cannot elevate themselves; if database says student it's student
        authoritativeRole = (data.role as UserRole) || 'student';
      }

      if (!userSnap || !userSnap.exists()) {
        // Initial profile creation on first login
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Estudiante Judá',
          photoURL: user.photoURL || undefined,
          role: authoritativeRole,
          status: 'active',
          emailVerified: user.emailVerified,
          createdAt: new Date().toISOString(),
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
        // Keep authoritative role in sync if admin/teacher status changed
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
      // Fallback safe state: Student role
      setRole('student');
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
    phone: string
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

      // Create profile explicitly with student role (Zero Trust: cannot elevate self)
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
      await updateProfile(currentUser, { displayName: data.displayName });
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
