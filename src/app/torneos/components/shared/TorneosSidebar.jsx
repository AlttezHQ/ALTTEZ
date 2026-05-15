import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Shirt, Network, CalendarDays, BarChart2, Table, CalendarPlus, Settings, LayoutDashboard, Globe, ChevronLeft, ChevronRight, User, ChevronDown, LogOut, Trash2 } from "lucide-react";
import { PALETTE, ELEVATION } from "../../../../shared/tokens/palette";
import { APP_CONFIG } from "../../../../shared/tokens/config";

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
  { id: "inicio",        icon: LayoutDashboard, label: "Inicio" },
  { id: "torneos",       icon: Trophy,          label: "Torneos" },
  { id: "equipos",       icon: Shirt,           label: "Equipos" },
  { id: "categorias",    icon: Network,         label: "Categorías" },
  { id: "fixtures",      icon: CalendarDays,    label: "Gestión de Partidos" },
  { id: "estadisticas",  icon: BarChart2,       label: "Estadísticas" },
  { id: "publica",       icon: Globe,           label: "Vista pública" },
  { id: "ajustes",       icon: Settings,        label: "Configuración" },
];

export default function TorneosSidebar({ active, onNav, torneoActivo, isCollapsed, onToggle, userName = "", onLogout, onDeleteAccount }) {
  const [openUser, setOpenUser] = useState(false);
  const displayName = userName.includes("@") ? userName.split("@")[0] : userName || "Administrador";

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 74 : 220 }}
      style={{
        flexShrink: 0, background: CARD,
        borderRight: `1px solid ${BORDER}`,
        display: "flex", flexDirection: "column",
        fontFamily: FONT, height: "100vh", position: "sticky", top: 0,
        overflow: "hidden"
      }}
    >
      {/* Brand */}
      <div style={{ padding: isCollapsed ? "20px 0" : "20px 16px 14px", display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "flex-start", gap: 8 }}>
        <img src="/branding/alttez-symbol-transparent.png" alt="ALTTEZ" style={{ width: 26, height: 26, objectFit: "contain" }} />
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap", overflow: "hidden" }}>
              <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", color: TEXT }}>ALTTEZ</span>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", background: CU_DIM, color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 4, padding: "2px 6px", marginLeft: 4 }}>TORNEOS</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Torneo activo badge */}
      {torneoActivo && (
        <div style={{ margin: isCollapsed ? "0 10px 8px" : "0 10px 8px", background: CU_DIM, border: `1px solid ${CU_BOR}`, borderRadius: 8, padding: isCollapsed ? "6px" : "6px 10px", display: "flex", justifyContent: "center" }}>
          {!isCollapsed ? (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: CU, letterSpacing: "0.08em", marginBottom: 2 }}>TORNEO ACTIVO</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{torneoActivo.nombre}</div>
            </div>
          ) : (
            <Trophy size={16} color={CU} title={torneoActivo.nombre} />
          )}
        </div>
      )}

      <div style={{ height: 1, background: BORDER, margin: "0 12px 8px" }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "4px 8px", overflowX: "hidden", overflowY: "auto" }}>
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = active === id;
          return (
            <motion.button
              key={id}
              whileHover={{ x: isCollapsed ? 0 : 2 }}
              onClick={() => onNav(id)}
              title={isCollapsed ? label : ""}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                justifyContent: isCollapsed ? "center" : "flex-start",
                padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                background: isActive ? CU_DIM : "transparent",
                color: isActive ? CU : MUTED,
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                fontFamily: FONT, textAlign: "left",
                borderLeft: isActive ? `2px solid ${CU}` : "2px solid transparent",
                marginBottom: 1, transition: "background 0.15s",
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!isCollapsed && <span style={{ whiteSpace: "nowrap" }}>{label}</span>}
            </motion.button>
          );
        })}
      </nav>

      {/* User Profile Dropdown */}
      <div style={{ padding: "0 16px 12px", position: "relative" }}>
        <button
          onClick={() => setOpenUser(o => !o)}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 10, padding: isCollapsed ? "8px" : "8px 12px",
            cursor: "pointer", fontFamily: FONT, justifyContent: isCollapsed ? "center" : "flex-start",
            transition: "background 0.2s"
          }}
          onMouseOver={e => e.currentTarget.style.background = "#F8F9FA"}
          onMouseOut={e => e.currentTarget.style.background = "transparent"}
        >
          <User size={16} color={MUTED} />
          {!isCollapsed && (
            <>
              <span style={{ fontSize: 13, color: TEXT, fontWeight: 600, flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displayName}
              </span>
              <ChevronDown size={14} color={MUTED} style={{ transition: "transform 0.2s", transform: openUser ? "rotate(180deg)" : "rotate(0deg)" }} />
            </>
          )}
        </button>

        <AnimatePresence>
          {openUser && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute", bottom: "calc(100% + 4px)", left: 16, right: 16,
                background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
                boxShadow: ELEVATION?.card ?? "0 10px 28px rgba(23,26,28,0.07)",
                overflow: "hidden", zIndex: 50
              }}
            >
              <div style={{ padding: "12px 14px", borderBottom: `1px solid ${BORDER}`, background: "#FDFDFB" }}>
                <div style={{ fontSize: 11, color: MUTED }}>Cuenta conectada</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: TEXT, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {userName || "—"}
                </div>
              </div>

              <div style={{ padding: 4 }}>
                <button
                  onClick={() => { setOpenUser(false); onLogout?.(); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px", background: "transparent", border: "none", borderRadius: 8,
                    cursor: "pointer", fontFamily: FONT, fontSize: 12, fontWeight: 600, color: MUTED,
                    textAlign: "left", transition: "background 0.15s"
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "#F8F9FA"}
                  onMouseOut={e => e.currentTarget.style.background = "transparent"}
                >
                  <LogOut size={14} /> Cerrar sesión
                </button>

                <button
                  onClick={() => { setOpenUser(false); onDeleteAccount?.(); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px", background: "transparent", border: "none", borderRadius: 8,
                    cursor: "pointer", fontFamily: FONT, fontSize: 12, fontWeight: 600,
                    color: PALETTE.danger, textAlign: "left", transition: "background 0.15s", marginTop: 2
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "#FEF2F2"}
                  onMouseOut={e => e.currentTarget.style.background = "transparent"}
                >
                  <Trash2 size={14} /> Eliminar cuenta
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between" }}>
        {!isCollapsed && <span style={{ fontSize: 11, color: HINT, fontFamily: FONT, whiteSpace: "nowrap" }}>v{APP_CONFIG.modules.torneos.version} · Torneos</span>}
        <button onClick={onToggle} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 4, color: MUTED }}>
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </motion.div>
  );
}
