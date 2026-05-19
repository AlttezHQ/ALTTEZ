import { evaluatePasswordStrength } from "./passwordStrength";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  const value = String(email ?? "").trim();
  if (!value) return "Requerido";
  if (!EMAIL_PATTERN.test(value)) return "Email invalido";
  return null;
}

export function validateLoginForm(form) {
  const errors = {};
  const emailError = validateEmail(form.email);

  if (emailError) errors.email = emailError;
  if (!form.password) errors.password = "Requerido";

  return errors;
}

export function validateRegisterForm(form) {
  const errors = {};
  const passwordStrength = evaluatePasswordStrength(form.password, {
    email: form.email,
    nombre: form.nombre,
  });
  const emailError = validateEmail(form.email);

  if (!String(form.nombre ?? "").trim()) errors.nombre = "Requerido";
  if (emailError) errors.email = emailError;
  if (!form.password) {
    errors.password = "Requerido";
  } else if (!passwordStrength.isStrong) {
    errors.password = "La contrasena debe tener seguridad alta";
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = "Requerido";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Las contrasenas no coinciden";
  }

  return errors;
}
