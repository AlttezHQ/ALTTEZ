import clsx from "clsx";
import {
  CheckCircle2,
  LayoutGrid,
  PauseCircle,
  PlayCircle,
  ShieldAlert,
  Users,
} from "lucide-react";
import styles from "./GlobalStateCard.module.css";
import { CATEGORY_STATE_THEME } from "./categoryStateTheme";
import { CATEGORY_STATES } from "../../domain/constants/categoryStates";

const STATE_META = {
  [CATEGORY_STATES.COMPETITION_ACTIVE]: { icon: PlayCircle, ...CATEGORY_STATE_THEME[CATEGORY_STATES.COMPETITION_ACTIVE] },
  [CATEGORY_STATES.NEEDS_GROUP_DRAW]: { icon: LayoutGrid, ...CATEGORY_STATE_THEME[CATEGORY_STATES.NEEDS_GROUP_DRAW] },
  [CATEGORY_STATES.OPEN_REGISTRATION]: { icon: Users, ...CATEGORY_STATE_THEME[CATEGORY_STATES.OPEN_REGISTRATION] },
  [CATEGORY_STATES.PAUSED]: { icon: PauseCircle, ...CATEGORY_STATE_THEME[CATEGORY_STATES.PAUSED] },
  [CATEGORY_STATES.HAS_INCIDENTS]: { icon: ShieldAlert, ...CATEGORY_STATE_THEME[CATEGORY_STATES.HAS_INCIDENTS] },
  [CATEGORY_STATES.COMPLETED]: { icon: CheckCircle2, ...CATEGORY_STATE_THEME[CATEGORY_STATES.COMPLETED] },
};

export default function GlobalStateCard({ state, isSelected, onClick }) {
  const meta = STATE_META[state.id];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(styles.card, isSelected && styles.selected)}
      style={{
        "--state-accent": meta.accent,
        "--state-dim": meta.dim,
        "--state-border": meta.border,
      }}
    >
      <span className={styles.icon}>
        <Icon size={15} />
      </span>
      <span className={styles.copy}>
        <strong>{state.count}</strong>
        <span>{state.label}</span>
      </span>
      <span className={styles.underline} />
    </button>
  );
}
