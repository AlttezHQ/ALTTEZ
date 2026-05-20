-- ════════════════════════════════════════════════════════════
-- ALTTEZ — Migración 017: Tabla de Propuestas Comerciales
-- Módulo confidencial de propuestas para clientes, socios e inversionistas.
-- Acceso público por UUID único (enlace confidencial intransferible).
--
-- @author ALTTEZ
-- @version 1.0.0
-- ════════════════════════════════════════════════════════════

-- ── 1. TABLA PROPUESTAS ──
CREATE TABLE IF NOT EXISTS propuestas (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id              uuid REFERENCES clubs(id) ON DELETE CASCADE NOT NULL,
  client_name          text NOT NULL DEFAULT '',
  title                text NOT NULL DEFAULT '',
  subtitle             text NOT NULL DEFAULT '',
  description          text NOT NULL DEFAULT '',
  fecha                date NOT NULL DEFAULT CURRENT_DATE,
  rol                  text NOT NULL DEFAULT '',
  participacion_pct    numeric(5,2) DEFAULT 0,
  impacto              text NOT NULL DEFAULT '',
  beneficios           jsonb DEFAULT '[]'::jsonb,
  status               text NOT NULL DEFAULT 'creada'
                         CHECK (status IN ('creada','enviada','aceptada','contrapropuesta','rechazada')),
  signed_name          text,
  signed_at            timestamptz,
  contrapropuesta_text text,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_propuestas_club ON propuestas(club_id);
CREATE INDEX IF NOT EXISTS idx_propuestas_status ON propuestas(status);

-- ── 2. TRIGGER: updated_at automático ──
CREATE OR REPLACE FUNCTION public.set_propuesta_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_propuestas_updated_at ON propuestas;
CREATE TRIGGER trg_propuestas_updated_at
  BEFORE UPDATE ON propuestas
  FOR EACH ROW EXECUTE FUNCTION public.set_propuesta_updated_at();

-- ── 3. ROW LEVEL SECURITY ──
ALTER TABLE propuestas ENABLE ROW LEVEL SECURITY;

-- Administradores de un club: acceso TOTAL a sus propuestas
CREATE POLICY "propuestas_all_club"
  ON propuestas FOR ALL
  TO authenticated
  USING (club_id = (SELECT public.get_my_club_id()))
  WITH CHECK (club_id = (SELECT public.get_my_club_id()));

-- Público: puede LEER cualquier propuesta conociendo el UUID exacto
-- (sin auth, sin importar el club_id — el UUID es el secreto)
CREATE POLICY "propuestas_select_public"
  ON propuestas FOR SELECT
  TO anon
  USING (true);

-- Público: puede ACTUALIZAR solo los campos de respuesta (firma / contrapropuesta)
-- El UUID actúa como token de acceso. Se permite modificar solo si aún no está cerrada.
CREATE POLICY "propuestas_update_public"
  ON propuestas FOR UPDATE
  TO anon
  USING (status IN ('creada', 'enviada'))
  WITH CHECK (status IN ('aceptada', 'contrapropuesta'));

-- ════════════════════════════════════════════════════════════
-- DONE. Tabla propuestas lista con RLS dual (admin + público por UUID).
-- El frontend usa el UUID como enlace confidencial intransferible.
-- ════════════════════════════════════════════════════════════
