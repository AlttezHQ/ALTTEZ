/**
 * @module useSupabaseSync
 * @description Hook que sincroniza estado React con Supabase + localStorage.
 * Patrón write-through: localStorage como cache rápido, Supabase como fuente de verdad.
 * Si Supabase no está disponible, funciona solo con localStorage (offline-first).
 *
 * @author @Data (Mateo-Data_Engine)
 * @version 1.0.0
 */

import { useCallback, useEffect, useRef } from "react";
import { isSupabaseReady } from "../lib/supabase";
import * as sb from "../services/supabaseService";

import { useStore } from "../store/useStore";

/**
 * Hook que sincroniza datos desde Supabase al montar el componente.
 * Usa localStorage como cache; sobrescribe con datos de Supabase si disponible.
 */
export default function useSupabaseSync() {
  const setAthletes = useStore(state => state.setAthletes);
  const setHistorial = useStore(state => state.setHistorial);
  const setClubInfo = useStore(state => state.setClubInfo);
  const setMatchStats = useStore(state => state.setMatchStats);
  const setFinanzas = useStore(state => state.setFinanzas);
  const mode = useStore(state => state.mode);

  const synced = useRef(false);

  useEffect(() => {
    if (!isSupabaseReady || !mode || synced.current) return;
    synced.current = true;

    const clubId = sb.getClubId();
    if (!clubId) return;

    // Cargar datos desde Supabase (async, no bloquea render)
    (async () => {
      try {
        const [athletes, sessions, club, matchStats, payments, movements] = await Promise.all([
          sb.getAthletes(),
          sb.getSessions(),
          sb.getClub(),
          sb.getMatchStats(),
          sb.getPayments(),
          sb.getMovements(),
        ]);

        if (athletes) setAthletes(athletes);
        if (sessions) setHistorial(sessions);
        if (club) {
          setClubInfo({
            nombre: club.nombre,
            disciplina: club.disciplina,
            ciudad: club.ciudad,
            entrenador: club.entrenador,
            temporada: club.temporada,
            categorias: club.categorias || [],
            campos: club.campos || [],
            descripcion: club.descripcion || "",
            telefono: club.telefono || "",
            email: club.email || "",
          });
        }
        if (matchStats) setMatchStats(matchStats);
        if (payments || movements) {
          setFinanzas({
            pagos: payments || [],
            movimientos: movements || [],
          });
        }
      } catch (err) {
        console.error("[useSupabaseSync] Error loading from Supabase:", err.message);
        // localStorage data is already loaded — no action needed
      }
    })();
  }, [mode, setAthletes, setHistorial, setClubInfo, setMatchStats, setFinanzas]);

  // ── Write-through helpers ──

  /** Guarda sesión a Supabase (fire-and-forget, localStorage ya tiene los datos) */
  const syncSession = useCallback(async (sesion) => {
    if (!isSupabaseReady || !sb.getClubId()) return;
    await sb.insertSession(sesion);
  }, []);

  /** Sincroniza atletas a Supabase */
  const syncAthletes = useCallback(async (athletes) => {
    if (!isSupabaseReady || !sb.getClubId()) return;
    await sb.updateAthletes(athletes);
  }, []);

  /** Sincroniza health snapshots a Supabase */
  const syncHealthSnapshots = useCallback(async (snapshots) => {
    if (!isSupabaseReady || !sb.getClubId()) return;
    await sb.insertHealthSnapshots(snapshots);
  }, []);

  /** Sincroniza un movimiento financiero */
  const syncMovement = useCallback(async (mov) => {
    if (!isSupabaseReady || !sb.getClubId()) return;
    await sb.insertMovement(mov);
  }, []);

  /** Sincroniza un pago */
  const syncPayment = useCallback(async (pago) => {
    if (!isSupabaseReady || !sb.getClubId()) return;
    await sb.upsertPayment(pago);
  }, []);

  return {
    syncSession,
    syncAthletes,
    syncHealthSnapshots,
    syncMovement,
    syncPayment,
    isCloudReady: isSupabaseReady && !!sb.getClubId(),
  };
}
