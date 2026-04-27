import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import imgEntrenamiento from "./assets/entrenamiento.jpeg";
import imgPlantilla from "./assets/Gestion_de_plantilla.jpeg";
import imgPartido from "./assets/Partido.jpeg";
import imgOficina from "./assets/Oficina.jpeg";
import imgProximo from "./assets/Proximo_partido.jpeg";
import EmptyState from "../../shared/ui/EmptyState";
import { useStore } from "../../shared/store/useStore";
import { calcStats } from "../../shared/services/storageService";

const COLORS = {
  page: "#FAFAF8",
  pageAlt: "#F5F1EA",
  surface: "#FFFFFF",
  surfaceSoft: "#FCFAF6",
  text: "#171A1C",
  textMuted: "#667085",
  textSoft: "#8E8A83",
  border: "#E9E2D7",
  borderStrong: "#D8CCB9",
  copper: "#C9973A",
  copperHover: "#B7832D",
  copperSoft: "#F4E7CF",
  success: "#2FA56F",
  warning: "#D89A2B",
  danger: "#D95C5C",
  shadow: "0 18px 44px rgba(23, 26, 28, 0.07)",
  shadowHover: "0 22px 50px rgba(23, 26, 28, 0.10)",
};

const NAV_ITEMS = [
  { key: "home", label: "Inicio", navigable: false },
  { key: "entrenamiento", label: "Entrenamiento", navigable: true },
  { key: "plantilla", label: "Gestion de plantilla", navigable: true },
  { key: "calendario", label: "Calendario", navigable: true },
  { key: "admin", label: "Administracion", navigable: true },
  { key: "reportes", label: "Reportes", navigable: true },
  { key: "miclub", label: "Mi Club", navigable: true },
];

const EVENT_COLORS = { match: COLORS.copper, training: COLORS.warning, club: COLORS.success };
const EVENT_LABELS = { match: "Partido", training: "Entrenamiento", club: "Evento" };

const cardEnter = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const ICON_SIZE = 20;

const Icon = {
  Users: ({ color = COLORS.copper }) => (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.8" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Calendar: ({ color = COLORS.copper }) => (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="4" stroke={color} strokeWidth="1.8" />
      <path d="M3 10h18M8 2v4M16 2v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Session: ({ color = COLORS.copper }) => (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Chart: ({ color = COLORS.copper }) => (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Target: ({ color = COLORS.copper }) => (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
      <path d="M12 3v3M21 12h-3M12 18v3M6 12H3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  ArrowUp: ({ color = COLORS.copper }) => (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m7 17 10-10M17 7H9m8 0v8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function getDemoEvents() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = (day, hour = 18, min = 0) => new Date(y, m, day, hour, min).toISOString();
  return [
    { type: "training", title: "Entrenamiento fisico", datetime: d(2, 18, 0), location: "Campo A" },
    { type: "training", title: "Trabajo tactico", datetime: d(4, 18, 0), location: "Campo A" },
    { type: "match", title: "vs Atletico Sur", datetime: d(7, 16, 0), location: "Estadio Local" },
    { type: "training", title: "Rondos y pressing", datetime: d(9, 18, 0), location: "Campo A" },
    { type: "training", title: "Entrenamiento precompeticion", datetime: d(11, 17, 30), location: "Campo B" },
    { type: "match", title: "vs Deportivo Norte", datetime: d(14, 11, 0), location: "Est. Norte" },
    { type: "training", title: "Recuperacion activa", datetime: d(16, 10, 0), location: "Gimnasio" },
    { type: "training", title: "Pautas tacticas jornada", datetime: d(18, 18, 0), location: "Campo A" },
    { type: "club", title: "Jornada de puertas abiertas", datetime: d(19, 10, 0), location: "Campo A" },
    { type: "match", title: "vs Union FC", datetime: d(21, 16, 30), location: "Estadio Local" },
    { type: "training", title: "Ensayo de balon parado", datetime: d(23, 18, 0), location: "Campo A" },
    { type: "training", title: "Entrenamiento tecnico", datetime: d(25, 18, 0), location: "Campo B" },
    { type: "match", title: "vs Racing Club", datetime: d(28, 17, 0), location: "Estadio Racing" },
  ];
}

function getNextEvent() {
  const now = new Date();

  try {
    const rawEvents = localStorage.getItem("alttez_events_");
    if (rawEvents) {
      const customEvents = JSON.parse(rawEvents);
      if (Array.isArray(customEvents) && customEvents.length > 0) {
        const future = customEvents
          .filter((event) => event.datetime && new Date(event.datetime) > now)
          .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        if (future.length > 0) return future[0];
      }
    }
  } catch {
    // Ignore malformed localStorage and keep demo fallback.
  }

  const demoEvents = getDemoEvents();
  const future = demoEvents.filter((event) => new Date(event.datetime) > now).sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  return future[0] || null;
}

function fmtEventDate(iso) {
  const date = new Date(iso);
  const dias = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];
  const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  return `${dias[date.getDay()]} ${date.getDate()} ${meses[date.getMonth()]} · ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}h`;
}

function daysUntil(iso) {
  const diff = Math.ceil((new Date(iso) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Manana";
  return `Faltan ${diff} dias`;
}

function useGameAudio() {
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current && typeof window !== "undefined") {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const playHover = useCallback(() => {
    try {
      const ctx = getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.11);
    } catch {
      // Audio remains optional.
    }
  }, [getCtx]);

  const playSelect = useCallback(() => {
    try {
      const ctx = getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Audio remains optional.
    }
  }, [getCtx]);

  return { playHover, playSelect };
}

function SurfaceCard({ children, style, onClick, onMouseEnter, onMouseLeave, role = "presentation" }) {
  return (
    <motion.div
      variants={cardEnter}
      transition={{ duration: 0.28, ease: "easeOut" }}
      whileHover={onClick ? { y: -3, boxShadow: COLORS.shadowHover } : undefined}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role={role}
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 18,
        boxShadow: COLORS.shadow,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

function PrimaryButton({ children, onClick, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "none",
        borderRadius: 12,
        background: COLORS.copper,
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: "0.01em",
        padding: "14px 22px",
        cursor: "pointer",
        boxShadow: "0 12px 28px rgba(201, 151, 58, 0.24)",
        transition: "background 160ms ease, transform 160ms ease",
        ...style,
      }}
      onMouseEnter={(event) => { event.currentTarget.style.background = COLORS.copperHover; }}
      onMouseLeave={(event) => { event.currentTarget.style.background = COLORS.copper; }}
    >
      {children}
    </button>
  );
}

function HeroModuleCard({
  title,
  description,
  cta,
  image,
  icon,
  onClick,
  playHover,
  playSelect,
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <SurfaceCard
      onClick={() => {
        playSelect();
        onClick();
      }}
      onMouseEnter={() => {
        setHovered(true);
        playHover();
      }}
      onMouseLeave={() => setHovered(false)}
      role="button"
      style={{
        minHeight: 332,
        cursor: "pointer",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: hovered ? "scale(1.03)" : "scale(1)",
          transition: "transform 320ms ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(23,26,28,0.18) 0%, rgba(23,26,28,0.58) 58%, rgba(23,26,28,0.82) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, rgba(23,26,28,0.58) 0%, rgba(23,26,28,0.10) 60%, rgba(23,26,28,0.12) 100%)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", padding: 22 }}>
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 16,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.24)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          {icon}
        </div>
        <div style={{ maxWidth: 320 }}>
          <h2 style={{ margin: 0, color: "#FFFFFF", fontSize: 20, lineHeight: 1.05, fontWeight: 800, letterSpacing: "-0.02em" }}>{title}</h2>
          <p style={{ margin: "12px 0 0", color: "rgba(255,255,255,0.88)", fontSize: 16, lineHeight: 1.5 }}>{description}</p>
          <PrimaryButton style={{ marginTop: 22 }}>{cta} {"\u2192"}</PrimaryButton>
        </div>
      </div>
    </SurfaceCard>
  );
}

export default function Home({ onNavigate, onLogout }) {
  const mode = useStore((state) => state.mode);
  const athletes = useStore((state) => state.athletes);
  const historial = useStore((state) => state.historial);
  const clubInfo = useStore((state) => state.clubInfo);
  const matchStats = useStore((state) => state.matchStats);

  const stats = calcStats(athletes, historial);
  const club = { ...clubInfo, categoria: (clubInfo.categorias || [])[0] || "General" };
  const clubInitials = (club.nombre || "CT").split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase();
  const nextEvent = getNextEvent();
  const { playHover, playSelect } = useGameAudio();

  const metrics = [
    { label: "Plantilla", value: athletes.length, icon: <Icon.Users />, route: "plantilla", caption: "Jugadores registrados" },
    { label: "Partidos", value: matchStats.played, icon: <Icon.Calendar />, route: "partidos", caption: "Proximos compromisos" },
    { label: "Sesiones", value: stats.sesiones, icon: <Icon.Session />, route: "entrenamiento", caption: "Esta semana" },
    { label: "Asistencia", value: `${stats.asistencia}%`, icon: <Icon.Chart />, route: "calendario", caption: "Promedio de sesiones" },
  ];

  const results = [
    { label: "Ganados", value: matchStats.won, detail: "Partidos", color: COLORS.success },
    { label: "Perdidos", value: matchStats.lost, detail: "Partidos", color: COLORS.danger },
    { label: "Puntos", value: matchStats.points, detail: "Acumulados", color: COLORS.text },
    { label: "Goles F/C", value: `${matchStats.goalsFor}-${matchStats.goalsAgainst}`, detail: "Diferencia", color: COLORS.text },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${COLORS.page} 0%, ${COLORS.pageAlt} 100%)`,
        color: COLORS.text,
      }}
    >
      <style>{`
        .crm-home-shell {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 32px 28px;
        }
        .crm-home-header {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid ${COLORS.border};
        }
        .crm-home-header-inner {
          max-width: 1440px;
          margin: 0 auto;
          min-height: 72px;
          padding: 0 32px;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .crm-home-nav {
          display: flex;
          align-items: stretch;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }
        .crm-home-nav-scroll {
          display: flex;
          align-items: stretch;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
          min-width: 0;
        }
        .crm-home-nav-scroll::-webkit-scrollbar {
          display: none;
        }
        .crm-home-kpis {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-top: 18px;
        }
        .crm-home-main {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(320px, 0.9fr);
          gap: 16px;
          margin-top: 18px;
          align-items: start;
        }
        .crm-home-secondary {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(320px, 0.9fr);
          gap: 16px;
          margin-top: 16px;
          align-items: start;
        }
        .crm-home-left-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .crm-home-right-stack {
          display: grid;
          gap: 16px;
        }
        .crm-home-results {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0;
        }
        .crm-home-match {
          margin-top: 18px;
        }
        .crm-home-footer-space {
          height: 8px;
        }
        @media (max-width: 1279px) {
          .crm-home-main {
            grid-template-columns: minmax(0, 1fr);
          }
          .crm-home-secondary {
            grid-template-columns: minmax(0, 1fr);
          }
          .crm-home-right-stack {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 1023px) {
          .crm-home-shell,
          .crm-home-header-inner {
            padding-left: 20px;
            padding-right: 20px;
          }
          .crm-home-header-inner {
            flex-wrap: wrap;
            padding-top: 10px;
            padding-bottom: 10px;
            align-items: flex-start;
          }
          .crm-home-nav {
            order: 3;
            flex-basis: 100%;
          }
          .crm-home-kpis {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .crm-home-left-grid,
          .crm-home-right-stack,
          .crm-home-secondary,
          .crm-home-results {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 767px) {
          .crm-home-shell,
          .crm-home-header-inner {
            padding-left: 14px;
            padding-right: 14px;
          }
          .crm-home-kpis {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      `}</style>

      <header className="crm-home-header">
        <div className="crm-home-header-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            <img
              src="/branding/alttez-symbol-transparent.png"
              alt="ALTTEZ"
              style={{ width: 38, height: 38, objectFit: "contain" }}
              onError={(event) => { event.currentTarget.style.display = "none"; }}
            />
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "0.18em" }}>ALTTEZ</div>
          </div>

          <div className="crm-home-nav">
            <div className="crm-home-nav-scroll">
              {NAV_ITEMS.map(({ key, label, navigable }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigable && onNavigate(key)}
                  style={{
                    position: "relative",
                    border: "none",
                    background: "transparent",
                    color: key === "home" ? COLORS.text : COLORS.textMuted,
                    fontSize: 14,
                    fontWeight: key === "home" ? 700 : 600,
                    padding: "12px 12px 14px",
                    whiteSpace: "nowrap",
                    cursor: navigable ? "pointer" : "default",
                  }}
                >
                  {label}
                  {key === "home" && (
                    <span
                      style={{
                        position: "absolute",
                        left: 12,
                        right: 12,
                        bottom: 0,
                        height: 3,
                        borderRadius: 999,
                        background: COLORS.copper,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto", flexWrap: "wrap", justifyContent: "flex-end" }}>
            {mode === "demo" && (
              <div style={{ border: `1px solid ${COLORS.borderStrong}`, color: COLORS.copper, background: COLORS.surface, borderRadius: 10, padding: "7px 10px", fontSize: 12, fontWeight: 700 }}>
                DEMO
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.surfaceSoft, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "8px 12px" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1F2A37", color: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>
                {clubInitials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>{club.nombre || "Mi Club"}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, whiteSpace: "nowrap" }}>{club.temporada || "Temporada 2024/25"}</div>
              </div>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.surface,
                  color: COLORS.textMuted,
                  padding: "10px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cerrar sesion
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="crm-home-shell">
        <motion.div className="crm-home-kpis" initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
          {metrics.map((metric) => (
            <SurfaceCard
              key={metric.label}
              onClick={() => {
                playSelect();
                onNavigate(metric.route);
              }}
              onMouseEnter={() => playHover()}
              role="button"
              style={{ cursor: "pointer", padding: "22px 24px", minHeight: 102 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ width: 56, height: 56, borderRadius: 18, background: COLORS.pageAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {metric.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, color: COLORS.textMuted, fontWeight: 600 }}>{metric.label}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
                    <div style={{ fontSize: 24, lineHeight: 1, fontWeight: 800 }}>{metric.value}</div>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, color: COLORS.textSoft }}>{metric.caption}</div>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </motion.div>

        {athletes.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: "easeOut" }} style={{ marginTop: 18 }}>
            <SurfaceCard style={{ overflow: "hidden" }}>
              <div style={{ background: COLORS.surface }}>
                <EmptyState
                  icon={<Icon.Users color={COLORS.copper} />}
                  title="Tu plantilla esta vacia"
                  subtitle="Incorpora deportistas a la plantilla para activar el seguimiento de carga, el control de asistencia y los analytics de rendimiento."
                  actionLabel="Registrar primer deportista"
                  onAction={() => onNavigate("plantilla")}
                  compact
                />
              </div>
            </SurfaceCard>
          </motion.div>
        )}

        <div className="crm-home-main">
          <div className="crm-home-left-grid">
            <HeroModuleCard
              title="Entrenamiento"
              description="Planifica sesiones, ejercicios y cargas de trabajo para el equipo."
              cta="Entrar"
              image={imgEntrenamiento}
              icon={<Icon.Target color="#FFFFFF" />}
              onClick={() => onNavigate("entrenamiento")}
              playHover={playHover}
              playSelect={playSelect}
            />

            <HeroModuleCard
              title="Gestion de plantilla"
              description="Administra jugadores, roles, contratos y planificacion deportiva."
              cta="Ver plantilla"
              image={imgPlantilla}
              icon={<Icon.Users color="#FFFFFF" />}
              onClick={() => onNavigate("plantilla")}
              playHover={playHover}
              playSelect={playSelect}
            />
          </div>

          <div className="crm-home-right-stack">
            <SurfaceCard
              onClick={() => {
                playSelect();
                onNavigate("calendario");
              }}
              onMouseEnter={() => playHover()}
              role="button"
              style={{ cursor: "pointer", minHeight: 332, position: "relative" }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${imgPartido})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "brightness(0.84)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(23,26,28,0.08) 0%, rgba(23,26,28,0.36) 54%, rgba(23,26,28,0.82) 100%)",
                }}
              />
              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", padding: 22 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ background: "rgba(23,26,28,0.62)", color: "#FFFFFF", borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
                    PROXIMO EVENTO
                  </span>
                  <span style={{ background: "rgba(255,255,255,0.18)", color: "#FFFFFF", borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 700 }}>
                    {EVENT_LABELS[nextEvent?.type || "match"]}
                  </span>
                </div>
                <div>
                  <div style={{ color: "#FFFFFF", fontSize: 16, fontWeight: 600, opacity: 0.92 }}>Partido</div>
                  <div style={{ marginTop: 8, color: "#FFFFFF", fontSize: 20, lineHeight: 1.08, fontWeight: 800 }}>
                    {nextEvent?.title?.toUpperCase() || "SIN EVENTOS"}
                  </div>
                  <div style={{ display: "grid", gap: 10, marginTop: 18, color: "rgba(255,255,255,0.94)", fontSize: 15 }}>
                    <div>{nextEvent ? fmtEventDate(nextEvent.datetime) : "No hay eventos programados en el calendario."}</div>
                    {nextEvent && <div>{nextEvent.location}</div>}
                    {nextEvent && (
                      <div style={{ color: EVENT_COLORS[nextEvent.type] || COLORS.copper, fontWeight: 700 }}>
                        {daysUntil(nextEvent.datetime)}
                      </div>
                    )}
                  </div>
                  <PrimaryButton style={{ marginTop: 20 }}>Ver calendario {"\u2192"}</PrimaryButton>
                </div>
              </div>
            </SurfaceCard>
          </div>
        </div>

        <motion.div className="crm-home-secondary" initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.05 } } }}>
          <SurfaceCard style={{ padding: "8px 0" }}>
            <div className="crm-home-results">
              {results.map((item, index) => (
                <div
                  key={item.label}
                  style={{
                    padding: "22px 16px",
                    textAlign: "center",
                    borderRight: index === results.length - 1 ? "none" : `1px solid ${COLORS.border}`,
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 800, color: item.color }}>{item.value}</div>
                  <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: COLORS.text }}>{item.label}</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: COLORS.textSoft }}>{item.detail}</div>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard
            onClick={() => {
              playSelect();
              onNavigate("admin");
            }}
            onMouseEnter={() => playHover()}
            role="button"
            style={{ cursor: "pointer", minHeight: 122, position: "relative", background: COLORS.surface }}
          >
            <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${imgOficina})`, backgroundSize: "cover", backgroundPosition: "right center", opacity: 0.2 }} />
            <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, padding: 24, minHeight: 122 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: COLORS.pageAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon.ArrowUp />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, letterSpacing: "0.02em" }}>SALUD FINANCIERA DEL CLUB</div>
                  <div style={{ marginTop: 6, fontSize: 14, color: COLORS.textMuted, lineHeight: 1.5 }}>Resumen general y estados financieros.</div>
                </div>
              </div>
            </div>
          </SurfaceCard>
        </motion.div>

        <div className="crm-home-match">
          <SurfaceCard
            onClick={() => {
              playSelect();
              onNavigate("partidos");
            }}
            onMouseEnter={() => playHover()}
            role="button"
            style={{ cursor: "pointer", position: "relative" }}
          >
            <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${imgProximo})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.09, filter: "grayscale(100%)" }} />
            <div style={{ position: "relative", zIndex: 1, padding: "28px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 22, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, minWidth: 0 }}>
                <div style={{ width: 58, height: 58, borderRadius: 16, border: `1px solid ${COLORS.borderStrong}`, background: COLORS.surfaceSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon.Target />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>Match Center</div>
                  <div style={{ marginTop: 8, fontSize: 16, color: COLORS.textMuted, lineHeight: 1.5 }}>
                    Resultados, estadisticas y analisis de partidos y rivales.
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap", marginLeft: "auto" }}>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", color: COLORS.textMuted, fontSize: 14 }}>
                  <span>Rendimiento</span>
                  <span>Player Cards</span>
                  <span>Analitica Post-Partido</span>
                </div>
                <PrimaryButton>Abrir {"\u2192"}</PrimaryButton>
              </div>
            </div>
          </SurfaceCard>
        </div>

        <div className="crm-home-footer-space" />
      </main>
    </div>
  );
}
