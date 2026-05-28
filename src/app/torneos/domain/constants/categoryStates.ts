export const CATEGORY_STATES = {
  COMPETITION_ACTIVE: "competition_active",
  OPEN_REGISTRATION: "open_registration",
  NEEDS_GROUP_DRAW: "needs_group_draw",
  HAS_INCIDENTS: "has_incidents",
  PAUSED: "paused",
  COMPLETED: "completed",
} as const;

export type CategoryOperationalState = (typeof CATEGORY_STATES)[keyof typeof CATEGORY_STATES];

export const CATEGORY_STATE_VALUES = Object.freeze(Object.values(CATEGORY_STATES));
