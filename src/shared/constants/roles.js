/**
 * @module roles
 * @description Sistema de roles y permisos para ALTTEZ.
 * Estructura RBAC (Role-Based Access Control) sobre localStorage.
 *
 * Roles:
 *  - admin:  Creador del club. Acceso total (plantilla, finanzas, config, exportar).
 *  - coach:  Entrenador. Acceso a entrenamiento, plantilla, tactica. Sin finanzas.
 *  - staff:  Auxiliar. Solo lectura + registro de asistencia/RPE.
 *
 * @author @Arquitecto (Julian)
 * @version 1.0.0
 */

export const ROLES = {
  admin: {
    label: "Administrador",
    description: "Acceso total al club",
    permissions: [
      "view:home", "view:entrenamiento", "view:plantilla", "view:admin",
      "view:miclub", "view:reportes", "view:calendario", "view:partidos",
      "edit:athletes", "edit:sesion", "edit:finanzas", "edit:clubInfo",
      "edit:tactical", "export:backup", "manage:roles",
    ],
  },
  coach: {
    label: "Entrenador",
    description: "Entrenamiento, plantilla y tactica",
    permissions: [
      "view:home", "view:entrenamiento", "view:plantilla", "view:reportes", "view:calendario", "view:partidos",
      "edit:athletes", "edit:sesion", "edit:tactical",
    ],
  },
  staff: {
    label: "Auxiliar",
    description: "Asistencia y RPE",
    permissions: [
      "view:home", "view:entrenamiento",
      "edit:sesion",
    ],
  },
};

/** Verifica si un rol tiene un permiso especifico */
export function hasPermission(role, permission) {
  const def = ROLES[role];
  if (!def) return false;
  return def.permissions.includes(permission);
}

/** Verifica si un rol puede acceder a un modulo */
export function canAccessModule(role, moduleName) {
  return hasPermission(role, `view:${moduleName}`);
}

/** Verifica si un rol puede editar un recurso */
export function canEdit(role, resource) {
  return hasPermission(role, `edit:${resource}`);
}

/** Retorna la lista de modulos accesibles para un rol */
export function getAccessibleModules(role) {
  const def = ROLES[role];
  if (!def) return [];
  return def.permissions
    .filter(p => p.startsWith("view:"))
    .map(p => p.replace("view:", ""));
}

/** Session key en localStorage */
export const SESSION_KEY = "alttez_session";

/**
 * Crea una sesion de usuario con integridad basica.
 * @param {string} role - "admin" | "coach" | "staff"
 * @param {string} userName - Nombre del usuario
 * @returns {Object} Sesion serializable
 */
export function createSession(role, userName) {
  if (!ROLES[role]) throw new Error(`Rol invalido: ${role}`);
  const payload = {
    role,
    userName: userName || "Entrenador",
    createdAt: new Date().toISOString(),
    version: "1.0",
  };
  // Checksum simple para detectar manipulacion via DevTools
  payload.checksum = computeChecksum(payload);
  return payload;
}

/**
 * Valida la integridad de una sesion leida desde localStorage.
 * @param {Object} session
 * @returns {boolean}
 */
export function validateSession(session) {
  if (!session || typeof session !== "object") return false;
  if (!ROLES[session.role]) return false;
  if (!session.userName || !session.createdAt || !session.version) return false;
  const expected = computeChecksum({
    role: session.role,
    userName: session.userName,
    createdAt: session.createdAt,
    version: session.version,
  });
  return session.checksum === expected;
}

/**
 * @deprecated INSEGURO — NO usar para decisiones de autorización.
 *
 * Este checksum usa un salt hardcodeado ("alttez_salt_2026") que es visible
 * en el bundle de produccion. Cualquier persona con DevTools puede:
 *   1. Leer el salt desde el JS bundle (no ofuscado).
 *   2. Recalcular un checksum válido para role="admin" con cualquier userName.
 *   3. Escribir la sesion forjada en localStorage y obtener privilegios de admin.
 *
 * El rol DEBE ser siempre resuelto desde Supabase Auth (authProfile.role).
 * Este checksum solo sirve como detección casual de corrupción accidental de datos,
 * nunca como control de seguridad. Pendiente de reemplazar por un token
 * firmado con una clave server-side (HMAC-SHA256 en Edge Function).
 *
 * Ref: Hallazgo 1 — Boletin de Vulnerabilidades 2026-03-29
 */
function computeChecksum({ role, userName, createdAt, version }) {
  const raw = `${role}:${userName}:${createdAt}:${version}:alttez_salt_2026`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const c = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash |= 0;
  }
  return "es_" + Math.abs(hash).toString(36);
}
