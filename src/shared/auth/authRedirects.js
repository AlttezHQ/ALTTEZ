/**
 * Navegación central posterior a la autenticación.
 * Mientras ALTTEZ opera enfocado en Torneos, ningún flujo autenticado debe
 * terminar en CRM, Interno o el selector histórico de productos.
 */

const ALLOWED_REDIRECTS = ["/torneos"];

function isAllowedRedirect(path) {
  return typeof path === "string" && ALLOWED_REDIRECTS.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`),
  );
}

export function getPostLoginRedirect({ redirectPath, currentPath } = {}) {
  if (isAllowedRedirect(redirectPath)) return redirectPath;
  if (isAllowedRedirect(currentPath)) return currentPath;
  return "/torneos";
}

export function getPostLogoutRedirect() {
  return "/auth/login?redirect=/torneos";
}

export function getPostRegisterRedirect() {
  return "/torneos";
}

export function getRedirectParam() {
  if (typeof window === "undefined") return null;
  const redirect = new URLSearchParams(window.location.search).get("redirect");
  return isAllowedRedirect(redirect) ? redirect : null;
}
