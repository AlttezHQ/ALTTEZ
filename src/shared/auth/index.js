/**
 * @module auth/index
 * @description Re-exports públicos del sistema de autenticación de ALTTEZ.
 * Punto de entrada único para que CRM, Torneos y cualquier producto
 * futuro importen auth de forma consistente.
 *
 * Uso:
 *   import { AuthProvider, useAuth } from "../shared/auth";
 *   import { validateLoginForm } from "../shared/auth";
 *
 * @version 1.0.0
 */

// Provider y Hook
export { default as AuthProvider } from "./AuthProvider";
export { useAuth } from "./useAuth";

// Validaciones
export {
  validateLoginForm,
  validateRegisterForm,
  validateTorneosInlineRegister,
  validateTorneosInlineLogin,
  normalizeEmail,
} from "./authValidation";

// Redirects
export {
  getPostLoginRedirect,
  getPostLogoutRedirect,
  getPostRegisterRedirect,
  getRedirectParam,
} from "./authRedirects";

// Componente principal de landing (mantiene compatibilidad)
export { default as LandingPage } from "./LandingPage";
