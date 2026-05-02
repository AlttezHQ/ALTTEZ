/**
 * @module calendarConstants
 * @description Constantes y helpers compartidos entre los sub-módulos del Calendario.
 */
import { PALETTE as C } from "../../shared/tokens/palette";

// ── Tipos de evento ──────────────────────────────────────────────────────────
export const EVENT_TYPES = {
  training: { label: "Entrenamiento",   color: C.purple,  colorDim: "rgba(127,119,221,0.18)", border: "rgba(127,119,221,0.5)" },
  match:    { label: "Partido oficial", color: C.bronce,    colorDim: "rgba(206, 137, 70,0.12)",   border: "rgba(206, 137, 70,0.45)"  },
  club:     { label: "Evento de club",  color: C.amber,   colorDim: "rgba(239,159,39,0.15)",  border: "rgba(239,159,39,0.45)" },
};

// ── Estados RSVP ─────────────────────────────────────────────────────────────
export const RSVP_STATES = {
  PENDIENTE:  { label: "Pendiente",  color: "rgba(255,255,255,0.25)", bg: "rgba(255,255,255,0.05)", icon: "?" },
  CONFIRMADO: { label: "Confirmado", color: C.bronce,                   bg: "rgba(206, 137, 70,0.12)",   icon: "✓" },
  AUSENTE:    { label: "Ausente",    color: C.danger,                 bg: "rgba(226,75,74,0.12)",   icon: "✗" },
  DUDA:       { label: "Duda",       color: C.amber,                  bg: "rgba(239,159,39,0.12)",  icon: "~" },
};

// ── Helpers de formato ───────────────────────────────────────────────────────
export function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function fmtDateLong(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
}
