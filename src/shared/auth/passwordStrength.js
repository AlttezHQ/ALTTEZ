/**
 * @module passwordStrength
 * @description Evaluador de fortaleza de contraseña compartido entre CRM y Torneos.
 * Exportado desde shared/auth para uso en ambos productos.
 */

const REQUIREMENTS = [
  { key: "minLength", label: "Mínimo 8 caracteres" },
  { key: "lowercase", label: "Una minúscula" },
  { key: "uppercase", label: "Una mayúscula" },
  { key: "number", label: "Un número" },
  { key: "symbol", label: "Un símbolo" },
  { key: "noEmail", label: "No contiene el email" },
  { key: "noName", label: "No contiene el nombre" },
];

const normalize = (value) => String(value ?? "").trim().toLowerCase();

const getNameWords = (name) =>
  normalize(name)
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((word) => word.length >= 3);

export function getPasswordRequirements() {
  return REQUIREMENTS;
}

/**
 * Evalúa la fortaleza de una contraseña.
 * @param {string} password
 * @param {{ email?: string, nombre?: string, name?: string }} context
 * @returns {{ level: string, label: string, checks: Object, passed: number, total: number, isStrong: boolean }}
 */
export function evaluatePasswordStrength(password, context = {}) {
  const value = String(password ?? "");
  const email = normalize(context.email);
  const nameWords = getNameWords(context.nombre ?? context.name ?? "");
  const normalizedPassword = normalize(value);

  const checks = {
    minLength: value.length >= 8,
    lowercase: /[a-z]/.test(value),
    uppercase: /[A-Z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
    noEmail: !email || !normalizedPassword.includes(email),
    noName: !nameWords.some((word) => normalizedPassword.includes(word)),
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const level = passed === REQUIREMENTS.length ? "high" : passed >= 5 ? "medium" : "low";

  return {
    level,
    label: level === "high" ? "Seguridad alta" : level === "medium" ? "Seguridad media" : "Seguridad baja",
    checks,
    passed,
    total: REQUIREMENTS.length,
    isStrong: level === "high",
  };
}
