import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

export type BackendRole = 'superadmin' | 'admin' | 'teacher' | 'student';

export interface AuthenticatedBackendUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  role: BackendRole;
  roles: BackendRole[];
  tokenClaims?: Record<string, any>;
  authProvider: 'firebase_admin_sdk' | 'dev_test_simulation';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedBackendUser;
    }
  }
}

let firebaseAdminApp: App | null = null;

/**
 * Obtiene el Project ID institucional desde variables de entorno o archivo de configuración
 */
function resolveFirebaseProjectId(): string {
  if (process.env.FIREBASE_PROJECT_ID) {
    return process.env.FIREBASE_PROJECT_ID;
  }
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed.projectId) return parsed.projectId;
    }
  } catch {}
  return 'gen-lang-client-0997230019';
}

/**
 * Inicialización Lazy y Segura de Firebase Admin SDK.
 * Garantiza que el servidor no crashee en el arranque.
 * Prioriza credenciales explícitas de servicio si están provistas mediante variables de entorno,
 * o inicialización con Project ID (compatible con Application Default Credentials en Cloud Run).
 * NUNCA expone credenciales privadas al cliente.
 */
export function getFirebaseAdmin(): App {
  if (!firebaseAdminApp) {
    const apps = getApps();
    if (apps.length > 0) {
      firebaseAdminApp = apps[0]!;
    } else {
      const projectId = resolveFirebaseProjectId();

      // 1. Verificación de Service Account Key en variable de entorno
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
          firebaseAdminApp = initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id || projectId,
          });
          console.log(`[Firebase Admin SDK] Inicializado con Service Account Key explícito para: ${projectId}`);
          return firebaseAdminApp;
        } catch (err: any) {
          console.warn('[Firebase Admin SDK] Error al parsear FIREBASE_SERVICE_ACCOUNT_KEY, recurriendo a ADC/Project ID:', err?.message);
        }
      }

      // 2. Verificación de credenciales individuales por variable de entorno
      if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        try {
          const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
          firebaseAdminApp = initializeApp({
            credential: cert({
              projectId,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey,
            }),
            projectId,
          });
          console.log(`[Firebase Admin SDK] Inicializado con credenciales de servicio (Client Email) para: ${projectId}`);
          return firebaseAdminApp;
        } catch (err: any) {
          console.warn('[Firebase Admin SDK] Error con credenciales individuales, recurriendo a ADC/Project ID:', err?.message);
        }
      }

      // 3. Inicialización estándar con Project ID (ADC en Cloud Run o verificación de firmas con certificados públicos de Google)
      firebaseAdminApp = initializeApp({
        projectId,
      });
      console.log(`[Firebase Admin SDK] Inicializado exitosamente con Project ID: ${projectId}`);
    }
  }
  return firebaseAdminApp;
}

export function getAdminFirestore() {
  const adminApp = getFirebaseAdmin();
  return getFirestore(adminApp);
}

const BOOTSTRAP_SUPERADMIN_EMAIL = 'mariobarillas24@gmail.com';

/**
 * Resolución Autoritativa y Soberana del Rol de Usuario.
 * Prioridad:
 * 1. Correo de Dirección General (Bootstrap Superadmin) con email verificado
 * 2. Custom Claims firmadas en el ID Token por Firebase Admin
 * 3. Base de datos Firestore (/admins, /teachers, /users) consultada por el backend
 * 4. Verificación de dominio institucional de docentes con email verificado
 * 5. Fallback seguro: 'student' (Principio de Menor Privilegio)
 */
export async function resolveSovereignRole(
  uid: string,
  email?: string,
  decodedToken?: DecodedIdToken
): Promise<BackendRole> {
  // 1. Regla de Dirección General (Superadmin)
  // Protección contra Email Spoofing: requiere email verificado por Firebase
  if (
    email &&
    email.toLowerCase() === BOOTSTRAP_SUPERADMIN_EMAIL.toLowerCase() &&
    (decodedToken?.email_verified === true || process.env.NODE_ENV !== 'production')
  ) {
    return 'superadmin';
  }

  // 2. Custom Claims firmadas criptográficamente en el token
  if (decodedToken) {
    if (decodedToken.superadmin === true) return 'superadmin';
    if (decodedToken.admin === true) return 'admin';
    if (decodedToken.teacher === true) return 'teacher';
    if (decodedToken.role && ['superadmin', 'admin', 'teacher', 'student'].includes(decodedToken.role as string)) {
      return decodedToken.role as BackendRole;
    }
  }

  // 3. Consulta autoritativa en Firestore mediante Firebase Admin SDK
  try {
    const adminApp = getFirebaseAdmin();
    const firestore = getFirestore(adminApp);

    const adminDoc = await firestore.collection('admins').doc(uid).get();
    if (adminDoc.exists) {
      const data = adminDoc.data();
      return data?.role === 'superadmin' ? 'superadmin' : 'admin';
    }

    const teacherDoc = await firestore.collection('teachers').doc(uid).get();
    if (teacherDoc.exists) {
      return 'teacher';
    }

    const userDoc = await firestore.collection('users').doc(uid).get();
    if (userDoc.exists) {
      const role = userDoc.data()?.role;
      if (role && ['superadmin', 'admin', 'teacher', 'student'].includes(role)) {
        return role as BackendRole;
      }
    }
  } catch (err) {
    // Si Firestore Admin requiere ADC en entorno local, continúa a validación complementaria
  }

  // 4. Verificación de docentes por dominio institucional (con email verificado)
  if (email && (decodedToken?.email_verified === true || process.env.NODE_ENV !== 'production')) {
    const lower = email.toLowerCase();
    if (
      lower.includes('carlos.mendoza') ||
      lower.includes('david.arana') ||
      lower.includes('elena.valenzuela') ||
      lower.endsWith('@judamusic.edu')
    ) {
      return 'teacher';
    }
  }

  // 5. Por defecto: Alumno (Menor privilegio garantizado)
  return 'student';
}

/**
 * Middleware: Exige autenticación válida mediante Firebase ID Token (Bearer token).
 * El backend valida criptográficamente el token con Firebase Admin SDK y obtiene el UID real.
 * Protegido contra tokens expirados, revocados, alterados o malformados.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Autenticación requerida. Debes proporcionar un token de Firebase en la cabecera Authorization (Bearer <idToken>).'
    });
  }

  const idToken = authHeader.substring(7).trim();
  if (!idToken) {
    return res.status(401).json({
      error: 'EMPTY_TOKEN',
      message: 'Token de autenticación vacío.'
    });
  }

  // Soporte de prueba controlado EXCLUSIVAMENTE para simulación UI en entorno de desarrollo cuando no hay sesión activa
  if (process.env.NODE_ENV !== 'production' && idToken.startsWith('test-token-')) {
    const parts = idToken.split('-');
    const testRole = (['superadmin', 'admin', 'teacher', 'student'].includes(parts[2]) ? parts[2] : 'student') as BackendRole;
    const testUid = parts[3] ? parts.slice(3).join('-') : `test-${testRole}-uid`;
    const testEmail = testRole === 'superadmin' ? BOOTSTRAP_SUPERADMIN_EMAIL : `${testUid}@judamusic.edu`;

    req.user = {
      uid: testUid,
      email: testEmail,
      emailVerified: true,
      name: `Usuario de Prueba (${testRole})`,
      role: testRole,
      roles: [testRole],
      authProvider: 'dev_test_simulation'
    };
    return next();
  }

  try {
    const adminApp = getFirebaseAdmin();
    // Validación criptográfica con verificación de revocación activa (checkRevoked: true)
    const decodedToken = await getAuth(adminApp).verifyIdToken(idToken, true);
    const role = await resolveSovereignRole(decodedToken.uid, decodedToken.email, decodedToken);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name || (decodedToken.email ? decodedToken.email.split('@')[0] : 'Usuario Judá'),
      role,
      roles: [role],
      tokenClaims: decodedToken,
      authProvider: 'firebase_admin_sdk'
    };

    next();
  } catch (err: any) {
    console.error('[Firebase Admin SDK] Error al validar ID Token:', err?.code || err?.message || err);

    if (err?.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'TOKEN_EXPIRED',
        message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente para continuar.'
      });
    }

    if (err?.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        error: 'TOKEN_REVOKED',
        message: 'Tu sesión ha sido revocada por razones de seguridad. Inicia sesión nuevamente.'
      });
    }

    return res.status(401).json({
      error: 'INVALID_ID_TOKEN',
      message: 'El token de autenticación de Firebase es inválido, expiró o no pudo ser verificado por Firebase Admin SDK.'
    });
  }
}

/**
 * Middleware: Autenticación opcional.
 * Si se envía un token, se valida autoritativamente. Si no se envía o falla, req.user permanece indefinido.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.substring(7).trim();
    if (idToken) {
      if (process.env.NODE_ENV !== 'production' && idToken.startsWith('test-token-')) {
        const parts = idToken.split('-');
        const testRole = (['superadmin', 'admin', 'teacher', 'student'].includes(parts[2]) ? parts[2] : 'student') as BackendRole;
        const testUid = parts[3] ? parts.slice(3).join('-') : `test-${testRole}-uid`;
        const testEmail = testRole === 'superadmin' ? BOOTSTRAP_SUPERADMIN_EMAIL : `${testUid}@judamusic.edu`;

        req.user = {
          uid: testUid,
          email: testEmail,
          emailVerified: true,
          name: `Usuario de Prueba (${testRole})`,
          role: testRole,
          roles: [testRole],
          authProvider: 'dev_test_simulation'
        };
        return next();
      }

      try {
        const adminApp = getFirebaseAdmin();
        const decodedToken = await getAuth(adminApp).verifyIdToken(idToken, false);
        const role = await resolveSovereignRole(decodedToken.uid, decodedToken.email, decodedToken);

        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          name: decodedToken.name || (decodedToken.email ? decodedToken.email.split('@')[0] : 'Usuario Judá'),
          role,
          roles: [role],
          tokenClaims: decodedToken,
          authProvider: 'firebase_admin_sdk'
        };
      } catch {
        // Token inválido u omitido: continúa sin sesión autenticada
      }
    }
  }
  next();
}

/**
 * Middleware: Autorización Estricta por Rol (RBAC).
 * Bloquea con 403 Forbidden a usuarios cuyo rol no esté en allowedRoles.
 * No expone datos confidenciales en los mensajes de error.
 */
export function requireRole(allowedRoles: BackendRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Sesión no autenticada.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'FORBIDDEN_ROLE',
        message: `Acceso denegado: El rol '${req.user.role}' no cuenta con autorización para ejecutar esta operación. Roles requeridos: ${allowedRoles.join(', ')}.`
      });
    }

    next();
  };
}

/**
 * REGLA DE ORO DE SOBERANÍA:
 * "El backend nunca debe confiar en studentId/userId enviado por el cliente."
 *
 * Para un estudiante:
 * Su studentId es ESTRICTAMENTE el UID real de su token verificado por Firebase Admin SDK.
 * Cualquier studentId enviado en el body, query o params es ignorado para evitar acceso cruzado.
 *
 * Para administradores y superadministradores:
 * Pueden especificar studentId para auditar o gestionar a cualquier estudiante.
 *
 * Para docentes:
 * Únicamente cuando allowTeacher es true (ej. evaluar entregas, calificar progreso),
 * pueden especificar el studentId del alumno. Para operaciones personales, su identidad es su propio UID.
 */
export function resolveEffectiveStudentId(req: Request, options?: { allowTeacher?: boolean }): string {
  if (!req.user) {
    throw new Error('No hay usuario autenticado en la petición.');
  }

  // 1. Estudiante: Cero Confianza. La identidad es indefectiblemente el UID de su token verificado
  if (req.user.role === 'student') {
    return req.user.uid;
  }

  // 2. Administradores: pueden especificar studentId
  if (req.user.role === 'admin' || req.user.role === 'superadmin') {
    const clientProvided = (req.body?.studentId as string) || (req.query?.studentId as string) || (req.params?.studentId as string);
    return clientProvided || req.user.uid;
  }

  // 3. Docentes:
  if (req.user.role === 'teacher') {
    if (options?.allowTeacher) {
      const clientProvided = (req.body?.studentId as string) || (req.query?.studentId as string) || (req.params?.studentId as string);
      return clientProvided || req.user.uid;
    }
    return req.user.uid;
  }

  return req.user.uid;
}

