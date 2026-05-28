import { CATEGORY_STATES } from "../../domain/constants/categoryStates";
import { PALETTE } from "../../../../shared/tokens/palette";

export const CATEGORY_STATE_THEME = {
  [CATEGORY_STATES.COMPETITION_ACTIVE]: {
    accent: PALETTE.success,
    dim: PALETTE.successDim,
    border: PALETTE.successBorder,
  },
  [CATEGORY_STATES.NEEDS_GROUP_DRAW]: {
    accent: PALETTE.amber,
    dim: PALETTE.amberDim,
    border: PALETTE.amberBorder,
  },
  [CATEGORY_STATES.OPEN_REGISTRATION]: {
    accent: PALETTE.blue,
    dim: PALETTE.blueDim,
    border: PALETTE.blueBorder,
  },
  [CATEGORY_STATES.HAS_INCIDENTS]: {
    accent: PALETTE.danger,
    dim: PALETTE.dangerDim,
    border: PALETTE.dangerBorder,
  },
  [CATEGORY_STATES.PAUSED]: {
    accent: PALETTE.textHint,
    dim: "rgba(120, 134, 156, 0.12)",
    border: "rgba(120, 134, 156, 0.24)",
  },
  [CATEGORY_STATES.COMPLETED]: {
    accent: PALETTE.bronce,
    dim: PALETTE.bronceDim,
    border: PALETTE.bronceBorder,
  },
};
