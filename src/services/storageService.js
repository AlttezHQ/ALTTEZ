/**
 * @module storageService
 * @description Capa de abstraccion sobre localStorage.
 * Centraliza lectura, escritura, limpieza y migracion de datos.
 * En futuro: reemplazar internals por Supabase sin cambiar la API.
 *
 * @author @Arquitecto (Julian)
 * @version 1.0.0
 */

import {
  DEMO_ATHLETES, DEMO_HISTORIAL, DEMO_CLUB_INFO, DEMO_MATCH_STATS, DEMO_FINANZAS,
  EMPTY_ATHLETES, EMPTY_HISTORIAL, EMPTY_MATCH_STATS, EMPTY_FINANZAS,
  createEmptyClubInfo, STORAGE_KEYS,
} from "../constants/initialStates";
import { validateSesion } from "../constants/schemas";
import { SESSION_KEY, createSession, validateSession } from "../constants/roles";

const DEFAULT_CLUB = { nombre:"", disciplina:"", ciudad:"", entrenador:"", temporada:"", categorias:[], campos:[], descripcion:"", telefono:"", email:"" };

// ── Callback para errores de cuota (inyectado desde App) ──
let _onStorageError = null;
export function setStorageErrorHandler(handler) { _onStorageError = handler; }

// ── Helpers de bajo nivel ──

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[storageService] Error writing "${key}":`, e.name);
    if (_onStorageError) {
      _onStorageError(`Error guardando datos (${e.name}). Libera espacio en el navegador.`);
    }
  }
}

function remove(key) {
  window.localStorage.removeItem(key);
}

// ── API Publica ──

/** Lee el modo actual de la app */
export function getMode() {
  return read("elevate_mode", null);
}

/** Limpia selectivamente todas las keys de Elevate */
export function clearAll() {
  STORAGE_KEYS.forEach(k => remove(k));
}

/** Carga estado demo: limpia + escribe datos simulados + sesion admin */
export function loadDemoState() {
  clearAll();
  write("elevate_athletes", DEMO_ATHLETES);
  write("elevate_historial", DEMO_HISTORIAL);
  write("elevate_clubInfo", DEMO_CLUB_INFO);
  write("elevate_matchStats", DEMO_MATCH_STATS);
  write("elevate_finanzas", DEMO_FINANZAS);
  write("elevate_mode", "demo");
  // Sesion RBAC: demo siempre es admin
  const session = createSession("admin", "Demo User");
  write(SESSION_KEY, session);
}

/** Carga estado produccion: limpia + escribe esquema vacio + sesion admin */
export function loadProductionState(form) {
  clearAll();
  write("elevate_athletes", EMPTY_ATHLETES);
  write("elevate_historial", EMPTY_HISTORIAL);
  write("elevate_clubInfo", createEmptyClubInfo(form));
  write("elevate_matchStats", EMPTY_MATCH_STATS);
  write("elevate_finanzas", EMPTY_FINANZAS);
  write("elevate_mode", "production");
  // Sesion RBAC: creador del club es admin
  const session = createSession("admin", form.entrenador || "Entrenador");
  write(SESSION_KEY, session);
}

/** Cierra sesion: limpia todo y vuelve a landing */
export function logout() {
  clearAll();
}

/** Calcula stats del plantel en tiempo real */
export function calcStats(athletes, historial) {
  const rpes = athletes.filter(a => a.status === "P" && a.rpe).map(a => a.rpe);
  return {
    presentes:  athletes.filter(a => a.status === "P").length,
    ausentes:   athletes.filter(a => a.status === "A").length,
    lesionados: athletes.filter(a => a.status === "L").length,
    rpeAvg:     rpes.length ? (rpes.reduce((a, b) => a + b, 0) / rpes.length).toFixed(1) : "\u2014",
    sesiones:   historial.length,
    asistencia: Math.round(
      (historial.reduce((a, s) => a + s.presentes, 0) /
       Math.max(historial.reduce((a, s) => a + s.total, 0), 1)) * 100
    ),
  };
}

/** Crea una nueva sesion de entrenamiento */
export function buildSesion(athletes, historial, nota, tipo) {
  const presentes = athletes.filter(a => a.status === "P");
  const rpesValidos = presentes.filter(a => a.rpe).map(a => a.rpe);
  const rpePromedio = rpesValidos.length
    ? (rpesValidos.reduce((acc, v) => acc + v, 0) / rpesValidos.length).toFixed(1)
    : null;

  const num = historial.length > 0 ? historial[0].num + 1 : 1;
  const hoy = new Date();
  const dias  = ["Dom","Lun","Mar","Mie","Jue","Vie","Sab"];
  const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const fecha = `${dias[hoy.getDay()]} ${hoy.getDate()} ${meses[hoy.getMonth()]}`;

  // Persistir RPE individual por atleta para tracking de salud real
  const rpeByAthlete = {};
  presentes.forEach(a => {
    if (a.rpe != null && a.rpe >= 1 && a.rpe <= 10) {
      rpeByAthlete[a.id] = a.rpe;
    }
  });

  const sesion = {
    num, fecha,
    presentes: presentes.length,
    total: athletes.length,
    rpeAvg: rpePromedio,
    rpeByAthlete,
    tipo: tipo || "Sesion",
    nota,
    savedAt: new Date().toISOString(),
  };

  // @Mateo: validateSesion() conectada — no mas codigo muerto
  const validation = validateSesion(sesion);
  if (!validation.valid) {
    console.error("[storageService.buildSesion] Validacion fallida:", validation.errors);
    if (_onStorageError) {
      _onStorageError(`Sesion #${num} tiene datos inconsistentes: ${validation.errors[0]}`);
    }
  }

  return sesion;
}

// ── Sesion de usuario (RBAC) ──

/** Crea y persiste sesion de usuario al login */
export function loginSession(role, userName) {
  const session = createSession(role, userName);
  write(SESSION_KEY, session);
  return session;
}

/** Lee y valida la sesion actual — detecta manipulacion via DevTools */
export function getSession() {
  const session = read(SESSION_KEY, null);
  if (!session) return null;
  if (!validateSession(session)) {
    remove(SESSION_KEY);
    if (_onStorageError) _onStorageError("Sesion corrupta detectada. Iniciando de nuevo.");
    return null;
  }
  return session;
}

/** Rol actual del usuario */
export function getCurrentRole() {
  const session = getSession();
  return session?.role || null;
}

// ── Backup / Export ──

/** Exporta todos los datos de Elevate como JSON descargable */
export function exportBackup() {
  const clubInfo = read("elevate_clubInfo", {});
  const clubSlug = (clubInfo.nombre || "elevate").replace(/[^a-zA-Z0-9]/g, "_");
  const backup = {
    _app: "Elevate Sports",
    _version: "1.2.0",
    _exportedAt: new Date().toISOString(),
  };
  STORAGE_KEYS.forEach(key => { backup[key] = read(key, null); });
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${clubSlug}_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Importa un backup JSON y restaura todos los datos.
 * @param {string} jsonString
 * @returns {{ success: boolean, error?: string, clubName?: string }}
 */
export function importBackup(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data._app || data._app !== "Elevate Sports") {
      return { success: false, error: "No es un backup valido de Elevate Sports" };
    }
    clearAll();
    STORAGE_KEYS.forEach(key => { if (data[key] != null) write(key, data[key]); });
    return { success: true, clubName: data.elevate_clubInfo?.nombre || "Club" };
  } catch (e) {
    return { success: false, error: "Error leyendo archivo: " + e.message };
  }
}

export default {
  getMode, clearAll, loadDemoState, loadProductionState, logout,
  calcStats, buildSesion, loginSession, getSession, getCurrentRole,
  exportBackup, importBackup, setStorageErrorHandler,
};
