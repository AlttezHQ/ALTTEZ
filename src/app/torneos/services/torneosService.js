/**
 * torneosService.js — CRUD Supabase para el módulo Torneos.
 * Independiente de supabaseService.js del CRM (usa organizador_id, no club_id).
 * Offline-first: si Supabase no está disponible, el store Zustand persiste en localStorage.
 */

import { isSupabaseReady, supabase } from "../../../shared/lib/supabase";

// ── Torneos ───────────────────────────────────────────────────────────────────

export async function saveTorneo(torneo) {
  if (!isSupabaseReady) return { ok: false };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No authenticated user" };

  const { error } = await supabase.from("torneos").upsert({
    id:           torneo.id,
    organizador_id: user.id,
    nombre:       torneo.nombre,
    deporte:      torneo.deporte,
    temporada:    torneo.temporada,
    formato:      torneo.formato,
    estado:       torneo.estado,
    fecha_inicio: torneo.fechaInicio,
    fecha_fin:    torneo.fechaFin,
    sede_principal: torneo.sedePrincipal,
    organizador_nombre: torneo.organizador,
    slug:         torneo.slug,
    num_grupos:   torneo.numGrupos,
    publicado:    torneo.publicado,
    descripcion:  torneo.descripcion,
    portada:      torneo.portada,
    perfil:       torneo.perfil,
    contacto:     torneo.contacto,
    premios:      torneo.premios,
    patrocinadores: torneo.patrocinadores,
    visibilidad:  torneo.visibilidad,
    reglamento_url: torneo.reglamentoUrl,
    updated_at:   new Date().toISOString(),
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
  if (!isSupabaseReady) return { ok: false, error: { message: "Supabase not configured" } };
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No authenticated user" };
  
  const rows = equipos.map(e => ({
    id: e.id,
    torneo_id: torneoId,
    user_id: user.id,
    organizador_id: user.id,
    nombre: e.nombre,
    escudo: e.logo || e.escudo || null,
    color: e.color || null,
    grupo: e.grupo || null,
    entrenador: e.entrenador || null,
    delegado: e.delegado || null,
    jugadores: Array.isArray(e.jugadores) ? e.jugadores : [],
  }));

  console.log("[svc] saveEquipos attempt:", rows);
  const { data, error } = await supabase.from("torneo_equipos").upsert(rows);
  
  if (error) {
    console.error("[svc] saveEquipos error:", error);
    return { ok: false, error };
  }
  
  return { ok: true, data };
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
    sede_id: p.sedeId,
    arbitro_id: p.arbitroId,
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

// ── Sedes ───────────────────────────────────────────────────────────────────

export async function saveSedes(torneoId, sedes) {
  if (!isSupabaseReady) return { ok: false };
  const rows = sedes.map(s => ({
    id: s.id, torneo_id: torneoId,
    nombre: s.nombre, direccion: s.direccion
  }));
  const { error } = await supabase.from("torneo_sedes").upsert(rows);
  return { ok: !error, error };
}

export async function deleteSedeRemote(id) {
  if (!isSupabaseReady) return { ok: false };
  const { error } = await supabase.from("torneo_sedes").delete().eq("id", id);
  return { ok: !error, error };
}

// ── Árbitros ──────────────────────────────────────────────────────────────────

export async function saveArbitros(torneoId, arbitros) {
  if (!isSupabaseReady) return { ok: false };
  const rows = arbitros.map(a => ({
    id: a.id, torneo_id: torneoId,
    nombre: a.nombre, contacto: a.contacto
  }));
  const { error } = await supabase.from("torneo_arbitros").upsert(rows);
  return { ok: !error, error };
}

export async function deleteArbitroRemote(id) {
  if (!isSupabaseReady) return { ok: false };
  const { error } = await supabase.from("torneo_arbitros").delete().eq("id", id);
  return { ok: !error, error };
}


export async function deleteEquipoRemote(id) {
  if (!isSupabaseReady) return { ok: false };
  const { error } = await supabase.from("torneo_equipos").delete().eq("id", id);
  return { ok: !error, error };
}

// ── Categorías ─────────────────────────────────────────────────────────────

export async function saveCategorias(torneoId, categorias) {
  if (!isSupabaseReady) return { ok: false };
  const rows = categorias.map(c => ({
    id: c.id,
    torneo_id: torneoId,
    nombre: c.nombre,
    teams: c.teams,
    format: c.format,
    fases: c.fases,
    vueltas: c.vueltas,
    grupos: c.grupos,
    tpg: c.tpg,
    cpg: c.cpg,
    fase_final: c.faseFinal,
    desempate: c.desempate,
  }));
  const { error } = await supabase.from("torneo_categorias").upsert(rows);
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

export async function fetchAllTorneos() {
  if (!isSupabaseReady) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: torneosRows } = await supabase
    .from("torneos")
    .select("*")
    .eq("organizador_id", user.id);

  if (!torneosRows) return [];

  const results = [];
  for (const t of torneosRows) {
    const { data: equiposRows } = await supabase.from("torneo_equipos").select("*").eq("torneo_id", t.id);
    const { data: partidosRows } = await supabase.from("torneo_partidos").select("*").eq("torneo_id", t.id);
    const { data: sedesRows } = await supabase.from("torneo_sedes").select("*").eq("torneo_id", t.id);
    const { data: arbitrosRows } = await supabase.from("torneo_arbitros").select("*").eq("torneo_id", t.id);
    const { data: categoriasRows } = await supabase.from("torneo_categorias").select("*").eq("torneo_id", t.id).catch(() => ({ data: [] }));

    results.push({
      torneo: mapTorneo(t),
      equipos: (equiposRows ?? []).map(mapEquipo),
      partidos: (partidosRows ?? []).map(mapPartido),
      sedes: (sedesRows ?? []).map(mapSede),
      arbitros: (arbitrosRows ?? []).map(mapArbitro),
      categorias: (categoriasRows ?? []).map(mapCategoria),
    });
  }
  return results;
}

// ── Mappers (snake_case → camelCase) ─────────────────────────────────────────

function mapTorneo(r) {
  return {
    id: r.id, nombre: r.nombre, deporte: r.deporte, temporada: r.temporada,
    formato: r.formato, estado: r.estado, fechaInicio: r.fecha_inicio,
    fechaFin: r.fecha_fin, sedePrincipal: r.sede_principal,
    organizador: r.organizador_nombre,
    slug: r.slug, numGrupos: r.num_grupos, publicado: r.publicado,
    descripcion: r.descripcion, portada: r.portada, perfil: r.perfil,
    contacto: r.contacto, premios: r.premios, patrocinadores: r.patrocinadores,
    visibilidad: r.visibilidad, reglamentoUrl: r.reglamento_url,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function mapEquipo(r) {
  return { 
    id: r.id, torneoId: r.torneo_id, nombre: r.nombre, 
    logo: r.escudo, escudo: r.escudo, color: r.color, grupo: r.grupo, 
    entrenador: r.entrenador, delegado: r.delegado, jugadores: r.jugadores ?? [],
    createdAt: r.created_at 
  };
}

function mapPartido(r) {
  return {
    id: r.id, torneoId: r.torneo_id, fase: r.fase, ronda: r.ronda, grupo: r.grupo,
    equipoLocalId: r.equipo_local_id, equipoVisitaId: r.equipo_visita_id,
    golesLocal: r.goles_local, golesVisita: r.goles_visita, estado: r.estado,
    fechaHora: r.fecha_hora, lugar: r.lugar, orden: r.orden,
    sedeId: r.sede_id, arbitroId: r.arbitro_id,
    createdAt: r.created_at,
  };
}

function mapSede(r) {
  return { id: r.id, torneoId: r.torneo_id, nombre: r.nombre, direccion: r.direccion };
}

function mapArbitro(r) {
  return { id: r.id, torneoId: r.torneo_id, nombre: r.nombre, contacto: r.contacto };
}

function mapCategoria(r) {
  return {
    id: r.id, torneoId: r.torneo_id, nombre: r.nombre, teams: r.teams,
    format: r.format, fases: r.fases, vueltas: r.vueltas,
    grupos: r.grupos, tpg: r.tpg, cpg: r.cpg,
    faseFinal: r.fase_final, desempate: r.desempate,
  };
}
