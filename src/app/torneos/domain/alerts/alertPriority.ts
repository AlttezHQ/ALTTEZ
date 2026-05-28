import { ALERT_SEVERITY_PRIORITY } from "../constants/operationalPriority";
import type { DomainAlert } from "./alertTypes";

export function compareAlerts(left: DomainAlert, right: DomainAlert) {
  const severityDiff = ALERT_SEVERITY_PRIORITY[left.severity] - ALERT_SEVERITY_PRIORITY[right.severity];
  if (severityDiff !== 0) return severityDiff;
  if (left.blocking !== right.blocking) return left.blocking ? -1 : 1;
  if (left.actionable !== right.actionable) return left.actionable ? -1 : 1;
  return left.title.localeCompare(right.title);
}

export function sortAlerts(alerts: DomainAlert[]) {
  return [...alerts].sort(compareAlerts);
}
