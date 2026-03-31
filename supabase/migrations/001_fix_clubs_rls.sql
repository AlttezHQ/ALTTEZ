-- INSTRUCCIONES DE DESPLIEGUE:
-- 1. Abrir dashboard.supabase.com → SQL Editor
-- 2. Pegar y ejecutar este script completo
-- 3. Verificar en Table Editor → clubs → RLS que hay 3 policies activas
-- 4. Verificar en Database → Functions que existe create_club_and_link_admin
-- 5. El siguiente registro de club desde la app usará el RPC automáticamente

-- ══════════════════════════════════════════
-- MIGRATION 001: Fix clubs RLS + admin link
-- Ejecutar en Supabase SQL Editor (dashboard.supabase.com)
-- ══════════════════════════════════════════

-- 1. Asegurar RLS activo en clubs
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar policies existentes que puedan estar en conflicto
DROP POLICY IF EXISTS "Users can create clubs"   ON clubs;
DROP POLICY IF EXISTS "Users can view clubs"     ON clubs;
DROP POLICY IF EXISTS "Users can update clubs"   ON clubs;
DROP POLICY IF EXISTS "Admins can manage clubs"  ON clubs;

-- 3. Policy INSERT: cualquier usuario autenticado puede crear UN club
-- (se valida club_id en profile después)
CREATE POLICY "authenticated_insert_clubs" ON clubs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 4. Policy SELECT: solo puedes ver tu club (via profiles.club_id)
CREATE POLICY "authenticated_select_own_club" ON clubs
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT club_id FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.club_id IS NOT NULL
    )
  );

-- 5. Policy UPDATE: solo admin de ese club puede actualizar
CREATE POLICY "admin_update_own_club" ON clubs
  FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT club_id FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- 6. Función RPC: crea club Y vincula al creador como admin en una sola transacción
-- Usar SECURITY DEFINER evita problemas de RLS en profiles
CREATE OR REPLACE FUNCTION public.create_club_and_link_admin(
  p_nombre       TEXT,
  p_disciplina   TEXT DEFAULT 'Futbol',
  p_ciudad       TEXT DEFAULT '',
  p_entrenador   TEXT DEFAULT '',
  p_temporada    TEXT DEFAULT '2025-26',
  p_categorias   TEXT[] DEFAULT ARRAY['General'],
  p_campos       TEXT[] DEFAULT ARRAY[]::TEXT[],
  p_telefono     TEXT DEFAULT '',
  p_email        TEXT DEFAULT '',
  p_mode         TEXT DEFAULT 'production'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_club_id UUID;
  v_user_id UUID;
BEGIN
  -- Obtener el usuario actual
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  -- Crear el club
  INSERT INTO clubs (
    nombre, disciplina, ciudad, entrenador, temporada,
    categorias, campos, descripcion, telefono, email, mode
  ) VALUES (
    p_nombre, p_disciplina, p_ciudad, p_entrenador, p_temporada,
    p_categorias, p_campos, '', p_telefono, p_email, p_mode
  )
  RETURNING id INTO v_club_id;

  -- Vincular al creador como admin en profiles
  UPDATE profiles
  SET club_id = v_club_id,
      role    = 'admin'
  WHERE id = v_user_id;

  RETURN v_club_id;
END;
$$;

-- 7. Grant execute al rol authenticated
GRANT EXECUTE ON FUNCTION public.create_club_and_link_admin TO authenticated;
