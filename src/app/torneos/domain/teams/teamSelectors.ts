import { mapTeamToViewModel } from "./mappers/teamViewMapper";
import { normalizeTeamCategory, resolveTeamStatus } from "./teamUtils";
import { TEAM_STATUSES } from "../constants/teamStatuses";
import type { TeamsPageViewModel, TournamentTeamEntity, TeamDomainModel } from "./teamTypes";

type TeamsPageSelectorInput = {
  torneoActivoId: string | null;
  tournamentName: string;
  tournamentSlug?: string | null;
  origin?: string | null;
  teams: TournamentTeamEntity[];
  search: string;
  statusFilter: "todos" | "active" | "pending" | "incomplete";
};

function buildTeamDomainModel(team: TournamentTeamEntity, tournamentSlug?: string | null, origin?: string | null): TeamDomainModel {
  const category = normalizeTeamCategory(team.grupo);
  const status = resolveTeamStatus(team);
  const playersCount = (team.jugadores || []).length;

  return {
    id: team.id,
    name: team.nombre,
    category,
    contact: team.delegado || team.entrenador || "Sin contacto",
    playersCount,
    status,
    logo: team.logo || null,
    registrationLink: origin && tournamentSlug ? `${origin}/t/${tournamentSlug}/registro-equipo/${team.id}` : null,
    raw: team,
  };
}

export function selectTeamsPageViewModel(input: TeamsPageSelectorInput): TeamsPageViewModel {
  if (!input.torneoActivoId) {
    return {
      tournamentName: "",
      summary: { total: 0, categories: 0, completeSquads: 0 },
      teams: [],
    };
  }

  const tournamentTeams = input.teams.filter((team) => team.torneoId === input.torneoActivoId);
  const domainTeams = tournamentTeams.map((team) => buildTeamDomainModel(team, input.tournamentSlug, input.origin));

  const teams = domainTeams
    .filter((team) => team.name.toLowerCase().includes(input.search.trim().toLowerCase()))
    .filter((team) => {
      if (input.statusFilter === "todos") return true;
      if (input.statusFilter === "active") return team.status === TEAM_STATUSES.ACTIVE;
      if (input.statusFilter === "pending") return team.status === TEAM_STATUSES.PENDING;
      if (input.statusFilter === "incomplete") return team.status === TEAM_STATUSES.INCOMPLETE;
      return true;
    })
    .map(mapTeamToViewModel)
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }));

  return {
    tournamentName: input.tournamentName,
    summary: {
      total: tournamentTeams.length,
      categories: new Set(tournamentTeams.map((team) => team.grupo).filter(Boolean)).size || 1,
      completeSquads: tournamentTeams.filter((team) => (team.jugadores || []).length >= 11).length,
    },
    teams,
  };
}
