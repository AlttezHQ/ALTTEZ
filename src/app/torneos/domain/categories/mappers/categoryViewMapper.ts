import type { CategoryOperationalState } from "../../constants/categoryStates";
import { CATEGORY_STATE_LABELS } from "../../constants/categoryStateLabels";
import type {
  CategoryCardViewModel,
  CategoryDomainModel,
  CategoryActionViewModel,
  CategoryAlertViewModel,
  GlobalStateViewModel,
} from "../categoryTypes";

function buildQuickActions(domain: CategoryDomainModel, highlightAlert: CategoryAlertViewModel | null): CategoryActionViewModel[] {
  const dynamicTarget = highlightAlert?.target ?? "ajustes";
  const dynamicLabel = highlightAlert ? "Revisar" : "Configurar";
  const dynamicIcon = highlightAlert ? "review" : "settings";

  return [
    {
      id: "primary",
      label: domain.format === "grupos_playoffs" ? "Grupos" : "Tabla",
      icon: domain.format === "grupos_playoffs" ? "groups" : "table",
      target: domain.format === "grupos_playoffs" ? "grupos" : "estadisticas",
    },
    { id: "calendar", label: "Calendario", icon: "calendar", target: "fixtures" },
    { id: "teams", label: "Equipos", icon: "teams", target: "equipos" },
    { id: "follow-up", label: dynamicLabel, icon: dynamicIcon, target: dynamicTarget },
  ];
}

function mapAlertToViewModel(domain: CategoryDomainModel): CategoryAlertViewModel[] {
  return domain.alerts.map((alert) => ({
    id: alert.id,
    severity: alert.severity,
    title: alert.title,
    description: alert.description,
    actionLabel: "Revisar ahora",
    target: alert.action,
  }));
}

export function mapCategoryToViewModel(domain: CategoryDomainModel): CategoryCardViewModel {
  const alerts = mapAlertToViewModel(domain);
  const highlightAlert = alerts[0] ?? null;

  return {
    id: domain.id,
    name: domain.name,
    subtitle: `${domain.teamsCount} equipos`,
    badge: {
      state: domain.primaryState,
      label: domain.primaryState ? CATEGORY_STATE_LABELS[domain.primaryState] : "Sin estado",
    },
    metrics: [
      { id: "teams", label: "equipos", value: `${domain.teamsCount}${domain.teamsTarget ? ` / ${domain.teamsTarget}` : ""}`, icon: "teams" },
      { id: "groups", label: "grupos", value: domain.groupsCreated, icon: "groups" },
      { id: "played", label: "jugados", value: domain.playedMatches, icon: "played" },
      { id: "pending", label: "pendientes", value: domain.pendingMatches, icon: "pending" },
    ],
    activity: domain.activity,
    alerts,
    highlightAlert,
    quickActions: buildQuickActions(domain, highlightAlert),
    states: domain.states,
    primaryState: domain.primaryState,
  };
}

export function mapGlobalStateToViewModel(state: CategoryOperationalState, count: number): GlobalStateViewModel {
  return {
    id: state,
    label: CATEGORY_STATE_LABELS[state],
    count,
  };
}
