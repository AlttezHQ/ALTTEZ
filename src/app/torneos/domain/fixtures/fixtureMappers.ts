// @ts-nocheck

const DEFAULT_STATE = {
  label: "Pendiente",
  color: "#7A7F85",
  dot: "#7A7F85",
};

type FixtureEntity = Record<string, unknown>;
type MapperContext = {
  teamsById: Map<unknown, Record<string, unknown>>;
  venuesById: Map<unknown, Record<string, unknown>>;
  refereesById: Map<unknown, Record<string, unknown>>;
  categoriesById: Map<unknown, Record<string, unknown>>;
  stateConfig: Record<string, { label: string; color: string; dot: string }>;
  colors: {
    primary: string;
    border: string;
  };
};

function getEntityString(entity: FixtureEntity, key: string) {
  const value = entity[key];
  return typeof value === "string" ? value : "";
}

function getEntityNumber(entity: FixtureEntity, key: string) {
  const value = entity[key];
  return typeof value === "number" ? value : null;
}

function getEntityDateValue(entity: FixtureEntity, key: string) {
  const value = entity[key];
  return typeof value === "string" || typeof value === "number" ? value : null;
}

export function mapStandingRow(row: FixtureEntity) {
  return {
    equipoId: row.equipoId,
    nombre: row.nombre,
    pj: row.pj,
    pg: row.pg,
    pe: row.pe,
    pp: row.pp,
    dg: row.dg,
    pts: row.pts,
  };
}

export function mapFixtureMatchRow(match: FixtureEntity, context: MapperContext) {
  const local = context.teamsById.get(match.equipoLocalId);
  const visita = context.teamsById.get(match.equipoVisitaId);
  const venue = context.venuesById.get(match.sedeId);
  const estado = getEntityString(match, "estado");
  const state = context.stateConfig[estado] ?? DEFAULT_STATE;
  const isCompleted = estado === "finalizado";

  const fechaHora = getEntityDateValue(match, "fechaHora");

  return {
    id: match.id,
    localName: local?.nombre ?? "TBD",
    localColor: local?.color ?? context.colors.primary,
    visitaName: visita?.nombre ?? "TBD",
    visitaColor: visita?.color ?? context.colors.border,
    hourLabel: fechaHora
      ? new Date(fechaHora).toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--",
    venueLabel: venue?.nombre || "Sin cancha",
    resultLabel: isCompleted
      ? `${match.golesLocal ?? 0} - ${match.golesVisita ?? 0}`
      : "VS",
    isCompleted,
    state,
    raw: match,
  };
}

export function mapUpcomingMatch(match: FixtureEntity, context: MapperContext) {
  const localName =
    context.teamsById.get(match.equipoLocalId)?.nombre ?? "TBD";
  const visitaName =
    context.teamsById.get(match.equipoVisitaId)?.nombre ?? "TBD";
  const fechaHora = getEntityDateValue(match, "fechaHora");
  const date = fechaHora ? new Date(fechaHora) : null;

  return {
    id: match.id,
    localName,
    visitaName,
    dateLabel: date
      ? `${date.toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "short",
        })} · ${date.toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      : "Sin fecha",
    raw: match,
  };
}

export function mapSchedulingMatch(match: FixtureEntity, context: MapperContext) {
  const local = context.teamsById.get(match.equipoLocalId);
  const visita = context.teamsById.get(match.equipoVisitaId);
  const venue = context.venuesById.get(match.sedeId);
  const referee = context.refereesById.get(match.arbitroId);
  const estado = getEntityString(match, "estado");
  const state = context.stateConfig[estado] ?? DEFAULT_STATE;

  const fechaHora = getEntityDateValue(match, "fechaHora");

  return {
    id: match.id,
    localName: local?.nombre ?? "TBD",
    visitaName: visita?.nombre ?? "TBD",
    hourLabel: fechaHora
      ? new Date(fechaHora).toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    venueLabel: venue?.nombre || "",
    refereeLabel: referee?.nombre || "",
    state,
    raw: match,
  };
}

export function mapScheduleReportMatch(match: FixtureEntity, context: MapperContext) {
  const localName =
    context.teamsById.get(match.equipoLocalId)?.nombre ?? "TBD";
  const visitaName =
    context.teamsById.get(match.equipoVisitaId)?.nombre ?? "TBD";
  const categoryName =
    context.categoriesById.get(match.categoriaId)?.nombre ??
    match.grupo ??
    "General";

  return {
    id: match.id,
    matchLabel: `${categoryName}: ${localName} vs ${visitaName}`,
    roundLabel: getEntityNumber(match, "ronda") ?? "-",
    stateLabel: getEntityString(match, "estado") || "pendiente",
  };
}
