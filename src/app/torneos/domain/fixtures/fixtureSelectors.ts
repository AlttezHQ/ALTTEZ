import { calcularPosiciones } from "../../utils/fixturesEngine";
import {
  mapFixtureMatchRow,
  mapScheduleReportMatch,
  mapSchedulingMatch,
  mapStandingRow,
  mapUpcomingMatch,
} from "./fixtureMappers";

type Entity = Record<string, unknown>;
type FixtureFilters = {
  filterJornada: string;
  filterQuery: string;
  filterEstado: string;
  expandedDates: Record<string, boolean>;
};

type ScheduleReport = {
  total?: number;
  scheduled?: number;
  unscheduled?: number;
  unscheduledMatches?: Entity[];
};

type FixturesPageInput = {
  torneoActivoId?: string | null;
  selectedCategory?: string | null;
  allCategorias: Entity[];
  allEquipos: Entity[];
  allPartidos: Entity[];
  allSedes: Entity[];
  allArbitros: Entity[];
  allTorneos: Entity[];
  stateConfig: Record<string, { label: string; color: string; dot: string }>;
  colors: {
    primary: string;
    border: string;
  };
  filters: FixtureFilters;
  scheduleReport?: ScheduleReport | null;
};

function getString(entity: Entity | undefined, key: string, fallback = "") {
  const value = entity?.[key];
  return typeof value === "string" ? value : fallback;
}

function getNumber(entity: Entity | undefined, key: string, fallback = 0) {
  const value = entity?.[key];
  return typeof value === "number" ? value : fallback;
}

function hasTorneo(entity: Entity, torneoId?: string | null) {
  return getString(entity, "torneoId") === torneoId;
}

function buildCategories(input: FixturesPageInput) {
  const configured = input.allCategorias
    .filter((category) => hasTorneo(category, input.torneoActivoId))
    .map((category) => getString(category, "nombre"))
    .filter(Boolean);

  if (configured.length > 0) {
    return configured.sort();
  }

  return [
    ...new Set(
      input.allEquipos
        .filter((team) => hasTorneo(team, input.torneoActivoId))
        .map((team) => getString(team, "grupo", "General")),
    ),
  ].sort();
}

function groupMatches(matches: Entity[]) {
  return matches.reduce<Record<string, Entity[]>>((accumulator, match) => {
    const fechaHora = getString(match, "fechaHora");
    const key = fechaHora
      ? new Date(fechaHora).toLocaleDateString("es-AR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
        })
      : `Fecha ${getNumber(match, "ronda", 1)}`;

    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    accumulator[key].push(match);
    return accumulator;
  }, {});
}

function sortGroupKeys(groups: Record<string, Entity[]>) {
  return Object.keys(groups).sort((left, right) => {
    if (left.startsWith("Fecha ") && right.startsWith("Fecha ")) {
      return (
        parseInt(left.replace("Fecha ", ""), 10) -
        parseInt(right.replace("Fecha ", ""), 10)
      );
    }

    const leftMatch = groups[left][0];
    const rightMatch = groups[right][0];
    const leftFechaHora = getString(leftMatch, "fechaHora");
    const rightFechaHora = getString(rightMatch, "fechaHora");

    if (leftFechaHora && rightFechaHora) {
      return new Date(leftFechaHora).getTime() - new Date(rightFechaHora).getTime();
    }

    return getNumber(leftMatch, "ronda") - getNumber(rightMatch, "ronda");
  });
}

export function selectFixturesPageViewModel(input: FixturesPageInput) {
  const categories = input.torneoActivoId ? buildCategories(input) : [];
  const activeCategory = input.selectedCategory || categories[0] || null;

  const activeCategoryConfig =
    input.torneoActivoId && activeCategory
      ? input.allCategorias.find(
          (category) =>
            hasTorneo(category, input.torneoActivoId) &&
            getString(category, "nombre") === activeCategory,
        ) ?? null
      : null;

  const activeCategoryId = getString(activeCategoryConfig ?? undefined, "id");

  const tournament = input.torneoActivoId
    ? input.allTorneos.find((item) => getString(item, "id") === input.torneoActivoId) ?? null
    : null;

  const categoryMatches = input.allPartidos.filter((match) => {
    if (!hasTorneo(match, input.torneoActivoId) || !activeCategory) return false;
    if (activeCategoryId) return getString(match, "categoriaId") === activeCategoryId;
    return getString(match, "grupo", "General") === activeCategory;
  });

  const categoryMatchTeamIds = new Set<string>();
  categoryMatches.forEach((match) => {
    const localId = getString(match, "equipoLocalId");
    const visitId = getString(match, "equipoVisitaId");
    if (localId) categoryMatchTeamIds.add(localId);
    if (visitId) categoryMatchTeamIds.add(visitId);
  });

  const categoryTeams = input.allEquipos.filter(
    (team) =>
      hasTorneo(team, input.torneoActivoId) &&
      (getString(team, "grupo", "General") === activeCategory ||
        categoryMatchTeamIds.has(getString(team, "id"))),
  );

  const standings = calcularPosiciones(categoryMatches, categoryTeams).map(mapStandingRow);

  const teamsById = new Map(input.allEquipos.map((team) => [getString(team, "id"), team]));
  const venues = input.allSedes.filter((venue) => hasTorneo(venue, input.torneoActivoId));
  const referees = input.allArbitros.filter(
    (referee) => hasTorneo(referee, input.torneoActivoId),
  );
  const venuesById = new Map(venues.map((venue) => [getString(venue, "id"), venue]));
  const refereesById = new Map(referees.map((referee) => [getString(referee, "id"), referee]));
  const categoriesById = new Map(
    input.allCategorias.map((category) => [getString(category, "id"), category]),
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
          (match) => getString(match, "estado") === input.filters.filterEstado,
        );
      }

      if (input.filters.filterQuery) {
        const query = input.filters.filterQuery.toLowerCase();
        filteredMatches = filteredMatches.filter((match) => {
          const localName = getString(teamsById.get(getString(match, "equipoLocalId")), "nombre").toLowerCase();
          const visitaName = getString(teamsById.get(getString(match, "equipoVisitaId")), "nombre").toLowerCase();
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
    (match) => getString(match, "estado") === "finalizado",
  ).length;
  const scheduledMatches = categoryMatches.filter(
    (match) => getString(match, "estado") === "programado",
  ).length;
  const pendingMatches = totalMatches - playedMatches - scheduledMatches;

  const upcomingMatches = categoryMatches
    .filter((match) => getString(match, "estado") === "programado")
    .sort((left, right) => new Date(getString(left, "fechaHora")).getTime() - new Date(getString(right, "fechaHora")).getTime())
    .slice(0, 3)
    .map((match) => mapUpcomingMatch(match, mapperContext));

  const matchesWithDate = categoryMatches.filter((match) => getString(match, "fechaHora"));
  const scheduledDatesMap = matchesWithDate.reduce<Record<string, Entity[]>>((accumulator, match) => {
    const key = new Date(getString(match, "fechaHora")).toISOString().slice(0, 10);
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

  const maxRound = Math.max(0, ...categoryMatches.map((match) => getNumber(match, "ronda")));

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