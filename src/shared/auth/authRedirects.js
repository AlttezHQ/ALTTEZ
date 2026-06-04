/**
 * @module authRedirects
 * @description Lógica centralizada de navegación post-auth para ALTTEZ.
 * Define destinos correctos después de login, registro y logout.
 *
 * @version 2.0.0
 */

const ALLOWED_REDIRECTS = ["/crm", "/torneos", "/launcher", "/interno"];

/**
 * Determina el destino post-login implementando Smart Routing.
 *
 * @param {Object} options
 * @param {string|null} options.redirectPath - Ruta explícita solicitada
 * @param {string|null} options.currentPath  - Ruta actual del usuario
 * @param {Object|null} options.userMetadata - Metadata (roles) de Supabase Auth
 * @returns {string} Ruta destino
 */
export function getPostLoginRedirect({ redirectPath, currentPath, userMetadata, profile } = {}) {
  const roles = userMetadata?.roles || [];
  
  // Detección de roles implícitos para cuentas Legacy
  const impliedClubRole = roles.includes("club") || Boolean(profile?.club_id);
  const impliedOrganizadorRole = roles.includes("organizador");

  // 1. Prioridad Máxima: redirect explícito válido (ej. "Acceso interno" → /interno)
  if (redirectPath && ALLOWED_REDIRECTS.some(r => redirectPath.startsWith(r))) {
    return redirectPath;
  }

  // 2. Usuarios Multi-Entorno (sin redirect explícito) pasan por el App Launcher
  if (impliedClubRole && impliedOrganizadorRole) {
    return "/launcher";
  }

  // 3. Si venía de una ruta de producto válida
  if (currentPath) {
    if (currentPath.startsWith("/torneos")) return currentPath;
    if (currentPath.startsWith("/crm")) return currentPath;
  }

  // 4. Smart Routing basado en roles (explícitos o implícitos)
  if (impliedClubRole && !impliedOrganizadorRole) return "/crm";
  if (impliedOrganizadorRole && !impliedClubRole) return "/torneos";

  if (userMetadata && userMetadata.current_app === "torneos") return "/torneos";
  if (userMetadata && userMetadata.current_app === "crm") return "/crm";

  // 5. Default fallback para el ecosistema: App Launcher
  // Esto permite que usuarios legacy sin roles definidos, o usuarios nuevos,
  // elijan a dónde quieren ir.
  return "/launcher";
}

/**
 * Determina el destino post-logout.
 * Single Sign-Out: siempre expulsa al portal de autenticación único.
 *
 * @returns {string} Ruta destino
 */
export function getPostLogoutRedirect() {
  return "/auth/login";
}

/**
 * Determina el destino post-registro.
 * El registro universal envía a CRM por defecto para su Onboarding,
 * o si sabemos que venía para Torneos, lo mandamos a Torneos.
 *
 * @param {string} source - "universal" | "torneos" | "crm"
 * @returns {string} Ruta destino
 */
export function getPostRegisterRedirect(source) {
  // Con el SSO, el source suele ser universal. El routing lo enviará a CRM para onboarding
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
