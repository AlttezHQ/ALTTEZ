/**
 * @module authValidation
 * @description Validaciones centralizadas de autenticación para ALTTEZ.
 * Compartido por CRM y Torneos — una sola fuente de reglas.
 *
 * Política:
 *  - Email: trim + lowercase + sanitize + regex
 *  - Password: mínimo 8 caracteres
 *  - Campos requeridos: varían según producto (CRM vs Torneos)
 *  - Mensajes: español consistente
 *
 * @version 1.0.0
 */

import { sanitizeEmail, sanitizeTextFinal } from "../utils/sanitize";

// ── Constantes ────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Campos requeridos según producto/source.
 * CRM necesita más datos porque registra un club completo.
 * Torneos solo necesita nombre de organizador + ciudad.
 */
const REQUIRED_FIELDS = {
  crm:     ["nombre", "ciudad", "entrenador", "categorias"],
  torneos: ["nombre", "ciudad"],
};

// ── Normalización ─────────────────────────────────────────────────────────────

/**
 * Normaliza un email para uso en autenticación.
 * @param {string} raw - Email crudo del input
 * @returns {string} Email limpio (lowercase, trim, sin HTML)
 */
export function normalizeEmail(raw) {
  if (typeof raw !== "string") return "";
  return sanitizeEmail(raw);
}

// ── Validación de Login ───────────────────────────────────────────────────────

/**
 * Valida formulario de login.
 * @param {{ email: string, password: string }} form
 * @returns {{ errors: Object, cleanData: { email: string, password: string } | null }}
 */
export function validateLoginForm(form) {
  const errors = {};
  const cleanEmail = normalizeEmail(form.email);

  if (!cleanEmail || !EMAIL_RE.test(cleanEmail)) {
    errors.email = "Email obligatorio y válido";
  }
  if (!form.password) {
    errors.password = "Ingresa tu contraseña";
  }

  const hasErrors = Object.keys(errors).length > 0;
  return {
    errors,
    cleanData: hasErrors ? null : { email: cleanEmail, password: form.password },
  };
}

// ── Validación de Registro ────────────────────────────────────────────────────

/**
 * Valida formulario de registro.
 * @param {Object} form - Datos del formulario
 * @param {string} source - "crm" | "torneos"
 * @param {{ consentData: boolean, consentGuardian: boolean }} consents
 * @returns {{ errors: Object, cleanData: Object | null }}
 */
export function validateRegisterForm(form, source = "universal", { consentData, consentGuardian } = {}) {
  const errors = {};

  if (!form.nombre?.trim()) {
    errors.nombre = "El nombre es obligatorio.";
  }

  const cleanEmail = String(form.email || "").trim().toLowerCase();
  if (!cleanEmail) {
    errors.email = "El email es obligatorio.";
  } else if (!EMAIL_RE.test(cleanEmail)) {
    errors.email = "Ingresa un email válido.";
  }

  const cleanPassword = String(form.password || "");
  if (!cleanPassword) {
    errors.password = "La contraseña es obligatoria.";
  } else if (cleanPassword.length < MIN_PASSWORD_LENGTH) {
    errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  if (cleanPassword !== String(form.confirmPassword || "")) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  if (source === "universal") {
    if (!consentData) {
      errors.consentData = "Debes aceptar la política de privacidad.";
    }
  } else if (source === "torneos") {
    if (!form.ciudad?.trim()) errors.ciudad = "La ciudad es obligatoria.";
    if (!consentData) {
      errors.consentData = "Debes aceptar la política de privacidad.";
    }
  } else if (source === "crm") {
    if (!form.ciudad?.trim()) errors.ciudad = "La ciudad es obligatoria.";
    if (!form.entrenador?.trim()) errors.entrenador = "El nombre del director técnico es obligatorio.";
    if (!form.categorias?.trim()) errors.categorias = "Debes especificar al menos una categoría.";
    if (!consentData) {
      errors.consentData = "Debes aceptar la política de privacidad.";
    }
    if (!consentGuardian) {
      errors.consentGuardian = "Debes confirmar la autorización de datos de menores.";
    }
  }

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    cleanData: hasErrors ? null : {
      ...form,
      nombre: sanitizeTextFinal(form.nombre),
      ciudad: sanitizeTextFinal(form.ciudad),
      entrenador: sanitizeTextFinal(form.entrenador || ""),
      categorias: sanitizeTextFinal(form.categorias || ""),
      campo: sanitizeTextFinal(form.campo || ""),
      email: cleanEmail,
      password: form.password,
    },
  };
}

/**
 * Valida formulario de registro simplificado de Torneos (inline en TorneosApp).
 * Solo requiere nombre + email + password.
 * @param {{ nombre: string, email: string, password: string }} form
 * @returns {{ errors: Object, cleanData: Object | null }}
 */
export function validateTorneosInlineRegister(form) {
  const errors = {};

  if (!form.nombre || !form.nombre.trim()) {
    errors.nombre = "Requerido";
  }

  const cleanEmail = normalizeEmail(form.email);
  if (!cleanEmail || !EMAIL_RE.test(cleanEmail)) {
    errors.email = "Requerido";
  }

  if (!form.password || form.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`;
  }

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    cleanData: hasErrors ? null : {
      nombre: sanitizeTextFinal(form.nombre),
      email: cleanEmail,
      password: form.password,
    },
  };
}

/**
 * Valida login inline de Torneos (solo email + password, sin sanitizeEmail del LandingPage).
 * @param {{ email: string, password: string }} form
 * @returns {{ errors: Object, cleanData: { email: string, password: string } | null }}
 */
export function validateTorneosInlineLogin(form) {
  const errors = {};
  const cleanEmail = normalizeEmail(form.email);

  if (!cleanEmail) {
    errors.email = "Requerido";
  }
  if (!form.password) {
    errors.password = "Requerido";
  }

  const hasErrors = Object.keys(errors).length > 0;
  return {
    errors,
    cleanData: hasErrors ? null : { email: cleanEmail, password: form.password },
  };
}
