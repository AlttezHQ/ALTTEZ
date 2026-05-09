import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  List, Trophy, RefreshCw, X, Check, BarChart2, CalendarPlus, 
  Calendar, Share2, Clock, Settings, MapPin, User, Zap, ChevronRight, Tag
} from "lucide-react";
import { useTorneosStore } from "../store/useTorneosStore";
import { generarFixture, calcularPosiciones } from "../utils/fixturesEngine";
import ModuleEmptyState from "../components/shared/ModuleEmptyState";
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

function GeneratingOverlay() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, fontFamily: FONT }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", background: "#FFF", padding: "40px 60px", borderRadius: 24, boxShadow: "0 20px 50px rgba(0,0,0,0.1)", border: `1px solid ${BORDER}` }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ width: 48, height: 48, border: `4px solid ${CU_DIM}`, borderTopColor: CU, borderRadius: "50%", margin: "0 auto 20px" }} />
        <h3 style={{ fontSize: 18, fontWeight: 800, color: TEXT, margin: 0 }}>Generando Fixture</h3>
        <p style={{ fontSize: 14, color: MUTED, marginTop: 8 }}>Estamos organizando los partidos y sincronizando con la nube...</p>
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
  const [showGenModal, setShowGenModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newSede, setNewSede] = useState({ nombre: "" });
  const [newArbitro, setNewArbitro] = useState({ nombre: "" });

  // Scheduling state
  const [schedRound, setSchedRound] = useState(1);
  const [schedFrom, setSchedFrom] = useState("");
  const [schedTo, setSchedTo] = useState("");

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

  const handleConfirmGenerar = async (fechaInicio, fechaFin) => {
    if (!fechaFin) { showToast("Debes especificar la fecha de fin", "error"); return; }
    setShowGenModal(false);
    setIsGenerating(true);
    try {
      await actualizarTorneo(torneoActivoId, { fechaInicio, fechaFin });
      const ps = generarFixture({ ...torneo, fechaInicio, fechaFin }, equiposCat);
      // Solo actualizamos los de ESTA categoría
      const others = allPartidos.filter(p => p.torneoId === torneoActivoId && (p.grupo || "General") !== activeCat);
      await setPartidos(torneoActivoId, [...others, ...ps.map(p => ({ ...p, grupo: activeCat }))]);
      showToast("Fixture generado con éxito", "success");
    } finally { setIsGenerating(false); }
  };

  const handleGenerar = () => {
    if (equiposCat.length < 2) { showToast("Necesitas al menos 2 equipos en esta categoría", "error"); return; }
    if (partidosCat.length > 0 && !window.confirm(`Se borrará el fixture de ${activeCat}. ¿Continuar?`)) return;
    setShowGenModal(true);
  };

  const maxRound = useMemo(() => Math.max(0, ...partidosCat.map(p => p.ronda || 0)), [partidosCat]);

  const handleSchedRound = async () => {
    if (!schedFrom || !schedTo) { showToast("Define el rango de fechas", "error"); return; }
    // Aquí podrías llamar a una función que programe solo esa ronda
    // Por ahora, simulamos actualizando los partidos de esa ronda
    const updated = allPartidos.map(p => {
      if (p.torneoId === torneoActivoId && (p.grupo || "General") === activeCat && p.ronda === Number(schedRound)) {
        // En una implementación real, repartiríamos los horarios entre schedFrom y schedTo
        return { ...p, fechaHora: schedFrom + "T10:00:00" }; 
      }
      return p;
    });
    // setPartidos(torneoActivoId, updated.filter(p => p.torneoId === torneoActivoId));
    showToast(`Fecha ${schedRound} programada tentativamente`, "success");
  };

  const tabla = calcularPosiciones(partidosCat, equiposCat);
  const groups = partidosCat.reduce((acc, p) => {
    const key = p.fechaHora ? new Date(p.fechaHora).toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "long" }) : `Fecha ${p.ronda || 1}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

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
            {tab === "fixture" && (
              <motion.div key="f" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {partidosCat.length === 0 ? (
                  <div style={{ background: CARD, borderRadius: 20, padding: 60, textAlign: "center", border: `1px dashed ${BORDER}` }}>
                    <Trophy size={48} color={CU_BOR} style={{ margin: "0 auto 20px" }} />
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 8 }}>Sin fixture en {activeCat}</h3>
                    <p style={{ color: MUTED, fontSize: 14, marginBottom: 24 }}>Genera los partidos base para esta categoría.</p>
                    <button onClick={handleGenerar} style={{ background: CU, color: "#FFF", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, cursor: "pointer" }}>Generar Fixture</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: MUTED }}>Total: {partidosCat.length} partidos</span>
                      <button onClick={handleGenerar} style={{ fontSize: 11, background: "none", border: `1px solid ${BORDER}`, padding: "4px 10px", borderRadius: 6, color: MUTED, cursor: "pointer" }}><RefreshCw size={10} style={{ marginRight: 4 }} />Regenerar</button>
                    </div>
                    {Object.keys(groups).map(key => (
                      <div key={key}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: CU, textTransform: "uppercase", letterSpacing: "0.05em" }}>{key}</span>
                          <div style={{ flex: 1, height: 1, background: BORDER }} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                          {groups[key].map(p => <MatchCard key={p.id} partido={p} equipos={allEquipos} arbitros={arbitros} onClick={() => setModalPartido(p)} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === "programacion" && (
              <motion.div key="p" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <Calendar size={18} color={CU} /><h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Programación por Fechas</h4>
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
                    <p style={{ fontSize: 11, color: MUTED, textAlign: "center" }}>Define cuándo se jugará cada jornada para mayor control.</p>
                  </section>

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
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <MapPin size={18} color={CU} /><h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Sedes</h4>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                      {sedes.map(s => <div key={s.id} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "4px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>{s.nombre} <X size={12} onClick={() => eliminarSede(s.id)} style={{ cursor: "pointer" }} /></div>)}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}><input type="text" placeholder="Nueva sede..." value={newSede.nombre} onChange={e => setNewSede({ nombre: e.target.value })} style={inputStyle} /><button onClick={() => { if(newSede.nombre) { agregarSede(torneoActivoId, newSede); setNewSede({ nombre: "" }); }}} style={{ background: CU_DIM, color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 8, padding: "0 12px", cursor: "pointer" }}>+</button></div>
                  </section>
                  <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <User size={18} color={CU} /><h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Árbitros</h4>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                      {arbitros.map(a => <div key={a.id} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "4px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>{a.nombre} <X size={12} onClick={() => eliminarArbitro(a.id)} style={{ cursor: "pointer" }} /></div>)}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}><input type="text" placeholder="Nuevo árbitro..." value={newArbitro.nombre} onChange={e => setNewArbitro({ nombre: e.target.value })} style={inputStyle} /><button onClick={() => { if(newArbitro.nombre) { agregarArbitro(torneoActivoId, newArbitro); setNewArbitro({ nombre: "" }); }}} style={{ background: CU_DIM, color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 8, padding: "0 12px", cursor: "pointer" }}>+</button></div>
                  </section>
                </div>
              </motion.div>
            )}

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
        {isGenerating && <GeneratingOverlay />}
      </AnimatePresence>
    </motion.div>
  );
}

const inputStyle = { width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, fontSize: 13, fontFamily: FONT, outline: "none", boxSizing: "border-box" };
