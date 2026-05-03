import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  ClipboardCheck,
  Clock,
  Save,
  Search,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import Planificacion from "./Planificacion";
import { getAvatarUrl as PHOTO } from "../../shared/utils/helpers";
import { PALETTE } from "../../shared/tokens/palette";
import { sanitizeNote } from "../../shared/utils/sanitize";
import EmptyState from "../../shared/ui/EmptyState";
import TabBar from "../../shared/ui/TabBar";
import { showToast } from "../../shared/ui/Toast";
import { useStore } from "../../shared/store/useStore";
import { buildSesion } from "../../shared/services/storageService";
import { takeHealthSnapshot } from "../../shared/services/healthService";
import useSupabaseSync from "../../shared/hooks/useSupabaseSync";
import WellnessCheckIn from "../../shared/ui/WellnessCheckIn";
import { calcSaludActual } from "../../shared/utils/rpeEngine";
import GlassPanel  from "../../shared/ui/GlassPanel";
import SectionLabel from "../../shared/ui/SectionLabel";

// Responsive CSS y keyframes movidos a index.css
const RPE_COLOR = (v) => v <= 3 ? PALETTE.green : v <= 8 ? PALETTE.amber : PALETTE.danger;

/* ── Helper: agrupa sesiones del historial por semana ISO ── */
function groupByWeek(sessions) {
  const weeks = [];
  const weekMap = {};
  sessions.forEach(s => {
    const d = new Date(s.fecha);
    if (isNaN(d.getTime())) {
      const key = "unknown";
      if (!weekMap[key]) { weekMap[key] = { key, label: "FECHA DESCONOCIDA", sessions: [] }; weeks.push(weekMap[key]); }
      weekMap[key].sessions.push(s);
      return;
    }
    const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
    const mon = new Date(d);
    mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    const fmt = (dt) => dt.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
    const key = `${mon.getFullYear()}-W${weekNum}`;
    if (!weekMap[key]) {
      weekMap[key] = { key, weekNum, label: `Semana ${weekNum} — ${fmt(mon)}-${fmt(sun)}`, sessions: [] };
      weeks.push(weekMap[key]);
    }
    weekMap[key].sessions.push(s);
  });
  return weeks;
}

// @keyframes elv_pulse movido a index.css

/* ── Colores por tipo de tarea (Feature C) ── */
const TIPO_COLORS = {
  "Táctica": PALETTE.purple,
  "Tactica": PALETTE.purple,
  "Físico": PALETTE.amber,
  "Fisico": PALETTE.amber,
  "Recuperación": PALETTE.green,
  "Recuperacion": PALETTE.green,
  "Partido": PALETTE.danger,
  "Partido interno": PALETTE.danger,
};

/* ── Mini sparkline de barras — SVG inline, sin librería ── */
function MiniSparkBars({ values, color, height = 24, width = 52 }) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values, 1);
  const n = values.length;
  const barW = Math.floor((width - (n - 1) * 2) / n);
  return (
    <svg width={width} height={height} style={{ display:"block", flexShrink:0 }}>
      {values.map((v, i) => {
        const barH = Math.max(Math.round((v / max) * height), 2);
        const x = i * (barW + 2);
        const y = height - barH;
        return (
          <rect key={i} x={x} y={y} width={barW} height={barH} rx={1}
            fill={color} opacity={i === n - 1 ? 1 : 0.35 + (i / n) * 0.35}
          />
        );
      })}
    </svg>
  );
}

const STATUS_META = {
  P: { label: "Presente", plural: "Presentes", color: PALETTE.success, soft: "#EAF7F0", border: "rgba(47,165,111,0.24)", Icon: UserCheck },
  A: { label: "Ausente", plural: "Ausentes", color: PALETTE.danger, soft: "#FDECEC", border: "rgba(217,92,92,0.24)", Icon: UserX },
  L: { label: "Lesionado", plural: "Lesionados", color: PALETTE.amber, soft: "#FFF5E0", border: "rgba(216,154,43,0.28)", Icon: AlertCircle },
};

const FILTER_OPTIONS = [
  { key: "all", label: "Todos" },
  { key: "P", label: "Presentes" },
  { key: "A", label: "Ausentes" },
  { key: "L", label: "Lesionados" },
];

function formatShortName(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[1][0]}.`;
}

function LiveSessionPanel({ tipo, todayLabel, elapsedLabel, summary, sessionActive }) {
  const kpis = [
    { label: "Tiempo", value: elapsedLabel, Icon: Clock, color: PALETTE.bronce },
    { label: "RPE Reg.", value: `${summary.conRpe}/${summary.presentes}`, Icon: TrendingUp, color: PALETTE.success },
    { label: "RPE Prom.", value: summary.rpeAvg, Icon: BarChart3, color: PALETTE.amber },
    { label: "Sin RPE", value: summary.sinRpe, Icon: Users, color: PALETTE.bronce },
  ];

  return (
    <section className="ent-live-card" aria-label="Sesión en curso">
      <div className="ent-live-header">
        <div className="ent-live-title-group">
          <span className={`ent-live-badge ${sessionActive ? "is-live" : ""}`}>
            <span />
            EN VIVO
          </span>
          <div>
            <h1>Sesión en curso</h1>
            <p>{tipo} <span aria-hidden="true">·</span> {todayLabel}</p>
          </div>
        </div>
        <div className="ent-live-clock">
          <Clock size={16} aria-hidden="true" />
          <span>La sesión comenzó hace <strong>{elapsedLabel}</strong> min</span>
        </div>
      </div>
      <div className="ent-live-kpis">
        {kpis.map(({ label, value, Icon, color }) => (
          <div key={label} className="ent-live-kpi">
            <span className="ent-live-kpi-icon" style={{ color, borderColor: `${color}55`, background: `${color}12` }}>
              <Icon size={20} strokeWidth={1.9} aria-hidden="true" />
            </span>
            <div>
              <span>{label}</span>
              <strong style={{ color }}>{value}</strong>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SummaryCard({ label, value, detail, color, Icon }) {
  return (
    <article className="ent-summary-card">
      <span className="ent-summary-icon" style={{ color, background: `${color}12`, borderColor: `${color}33` }}>
        <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail && <small>{detail}</small>}
      </div>
    </article>
  );
}

function SessionControls({ todayLabel, tipo, setTipo, onClose }) {
  return (
    <div className="ent-tab-actions">
      <span className="ent-date-chip">
        <Calendar size={15} aria-hidden="true" />
        {todayLabel}
      </span>
      <select
        value={tipo}
        onChange={e=>setTipo(e.target.value)}
        className="ent-select"
        aria-label="Tipo de sesión"
      >
        {["Táctica","Físico","Recuperación","Partido interno"].map(t=><option key={t}>{t}</option>)}
      </select>
      <button className="ent-close-session" onClick={onClose}>
        <Save size={15} aria-hidden="true" />
        Cerrar sesión
      </button>
    </div>
  );
}

function FilterPill({ option, active, count, onClick }) {
  return (
    <button
      className={`ent-filter-pill ${active ? "is-active" : ""}`}
      onClick={onClick}
      type="button"
    >
      <span className={`ent-filter-dot ent-filter-dot-${option.key}`} />
      {option.label}
      <small>{count}</small>
    </button>
  );
}

function AthleteCard({ athlete, index, setStatus, setRpe, onWellness }) {
  const meta = STATUS_META[athlete.status] || STATUS_META.P;
  const presente = athlete.status === "P";
  const rpeValue = athlete.rpe ?? "";
  const rpeTone = athlete.rpe ? RPE_COLOR(athlete.rpe) : PALETTE.textMuted;

  const handleRpeChange = (event) => {
    const next = event.target.value;
    if (!next && athlete.rpe != null) {
      setRpe(index, athlete.rpe);
      return;
    }
    if (next) setRpe(index, Number(next));
  };

  return (
    <article
      className={`ent-athlete-card ent-athlete-${athlete.status}`}
      style={{ "--status-color": meta.color, "--status-soft": meta.soft, "--status-border": meta.border }}
    >
      <div className="ent-athlete-photo">
        <img src={PHOTO(athlete.photo)} alt={athlete.name} loading="lazy" />
        <span className="ent-athlete-status">
          <meta.Icon size={13} aria-hidden="true" />
          {meta.label}
        </span>
        {presente && (
          <button
            className="ent-wellness-btn"
            onClick={(event) => { event.stopPropagation(); onWellness(); }}
            title="Check-in wellness"
            type="button"
            aria-label={`Abrir check-in wellness de ${athlete.name}`}
          >
            <Activity size={15} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="ent-athlete-body">
        <div className="ent-athlete-name-row">
          <div>
            <h3 title={athlete.name}>{formatShortName(athlete.name)}</h3>
            <p>{athlete.posCode || "POS"} · {athlete.pos || "Sin posición"}</p>
          </div>
          <span className="ent-rpe-value" style={{ color: rpeTone }}>{athlete.rpe ?? "-"}</span>
        </div>

        <div className="ent-status-switch" aria-label={`Estado de ${athlete.name}`}>
          {[
            ["P", "P", STATUS_META.P],
            ["A", "A", STATUS_META.A],
            ["L", "L", STATUS_META.L],
          ].map(([status, label, statusMeta]) => (
            <button
              key={status}
              type="button"
              className={athlete.status === status ? "is-active" : ""}
              onClick={() => setStatus(index, status)}
              style={athlete.status === status ? { background: statusMeta.soft, color: statusMeta.color, borderColor: statusMeta.border } : undefined}
              aria-pressed={athlete.status === status}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ent-rpe-control">
          <label htmlFor={`rpe-${athlete.id}`}>RPE</label>
          {presente ? (
            <select id={`rpe-${athlete.id}`} value={rpeValue} onChange={handleRpeChange} aria-label={`RPE de ${athlete.name}`}>
              <option value="">-</option>
              {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          ) : (
            <span>-</span>
          )}
        </div>
      </div>
    </article>
  );
}

function SessionSidePanel({ summary }) {
  const total = Math.max(summary.total, 1);
  const presentPct = Math.round((summary.presentes / total) * 100);
  const absentPct = Math.round((summary.ausentes / total) * 100);
  const injuredPct = Math.round((summary.lesionados / total) * 100);
  const rpeNumber = Number(summary.rpeAvg);
  const rpePct = Number.isFinite(rpeNumber) ? Math.min(Math.max(rpeNumber / 10, 0), 1) : 0;
  const rpeLabel = Number.isFinite(rpeNumber)
    ? rpeNumber >= 8 ? "Alta" : rpeNumber >= 5 ? "Moderada" : "Baja"
    : "Sin registro";

  return (
    <aside className="ent-session-side" aria-label="Resumen de la sesión">
      <div className="ent-side-head">
        <h2>Resumen de la sesión</h2>
      </div>

      <section className="ent-side-section">
        <h3>Asistencia</h3>
        <div className="ent-attendance-block">
          <div
            className="ent-donut"
            style={{
              background: `conic-gradient(${PALETTE.success} 0 ${presentPct}%, ${PALETTE.danger} ${presentPct}% ${presentPct + absentPct}%, ${PALETTE.amber} ${presentPct + absentPct}% 100%)`,
            }}
            aria-hidden="true"
          >
            <span>{summary.total}</span>
          </div>
          <div className="ent-attendance-legend">
            {[
              ["Presentes", summary.presentes, presentPct, PALETTE.success],
              ["Ausentes", summary.ausentes, absentPct, PALETTE.danger],
              ["Lesionados", summary.lesionados, injuredPct, PALETTE.amber],
            ].map(([label, value, pct, color]) => (
              <div key={label}>
                <span style={{ background: color }} />
                <strong>{label}</strong>
                <small>{value} ({pct}%)</small>
              </div>
            ))}
            <p>Total {summary.total}</p>
          </div>
        </div>
      </section>

      <section className="ent-side-section">
        <h3>Carga (RPE)</h3>
        <div className="ent-rpe-meter">
          <div className="ent-rpe-meter-track">
            <span style={{ width: `${rpePct * 100}%`, background: Number(summary.rpeAvg) >= 8 ? PALETTE.danger : PALETTE.bronce }} />
          </div>
          <strong>{summary.rpeAvg}</strong>
          <small>{rpeLabel}</small>
          <p>Promedio de presentes</p>
        </div>
      </section>

      <section className="ent-side-section">
        <h3>Distribución de RPE</h3>
        <div className="ent-rpe-bars">
          {summary.rpeDistribution.map(bucket => {
            const height = Math.max((bucket.count / summary.maxRpeBucket) * 72, bucket.count ? 10 : 2);
            return (
              <div key={bucket.label}>
                <strong>{bucket.count}</strong>
                <span style={{ height }} />
                <small>{bucket.label}</small>
              </div>
            );
          })}
        </div>
        <p className="ent-side-footnote">N de deportistas</p>
      </section>

      {summary.sinRpe > 0 && (
        <div className="ent-rpe-alert">
          <AlertCircle size={17} aria-hidden="true" />
          <div>
            <strong>{summary.sinRpe} deportistas sin RPE registrado</strong>
            <span>Recuerda registrar el RPE al final.</span>
          </div>
        </div>
      )}
    </aside>
  );
}

export default function Entrenamiento({ clubId = "" }) {
  const athletes = useStore(state => state.athletes);
  const setAthletes = useStore(state => state.setAthletes);
  const historial = useStore(state => state.historial);
  const setHistorial = useStore(state => state.setHistorial);
  const clubInfo = useStore(state => state.clubInfo);
  const addWellnessLog = useStore(state => state.addWellnessLog);
  const { syncSession, syncHealthSnapshots } = useSupabaseSync();

  const handleGuardar = (n, t) => {
    const sesion = buildSesion(athletes, historial, n, t);
    if (!sesion) {
      showToast("No se pudo guardar la sesión — datos inválidos", "error");
      return;
    }
    setHistorial([sesion, ...historial]);
    const snapshots = takeHealthSnapshot(athletes, [sesion, ...historial], sesion.num);
    showToast(`Sesión #${sesion.num} guardada correctamente`, "success");
    syncSession(sesion);
    if (snapshots?.length) syncHealthSnapshots(snapshots);
  };

  const [tab, setTab] = useState("sesion");
  const [tipo, setTipo] = useState("Táctica");
  const [nota, setNota] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedHist, setExpandedHist] = useState(null);
  const [collapsedWeeks, setCollapsedWeeks] = useState({});

  /* ── Feature B: elapsed timer ── */
  const [elapsed, setElapsed] = useState(0);
  const sessionActive = athletes.some(a => a.status === "P" && a.rpe != null);

  useEffect(() => {
    if (!sessionActive) return;
    const t0 = Date.now();
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [sessionActive]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const fmtElapsed = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  /* ── Feature A: historial agrupado ── */
  const weekGroups = useMemo(() => groupByWeek(historial), [historial]);

  const toggleWeek = (key) => setCollapsedWeeks(prev => ({ ...prev, [key]: !prev[key] }));

  /* ── Feature C: estadísticas por tipo ── */
  const tipoStats = useMemo(() => {
    const counts = {};
    const total = historial.length || 1;
    historial.forEach(s => {
      const t = s.tipo || "Sin tipo";
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [historial]);

  const setStatus = (i, s) => {
    const u = [...athletes];
    u[i] = { ...u[i], status: s, rpe: s !== "P" ? null : u[i].rpe };
    setAthletes(u);
  };

  /** Verifica si un atleta está AUSENTE en el calendario RSVP para hoy */
  const isRsvpAbsent = useCallback((athleteId) => {
    if (!athleteId) return false;
    const cid = clubId || "demo";
    const today = new Date().toISOString().slice(0, 10);
    // Buscar cualquier clave de ausencia para hoy
    for (let k = 0; k < localStorage.length; k++) {
      const key = localStorage.key(k);
      if (key?.startsWith(`alttez_rsvp_absent_${cid}_`) && key.endsWith(`_${athleteId}`) && localStorage.getItem(key) === "1") {
        // Extraer fecha del eventId para verificar si es hoy
        if (key.includes(today)) return true;
      }
    }
    return false;
  }, [clubId]);

  const setRpe = (i, val) => {
    const a = athletes[i];
    if (isRsvpAbsent(a?.id)) {
      showToast("Deportista marcado como AUSENTE en el calendario. No es posible registrar RPE.", "warning");
      return;
    }
    const u = [...athletes];
    u[i] = { ...u[i], rpe: u[i].rpe === val ? null : val };
    setAthletes(u);
  };

  const [wellnessTarget, setWellnessTarget] = useState(null); // { athlete, index }
  const [healthFeedback, setHealthFeedback] = useState(null); // { athleteName, salud, riskLevel, color }
  const feedbackTimerRef = useRef(null);

  const handleWellnessSubmit = (log) => {
    addWellnessLog(log);
    const athlete = wellnessTarget?.athlete;
    if (athlete) {
      const result = calcSaludActual(athlete.rpe, historial, athlete.id);
      setHealthFeedback({
        athleteName: athlete.name.split(" ")[0],
        salud: result.salud,
        riskLevel: result.riskLevel,
        color: result.color,
      });
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => setHealthFeedback(null), 3500);
    }
    setWellnessTarget(null);
  };

  const sessionSummary = useMemo(() => {
    const presentes = athletes.filter(a => a.status === "P");
    const ausentes = athletes.filter(a => a.status === "A");
    const lesionados = athletes.filter(a => a.status === "L");
    const withRpe = presentes.filter(a => a.rpe != null);
    const rpeValues = withRpe.map(a => Number(a.rpe)).filter(Number.isFinite);
    const rpeAvg = rpeValues.length
      ? (rpeValues.reduce((acc, value) => acc + value, 0) / rpeValues.length).toFixed(1)
      : "—";
    const buckets = [
      { label: "1-3", count: rpeValues.filter(v => v >= 1 && v <= 3).length },
      { label: "4-5", count: rpeValues.filter(v => v >= 4 && v <= 5).length },
      { label: "6-7", count: rpeValues.filter(v => v >= 6 && v <= 7).length },
      { label: "8-9", count: rpeValues.filter(v => v >= 8 && v <= 9).length },
      { label: "10", count: rpeValues.filter(v => v === 10).length },
    ];

    return {
      presentes: presentes.length,
      ausentes: ausentes.length,
      lesionados: lesionados.length,
      total: athletes.length,
      conRpe: withRpe.length,
      sinRpe: presentes.length - withRpe.length,
      rpeAvg,
      rpeDistribution: buckets,
      maxRpeBucket: Math.max(...buckets.map(bucket => bucket.count), 1),
      nextSession: (historial[0]?.num || 0) + 1,
    };
  }, [athletes, historial]);

  const visibleAthletes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return athletes
      .map((athlete, index) => ({ athlete, index }))
      .filter(({ athlete }) => statusFilter === "all" || athlete.status === statusFilter)
      .filter(({ athlete }) => {
        if (!q) return true;
        return `${athlete.name} ${athlete.pos} ${athlete.posCode}`.toLowerCase().includes(q);
      });
  }, [athletes, searchTerm, statusFilter]);

  const filterCounts = useMemo(() => ({
    all: athletes.length,
    P: sessionSummary.presentes,
    A: sessionSummary.ausentes,
    L: sessionSummary.lesionados,
  }), [athletes.length, sessionSummary]);

  const todayLabel = new Date().toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "long" });
  const presentPct = sessionSummary.total ? Math.round((sessionSummary.presentes / sessionSummary.total) * 100) : 0;
  const absentPct = sessionSummary.total ? Math.round((sessionSummary.ausentes / sessionSummary.total) * 100) : 0;

  // inp → usar className="field-input" directamente

  return (
    <div className="ent-page">
      <LiveSessionPanel
        tipo={tipo}
        todayLabel={todayLabel}
        elapsedLabel={fmtElapsed(elapsed)}
        summary={sessionSummary}
        sessionActive={sessionActive}
      />

      <div className="ent-summary-grid">
        <SummaryCard
          label="Presentes"
          value={sessionSummary.presentes}
          detail={`${presentPct}% del total`}
          color={PALETTE.success}
          Icon={UserCheck}
        />
        <SummaryCard
          label="Ausentes"
          value={sessionSummary.ausentes}
          detail={`${absentPct}% del total`}
          color={PALETTE.danger}
          Icon={UserX}
        />
        <SummaryCard
          label="RPE promedio"
          value={sessionSummary.rpeAvg}
          detail="Carga moderada"
          color={PALETTE.amber}
          Icon={Activity}
        />
        <SummaryCard
          label="Sesión"
          value={`#${sessionSummary.nextSession}`}
          detail="Temporada actual"
          color={PALETTE.bronce}
          Icon={Calendar}
        />
      </div>

      <div className="entrenamiento-tabs">
        {(() => {
          const TAB_MAP = [
            ["sesion", "Sesión de hoy"],
            ["planificacion", "Planificación"],
            ["historial", "Historial"],
            ["analisis", "Análisis"],
          ];
          const labels = TAB_MAP.map(([, l]) => l);
          const activeLabel = TAB_MAP.find(([k]) => k === tab)?.[1];
          return (
            <TabBar
              className="ent-tabs-bar"
              style={{ flexWrap: "wrap" }}
              scrollable
              tabs={labels}
              active={activeLabel}
              onChange={(label) => {
                const entry = TAB_MAP.find(([, l]) => l === label);
                if (entry) setTab(entry[0]);
              }}
              rightSlot={tab === "sesion" ? (
                <SessionControls
                  todayLabel={todayLabel}
                  tipo={tipo}
                  setTipo={setTipo}
                  onClose={() => handleGuardar(nota, tipo)}
                />
              ) : null}
            />
          );
        })()}
      </div>

      {/* SESIÓN DE HOY — CARTAS */}
      {tab === "sesion" && (
        <div className="ent-session-shell">
          <main className="ent-session-main">
            {athletes.length === 0 ? (
              <EmptyState
                icon={<ClipboardCheck size={32} color={PALETTE.bronce} strokeWidth={1.7} />}
                title="Plantilla lista para el registro"
                subtitle="Ajusta el estado de cada deportista (P/A/L) y registra el RPE para activar el seguimiento de carga"
                compact
              />
            ) : (
              <>
                <div className="ent-session-toolbar">
                  <div>
                    <p>Marca el estado de cada deportista y registra la percepción de esfuerzo (RPE)</p>
                  </div>
                  <label className="ent-search-box">
                    <Search size={16} aria-hidden="true" />
                    <input
                      value={searchTerm}
                      onChange={event => setSearchTerm(event.target.value)}
                      placeholder="Buscar deportista..."
                      aria-label="Buscar deportista"
                    />
                  </label>
                </div>

                <div className="ent-filter-row" aria-label="Filtros de estado">
                  {FILTER_OPTIONS.map(option => (
                    <FilterPill
                      key={option.key}
                      option={option}
                      active={statusFilter === option.key}
                      count={filterCounts[option.key]}
                      onClick={() => setStatusFilter(option.key)}
                    />
                  ))}
                </div>

                <div className="ent-athletes-grid">
                  {visibleAthletes.map(({ athlete, index }) => (
                    <AthleteCard
                      key={athlete.id}
                      athlete={athlete}
                      index={index}
                      setStatus={setStatus}
                      setRpe={setRpe}
                      onWellness={() => setWellnessTarget({ athlete, index })}
                    />
                  ))}
                </div>

                <label className="ent-notes-card">
                  <span>Observaciones técnicas</span>
                  <textarea
                    value={nota}
                    onChange={e=>setNota(sanitizeNote(e.target.value))}
                    placeholder="Objetivos trabajados, incidencias o directivas para el cuerpo técnico..."
                    rows={2}
                    maxLength={500}
                  />
                </label>
              </>
            )}
          </main>

          {athletes.length > 0 && <SessionSidePanel summary={sessionSummary} />}
        </div>
      )}

      {tab === "planificacion" && (
        <Planificacion athletes={athletes} clubInfo={clubInfo} sessionCount={historial.length} />
      )}

      {/* ── Feature A: Historial agrupado por semana/microciclo ── */}
      {tab === "historial" && (
        <div style={{ padding:16 }}>
          {weekGroups.length === 0 && (
            <EmptyState
              icon={
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={PALETTE.purpleVibrant} strokeWidth="1.8"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke={PALETTE.purpleVibrant} strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke={PALETTE.purpleVibrant} strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke={PALETTE.purpleVibrant} strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              }
              title="Sin microciclos registrados"
              subtitle="Cuando registres tu primera sesion, el historial de carga comenzara a construirse aqui por semana"
              compact
            />
          )}
          {weekGroups.map(week => {
            const isCollapsed = !!collapsedWeeks[week.key];
            const weekRpeAvg = week.sessions.filter(s => s.rpeAvg != null).length > 0
              ? (week.sessions.reduce((sum, s) => sum + (s.rpeAvg || 0), 0) / week.sessions.filter(s => s.rpeAvg != null).length).toFixed(1)
              : "—";
            return (
              <div key={week.key} style={{ marginBottom:8 }}>
                {/* Week header */}
                <div
                  onClick={() => toggleWeek(week.key)}
                  style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 16px", background:`linear-gradient(135deg,${PALETTE.violetDim},rgba(124,58,237,0.04))`, borderLeft:`3px solid ${PALETTE.purple}`, cursor:"pointer", marginBottom:2, boxShadow:"0 2px 12px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.03)", borderRadius:"0 6px 6px 0" }}
                >
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:PALETTE.purple, textTransform:"uppercase", letterSpacing:"1.5px" }}>
                      {week.label}
                    </div>
                    <div style={{ fontSize:9, color:"#667085", textTransform:"uppercase", letterSpacing:"1px", marginTop:2 }}>
                      {week.sessions.length} sesión{week.sessions.length !== 1 ? "es" : ""} · RPE prom: {weekRpeAvg}
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:"#98A2B3" }}>{isCollapsed ? "▶" : "▼"}</div>
                </div>
                {/* Sessions inside week */}
                {!isCollapsed && week.sessions.map((s, i) => {
                  const globalIdx = `${week.key}-${i}`;
                  const isExpanded = expandedHist === globalIdx;
                  const asistPct = s.total > 0 ? Math.round((s.presentes / s.total) * 100) : 0;
                  const rpeNum = Number(s.rpeAvg);
                  const rpeColor = isNaN(rpeNum) ? "rgba(255,255,255,0.3)" : rpeNum <= 3 ? PALETTE.green : rpeNum <= 7 ? PALETTE.amber : PALETTE.danger;
                  const tipoColor = TIPO_COLORS[s.tipo] || "rgba(255,255,255,0.4)";

                  // Atletas con RPE individual guardado en la sesion
                  const rpeEntries = s.rpeByAthlete ? Object.entries(s.rpeByAthlete) : [];

                  return (
                    <div key={globalIdx} style={{ marginLeft:12 }}>
                      {/* Session row header */}
                      <div
                        className="ent-session-header"
                        onClick={() => setExpandedHist(isExpanded ? null : globalIdx)}
                        style={{
                          background:"rgba(0,0,0,0.6)",
                          border:"1px solid #D8D0C8",
                          borderLeft:`3px solid ${tipoColor}`,
                          padding:"12px 16px",
                          display:"flex",
                          justifyContent:"space-between",
                          alignItems:"center",
                          marginBottom:2,
                          cursor:"pointer",
                          transition:"background 0.15s ease",
                        }}
                      >
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ fontSize:13, fontWeight:600, color:"#1F1F1D" }}>Sesion #{s.num} — {s.fecha}</div>
                            <div style={{ fontSize:9, fontWeight:600, textTransform:"uppercase", letterSpacing:"1px", color:tipoColor, padding:"2px 6px", border:`1px solid ${tipoColor}33`, borderRadius:4 }}>{s.tipo || "Sin tipo"}</div>
                          </div>
                          <div style={{ fontSize:10, color:"#667085", marginTop:3, display:"flex", gap:12 }}>
                            <span>{s.presentes}/{s.total} presentes ({asistPct}%)</span>
                            <span>RPE: <span style={{ color:rpeColor, fontWeight:600 }}>{s.rpeAvg ?? "—"}</span></span>
                          </div>
                        </div>
                        <div style={{ fontSize:11, color:"#98A2B3", marginLeft:12 }}>{isExpanded ? "▲" : "▼"}</div>
                      </div>

                      {/* Expanded: reporte de sesion completo */}
                      {isExpanded && (
                        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderLeft:`3px solid ${tipoColor}33`, padding:16, marginBottom:4, marginLeft:0 }}>

                          {/* Fila de stats de sesion */}
                          <div style={{ display:"flex", gap:20, marginBottom:16, flexWrap:"wrap" }}>
                            {[
                              { lbl:"Tipo", val: s.tipo || "Sin tipo", color: tipoColor },
                              { lbl:"Asistencia", val: `${asistPct}%`, color: asistPct >= 75 ? PALETTE.green : PALETTE.amber },
                              { lbl:"RPE promedio", val: s.rpeAvg ?? "—", color: rpeColor },
                              { lbl:"Presentes", val: `${s.presentes}/${s.total}`, color:"#1F1F1D" },
                            ].map((stat, si) => (
                              <div key={si}>
                                <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"1px", color:"rgba(255,255,255,0.25)", marginBottom:3 }}>{stat.lbl}</div>
                                <div style={{ fontSize:15, fontWeight:700, color:stat.color }}>{stat.val}</div>
                              </div>
                            ))}
                          </div>

                          {/* Observaciones / nota */}
                          <div style={{ marginBottom: rpeEntries.length > 0 ? 16 : 0 }}>
                            <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"1px", color:"rgba(255,255,255,0.25)", marginBottom:6 }}>Observaciones</div>
                            <div style={{ fontSize:12, color: s.nota ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)", fontStyle: s.nota ? "normal" : "italic", lineHeight:1.5 }}>
                              {s.nota || "Sin observaciones registradas."}
                            </div>
                          </div>

                          {/* RPE individual por atleta */}
                          {rpeEntries.length > 0 && (
                            <div>
                              <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"1px", color:"rgba(255,255,255,0.25)", marginBottom:8 }}>RPE individual</div>
                              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:6 }}>
                                {rpeEntries
                                  .sort((a, b) => Number(b[1]) - Number(a[1]))
                                  .map(([athleteId, rpe]) => {
                                    const athlete = athletes.find(a => String(a.id) === String(athleteId));
                                    const rpeVal = Number(rpe);
                                    const barColor = rpeVal <= 3 ? PALETTE.green : rpeVal <= 7 ? PALETTE.amber : PALETTE.danger;
                                    return (
                                      <div
                                        key={athleteId}
                                        className="ent-athlete-rpe-row"
                                        style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 8px", borderRadius:6, background:"rgba(0,0,0,0.3)" }}
                                      >
                                        <div style={{ fontSize:11, color:"#1F1F1D", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                          {athlete ? athlete.name : `#${athleteId}`}
                                        </div>
                                        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                                          <div style={{ width:40, height:3, background:"rgba(255,255,255,0.08)", borderRadius:2, overflow:"hidden" }}>
                                            <div style={{ height:"100%", width:`${(rpeVal / 10) * 100}%`, background:barColor }} />
                                          </div>
                                          <div style={{ fontSize:11, fontWeight:700, color:barColor, width:14, textAlign:"right" }}>{rpeVal}</div>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}

                          {/* Guardado en */}
                          {s.savedAt && (
                            <div style={{ marginTop:12, fontSize:9, color:"rgba(255,255,255,0.15)" }}>
                              Guardado: {new Date(s.savedAt).toLocaleString("es-CO", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* ── ANÁLISIS tab — datos reales desde localStorage/historial ── */}
      {tab === "analisis" && (() => {
        /* Metricas calculadas desde datos reales */
        const totalSesiones = historial.length;
        const sesionesConRpe = historial.filter(s => s.rpeAvg != null && s.rpeAvg !== "—");
        const rpeGlobal = sesionesConRpe.length > 0
          ? (sesionesConRpe.reduce((s, h) => s + Number(h.rpeAvg), 0) / sesionesConRpe.length).toFixed(1)
          : "—";
        const picoRpe = sesionesConRpe.length > 0
          ? Math.max(...sesionesConRpe.map(h => Number(h.rpeAvg))).toFixed(1)
          : "—";
        const asistenciaGlobal = totalSesiones > 0
          ? Math.round((historial.reduce((s, h) => s + h.presentes, 0) / historial.reduce((s, h) => s + h.total, 0)) * 100)
          : 0;

        /* Agrupacion tecnico vs fisico con RPE promedio por categoria */
        const categorias = {
          "Tecnico/Tactico": { tipos: ["Táctica", "Tactica"], count: 0, rpeSum: 0, rpeN: 0, color: PALETTE.purple },
          "Fisico":          { tipos: ["Físico", "Fisico"],   count: 0, rpeSum: 0, rpeN: 0, color: PALETTE.amber },
          "Competitivo":     { tipos: ["Partido", "Partido interno"], count: 0, rpeSum: 0, rpeN: 0, color: PALETTE.danger },
          "Recuperacion":    { tipos: ["Recuperación", "Recuperacion"], count: 0, rpeSum: 0, rpeN: 0, color: PALETTE.green },
        };
        historial.forEach(s => {
          for (const [, cfg] of Object.entries(categorias)) {
            if (cfg.tipos.includes(s.tipo)) {
              cfg.count++;
              if (s.rpeAvg != null && s.rpeAvg !== "—") { cfg.rpeSum += Number(s.rpeAvg); cfg.rpeN++; }
              break;
            }
          }
        });
        const maxCount = Math.max(...Object.values(categorias).map(c => c.count), 1);

        // Sparkline data: ultimas 8 sesiones para tendencia visual
        const last8 = historial.slice(0, 8).reverse();
        const sparkAsist = last8.map(s => s.total > 0 ? Math.round((s.presentes / s.total) * 100) : 0);
        const sparkRpeArr = last8.map(s => Number(s.rpeAvg) || 0);
        const sparkSesiones = last8.map((_, i) => i + 1);

        const kpiItems = [
          {
            label: "Asistencia promedio",
            value: asistenciaGlobal + "%",
            color: PALETTE.green,
            spark: sparkAsist,
            hint: asistenciaGlobal >= 80 ? "Excelente nivel" : asistenciaGlobal >= 60 ? "Nivel aceptable" : "Mejorar asistencia",
          },
          {
            label: "RPE promedio",
            value: rpeGlobal,
            color: rpeGlobal !== "—" ? (Number(rpeGlobal) <= 4 ? PALETTE.green : Number(rpeGlobal) <= 7 ? PALETTE.amber : PALETTE.danger) : "rgba(255,255,255,0.4)",
            spark: sparkRpeArr,
            hint: "Carga promedio del ciclo",
          },
          {
            label: "Pico RPE",
            value: picoRpe,
            color: picoRpe !== "—" ? (Number(picoRpe) <= 6 ? PALETTE.amber : PALETTE.danger) : "rgba(255,255,255,0.4)",
            spark: sparkRpeArr.map(v => v > 0 ? v : 0),
            hint: "Sesion de mayor carga",
          },
          {
            label: "Sesiones totales",
            value: totalSesiones,
            color:"#1F1F1D",
            spark: sparkSesiones,
            hint: `${totalSesiones} sesion${totalSesiones !== 1 ? "es" : ""} registrada${totalSesiones !== 1 ? "s" : ""}`,
          },
        ];

        return (
          <div style={{ padding:16 }}>
            {/* KPIs interactivas con sparklines */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10, marginBottom:16 }}>
              {kpiItems.map((m, i) => (
                <div
                  key={i}
                  className="ent-kpi-card"
                  onClick={() => setTab("historial")}
                  style={{
                    background: PALETTE.surface,
                    border:`1px solid ${PALETTE.border}`,
                    borderRadius:16,
                    padding:14,
                    boxShadow:"0 14px 28px rgba(23,26,28,0.08)",
                    cursor:"pointer",
                    position:"relative",
                    overflow:"hidden",
                  }}
                >
                  
                  <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:PALETTE.textMuted, marginBottom:8 }}>{m.label}</div>
                  <div style={{ fontSize:24, fontWeight:700, color:m.color, lineHeight:1, marginBottom:8 }}>{m.value}</div>
                  <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:4 }}>
                    <div style={{ fontSize:9, color:PALETTE.textMuted, lineHeight:1.4, flex:1 }}>{m.hint}</div>
                    {m.spark.length > 1 && (
                      <MiniSparkBars values={m.spark} color={m.color === "white" ? PALETTE.textMuted : m.color} />
                    )}
                  </div>
                  <div style={{ marginTop:10, paddingTop:8, borderTop:`1px solid ${PALETTE.border}`, fontSize:8, color:PALETTE.textMuted, textTransform:"uppercase", letterSpacing:"0.1em" }}>
                    Ver historial →
                  </div>
                </div>
              ))}
            </div>

            {/* Grafico de barras verticales: Tecnico vs Fisico vs Competitivo vs Recuperacion */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
              <GlassPanel padding="md">
                <SectionLabel style={{ marginBottom:16 }}>Distribucion por categoria</SectionLabel>
                <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-around", height:120, gap:8 }}>
                  {Object.entries(categorias).map(([cat, cfg]) => {
                    const h = maxCount > 0 ? Math.max((cfg.count / maxCount) * 100, cfg.count > 0 ? 8 : 0) : 0;
                    return (
                      <div key={cat} style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1, height:"100%", justifyContent:"flex-end" }}>
                        <div style={{ fontSize:12, fontWeight:700, color: cfg.color, marginBottom:4 }}>{cfg.count}</div>
                        <div style={{ width:"100%", maxWidth:40, height:`${h}%`, background: cfg.color, minHeight: cfg.count > 0 ? 4 : 0, transition:"height 0.4s ease", borderRadius:"2px 2px 0 0" }} />
                        <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"0.05em", color:PALETTE.textMuted, marginTop:6, textAlign:"center", lineHeight:1.2 }}>{cat}</div>
                      </div>
                    );
                  })}
                </div>
              </GlassPanel>

              {/* RPE promedio por categoria */}
              <GlassPanel padding="md">
                <SectionLabel style={{ marginBottom:16 }}>RPE promedio por categoria</SectionLabel>
                <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-around", height:120, gap:8 }}>
                  {Object.entries(categorias).map(([cat, cfg]) => {
                    const avg = cfg.rpeN > 0 ? (cfg.rpeSum / cfg.rpeN) : 0;
                    const h = avg > 0 ? Math.max((avg / 10) * 100, 8) : 0;
                    const rpeColor = avg <= 3 ? PALETTE.green : avg <= 7 ? PALETTE.amber : PALETTE.danger;
                    return (
                      <div key={cat} style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1, height:"100%", justifyContent:"flex-end" }}>
                        <div style={{ fontSize:12, fontWeight:700, color: rpeColor, marginBottom:4 }}>{avg > 0 ? avg.toFixed(1) : "—"}</div>
                        <div style={{ width:"100%", maxWidth:40, height:`${h}%`, background: rpeColor, minHeight: avg > 0 ? 4 : 0, transition:"height 0.4s ease", borderRadius:"2px 2px 0 0", opacity: avg > 0 ? 1 : 0.2 }} />
                        <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"0.05em", color:PALETTE.textMuted, marginTop:6, textAlign:"center", lineHeight:1.2 }}>{cat}</div>
                      </div>
                    );
                  })}
                </div>
              </GlassPanel>
            </div>

            {/* Barras horizontales por tipo detallado */}
            <GlassPanel padding="md">
              <SectionLabel style={{ marginBottom:14 }}>Detalle por tipo de tarea</SectionLabel>
              {tipoStats.length === 0 && (
                <div style={{ fontSize:11, color:PALETTE.textMuted, textAlign:"center", padding:16 }}>Sin datos</div>
              )}
              {tipoStats.map(t => {
                const color = TIPO_COLORS[t.name] || PALETTE.textMuted;
                return (
                  <div key={t.name} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
                      <div style={{ fontSize:11, fontWeight:600, color:PALETTE.text, textTransform:"uppercase", letterSpacing:"0.05em" }}>{t.name}</div>
                      <div style={{ fontSize:10, color:PALETTE.textMuted }}>
                        {t.count} sesion{t.count !== 1 ? "es" : ""} · <span style={{ color, fontWeight:600 }}>{t.pct}%</span>
                      </div>
                    </div>
                    <div style={{ width:"100%", height:6, background:PALETTE.bgDeep, borderRadius:999 }}>
                      <div style={{ width:`${t.pct}%`, height:"100%", background:color, transition:"width 0.4s ease" }} />
                    </div>
                  </div>
                );
              })}
            </GlassPanel>
          </div>
        );
      })()}

      {/* ── Wellness Check-in Overlay ── */}
      <AnimatePresence>
        {wellnessTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(23,26,28,0.28)",
              backdropFilter: "blur(6px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setWellnessTarget(null)}
          >
            <div onClick={e => e.stopPropagation()}>
              <WellnessCheckIn
                athleteId={wellnessTarget.athlete.id}
                athleteName={wellnessTarget.athlete.name}
                clubId={clubId}
                onSubmit={handleWellnessSubmit}
                onClose={() => setWellnessTarget(null)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Health Feedback Toast ── */}
      <AnimatePresence>
        {healthFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            style={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.98)",
              backdropFilter: "blur(20px)",
              border: `1px solid ${healthFeedback.color}44`,
              borderRadius: 16,
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              zIndex: 10000,
              boxShadow: `0 18px 34px rgba(23,26,28,0.12), 0 0 0 1px ${healthFeedback.color}16`,
              minWidth: 240,
            }}
          >
            {/* Health gauge mini */}
            <div style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: `3px solid ${healthFeedback.color}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              background: `${healthFeedback.color}12`,
            }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: healthFeedback.color, lineHeight: 1 }}>
                {healthFeedback.salud}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: PALETTE.text }}>
                {healthFeedback.athleteName} — Bateria actualizada
              </div>
              <div style={{ fontSize: 9, color: healthFeedback.color, textTransform: "uppercase", letterSpacing: "1px", marginTop: 2 }}>
                {healthFeedback.riskLevel === "optimo" ? "Estado optimo" :
                 healthFeedback.riskLevel === "precaucion" ? "Precaucion" :
                 healthFeedback.riskLevel === "riesgo" ? "En riesgo" : "Sin datos"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



