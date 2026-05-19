/**
 * torneosService.js — CRUD Supabase para el módulo Torneos.
 * Independiente de supabaseService.js del CRM (usa organizador_id, no club_id).
 * Offline-first: si Supabase no está disponible, el store Zustand persiste en localStorage.
 */

import { isSupabaseReady, supabase } from "../../../shared/lib/supabase";

const QUERY_TIMEOUT_MS = 12000;

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
    sede_ubicacion: torneo.sedeUbicacion,
    num_canchas:   torneo.numCanchas,
    duracion_partido: torneo.duracionPartido,
    margen_entre_partidos: torneo.margenEntrePartidos,
    horarios:      torneo.horarios || [],
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

export async function saveEquipoPublic(equipoId, { escudo, entrenador, delegado, jugadores }) {
  if (!isSupabaseReady) return { ok: false };
  
  // Intentamos primero hacer el update directamente (funciona si no hay RLS estricto activo)
  const { error: updateError } = await supabase.from("torneo_equipos").update({
    escudo: escudo || null,
    entrenador: entrenador || null,
    delegado: delegado || null,
    jugadores: jugadores || []
  }).eq("id", equipoId);

  if (!updateError) {
    return { ok: true };
  }

  // Si falla por RLS, intentamos usar el RPC (si el usuario ya corrió la migración 016)
  const { error: rpcError } = await supabase.rpc("update_equipo_public", {
    p_equipo_id: equipoId,
    p_escudo: escudo,
    p_entrenador: entrenador,
    p_delegado: delegado,
    p_jugadores: jugadores
  });
  
  return { ok: !rpcError, error: rpcError || updateError };
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
    eventos: p.eventos ?? [],
  }));
  const { error } = await supabase.from("torneo_partidos").upsert(rows);
  return { ok: !error, error };
}

export async function updateResultado(partidoId, golesLocal, golesVisita, eventos = []) {
  if (!isSupabaseReady) return { ok: false };
  const { error } = await supabase
    .from("torneo_partidos")
    .update({ 
      goles_local: golesLocal, 
      goles_visita: golesVisita, 
      estado: "finalizado",
      eventos 
    })
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
    // Fase de grupos
    groups_count:       c.groupsCount       ?? 2,
    group_legs:         c.groupLegs         ?? 1,
    qualify_per_group:  c.qualifyPerGroup    ?? 2,
    assignment_method:  c.assignmentMethod   ?? "auto_serpentina",
    allow_best_thirds:  c.allowBestThirds    ?? false,
    best_thirds_count:  c.bestThirdsCount    ?? 0,
    // Puntos y desempate
    points_config:      c.pointsConfig       ?? { win: 3, draw: 1, loss: 0 },
    tiebreakers:        c.tiebreakers        ?? ["points","goal_diff","goals_for","h2h","fair_play","draw"],
    // Fase final
    playoff_legs:            c.playoffLegs            ?? 1,
    final_legs:              c.finalLegs              ?? 1,
    initial_knockout_round:  c.initialKnockoutRound   ?? "auto",
    crossing_method:         c.crossingMethod         ?? "auto_position",
    knockout_tiebreak_rule:  c.knockoutTiebreakRule   ?? "penalties",
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
  const { data: { user }, error: userError } = await withTimeout(
    supabase.auth.getUser(),
    "usuario"
  );
  if (userError) throw userError;
  if (!user) return [];

  const { data: torneosRows, error: torneosError } = await withTimeout(
    supabase
      .from("torneos")
      .select("*")
      .eq("organizador_id", user.id),
    "torneos"
  );
  if (torneosError) throw torneosError;

  if (!torneosRows) return [];

  const results = [];
  for (const t of torneosRows) {
    const [
      { data: equiposRows, error: equiposError },
      { data: partidosRows, error: partidosError },
      { data: sedesRows, error: sedesError },
      { data: arbitrosRows, error: arbitrosError },
      { data: categoriasRows, error: categoriasError },
    ] = await Promise.all([
      withTimeout(supabase.from("torneo_equipos").select("*").eq("torneo_id", t.id), `equipos ${t.id}`),
      withTimeout(supabase.from("torneo_partidos").select("*").eq("torneo_id", t.id), `partidos ${t.id}`),
      withTimeout(supabase.from("torneo_sedes").select("*").eq("torneo_id", t.id), `sedes ${t.id}`),
      withTimeout(supabase.from("torneo_arbitros").select("*").eq("torneo_id", t.id), `árbitros ${t.id}`),
      withTimeout(supabase.from("torneo_categorias").select("*").eq("torneo_id", t.id), `categorías ${t.id}`),
    ]);

    if (equiposError) throw equiposError;
    if (partidosError) throw partidosError;
    const sedesMissing = isMissingOptionalTableError(sedesError);
    const arbitrosMissing = isMissingOptionalTableError(arbitrosError);
    const categoriasMissing = isMissingOptionalTableError(categoriasError);

    if (sedesError && !sedesMissing) throw sedesError;
    if (arbitrosError && !arbitrosMissing) throw arbitrosError;
    if (categoriasError && !categoriasMissing) throw categoriasError;

    if (sedesMissing) {
      console.log("[TORNEOS] tabla opcional ausente: torneo_sedes");
    }
    if (arbitrosMissing) {
      console.log("[TORNEOS] tabla opcional ausente: torneo_arbitros");
    }
    if (categoriasMissing) {
      console.log("[TORNEOS] tabla opcional ausente: torneo_categorias");
    }

    results.push({
      torneo: mapTorneo(t),
      equipos: (equiposRows ?? []).map(mapEquipo),
      partidos: (partidosRows ?? []).map(mapPartido),
      sedes: sedesMissing ? [] : (sedesRows ?? []).map(mapSede),
      arbitros: arbitrosMissing ? [] : (arbitrosRows ?? []).map(mapArbitro),
      categorias: categoriasMissing ? [] : (categoriasRows ?? []).map(mapCategoria),
    });
  }
  return results;
}

// ── Mappers (snake_case → camelCase) ─────────────────────────────────────────

function withTimeout(promise, label) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Timeout cargando ${label} de torneos`));
    }, QUERY_TIMEOUT_MS);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

function isMissingOptionalTableError(error) {
  if (!error) return false;
  return error.code === "PGRST205" || /Could not find the table/i.test(error.message || "");
}

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
    sedeUbicacion: r.sede_ubicacion, numCanchas: r.num_canchas,
    duracionPartido: r.duracion_partido, margenEntrePartidos: r.margen_entre_partidos,
    horarios: r.horarios || [],
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
    eventos: r.eventos ?? [],
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
    // Fase de grupos
    groupsCount:      r.groups_count      ?? 2,
    groupLegs:        r.group_legs        ?? 1,
    qualifyPerGroup:  r.qualify_per_group ?? 2,
    assignmentMethod: r.assignment_method ?? "auto_serpentina",
    allowBestThirds:  r.allow_best_thirds ?? false,
    bestThirdsCount:  r.best_thirds_count ?? 0,
    // Puntos y desempate
    pointsConfig: r.points_config ?? { win: 3, draw: 1, loss: 0 },
    tiebreakers:  r.tiebreakers   ?? ["points","goal_diff","goals_for","h2h","fair_play","draw"],
    // Fase final
    playoffLegs:           r.playoff_legs            ?? 1,
    finalLegs:             r.final_legs              ?? 1,
    initialKnockoutRound:  r.initial_knockout_round  ?? "auto",
    crossingMethod:        r.crossing_method         ?? "auto_position",
    knockoutTiebreakRule:  r.knockout_tiebreak_rule  ?? "penalties",
  };
}
