import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Plus, Search, Filter, MoreVertical, 
  ChevronDown, Download, Info, CheckCircle2, 
  AlertCircle, Clock, Trash2, Edit2, Shield, Trophy, X,
  Upload, FileText, ChevronRight, UserPlus, Save
} from "lucide-react";
import { useTorneosStore } from "../store/useTorneosStore";
import ModuleEmptyState from "../components/shared/ModuleEmptyState";
import { PALETTE, ELEVATION } from "../../../shared/tokens/palette";
import { showToast } from "../../../shared/ui/Toast";
import { uploadImage } from "../utils/storageHelper";
import * as XLSX from "xlsx";

const CU      = PALETTE.bronce;
const CU_DIM  = PALETTE.bronceDim;
const CU_BOR  = PALETTE.bronceBorder;
const CARD    = PALETTE.surface;
const BG      = PALETTE.bg;
const TEXT    = PALETTE.text;
const MUTED   = PALETTE.textMuted;
const BORDER  = PALETTE.border;
const HINT    = PALETTE.textHint;
const ELEV    = ELEVATION?.card ?? "0 10px 28px rgba(23,26,28,0.07)";
const FONT    = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
const EASE    = [0.22, 1, 0.36, 1];

// ── Components ───────────────────────────────────────────────────────────────

function EquipoModal({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState(() => initialData ? { ...initialData } : {
    nombre: "", grupo: "", delegado: "", entrenador: "", logo: ""
  });
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (stayOpen = false) => {
    if (!formData.nombre.trim()) return;
    setLoading(true);
    await onSave(formData);
    setLoading(false);
    if (!stayOpen) {
      onClose();
    } else {
      setFormData({ nombre: "", grupo: "", delegado: "", entrenador: "", logo: "" });
      nameInputRef.current?.focus();
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const url = await uploadImage(file);
    if (url) setFormData({ ...formData, logo: url });
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={{ background: CARD, borderRadius: 24, width: 440, padding: 32, boxShadow: ELEVATION.panel, border: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: CU_DIM, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={20} color={CU} />
            </div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>{initialData ? "Editar equipo" : "Nuevo equipo"}</h3>
          </div>
          <button onClick={onClose} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 8, cursor: "pointer", color: MUTED }}><X size={18} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Logo Upload Section */}
          <div style={{ display: "flex", gap: 16, alignItems: "center", padding: 16, background: BG, borderRadius: 16, border: `1px dashed ${BORDER}` }}>
            <div style={{ width: 64, height: 64, borderRadius: 12, background: CARD, border: `1px solid ${BORDER}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {formData.logo ? <img src={formData.logo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Upload size={24} color={HINT} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: TEXT, marginBottom: 4 }}>LOGO DEL CLUB</div>
              <label style={{ fontSize: 12, color: CU, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Plus size={14} /> {formData.logo ? "Cambiar imagen" : "Subir imagen"}
                <input type="file" hidden accept="image/*" onChange={handleLogoUpload} disabled={loading} />
              </label>
            </div>
          </div>

          <Field label="NOMBRE DEL EQUIPO">
            <input 
              ref={nameInputRef}
              type="text" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} 
              onKeyDown={e => e.key === "Enter" && handleSave(false)}
              placeholder="Ej: Deportivo Alttez" style={modalInputStyle} 
            />
          </Field>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="CATEGORÍA">
              <input 
                type="text" value={formData.grupo} onChange={e => setFormData({ ...formData, grupo: e.target.value })} 
                onKeyDown={e => e.key === "Enter" && handleSave(false)}
                placeholder="Ej: Sub 15" style={modalInputStyle} 
              />
            </Field>
            <Field label="DELEGADO / CONTACTO">
              <input 
                type="text" value={formData.delegado} onChange={e => setFormData({ ...formData, delegado: e.target.value })} 
                onKeyDown={e => e.key === "Enter" && handleSave(false)}
                placeholder="Nombre" style={modalInputStyle} 
              />
            </Field>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 32 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button 
              disabled={loading}
              onClick={() => handleSave(false)} 
              style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: CU, fontSize: 13, fontWeight: 700, color: "#FFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 12px ${CU}33` }}
            >
              <Save size={16} /> Guardar equipo
            </button>
            {!initialData && (
              <button 
                disabled={loading}
                onClick={() => handleSave(true)} 
                style={{ padding: "0 16px", borderRadius: 12, border: `1.5px solid ${CU_BOR}`, background: BG, fontSize: 13, fontWeight: 700, color: CU, cursor: "pointer" }}
                title="Guardar y registrar otro"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
          <button onClick={onClose} style={{ padding: "12px", borderRadius: 12, border: `1px solid ${BORDER}`, background: "none", fontSize: 13, fontWeight: 700, color: MUTED, cursor: "pointer" }}>Cancelar</button>
        </div>
      </motion.div>
    </div>
  );
}

function ImportModal({ isOpen, onClose, onImport }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: CARD, borderRadius: 24, width: 500, padding: 32, boxShadow: ELEVATION.panel, border: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${PALETTE.success}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={20} color={PALETTE.success} />
            </div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Importar desde Excel</h3>
          </div>
          <button onClick={onClose} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 8, cursor: "pointer", color: MUTED }}><X size={18} /></button>
        </div>

        <div style={{ padding: 20, background: "#FDFDFB", borderRadius: 16, border: `1px solid ${BORDER}`, marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TEXT, marginBottom: 12 }}>FORMATO DEL ARCHIVO</div>
          <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, marginBottom: 16 }}>
            El archivo debe ser **Excel (.xlsx)** o **CSV** y contener las siguientes columnas exactas en la primera fila:
          </div>
          <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ color: HINT, borderBottom: `1px solid ${BORDER}` }}>
                <th style={{ paddingBottom: 8 }}>Nombre</th>
                <th style={{ paddingBottom: 8 }}>Categoría</th>
                <th style={{ paddingBottom: 8 }}>Delegado</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ color: TEXT, fontWeight: 600 }}>
                <td style={{ paddingTop: 8 }}>Tigres FC</td>
                <td style={{ paddingTop: 8 }}>Sub 12</td>
                <td style={{ paddingTop: 8 }}>Juan Pérez</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ border: `2px dashed ${BORDER}`, borderRadius: 16, padding: "32px 20px", textAlign: "center", cursor: "pointer", background: BG }} onClick={() => document.getElementById("file-import").click()}>
          <Upload size={32} color={CU} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Selecciona tu archivo</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Haz clic o arrastra el archivo aquí</div>
          <input id="file-import" type="file" hidden accept=".xlsx,.xls,.csv" onChange={(e) => onImport(e.target.files[0])} />
        </div>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "12px 24px", borderRadius: 12, border: `1px solid ${BORDER}`, background: "none", fontSize: 13, fontWeight: 700, color: MUTED, cursor: "pointer" }}>Cerrar</button>
        </div>
      </motion.div>
    </div>
  );
}

function TeamPlayersModal({ isOpen, onClose, team, onUpdate }) {
  const [nuevo, setNuevo] = useState({ nombre: "", dorsal: "" });
  const inputRef = useRef(null);

  if (!isOpen || !team) return null;

  const handleAdd = () => {
    if (!nuevo.nombre.trim()) return;
    const j = { id: crypto.randomUUID(), nombre: nuevo.nombre.trim(), dorsal: nuevo.dorsal.trim() };
    onUpdate({ jugadores: [...(team.jugadores || []), j] });
    setNuevo({ nombre: "", dorsal: "" });
    inputRef.current?.focus();
  };

  const remove = (id) => {
    onUpdate({ jugadores: (team.jugadores || []).filter(p => p.id !== id) });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: CARD, borderRadius: 24, width: 500, padding: 32, boxShadow: ELEVATION.panel, border: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: CU_DIM, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={20} color={CU} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Plantilla: {team.nombre}</h3>
              <div style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>{team.grupo || "Sin categoría"}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 8, cursor: "pointer", color: MUTED }}><X size={18} /></button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <input 
            type="text" placeholder="N°" value={nuevo.dorsal} onChange={e => setNuevo({ ...nuevo, dorsal: e.target.value })} 
            style={{ width: 60, ...modalInputStyle }} 
          />
          <input 
            ref={inputRef}
            type="text" placeholder="Nombre completo del jugador" value={nuevo.nombre} onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })} 
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            style={{ flex: 1, ...modalInputStyle }} 
          />
          <button onClick={handleAdd} style={{ width: 44, height: 44, borderRadius: 12, background: CU, border: "none", color: "#FFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={20} />
          </button>
        </div>

        <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }}>
          {(team.jugadores || []).length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: MUTED, fontSize: 13 }}>No hay jugadores registrados.</div>
          ) : (
            team.jugadores.map((j) => (
              <div key={j.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: BG, borderRadius: 12, border: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: CARD, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: CU }}>{j.dorsal || "-"}</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{j.nombre}</div>
                </div>
                <button onClick={() => remove(j.id)} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer" }}><Trash2 size={14} /></button>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: CU, fontSize: 13, fontWeight: 700, color: "#FFF", cursor: "pointer" }}>Finalizar</button>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, marginBottom: 6, letterSpacing: "0.04em" }}>{label}</div>
      {children}
    </div>
  );
}

const modalInputStyle = {
  width: "100%", boxSizing: "border-box", border: `1px solid ${BORDER}`, borderRadius: 10,
  padding: "10px 14px", fontSize: 13, color: TEXT, fontFamily: FONT, background: BG, outline: "none",
  transition: "border-color 0.2s",
};

function StatusBadge({ status }) {
  const config = {
    activo:    { label: "Activo",     color: PALETTE.success, bg: PALETTE.successDim, border: PALETTE.successBorder },
    pendiente: { label: "Pendiente",  color: PALETTE.amber,   bg: PALETTE.amberDim,   border: PALETTE.amberBorder },
    incompleto: { label: "Incompleto", color: PALETTE.danger,  bg: PALETTE.dangerDim,  border: PALETTE.dangerBorder },
  };
  const c = config[status] || config.pendiente;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 8,
      fontSize: 10, fontWeight: 700, color: c.color, background: c.bg, border: `1px solid ${c.border}`,
      textTransform: "capitalize"
    }}>
      {c.label}
    </div>
  );
}

function StatItem({ icon: Icon, label, value, color = CU }) {
  return (
    <div style={{ 
      display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", 
      background: BG, borderRadius: 12, border: `1px solid ${BORDER}`, marginBottom: 10 
    }}>
      <div style={{ 
        width: 32, height: 32, borderRadius: 8, background: `${color}15`, 
        display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${color}33` 
      }}>
        <Icon size={16} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>{value}</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: MUTED, letterSpacing: "0.02em" }}>{label}</div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function EquiposPage({ onGoTorneos }) {
  const torneoActivoId   = useTorneosStore(s => s.torneoActivoId);
  const allTorneos       = useTorneosStore(s => s.torneos);
  const allEquipos       = useTorneosStore(s => s.equipos);
  const agregarEquipo    = useTorneosStore(s => s.agregarEquipo);
  const actualizarEquipo = useTorneosStore(s => s.actualizarEquipo);
  const eliminarEquipo   = useTorneosStore(s => s.eliminarEquipo);

  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [menuId, setMenuId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [playersOpen, setPlayersOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState(null);

  const torneo  = allTorneos.find(t => t.id === torneoActivoId) ?? null;
  const equiposRaw = allEquipos.filter(e => e.torneoId === torneoActivoId);

  // Derive status and stats
  const equipos = useMemo(() => {
    return equiposRaw.map(e => {
      const numJugadores = (e.jugadores || []).length;
      let estado = "activo";
      if (numJugadores < 1) estado = "incompleto";
      else if (!e.delegado && !e.entrenador) estado = "pendiente";
      
      return { ...e, numJugadores, estado };
    }).filter(e => {
      const matchSearch = e.nombre.toLowerCase().includes(search.toLowerCase());
      const matchEstado = filterEstado === "todos" || e.estado === filterEstado;
      return matchSearch && matchEstado;
    });
  }, [equiposRaw, search, filterEstado]);

  if (!torneoActivoId) {
    return <ModuleEmptyState icon={Users} title="Selecciona un torneo" subtitle="Abre un torneo desde la lista para gestionar sus equipos." ctaLabel="Ver torneos" onCta={onGoTorneos} />;
  }

  const stats = {
    total: equiposRaw.length,
    categorias: new Set(equiposRaw.map(e => e.grupo).filter(Boolean)).size || 1,
    completos: equiposRaw.filter(e => (e.jugadores || []).length >= 11).length,
  };

  const handleSaveModal = async (data) => {
    if (editingEquipo) {
      await actualizarEquipo(editingEquipo.id, data);
      showToast("Equipo actualizado", "success");
    } else {
      await agregarEquipo(torneoActivoId, data);
      showToast("Equipo registrado", "success");
    }
    // We don't close here, the modal handles its own closing vs "add another"
  };

  const handleImport = async (file) => {
    if (!file) return;
    showToast(`Procesando ${file.name}...`, "info");
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (json.length === 0) {
          showToast("El archivo está vacío", "error");
          return;
        }

        let count = 0;
        for (const row of json) {
          // Normalización de llaves (insensible a mayúsculas/tildes básico)
          const nombre = row.Nombre || row.nombre || row.NOMBRE || row.Equipo || row.EQUIPO;
          const grupo  = row.Categoria || row.Categoría || row.categoria || row.Grupo || row.grupo;
          const delegado = row.Delegado || row.delegado || row.Contacto || row.contacto;

          if (nombre) {
            await agregarEquipo(torneoActivoId, { 
              nombre: String(nombre).trim(), 
              grupo: grupo ? String(grupo).trim() : "",
              delegado: delegado ? String(delegado).trim() : ""
            });
            count++;
          }
        }

        setImportOpen(false);
        showToast(`Se importaron ${count} equipos con éxito`, "success");
      } catch (err) {
        console.error("Error importando archivo:", err);
        showToast("Error al leer el archivo. Asegúrate de que sea Excel o CSV.", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAction = (id, action) => {
    setMenuId(null);
    const eq = equipos.find(e => e.id === id);
    if (!eq) return;

    if (action === "eliminar") {
      if (window.confirm(`¿Estás seguro de eliminar "${eq.nombre}"?`)) {
        eliminarEquipo(id);
        showToast("Equipo eliminado", "success");
      }
    }
    if (action === "editar") {
      setEditingEquipo(eq);
      setModalOpen(true);
    }
    if (action === "jugadores") {
      setEditingEquipo(eq);
      setPlayersOpen(true);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} style={{ fontFamily: FONT, color: TEXT }}>
      
      <EquipoModal key={editingEquipo?.id || "new"} isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingEquipo(null); }} onSave={handleSaveModal} initialData={editingEquipo} />
      <ImportModal isOpen={importOpen} onClose={() => setImportOpen(false)} onImport={handleImport} />
      <TeamPlayersModal isOpen={playersOpen} onClose={() => { setPlayersOpen(false); setEditingEquipo(null); }} team={editingEquipo} onUpdate={(patch) => actualizarEquipo(editingEquipo.id, patch)} />

      {/* Breadcrumbs */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 11, fontWeight: 600 }}>
        <span style={{ color: MUTED }}>Torneos</span>
        <span style={{ color: MUTED }}>›</span>
        <span style={{ color: CU }}>Equipos</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>Equipos</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: MUTED }}>Administra los equipos participantes por torneo y categoría.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {/* Tournament Selector (Read Only here) */}
        <div style={{ flex: 1.2, background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "0 14px", display: "flex", alignItems: "center", gap: 10, height: 44 }}>
          <Trophy size={16} color={CU} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: HINT, letterSpacing: "0.04em" }}>TORNEO ACTUAL</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{torneo?.nombre}</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ flex: 1.5, background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "0 14px", display: "flex", alignItems: "center", gap: 10, height: 44 }}>
          <Search size={16} color={HINT} />
          <input type="text" placeholder="Buscar equipo..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: 12, color: TEXT, fontWeight: 500, fontFamily: FONT }} />
        </div>

        {/* State Filter */}
        <div style={{ flex: 0.8, background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "0 14px", display: "flex", alignItems: "center", gap: 10, height: 44 }}>
          <Filter size={16} color={HINT} />
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: 12, color: TEXT, fontWeight: 600, appearance: "none", fontFamily: FONT }}>
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="pendiente">Pendientes</option>
            <option value="incompleto">Incompletos</option>
          </select>
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setEditingEquipo(null); setModalOpen(true); }} style={{ padding: "0 20px", background: CU, color: "#FFF", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, height: 44, boxShadow: `0 4px 12px ${CU}33` }}>
          Nuevo equipo <Plus size={16} />
        </motion.button>

        <motion.button whileHover={{ background: BG }} whileTap={{ scale: 0.98 }} onClick={() => setImportOpen(true)} style={{ padding: "0 20px", background: CARD, color: CU, border: `1.5px solid ${CU_BOR}`, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, height: 44 }}>
          Importar <Download size={16} />
        </motion.button>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "flex-start" }}>
        
        {/* Table Content */}
        <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, boxShadow: ELEV, position: "relative" }}>
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Listado de equipos</h3>
          </div>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}`, background: "#FDFDFB" }}>
                  {["Escudo", "Equipo", "Categoría", "Delegado", "Jugadores", "Estado", "Acciones"].map((h, i) => (
                    <th key={h} style={{ 
                      padding: "14px 24px", fontSize: 11, fontWeight: 700, color: HINT, textTransform: "uppercase", letterSpacing: "0.04em",
                      borderTopLeftRadius: i === 0 ? 16 : 0, borderTopRightRadius: i === 6 ? 16 : 0
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {equipos.map((eq, i) => (
                  <tr key={eq.id} style={{ borderBottom: i < equipos.length - 1 ? `1px solid ${BG}` : "none", transition: "background 0.2s" }}>
                    <td style={{ padding: "12px 24px" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: CU }}>
                        {eq.logo ? <img src={eq.logo} style={{ width: "100%", height: "100%", borderRadius: 10, objectFit: "cover" }} /> : eq.nombre.charAt(0)}
                      </div>
                    </td>
                    <td style={{ padding: "12px 24px", fontSize: 13, fontWeight: 700, color: TEXT }}>{eq.nombre}</td>
                    <td style={{ padding: "12px 24px", fontSize: 12, color: MUTED }}>{eq.grupo || "—"}</td>
                    <td style={{ padding: "12px 24px", fontSize: 12, color: TEXT, fontWeight: 500 }}>{eq.delegado || eq.entrenador || "—"}</td>
                    <td style={{ padding: "12px 24px", fontSize: 12, color: TEXT, fontWeight: 600, textAlign: "center" }}>{eq.numJugadores}</td>
                    <td style={{ padding: "12px 24px" }}><StatusBadge status={eq.estado} /></td>
                    <td style={{ padding: "12px 24px", position: "relative" }}>
                      <button onClick={() => setMenuId(menuId === eq.id ? null : eq.id)} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 6, cursor: "pointer", color: MUTED }}><MoreVertical size={14} /></button>
                      <AnimatePresence>
                        {menuId === eq.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, x: 10 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95, x: 10 }} 
                            style={{ 
                              position: "absolute", right: "100%", top: -10, marginRight: 12, zIndex: 100, background: CARD, 
                              borderRadius: 12, border: `1px solid ${BORDER}`, boxShadow: ELEVATION.panel, padding: 6, minWidth: 170 
                            }}
                          >
                            <button onClick={() => handleAction(eq.id, "jugadores")} style={{ width: "100%", padding: "10px", display: "flex", alignItems: "center", gap: 10, border: "none", background: "none", cursor: "pointer", fontSize: 12, color: TEXT, fontWeight: 600, borderRadius: 8 }}>
                              <UserPlus size={14} color={CU} /> Plantilla / Jugadores
                            </button>
                            <button onClick={() => handleAction(eq.id, "editar")} style={{ width: "100%", padding: "10px", display: "flex", alignItems: "center", gap: 10, border: "none", background: "none", cursor: "pointer", fontSize: 12, color: TEXT, fontWeight: 600, borderRadius: 8 }}>
                              <Edit2 size={14} color={MUTED} /> Editar información
                            </button>
                            <div style={{ height: 1, background: BORDER, margin: "4px 0" }} />
                            <button onClick={() => handleAction(eq.id, "eliminar")} style={{ width: "100%", padding: "10px", display: "flex", alignItems: "center", gap: 10, border: "none", background: "none", cursor: "pointer", fontSize: 12, color: PALETTE.danger, fontWeight: 600, borderRadius: 8 }}>
                              <Trash2 size={14} /> Eliminar equipo
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {equipos.length === 0 && <div style={{ padding: "60px 24px", textAlign: "center", color: MUTED, fontSize: 13 }}>No hay equipos registrados. Comienza agregando uno nuevo.</div>}
        </div>

        {/* Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 24, boxShadow: ELEV }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Users size={18} color={CU} />
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Resumen</h4>
            </div>
            
            <StatItem icon={Users} label="Equipos totales" value={stats.total} />
            <StatItem icon={Shield} label="Categorías" value={stats.categorias} color={PALETTE.amber} />
            <StatItem icon={CheckCircle2} label="Plantillas completas" value={stats.completos} color={PALETTE.success} />
            
            <div style={{ marginTop: 20, display: "flex", gap: 10, alignItems: "flex-start", fontSize: 11, color: MUTED, lineHeight: 1.5, padding: 12, background: BG, borderRadius: 12 }}>
              <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Recuerda que para el fixture cada equipo debe tener al menos 1 jugador.</span>
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
