/**
 * torneosService.js — CRUD Supabase para el módulo Torneos.
 * Independiente de supabaseService.js del CRM (usa organizador_id, no club_id).
 * Offline-first: si Supabase no está disponible, el store Zustand persiste en localStorage.
 */

import { isSupabaseReady, supabase } from "../../../shared/lib/supabase";

// ── Torneos ───────────────────────────────────────────────────────────────────

export async function saveTorneo(torneo) {
  if (!isSupabaseReady) return { ok: false };
  const { error } = await supabase.from("torneos").upsert({
    id:           torneo.id,
    nombre:       torneo.nombre,
    deporte:      torneo.deporte,
    formato:      torneo.formato,
    estado:       torneo.estado,
    fecha_inicio: torneo.fechaInicio,
    fecha_fin:    torneo.fechaFin,
    slug:         torneo.slug,
    num_grupos:   torneo.numGrupos,
    publicado:    torneo.publicado,
  });
  return { ok: !error, error };
}

export async function deleteTorneoRemote(id) {
  if (!isSupabaseReady) return { ok: false };
  const { error } = await supabase.from("torneos").delete().eq("id", id);
  return { ok: !error, error };
}

// ── Equipos ───────────────────────────────────────────────────────────────────

export async function saveEquipos(torneoId, equipos) {
  if (!isSupabaseReady) return { ok: false };
  const rows = equipos.map(e => ({
    id: e.id, torneo_id: torneoId,
    nombre: e.nombre, escudo: e.escudo,
    color: e.color, grupo: e.grupo,
  }));
  const { error } = await supabase.from("torneo_equipos").upsert(rows);
  return { ok: !error, error };
}

// ── Partidos ──────────────────────────────────────────────────────────────────

export async function savePartidos(torneoId, partidos) {
  if (!isSupabaseReady) return { ok: false };
  const rows = partidos.map(p => ({
    id: p.id, torneo_id: torneoId,
    fase: p.fase, ronda: p.ronda, grupo: p.grupo,
    equipo_local_id: p.equipoLocalId,
    equipo_visita_id: p.equipoVisitaId,
    goles_local: p.golesLocal,
    goles_visita: p.golesVisita,
    estado: p.estado,
    fecha_hora: p.fechaHora,
    lugar: p.lugar,
    orden: p.orden,
  }));
  const { error } = await supabase.from("torneo_partidos").upsert(rows);
  return { ok: !error, error };
}

export async function updateResultado(partidoId, golesLocal, golesVisita) {
  if (!isSupabaseReady) return { ok: false };
  const { error } = await supabase
    .from("torneo_partidos")
    .update({ goles_local: golesLocal, goles_visita: golesVisita, estado: "finalizado" })
    .eq("id", partidoId);
  return { ok: !error, error };
}

// ── Vista pública — sin auth ───────────────────────────────────────────────────

export async function getTorneoPublico(slug) {
  if (!isSupabaseReady) return null;
  const { data: torneoRow, error: te } = await supabase
    .from("torneos")
    .select("*")
    .eq("slug", slug)
    .eq("publicado", true)
    .single();
  if (te || !torneoRow) return null;

  const { data: equiposRows } = await supabase
    .from("torneo_equipos")
    .select("*")
    .eq("torneo_id", torneoRow.id);

  const { data: partidosRows } = await supabase
    .from("torneo_partidos")
    .select("*")
    .eq("torneo_id", torneoRow.id)
    .order("orden");

  return {
    torneo:   mapTorneo(torneoRow),
    equipos:  (equiposRows ?? []).map(mapEquipo),
    partidos: (partidosRows ?? []).map(mapPartido),
  };
}

// ── Mappers (snake_case → camelCase) ─────────────────────────────────────────

function mapTorneo(r) {
  return {
    id: r.id, nombre: r.nombre, deporte: r.deporte, formato: r.formato,
    estado: r.estado, fechaInicio: r.fecha_inicio, fechaFin: r.fecha_fin,
    slug: r.slug, numGrupos: r.num_grupos, publicado: r.publicado,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function mapEquipo(r) {
  return { id: r.id, torneoId: r.torneo_id, nombre: r.nombre, escudo: r.escudo, color: r.color, grupo: r.grupo, createdAt: r.created_at };
}

function mapPartido(r) {
  return {
    id: r.id, torneoId: r.torneo_id, fase: r.fase, ronda: r.ronda, grupo: r.grupo,
    equipoLocalId: r.equipo_local_id, equipoVisitaId: r.equipo_visita_id,
    golesLocal: r.goles_local, golesVisita: r.goles_visita, estado: r.estado,
    fechaHora: r.fecha_hora, lugar: r.lugar, orden: r.orden, createdAt: r.created_at,
  };
}
