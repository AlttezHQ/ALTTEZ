/**
 * @module rpeEngine
 * @description Motor de Inteligencia Deportiva — Salud Actual basada en RPE.
 *
 * ══════════════════════════════════════════════════════════════════
 *  MODELO MATEMATICO — Elevate Sports RPE Health Engine v2.0
 * ══════════════════════════════════════════════════════════════════
 *
 *  FUNDAMENTO CIENTIFICO
 *  ---------------------
 *  Basado en el metodo session-RPE de Foster et al. (2001) y el modelo
 *  de carga interna de Impellizzeri et al. (2004). El RPE (Rate of
 *  Perceived Exertion, escala CR-10 de Borg) es el indicador subjetivo
 *  mas validado en ciencia del deporte para cuantificar carga interna.
 *
 *  FORMULA BASE
 *  ------------
 *  Sea R = {r₁, r₂, ..., rₙ} el conjunto de RPEs individuales del
 *  atleta en los ultimos 7 dias (max 7 entradas, n ≤ 7).
 *
 *    RPE_avg = (1/n) Σᵢ rᵢ        donde rᵢ ∈ [1, 10]
 *
 *    SaludActual = clamp(100 - RPE_avg × 10, 0, 100)
 *
 *  INTERPRETACION
 *  --------------
 *  - SaludActual ∈ [0, 100] es un indice inverso de fatiga acumulada.
 *  - RPE_avg = 1  →  Salud = 90  (carga minima, alta disponibilidad)
 *  - RPE_avg = 5  →  Salud = 50  (carga moderada, precaucion)
 *  - RPE_avg = 10 →  Salud = 0   (carga maxima, riesgo de lesion)
 *
 *  UMBRALES DE RIESGO (semaforo)
 *  -----------------------------
 *  | Rango         | Nivel       | Color   | Accion recomendada         |
 *  |---------------|-------------|---------|----------------------------|
 *  | Salud >= 60   | optimo      | #1D9E75 | Disponible para competir   |
 *  | 30 <= S < 60  | precaucion  | #EF9F27 | Reducir carga o rotar      |
 *  | Salud < 30    | riesgo      | #E24B4A | Descanso o trabajo regen.  |
 *  | Sin datos     | sin_datos   | gris    | Registrar RPE              |
 *
 *  FUENTE DE DATOS (v2.0)
 *  ----------------------
 *  - RPE actual:    athlete.rpe (sesion en curso)
 *  - RPE historico: historial[].rpeByAthlete[athleteId] (per-athlete)
 *  - Fallback:      historial[].rpeAvg (promedio equipo, sesiones legacy)
 *  - Ventana:       7 dias via savedAt (ISO 8601), o ultimas 7 entradas
 *
 *  LIMITACIONES CONOCIDAS
 *  ----------------------
 *  - No incluye duracion de sesion (sRPE = RPE × minutos). Requiere
 *    que el entrenador registre duracion en futuras versiones.
 *  - No calcula ACWR (Acute:Chronic Workload Ratio). Requiere >= 4
 *    semanas de datos consistentes. Planificado para v3.0.
 *  - Promedio aritmetico, no EWMA. EWMA pondera sesiones recientes
 *    mas fuerte, pero requiere datos diarios consistentes.
 *
 * @author @Data (Mateo-Data_Engine)
 * @version 2.0.0
 */

// ── Constantes ──

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 7;

// ── Utilidades internas ──

/**
 * Extrae los RPEs individuales de un atleta desde el historial.
 * Prioriza rpeByAthlete (per-athlete) sobre rpeAvg (equipo).
 * Filtra por ventana de 7 dias usando savedAt (ISO).
 *
 * @param {number|string} athleteId
 * @param {Array} historial - Sesiones con { savedAt, rpeByAthlete?, rpeAvg? }
 * @param {number} now - Timestamp actual (ms)
 * @returns {number[]} RPEs validos dentro de la ventana
 */
function extractAthleteRpes(athleteId, historial, now) {
  const rpes = [];
  const id = String(athleteId);

  for (const session of historial) {
    // Intentar obtener RPE individual del atleta
    let rpe = null;
    if (session.rpeByAthlete && session.rpeByAthlete[id] != null) {
      rpe = Number(session.rpeByAthlete[id]);
    } else if (session.rpeByAthlete && session.rpeByAthlete[Number(athleteId)] != null) {
      rpe = Number(session.rpeByAthlete[Number(athleteId)]);
    } else if (session.rpeAvg != null && session.rpeAvg !== "\u2014") {
      // Fallback: RPE promedio del equipo (sesiones legacy sin rpeByAthlete)
      rpe = Number(session.rpeAvg);
    }

    // Validar rango
    if (rpe == null || isNaN(rpe) || rpe < 1 || rpe > 10) continue;

    // Filtrar por ventana temporal usando savedAt (ISO 8601)
    if (session.savedAt) {
      const sessionTime = new Date(session.savedAt).getTime();
      if (!isNaN(sessionTime) && (now - sessionTime) <= SEVEN_DAYS_MS) {
        rpes.push(rpe);
      }
      // Si savedAt existe pero esta fuera de ventana, NO incluir
    } else {
      // Sesiones legacy sin savedAt: incluir (beneficio de la duda)
      // pero seran desplazadas naturalmente por el limite de MAX_ENTRIES
      rpes.push(rpe);
    }

    if (rpes.length >= MAX_ENTRIES) break;
  }

  return rpes;
}

/**
 * Calcula la SaludActual de un atleta basandose en su RPE individual
 * de los ultimos 7 dias.
 *
 * @param {number|null} currentRpe - RPE actual de la sesion en curso (1-10 o null)
 * @param {Array} historial - Array de sesiones con { savedAt, rpeByAthlete?, rpeAvg? }
 * @param {number|string} [athleteId] - ID del atleta para filtrar RPE individual
 * @returns {{ salud: number, riskLevel: string, color: string, rpeAvg7d: number|null }}
 */
export function calcSaludActual(currentRpe, historial = [], athleteId = null) {
  const now = Date.now();
  const rpes = [];

  // 1. RPE actual de la sesion en curso
  if (currentRpe != null && currentRpe >= 1 && currentRpe <= 10) {
    rpes.push(currentRpe);
  }

  // 2. RPEs historicos
  if (athleteId != null) {
    // v2: Extraer RPE individual del atleta
    const historical = extractAthleteRpes(athleteId, historial, now);
    rpes.push(...historical);
  } else {
    // Fallback legacy: usar rpeAvg del equipo (compatibilidad hacia atras)
    for (const s of historial) {
      if (s.rpeAvg != null && s.rpeAvg !== "\u2014") {
        const rpe = Number(s.rpeAvg);
        if (!isNaN(rpe) && rpe >= 1 && rpe <= 10) {
          // Filtrar por savedAt si existe
          if (s.savedAt) {
            const t = new Date(s.savedAt).getTime();
            if (!isNaN(t) && (now - t) <= SEVEN_DAYS_MS) {
              rpes.push(rpe);
            }
          } else {
            rpes.push(rpe);
          }
        }
      }
      if (rpes.length >= MAX_ENTRIES) break;
    }
  }

  // 3. Limitar a MAX_ENTRIES
  const recent = rpes.slice(0, MAX_ENTRIES);

  if (recent.length === 0) {
    return { salud: 100, riskLevel: "sin_datos", color: "rgba(255,255,255,0.3)", rpeAvg7d: null };
  }

  // 4. Formula: SaludActual = clamp(100 - RPE_avg × 10, 0, 100)
  const avgRpe = recent.reduce((s, v) => s + v, 0) / recent.length;
  const salud = Math.max(0, Math.min(100, Math.round(100 - (avgRpe * 10))));

  // 5. Clasificacion por umbrales
  let riskLevel, color;
  if (salud >= 60) {
    riskLevel = "optimo";
    color = "#1D9E75";
  } else if (salud >= 30) {
    riskLevel = "precaucion";
    color = "#EF9F27";
  } else {
    riskLevel = "riesgo";
    color = "#E24B4A";
  }

  return { salud, riskLevel, color, rpeAvg7d: Number(avgRpe.toFixed(1)) };
}

/**
 * Calcula SaludActual para todo el plantel usando RPE individual.
 *
 * @param {Array} athletes - Array de atletas con { id, rpe }
 * @param {Array} historial - Array de sesiones globales
 * @returns {Map<number, { salud, riskLevel, color, rpeAvg7d }>}
 */
export function calcSaludPlantel(athletes, historial = []) {
  const map = new Map();
  athletes.forEach(a => {
    map.set(a.id, calcSaludActual(a.rpe, historial, a.id));
  });
  return map;
}

/**
 * Retorna el color de la barra de salud para un valor dado.
 * @param {number} salud - 0 a 100
 * @returns {string} color hex
 */
export function saludColor(salud) {
  if (salud >= 60) return "#1D9E75";
  if (salud >= 30) return "#EF9F27";
  return "#E24B4A";
}
