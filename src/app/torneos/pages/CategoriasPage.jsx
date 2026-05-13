import { motion, AnimatePresence } from "framer-motion";
import { Tag, Users, Shield, Plus, MoreVertical, LayoutGrid, List, Settings, ChevronRight, X, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTorneosStore } from "../store/useTorneosStore";
import { PALETTE, ELEVATION } from "../../../shared/tokens/palette";
import ModuleEmptyState from "../components/shared/ModuleEmptyState";

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
const EASE    = [0.22, 1, 0.36, 1];

const FORMAT_LABELS = {
  todos_contra_todos: "Liga",
  eliminacion: "Eliminación",
  grupos_playoffs: "Grupos + Playoffs",
};

const FASES_LABELS = {
  ida: "Solo ida",
  ida_vuelta: "Ida y vuelta",
};

const viewBtn = (sel) => ({
  background: sel ? BG : "transparent",
  border: `1px solid ${sel ? BORDER : "transparent"}`,
  borderRadius: 8,
  padding: "6px 10px",
  cursor: "pointer",
  color: sel ? CU : MUTED,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s"
});

export default function CategoriasPage({ onGoTorneos, onNavigate }) {
  const torneoActivoId = useTorneosStore(s => s.torneoActivoId);
  const allEquipos     = useTorneosStore(s => s.equipos);
  const allCategorias  = useTorneosStore(s => s.categorias);
  const [view, setView] = useState("grid");
  const [menuId, setMenuId] = useState(null);

  if (!torneoActivoId) {
    return (
      <ModuleEmptyState 
        icon={Tag}
        title="Selecciona un torneo"
        subtitle="Debes abrir un torneo para gestionar sus categorías."
        ctaLabel="Ver mis torneos"
        onCta={onGoTorneos}
      />
    );
  }

  const equipos = allEquipos.filter(e => e.torneoId === torneoActivoId);
  const storeCategorias = allCategorias.filter(c => c.torneoId === torneoActivoId);

  // Build categories: prefer store categories, fallback to equipo.grupo derivation
  let categorias;
  if (storeCategorias.length > 0) {
    categorias = storeCategorias.map(cat => ({
      ...cat,
      equipos: equipos.filter(e => e.grupo === cat.nombre),
    }));
  } else {
    // Legacy fallback: derive from equipo.grupo
    const categoriasMap = equipos.reduce((acc, eq) => {
      const cat = eq.grupo || "Sin categoría";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(eq);
      return acc;
    }, {});
    categorias = Object.keys(categoriasMap).sort().map(name => ({
      id: name,
      nombre: name,
      equipos: categoriasMap[name],
      teams: categoriasMap[name].length,
      format: null,
      fases: null,
    }));
  }

  if (categorias.length === 0) {
    return (
      <ModuleEmptyState 
        icon={Tag}
        title="Sin categorías"
        subtitle="Crea un torneo con categorías para verlas organizadas aquí."
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: FONT }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em" }}>Gestión por Categorías</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: MUTED }}>{categorias.length} categorías en este torneo</p>
        </div>
        
        <div style={{ display: "flex", gap: 8, background: CARD, padding: 4, borderRadius: 10, border: `1px solid ${BORDER}` }}>
          <button onClick={() => setView("grid")} style={viewBtn(view === "grid")}><LayoutGrid size={14} /></button>
          <button onClick={() => setView("list")} style={viewBtn(view === "list")}><List size={14} /></button>
        </div>
      </header>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(320px, 1fr))" : "1fr", 
        gap: 20 
      }}>
        {categorias.map((cat, idx) => (
          <motion.div 
            key={cat.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, ease: EASE }}
            style={{ 
              background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, 
              boxShadow: ELEV, overflow: "hidden" 
            }}
          >
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FDFDFB" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: CU_DIM, border: `1px solid ${CU_BOR}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Tag size={14} color={CU} />
                </div>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{cat.nombre}</span>
                  {cat.format && (
                    <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                      {FORMAT_LABELS[cat.format] || cat.format}
                      {cat.fases && ` · ${FASES_LABELS[cat.fases] || cat.fases}`}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, background: BG, padding: "4px 10px", borderRadius: 20, border: `1px solid ${BORDER}` }}>
                  {cat.equipos.length}{cat.teams ? ` / ${cat.teams}` : ""} EQUIPOS
                </span>
              </div>
            </div>

            {/* Team list */}
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
              {cat.equipos.length > 0 ? cat.equipos.map(eq => (
                <div key={eq.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 10, transition: "background 0.2s", cursor: "default", position: "relative" }} className="team-row">
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {eq.logo ? <img src={eq.logo} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <Shield size={14} color={HINT} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{eq.nombre}</div>
                    <div style={{ fontSize: 10, color: MUTED }}>{eq.delegado || "Sin delegado"}</div>
                  </div>
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setMenuId(menuId === eq.id ? null : eq.id)} style={{ background: "none", border: "none", color: HINT, cursor: "pointer", padding: 4 }}>
                      <MoreVertical size={14} />
                    </button>
                    <AnimatePresence>
                      {menuId === eq.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          style={{
                            position: "absolute", right: 0, top: "100%", zIndex: 50,
                            background: CARD, borderRadius: 10, border: `1px solid ${BORDER}`,
                            boxShadow: ELEVATION.panel, padding: 4, minWidth: 150
                          }}
                        >
                          <button 
                            onClick={() => { if (onNavigate) onNavigate("equipos"); setMenuId(null); }}
                            style={{ width: "100%", padding: "8px 12px", border: "none", background: "none", cursor: "pointer", fontSize: 12, color: TEXT, fontWeight: 600, borderRadius: 6, display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}
                          >
                            <Edit2 size={12} color={MUTED} /> Ver equipo
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )) : (
                <div style={{ padding: "24px 12px", textAlign: "center", color: HINT, fontSize: 12 }}>
                  Sin equipos registrados en esta categoría
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${BORDER}`, background: BG }}>
              <button 
                onClick={() => { if (onNavigate) onNavigate("equipos"); }}
                style={{ width: "100%", background: "none", border: `1px dashed ${BORDER}`, borderRadius: 8, padding: "8px 0", fontSize: 11, fontWeight: 600, color: MUTED, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <ChevronRight size={12} /> Gestionar Categoría
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        .team-row:hover { background: ${BG}; }
      `}</style>
    </motion.div>
  );
}
