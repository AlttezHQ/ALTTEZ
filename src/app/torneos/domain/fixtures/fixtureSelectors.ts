// @ts-nocheck

import { calcularPosiciones } from "../../utils/fixturesEngine";
import {
  mapFixtureMatchRow,
  mapScheduleReportMatch,
  mapSchedulingMatch,
  mapStandingRow,
  mapUpcomingMatch,
} from "./fixtureMappers";

function buildCategories(input: any) {
  const configured = input.allCategorias
    .filter((category) => category.torneoId === input.torneoActivoId)
    .map((category) => category.nombre)
    .filter(Boolean);

  if (configured.length > 0) {
    return configured.sort();
  }

  return [
    ...new Set(
      input.allEquipos
        .filter((team) => team.torneoId === input.torneoActivoId)
        .map((team) => team.grupo || "General"),
    ),
  ].sort();
}

function groupMatches(matches: any[]) {
  return matches.reduce((accumulator: Record<string, any[]>, match: any) => {
    const key = match.fechaHora
      ? new Date(match.fechaHora).toLocaleDateString("es-AR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
        })
      : `Fecha ${match.ronda || 1}`;

    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    accumulator[key].push(match);
    return accumulator;
  }, {});
}

function sortGroupKeys(groups: Record<string, any[]>) {
  return Object.keys(groups).sort((left, right) => {
    if (left.startsWith("Fecha ") && right.startsWith("Fecha ")) {
      return (
        parseInt(left.replace("Fecha ", ""), 10) -
        parseInt(right.replace("Fecha ", ""), 10)
      );
    }

    const leftMatch = groups[left][0];
    const rightMatch = groups[right][0];

    if (leftMatch?.fechaHora && rightMatch?.fechaHora) {
      return new Date(leftMatch.fechaHora) - new Date(rightMatch.fechaHora);
    }

    return (leftMatch?.ronda || 0) - (rightMatch?.ronda || 0);
  });
}

export function selectFixturesPageViewModel(input: any) {
  const categories = input.torneoActivoId ? buildCategories(input) : [];
  const activeCategory = input.selectedCategory || categories[0] || null;

  const activeCategoryConfig =
    input.torneoActivoId && activeCategory
      ? input.allCategorias.find(
          (category) =>
            category.torneoId === input.torneoActivoId &&
            category.nombre === activeCategory,
        ) ?? null
      : null;

  const tournament = input.torneoActivoId
    ? input.allTorneos.find((item) => item.id === input.torneoActivoId) ?? null
    : null;

  const categoryMatches = input.allPartidos.filter((match) => {
    if (match.torneoId !== input.torneoActivoId || !activeCategory) return false;
    if (activeCategoryConfig?.id) return match.categoriaId === activeCategoryConfig.id;
    return (match.grupo || "General") === activeCategory;
  });

  const categoryMatchTeamIds = new Set();
  categoryMatches.forEach((match) => {
    if (match.equipoLocalId) categoryMatchTeamIds.add(match.equipoLocalId);
    if (match.equipoVisitaId) categoryMatchTeamIds.add(match.equipoVisitaId);
  });

  const categoryTeams = input.allEquipos.filter(
    (team) =>
      team.torneoId === input.torneoActivoId &&
      ((team.grupo || "General") === activeCategory ||
        categoryMatchTeamIds.has(team.id)),
  );

  const standings = calcularPosiciones(categoryMatches, categoryTeams).map(mapStandingRow);

  const teamsById = new Map(input.allEquipos.map((team) => [team.id, team]));
  const venues = input.allSedes.filter((venue) => venue.torneoId === input.torneoActivoId);
  const referees = input.allArbitros.filter(
    (referee) => referee.torneoId === input.torneoActivoId,
  );
  const venuesById = new Map(venues.map((venue) => [venue.id, venue]));
  const refereesById = new Map(referees.map((referee) => [referee.id, referee]));
  const categoriesById = new Map(
    input.allCategorias.map((category) => [category.id, category]),
  );

  const mapperContext = {
    teamsById,
    venuesById,
    refereesById,
    categoriesById,
    stateConfig: input.stateConfig,
    colors: {
      primary: input.colors.primary,
      border: input.colors.border,
    },
  };

  const groupedMatches = groupMatches(categoryMatches);
  const groupKeys = sortGroupKeys(groupedMatches);
  const firstGroupKey = groupKeys[0] || null;

  const dateGroups = groupKeys
    .map((key) => {
      let filteredMatches = groupedMatches[key];

      if (input.filters.filterEstado !== "Todos los estados") {
        filteredMatches = filteredMatches.filter(
          (match) => match.estado === input.filters.filterEstado,
        );
      }

      if (input.filters.filterQuery) {
        const query = input.filters.filterQuery.toLowerCase();
        filteredMatches = filteredMatches.filter((match) => {
          const localName = teamsById.get(match.equipoLocalId)?.nombre?.toLowerCase() || "";
          const visitaName = teamsById.get(match.equipoVisitaId)?.nombre?.toLowerCase() || "";
          return localName.includes(query) || visitaName.includes(query);
        });
      }

      return {
        key,
        label: key,
        count: filteredMatches.length,
        isExpanded: input.filters.expandedDates[key] ?? key === firstGroupKey,
        matches: filteredMatches.map((match) =>
          mapFixtureMatchRow(match, mapperContext),
        ),
      };
    })
    .filter(
      (group) =>
        (input.filters.filterJornada === "Todas las jornadas" ||
          group.key === input.filters.filterJornada) &&
        group.matches.length > 0,
    );

  const totalMatches = categoryMatches.length;
  const playedMatches = categoryMatches.filter(
    (match) => match.estado === "finalizado",
  ).length;
  const scheduledMatches = categoryMatches.filter(
    (match) => match.estado === "programado",
  ).length;
  const pendingMatches = totalMatches - playedMatches - scheduledMatches;

  const upcomingMatches = categoryMatches
    .filter((match) => match.estado === "programado")
    .sort((left, right) => new Date(left.fechaHora) - new Date(right.fechaHora))
    .slice(0, 3)
    .map((match) => mapUpcomingMatch(match, mapperContext));

  const matchesWithDate = categoryMatches.filter((match) => match.fechaHora);
  const scheduledDatesMap = matchesWithDate.reduce((accumulator, match) => {
    const key = new Date(match.fechaHora).toISOString().slice(0, 10);
    if (!accumulator[key]) accumulator[key] = [];
    accumulator[key].push(match);
    return accumulator;
  }, {});

  const scheduledDates = Object.keys(scheduledDatesMap)
    .sort()
    .map((dateKey) => {
      const date = new Date(`${dateKey}T12:00:00`);
      return {
        key: dateKey,
        label: date.toLocaleDateString("es-CO", {
          weekday: "long",
          day: "2-digit",
          month: "long",
        }),
        count: scheduledDatesMap[dateKey].length,
        matches: scheduledDatesMap[dateKey].map((match) =>
          mapSchedulingMatch(match, mapperContext),
        ),
      };
    });

  const maxRound = Math.max(0, ...categoryMatches.map((match) => match.ronda || 0));

  return {
    categories,
    activeCategory,
    activeCategoryConfig,
    tournament,
    fixtureTab: {
      isEmpty: categoryMatches.length === 0,
      groups: dateGroups,
      stats: {
        totalMatches,
        playedMatches,
        pendingMatches,
        rescheduledMatches: 0,
      },
      upcomingMatches,
      filters: {
        roundOptions: groupKeys,
        selectedRound: input.filters.filterJornada,
        selectedState: input.filters.filterEstado,
        searchQuery: input.filters.filterQuery,
      },
    },
    schedulingTab: {
      stats: {
        totalMatches: categoryMatches.length,
        scheduledMatches: matchesWithDate.length,
        pendingMatches: categoryMatches.length - matchesWithDate.length,
        usedDates: scheduledDates.length,
      },
      scheduledDates,
      globalStats: {
        categories: categories.length,
        venues: venues.length,
      },
      maxRound,
      roundsOptions: Array.from({ length: maxRound || 1 }, (_, index) => index + 1),
      venues,
      referees,
      scheduleReport: input.scheduleReport
        ? {
            total: input.scheduleReport.total ?? 0,
            scheduled: input.scheduleReport.scheduled ?? 0,
            unscheduled: input.scheduleReport.unscheduled ?? 0,
            unscheduledMatches: (input.scheduleReport.unscheduledMatches ?? []).map(
              (match) => mapScheduleReportMatch(match, mapperContext),
            ),
          }
        : null,
    },
    standingsTab: {
      rows: standings,
    },
    raw: {
      categoryMatches,
      categoryTeams,
      categories,
      activeCategory,
      activeCategoryConfig,
      tournament,
      venues,
      referees,
      maxRound,
      standings,
    },
  };
}
