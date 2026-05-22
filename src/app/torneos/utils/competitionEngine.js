/**
 * competitionEngine.js
 * Motor de dominio puro para torneos de formato "Grupos + Fase Final".
 * Todas las funciones son puras (sin efectos secundarios, sin imports del store).
 * Re-exporta helpers de fixturesEngine y tournamentAlgorithms para no duplicar lógica.
 */

// ── Re-exports de utilidades existentes ──────────────────────────────────────
import { LEGACY_MATCH_STATUS, MATCH_STATUS, isMatchCompleted } from "../domain/fixtureState.js";

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
  { id: "seeded",         label: "Sembrado por mérito deportivo" },
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
  crossingMethod:       "seeded",
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
            estado:         LEGACY_MATCH_STATUS.PENDING,
            status:         MATCH_STATUS.DRAFT,
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
    isMatchCompleted(p) &&
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
export function applyTiebreakers(teams, tiebreakers = DEFAULT_TIEBREAKERS, allMatches = [], options = {}) {
  const resolvedOptions = Array.isArray(options) ? { matchEvents: options } : options;
  return resolveTiebreakerGroup([...teams], tiebreakers, 0, allMatches, resolvedOptions);
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
    const sorted = applyTiebreakers(rows, tiebreakers, allMatches, config);

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
    crossingMethod    = "seeded",
    playoffLegs       = 1,
    finalLegs         = 1,
  } = config;

  const n = qualifiedTeams.length;
  if (n < 2) return [];

  // Determinar rondas necesarias (potencia de 2 más cercana)
  const slots = nextPow2(n);

  const rankedTeams = rankQualifiedTeamsForSeeding(qualifiedTeams, crossingMethod);
  const seedOrder = buildSeedOrder(slots);
  const teamsBySeed = new Map(rankedTeams.map((team, idx) => [idx + 1, { ...team, seed: idx + 1 }]));
  const seeded = seedOrder.map(seed => teamsBySeed.get(seed) ?? null);

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
        estado:         localTeam && visitaTeam ? LEGACY_MATCH_STATUS.PENDING : LEGACY_MATCH_STATUS.BYE,
        status:         localTeam && visitaTeam ? MATCH_STATUS.DRAFT : MATCH_STATUS.COMPLETED,
        fechaHora:      null,
        sedeId:         null,
        arbitroId:      null,
        orden:          globalOrder++,
        source:         "knockout",
        metadata:       {
          seeding: {
            localSeed:  localTeam?.seed ?? null,
            visitaSeed: visitaTeam?.seed ?? null,
            method:     crossingMethod,
          },
        },
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
          estado:         LEGACY_MATCH_STATUS.PENDING,
          status:         MATCH_STATUS.DRAFT,
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

  const phases  = ["treintaidosavos","octavos","cuartos","semis","final"];
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

export function createTiebreakerAppliedEvent({ torneoId, tournamentId, group, criterion, teamIds, resolvedOrder, metadata = {} }) {
  return {
    tournamentId: tournamentId ?? torneoId ?? null,
    eventType: "competition.tiebreaker_applied",
    payload: {
      criterion,
      group,
      teamIds: teamIds ?? [],
      resolvedOrder: resolvedOrder ?? [],
      ...metadata,
    },
    createdAt: NOW(),
  };
}

export function createBracketSeededEvent({ torneoId, tournamentId, stageId = null, seededTeams = [], matches = [], method = "seeded" }) {
  return {
    tournamentId: tournamentId ?? torneoId ?? null,
    eventType: "competition.bracket_seeded",
    payload: {
      stageId,
      method,
      seededTeams: seededTeams.map((team, idx) => ({
        seed: team.seed ?? idx + 1,
        equipoId: team.equipoId,
        nombre: team.nombre,
        group: team.group,
        position: team.position,
      })),
      matches: matches.map(match => ({
        id: match.id,
        fase: match.fase,
        ronda: match.ronda,
        equipoLocalId: match.equipoLocalId,
        equipoVisitaId: match.equipoVisitaId,
        seeding: match.metadata?.seeding ?? null,
      })),
    },
    createdAt: NOW(),
  };
}

export function createRoundAdvancedEvent({ torneoId, tournamentId, matchId, winnerTeamId, fromPhase, toPhase, targetMatchId = null }) {
  return {
    tournamentId: tournamentId ?? torneoId ?? null,
    eventType: "competition.round_advanced",
    payload: {
      matchId,
      winnerTeamId,
      fromPhase,
      toPhase,
      targetMatchId,
    },
    createdAt: NOW(),
  };
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
    m.fase === "grupos" && !isMatchCompleted(m)
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

function rankQualifiedTeamsForSeeding(qualifiedTeams, crossingMethod) {
  if (crossingMethod === "manual") return [...qualifiedTeams];

  if (crossingMethod === "auto_position") {
    return reorderForClassicCrossing(qualifiedTeams).map((team, idx) => ({ ...team, seed: idx + 1 }));
  }

  return [...qualifiedTeams]
    .sort((a, b) =>
      (a.seed ?? Infinity) - (b.seed ?? Infinity) ||
      (a.position ?? Infinity) - (b.position ?? Infinity) ||
      (b.pts ?? 0) - (a.pts ?? 0) ||
      (b.dg ?? 0) - (a.dg ?? 0) ||
      (b.gf ?? 0) - (a.gf ?? 0) ||
      String(a.group ?? "").localeCompare(String(b.group ?? "")) ||
      String(a.equipoId ?? "").localeCompare(String(b.equipoId ?? ""))
    )
    .map((team, idx) => ({ ...team, seed: idx + 1 }));
}

function buildSeedOrder(slots) {
  if (slots <= 2) return [1, 2];
  const previous = buildSeedOrder(slots / 2);
  return previous.flatMap(seed => [seed, slots + 1 - seed]);
}

function resolveTiebreakerGroup(rows, tiebreakers, criterionIndex, allMatches, options) {
  if (rows.length <= 1 || criterionIndex >= tiebreakers.length) return rows;

  const criterion = tiebreakers[criterionIndex];
  if (criterion === "draw") return rows;

  const buckets = bucketRowsByCriterion(rows, criterion, allMatches, options);
  return buckets.flatMap(bucket =>
    bucket.rows.length <= 1
      ? bucket.rows
      : resolveTiebreakerGroup(bucket.rows, tiebreakers, criterionIndex + 1, allMatches, options)
  );
}

function bucketRowsByCriterion(rows, criterion, allMatches, options) {
  const decorated = rows.map((row, idx) => ({
    row,
    idx,
    key: tiebreakerKey(row, rows, criterion, allMatches, options),
  }));

  decorated.sort((a, b) => compareCriterionKeys(a.key, b.key) || a.idx - b.idx);

  const buckets = [];
  for (const item of decorated) {
    const last = buckets[buckets.length - 1];
    if (last && sameCriterionKey(last.key, item.key)) {
      last.rows.push(item.row);
    } else {
      buckets.push({ key: item.key, rows: [item.row] });
    }
  }
  return buckets;
}

function tiebreakerKey(row, tiedRows, criterion, allMatches, options) {
  switch (criterion) {
    case "points":
      return { value: row.pts ?? 0, direction: "desc" };
    case "goal_diff":
      return { value: row.dg ?? 0, direction: "desc" };
    case "goals_for":
      return { value: row.gf ?? 0, direction: "desc" };
    case "h2h": {
      const miniTable = calculateHeadToHeadMiniTable(tiedRows, allMatches, options.pointsConfig ?? DEFAULT_POINTS_CONFIG);
      const h2h = miniTable[row.equipoId] ?? { pts: 0, dg: 0, gf: 0 };
      return { value: [h2h.pts, h2h.dg, h2h.gf], direction: "desc" };
    }
    case "fair_play":
      return { value: getFairPlayPoints(row, options.matchEvents ?? []), direction: "asc" };
    default:
      return { value: 0, direction: "desc" };
  }
}

function compareCriterionKeys(a, b) {
  const aValues = Array.isArray(a.value) ? a.value : [a.value];
  const bValues = Array.isArray(b.value) ? b.value : [b.value];
  const direction = a.direction === "asc" ? 1 : -1;
  const len = Math.max(aValues.length, bValues.length);

  for (let i = 0; i < len; i++) {
    const av = aValues[i] ?? 0;
    const bv = bValues[i] ?? 0;
    if (av === bv) continue;
    return av > bv ? direction : -direction;
  }
  return 0;
}

function sameCriterionKey(a, b) {
  return compareCriterionKeys(a, b) === 0;
}

function calculateHeadToHeadMiniTable(tiedRows, allMatches, pointsConfig) {
  const ids = new Set(tiedRows.map(row => row.equipoId));
  const table = {};
  tiedRows.forEach(row => {
    table[row.equipoId] = { pts: 0, dg: 0, gf: 0, gc: 0, pj: 0 };
  });

  allMatches
    .filter(match =>
      match.fase === "grupos" &&
      isMatchCompleted(match) &&
      ids.has(match.equipoLocalId) &&
      ids.has(match.equipoVisitaId) &&
      match.golesLocal != null &&
      match.golesVisita != null
    )
    .forEach(match => {
      const local = table[match.equipoLocalId];
      const visita = table[match.equipoVisitaId];
      if (!local || !visita) return;

      local.pj++;
      visita.pj++;
      local.gf += match.golesLocal;
      local.gc += match.golesVisita;
      visita.gf += match.golesVisita;
      visita.gc += match.golesLocal;

      if (match.golesLocal > match.golesVisita) {
        local.pts += pointsConfig.win ?? DEFAULT_POINTS_CONFIG.win;
        visita.pts += pointsConfig.loss ?? DEFAULT_POINTS_CONFIG.loss;
      } else if (match.golesLocal < match.golesVisita) {
        visita.pts += pointsConfig.win ?? DEFAULT_POINTS_CONFIG.win;
        local.pts += pointsConfig.loss ?? DEFAULT_POINTS_CONFIG.loss;
      } else {
        local.pts += pointsConfig.draw ?? DEFAULT_POINTS_CONFIG.draw;
        visita.pts += pointsConfig.draw ?? DEFAULT_POINTS_CONFIG.draw;
      }
    });

  Object.values(table).forEach(row => {
    row.dg = row.gf - row.gc;
  });
  return table;
}

function getFairPlayPoints(row, matchEvents) {
  if (row.fairPlayPoints != null) return row.fairPlayPoints;
  if (row.fairPlay != null) return row.fairPlay;
  if (row.yellowCards != null || row.redCards != null) {
    return (row.yellowCards ?? 0) + (row.secondYellowCards ?? 0) * 3 + (row.redCards ?? 0) * 4;
  }

  return matchEvents
    .filter(event => (event.teamId ?? event.team_id) === row.equipoId)
    .reduce((sum, event) => sum + fairPlayWeight(event), 0);
}

function fairPlayWeight(event) {
  const type = String(event.type ?? event.eventType ?? event.event_type ?? "").toUpperCase();
  if (type === "YELLOW_CARD") return 1;
  if (type === "SECOND_YELLOW" || type === "SECOND_YELLOW_CARD") return 3;
  if (type === "RED_CARD") return 4;

  const card = String(event.payload?.card ?? event.card ?? "").toLowerCase();
  if (card === "yellow") return 1;
  if (card === "second_yellow") return 3;
  if (card === "red") return 4;
  return 0;
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
