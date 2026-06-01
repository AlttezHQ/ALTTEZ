export type WizardStepId =
  | "basic-info"
  | "categories"
  | "teams"
  | "referees"
  | "format"
  | "schedule"
  | "summary";

export interface WizardStepSchema {
  id: WizardStepId;
  label: string;
  subtitle: string;
  requiredFields: string[];
}

export interface WizardTeamDraft {
  id: string;
  name: string;
  delegate?: string;
  players?: number;
  status?: string;
}

export interface WizardCategoryDraft {
  id: string;
  nombre: string;
  format?: string;
  teams?: number;
  groupsCount?: number;
  qualifyPerGroup?: number;
}

export interface WizardTournamentDraft {
  nombre: string;
  deporte?: string;
  temporada?: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  sedePrincipal?: string;
  organizador?: string;
  categorias: WizardCategoryDraft[];
  equiposPorCategoria: Record<string, WizardTeamDraft[]>;
}

export interface WizardNavigationContract {
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoNext: boolean;
}
