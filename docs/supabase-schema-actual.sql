


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."create_club_and_link_admin"("p_nombre" "text", "p_disciplina" "text" DEFAULT 'Futbol'::"text", "p_ciudad" "text" DEFAULT ''::"text", "p_entrenador" "text" DEFAULT ''::"text", "p_temporada" "text" DEFAULT '2025-26'::"text", "p_categorias" "text"[] DEFAULT ARRAY['General'::"text"], "p_campos" "text"[] DEFAULT ARRAY[]::"text"[], "p_telefono" "text" DEFAULT ''::"text", "p_email" "text" DEFAULT ''::"text", "p_mode" "text" DEFAULT 'production'::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."create_club_and_link_admin"("p_nombre" "text", "p_disciplina" "text", "p_ciudad" "text", "p_entrenador" "text", "p_temporada" "text", "p_categorias" "text"[], "p_campos" "text"[], "p_telefono" "text", "p_email" "text", "p_mode" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_club_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  SELECT club_id FROM public.profiles WHERE id = (SELECT auth.uid());
$$;


ALTER FUNCTION "public"."get_my_club_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
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


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."athletes" (
    "id" bigint NOT NULL,
    "club_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "pos" "text" NOT NULL,
    "pos_code" "text" NOT NULL,
    "dob" "date",
    "contact" "text" DEFAULT ''::"text",
    "status" "text" DEFAULT 'P'::"text" NOT NULL,
    "rpe" smallint,
    "photo" "text" DEFAULT ''::"text",
    "available" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "athletes_rpe_check" CHECK ((("rpe" IS NULL) OR (("rpe" >= 1) AND ("rpe" <= 10)))),
    CONSTRAINT "athletes_status_check" CHECK (("status" = ANY (ARRAY['P'::"text", 'A'::"text", 'L'::"text"])))
);


ALTER TABLE "public"."athletes" OWNER TO "postgres";


ALTER TABLE "public"."athletes" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."athletes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."clubs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" "text" NOT NULL,
    "disciplina" "text" DEFAULT 'Futbol'::"text" NOT NULL,
    "ciudad" "text" NOT NULL,
    "entrenador" "text" NOT NULL,
    "temporada" "text" DEFAULT '2025-26'::"text" NOT NULL,
    "categorias" "text"[] DEFAULT '{General}'::"text"[] NOT NULL,
    "campos" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "descripcion" "text" DEFAULT ''::"text",
    "telefono" "text" DEFAULT ''::"text",
    "email" "text" DEFAULT ''::"text",
    "mode" "text" DEFAULT 'production'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "clubs_mode_check" CHECK (("mode" = ANY (ARRAY['demo'::"text", 'production'::"text"])))
);


ALTER TABLE "public"."clubs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."health_snapshots" (
    "id" bigint NOT NULL,
    "club_id" "uuid" NOT NULL,
    "athlete_id" bigint NOT NULL,
    "athlete_name" "text" NOT NULL,
    "session_num" integer NOT NULL,
    "salud" smallint NOT NULL,
    "risk_level" "text" NOT NULL,
    "rpe_avg_7d" numeric(3,1),
    "rpe_actual" smallint,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "health_snapshots_risk_level_check" CHECK (("risk_level" = ANY (ARRAY['optimo'::"text", 'precaucion'::"text", 'riesgo'::"text", 'sin_datos'::"text"]))),
    CONSTRAINT "health_snapshots_salud_check" CHECK ((("salud" >= 0) AND ("salud" <= 100)))
);


ALTER TABLE "public"."health_snapshots" OWNER TO "postgres";


ALTER TABLE "public"."health_snapshots" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."health_snapshots_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."match_stats" (
    "id" bigint NOT NULL,
    "club_id" "uuid" NOT NULL,
    "played" integer DEFAULT 0 NOT NULL,
    "won" integer DEFAULT 0 NOT NULL,
    "drawn" integer DEFAULT 0 NOT NULL,
    "lost" integer DEFAULT 0 NOT NULL,
    "goals_for" integer DEFAULT 0 NOT NULL,
    "goals_against" integer DEFAULT 0 NOT NULL,
    "points" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."match_stats" OWNER TO "postgres";


ALTER TABLE "public"."match_stats" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."match_stats_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."movements" (
    "id" bigint NOT NULL,
    "club_id" "uuid" NOT NULL,
    "tipo" "text" NOT NULL,
    "concepto" "text" NOT NULL,
    "monto" integer NOT NULL,
    "fecha" "date" DEFAULT CURRENT_DATE NOT NULL,
    CONSTRAINT "movements_monto_check" CHECK (("monto" > 0)),
    CONSTRAINT "movements_tipo_check" CHECK (("tipo" = ANY (ARRAY['ingreso'::"text", 'egreso'::"text"])))
);


ALTER TABLE "public"."movements" OWNER TO "postgres";


ALTER TABLE "public"."movements" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."movements_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" bigint NOT NULL,
    "club_id" "uuid" NOT NULL,
    "athlete_id" bigint NOT NULL,
    "mes" "text" NOT NULL,
    "monto" integer DEFAULT 0 NOT NULL,
    "estado" "text" DEFAULT 'pendiente'::"text" NOT NULL,
    "fecha_pago" "date",
    CONSTRAINT "payments_estado_check" CHECK (("estado" = ANY (ARRAY['pendiente'::"text", 'pagado'::"text", 'parcial'::"text"]))),
    CONSTRAINT "payments_monto_check" CHECK (("monto" >= 0))
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


ALTER TABLE "public"."payments" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."payments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "club_id" "uuid",
    "role" "text" DEFAULT 'admin'::"text" NOT NULL,
    "full_name" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'coach'::"text", 'staff'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" bigint NOT NULL,
    "club_id" "uuid" NOT NULL,
    "num" integer NOT NULL,
    "fecha" "text" NOT NULL,
    "presentes" integer DEFAULT 0 NOT NULL,
    "total" integer DEFAULT 0 NOT NULL,
    "rpe_avg" numeric(3,1),
    "rpe_by_athlete" "jsonb" DEFAULT '{}'::"jsonb",
    "tipo" "text" DEFAULT 'Sesion'::"text" NOT NULL,
    "nota" "text" DEFAULT ''::"text",
    "saved_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "presentes_lte_total" CHECK (("presentes" <= "total")),
    CONSTRAINT "sessions_tipo_check" CHECK (("tipo" = ANY (ARRAY['Tactica'::"text", 'Fisico'::"text", 'Recuperacion'::"text", 'Partido'::"text", 'Sesion'::"text", 'Táctica'::"text", 'Físico'::"text", 'Recuperación'::"text", 'Sesión'::"text"])))
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


ALTER TABLE "public"."sessions" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."sessions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tactical_data" (
    "id" bigint NOT NULL,
    "club_id" "uuid" NOT NULL,
    "roles_data" "jsonb" DEFAULT '{}'::"jsonb",
    "instructions" "text" DEFAULT ''::"text",
    "tactics" "text" DEFAULT ''::"text"
);


ALTER TABLE "public"."tactical_data" OWNER TO "postgres";


ALTER TABLE "public"."tactical_data" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."tactical_data_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "club_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'admin'::"text" NOT NULL,
    "user_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_sessions_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'coach'::"text", 'staff'::"text"])))
);


ALTER TABLE "public"."user_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wellness_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "club_id" "uuid" NOT NULL,
    "athlete_id" "text" NOT NULL,
    "logged_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sleep_quality" smallint NOT NULL,
    "fatigue_level" smallint NOT NULL,
    "stress_level" smallint NOT NULL,
    "doms_level" smallint NOT NULL,
    "notes" "text",
    "wellness_score" numeric(5,2),
    CONSTRAINT "wellness_logs_doms_level_check" CHECK ((("doms_level" >= 1) AND ("doms_level" <= 5))),
    CONSTRAINT "wellness_logs_fatigue_level_check" CHECK ((("fatigue_level" >= 1) AND ("fatigue_level" <= 5))),
    CONSTRAINT "wellness_logs_sleep_quality_check" CHECK ((("sleep_quality" >= 1) AND ("sleep_quality" <= 5))),
    CONSTRAINT "wellness_logs_stress_level_check" CHECK ((("stress_level" >= 1) AND ("stress_level" <= 5)))
);


ALTER TABLE "public"."wellness_logs" OWNER TO "postgres";


ALTER TABLE ONLY "public"."athletes"
    ADD CONSTRAINT "athletes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clubs"
    ADD CONSTRAINT "clubs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."health_snapshots"
    ADD CONSTRAINT "health_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_stats"
    ADD CONSTRAINT "match_stats_club_id_key" UNIQUE ("club_id");



ALTER TABLE ONLY "public"."match_stats"
    ADD CONSTRAINT "match_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."movements"
    ADD CONSTRAINT "movements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_club_id_athlete_id_mes_key" UNIQUE ("club_id", "athlete_id", "mes");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tactical_data"
    ADD CONSTRAINT "tactical_data_club_id_key" UNIQUE ("club_id");



ALTER TABLE ONLY "public"."tactical_data"
    ADD CONSTRAINT "tactical_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wellness_logs"
    ADD CONSTRAINT "wellness_logs_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_athletes_club" ON "public"."athletes" USING "btree" ("club_id");



CREATE INDEX "idx_health_athlete" ON "public"."health_snapshots" USING "btree" ("athlete_id", "created_at" DESC);



CREATE INDEX "idx_health_club" ON "public"."health_snapshots" USING "btree" ("club_id");



CREATE INDEX "idx_movements_club" ON "public"."movements" USING "btree" ("club_id");



CREATE INDEX "idx_payments_club" ON "public"."payments" USING "btree" ("club_id");



CREATE INDEX "idx_profiles_club" ON "public"."profiles" USING "btree" ("club_id");



CREATE INDEX "idx_sessions_club" ON "public"."sessions" USING "btree" ("club_id");



CREATE INDEX "idx_sessions_saved" ON "public"."sessions" USING "btree" ("club_id", "saved_at" DESC);



CREATE INDEX "idx_wellness_club_athlete" ON "public"."wellness_logs" USING "btree" ("club_id", "athlete_id", "logged_at" DESC);



ALTER TABLE ONLY "public"."athletes"
    ADD CONSTRAINT "athletes_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."health_snapshots"
    ADD CONSTRAINT "health_snapshots_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."health_snapshots"
    ADD CONSTRAINT "health_snapshots_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_stats"
    ADD CONSTRAINT "match_stats_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."movements"
    ADD CONSTRAINT "movements_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tactical_data"
    ADD CONSTRAINT "tactical_data_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



CREATE POLICY "admin_delete_wellness" ON "public"."wellness_logs" FOR DELETE TO "authenticated" USING (("club_id" IN ( SELECT "profiles"."club_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "admin_update_own_club" ON "public"."clubs" FOR UPDATE TO "authenticated" USING (("id" IN ( SELECT "profiles"."club_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



ALTER TABLE "public"."athletes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "athletes_delete_club" ON "public"."athletes" FOR DELETE TO "authenticated" USING (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



CREATE POLICY "athletes_insert_club" ON "public"."athletes" FOR INSERT TO "authenticated" WITH CHECK (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



CREATE POLICY "athletes_select_club" ON "public"."athletes" FOR SELECT TO "authenticated" USING (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



CREATE POLICY "athletes_update_club" ON "public"."athletes" FOR UPDATE TO "authenticated" USING (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id"))) WITH CHECK (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



CREATE POLICY "authenticated_insert_clubs" ON "public"."clubs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "authenticated_select_own_club" ON "public"."clubs" FOR SELECT TO "authenticated" USING (("id" IN ( SELECT "profiles"."club_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."club_id" IS NOT NULL)))));



ALTER TABLE "public"."clubs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "clubs_insert_authenticated" ON "public"."clubs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "clubs_select_own" ON "public"."clubs" FOR SELECT TO "authenticated" USING (("id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



CREATE POLICY "clubs_update_own" ON "public"."clubs" FOR UPDATE TO "authenticated" USING (("id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id"))) WITH CHECK (("id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



ALTER TABLE "public"."health_snapshots" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "health_snapshots_insert_club" ON "public"."health_snapshots" FOR INSERT TO "authenticated" WITH CHECK (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



CREATE POLICY "health_snapshots_select_club" ON "public"."health_snapshots" FOR SELECT TO "authenticated" USING (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



CREATE POLICY "insert_own_club_wellness" ON "public"."wellness_logs" FOR INSERT TO "authenticated" WITH CHECK (("club_id" IN ( SELECT "profiles"."club_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



ALTER TABLE "public"."match_stats" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "match_stats_insert_club" ON "public"."match_stats" FOR INSERT TO "authenticated" WITH CHECK (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



CREATE POLICY "match_stats_select_club" ON "public"."match_stats" FOR SELECT TO "authenticated" USING (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



CREATE POLICY "match_stats_update_club" ON "public"."match_stats" FOR UPDATE TO "authenticated" USING (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id"))) WITH CHECK (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



ALTER TABLE "public"."movements" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "movements_insert_club" ON "public"."movements" FOR INSERT TO "authenticated" WITH CHECK (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



CREATE POLICY "movements_select_club" ON "public"."movements" FOR SELECT TO "authenticated" USING (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "payments_insert_club" ON "public"."payments" FOR INSERT TO "authenticated" WITH CHECK (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



CREATE POLICY "payments_select_club" ON "public"."payments" FOR SELECT TO "authenticated" USING (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



CREATE POLICY "payments_update_club" ON "public"."payments" FOR UPDATE TO "authenticated" USING (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id"))) WITH CHECK (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_select_own" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "select_own_club_wellness" ON "public"."wellness_logs" FOR SELECT TO "authenticated" USING (("club_id" IN ( SELECT "profiles"."club_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."club_id" IS NOT NULL)))));



ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sessions_insert_club" ON "public"."sessions" FOR INSERT TO "authenticated" WITH CHECK (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



CREATE POLICY "sessions_select_club" ON "public"."sessions" FOR SELECT TO "authenticated" USING (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



ALTER TABLE "public"."tactical_data" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tactical_data_insert_club" ON "public"."tactical_data" FOR INSERT TO "authenticated" WITH CHECK (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



CREATE POLICY "tactical_data_select_club" ON "public"."tactical_data" FOR SELECT TO "authenticated" USING (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



CREATE POLICY "tactical_data_update_club" ON "public"."tactical_data" FOR UPDATE TO "authenticated" USING (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id"))) WITH CHECK (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



ALTER TABLE "public"."user_sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_sessions_insert_club" ON "public"."user_sessions" FOR INSERT TO "authenticated" WITH CHECK (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



CREATE POLICY "user_sessions_select_club" ON "public"."user_sessions" FOR SELECT TO "authenticated" USING (("club_id" = ( SELECT "public"."get_my_club_id"() AS "get_my_club_id")));



ALTER TABLE "public"."wellness_logs" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_club_and_link_admin"("p_nombre" "text", "p_disciplina" "text", "p_ciudad" "text", "p_entrenador" "text", "p_temporada" "text", "p_categorias" "text"[], "p_campos" "text"[], "p_telefono" "text", "p_email" "text", "p_mode" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_club_and_link_admin"("p_nombre" "text", "p_disciplina" "text", "p_ciudad" "text", "p_entrenador" "text", "p_temporada" "text", "p_categorias" "text"[], "p_campos" "text"[], "p_telefono" "text", "p_email" "text", "p_mode" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_club_and_link_admin"("p_nombre" "text", "p_disciplina" "text", "p_ciudad" "text", "p_entrenador" "text", "p_temporada" "text", "p_categorias" "text"[], "p_campos" "text"[], "p_telefono" "text", "p_email" "text", "p_mode" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_club_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_club_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_club_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON TABLE "public"."athletes" TO "anon";
GRANT ALL ON TABLE "public"."athletes" TO "authenticated";
GRANT ALL ON TABLE "public"."athletes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."athletes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."athletes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."athletes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."clubs" TO "anon";
GRANT ALL ON TABLE "public"."clubs" TO "authenticated";
GRANT ALL ON TABLE "public"."clubs" TO "service_role";



GRANT ALL ON TABLE "public"."health_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."health_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."health_snapshots" TO "service_role";



GRANT ALL ON SEQUENCE "public"."health_snapshots_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."health_snapshots_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."health_snapshots_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."match_stats" TO "anon";
GRANT ALL ON TABLE "public"."match_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."match_stats" TO "service_role";



GRANT ALL ON SEQUENCE "public"."match_stats_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."match_stats_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."match_stats_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."movements" TO "anon";
GRANT ALL ON TABLE "public"."movements" TO "authenticated";
GRANT ALL ON TABLE "public"."movements" TO "service_role";



GRANT ALL ON SEQUENCE "public"."movements_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."movements_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."movements_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."payments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sessions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sessions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sessions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tactical_data" TO "anon";
GRANT ALL ON TABLE "public"."tactical_data" TO "authenticated";
GRANT ALL ON TABLE "public"."tactical_data" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tactical_data_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tactical_data_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tactical_data_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_sessions" TO "anon";
GRANT ALL ON TABLE "public"."user_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."wellness_logs" TO "anon";
GRANT ALL ON TABLE "public"."wellness_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."wellness_logs" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







