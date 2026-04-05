/**
 * @module migrationService
 * @description Sistema de migraciones versionadas para schema de datos.
 * Detecta version en localStorage vs version de la app y aplica
 * migraciones en orden sin perder datos.
 *
 * @author @Data (Mateo-Data_Engine)
 * @version 1.0.0
 */

// v4+: la key del schema migra de elevate_ a alttez_
// Al arrancar se lee la clave vieja primero (retrocompatibilidad) y luego la nueva.
const LEGACY_SCHEMA_KEY = "elevate_schema_version";
const SCHEMA_KEY = "alttez_schema_version";
const CURRENT_VERSION = "2.0.0";

/**
 * Registry de migraciones.
 * Cada entrada: { from, to, migrate(data) → data }
 * data = { athletes, historial, clubInfo, matchStats, finanzas }
 */
const MIGRATIONS = [
  {
    from: null, // no version (legacy)
    to: "1.0.0",
    migrate: (data) => {
      // Legacy → 1.0.0: asegurar que todas las entidades existan
      return {
        athletes: data.athletes || [],
        historial: data.historial || [],
        clubInfo: data.clubInfo || {},
        matchStats: data.matchStats || { played:0, won:0, drawn:0, lost:0, goalsFor:0, goalsAgainst:0, points:0 },
        finanzas: data.finanzas || { pagos:[], movimientos:[] },
      };
    },
  },
  {
    from: "1.0.0",
    to: "1.1.0",
    migrate: (data) => {
      // 1.1.0: agregar savedAt a sesiones que no lo tengan
      return {
        ...data,
        historial: (data.historial || []).map(s => ({
          ...s,
          savedAt: s.savedAt || new Date().toISOString(),
        })),
      };
    },
  },
  {
    from: "1.1.0",
    to: "1.2.0",
    migrate: (data) => {
      // 1.2.0: asegurar available derivado de status en athletes
      return {
        ...data,
        athletes: (data.athletes || []).map(a => ({
          ...a,
          available: a.available ?? (a.status === "P"),
        })),
        // Asegurar finanzas tiene estructura correcta
        finanzas: {
          pagos: data.finanzas?.pagos || [],
          movimientos: data.finanzas?.movimientos || [],
        },
      };
    },
  },
  {
    from: "1.2.0",
    to: "2.0.0",
    /**
     * v4 — Rebrand ALTTEZ (2026-04-01)
     * Renombra TODAS las keys elevate_* a alttez_* en localStorage.
     * Opera directamente sobre localStorage (no sobre data deserializada)
     * porque este paso afecta keys que el motor de migraciones no serializa
     * (mode, session, club_id, roles_v2, instructions, tacticas, healthSnapshots, schema_version).
     * Los datos de athletes/historial/etc. son copiados via el ciclo generico.
     * Las keys elevate_* son eliminadas al final.
     */
    migrate: (data) => {
      // Prefijos a migrar
      const PREFIX_OLD = "elevate_";
      const PREFIX_NEW = "alttez_";

      // Recopilar todas las keys elevate_* presentes
      const keysToMigrate = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX_OLD)) {
          keysToMigrate.push(k);
        }
      }

      // Copiar cada key al nuevo prefijo (si la nueva no existe ya)
      keysToMigrate.forEach(oldKey => {
        const newKey = PREFIX_NEW + oldKey.slice(PREFIX_OLD.length);
        if (!localStorage.getItem(newKey)) {
          const val = localStorage.getItem(oldKey);
          if (val !== null) {
            try { localStorage.setItem(newKey, val); } catch { /* quota */ }
          }
        }
        // Eliminar la key vieja
        localStorage.removeItem(oldKey);
      });

      // Migrar tambien la key del store Zustand (elevate-store → alttez-store)
      const zustandOld = "elevate-store";
      const zustandNew = "alttez-store";
      if (!localStorage.getItem(zustandNew)) {
        const val = localStorage.getItem(zustandOld);
        if (val !== null) {
          try { localStorage.setItem(zustandNew, val); } catch { /* quota */ }
        }
      }
      localStorage.removeItem(zustandOld);

      // Retornar data sin cambios — writeAllData se encarga de persistir
      // athletes/historial/etc. con las nuevas keys alttez_
      return data;
    },
  },
];

/**
 * Lee la version actual del schema en localStorage.
 * Busca primero en la key nueva (alttez_), luego en la legacy (elevate_).
 * @returns {string|null}
 */
function getStoredVersion() {
  return (
    localStorage.getItem(SCHEMA_KEY) ||
    localStorage.getItem(LEGACY_SCHEMA_KEY) ||
    null
  );
}

/**
 * Guarda la version actual del schema.
 */
function setStoredVersion(version) {
  localStorage.setItem(SCHEMA_KEY, version);
}

/**
 * Lee todos los datos actuales de localStorage.
 * Fallback: si una key alttez_ no existe, intenta la key legacy elevate_.
 * Esto permite que readAllData() funcione correctamente ANTES de la migración v4.
 */
function readAllData() {
  const read = (key, legacyKey, fallback) => {
    try {
      const r = localStorage.getItem(key) ?? localStorage.getItem(legacyKey);
      return r ? JSON.parse(r) : fallback;
    }
    catch { return fallback; }
  };
  return {
    athletes:   read("alttez_athletes",   "elevate_athletes",   []),
    historial:  read("alttez_historial",  "elevate_historial",  []),
    clubInfo:   read("alttez_clubInfo",   "elevate_clubInfo",   {}),
    matchStats: read("alttez_matchStats", "elevate_matchStats", { played:0, won:0, drawn:0, lost:0, goalsFor:0, goalsAgainst:0, points:0 }),
    finanzas:   read("alttez_finanzas",   "elevate_finanzas",   { pagos:[], movimientos:[] }),
  };
}

/**
 * Escribe datos migrados de vuelta a localStorage usando las keys alttez_.
 */
function writeAllData(data) {
  const write = (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.error(`[migrationService] Quota exceeded writing ${key}:`, e.name); }
  };
  write("alttez_athletes",   data.athletes);
  write("alttez_historial",  data.historial);
  write("alttez_clubInfo",   data.clubInfo);
  write("alttez_matchStats", data.matchStats);
  write("alttez_finanzas",   data.finanzas);
}

/**
 * Ejecuta migraciones pendientes.
 * @returns {{ migrated: boolean, from: string|null, to: string, steps: number }}
 */
export function runMigrations() {
  const storedVersion = getStoredVersion();

  if (storedVersion === CURRENT_VERSION) {
    return { migrated: false, from: storedVersion, to: CURRENT_VERSION, steps: 0 };
  }

  // Si no hay datos (fresh install): ninguna de las dos keys de modo existe
  const mode = localStorage.getItem("alttez_mode") || localStorage.getItem("elevate_mode");
  if (!mode) {
    setStoredVersion(CURRENT_VERSION);
    return { migrated: false, from: null, to: CURRENT_VERSION, steps: 0 };
  }

  // Encontrar migraciones pendientes
  let currentVersion = storedVersion;
  let data = readAllData();
  let steps = 0;

  for (const migration of MIGRATIONS) {
    if (migration.from === currentVersion) {
      try {
        data = migration.migrate(data);
        currentVersion = migration.to;
        steps++;
      } catch (e) {
        console.error(`[migrationService] Failed at ${migration.from} → ${migration.to}:`, e);
        break;
      }
    }
  }

  if (steps > 0) {
    writeAllData(data);
  }

  setStoredVersion(CURRENT_VERSION);
  return { migrated: steps > 0, from: storedVersion, to: CURRENT_VERSION, steps };
}

/** Version actual del schema de la app */
export const APP_SCHEMA_VERSION = CURRENT_VERSION;
