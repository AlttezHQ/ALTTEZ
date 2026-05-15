/**
 * @module authRedirects
 * @description Lógica centralizada de navegación post-auth para ALTTEZ.
 * Define destinos correctos después de login, registro y logout.
 *
 * Principios:
 *  - Login desde /crm → queda en /crm
 *  - Login desde /torneos → queda en /torneos
 *  - Login con ?redirect= → respeta el redirect
 *  - Logout → vuelve al auth gate del producto donde estaba
 *  - Nunca redirige al portal marketing ("/") después de logout de producto
 *
 * @version 1.0.0
 */

// ── Rutas válidas para redirect ─────────────────────────────────────────────

const ALLOWED_REDIRECTS = ["/crm", "/torneos"];

/**
 * Determina el destino post-login.
 * Prioridad: redirectPath explícito > ruta del producto > /crm por defecto.
 *
 * @param {Object} options
 * @param {string|null} options.redirectPath - Ruta explícita solicitada
 * @param {string|null} options.currentPath  - Ruta actual del usuario
 * @param {Object|null} options.profile      - Perfil con club_id, role, etc.
 * @returns {string} Ruta destino
 */
export function getPostLoginRedirect({ redirectPath, currentPath } = {}) {
  // 1. Redirect explícito (si es válido)
  if (redirectPath && ALLOWED_REDIRECTS.some(r => redirectPath.startsWith(r))) {
    return redirectPath;
  }

  // 2. Mantener en el producto actual
  if (currentPath) {
    if (currentPath.startsWith("/torneos")) return "/torneos";
    if (currentPath.startsWith("/crm")) return "/crm";
  }

  // 3. Default: CRM
  return "/crm";
}

/**
 * Determina el destino post-logout.
 * El usuario debe volver al auth gate del producto donde estaba,
 * NO al portal marketing.
 *
 * @param {string} currentPath - Ruta actual del usuario
 * @returns {string} Ruta destino
 */
export function getPostLogoutRedirect(currentPath) {
  // Si estaba en Torneos, vuelve al auth gate de Torneos
  if (currentPath && currentPath.startsWith("/torneos")) {
    return "/torneos";
  }
  // Si estaba en CRM, vuelve al auth gate de CRM
  if (currentPath && currentPath.startsWith("/crm")) {
    return "/crm";
  }
  // Fallback: portal
  return "/";
}

/**
 * Determina el destino post-registro.
 * Registro para torneos → /torneos
 * Registro para CRM → /crm (el CRMApp maneja el setup de estado)
 *
 * @param {string} source - "torneos" | "crm" | null
 * @returns {string} Ruta destino
 */
export function getPostRegisterRedirect(source) {
  if (source === "torneos") return "/torneos";
  return "/crm";
}

/**
 * Extrae el parámetro ?redirect= de la URL actual.
 * @returns {string|null}
 */
export function getRedirectParam() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");
  if (redirect && ALLOWED_REDIRECTS.some(r => redirect.startsWith(r))) {
    return redirect;
  }
  return null;
}
