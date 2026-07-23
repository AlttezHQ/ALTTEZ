/**
 * selectors.js — Selectores PUROS del estado de Torneos.
 *
 * Cada función recibe el `state` del store y deriva datos sin efectos secundarios.
 * El store (useTorneosStore) expone métodos que delegan aquí, manteniendo una
 * única fuente de lógica de derivación. Los componentes pueden importar estos
 * selectores directamente y combinarlos con `useShallow` para cortar renders.
 */

import { calcularPosiciones } from "../utils/fixturesEngine";
import {
  calculateGroupStandings,
  getQualifiedTeams,
  DEFAULT_POINTS_CONFIG,
  DEFAULT_TIEBREAKERS,
} from "../utils/competitionEngine";

export const selectTorneoById = (state, id) =>
  state.torneos.find((t) => t.id === id) ?? null;

export const selectEquiposByTorneo = (state, torneoId) =>
  state.equipos.filter((e) => e.torneoId === torneoId);

export const selectPartidosByTorneo = (state, torneoId) =>
  state.partidos.filter((p) => p.torneoId === torneoId);

export const selectPartidosByFase = (state, torneoId, fase) =>
  state.partidos.filter((p) => p.torneoId === torneoId && p.fase === fase);

export const selectPartidosByGrupo = (state, torneoId, grupo) =>
  state.partidos.filter((p) => p.torneoId === torneoId && p.grupo === grupo);

export const selectSedesByTorneo = (state, torneoId) =>
  state.sedes.filter((s) => s.torneoId === torneoId);

export const selectArbitrosByTorneo = (state, torneoId) =>
  state.arbitros.filter((a) => a.torneoId === torneoId);

export const selectCategoriasByTorneo = (state, torneoId) =>
  state.categorias.filter((c) => c.torneoId === torneoId);

export const selectTorneoActivo = (state) =>
  state.torneoActivoId
    ? state.torneos.find((t) => t.id === state.torneoActivoId) ?? null
    : null;

export const selectPosicionesByTorneo = (state, torneoId) => {
  const partidos = state.partidos.filter((p) => p.torneoId === torneoId);
  const equipos = state.equipos.filter((e) => e.torneoId === torneoId);
  return calcularPosiciones(partidos, equipos);
};

/** Configuración de competencia de una categoría (merge con defaults). */
export const selectCompetitionConfig = (state, categoriaId) => {
  const cat = state.categorias.find((c) => c.id === categoriaId);
  if (!cat) return null;
  return {
    groupsCount: cat.groupsCount ?? 2,
    groupLegs: cat.groupLegs ?? 1,
    qualifyPerGroup: cat.qualifyPerGroup ?? 2,
    assignmentMethod: cat.assignmentMethod ?? "auto_serpentina",
    allowBestThirds: cat.allowBestThirds ?? false,
    bestThirdsCount: cat.bestThirdsCount ?? 0,
    pointsConfig: cat.pointsConfig ?? { ...DEFAULT_POINTS_CONFIG },
    tiebreakers: cat.tiebreakers ?? [...DEFAULT_TIEBREAKERS],
    initialKnockoutRound: cat.initialKnockoutRound ?? "auto",
    crossingMethod: cat.crossingMethod ?? "auto_position",
    knockoutTiebreakRule: cat.knockoutTiebreakRule ?? "penalties",
    playoffLegs: cat.playoffLegs ?? 1,
    finalLegs: cat.finalLegs ?? 1,
  };
};

/** Tabla de posiciones por grupo de una categoría. */
export const selectPosicionesByGrupo = (state, torneoId, categoriaId) => {
  const cat = state.categorias.find((c) => c.id === categoriaId);
  const partidos = state.partidos.filter(
    (p) => p.torneoId === torneoId && (!categoriaId || p.categoriaId === categoriaId)
  );
  const teamIds = new Set();
  partidos.forEach((p) => {
    if (p.equipoLocalId) teamIds.add(p.equipoLocalId);
    if (p.equipoVisitaId) teamIds.add(p.equipoVisitaId);
  });
  const equipos = state.equipos.filter(
    (e) => e.torneoId === torneoId && (!categoriaId || teamIds.has(e.id))
  );
  const pointsConfig = cat?.pointsConfig ?? DEFAULT_POINTS_CONFIG;
  return calculateGroupStandings(partidos, equipos, pointsConfig);
};

/** Equipos clasificados a fase final de una categoría. */
export const selectClasificados = (state, torneoId, categoriaId) => {
  const partidos = state.partidos.filter(
    (p) => p.torneoId === torneoId && (!categoriaId || p.categoriaId === categoriaId)
  );
  const teamIds = new Set();
  partidos.forEach((p) => {
    if (p.equipoLocalId) teamIds.add(p.equipoLocalId);
    if (p.equipoVisitaId) teamIds.add(p.equipoVisitaId);
  });
  const equipos = state.equipos.filter(
    (e) => e.torneoId === torneoId && (!categoriaId || teamIds.has(e.id))
  );
  const config = selectCompetitionConfig(state, categoriaId) ?? {};
  const groupStandings = calculateGroupStandings(
    partidos,
    equipos,
    config.pointsConfig ?? DEFAULT_POINTS_CONFIG
  );
  return getQualifiedTeams(groupStandings, config, partidos);
};
