import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  ArrowLeft, ArrowRight, CheckCircle, Plus, X, 
  Trophy, Users, Calendar, Shield, Info, Lightbulb, 
  LayoutGrid, List, Zap, Settings, Globe, MoreHorizontal, ChevronRight, ChevronLeft, Eye, Bookmark, BarChart2, Sparkles,
  Download, Upload, Search, Filter, HelpCircle, FileText, AlertCircle, AlertTriangle, MapPin, User, Save, Edit3, Trash2, Wand2, Check, Camera, Clock
} from "lucide-react";
import { useTorneosStore } from "../../store/useTorneosStore";
import { calculateTournamentMath, recommendStructure, calculateSchedulingStats, estimateProjectedEndDate, getFeasibilitySuggestions } from "../../utils/tournamentAlgorithms";
import { PALETTE, ELEVATION } from "../../../../shared/tokens/palette";

const CU      = PALETTE.bronce;
const CU_DIM  = PALETTE.bronceDim;
const CU_BOR  = PALETTE.bronceBorder;
const CARD    = PALETTE.surface;
const BG      = PALETTE.bg;
const TEXT    = PALETTE.text;
const MUTED   = PALETTE.textMuted;
const HINT    = PALETTE.textHint;
const BORDER  = PALETTE.border;
const ELEV    = ELEVATION?.card ?? "0 10px 28px rgba(23,26,28,0.07)";
const FONT    = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";

const ANIM_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  },
  card: {
    initial: { scale: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" },
    hover: { 
      scale: 1.02, 
      y: -4, 
      boxShadow: "0 12px 30px rgba(181, 143, 76, 0.15)",
      borderColor: PALETTE.bronceBorder,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.98 }
  },
  panel: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }
};

const SPORTS  = ["Fútbol", "Básquet", "Vóleibol", "Tenis", "Pádel", "Rugby", "Otro"];
const STEP_LABELS = [
  "Información básica", 
  "Categorías", 
  "Equipos", 
  "Árbitros", 
  "Formato", 
  "Calendario", 
  "Resumen"
];
const STEP_SUBTITLES = [
  "Datos generales del torneo", 
  "Definir categorías de juego", 
  "Cargar e importar equipos", 
  "Gestión de cuerpo arbitral", 
  "Configurar formato y grupos", 
  "Programar fechas y canchas", 
  "Revisar y publicar torneo"
];

const FASE_OPTIONS = [
  { id: "todos_contra_todos", label: "Todos contra todos", desc: "Todos los equipos se enfrentan entre sí.", icon: Users },
  { id: "grupos_playoffs",    label: "Grupos + fase final", desc: "Fase de grupos seguida de una fase final.", icon: LayoutGrid },
  { id: "eliminacion",        label: "Eliminación directa", desc: "Partidos de eliminación desde la primera ronda.", icon: Zap },
  { id: "liga_playoffs",      label: "Liga + playoffs", desc: "Liga regular seguida de playoffs.", icon: Trophy },
];

const CATEGORIAS_DEFAULT = [
  "Sub-7", "Sub-9", "Sub-11", "Sub-13", "Sub-15", "Sub-17", "Sub-19", "Sub-21",
  "Femenino", "Masculino", "Mixto", "Libre", "Primera División", "Segunda División",
  "Veteranos", "Amateur", "Profesional", "Infantil", "Cadetes", "Juvenil",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatBadge({ icon: Icon, label, value }) {
  return (
    <motion.div 
      variants={ANIM_VARIANTS.card}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 24px", background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, flex: 1, cursor: "default" }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 12, background: "#FCF8F1", border: `1px solid ${CU_BOR}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={20} color={CU} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 2 }}>{value}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: HINT }}>{label}</div>
      </div>
    </motion.div>
  );
}

function getOptimalGroupCount(totalTeams) {
  const n = parseInt(totalTeams) || 0;
  if (n < 3) return 1;
  if (n % 4 === 0) return n / 4;
  if (n % 5 === 0) return n / 5;
  if (n % 3 === 0 && n < 10) return n / 3;
  
  let g = Math.ceil(n / 4);
  if (n / g < 3 && g > 1) g--;
  return g;
}

function calcularPartidos(config, teamsCount = 0) {
  let count = 0;
  const n = parseInt(teamsCount) || 0;
  if (n < 2) return 0;
  const mult = config.fases === "ida_vuelta" ? 2 : 1;

  if (config.format === "todos_contra_todos") {
    const vueltas = parseInt(config.vueltas) || 1;
    count = (n * (n - 1) / 2) * vueltas * mult;
    if (config.faseFinal === "final") count += 1;
    if (config.faseFinal === "semis") count += 3;
  } else if (config.format === "grupos_playoffs") {
    const g = parseInt(config.grupos) || getOptimalGroupCount(n) || 2;
    const avg = Math.floor(n / g);
    const rem = n % g;
    const matchesRem = (avg + 1) * avg / 2;
    const matchesAvg = avg * (avg - 1) / 2;
    count = ((matchesRem * rem) + (matchesAvg * (g - rem))) * mult;
    if (config.faseFinal === "semis") count += 3;
    if (config.faseFinal === "final") count += 1;
    if (config.faseFinal === "cuartos") count += 7;
  } else if (config.format === "eliminacion") {
    count = n - 1;
  } else if (config.format === "liga_playoffs") {
    const vueltas = parseInt(config.vueltas) || 1;
    count = (n * (n - 1) / 2) * vueltas * mult + 3;
  }
  return count;
}

// ── Components ───────────────────────────────────────────────────────────────

function StepperHeader({ step, onStepClick }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, margin: "20px 0 40px", flexWrap: "wrap" }}
    >
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <motion.div 
            key={n} 
            onClick={() => onStepClick(n)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 12, 
              position: "relative", 
              cursor: "pointer",
              opacity: active ? 1 : (done ? 0.9 : 0.6),
              transition: "opacity 0.2s"
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: active ? CU : (done ? CU : "transparent"),
              border: `2px solid ${active || done ? CU : BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.3s", zIndex: 2,
              boxShadow: active ? `0 0 15px ${CU}40` : "none"
            }}>
              {done ? <CheckCircle size={18} color="#FFF" /> : <span style={{ fontSize: 13, fontWeight: 800, color: active ? "#FFF" : HINT }}>{n}</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 13, fontWeight: active ? 800 : 600, color: active ? TEXT : MUTED }}>{n}. {label}</span>
              {done && <span style={{ fontSize: 10, color: PALETTE.success, fontWeight: 700 }}>Completado</span>}
              {active && <span style={{ fontSize: 10, color: CU, fontWeight: 700 }}>En proceso</span>}
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{ 
                position: "absolute", 
                right: -20, 
                top: "50%", 
                width: 12, 
                height: 1, 
                background: BORDER,
                display: "none" // We use gap instead of absolute line for better wrapping
              }} />
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function Field({ label, required, children, style, error }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: error ? PALETTE.danger : MUTED, letterSpacing: "0.02em", transition: "color 0.2s" }}>
        {label.toUpperCase()} {required && <span style={{ color: PALETTE.danger }}>*</span>}
        {error && <span style={{ marginLeft: 4, fontSize: 10 }}>— Requerido</span>}
      </label>
      {children}
    </div>
  );
}

function RowInp({ label, type = "text", value, onChange, options }) {
  const isNum = type === "number";
  const selectWidth = 150; // Increased to prevent text truncation
  const numWidth = 70;
  
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
      <label style={{ fontSize: 10, fontWeight: 800, color: MUTED, flex: 1, letterSpacing: "0.03em", lineHeight: 1.2, paddingRight: 4 }}>
        {label.toUpperCase()}
      </label>
      
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {type === "select" ? (
          <div style={{ position: "relative", width: selectWidth }}>
            <select 
              value={value} 
              onChange={e => onChange(e.target.value)} 
              style={{ ...inputStyle, paddingLeft: 10, paddingRight: 24, height: 36, appearance: "none", fontSize: 11, fontWeight: 700, background: "#FFF", borderRadius: 8 }}
            >
              {options.map(o => (
                <option key={typeof o === "string" ? o : o.v || o.value} value={typeof o === "string" ? o : o.v || o.value}>
                  {typeof o === "string" ? o : o.l || o.label}
                </option>
              ))}
            </select>
            <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <ChevronRight size={12} color={MUTED} style={{ transform: "rotate(90deg)" }} />
            </div>
          </div>
        ) : (
          <div className="modern-inp-wrap" style={{ display: "flex", alignItems: "center", border: `1.5px solid ${BORDER}`, borderRadius: 8, background: "#FFF", overflow: "hidden", width: numWidth, height: 36, transition: "all 0.2s" }}>
            <input 
              type="text"
              inputMode="numeric"
              value={(isNum && value === 0) ? "" : value}
              placeholder="0"
              onChange={e => {
                const v = e.target.value;
                if (isNum) {
                  if (v === "" || /^\d+$/.test(v)) onChange(v === "" ? 0 : parseInt(v));
                } else {
                  onChange(v);
                }
              }}
              style={{ border: "none", background: "none", width: "100%", textAlign: "center", fontSize: 14, color: TEXT, outline: "none", height: "100%", fontWeight: 800, padding: 0 }} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewItem({ text }) {
  return (
    <li style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: TEXT, fontWeight: 500 }}>
      <CheckCircle size={14} color={CU} style={{ minWidth: 14 }} /> <span>{text}</span>
    </li>
  );
}

function Switch({ active, onChange, label, desc }) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => onChange(!active)}>
        <div style={{ width: 36, height: 20, borderRadius: 20, background: active ? CU : BORDER, position: "relative", transition: "background 0.2s" }}>
          <motion.div animate={{ x: active ? 18 : 2 }} style={{ width: 16, height: 16, borderRadius: "50%", background: "#FFF", position: "absolute", top: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
        </div>
        {label && <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{label}</span>}
        {desc && (
          <div onMouseEnter={() => setShowInfo(true)} onMouseLeave={() => setShowInfo(false)} style={{ display: "flex", alignItems: "center" }}>
            <Info size={14} color={active ? CU : HINT} style={{ transition: "color 0.2s" }} />
          </div>
        )}
      </div>
      <AnimatePresence>
        {showInfo && desc && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ position: "absolute", bottom: "calc(100% + 12px)", left: 0, width: 220, background: "#111", color: "#FFF", padding: "12px 16px", borderRadius: 12, fontSize: 11, lineHeight: 1.5, zIndex: 100, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            {desc}
            <div style={{ position: "absolute", top: "100%", left: 20, width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid #111" }} />
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}

function SidebarItem({ icon: Icon, title, desc }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <div style={{ marginTop: 2 }}><Icon size={16} color={CU} /></div>
      <div><div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 2 }}>{title}</div><div style={{ fontSize: 11, color: MUTED, lineHeight: 1.5 }}>{desc}</div></div>
    </div>
  );
}

function Step3Stat({ icon: Icon, val, lab }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: CU_DIM, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={14} color={CU} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: TEXT, lineHeight: 1.1 }}>{val}</div>
        <div style={{ fontSize: 9, color: HINT, fontWeight: 700, letterSpacing: "0.02em" }}>{lab.toUpperCase()}</div>
      </div>
    </div>
  );
}

function SummaryBar({ data, totalLoaded }) {
  return (
    <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "10px 24px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "center", gap: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Trophy size={18} color={CU} />
        <div><h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TEXT }}>{data.nombre || "Torneo sin nombre"}</h3><p style={{ margin: 0, fontSize: 10, color: MUTED, fontWeight: 600 }}>{data.deporte} · {data.temporada} · {data.fechaInicio || "Fecha pendiente"}</p></div>
      </div>
      <div style={{ width: 1, height: 24, background: BORDER }} />
      <div style={{ display: "flex", gap: 40 }}>
        <Step3Stat icon={LayoutGrid} val={data.categorias.length} lab="Categorías" />
        <Step3Stat icon={Users} val={totalLoaded} lab="Equipos" />
      </div>
    </div>
  );
}

// ── Main Wizard ──────────────────────────────────────────────────────────────

export default function CrearTorneoWizard({ onFinish, onBack, initialData = null }) {
  const crearTorneo = useTorneosStore(s => s.crearTorneo);
  const currentYear = new Date().getFullYear();
  const startRef = useRef(null);
  const endRef   = useRef(null);

  // ── Persistence Logic ────────────────────────────────────────────────────────
  const [isLoaded, setIsLoaded] = useState(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    nombre: initialData?.nombre || "",
    deporte: initialData?.deporte || "Fútbol",
    temporada: initialData?.temporada || "",
    fechaInicio: initialData?.fechaInicio || "",
    fechaFin: initialData?.fechaFin || "",
    organizador: initialData?.organizador || "",
    sedePrincipal: initialData?.sedePrincipal || "",
    descripcion: initialData?.descripcion || "",
    formato: initialData?.formato || "todos_contra_todos",
    categorias: initialData?.categorias || [],
    multiplesCategorias: true,
    autoBorrador: true,
    sedeUbicacion: initialData?.sedeUbicacion || "",
    numCanchas: initialData?.numCanchas || 1,
    duracionPartido: initialData?.duracionPartido || 60,
    margenEntrePartidos: initialData?.margenEntrePartidos || 10,
    arbitros: initialData?.arbitros || [],
    horarios: initialData?.horarios || [
      { dia: "Lunes", activo: false, inicio: "08:00", fin: "18:00" },
      { dia: "Martes", activo: false, inicio: "08:00", fin: "18:00" },
      { dia: "Miércoles", activo: false, inicio: "08:00", fin: "18:00" },
      { dia: "Jueves", activo: false, inicio: "08:00", fin: "18:00" },
      { dia: "Viernes", activo: false, inicio: "08:00", fin: "18:00" },
      { dia: "Sábado", activo: true, inicio: "08:00", fin: "18:00" },
      { dia: "Domingo", activo: true, inicio: "08:00", fin: "18:00" },
    ]
  });

  const [catId, setCatId] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importConflicts, setImportConflicts] = useState(null);
  const [pendingTeams, setPendingTeams] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(null);
  const [teamToWithdraw, setTeamToWithdraw] = useState(null);
  const [selectedArb, setSelectedArb] = useState(null);
  const [showArbModal, setShowArbModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleRemoveTeam = (catId, team) => {
    // Si tiene un ID real (string de base de datos) y no estamos en creación
    if (typeof team.id === "string") {
      const store = useTorneosStore.getState();
      const hasPartidos = store.partidos.some(p => p.equipoLocalId === team.id || p.equipoVisitaId === team.id);
      
      if (hasPartidos) {
        setTeamToWithdraw({ catId, team });
        return;
      }
    }
    
    // Eliminación directa si no tiene partidos
    setTeams(prev => ({
      ...prev,
      [catId]: prev[catId].filter(x => x.id !== team.id)
    }));
  };

  const confirmWithdrawal = (reason) => {
    if (!teamToWithdraw) return;
    
    setTeams(prev => ({
      ...prev,
      [teamToWithdraw.catId]: prev[teamToWithdraw.catId].map(x => {
        if (x.id === teamToWithdraw.team.id) {
          return { ...x, name: `${x.name} (${reason})`, estado: "retirado", reason };
        }
        return x;
      })
    }));
    
    setTeamToWithdraw(null);
  };

  const [structures, setStructures] = useState({});
  const [teams, setTeams] = useState({});
  const [showCatModal, setShowCatModal] = useState(false);
  const [customCatName, setCustomCatName] = useState("");
  const [step1Errors, setStep1Errors] = useState({});
  const [tempCats, setTempCats] = useState([]);
  const [selectedJornada, setSelectedJornada] = useState(null);
  const [collapsedCats, setCollapsedCats] = useState({});
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  // Hydrate from localStorage or initialData
  useEffect(() => {
    if (initialData?.id) {
      const mappedStructures = {};
      const mappedTeams = {};
      
      (initialData.categorias || []).forEach(c => {
        mappedStructures[c.id] = {
          format: c.format || "todos_contra_todos",
          fases: c.fases || "ida",
          vueltas: c.vueltas || 1,
          grupos: c.grupos || 2,
          tpg: c.tpg || 4,
          cpg: c.cpg || 2,
          faseFinal: c.faseFinal || "final",
          desempate: c.desempate || "goal_diff"
        };
      });

      (initialData.equipos || []).forEach(e => {
        const cat = (initialData.categorias || []).find(c => c.nombre === e.grupo);
        const catId = cat ? cat.id : (initialData.categorias?.[0]?.id || "general");
        
        if (!mappedTeams[catId]) mappedTeams[catId] = [];
        mappedTeams[catId].push({
          id: e.id,
          name: e.nombre,
          delegate: e.delegado || "",
          estado: e.estado || "activo"
        });
      });

      setStructures(mappedStructures);
      setTeams(mappedTeams);
      setIsLoaded(true);
      return;
    }

    const saved = localStorage.getItem("crear_torneo_wizard");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStep(parsed.step || 1);
        setData(p => ({ ...p, ...(parsed.data || {}) }));
        setStructures(p => ({ ...p, ...(parsed.structures || {}) }));
        setTeams(p => ({ ...p, ...(parsed.teams || {}) }));
        if (parsed.data?.categorias?.length > 0) {
          setCatId(parsed.data.categorias[0].id);
          const collapsed = {};
          parsed.data.categorias.forEach((c, i) => { collapsed[c.id] = i !== 0; });
          setCollapsedCats(collapsed);
        }
      } catch (e) { console.error("Error loading saved wizard state", e); }
    } else if (data.categorias.length > 0) {
      setCatId(data.categorias[0].id);
      const collapsed = {};
      data.categorias.forEach((c, i) => { collapsed[c.id] = i !== 0; });
      setCollapsedCats(collapsed);
    }
    setIsLoaded(true);
  }, [initialData]);

  // Always keep categories sorted
  useEffect(() => {
    if (data.categorias.length > 1) {
      const sorted = [...data.categorias].sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { numeric: true }));
      const isDifferent = sorted.some((c, i) => c.id !== data.categorias[i].id);
      if (isDifferent) {
        setData(p => ({ ...p, categorias: sorted }));
      }
    }
  }, [data.categorias]);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      const state = { step, data, structures, teams };
      localStorage.setItem("crear_torneo_wizard", JSON.stringify(state));
    }
  }, [step, data, structures, teams, isLoaded]);

  const clearStorage = () => localStorage.removeItem("crear_torneo_wizard");

  const update = (k, v) => {
    setData(p => ({ ...p, [k]: v }));
    // Clear individual field error when user types
    setStep1Errors(prev => { const next = { ...prev }; delete next[k]; return next; });
  };
  const updateStruct = (id, patch) => setStructures(p => ({ 
    ...p, 
    [id]: { 
      format: data.formato || "todos_contra_todos", 
      ...(p[id] || {}), 
      ...patch 
    } 
  }));

  const activeCat    = data.categorias.find(c => c.id === catId);
  const activeTeamsRaw = teams[catId] || [];
  const activeTeams = activeTeamsRaw.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.delegate && t.delegate.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleAddCustom = () => {
    if (!customCatName.trim()) return;
    const names = customCatName.split(",").map(n => n.trim()).filter(n => n);
    const newItems = names.map(n => ({
      id: n.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Math.random().toString(36).substr(2, 5),
      nombre: n,
      teams: 0
    }));
    setTempCats(p => [...p, ...newItems]);
    setCustomCatName("");
  };

  const handleApplyTimeToAll = () => {
    const activeDays = data.horarios.filter(h => h.activo);
    if (activeDays.length === 0) return;
    const first = activeDays[0];
    const next = data.horarios.map(h => ({ ...h, inicio: first.inicio, fin: first.fin }));
    update("horarios", next);
  };

  const handleNext = async () => {
    // Validate step 1 required fields
    if (step === 1) {
      const errs = {};
      if (!data.nombre?.trim())        errs.nombre = true;
      if (!data.temporada?.trim())     errs.temporada = true;
      if (!data.fechaInicio?.trim())   errs.fechaInicio = true;
      if (!data.fechaFin?.trim())      errs.fechaFin = true;
      if (!data.organizador?.trim())   errs.organizador = true;
      if (!data.sedePrincipal?.trim()) errs.sedePrincipal = true;
      if (Object.keys(errs).length > 0) {
        setStep1Errors(errs);
        return;
      }
      setStep1Errors({});
      if (!catId && data.categorias.length > 0) setCatId(data.categorias[0].id);
    }
    if (step === 2) {
      const emptyCats = data.categorias.filter(c => (teams[c.id]?.length || 0) < 2);
      if (emptyCats.length > 0) {
        alert("Hay categorías con menos de 2 equipos. Por favor elimina las categorías vacías o agrega más equipos.");
        return;
      }
      setData(p => ({
        ...p,
        categorias: p.categorias.map(c => ({
          ...c,
          teams: teams[c.id]?.length || 0
        }))
      }));
    }
    if (step < 7) { setStep(s => s + 1); return; }
    
    const isEditMode = !!initialData?.id;

    if (isEditMode) {
      const store = useTorneosStore.getState();
      const tId = initialData.id;
      
      // 1. Torneo Base
      await store.actualizarTorneo(tId, data);
      
      // 2. Sincronización de Categorías
      const dbCategorias = initialData.categorias || [];
      const wizardCategorias = data.categorias;
      
      // Categorías a eliminar (si la función existe)
      const catToDelete = dbCategorias.filter(dbC => !wizardCategorias.some(wc => wc.id === dbC.id));
      for (const c of catToDelete) {
        if (store.eliminarCategoria) await store.eliminarCategoria(c.id);
      }
      
      // Categorías a agregar o actualizar
      const catsToAdd = [];
      for (const wc of wizardCategorias) {
        const dbCat = dbCategorias.find(c => c.id === wc.id);
        const s = structures[wc.id] || {};
        const catPayload = {
          nombre: wc.nombre,
          teams: wc.teams || 0,
          format: s.format || data.formato || "todos_contra_todos",
          fases: s.fases || "ida",
          vueltas: s.vueltas || 1,
          grupos: s.groupsCount || s.grupos || 2,
          cpg: s.qualifyPerGroup || s.cpg || 2,
          faseFinal: s.faseFinal || "final",
          desempate: s.desempate || "goal_diff",
          groupsCount: s.groupsCount,
          groupLegs: s.groupLegs,
          qualifyPerGroup: s.qualifyPerGroup,
          playoffLegs: s.playoffLegs,
          finalLegs: s.finalLegs
        };
        
        if (dbCat) {
          if (store.actualizarCategoria) await store.actualizarCategoria(wc.id, catPayload);
        } else {
          catsToAdd.push({ id: wc.id, ...catPayload });
        }
      }
      if (catsToAdd.length > 0 && store.agregarCategorias) {
        await store.agregarCategorias(tId, catsToAdd);
      }
      
      // 3. Sincronización de Equipos
      const flatWizardTeams = Object.values(teams).flat();
      const dbEquipos = initialData.equipos || [];
      
      // Equipos eliminados del wizard (que no estaban marcados como "retirado", simplemente no están)
      const equiposToDelete = dbEquipos.filter(dbE => !flatWizardTeams.some(wt => wt.id === dbE.id));
      for (const e of equiposToDelete) {
        if (store.eliminarEquipo) await store.eliminarEquipo(e.id);
      }
      
      // Equipos nuevos y actualizados
      for (const [catId, teamList] of Object.entries(teams)) {
        const catName = data.categorias.find(c => c.id === catId)?.nombre || "General";
        for (const t of teamList) {
          if (typeof t.id === "string") {
            // Ya existía en DB -> Update
            if (store.actualizarEquipo) {
              await store.actualizarEquipo(t.id, {
                nombre: t.name,
                delegado: t.delegate,
                grupo: catName,
                estado: t.estado || "activo"
              });
            }
          } else {
            // Nuevo -> Insert
            if (store.agregarEquipo) {
              await store.agregarEquipo(tId, {
                nombre: t.name,
                delegado: t.delegate,
                grupo: catName,
                jugadores: [],
                estado: "activo"
              });
            }
          }
        }
      }

      clearStorage();
      onFinish?.();
      return;
    }

    // 1. Crear el torneo base
    const newTorneo = await crearTorneo(data);
    
    // 2. Agregar sede principal si existe
    if (data.sedePrincipal) {
      await useTorneosStore.getState().agregarSede(newTorneo.id, { nombre: data.sedePrincipal });
    }

    // 3. Guardar categorías con su estructura completa
    const categoriasConEstructura = data.categorias.map(c => {
      const s = structures[c.id] || {};
      return {
        id: c.id,
        nombre: c.nombre,
        teams: c.teams || 0,
        format: s.format || data.formato || "todos_contra_todos",
        fases: s.fases || "ida",
        vueltas: s.vueltas || 1,
        grupos: s.groupsCount || s.grupos || 2,
        cpg: s.qualifyPerGroup || s.cpg || 2,
        faseFinal: s.faseFinal || "final",
        desempate: s.desempate || "goal_diff",
        groupsCount: s.groupsCount,
        groupLegs: s.groupLegs,
        qualifyPerGroup: s.qualifyPerGroup,
        playoffLegs: s.playoffLegs,
        finalLegs: s.finalLegs
      };
    });
    await useTorneosStore.getState().agregarCategorias(newTorneo.id, categoriasConEstructura);

    // 4. Agregar todos los equipos registrados
    for (const [id, teamList] of Object.entries(teams)) {
      const cat = data.categorias.find(c => c.id === id);
      const catName = cat?.nombre || "General";
      
      for (const t of teamList) {
        await useTorneosStore.getState().agregarEquipo(newTorneo.id, {
          nombre: t.name,
          delegado: t.delegate,
          grupo: catName,
          jugadores: []
        });
      }
    }

    clearStorage();
    onFinish?.();
  };

  const handleSaveDraft = () => {
    const state = { step, data, structures, teams };
    localStorage.setItem("crear_torneo_wizard", JSON.stringify(state));
    localStorage.setItem('wizard_draft_saved', JSON.stringify(state));
    // Optional: show a small toast or feedback
    alert("Borrador guardado correctamente");
  };

  const handleReshuffle = () => {
    const next = { ...teams };
    Object.keys(next).forEach(cid => {
      next[cid] = [...(next[cid] || [])].sort(() => Math.random() - 0.5);
    });
    setTeams(next);
  };

  const handleDownloadFixture = () => {
    console.log("Iniciando generación de PDF...");
    const doc = new jsPDF();
    const primaryColor = [181, 143, 76]; // B58F4C - Bronce
    const textColor = [44, 44, 44];
    const mutedColor = [120, 120, 120];

    // Configuración inicial
    const tournamentName = data.nombre || "Sin Nombre";
    const sortedCats = [...data.categorias].sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { numeric: true }));
    
    // Header - Marca ALTTEZ
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("ALTTEZ", 14, 15);
    doc.text("CRM DEPORTIVO", 14, 19);
    
    // Título del Torneo
    doc.setFontSize(24);
    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "bold");
    doc.text(tournamentName.toUpperCase(), 14, 32);
    
    doc.setFontSize(10);
    doc.setTextColor(...mutedColor);
    doc.setFont("helvetica", "normal");
    doc.text(`Fixture Preliminar — ${data.deporte} · Temporada ${data.temporada}`, 14, 39);
    
    // Línea decorativa
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, 45, 196, 45);

    let currentY = 55;
    let hasContent = false;

    sortedCats.forEach(cat => {
      const tList = teams[cat.id] || [];
      if (tList.length < 2) return;
      hasContent = true;

      // Si nos quedamos sin espacio, nueva página
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      // Nombre de la Categoría
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.setFont("helvetica", "bold");
      doc.text(cat.nombre, 14, currentY);
      
      const rows = [];
      // Generar filas (emparejamientos básicos para el borrador)
      for (let i = 0; i < tList.length - 1; i += 2) {
        rows.push([
          `Jornada ${Math.floor(i/2) + 1}`, 
          tList[i].name, 
          "VS", 
          tList[i+1].name
        ]);
      }

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Jornada', 'Equipo Local', '', 'Equipo Visita']],
        body: rows,
        theme: 'striped',
        headStyles: { 
          fillColor: primaryColor, 
          textColor: 255, 
          fontSize: 10, 
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: { 
          fontSize: 9, 
          cellPadding: 4,
          textColor: textColor
        },
        columnStyles: {
          0: { cellWidth: 30, halign: 'center' },
          1: { halign: 'right', fontStyle: 'bold' },
          2: { cellWidth: 15, halign: 'center', textColor: primaryColor, fontStyle: 'bold' },
          3: { halign: 'left', fontStyle: 'bold' }
        },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          // Pie de página en cada hoja
          const str = "Página " + doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(...mutedColor);
          doc.text(str, 196 - doc.getTextWidth(str), 285);
        }
      });

      currentY = doc.lastAutoTable.finalY + 15;
    });

    console.log("¿Tiene contenido?", hasContent);

    if (!hasContent) {
      alert("No hay suficientes equipos cargados para generar un fixture.");
      return;
    }

    // Pie de página final
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text(`Documento generado automáticamente por Alttez CRM — ${new Date().toLocaleDateString()}`, 14, 285);

    doc.save(`Fixture_${tournamentName.replace(/\s+/g, "_")}.pdf`);
  };

  const handleDownloadCalendar = () => {
    console.log("Generando PDF de Calendario...");
    const doc = new jsPDF();
    const primaryColor = [181, 143, 76]; // B58F4C - Bronce
    const textColor = [44, 44, 44];
    
    // Logo (Simulado o real si existe la ruta)
    try {
      doc.addImage('/branding/alttez-symbol-transparent.png', 'PNG', 15, 10, 15, 15);
    } catch (e) {
      // Fallback si no carga la imagen
      doc.setFillColor(...primaryColor);
      doc.circle(22.5, 17.5, 5, 'F');
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text("ALTTEZ", 35, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("CALENDARIO DE COMPETENCIA", 195, 22, { align: 'right' });

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(15, 30, 195, 30);

    doc.setFontSize(14);
    doc.setTextColor(...textColor);
    doc.text(data.nombre, 15, 45);
    
    doc.setFontSize(10);
    doc.text(`Temporada: ${data.temporada} | Inicio: ${data.fechaInicio}`, 15, 52);

    let currentY = 65;
    const startDate = data.fechaInicio ? new Date(data.fechaInicio) : new Date();
    const activeHorarios = (data.horarios || []).filter(h => h.activo === true);

    // Calculate max rounds
    let maxRounds = 1;
    data.categorias.forEach(cat => {
      const tCount = teams[cat.id]?.length || 0;
      const s = structures[cat.id] || {};
      let rounds = 1;
      if (s.format === 'todos_contra_todos') rounds = tCount % 2 === 0 ? tCount - 1 : tCount;
      else {
        const teamsInGroup = Math.ceil(tCount / (s.groupsCount || 1));
        const groupRounds = teamsInGroup % 2 === 0 ? teamsInGroup - 1 : teamsInGroup;
        const playoffRounds = s.faseFinal === 'cuartos' ? 3 : s.faseFinal === 'semis' ? 2 : 1;
        rounds = groupRounds + playoffRounds;
      }
      if (rounds > maxRounds) maxRounds = rounds;
    });

    for (let i = 0; i < Math.min(maxRounds, 15); i++) {
      const j = i + 1;
      const jDate = new Date(startDate);
      jDate.setDate(startDate.getDate() + (i * 7));

      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text(`JORNADA ${j} - SEMANA DEL ${jDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`, 15, currentY);
      
      const rows = [];
      const numCanchas = data.numCanchas || 1;
      const duracion = data.duracionPartido || 60;
      const margen = data.margenEntrePartidos || 0;
      const slotTotal = duracion + margen;
      const arbitrosList = data.arbitros || [];

      data.categorias.forEach(cat => {
        const tList = teams[cat.id] || [];
        const mCount = Math.floor(tList.length / 2);
        if (mCount === 0) return;

        for (let m = 0; m < mCount; m++) {
          let remaining = m;
          let dayInfo = { dia: "---", inicio: "--:--", cancha: 1 };
          
          for (const h of activeHorarios) {
            const [h1, m1] = h.inicio.split(":").map(Number);
            const [h2, m2] = h.fin.split(":").map(Number);
            const totalMins = (h2 * 60 + m2) - (h1 * 60 + m1);
            const slotsPerDay = Math.max(1, Math.floor(totalMins / slotTotal));
            const capacityPerDay = slotsPerDay * numCanchas;

            if (remaining < capacityPerDay) {
              const timeSlotIdx = Math.floor(remaining / numCanchas);
              const fieldIdx = (remaining % numCanchas) + 1;
              const startMins = h1 * 60 + m1 + (timeSlotIdx * slotTotal);
              const hh = Math.floor(startMins / 60);
              const mm = startMins % 60;
              dayInfo = { dia: h.dia, inicio: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`, cancha: fieldIdx };
              break;
            }
            remaining -= capacityPerDay;
          }

          const arb = arbitrosList.length > 0 ? arbitrosList[m % arbitrosList.length].name : "Pendiente";
          
          rows.push([
            dayInfo.dia,
            dayInfo.inicio,
            `C${dayInfo.cancha}`,
            cat.nombre,
            tList[m*2]?.name || "-",
            tList[m*2+1]?.name || "-",
            arb
          ]);
        }
      });

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Día', 'Hora', 'Cancha', 'Categoría', 'Equipo A', 'Equipo B', 'Árbitro']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, fontSize: 9 },
        styles: { fontSize: 8 },
        margin: { left: 15, right: 15 }
      });

      currentY = doc.lastAutoTable.finalY + 15;
    }

    doc.save(`Calendario_${data.nombre.replace(/\s+/g, '_')}.pdf`);
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Equipo", "Categoría", "Delegado", "Jugadores"],
      ["Tigres FC", data.categorias[0]?.nombre || "Sub-11", "Juan Pérez", 15],
      ["Leones", data.categorias[0]?.nombre || "Sub-11", "Carlos Gil", 18]
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Equipos");
    XLSX.writeFile(wb, "plantilla_equipos.xlsx");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const dataBuffer = new Uint8Array(event.target.result);
        const workbook = XLSX.read(dataBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (rows.length < 2) {
          setIsImporting(false);
          return;
        }

        const headerRow = rows[0].map(h => typeof h === 'string' ? h.toLowerCase().trim() : '');
        const nameIdx = headerRow.findIndex(h => h.includes("equipo") || h.includes("nombre"));
        const catIdx = headerRow.findIndex(h => h.includes("categor"));
        const delIdx = headerRow.findIndex(h => h.includes("delegado"));
        const playIdx = headerRow.findIndex(h => h.includes("jugador"));

        if (nameIdx === -1) {
           setIsImporting(false);
           alert("El archivo debe contener al menos una columna llamada 'Equipo' o 'Nombre'");
           return;
        }

        const dataRows = rows.slice(1).filter(r => r[nameIdx]);

        const imported = dataRows.map(row => ({
          name: row[nameIdx]?.toString().trim() || "Desconocido",
          category: catIdx !== -1 ? (row[catIdx]?.toString().trim() || "General") : "General",
          delegate: delIdx !== -1 ? (row[delIdx]?.toString().trim() || "") : "",
          players: playIdx !== -1 ? (parseInt(row[playIdx]) || 0) : 0
        }));

        const nextData = { ...data };
        const nextStructures = { ...structures };
        const nextTeams = { ...teams };
        let conflictsFound = [];
        let orphansFound = [];
        
        const normalize = s => s ? s.toString().trim().toLowerCase().replace(/[\s-]/g, "") : "";

        imported.forEach(item => {
          let cat = nextData.categorias.find(c => normalize(c.nombre) === normalize(item.category));
          
          if (!cat) {
            if (!orphansFound.find(o => normalize(o) === normalize(item.category))) {
              orphansFound.push(item.category);
            }
          } else {
            if (!nextTeams[cat.id]) nextTeams[cat.id] = [];
            const exists = nextTeams[cat.id].find(t => normalize(t.name) === normalize(item.name));
            if (exists) {
              conflictsFound.push({ category: cat.nombre, teamName: item.name, newData: item, existingId: exists.id });
            } else {
              nextTeams[cat.id].push({ ...item, id: Date.now() + Math.random(), status: "Completo" });
            }
          }
        });

        // Collect teams belonging to orphan categories to process them later
        const orphanTeams = imported.filter(item => !nextData.categorias.find(c => normalize(c.nombre) === normalize(item.category)));

        if (conflictsFound.length > 0 || orphansFound.length > 0) {
          setImportConflicts({ 
            conflicts: conflictsFound, 
            orphans: orphansFound, 
            orphanTeams,
            nextTeams, 
            nextData, 
            nextStructures 
          });
        } else {
          setTeams(nextTeams);
          setIsImporting(false);
        }
      } catch (err) {
        console.error("Error parsing Excel:", err);
        setIsImporting(false);
        alert("Hubo un error leyendo el archivo Excel. Asegúrate de usar la plantilla.");
      }
      
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsArrayBuffer(file);
  };

  const resolveConflicts = (action) => {
    if (!importConflicts) return;
    const { conflicts, orphans, orphanTeams, nextTeams, nextData, nextStructures } = importConflicts;
    const finalTeams = { ...nextTeams };
    const finalData = { ...nextData };
    const finalStructures = { ...nextStructures };

    // 1. Create orphan categories if any
    if (orphans.length > 0) {
      orphans.forEach(oName => {
        const id = Date.now() + Math.random().toString();
        finalData.categorias.push({ id, nombre: oName, teams: 0 });
        finalStructures[id] = { format: "liguilla", vueltas: 1, faseFinal: "final", status: "configured" };
        
        // Find teams for this new category and add them
        const teamsForCat = orphanTeams.filter(ot => ot.category === oName);
        finalTeams[id] = teamsForCat.map(t => ({ ...t, id: Date.now() + Math.random(), status: "Completo" }));
      });
    }

    // 2. Resolve duplicates
    if (action === "replace") {
      conflicts.forEach(c => {
        const cat = finalData.categorias.find(cat => cat.nombre === c.category);
        if (cat) {
          finalTeams[cat.id] = finalTeams[cat.id].map(t => 
            t.id === c.existingId ? { ...c.newData, id: t.id, status: "Completo" } : t
          );
        }
      });
    }

    setData(finalData);
    setStructures(finalStructures);
    setTeams(finalTeams);
    setImportConflicts(null);
    setIsImporting(false);
  };


  const handleApplyRecommendedToAll = () => {
    const next = { ...structures };
    data.categorias.forEach(c => {
      const tCount = teams.filter(t => t.categoriaId === c.id).length;
      next[c.id] = { ...recommendStructure(tCount), status: "configured" };
    });
    setStructures(next);
    alert("Se ha aplicado el formato recomendado a todas las categorías según sus equipos registrados.");
  };

  const calculateWizardProgress = () => {
    let score = 0;
    
    // 1. Información Básica (10%)
    if (data.nombre && data.fechaInicio && data.fechaFin && data.sedePrincipal) score += 10;
    else if (data.nombre) score += 3;

    // 2. Categorías (5%)
    if (data.categorias.length > 0) score += 5;

    // 3. Equipos Cargados (20%)
    const expected = data.categorias.reduce((acc, c) => acc + (parseInt(c.teams) || 0), 0);
    const loaded = Object.values(teams).flat().length;
    if (expected > 0) {
      score += Math.min(20, Math.floor((loaded / expected) * 20));
    } else if (loaded > 0) {
      score += 10;
    }

    // 4. Árbitros (10%)
    if (data.arbitros.length > 0) score += 10;

    // 5. Configuración de Estructura (20%)
    const configuredCount = data.categorias.filter(c => structures[c.id]?.status === "configured").length;
    if (data.categorias.length > 0) {
      score += Math.floor((configuredCount / data.categorias.length) * 20);
    }

    // 6. Pasos avanzados (35%)
    if (step >= 5) score += 10; // Formato
    if (step >= 6) score += 15; // Calendario
    if (step >= 7) score += 10; // Resumen

    return Math.min(100, score);
  };

  const wizardProgress = calculateWizardProgress();
  const totalLoaded   = Object.values(teams).flat().length;
  const totalExpected = data.categorias.reduce((acc, c) => acc + (parseInt(c.teams) || 0), 0) || (data.categorias.length * 2);

  const totalMatches = data.categorias.reduce((acc, c) => {
    const s = structures[c.id] || {};
    const tCount = teams[c.id]?.length || 0;
    if (tCount < 2) return acc;
    const math = calculateTournamentMath(s, tCount);
    return acc + math.totalMatches;
  }, 0);

  return (
    <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 40px 140px", fontFamily: FONT, background: BG, position: "relative" }}>
      
      {/* Top Progress Bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "#F1F1EF", zIndex: 2000 }}>
        <div style={{ height: "100%", background: CU, width: `${wizardProgress}%`, transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }} />
      </div>
      
      {/* Category Modal */}
      {showCatModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: "#FFF", borderRadius: 24, padding: 32, width: 540, maxHeight: "90vh", overflow: "auto", boxShadow: ELEV, fontFamily: FONT }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Agregar categorías</h3>
              <button onClick={() => { setShowCatModal(false); setCustomCatName(""); setTempCats([]); }} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color={MUTED} /></button>
            </div>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: MUTED }}>Selecciona varias categorías y luego haz clic en Guardar.</p>

            {/* Selected Summary */}
            {tempCats.length > 0 && (
              <div style={{ marginBottom: 20, padding: 16, background: CU_DIM, borderRadius: 16, border: `1px solid ${CU_BOR}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: CU, marginBottom: 10, letterSpacing: "0.05em" }}>SELECCIONADAS ({tempCats.length})</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {tempCats.map(tc => (
                    <div key={tc.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, background: "#FFF", border: `1px solid ${CU_BOR}`, fontSize: 12, fontWeight: 700, color: CU }}>
                      {tc.nombre}
                      <button onClick={() => setTempCats(p => p.filter(x => x.id !== tc.id))} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center" }}><X size={12} color={CU} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Predefined */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: HINT, marginBottom: 10, letterSpacing: "0.05em" }}>CATEGORÍAS PREDETERMINADAS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CATEGORIAS_DEFAULT.filter(c => !data.categorias.find(ec => ec.nombre === c) && !tempCats.find(tc => tc.nombre === c)).map(c => (
                  <button key={c} onClick={() => {
                    const id = c.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now();
                    setTempCats(p => [...p, { id, nombre: c, teams: 0 }]);
                  }} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, fontSize: 13, fontWeight: 600, color: TEXT, cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.target.style.borderColor = CU; e.target.style.color = CU; e.target.style.background = CU_DIM; }}
                    onMouseLeave={e => { e.target.style.borderColor = BORDER; e.target.style.color = TEXT; e.target.style.background = BG; }}
                  >{c}</button>
                ))}
              </div>
            </div>

            {/* Custom */}
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 20, marginBottom: 30 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: HINT, marginBottom: 10, letterSpacing: "0.05em" }}>CATEGORÍA PERSONALIZADA</div>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={customCatName}
                  onChange={e => setCustomCatName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleAddCustom();
                  }}
                  placeholder='Ej: Sub-17, Femenino A, Juvenil...'
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  disabled={!customCatName.trim()}
                  onClick={handleAddCustom}
                  style={{ padding: "11px 20px", borderRadius: 10, background: customCatName.trim() ? BG : BORDER, color: customCatName.trim() ? TEXT : "#CCC", border: `1px solid ${customCatName.trim() ? BORDER : "transparent"}`, fontWeight: 700, cursor: customCatName.trim() ? "pointer" : "not-allowed", fontSize: 13 }}
                >Agregar</button>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button onClick={() => { setShowCatModal(false); setCustomCatName(""); setTempCats([]); }} style={{ flex: 1, padding: "14px", borderRadius: 12, border: `1px solid ${BORDER}`, background: "none", color: MUTED, fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
              <button 
                disabled={tempCats.length === 0}
                onClick={() => {
                  setData(p => ({ ...p, categorias: [...p.categorias, ...tempCats] }));
                  setTempCats([]);
                  setShowCatModal(false);
                  setCustomCatName("");
                }}
                style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: tempCats.length > 0 ? CU : BORDER, color: "#FFF", fontWeight: 700, cursor: tempCats.length > 0 ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Save size={18} /> Guardar ({tempCats.length})
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Suggestions Application Modal */}
      {showSuggestModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: "#FFF", borderRadius: 28, padding: 32, width: 500, boxShadow: ELEV }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#FFF5F5", display: "flex", alignItems: "center", justifyContent: "center" }}><Sparkles size={20} color={PALETTE.danger} /></div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Optimizar torneo</h3>
              </div>
              <button onClick={() => setShowSuggestModal(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color={MUTED} /></button>
            </div>
            
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, marginBottom: 24 }}>Selecciona las mejoras que deseas aplicar automáticamente para garantizar la viabilidad de tu torneo:</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {showSuggestModal.map((s, idx) => (
                <div key={idx} style={{ padding: 16, border: `1.5px solid ${BORDER}`, borderRadius: 16, display: "flex", alignItems: "center", gap: 16, background: "#FDFDFB" }}>
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    id={`sug-${idx}`} 
                    style={{ width: 18, height: 18, cursor: "pointer", accentColor: PALETTE.danger }} 
                  />
                  <label htmlFor={`sug-${idx}`} style={{ flex: 1, cursor: "pointer" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{s.text}</div>
                    <div style={{ fontSize: 11, color: HINT }}>{s.impact}</div>
                  </label>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowSuggestModal(null)} style={{ flex: 1, height: 48, borderRadius: 12, border: `1px solid ${BORDER}`, background: "#FFF", fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
              <button 
                onClick={() => {
                  setData(prevData => {
                    let nextData = { ...prevData };
                    
                    showSuggestModal.forEach((s, idx) => {
                      const cb = document.getElementById(`sug-${idx}`);
                      if (cb && cb.checked) {
                        // Recalcular stats con los datos más recientes (incluyendo cambios previos en el loop)
                        const currentStats = calculateSchedulingStats(
                          nextData.horarios, 
                          totalMatches, 
                          nextData.numCanchas, 
                          nextData.duracionPartido,
                          nextData.margenEntrePartidos
                        );

                        if (s.action === "ajustar_fecha") {
                          nextData.fechaFin = estimateProjectedEndDate(nextData.fechaInicio, currentStats.estimatedWeeks);
                        }
                        
                        if (s.action === "agregar_canchas") {
                          const start = new Date(nextData.fechaInicio);
                          const end = new Date(nextData.fechaFin);
                          const availableWeeks = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 7)));
                          
                          // Calcular capacidad necesaria para las semanas disponibles
                          const neededCapacity = Math.ceil(currentStats.estimatedWeeks * currentStats.weeklyCapacity / availableWeeks);
                          const matchesPerCancha = currentStats.weeklyCapacity / nextData.numCanchas || 1;
                          nextData.numCanchas = Math.ceil(neededCapacity / matchesPerCancha);
                        }
                        
                        if (s.action === "activar_dias") {
                          const hCopy = [...nextData.horarios];
                          const inactiveIdx = hCopy.findIndex(h => !h.activo);
                          if (inactiveIdx !== -1) {
                            hCopy[inactiveIdx] = { ...hCopy[inactiveIdx], activo: true };
                            nextData.horarios = hCopy;
                          }
                        }

                        if (s.action === "ir_a_paso_4") {
                          setStep(4);
                        }
                      }
                    });
                    
                    return nextData;
                  });
                  setShowSuggestModal(null);
                }} 
                style={{ flex: 2, height: 48, borderRadius: 12, border: "none", background: PALETTE.danger, color: "#FFF", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
              >
                <Check size={18} /> Aplicar seleccionadas
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* HEADER SIMPLIFICADO */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingTop: 10 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: 13, fontWeight: 600 }} onMouseEnter={e => e.currentTarget.style.color = TEXT} onMouseLeave={e => e.currentTarget.style.color = MUTED}>
          <ArrowLeft size={16} /> Volver
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: CU, background: CU_DIM, padding: "6px 14px", borderRadius: 10 }}>
           Paso {step} de 7: <span style={{ color: TEXT }}>{STEP_LABELS[step-1]}</span>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: TEXT, letterSpacing: "-0.03em" }}>Crear torneo</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: MUTED, lineHeight: 1.5, maxWidth: 600 }}>
          {step === 4 ? "Gestiona los árbitros participantes y su disponibilidad." : step === 3 ? "Agrega los equipos participantes y asígnalos a cada categoría." : "Configura tu torneo paso a paso y personaliza cada detalle."}
        </p>
      </div>

      <StepperHeader step={step} onStepClick={setStep} />

      <AnimatePresence mode="wait">
        
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
            
            {/* LEFT PANEL */}
            <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, boxShadow: ELEV, padding: 28 }}>
              
              {/* Section 1 */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: CU_DIM, border: `1px solid ${CU_BOR}`, display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={16} color={CU} /></div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>1. Información básica del torneo</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <Field label="Nombre del torneo" required error={step1Errors.nombre}><input style={{ ...inputStyle, borderColor: step1Errors.nombre ? PALETTE.danger : BORDER }} value={data.nombre} onChange={e => update("nombre", e.target.value)} placeholder="Copa Primavera 2026" /></Field>
                <Field label="Deporte" required>
                  <div style={{ position: "relative" }}>
                    <select style={{ ...inputStyle, paddingRight: 32, appearance: "none" }} value={data.deporte} onChange={e => update("deporte", e.target.value)}>{SPORTS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <ChevronRight size={14} color={MUTED} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%) rotate(90deg)", pointerEvents: "none" }} />
                  </div>
                </Field>
                <Field label="Temporada" required error={step1Errors.temporada}><input style={{ ...inputStyle, borderColor: step1Errors.temporada ? PALETTE.danger : BORDER }} value={data.temporada} onChange={e => update("temporada", e.target.value)} placeholder={`Primavera ${currentYear}`} /></Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <Field label="Fecha de inicio" required error={step1Errors.fechaInicio}>
                  <div 
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startRef.current?.showPicker(); } }}
                    style={{ ...dateClickArea, cursor: "pointer", borderColor: step1Errors.fechaInicio ? PALETTE.danger : BORDER }} 
                    onClick={() => startRef.current?.showPicker()}
                  >
                    <Calendar size={14} color={step1Errors.fechaInicio ? PALETTE.danger : HINT} />
                    <span style={{ fontSize: 13, color: data.fechaInicio ? TEXT : HINT, flex: 1 }}>{data.fechaInicio || "DD/MM/AAAA"}</span>
                    <input ref={startRef} type="date" tabIndex={-1} style={hiddenInput} value={data.fechaInicio} onChange={e => update("fechaInicio", e.target.value)} />
                  </div>
                </Field>
                <Field label="Fecha de finalización" required error={step1Errors.fechaFin}>
                  <div 
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); endRef.current?.showPicker(); } }}
                    style={{ ...dateClickArea, cursor: "pointer", borderColor: step1Errors.fechaFin ? PALETTE.danger : BORDER }} 
                    onClick={() => endRef.current?.showPicker()}
                  >
                    <Calendar size={14} color={step1Errors.fechaFin ? PALETTE.danger : HINT} />
                    <span style={{ fontSize: 13, color: data.fechaFin ? TEXT : HINT, flex: 1 }}>{data.fechaFin || "DD/MM/AAAA"}</span>
                    <input ref={endRef} type="date" tabIndex={-1} style={hiddenInput} value={data.fechaFin} onChange={e => update("fechaFin", e.target.value)} />
                  </div>
                </Field>
                <Field label="Organizador" required error={step1Errors.organizador}><input style={{ ...inputStyle, borderColor: step1Errors.organizador ? PALETTE.danger : BORDER }} value={data.organizador} onChange={e => update("organizador", e.target.value)} placeholder="ALTTEZ Torneos" /></Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 28 }}>
                <Field label="Sede principal" required error={step1Errors.sedePrincipal}>
                  <div style={{ position: "relative" }}>
                    <input style={{ ...inputStyle, paddingRight: 40, borderColor: step1Errors.sedePrincipal ? PALETTE.danger : BORDER }} value={data.sedePrincipal} onChange={e => update("sedePrincipal", e.target.value)} placeholder="Ej: Complejo Deportivo Central" />
                    <button 
                      onClick={() => {
                        const url = window.prompt("Pega el enlace de Google Maps o la ubicación de la sede:", data.sedeUbicacion);
                        if (url !== null) update("sedeUbicacion", url);
                      }} 
                      style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: data.sedeUbicacion ? CU_DIM : "#F1F1F1", border: `1px solid ${data.sedeUbicacion ? CU_BOR : BORDER}`, borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: data.sedeUbicacion ? CU : HINT }}
                      title="Agregar ubicación en Google Maps"
                    >
                      <MapPin size={14} />
                    </button>
                  </div>
                </Field>
                <Field label="Descripción">
                  <div style={{ position: "relative" }}>
                    <textarea style={{ ...inputStyle, height: 42, resize: "none", paddingTop: 10 }} value={data.descripcion} onChange={e => update("descripcion", e.target.value.slice(0, 200))} placeholder="Descripción del torneo..." />
                    <span style={{ position: "absolute", bottom: 4, right: 10, fontSize: 10, color: HINT }}>{data.descripcion.length}/200</span>
                  </div>
                </Field>
              </div>

              {/* Section 2 — Categorías */}
              <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 24, marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
                  <Users size={18} color={CU} /> 2. {data.multiplesCategorias ? "Categorías del torneo" : "Categoría del torneo"}
                </h3>
                
                {data.multiplesCategorias ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                    {data.categorias.map(cat => (
                      <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "#FDFDFB", borderRadius: 12, border: `1px solid ${BORDER}` }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{cat.nombre}</div>
                          {cat.teams > 0 && <div style={{ fontSize: 10, color: HINT }}>{cat.teams} equipos</div>}
                        </div>
                        <button onClick={() => setData(p => ({ ...p, categorias: p.categorias.filter(c => c.id !== cat.id) }))} style={{ background: "none", border: "none", cursor: "pointer", color: HINT, padding: 0, marginLeft: 4 }}><X size={12} /></button>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowCatModal(true)}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: `1.5px dashed ${CU_BOR}`, background: "none", color: CU, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      <Plus size={14} /> Agregar categoría
                    </button>
                  </div>
                ) : (
                  <div style={{ marginBottom: 20 }}>
                    <Field label="Nombre de la categoría única" required>
                      <input 
                        style={inputStyle} 
                        value={data.categorias[0]?.nombre || ""} 
                        onChange={e => {
                          const val = e.target.value;
                          setData(p => {
                            const cats = [...p.categorias];
                            if (cats.length === 0) cats.push({ id: Date.now(), nombre: val, teams: 0 });
                            else cats[0].nombre = val;
                            return { ...p, categorias: cats };
                          });
                        }} 
                        placeholder="Ej: Categoría Única, Libre, etc." 
                      />
                    </Field>
                  </div>
                )}

                {data.multiplesCategorias && data.categorias.length > 0 && (
                  <div style={{ padding: "10px 14px", borderRadius: 10, background: "#EEF6FF", border: "1px solid #C7DFF7", display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <Info size={14} color="#2E87E8" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#1A5FA8" }}>Este torneo incluirá <strong>múltiples categorías</strong>. Podrás gestionar equipos y jugadores por categoría en el siguiente paso.</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: 32, paddingTop: 12, marginTop: 12, borderTop: `1px solid ${PALETTE.surfaceDim}` }}>
                  <Switch 
                    active={data.multiplesCategorias} 
                    onChange={v => {
                      update("multiplesCategorias", v);
                      if (!v && data.categorias.length > 1) {
                        setData(p => ({ ...p, categorias: [p.categorias[0]] }));
                      }
                    }} 
                    label="Múltiples categorías" 
                    desc="Activa esta opción si el torneo tendrá varias divisiones o grupos de edad (ej: Sub-10, Libre)."
                  />
                  <Switch 
                    active={data.autoBorrador} 
                    onChange={v => update("autoBorrador", v)} 
                    label="Borrador automático" 
                    desc="El sistema guardará tus avances automáticamente en el almacenamiento local de tu navegador."
                  />
                </div>
              </div>

              {/* Section 3 — Horarios */}
              <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
                    <Calendar size={18} color={CU} /> 3. Días y horarios de juego
                  </h3>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFF", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "6px 12px" }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: MUTED }}>CANCHAS</div>
                      <input type="number" min="1" value={data.numCanchas} onChange={e => update("numCanchas", e.target.value === "" ? "" : parseInt(e.target.value))} style={{ width: 40, border: "none", background: "none", fontSize: 13, fontWeight: 800, color: TEXT, textAlign: "center", outline: "none" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFF", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "6px 12px" }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: MUTED }}>DURACIÓN (MIN)</div>
                      <input type="number" step="15" min="15" value={data.duracionPartido} onChange={e => update("duracionPartido", e.target.value === "" ? "" : parseInt(e.target.value))} style={{ width: 50, border: "none", background: "none", fontSize: 13, fontWeight: 800, color: TEXT, textAlign: "center", outline: "none" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFF", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "6px 12px" }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: MUTED }}>MARGEN (MIN)</div>
                      <input type="number" step="5" min="0" value={data.margenEntrePartidos} onChange={e => update("margenEntrePartidos", e.target.value === "" ? "" : parseInt(e.target.value))} style={{ width: 40, border: "none", background: "none", fontSize: 13, fontWeight: 800, color: TEXT, textAlign: "center", outline: "none" }} />
                    </div>
                  </div>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, marginBottom: 20 }}>
                  {data.horarios?.map((h, i) => (
                    <div 
                      key={i} 
                      onClick={() => {
                        const next = [...data.horarios];
                        next[i].activo = !next[i].activo;
                        update("horarios", next);
                      }}
                      style={{ 
                        padding: "12px 8px", 
                        borderRadius: 12, 
                        border: `1.5px solid ${h.activo ? CU : BORDER}`, 
                        background: h.activo ? CU_DIM : "#FFF", 
                        textAlign: "center", 
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 800, color: h.activo ? CU : MUTED }}>{h.dia.slice(0, 3)}</div>
                    </div>
                  ))}
                </div>
                
                {data.horarios.filter(h => h.activo).length > 0 && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                    <button 
                      onClick={handleApplyTimeToAll} 
                      style={{ background: "#FFF8EE", border: `1px solid ${CU_BOR}`, color: CU, padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", boxShadow: "0 2px 4px rgba(181, 143, 76, 0.1)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = CU_DIM; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#FFF8EE"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      <Zap size={14} /> Aplicar mismo horario a todos
                    </button>
                  </div>
                )}
 
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {data.horarios.filter(h => h.activo).map((h, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#FDFDFB", borderRadius: 12, border: `1px solid ${BORDER}` }}>
                      <span style={{ fontSize: 13, fontWeight: 800, width: 40 }}>{h.dia.slice(0, 3)}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input 
                          type="time" 
                          value={h.inicio} 
                          onChange={e => {
                            const next = [...data.horarios];
                            const idx = next.findIndex(x => x.dia === h.dia);
                            next[idx].inicio = e.target.value;
                            update("horarios", next);
                          }}
                          style={{ border: "none", background: "none", fontSize: 14, fontWeight: 800, color: TEXT, outline: "none", width: 100, cursor: "pointer", padding: 0 }}
                        />
                        <span style={{ color: HINT, fontWeight: 800 }}>—</span>
                        <input 
                          type="time" 
                          value={h.fin} 
                          onChange={e => {
                            const next = [...data.horarios];
                            const idx = next.findIndex(x => x.dia === h.dia);
                            next[idx].fin = e.target.value;
                            update("horarios", next);
                          }}
                          style={{ border: "none", background: "none", fontSize: 14, fontWeight: 800, color: TEXT, outline: "none", width: 100, cursor: "pointer", padding: 0 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {data.horarios.every(h => !h.activo) && (
                  <div style={{ padding: "20px", textAlign: "center", background: "#FDFDFB", borderRadius: 12, border: `1px dotted ${BORDER}`, color: MUTED, fontSize: 13 }}>
                    Selecciona al menos un día de la semana para configurar los horarios de juego.
                  </div>
                )}
              </div>
            </div>

            {/* SIDEBAR */}
            <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#FDFDFB", borderRadius: 20, border: `1px solid ${BORDER}`, padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                  <Lightbulb size={16} color="#D89A2B" />
                  <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: TEXT }}>Qué configurarás en este paso</h4>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <SidebarItem icon={Calendar} title="Nombre y temporada" desc="Define el nombre oficial del torneo y la temporada correspondiente." />
                  <SidebarItem icon={Calendar} title="Fechas base" desc="Establece las fechas de inicio y finalización del torneo." />
                  <SidebarItem icon={Trophy} title="Formato de competencia" desc="Selecciona el formato que mejor se adapte a tu torneo." />
                  <SidebarItem icon={Users} title="Categorías iniciales" desc="Agrega las categorías que formarán parte del torneo desde el inicio." />
                  <SidebarItem icon={Globe} title="Datos del organizador" desc="Información básica del organizador y la sede principal." />
                </div>
              </div>
            </aside>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <SummaryBar data={data} totalLoaded={totalLoaded} />
            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 340px", gap: 24, alignItems: "start" }}>
              
              {/* SIDEBAR - CATEGORIAS */}
              <motion.div 
                variants={ANIM_VARIANTS.container}
                initial="hidden"
                animate="visible"
                style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: "hidden", padding: "16px 0" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ padding: "0 16px 8px", fontSize: 11, fontWeight: 800, color: HINT, letterSpacing: "0.05em" }}>CATEGORÍAS</div>
                  {data.categorias.map(c => {
                    const tCount = teams[c.id]?.length || 0;
                    const active = catId === c.id;
                    const struct = structures[c.id] || {};
                    let stateColor = HINT;
                    let stateBg = BG;
                    let stateText = "Pendiente";
                    
                    if (tCount < 2) {
                      stateColor = PALETTE.danger;
                      stateBg = "#FEF2F2";
                      stateText = "Sin equipos";
                    } else if (struct.status === "configured") {
                      stateColor = PALETTE.success;
                      stateBg = "#F0FDF4";
                      stateText = "Lista";
                    } else if (active) {
                      stateColor = "#D89A2B";
                      stateBg = "#FFFBEB";
                      stateText = "Configurando";
                    }

                    return (
                      <motion.div 
                        key={c.id} 
                        variants={ANIM_VARIANTS.item}
                        whileHover={{ x: 6, backgroundColor: active ? "#FFF" : "#F8F8F6" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCatId(c.id)} 
                        style={{ 
                          margin: "0 12px",
                          padding: "16px", 
                          borderRadius: 16,
                          display: "flex", 
                          flexDirection: "column",
                          gap: 12,
                          cursor: "pointer", 
                          background: active ? "#FFF" : "#FDFDFB", 
                          border: `1.5px solid ${active ? CU : BORDER}`,
                          boxShadow: active ? "0 4px 12px rgba(181, 143, 76, 0.1)" : "none",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: active ? CU : BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <LayoutGrid size={16} color={active ? "#FFF" : HINT} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>{c.nombre}</div>
                            <div style={{ fontSize: 11, color: HINT }}>{tCount} equipos cargados</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <div style={{ fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: stateBg, color: stateColor, border: `1px solid ${stateColor}20` }}>
                            {stateText.toUpperCase()}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* CENTER - CONFIGURACION */}
              {(() => {
                const activeCat = data.categorias.find(c => c.id === catId);
                if (!activeCat) return <div />;
                const tCount = teams[catId]?.length || 0;
                const s = structures[catId] || { format: "grupos_playoffs" };
                
                if (tCount < 2) {
                  return (
                    <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 40, textAlign: "center" }}>
                      <AlertCircle size={40} color={PALETTE.danger} style={{ margin: "0 auto 16px" }} />
                      <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800 }}>Categoría sin equipos suficientes</h3>
                      <p style={{ margin: 0, fontSize: 14, color: MUTED }}>Esta categoría tiene {tCount} equipo(s). Se requieren al menos 2 equipos para configurar un formato de competencia.</p>
                    </div>
                  );
                }

                return (
                  <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button 
                            onClick={() => {
                              const idx = data.categorias.findIndex(c => c.id === catId);
                              if (idx > 0) setCatId(data.categorias[idx - 1].id);
                            }}
                            disabled={data.categorias.findIndex(c => c.id === catId) === 0}
                            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: data.categorias.findIndex(c => c.id === catId) === 0 ? 0.3 : 1 }}
                          >
                            <ChevronLeft size={16} color={TEXT} />
                          </button>
                          <button 
                            onClick={() => {
                              const idx = data.categorias.findIndex(c => c.id === catId);
                              if (idx < data.categorias.length - 1) setCatId(data.categorias[idx + 1].id);
                            }}
                            disabled={data.categorias.findIndex(c => c.id === catId) === data.categorias.length - 1}
                            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: data.categorias.findIndex(c => c.id === catId) === data.categorias.length - 1 ? 0.3 : 1 }}
                          >
                            <ChevronRight size={16} color={TEXT} />
                          </button>
                        </div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Configurando: <span style={{ color: CU }}>{activeCat.nombre}</span></h3>
                      </div>
                      
                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={handleApplyRecommendedToAll} style={{ display: "flex", alignItems: "center", gap: 6, background: "#EEF6FF", border: "1px solid #C7DFF7", color: "#1A5FA8", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          <Sparkles size={14} /> Recomendado a todas
                        </button>
                        <button onClick={() => updateStruct(catId, { ...recommendStructure(tCount), status: "configured" })} style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFF8EE", border: "1px solid #F5DEB3", color: "#D89A2B", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          <Zap size={14} /> Usar recomendación
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 800 }}>1. Formato de competencia</h4>
                      <motion.div 
                        variants={ANIM_VARIANTS.container}
                        initial="hidden"
                        animate="visible"
                        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}
                      >
                        {FASE_OPTIONS.filter(f => f.id !== "liga_playoffs").map(opt => {
                          const sel = s.format === opt.id;
                          return (
                            <motion.div 
                              key={opt.id} 
                              variants={ANIM_VARIANTS.item}
                              whileHover={ANIM_VARIANTS.card.hover}
                              whileTap={ANIM_VARIANTS.card.tap}
                              onClick={() => updateStruct(catId, { format: opt.id, status: "configured" })} 
                              style={{ 
                                padding: "14px 12px", 
                                borderRadius: 12, 
                                border: `1.5px solid ${sel ? CU : BORDER}`, 
                                background: sel ? CU_DIM : "#FFF", 
                                cursor: "pointer",
                                boxShadow: sel ? "0 8px 20px rgba(181, 143, 76, 0.1)" : "none"
                              }}
                            >
                              <div style={{ fontSize: 12, fontWeight: 700, color: TEXT, marginBottom: 4 }}>{opt.label}</div>
                              <div style={{ fontSize: 10, color: MUTED }}>{opt.desc}</div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </div>

                    {s.format === "grupos_playoffs" && (
                      <div style={{ marginBottom: 24 }}>
                        <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 800 }}>2. Configuración de fase de grupos</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                          <RowInp label="Número de grupos" type="number" value={s.groupsCount || 1} onChange={v => updateStruct(catId, { groupsCount: parseInt(v) || 1, status: "configured" })} />
                          <RowInp label="Modalidad" type="select" value={s.groupLegs || 1} onChange={v => updateStruct(catId, { groupLegs: parseInt(v) || 1, status: "configured" })} options={[{v: 1, l: "Una vuelta"}, {v: 2, l: "Ida y vuelta"}]} />
                          <RowInp label="Clasifican por grupo" type="number" value={s.qualifyPerGroup || 2} onChange={v => updateStruct(catId, { qualifyPerGroup: parseInt(v) || 1, status: "configured" })} />
                        </div>
                      </div>
                    )}
                    
                    {s.format === "todos_contra_todos" && (
                      <div style={{ marginBottom: 24 }}>
                        <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 800 }}>2. Configuración de liga</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                          <RowInp label="Número de vueltas" type="select" value={s.groupLegs || 1} onChange={v => updateStruct(catId, { groupLegs: parseInt(v) || 1, status: "configured" })} options={[{v: 1, l: "Una vuelta"}, {v: 2, l: "Ida y vuelta"}]} />
                        </div>
                      </div>
                    )}

                    {(s.format === "grupos_playoffs" || s.format === "eliminacion") && (
                      <div style={{ marginBottom: 24 }}>
                        <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 800 }}>3. Eliminatoria</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          <RowInp label="Partidos de eliminatoria" type="select" value={s.playoffLegs || 1} onChange={v => updateStruct(catId, { playoffLegs: parseInt(v) || 1, status: "configured" })} options={[{v: 1, l: "Partido único"}, {v: 2, l: "Ida y vuelta"}]} />
                          <RowInp label="Gran final" type="select" value={s.finalLegs || 1} onChange={v => updateStruct(catId, { finalLegs: parseInt(v) || 1, status: "configured" })} options={[{v: 1, l: "Partido único"}, {v: 2, l: "Ida y vuelta"}]} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* RIGHT - PREVIEW AUTOMATICA */}
              {(() => {
                const tCount = teams[catId]?.length || 0;
                if (tCount < 2) return <div />;
                const s = structures[catId] || { format: "grupos_playoffs", groupsCount: 1, groupLegs: 1, qualifyPerGroup: 2, playoffLegs: 1, finalLegs: 1 };
                const math = calculateTournamentMath(s, tCount);
                
                return (
                  <div style={{ background: "#FDFBF7", borderRadius: 20, border: `1px solid #F5E6D3`, padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Vista previa automática</h4>
                      <div style={{ fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: "#E7F9ED", color: PALETTE.success }}>Configuración válida</div>
                    </div>
                    
                    {s.format === "grupos_playoffs" && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: MUTED, marginBottom: 8 }}>FASE DE GRUPOS</div>
                        <PreviewItem text={`${s.groupsCount} grupo(s)`} />
                        <PreviewItem text={`${math.groupStageMatches} partidos en total`} />
                      </div>
                    )}
                    
                    {math.totalQualified > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: MUTED, marginBottom: 8 }}>CLASIFICACIÓN</div>
                        <PreviewItem text={`Total clasificados: ${math.totalQualified}`} />
                        {math.playoffStructure && <PreviewItem text={`Inicia desde: ${math.playoffStructure.initialRound}`} />}
                        {math.playoffStructure?.needsPreliminary && <PreviewItem text={`Requiere ronda preliminar (${math.playoffStructure.teamsInPreliminary} equipos)`} />}
                      </div>
                    )}
                    
                    <div style={{ borderTop: "1px solid #F5E6D3", paddingTop: 16, marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 800 }}>Total de partidos:</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: CU }}>{math.totalMatches}</span>
                    </div>

                    {/* CALENDAR IMPACT */}
                    <div style={{ borderTop: "1px solid #F5E6D3", paddingTop: 16, marginTop: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: MUTED, marginBottom: 12 }}>IMPACTO EN CALENDARIO</div>
                      {(() => {
                        const stats = calculateSchedulingStats(data.horarios, math.totalMatches);
                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                             <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                               <span style={{ color: HINT }}>Partidos / semana:</span>
                               <span style={{ fontWeight: 700 }}>{stats.weeklyCapacity}</span>
                             </div>
                             <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                               <span style={{ color: HINT }}>Semanas estimadas:</span>
                               <span style={{ fontWeight: 700 }}>{stats.estimatedWeeks}</span>
                             </div>
                             {stats.estimatedWeeks > 0 && stats.estimatedWeeks !== Infinity && (
                               <div style={{ marginTop: 8, padding: "8px 12px", background: "#FCF8F1", borderRadius: 8, fontSize: 11, color: CU, fontWeight: 600 }}>
                                 Finalización aprox: {estimateProjectedEndDate(data.fechaInicio, stats.estimatedWeeks)}
                               </div>
                             )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}

            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <SummaryBar data={data} totalLoaded={totalLoaded} />

            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 300px", gap: 24, alignItems: "start" }}>
              <motion.div 
                variants={ANIM_VARIANTS.container}
                initial="hidden"
                animate="visible"
                style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: "hidden", padding: "16px 0" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ padding: "0 16px 8px", fontSize: 11, fontWeight: 800, color: HINT, letterSpacing: "0.05em" }}>CATEGORÍAS</div>
                  {data.categorias.map(c => {
                    const loaded = teams[c.id]?.length || 0;
                    const isDone = loaded >= 2;
                    const active = catId === c.id;
                    
                    return (
                      <motion.div 
                        key={c.id} 
                        variants={ANIM_VARIANTS.item}
                        whileHover={{ x: 6, backgroundColor: active ? "#FFF" : "#F8F8F6" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCatId(c.id)} 
                        style={{ 
                          margin: "0 12px",
                          padding: "16px", 
                          borderRadius: 16, 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 12, 
                          cursor: "pointer", 
                          background: active ? "#FFF" : "#FDFDFB", 
                          border: `1.5px solid ${active ? CU : BORDER}`,
                          boxShadow: active ? "0 4px 12px rgba(181, 143, 76, 0.1)" : "none",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 12, background: active ? CU : BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Users size={18} color={active ? "#FFF" : HINT} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>{c.nombre}</div>
                          <div style={{ fontSize: 11, color: isDone ? PALETTE.success : "#E87C2E", fontWeight: 700 }}>
                            {isDone ? <CheckCircle size={10} style={{ marginRight: 4 }} /> : <AlertCircle size={10} style={{ marginRight: 4 }} />}
                            {loaded} equipos
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, boxShadow: ELEV, padding: "24px 0", minHeight: 400, display: "flex", flexDirection: "column" }}>
                {importConflicts ? (
                  <div style={{ padding: "0 32px 32px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, color: "#D89A2B" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FEF9C3", display: "flex", alignItems: "center", justifyContent: "center" }}><AlertTriangle size={24} /></div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: TEXT }}>Acción requerida</h3>
                        <p style={{ margin: 0, fontSize: 13, color: MUTED }}>Se detectaron detalles en la importación de archivos</p>
                      </div>
                    </div>

                    {importConflicts.orphans.length > 0 && (
                      <div style={{ marginBottom: 24, padding: 20, background: "#F0F9FF", borderRadius: 16, border: "1px solid #B9E6FE" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                           <Plus size={16} color="#026AA2" />
                           <span style={{ fontSize: 14, fontWeight: 800, color: "#026AA2" }}>Nuevas categorías detectadas</span>
                        </div>
                        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#026AA2", lineHeight: 1.5 }}>El archivo contiene equipos en categorías que no has creado. Se crearán automáticamente:</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {importConflicts.orphans.map((o, i) => (
                            <span key={i} style={{ padding: "6px 12px", background: "#FFF", borderRadius: 8, border: "1px solid #B9E6FE", fontSize: 12, fontWeight: 700, color: "#026AA2" }}>{o}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {importConflicts.conflicts.length > 0 && (
                      <div>
                        <p style={{ fontSize: 14, color: TEXT, fontWeight: 700, marginBottom: 12 }}>Equipos que ya existen ({importConflicts.conflicts.length})</p>
                        <div style={{ maxHeight: 300, overflow: "auto", background: BG, borderRadius: 12, padding: "8px 16px", border: `1px solid ${BORDER}` }}>
                          {importConflicts.conflicts.map((c, i) => (
                            <div key={i} style={{ fontSize: 12, padding: "12px 0", borderBottom: i < importConflicts.conflicts.length - 1 ? `1px solid ${BORDER}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                               <span><strong>{c.teamName}</strong> en <span style={{ color: CU, fontWeight: 700 }}>{c.category}</span></span>
                               <span style={{ fontSize: 10, padding: "2px 6px", background: "#F1F1F1", borderRadius: 4, color: MUTED }}>Conflicto detectado</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : isImporting ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40 }}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", border: `4px solid ${CU_DIM}`, borderTopColor: CU, margin: "0 auto 24px", animation: "spin 1s linear infinite" }} />
                    <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800 }}>Procesando archivo...</h3>
                    <p style={{ margin: 0, fontSize: 14, color: MUTED, maxWidth: 300 }}>Estamos organizando tus equipos y validando las categorías cargadas.</p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", marginBottom: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Equipos de: {activeCat?.nombre}</h3>
                        <span style={{ fontSize: 12, color: "#E87C2E", fontWeight: 700 }}>{activeTeams.length} equipos cargados</span>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ position: "relative" }}>
                          <Search size={14} color={HINT} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                          <input 
                            placeholder="Buscar equipo..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ ...inputStyle, paddingLeft: 34, width: 200, height: 36 }} 
                          />
                        </div>
                      </div>
                    </div>
                    <motion.div 
                      variants={ANIM_VARIANTS.container}
                      initial="hidden"
                      animate="visible"
                      style={{ padding: "0 24px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}
                    >
                      {activeTeams.map((t, idx) => (
                        <motion.div 
                          key={idx} 
                          variants={ANIM_VARIANTS.item}
                          whileHover={ANIM_VARIANTS.card.hover}
                          whileTap={ANIM_VARIANTS.card.tap}
                          style={{ 
                            background: "#FDFDFB", 
                            borderRadius: 12, 
                            border: `1px solid ${BORDER}`, 
                            padding: "12px 16px",
                            position: "relative",
                            transition: "all 0.2s",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            minHeight: 90,
                            maxWidth: 300
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, width: "100%" }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#FFF", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", flexShrink: 0 }}>
                              <Shield size={16} color={CU} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 800, fontSize: 13, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                              <div style={{ fontSize: 9, color: HINT, display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
                                <User size={8} style={{ opacity: 0.7 }} /> 
                                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.delegate || "Sin delegado"}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${BORDER}`, marginTop: "auto", width: "100%" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, color: MUTED }}>
                              <Users size={10} color={HINT} />
                              <span style={{ fontSize: 10, fontWeight: 700 }}>{t.players || 0}</span>
                              <span style={{ fontSize: 9, fontWeight: 500 }}>jugadores</span>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleRemoveTeam(catId, t); }} 
                              style={{ width: 28, height: 28, borderRadius: 8, background: "#FFF", border: `1px solid ${BORDER}`, cursor: "pointer", color: HINT, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} 
                              onMouseEnter={e => { e.currentTarget.style.color = PALETTE.danger; e.currentTarget.style.borderColor = PALETTE.danger; e.currentTarget.style.background = "#FEF2F2"; }} 
                              onMouseLeave={e => { e.currentTarget.style.color = HINT; e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = "#FFF"; }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          <div style={{ position: "absolute", top: 12, right: 12 }}>
                            <div style={{ fontSize: 8, fontWeight: 900, color: t.estado === "retirado" ? PALETTE.danger : PALETTE.success, background: t.estado === "retirado" ? "#FEE2E2" : "#E7F9ED", padding: "3px 6px", borderRadius: 4, letterSpacing: "0.05em" }}>
                              {(t.estado || "ACTIVO").toUpperCase()}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {activeTeams.length === 0 && (
                        <div style={{ gridColumn: "1 / -1", padding: 60, textAlign: "center", color: HINT }}>
                          <AlertCircle size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                          <p style={{ fontWeight: 600 }}>No hay equipos cargados aún en esta categoría.</p>
                          <p style={{ fontSize: 12 }}>Usa el panel de la derecha para importar o agregar manualmente.</p>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {importConflicts ? (
                  <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${CU_BOR}`, padding: 24, boxShadow: ELEV }}>
                    <h4 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800 }}>Resolver conflictos</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <button onClick={() => resolveConflicts("replace")} style={{ width: "100%", padding: "14px", borderRadius: 12, background: CU, color: "#FFF", border: "none", fontWeight: 700, cursor: "pointer", transition: "transform 0.1s" }} onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}>
                        {importConflicts.conflicts.length > 0 ? "Reemplazar e Importar" : "Crear e Importar"}
                      </button>
                      {importConflicts.conflicts.length > 0 && (
                        <button onClick={() => resolveConflicts("skip")} style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#F1F1F1", color: TEXT, border: "none", fontWeight: 700, cursor: "pointer" }}>Omitir duplicados</button>
                      )}
                      <button onClick={() => { setImportConflicts(null); setIsImporting(false); }} style={{ width: "100%", padding: "10px", color: MUTED, background: "none", border: "none", fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
                    </div>
                  </div>
                ) : isImporting ? (
                  <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 24, opacity: 0.6, pointerEvents: "none" }}>
                    <h4 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800 }}>Acciones rápidas</h4>
                    <p style={{ fontSize: 12, color: MUTED }}>Importación en curso...</p>
                  </div>
                ) : (
                  <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 24 }}>
                    <h4 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800 }}>Acciones rápidas</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <button onClick={() => {
                        const name = window.prompt("Nombre del equipo:");
                        if (!name?.trim()) return;
                        const delegate = window.prompt("Nombre del delegado (opcional):") || "";
                        const next = { ...teams };
                        if (!next[catId]) next[catId] = [];
                        next[catId] = [...next[catId], { id: Date.now() + Math.random(), name: name.trim(), delegate: delegate.trim(), players: 0, status: "Completo" }];
                        setTeams(next);
                      }} style={{ width: "100%", padding: "12px", borderRadius: 12, background: CU, color: "#FFF", border: "none", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Plus size={16} /> Nuevo equipo</button>
                      <input type="file" accept=".xlsx,.xls,.csv" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
                      <button onClick={() => fileInputRef.current?.click()} style={{ width: "100%", padding: "12px", borderRadius: 12, background: "none", border: `1px solid ${CU_BOR}`, color: CU, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Upload size={16} /> Importar Excel</button>
                      <button onClick={handleDownloadTemplate} style={{ width: "100%", padding: "12px", borderRadius: 12, background: "none", border: `1px solid ${BORDER}`, color: MUTED, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Download size={16} /> Descargar plantilla</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal de Baja de Equipo */}
            {teamToWithdraw && (
              <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: "#FFF", borderRadius: 24, padding: 32, width: 400, boxShadow: ELEV }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Dar de baja a equipo</h3>
                    <button onClick={() => setTeamToWithdraw(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color={MUTED} /></button>
                  </div>
                  <div style={{ padding: 16, background: "#FFF1E7", borderRadius: 12, border: `1px solid #F5D4B8`, display: "flex", gap: 10, marginBottom: 20 }}>
                    <AlertCircle size={20} color="#E87C2E" />
                    <p style={{ margin: 0, fontSize: 12, color: "#A65213", fontWeight: 600 }}>
                      El equipo <strong>{teamToWithdraw.team.name}</strong> ya tiene partidos generados. No se puede eliminar de la base de datos para no afectar estadísticas previas.
                    </p>
                  </div>
                  <p style={{ fontSize: 13, color: TEXT, marginBottom: 16, fontWeight: 600 }}>Selecciona un motivo de baja para desactivarlo del torneo:</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                    {["Retirado", "Suspendido", "Expulsado", "Descalificado"].map(reason => (
                      <button key={reason} onClick={() => confirmWithdrawal(reason)} style={{ padding: "12px", borderRadius: 10, border: `1px solid ${BORDER}`, background: BG, fontSize: 13, fontWeight: 700, color: TEXT, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.target.style.borderColor = PALETTE.danger; e.target.style.color = PALETTE.danger; e.target.style.background = "#FEE2E2"; }}
                        onMouseLeave={e => { e.target.style.borderColor = BORDER; e.target.style.color = TEXT; e.target.style.background = BG; }}
                      >
                        Marcar como {reason}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="stepArbitros" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <SummaryBar data={data} totalLoaded={totalLoaded} />
            <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 32, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                  <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800 }}>Gestión de Árbitros</h2>
                  <p style={{ margin: 0, fontSize: 14, color: MUTED }}>Registra los jueces que participarán en el torneo para su asignación automática.</p>
                </div>
                <div style={{ background: "#E7F9ED", color: PALETTE.success, padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800 }}>
                  {data.arbitros.length} ÁRBITROS REGISTRADOS
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <User size={18} color={HINT} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input 
                    id="arb-name-input"
                    placeholder="Escribe el nombre del árbitro y presiona Enter..."
                    style={{ ...inputStyle, paddingLeft: 44, height: 52 }}
                    onKeyDown={e => {
                      if (e.key === "Enter" && e.target.value.trim()) {
                        const name = e.target.value.trim();
                        update("arbitros", [...data.arbitros, { id: Date.now(), name, matches: 0 }]);
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
                <button 
                  onClick={() => {
                    const input = document.getElementById("arb-name-input");
                    if (input && input.value.trim()) {
                      update("arbitros", [...data.arbitros, { id: Date.now(), name: input.value.trim(), matches: 0 }]);
                      input.value = "";
                    }
                  }}
                  style={{ background: CU, color: "#FFF", border: "none", padding: "0 32px", borderRadius: 12, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(181, 143, 76, 0.2)" }}
                >
                  Agregar Juez
                </button>
              </div>

              <motion.div 
                variants={ANIM_VARIANTS.container}
                initial="hidden"
                animate="visible"
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}
              >
                {data.arbitros.map(a => (
                  <motion.div 
                    layout
                    variants={ANIM_VARIANTS.item}
                    whileHover={ANIM_VARIANTS.card.hover}
                    whileTap={ANIM_VARIANTS.card.tap}
                    key={a.id} 
                    onClick={() => {
                      setSelectedArb(a);
                      setShowArbModal(true);
                    }}
                    style={{ padding: 16, background: "#FFF", border: `1.5px solid ${BORDER}`, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", cursor: "pointer" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: a.photo ? `url(${a.photo}) center/cover` : CU_DIM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: CU, border: `1px solid ${CU_BOR}` }}>
                        {!a.photo && a.name.slice(0,1).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>{a.name}</div>
                        <div style={{ fontSize: 10, color: a.disponibilidad === "completa" ? PALETTE.success : "#D89A2B", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                          {a.disponibilidad === "completa" ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {a.disponibilidad === "completa" ? "Disponible" : "Con franjas"}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        update("arbitros", data.arbitros.filter(x => x.id !== a.id));
                      }} 
                      style={{ width: 32, height: 32, borderRadius: 10, background: "#FFF", border: `1px solid ${BORDER}`, cursor: "pointer", color: HINT, display: "flex", alignItems: "center", justifyContent: "center" }}
                      onMouseEnter={e => { e.currentTarget.style.color = PALETTE.danger; e.currentTarget.style.borderColor = PALETTE.danger; }}
                      onMouseLeave={e => { e.currentTarget.style.color = HINT; e.currentTarget.style.borderColor = BORDER; }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
                {data.arbitros.length === 0 && (
                  <motion.div variants={ANIM_VARIANTS.item} style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: HINT, fontSize: 14, border: `2px dashed ${BORDER}`, borderRadius: 24, background: BG }}>
                    <Users size={40} style={{ opacity: 0.2, marginBottom: 16 }} />
                    <p style={{ fontWeight: 600 }}>No hay árbitros registrados aún.</p>
                    <p style={{ fontSize: 12 }}>Los árbitros se asignarán automáticamente a los partidos según su disponibilidad.</p>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Modal de Perfil de Árbitro */}
            <AnimatePresence>
              {showArbModal && selectedArb && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }} style={{ background: "#FFF", borderRadius: 28, padding: 32, width: 580, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", fontFamily: FONT }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ position: "relative" }}>
                          <div style={{ width: 80, height: 80, borderRadius: 24, background: selectedArb.photo ? `url(${selectedArb.photo}) center/cover` : CU_DIM, border: `2px solid ${CU_BOR}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: CU, overflow: "hidden" }}>
                            {!selectedArb.photo && selectedArb.name.slice(0,1).toUpperCase()}
                          </div>
                          <input 
                            type="file" 
                            ref={photoInputRef}
                            style={{ display: "none" }}
                            accept="image/*"
                            onChange={e => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const base64 = reader.result;
                                  const next = data.arbitros.map(x => x.id === selectedArb.id ? { ...x, photo: base64 } : x);
                                  update("arbitros", next);
                                  setSelectedArb({ ...selectedArb, photo: base64 });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <button 
                            onClick={() => photoInputRef.current?.click()}
                            style={{ position: "absolute", bottom: -6, right: -6, width: 32, height: 32, borderRadius: 10, background: "#FFF", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", zIndex: 2 }}
                          >
                            <Camera size={14} color={CU} />
                          </button>
                          {selectedArb.photo && (
                            <button 
                              onClick={() => {
                                const next = data.arbitros.map(x => x.id === selectedArb.id ? { ...x, photo: null } : x);
                                update("arbitros", next);
                                setSelectedArb({ ...selectedArb, photo: null });
                              }}
                              style={{ position: "absolute", top: -6, right: -6, width: 28, height: 28, borderRadius: 8, background: "#FFF", border: `1px solid ${PALETTE.danger}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", zIndex: 2 }}
                            >
                              <Trash2 size={12} color={PALETTE.danger} />
                            </button>
                          )}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{selectedArb.name}</h3>
                          <p style={{ margin: "4px 0 0", fontSize: 12, color: MUTED }}>Perfil del Cuerpo Arbitral</p>
                        </div>
                      </div>
                      <button onClick={() => setShowArbModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={24} color={MUTED} /></button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                      {/* Disponibilidad */}
                      <div style={{ padding: 24, background: "#FDFDFB", borderRadius: 20, border: `1.5px solid ${BORDER}` }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Clock size={18} color={CU} />
                            <span style={{ fontSize: 14, fontWeight: 800 }}>Disponibilidad</span>
                          </div>
                          <Switch 
                            active={selectedArb.disponibilidad === "completa"} 
                            onChange={v => {
                              const status = v ? "completa" : "franjas";
                              const next = data.arbitros.map(x => x.id === selectedArb.id ? { ...x, disponibilidad: status } : x);
                              update("arbitros", next);
                              setSelectedArb({ ...selectedArb, disponibilidad: status });
                            }} 
                            label={selectedArb.disponibilidad === "completa" ? "Completa" : "Restringida"} 
                          />
                        </div>

                        {selectedArb.disponibilidad === "franjas" && (
                          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                            <p style={{ fontSize: 11, color: HINT, margin: "0 0 4px" }}>ESPECIFICA LAS FRANJAS HORARIAS DE DISPONIBILIDAD</p>
                            {(selectedArb.franjas || [{ dia: "Sábado", inicio: "08:00", fin: "12:00" }]).map((f, fi) => (
                              <div key={fi} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <select 
                                  value={f.dia} 
                                  onChange={e => {
                                    const franjas = [...(selectedArb.franjas || [])];
                                    franjas[fi].dia = e.target.value;
                                    const next = data.arbitros.map(x => x.id === selectedArb.id ? { ...x, franjas } : x);
                                    update("arbitros", next);
                                    setSelectedArb({ ...selectedArb, franjas });
                                  }}
                                  style={{ ...inputStyle, flex: 1, height: 38 }}
                                >
                                  {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(d => <option key={d}>{d}</option>)}
                                </select>
                                <input 
                                  type="time" 
                                  value={f.inicio} 
                                  onChange={e => {
                                    const franjas = [...(selectedArb.franjas || [])];
                                    franjas[fi].inicio = e.target.value;
                                    const next = data.arbitros.map(x => x.id === selectedArb.id ? { ...x, franjas } : x);
                                    update("arbitros", next);
                                    setSelectedArb({ ...selectedArb, franjas });
                                  }}
                                  style={{ ...inputStyle, width: 90, height: 38 }}
                                />
                                <span style={{ color: HINT }}>—</span>
                                <input 
                                  type="time" 
                                  value={f.fin} 
                                  onChange={e => {
                                    const franjas = [...(selectedArb.franjas || [])];
                                    franjas[fi].fin = e.target.value;
                                    const next = data.arbitros.map(x => x.id === selectedArb.id ? { ...x, franjas } : x);
                                    update("arbitros", next);
                                    setSelectedArb({ ...selectedArb, franjas });
                                  }}
                                  style={{ ...inputStyle, width: 90, height: 38 }}
                                />
                                <button 
                                  onClick={() => {
                                    const franjas = (selectedArb.franjas || []).filter((_, idx) => idx !== fi);
                                    const next = data.arbitros.map(x => x.id === selectedArb.id ? { ...x, franjas } : x);
                                    update("arbitros", next);
                                    setSelectedArb({ ...selectedArb, franjas });
                                  }}
                                  style={{ background: "none", border: "none", cursor: "pointer", color: PALETTE.danger }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                            <button 
                              onClick={() => {
                                const franjas = [...(selectedArb.franjas || []), { dia: "Sábado", inicio: "08:00", fin: "12:00" }];
                                const next = data.arbitros.map(x => x.id === selectedArb.id ? { ...x, franjas } : x);
                                update("arbitros", next);
                                setSelectedArb({ ...selectedArb, franjas });
                              }}
                              style={{ padding: "8px 12px", borderRadius: 8, border: `1px dashed ${CU_BOR}`, background: "none", color: CU, fontSize: 11, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start", marginTop: 4 }}
                            >
                              + Agregar franja
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Bio / Notas */}
                      <div style={{ padding: 24, background: "#FDFDFB", borderRadius: 20, border: `1.5px solid ${BORDER}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                          <FileText size={18} color={CU} />
                          <span style={{ fontSize: 14, fontWeight: 800 }}>Información Adicional</span>
                        </div>
                        <textarea 
                          placeholder="Escribe notas relevantes, experiencia o certificaciones del árbitro..."
                          value={selectedArb.bio || ""}
                          onChange={e => {
                            const bio = e.target.value;
                            const next = data.arbitros.map(x => x.id === selectedArb.id ? { ...x, bio } : x);
                            update("arbitros", next);
                            setSelectedArb({ ...selectedArb, bio });
                          }}
                          style={{ ...inputStyle, width: "100%", height: 100, resize: "none", paddingTop: 12, paddingBottom: 12 }}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: 32 }}>
                      <button onClick={() => setShowArbModal(false)} style={{ width: "100%", height: 52, borderRadius: 16, background: CU, color: "#FFF", border: "none", fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(181, 143, 76, 0.3)" }}>
                        Guardar Perfil
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="stepGroups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <SummaryBar data={data} totalLoaded={totalLoaded} />
            <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 32, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                <div>
                  <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800 }}>Distribución de Grupos</h2>
                  <p style={{ margin: 0, fontSize: 14, color: MUTED }}>Visualiza cómo quedarán asignados los equipos en cada categoría.</p>
                </div>
                <button 
                  onClick={handleReshuffle}
                  style={{ background: "#FFF8EE", border: "1px solid #F5DEB3", color: "#D89A2B", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#FDF0D5"; e.currentTarget.style.transform = "rotate(-2deg) scale(1.05)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#FFF8EE"; e.currentTarget.style.transform = "rotate(0deg) scale(1)"; }}
                >
                  <Zap size={16} /> Re-sortear equipos
                </button>
              </div>

              {data.categorias.map(cat => {
                const s = structures[cat.id] || {};
                const tList = teams[cat.id] || [];
                if (s.format !== "grupos_playoffs") return null;

                const gCount = s.groupsCount || 1;
                const groups = Array.from({ length: gCount }, (_, i) => ({
                  name: `Grupo ${String.fromCharCode(65 + i)}`,
                  teams: tList.filter((_, idx) => idx % gCount === i)
                }));

                const isCollapsed = collapsedCats[cat.id];

                return (
                  <div key={cat.id} style={{ marginBottom: 20 }}>
                    {/* Category Header (Accordion) */}
                    <div 
                      onClick={() => setCollapsedCats(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                      style={{ 
                        padding: "16px 24px", 
                        background: isCollapsed ? "#FDFDFB" : "#FFF", 
                        borderRadius: 16, 
                        border: `1.5px solid ${isCollapsed ? BORDER : CU_DIM}`, 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: isCollapsed ? "none" : "0 4px 12px rgba(0,0,0,0.03)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: isCollapsed ? "#F1F1F1" : CU_DIM, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                          <Users size={20} color={isCollapsed ? HINT : CU} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 16, color: TEXT }}>{cat.nombre}</div>
                          <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                            {gCount} grupos · {tList.length} equipos · {Math.ceil(tList.length / gCount)} promedio por grupo
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {!isCollapsed && <span style={{ fontSize: 11, fontWeight: 700, color: CU, background: CU_DIM, padding: "4px 8px", borderRadius: 6 }}>EDITABLE</span>}
                        <div style={{ transform: isCollapsed ? "rotate(0deg)" : "rotate(90deg)", transition: "transform 0.3s", display: "flex", alignItems: "center" }}>
                          <ChevronRight size={20} color={HINT} />
                        </div>
                      </div>
                    </div>

                    {!isCollapsed && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        style={{ paddingTop: 24, paddingLeft: 8, paddingRight: 8 }}
                      >
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
                          {groups.map((g, gi) => (
                            <div key={gi} style={{ background: "#FFF", borderRadius: 20, border: `1px solid ${BORDER}`, boxShadow: "0 2px 8px rgba(0,0,0,0.02)", overflow: "hidden", transition: "transform 0.2s" }}>
                              <div style={{ padding: "14px 20px", background: "#FDFDFB", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: 800, fontSize: 14, color: TEXT }}>{g.name}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: HINT }}>{g.teams.length} equipos</span>
                              </div>
                              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                                {g.teams.map((t, ti) => (
                                  <div key={ti} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: "#F8F9FA", border: "1px solid #F1F3F5", transition: "all 0.2s" }}>
                                    <span style={{ color: HINT, fontWeight: 800, fontSize: 11, width: 16 }}>{ti + 1}</span>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "#FFF", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <Shield size={14} color={CU} />
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: 13, color: TEXT }}>{t.name}</span>
                                  </div>
                                ))}
                                {g.teams.length === 0 && <div style={{ padding: 20, textAlign: "center", color: HINT, fontSize: 12, fontStyle: "italic" }}>Sin equipos asignados</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 32, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                <div>
                  <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800 }}>Fixture del Torneo</h2>
                  <p style={{ margin: 0, fontSize: 14, color: MUTED }}>Previsualización de los enfrentamientos por categoría y jornada.</p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button 
                    onClick={handleDownloadFixture}
                    style={{ background: "#FFF", border: `1.5px solid ${BORDER}`, padding: "10px 22px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", color: TEXT, transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = BG; e.currentTarget.style.borderColor = CU_BOR; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#FFF"; e.currentTarget.style.borderColor = BORDER; }}
                  >
                    Descargar borrador
                  </button>
                  <button 
                    onClick={() => {
                      alert("¡Fixture definitivo generado! El sistema ha bloqueado las jornadas para este borrador.");
                      handleNext();
                    }}
                    style={{ background: CU, color: "#FFF", border: "none", padding: "10px 24px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(181, 143, 76, 0.2)", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 15px rgba(181, 143, 76, 0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(181, 143, 76, 0.2)"; }}
                  >
                    Generar fixture definitivo
                  </button>
                </div>
              </div>

              <motion.div 
                variants={ANIM_VARIANTS.container}
                initial="hidden"
                animate="visible"
              >
                {data.categorias.map((cat) => {
                  const s = structures[cat.id] || {};
                  const tList = teams[cat.id] || [];
                  const isCollapsed = collapsedCats[cat.id];
                  
                  // Simple fixture generator for preview
                  const generatePreviewMatches = () => {
                    if (tList.length < 2) return [];
                    const matches = [];
                    const shuffled = [...tList];
                    for (let i = 0; i < Math.min(shuffled.length - 1, 6); i += 2) {
                      matches.push({ home: shuffled[i], away: shuffled[i+1] });
                    }
                    return matches;
                  };
  
                  const previewMatches = generatePreviewMatches();

                return (
                  <motion.div key={cat.id} variants={ANIM_VARIANTS.item} style={{ marginBottom: 20 }}>
                    {/* Category Header */}
                    <div 
                      onClick={() => setCollapsedCats(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                      style={{ 
                        padding: "16px 24px", 
                        background: isCollapsed ? "#FDFDFB" : "#FFF", 
                        borderRadius: 16, 
                        border: `1.5px solid ${isCollapsed ? BORDER : CU_DIM}`, 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: CU }} />
                        <span style={{ fontWeight: 800, fontSize: 16 }}>{cat.nombre}</span>
                      </div>
                      <ChevronRight size={20} color={HINT} style={{ transform: isCollapsed ? "rotate(0deg)" : "rotate(90deg)", transition: "transform 0.3s" }} />
                    </div>

                    {!isCollapsed && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: 24, paddingBottom: 10 }}>
                        {/* Info Message */}
                        <div style={{ padding: "12px 20px", background: "#EEF6FF", border: "1px solid #C7DFF7", borderRadius: 12, display: "flex", gap: 12, marginBottom: 24 }}>
                          <Info size={18} color="#2E87E8" />
                          <p style={{ margin: 0, fontSize: 13, color: "#1A5FA8", lineHeight: 1.5 }}>
                            Este es un <strong>fixture tentativo</strong> generado automáticamente. Una vez creado el torneo, podrás asignar fechas, horas y canchas específicas en la sección de <strong>Gestión de Partidos</strong>.
                          </p>
                        </div>

                        {/* Fixture Preview */}
                        <div style={{ marginBottom: 32 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: TEXT, marginBottom: 16 }}>Enfrentamientos previstos (Fase de Grupos)</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {previewMatches.length > 0 ? (
                              [1, 2].map(j => (
                                <div key={j} style={{ background: "#FDFDFB", borderRadius: 16, padding: "16px 24px", border: `1px solid ${BORDER}` }}>
                                  <div style={{ fontSize: 11, fontWeight: 800, color: MUTED, marginBottom: 12, letterSpacing: "0.05em" }}>JORNADA {j}</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                                    {previewMatches.map((m, mi) => (
                                      <div key={mi} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FFF", padding: "12px 16px", borderRadius: 12, border: `1px solid ${BORDER}`, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                                        <div style={{ flex: 1, textAlign: "right", fontWeight: 700, fontSize: 13 }}>{m.home.name}</div>
                                        <div style={{ padding: "0 16px", fontWeight: 900, color: CU, fontSize: 12 }}>VS</div>
                                        <div style={{ flex: 1, fontWeight: 700, fontSize: 13 }}>{m.away.name}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div style={{ padding: 40, textAlign: "center", color: HINT }}>Agrega equipos para ver el fixture tentativo</div>
                            )}
                            <div style={{ textAlign: "center", padding: 12, color: HINT, fontSize: 12, fontStyle: "italic" }}>... y más partidos estimados según la estructura elegida</div>
                          </div>
                        </div>

                        {/* Playoff Scheme */}
                        {s.format === "grupos_playoffs" && (
                          <div style={{ background: "#F8F9FA", borderRadius: 20, padding: 24, border: `1px solid ${BORDER}` }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: TEXT, marginBottom: 20 }}>Esquema de Fase Final (Playoffs)</div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                              {[
                                { label: "Clasificación", desc: `${s.groupsCount || 2} grupos` },
                                { label: s.faseFinal === "cuartos" ? "Cuartos" : s.faseFinal === "semis" ? "Semis" : "Final", desc: "Eliminación directa" },
                                { label: "Gran Final", desc: "Campeón" }
                              ].map((step, si, arr) => (
                                <React.Fragment key={si}>
                                  <div style={{ textAlign: "center", zIndex: 1 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: si === arr.length - 1 ? CU : "#FFF", border: `2px solid ${CU}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", color: si === arr.length - 1 ? "#FFF" : CU }}>
                                      {si === arr.length - 1 ? <Trophy size={20} /> : <div style={{ fontWeight: 800 }}>{si + 1}</div>}
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 800 }}>{step.label}</div>
                                    <div style={{ fontSize: 11, color: MUTED }}>{step.desc}</div>
                                  </div>
                                  {si < arr.length - 1 && (
                                    <div style={{ flex: 1, height: 2, background: CU_DIM, margin: "0 10px", marginTop: -25 }} />
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
              </motion.div>
            </div>
          </motion.div>
        )}
        {step === 6 && (() => {
          const startDate = data.fechaInicio ? new Date(data.fechaInicio) : new Date();
          
          // Calculate max rounds and matches per round
          let maxRounds = 1;
          const matchesPerCat = {};
          
          data.categorias.forEach(cat => {
            const tCount = teams[cat.id]?.length || 0;
            const s = structures[cat.id] || {};
            let rounds = 1;
            let mPerRound = 0;

            if (s.format === 'todos_contra_todos') {
              rounds = tCount % 2 === 0 ? tCount - 1 : tCount;
              mPerRound = Math.floor(tCount / 2);
            } else {
              const teamsInGroup = Math.ceil(tCount / (s.groupsCount || 1));
              const groupRounds = teamsInGroup % 2 === 0 ? teamsInGroup - 1 : teamsInGroup;
              const playoffRounds = s.faseFinal === 'cuartos' ? 3 : s.faseFinal === 'semis' ? 2 : 1;
              rounds = groupRounds + playoffRounds;
              mPerRound = Math.floor(tCount / 2);
            }
            
            if (rounds > maxRounds) maxRounds = rounds;
            matchesPerCat[cat.id] = { rounds, mPerRound };
          });


          return (
            <motion.div key="step6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <SummaryBar data={data} totalLoaded={totalLoaded} />
              <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 32, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                  <div>
                    <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800 }}>Calendario Estimado</h2>
                    <p style={{ margin: 0, fontSize: 14, color: MUTED }}>Distribución tentativa de jornadas basada en tu configuración de horarios.</p>
                  </div>
                  <button 
                    onClick={handleDownloadCalendar}
                    style={{ background: "#FFF", border: `1.5px solid ${BORDER}`, padding: "10px 22px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", color: TEXT, display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = BG; e.currentTarget.style.borderColor = CU_BOR; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#FFF"; e.currentTarget.style.borderColor = BORDER; }}
                  >
                    <Download size={16} /> Descargar calendario PDF
                  </button>
                </div>

                <motion.div 
                  variants={ANIM_VARIANTS.container}
                  initial="hidden"
                  animate="visible"
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}
                >
                  {Array.from({ length: Math.min(maxRounds, 20) }).map((_, i) => {
                    const j = i + 1;
                    const date = new Date(startDate);
                    date.setDate(startDate.getDate() + (i * 7)); // Suponiendo jornadas semanales
                    
                    const matchesThisRound = data.categorias.reduce((acc, cat) => {
                      const info = matchesPerCat[cat.id];
                      return acc + (j <= info.rounds ? info.mPerRound : 0);
                    }, 0);

                    const isSelected = selectedJornada === j;

                    return (
                      <motion.div 
                        key={j} 
                        variants={ANIM_VARIANTS.item}
                        whileHover={ANIM_VARIANTS.card.hover}
                        whileTap={ANIM_VARIANTS.card.tap}
                        onClick={() => setSelectedJornada(isSelected ? null : j)}
                        style={{ 
                          background: isSelected ? "#FFF" : BG, 
                          borderRadius: 20, 
                          padding: "20px 24px", 
                          border: `1.5px solid ${isSelected ? CU : BORDER}`, 
                          cursor: "pointer", 
                          transition: "all 0.2s",
                          boxShadow: isSelected ? "0 8px 24px rgba(181, 143, 76, 0.15)" : "none"
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 800, color: isSelected ? CU : MUTED, marginBottom: 8, letterSpacing: "0.05em" }}>JORNADA {j}</div>
                        {(() => {
                          const endD = new Date(date);
                          endD.setDate(date.getDate() + 6);
                          return (
                            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                              <span>{date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                              <span style={{ opacity: 0.3 }}>—</span>
                              <span>{endD.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                            </div>
                          );
                        })()}
                        <div style={{ fontSize: 13, color: HINT }}>{matchesThisRound} partidos</div>
                        <div style={{ height: 3, width: 40, background: isSelected ? CU : BORDER, marginTop: 12, borderRadius: 2 }} />
                      </motion.div>
                    );
                  })}
                </motion.div>

                <AnimatePresence>
                  {selectedJornada && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                      <div style={{ background: "#FDFDFB", border: `1.5px solid ${BORDER}`, borderRadius: 20, padding: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Partidos de la Jornada {selectedJornada}</h3>
                          <div style={{ fontSize: 12, color: MUTED }}>Vista preliminar por categoría</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {data.categorias.map((cat) => {
                            const info = matchesPerCat[cat.id];
                            if (selectedJornada > info.rounds) return null;
                            const tList = teams[cat.id] || [];
                            const isCollapsed = collapsedCats[cat.id];
                            
                            return (
                              <div key={cat.id} style={{ border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden", background: "#FFF" }}>
                                <div 
                                  onClick={() => setCollapsedCats(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                                  style={{ padding: "12px 16px", background: isCollapsed ? "#FFF" : "#FDFDFB", borderBottom: isCollapsed ? "none" : `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: CU }} />
                                    <span style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>{cat.nombre}</span>
                                    <span style={{ fontSize: 11, color: HINT }}>({info.mPerRound} partidos)</span>
                                  </div>
                                  <ChevronRight size={16} color={HINT} style={{ transform: isCollapsed ? "rotate(0deg)" : "rotate(90deg)", transition: "transform 0.3s" }} />
                                </div>

                                {!isCollapsed && (
                                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 16, background: "#FFF" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                                      {Array.from({ length: info.mPerRound }).map((_, mi) => {
                                        const hIdx = (mi * 2) % tList.length;
                                        const aIdx = (mi * 2 + 1) % tList.length;
                                          const currentActiveHorarios = (data.horarios || []).filter(h => h.activo === true);
                                          const numCanchas = data.numCanchas || 1;
                                          const duracion = data.duracionPartido || 60;
                                          const margen = data.margenEntrePartidos || 0;
                                          const slotTotal = duracion + margen;
                                          
                                          // Calculate slot info
                                          let remaining = mi;
                                          let dayInfo = { dia: "---", inicio: "--:--", cancha: 1 };
                                            
                                            for (const h of currentActiveHorarios) {
                                              const [h1, m1] = h.inicio.split(":").map(Number);
                                              const [h2, m2] = h.fin.split(":").map(Number);
                                              const totalMins = (h2 * 60 + m2) - (h1 * 60 + m1);
                                              const slotsPerDay = Math.max(1, Math.floor(totalMins / slotTotal));
                                              const capacityPerDay = slotsPerDay * numCanchas;
  
                                              if (remaining < capacityPerDay) {
                                                const timeSlotIdx = Math.floor(remaining / numCanchas);
                                                const fieldIdx = (remaining % numCanchas) + 1;
                                                const startMins = h1 * 60 + m1 + (timeSlotIdx * slotTotal);
                                                const hh = Math.floor(startMins / 60);
                                                const mm = startMins % 60;
                                                dayInfo = { dia: h.dia, inicio: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`, cancha: fieldIdx };
                                                break;
                                              }
                                              remaining -= capacityPerDay;
                                            }
                                          
                                          // Fallback
                                          if (dayInfo.dia === "---" && currentActiveHorarios.length > 0) {
                                            dayInfo = { dia: currentActiveHorarios[0].dia, inicio: currentActiveHorarios[0].inicio, cancha: (mi % numCanchas) + 1 };
                                          }

                                                const arb = data.arbitros.length > 0 ? data.arbitros[mi % data.arbitros.length].name : "Pendiente";

                                                return (
                                                  <div key={mi} style={{ background: "#FDFDFB", padding: "12px 16px", borderRadius: 14, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 20, boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
                                                    <div style={{ width: 100, borderRight: `1px solid ${BORDER}`, paddingRight: 10 }}>
                                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                                                        <div style={{ fontSize: 9, fontWeight: 900, color: CU }}>{dayInfo.dia.slice(0,3).toUpperCase()}</div>
                                                        <div style={{ fontSize: 9, fontWeight: 700, color: MUTED }}>C{dayInfo.cancha}</div>
                                                      </div>
                                                      <div style={{ fontSize: 13, fontWeight: 800 }}>{dayInfo.inicio}</div>
                                                    </div>
                                                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                      <div style={{ flex: 1, textAlign: "right", fontSize: 12, fontWeight: 700, color: TEXT }}>{tList[hIdx]?.name || "Equipo A"}</div>
                                                      <div style={{ padding: "0 15px", fontSize: 10, fontWeight: 900, color: CU, opacity: 0.5 }}>VS</div>
                                                      <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: TEXT }}>{tList[aIdx]?.name || "Equipo B"}</div>
                                                    </div>
                                                    <div style={{ width: 120, borderLeft: `1px solid ${BORDER}`, paddingLeft: 10, display: "flex", flexDirection: "column", gap: 2 }}>
                                                      <div style={{ fontSize: 9, fontWeight: 700, color: HINT }}>ÁRBITRO</div>
                                                      <div style={{ fontSize: 11, fontWeight: 800, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{arb}</div>
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ padding: "16px 24px", background: "#FFF8EE", borderRadius: 16, border: `1px solid #F5DEB3`, display: "flex", gap: 16, marginTop: 32 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FDF0D5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Info size={20} color="#D89A2B" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#926B24", marginBottom: 4 }}>Nota sobre el calendario</div>
                    <p style={{ margin: 0, fontSize: 13, color: "#D89A2B", lineHeight: 1.5 }}>
                      Este calendario es una proyección automática basada en la fecha de inicio ({data.fechaInicio || 'No definida'}) y la cantidad de partidos estimados ({totalMatches}). Podrás ajustar fechas y horas exactas una vez creado el torneo.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {step === 7 && (
          <motion.div key="step7" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 32, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#FCF8F1", display: "flex", alignItems: "center", justifyContent: "center" }}><Trophy size={40} color={CU} /></div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{data.nombre}</h2>
                  <div style={{ display: "flex", gap: 12, marginTop: 4, color: MUTED, fontSize: 14 }}><span>{data.deporte}</span><span>·</span><span>{data.temporada}</span></div>
                </div>
              </div>
              <button onClick={() => setStep(1)} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: MUTED, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}><Edit3 size={14} /> Editar información</button>
            </div>

            <motion.div 
              variants={ANIM_VARIANTS.container}
              initial="hidden"
              animate="visible"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 12, marginBottom: 32 }}
            >
               <motion.div variants={ANIM_VARIANTS.item}><InfoBox icon={Calendar} label="Inicio" value={data.fechaInicio} /></motion.div>
               <motion.div variants={ANIM_VARIANTS.item}><InfoBox icon={Calendar} label="Finalización" value={data.fechaFin} /></motion.div>
               <motion.div variants={ANIM_VARIANTS.item}><InfoBox icon={MapPin} label="Sede principal" value={data.sedePrincipal} /></motion.div>
               <motion.div variants={ANIM_VARIANTS.item}><InfoBox icon={User} label="Organizador" value={data.organizador} /></motion.div>
               <motion.div variants={ANIM_VARIANTS.item}><InfoBox icon={Bookmark} label="Estado" value={<span style={{ color: PALETTE.success }}>Listo para crear</span>} /></motion.div>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
              <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: "24px 0" }}>
                <div style={{ padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Resumen de categorías y estructura</h3>
                  <button onClick={() => setStep(2)} style={{ background: "none", border: "none", color: CU, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}><Edit3 size={14} /> Editar estructura</button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ textAlign: "left", color: HINT, borderBottom: `1px solid ${BORDER}` }}>
                        <th style={{ padding: "12px 24px" }}>Categoría</th>
                        <th style={{ padding: "12px 10px" }}>Equipos</th>
                        <th style={{ padding: "12px 10px" }}>Formato de competencia</th>
                        <th style={{ padding: "12px 10px" }}>Estructura</th>
                        <th style={{ padding: "12px 10px" }}>Clasificación</th>
                        <th style={{ padding: "12px 10px" }}>Partidos est.</th>
                        <th style={{ padding: "12px 24px" }}>Estado</th>
                      </tr>
                    </thead>
                    <motion.tbody 
                      variants={ANIM_VARIANTS.container}
                      initial="hidden"
                      animate="visible"
                    >
                      {data.categorias.map(c => {
                        const s = structures[c.id] || {};
                        const isConfig = s.status === "configured";
                        const tCount = teams[c.id]?.length || 0;
                        const math = isConfig ? calculateTournamentMath(s, tCount) : { totalMatches: 0 };
                        
                        return (
                          <motion.tr 
                            key={c.id} 
                            variants={ANIM_VARIANTS.item}
                            style={{ borderBottom: `1px solid ${BORDER}` }}
                          >
                            <td style={{ padding: "14px 24px", fontWeight: 700, color: CU, whiteSpace: "nowrap" }}>{c.nombre}</td>
                            <td style={{ padding: "14px 10px", whiteSpace: "nowrap" }}>{tCount} equipos</td>
                            <td style={{ padding: "14px 10px", whiteSpace: "nowrap" }}>{FASE_OPTIONS.find(f => f.id === s.format)?.label}</td>
                            <td style={{ padding: "14px 10px", whiteSpace: "nowrap" }}>{s.format === "grupos_playoffs" ? `${s.groupsCount || 1} grupos` : `${s.groupLegs || 1} vuelta(s)`}</td>
                            <td style={{ padding: "14px 10px", whiteSpace: "nowrap" }}>{s.format === "grupos_playoffs" ? `${s.qualifyPerGroup || 2} por grupo` : (s.faseFinal || "—")}</td>
                            <td style={{ padding: "14px 10px", fontWeight: 700 }}>{math.totalMatches}</td>
                            <td style={{ padding: "14px 24px" }}>
                              <div style={{ fontSize: 10, fontWeight: 700, background: isConfig ? "#E7F9ED" : "#FFF1E7", color: isConfig ? PALETTE.success : "#E87C2E", padding: "4px 8px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                {isConfig ? "COMPLETA" : "FALTA CONFIG"} {isConfig && <CheckCircle size={10} />}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </motion.tbody>
                  </table>
                </div>
                <div style={{ padding: "20px 24px", borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 800 }}>
                  <BarChart2 size={18} color={CU} /> Total de partidos estimados en el torneo: <span style={{ color: TEXT }}>{totalMatches}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 24 }}>
                  <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}><Users size={18} color={CU} /> Resumen de equipos</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                    <SummaryRow lab="Categorías" val={data.categorias.length} />
                    <SummaryRow lab="Equipos cargados" val={totalLoaded} />
                    <SummaryRow lab="Árbitros registrados" val={data.arbitros.length} />
                    <SummaryRow lab="Total partidos" val={totalMatches} />
                    {(() => {
                      const stats = calculateSchedulingStats(data.horarios, totalMatches, data.numCanchas, data.duracionPartido, data.margenEntrePartidos);
                      const projected = estimateProjectedEndDate(data.fechaInicio, stats.estimatedWeeks);
                      const suggestions = getFeasibilitySuggestions(data, stats);
                      const isOverdue = projected > data.fechaFin;

                      return (
                        <>
                          <SummaryRow lab="Partidos / semana" val={stats.weeklyCapacity} />
                          <SummaryRow lab="Duración estimada" val={`${stats.estimatedWeeks} semanas`} />
                          <SummaryRow lab="Final proyectado" val={<span style={{ color: isOverdue ? PALETTE.danger : CU, fontWeight: 800 }}>{projected}</span>} />
                          <div style={{ marginTop: 12, borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                              <span style={{ fontSize: 13, color: MUTED }}>Capacidad de Árbitros</span>
                              {(() => {
                                const simultaneousNeeded = stats.refereeStats?.maxSimultaneousNeeded || 0;
                                const arbCount = data.arbitros.length;
                                const isShort = arbCount < simultaneousNeeded;
                                return (
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, background: isShort ? "#FEF2F2" : "#F0FDF4", border: `1px solid ${isShort ? "#FCA5A5" : "#86EFAC"}` }}>
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: isShort ? PALETTE.danger : PALETTE.success }} />
                                    <span style={{ fontSize: 11, fontWeight: 800, color: isShort ? PALETTE.danger : PALETTE.success }}>
                                      {isShort ? "INSUFICIENTE" : "COBERTURA TOTAL"}
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                            <p style={{ margin: 0, fontSize: 11, color: HINT, lineHeight: 1.4 }}>
                              {data.arbitros.length < (stats.refereeStats?.maxSimultaneousNeeded || 0) 
                                ? `Necesitas al menos ${stats.refereeStats.maxSimultaneousNeeded} árbitros para cubrir ${data.numCanchas} canchas simultáneas.`
                                : `Cuentas con personal suficiente para los ${data.numCanchas} partidos simultáneos proyectados.`
                              }
                            </p>
                          </div>
                          
                          {suggestions.length > 0 && (
                            <div style={{ marginTop: 20, padding: 16, background: isOverdue ? "#FFF5F5" : "#FFFBF2", borderRadius: 16, border: `1.5px solid ${isOverdue ? "#FFEBEB" : "#FFF1D6"}` }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, color: isOverdue ? PALETTE.danger : "#D89A2B", fontWeight: 800, fontSize: 13, marginBottom: 12 }}>
                                <Sparkles size={16} /> {isOverdue ? "ASISTENTE INTELIGENTE" : "OPORTUNIDAD DE OPTIMIZACIÓN"}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                                {suggestions.map((s, idx) => (
                                  <div key={idx} style={{ display: "flex", gap: 10 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: isOverdue ? PALETTE.danger : "#D89A2B", marginTop: 6, flexShrink: 0 }} />
                                    <div>
                                      <div style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{s.text}</div>
                                      <div style={{ fontSize: 10, color: HINT }}>Impacto: {s.impact}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <motion.button 
                                whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
                                whileTap={{ scale: 0.98 }}
                                animate={{
                                  boxShadow: ["0px 0px 0px 0px rgba(216, 154, 43, 0.4)", "0px 0px 0px 10px rgba(216, 154, 43, 0)"],
                                }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 2,
                                }}
                                onClick={() => setShowSuggestModal(suggestions)}
                                style={{ width: "100%", background: isOverdue ? PALETTE.danger : "#D89A2B", color: "#FFF", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.2s" }}
                              >
                                <Wand2 size={16} /> Utilizar recomendaciones
                              </motion.button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <div style={{ padding: 16, background: totalLoaded >= totalExpected ? "#E7F9ED" : "#FFF1E7", borderRadius: 12, border: `1px solid ${totalLoaded >= totalExpected ? "#C4EDD2" : "#F5D4B8"}`, display: "flex", gap: 10, marginBottom: 24 }}>
                    {totalLoaded >= totalExpected ? <CheckCircle size={18} color={PALETTE.success} /> : <AlertCircle size={18} color="#E87C2E" />}
                    <p style={{ margin: 0, fontSize: 12, color: totalLoaded >= totalExpected ? "#1E5F33" : "#A65213", fontWeight: 600 }}>
                      {totalLoaded >= totalExpected ? "Todos los equipos requeridos están cargados correctamente." : `Faltan cargar ${totalExpected - totalLoaded} equipos para completar las categorías.`}
                    </p>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>Equipos por categoría</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[...data.categorias].sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { numeric: true })).map(c => {
                      const loaded = teams[c.id]?.length || 0;
                      const expected = parseInt(c.teams) || 0;
                      const isComplete = loaded >= expected && expected > 0;
                      const percent = Math.min(100, Math.floor((loaded / expected) * 100)) || 0;

                      return (
                        <div key={c.id} style={{ background: "#FDFDFB", padding: "16px", borderRadius: 16, border: `1.5px solid ${BORDER}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>{c.nombre}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, color: isComplete ? PALETTE.success : "#D89A2B" }}>
                              {isComplete ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                              {loaded} / {expected}
                            </div>
                          </div>
                          <div style={{ height: 6, background: "#EEE", borderRadius: 3, overflow: "hidden" }}>
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${percent}%` }} 
                              style={{ height: "100%", background: isComplete ? PALETTE.success : CU, borderRadius: 3 }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 24 }}>
                   <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 800 }}>Checklist de validación</h3>
                   <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <CheckItem 
                        label="Información básica" 
                        sub="Nombre, deporte, fechas, sede y organizador." 
                        status={data.nombre && data.fechaInicio && data.fechaFin ? "success" : "error"} 
                      />
                      <CheckItem 
                        label="Categorías creadas" 
                        sub={`${data.categorias.length} categorías configuradas.`} 
                        status={data.categorias.length > 0 ? "success" : "error"} 
                      />
                      <CheckItem 
                        label="Estructura definida" 
                        sub={data.categorias.every(c => structures[c.id]?.status === "configured") ? "Todos los formatos asignados." : "Faltan estructuras por configurar."} 
                        status={data.categorias.every(c => structures[c.id]?.status === "configured") ? "success" : "warning"} 
                      />
                      <CheckItem 
                        label="Equipos cargados" 
                        sub={totalLoaded >= totalExpected && totalExpected > 0 ? "Todos los equipos asignados." : `Faltan ${Math.max(0, totalExpected - totalLoaded)} equipos.`} 
                        status={totalLoaded >= totalExpected && totalExpected > 0 ? "success" : "warning"} 
                      />
                   </div>
                   
                   <div style={{ marginTop: 24, background: (data.nombre && data.categorias.every(c => structures[c.id]?.status === "configured") && totalLoaded >= totalExpected && totalExpected > 0) ? "#FDFBF7" : "#FFF1E7", borderRadius: 20, border: `1px solid ${(data.nombre && data.categorias.every(c => structures[c.id]?.status === "configured") && totalLoaded >= totalExpected && totalExpected > 0) ? "#F5E6D3" : "#F5D4B8"}`, padding: 20, display: "flex", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FFF", border: `1px solid ${(data.nombre && data.categorias.every(c => structures[c.id]?.status === "configured") && totalLoaded >= totalExpected && totalExpected > 0) ? "#F5E6D3" : "#F5D4B8"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {(data.nombre && data.categorias.every(c => structures[c.id]?.status === "configured") && totalLoaded >= totalExpected && totalExpected > 0) ? <CheckCircle size={20} color={PALETTE.success} /> : <AlertCircle size={20} color="#E87C2E" />}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{(data.nombre && data.categorias.every(c => structures[c.id]?.status === "configured") && totalLoaded >= totalExpected && totalExpected > 0) ? "Todo está listo" : "Revisión pendiente"}</div>
                      <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{(data.nombre && data.categorias.every(c => structures[c.id]?.status === "configured") && totalLoaded >= totalExpected && totalExpected > 0) ? "Puedes crear el torneo y comenzar con la generación del fixture." : "Resuelve las advertencias del checklist para evitar errores."}</div>
                    </div>
                  </div>
                </div>
              <div style={{ marginTop: 40, borderTop: `1px solid ${BORDER}`, paddingTop: 32, display: "flex", justifyContent: "flex-end", gap: 16 }}>
                <button 
                  onClick={() => setStep(6)} 
                  style={{ padding: "14px 28px", borderRadius: 14, border: `1px solid ${BORDER}`, background: "none", color: MUTED, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = BG}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  Regresar al calendario
                </button>
                <motion.button 
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(181, 143, 76, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  animate={data.nombre && data.categorias.length > 0 ? {
                    boxShadow: ["0px 0px 0px 0px rgba(181, 143, 76, 0.2)", "0px 0px 0px 10px rgba(181, 143, 76, 0)"],
                  } : {}}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                  }}
                  onClick={() => {
                    if (!data.nombre) return alert("El torneo debe tener un nombre.");
                    alert("¡Torneo creado con éxito! Redirigiendo al panel de gestión...");
                    // Logic to finalize
                  }}
                  style={{ 
                    padding: "14px 40px", 
                    borderRadius: 14, 
                    border: "none", 
                    background: (data.nombre && data.categorias.length > 0) ? CU : BORDER, 
                    color: "#FFF", 
                    fontWeight: 800, 
                    fontSize: 15,
                    cursor: (data.nombre && data.categorias.length > 0) ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    boxShadow: "0 4px 15px rgba(181, 143, 76, 0.2)"
                  }}
                >
                  <Trophy size={18} /> CREAR TORNEO AHORA
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Footer removed */}

      <style dangerouslySetInnerHTML={{ __html: `
        .modern-inp-wrap:focus-within {
          border-color: ${CU} !important;
          box-shadow: 0 0 0 3px ${CU}15;
        }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input[type="time"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(0.4);
          margin-left: -5px;
        }
      `}} />
      {/* STICKY ACTION FOOTER */}
      <div style={{ position: "sticky", bottom: 0, left: 0, right: 0, background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(12px)", borderTop: `1px solid ${BORDER}`, padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 100, marginTop: 40, margin: "0 -40px -40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {step > 1 && (
            <button 
              onClick={() => setStep(s => s - 1)} 
              style={{ background: "#FFF", border: `1.5px solid ${BORDER}`, borderRadius: 12, padding: "0 22px", height: 48, fontSize: 14, fontWeight: 700, color: MUTED, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = CU; e.currentTarget.style.color = CU; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = MUTED; }}
            >
              <ArrowLeft size={16} /> Anterior
            </button>
          )}
          <button 
            onClick={handleSaveDraft} 
            style={{ background: "#FFF", border: `1.5px solid ${BORDER}`, borderRadius: 12, padding: "0 22px", height: 48, fontSize: 14, fontWeight: 700, color: TEXT, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = BG; e.currentTarget.style.borderColor = CU_BOR; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#FFF"; e.currentTarget.style.borderColor = BORDER; }}
          >
            <Save size={16} /> Guardar borrador
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {Object.keys(step1Errors).length > 0 && step === 1 && (
            <motion.div
              initial={{ x: 0, opacity: 0 }} animate={{ x: [0, -6, 6, -4, 4, 0], opacity: 1 }} transition={{ duration: 0.4 }}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: PALETTE.danger, fontWeight: 700 }}
            >
              <AlertCircle size={16} /> Completa los campos obligatorios
            </motion.div>
          )}
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }} 
            whileTap={{ scale: 0.98 }} 
            onClick={handleNext} 
            style={{ background: CU, color: "#FFF", border: "none", borderRadius: 12, padding: "0 40px", minWidth: 220, height: 52, fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 8px 25px rgba(181, 143, 76, 0.3)", whiteSpace: "nowrap" }}
          >
            {step === 6 ? "Ver resumen final" : step === 7 ? "CREAR TORNEO AHORA" : "Guardar y continuar"} <ArrowRight size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <motion.div 
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
      style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s" }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: CU_DIM, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} color={CU} />
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 800, color: HINT, marginBottom: 2, letterSpacing: "0.05em" }}>{label.toUpperCase()}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>{value || "---"}</div>
      </div>
    </motion.div>
  );
}

function SummaryRow({ lab, val }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 14, color: MUTED }}>{lab}</span>
      <span style={{ fontSize: 16, fontWeight: 800 }}>{val}</span>
    </div>
  );
}

function CheckItem({ label, sub, status = "success" }) {
  const isSuccess = status === "success";
  const isWarning = status === "warning";
  const color = isSuccess ? PALETTE.success : isWarning ? "#D89A2B" : PALETTE.danger;
  const bg = isSuccess ? "#F0FDF4" : isWarning ? "#FFFBEB" : "#FEF2F2";
  const Icon = isSuccess ? CheckCircle : isWarning ? AlertCircle : X;
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ display: "flex", gap: 14, padding: "12px 16px", borderRadius: 12, background: bg, border: `1px solid ${color}30` }}
    >
       <div style={{ marginTop: 2 }}><Icon size={18} color={color} /></div>
       <div>
         <div style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>{label}</div>
         <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{sub}</div>
       </div>
    </motion.div>
  );
}



function SmallBadge({ icon: Icon, label, value }) {
  const isBorrador = value === "Borrador";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", background: "#FFF", borderRadius: 8, border: `1px solid ${BORDER}`, boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, background: isBorrador ? "#F1F1F1" : CU_DIM, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={12} color={isBorrador ? HINT : CU} />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 8, fontWeight: 800, color: HINT, letterSpacing: "0.05em", lineHeight: 1 }}>{label.toUpperCase()}</div>
        <div style={{ fontSize: 11, fontWeight: 800, color: TEXT, lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );
}

function FooterBadge({ icon: Icon, label, value }) {
  const isBorrador = value === "Borrador";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", background: "#FFF", borderRadius: 16, border: `1px solid ${BORDER}`, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: isBorrador ? "#F1F1F1" : CU_DIM, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} color={isBorrador ? HINT : CU} />
      </div>
      <div>
        <div style={{ fontSize: 9, fontWeight: 800, color: HINT, letterSpacing: "0.05em", marginBottom: 2 }}>{label.toUpperCase()}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>{value}</div>
      </div>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#FDFDFB", fontSize: 13, color: TEXT, fontFamily: FONT, outline: "none" };
const dateClickArea = { display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#FDFDFB", cursor: "pointer", position: "relative" };
const hiddenInput = { position: "absolute", bottom: 0, left: 0, opacity: 0, width: "100%", height: 1, pointerEvents: "none" };
