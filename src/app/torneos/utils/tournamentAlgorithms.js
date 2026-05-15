/**
 * tournamentAlgorithms.js
 * Funciones matemáticas y algorítmicas para calcular estructuras de torneos.
 */

export function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

export function previousPowerOfTwo(n) {
  if (n <= 1) return 0;
  return Math.pow(2, Math.floor(Math.log2(n)));
}

export function nextPowerOfTwo(n) {
  if (n <= 1) return 1;
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

export function getRoundName(size) {
  switch(size) {
    case 2: return "Final";
    case 4: return "Semifinal";
    case 8: return "Cuartos de final";
    case 16: return "Octavos de final";
    case 32: return "Dieciseisavos de final";
    case 64: return "Treintaidosavos de final";
    default: return "Ronda eliminatoria";
  }
}

/**
 * Calcula la estructura del bracket de eliminación.
 * @param {number} totalQualified Cantidad total de clasificados a la fase final.
 */
export function buildPlayoff(totalQualified) {
  if (totalQualified < 2) {
    return {
      needsPreliminary: false,
      mainBracketSize: 0,
      preliminaryMatches: 0,
      teamsInPreliminary: 0,
      directSeeds: 0,
      initialRound: "N/A"
    };
  }

  const base = previousPowerOfTwo(totalQualified);

  if (isPowerOfTwo(totalQualified)) {
    return {
      needsPreliminary: false,
      mainBracketSize: totalQualified,
      preliminaryMatches: 0,
      teamsInPreliminary: 0,
      directSeeds: totalQualified,
      initialRound: getRoundName(totalQualified)
    };
  }

  // Si no es potencia de 2, calculamos la ronda preliminar
  const preliminaryMatches = totalQualified - base;
  const teamsInPreliminary = preliminaryMatches * 2;
  const directSeeds = totalQualified - teamsInPreliminary;

  return {
    needsPreliminary: true,
    mainBracketSize: base,
    preliminaryMatches,
    teamsInPreliminary,
    directSeeds,
    initialRound: getRoundName(base)
  };
}

/**
 * Distribuye los equipos en grupos lo más equitativos posible.
 * @param {number} teamsCount Total de equipos.
 * @param {number} groupsCount Cantidad de grupos.
 * @returns {number[]} Arreglo con la cantidad de equipos por grupo.
 */
export function distributeInGroups(teamsCount, groupsCount) {
  if (groupsCount < 1 || teamsCount < groupsCount) return [];
  
  const baseSize = Math.floor(teamsCount / groupsCount);
  const remainder = teamsCount % groupsCount;
  const groups = [];

  for (let i = 0; i < groupsCount; i++) {
    groups.push(baseSize + (i < remainder ? 1 : 0));
  }
  return groups;
}

/**
 * Calcula el total de partidos y rondas estimadas.
 */
export function calculateTournamentMath(config, teamsCount) {
  const { 
    format = "grupos_playoffs",
    groupsCount = 1,
    groupLegs = 1,
    qualifyPerGroup = 2,
    bestThirdsCount = 0,
    playoffLegs = 1,
    finalLegs = 1
  } = config;

  let groupStageMatches = 0;
  let playoffMatches = 0;
  let totalQualified = 0;
  let playoffStructure = null;
  let estimatedGroupRounds = 0;
  let estimatedPlayoffRounds = 0;

  if (format === "todos_contra_todos") {
    // Liga pura
    groupStageMatches = (teamsCount * (teamsCount - 1)) / 2 * groupLegs;
    estimatedGroupRounds = (teamsCount % 2 === 0 ? teamsCount - 1 : teamsCount) * groupLegs;
    totalQualified = 0;
  } else if (format === "grupos_playoffs") {
    // Fase de grupos
    const groups = distributeInGroups(teamsCount, groupsCount);
    for (const size of groups) {
      groupStageMatches += ((size * (size - 1)) / 2) * groupLegs;
      const rounds = (size % 2 === 0 ? size - 1 : size) * groupLegs;
      if (rounds > estimatedGroupRounds) estimatedGroupRounds = rounds;
    }
    
    // Clasificados
    const qualifiedFromGroups = groupsCount * qualifyPerGroup;
    totalQualified = qualifiedFromGroups + bestThirdsCount;
    
    // Eliminatoria
    if (totalQualified >= 2) {
      playoffStructure = buildPlayoff(totalQualified);
      // matches: N clasificados en eliminatoria simple genera N-1 ganadores finales
      // (Cada partido elimina a un equipo)
      const matchesBeforeFinal = totalQualified - 2; // (totalQualified - 1) es el total, restamos la final (1 partido)
      
      const prelimRounds = playoffStructure.needsPreliminary ? 1 : 0;
      const mainRounds = Math.log2(playoffStructure.mainBracketSize) - 1; // Rondas hasta la semi
      estimatedPlayoffRounds = (prelimRounds + mainRounds) * playoffLegs + finalLegs;

      playoffMatches = (matchesBeforeFinal * playoffLegs) + finalLegs;
      
      // Ajuste si hay ronda preliminar (una llave preliminar elimina a 1 equipo también, 
      // la matemática general de (N-1) asume llaves a 1 partido).
      // Si N=8, partidos=7. matchesBeforeFinal=6. 6*playoffLegs + finalLegs.
      // Si N=20 (needs prelim), 19 partidos totales (a 1 juego).
      // Si es a 2 juegos: matchesBeforeFinal = 18. 18*2 + 1 = 37 partidos. Correcto.
      playoffMatches = ((totalQualified - 2) * playoffLegs) + finalLegs; 
    }
  } else if (format === "eliminacion") {
    totalQualified = teamsCount;
    if (totalQualified >= 2) {
      playoffStructure = buildPlayoff(totalQualified);
      const prelimRounds = playoffStructure.needsPreliminary ? 1 : 0;
      const mainRounds = Math.log2(playoffStructure.mainBracketSize) - 1;
      estimatedPlayoffRounds = (prelimRounds + mainRounds) * playoffLegs + finalLegs;

      playoffMatches = ((totalQualified - 2) * playoffLegs) + finalLegs; 
    }
  }

  return {
    groupStageMatches,
    playoffMatches,
    totalMatches: groupStageMatches + playoffMatches,
    totalQualified,
    playoffStructure,
    estimatedGroupRounds,
    estimatedPlayoffRounds,
    totalEstimatedRounds: estimatedGroupRounds + estimatedPlayoffRounds
  };
}

/**
 * Sugiere configuraciones según la cantidad de equipos.
 */
export function recommendStructure(teamsCount) {
  if (teamsCount < 2) {
    return { format: "grupos_playoffs", groupsCount: 1 };
  }
  if (teamsCount <= 6) {
    return { format: "todos_contra_todos", groupsCount: 1 };
  }
  if (teamsCount <= 12) {
    return { format: "grupos_playoffs", groupsCount: 2 };
  }
  if (teamsCount <= 20) {
    return { format: "grupos_playoffs", groupsCount: Math.ceil(teamsCount / 5) };
  }
  if (teamsCount <= 32) {
    return { format: "grupos_playoffs", groupsCount: Math.ceil(teamsCount / 4) };
  }
  return { format: "grupos_playoffs", groupsCount: Math.ceil(teamsCount / 5) };
}

/**
 * Calcula la capacidad de partidos por semana según los horarios configurados.
 */
export function calculateSchedulingStats(horarios, totalMatches, numCanchas = 1, matchDuration = 60, matchBuffer = 10) {
  if (!horarios || !Array.isArray(horarios)) return { weeklyCapacity: 0, estimatedWeeks: 0 };
  
  const activeDays = horarios.filter(h => h.activo);
  if (activeDays.length === 0) return { weeklyCapacity: 0, estimatedWeeks: Infinity };

  const totalSlot = (matchDuration || 60) + (matchBuffer || 0);
  let weeklyCapacity = 0;

  activeDays.forEach(h => {
    const [h1, m1] = h.inicio.split(":").map(Number);
    const [h2, m2] = h.fin.split(":").map(Number);
    const totalMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    const matchesInDay = Math.floor(totalMinutes / totalSlot);
    weeklyCapacity += Math.max(0, matchesInDay * numCanchas);
  });

  const estimatedWeeks = weeklyCapacity > 0 ? Math.ceil(totalMatches / weeklyCapacity) : Infinity;

  const maxSimultaneousMatches = numCanchas; // Total fields = max simultaneous games
  const totalAssignmentsNeeded = totalMatches; // Every game needs 1 referee

  return {
    weeklyCapacity,
    activeDaysCount: activeDays.length,
    estimatedWeeks,
    isFeasible: weeklyCapacity > 0,
    refereeStats: {
      maxSimultaneousNeeded: maxSimultaneousMatches,
      totalAssignments: totalAssignmentsNeeded
    }
  };
}

/**
 * Genera sugerencias inteligentes si el torneo no es viable en las fechas propuestas.
 */
export function getFeasibilitySuggestions(data, stats) {
  const { fechaInicio, fechaFin, numCanchas, horarios } = data;
  if (!fechaInicio || !fechaFin) return [];

  const start = new Date(fechaInicio);
  const end = new Date(fechaFin);
  const availableWeeks = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 7)));
  
  const suggestions = [];

  if (stats.estimatedWeeks > availableWeeks) {
    
    suggestions.push({
      type: "fecha",
      text: `Sincronizar fecha final al ${estimateProjectedEndDate(fechaInicio, stats.estimatedWeeks)}`,
      impact: "Ajusta tu expectativa a la capacidad real.",
      action: "ajustar_fecha"
    });

    const neededCapacity = Math.ceil(stats.estimatedWeeks * stats.weeklyCapacity / availableWeeks);
    const matchesPerCancha = stats.weeklyCapacity / numCanchas || 1;
    const neededCanchas = Math.ceil(neededCapacity / matchesPerCancha);
    
    if (neededCanchas > numCanchas) {
      suggestions.push({
        type: "canchas",
        text: `Sumar ${neededCanchas - numCanchas} cancha(s) adicionales.`,
        impact: `Subirías de ${stats.weeklyCapacity} a ${neededCapacity} partidos/semana.`,
        action: "agregar_canchas"
      });
    }

    const inactiveDays = (horarios || []).filter(h => !h.activo);
    if (inactiveDays.length > 0) {
      const bestDay = inactiveDays[0].dia;
      suggestions.push({
        type: "dias",
        text: `Habilitar el ${bestDay} como día de juego.`,
        impact: `Aumentaría un ${(100/stats.activeDaysCount).toFixed(0)}% tu capacidad.`,
        action: "activar_dias"
      });
    }

    if (stats.estimatedWeeks > availableWeeks * 1.5) {
      suggestions.push({
        type: "formato",
        text: "Carga de partidos crítica. Reducir vueltas o fases.",
        impact: "Menos partidos totales.",
        action: "cambiar_formato"
      });
    }
  } else if (stats.estimatedWeeks < availableWeeks - 1) {
    // Escenario de optimización: termina antes de lo previsto
    suggestions.push({
      type: "fecha",
      text: `Adelantar fecha final al ${estimateProjectedEndDate(fechaInicio, stats.estimatedWeeks)}`,
      impact: `Terminarías el torneo ${availableWeeks - stats.estimatedWeeks} semanas antes.`,
      action: "ajustar_fecha"
    });
  }

  // Análisis de Árbitros
  const arbCount = (data.arbitros || []).length;
  const simultaneousNeeded = stats.refereeStats?.maxSimultaneousNeeded || 0;
  
  if (arbCount > 0 && arbCount < simultaneousNeeded) {
    suggestions.push({
      type: "arbitros",
      text: `Registrar ${simultaneousNeeded - arbCount} árbitro(s) adicionales.`,
      impact: `Necesitas ${simultaneousNeeded} árbitros para cubrir ${numCanchas} canchas simultáneas.`,
      action: "ir_a_paso_4"
    });
  }

  return suggestions;
}

/**
 * Estima la fecha de finalización real basada en la carga de partidos.
 */
export function estimateProjectedEndDate(startDate, estimatedWeeks) {
  if (!startDate || estimatedWeeks === Infinity) return null;
  const date = new Date(startDate);
  date.setDate(date.getDate() + (estimatedWeeks * 7));
  return date.toISOString().split("T")[0];
}
