/**
 * @file schemas.js
 * @description Comprehensive data schema definitions, validators, and factory
 * functions for all Elevate Sports entities. This is the single source of truth
 * for data structure contracts across the application.
 *
 * @author @Data (Mateo-Data_Engine)
 * @version 1.0.0
 */

// ─────────────────────────────────────────────────────────────
// SCHEMA VERSION — bump on every structural change for migration tracking
// ─────────────────────────────────────────────────────────────

/** @type {string} Semantic version of the data schema */
export const SCHEMA_VERSION = "1.0.0";

// ─────────────────────────────────────────────────────────────
// ENTITY DEFINITIONS
// ─────────────────────────────────────────────────────────────

/**
 * Complete registry of all data entities, their fields, types, constraints,
 * relationships, and localStorage keys.
 *
 * @type {Object.<string, {
 *   storageKey: string,
 *   description: string,
 *   fields: Object.<string, { type: string, required: boolean, description: string, constraints?: string }>,
 *   relationships?: string[]
 * }>}
 */
export const ENTITIES = {
  Athlete: {
    storageKey: "elevate_athletes",
    description: "Jugador registrado en el plantel. Unidad base del sistema.",
    fields: {
      id:        { type: "number",  required: true,  description: "Identificador unico autoincremental",        constraints: "integer > 0, unique" },
      name:      { type: "string",  required: true,  description: "Nombre completo del jugador",                constraints: "non-empty" },
      pos:       { type: "string",  required: true,  description: "Posicion legible (Delantero, Defensa, ...)", constraints: "non-empty" },
      posCode:   { type: "string",  required: true,  description: "Codigo corto de posicion (ST, CM, GK, ...)", constraints: "2-3 chars uppercase" },
      dob:       { type: "string",  required: true,  description: "Fecha de nacimiento ISO (YYYY-MM-DD)",       constraints: "ISO date" },
      contact:   { type: "string",  required: false, description: "Telefono de contacto",                       constraints: "free text" },
      status:    { type: "string",  required: true,  description: "Estado de asistencia actual",                 constraints: "enum: P | A | L" },
      rpe:       { type: "number|null", required: false, description: "Ultimo RPE registrado (1-10)",           constraints: "null | integer 1..10" },
      photo:     { type: "string",  required: false, description: "Slug de foto del jugador",                   constraints: "lowercase slug" },
      available: { type: "boolean", required: true,  description: "Si esta disponible para convocatoria",        constraints: "derived from status !== L && status !== A" },
    },
    relationships: [
      "Pago.athleteId -> Athlete.id (1:N — un jugador tiene N pagos mensuales)",
      "Sesion.presentes se calcula desde athletes con status P",
    ],
  },

  Sesion: {
    storageKey: "elevate_historial",
    description: "Registro historico de una sesion de entrenamiento.",
    fields: {
      num:       { type: "number", required: true,  description: "Numero secuencial de la sesion",              constraints: "integer > 0, unique, autoincrement" },
      fecha:     { type: "string", required: true,  description: "Fecha formateada legible (ej. 'Mar 18 Mar')", constraints: "non-empty" },
      presentes: { type: "number", required: true,  description: "Cantidad de jugadores presentes",             constraints: "integer >= 0" },
      total:     { type: "number", required: true,  description: "Total de jugadores en plantilla",             constraints: "integer >= 0" },
      rpeAvg:    { type: "number|string|null", required: false, description: "RPE promedio de la sesion",       constraints: "null | number 1..10 | string '—'" },
      tipo:      { type: "string", required: true,  description: "Tipo de sesion",                              constraints: "enum: Tactica | Fisico | Recuperacion | Partido | Sesion" },
      nota:      { type: "string", required: false, description: "Nota del entrenador sobre la sesion",         constraints: "free text" },
    },
    relationships: [
      "Sesion se calcula a partir de Athlete[] al momento de guardar",
    ],
  },

  Pago: {
    storageKey: "elevate_finanzas (nested: finanzas.pagos)",
    description: "Registro de pago mensual de un jugador.",
    fields: {
      athleteId: { type: "number", required: true,  description: "FK al jugador",                               constraints: "references Athlete.id" },
      mes:       { type: "string", required: true,  description: "Mes del pago en formato YYYY-MM",             constraints: "regex /^\\d{4}-\\d{2}$/" },
      monto:     { type: "number", required: true,  description: "Monto de la mensualidad en COP",              constraints: "integer > 0" },
      estado:    { type: "string", required: true,  description: "Estado del pago",                              constraints: "enum: pendiente | pagado | parcial" },
      fechaPago: { type: "string|null", required: false, description: "Fecha ISO en que se realizo el pago",    constraints: "null | ISO date YYYY-MM-DD" },
    },
    relationships: [
      "Pago.athleteId -> Athlete.id",
      "Contenido dentro de Finanzas.pagos[]",
    ],
  },

  Movimiento: {
    storageKey: "elevate_finanzas (nested: finanzas.movimientos)",
    description: "Movimiento financiero de ingreso o egreso del club.",
    fields: {
      id:       { type: "number", required: true,  description: "Identificador unico autoincremental",         constraints: "integer > 0, unique" },
      tipo:     { type: "string", required: true,  description: "Tipo de movimiento",                          constraints: "enum: ingreso | egreso" },
      concepto: { type: "string", required: true,  description: "Descripcion del concepto",                    constraints: "non-empty" },
      monto:    { type: "number", required: true,  description: "Monto en COP",                                constraints: "number > 0" },
      fecha:    { type: "string", required: true,  description: "Fecha ISO del movimiento",                    constraints: "ISO date YYYY-MM-DD" },
    },
    relationships: [
      "Contenido dentro de Finanzas.movimientos[]",
    ],
  },

  ClubInfo: {
    storageKey: "elevate_clubInfo",
    description: "Configuracion general del club deportivo.",
    fields: {
      nombre:      { type: "string",   required: true,  description: "Nombre del club",                         constraints: "non-empty" },
      disciplina:  { type: "string",   required: true,  description: "Disciplina deportiva",                    constraints: "non-empty" },
      ciudad:      { type: "string",   required: true,  description: "Ciudad sede del club",                    constraints: "non-empty" },
      entrenador:  { type: "string",   required: true,  description: "Nombre del director tecnico",             constraints: "non-empty" },
      temporada:   { type: "string",   required: true,  description: "Temporada activa (ej. '2025-26')",        constraints: "non-empty" },
      categorias:  { type: "string[]", required: true,  description: "Lista de categorias del club",            constraints: "array with at least 1 element" },
      campos:      { type: "string[]", required: true,  description: "Campos/canchas disponibles",              constraints: "array" },
      descripcion: { type: "string",   required: false, description: "Descripcion del club",                    constraints: "free text" },
      telefono:    { type: "string",   required: false, description: "Telefono del club",                       constraints: "free text" },
      email:       { type: "string",   required: false, description: "Email de contacto",                       constraints: "free text or valid email" },
    },
    relationships: [],
  },

  MatchStats: {
    storageKey: "elevate_matchStats",
    description: "Estadisticas acumuladas de partidos del equipo.",
    fields: {
      played:       { type: "number", required: true, description: "Partidos jugados",    constraints: "integer >= 0" },
      won:          { type: "number", required: true, description: "Partidos ganados",    constraints: "integer >= 0" },
      drawn:        { type: "number", required: true, description: "Partidos empatados",  constraints: "integer >= 0" },
      lost:         { type: "number", required: true, description: "Partidos perdidos",   constraints: "integer >= 0" },
      goalsFor:     { type: "number", required: true, description: "Goles a favor",       constraints: "integer >= 0" },
      goalsAgainst: { type: "number", required: true, description: "Goles en contra",     constraints: "integer >= 0" },
      points:       { type: "number", required: true, description: "Puntos acumulados",   constraints: "integer >= 0" },
    },
    relationships: [],
  },

  Finanzas: {
    storageKey: "elevate_finanzas",
    description: "Contenedor raiz de datos financieros. Agrupa pagos y movimientos.",
    fields: {
      pagos:       { type: "Pago[]",       required: true, description: "Lista de pagos mensuales por jugador", constraints: "array" },
      movimientos: { type: "Movimiento[]", required: true, description: "Lista de movimientos financieros",     constraints: "array" },
    },
    relationships: [
      "Finanzas.pagos[].athleteId -> Athlete.id",
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** ISO date regex: YYYY-MM-DD */
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Year-month regex: YYYY-MM */
const YEAR_MONTH_RE = /^\d{4}-\d{2}$/;

/** Generate a simple unique numeric id based on timestamp + random offset */
const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

// ─────────────────────────────────────────────────────────────
// VALIDATORS
// ─────────────────────────────────────────────────────────────

/**
 * Validates a Pago (payment) record.
 *
 * @param {Object} pago - The payment object to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePago(pago) {
  const errors = [];

  if (pago == null || typeof pago !== "object") {
    return { valid: false, errors: ["pago must be a non-null object"] };
  }

  if (typeof pago.athleteId !== "number" || pago.athleteId <= 0) {
    errors.push("athleteId must be a positive number");
  }

  if (typeof pago.mes !== "string" || !YEAR_MONTH_RE.test(pago.mes)) {
    errors.push("mes must be a string in YYYY-MM format");
  }

  if (typeof pago.monto !== "number" || pago.monto <= 0) {
    errors.push("monto must be a positive number");
  }

  const estadosValidos = ["pendiente", "pagado", "parcial"];
  if (typeof pago.estado !== "string" || !estadosValidos.includes(pago.estado)) {
    errors.push(`estado must be one of: ${estadosValidos.join(", ")}`);
  }

  if (pago.fechaPago !== null && pago.fechaPago !== undefined) {
    if (typeof pago.fechaPago !== "string" || !ISO_DATE_RE.test(pago.fechaPago)) {
      errors.push("fechaPago must be null or a string in YYYY-MM-DD format");
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a Sesion (training session) record.
 *
 * @param {Object} sesion - The session object to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateSesion(sesion) {
  const errors = [];

  if (sesion == null || typeof sesion !== "object") {
    return { valid: false, errors: ["sesion must be a non-null object"] };
  }

  if (typeof sesion.num !== "number" || sesion.num <= 0 || !Number.isInteger(sesion.num)) {
    errors.push("num must be a positive integer");
  }

  if (typeof sesion.fecha !== "string" || sesion.fecha.trim() === "") {
    errors.push("fecha must be a non-empty string");
  }

  if (typeof sesion.presentes !== "number" || sesion.presentes < 0 || !Number.isInteger(sesion.presentes)) {
    errors.push("presentes must be a non-negative integer");
  }

  if (typeof sesion.total !== "number" || sesion.total < 0 || !Number.isInteger(sesion.total)) {
    errors.push("total must be a non-negative integer");
  }

  if (sesion.presentes > sesion.total) {
    errors.push("presentes cannot exceed total");
  }

  if (sesion.rpeAvg !== null && sesion.rpeAvg !== undefined && sesion.rpeAvg !== "\u2014") {
    const rpe = Number(sesion.rpeAvg);
    if (isNaN(rpe) || rpe < 1 || rpe > 10) {
      errors.push("rpeAvg must be null, '\u2014', or a number between 1 and 10");
    }
  }

  const tiposValidos = ["Tactica", "T\u00e1ctica", "Fisico", "F\u00edsico", "Recuperacion", "Recuperaci\u00f3n", "Partido", "Sesion", "Sesi\u00f3n"];
  if (typeof sesion.tipo !== "string" || !tiposValidos.includes(sesion.tipo)) {
    errors.push(`tipo must be one of: ${tiposValidos.join(", ")}`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a Movimiento (financial movement) record.
 *
 * @param {Object} mov - The movement object to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateMovimiento(mov) {
  const errors = [];

  if (mov == null || typeof mov !== "object") {
    return { valid: false, errors: ["movimiento must be a non-null object"] };
  }

  if (typeof mov.id !== "number" || mov.id <= 0) {
    errors.push("id must be a positive number");
  }

  const tiposValidos = ["ingreso", "egreso"];
  if (typeof mov.tipo !== "string" || !tiposValidos.includes(mov.tipo)) {
    errors.push(`tipo must be one of: ${tiposValidos.join(", ")}`);
  }

  if (typeof mov.concepto !== "string" || mov.concepto.trim() === "") {
    errors.push("concepto must be a non-empty string");
  }

  if (typeof mov.monto !== "number" || mov.monto <= 0) {
    errors.push("monto must be a positive number");
  }

  if (typeof mov.fecha !== "string" || !ISO_DATE_RE.test(mov.fecha)) {
    errors.push("fecha must be a string in YYYY-MM-DD format");
  }

  return { valid: errors.length === 0, errors };
}

// ─────────────────────────────────────────────────────────────
// FACTORY FUNCTIONS
// ─────────────────────────────────────────────────────────────

/** Default monthly fee in COP */
const DEFAULT_MONTHLY_FEE = 80000;

/**
 * Creates a properly structured payment record with defaults.
 * Returns null and logs a warning if required fields are missing.
 *
 * @param {number} athleteId - The athlete's unique ID
 * @param {string} mes - The month in YYYY-MM format
 * @param {Object} [overrides] - Optional field overrides
 * @param {number} [overrides.monto] - Custom amount (defaults to 80000)
 * @param {string} [overrides.estado] - Payment status (defaults to "pendiente")
 * @param {string|null} [overrides.fechaPago] - Payment date (defaults to null)
 * @returns {Object|null} The payment record or null if validation fails
 */
export function createPago(athleteId, mes, overrides = {}) {
  if (typeof athleteId !== "number" || athleteId <= 0) {
    console.warn("[schemas.createPago] athleteId must be a positive number. Received:", athleteId);
    return null;
  }

  if (typeof mes !== "string" || !YEAR_MONTH_RE.test(mes)) {
    console.warn("[schemas.createPago] mes must be in YYYY-MM format. Received:", mes);
    return null;
  }

  const pago = {
    athleteId,
    mes,
    monto: overrides.monto ?? DEFAULT_MONTHLY_FEE,
    estado: overrides.estado ?? "pendiente",
    fechaPago: overrides.fechaPago ?? null,
  };

  const validation = validatePago(pago);
  if (!validation.valid) {
    console.warn("[schemas.createPago] Validation failed:", validation.errors);
    return null;
  }

  return pago;
}

/**
 * Creates a properly structured training session record.
 * Returns null and logs a warning if required fields are missing.
 *
 * @param {Object} data - Session data
 * @param {number} data.num - Sequential session number
 * @param {string} [data.fecha] - Formatted date string (auto-generated if omitted)
 * @param {number} data.presentes - Number of present athletes
 * @param {number} data.total - Total athletes in squad
 * @param {number|string|null} [data.rpeAvg] - Average RPE (defaults to null)
 * @param {string} [data.tipo] - Session type (defaults to "Sesion")
 * @param {string} [data.nota] - Coach notes (defaults to "")
 * @returns {Object|null} The session record or null if validation fails
 */
export function createSesion(data = {}) {
  if (typeof data.num !== "number" || data.num <= 0) {
    console.warn("[schemas.createSesion] num must be a positive integer. Received:", data.num);
    return null;
  }

  if (typeof data.presentes !== "number" || typeof data.total !== "number") {
    console.warn("[schemas.createSesion] presentes and total are required numbers.");
    return null;
  }

  // Auto-generate formatted date if not provided
  let fecha = data.fecha;
  if (!fecha) {
    const hoy = new Date();
    const dias = ["Dom", "Lun", "Mar", "Mi\u00e9", "Jue", "Vie", "S\u00e1b"];
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    fecha = `${dias[hoy.getDay()]} ${hoy.getDate()} ${meses[hoy.getMonth()]}`;
  }

  const sesion = {
    num: data.num,
    fecha,
    presentes: data.presentes,
    total: data.total,
    rpeAvg: data.rpeAvg ?? null,
    tipo: data.tipo || "Sesi\u00f3n",
    nota: data.nota || "",
  };

  const validation = validateSesion(sesion);
  if (!validation.valid) {
    console.warn("[schemas.createSesion] Validation failed:", validation.errors);
    return null;
  }

  return sesion;
}

/**
 * Creates a properly structured financial movement record.
 * Returns null and logs a warning if required fields are missing.
 *
 * @param {Object} data - Movement data
 * @param {number} [data.id] - Unique ID (auto-generated if omitted)
 * @param {string} data.tipo - "ingreso" or "egreso"
 * @param {string} data.concepto - Description of the movement
 * @param {number} data.monto - Amount in COP
 * @param {string} [data.fecha] - ISO date (defaults to today)
 * @returns {Object|null} The movement record or null if validation fails
 */
export function createMovimiento(data = {}) {
  if (typeof data.tipo !== "string" || !["ingreso", "egreso"].includes(data.tipo)) {
    console.warn("[schemas.createMovimiento] tipo must be 'ingreso' or 'egreso'. Received:", data.tipo);
    return null;
  }

  if (typeof data.concepto !== "string" || data.concepto.trim() === "") {
    console.warn("[schemas.createMovimiento] concepto must be a non-empty string.");
    return null;
  }

  if (typeof data.monto !== "number" || data.monto <= 0) {
    console.warn("[schemas.createMovimiento] monto must be a positive number. Received:", data.monto);
    return null;
  }

  const mov = {
    id: data.id ?? generateId(),
    tipo: data.tipo,
    concepto: data.concepto.trim(),
    monto: data.monto,
    fecha: data.fecha || new Date().toISOString().slice(0, 10),
  };

  const validation = validateMovimiento(mov);
  if (!validation.valid) {
    console.warn("[schemas.createMovimiento] Validation failed:", validation.errors);
    return null;
  }

  return mov;
}
