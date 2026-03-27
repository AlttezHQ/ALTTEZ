  D-- ════════════════════════════════════════════════════════════
-- ELEVATE SPORTS — Schema Inicial para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
--
-- @author @Data (Mateo-Data_Engine)
-- @version 1.0.0
-- ════════════════════════════════════════════════════════════

-- ── 1. CLUBS ──
-- Un club es la unidad raíz. Todo pertenece a un club.
CREATE TABLE IF NOT EXISTS clubs (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre      text NOT NULL,
  disciplina  text NOT NULL DEFAULT 'Futbol',
  ciudad      text NOT NULL,
  entrenador  text NOT NULL,
  temporada   text NOT NULL DEFAULT '2025-26',
  categorias  text[] NOT NULL DEFAULT '{"General"}',
  campos      text[] NOT NULL DEFAULT '{}',
  descripcion text DEFAULT '',
  telefono    text DEFAULT '',
  email       text DEFAULT '',
  mode        text NOT NULL DEFAULT 'production' CHECK (mode IN ('demo', 'production')),
  created_at  timestamptz DEFAULT now()
);

-- ── 2. ATHLETES ──
CREATE TABLE IF NOT EXISTS athletes (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  club_id    uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name       text NOT NULL,
  pos        text NOT NULL,
  pos_code   text NOT NULL,
  dob        date,
  contact    text DEFAULT '',
  status     text NOT NULL DEFAULT 'P' CHECK (status IN ('P', 'A', 'L')),
  rpe        smallint CHECK (rpe IS NULL OR (rpe >= 1 AND rpe <= 10)),
  photo      text DEFAULT '',
  available  boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_athletes_club ON athletes(club_id);

-- ── 3. SESSIONS (historial de entrenamiento) ──
CREATE TABLE IF NOT EXISTS sessions (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  club_id         uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  num             integer NOT NULL,
  fecha           text NOT NULL,
  presentes       integer NOT NULL DEFAULT 0,
  total           integer NOT NULL DEFAULT 0,
  rpe_avg         numeric(3,1),
  rpe_by_athlete  jsonb DEFAULT '{}',
  tipo            text NOT NULL DEFAULT 'Sesion'
                  CHECK (tipo IN ('Tactica','Fisico','Recuperacion','Partido','Sesion',
                                  'Táctica','Físico','Recuperación','Sesión')),
  nota            text DEFAULT '',
  saved_at        timestamptz DEFAULT now(),
  CONSTRAINT presentes_lte_total CHECK (presentes <= total)
);
CREATE INDEX IF NOT EXISTS idx_sessions_club ON sessions(club_id);
CREATE INDEX IF NOT EXISTS idx_sessions_saved ON sessions(club_id, saved_at DESC);

-- ── 4. PAYMENTS (pagos de atletas) ──
CREATE TABLE IF NOT EXISTS payments (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  club_id     uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  athlete_id  bigint NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  mes         text NOT NULL,              -- formato YYYY-MM
  monto       integer NOT NULL DEFAULT 0 CHECK (monto >= 0),
  estado      text NOT NULL DEFAULT 'pendiente'
              CHECK (estado IN ('pendiente', 'pagado', 'parcial')),
  fecha_pago  date,
  UNIQUE(club_id, athlete_id, mes)
);
CREATE INDEX IF NOT EXISTS idx_payments_club ON payments(club_id);

-- ── 5. MOVEMENTS (movimientos financieros) ──
CREATE TABLE IF NOT EXISTS movements (
  id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  club_id   uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  tipo      text NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
  concepto  text NOT NULL,
  monto     integer NOT NULL CHECK (monto > 0),
  fecha     date NOT NULL DEFAULT CURRENT_DATE
);
CREATE INDEX IF NOT EXISTS idx_movements_club ON movements(club_id);

-- ── 6. MATCH STATS ──
CREATE TABLE IF NOT EXISTS match_stats (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  club_id        uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE UNIQUE,
  played         integer NOT NULL DEFAULT 0,
  won            integer NOT NULL DEFAULT 0,
  drawn          integer NOT NULL DEFAULT 0,
  lost           integer NOT NULL DEFAULT 0,
  goals_for      integer NOT NULL DEFAULT 0,
  goals_against  integer NOT NULL DEFAULT 0,
  points         integer NOT NULL DEFAULT 0
);

-- ── 7. HEALTH SNAPSHOTS ──
CREATE TABLE IF NOT EXISTS health_snapshots (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  club_id      uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  athlete_id   bigint NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  athlete_name text NOT NULL,
  session_num  integer NOT NULL,
  salud        smallint NOT NULL CHECK (salud >= 0 AND salud <= 100),
  risk_level   text NOT NULL CHECK (risk_level IN ('optimo', 'precaucion', 'riesgo', 'sin_datos')),
  rpe_avg_7d   numeric(3,1),
  rpe_actual   smallint,
  created_at   timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_health_club ON health_snapshots(club_id);
CREATE INDEX IF NOT EXISTS idx_health_athlete ON health_snapshots(athlete_id, created_at DESC);

-- ── 8. USER SESSIONS (RBAC) ──
CREATE TABLE IF NOT EXISTS user_sessions (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id    uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'coach', 'staff')),
  user_name  text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ── 9. TACTICAL DATA (roles, instrucciones, tácticas) ──
CREATE TABLE IF NOT EXISTS tactical_data (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  club_id       uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE UNIQUE,
  roles_data    jsonb DEFAULT '{}',
  instructions  text DEFAULT '',
  tactics       text DEFAULT ''
);

-- ════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- Por ahora: acceso abierto con anon key.
-- Cuando se implemente auth real: restringir por club_id del usuario.
-- ════════════════════════════════════════════════

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tactical_data ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para anon (fase 1: sin auth)
CREATE POLICY "anon_all_clubs" ON clubs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_athletes" ON athletes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_movements" ON movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_match_stats" ON match_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_health_snapshots" ON health_snapshots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_user_sessions" ON user_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_tactical_data" ON tactical_data FOR ALL USING (true) WITH CHECK (true);

-- ════════════════════════════════════════════════
-- DONE. 9 tablas creadas con índices y RLS.
-- Siguiente paso: ejecutar desde la app con supabaseService.js
-- ════════════════════════════════════════════════
