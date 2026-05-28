import type { DomainAlert } from "../alerts/alertTypes";
import type { CategoryOperationalState } from "../constants/categoryStates";

export type TournamentTeam = {
  id: string;
  torneoId?: string;
  nombre?: string;
  grupo?: string | null;
};

export type TournamentCategory = {
  id: string;
  torneoId?: string;
  nombre: string;
  teams?: number;
  format?: string | null;
  fases?: string | null;
  groupsCount?: number | null;
  grupos?: number | null;
};

export type TournamentMatch = {
  id?: string;
  torneoId?: string;
  categoriaId?: string | null;
  grupo?: string | null;
  fase?: string | null;
  fechaHora?: string | null;
  status?: string | null;
  estado?: string | null;
  equipoLocalId?: string | null;
  equipoVisitaId?: string | null;
};

export type CategoryBaseModel = TournamentCategory & {
  equipos: TournamentTeam[];
  source: "store" | "legacy";
};

export type CategoryActivityModel = {
  label: string;
  title: string;
  timestamp: number | null;
  day: string | null;
  time: string | null;
  isEmpty: boolean;
};

export type CategoryDomainModel = {
  id: string;
  name: string;
  format: string | null;
  teamsTarget: number;
  teamsCount: number;
  groupsCreated: number;
  playedMatches: number;
  pendingMatches: number;
  states: CategoryOperationalState[];
  primaryState: CategoryOperationalState | null;
  alerts: DomainAlert[];
  activity: CategoryActivityModel;
};

export type CategoryMetricViewModel = {
  id: "teams" | "groups" | "played" | "pending";
  label: string;
  value: string | number;
  icon: "teams" | "groups" | "played" | "pending";
};

export type CategoryBadgeViewModel = {
  state: CategoryOperationalState | null;
  label: string;
};

export type CategoryActionViewModel = {
  id: string;
  label: string;
  icon: "table" | "groups" | "calendar" | "teams" | "review" | "settings";
  target: string;
};

export type CategoryAlertViewModel = {
  id: string;
  severity: DomainAlert["severity"];
  title: string;
  description: string;
  actionLabel: string;
  target: string;
};

export type CategoryCardViewModel = {
  id: string;
  name: string;
  subtitle: string;
  badge: CategoryBadgeViewModel;
  metrics: CategoryMetricViewModel[];
  activity: CategoryActivityModel;
  alerts: CategoryAlertViewModel[];
  highlightAlert: CategoryAlertViewModel | null;
  quickActions: CategoryActionViewModel[];
  states: CategoryOperationalState[];
  primaryState: CategoryOperationalState | null;
};

export type GlobalStateViewModel = {
  id: CategoryOperationalState;
  label: string;
  count: number;
};

export type CategoriesPageViewModel = {
  summary: {
    totalCategories: number;
    totalTeams: number;
    categoriesWithIncidents: number;
  };
  globalStates: GlobalStateViewModel[];
  categories: CategoryCardViewModel[];
};
