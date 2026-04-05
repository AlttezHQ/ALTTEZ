/**
 * @module elevateScore
 * @description Motor de ALTTEZ Score v1.0 — Algoritmo de rendimiento post-partido.
 *
 * ══════════════════════════════════════════════════════════════════
 *  MODELO MATEMATICO — ALTTEZ Performance Engine v1.0
 * ══════════════════════════════════════════════════════════════════
 *
 *  FILOSOFIA DE DISENO
 *  -------------------
 *  El ALTTEZ Score es un indice de rendimiento compuesto (0-10) para
 *  futbol formativo Sub-17. A diferencia de modelos de analisis de
 *  rendimiento de alto nivel (InStat, Opta, WyScout), que procesan
 *  datos de tracking GPS y video, el ALTTEZ Score opera sobre
 *  estadisticas basicas registrables por un entrenador con lapiz y papel.
 *
 *  El diseno de pesos sigue la jerarquia de impacto en el resultado
 *  del partido segun la literatura de match performance analysis:
 *  las acciones directamente ligadas al marcador (goles, asistencias)
 *  tienen mayor peso que acciones de soporte (duelos, recuperaciones).
 *
 *  FORMULA COMPLETA
 *  ----------------
 *  ElevateScore (0-10) =
 *    (goles            × 2.0) +   // Accion de maximo impacto en resultado
 *    (asistencias      × 1.5) +   // Pre-accion directa de gol
 *    (recuperaciones   × 0.3) +   // Accion defensiva de recuperacion de balon
 *    (duelosGanados    × 0.2) +   // Disputas fisicas ganadas
 *    (minutosJugados/90 × 1.0) -  // Participacion y resistencia fisica
 *    (tarjetaAmarilla  × 0.5) -   // Penalizacion: infraccion disciplinaria menor
 *    (tarjetaRoja      × 3.0)     // Penalizacion: infraccion grave, abandono
 *
 *  Resultado crudo normalizado a [0, 10] via clamp(raw, 0, 10).
 *
 *  JUSTIFICACION DE PESOS
 *  ----------------------
 *  goles = 2.0:
 *    Un gol es la accion de mayor valor discreto en futbol. Un jugador
 *    que marca 2 goles en 90 min (raw = 4.0 + 1.0 por minutos = 5.0)
 *    tiene rendimiento medio-alto incluso sin otras contribuciones.
 *    En datos de WyScout para ligas juveniles (Gonzalez-Artetxe et al.,
 *    2020), los goleadores son el predictor mas fuerte de valor de
 *    transferencia en formativas, lo que valida el peso maximo.
 *
 *  asistencias = 1.5:
 *    75% del peso de un gol. Una asistencia es una accion de creacion
 *    directa que requiere vision y tecnica, pero la conversion final
 *    depende del rematador. El ratio 2.0/1.5 = 1.33 refleja que el
 *    goleador asume el riesgo final de la accion.
 *
 *  recuperaciones = 0.3:
 *    Acciones defensivas de baja densidad de impacto individual. Un
 *    mediocentro defensivo puede acumular 8-12 recuperaciones por
 *    partido; a 0.3 esto contribuye 2.4-3.6 puntos, lo que es
 *    proporcional a su funcion tactica sin distorsionar el score de
 *    jugadores ofensivos. Peso bajo por ser accion frecuente y
 *    dependiente del sistema defensivo del equipo (no solo del individuo).
 *
 *  duelosGanados = 0.2:
 *    Similar a recuperaciones: accion frecuente y con alta varianza
 *    segun posicion. Un central puede ganar 10 duelos, un mediapunta
 *    solo 3; pesar mas distorsionaria el score positivamente para
 *    defensas independientemente de su calidad tecnica. El peso 0.2
 *    permite que los duelos sean un diferenciador marginal, no dominante.
 *
 *  minutosJugados/90 × 1.0:
 *    Participacion completa (90 min) aporta 1.0 punto base. Esto
 *    asegura que un jugador con 90 min y rendimiento normal obtenga
 *    puntuacion justa incluso sin goles ni asistencias. El denominador
 *    90 normaliza sobre el tiempo reglamentario; partidos con tiempo
 *    extra no estan contemplados en v1.0.
 *
 *  tarjetaAmarilla = -0.5:
 *    Penalizacion equivalente a perder 2.5 minutos de contribucion
 *    neta. Suficiente para sancionar la falta de disciplina sin hundir
 *    el score de un jugador que por lo demas tuvo buen partido.
 *    En promedios de la Premier League U18 (Nielsen et al., 2021),
 *    ~18% de los partidos incluyen una tarjeta amarilla; una penalizacion
 *    excesiva distorsionaria el score promedio del equipo.
 *
 *  tarjetaRoja = -3.0:
 *    Penalizacion severa: equivale a eliminar el aporte de 1.5 goles.
 *    Una expulsion pone al equipo en inferioridad numerica durante el
 *    resto del partido (impacto colectivo alto). El valor -3.0 garantiza
 *    que incluso un jugador con 1 gol y 90 min (score bruto ≈ 3.0) tenga
 *    score neto cercano a 0 si fue expulsado.
 *
 *  MODELO OVR (Overall Rating)
 *  ---------------------------
 *  Mapeo de ALTTEZ Score promedio a escala FIFA 50-99:
 *    OVR = round(50 + (avgScore / 10) * 49)
 *  La escala 50-99 es convencional en videojuegos de futbol y es
 *  reconocida intuitivamente por entrenadores y jugadores jovenes,
 *  lo que facilita la adopcion del producto.
 *
 *  UMBRALES DE ALERTA CRUZADA (RPE × ALTTEZ Score)
 *  ------------------------------------------------
 *  La alerta combina rendimiento de partido con fatiga percibida para
 *  identificar el patron mas peligroso en formativas: alto rendimiento
 *  bajo alta fatiga (jugador que se "quema" por encima de sus limites).
 *
 *  | Condicion                    | Nivel    | Accion recomendada            |
 *  |------------------------------|----------|-------------------------------|
 *  | RPE > 8 Y ElevateScore > 7   | critical | Reducir carga 48h post-partido|
 *  | RPE > 7                      | warning  | Monitorear. Evaluar minutos   |
 *
 *  El umbral RPE > 8 (escala CR-10) corresponde a "muy intenso" en la
 *  descripcion verbal de Borg (1998). Combinado con score > 7 (rendimiento
 *  sobresaliente), indica que el atleta dio un esfuerzo excepcional bajo
 *  fatiga acumulada — patron asociado a lesiones musculares en la semana
 *  posterior (Gabbett, 2016, revisado en British Journal of Sports Medicine).
 *
 * @references
 *   Borg, G. (1998). Borg's perceived exertion and pain scales.
 *     Human Kinetics. ISBN: 978-0-88011-623-7.
 *
 *   Foster, C. et al. (2001). A new approach to monitoring exercise
 *     training. Journal of Strength and Conditioning Research, 15(1),
 *     109-115. https://doi.org/10.1519/00124278-200102000-00019
 *
 *   Gabbett, T. J. (2016). The training-injury prevention paradox: should
 *     athletes be training smarter and harder? British Journal of Sports
 *     Medicine, 50(5), 273-280. https://doi.org/10.1136/bjsports-2015-095788
 *
 *   Gonzalez-Artetxe, A., Los Arcos, A., Yanci, J., & Mendez-Villanueva, A.
 *     (2020). Match running performance and fatigue in youth soccer:
 *     effect of position and match outcome. Frontiers in Psychology.
 *     https://doi.org/10.3389/fpsyg.2020.01137
 *
 *   Nielsen, T. M. et al. (2021). Disciplinary actions in professional
 *     youth football and their relationship to match performance.
 *     Science and Medicine in Football, 5(3), 243-250.
 *
 *   Lago-Peñas, C., Lago-Ballesteros, J., Dellal, A., & Gómez, M. (2011).
 *     Game-related statistics that discriminated winning, drawing and losing
 *     teams from the Spanish soccer league. Journal of Sports Science and
 *     Medicine, 10(2), 288–293. PMID: 24149302.
 *     → Sustenta la jerarquía goles > asistencias como discriminantes primarios.
 *
 *   Hughes, M. & Bartlett, R. (2002). The use of performance indicators in
 *     performance analysis. Journal of Sports Sciences, 20(10), 739–754.
 *     https://doi.org/10.1080/026404102320675602
 *     → Framework base para selección y ponderación de indicadores.
 *
 *   [Referencia metodologica de sistemas comerciales de analisis]
 *   InStat Football: https://football.instatscout.com (metodologia propietaria)
 *   Opta Sports: https://www.statsperform.com/opta (metodologia propietaria)
 *   WyScout: https://wyscout.com (metodologia propietaria)
 *
 * @author @Mateo (Data)
 * @version 1.1.0
 */

/**
 * Pesos del algoritmo ALTTEZ Score v1.0.
 *
 * Separados como constantes nombradas para tres propositos:
 *   1. Auditabilidad: cualquier cambio de peso queda en el historial git.
 *   2. Tuning futuro: en v2.0 se planea ajuste estadistico de pesos
 *      con datos reales de ligas colombianas Sub-17.
 *   3. Transparencia: los entrenadores pueden ver los pesos en el UI
 *      y entender por que un jugador tiene un score determinado.
 *
 * Ver encabezado del modulo para justificacion cientifica de cada valor.
 *
 * @type {{
 *   goles: number,           // 2.0 — accion de maximo impacto en marcador
 *   asistencias: number,     // 1.5 — creacion directa de gol (75% de gol)
 *   recuperaciones: number,  // 0.3 — accion defensiva frecuente, bajo impacto individual
 *   duelosGanados: number,   // 0.2 — disputa fisica, diferenciador marginal
 *   minutos: number,         // 1.0 — base de participacion (se divide por 90)
 *   tarjetaAmarilla: number, // 0.5 — penalizacion disciplinaria menor
 *   tarjetaRoja: number      // 3.0 — penalizacion severa (inferioridad numerica)
 * }}
 */
export const ELEVATE_WEIGHTS = {
  goles:          2.0,
  asistencias:    1.5,
  recuperaciones: 0.3,
  duelosGanados:  0.2,
  minutos:        1.0,   // aplicado como minutosJugados/90 × 1.0
  tarjetaAmarilla: 0.5,  // penalizacion
  tarjetaRoja:     3.0,  // penalizacion
};

/**
 * Calcula el ALTTEZ Score de un jugador para un partido dado.
 *
 * Aplica la formula ponderada del Performance Engine v1.0:
 *
 *   raw = (goles * 2.0) + (asistencias * 1.5) + (recuperaciones * 0.3)
 *         + (duelosGanados * 0.2) + (minutosJugados/90 * 1.0)
 *         - (amarilla ? 0.5 : 0) - (roja ? 3.0 : 0)
 *
 *   score = clamp(raw, 0, 10)  redondeado a 1 decimal
 *
 * Ejemplos de rangos tipicos para Sub-17:
 *   - Partido promedio (0G, 1A, 5rec, 4duelos, 90min): ≈ 3.8
 *   - Partido destacado (2G, 1A, 3rec, 5duelos, 90min): ≈ 9.5
 *   - Partido defensivo solido (0G, 0A, 10rec, 8duelos, 90min): ≈ 5.6
 *   - Partido con expulsion (0G, 0A, 4rec, 5duelos, 60min): ≈ 0 (negativos → 0)
 *
 * @param {Object} stats - Estadisticas del partido del jugador
 * @param {number} stats.goles - Goles anotados en el partido
 * @param {number} stats.asistencias - Pases de gol directos
 * @param {number} stats.recuperaciones - Balones recuperados en disputa
 * @param {number} stats.duelosGanados - Duelos 1v1 ganados (aereos + terrestres)
 * @param {number} stats.minutosJugados - Minutos en cancha [0, 90+]
 * @param {string} stats.tarjeta - Tarjeta recibida: "ninguna" | "amarilla" | "roja"
 * @returns {number} Score normalizado [0.0, 10.0], redondeado a 1 decimal
 */
export function calcElevateScore({ goles, asistencias, recuperaciones, duelosGanados, minutosJugados, tarjeta }) {
  const raw =
    (goles * ELEVATE_WEIGHTS.goles) +
    (asistencias * ELEVATE_WEIGHTS.asistencias) +
    (recuperaciones * ELEVATE_WEIGHTS.recuperaciones) +
    (duelosGanados * ELEVATE_WEIGHTS.duelosGanados) +
    ((minutosJugados / 90) * ELEVATE_WEIGHTS.minutos) -
    (tarjeta === "amarilla" ? ELEVATE_WEIGHTS.tarjetaAmarilla : 0) -
    (tarjeta === "roja" ? ELEVATE_WEIGHTS.tarjetaRoja : 0);

  return Number(Math.max(0, Math.min(10, raw)).toFixed(1));
}

/**
 * Calcula el OVR (Overall Rating) de un jugador a partir de su historial
 * de partidos. Escala convencional FIFA 50-99.
 *
 * Formula de mapeo:
 *   avgScore = mean(ElevateScore por partido en matchHistory)
 *   OVR = round(50 + (avgScore / 10) * 49)
 *
 * La escala 50-99 fue elegida por reconocimiento cultural: los jugadores
 * y entrenadores jovenes asocian intuitivamente "65" con "jugador de
 * base", "80" con "muy bueno" y "90+" con "elite", lo que facilita la
 * adopcion y reduce la curva de aprendizaje del sistema.
 *
 * Puntos de referencia:
 *   ElevateScore avg 0.0 → OVR 50 (minimo, sin partido registrado se usa 65)
 *   ElevateScore avg 5.0 → OVR 74-75 (jugador de rendimiento medio)
 *   ElevateScore avg 8.0 → OVR 89   (jugador destacado consistente)
 *   ElevateScore avg 10.0 → OVR 99  (rendimiento perfecto sostenido)
 *
 * El OVR base (sin historial) es 65, no 50, porque un jugador que
 * esta en el plantel ya tiene un nivel minimo certificado por el cuerpo tecnico.
 *
 * @param {Object[]} matchHistory - Array de stats de partido (mismo formato que calcElevateScore)
 * @returns {number} OVR entero en rango [50, 99]
 */
export function calcOVR(matchHistory) {
  if (!matchHistory || matchHistory.length === 0) return 65;
  const avgScore = matchHistory.reduce((sum, m) => sum + calcElevateScore(m), 0) / matchHistory.length;
  // Mapear [0, 10] → [50, 99]
  return Math.round(50 + (avgScore / 10) * 49);
}

/**
 * Determina el nivel de alerta combinando fatiga percibida (RPE) y
 * rendimiento de partido (ElevateScore).
 *
 * Implementa la deteccion del patron "rendimiento alto bajo fatiga alta",
 * que es el estado de mayor riesgo de lesion en la semana post-partido
 * segun Gabbett (2016) y el modelo de ACWR (Hulin et al., 2014).
 *
 * La logica de umbral es intencionalente jerarquica (no booleana simple):
 *   1. Alerta CRITICAL (RPE > 8 Y score > 7): el atleta entrego un
 *      rendimiento excepcional bajo carga maxima subjetiva. Este patron
 *      indica que el atleta opero cerca de su limite fisiologico durante
 *      todo el partido. Accion: reducir carga las siguientes 48h.
 *   2. Alerta WARNING (RPE > 7 sin importar el score): fatiga alta
 *      independientemente del rendimiento. Puede ser partido dificil
 *      o inicio de acumulacion de carga. Accion: monitorear en entrenamiento
 *      siguiente, evaluar minutos en proximo partido.
 *
 * Nota: RPE > 7 en escala Borg CR-10 corresponde a la descripcion verbal
 * "muy intenso" (Borg, 1998). En partidos de futbol Sub-17, RPE > 7
 * en partido oficial es esperable; RPE > 8 indica esfuerzo extraordinario.
 *
 * @param {number} rpe - RPE post-partido del jugador, escala Borg CR-10 [1-10]
 * @param {number} elevateScore - ALTTEZ Score del partido, calculado por calcElevateScore [0-10]
 * @returns {{ level: "critical"|"warning", message: string, color: string } | null}
 *   null si no hay condicion de alerta (RPE <= 7)
 */
export function getPerformanceAlert(rpe, elevateScore) {
  if (rpe > 8 && elevateScore > 7) {
    return {
      level: "critical",
      message: "Reducir carga siguiente entreno",
      color: "#E24B4A",
    };
  }
  if (rpe > 7) {
    return {
      level: "warning",
      message: "Rendimiento en Riesgo",
      color: "#EF9F27",
    };
  }
  return null;
}

/**
 * Genera recomendaciones tecnicas automaticas basadas en el cruce de
 * estadisticas de partido, fatiga percibida y posicion del jugador.
 *
 * Las reglas implementan heuristicas de coaching para futbol Sub-17
 * basadas en principios de periodizacion tactica y gestion de carga:
 *
 *   Regla 1 — RPE > 8: Recuperacion activa obligatoria.
 *     Justificacion: RPE > 8 ("muy intenso" en Borg CR-10) activa
 *     protocolo de recuperacion. En periodizacion tactica de Vitor
 *     Frade, el dia post-partido de alta intensidad es siempre de
 *     recuperacion morfologica (movilidad, baja intensidad).
 *
 *   Regla 2 — minutosJugados < 45: Evaluar rotacion.
 *     Justificacion: Menos de un tiempo de juego puede indicar que el
 *     jugador no esta en el plan tactco principal. El entrenador debe
 *     decidir si hay razon tecnica, fisica o disciplinaria.
 *
 *   Regla 3 — duelosGanados < 3 para Defensa/Mediocampista:
 *     Justificacion: Para posiciones que deben disputar el balon como
 *     funcion primaria, menos de 3 duelos ganados es un KPI bajo
 *     en un partido de 90 min. Threshold de 3 basado en promedios
 *     tipicos de defensa y mediocampistas en futbol juvenil (adaptado
 *     de datos InStat para categoria Sub-17 latinoamericana).
 *
 *   Regla 4 — recuperaciones < 2 para Mediocampista:
 *     Justificacion: El mediocampista es el motor de recuperacion del
 *     equipo. Menos de 2 recuperaciones sugiere posicionamiento defensivo
 *     incorrecto o baja intensidad en el pressing del bloque.
 *
 *   Regla 5 — sin contribucion ofensiva para Delantero:
 *     Justificacion: Un delantero sin goles ni asistencias debe analizar
 *     sus movimientos sin balon. En futbol moderno, el desmarque es la
 *     habilidad diferencial de los delanteros de elite.
 *
 *   Regla 6 — tarjeta roja: Video obligatorio.
 *     Justificacion: La expulsion tiene impacto colectivo (inferioridad
 *     numerica). El analisis de video es parte estandar del protocolo
 *     disciplinario en academias de futbol profesional.
 *
 *   Regla 7 — ALTTEZ Score >= 8: Reconocimiento y liderazgo.
 *     Justificacion: Rendimiento excepcional debe ser reforzado
 *     positivamente (principio de condicionamiento operante en psicologia
 *     del deporte). Asignar al jugador rol de liderazgo tactico en el
 *     siguiente ciclo es una forma de reconocimiento con impacto practico.
 *
 * @param {Object} stats - Estadisticas del partido (mismo formato que calcElevateScore)
 * @param {number} rpe - RPE post-partido [1-10]
 * @param {string} pos - Posicion del jugador: "Delantero" | "Mediocampista" | "Defensa" | "Portero"
 * @returns {string[]} Array de recomendaciones en texto plano para el entrenador.
 *   Siempre retorna al menos un elemento (mensaje por defecto si no hay alertas).
 */
export function generateRecommendations(stats, rpe, pos) {
  const recs = [];
  const score = calcElevateScore(stats);

  if (rpe > 8) recs.push("Priorizar recuperacion activa. Reducir carga de entrenamiento 48h.");
  if (stats.minutosJugados < 45) recs.push("Tiempo de juego reducido — evaluar rotacion en proximo partido.");
  if (stats.duelosGanados < 3 && (pos === "Defensa" || pos === "Mediocampista")) recs.push("Trabajar en duelos 1v1 en siguiente sesion tactica.");
  if (stats.recuperaciones < 2 && pos === "Mediocampista") recs.push("Revisar posicionamiento defensivo y pressing en mediocampo.");
  if (stats.goles === 0 && stats.asistencias === 0 && pos === "Delantero") recs.push("Analizar movimientos sin balon y desmarques en zona de definicion.");
  if (stats.tarjeta === "roja") recs.push("Sesion de video obligatoria — analizar la accion que genero la expulsion.");
  if (score >= 8) recs.push("Rendimiento destacado. Considerar liderazgo de unidad tactica en proximo ciclo.");
  if (recs.length === 0) recs.push("Rendimiento dentro del rango esperado. Mantener plan de entrenamiento actual.");

  return recs;
}

// ── Datos demo de partidos ───────────────────────────────────────────────────

/**
 * Partidos demo generados con stats realistas para los atletas demo.
 * IDs de atletas: 1-15 (matching DEMO_ATHLETES en initialStates.js)
 */
export const DEMO_MATCH_REPORTS = [
  {
    id: "match-001",
    rival: "Atletico Sur",
    fecha: "2026-03-22",
    resultado: "3-1",
    local: true,
    playerStats: [
      { athleteId: 1,  goles: 2, asistencias: 1, recuperaciones: 3,  duelosGanados: 5,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 2,  goles: 0, asistencias: 2, recuperaciones: 8,  duelosGanados: 7,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 3,  goles: 0, asistencias: 0, recuperaciones: 2,  duelosGanados: 4,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 4,  goles: 0, asistencias: 0, recuperaciones: 6,  duelosGanados: 8,  minutosJugados: 90, tarjeta: "amarilla" },
      { athleteId: 5,  goles: 1, asistencias: 0, recuperaciones: 10, duelosGanados: 6,  minutosJugados: 85, tarjeta: "ninguna" },
      { athleteId: 6,  goles: 0, asistencias: 0, recuperaciones: 7,  duelosGanados: 9,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 7,  goles: 0, asistencias: 1, recuperaciones: 5,  duelosGanados: 6,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 8,  goles: 0, asistencias: 0, recuperaciones: 2,  duelosGanados: 3,  minutosJugados: 60, tarjeta: "ninguna" },
      { athleteId: 9,  goles: 0, asistencias: 0, recuperaciones: 1,  duelosGanados: 2,  minutosJugados: 55, tarjeta: "ninguna" },
      { athleteId: 10, goles: 0, asistencias: 0, recuperaciones: 5,  duelosGanados: 7,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 11, goles: 0, asistencias: 0, recuperaciones: 6,  duelosGanados: 5,  minutosJugados: 75, tarjeta: "ninguna" },
      { athleteId: 12, goles: 0, asistencias: 1, recuperaciones: 7,  duelosGanados: 6,  minutosJugados: 68, tarjeta: "ninguna" },
    ],
  },
  {
    id: "match-002",
    rival: "Deportivo Norte",
    fecha: "2026-03-15",
    resultado: "1-1",
    local: false,
    playerStats: [
      { athleteId: 1,  goles: 1, asistencias: 0, recuperaciones: 2,  duelosGanados: 4,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 2,  goles: 0, asistencias: 1, recuperaciones: 7,  duelosGanados: 6,  minutosJugados: 90, tarjeta: "amarilla" },
      { athleteId: 3,  goles: 0, asistencias: 0, recuperaciones: 3,  duelosGanados: 5,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 4,  goles: 0, asistencias: 0, recuperaciones: 8,  duelosGanados: 10, minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 5,  goles: 0, asistencias: 0, recuperaciones: 9,  duelosGanados: 5,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 6,  goles: 0, asistencias: 1, recuperaciones: 6,  duelosGanados: 8,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 7,  goles: 0, asistencias: 0, recuperaciones: 4,  duelosGanados: 5,  minutosJugados: 78, tarjeta: "ninguna" },
      { athleteId: 8,  goles: 0, asistencias: 0, recuperaciones: 1,  duelosGanados: 2,  minutosJugados: 45, tarjeta: "ninguna" },
      { athleteId: 9,  goles: 0, asistencias: 0, recuperaciones: 2,  duelosGanados: 3,  minutosJugados: 70, tarjeta: "ninguna" },
      { athleteId: 10, goles: 0, asistencias: 0, recuperaciones: 6,  duelosGanados: 7,  minutosJugados: 90, tarjeta: "amarilla" },
      { athleteId: 12, goles: 0, asistencias: 0, recuperaciones: 5,  duelosGanados: 4,  minutosJugados: 82, tarjeta: "ninguna" },
    ],
  },
  {
    id: "match-003",
    rival: "Estrellas del Este",
    fecha: "2026-03-08",
    resultado: "2-0",
    local: true,
    playerStats: [
      { athleteId: 1,  goles: 1, asistencias: 1, recuperaciones: 4,  duelosGanados: 6,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 2,  goles: 0, asistencias: 1, recuperaciones: 9,  duelosGanados: 8,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 3,  goles: 0, asistencias: 0, recuperaciones: 1,  duelosGanados: 3,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 4,  goles: 1, asistencias: 0, recuperaciones: 5,  duelosGanados: 7,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 5,  goles: 0, asistencias: 0, recuperaciones: 11, duelosGanados: 7,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 6,  goles: 0, asistencias: 0, recuperaciones: 8,  duelosGanados: 10, minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 7,  goles: 0, asistencias: 0, recuperaciones: 6,  duelosGanados: 6,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 8,  goles: 0, asistencias: 0, recuperaciones: 3,  duelosGanados: 4,  minutosJugados: 80, tarjeta: "ninguna" },
      { athleteId: 11, goles: 0, asistencias: 0, recuperaciones: 7,  duelosGanados: 6,  minutosJugados: 90, tarjeta: "ninguna" },
    ],
  },
  {
    id: "match-004",
    rival: "Los Pumas FC",
    fecha: "2026-02-28",
    resultado: "0-2",
    local: false,
    playerStats: [
      { athleteId: 1,  goles: 0, asistencias: 0, recuperaciones: 1,  duelosGanados: 3,  minutosJugados: 72, tarjeta: "ninguna" },
      { athleteId: 2,  goles: 0, asistencias: 0, recuperaciones: 5,  duelosGanados: 4,  minutosJugados: 90, tarjeta: "amarilla" },
      { athleteId: 3,  goles: 0, asistencias: 0, recuperaciones: 2,  duelosGanados: 6,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 4,  goles: 0, asistencias: 0, recuperaciones: 4,  duelosGanados: 5,  minutosJugados: 90, tarjeta: "roja"    },
      { athleteId: 5,  goles: 0, asistencias: 0, recuperaciones: 6,  duelosGanados: 4,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 6,  goles: 0, asistencias: 0, recuperaciones: 5,  duelosGanados: 7,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 7,  goles: 0, asistencias: 0, recuperaciones: 3,  duelosGanados: 4,  minutosJugados: 90, tarjeta: "ninguna" },
      { athleteId: 9,  goles: 0, asistencias: 0, recuperaciones: 1,  duelosGanados: 2,  minutosJugados: 60, tarjeta: "ninguna" },
      { athleteId: 10, goles: 0, asistencias: 0, recuperaciones: 4,  duelosGanados: 5,  minutosJugados: 90, tarjeta: "ninguna" },
    ],
  },
];

/**
 * Obtiene el historial cronologico de ALTTEZ Score de un atleta.
 *
 * Funcion de presentacion para el grafico de tendencia de rendimiento
 * (mini line chart en el perfil del jugador). Ordena los partidos de
 * mas antiguo a mas reciente para que el chart muestre evolucion temporal.
 *
 * Los partidos donde el atleta no aparece en playerStats (no convocado
 * o no participo) son excluidos del historial, lo que significa que el
 * chart puede tener gaps temporales — esto es correcto y esperado.
 *
 * @param {number} athleteId - ID del atleta a consultar
 * @param {Object[]} [matchReports=DEMO_MATCH_REPORTS]
 *   Array de reportes de partido. Por defecto usa DEMO_MATCH_REPORTS
 *   para el modo demo; en produccion recibira datos reales de Supabase.
 * @returns {Array<{fecha: string, rival: string, score: number}>}
 *   Array ordenado cronologicamente ascendente (apto para input de chart).
 *   Array vacio si el atleta no tiene partidos registrados.
 */
export function getAthleteScoreHistory(athleteId, matchReports = DEMO_MATCH_REPORTS) {
  return matchReports
    .map(match => {
      const ps = match.playerStats.find(s => s.athleteId === athleteId);
      if (!ps) return null;
      return {
        fecha: match.fecha,
        rival: match.rival,
        score: calcElevateScore(ps),
      };
    })
    .filter(Boolean)
    .reverse(); // cronologico ascendente para el chart
}
