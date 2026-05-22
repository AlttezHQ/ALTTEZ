/**
 * @component CRMApp
 * @description Shell principal del sistema CRM de ALTTEZ.
 * Gestiona: sesion Supabase, estado de autenticacion, routing de modulos,
 * modo demo/produccion y el guard de seguridad por rol.
 *
 * @version 1.0
 */

import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../../shared/store/useStore";
import { useAuth } from "../../shared/auth";
import { getPostLogoutRedirect } from "../../shared/auth/authRedirects";
import FieldBackground from "../../shared/ui/FieldBackground";
import ErrorBoundary from "../../shared/ui/ErrorBoundary";
import ToastContainer, { showToast } from "../../shared/ui/Toast";
import { EMPTY_ATHLETES, EMPTY_HISTORIAL, EMPTY_MATCH_STATS, EMPTY_FINANZAS } from "../../shared/constants/initialStates";
import {
  loadDemoState, loadProductionState, logout as logoutService,
} from "../../shared/services/storageService";
import { clearSnapshots, setHealthClubId } from "../../shared/services/healthService";
import { PALETTE as C } from "../../shared/tokens/palette";
import { canAccessModule } from "../../shared/constants/roles";

import { isSupabaseReady, supabase } from "../../shared/lib/supabase";
import { createClub as sbCreateClub, setClubId, migrateLocalToSupabase, loadClubIdFromProfile } from "../../shared/services/supabaseService";
import { setProposalsClubId } from "../../shared/services/proposalsService";
import { exportBackupJSON } from "../../shared/services/backupService";
import { signUp, signIn } from "../../shared/services/authService";
import OfflineBanner from "../../shared/ui/OfflineBanner";
import UpdateToast from "../../shared/ui/UpdateToast";
import MiniTopbar from "./MiniTopbar";

// ── React.lazy: code-splitting por modulo ──
const CrmOnboarding = lazy(() => import("./CrmOnboarding"));
const Home = lazy(() => import("../dashboard/Home"));
const Entrenamiento = lazy(() => import("../training/Entrenamiento"));
const GestionPlantilla = lazy(() => import("../roster/GestionPlantilla"));
const MiClub = lazy(() => import("../club/MiClub"));
const Administracion = lazy(() => import("../finance/Administracion"));
const Calendario = lazy(() => import("../scheduling/Calendario"));
const MatchCenter = lazy(() => import("../competition/MatchCenter"));
const DemoGate = lazy(() => import("./DemoGate"));
const KioskMode = lazy(() => import("../experience/KioskMode"));
const Reportes = lazy(() => import("../analytics/Reportes"));
const ProposalsAdminModule = lazy(() => import("../proposals/ProposalsAdminModule"));

const DEFAULT_CLUB = { nombre:"", disciplina:"", ciudad:"", entrenador:"", temporada:"", categorias:[], campos:[], descripcion:"", telefono:"", email:"" };

/**
 * Lee el `mode` que Zustand persiste en localStorage de forma sincrona.
 * Esto evita mostrar el spinner mientras Supabase re-verifica la sesion.
 * Devuelve null si no hay nada guardado o el dato es invalido.
 */
function readPersistedMode() {
  try {
    const raw = localStorage.getItem("alttez-store");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.mode ?? null;
  } catch {
    return null;
  }
}

const URL_TO_MODULE = {
  home: "home",
  entrenamiento: "entrenamiento",
  plantilla: "plantilla",
  miclub: "miclub",
  administracion: "admin",
  admin: "admin",
  calendario: "calendario",
  partidos: "partidos",
  reportes: "reportes",
  propuestas: "propuestas",
};

const MODULE_TO_URL = {
  home: "/crm",
  entrenamiento: "/crm/entrenamiento",
  plantilla: "/crm/plantilla",
  miclub: "/crm/miclub",
  admin: "/crm/administracion",
  calendario: "/crm/calendario",
  partidos: "/crm/partidos",
  reportes: "/crm/reportes",
  propuestas: "/crm/propuestas",
};

function getModuleFromCrmPath(pathname) {
  const seg = pathname.replace(/^\/crm\/?/, "").split("/")[0];
  if (!seg || seg === "kiosk") return null;
  return URL_TO_MODULE[seg] || null;
}

// ── Loading fallback — ALTTEZ splash broadcast ──
const LoadingFallback = () => (
  <div style={{
    display:"flex", alignItems:"center", justifyContent:"center",
    height:"60vh", position:"relative",
  }}>
    <div style={{ textAlign:"center", position:"relative" }}>
      <div style={{
        position:"relative",
        width: 80, height: 80,
        margin:"0 auto 18px",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <img
          src="/branding/alttez-symbol-transparent.png"
          alt="ALTTEZ"
          style={{
            width: 64, height: 64, objectFit:"contain",
            opacity: 0.92,
            animation: "alttez-pulse 1.8s ease-in-out infinite",
          }}
          onError={e => { e.currentTarget.style.display = "none"; }}
        />
        <span style={{
          position:"absolute", inset:0,
          border:`2px solid ${C.border}`,
          borderTopColor: C.blue,
          borderRightColor: C.blueHi,
          borderRadius:"50%",
          animation:"spin 1.1s cubic-bezier(0.4,0,0.2,1) infinite",
        }} />
      </div>
      <div style={{
        fontSize:11,
        color:C.textMuted,
        textTransform:"uppercase",
        letterSpacing:"0.14em",
        fontWeight:700,
      }}>
        Cargando ALTTEZ
      </div>
    </div>
    <style>{`
      @keyframes alttez-pulse {
        0%,100% { opacity: 1; transform: scale(1); }
        50%     { opacity: 0.75; transform: scale(0.94); }
      }
    `}</style>
  </div>
);

export function CRMApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const mode = useStore(state => state.mode);
  const setMode = useStore(state => state.setMode);
  const setSession = useStore(state => state.setSession);
  const activeModule = useStore(state => state.activeModule);
  const setActiveModule = useStore(state => state.setActiveModule);
  const setAthletes = useStore(state => state.setAthletes);
  const setHistorial = useStore(state => state.setHistorial);
  const clubInfo = useStore(state => state.clubInfo);
  const setClubInfo = useStore(state => state.setClubInfo);
  const setMatchStats = useStore(state => state.setMatchStats);
  const setFinanzas = useStore(state => state.setFinanzas);
  const _clearStore = useStore(state => state.clearStore);

  const persistedMode = useState(() => readPersistedMode())[0];
  const [authVerifying, setAuthVerifying] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Role: demo siempre admin; sin Supabase configurado modo offline también admin
  // Con Supabase usa el role del AuthProvider global.
  const userRole = mode === "demo" || (mode && !isSupabaseReady)
    ? "admin"
    : (auth.role ?? null);

  useEffect(() => {
    if (!persistedMode || persistedMode === "demo" || !isSupabaseReady) return;
    let cancelled = false;
    setAuthVerifying(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      setAuthVerifying(false);
      if (!session) {
        setMode(null);
      }
    }).catch(() => {
      if (!cancelled) setAuthVerifying(false);
    });
    return () => { cancelled = true; };
  }, [persistedMode, setMode]);

  useEffect(() => {
    if (mode || !auth.isAuthenticated || !auth.isProfileReady) return;
    const requestedModule = getModuleFromCrmPath(location.pathname);
    if (requestedModule && canAccessModule(auth.role, requestedModule)) {
      setActiveModule(requestedModule);
    }
    setMode("production");
  }, [mode, auth.isAuthenticated, auth.isProfileReady, auth.role, location.pathname, setActiveModule, setMode]);

  // Sync club_id from AuthProvider to services when profile loads/changes
  useEffect(() => {
    if (auth.clubId) {
      setClubId(auth.clubId);
      setHealthClubId(auth.clubId);
      setProposalsClubId(auth.clubId);
      loadClubIdFromProfile();
    }
  }, [auth.clubId]);

  // Auto-migrate legacy clubs to new role system
  useEffect(() => {
    const userRoles = auth.user?.user_metadata?.roles || [];
    const hasClubRole = userRoles.includes("club");
    const isLegacyClub = !hasClubRole && !!auth.clubId;

    if (isLegacyClub && isSupabaseReady && supabase) {
      const newRoles = Array.from(new Set([...userRoles, "club"]));
      supabase.auth.updateUser({ data: { roles: newRoles } }).then(() => {
        supabase.auth.refreshSession();
      }).catch(e => console.error("Error auto-migrating legacy club:", e));
    }
  }, [auth.clubId, auth.user]);

  // URL segment → activeModule. Permite deep-link a /crm/<modulo>.
  // Kiosk se maneja aparte (bloque dedicado abajo).
  useEffect(() => {
    if (!mode) return;
    const mod = getModuleFromCrmPath(location.pathname);
    if (!mod) return;
    if (!userRole && (auth.loadingAuth || auth.loadingProfile)) return;
    if (!canAccessModule(userRole, mod)) return;
    if (mod !== activeModule) setActiveModule(mod);
  }, [location.pathname, mode, userRole, activeModule, auth.loadingAuth, auth.loadingProfile]);

  // Navegacion con control de acceso por rol
  const navigateTo = useCallback((mod) => {
    if (!canAccessModule(userRole, mod)) {
      showToast(`Acceso restringido. Tu perfil (${userRole}) no tiene permisos para este modulo.`, "warning");
      return;
    }
    setActiveModule(mod);
    const nextPath = MODULE_TO_URL[mod] || "/crm";
    if (location.pathname !== nextPath) navigate(nextPath);
  }, [userRole, location.pathname, navigate]);

  const handleDemo = useCallback(() => {
    loadDemoState();
    const demoAthletes = JSON.parse(localStorage.getItem("alttez_athletes"));
    const demoHistorial = JSON.parse(localStorage.getItem("alttez_historial"));
    const demoClubInfo = JSON.parse(localStorage.getItem("alttez_clubInfo"));
    const demoMatchStats = JSON.parse(localStorage.getItem("alttez_matchStats"));
    const demoFinanzas = JSON.parse(localStorage.getItem("alttez_finanzas"));
    setAthletes(demoAthletes);
    setHistorial(demoHistorial);
    setClubInfo(demoClubInfo);
    setMatchStats(demoMatchStats);
    setFinanzas(demoFinanzas);
    const requestedModule = getModuleFromCrmPath(location.pathname);
    setActiveModule(requestedModule && canAccessModule("admin", requestedModule) ? requestedModule : "home");
    setMode("demo");
    // Sync demo data to Supabase in background
    if (isSupabaseReady) {
      migrateLocalToSupabase({
        clubInfo: demoClubInfo, athletes: demoAthletes, historial: demoHistorial,
        finanzas: demoFinanzas, matchStats: demoMatchStats, mode: "demo",
      }).then(r => r.success && showToast("Entorno demo sincronizado con la nube.", "info"));
    }
  }, [setAthletes, setHistorial, setClubInfo, setMatchStats, setFinanzas, setMode, setSession, location.pathname]);

  const handleRegister = useCallback(async (form) => {
    // 1. Registrar en Supabase Auth (si disponible)
    if (isSupabaseReady && form.email && form.password) {
      const { session, error } = await signUp({
        email: form.email,
        password: form.password,
        fullName: form.entrenador || form.nombre,
        role: form.role || "admin",
      });
      if (error) {
        showToast(error, "error");
        return;
      }
      // Si signUp no estableció sesión (proyecto con email-confirm), intentar login inmediato
      if (!session) {
        const { error: signInError } = await signIn(form.email, form.password);
        if (signInError) {
          showToast(signInError, "error");
          return;
        }
      }
    }

    // Torneos flow: skip CRM state setup, navigate directly
    if (form.redirectPath) {
      navigate(form.redirectPath);
      return;
    }

    // 2. Configurar estado local (offline-first)
    loadProductionState(form);
    setAthletes(EMPTY_ATHLETES);
    setHistorial(EMPTY_HISTORIAL);
    const newClubInfo = JSON.parse(localStorage.getItem("alttez_clubInfo"));
    setClubInfo(newClubInfo);
    setMatchStats(EMPTY_MATCH_STATS);
    setFinanzas(EMPTY_FINANZAS);
    const requestedModule = getModuleFromCrmPath(location.pathname);
    setActiveModule(requestedModule && canAccessModule(form.role || "admin", requestedModule) ? requestedModule : "home");
    setMode("production");

    // 3. Crear club en Supabase, vincular profile y cargar authProfile
    if (isSupabaseReady) {
      const clubId = await sbCreateClub(form, "production");
      if (clubId) {
        await auth.linkClub(clubId);
        await auth.refreshProfile();
        showToast("Club registrado y sincronizado en la nube.", "info");
      }
    }
  }, [setAthletes, setHistorial, setClubInfo, setMatchStats, setFinanzas, setMode, setSession, auth, navigate, location.pathname]);

  const handleLogin = useCallback(async ({ email, password, redirectPath }) => {
    if (!isSupabaseReady) {
      showToast("Supabase no disponible — usa modo demo", "warning");
      if (redirectPath) navigate(redirectPath);
      return;
    }
    const { user, error } = await signIn(email, password);
    if (error) {
      showToast(error, "error");
      return;
    }

    // Non-CRM destination: skip CRM state setup
    if (redirectPath) {
      showToast(`Bienvenido`, "success");
      navigate(redirectPath);
      return;
    }

    // Esperar a que el AuthProvider cargue el profile
    // (se actualiza vía onAuthStateChange listener en AuthProvider)
    // Verificar que tiene club_id
    const profile = auth.profile;
    if (profile && !profile.club_id) {
      showToast("No se encontro un club vinculado a esta cuenta. Contacta al administrador.", "warning");
      return;
    }

    setMode("production");
    const requestedModule = getModuleFromCrmPath(location.pathname);
    setActiveModule(requestedModule && canAccessModule(auth.role || "admin", requestedModule) ? requestedModule : "home");
    showToast(`Bienvenido, ${auth.fullName || user.email}`, "success");
  }, [setSession, setMode, navigate, auth, location.pathname]);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    // Cerrar sesion via AuthProvider (maneja Supabase Auth)
    await auth.signOut();
    logoutService();
    clearSnapshots();
    setClubId(null);
    setSession(null);
    setAthletes(EMPTY_ATHLETES);
    setHistorial(EMPTY_HISTORIAL);
    setClubInfo(DEFAULT_CLUB);
    setMatchStats(EMPTY_MATCH_STATS);
    setFinanzas(EMPTY_FINANZAS);
    setActiveModule("home");
    setMode(null);
    const dest = getPostLogoutRedirect(location.pathname);
    navigate(dest);
  }, [setAthletes, setHistorial, setClubInfo, setMatchStats, setFinanzas, setMode, setSession, navigate, auth, location]);

  // Guard: si el usuario esta en el CRM (mode activo) pero no tiene rol verificado,
  // y tanto auth como profile ya terminaron de cargar, forzar logout.
  useEffect(() => {
    if (mode && !userRole && !auth.loadingAuth && !auth.loadingProfile && !authVerifying) {
      const logoutId = setTimeout(() => {
        handleLogout();
      }, 0);
      return () => clearTimeout(logoutId);
    }
  }, [mode, userRole, auth.loadingAuth, auth.loadingProfile, authVerifying, handleLogout]);

  // Auto-demo: si llegan desde el portal con ?demo=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "true" && !mode) {
      handleDemo();
      window.history.replaceState({}, "", location.pathname);
    }
  }, [handleDemo, mode, location.pathname]);

  // ── Kiosk mode: URL directa /crm/kiosk — sin auth, sin wrapper ──
  if (location.pathname === "/crm/kiosk") {
    if (!mode) {
      return <Navigate to="/crm" replace />;
    }
    return (
      <Suspense fallback={<LoadingFallback />}>
        <KioskMode />
      </Suspense>
    );
  }

  // ── Redirect a Login si no hay modo ──
  if (!mode && !persistedMode) {
    if (auth.loadingAuth || auth.loadingProfile || auth.isAuthenticated) {
      return <LoadingFallback />;
    }
    return <Navigate to="/auth/login?redirect=/crm" replace />;
  }

  // ── Verificacion rapida mientras Supabase confirma sesion en background ──
  if (!mode && persistedMode && authVerifying) {
    return <LoadingFallback />;
  }

  // ── Onboarding (Progressive Profiling) ──
  if (mode === "production" && auth.isProfileReady && !auth.clubId && userRole !== "admin") {
    return (
      <div style={{ minHeight:"100vh", background:"#FAFAF8", position:"relative" }}>
        <ToastContainer />
        <Suspense fallback={<LoadingFallback />}>
          <CrmOnboarding onComplete={() => window.location.reload()} />
        </Suspense>
      </div>
    );
  }

  const _MiniTopbarLocal = ({ title, accent = C.neon, accentBg = "rgba(200,255,0,0.05)" }) => (
    <MiniTopbar
      title={title}
      accent={accent}
      accentBg={accentBg}
      mode={mode}
      clubName={clubInfo.nombre}
      clubCategory={(clubInfo.categorias || [])[0]}
      onHomeClick={() => navigateTo("home")}
    />
  );

  const isHomeModule = activeModule === "home";

  if (isLoggingOut) {
    return <LoadingFallback />;
  }

  // ── Routing con ErrorBoundary + Suspense por modulo ──
  return (
    <div style={{ minHeight:"100vh", background:isHomeModule ? "#FAFAF8" : C.bg, position:"relative" }}>
      {!isHomeModule && <FieldBackground />}
      <ToastContainer />
      <OfflineBanner />
      <UpdateToast />
      {/* Gate de conversion para modo demo: banner persistente + modal a los 15 min */}
      {mode === "demo" && (
        <Suspense fallback={null}>
          <DemoGate onNavigateToRegister={handleLogout} />
        </Suspense>
      )}
      {/* Padding bottom compensa el banner del DemoGate (52px) en modo demo */}
      <div style={{ position:"relative", zIndex:2, paddingBottom: mode === "demo" ? 60 : 0 }}>
        <Suspense fallback={<LoadingFallback />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ width: "100%", minHeight: "100vh" }}
            >
              {activeModule === "home" && (
                <ErrorBoundary>
                  <Home onNavigate={navigateTo} mode={mode} onLogout={handleLogout} userRole={userRole} onExportBackup={() => { exportBackupJSON(); showToast("Backup descargado correctamente", "success"); }} />
                </ErrorBoundary>
              )}

              {activeModule === "entrenamiento" && (
                <ErrorBoundary>
                  <_MiniTopbarLocal title="Entrenamiento" />
                  <Entrenamiento clubId={auth.clubId || ""} />
                </ErrorBoundary>
              )}

              {activeModule === "plantilla" && (
                <ErrorBoundary>
                  <_MiniTopbarLocal title="Gestion de plantilla" />
                  <GestionPlantilla clubId={auth.clubId || ""} />
                </ErrorBoundary>
              )}

              {activeModule === "miclub" && (
                <ErrorBoundary>
                  <_MiniTopbarLocal title="Mi club" />
                  <MiClub />
                </ErrorBoundary>
              )}

              {activeModule === "admin" && (
                <ErrorBoundary>
                  <_MiniTopbarLocal title="Administracion" accent={C.purple} accentBg="rgba(127,119,221,0.08)" />
                  <Administracion />
                </ErrorBoundary>
              )}

              {activeModule === "calendario" && (
                <ErrorBoundary>
                  <_MiniTopbarLocal title="Calendario" accent={C.bronce} accentBg="rgba(206, 137, 70,0.05)" />
                  <Calendario clubId={auth.clubId || ""} />
                </ErrorBoundary>
              )}

              {activeModule === "partidos" && (
                <ErrorBoundary>
                  <_MiniTopbarLocal title="Match Center" accent={C.bronce} accentBg="rgba(206, 137, 70,0.05)" />
                  <MatchCenter clubId={auth.clubId || ""} />
                </ErrorBoundary>
              )}

              {activeModule === "reportes" && (
                <ErrorBoundary>
                  <_MiniTopbarLocal title="Reportes" />
                  <Reportes onNavigate={navigateTo} />
                </ErrorBoundary>
              )}

              {activeModule === "propuestas" && (
                <ErrorBoundary>
                  <_MiniTopbarLocal title="Propuestas" accent={C.bronce} accentBg="rgba(206, 137, 70,0.06)" />
                  <ProposalsAdminModule clubId={auth.clubId || "local"} mode={mode} />
                </ErrorBoundary>
              )}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>
    </div>
  );
}

export default CRMApp;
