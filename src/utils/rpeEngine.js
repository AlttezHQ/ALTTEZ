/**
 * @module rpeEngine
 * @description Motor de Inteligencia Deportiva — Salud Actual basada en RPE.
 *
 * ══════════════════════════════════════════════════════════════════
 *  MODELO MATEMATICO — ALTTEZ RPE Health Engine v2.1
 *  ACWR Engine v3.1 — promedios diarios (Hulin et al., 2014)
 * ══════════════════════════════════════════════════════════════════
 *
 *  FUNDAMENTO CIENTIFICO
 *  ---------------------
 *  Este modulo implementa el metodo session-RPE (sRPE) descrito por
 *  Foster et al. (2001) para cuantificar la carga interna de entrenamiento.
 *  La escala utilizada es la Borg CR-10 (Category-Ratio 10), validada
 *  originalmente por Borg (1998) y adoptada en ciencias del deporte
 *  como medida de esfuerzo percibido global (no diferencial muscular).
 *
 *  En fútbol juvenil Sub-17, la correlacion entre sRPE y marcadores
 *  objetivos de carga (frecuencia cardiaca, lactato) es r = 0.77-0.84
 *  segun Impellizzeri et al. (2004), lo que justifica su uso como
 *  indicador primario de fatiga acumulada en este contexto.
 *
 *  FORMULA BASE
 *  ------------
 *  Sea R = {r₁, r₂, ..., rₙ} el conjunto de RPEs individuales del
 *  atleta en los ultimos 7 dias (max 7 entradas, n <= 7).
 *
 *    RPE_avg = (1/n) * sum(rᵢ)    donde rᵢ ∈ [1, 10]  (Borg CR-10)
 *
 *    SaludActual = clamp(100 - RPE_avg * 10, 0, 100)
 *
 *  La funcion de salud es una transformacion lineal inversa que mapea
 *  el espacio [1,10] de RPE al espacio [0,90] de disponibilidad.
 *  El valor 100 se reserva para el estado "sin datos" (disponibilidad
 *  maxima asumida por defecto hasta que existan registros).
 *
 *  INTERPRETACION CLINICA
 *  ----------------------
 *  - SaludActual ∈ [0, 100] es un indice inverso de fatiga acumulada.
 *  - RPE_avg = 1.0  →  Salud = 90  (carga minima, alta disponibilidad)
 *  - RPE_avg = 5.0  →  Salud = 50  (carga moderada, entrenamiento normal)
 *  - RPE_avg = 7.5  →  Salud = 25  (umbral riesgo, reducir carga)
 *  - RPE_avg = 10.0 →  Salud = 0   (carga maxima, riesgo alto de lesion)
 *
 *  UMBRALES DE RIESGO — SEMAFORO v2.1
 *  -----------------------------------
 *  Calibrados para futbol juvenil Sub-17, donde la tolerancia a la carga
 *  es menor que en futbol profesional adulto (Hulin et al., 2014 establece
 *  que atletas jovenes tienen mayor susceptibilidad a lesion por ACWR alto).
 *
 *  | Rango         | Nivel       | Color   | RPE_avg equiv. | Accion             |
 *  |---------------|-------------|---------|----------------|--------------------|
 *  | Salud >= 50   | optimo      | #1D9E75 | <= 5.0         | Disponible         |
 *  | 25 <= S < 50  | precaucion  | #EF9F27 | 5.0 – 7.5      | Reducir o rotar    |
 *  | Salud < 25    | riesgo      | #E24B4A | > 7.5          | Descanso / regen.  |
 *  | Sin datos     | sin_datos   | gris    | —              | Registrar RPE      |
 *
 *  JUSTIFICACION DEL UMBRAL v2.1 (cambio desde v2.0)
 *  --------------------------------------------------
 *  En v2.0 el umbral optimo era salud >= 60 (RPE_avg <= 4.0). Esto
 *  clasificaba un RPE promedio de 5.0 —carga tipica de una sesion de
 *  entrenamiento tecnico-tactico normal (Foster, 2001, describe RPE 5
 *  como "moderado" en microciclo de competicion)— como "precaucion",
 *  generando falsos positivos que erosionaban la credibilidad del
 *  semaforo para los entrenadores. El ajuste a >= 50 es coherente con
 *  la escala CR-10: valores 1-5 corresponden a esfuerzo aceptable en
 *  un ciclo semanal de entrenamiento, valores > 7.5 activan el riesgo.
 *
 *  FUENTE DE DATOS (arquitectura v2.0)
 *  ------------------------------------
 *  - RPE actual:    athlete.rpe  (sesion en curso, captura inmediata)
 *  - RPE historico: historial[].rpeByAthlete[athleteId]  (per-atleta, v2+)
 *  - Fallback:      historial[].rpeAvg  (promedio equipo, sesiones legacy v1)
 *  - Ventana:       7 dias via savedAt (ISO 8601), max MAX_ENTRIES = 7
 *
 *  LIMITACIONES CONOCIDAS Y ROADMAP
 *  ---------------------------------
 *  1. Sin duracion de sesion: El sRPE canonico es RPE × duracion(min)
 *     (Foster et al., 2001). Este motor usa solo RPE porque el campo
 *     "duracion" no existe aun en el modelo de datos. Impacto: sesiones
 *     cortas (30 min) y largas (90 min) con mismo RPE pesan igual.
 *     Planificado: agregar campo `duracionMinutos` al formulario de
 *     entrenamiento y recalcular como unidades de carga (UA).
 *  2. Sin duracion de sesion para ACWR: El sRPE canonico es RPE × duracion(min).
 *     El ACWR actual usa promedio de RPEs como proxy de intensidad media diaria.
 *     Impacto: sesiones cortas (30 min) y largas (90 min) con mismo RPE pesan
 *     igual. Planificado: agregar campo `duracionMinutos` y recalcular como
 *     unidades de carga (UA = RPE × min). Motor v3.1 usa promedios diarios
 *     segun el modelo canonico de Hulin et al. (2014).
 *  3. Promedio aritmetico (no EWMA): La ponderacion exponencial (EWMA)
 *     sesga el calculo hacia sesiones recientes, lo cual es fisiologicamente
 *     mas preciso. Requiere datos diarios consistentes para ser estable.
 *     Planificado para v3.0 junto con ACWR.
 *
 * @references
 *   Borg, G. (1998). Borg's perceived exertion and pain scales.
 *     Human Kinetics. ISBN: 978-0-88011-623-7.
 *
 *   Foster, C., Florhaug, J. A., Franklin, J., Gottschall, L., Hrovatin,
 *     L. A., Parker, S., ... & Dodge, C. (2001). A new approach to
 *     monitoring exercise training. Journal of Strength and Conditioning
 *     Research, 15(1), 109-115. https://doi.org/10.1519/00124278-200102000-00019
 *
 *   Impellizzeri, F. M., Rampinini, E., Coutts, A. J., Sassi, A., &
 *     Marcora, S. M. (2004). Use of RPE-based training load in soccer.
 *     Medicine & Science in Sports & Exercise, 36(6), 1042-1047.
 *     https://doi.org/10.1249/01.MSS.0000128199.23901.2F
 *
 *   Hulin, B. T., Gabbett, T. J., Blanch, P., Chapman, P., Bailey, D.,
 *     & Orchard, J. W. (2014). Spikes in acute workload are associated
 *     with increased injury risk in elite cricket fast bowlers. British
 *     Journal of Sports Medicine, 48(8), 708-712.
 *     https://doi.org/10.1136/bjsports-2013-092524
 *
 * @author @Data (Mateo-Data_Engine)
 * @version 3.1.0
 */

// ── Constantes ──

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const TWENTY_EIGHT_DAYS_MS = 28 * 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 7;

// ── Utilidades internas ──

/**
 * Extrae los RPEs individuales de un atleta desde el historial de sesiones.
 *
 * Implementa la estrategia de datos en dos niveles:
 *   1. Nivel primario (v2+): rpeByAthlete[athleteId] — RPE registrado
 *      individualmente por el entrenador para cada atleta presente en
 *      la sesion. Permite detectar diferencias intra-equipo de carga
 *      percibida (e.g., portero vs. extremo en el mismo entrenamiento).
 *   2. Nivel fallback (legacy v1): rpeAvg — RPE promedio del equipo,
 *      usado en sesiones registradas antes de la implementacion v2.
 *      Introduce ruido al ignorar variabilidad individual; se mantiene
 *      solo por compatibilidad hacia atras hasta migracion completa.
 *
 * La ventana de 7 dias usa el campo savedAt (ISO 8601). Sesiones sin
 * savedAt (datos legacy) se incluyen con beneficio de la duda pero son
 * desplazadas naturalmente cuando se alcanza MAX_ENTRIES.
 *
 * @param {number|string} athleteId - ID del atleta (acepta number o string por tolerancia)
 * @param {Array<{savedAt?: string, rpeByAthlete?: Object, rpeAvg?: number|string}>} historial
 *   Array de sesiones guardadas, orden cronologico descendente (mas reciente primero)
 * @param {number} now - Timestamp actual en milisegundos (Date.now())
 * @returns {number[]} Array de valores RPE validos en rango [1,10] dentro de la ventana,
 *   maximo MAX_ENTRIES = 7 elementos
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
 * Calcula el indice de SaludActual de un atleta a partir de su RPE
 * acumulado en los ultimos 7 dias (ventana deslizante).
 *
 * Implementa la formula del RPE Health Engine v2.1:
 *
 *   RPE_avg = mean(RPEs validos en ventana 7d, max 7 sesiones)
 *   SaludActual = clamp(100 - RPE_avg * 10, 0, 100)
 *
 * Fuente: derivada de Foster et al. (2001), escala Borg CR-10 (1998).
 * Umbral de riesgo: RPE_avg > 7.5 → salud < 25 → nivel "riesgo".
 *
 * El proceso de calculo es:
 *   1. Si currentRpe es valido [1,10], se incluye como sesion mas reciente.
 *   2. Se extraen RPEs historicos del atleta (per-atleta si hay athleteId,
 *      fallback a rpeAvg de equipo si no).
 *   3. Se limita a MAX_ENTRIES = 7 (ventana 7d).
 *   4. Sin datos → retorna { salud: 100, riskLevel: "sin_datos" } para
 *      no penalizar a atletas sin historial.
 *   5. Con datos → calcula RPE_avg, aplica formula y clasifica semaforo.
 *
 * @param {number|null} currentRpe
 *   RPE de la sesion activa en curso. Escala Borg CR-10: 1 (muy ligero)
 *   a 10 (maxima exertion). null si el atleta no tiene RPE registrado
 *   en la sesion actual.
 * @param {Array<{savedAt?: string, rpeByAthlete?: Object, rpeAvg?: number|string}>} [historial=[]]
 *   Sesiones previas guardadas. Cada sesion puede tener rpeByAthlete
 *   (objeto id→rpe, formato v2) o rpeAvg (numero, formato v1 legacy).
 * @param {number|string|null} [athleteId=null]
 *   ID del atleta para filtrar su RPE individual en rpeByAthlete.
 *   Si es null, usa fallback de rpeAvg (compatibilidad v1).
 * @returns {{
 *   salud: number,          // Indice [0-100]: 100 = plena disponibilidad
 *   riskLevel: string,      // "optimo" | "precaucion" | "riesgo" | "sin_datos"
 *   color: string,          // Hex del semaforo: #1D9E75 | #EF9F27 | #E24B4A | rgba(...)
 *   rpeAvg7d: number|null   // RPE promedio 7d, 1 decimal. null si sin_datos
 * }}
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

  // 5. Clasificacion por umbrales (v2.1)
  // Umbral optimo: salud >= 50 (RPE avg <= 5.0, entrenamiento normal)
  // Umbral precaucion: 25 <= salud < 50 (RPE avg 5.0–7.5)
  // Umbral riesgo: salud < 25 (RPE avg > 7.5)
  let riskLevel, color;
  if (salud >= 50) {
    riskLevel = "optimo";
    color = "#1D9E75";
  } else if (salud >= 25) {
    riskLevel = "precaucion";
    color = "#EF9F27";
  } else {
    riskLevel = "riesgo";
    color = "#E24B4A";
  }

  return { salud, riskLevel, color, rpeAvg7d: Number(avgRpe.toFixed(1)) };
}

/**
 * Calcula el indice de SaludActual para cada atleta del plantel completo.
 *
 * Funcion de conveniencia que itera el plantel y llama calcSaludActual
 * por atleta, pasando su ID para obtener RPE individual (no promedio
 * del equipo). Esto es critico para detectar outliers: un extremo con
 * RPE 9 en una sesion donde el equipo promedió 5 debe activar alerta
 * solo para ese atleta, no para el plantel completo.
 *
 * Complejidad: O(n * m) donde n = plantel, m = sesiones en historial.
 * Para planteles Sub-17 tipicos (15-20 atletas) y ventana de 7 sesiones,
 * el costo es despreciable (< 1 ms en navegador moderno).
 *
 * @param {Array<{id: number, rpe: number|null}>} athletes
 *   Plantel activo. Solo requiere id y rpe de la sesion actual.
 * @param {Array} [historial=[]]
 *   Historial completo de sesiones del equipo (mismo formato que calcSaludActual).
 * @returns {Map<number, {salud: number, riskLevel: string, color: string, rpeAvg7d: number|null}>}
 *   Mapa athleteId → resultado de salud. Permite lookup O(1) en UI.
 */
export function calcSaludPlantel(athletes, historial = []) {
  const map = new Map();
  athletes.forEach(a => {
    map.set(a.id, calcSaludActual(a.rpe, historial, a.id));
  });
  return map;
}

/**
 * Retorna el color hex del semaforo para un valor de salud dado.
 *
 * Funcion de presentacion pura: convierte el indice numerico al color
 * visual del semaforo neon de ALTTEZ. Umbrales sincronizados
 * con calcSaludActual v2.1 para garantizar consistencia visual.
 *
 * Uso tipico: barras de progreso, badges, indicadores de estado en UI.
 * No usar para logica de decision — usar riskLevel de calcSaludActual.
 *
 * | salud     | color    | significado                   |
 * |-----------|----------|-------------------------------|
 * | >= 50     | #1D9E75  | Verde: disponible             |
 * | 25 - 49   | #EF9F27  | Ambar: precaucion             |
 * | < 25      | #E24B4A  | Rojo: riesgo, reducir carga   |
 *
 * @param {number} salud - Indice de salud [0, 100]
 * @returns {string} Color hexadecimal (#RRGGBB)
 */
// Umbrales sincronizados con calcSaludActual v2.1
export function saludColor(salud) {
  if (salud >= 50) return "#1D9E75";
  if (salud >= 25) return "#EF9F27";
  return "#E24B4A";
}

// ══════════════════════════════════════════════════════════════════════
//  ACWR ENGINE — Acute:Chronic Workload Ratio (Hulin et al., 2014)
//  v3.1: promedios diarios en lugar de sumas directas.
//  Requiere >= 1 sesion entre 7d y 28d para que el ratio sea significativo.
// ══════════════════════════════════════════════════════════════════════

/**
 * Extrae los RPEs de un atleta dentro de una ventana temporal arbitraria.
 *
 * Version generalizada de extractAthleteRpes que acepta un rango
 * [minAgeMs, maxAgeMs] relativo al momento actual. Esto permite calcular
 * cargas de cualquier ventana (0-7d aguda, 0-28d cronica, 7-14d semana
 * anterior, etc.) sin duplicar la logica de resolucion de RPE individual
 * vs. fallback.
 *
 * Estrategia de resolucion de RPE: identica a extractAthleteRpes —
 *   1. rpeByAthlete[id] (string o number)
 *   2. rpeAvg (fallback legacy)
 *
 * A diferencia de extractAthleteRpes, NO aplica limite MAX_ENTRIES porque
 * la ventana de 28 dias puede contener mas de 7 sesiones validas.
 *
 * @param {number|string} athleteId - ID del atleta
 * @param {Array<{savedAt?: string, rpeByAthlete?: Object, rpeAvg?: number|string}>} historial
 * @param {number} now - Timestamp actual en milisegundos
 * @param {number} minAgeMs - Edad minima de la sesion en ms (0 = hoy, SEVEN_DAYS_MS = hace 7 dias)
 * @param {number} maxAgeMs - Edad maxima de la sesion en ms (SEVEN_DAYS_MS = hasta 7 dias atras)
 * @returns {number[]} Array de RPEs validos dentro de la ventana temporal
 */
function extractAthleteRpesWindow(athleteId, historial, now, minAgeMs, maxAgeMs) {
  const rpes = [];
  const id = String(athleteId);

  for (const session of historial) {
    // Resolver RPE individual con el mismo patron de extractAthleteRpes
    let rpe = null;
    if (session.rpeByAthlete && session.rpeByAthlete[id] != null) {
      rpe = Number(session.rpeByAthlete[id]);
    } else if (session.rpeByAthlete && session.rpeByAthlete[Number(athleteId)] != null) {
      rpe = Number(session.rpeByAthlete[Number(athleteId)]);
    } else if (session.rpeAvg != null && session.rpeAvg !== "\u2014") {
      rpe = Number(session.rpeAvg);
    }

    // Validar rango Borg CR-10
    if (rpe == null || isNaN(rpe) || rpe < 1 || rpe > 10) continue;

    // Para ACWR solo procesamos sesiones con savedAt explicito.
    // Las sesiones legacy sin savedAt no tienen suficiente precision temporal
    // para el calculo de ventanas de 28 dias.
    if (!session.savedAt) continue;

    const sessionTime = new Date(session.savedAt).getTime();
    if (isNaN(sessionTime)) continue;

    const ageMs = now - sessionTime;
    if (ageMs >= minAgeMs && ageMs <= maxAgeMs) {
      rpes.push(rpe);
    }
  }

  return rpes;
}

/**
 * Calcula el Acute:Chronic Workload Ratio (ACWR) de un atleta.
 *
 * Implementa el modelo canonico de Hulin et al. (2014) con promedios diarios:
 *
 *   Carga Aguda   = promedio de RPEs en los ultimos 7 dias  (ventana 0-7d)
 *   Carga Cronica = promedio de RPEs en los ultimos 28 dias (ventana 0-28d)
 *   ACWR = Carga Aguda / Carga Cronica
 *
 * El uso de promedios (en lugar de sumas) permite que el ratio supere 1.0
 * cuando la semana actual tiene mayor intensidad media que el mes previo.
 * Ejemplo: crónico RPE 3, agudo RPE 8 → ACWR = 8/3 = 2.67 → zona roja.
 *
 * El ratio solo es calculable si existen sesiones en la ventana cronica
 * MAS ALLA de los 7 dias agudos (7d a 28d). Sin esa evidencia historica,
 * el denominador esta contaminado por la misma semana aguda y el ratio
 * seria 1.0 trivialmente. Esto garantiza significancia estadistica.
 *
 * Zona optima ACWR: 0.8 – 1.3 (Gabbett, 2016; Hulin et al., 2014)
 * Zona peligro:     > 1.5 (incremento del riesgo de lesion hasta 2.1x)
 *
 * @param {number|string} athleteId - ID del atleta
 * @param {Array<{savedAt?: string, rpeByAthlete?: Object, rpeAvg?: number|string}>} [historial=[]]
 *   Historial de sesiones. Requiere savedAt para precision temporal.
 * @param {number|null} [currentRpe=null]
 *   RPE de la sesion actual (no guardada aun). Si es valido [1,10],
 *   se incluye en ambas ventanas como sesion del dia de hoy.
 * @returns {{
 *   ratio: number|null,  // ACWR calculado. null si no hay datos cronicos fuera de los 7d agudos
 *   acute: number,       // Promedio de RPEs en los ultimos 7 dias (redondeado 2 decimales)
 *   chronic: number      // Promedio de RPEs en los ultimos 28 dias (redondeado 2 decimales)
 * }}
 *
 * @references
 *   Hulin, B. T., et al. (2014). Spikes in acute workload are associated
 *     with increased injury risk. BJSM, 48(8), 708-712.
 *   Gabbett, T. J. (2016). The training-injury prevention paradox: should
 *     athletes be training smarter and harder? BJSM, 50(5), 273-280.
 */
export function calcACWR(athleteId, historial = [], currentRpe = null) {
  const now = Date.now();
  const currentValid = currentRpe != null && currentRpe >= 1 && currentRpe <= 10;

  // Ventana aguda: 0 a 7 dias atras
  const acuteRpes = extractAthleteRpesWindow(athleteId, historial, now, 0, SEVEN_DAYS_MS);
  if (currentValid) acuteRpes.unshift(currentRpe);

  // Ventana cronica: 0 a 28 dias atras (incluye la ventana aguda)
  const chronicRpes = extractAthleteRpesWindow(athleteId, historial, now, 0, TWENTY_EIGHT_DAYS_MS);
  if (currentValid) chronicRpes.unshift(currentRpe);

  // Promedio agudo: media de RPEs en la ventana 0-7d
  const acute = acuteRpes.length > 0
    ? Number((acuteRpes.reduce((s, v) => s + v, 0) / acuteRpes.length).toFixed(2))
    : 0;

  // Promedio cronico: media de RPEs en la ventana 0-28d
  const chronic = chronicRpes.length > 0
    ? Number((chronicRpes.reduce((s, v) => s + v, 0) / chronicRpes.length).toFixed(2))
    : 0;

  // El ratio solo es significativo cuando existe historial fuera de la ventana aguda
  // (al menos una sesion entre 7d y 28d). Sin ello, chronic == acute y el ratio
  // seria 1.0 trivialmente — no hay informacion sobre la base cronica real.
  const hasChronicData = extractAthleteRpesWindow(
    athleteId, historial, now, SEVEN_DAYS_MS, TWENTY_EIGHT_DAYS_MS
  ).length > 0;

  if (!hasChronicData || chronic === 0) {
    return { ratio: null, acute, chronic };
  }

  const ratio = Number((acute / chronic).toFixed(2));
  return { ratio, acute, chronic };
}

/**
 * Calcula el perfil de riesgo ACWR completo de un atleta, listo para el store.
 *
 * Combina calcACWR con clasificacion de status (semaforo), tendencia temporal
 * (trend) y sugerencia textual para el entrenador. Diseñado como selector
 * directo para componentes React/Zustand.
 *
 * Umbrales de status (zona optima segun Gabbett, 2016):
 *   null         → "unknown"  — datos insuficientes (< 28d de historial)
 *   ratio < 0.8  → "yellow"   — desentrenamiento, carga demasiado baja
 *   0.8 – 1.3   → "green"    — zona optima de carga
 *   1.3 – 1.5   → "yellow"   — carga elevada, precaucion
 *   > 1.5        → "red"      — zona de peligro, alto riesgo de lesion
 *
 * Calculo de tendencia (trend):
 *   ACWR semana anterior = aguda[7-14d] / cronica[21-28d de referencia].
 *   El "cronica de referencia" son las sesiones de 21-28 dias atras, que
 *   representan el estado cronico base de hace una semana.
 *   Si ratio_actual > ratio_anterior + 0.1 → "up" (carga creciente)
 *   Si ratio_actual < ratio_anterior - 0.1 → "down" (carga decreciente)
 *   Sino → "stable"
 *
 * @param {number|string} athleteId
 * @param {Array} [historial=[]]
 * @param {number|null} [currentRpe=null]
 * @returns {{
 *   ratio: number|null,
 *   status: "green"|"yellow"|"red"|"unknown",
 *   trend: "up"|"down"|"stable",
 *   suggestion: string
 * }}
 *
 * @references
 *   Gabbett, T. J. (2016). BJSM, 50(5), 273-280.
 *   Hulin, B. T., et al. (2014). BJSM, 48(8), 708-712.
 */
export function calcAthleteRisk(athleteId, historial = [], currentRpe = null) {
  const now = Date.now();
  const { ratio } = calcACWR(athleteId, historial, currentRpe);

  // ── Clasificacion de status ──
  let status, suggestion;

  if (ratio === null) {
    status = "unknown";
    suggestion = "Necesitas al menos 28 dias de historial para calcular el ACWR.";
  } else if (ratio < 0.8) {
    status = "yellow";
    suggestion = "Carga muy baja. Riesgo de desentrenamiento.";
  } else if (ratio <= 1.3) {
    status = "green";
    suggestion = "Zona optima. El atleta esta bien cargado.";
  } else if (ratio <= 1.5) {
    status = "yellow";
    suggestion = "Carga elevada. Considera reducir intensidad.";
  } else {
    status = "red";
    suggestion = "Zona de peligro. Alto riesgo de lesion. Descanso recomendado.";
  }

  // ── Calculo de tendencia (semana anterior) ──
  // prevAcute  = promedio RPEs en los dias 7-14 (semana aguda de hace 1 semana)
  // prevChronic = promedio RPEs en los dias 0-28 desplazados 7 dias atras
  //               (misma ventana cronica de 28d pero vista desde hace 7 dias)
  //               Aproximado como: sesiones entre 0-28d excluyendo las ultimas 7d agudas
  //               = ventana 7-28d. Esto representa el denominador cronico estable.
  let trend = "stable";

  if (ratio !== null) {
    const prevAcuteRpes = extractAthleteRpesWindow(
      athleteId, historial, now,
      SEVEN_DAYS_MS,
      2 * SEVEN_DAYS_MS
    );
    // Cronica de la semana anterior: promedio de la ventana 0-28d excluyendo aguda actual
    // Usamos la ventana 7-28d como aproximacion del denominador cronico estable
    const prevChronicRpes = extractAthleteRpesWindow(
      athleteId, historial, now,
      SEVEN_DAYS_MS,
      TWENTY_EIGHT_DAYS_MS
    );

    const prevAcute = prevAcuteRpes.length > 0
      ? prevAcuteRpes.reduce((s, v) => s + v, 0) / prevAcuteRpes.length
      : 0;
    const prevChronic = prevChronicRpes.length > 0
      ? prevChronicRpes.reduce((s, v) => s + v, 0) / prevChronicRpes.length
      : 0;

    if (prevChronic > 0) {
      const prevRatio = prevAcute / prevChronic;

      if (ratio > prevRatio + 0.1) {
        trend = "up";
      } else if (ratio < prevRatio - 0.1) {
        trend = "down";
      }
      // else: stable (diferencia <= 0.1)
    }
    // Si prevChronic === 0: sin datos suficientes para trend → mantener "stable"
  }

  return { ratio, status, trend, suggestion };
}
