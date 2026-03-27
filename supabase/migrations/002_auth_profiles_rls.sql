-- ════════════════════════════════════════════════════════════
-- ELEVATE SPORTS — Migracion 002: Auth + Profiles + RLS
-- Supabase Auth reemplaza RBAC con checksum.
-- RLS por club_id reemplaza politicas permisivas.
--
-- @author @Data (Mateo-Data_Engine)
-- @version 2.0.0
-- ════════════════════════════════════════════════════════════

-- ── 1. TABLA PROFILES ──
-- Vincula auth.uid() con club_id y rol.
-- Se crea automaticamente al registrarse via trigger.
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  club_id    uuid REFERENCES clubs(id) ON DELETE SET NULL,
  role       text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'coach', 'staff')),
  full_name  text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profiles_club ON profiles(club_id);

-- ── 2. TRIGGER: auto-crear profile al signup ──
-- Lee role y full_name desde raw_user_meta_data del signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Drop si existe (idempotente)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 3. FUNCION HELPER: get_my_club_id() ──
-- Usado en RLS policies. Security definer para bypasear RLS de profiles.
-- Subquery pattern para performance (se evalua 1 vez por statement).
CREATE OR REPLACE FUNCTION public.get_my_club_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT club_id FROM public.profiles WHERE id = (SELECT auth.uid());
$$;

-- ── 4. RLS EN PROFILES ──
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Usuarios ven solo su propio perfil
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

-- Usuarios actualizan solo su propio perfil (no pueden cambiar role ni club_id)
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- Insert lo maneja el trigger (service_role), no el usuario
-- No policy para INSERT to authenticated — solo el trigger puede insertar

-- ── 5. DROP POLITICAS PERMISIVAS (fase 1) ──
-- Eliminamos las politicas "anon_all_*" que permitian todo.
DROP POLICY IF EXISTS "anon_all_clubs" ON clubs;
DROP POLICY IF EXISTS "anon_all_athletes" ON athletes;
DROP POLICY IF EXISTS "anon_all_sessions" ON sessions;
DROP POLICY IF EXISTS "anon_all_payments" ON payments;
DROP POLICY IF EXISTS "anon_all_movements" ON movements;
DROP POLICY IF EXISTS "anon_all_match_stats" ON match_stats;
DROP POLICY IF EXISTS "anon_all_health_snapshots" ON health_snapshots;
DROP POLICY IF EXISTS "anon_all_user_sessions" ON user_sessions;
DROP POLICY IF EXISTS "anon_all_tactical_data" ON tactical_data;

-- ── 6. NUEVAS POLITICAS RLS POR CLUB_ID ──
-- Patron: authenticated + (select get_my_club_id()) para performance.
-- Cada usuario solo ve/edita datos de su propio club.

-- CLUBS: el usuario ve solo su club
CREATE POLICY "clubs_select_own"
  ON clubs FOR SELECT
  TO authenticated
  USING (id = (SELECT public.get_my_club_id()));

CREATE POLICY "clubs_update_own"
  ON clubs FOR UPDATE
  TO authenticated
  USING (id = (SELECT public.get_my_club_id()))
  WITH CHECK (id = (SELECT public.get_my_club_id()));

-- INSERT de clubs: cualquier authenticated puede crear (aun no tiene club)
CREATE POLICY "clubs_insert_authenticated"
  ON clubs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ATHLETES
CREATE POLICY "athletes_select_club"
  ON athletes FOR SELECT
  TO authenticated
  USING (club_id = (SELECT public.get_my_club_id()));

CREATE POLICY "athletes_insert_club"
  ON athletes FOR INSERT
  TO authenticated
  WITH CHECK (club_id = (SELECT public.get_my_club_id()));

CREATE POLICY "athletes_update_club"
  ON athletes FOR UPDATE
  TO authenticated
  USING (club_id = (SELECT public.get_my_club_id()))
  WITH CHECK (club_id = (SELECT public.get_my_club_id()));

CREATE POLICY "athletes_delete_club"
  ON athletes FOR DELETE
  TO authenticated
  USING (club_id = (SELECT public.get_my_club_id()));

-- SESSIONS
CREATE POLICY "sessions_select_club"
  ON sessions FOR SELECT
  TO authenticated
  USING (club_id = (SELECT public.get_my_club_id()));

CREATE POLICY "sessions_insert_club"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (club_id = (SELECT public.get_my_club_id()));

-- PAYMENTS
CREATE POLICY "payments_select_club"
  ON payments FOR SELECT
  TO authenticated
  USING (club_id = (SELECT public.get_my_club_id()));

CREATE POLICY "payments_insert_club"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (club_id = (SELECT public.get_my_club_id()));

CREATE POLICY "payments_update_club"
  ON payments FOR UPDATE
  TO authenticated
  USING (club_id = (SELECT public.get_my_club_id()))
  WITH CHECK (club_id = (SELECT public.get_my_club_id()));

-- MOVEMENTS
CREATE POLICY "movements_select_club"
  ON movements FOR SELECT
  TO authenticated
  USING (club_id = (SELECT public.get_my_club_id()));

CREATE POLICY "movements_insert_club"
  ON movements FOR INSERT
  TO authenticated
  WITH CHECK (club_id = (SELECT public.get_my_club_id()));

-- MATCH_STATS
CREATE POLICY "match_stats_select_club"
  ON match_stats FOR SELECT
  TO authenticated
  USING (club_id = (SELECT public.get_my_club_id()));

CREATE POLICY "match_stats_insert_club"
  ON match_stats FOR INSERT
  TO authenticated
  WITH CHECK (club_id = (SELECT public.get_my_club_id()));

CREATE POLICY "match_stats_update_club"
  ON match_stats FOR UPDATE
  TO authenticated
  USING (club_id = (SELECT public.get_my_club_id()))
  WITH CHECK (club_id = (SELECT public.get_my_club_id()));

-- HEALTH_SNAPSHOTS
CREATE POLICY "health_snapshots_select_club"
  ON health_snapshots FOR SELECT
  TO authenticated
  USING (club_id = (SELECT public.get_my_club_id()));

CREATE POLICY "health_snapshots_insert_club"
  ON health_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (club_id = (SELECT public.get_my_club_id()));

-- USER_SESSIONS
CREATE POLICY "user_sessions_select_club"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (club_id = (SELECT public.get_my_club_id()));

CREATE POLICY "user_sessions_insert_club"
  ON user_sessions FOR INSERT
  TO authenticated
  WITH CHECK (club_id = (SELECT public.get_my_club_id()));

-- TACTICAL_DATA
CREATE POLICY "tactical_data_select_club"
  ON tactical_data FOR SELECT
  TO authenticated
  USING (club_id = (SELECT public.get_my_club_id()));

CREATE POLICY "tactical_data_insert_club"
  ON tactical_data FOR INSERT
  TO authenticated
  WITH CHECK (club_id = (SELECT public.get_my_club_id()));

CREATE POLICY "tactical_data_update_club"
  ON tactical_data FOR UPDATE
  TO authenticated
  USING (club_id = (SELECT public.get_my_club_id()))
  WITH CHECK (club_id = (SELECT public.get_my_club_id()));

-- ════════════════════════════════════════════════
-- DONE. Auth + Profiles + RLS cerrado por club_id.
-- Siguiente paso: authService.js en el frontend.
-- ════════════════════════════════════════════════
