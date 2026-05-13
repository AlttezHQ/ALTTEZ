/**
 * @module authService
 * @description Autenticacion con Supabase Auth para ALTTEZ.
 * Reemplaza el sistema RBAC con checksum por auth real (email/password).
 * El profile (club_id + role) se crea automaticamente via trigger en DB.
 *
 * @author @Data (Mateo-Data_Engine)
 * @version 1.0.0
 */

import { supabase, isSupabaseReady } from "../lib/supabase";

// ── Error handler (inyectado desde App) ──
let _onError = null;
export function setAuthErrorHandler(handler) { _onError = handler; }

function reportError(msg, error) {
  console.error(`[authService] ${msg}`, error?.message || error);
  if (_onError) _onError(msg);
}

// ════════════════════════════════════════════════
// REGISTRO
// ════════════════════════════════════════════════

/**
 * Registra un nuevo usuario con email y password.
 * El trigger en DB crea automaticamente el profile con role y full_name.
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.password
 * @param {string} params.fullName - Nombre del entrenador
 * @param {string} params.role - "admin" | "coach" | "staff"
 * @returns {Promise<{ user: Object|null, error: string|null }>}
 */
export async function signUp({ email, password, fullName, role = "admin" }) {
  if (!isSupabaseReady) return { user: null, session: null, requiresEmailConfirmation: false, error: "Supabase no disponible" };

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) {
      const msg = mapAuthError(error);
      reportError(msg, error);
      return { user: null, session: null, requiresEmailConfirmation: false, error: msg };
    }

    if (Array.isArray(data.user?.identities) && data.user.identities.length === 0) {
      return {
        user: null,
        session: null,
        requiresEmailConfirmation: false,
        error: "Ya existe una cuenta con ese email. Inicia sesión o recupera tu contraseña.",
      };
    }

    return {
      user: data.user,
      session: data.session,
      requiresEmailConfirmation: !data.session,
      error: null,
    };
  } catch (error) {
    reportError("No se pudo conectar con Supabase Auth", error);
    return {
      user: null,
      session: null,
      requiresEmailConfirmation: false,
      error: "No se pudo conectar con Supabase Auth. Revisa Network, CORS, cache o conexión.",
    };
  }
}

// ════════════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════════════

/**
 * Inicia sesion con email y password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: Object|null, session: Object|null, error: string|null }>}
 */
export async function signIn(email, password) {
  if (!isSupabaseReady) return { user: null, session: null, error: "Supabase no disponible" };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const msg = mapAuthError(error);
    reportError(msg, error);
    return { user: null, session: null, error: msg };
  }

  return { user: data.user, session: data.session, error: null };
}

/**
 * Inicia autenticación OAuth con Google.
 * @param {string} redirectTo - URL absoluta autorizada en Supabase.
 * @returns {Promise<{ error: string|null }>}
 */
export async function signInWithGoogle(redirectTo) {
  if (!isSupabaseReady) return { error: "Supabase no disponible" };

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    const msg = mapAuthError(error);
    reportError(msg, error);
    return { error: msg };
  }

  return { error: null };
}

// ════════════════════════════════════════════════
// LOGOUT
// ════════════════════════════════════════════════

/**
 * Cierra sesion del usuario actual.
 * @returns {Promise<boolean>}
 */
export async function signOut() {
  if (!isSupabaseReady) return true;

  const { error } = await supabase.auth.signOut();
  if (error) {
    reportError("Error al cerrar sesion", error);
    return false;
  }
  return true;
}

/**
 * Envía email de recuperación de contraseña.
 * @param {string} email
 * @param {string} redirectTo
 * @returns {Promise<{ error: string|null }>}
 */
export async function resetPasswordForEmail(email, redirectTo) {
  if (!isSupabaseReady) return { error: "Supabase no disponible" };

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    const msg = mapAuthError(error);
    reportError(msg, error);
    return { error: msg };
  }

  return { error: null };
}

/**
 * Actualiza la contraseña del usuario autenticado por flujo de recovery.
 * @param {string} newPassword
 * @returns {Promise<{ error: string|null }>}
 */
export async function updatePassword(newPassword) {
  if (!isSupabaseReady) return { error: "Supabase no disponible" };

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    const msg = mapAuthError(error);
    reportError(msg, error);
    return { error: msg };
  }

  return { error: null };
}

// ════════════════════════════════════════════════
// SESION Y USUARIO
// ════════════════════════════════════════════════

/**
 * Obtiene la sesion actual (null si no hay).
 * @returns {Promise<Object|null>}
 */
export async function getSession() {
  if (!isSupabaseReady) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Obtiene el usuario actual (null si no hay).
 * @returns {Promise<Object|null>}
 */
export async function getUser() {
  if (!isSupabaseReady) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Lee el profile del usuario autenticado (club_id, role, full_name).
 * @returns {Promise<Object|null>}
 */
export async function getProfile() {
  if (!isSupabaseReady) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    reportError("Error leyendo perfil", error);
    return null;
  }
  return data;
}

/**
 * Vincula el profile del usuario con un club (post-registro del club).
 * @param {string} clubId - UUID del club creado
 * @returns {Promise<boolean>}
 */
export async function linkProfileToClub(clubId) {
  if (!isSupabaseReady) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("profiles")
    .update({ club_id: clubId })
    .eq("id", user.id);

  if (error) {
    reportError("Error vinculando perfil al club", error);
    return false;
  }
  return true;
}

// ════════════════════════════════════════════════
// AUTH STATE LISTENER
// ════════════════════════════════════════════════

/**
 * Suscribe a cambios de estado de auth (login, logout, token refresh).
 * @param {Function} callback - (event, session) => void
 * @returns {Object} subscription — llamar .unsubscribe() para limpiar
 */
export function onAuthStateChange(callback) {
  if (!isSupabaseReady) return { unsubscribe: () => {} };

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session);
    }
  );
  return subscription;
}

// ════════════════════════════════════════════════
// ELIMINAR CUENTA
// ════════════════════════════════════════════════

/**
 * Elimina la cuenta del usuario autenticado actual.
 * Llama al RPC delete_user() definido en la DB.
 * @returns {Promise<{ error: string|null }>}
 */
export async function deleteAccount() {
  if (!isSupabaseReady) return { error: "Supabase no disponible" };

  const { error } = await supabase.rpc("delete_user");
  if (error) {
    reportError("Error eliminando cuenta", error);
    return { error: mapAuthError(error) };
  }
  await supabase.auth.signOut();
  return { error: null };
}

// ════════════════════════════════════════════════
// ERROR MAPPING (mensajes en español)
// ════════════════════════════════════════════════

function mapAuthError(error) {
  const code = error?.code || error?.message || "";
  const msg = error?.message || "";

  if (msg.includes("Invalid login credentials")) return "Email o contraseña incorrectos";
  if (msg.includes("Email not confirmed")) return "Confirma tu email antes de iniciar sesion";
  if (msg.includes("User already registered")) return "Ya existe una cuenta con ese email";
  if (msg.includes("Password should be at least")) return "La contraseña debe tener al menos 6 caracteres";
  if (msg.includes("Unable to validate email")) return "El email no es valido";
  if (msg.includes("Email rate limit exceeded")) return "Demasiados intentos. Espera unos minutos";
  if (code === "over_request_rate_limit") return "Demasiadas solicitudes. Intenta en unos minutos";

  return `Error de autenticacion: ${msg}`;
}
