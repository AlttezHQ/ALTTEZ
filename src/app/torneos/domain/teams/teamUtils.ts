import { TEAM_STATUSES } from "../constants/teamStatuses";
import type { TeamOperationalStatus } from "../constants/teamStatuses";
import type { TournamentTeamEntity } from "./teamTypes";

export function resolveTeamStatus(team: TournamentTeamEntity): TeamOperationalStatus {
  const playersCount = (team.jugadores || []).length;
  if (playersCount < 1) return TEAM_STATUSES.INCOMPLETE;
  if (!team.delegado && !team.entrenador) return TEAM_STATUSES.PENDING;
  return TEAM_STATUSES.ACTIVE;
}

export function normalizeTeamCategory(group?: string | null) {
  return group || "Sin categoria";
}
