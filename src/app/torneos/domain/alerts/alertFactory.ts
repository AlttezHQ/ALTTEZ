import type { DomainAlert } from "./alertTypes";

type AlertFactoryInput = Omit<DomainAlert, "autoFixAvailable" | "actionable" | "blocking"> &
  Partial<Pick<DomainAlert, "autoFixAvailable" | "actionable" | "blocking">>;

export function createAlert(alert: AlertFactoryInput): DomainAlert {
  return {
    autoFixAvailable: false,
    actionable: true,
    blocking: false,
    ...alert,
  };
}
