import { CATEGORY_STATES, type CategoryOperationalState } from "./categoryStates";

export const CATEGORY_STATE_LABELS: Record<CategoryOperationalState, string> = {
  [CATEGORY_STATES.COMPETITION_ACTIVE]: "En competencia",
  [CATEGORY_STATES.OPEN_REGISTRATION]: "Inscripciones abiertas",
  [CATEGORY_STATES.NEEDS_GROUP_DRAW]: "Armando grupos",
  [CATEGORY_STATES.HAS_INCIDENTS]: "Con incidencias",
  [CATEGORY_STATES.PAUSED]: "Pausadas",
  [CATEGORY_STATES.COMPLETED]: "Finalizada",
};
