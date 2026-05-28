import { CATEGORY_STATES, type CategoryOperationalState } from "../constants/categoryStates";
import { CATEGORY_PRIMARY_STATE_PRIORITY } from "../constants/operationalPriority";
import type { DomainAlert } from "../alerts/alertTypes";

type CategoryStatusContext = {
  alerts: DomainAlert[];
  playedMatches: number;
  pendingMatches: number;
  upcomingMatches: number;
  hasLiveMatch: boolean;
  openRegistration: boolean;
  needsGroupDraw: boolean;
  hasAnyMatch: boolean;
};

export function resolveCategoryStates(context: CategoryStatusContext): CategoryOperationalState[] {
  const states = new Set<CategoryOperationalState>();

  if (context.alerts.some((alert) => alert.severity === "high" || alert.severity === "critical")) {
    states.add(CATEGORY_STATES.HAS_INCIDENTS);
  }
  if (context.hasLiveMatch || context.playedMatches > 0 || context.upcomingMatches > 0) {
    states.add(CATEGORY_STATES.COMPETITION_ACTIVE);
  }
  if (context.needsGroupDraw) {
    states.add(CATEGORY_STATES.NEEDS_GROUP_DRAW);
  }
  if (context.openRegistration) {
    states.add(CATEGORY_STATES.OPEN_REGISTRATION);
  }
  if (context.hasAnyMatch && context.pendingMatches === 0) {
    states.add(CATEGORY_STATES.COMPLETED);
  }
  if (states.size === 0) {
    states.add(CATEGORY_STATES.PAUSED);
  }

  return CATEGORY_PRIMARY_STATE_PRIORITY.filter((state) => states.has(state));
}

export function resolvePrimaryCategoryState(states: CategoryOperationalState[]) {
  return CATEGORY_PRIMARY_STATE_PRIORITY.find((state) => states.includes(state)) ?? null;
}
