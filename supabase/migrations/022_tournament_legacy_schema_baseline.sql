-- ============================================================
-- Migration 022: Tournament legacy schema baseline
-- Normalizes the legacy tournament tables into the official
-- migration history so a clean bootstrap no longer depends on
-- the orphan root-level script `supabase_torneos_migration.sql`.
-- ============================================================

CREATE TABLE IF NOT EXISTS torneos (
  id text PRIMARY KEY,
  organizador_id text NOT NULL,
  nombre text NOT NULL,
  deporte text DEFAULT 'Futbol',
  temporada text DEFAULT '',
  formato text DEFAULT 'todos_contra_todos',
  estado text DEFAULT 'borrador',
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  sede_principal text,
  organizador_nombre text,
  slug text UNIQUE,
  num_grupos integer DEFAULT 2,
  publicado boolean NOT NULL DEFAULT false,
  descripcion text,
  portada text,
  perfil text,
  contacto text,
  premios text,
  patrocinadores jsonb NOT NULL DEFAULT '[]'::jsonb,
  visibilidad text DEFAULT 'publico',
  reglamento_url text,
  sede_ubicacion text,
  num_canchas integer,
  duracion_partido integer,
  margen_entre_partidos integer,
  horarios jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE torneos
  ADD COLUMN IF NOT EXISTS organizador_id text,
  ADD COLUMN IF NOT EXISTS nombre text,
  ADD COLUMN IF NOT EXISTS deporte text DEFAULT 'Futbol',
  ADD COLUMN IF NOT EXISTS temporada text DEFAULT '',
  ADD COLUMN IF NOT EXISTS formato text DEFAULT 'todos_contra_todos',
  ADD COLUMN IF NOT EXISTS estado text DEFAULT 'borrador',
  ADD COLUMN IF NOT EXISTS fecha_inicio timestamptz,
  ADD COLUMN IF NOT EXISTS fecha_fin timestamptz,
  ADD COLUMN IF NOT EXISTS sede_principal text,
  ADD COLUMN IF NOT EXISTS organizador_nombre text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS num_grupos integer DEFAULT 2,
  ADD COLUMN IF NOT EXISTS publicado boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS descripcion text,
  ADD COLUMN IF NOT EXISTS portada text,
  ADD COLUMN IF NOT EXISTS perfil text,
  ADD COLUMN IF NOT EXISTS contacto text,
  ADD COLUMN IF NOT EXISTS premios text,
  ADD COLUMN IF NOT EXISTS patrocinadores jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS visibilidad text DEFAULT 'publico',
  ADD COLUMN IF NOT EXISTS reglamento_url text,
  ADD COLUMN IF NOT EXISTS sede_ubicacion text,
  ADD COLUMN IF NOT EXISTS num_canchas integer,
  ADD COLUMN IF NOT EXISTS duracion_partido integer,
  ADD COLUMN IF NOT EXISTS margen_entre_partidos integer,
  ADD COLUMN IF NOT EXISTS horarios jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_torneos_slug ON torneos (slug);
CREATE INDEX IF NOT EXISTS idx_torneos_organizador ON torneos (organizador_id);

CREATE TABLE IF NOT EXISTS torneo_categorias (
  id text PRIMARY KEY,
  torneo_id text NOT NULL REFERENCES torneos(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  teams integer DEFAULT 0,
  format text DEFAULT 'todos_contra_todos',
  fases text DEFAULT 'ida',
  vueltas integer DEFAULT 1,
  grupos integer DEFAULT 2,
  tpg integer DEFAULT 4,
  cpg integer DEFAULT 2,
  fase_final text DEFAULT 'final',
  desempate text DEFAULT 'goal_diff',
  groups_count integer DEFAULT 2,
  group_legs integer DEFAULT 1,
  qualify_per_group integer DEFAULT 2,
  assignment_method text DEFAULT 'auto_serpentina',
  allow_best_thirds boolean DEFAULT false,
  best_thirds_count integer DEFAULT 0,
  points_config jsonb DEFAULT '{"win":3,"draw":1,"loss":0}'::jsonb,
  tiebreakers jsonb DEFAULT '["points","goal_diff","goals_for","h2h","fair_play","draw"]'::jsonb,
  playoff_legs integer DEFAULT 1,
  final_legs integer DEFAULT 1,
  initial_knockout_round text DEFAULT 'auto',
  crossing_method text DEFAULT 'auto_position',
  knockout_tiebreak_rule text DEFAULT 'penalties',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE torneo_categorias
  ADD COLUMN IF NOT EXISTS teams integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS format text DEFAULT 'todos_contra_todos',
  ADD COLUMN IF NOT EXISTS fases text DEFAULT 'ida',
  ADD COLUMN IF NOT EXISTS vueltas integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS grupos integer DEFAULT 2,
  ADD COLUMN IF NOT EXISTS tpg integer DEFAULT 4,
  ADD COLUMN IF NOT EXISTS cpg integer DEFAULT 2,
  ADD COLUMN IF NOT EXISTS fase_final text DEFAULT 'final',
  ADD COLUMN IF NOT EXISTS desempate text DEFAULT 'goal_diff',
  ADD COLUMN IF NOT EXISTS groups_count integer DEFAULT 2,
  ADD COLUMN IF NOT EXISTS group_legs integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS qualify_per_group integer DEFAULT 2,
  ADD COLUMN IF NOT EXISTS assignment_method text DEFAULT 'auto_serpentina',
  ADD COLUMN IF NOT EXISTS allow_best_thirds boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS best_thirds_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS points_config jsonb DEFAULT '{"win":3,"draw":1,"loss":0}'::jsonb,
  ADD COLUMN IF NOT EXISTS tiebreakers jsonb DEFAULT '["points","goal_diff","goals_for","h2h","fair_play","draw"]'::jsonb,
  ADD COLUMN IF NOT EXISTS playoff_legs integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS final_legs integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS initial_knockout_round text DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS crossing_method text DEFAULT 'auto_position',
  ADD COLUMN IF NOT EXISTS knockout_tiebreak_rule text DEFAULT 'penalties',
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_torneo_categorias_torneo ON torneo_categorias (torneo_id);

CREATE TABLE IF NOT EXISTS torneo_equipos (
  id text PRIMARY KEY,
  torneo_id text NOT NULL REFERENCES torneos(id) ON DELETE CASCADE,
  user_id text,
  nombre text NOT NULL,
  escudo text,
  color text,
  grupo text,
  entrenador text,
  delegado text,
  jugadores jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE torneo_equipos
  ADD COLUMN IF NOT EXISTS user_id text,
  ADD COLUMN IF NOT EXISTS escudo text,
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS grupo text,
  ADD COLUMN IF NOT EXISTS entrenador text,
  ADD COLUMN IF NOT EXISTS delegado text,
  ADD COLUMN IF NOT EXISTS jugadores jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_torneo_equipos_torneo ON torneo_equipos (torneo_id);

CREATE TABLE IF NOT EXISTS torneo_partidos (
  id text PRIMARY KEY,
  torneo_id text NOT NULL REFERENCES torneos(id) ON DELETE CASCADE,
  fase text,
  ronda integer,
  grupo text,
  categoria_id text,
  equipo_local_id text REFERENCES torneo_equipos(id) ON DELETE SET NULL,
  equipo_visita_id text REFERENCES torneo_equipos(id) ON DELETE SET NULL,
  goles_local integer,
  goles_visita integer,
  estado text DEFAULT 'propuesto',
  fecha_hora timestamptz,
  lugar text,
  orden integer DEFAULT 0,
  sede_id text,
  arbitro_id text,
  leg_number integer DEFAULT 1,
  source text DEFAULT 'group',
  next_match_id text,
  eventos jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE torneo_partidos
  ADD COLUMN IF NOT EXISTS fase text,
  ADD COLUMN IF NOT EXISTS ronda integer,
  ADD COLUMN IF NOT EXISTS grupo text,
  ADD COLUMN IF NOT EXISTS categoria_id text,
  ADD COLUMN IF NOT EXISTS equipo_local_id text,
  ADD COLUMN IF NOT EXISTS equipo_visita_id text,
  ADD COLUMN IF NOT EXISTS goles_local integer,
  ADD COLUMN IF NOT EXISTS goles_visita integer,
  ADD COLUMN IF NOT EXISTS estado text DEFAULT 'propuesto',
  ADD COLUMN IF NOT EXISTS fecha_hora timestamptz,
  ADD COLUMN IF NOT EXISTS lugar text,
  ADD COLUMN IF NOT EXISTS orden integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sede_id text,
  ADD COLUMN IF NOT EXISTS arbitro_id text,
  ADD COLUMN IF NOT EXISTS leg_number integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'group',
  ADD COLUMN IF NOT EXISTS next_match_id text,
  ADD COLUMN IF NOT EXISTS eventos jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'torneo_partidos_categoria_id_fkey'
  ) THEN
    ALTER TABLE torneo_partidos
      ADD CONSTRAINT torneo_partidos_categoria_id_fkey
      FOREIGN KEY (categoria_id) REFERENCES torneo_categorias(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_torneo_partidos_torneo ON torneo_partidos (torneo_id);
CREATE INDEX IF NOT EXISTS idx_torneo_partidos_fecha ON torneo_partidos (torneo_id, fecha_hora);

CREATE TABLE IF NOT EXISTS torneo_sedes (
  id text PRIMARY KEY,
  torneo_id text NOT NULL REFERENCES torneos(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  direccion text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS torneo_arbitros (
  id text PRIMARY KEY,
  torneo_id text NOT NULL REFERENCES torneos(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  contacto text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE torneo_sedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE torneo_arbitros ENABLE ROW LEVEL SECURITY;
ALTER TABLE torneo_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE torneo_equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE torneo_partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE torneos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for torneos" ON torneos;
CREATE POLICY "Public read access for torneos"
  ON torneos FOR SELECT
  USING (publicado = true);

DROP POLICY IF EXISTS "Users can manage their own torneos" ON torneos;
CREATE POLICY "Users can manage their own torneos"
  ON torneos FOR ALL
  USING (organizador_id::text = auth.uid()::text)
  WITH CHECK (organizador_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Public read access for torneo_categorias" ON torneo_categorias;
CREATE POLICY "Public read access for torneo_categorias"
  ON torneo_categorias FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own tournament categories" ON torneo_categorias;
CREATE POLICY "Users can manage their own tournament categories"
  ON torneo_categorias FOR ALL
  USING (torneo_id::text IN (SELECT id::text FROM torneos WHERE organizador_id::text = auth.uid()::text))
  WITH CHECK (torneo_id::text IN (SELECT id::text FROM torneos WHERE organizador_id::text = auth.uid()::text));

DROP POLICY IF EXISTS "Public read access for torneo_equipos" ON torneo_equipos;
CREATE POLICY "Public read access for torneo_equipos"
  ON torneo_equipos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own tournament teams" ON torneo_equipos;
CREATE POLICY "Users can manage their own tournament teams"
  ON torneo_equipos FOR ALL
  USING (torneo_id::text IN (SELECT id::text FROM torneos WHERE organizador_id::text = auth.uid()::text))
  WITH CHECK (torneo_id::text IN (SELECT id::text FROM torneos WHERE organizador_id::text = auth.uid()::text));

DROP POLICY IF EXISTS "Public read access for torneo_partidos" ON torneo_partidos;
CREATE POLICY "Public read access for torneo_partidos"
  ON torneo_partidos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own tournament matches" ON torneo_partidos;
CREATE POLICY "Users can manage their own tournament matches"
  ON torneo_partidos FOR ALL
  USING (torneo_id::text IN (SELECT id::text FROM torneos WHERE organizador_id::text = auth.uid()::text))
  WITH CHECK (torneo_id::text IN (SELECT id::text FROM torneos WHERE organizador_id::text = auth.uid()::text));

DROP POLICY IF EXISTS "Public read access for torneo_sedes" ON torneo_sedes;
CREATE POLICY "Public read access for torneo_sedes"
  ON torneo_sedes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own tournament sedes" ON torneo_sedes;
CREATE POLICY "Users can manage their own tournament sedes"
  ON torneo_sedes FOR ALL
  USING (torneo_id::text IN (SELECT id::text FROM torneos WHERE organizador_id::text = auth.uid()::text))
  WITH CHECK (torneo_id::text IN (SELECT id::text FROM torneos WHERE organizador_id::text = auth.uid()::text));

DROP POLICY IF EXISTS "Public read access for torneo_arbitros" ON torneo_arbitros;
CREATE POLICY "Public read access for torneo_arbitros"
  ON torneo_arbitros FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own tournament arbitros" ON torneo_arbitros;
CREATE POLICY "Users can manage their own tournament arbitros"
  ON torneo_arbitros FOR ALL
  USING (torneo_id::text IN (SELECT id::text FROM torneos WHERE organizador_id::text = auth.uid()::text))
  WITH CHECK (torneo_id::text IN (SELECT id::text FROM torneos WHERE organizador_id::text = auth.uid()::text));
