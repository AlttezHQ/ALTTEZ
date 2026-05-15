/**
 * @module supabase
 * @description Cliente Supabase singleton para ALTTEZ.
 * Lee credenciales de variables de entorno VITE_SUPABASE_*.
 *
 * @author @Data (Mateo-Data_Engine)
 * @version 1.0.0
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Export status
export const isSupabaseReady = !!(supabaseUrl && supabaseKey);

export const supabase = isSupabaseReady
  ? createClient(supabaseUrl, supabaseKey)
  : null;

if (!isSupabaseReady) {
  console.warn("[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — falling back to localStorage if applicable");
}
