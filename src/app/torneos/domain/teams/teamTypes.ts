import type { TeamOperationalStatus } from "../constants/teamStatuses";

export type TournamentTeamEntity = {
  id: string;
  torneoId?: string;
  nombre: string;
  grupo?: string | null;
  delegado?: string | null;
  entrenador?: string | null;
  jugadores?: Array<{ id?: string; nombre?: string; dorsal?: string }>;
  logo?: string | null;
};

export type TeamDomainModel = {
  id: string;
  name: string;
  category: string;
  contact: string;
  playersCount: number;
  status: TeamOperationalStatus;
  logo: string | null;
  registrationLink: string | null;
  raw: TournamentTeamEntity;
};

export type TeamCardViewModel = {
  id: string;
  name: string;
  category: string;
  contact: string;
  playersCount: number;
  status: TeamOperationalStatus;
  logo: string | null;
  registrationLink: string | null;
};

export type TeamSummaryViewModel = {
  total: number;
  categories: number;
  completeSquads: number;
};

export type TeamsPageViewModel = {
  tournamentName: string;
  summary: TeamSummaryViewModel;
  teams: TeamCardViewModel[];
};
