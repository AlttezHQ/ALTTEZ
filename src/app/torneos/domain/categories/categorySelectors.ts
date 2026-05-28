import { CATEGORY_PRIMARY_STATE_PRIORITY } from "../constants/operationalPriority";
import { CATEGORY_STATES, type CategoryOperationalState } from "../constants/categoryStates";
import { normalizeMatchStatus, MATCH_STATUS } from "../fixtureState";
import { getCategoryAlerts } from "./categoryAlertRules";
import { mapCategoryToViewModel, mapGlobalStateToViewModel } from "./mappers/categoryViewMapper";
import { resolveCategoryStates, resolvePrimaryCategoryState } from "./categoryStatusResolver";
import {
  formatCategoryDateTime,
  getAssignedGroups,
  getCategoryBaseModels,
  getCategoryMatches,
  getCompetitionGroups,
  getMatchLifecycle,
} from "./categoryUtils";
import type {
  CategoriesPageViewModel,
  CategoryDomainModel,
  TournamentCategory,
  TournamentMatch,
  TournamentTeam,
} from "./categoryTypes";

type CategoriesPageSelectorInput = {
  torneoActivoId: string | null;
  categories: TournamentCategory[];
  teams: TournamentTeam[];
  matches: TournamentMatch[];
  search: string;
  activeFilter: string;
  onlyAlerts: boolean;
  sortMode: "priority" | "activity" | "name";
  now?: number;
};

function buildCategoryDomainModel(baseCategory: ReturnType<typeof getCategoryBaseModels>[number], teams: TournamentTeam[], matches: TournamentMatch[], now: number): CategoryDomainModel {
  const categoryMatches = getCategoryMatches(matches, baseCategory);
  const categoryTeams = baseCategory.equipos ?? [];
  const teamsTarget = Number(baseCategory.teams) || categoryTeams.length;
  const competitionGroups = getCompetitionGroups(categoryMatches);
  const assignedGroups = getAssignedGroups(categoryTeams, baseCategory.nombre);

  const completedMatches = categoryMatches
    .filter((match) => getMatchLifecycle(match.status ?? match.estado) === "completed")
    .sort((a, b) => (formatCategoryDateTime(b.fechaHora)?.timestamp ?? 0) - (formatCategoryDateTime(a.fechaHora)?.timestamp ?? 0));

  const upcomingMatches = categoryMatches
    .filter((match) => {
      const lifecycle = getMatchLifecycle(match.status ?? match.estado);
      const date = formatCategoryDateTime(match.fechaHora);
      return lifecycle === "scheduled" && date && date.timestamp >= now;
    })
    .sort((a, b) => (formatCategoryDateTime(a.fechaHora)?.timestamp ?? Number.MAX_SAFE_INTEGER) - (formatCategoryDateTime(b.fechaHora)?.timestamp ?? Number.MAX_SAFE_INTEGER));

  const liveMatches = categoryMatches.filter((match) => normalizeMatchStatus(match.status ?? match.estado) === MATCH_STATUS.IN_PLAY);
  const pendingMatches = categoryMatches.filter((match) => getMatchLifecycle(match.status ?? match.estado) !== "completed").length;
  const unplannedMatches = categoryMatches.filter((match) => !match.fechaHora && getMatchLifecycle(match.status ?? match.estado) !== "completed").length;
  const missingTeams = Math.max(teamsTarget - categoryTeams.length, 0);
  const hasAnyMatch = categoryMatches.length > 0;
  const openRegistration = missingTeams > 0 && completedMatches.length === 0;
  const needsGroupDraw = baseCategory.format === "grupos_playoffs" && categoryTeams.length >= 4 && competitionGroups.size === 0 && assignedGroups.size === 0;

  const alerts = getCategoryAlerts({
    categoryName: baseCategory.nombre,
    categoryFormat: baseCategory.format ?? null,
    categoryTeamsCount: categoryTeams.length,
    missingTeams,
    hasAnyMatch,
    unplannedMatches,
    needsGroupDraw,
    openRegistration,
  });

  const states = resolveCategoryStates({
    alerts,
    playedMatches: completedMatches.length,
    pendingMatches,
    upcomingMatches: upcomingMatches.length,
    hasLiveMatch: liveMatches.length > 0,
    openRegistration,
    needsGroupDraw,
    hasAnyMatch,
  });

  const primaryState = resolvePrimaryCategoryState(states);
  const nextMatch = upcomingMatches[0] ?? null;
  const lastMatch = completedMatches[0] ?? null;
  const activityMatch = nextMatch ?? lastMatch;
  const activityDate = formatCategoryDateTime(activityMatch?.fechaHora);
  const localTeam = teams.find((team) => team.id === activityMatch?.equipoLocalId);
  const awayTeam = teams.find((team) => team.id === activityMatch?.equipoVisitaId);

  return {
    id: baseCategory.id,
    name: baseCategory.nombre,
    format: baseCategory.format ?? null,
    teamsTarget,
    teamsCount: categoryTeams.length,
    groupsCreated: Math.max(competitionGroups.size, assignedGroups.size),
    playedMatches: completedMatches.length,
    pendingMatches,
    states,
    primaryState,
    alerts,
    activity: activityDate
      ? {
          label: nextMatch ? "Proximo partido" : "Ultimo partido",
          title: `${localTeam?.nombre ?? "Pendiente"} vs ${awayTeam?.nombre ?? "Pendiente"}`,
          timestamp: activityDate.timestamp,
          day: activityDate.day,
          time: activityDate.time,
          isEmpty: false,
        }
      : {
          label: "Sin actividad reciente",
          title: "Sin partidos registrados",
          timestamp: null,
          day: null,
          time: null,
          isEmpty: true,
        },
  };
}

function buildGlobalStates(domainCategories: CategoryDomainModel[]) {
  const trackedStates: CategoryOperationalState[] = [
    CATEGORY_STATES.COMPETITION_ACTIVE,
    CATEGORY_STATES.NEEDS_GROUP_DRAW,
    CATEGORY_STATES.OPEN_REGISTRATION,
    CATEGORY_STATES.PAUSED,
    CATEGORY_STATES.HAS_INCIDENTS,
    CATEGORY_STATES.COMPLETED,
  ];

  return trackedStates.map((state) =>
    mapGlobalStateToViewModel(
      state,
      domainCategories.filter((category) => category.states.includes(state)).length,
    ),
  );
}

function sortCategoryViewModels(left: CategoriesPageViewModel["categories"][number], right: CategoriesPageViewModel["categories"][number], sortMode: CategoriesPageSelectorInput["sortMode"]) {
  if (sortMode === "name") return left.name.localeCompare(right.name, undefined, { numeric: true });
  if (sortMode === "activity") {
    return (right.activity.timestamp ?? 0) - (left.activity.timestamp ?? 0);
  }

  const leftPriority = left.primaryState ? CATEGORY_PRIMARY_STATE_PRIORITY.indexOf(left.primaryState) : 99;
  const rightPriority = right.primaryState ? CATEGORY_PRIMARY_STATE_PRIORITY.indexOf(right.primaryState) : 99;
  if (leftPriority !== rightPriority) return leftPriority - rightPriority;
  return right.alerts.length - left.alerts.length;
}

export function selectCategoriesPageViewModel(input: CategoriesPageSelectorInput): CategoriesPageViewModel {
  if (!input.torneoActivoId) {
    return {
      summary: {
        totalCategories: 0,
        totalTeams: 0,
        categoriesWithIncidents: 0,
      },
      globalStates: [],
      categories: [],
    };
  }

  const tournamentTeams = input.teams.filter((team) => team.torneoId === input.torneoActivoId);
  const tournamentMatches = input.matches.filter((match) => match.torneoId === input.torneoActivoId);
  const storeCategories = input.categories.filter((category) => category.torneoId === input.torneoActivoId);

  const baseCategories = getCategoryBaseModels(storeCategories, tournamentTeams);
  const domainCategories = baseCategories.map((baseCategory) =>
    buildCategoryDomainModel(baseCategory, tournamentTeams, tournamentMatches, input.now ?? Date.now()),
  );

  const categories = domainCategories
    .map(mapCategoryToViewModel)
    .filter((category) => category.name.toLowerCase().includes(input.search.trim().toLowerCase()))
    .filter((category) => (input.activeFilter === "all" ? true : category.states.includes(input.activeFilter as CategoryOperationalState)))
    .filter((category) => (input.onlyAlerts ? category.alerts.length > 0 : true))
    .sort((left, right) => sortCategoryViewModels(left, right, input.sortMode));

  return {
    summary: {
      totalCategories: domainCategories.length,
      totalTeams: domainCategories.reduce((acc, category) => acc + category.teamsCount, 0),
      categoriesWithIncidents: domainCategories.filter((category) => category.states.includes(CATEGORY_STATES.HAS_INCIDENTS)).length,
    },
    globalStates: buildGlobalStates(domainCategories),
    categories,
  };
}
