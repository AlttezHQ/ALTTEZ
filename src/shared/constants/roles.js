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

