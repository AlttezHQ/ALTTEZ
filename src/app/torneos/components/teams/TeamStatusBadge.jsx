import { TEAM_STATUS_LABELS } from "../../domain/constants/teamStatusLabels";
import { TEAM_STATUSES } from "../../domain/constants/teamStatuses";
import { PALETTE } from "../../../../shared/tokens/palette";
import styles from "./TeamStatusBadge.module.css";

const STATUS_THEME = {
  [TEAM_STATUSES.ACTIVE]: {
    color: PALETTE.success,
    background: PALETTE.successDim,
    border: PALETTE.successBorder,
  },
  [TEAM_STATUSES.PENDING]: {
    color: PALETTE.amber,
    background: PALETTE.amberDim,
    border: PALETTE.amberBorder,
  },
  [TEAM_STATUSES.INCOMPLETE]: {
    color: PALETTE.danger,
    background: PALETTE.dangerDim,
    border: PALETTE.dangerBorder,
  },
};

export default function TeamStatusBadge({ status }) {
  const theme = STATUS_THEME[status] ?? STATUS_THEME[TEAM_STATUSES.PENDING];
  return (
    <span
      className={styles.badge}
      style={{
        "--badge-color": theme.color,
        "--badge-bg": theme.background,
        "--badge-border": theme.border,
      }}
    >
      {TEAM_STATUS_LABELS[status] ?? TEAM_STATUS_LABELS[TEAM_STATUSES.PENDING]}
    </span>
  );
}
