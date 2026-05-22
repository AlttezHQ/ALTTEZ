import { autoSchedule } from "./schedulingEngine";

export const SCHEDULE_OPTIMIZER_KIND = Object.freeze({
  LOCAL_HEURISTIC: "local_heuristic",
  REMOTE_CSP: "remote_csp",
});

export function buildScheduleOptimizationInput({
  partidos = [],
  equipos = [],
  sedes = [],
  arbitros = [],
  torneo = null,
  constraintRules = [],
} = {}) {
  return {
    tournament: torneo
      ? {
          id: torneo.id,
          fechaInicio: torneo.fechaInicio,
          fechaFin: torneo.fechaFin,
          schedulingConfig: torneo.schedulingConfig ?? {},
        }
      : null,
    teams: equipos.map(team => ({
      id: team.id,
      nombre: team.nombre,
      grupo: team.grupo ?? null,
      venueId: team.sedeId ?? team.venueId ?? null,
    })),
    matches: partidos.map(match => ({
      id: match.id,
      round: match.ronda ?? null,
      order: match.orden ?? 0,
      homeTeamId: match.equipoLocalId,
      awayTeamId: match.equipoVisitaId,
      phase: match.fase,
      status: match.status ?? match.estado,
    })),
    venues: sedes.map(sede => ({
      id: sede.id,
      nombre: sede.nombre,
      direccion: sede.direccion ?? null,
    })),
    referees: arbitros.map(arbitro => ({
      id: arbitro.id,
      nombre: arbitro.nombre,
    })),
    constraintRules,
  };
}

export function localHeuristicScheduleOptimizer(input) {
  const patches = autoSchedule({
    partidos: input.partidos ?? input.matchesRaw ?? [],
    equipos: input.equipos ?? input.teamsRaw ?? [],
    sedes: input.sedes ?? input.venuesRaw ?? [],
    arbitros: input.arbitros ?? input.refereesRaw ?? [],
    torneo: input.torneo ?? input.tournamentRaw ?? {},
  });

  return {
    kind: SCHEDULE_OPTIMIZER_KIND.LOCAL_HEURISTIC,
    feasible: true,
    patches,
    diagnostics: {
      scheduledCount: patches.length,
      unscheduledCount: Math.max(0, (input.partidos ?? input.matchesRaw ?? []).length - patches.length),
    },
  };
}

export async function optimizeSchedule(input, adapter = localHeuristicScheduleOptimizer) {
  const normalizedInput = {
    ...buildScheduleOptimizationInput(input),
    partidos: input.partidos ?? [],
    equipos: input.equipos ?? [],
    sedes: input.sedes ?? [],
    arbitros: input.arbitros ?? [],
    torneo: input.torneo ?? null,
    constraintRules: input.constraintRules ?? [],
  };

  const result = await adapter(normalizedInput);
  return {
    kind: result.kind ?? SCHEDULE_OPTIMIZER_KIND.LOCAL_HEURISTIC,
    feasible: result.feasible !== false,
    patches: result.patches ?? [],
    diagnostics: result.diagnostics ?? {},
  };
}
