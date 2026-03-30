/**
 * @module healthService
 * @description Servicio de HealthSnapshots — Registro historico de salud del plantel.
 *
 * ══════════════════════════════════════════════════════════════════
 *  QUE ES UN HEALTH SNAPSHOT
 * ══════════════════════════════════════════════════════════════════
 *
 *  Un Health Snapshot es una "fotografia" del estado de salud de un
 *  atleta calculada en un momento especifico: el cierre de una sesion
 *  de entrenamiento. Captura el indice SaludActual (0-100), el nivel
 *  de riesgo (semaforo), el RPE promedio de los ultimos 7 dias y el
 *  RPE de la sesion que se esta cerrando.
 *
 *  Estructura de un snapshot:
 *    {
 *      athleteId:   number,   // ID del atleta
 *      athleteName: string,   // Nombre (desnormalizado para queries rapidas)
 *      fecha:       string,   // ISO 8601 del momento del cierre de sesion
 *      sessionNum:  number,   // Numero de sesion del ciclo de entrenamiento
 *      salud:       number,   // Indice de salud [0-100] (rpeEngine.calcSaludActual)
 *      riskLevel:   string,   // "optimo" | "precaucion" | "riesgo" | "sin_datos"
 *      rpeAvg7d:    number|null, // RPE promedio 7d en el momento del snapshot
 *      rpeActual:   number|null  // RPE de la sesion que genero el snapshot
 *    }
 *
 *  CUANDO SE GENERA UN SNAPSHOT
 *  ----------------------------
 *  Se genera al llamar takeHealthSnapshot(), que el entrenador activa
 *  al guardar/cerrar una sesion de entrenamiento en el modulo de
 *  Entrenamiento. Solo se capturan snapshots de atletas presentes (status "P")
 *  en la sesion, no de ausentes o lesionados.
 *
 *  COMO SE USA EL SEMAFORO
 *  -----------------------
 *  1. En tiempo real: calcSaludActual() en rpeEngine genera el semaforo
 *     para la sesion activa (sin guardar). El entrenador ve el color de
 *     cada atleta mientras registra RPEs.
 *  2. Historico: takeHealthSnapshot() guarda la foto al cerrar sesion.
 *     getAthleteHealthHistory() recupera el historial para el grafico
 *     de tendencia de salud en el perfil del jugador.
 *  3. Alertas de plantel: getAtRiskAthletes() retorna los atletas en
 *     riesgo del ultimo snapshot, usado en el dashboard del entrenador.
 *
 *  PERSISTENCIA
 *  ------------
 *  Los snapshots se almacenan en localStorage con aislamiento por club:
 *    clave: "elevate_healthSnapshots_{clubId}"
 *  Limite: MAX_SNAPSHOTS = 500 (FIFO, se eliminan los mas antiguos).
 *  En futuras versiones, se sincronizaran a Supabase para persistencia
 *  multi-dispositivo (planificado en v3.0 junto con ACWR).
 *
 *  MULTI-TENANCY
 *  -------------
 *  setHealthClubId(clubId) debe llamarse despues de login para aislar
 *  los datos de cada club en dispositivos compartidos. Sin clubId, los
 *  datos se guardan bajo la clave base (modo demo/offline).
 *
 * @author @Data (Mateo-Data_Engine)
 * @version 1.0.0
 */

import { calcSaludActual } from "../utils/rpeEngine";

const STORAGE_KEY_BASE = "elevate_healthSnapshots";
const MAX_SNAPSHOTS = 500;

let _onError = null;
let _currentClubId = null;

/**
 * Registra un manejador de errores para fallos de persistencia en localStorage.
 * El manejador recibe un string con el mensaje de error formateado para el usuario.
 * Util para mostrar toasts de error en la UI sin acoplar el servicio a React.
 *
 * @param {function(string): void} handler - Callback que recibe el mensaje de error
 */
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

/**
 * Lee todos los snapshots de salud del club activo desde localStorage.
 *
 * Retorna array vacio (no lanza) ante cualquier error de parsing o
 * acceso, para garantizar que fallas de storage no rompan la UI.
 * Los snapshots estan ordenados cronologicamente ascendente (el mas
 * antiguo primero) ya que se persisten en orden de insercion.
 *
 * @returns {Array<{athleteId: number, athleteName: string, fecha: string,
 *   sessionNum: number, salud: number, riskLevel: string,
 *   rpeAvg7d: number|null, rpeActual: number|null}>}
 */
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
 * Genera y persiste snapshots de salud para todos los atletas presentes
 * en la sesion que se esta cerrando.
 *
 * Proceso interno:
 *   1. Filtra athletes por status === "P" (Presente).
 *   2. Para cada atleta presente, llama calcSaludActual(rpe, historial, id)
 *      para obtener salud, riskLevel y rpeAvg7d con RPE individual.
 *   3. Construye un snapshot con fecha ISO del momento del cierre.
 *   4. Combina con snapshots existentes y persiste (trim a MAX_SNAPSHOTS).
 *   5. Retorna los snapshots nuevos para confirmacion en la UI.
 *
 * Punto critico de multi-tenancy: usa getStorageKey() que incluye
 * _currentClubId en la clave, garantizando aislamiento entre clubes.
 *
 * @param {Array<{id: number, name: string, status: string, rpe: number|null}>} athletes
 *   Plantel con status actualizado. Solo los de status "P" generan snapshot.
 * @param {Array} historial - Historial de sesiones (mismo formato que rpeEngine)
 * @param {number} sessionNum - Numero de la sesion del ciclo actual
 * @returns {Array} Array de snapshots generados en esta llamada
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
 * Obtiene el historial de salud de un atleta especifico para visualizacion.
 *
 * Los snapshots se retornan en orden cronologico descendente (el mas reciente
 * primero), adecuado para mostrar "ultimo estado" en listas y tablas.
 * Para graficos de tendencia temporal, invertir el orden en el componente.
 *
 * Uso tipico: grafico de tendencia de salud en el perfil del jugador,
 * tabla de historial de sesiones en el modulo de Entrenamiento.
 *
 * @param {number} athleteId - ID del atleta
 * @param {number} [limit=20] - Maximo de snapshots a retornar (los mas recientes)
 * @returns {Array} Snapshots del atleta, ordenados por fecha descendente
 */
export function getAthleteHealthHistory(athleteId, limit = 20) {
  return getSnapshots()
    .filter(s => s.athleteId === athleteId)
    .slice(-limit)
    .reverse();
}

/**
 * Obtiene el ultimo snapshot de salud conocido para cada atleta del plantel.
 *
 * Implementa semantica "last-write-wins": recorre todos los snapshots de
 * mas antiguo a mas reciente, y el ultimo valor por athleteId sobrescribe
 * al anterior en el Map. Esto garantiza que el mapa siempre refleja el
 * estado mas reciente sin necesidad de ordenar.
 *
 * Uso tipico: dashboard de estado del plantel (semaforo de todos los
 * jugadores en una sola vista), deteccion de atletas en riesgo.
 *
 * @returns {Map<number, Object>} Map de athleteId → snapshot mas reciente.
 *   Atletas sin ningun snapshot no aparecen en el Map.
 */
export function getLatestPlantelHealth() {
  const snapshots = getSnapshots();
  const map = new Map();
  // Recorrer de mas antiguo a mas reciente para que el ultimo sobrescriba
  snapshots.forEach(s => map.set(s.athleteId, s));
  return map;
}

/**
 * Obtiene los atletas en estado de riesgo segun su ultimo snapshot.
 *
 * Filtra por riskLevel === "riesgo" (equivale a salud < 25, RPE_avg > 7.5)
 * usando el Map de getLatestPlantelHealth() para obtener el estado mas
 * reciente de cada atleta.
 *
 * Uso tipico: alerta en el dashboard del entrenador ("3 jugadores en
 * riesgo de lesion"), lista de prioridades para el medico del club.
 *
 * Nota: el comentario en el codigo indica "salud < 30" pero el umbral
 * real de clasificacion "riesgo" en calcSaludActual v2.1 es salud < 25
 * (RPE_avg > 7.5). El filtro usa riskLevel (string) para mantenerse
 * sincronizado automaticamente con cualquier cambio de umbral en rpeEngine.
 *
 * @returns {Array<Object>} Array de snapshots de atletas con riskLevel "riesgo".
 *   Array vacio si ningun atleta esta en riesgo o no hay snapshots.
 */
export function getAtRiskAthletes() {
  const latest = getLatestPlantelHealth();
  return Array.from(latest.values()).filter(s => s.riskLevel === "riesgo");
}

/**
 * Elimina todos los snapshots del club activo de localStorage.
 *
 * Se llama en dos contextos:
 *   1. Logout del club: el entrenador cierra sesion y los datos deben
 *      limpiarse del dispositivo (privacidad, especialmente en tablets
 *      compartidos entre clubes).
 *   2. Reset manual: el entrenador solicita borrar el historial de salud.
 *
 * Limpia tanto la clave especifica del club ({base}_{clubId}) como la
 * clave base (sin sufijo) para no dejar datos huerfanos de sesiones
 * registradas antes de la implementacion del aislamiento por clubId.
 *
 * Efecto secundario: resetea _currentClubId a null. Llamar setHealthClubId()
 * antes de generar nuevos snapshots post-limpieza.
 */
export function clearSnapshots() {
  window.localStorage.removeItem(getStorageKey());
  // Limpiar clave base para no dejar datos huerfanos de sesiones pre-clubId
  if (_currentClubId) {
    window.localStorage.removeItem(STORAGE_KEY_BASE);
  }
  _currentClubId = null;
}
