import { TEAM_STATUSES, type TeamOperationalStatus } from "./teamStatuses";

export const TEAM_STATUS_LABELS: Record<TeamOperationalStatus, string> = {
  [TEAM_STATUSES.ACTIVE]: "Activo",
  [TEAM_STATUSES.PENDING]: "Pendiente",
  [TEAM_STATUSES.INCOMPLETE]: "Incompleto",
};
