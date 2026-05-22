-- ============================================================
-- Migration 021: Strict public tournament views
-- Public pages must read renderable DTOs only, not raw tables.
-- ============================================================

CREATE TABLE IF NOT EXISTS torneo_sedes (
  id text PRIMARY KEY,
  torneo_id text NOT NULL REFERENCES torneos(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  direccion text
);

CREATE OR REPLACE VIEW vw_torneo_publico_info AS
SELECT
  t.slug,
  t.nombre,
  t.deporte,
  t.temporada,
  t.formato,
  t.estado,
  t.fecha_inicio,
  t.fecha_fin,
  t.sede_principal,
  t.organizador_nombre,
  t.publicado,
  t.descripcion,
  t.portada,
  t.perfil,
  t.contacto,
  t.premios,
  t.patrocinadores,
  t.visibilidad,
  t.reglamento_url
FROM torneos t
WHERE t.publicado = true;

CREATE OR REPLACE VIEW vw_torneo_publico_categorias AS
SELECT
  t.slug,
  c.id AS categoria_id,
  c.nombre,
  c.format
FROM torneos t
JOIN torneo_categorias c ON c.torneo_id = t.id
WHERE t.publicado = true;

CREATE OR REPLACE VIEW vw_torneo_publico_equipos AS
SELECT
  t.slug,
  c.id AS categoria_id,
  c.nombre AS categoria_nombre,
  e.nombre,
  e.escudo,
  e.color,
  e.grupo
FROM torneos t
JOIN torneo_equipos e ON e.torneo_id = t.id
LEFT JOIN torneo_categorias c
  ON c.torneo_id = t.id
  AND c.nombre = e.grupo
WHERE t.publicado = true;

CREATE OR REPLACE VIEW vw_torneo_publico_partidos AS
SELECT
  t.slug,
  p.id AS id_partido,
  c.id AS categoria_id,
  c.nombre AS categoria_nombre,
  p.fase,
  p.ronda,
  p.grupo,
  local.nombre AS equipo_local_nombre,
  visita.nombre AS equipo_visita_nombre,
  COALESCE(s.nombre, p.lugar) AS cancha,
  p.fecha_hora AS hora_inicio,
  p.goles_local,
  p.goles_visita,
  p.estado AS estado_partido,
  p.orden
FROM torneos t
JOIN torneo_partidos p ON p.torneo_id = t.id
LEFT JOIN torneo_equipos local ON local.id = p.equipo_local_id
LEFT JOIN torneo_equipos visita ON visita.id = p.equipo_visita_id
LEFT JOIN torneo_categorias c
  ON c.id = p.categoria_id
  OR (p.categoria_id IS NULL AND c.torneo_id = t.id AND c.nombre = p.grupo)
LEFT JOIN torneo_sedes s ON s.id = p.sede_id
WHERE t.publicado = true;

GRANT SELECT ON vw_torneo_publico_info TO anon, authenticated;
GRANT SELECT ON vw_torneo_publico_categorias TO anon, authenticated;
GRANT SELECT ON vw_torneo_publico_equipos TO anon, authenticated;
GRANT SELECT ON vw_torneo_publico_partidos TO anon, authenticated;
