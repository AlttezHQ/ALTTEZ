/**
 * @module supabase
 * @description Cliente Supabase singleton para Elevate Sports.
 * Lee credenciales de variables de entorno VITE_SUPABASE_*.
 *
 * @author @Data (Mateo-Data_Engine)
 * @version 1.0.0
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — falling back to localStorage");
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/** true si Supabase está configurado y disponible */
export const isSupabaseReady = !!supabase;
