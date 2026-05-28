import type { AlertSeverity } from "../constants/alertSeverity";

export type DomainAlert = {
  id: string;
  severity: AlertSeverity;
  blocking: boolean;
  actionable: boolean;
  autoFixAvailable: boolean;
  category: string;
  title: string;
  description: string;
  action: string;
};
