import { motion } from "framer-motion";
import { Trophy, Shirt, Network, CalendarDays, BarChart2, Table, CalendarPlus, Settings, LayoutDashboard, Globe } from "lucide-react";
import { PALETTE } from "../../../../shared/tokens/palette";

const CU     = PALETTE.bronce;
const CU_DIM = PALETTE.bronceDim;
const CU_BOR = PALETTE.bronceBorder;
const CARD   = PALETTE.surface;
const TEXT   = PALETTE.text;
const MUTED  = PALETTE.textMuted;
const HINT   = PALETTE.textHint;
const BORDER = PALETTE.border;
const FONT   = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";

const NAV_ITEMS = [
  { id: "inicio",       icon: LayoutDashboard, label: "Inicio" },
  { id: "torneos",      icon: Trophy,          label: "Torneos" },
  { id: "equipos",      icon: Shirt,           label: "Equipos" },
  { id: "categorias",   icon: Network,         label: "Categorías" },
  { id: "fixtures",     icon: CalendarDays,    label: "Gestión de Partidos" },
  { id: "publica",      icon: Globe,           label: "Vista pública" },
  { id: "ajustes",      icon: Settings,        label: "Configuración" },
];

export default function TorneosSidebar({ active, onNav, torneoActivo }) {
  return (
    <div style={{
      width: 220, flexShrink: 0, background: CARD,
      borderRight: `1px solid ${BORDER}`,
      display: "flex", flexDirection: "column",
      fontFamily: FONT, height: "100vh", position: "sticky", top: 0,
    }}>
      {/* Brand */}
      <div style={{ padding: "20px 16px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <img src="/branding/alttez-symbol-transparent.png" alt="ALTTEZ" style={{ width: 26, height: 26, objectFit: "contain" }} />
        <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", color: TEXT }}>ALTTEZ</span>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", background: CU_DIM, color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 4, padding: "2px 6px", marginLeft: 2 }}>TORNEOS</span>
      </div>

      {/* Torneo activo badge */}
      {torneoActivo && (
        <div style={{ margin: "0 10px 8px", background: CU_DIM, border: `1px solid ${CU_BOR}`, borderRadius: 8, padding: "6px 10px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: CU, letterSpacing: "0.08em", marginBottom: 2 }}>TORNEO ACTIVO</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{torneoActivo.nombre}</div>
        </div>
      )}

      <div style={{ height: 1, background: BORDER, margin: "0 12px 8px" }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "4px 8px", overflow: "auto" }}>
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = active === id;
          return (
            <motion.button
              key={id}
              whileHover={{ x: 2 }}
              onClick={() => onNav(id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                background: isActive ? CU_DIM : "transparent",
                color: isActive ? CU : MUTED,
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                fontFamily: FONT, textAlign: "left",
                borderLeft: isActive ? `2px solid ${CU}` : "2px solid transparent",
                marginBottom: 1, transition: "background 0.15s",
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
            </motion.button>
          );
        })}
      </nav>

      <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORDER}` }}>
        <span style={{ fontSize: 11, color: HINT, fontFamily: FONT }}>v2.0 · Torneos</span>
      </div>
    </div>
  );
}
