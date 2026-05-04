/**
 * fixturesEngine.js — Generación y cálculo de fixtures y posiciones.
 * Funciones puras. Sin imports del store ni servicios.
 */

const ID  = () => crypto.randomUUID();
const NOW = () => new Date().toISOString();

const GRUPOS_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

// ── Punto de entrada ──────────────────────────────────────────────────────────

/**
 * @param {Object} torneo
 * @param {Array}  equipos
 * @returns {Array} Partido[]
 */
export function generarFixture(torneo, equipos) {
  if (!equipos.length) return [];

  switch (torneo.formato) {
    case "todos_contra_todos":
      return generarLiga(equipos, torneo.id, null);
    case "eliminacion":
      return generarEliminacion(equipos, torneo.id);
    case "grupos_playoffs": {
      const grupos = distribuirEnGrupos(equipos, torneo.numGrupos || 2);
      const partidosGrupos = grupos.flatMap((grp, i) =>
        generarLiga(grp, torneo.id, GRUPOS_LABELS[i] ?? String(i + 1))
      );
      const partidosPlayoffs = generarBracketsVacios(torneo, grupos);
      return [...partidosGrupos, ...partidosPlayoffs];
    }
    default:
      return generarLiga(equipos, torneo.id, null);
  }
}

// ── Liga (round-robin) ────────────────────────────────────────────────────────

function generarLiga(equipos, torneoId, grupo) {
  let lista = [...equipos];
  if (lista.length % 2 !== 0) lista.push({ id: "BYE", nombre: "BYE" });

  const n = lista.length;
  const rondas = n - 1;
  const partidos = [];
  let orden = 0;

  for (let r = 0; r < rondas; r++) {
    for (let i = 0; i < n / 2; i++) {
      const local   = lista[i];
      const visita  = lista[n - 1 - i];
      if (local.id === "BYE" || visita.id === "BYE") continue;
      partidos.push({
        id: ID(), torneoId,
        fase: grupo ? "grupos" : "liga",
        ronda: r + 1,
        grupo,
        equipoLocalId:  local.id,
        equipoVisitaId: visita.id,
        golesLocal: null, golesVisita: null,
        estado: "programado",
        fechaHora: null, lugar: null,
        orden: orden++,
        createdAt: NOW(),
      });
    }
    // Rotar: fijar índice 0, rotar el resto
    lista = [lista[0], lista[n - 1], ...lista.slice(1, n - 1)];
  }
  return partidos;
}

// ── Eliminación directa ───────────────────────────────────────────────────────

function generarEliminacion(equipos, torneoId) {
  const n = equipos.length;
  const slots = nextPow2(n);
  const fases = fasesDesdeSlots(slots);
  const partidos = [];
  let orden = 0;

  // Primera ronda: sembrar equipos, resto TBD
  const primeraFase = fases[0];
  for (let i = 0; i < slots / 2; i++) {
    const local  = equipos[i * 2]     ?? null;
    const visita = equipos[i * 2 + 1] ?? null;
    partidos.push({
      id: ID(), torneoId,
      fase: primeraFase, ronda: 1, grupo: null,
      equipoLocalId:  local?.id  ?? null,
      equipoVisitaId: visita?.id ?? null,
      golesLocal: null, golesVisita: null,
      estado: local && visita ? "programado" : "bye",
      fechaHora: null, lugar: null,
      orden: orden++,
      createdAt: NOW(),
    });
  }

  // Rondas posteriores: brackets vacíos (TBD)
  for (let f = 1; f < fases.length; f++) {
    const matchCount = slots / Math.pow(2, f + 1);
    for (let i = 0; i < matchCount; i++) {
      partidos.push({
        id: ID(), torneoId,
        fase: fases[f], ronda: f + 1, grupo: null,
        equipoLocalId: null, equipoVisitaId: null,
        golesLocal: null, golesVisita: null,
        estado: "pendiente",
        fechaHora: null, lugar: null,
        orden: orden++,
        createdAt: NOW(),
      });
    }
  }

  return partidos;
}

// ── Brackets vacíos para playoffs ────────────────────────────────────────────

function generarBracketsVacios(torneo, grupos) {
  const clasificados = grupos.length * 2; // top 2 de cada grupo
  const slots = nextPow2(clasificados);
  const fases = fasesDesdeSlots(slots);
  const partidos = [];
  let orden = 1000; // offset para no colisionar con orden de grupos

  for (let f = 0; f < fases.length; f++) {
    const matchCount = slots / Math.pow(2, f + 1);
    for (let i = 0; i < matchCount; i++) {
      partidos.push({
        id: ID(), torneoId: torneo.id,
        fase: fases[f], ronda: f + 1, grupo: null,
        equipoLocalId: null, equipoVisitaId: null,
        golesLocal: null, golesVisita: null,
        estado: "pendiente",
        fechaHora: null, lugar: null,
        orden: orden++,
        createdAt: NOW(),
      });
    }
  }
  return partidos;
}

// ── Distribución en grupos ───────────────────────────────────────────────────

export function distribuirEnGrupos(equipos, numGrupos) {
  const grupos = Array.from({ length: numGrupos }, () => []);
  equipos.forEach((eq, i) => {
    const gi = i % numGrupos;
    // Serpentina: pares van 0→n, impares van n→0
    const idx = Math.floor(i / numGrupos) % 2 === 0 ? gi : numGrupos - 1 - gi;
    grupos[idx].push(eq);
  });
  return grupos;
}

// ── Posiciones ───────────────────────────────────────────────────────────────

/**
 * Calcula la tabla de posiciones desde los partidos finalizados.
 * @param {Array} partidos
 * @param {Array} equipos
 * @returns {Array} Posicion[] — ordenados por PTS desc, DG desc, GF desc
 */
export function calcularPosiciones(partidos, equipos) {
  const map = {};
  equipos.forEach(eq => {
    map[eq.id] = {
      equipoId: eq.id,
      nombre: eq.nombre,
      grupo: eq.grupo,
      pj: 0, pg: 0, pe: 0, pp: 0,
      gf: 0, gc: 0, dg: 0, pts: 0,
    };
  });

  partidos
    .filter(p => p.estado === "finalizado" && p.golesLocal != null && p.golesVisita != null)
    .forEach(p => {
      const local   = map[p.equipoLocalId];
      const visita  = map[p.equipoVisitaId];
      if (!local || !visita) return;

      local.pj++;  visita.pj++;
      local.gf  += p.golesLocal;  local.gc  += p.golesVisita;
      visita.gf += p.golesVisita; visita.gc += p.golesLocal;

      if (p.golesLocal > p.golesVisita)       { local.pg++;  local.pts  += 3; visita.pp++; }
      else if (p.golesLocal < p.golesVisita)  { visita.pg++; visita.pts += 3; local.pp++;  }
      else                                    { local.pe++;  local.pts++;    visita.pe++; visita.pts++; }
    });

  return Object.values(map)
    .map(p => ({ ...p, dg: p.gf - p.gc }))
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
}

// ── Utils internos ────────────────────────────────────────────────────────────

function nextPow2(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function fasesDesdeSlots(slots) {
  const map = { 2: ["final"], 4: ["semis", "final"], 8: ["cuartos", "semis", "final"], 16: ["octavos", "cuartos", "semis", "final"] };
  return map[slots] ?? ["cuartos", "semis", "final"];
}
