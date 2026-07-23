const DEFAULT_STATE = {
  label: "Pendiente",
  color: "#7A7F85",
  dot: "#7A7F85",
};

type FixtureEntity = Record<string, unknown>;
type FixtureState = { label: string; color: string; dot: string };
type MapperContext = {
  teamsById: Map<unknown, FixtureEntity>;
  venuesById: Map<unknown, FixtureEntity>;
  refereesById: Map<unknown, FixtureEntity>;
  categoriesById: Map<unknown, FixtureEntity>;
  stateConfig: Record<string, FixtureState>;
  colors: {
    primary: string;
    border: string;
  };
};

function getEntityString(entity: FixtureEntity | undefined, key: string, fallback = "") {
  const value = entity?.[key];
  return typeof value === "string" ? value : fallback;
}

function getEntityNumber(entity: FixtureEntity, key: string, fallback = 0) {
  const value = entity[key];
  return typeof value === "number" ? value : fallback;
}

function getEntityDateValue(entity: FixtureEntity, key: string) {
  const value = entity[key];
  return typeof value === "string" || typeof value === "number" ? value : null;
}

export function mapStandingRow(row: FixtureEntity) {
  return {
    equipoId: getEntityString(row, "equipoId"),
    nombre: getEntityString(row, "nombre"),
    pj: getEntityNumber(row, "pj"),
    pg: getEntityNumber(row, "pg"),
    pe: getEntityNumber(row, "pe"),
    pp: getEntityNumber(row, "pp"),
    dg: getEntityNumber(row, "dg"),
    pts: getEntityNumber(row, "pts"),
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
    id: getEntityString(match, "id"),
    localName: getEntityString(local, "nombre", "TBD"),
    localColor: getEntityString(local, "color", context.colors.primary),
    visitaName: getEntityString(visita, "nombre", "TBD"),
    visitaColor: getEntityString(visita, "color", context.colors.border),
    hourLabel: fechaHora
      ? new Date(fechaHora).toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--",
    venueLabel: getEntityString(venue, "nombre", "Sin cancha"),
    resultLabel: isCompleted
      ? `${getEntityNumber(match, "golesLocal")} - ${getEntityNumber(match, "golesVisita")}`
      : "VS",
    isCompleted,
    state,
    raw: match,
  };
}

export function mapUpcomingMatch(match: FixtureEntity, context: MapperContext) {
  const localName = getEntityString(context.teamsById.get(match.equipoLocalId), "nombre", "TBD");
  const visitaName = getEntityString(context.teamsById.get(match.equipoVisitaId), "nombre", "TBD");
  const fechaHora = getEntityDateValue(match, "fechaHora");
  const date = fechaHora ? new Date(fechaHora) : null;

  return {
    id: getEntityString(match, "id"),
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
    id: getEntityString(match, "id"),
    localName: getEntityString(local, "nombre", "TBD"),
    visitaName: getEntityString(visita, "nombre", "TBD"),
    hourLabel: fechaHora
      ? new Date(fechaHora).toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    venueLabel: getEntityString(venue, "nombre"),
    refereeLabel: getEntityString(referee, "nombre"),
    state,
    raw: match,
  };
}

export function mapScheduleReportMatch(match: FixtureEntity, context: MapperContext) {
  const localName = getEntityString(context.teamsById.get(match.equipoLocalId), "nombre", "TBD");
  const visitaName = getEntityString(context.teamsById.get(match.equipoVisitaId), "nombre", "TBD");
  const categoryName =
    getEntityString(context.categoriesById.get(match.categoriaId), "nombre") ||
    getEntityString(match, "grupo", "General");

  return {
    id: getEntityString(match, "id"),
    matchLabel: `${categoryName}: ${localName} vs ${visitaName}`,
    roundLabel: getEntityNumber(match, "ronda", Number.NaN) || "-",
    stateLabel: getEntityString(match, "estado", "pendiente"),
  };
}