/**
 * competitionEngine.js
 * Motor de dominio puro para torneos de formato "Grupos + Fase Final".
 * Todas las funciones son puras (sin efectos secundarios, sin imports del store).
 * Re-exporta helpers de fixturesEngine y tournamentAlgorithms para no duplicar lógica.
 */

// ── Re-exports de utilidades existentes ──────────────────────────────────────
export {
  calcularPosiciones,
  distribuirEnGrupos,
  generarFixture,
} from "./fixturesEngine.js";

export {
  buildPlayoff,
  calculateTournamentMath,
  distributeInGroups,
  getRoundName,
  isPowerOfTwo,
  nextPowerOfTwo,
  recommendStructure,
  calculateSchedulingStats,
  estimateProjectedEndDate,
  getFeasibilitySuggestions,
} from "./tournamentAlgorithms.js";

// ── Constantes ────────────────────────────────────────────────────────────────

const ID  = () => crypto.randomUUID();
const NOW = () => new Date().toISOString();

export const GROUP_LABELS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

export const DEFAULT_POINTS_CONFIG = {
  win:  3,
  draw: 1,
  loss: 0,
};

export const TIEBREAKER_OPTIONS = [
  { id: "points",    label: "Puntos" },
  { id: "goal_diff", label: "Diferencia de goles" },
  { id: "goals_for", label: "Goles a favor" },
  { id: "h2h",       label: "Resultado entre sí" },
  { id: "fair_play", label: "Fair play (menos tarjetas)" },
  { id: "draw",      label: "Sorteo / decisión manual" },
];

export const DEFAULT_TIEBREAKERS = ["points","goal_diff","goals_for","h2h","fair_play","draw"];

export const KNOCKOUT_TIEBREAK_OPTIONS = [
  { id: "penalties",       label: "Penales" },
  { id: "extra_penalties", label: "Prórroga + penales" },
  { id: "away_goals",      label: "Ventaja deportiva (goles de visitante)" },
  { id: "manual",          label: "Decisión manual del administrador" },
];

export const ASSIGNMENT_METHOD_OPTIONS = [
  { id: "auto_serpentina", label: "Automático (serpentina)" },
  { id: "auto_random",     label: "Automático (aleatorio)" },
  { id: "manual",          label: "Manual" },
];

export const CROSSING_METHOD_OPTIONS = [
  { id: "auto_position",  label: "Automático por posición en grupos" },
  { id: "ranking_general", label: "Ranking general" },
  { id: "manual",          label: "Manual" },
];

export const INITIAL_ROUND_OPTIONS = [
  { id: "auto",     label: "Automático (según clasificados)" },
  { id: "final",    label: "Final" },
  { id: "semis",    label: "Semifinal" },
  { id: "cuartos",  label: "Cuartos de final" },
  { id: "octavos",  label: "Octavos de final" },
];

// ── Configuración por defecto para grupos + fase final ─────────────────────

export const DEFAULT_GROUPS_PLUS_KNOCKOUT_CONFIG = {
  // Fase de grupos
  groupsCount:      2,
  groupLegs:        1,         // 1 = solo ida, 2 = ida y vuelta
  qualifyPerGroup:  2,
  assignmentMethod: "auto_serpentina",
  allowBestThirds:  false,
  bestThirdsCount:  0,

  // Puntos
  pointsConfig: { ...DEFAULT_POINTS_CONFIG },

  // Desempate (lista ordenada de criterios)
  tiebreakers: [...DEFAULT_TIEBREAKERS],

  // Fase final
  initialKnockoutRound: "auto",
  crossingMethod:       "auto_position",
  knockoutTiebreakRule: "penalties",
  playoffLegs:          1,
  finalLegs:            1,
};

// ── 1. generateGroups() ───────────────────────────────────────────────────────

/**
 * Distribuye equipos en grupos según el método de asignación.
 * @param {Array}  teams  - Lista de equipos [{ id, nombre, ... }]
 * @param {Object} config - { groupsCount, assignmentMethod }
 * @returns {Array} grupos - Array de arrays de equipos, con label A,B,C...
 *
 * Ejemplo output:
 *   [
 *     { label: "A", teams: [{ id, nombre },...] },
 *     { label: "B", teams: [...] },
 *   ]
 */
export function generateGroups(teams, config = {}) {
  const { groupsCount = 2, assignmentMethod = "auto_serpentina" } = config;

  if (!teams || teams.length < 2) return [];
  if (groupsCount < 1) return [];
  if (teams.length < groupsCount) return [];

  // Preparar lista según método
  let orderedTeams = [...teams];
  if (assignmentMethod === "auto_random") {
    orderedTeams = [...teams].sort(() => Math.random() - 0.5);
  }

  // Inicializar grupos vacíos
  const groups = Array.from({ length: groupsCount }, (_, i) => ({
    label: GROUP_LABELS[i] ?? String(i + 1),
    index: i,
    teams: [],
  }));

  if (assignmentMethod === "manual") {
    // En modo manual devuelve grupos vacíos para que el usuario asigne
    return groups;
  }

  // Distribución serpentina: 0→n en pares, n→0 en impares
  orderedTeams.forEach((team, idx) => {
    const pass  = Math.floor(idx / groupsCount);
    const pos   = idx % groupsCount;
    const groupIdx = pass % 2 === 0 ? pos : groupsCount - 1 - pos;
    groups[groupIdx].teams.push(team);
  });

  return groups;
}

// ── 2. generateRoundRobinFixtures() ──────────────────────────────────────────

/**
 * Genera fixture todos-contra-todos para una lista de grupos.
 * @param {Array}  groupedTeams  - Output de generateGroups()
 * @param {Object} config        - { torneoId, groupLegs, categoriaId? }
 * @returns {Array} partidos     - Todos los partidos de la fase de grupos
 */
export function generateRoundRobinFixtures(groupedTeams, config = {}) {
  const { torneoId, groupLegs = 1, categoriaId = null } = config;
  const allMatches = [];
  let globalOrder = 0;

  groupedTeams.forEach(({ label: groupLabel, teams }) => {
    if (!teams || teams.length < 2) return;

    let list = [...teams];
    // Si número impar, agregar BYE
    if (list.length % 2 !== 0) list.push({ id: "BYE", nombre: "BYE" });

    const n      = list.length;
    const rounds = n - 1;

    for (let vuelta = 0; vuelta < groupLegs; vuelta++) {
      const localList = [...list]; // reset rotation cada vuelta
      for (let r = 0; r < rounds; r++) {
        for (let i = 0; i < n / 2; i++) {
          let local  = localList[i];
          let visita = localList[n - 1 - i];

          // Alternar localía en vuelta par (vuelta 2 → invertir)
          if (vuelta % 2 !== 0) { const tmp = local; local = visita; visita = tmp; }

          // Ignorar partidos con BYE
          if (local.id === "BYE" || visita.id === "BYE") continue;

          allMatches.push({
            id:             ID(),
            torneoId,
            categoriaId,
            fase:           "grupos",
            grupo:          groupLabel,
            ronda:          (vuelta * rounds) + r + 1,
            vuelta:         vuelta + 1,
            legNumber:      vuelta + 1,
            equipoLocalId:  local.id,
            equipoVisitaId: visita.id,
            golesLocal:     null,
            golesVisita:    null,
            estado:         "pendiente",
            fechaHora:      null,
            lugar:          null,
            sedeId:         null,
            arbitroId:      null,
            orden:          globalOrder++,
            source:         "group",
            createdAt:      NOW(),
          });
        }
        // Rotar manteniendo primer elemento fijo
        const last = localList.pop();
        localList.splice(1, 0, last);
      }
    }
  });

  return allMatches;
}

// ── 3. calculateGroupStandings() ─────────────────────────────────────────────

/**
 * Calcula tabla de posiciones por grupo con puntos configurables.
 * @param {Array}  matches      - Partidos del torneo (todos)
 * @param {Array}  teams        - Equipos del torneo
 * @param {Object} pointsConfig - { win, draw, loss }
 * @param {String} groupFilter  - Opcional: filtrar por grupo ("A", "B", ...)
 * @returns {Object} { [groupLabel]: [ standingRow, ... ] }
 */
export function calculateGroupStandings(matches, teams, pointsConfig = DEFAULT_POINTS_CONFIG, groupFilter = null) {
  const { win = 3, draw = 1, loss = 0 } = pointsConfig;

  // Inicializar mapa por equipo
  const map = {};
  teams.forEach(t => {
    map[t.id] = {
      equipoId: t.id,
      nombre:   t.nombre,
      grupo:    t.grupo ?? null,
      pj: 0, pg: 0, pe: 0, pp: 0,
      gf: 0, gc: 0, dg: 0, pts: 0,
    };
  });

  // Filtrar partidos de fase de grupos finalizados
  const grupoMatches = matches.filter(p =>
    p.fase === "grupos" &&
    p.estado === "finalizado" &&
    p.golesLocal  != null &&
    p.golesVisita != null &&
    (!groupFilter || p.grupo === groupFilter)
  );

  grupoMatches.forEach(p => {
    const loc = map[p.equipoLocalId];
    const vis = map[p.equipoVisitaId];
    if (!loc || !vis) return;

    loc.pj++; vis.pj++;
    loc.gf += p.golesLocal;  loc.gc += p.golesVisita;
    vis.gf += p.golesVisita; vis.gc += p.golesLocal;

    if (p.golesLocal > p.golesVisita) {
      loc.pg++; loc.pts += win;
      vis.pp++; vis.pts += loss;
    } else if (p.golesLocal < p.golesVisita) {
      vis.pg++; vis.pts += win;
      loc.pp++; loc.pts += loss;
    } else {
      loc.pe++; loc.pts += draw;
      vis.pe++; vis.pts += draw;
    }
  });

  // Calcular DG y agrupar por grupo
  const byGroup = {};
  Object.values(map).forEach(row => {
    row.dg = row.gf - row.gc;
    const grp = row.grupo ?? "General";
    if (!byGroup[grp]) byGroup[grp] = [];
    byGroup[grp].push(row);
  });

  return byGroup;
}

// ── 4. applyTiebreakers() ────────────────────────────────────────────────────

/**
 * Ordena equipos empatados según lista de criterios de desempate.
 * @param {Array}  teams        - Filas de standing [{ equipoId, pts, dg, gf, ... }]
 * @param {Array}  tiebreakers  - Lista ordenada de IDs de criterio
 * @param {Array}  allMatches   - Todos los partidos (necesario para h2h)
 * @returns {Array} Equipos ordenados de mayor a menor
 */
export function applyTiebreakers(teams, tiebreakers = DEFAULT_TIEBREAKERS, allMatches = []) {
  return [...teams].sort((a, b) => {
    for (const criterion of tiebreakers) {
      let diff = 0;

      switch (criterion) {
        case "points":
          diff = b.pts - a.pts;
          break;

        case "goal_diff":
          diff = b.dg - a.dg;
          break;

        case "goals_for":
          diff = b.gf - a.gf;
          break;

        case "h2h": {
          // Resultado entre los dos equipos empatados
          const h2hMatch = allMatches.find(m =>
            m.fase === "grupos" && m.estado === "finalizado" &&
            ((m.equipoLocalId === a.equipoId && m.equipoVisitaId === b.equipoId) ||
             (m.equipoLocalId === b.equipoId && m.equipoVisitaId === a.equipoId))
          );
          if (h2hMatch) {
            const aIsLocal = h2hMatch.equipoLocalId === a.equipoId;
            const aGoals = aIsLocal ? h2hMatch.golesLocal : h2hMatch.golesVisita;
            const bGoals = aIsLocal ? h2hMatch.golesVisita : h2hMatch.golesLocal;
            diff = bGoals - aGoals; // b - a → mayor primero
          }
          break;
        }

        case "fair_play":
          // Si existe campo de tarjetas, usarlo; si no, sin desempate por este criterio
          diff = (a.yellowCards ?? 0) - (b.yellowCards ?? 0); // menos tarjetas = mejor
          break;

        case "draw":
        default:
          diff = 0;
          break;
      }

      if (diff !== 0) return diff;
    }
    return 0;
  });
}

// ── 5. getQualifiedTeams() ───────────────────────────────────────────────────

/**
 * Devuelve los equipos clasificados para la fase final.
 * Soporta clasificados directos por grupo + mejores terceros.
 *
 * @param {Object} groupStandings - Output de calculateGroupStandings()
 * @param {Object} config         - { qualifyPerGroup, allowBestThirds, bestThirdsCount, tiebreakers }
 * @param {Array}  allMatches     - Todos los partidos (para h2h)
 * @returns {Array} Clasificados ordenados con metadata { teamId, nombre, group, position, qualifyType }
 */
export function getQualifiedTeams(groupStandings, config = {}, allMatches = []) {
  const {
    qualifyPerGroup  = 2,
    allowBestThirds  = false,
    bestThirdsCount  = 0,
    tiebreakers      = DEFAULT_TIEBREAKERS,
  } = config;

  const qualifiedDirect = [];
  const thirds          = []; // para mejores terceros

  Object.entries(groupStandings).forEach(([groupLabel, rows]) => {
    const sorted = applyTiebreakers(rows, tiebreakers, allMatches);

    sorted.forEach((row, idx) => {
      const position = idx + 1;
      const entry = {
        equipoId:    row.equipoId,
        nombre:      row.nombre,
        group:       groupLabel,
        position,
        pts:         row.pts,
        dg:          row.dg,
        gf:          row.gf,
        qualifyType: null,
      };

      if (position <= qualifyPerGroup) {
        entry.qualifyType = `${position}${groupLabel}`; // e.g. "1A", "2B"
        qualifiedDirect.push(entry);
      } else if (allowBestThirds && position === qualifyPerGroup + 1) {
        entry.qualifyType = `3${groupLabel}`;
        thirds.push(entry);
      }
    });
  });

  // Seleccionar mejores terceros por pts → dg → gf
  const bestThirds = [...thirds]
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf)
    .slice(0, bestThirdsCount);

  return [...qualifiedDirect, ...bestThirds];
}

// ── 6. generateKnockoutBracket() ─────────────────────────────────────────────

/**
 * Genera las llaves eliminatorias a partir de los clasificados.
 * @param {Array}  qualifiedTeams - Output de getQualifiedTeams()
 * @param {Object} config         - { torneoId, crossingMethod, initialKnockoutRound, playoffLegs, finalLegs, categoriaId }
 * @returns {Array} partidos de fase final (bracketMatches)
 */
export function generateKnockoutBracket(qualifiedTeams, config = {}) {
  const {
    torneoId,
    categoriaId       = null,
    crossingMethod    = "auto_position",
    playoffLegs       = 1,
    finalLegs         = 1,
  } = config;

  const n = qualifiedTeams.length;
  if (n < 2) return [];

  // Determinar rondas necesarias (potencia de 2 más cercana)
  const slots = nextPow2(n);

  // Ordenar clasificados para los cruces
  let seeded = [...qualifiedTeams];
  if (crossingMethod === "ranking_general") {
    // Ordenar globalmente por pts → dg → gf
    seeded.sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
  } else {
    // auto_position: orden natural (1A, 2A, 1B, 2B...) ya viene ordenado
    // Solo reordenar para generar cruces clásicos: 1A vs 2B, 1B vs 2A, etc.
    seeded = reorderForClassicCrossing(qualifiedTeams);
  }

  const phases    = phasesFromSlots(slots);
  const matches   = [];
  let globalOrder = 1000; // offset para no colisionar con partidos de grupos

  // Primera fase: sembrar clasificados o TBD
  const firstPhase = phases[0];
  const isFirstFinal = firstPhase === "final";
  const firstLegs = isFirstFinal ? finalLegs : playoffLegs;

  for (let leg = 1; leg <= firstLegs; leg++) {
    for (let slot = 0; slot < slots / 2; slot++) {
      const localTeam  = seeded[slot * 2]     ?? null;
      const visitaTeam = seeded[slot * 2 + 1] ?? null;

      matches.push({
        id:             ID(),
        torneoId,
        categoriaId,
        fase:           firstPhase,
        grupo:          null,
        ronda:          1,
        legNumber:      leg,
        equipoLocalId:  localTeam?.equipoId  ?? null,
        equipoVisitaId: visitaTeam?.equipoId ?? null,
        golesLocal:     null,
        golesVisita:    null,
        estado:         localTeam && visitaTeam ? "pendiente" : "bye",
        fechaHora:      null,
        sedeId:         null,
        arbitroId:      null,
        orden:          globalOrder++,
        source:         "knockout",
        createdAt:      NOW(),
      });
    }
  }

  // Fases siguientes: brackets vacíos (TBD)
  for (let phaseIdx = 1; phaseIdx < phases.length; phaseIdx++) {
    const phase     = phases[phaseIdx];
    const isFinal   = phase === "final";
    const legs      = isFinal ? finalLegs : playoffLegs;
    const matchCount = slots / Math.pow(2, phaseIdx + 1);

    for (let leg = 1; leg <= legs; leg++) {
      for (let slot = 0; slot < matchCount; slot++) {
        matches.push({
          id:             ID(),
          torneoId,
          categoriaId,
          fase:           phase,
          grupo:          null,
          ronda:          phaseIdx + 1,
          legNumber:      leg,
          equipoLocalId:  null,
          equipoVisitaId: null,
          golesLocal:     null,
          golesVisita:    null,
          estado:         "pendiente",
          fechaHora:      null,
          sedeId:         null,
          arbitroId:      null,
          orden:          globalOrder++,
          source:         "knockout",
          createdAt:      NOW(),
        });
      }
    }
  }

  return matches;
}

// ── 7. advanceKnockoutWinner() ───────────────────────────────────────────────

/**
 * Avanza el ganador de un partido de fase final al siguiente match de la llave.
 * Modifica los partidos de forma inmutable (devuelve nuevo array).
 *
 * @param {Array}  knockoutMatches - Todos los partidos de fase final
 * @param {String} matchId         - ID del partido cuyo resultado se registró
 * @param {String} winnerTeamId    - ID del equipo ganador
 * @returns {Array} Nuevo array de partidos con el ganador colocado en el siguiente slot
 */
export function advanceKnockoutWinner(knockoutMatches, matchId, winnerTeamId) {
  const match = knockoutMatches.find(m => m.id === matchId);
  if (!match) return knockoutMatches;

  const phases  = ["octavos","cuartos","semis","final"];
  const curIdx  = phases.indexOf(match.fase);
  if (curIdx === -1 || curIdx === phases.length - 1) return knockoutMatches;

  const nextPhase = phases[curIdx + 1];

  // Calcular qué slot ocupa este partido en su fase
  const phaseMaches    = knockoutMatches.filter(m => m.fase === match.fase && m.legNumber === 1);
  const matchSlot      = phaseMaches.findIndex(m => m.id === matchId);
  const nextMatchSlot  = Math.floor(matchSlot / 2);
  const isLocalSlot    = matchSlot % 2 === 0;

  // Buscar el partido destino en la siguiente fase
  const nextPhaseMaches = knockoutMatches
    .filter(m => m.fase === nextPhase && m.legNumber === 1)
    .sort((a, b) => a.orden - b.orden);

  const targetMatch = nextPhaseMaches[nextMatchSlot];
  if (!targetMatch) return knockoutMatches;

  return knockoutMatches.map(m => {
    if (m.id !== targetMatch.id) return m;
    return {
      ...m,
      equipoLocalId:  isLocalSlot ? winnerTeamId : m.equipoLocalId,
      equipoVisitaId: isLocalSlot ? m.equipoVisitaId : winnerTeamId,
    };
  });
}

// ── 8. Validaciones (guards) ──────────────────────────────────────────────────

/**
 * Verifica si se puede generar el fixture de grupos.
 * @returns {{ ok: boolean, reason?: string }}
 */
export function canGenerateFixture(teams, config = {}) {
  const { groupsCount = 2 } = config;

  if (!teams || teams.length < 2) {
    return { ok: false, reason: "Se necesitan al menos 2 equipos para generar el fixture." };
  }
  if (teams.length < groupsCount) {
    return { ok: false, reason: `No hay suficientes equipos para ${groupsCount} grupos. Se necesitan al menos ${groupsCount}.` };
  }
  const teamsPerGroup = Math.floor(teams.length / groupsCount);
  if (teamsPerGroup < 2) {
    return { ok: false, reason: "Cada grupo debe tener al menos 2 equipos. Reduce el número de grupos o agrega más equipos." };
  }
  return { ok: true };
}

/**
 * Verifica si se puede cerrar la fase de grupos (todos los partidos finalizados).
 * @returns {{ ok: boolean, pending: number, reason?: string }}
 */
export function canCloseGroupStage(groupMatches) {
  const pending = (groupMatches ?? []).filter(m =>
    m.fase === "grupos" && m.estado !== "finalizado"
  ).length;

  if (pending > 0) {
    return {
      ok:     false,
      pending,
      reason: `Hay ${pending} partido${pending > 1 ? "s" : ""} de grupos pendiente${pending > 1 ? "s" : ""} de finalizar.`,
    };
  }
  return { ok: true, pending: 0 };
}

/**
 * Verifica si se puede generar la fase final.
 * @returns {{ ok: boolean, reason?: string }}
 */
export function canGenerateKnockout(groupMatches, qualifiedTeams) {
  const closeCheck = canCloseGroupStage(groupMatches);
  if (!closeCheck.ok) return closeCheck;

  if (!qualifiedTeams || qualifiedTeams.length < 2) {
    return { ok: false, reason: "No hay suficientes equipos clasificados para generar la fase final." };
  }

  // Los clasificados deben ser potencia de 2 o generar bracket con ronda preliminar
  if (qualifiedTeams.length < 2) {
    return { ok: false, reason: "Se necesitan al menos 2 clasificados." };
  }

  return { ok: true };
}

// ── Helpers internos ──────────────────────────────────────────────────────────

function nextPow2(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function phasesFromSlots(slots) {
  const map = {
    2:  ["final"],
    4:  ["semis",    "final"],
    8:  ["cuartos",  "semis",   "final"],
    16: ["octavos",  "cuartos", "semis", "final"],
    32: ["treintaidosavos", "octavos", "cuartos", "semis", "final"],
  };
  return map[slots] ?? ["cuartos","semis","final"];
}

/**
 * Reordena clasificados para cruces clásicos de copa:
 * 1A vs 2B, 1B vs 2A, 1C vs 2D, 1D vs 2C, etc.
 * Si todos tienen la misma posición (edge case de datos incompletos), devuelve en orden lineal.
 */
function reorderForClassicCrossing(qualifiedTeams) {
  const byPosition = {};
  qualifiedTeams.forEach(t => {
    const pos = t.position ?? 1;
    if (!byPosition[pos]) byPosition[pos] = [];
    byPosition[pos].push(t);
  });

  const pos1 = byPosition[1] ?? [];
  const pos2 = byPosition[2] ?? [];
  const rest  = qualifiedTeams.filter(t => (t.position ?? 1) > 2);

  // Si no hay segundos clasificados diferenciados, usar orden lineal directamente
  if (pos2.length === 0 && pos1.length >= qualifiedTeams.length) {
    return [...qualifiedTeams];
  }

  // Cruzar: 1A con 2B, 1B con 2A, etc. (alternando)
  const pairs = [];
  const maxPairs = Math.min(pos1.length, pos2.length);
  for (let i = 0; i < maxPairs; i++) {
    pairs.push(pos1[i]);
    pairs.push(pos2[maxPairs - 1 - i]);
  }

  // Agregar los que sobran de pos1 si hay más primeros que segundos
  const extraPos1 = pos1.slice(maxPairs);

  return [...pairs, ...extraPos1, ...rest];
}
