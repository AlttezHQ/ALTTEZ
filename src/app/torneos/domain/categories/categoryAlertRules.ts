import { createAlert } from "../alerts/alertFactory";
import { sortAlerts } from "../alerts/alertPriority";
import { ALERT_SEVERITY } from "../constants/alertSeverity";
import type { DomainAlert } from "../alerts/alertTypes";

type CategoryAlertRuleContext = {
  categoryName: string;
  categoryFormat: string | null;
  categoryTeamsCount: number;
  missingTeams: number;
  hasAnyMatch: boolean;
  unplannedMatches: number;
  needsGroupDraw: boolean;
  openRegistration: boolean;
};

export function getCategoryAlerts(context: CategoryAlertRuleContext): DomainAlert[] {
  const alerts: DomainAlert[] = [];

  if (context.needsGroupDraw) {
    alerts.push(
      createAlert({
        id: `${context.categoryName}-groups-draw`,
        severity: ALERT_SEVERITY.MEDIUM,
        blocking: true,
        actionable: true,
        autoFixAvailable: false,
        category: "groups",
        title: "Falta sortear los grupos",
        description: "El sorteo de grupos no ha sido realizado.",
        action: "grupos",
      }),
    );
  }

  if (context.openRegistration) {
    alerts.push(
      createAlert({
        id: `${context.categoryName}-open-registration`,
        severity: ALERT_SEVERITY.LOW,
        blocking: false,
        actionable: true,
        autoFixAvailable: false,
        category: "registration",
        title: "Inscripciones abiertas",
        description:
          context.missingTeams > 0
            ? `Faltan ${context.missingTeams} equipos para completar el cupo.`
            : "La categoria sigue recibiendo equipos.",
        action: "equipos",
      }),
    );
  }

  if (context.hasAnyMatch && context.unplannedMatches > 0) {
    alerts.push(
      createAlert({
        id: `${context.categoryName}-schedule-pending`,
        severity: context.unplannedMatches > 1 ? ALERT_SEVERITY.HIGH : ALERT_SEVERITY.MEDIUM,
        blocking: context.unplannedMatches > 1,
        actionable: true,
        autoFixAvailable: false,
        category: "schedule",
        title: "Calendario pendiente",
        description: `${context.unplannedMatches} partidos siguen sin fecha programada.`,
        action: "fixtures",
      }),
    );
  }

  if (!context.hasAnyMatch && context.categoryTeamsCount >= 2) {
    alerts.push(
      createAlert({
        id: `${context.categoryName}-fixture-missing`,
        severity: ALERT_SEVERITY.MEDIUM,
        blocking: true,
        actionable: true,
        autoFixAvailable: false,
        category: "fixtures",
        title: "Fixture sin generar",
        description: "La categoria tiene equipos listos pero no registra partidos.",
        action: context.categoryFormat === "grupos_playoffs" ? "grupos" : "fixtures",
      }),
    );
  }

  return sortAlerts(alerts);
}
