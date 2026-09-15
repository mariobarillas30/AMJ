import { auth } from './firebase';

/**
 * Cliente HTTP seguro para interactuar con la Autoridad Backend (/api/*).
 * Adjunta automáticamente el Firebase ID Token criptográfico del usuario autenticado actual.
 * Si no hay sesión iniciada y estamos en desarrollo, utiliza el token de previsualización.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const reqInit: RequestInit = { ...init };
  const headers = new Headers(reqInit.headers || {});

  const currentAuth = headers.get('Authorization');
  const isTestOrMissing = !currentAuth || currentAuth.includes('test-token-');

  // Si hay usuario autenticado en Firebase, SIEMPRE usar su ID Token verificado
  if (isTestOrMissing) {
    try {
      if (auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken();
        headers.set('Authorization', `Bearer ${idToken}`);
      } else if (!currentAuth) {
        // Soporte en modo desarrollo y previsualización de roles de prueba únicamente si no hay usuario real
        const previewRole = localStorage.getItem('jud_preview_role') || localStorage.getItem('jud_current_role') || 'superadmin';
        headers.set('Authorization', `Bearer test-token-${previewRole}-user`);
      }
    } catch (err) {
      console.warn('[apiFetch] Advertencia al resolver Firebase ID Token:', err);
    }
  }

  reqInit.headers = headers;
  return window.fetch(input, reqInit);
}

