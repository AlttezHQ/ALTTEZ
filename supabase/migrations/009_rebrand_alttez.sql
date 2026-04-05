-- ════════════════════════════════════════════════════════════
-- Migration 009 — Rebrand: Elevate Sports → ALTTEZ
-- Fecha: 2026-04-01
-- Autor: @Data (Mateo-Data_Engine)
-- Descripcion: Actualiza los nombres de servicios y entradas del journal
--   que contienen la marca antigua "Elevate Sports" / "Elevate".
--   Se ejecuta con UPDATE idempotente (WHERE para evitar dobles ejecuciones).
-- ════════════════════════════════════════════════════════════

-- ── Tabla: services ─────────────────────────────────────────

UPDATE public.services
  SET name        = 'ALTTEZ Sports CRM',
      description = 'Gestion integral de clubes deportivos. Plantilla, entrenamiento, ciencia RPE, finanzas y pizarra tactica en una sola plataforma.',
      updated_at  = now()
  WHERE slug = 'sports-crm'
    AND name = 'Elevate Sports CRM';

UPDATE public.services
  SET name        = 'ALTTEZ Analytics',
      description = 'Inteligencia deportiva avanzada. Prediccion de lesiones con machine learning y analisis de rendimiento en tiempo real.',
      updated_at  = now()
  WHERE slug = 'analytics'
    AND name = 'Elevate Analytics';

UPDATE public.services
  SET name        = 'ALTTEZ Academy',
      description = 'Plataforma de formacion para entrenadores. Cursos, certificaciones y comunidad de conocimiento deportivo.',
      updated_at  = now()
  WHERE slug = 'academy'
    AND name = 'Elevate Academy';

UPDATE public.services
  SET name        = 'ALTTEZ Connect',
      description = 'Red de conexion entre clubes, scouts y academias. Visibilidad para el talento emergente colombiano.',
      updated_at  = now()
  WHERE slug = 'connect'
    AND name = 'Elevate Connect';

-- ── Tabla: journal_entries ──────────────────────────────────

UPDATE public.journal_entries
  SET title      = 'Lanzamiento oficial de ALTTEZ Sports CRM',
      excerpt    = 'Despues de meses de desarrollo, ALTTEZ Sports CRM esta disponible para clubes deportivos en Colombia. Gestion de plantilla, entrenamiento y finanzas en una sola plataforma.',
      updated_at = now()
  WHERE slug = 'lanzamiento-elevate-sports-crm'
    AND title = 'Lanzamiento oficial de Elevate Sports CRM';

UPDATE public.journal_entries
  SET title      = 'ALTTEZ se asocia con clubes de Bogota y Medellin',
      excerpt    = 'Clubes de formacion Sub-17 en Bogota y Medellin adoptan ALTTEZ Sports CRM como herramienta de gestion. El objetivo: estandarizar la operacion deportiva a nivel nacional.',
      updated_at = now()
  WHERE slug = 'alianzas-bogota-medellin'
    AND title = 'Elevate se asocia con clubes de Bogota y Medellin';

UPDATE public.journal_entries
  SET title      = 'Proximamente: ALTTEZ Analytics para analisis predictivo',
      excerpt    = 'Estamos desarrollando un modulo de inteligencia deportiva que usara machine learning para predecir riesgo de lesiones y optimizar cargas de entrenamiento.',
      updated_at = now()
  WHERE slug = 'proximamente-elevate-analytics'
    AND title = 'Proximamente: Elevate Analytics para analisis predictivo';

-- ── Actualizar COMMENT de tabla (informativo) ────────────────

COMMENT ON TABLE public.services IS 'Proyectos y servicios del ecosistema ALTTEZ (global, sin club_id)';
COMMENT ON TABLE public.journal_entries IS 'Noticias y actualizaciones del portal ALTTEZ (global, sin club_id)';
