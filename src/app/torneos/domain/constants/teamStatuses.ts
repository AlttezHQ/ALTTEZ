export const TEAM_STATUSES = {
  ACTIVE: "active",
  PENDING: "pending",
  INCOMPLETE: "incomplete",
} as const;

export type TeamOperationalStatus = (typeof TEAM_STATUSES)[keyof typeof TEAM_STATUSES];

export const TEAM_STATUS_VALUES = Object.freeze(Object.values(TEAM_STATUSES));
