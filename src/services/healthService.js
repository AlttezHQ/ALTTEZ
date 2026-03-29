/**
 * @module healthService
 * @description Servicio de HealthSnapshots.
 * Cada vez que se cierra una sesion, guarda una "foto" del estado
 * de salud de cada jugador presente para tracking historico.
 *
 * @author @Data (Mateo-Data_Engine)
 * @version 1.0.0
 */

import { calcSaludActual } from "../utils/rpeEngine";

const STORAGE_KEY_BASE = "elevate_healthSnapshots";
const MAX_SNAPSHOTS = 500;

let _onError = null;
let _currentClubId = null;

export function setHealthErrorHandler(handler) { _onError = handler; }

/**
 * Registra el clubId activo para aislar datos entre clubes en dispositivos compartidos.
 * Llamar despues de login/setClubId.
 * @param {string|null} clubId
 */
export function setHealthClubId(clubId) { _currentClubId = clubId; }

/**
 * Retorna la clave de localStorage para el club activo.
 * Si no hay clubId (modo demo o offline puro) usa la clave base.
 * @returns {string}
 */
function getStorageKey() {
  return _currentClubId
    ? `${STORAGE_KEY_BASE}_${_currentClubId}`
    : STORAGE_KEY_BASE;
}

/** Lee snapshots desde localStorage (aislados por clubId) */
export function getSnapshots() {
  try {
    const raw = window.localStorage.getItem(getStorageKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Escribe snapshots a localStorage (aislados por clubId) */
function saveSnapshots(snapshots) {
  try {
    // Mantener solo los ultimos MAX_SNAPSHOTS
    const trimmed = snapshots.slice(-MAX_SNAPSHOTS);
    window.localStorage.setItem(getStorageKey(), JSON.stringify(trimmed));
  } catch (e) {
    console.error("[healthService] Error saving snapshots:", e.name);
    if (_onError) _onError(`Error guardando historial de salud (${e.name}). Libera espacio.`);
  }
}

/**
 * Genera y persiste un snapshot de salud para todos los atletas presentes.
 * Llamar al guardar/cerrar una sesion.
 *
 * @param {Array} athletes - Plantel completo con { id, name, status, rpe }
 * @param {Array} historial - Historial de sesiones
 * @param {number} sessionNum - Numero de la sesion que se esta cerrando
 * @returns {Array} Los snapshots generados
 */
export function takeHealthSnapshot(athletes, historial, sessionNum) {
  const now = new Date().toISOString();
  const presentes = athletes.filter(a => a.status === "P");

  const newSnapshots = presentes.map(a => {
    // Pasar a.id como tercer argumento para filtrar RPE individual del atleta
    // en el historial (ACWR correcto por atleta, no promedio del plantel)
    const { salud, riskLevel, rpeAvg7d } = calcSaludActual(a.rpe, historial, a.id);
    return {
      athleteId: a.id,
      athleteName: a.name,
      fecha: now,
      sessionNum,
      salud,
      riskLevel,
      rpeAvg7d,
      rpeActual: a.rpe,
    };
  });

  const existing = getSnapshots();
  const updated = [...existing, ...newSnapshots];
  saveSnapshots(updated);

  return newSnapshots;
}

/**
 * Obtiene el historial de salud de un atleta especifico.
 * @param {number} athleteId
 * @param {number} [limit=20] - Maximo de snapshots a retornar
 * @returns {Array} Snapshots ordenados por fecha desc
 */
export function getAthleteHealthHistory(athleteId, limit = 20) {
  return getSnapshots()
    .filter(s => s.athleteId === athleteId)
    .slice(-limit)
    .reverse();
}

/**
 * Obtiene el ultimo snapshot de salud del plantel completo.
 * @returns {Map<number, Object>} athleteId → ultimo snapshot
 */
export function getLatestPlantelHealth() {
  const snapshots = getSnapshots();
  const map = new Map();
  // Recorrer de mas antiguo a mas reciente para que el ultimo sobrescriba
  snapshots.forEach(s => map.set(s.athleteId, s));
  return map;
}

/**
 * Obtiene atletas en riesgo (salud < 30) del ultimo snapshot.
 * @returns {Array} Snapshots de atletas en riesgo
 */
export function getAtRiskAthletes() {
  const latest = getLatestPlantelHealth();
  return Array.from(latest.values()).filter(s => s.riskLevel === "riesgo");
}

/**
 * Limpia todos los snapshots del club activo (para logout/reset).
 * Si habia un clubId registrado, elimina su clave especifica.
 * Tambien limpia la clave base por compatibilidad con sesiones previas.
 */
export function clearSnapshots() {
  window.localStorage.removeItem(getStorageKey());
  // Limpiar clave base para no dejar datos huerfanos de sesiones pre-clubId
  if (_currentClubId) {
    window.localStorage.removeItem(STORAGE_KEY_BASE);
  }
  _currentClubId = null;
}
