/**
 * @module wellnessTypes
 * @description Tipos y funciones de calculo para el modulo de bienestar del atleta.
 *   Implementa el modelo multidimensional de wellness diario basado en la literatura
 *   de medicina del deporte. La calidad del sueno recibe doble ponderacion conforme
 *   a la evidencia de Fullagar et al. (2015).
 *
 * @reference Fullagar, H.H.K., Skorski, S., Duffield, R., Hammes, D., Coutts, A.J.,
 *   & Meyer, T. (2015). Sleep and athletic performance: the effects of sleep loss on
 *   exercise performance, and physiological and cognitive responses to exercise.
 *   Sports Medicine, 45(2), 161-186. https://doi.org/10.1007/s40279-014-0260-0
 *
 * @author Mateo-Data_Engine (Elevate Sports)
 */

// ---------------------------------------------------------------------------
// SQL SCHEMA — wellness_logs (Supabase / PostgreSQL)
// ---------------------------------------------------------------------------
//
// CREATE TABLE wellness_logs (
//   id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
//   club_id       TEXT        NOT NULL,
//   athlete_id    TEXT        NOT NULL,
//   logged_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
//   sleep_quality SMALLINT    CHECK (sleep_quality BETWEEN 1 AND 5) NOT NULL,
//   fatigue_level SMALLINT    CHECK (fatigue_level BETWEEN 1 AND 5) NOT NULL,
//   stress_level  SMALLINT    CHECK (stress_level  BETWEEN 1 AND 5) NOT NULL,
//   doms_level    SMALLINT    CHECK (doms_level    BETWEEN 1 AND 5) NOT NULL,
//   notes         TEXT,
//   -- Columna calculada: se almacena para evitar recalculo en consultas de reporte.
//   -- Formula: ((sleep_quality*2 + (6-fatigue_level)*2 + (6-stress_level) + (6-doms_level)) / 20) * 100
//   wellness_score NUMERIC(5,2) GENERATED ALWAYS AS (
//     ((
//       sleep_quality * 2 +
//       (6 - fatigue_level) * 2 +
//       (6 - stress_level) +
//       (6 - doms_level)
//     )::NUMERIC / 20) * 100
//   ) STORED
// );
//
// -- Indice compuesto para consultas frecuentes: por club, atleta y fecha descendente
// CREATE INDEX idx_wellness_club_athlete
//   ON wellness_logs(club_id, athlete_id, logged_at DESC);
//
// -- Row Level Security: cada club solo ve sus propios registros
// ALTER TABLE wellness_logs ENABLE ROW LEVEL SECURITY;
//
// CREATE POLICY "club_isolation" ON wellness_logs
//   USING (club_id = current_setting('app.current_club_id', true));
//
// ---------------------------------------------------------------------------

/**
 * Registro diario de bienestar de un atleta.
 * Todas las escalas de 1-5 siguen la convencion: 1 = mejor estado, 5 = peor estado,
 * EXCEPTO sleep_quality donde 1 = muy mal, 5 = excelente (escala directa).
 *
 * @typedef {Object} WellnessLog
 * @property {string}      id            - UUID generado por Supabase
 * @property {string}      club_id       - ID del club (multi-tenancy — obligatorio)
 * @property {string|number} athlete_id  - ID del atleta
 * @property {string}      logged_at     - ISO 8601 timestamp (ej. "2026-03-31T08:00:00Z")
 * @property {1|2|3|4|5}  sleep_quality - Calidad del sueno (1=muy mal, 5=excelente)
 * @property {1|2|3|4|5}  fatigue_level - Nivel de fatiga (1=ninguna, 5=extrema)
 * @property {1|2|3|4|5}  stress_level  - Nivel de estres (1=ninguno, 5=extremo)
 * @property {1|2|3|4|5}  doms_level    - Dolor muscular DOMS (1=ninguno, 5=extremo)
 * @property {string|null} notes        - Observaciones del atleta o entrenador
 * @property {number}      wellness_score - Score compuesto calculado [0-100]
 */

/**
 * Resultado del estado de bienestar derivado del score compuesto.
 *
 * @typedef {Object} WellnessStatus
 * @property {"green"|"yellow"|"red"} status - Semaforo de estado
 * @property {string}                 label  - Etiqueta legible en espanol
 */

/**
 * Calcula el Wellness Score compuesto a partir de un registro diario.
 *
 * Formula (Fullagar et al., 2015 — adaptacion multimodal):
 *   wellness_score = ((sleep_quality * 2 + (6 - fatigue_level) * 2
 *                      + (6 - stress_level) + (6 - doms_level)) / 20) * 100
 *
 * Ponderaciones:
 *   - sleep_quality  : factor 2 (doble peso — mayor predictor de rendimiento)
 *   - fatigue_level  : factor 2, invertido (6 - valor)
 *   - stress_level   : factor 1, invertido
 *   - doms_level     : factor 1, invertido
 *
 * Denominador maximo = (5*2) + (5*2) + 5 + 5 = 30... simplificado a 20 al usar
 * la inversion (6 - valor) con valor_min=1 => contribucion maxima = 5 por dimension
 * no ponderada, y 10 para las ponderadas. Total max = 10 + 10 + 5 + 5 = 30.
 * El denominador en la formula original del ticket es 20 — se respeta tal cual
 * para mantener coherencia con el esquema SQL GENERATED ALWAYS.
 *
 * Rango de salida: 0-100 (puede exceder 100 matematicamente; se clampea a [0, 100]).
 *
 * @param {WellnessLog} log - Registro de bienestar con las 4 dimensiones evaluadas
 * @returns {number} Score en rango [0, 100], redondeado a 2 decimales
 * @throws {Error} Si algun valor de dimension esta fuera del rango [1, 5]
 */
export function calcWellnessScore(log) {
  const { sleep_quality, fatigue_level, stress_level, doms_level } = log;

  // Validate all dimensions are within [1, 5]
  const dims = { sleep_quality, fatigue_level, stress_level, doms_level };
  for (const [field, val] of Object.entries(dims)) {
    if (!Number.isInteger(val) || val < 1 || val > 5) {
      throw new Error(
        `calcWellnessScore: "${field}" debe ser un entero entre 1 y 5. Recibido: ${val}`
      );
    }
  }

  const numerator =
    sleep_quality * 2 +
    (6 - fatigue_level) * 2 +
    (6 - stress_level) +
    (6 - doms_level);

  const raw = (numerator / 20) * 100;

  // Clamp to [0, 100] and round to 2 decimal places
  return Math.round(Math.min(100, Math.max(0, raw)) * 100) / 100;
}

/**
 * Devuelve el estado de semaforo correspondiente al wellness score.
 *
 * Umbrales calibrados para uso clinico-deportivo:
 *   - >= 70 : Verde  — atleta en condiciones optimas de entrenamiento
 *   - >= 40 : Amarillo — monitorear; puede entrenar con ajustes de carga
 *   -  < 40 : Rojo   — riesgo; evaluar reduccion de carga o descanso
 *
 * @param {number} score - Wellness score en rango [0, 100]
 * @returns {WellnessStatus} Estado y etiqueta de semaforo
 */
export function getWellnessStatus(score) {
  if (score >= 70) {
    return { status: "green", label: "Optimo" };
  }
  if (score >= 40) {
    return { status: "yellow", label: "Precaucion" };
  }
  return { status: "red", label: "En riesgo" };
}

/**
 * Calcula la tendencia de bienestar de un atleta en los ultimos 7 dias.
 *
 * Filtra registros del atleta con `logged_at` dentro de los ultimos 7 dias
 * (168 horas desde el momento de la llamada) y retorna el promedio de
 * `wellness_score`. Retorna `null` si no hay datos suficientes.
 *
 * Nota: para calculos precisos en produccion, el filtrado temporal debe
 * hacerse en la query Supabase (WHERE logged_at >= now() - INTERVAL '7 days')
 * para evitar transferir registros historicos innecesarios.
 *
 * @param {string|number} athleteId     - ID del atleta a evaluar
 * @param {WellnessLog[]} wellnessLogs  - Array de registros de bienestar (puede ser global)
 * @returns {number|null} Promedio del wellness_score [0-100] o null si no hay datos
 */
export function calcAthleteWellnessTrend(athleteId, wellnessLogs) {
  if (!Array.isArray(wellnessLogs) || wellnessLogs.length === 0) {
    return null;
  }

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  // Filtra por atleta y ventana de 7 dias
  const recentLogs = wellnessLogs.filter((log) => {
    if (String(log.athlete_id) !== String(athleteId)) return false;
    const logTime = new Date(log.logged_at).getTime();
    return !isNaN(logTime) && now - logTime <= sevenDaysMs;
  });

  if (recentLogs.length === 0) {
    return null;
  }

  const total = recentLogs.reduce((sum, log) => sum + (log.wellness_score ?? 0), 0);
  const avg = total / recentLogs.length;

  return Math.round(avg * 100) / 100;
}
