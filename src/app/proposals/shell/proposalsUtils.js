/**
 * @module proposalsUtils
 * @description Helpers compartidos del módulo interno de propuestas.
 */

import { SUCCESS, AMBER, DANGER, CU, MUTED, CU_DIM, CU_BOR } from "./proposalsTokens";

export const STATUS_META = {
  creada:          { label: "Creada",          color: MUTED,   bg: "rgba(102,112,133,0.10)", border: "rgba(102,112,133,0.24)" },
  enviada:         { label: "Enviada",         color: AMBER,   bg: "rgba(183,131,31,0.10)",  border: "rgba(183,131,31,0.26)" },
  aceptada:        { label: "Aceptada",        color: SUCCESS, bg: "rgba(47,165,111,0.08)",  border: "rgba(47,165,111,0.24)" },
  contrapropuesta: { label: "Contrapropuesta", color: CU,      bg: CU_DIM,                   border: CU_BOR },
  rechazada:       { label: "Rechazada",       color: DANGER,  bg: "rgba(217,92,92,0.08)",   border: "rgba(217,92,92,0.24)" },
};

const ORDER = ["creada", "enviada", "contrapropuesta", "aceptada", "rechazada"];
export const STATUS_ORDER = ORDER;

export function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtMonth(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
}

/** Cuenta por estado: { aceptada: n, ... } */
export function countByStatus(proposals) {
  return proposals.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {});
}

/** Agrupa propuestas por client_name */
export function groupByClient(proposals) {
  const map = new Map();
  for (const p of proposals) {
    const key = (p.client_name || "Sin nombre").trim();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(p);
  }
  return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
}
