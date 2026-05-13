import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { 
  ArrowLeft, ArrowRight, CheckCircle, Plus, X, 
  Trophy, Users, Calendar, Shield, Info, Lightbulb, 
  LayoutGrid, List, Zap, Settings, Globe, MoreHorizontal, ChevronRight, Eye, Bookmark, BarChart2,
  Download, Upload, Search, Filter, HelpCircle, FileText, AlertCircle, MapPin, User, Save, Edit3
} from "lucide-react";
import { useTorneosStore } from "../../store/useTorneosStore";
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

const SPORTS  = ["Fútbol", "Básquet", "Vóleibol", "Tenis", "Pádel", "Rugby", "Otro"];
const STEP_LABELS = ["Información general", "Estructura del torneo", "Categorías y equipos", "Confirmación"];
const STEP_SUBTITLES = ["Configuración inicial", "Estructura del torneo", "Categorías y equipos", "Confirmación"];

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
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 24px", background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, flex: 1 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: "#FCF8F1", border: `1px solid ${CU_BOR}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={20} color={CU} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 2 }}>{value}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: HINT }}>{label}</div>
      </div>
    </div>
  );
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
    const g = parseInt(config.grupos) || 2;
    const tpg = parseInt(config.tpg) || Math.ceil(n / g);
    const ppg = (tpg * (tpg - 1) / 2);
    count = ppg * g * mult;
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

function StepperHeader({ step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 60, margin: "20px 0 40px" }}>
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: active ? CU : (done ? CU : "transparent"),
              border: `2px solid ${active || done ? CU : BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.3s", zIndex: 2
            }}>
              {done ? <CheckCircle size={16} color="#FFF" /> : <span style={{ fontSize: 13, fontWeight: 800, color: active ? "#FFF" : HINT }}>{n}</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? TEXT : MUTED }}>{n}. {label}</span>
              {done && <span style={{ fontSize: 10, color: PALETTE.success, fontWeight: 600 }}>Completado</span>}
              {active && <span style={{ fontSize: 10, color: CU, fontWeight: 600 }}>En proceso</span>}
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{ position: "absolute", left: "calc(100% + 20px)", top: 17, width: 40, height: 1, background: done ? CU : BORDER }} />
            )}
          </div>
        );
      })}
    </div>
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
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 2 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: MUTED, flex: 1 }}>{label}</label>
      {type === "select" ? (
        <div style={{ position: "relative", width: 180 }}>
          <select 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            style={{ ...inputStyle, paddingRight: 32, height: 40, appearance: "none", fontSize: 13, fontWeight: 500, background: "#FFF" }}
          >
            {options.map(o => (
              <option key={typeof o === "string" ? o : o.v || o.value} value={typeof o === "string" ? o : o.v || o.value}>
                {typeof o === "string" ? o : o.l || o.label}
              </option>
            ))}
          </select>
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <ChevronRight size={14} color={MUTED} style={{ transform: "rotate(90deg)" }} />
          </div>
        </div>
      ) : (
        <div className="modern-inp-wrap" style={{ display: "flex", alignItems: "center", border: `1.5px solid ${BORDER}`, borderRadius: 12, background: "#FFF", overflow: "hidden", width: 100, height: 40, transition: "all 0.2s" }}>
          <input 
            type={isNum ? "text" : type}
            inputMode={isNum ? "numeric" : undefined}
            value={(isNum && value === 0) ? "" : value}
            placeholder={isNum ? "0" : ""}
            onChange={e => {
              const v = e.target.value;
              if (isNum) {
                if (v === "" || /^\d+$/.test(v)) onChange(v === "" ? 0 : parseInt(v));
              } else {
                onChange(v);
              }
            }}
            style={{ border: "none", background: "none", padding: "0 14px", flex: 1, fontSize: 14, color: TEXT, outline: "none", height: "100%", textAlign: isNum ? "center" : "left", fontWeight: 800 }} 
          />
        </div>
      )}
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

function Switch({ active, onChange, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => onChange(!active)}>
      <div style={{ width: 36, height: 20, borderRadius: 20, background: active ? CU : BORDER, position: "relative", transition: "background 0.2s" }}><motion.div animate={{ x: active ? 18 : 2 }} style={{ width: 16, height: 16, borderRadius: "50%", background: "#FFF", position: "absolute", top: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} /></div>
      {label && <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{label}</span>}
      <Info size={12} color={HINT} />
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

// ── Main Wizard ──────────────────────────────────────────────────────────────

export default function CrearTorneoWizard({ onFinish, onBack, initialData = null }) {
  const crearTorneo = useTorneosStore(s => s.crearTorneo);
  const currentYear = new Date().getFullYear();

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
  });

  const [catId, setCatId] = useState("");
  const [pendingTeams, setPendingTeams] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);

  const [structures, setStructures] = useState({});
  const [teams, setTeams] = useState({});
  const [showCatModal, setShowCatModal] = useState(false);
  const [customCatName, setCustomCatName] = useState("");
  const [step1Errors, setStep1Errors] = useState({});
  const [tempCats, setTempCats] = useState([]);
  const fileInputRef = useRef(null);

  // Hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("crear_torneo_wizard");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStep(parsed.step || 1);
        setData(parsed.data || data);
        setStructures(parsed.structures || structures);
        setTeams(parsed.teams || teams);
      } catch (e) { console.error("Error loading saved wizard state", e); }
    }
    setIsLoaded(true);
  }, []);

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

  const activeStruct = structures[catId] || { format: data.formato || "todos_contra_todos", status: "pending" };
  const activeCat    = data.categorias.find(c => c.id === catId);
  const activeTeams  = teams[catId] || [];
  
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
    }
    if (step < 4) { setStep(s => s + 1); return; }
    
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
        grupos: s.grupos || 2,
        tpg: s.tpg || 4,
        cpg: s.cpg || 2,
        faseFinal: s.faseFinal || "final",
        desempate: s.desempate || "goal_diff",
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

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const dataBuffer = new Uint8Array(event.target.result);
        const workbook = XLSX.read(dataBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (rows.length < 2) return;

        const headerRow = rows[0].map(h => typeof h === 'string' ? h.toLowerCase().trim() : '');
        const nameIdx = headerRow.findIndex(h => h.includes("equipo") || h.includes("nombre"));
        const catIdx = headerRow.findIndex(h => h.includes("categor"));
        const delIdx = headerRow.findIndex(h => h.includes("delegado"));
        const playIdx = headerRow.findIndex(h => h.includes("jugador"));

        if (nameIdx === -1) {
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
        let hasNewCategories = false;
        
        const normalize = s => s ? s.toString().trim().toLowerCase().replace(/[\s-]/g, "") : "";

        imported.forEach(item => {
          let cat = nextData.categorias.find(c => normalize(c.nombre) === normalize(item.category));
          if (!cat) {
             cat = { id: Date.now() + Math.random().toString(), nombre: item.category, teams: 0 };
             nextData.categorias.push(cat);
             nextStructures[cat.id] = { format: "liguilla", vueltas: 1, faseFinal: "final", status: "configured" };
             hasNewCategories = true;
          }
          if (!nextTeams[cat.id]) nextTeams[cat.id] = [];
          nextTeams[cat.id].push({ ...item, id: Date.now() + Math.random(), status: "Completo" });
        });
        
        if (hasNewCategories) {
          setData(nextData);
          setStructures(nextStructures);
        }
        setTeams(nextTeams);
      } catch (err) {
        console.error("Error parsing Excel:", err);
        alert("Hubo un error leyendo el archivo Excel. Asegúrate de usar la plantilla.");
      }
      
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsArrayBuffer(file);
  };

  const assignOrphan = (orphan, catId) => {
    const nextTeams = { ...teams };
    if (!nextTeams[catId]) nextTeams[catId] = [];
    nextTeams[catId].push({ ...orphan, id: Date.now() + Math.random(), status: "Completo" });
    setTeams(nextTeams);
    setPendingTeams(p => p.filter(o => o.name !== orphan.name));
    if (pendingTeams.length === 1) setShowPendingModal(false);
  };

  const handleApplyAll = () => {
    const base = activeStruct;
    const next = {};
    data.categorias.forEach(c => { next[c.id] = { ...base, status: "configured" }; });
    setStructures(next);
  };

  const totalExpected = data.categorias.reduce((acc, c) => acc + (parseInt(c.teams) || 0), 0);
  const totalLoaded   = Object.values(teams).flat().length;
  const progress      = Math.round((totalLoaded / (totalExpected || 1)) * 100) || 0;

  const startRef = useRef(null);
  const endRef   = useRef(null);

  const totalMatches = data.categorias.reduce((acc, c) => acc + calcularPartidos(structures[c.id] || {}, c.teams), 0);

  return (
    <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 40px 40px", fontFamily: FONT, background: BG }}>
      
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

      {/* Pending Modal */}
      {showPendingModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: "#FFF", borderRadius: 24, padding: 32, width: 500, boxShadow: ELEV }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Equipos pendientes de asignación</h3>
              <button onClick={() => setShowPendingModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color={MUTED} /></button>
            </div>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>Estos equipos no coinciden con ninguna categoría configurada. Asígnalos manualmente:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 300, overflow: "auto" }}>
              {pendingTeams.map((o, idx) => (
                <div key={idx} style={{ padding: 16, border: `1px solid ${BORDER}`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{o.name}</div>
                    <div style={{ fontSize: 11, color: HINT }}>Categoría detectada: {o.category}</div>
                  </div>
                  <select onChange={(e) => assignOrphan(o, e.target.value)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 12 }}>
                    <option value="">Asignar a...</option>
                    {data.categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, paddingTop: 20 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft size={16} /> Volver
        </button>
        <div style={{ background: CU_DIM, border: `1px solid ${CU_BOR}`, borderRadius: 6, padding: "4px 12px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: CU }}>Paso {step} de 4 · {STEP_SUBTITLES[step - 1]}</span>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: TEXT, letterSpacing: "-0.03em" }}>Crear torneo</h1>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: MUTED }}>
          {step === 4 ? "Revisa toda la configuración antes de crear el torneo. Podrás editar algunos datos después desde la configuración del torneo." : step === 3 ? "Agrega los equipos participantes y asígnalos a cada categoría." : "Configura tu torneo paso a paso."}
        </p>
      </div>

      <StepperHeader step={step} />

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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                <Field label="Sede principal" required error={step1Errors.sedePrincipal}><input style={{ ...inputStyle, borderColor: step1Errors.sedePrincipal ? PALETTE.danger : BORDER }} value={data.sedePrincipal} onChange={e => update("sedePrincipal", e.target.value)} placeholder="Complejo Deportivo" /></Field>
                <Field label="Descripción">
                  <div style={{ position: "relative" }}>
                    <textarea style={{ ...inputStyle, height: 42, resize: "none", paddingTop: 10 }} value={data.descripcion} onChange={e => update("descripcion", e.target.value.slice(0, 200))} placeholder="Descripción del torneo..." />
                    <span style={{ position: "absolute", bottom: 4, right: 10, fontSize: 10, color: HINT }}>{data.descripcion.length}/200</span>
                  </div>
                </Field>
              </div>

              {/* Section 2 */}
              <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 24, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#FFF8EE", border: "1px solid #F5DEB3", display: "flex", alignItems: "center", justifyContent: "center" }}><Trophy size={16} color="#D89A2B" /></div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>2. Tipo de competencia</h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {FASE_OPTIONS.map(opt => {
                    const sel = data.formato === opt.id;
                    return (
                      <div key={opt.id} onClick={() => update("formato", opt.id)} style={{ padding: "14px 12px", borderRadius: 12, border: `1.5px solid ${sel ? CU : BORDER}`, background: sel ? CU_DIM : "#FFF", cursor: "pointer", transition: "all 0.2s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: sel ? CU_BOR : BG, display: "flex", alignItems: "center", justifyContent: "center" }}><opt.icon size={14} color={sel ? CU : MUTED} /></div>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: TEXT, marginBottom: 3 }}>{opt.label}</div>
                        <div style={{ fontSize: 10, color: MUTED, lineHeight: 1.4 }}>{opt.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3 — Categorías */}
              <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#EEF6FF", border: "1px solid #C7DFF7", display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={16} color="#2E87E8" /></div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>3. Categorías del torneo</h3>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                  {data.categorias.map(cat => (
                    <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, background: BG }}>
                      <Users size={14} color={HINT} />
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
                {data.multiplesCategorias && data.categorias.length > 0 && (
                  <div style={{ padding: "10px 14px", borderRadius: 10, background: "#EEF6FF", border: "1px solid #C7DFF7", display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <Info size={14} color="#2E87E8" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#1A5FA8" }}>Este torneo incluirá <strong>múltiples categorías</strong>. Podrás gestionar equipos y jugadores por categoría en el siguiente paso.</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: 32, paddingTop: 8 }}>
                  <Switch active={data.multiplesCategorias} onChange={v => update("multiplesCategorias", v)} label="Este torneo tendrá múltiples categorías" />
                  <Switch active={data.autoBorrador} onChange={v => update("autoBorrador", v)} label="Guardar como borrador automático" />
                </div>
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
              <div style={{ background: "#FCF8F1", borderRadius: 16, border: `1px solid ${CU_BOR}`, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: CU_DIM, display: "flex", alignItems: "center", justifyContent: "center" }}><Lightbulb size={14} color={CU} /></div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: CU }}>Consejo ALTTEZ</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: MUTED, lineHeight: 1.6 }}>Completa toda la información para una mejor experiencia de gestión del torneo.</p>
              </div>
            </aside>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <StatBadge icon={Trophy} label="Nombre del torneo" value={data.nombre} />
              <StatBadge icon={Globe} label="Deporte / Temporada" value={`${data.deporte} · ${data.temporada}`} />
              <StatBadge icon={Users} label="Categorías" value={`Categorías: ${data.categorias.map(c => c.nombre).join(", ")}`} />
              <StatBadge icon={Calendar} label="Periodo" value={<div style={{ display: "flex", flexDirection: "column" }}><span>Inicio: {data.fechaInicio}</span><span>Fin: {data.fechaFin}</span></div>} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
              <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, boxShadow: ELEV, padding: "24px 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Configuración por categoría</h3>
                  <button onClick={handleApplyAll} style={{ background: "none", border: `1.5px solid ${CU_BOR}`, borderRadius: 10, padding: "8px 16px", color: CU, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Aplicar mismo formato a todas</button>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: HINT, borderBottom: `1px solid ${BORDER}` }}><th style={{ padding: "12px 24px", width: 40 }}></th><th style={{ padding: "12px 10px" }}>Categoría</th><th style={{ padding: "12px 10px" }}>Equipos</th><th style={{ padding: "12px 10px" }}>Formato</th><th style={{ padding: "12px 10px" }}>Estructura</th><th style={{ padding: "12px 10px" }}>Clasificación</th><th style={{ padding: "12px 10px" }}>Estado</th><th style={{ padding: "12px 24px", textAlign: "right" }}>Acciones</th></tr>
                  </thead>
                  <tbody>
                    {data.categorias.map(c => {
                      const s = structures[c.id] || { status: "pending", format: data.formato };
                      const active = catId === c.id;
                      return (
                        <tr key={c.id} onClick={() => setCatId(c.id)} style={{ cursor: "pointer", background: active ? "#FDFDFB" : "transparent", borderBottom: `1px solid ${active ? CU_BOR : "transparent"}`, borderLeft: active ? `4px solid ${CU}` : "4px solid transparent" }}>
                          <td style={{ padding: "14px 24px" }}><div style={{ width: 16, height: 16, borderRadius: "50%", border: `1.5px solid ${active ? CU : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: CU }} />}</div></td>
                          <td style={{ padding: "14px 10px", fontWeight: 700 }}>{c.nombre}</td>
                          <td style={{ padding: "14px 10px", color: MUTED }}>{c.teams || 0} equipos</td>
                          <td style={{ padding: "14px 10px", fontWeight: 500 }}>{FASE_OPTIONS.find(f => f.id === s.format)?.label}</td>
                          <td style={{ padding: "14px 10px", color: MUTED }}>{s.format === "grupos_playoffs" ? `${s.grupos || 0} grupos` : `${s.vueltas || 0} vueltas`}</td>
                          <td style={{ padding: "14px 10px", color: MUTED }}>{s.format === "grupos_playoffs" ? `${s.cpg || 0} por grupo` : (s.faseFinal || "—")}</td>
                          <td style={{ padding: "14px 10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: s.status === "configured" ? PALETTE.success : s.status === "configuring" ? "#D89A2B" : HINT }}>
                              {s.status === "configured" ? <CheckCircle size={12} color={PALETTE.success} /> : <div style={{ width: 8, height: 8, borderRadius: "50%", border: `2px solid ${s.status === "configuring" ? "#D89A2B" : BORDER}` }} />}
                              {s.status === "configured" ? "CONFIGURADO" : s.status === "configuring" ? "CONFIGURANDO" : "PENDIENTE"}
                            </div>
                          </td>
                          <td style={{ padding: "14px 24px", textAlign: "right" }}>{active ? <ChevronRight size={16} color={CU} /> : <MoreHorizontal size={16} color={HINT} />}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <aside><div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, boxShadow: ELEV, padding: 24 }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}><div><h4 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Configurar categoría</h4><div style={{ fontSize: 14, color: CU, fontWeight: 700 }}>{activeCat?.nombre}</div></div><div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FCF8F1", display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={18} color={CU} /></div></div><div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                
                <RowInp label="Número de equipos" type="number" value={activeCat?.teams || 0} onChange={v => {
                  const nextCats = data.categorias.map(c => c.id === catId ? { ...c, teams: parseInt(v) || 0 } : c);
                  setData(p => ({ ...p, categorias: nextCats }));
                }} />

                <RowInp label="Formato" type="select" value={activeStruct.format} onChange={v => updateStruct(catId, { format: v, status: "configured" })} options={FASE_OPTIONS.map(o => ({ value: o.id, label: o.label }))} />
                <RowInp label="Fases" type="select" value={activeStruct.fases || "ida"} onChange={v => updateStruct(catId, { fases: v })} options={[{v: "ida", l: "Ida"}, {v: "ida_vuelta", l: "Ida y vuelta"}]} />
                
                {activeStruct.format === "todos_contra_todos" && (
                  <>
                    <RowInp label="Número de vueltas" type="select" value={activeStruct.vueltas || "1"} onChange={v => updateStruct(catId, { vueltas: v })} options={["1", "2", "3"]} />
                    <RowInp label="Fase final" type="select" value={activeStruct.faseFinal || "final"} onChange={v => updateStruct(catId, { faseFinal: v })} options={[{v: "sin", l: "Sin fase final"}, {v: "final", l: "Final directa"}, {v: "semis", l: "Semifinal + final"}]} />
                  </>
                )}
                {activeStruct.format === "grupos_playoffs" && (
                  <>
                    <RowInp label="Número de grupos" type="number" value={activeStruct.grupos || 2} onChange={v => updateStruct(catId, { grupos: v })} />
                    <RowInp label="Equipos por grupo" type="number" value={activeStruct.tpg || 4} onChange={v => updateStruct(catId, { tpg: v })} />
                    <RowInp label="Clasifican por grupo" type="number" value={activeStruct.cpg || 2} onChange={v => updateStruct(catId, { cpg: v })} />
                    <RowInp label="Fase final" type="select" value={activeStruct.faseFinal || "semis"} onChange={v => updateStruct(catId, { faseFinal: v })} options={[{v: "semis", l: "Semifinal + final"}, {v: "final", l: "Final"}]} />
                  </>
                )}
                <RowInp label="Desempate" type="select" value={activeStruct.desempate || "goal_diff"} onChange={v => updateStruct(catId, { desempate: v })} options={[{v: "goal_diff", l: "Diferencia de gol"}]} />
              </div><div style={{ marginTop: 24, padding: 20, background: "#FDFBF7", borderRadius: 16, border: `1px solid #F5E6D3` }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}><span style={{ fontSize: 13, fontWeight: 800 }}>Vista previa</span><Eye size={16} color={CU} /></div><ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {activeStruct.format === "todos_contra_todos" ? (
                  <>
                    <PreviewItem text="Liga de todos contra todos" />
                    <PreviewItem text={`Se jugará a ${activeStruct.vueltas || 1} vuelta(s)`} />
                    <PreviewItem text={`Se generará ${activeStruct.faseFinal === "sin" ? "solo la liga" : activeStruct.faseFinal === "semis" ? "semifinal y final" : "final directa"}`} />
                  </>
                ) : activeStruct.format === "grupos_playoffs" ? (
                  <>
                    <PreviewItem text={`Se crearán ${activeStruct.grupos || 2} grupos de ${activeStruct.tpg || 4} equipos`} />
                    <PreviewItem text={`Cada grupo jugará ${activeStruct.fases === "ida_vuelta" ? "ida y vuelta" : "a una vuelta"}`} />
                    <PreviewItem text={`Clasificarán ${activeStruct.cpg || 2} equipos por grupo`} />
                    <PreviewItem text={`Se generará ${activeStruct.faseFinal === "semis" ? "semifinal y final" : "final directa"}`} />
                  </>
                ) : (
                  <>
                    <PreviewItem text={FASE_OPTIONS.find(f => f.id === activeStruct.format)?.label || "Formato de torneo"} />
                    <PreviewItem text={`Se jugará a ${activeStruct.fases === "ida_vuelta" ? "ida y vuelta" : "partido único"}`} />
                  </>
                )}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #F5E6D3", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800 }}><BarChart2 size={18} color={CU} /> Partidos estimados: {calcularPartidos(activeStruct, activeCat?.teams)}</div></ul></div></div></aside>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, boxShadow: ELEV, padding: 24, marginBottom: 32, display: "flex", alignItems: "center", gap: 40 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20, borderRight: `1px solid ${BORDER}`, paddingRight: 40 }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: "#FCF8F1", display: "flex", alignItems: "center", justifyContent: "center" }}><Trophy size={30} color={CU} /></div>
                <div><h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{data.nombre}</h3><p style={{ margin: 0, fontSize: 12, color: MUTED }}>{data.deporte} · {data.temporada} · {data.fechaInicio}</p></div>
              </div>
              <div style={{ display: "flex", gap: 32, flex: 1 }}>
                <Step3Stat icon={LayoutGrid} val={data.categorias.length} lab="Categorías" />
                <Step3Stat icon={Users} val={totalExpected} lab="Equipos esperados" />
                <Step3Stat icon={Users} val={totalLoaded} lab="Equipos cargados" />
              </div>
              <div style={{ width: 80, height: 80, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="80" height="80"><circle cx="40" cy="40" r="34" fill="none" stroke="#F1F1EF" strokeWidth="8" /><circle cx="40" cy="40" r="34" fill="none" stroke={CU} strokeWidth="8" strokeDasharray="213" strokeDashoffset={213 - (213 * progress) / 100} strokeLinecap="round" transform="rotate(-90 40 40)" /></svg>
                <div style={{ position: "absolute", fontSize: 14, fontWeight: 800 }}>{progress}%</div>
                <div style={{ position: "absolute", bottom: -20, fontSize: 9, fontWeight: 700, color: HINT }}>PROGRESO</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 300px", gap: 24, alignItems: "start" }}>
              <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                <div style={{ padding: "20px 20px 10px", fontSize: 14, fontWeight: 800 }}>Categorías</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {data.categorias.map(c => {
                    const loaded = teams[c.id]?.length || 0;
                    const expected = parseInt(c.teams) || 0;
                    const isDone = loaded >= expected && expected > 0;
                    const active = catId === c.id;
                    return (
                      <div key={c.id} onClick={() => setCatId(c.id)} style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: active ? BG : "transparent", borderLeft: active ? `4px solid ${CU}` : "4px solid transparent" }}>
                        <Users size={16} color={active ? CU : MUTED} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{c.nombre}</div>
                          <div style={{ fontSize: 11, color: HINT }}>{loaded} / {expected}</div>
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: isDone ? "#E7F9ED" : "#FFF1E7", color: isDone ? PALETTE.success : "#E87C2E" }}>{isDone ? "Completa" : `Faltan ${expected - loaded}`}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, boxShadow: ELEV, padding: "24px 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Equipos de: {activeCat?.nombre}</h3>
                    <span style={{ fontSize: 12, color: "#E87C2E", fontWeight: 700 }}>{activeTeams.length} de {activeCat?.teams} equipos</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ position: "relative" }}><Search size={14} color={HINT} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} /><input placeholder="Buscar equipo..." style={{ ...inputStyle, paddingLeft: 34, width: 200, height: 36 }} /></div>
                  </div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: HINT, borderBottom: `1px solid ${BORDER}` }}><th style={{ padding: "12px 24px", width: 40 }}>#</th><th style={{ padding: "12px 10px" }}>Equipo</th><th style={{ padding: "12px 10px" }}>Delegado</th><th style={{ padding: "12px 10px" }}>Jugadores</th><th style={{ padding: "12px 10px" }}>Estado</th><th style={{ padding: "12px 24px", textAlign: "right" }}>Acciones</th></tr>
                  </thead>
                  <tbody>
                    {activeTeams.map((t, idx) => (
                       <tr key={idx} style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <td style={{ padding: "14px 24px", color: HINT }}>{idx + 1}</td>
                        <td style={{ padding: "14px 10px", display: "flex", alignItems: "center", gap: 10 }}><Shield size={16} color={MUTED} /> <span style={{ fontWeight: 700 }}>{t.name}</span></td>
                        <td style={{ padding: "14px 10px" }}>{t.delegate}</td>
                        <td style={{ padding: "14px 10px" }}>{t.players}</td>
                        <td style={{ padding: "14px 10px" }}><div style={{ fontSize: 11, fontWeight: 700, color: PALETTE.success, background: "#E7F9ED", padding: "4px 8px", borderRadius: 6 }}>{t.status}</div></td>
                        <td style={{ padding: "14px 24px", textAlign: "right" }}><MoreHorizontal size={16} color={HINT} /></td>
                       </tr>
                    ))}
                    {activeTeams.length === 0 && <tr><td colSpan="6" style={{ padding: 40, textAlign: "center", color: HINT }}><AlertCircle size={30} style={{ margin: "0 auto 10px" }} /> <p>No hay equipos cargados aún en esta categoría.</p></td></tr>}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 24 }}>
                  <h4 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800 }}>Acciones rápidas</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <button onClick={() => {
                      const name = prompt("Nombre del equipo:");
                      if (!name?.trim()) return;
                      const delegate = prompt("Nombre del delegado (opcional):") || "";
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
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 12, marginBottom: 32 }}>
               <InfoBox icon={Calendar} label="Inicio" value={data.fechaInicio} />
               <InfoBox icon={Calendar} label="Finalización" value={data.fechaFin} />
               <InfoBox icon={MapPin} label="Sede principal" value={data.sedePrincipal} />
               <InfoBox icon={User} label="Organizador" value={data.organizador} />
               <InfoBox icon={Bookmark} label="Estado" value={<span style={{ color: PALETTE.success }}>Listo para crear</span>} />
            </div>

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
                    <tbody>
                      {data.categorias.map(c => {
                        const s = structures[c.id] || {};
                        const isConfig = s.status === "configured";
                        return (
                          <tr key={c.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                            <td style={{ padding: "14px 24px", fontWeight: 700, color: CU, whiteSpace: "nowrap" }}>{c.nombre}</td>
                            <td style={{ padding: "14px 10px", whiteSpace: "nowrap" }}>{c.teams} equipos</td>
                            <td style={{ padding: "14px 10px", whiteSpace: "nowrap" }}>{FASE_OPTIONS.find(f => f.id === s.format)?.label}</td>
                            <td style={{ padding: "14px 10px", whiteSpace: "nowrap" }}>{s.format === "grupos_playoffs" ? `${s.grupos} grupos de ${s.tpg}` : `${s.vueltas} vuelta`}</td>
                            <td style={{ padding: "14px 10px", whiteSpace: "nowrap" }}>{s.faseFinal}</td>
                            <td style={{ padding: "14px 10px", fontWeight: 700 }}>{calcularPartidos(s, c.teams)}</td>
                            <td style={{ padding: "14px 24px" }}>
                              <div style={{ fontSize: 10, fontWeight: 700, background: isConfig ? "#E7F9ED" : "#FFF1E7", color: isConfig ? PALETTE.success : "#E87C2E", padding: "4px 8px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                {isConfig ? "COMPLETA" : "FALTA CONFIG"} {isConfig && <CheckCircle size={10} />}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
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
                    <SummaryRow lab="Equipos esperados" val={totalExpected} />
                    <SummaryRow lab="Equipos cargados" val={totalLoaded} />
                    <SummaryRow lab="Equipos incompletos" val={Math.max(0, totalExpected - totalLoaded)} />
                  </div>
                  <div style={{ padding: 16, background: totalLoaded >= totalExpected ? "#E7F9ED" : "#FFF1E7", borderRadius: 12, border: `1px solid ${totalLoaded >= totalExpected ? "#C4EDD2" : "#F5D4B8"}`, display: "flex", gap: 10, marginBottom: 24 }}>
                    {totalLoaded >= totalExpected ? <CheckCircle size={18} color={PALETTE.success} /> : <AlertCircle size={18} color="#E87C2E" />}
                    <p style={{ margin: 0, fontSize: 12, color: totalLoaded >= totalExpected ? "#1E5F33" : "#A65213", fontWeight: 600 }}>
                      {totalLoaded >= totalExpected ? "Todos los equipos requeridos están cargados correctamente." : `Faltan cargar ${totalExpected - totalLoaded} equipos para completar las categorías.`}
                    </p>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>Equipos por categoría</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {data.categorias.map(c => {
                      const loaded = teams[c.id]?.length || 0;
                      const expected = parseInt(c.teams) || 0;
                      const isComplete = loaded >= expected && expected > 0;
                      return (
                        <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 13, color: MUTED }}>{c.nombre}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: isComplete ? PALETTE.success : "#E87C2E" }}>
                            {isComplete ? <CheckCircle size={12} /> : <AlertCircle size={12} />} {loaded} / {expected}
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div style={{ marginTop: 40, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {step === 4 ? (
          <>
            <button onClick={() => { localStorage.setItem('wizard_draft_saved', JSON.stringify({ data, structures, teams, step })); }} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 32px", fontSize: 15, fontWeight: 700, color: TEXT, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}><Save size={18} /> Guardar borrador</button>
            <button onClick={() => setStep(3)} style={{ background: "none", border: `1px solid ${CU_BOR}`, borderRadius: 12, padding: "16px 32px", fontSize: 15, fontWeight: 700, color: CU, display: "flex", alignItems: "center", gap: 10 }}><ArrowLeft size={18} /> Volver a equipos</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNext} style={{ background: CU, color: "#FFF", border: "none", borderRadius: 12, padding: "16px 80px", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 10px 20px rgba(181, 143, 76, 0.3)" }}>
              <Trophy size={20} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 16 }}>Crear torneo</div>
                <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>Se creará el torneo y podrás generar el fixture</div>
              </div>
              <ArrowRight size={20} />
            </motion.button>
          </>
        ) : (
          <>
            <div style={{ display: "flex", gap: 12 }}>
              <FooterBadge icon={Settings} label="Nivel" value={step === 1 ? "Inicial" : step === 2 ? "Estructura" : "Equipos"} />
              <FooterBadge icon={Zap} label="Estado" value="Borrador" />
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <button onClick={() => { localStorage.setItem('wizard_draft_saved', JSON.stringify({ data, structures, teams, step })); }} style={{ background: "none", border: "none", fontSize: 13, fontWeight: 700, color: MUTED, cursor: "pointer" }}>Guardar borrador</button>
              {step > 1 && <button onClick={() => setStep(s => s - 1)} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 24px", fontSize: 13, fontWeight: 700, color: MUTED, cursor: "pointer" }}>Anterior</button>}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                {Object.keys(step1Errors).length > 0 && step === 1 && (
                  <motion.div
                    initial={{ x: 0 }} animate={{ x: [0, -6, 6, -4, 4, 0] }} transition={{ duration: 0.4 }}
                    style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: PALETTE.danger, fontWeight: 700 }}
                  >
                    <AlertCircle size={14} /> Completa los campos obligatorios marcados en rojo
                  </motion.div>
                )}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNext} style={{ background: CU, color: "#FFF", border: "none", borderRadius: 12, padding: "14px 40px", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                  {step === 3 ? "Continuar a confirmación" : "Continuar"} <ArrowRight size={18} />
                </motion.button>
              </div>
            </div>
          </>
        )}
      </div>

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
      `}} />
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
      <Icon size={18} color={CU} />
      <div><div style={{ fontSize: 10, fontWeight: 700, color: HINT, marginBottom: 2 }}>{label.toUpperCase()}</div><div style={{ fontSize: 13, fontWeight: 700 }}>{value}</div></div>
    </div>
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
  const Icon = isSuccess ? CheckCircle : isWarning ? AlertCircle : X;
  return (
    <div style={{ display: "flex", gap: 12 }}>
       <Icon size={18} color={color} style={{ marginTop: 2 }} />
       <div><div style={{ fontSize: 13, fontWeight: 700, color: isSuccess ? TEXT : color }}>{label}</div><div style={{ fontSize: 11, color: HINT }}>{sub}</div></div>
    </div>
  );
}

function Step3Stat({ icon: Icon, val, lab }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Icon size={18} color={HINT} />
      <div><div style={{ fontSize: 16, fontWeight: 800 }}>{val}</div><div style={{ fontSize: 11, color: HINT, fontWeight: 600 }}>{lab}</div></div>
    </div>
  );
}

function FooterBadge({ icon: Icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: CARD, borderRadius: 12, border: `1px solid ${BORDER}` }}>
      <Icon size={14} color={HINT} />
      <div><div style={{ fontSize: 9, fontWeight: 700, color: HINT }}>{label.toUpperCase()}</div><div style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{value}</div></div>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#FDFDFB", fontSize: 13, color: TEXT, fontFamily: FONT, outline: "none" };
const dateClickArea = { display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#FDFDFB", cursor: "pointer", position: "relative" };
const hiddenInput = { position: "absolute", bottom: 0, left: 0, opacity: 0, width: "100%", height: 1, pointerEvents: "none" };
