/**
 * @module supabase
 * @description Cliente Supabase singleton para ALTTEZ.
 * Lee credenciales de variables de entorno VITE_SUPABASE_*.
 *
 * @author @Data (Mateo-Data_Engine)
 * @version 1.1.0
 * @changelog
 *  v1.1 — Agrega `getStoredSession()` para lectura sincrona del token
 *          persistido, permitiendo que AuthProvider arranque sin loadingAuth=true
 *          cuando ya existe una sesion guardada.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Export status
export const isSupabaseReady = !!(supabaseUrl && supabaseKey);

export const supabase = isSupabaseReady
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Lee el token/session guardado por Supabase en localStorage de forma sincrona.
 * Util para evitar que el AuthProvider arranque siempre con loadingAuth=true.
 * Retorna el objeto de user si existe y no ha expirado, o null en caso contrario.
 */
export function getStoredSession() {
  if (!isSupabaseReady) return null;
  try {
    // Supabase v2 guarda la sesion bajo "sb-<project>-auth-token"
    // La clave exacta puede variar, buscamos la primera que coincida.
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const session = parsed?.session ?? parsed;
        if (!session?.access_token) continue;
        // Verificar que no haya expirado (expires_at es epoch en segundos)
        const expiresAt = session.expires_at ?? 0;
        if (expiresAt && Date.now() / 1000 < expiresAt) {
          return session.user ?? null;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

if (!isSupabaseReady) {
  console.warn("[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — falling back to localStorage if applicable");
}
