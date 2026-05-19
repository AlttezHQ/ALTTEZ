-- ============================================================
-- Migration 016: Registro Público de Plantillas
-- Añade una función RPC para permitir actualizar la plantilla
-- y datos de un equipo sin necesidad de estar autenticado,
-- basándose únicamente en el conocimiento del equipo_id (UUID).
-- ============================================================

CREATE OR REPLACE FUNCTION update_equipo_public(
  p_equipo_id TEXT,
  p_escudo TEXT,
  p_entrenador TEXT,
  p_delegado TEXT,
  p_jugadores JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE torneo_equipos
  SET escudo = COALESCE(p_escudo, escudo),
      entrenador = COALESCE(p_entrenador, entrenador),
      delegado = COALESCE(p_delegado, delegado),
      jugadores = COALESCE(p_jugadores, jugadores)
  WHERE id = p_equipo_id;
END;
$$;
