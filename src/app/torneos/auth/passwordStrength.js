const REQUIREMENTS = [
  { key: "minLength", label: "Minimo 10 caracteres" },
  { key: "lowercase", label: "Una minuscula" },
  { key: "uppercase", label: "Una mayuscula" },
  { key: "number", label: "Un numero" },
  { key: "symbol", label: "Un simbolo" },
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

export function evaluatePasswordStrength(password, context = {}) {
  const value = String(password ?? "");
  const email = normalize(context.email);
  const nameWords = getNameWords(context.nombre ?? context.name);
  const normalizedPassword = normalize(value);

  const checks = {
    minLength: value.length >= 10,
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
