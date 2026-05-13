-- Script de migración para actualizar las tablas del módulo de Torneos en Supabase

-- 1. Actualizar tabla `torneos` con los nuevos campos si no existen
ALTER TABLE torneos
  ADD COLUMN IF NOT EXISTS num_grupos integer DEFAULT 2,
  ADD COLUMN IF NOT EXISTS publicado boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS descripcion text,
  ADD COLUMN IF NOT EXISTS portada text,
  ADD COLUMN IF NOT EXISTS perfil text,
  ADD COLUMN IF NOT EXISTS contacto text,
  ADD COLUMN IF NOT EXISTS premios text,
  ADD COLUMN IF NOT EXISTS patrocinadores jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS visibilidad text DEFAULT 'publico',
  ADD COLUMN IF NOT EXISTS reglamento_url text;

-- 2. Crear tabla `torneo_categorias` si no existe
CREATE TABLE IF NOT EXISTS torneo_categorias (
  id uuid PRIMARY KEY,
  torneo_id uuid REFERENCES torneos(id) ON DELETE CASCADE,
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
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en torneo_categorias
ALTER TABLE torneo_categorias ENABLE ROW LEVEL SECURITY;

-- Políticas para torneo_categorias
CREATE POLICY "Public read access for torneo_categorias"
  ON torneo_categorias FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own tournament categories"
  ON torneo_categorias FOR ALL
  USING (
    torneo_id IN (
      SELECT id FROM torneos WHERE organizador_id = auth.uid()
    )
  );

-- 3. Asegurar que las otras tablas (equipos, partidos, etc.) tengan los campos necesarios
-- Equipos
ALTER TABLE torneo_equipos
  ADD COLUMN IF NOT EXISTS grupo text,
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS entrenador text,
  ADD COLUMN IF NOT EXISTS delegado text,
  ADD COLUMN IF NOT EXISTS jugadores jsonb DEFAULT '[]'::jsonb;

-- Partidos
ALTER TABLE torneo_partidos
  ADD COLUMN IF NOT EXISTS fase text,
  ADD COLUMN IF NOT EXISTS ronda integer,
  ADD COLUMN IF NOT EXISTS grupo text,
  ADD COLUMN IF NOT EXISTS lugar text,
  ADD COLUMN IF NOT EXISTS orden integer,
  ADD COLUMN IF NOT EXISTS sede_id uuid,
  ADD COLUMN IF NOT EXISTS arbitro_id uuid;

-- 4. Crear tabla `torneo_sedes` si no existe
CREATE TABLE IF NOT EXISTS torneo_sedes (
  id uuid PRIMARY KEY,
  torneo_id uuid REFERENCES torneos(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  direccion text,
  created_at timestamptz DEFAULT now()
);

-- Políticas para torneo_sedes
ALTER TABLE torneo_sedes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for torneo_sedes" ON torneo_sedes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own tournament sedes" ON torneo_sedes FOR ALL USING (torneo_id IN (SELECT id FROM torneos WHERE organizador_id = auth.uid()));

-- 5. Crear tabla `torneo_arbitros` si no existe
CREATE TABLE IF NOT EXISTS torneo_arbitros (
  id uuid PRIMARY KEY,
  torneo_id uuid REFERENCES torneos(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  contacto text,
  created_at timestamptz DEFAULT now()
);

-- Políticas para torneo_arbitros
ALTER TABLE torneo_arbitros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for torneo_arbitros" ON torneo_arbitros FOR SELECT USING (true);
CREATE POLICY "Users can manage their own tournament arbitros" ON torneo_arbitros FOR ALL USING (torneo_id IN (SELECT id FROM torneos WHERE organizador_id = auth.uid()));
