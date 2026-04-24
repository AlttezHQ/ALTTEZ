-- ============================================================
-- Migration 010: Cerrar RLS abierto en event_rsvp
-- Fecha: 2026-04-24
-- Motivo: C2 — policies INSERT/UPDATE con WITH CHECK (true)
--         permitían a cualquier anon escribir RSVPs de cualquier
--         club. Se reemplaza por SECURITY DEFINER RPC que valida
--         que el club existe y sanitiza el input antes de escribir.
-- ============================================================

-- 1. Eliminar policies abiertas
DROP POLICY IF EXISTS rsvp_insert_public ON event_rsvp;
DROP POLICY IF EXISTS rsvp_update_public ON event_rsvp;

-- 2. Revocar acceso directo de escritura al anon
REVOKE INSERT, UPDATE ON event_rsvp FROM anon;

-- 3. RPC controlada: única vía de escritura para usuarios no autenticados
CREATE OR REPLACE FUNCTION public.submit_rsvp(
  p_club_id   uuid,
  p_event_id  text,
  p_name      text,
  p_status    text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_name text;
BEGIN
  -- Validar que el club existe (evita escrituras a clubes arbitrarios)
  IF NOT EXISTS (SELECT 1 FROM public.clubs WHERE id = p_club_id) THEN
    RAISE EXCEPTION 'club_not_found';
  END IF;

  -- Validar status contra enum permitido
  IF p_status NOT IN ('confirmed', 'absent', 'maybe') THEN
    RAISE EXCEPTION 'invalid_status';
  END IF;

  -- Sanitizar nombre
  v_name := trim(p_name);
  IF length(v_name) < 2 OR length(v_name) > 80 THEN
    RAISE EXCEPTION 'invalid_name';
  END IF;

  -- Upsert seguro
  INSERT INTO public.event_rsvp (club_id, event_id, athlete_name, status, responded_at)
  VALUES (p_club_id, p_event_id, v_name, p_status, now())
  ON CONFLICT (club_id, event_id, athlete_name)
  DO UPDATE SET
    status       = EXCLUDED.status,
    responded_at = EXCLUDED.responded_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_rsvp(uuid, text, text, text) TO anon;
