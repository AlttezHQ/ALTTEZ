export const MATCH_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  SCHEDULED: "SCHEDULED",
  PRE_MATCH: "PRE_MATCH",
  IN_PLAY: "IN_PLAY",
  COMPLETED: "COMPLETED",
});

export const MATCH_STATUS_VALUES = Object.freeze(Object.values(MATCH_STATUS));

export const LEGACY_MATCH_STATUS = Object.freeze({
  PENDING: "pendiente",
  PROPOSED: "propuesto",
  SCHEDULED: "programado",
  PRE_MATCH: "pre_partido",
  IN_PLAY: "en_curso",
  COMPLETED: "finalizado",
  POSTPONED: "aplazado",
  BYE: "bye",
});

export const LEGACY_TO_MATCH_STATUS = Object.freeze({
  [LEGACY_MATCH_STATUS.PENDING]: MATCH_STATUS.DRAFT,
  [LEGACY_MATCH_STATUS.PROPOSED]: MATCH_STATUS.DRAFT,
  [LEGACY_MATCH_STATUS.POSTPONED]: MATCH_STATUS.DRAFT,
  [LEGACY_MATCH_STATUS.SCHEDULED]: MATCH_STATUS.SCHEDULED,
  [LEGACY_MATCH_STATUS.PRE_MATCH]: MATCH_STATUS.PRE_MATCH,
  [LEGACY_MATCH_STATUS.IN_PLAY]: MATCH_STATUS.IN_PLAY,
  [LEGACY_MATCH_STATUS.COMPLETED]: MATCH_STATUS.COMPLETED,
  [LEGACY_MATCH_STATUS.BYE]: MATCH_STATUS.COMPLETED,
});

export const MATCH_STATUS_TO_LEGACY = Object.freeze({
  [MATCH_STATUS.DRAFT]: LEGACY_MATCH_STATUS.PENDING,
  [MATCH_STATUS.SCHEDULED]: LEGACY_MATCH_STATUS.SCHEDULED,
  [MATCH_STATUS.PRE_MATCH]: LEGACY_MATCH_STATUS.PRE_MATCH,
  [MATCH_STATUS.IN_PLAY]: LEGACY_MATCH_STATUS.IN_PLAY,
  [MATCH_STATUS.COMPLETED]: LEGACY_MATCH_STATUS.COMPLETED,
});

export const ALLOWED_MATCH_STATUS_TRANSITIONS = Object.freeze({
  [MATCH_STATUS.DRAFT]: new Set([MATCH_STATUS.SCHEDULED, MATCH_STATUS.PRE_MATCH, MATCH_STATUS.COMPLETED]),
  [MATCH_STATUS.SCHEDULED]: new Set([MATCH_STATUS.DRAFT, MATCH_STATUS.PRE_MATCH, MATCH_STATUS.IN_PLAY, MATCH_STATUS.COMPLETED]),
  [MATCH_STATUS.PRE_MATCH]: new Set([MATCH_STATUS.SCHEDULED, MATCH_STATUS.IN_PLAY, MATCH_STATUS.COMPLETED]),
  [MATCH_STATUS.IN_PLAY]: new Set([MATCH_STATUS.COMPLETED]),
  [MATCH_STATUS.COMPLETED]: new Set([]),
});

export function normalizeMatchStatus(statusLike) {
  if (!statusLike) return MATCH_STATUS.DRAFT;
  const raw = String(statusLike);
  const upper = raw.toUpperCase();
  if (MATCH_STATUS_VALUES.includes(upper)) return upper;
  return LEGACY_TO_MATCH_STATUS[raw] ?? MATCH_STATUS.DRAFT;
}

export function toLegacyMatchStatus(statusLike) {
  return MATCH_STATUS_TO_LEGACY[normalizeMatchStatus(statusLike)];
}

export function isMatchCompleted(match) {
  return normalizeMatchStatus(match?.status ?? match?.estado) === MATCH_STATUS.COMPLETED;
}

export function isMatchScheduled(match) {
  const status = normalizeMatchStatus(match?.status ?? match?.estado);
  return status === MATCH_STATUS.SCHEDULED || status === MATCH_STATUS.PRE_MATCH || status === MATCH_STATUS.IN_PLAY;
}

export function canTransitionMatchStatus(fromStatus, toStatus) {
  const from = normalizeMatchStatus(fromStatus);
  const to = normalizeMatchStatus(toStatus);
  if (from === to) return true;
  return ALLOWED_MATCH_STATUS_TRANSITIONS[from]?.has(to) ?? false;
}

export function assertMatchStatusTransition(fromStatus, toStatus) {
  if (!canTransitionMatchStatus(fromStatus, toStatus)) {
    throw new Error(`Invalid fixture status transition: ${normalizeMatchStatus(fromStatus)} -> ${normalizeMatchStatus(toStatus)}`);
  }
}
