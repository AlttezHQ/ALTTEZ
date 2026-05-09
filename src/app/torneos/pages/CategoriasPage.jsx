import { motion } from "framer-motion";
import { Tag, Users, Shield, Plus, MoreVertical, LayoutGrid, List } from "lucide-react";
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
const ELEV    = ELEVATION.card;
const FONT    = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
const EASE    = [0.22, 1, 0.36, 1];

export default function CategoriasPage({ onGoTorneos }) {
  const torneoActivoId = useTorneosStore(s => s.torneoActivoId);
  const equipos = useTorneosStore(s => s.getEquiposByTorneo(torneoActivoId));
  const [view, setView] = useState("grid");

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

  // Agrupar equipos por categoría (campo 'grupo')
  const categoriasMap = equipos.reduce((acc, eq) => {
    const cat = eq.grupo || "Sin categoría";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(eq);
    return acc;
  }, {});

  const categorias = Object.keys(categoriasMap).sort();

  if (equipos.length === 0) {
    return (
      <ModuleEmptyState 
        icon={Users}
        title="Sin equipos registrados"
        subtitle="Registra equipos para verlos organizados por categorías."
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: FONT }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em" }}>Gestión por Categorías</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: MUTED }}>{categorias.length} categorías detectadas en este torneo</p>
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
            key={cat}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, ease: EASE }}
            style={{ 
              background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, 
              boxShadow: ELEV, overflow: "hidden" 
            }}
          >
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FDFDFB" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: CU_DIM, border: `1px solid ${CU_BOR}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Tag size={14} color={CU} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{cat}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, background: BG, padding: "4px 10px", borderRadius: 20, border: `1px solid ${BORDER}` }}>
                {categoriasMap[cat].length} EQUIPOS
              </span>
            </div>

            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
              {categoriasMap[cat].map(eq => (
                <div key={eq.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 10, transition: "background 0.2s", cursor: "default" }} className="team-row">
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {eq.logo ? <img src={eq.logo} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <Shield size={14} color={HINT} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{eq.nombre}</div>
                    <div style={{ fontSize: 10, color: MUTED }}>{eq.delegado || "Sin delegado"}</div>
                  </div>
                  <button style={{ background: "none", border: "none", color: HINT, cursor: "pointer" }}>
                    <MoreVertical size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ padding: "12px 20px", borderTop: `1px solid ${BORDER}`, background: BG }}>
              <button style={{ width: "100%", background: "none", border: `1px dashed ${BORDER}`, borderRadius: 8, padding: "8px 0", fontSize: 11, fontWeight: 600, color: MUTED, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Plus size={12} /> Gestionar Categoría
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
