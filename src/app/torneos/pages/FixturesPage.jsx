import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  List, Trophy, RefreshCw, X, Check, BarChart2, CalendarPlus, 
  Calendar, Share2, Clock, Settings, MapPin, User, Zap, ChevronRight, Tag, ChevronDown, Search, MoreHorizontal
} from "lucide-react";
import { useTorneosStore } from "../store/useTorneosStore";
import { generarFixture, calcularPosiciones } from "../utils/fixturesEngine";
import ModuleEmptyState from "../components/shared/ModuleEmptyState";
import AlttezLoader from "../components/shared/AlttezLoader";
import { showToast } from "../../../shared/ui/Toast";
import { PALETTE, ELEVATION } from "../../../shared/tokens/palette";

const CU     = PALETTE.bronce;
const CU_DIM = PALETTE.bronceDim;
const CU_BOR = PALETTE.bronceBorder;
const CARD   = PALETTE.surface;
const BG     = PALETTE.bg;
const TEXT   = PALETTE.text;
const MUTED  = PALETTE.textMuted;
const HINT   = PALETTE.textHint;
const BORDER = PALETTE.border;
const ELEV   = ELEVATION?.card ?? "0 10px 28px rgba(23,26,28,0.07)";
const FONT   = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
const EASE   = [0.22, 1, 0.36, 1];

const ESTADO_CFG = {
  programado: { label: "Programado",  color: PALETTE.success, dot: PALETTE.success },
  propuesto:  { label: "Propuesto",   color: HINT,            dot: HINT },
  aplazado:   { label: "Aplazado",    color: PALETTE.error ?? "#EF4444", dot: PALETTE.error ?? "#EF4444" },
  en_curso:   { label: "En curso",    color: "#F59E0B",           dot: "#F59E0B" },
  finalizado: { label: "Finalizado",  color: CU,              dot: CU },
  pendiente:  { label: "Pendiente",   color: MUTED,           dot: MUTED },
};

const FASE_LABELS = {
  liga:          "Liga",
  grupos:        "Grupos",
  octavos:       "Octavos de final",
  cuartos:       "Cuartos de final",
  semis:         "Semifinales",
  final:         "Final",
  tercer_puesto: "Tercer puesto",
};

const DIAS = [
  { d: 1, label: "L" }, { d: 2, label: "M" }, { d: 3, label: "X" },
  { d: 4, label: "J" }, { d: 5, label: "V" }, { d: 6, label: "S" },
  { d: 0, label: "D" },
];

// ── Components ───────────────────────────────────────────────────────────────

function MatchCard({ partido, equipos, arbitros, onClick, compact = false }) {
  const local   = equipos.find(e => e.id === partido.equipoLocalId);
  const visita  = equipos.find(e => e.id === partido.equipoVisitaId);
  const arbitro = arbitros?.find(a => a.id === partido.arbitroId);
  const cfg     = ESTADO_CFG[partido.estado] ?? ESTADO_CFG.pendiente;
  const fecha   = partido.fechaHora ? new Date(partido.fechaHora) : null;
  const isDone  = partido.estado === "finalizado";

  return (
    <motion.div
      whileHover={onClick ? { y: -2, boxShadow: "0 8px 24px rgba(23,26,28,0.1)" } : {}}
      onClick={onClick}
      style={{
        background: CARD, borderRadius: 12,
        border: `1px solid ${isDone ? `${CU}33` : BORDER}`,
        padding: compact ? "12px 14px" : "16px 18px",
        boxShadow: ELEV,
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.2s, border-color 0.2s",
        fontFamily: FONT,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: compact ? 8 : 12 }}>
        <span style={{
          fontSize: 9, fontWeight: 700, color: CU,
          background: CU_DIM, border: `1px solid ${CU_BOR}`,
          borderRadius: 4, padding: "2px 6px", letterSpacing: "0.08em",
        }}>
          {FASE_LABELS[partido.fase] ?? partido.fase}
          {partido.grupo ? ` · ${partido.grupo}` : ""}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
          <span style={{ fontSize: 10, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 7, justifyContent: "flex-end", minWidth: 0 }}>
          <span style={{ fontSize: compact ? 12 : 13, fontWeight: 700, color: TEXT, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {local?.nombre ?? "TBD"}
          </span>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: local?.color ?? CU, flexShrink: 0 }} />
        </div>

        {isDone ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
            background: BG, borderRadius: 8, padding: "4px 12px",
            border: `1px solid ${BORDER}`,
          }}>
            <span style={{ fontSize: compact ? 15 : 18, fontWeight: 800, color: TEXT, minWidth: 16, textAlign: "center" }}>{partido.golesLocal}</span>
            <span style={{ fontSize: 10, color: HINT, fontWeight: 600 }}>–</span>
            <span style={{ fontSize: compact ? 15 : 18, fontWeight: 800, color: TEXT, minWidth: 16, textAlign: "center" }}>{partido.golesVisita}</span>
          </div>
        ) : (
          <div style={{
            fontSize: 11, fontWeight: 800, color: CU,
            background: CU_DIM, border: `1px solid ${CU_BOR}`,
            borderRadius: 6, padding: "4px 10px", flexShrink: 0,
            letterSpacing: "0.04em",
          }}>VS</div>
        )}

        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 7, justifyContent: "flex-start", minWidth: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: visita?.color ?? BORDER, flexShrink: 0 }} />
          <span style={{ fontSize: compact ? 12 : 13, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {visita?.nombre ?? "TBD"}
          </span>
        </div>
      </div>

      {!compact && (fecha || partido.lugar || arbitro) && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${BORDER}`, flexWrap: "wrap" }}>
          {fecha && (
            <span style={{ fontSize: 10, color: MUTED }}>
              📅 {fecha.toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "short" })} · {fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          {partido.lugar && <span style={{ fontSize: 10, color: HINT }}>🏟 {partido.lugar}</span>}
          {arbitro && <span style={{ fontSize: 10, color: HINT }}>👤 {arbitro.nombre}</span>}
        </div>
      )}
    </motion.div>
  );
}

function ResultModal({ partido, equipos, onSave, onClose }) {
  const [gl, setGl] = useState(partido.golesLocal  ?? 0);
  const [gv, setGv] = useState(partido.golesVisita ?? 0);
  const local  = equipos.find(e => e.id === partido.equipoLocalId)?.nombre ?? "Local";
  const visita = equipos.find(e => e.id === partido.equipoVisitaId)?.nombre ?? "Visita";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(23,26,28,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, fontFamily: FONT }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18, ease: EASE }} style={{ background: CARD, borderRadius: 16, padding: 28, width: 380, boxShadow: "0 24px 64px rgba(23,26,28,0.2)", border: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Registrar resultado</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, padding: 4 }}><X size={15} /></button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 10 }}>{local}</div>
            <input type="number" min={0} max={99} value={gl} onChange={e => setGl(Math.max(0, Number(e.target.value)))} style={{ width: 64, height: 64, textAlign: "center", fontSize: 28, fontWeight: 800, border: `2px solid ${BORDER}`, borderRadius: 12, color: TEXT, background: BG, fontFamily: FONT, outline: "none" }} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: HINT, padding: "0 4px", marginTop: 20 }}>–</div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 10 }}>{visita}</div>
            <input type="number" min={0} max={99} value={gv} onChange={e => setGv(Math.max(0, Number(e.target.value)))} style={{ width: 64, height: 64, textAlign: "center", fontSize: 28, fontWeight: 800, border: `2px solid ${BORDER}`, borderRadius: 12, color: TEXT, background: BG, fontFamily: FONT, outline: "none" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1px solid ${BORDER}`, background: "transparent", fontSize: 13, color: MUTED, fontFamily: FONT, cursor: "pointer" }}>Cancelar</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => onSave(gl, gv)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: CU, color: "#FFF", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Check size={14} />Guardar
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function GenerateFixtureModal({ torneo, category, equipos, onConfirm, onClose }) {
  const [ini, setIni] = useState(torneo.fechaInicio || "");
  const [fin, setFin] = useState(torneo.fechaFin    || "");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(23,26,28,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, fontFamily: FONT }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={{ background: CARD, borderRadius: 16, padding: 28, width: 420, boxShadow: "0 24px 64px rgba(23,26,28,0.2)", border: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: TEXT }}>Generar Fixture: {category}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, padding: 4 }}><X size={16} /></button>
        </div>
        <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, lineHeight: 1.5 }}>Confirma el periodo para organizar las fechas de esta categoría.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, display: "block", marginBottom: 5 }}>FECHA DE INICIO</label>
              <input type="date" value={ini} onChange={e => setIni(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, display: "block", marginBottom: 5 }}>FECHA DE FIN</label>
              <input type="date" value={fin} onChange={e => setFin(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ padding: 12, background: BG, borderRadius: 10, border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>Equipos en {category}: {equipos.length}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "none", fontSize: 13, fontWeight: 700, color: MUTED, cursor: "pointer" }}>Cancelar</button>
          <button onClick={() => onConfirm(ini, fin)} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: CU, fontSize: 13, fontWeight: 700, color: "#FFF", cursor: "pointer" }}>Generar Fixture</button>
        </div>
      </motion.div>
    </div>
  );
}



// ── Unified Root ─────────────────────────────────────────────────────────────

export default function FixturesPage({ onGoTorneos }) {
  const torneoActivoId     = useTorneosStore(s => s.torneoActivoId);
  const allTorneos         = useTorneosStore(s => s.torneos);
  const allEquipos         = useTorneosStore(s => s.equipos);
  const allPartidos        = useTorneosStore(s => s.partidos);
  const allSedes           = useTorneosStore(s => s.sedes);
  const allArbitros        = useTorneosStore(s => s.arbitros);
  
  const setPartidos        = useTorneosStore(s => s.setPartidos);
  const registrarResultado = useTorneosStore(s => s.registrarResultado);
  const autoSchedulePartidos = useTorneosStore(s => s.autoSchedulePartidos);
  const actualizarCfg      = useTorneosStore(s => s.actualizarSchedulingConfig);
  const agregarSede        = useTorneosStore(s => s.agregarSede);
  const eliminarSede       = useTorneosStore(s => s.eliminarSede);
  const agregarArbitro     = useTorneosStore(s => s.agregarArbitro);
  const eliminarArbitro    = useTorneosStore(s => s.eliminarArbitro);
  const actualizarTorneo   = useTorneosStore(s => s.actualizarTorneo);

  const [tab, setTab] = useState("fixture"); 
  const [selectedCat, setSelectedCat] = useState(null);
  const [modalPartido, setModalPartido] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showGenModal, setShowGenModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newSede, setNewSede] = useState({ nombre: "" });
  const [newArbitro, setNewArbitro] = useState({ nombre: "" });

  // Scheduling state
  const [schedRound, setSchedRound] = useState(1);
  const [schedFrom, setSchedFrom] = useState("");
  const [schedTo, setSchedTo] = useState("");

  // Fixture tab state
  const [expandedDates, setExpandedDates] = useState({});
  const [filterJornada, setFilterJornada] = useState("Todas las jornadas");
  const [filterQuery, setFilterQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos los estados");

  const toggleDate = (key) => setExpandedDates(prev => ({ ...prev, [key]: !prev[key] }));

  if (!torneoActivoId) {
    return (
      <ModuleEmptyState icon={List} title="Selecciona un torneo" subtitle="Abre un torneo para ver y gestionar sus fixtures." ctaLabel="Ver torneos" onCta={onGoTorneos} />
    );
  }

  const torneo   = allTorneos.find(t => t.id === torneoActivoId) ?? null;
  const categories = useMemo(() => [...new Set(allEquipos.filter(e => e.torneoId === torneoActivoId).map(e => e.grupo || "General"))].sort(), [allEquipos, torneoActivoId]);
  
  const activeCat = selectedCat || categories[0];
  const equiposCat = allEquipos.filter(e => e.torneoId === torneoActivoId && (e.grupo || "General") === activeCat);
  const partidosCat = allPartidos.filter(p => p.torneoId === torneoActivoId && (p.grupo || "General") === activeCat);
  
  const arbitros = allArbitros.filter(a => a.torneoId === torneoActivoId);
  const sedes    = allSedes.filter(s => s.torneoId === torneoActivoId);
  const cfg      = torneo?.schedulingConfig ?? { diasDisponibles: [6, 0], horaInicio: "10:00", horaFin: "22:00" };

  const toggleDia = (d) => {
    const actuales = cfg.diasDisponibles ?? [];
    const nuevos = actuales.includes(d) ? actuales.filter(x => x !== d) : [...actuales, d];
    actualizarCfg(torneoActivoId, { diasDisponibles: nuevos });
  };

  const handleConfirmGenerar = async (fechaInicio, fechaFin) => {
    if (!fechaFin) { showToast("Debes especificar la fecha de fin", "error"); return; }
    setShowGenModal(false);
    setIsGenerating(true);
    try {
      await actualizarTorneo(torneoActivoId, { fechaInicio, fechaFin });
      
      const catConfig = torneo?.categorias?.find(c => c.nombre === activeCat);
      const tempTorneo = { ...torneo, fechaInicio, fechaFin };
      if (catConfig) {
        tempTorneo.formato = catConfig.format;
        tempTorneo.fases = catConfig.fases;
        tempTorneo.vueltas = catConfig.vueltas;
      }
      
      const ps = generarFixture(tempTorneo, equiposCat);
      
      // Solo actualizamos los de ESTA categoría
      const others = allPartidos.filter(p => p.torneoId === torneoActivoId && (p.grupo || "General") !== activeCat);
      await setPartidos(torneoActivoId, [...others, ...ps.map(p => ({ ...p, grupo: activeCat }))]);
      showToast("Fixture generado con éxito", "success");
    } finally { setIsGenerating(false); }
  };

  const handleGenerar = () => {
    if (equiposCat.length < 2) { showToast("Necesitas al menos 2 equipos en esta categoría", "error"); return; }
    if (partidosCat.length > 0 && !window.confirm(`Se borrará el fixture de ${activeCat}. ¿Continuar?`)) return;
    
    if (torneo?.fechaInicio && torneo?.fechaFin) {
      handleConfirmGenerar(torneo.fechaInicio, torneo.fechaFin);
    } else {
      setShowGenModal(true);
    }
  };

  const maxRound = useMemo(() => Math.max(0, ...partidosCat.map(p => p.ronda || 0)), [partidosCat]);

  const handleSchedRound = async () => {
    if (!schedFrom) { showToast("Define la fecha de inicio", "error"); return; }
    
    const roundMatches = partidosCat.filter(p => p.ronda === Number(schedRound));
    if (!roundMatches.length) { showToast("No hay partidos en esta fecha", "error"); return; }
    
    // Distribuir partidos entre días disponibles y horarios
    const diasOk = cfg.diasDisponibles ?? [6, 0];
    const horaInicio = cfg.horaInicio || "10:00";
    const intervaloMin = 90; // minutos entre partidos
    
    let currentDate = new Date(schedFrom + "T" + horaInicio);
    const end = schedTo ? new Date(schedTo + "T23:59:00") : currentDate;
    
    const scheduled = roundMatches.map((match, i) => {
      // Avanzar al siguiente día disponible si la hora excede horaFin
      while (!diasOk.includes(currentDate.getDay())) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(...horaInicio.split(":").map(Number), 0);
      }
      
      // Asegurar formato YYYY-MM-DDTHH:MM:SS
      const tzOffset = currentDate.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(currentDate.getTime() - tzOffset)).toISOString().slice(0, -1);

      const fechaHora = localISOTime;
      const sedeId = sedes.length ? sedes[i % sedes.length].id : null;
      const arbitroId = arbitros.length ? arbitros[i % arbitros.length].id : null;
      
      // Avanzar intervalo
      currentDate = new Date(currentDate.getTime() + intervaloMin * 60000);
      
      return { ...match, fechaHora, sedeId, arbitroId, estado: "programado" };
    });
    
    // Merge con los demás partidos
    const others = allPartidos.filter(p => 
      !(p.torneoId === torneoActivoId && (p.grupo||"General") === activeCat && p.ronda === Number(schedRound))
    );
    await setPartidos(torneoActivoId, [...others.filter(p=>p.torneoId===torneoActivoId), ...scheduled]);
    showToast(`Fecha ${schedRound}: ${scheduled.length} partidos programados`, "success");
  };

  const tabla = calcularPosiciones(partidosCat, equiposCat);
  const groups = partidosCat.reduce((acc, p) => {
    const key = p.fechaHora ? new Date(p.fechaHora).toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "long" }) : `Fecha ${p.ronda || 1}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});
  
  const groupKeys = useMemo(() => {
    return Object.keys(groups).sort((a, b) => {
      if (a.startsWith("Fecha ") && b.startsWith("Fecha ")) {
        return parseInt(a.replace("Fecha ", "")) - parseInt(b.replace("Fecha ", ""));
      }
      const pA = groups[a][0];
      const pB = groups[b][0];
      if (pA.fechaHora && pB.fechaHora) return new Date(pA.fechaHora) - new Date(pB.fechaHora);
      return (pA.ronda || 0) - (pB.ronda || 0);
    });
  }, [groups]);

  // Enforce first group expanded by default if not set
  useMemo(() => {
    if (groupKeys.length > 0 && expandedDates[groupKeys[0]] === undefined) {
      setExpandedDates({ [groupKeys[0]]: true });
    }
  }, [groupKeys]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: FONT }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: "-0.03em" }}>Gestión de Torneo</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 13, color: MUTED }}>Categoría:</span>
            <select value={activeCat} onChange={e => setSelectedCat(e.target.value)} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 700, color: CU, outline: "none" }}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, background: CARD, padding: 4, borderRadius: 12, border: `1px solid ${BORDER}` }}>
          {[{ id: "fixture", label: "Fixture", icon: Trophy }, { id: "programacion", label: "Programación", icon: Settings }, { id: "tabla", label: "Tabla", icon: BarChart2 }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, border: "none", background: tab === t.id ? CU : "transparent", color: tab === t.id ? "#FFF" : MUTED, fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: "pointer", transition: "all 0.2s" }}><t.icon size={14} /> {t.label}</button>
          ))}
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: tab === "programacion" ? "1fr" : "1fr 320px", gap: 24 }}>
        <main>
          <AnimatePresence mode="wait">
            {tab === "fixture" && (() => {
              const totalPartidos = partidosCat.length;
              const jugados = partidosCat.filter(p => p.estado === "finalizado").length;
              const programados = partidosCat.filter(p => p.estado === "programado").length;
              const pendientes = totalPartidos - jugados - programados;
              const proximos = partidosCat.filter(p => p.estado === "programado").sort((a,b) => new Date(a.fechaHora) - new Date(b.fechaHora)).slice(0, 3);

              return (
              <motion.div key="f" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {partidosCat.length === 0 ? (
                  <div style={{ background: CARD, borderRadius: 20, padding: 60, textAlign: "center", border: `1px solid ${BORDER}`, boxShadow: ELEVATION.card }}>
                    <Trophy size={48} color={CU_BOR} style={{ margin: "0 auto 20px" }} />
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 8 }}>Sin fixture en {activeCat}</h3>
                    <p style={{ color: MUTED, fontSize: 14, marginBottom: 24 }}>Genera los partidos base para esta categoría.</p>
                    <button onClick={handleGenerar} style={{ background: CU, color: "#FFF", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, cursor: "pointer", boxShadow: ELEVATION.card }}>Generar Fixture</button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
                    {/* Left: Main Fixture List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                      {/* Filters */}
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, background: CARD, padding: 16, borderRadius: 16, border: `1px solid ${BORDER}` }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, display: "block", marginBottom: 6 }}>JORNADA / FECHA</label>
                          <div style={{ position: "relative" }}>
                            <Calendar size={14} color={MUTED} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                            <select value={filterJornada} onChange={e => setFilterJornada(e.target.value)} style={{ width: "100%", ...inputStyle, paddingLeft: 32 }}>
                              <option value="Todas las jornadas">Todas las jornadas</option>
                              {groupKeys.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                          </div>
                        </div>
                        <div style={{ flex: 1.5 }}>
                          <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, display: "block", marginBottom: 6 }}>BUSCAR EQUIPO</label>
                          <div style={{ position: "relative" }}>
                            <Search size={14} color={MUTED} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                            <input type="text" placeholder="Buscar equipo..." value={filterQuery} onChange={e => setFilterQuery(e.target.value)} style={{ width: "100%", ...inputStyle, paddingLeft: 32 }} />
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, display: "block", marginBottom: 6 }}>ESTADO</label>
                          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={{ width: "100%", ...inputStyle }}>
                            <option value="Todos los estados">Todos los estados</option>
                            <option value="programado">Programado</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="finalizado">Finalizado</option>
                          </select>
                        </div>
                        <button onClick={handleGenerar} style={{ height: 38, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "0 16px", color: MUTED, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                          <RefreshCw size={14} /> Regenerar
                        </button>
                      </div>

                      {/* Dates List */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {groupKeys.filter(k => filterJornada === "Todas las jornadas" || k === filterJornada).map((key, i) => {
                          const isExpanded = expandedDates[key] || false;
                          let filteredMatches = groups[key];
                          if (filterEstado !== "Todos los estados") {
                            filteredMatches = filteredMatches.filter(m => m.estado === filterEstado);
                          }
                          if (filterQuery) {
                            const q = filterQuery.toLowerCase();
                            filteredMatches = filteredMatches.filter(m => {
                              const l = allEquipos.find(e => e.id === m.equipoLocalId)?.nombre?.toLowerCase() || "";
                              const v = allEquipos.find(e => e.id === m.equipoVisitaId)?.nombre?.toLowerCase() || "";
                              return l.includes(q) || v.includes(q);
                            });
                          }
                          if (filteredMatches.length === 0) return null;

                          return (
                            <div key={key} style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden", transition: "all 0.2s", boxShadow: isExpanded ? "0 4px 12px rgba(0,0,0,0.03)" : "none" }}>
                              {/* Header */}
                              <div onClick={() => toggleDate(key)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", cursor: "pointer", userSelect: "none", background: isExpanded ? BG : "transparent" }}>
                                <motion.div animate={{ rotate: isExpanded ? 0 : -90 }} transition={{ duration: 0.2 }}>
                                  <ChevronDown size={18} color={MUTED} />
                                </motion.div>
                                <Calendar size={16} color={CU} />
                                <span style={{ fontSize: 15, fontWeight: 800, color: TEXT, textTransform: "capitalize", letterSpacing: "-0.01em" }}>{key}</span>
                                <div style={{ flex: 1 }} />
                                <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "2px 8px" }}>{filteredMatches.length} partidos</span>
                              </div>

                              {/* Content */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                                    <div style={{ padding: "0 20px 20px" }}>
                                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                        <thead>
                                          <tr style={{ borderBottom: `1px solid ${BORDER}`, color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            <th style={{ padding: "8px 0", textAlign: "left", width: 60, fontWeight: 600 }}>Hora</th>
                                            <th style={{ padding: "8px 0", textAlign: "left", width: 120, fontWeight: 600 }}>Cancha</th>
                                            <th style={{ padding: "8px 0", textAlign: "right", flex: 1, fontWeight: 600 }}>Local</th>
                                            <th style={{ padding: "8px 16px", textAlign: "center", width: 80, fontWeight: 600 }}>Resultado</th>
                                            <th style={{ padding: "8px 0", textAlign: "left", flex: 1, fontWeight: 600 }}>Visitante</th>
                                            <th style={{ padding: "8px 0", textAlign: "center", width: 100, fontWeight: 600 }}>Estado</th>
                                            <th style={{ padding: "8px 0", width: 40 }}></th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {filteredMatches.map(m => {
                                            const local = allEquipos.find(e => e.id === m.equipoLocalId);
                                            const visita = allEquipos.find(e => e.id === m.equipoVisitaId);
                                            const hora = m.fechaHora ? new Date(m.fechaHora).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "--:--";
                                            const sede = sedes.find(s => s.id === m.sedeId)?.nombre || "Sin cancha";
                                            const est = ESTADO_CFG[m.estado] || ESTADO_CFG.pendiente;

                                            return (
                                              <tr key={m.id} style={{ borderBottom: `1px solid ${BORDER}`, cursor: "pointer" }} onClick={() => setModalPartido(m)}>
                                                <td style={{ padding: "12px 0", color: TEXT, fontWeight: 600 }}>{hora}</td>
                                                <td style={{ padding: "12px 0", color: MUTED }}>{sede}</td>
                                                <td style={{ padding: "12px 0", textAlign: "right" }}>
                                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                                                    <span style={{ fontWeight: 700, color: TEXT }}>{local?.nombre || "TBD"}</span>
                                                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: local?.color || BORDER }} />
                                                  </div>
                                                </td>
                                                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                                  <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "4px 8px", fontWeight: 800, color: CU, fontSize: 12 }}>VS</div>
                                                </td>
                                                <td style={{ padding: "12px 0", textAlign: "left" }}>
                                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: visita?.color || BORDER }} />
                                                    <span style={{ fontWeight: 700, color: TEXT }}>{visita?.nombre || "TBD"}</span>
                                                  </div>
                                                </td>
                                                <td style={{ padding: "12px 0", textAlign: "center" }}>
                                                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: est.bg, border: `1px solid ${est.color}33`, padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700, color: est.color }}>
                                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: est.dot }} /> {est.label.toUpperCase()}
                                                  </div>
                                                </td>
                                                <td style={{ padding: "12px 0", textAlign: "center" }}>
                                                  <button style={{ background: "none", border: "none", color: MUTED, cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setModalPartido(m); }}>
                                                    <MoreHorizontal size={16} />
                                                  </button>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Summary Sidebar */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                          <Calendar size={16} color={CU} /><h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TEXT }}>Resumen del fixture</h4>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div style={{ background: BG, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "12px", textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: MUTED, fontWeight: 700, marginBottom: 4 }}>TOTAL PARTIDOS</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: TEXT }}>{totalPartidos}</div>
                          </div>
                          <div style={{ background: BG, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "12px", textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: MUTED, fontWeight: 700, marginBottom: 4 }}>JUGADOS</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: PALETTE.success }}>{jugados}</div>
                          </div>
                          <div style={{ background: BG, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "12px", textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: MUTED, fontWeight: 700, marginBottom: 4 }}>PENDIENTES</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: PALETTE.amber }}>{pendientes}</div>
                          </div>
                          <div style={{ background: BG, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "12px", textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: MUTED, fontWeight: 700, marginBottom: 4 }}>REPROGRAMADOS</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: CU }}>0</div>
                          </div>
                        </div>
                      </section>

                      <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Clock size={16} color={CU} /><h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TEXT }}>Próximos encuentros</h4>
                          </div>
                          <span style={{ fontSize: 11, color: CU, fontWeight: 700, cursor: "pointer" }}>Ver todos</span>
                        </div>
                        {proximos.length === 0 ? (
                          <div style={{ fontSize: 12, color: MUTED, textAlign: "center", padding: "20px 0" }}>No hay partidos programados.</div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {proximos.map(m => {
                              const local = allEquipos.find(e => e.id === m.equipoLocalId)?.nombre;
                              const visita = allEquipos.find(e => e.id === m.equipoVisitaId)?.nombre;
                              const date = new Date(m.fechaHora);
                              return (
                                <div key={m.id} style={{ background: BG, borderRadius: 10, border: `1px solid ${BORDER}`, padding: 12 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase" }}>{date.toLocaleDateString("es-CO", { day: "2-digit", month: "short" })} · {date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</span>
                                    <span style={{ fontSize: 9, fontWeight: 700, color: PALETTE.success, background: PALETTE.successDim, padding: "2px 6px", borderRadius: 8 }}>PROGRAMADO</span>
                                  </div>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{local}</div>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: TEXT, marginTop: 4 }}>{visita}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <button onClick={() => setTab("programacion")} style={{ width: "100%", marginTop: 16, background: CU, color: "#FFF", border: "none", borderRadius: 8, padding: "10px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <CalendarPlus size={14} /> Configurar programación
                        </button>
                      </section>
                    </div>
                  </div>
                )}
              </motion.div>
            );
            })()}

            {tab === "programacion" && (() => {
                  // Collect scheduled matches with dates
                  const matchesWithDate = partidosCat.filter(p => p.fechaHora);
                  const matchesByDate = matchesWithDate.reduce((acc, p) => {
                    const key = new Date(p.fechaHora).toISOString().slice(0, 10);
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(p);
                    return acc;
                  }, {});
                  const scheduledDates = Object.keys(matchesByDate);
                  const totalScheduled = matchesWithDate.length;
                  const totalPending = partidosCat.length - totalScheduled;

                  return (
              <motion.div key="p" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                      {/* Stats bar */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                        {[
                          { label: "Total partidos", value: partidosCat.length, color: TEXT },
                          { label: "Programados", value: totalScheduled, color: PALETTE.success },
                          { label: "Sin programar", value: totalPending, color: totalPending > 0 ? PALETTE.amber ?? "#F59E0B" : HINT },
                          { label: "Fechas usadas", value: scheduledDates.length, color: CU },
                        ].map(s => (
                          <div key={s.label} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "14px 16px", textAlign: "center" }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
                            <div style={{ fontSize: 10, fontWeight: 600, color: MUTED, marginTop: 2, letterSpacing: "0.04em" }}>{s.label.toUpperCase()}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        {/* Left: Calendar grid + date list */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                          {/* Scheduled matches list */}
                          <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                              <Calendar size={18} color={CU} /><h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Calendario de Partidos</h4>
                            </div>
                            {scheduledDates.length === 0 ? (
                              <div style={{ padding: "32px 16px", textAlign: "center", color: HINT, fontSize: 13 }}>
                                <Calendar size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                                <div style={{ fontWeight: 600 }}>Sin partidos programados</div>
                                <div style={{ fontSize: 12, marginTop: 4 }}>Programa fechas usando las herramientas de abajo.</div>
                              </div>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {scheduledDates.sort().map(dateKey => {
                                  const d = new Date(dateKey + "T12:00:00");
                                  const dayLabel = d.toLocaleDateString("es-CO", { weekday: "long", day: "2-digit", month: "long" });
                                  const matches = matchesByDate[dateKey];
                                  return (
                                    <div key={dateKey} style={{ background: BG, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                                      <div style={{ padding: "10px 14px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: CU, textTransform: "capitalize" }}>{dayLabel}</span>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "2px 8px" }}>{matches.length} partido{matches.length !== 1 ? "s" : ""}</span>
                                      </div>
                                      <div style={{ padding: "8px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                                        {matches.map(m => {
                                          const local = allEquipos.find(e => e.id === m.equipoLocalId)?.nombre ?? "TBD";
                                          const visita = allEquipos.find(e => e.id === m.equipoVisitaId)?.nombre ?? "TBD";
                                          const hora = m.fechaHora ? new Date(m.fechaHora).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "";
                                          const sede = sedes.find(s => s.id === m.sedeId)?.nombre;
                                          const arb = arbitros.find(a => a.id === m.arbitroId)?.nombre;
                                          const estado = ESTADO_CFG[m.estado] ?? ESTADO_CFG.pendiente;
                                          return (
                                            <motion.div 
                                              key={m.id} 
                                              whileHover={{ scale: 1.01, backgroundColor: "#FDFBF7", borderColor: CU_BOR }}
                                              onClick={() => setSelectedMatch({ partido: m, local, visita, sede, arbitro, hora })}
                                              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderBottom: `1px solid ${BORDER}`, cursor: "pointer", borderRadius: 8, transition: "all 0.2s" }}
                                            >
                                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: estado.dot, flexShrink: 0, boxShadow: `0 0 0 3px ${estado.dot}20` }} />
                                              <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                  {local} vs {visita}
                                                </div>
                                                <div style={{ fontSize: 11, color: HINT, display: "flex", gap: 12, marginTop: 4 }}>
                                                  {hora && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} /> {hora}</span>}
                                                  {sede && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} /> {sede}</span>}
                                                  {arb && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><User size={11} /> {arb}</span>}
                                                </div>
                                              </div>
                                              <span style={{ fontSize: 10, fontWeight: 800, color: estado.color, flexShrink: 0, background: `${estado.color}15`, padding: "4px 8px", borderRadius: 6 }}>{estado.label.toUpperCase()}</span>
                                            </motion.div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </section>
                        </div>

                        {/* Right: scheduling tools */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                          {/* Days & hours */}
                          <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                              <CalendarPlus size={18} color={CU} /><h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Días y Horarios Base</h4>
                            </div>
                            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                              {DIAS.map(d => {
                                const active = (cfg.diasDisponibles ?? []).includes(d.d);
                                return <button key={d.d} onClick={() => toggleDia(d.d)} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${active ? CU_BOR : BORDER}`, background: active ? CU_DIM : "transparent", color: active ? CU : MUTED, fontWeight: 700, cursor: "pointer" }}>{d.label}</button>;
                              })}
                            </div>
                            <div style={{ display: "flex", gap: 12 }}>
                              <div style={{ flex: 1 }}><label style={{ fontSize: 10, fontWeight: 700, color: MUTED, display: "block", marginBottom: 5 }}>INICIO</label><input type="time" value={cfg.horaInicio} onChange={e => actualizarCfg(torneoActivoId, { horaInicio: e.target.value })} style={inputStyle} /></div>
                              <div style={{ flex: 1 }}><label style={{ fontSize: 10, fontWeight: 700, color: MUTED, display: "block", marginBottom: 5 }}>FIN</label><input type="time" value={cfg.horaFin} onChange={e => actualizarCfg(torneoActivoId, { horaFin: e.target.value })} style={inputStyle} /></div>
                            </div>
                          </section>

                          {/* Sedes */}
                          <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                              <MapPin size={18} color={CU} /><h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Sedes</h4>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                              {sedes.map(s => <div key={s.id} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "4px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>{s.nombre} <X size={12} onClick={() => eliminarSede(s.id)} style={{ cursor: "pointer" }} /></div>)}
                            </div>
                            <div style={{ display: "flex", gap: 8 }}><input type="text" placeholder="Nueva sede..." value={newSede.nombre} onChange={e => setNewSede({ nombre: e.target.value })} style={inputStyle} /><button onClick={() => { if(newSede.nombre) { agregarSede(torneoActivoId, newSede); setNewSede({ nombre: "" }); }}} style={{ background: CU_DIM, color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 8, padding: "0 12px", cursor: "pointer" }}>+</button></div>
                          </section>

                          {/* Árbitros */}
                          <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                              <User size={18} color={CU} /><h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Árbitros</h4>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                              {arbitros.map(a => <div key={a.id} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "4px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>{a.nombre} <X size={12} onClick={() => eliminarArbitro(a.id)} style={{ cursor: "pointer" }} /></div>)}
                            </div>
                            <div style={{ display: "flex", gap: 8 }}><input type="text" placeholder="Nuevo árbitro..." value={newArbitro.nombre} onChange={e => setNewArbitro({ nombre: e.target.value })} style={inputStyle} /><button onClick={() => { if(newArbitro.nombre) { agregarArbitro(torneoActivoId, newArbitro); setNewArbitro({ nombre: "" }); }}} style={{ background: CU_DIM, color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 8, padding: "0 12px", cursor: "pointer" }}>+</button></div>
                          </section>

                          {/* Schedule by round (Moved to bottom) */}
                          <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                              <Zap size={18} color={CU} /><h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Programar Jornada</h4>
                            </div>
                            <div style={{ background: BG, borderRadius: 12, padding: 16, marginBottom: 12 }}>
                              <div style={{ marginBottom: 12 }}>
                                <label style={{ fontSize: 10, fontWeight: 700, color: MUTED }}>SELECCIONAR FECHA (RONDA)</label>
                                <select value={schedRound} onChange={e => setSchedRound(e.target.value)} style={{ ...inputStyle, marginTop: 4 }}>
                                  {Array.from({ length: maxRound || 1 }).map((_, i) => <option key={i + 1} value={i + 1}>Fecha {i + 1}</option>)}
                                </select>
                              </div>
                              <div style={{ display: "flex", gap: 8 }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ fontSize: 10, fontWeight: 700, color: MUTED }}>DESDE</label>
                                  <input type="date" value={schedFrom} onChange={e => setSchedFrom(e.target.value)} style={inputStyle} />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <label style={{ fontSize: 10, fontWeight: 700, color: MUTED }}>HASTA</label>
                                  <input type="date" value={schedTo} onChange={e => setSchedTo(e.target.value)} style={inputStyle} />
                                </div>
                              </div>
                              <button onClick={handleSchedRound} style={{ width: "100%", marginTop: 14, background: CU, color: "#FFF", border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                <Zap size={14} /> Programar Fecha {schedRound}
                              </button>
                            </div>
                          </section>
                        </div>
                      </div>
              </motion.div>
                  );
                })()}

            {tab === "tabla" && (
              <motion.div key="t" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 24 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${BORDER}`, color: MUTED, textAlign: "center" }}>
                      <th style={{ padding: 12, width: 40 }}>#</th><th style={{ padding: 12, textAlign: "left" }}>EQUIPO</th><th style={{ padding: 12 }}>PJ</th><th style={{ padding: 12 }}>PG</th><th style={{ padding: 12 }}>PE</th><th style={{ padding: 12 }}>PP</th><th style={{ padding: 12 }}>DG</th><th style={{ padding: 12, fontWeight: 800, color: CU }}>PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabla.map((t, i) => (
                      <tr key={t.equipoId} style={{ borderBottom: `1px solid ${BORDER}`, textAlign: "center" }}><td style={{ padding: 12, fontWeight: 800 }}>{i + 1}</td><td style={{ padding: 12, textAlign: "left", fontWeight: 700 }}>{t.nombre}</td><td style={{ padding: 12 }}>{t.pj}</td><td style={{ padding: 12 }}>{t.pg}</td><td style={{ padding: 12 }}>{t.pe}</td><td style={{ padding: 12 }}>{t.pp}</td><td style={{ padding: 12, color: t.dg >= 0 ? PALETTE.success : PALETTE.danger }}>{t.dg > 0 ? `+${t.dg}` : t.dg}</td><td style={{ padding: 12, fontWeight: 900, color: CU, background: CU_DIM }}>{t.pts}</td></tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {tab !== "programacion" && (
          <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Clock size={18} color={CU} /><h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Próximos Partidos</h4>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {partidosCat.filter(p => p.estado === "programado").slice(0, 3).map(p => (
                  <div key={p.id} style={{ padding: 10, borderRadius: 10, background: BG, border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: CU, marginBottom: 4 }}>{p.fase.toUpperCase()}</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{allEquipos.find(e => e.id === p.equipoLocalId)?.nombre} vs {allEquipos.find(e => e.id === p.equipoVisitaId)?.nombre}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setTab("programacion")} style={{ width: "100%", marginTop: 16, background: "none", border: `1.5px solid ${CU_BOR}`, color: CU, borderRadius: 8, padding: "8px", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Configurar Programación</button>
            </section>
          </aside>
        )}
      </div>

      <AnimatePresence>
        {modalPartido && (
          <ResultModal partido={modalPartido} equipos={allEquipos} onSave={async (gl, gv) => { await registrarResultado(modalPartido.id, gl, gv); setModalPartido(null); }} onClose={() => setModalPartido(null)} />
        )}
        {showGenModal && (
          <GenerateFixtureModal torneo={torneo} category={activeCat} equipos={equiposCat} onConfirm={handleConfirmGenerar} onClose={() => setShowGenModal(false)} />
        )}
        {selectedMatch && (
          <MatchDetailsModal 
            partido={selectedMatch.partido} 
            local={selectedMatch.local} 
            visita={selectedMatch.visita} 
            sede={selectedMatch.sede} 
            arbitro={selectedMatch.arbitro} 
            hora={selectedMatch.hora} 
            onClose={() => setSelectedMatch(null)} 
          />
        )}
        {isGenerating && <AlttezLoader fullScreen text="Generando Fixture..." />}
      </AnimatePresence>
    </motion.div>
  );
}

function MatchDetailsModal({ partido, local, visita, sede, arbitro, hora, onClose }) {
  const mapLink = sede ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sede)}` : null;
  const estado = ESTADO_CFG[partido.estado] ?? ESTADO_CFG.pendiente;
  const isDone = partido.estado === "finalizado";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: CARD, width: 400, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: "hidden", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
        <button onClick={onClose} style={{ position: "absolute", right: 16, top: 16, background: "none", border: "none", cursor: "pointer", color: MUTED, display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}><X size={20} /></button>
        <div style={{ padding: "24px 24px 16px", textAlign: "center", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: estado.color, background: estado.color + "15", padding: "6px 14px", borderRadius: 12, display: "inline-block", marginBottom: 20, letterSpacing: "0.04em" }}>{estado.label.toUpperCase()}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <div style={{ flex: 1, textAlign: "right", fontSize: 16, fontWeight: 800 }}>{local !== "TBD" ? local : "Por definir"}</div>
            {isDone ? (
              <div style={{ fontSize: 24, fontWeight: 900, color: CU, background: CU_DIM, padding: "4px 16px", borderRadius: 12 }}>{partido.golesLocal} - {partido.golesVisita}</div>
            ) : (
              <div style={{ fontSize: 14, fontWeight: 800, color: MUTED, background: BG, padding: "4px 12px", borderRadius: 12 }}>VS</div>
            )}
            <div style={{ flex: 1, textAlign: "left", fontSize: 16, fontWeight: 800 }}>{visita !== "TBD" ? visita : "Por definir"}</div>
          </div>
        </div>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {hora && (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Clock size={18} color={CU} /></div>
              <div><div style={{ fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: "0.04em" }}>HORA</div><div style={{ fontSize: 14, fontWeight: 700 }}>{hora}</div></div>
            </div>
          )}
          {sede && (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}><MapPin size={18} color={CU} /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: "0.04em" }}>SEDE / CANCHA</div><div style={{ fontSize: 14, fontWeight: 700 }}>{sede}</div></div>
              <a href={mapLink} target="_blank" rel="noopener noreferrer" style={{ padding: "8px 12px", background: "#E8F0FE", color: "#1A73E8", borderRadius: 8, fontSize: 12, fontWeight: 800, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s" }}><MapPin size={14} /> Ver mapa</a>
            </div>
          )}
          {arbitro && (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}><User size={18} color={CU} /></div>
              <div><div style={{ fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: "0.04em" }}>ÁRBITRO DESIGNADO</div><div style={{ fontSize: 14, fontWeight: 700 }}>{arbitro}</div></div>
            </div>
          )}
        </div>
        <div style={{ padding: 20, borderTop: `1px solid ${BORDER}`, background: BG, display: "flex", justifyContent: "center" }}>
           <button onClick={onClose} style={{ width: "100%", padding: "12px", background: "none", border: `1px solid ${BORDER}`, borderRadius: 10, fontWeight: 700, color: MUTED, cursor: "pointer", transition: "all 0.2s" }}>Cerrar detalles</button>
        </div>
      </motion.div>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, fontSize: 13, fontFamily: FONT, outline: "none", boxSizing: "border-box" };
