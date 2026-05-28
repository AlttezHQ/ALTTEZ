import clsx from "clsx";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  ChevronRight,
  Clock3,
  Dot,
  LayoutGrid,
  Settings,
  TimerReset,
  Users,
} from "lucide-react";
import { CATEGORY_STATES } from "../../domain/constants/categoryStates";
import styles from "./CategoryCard.module.css";
import { CATEGORY_STATE_THEME } from "./categoryStateTheme";

const METRIC_ICON = {
  teams: Users,
  groups: LayoutGrid,
  played: Activity,
  pending: TimerReset,
};

const ACTION_ICON = {
  table: BarChart3,
  groups: LayoutGrid,
  calendar: Calendar,
  teams: Users,
  review: AlertTriangle,
  settings: Settings,
};

function getAlertTone(severity) {
  if (severity === "critical" || severity === "high") return styles.alertHigh;
  if (severity === "medium") return styles.alertMedium;
  if (severity === "low") return styles.alertLow;
  return styles.alertNeutral;
}

export default function CategoryCard({ category, onNavigate }) {
  const stateTone = CATEGORY_STATE_THEME[category.primaryState] ?? CATEGORY_STATE_THEME[CATEGORY_STATES.PAUSED];
  const highlightAlert = category.highlightAlert;

  return (
    <article
      className={styles.card}
      style={{
        "--card-accent": stateTone.accent,
        "--card-accent-dim": stateTone.dim,
        "--card-accent-border": stateTone.border,
      }}
    >
      <div className={styles.accent} />
      <div className={styles.glow} />

      <header className={styles.head}>
        <div>
          <h3 className={styles.title}>{category.name}</h3>
          <div className={styles.subtitle}>{category.subtitle}</div>
        </div>

        <span className={styles.badge}>
          <span className={styles.badgeDot} />
          {category.badge.label}
        </span>
      </header>

      <div className={styles.metrics}>
        {category.metrics.map((metric) => {
          const Icon = METRIC_ICON[metric.icon];
          return (
            <div key={metric.id} className={styles.metric}>
              <div className={styles.metricValue}>
                <Icon size={13} />
                <span>{metric.value}</span>
              </div>
              <small>{metric.label}</small>
            </div>
          );
        })}
      </div>

      <div className={styles.activity}>
        <div className={styles.activityLabel}>
          <Clock3 size={13} />
          {category.activity.label}
        </div>

        {category.activity.isEmpty ? (
          <div className={styles.activityEmpty}>{category.activity.title}</div>
        ) : (
          <div className={styles.activityRow}>
            <div className={styles.activityMain}>{category.activity.title}</div>
            <div className={styles.activityMeta}>
              <span>{category.activity.day}</span>
              <Dot size={14} />
              <span>{category.activity.time}</span>
            </div>
          </div>
        )}
      </div>

      {highlightAlert ? (
        <button
          type="button"
          className={clsx(styles.alert, getAlertTone(highlightAlert.severity))}
          onClick={() => onNavigate?.(highlightAlert.target)}
        >
          <div className={styles.alertHead}>
            <AlertTriangle size={15} />
            <span>{highlightAlert.title}</span>
          </div>
          <div className={styles.alertMeta}>{highlightAlert.description}</div>
          <span className={styles.alertLink}>
            {highlightAlert.actionLabel}
            <ChevronRight size={14} />
          </span>
        </button>
      ) : (
        <div className={clsx(styles.alert, styles.alertNeutral)}>
          <div className={styles.alertHead}>
            <Clock3 size={15} />
            <span>Operacion estable</span>
          </div>
          <div className={styles.alertMeta}>Sin incidencias criticas por ahora.</div>
        </div>
      )}

      <div className={styles.actions}>
        {category.quickActions.map((action) => {
          const Icon = ACTION_ICON[action.icon];
          return (
            <button key={action.id} type="button" className={styles.action} onClick={() => onNavigate?.(action.target)}>
              <Icon size={14} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
}
