import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Shirt, Network, CalendarDays, BarChart2, Table, Settings, LayoutDashboard, Globe, ChevronLeft, ChevronRight, X, User, ChevronDown, LogOut, Trash2 } from "lucide-react";
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
const FONT   = "var(--font-inter), sans-serif";

const BASE_NAV_ITEMS = [
  { id: "inicio",        icon: LayoutDashboard, label: "Inicio" },
  { id: "torneos",       icon: Trophy,          label: "Torneos" },
  { id: "equipos",       icon: Shirt,           label: "Equipos" },
  { id: "categorias",    icon: Network,         label: "Categorías" },
  { id: "fixtures",      icon: CalendarDays,    label: "Gestión de Partidos" },
  { id: "estadisticas",  icon: BarChart2,       label: "Estadísticas" },
  { id: "publica",       icon: Globe,           label: "Vista pública" },
  { id: "ajustes",       icon: Settings,        label: "Configuración" },
];

import { usePathname, useRouter } from "next/navigation";

export default function TorneosSidebar({
  torneoActivo, isCollapsed, onToggle,
  userName = "", userEmail = "", onLogout, onDeleteAccount,
  categorias = [], isMobileDrawer = false
}) {
  const pathname = usePathname();
  const router = useRouter();
  // Determinar activo por los segmentos de la ruta
  const segments = pathname.split("/").filter(Boolean);
  let active = "torneos";
  if (segments.length === 1 && segments[0] === "torneos") {
     active = "inicio";
  } else if (segments.length === 2 && segments[1] === "lista") {
     active = "torneos";
  } else if (segments.length === 2 && segments[1] !== "lista") {
     active = "inicio";
  } else if (segments.length > 2) {
     active = segments[2];
  }

  const torneoId = torneoActivo?.id || "";
  const [openUser, setOpenUser] = useState(false);
  const displayName = userName || "Administrador";

  // Dynamic navigation items based on tournament categories
  const hasGrupos = categorias.some(c => c.format === "grupos_playoffs");
  const hasKnockout = categorias.some(c => c.format === "grupos_playoffs" || c.format === "eliminacion");

  const NAV_ITEMS = [...BASE_NAV_ITEMS];
  if (hasGrupos || hasKnockout) {
    const extraItems = [];
    if (hasGrupos) extraItems.push({ id: "grupos", icon: Table, label: "Fase de Grupos" });
    if (hasKnockout) extraItems.push({ id: "fase_final", icon: Trophy, label: "Fase Final" });
    NAV_ITEMS.splice(5, 0, ...extraItems);
  }

  // In mobile drawer mode, sidebar is always expanded (never collapsed)
  const collapsed = isMobileDrawer ? false : isCollapsed;

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 74 : 220 }}
      style={{
        flexShrink: 0,
        background: CARD,
        borderRight: `1px solid ${BORDER}`,
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT,
        height: "100vh",
        position: isMobileDrawer ? "relative" : "sticky",
        top: 0,
        overflow: "hidden",
        width: isMobileDrawer ? "100%" : undefined,
      }}
    >
      {/* Brand row */}
      <div style={{
        padding: collapsed ? "20px 0" : "20px 16px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div style={{ 
            width: 26, height: 26, flexShrink: 0, backgroundColor: CU, 
            maskImage: "url(/branding/alttez-symbol-transparent.png)", WebkitMaskImage: "url(/branding/alttez-symbol-transparent.png)", 
            maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", 
            maskPosition: "center", WebkitMaskPosition: "center" 
          }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap", overflow: "hidden" }}
              >
                <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", color: TEXT }}>ALTTEZ</span>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", background: CU_DIM, color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 4, padding: "2px 6px", marginLeft: 4 }}>TORNEOS</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Close button in mobile drawer */}
        {isMobileDrawer && (
          <button
            onClick={onToggle}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: MUTED, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Active tournament badge */}
      {torneoActivo && (
        <div style={{ margin: "0 10px 8px", background: CU_DIM, border: `1px solid ${CU_BOR}`, borderRadius: 8, padding: collapsed ? "6px" : "6px 10px", display: "flex", justifyContent: "center" }}>
          {!collapsed ? (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: CU, letterSpacing: "0.08em", marginBottom: 2 }}>TORNEO ACTIVO</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{torneoActivo.nombre}</div>
            </div>
          ) : (
            <Trophy size={16} color={CU} title={torneoActivo.nombre} />
          )}
        </div>
      )}

      <div style={{ height: 1, background: BORDER, margin: "0 12px 8px" }} />

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "8px", overflowX: "hidden", overflowY: "auto", position: "relative" }}>
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = active === id;
          // Items que requieren un torneo abierto; sin torneoId quedan deshabilitados
          const requiresTorneo = id !== "inicio" && id !== "torneos";
          const isDisabled = requiresTorneo && !torneoId;
          return (
            <div key={id} style={{ position: "relative", marginBottom: 4 }}>
              {isActive && !isDisabled && (
                <motion.div
                  layoutId="activeTorneosNav"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "var(--color-bronce-dim)",
                    borderRadius: 8,
                    zIndex: 0,
                  }}
                />
              )}
              <motion.button
                whileHover={isDisabled ? undefined : { x: collapsed ? 0 : 2 }}
                whileTap={isDisabled ? undefined : { scale: 0.98 }}
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  if (id === "torneos") return router.push(`/torneos/lista`);

                  if (!torneoId) {
                    if (id === "inicio") router.push(`/torneos`);
                    return;
                  }

                  if (id === "inicio") router.push(`/torneos/${torneoId}`);
                  else router.push(`/torneos/${torneoId}/${id}`);
                }}
                title={collapsed ? label : (isDisabled ? "Abre un torneo primero" : "")}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: "9px 10px", borderRadius: 8, border: "none",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  background: "transparent",
                  color: isActive && !isDisabled ? "var(--color-bronce)" : "var(--color-text-muted)",
                  opacity: isDisabled ? 0.4 : 1,
                  fontSize: 13, fontWeight: isActive && !isDisabled ? 700 : 500,
                  fontFamily: FONT, textAlign: "left",
                  position: "relative", zIndex: 1,
                  transition: "color 0.2s, opacity 0.2s"
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{label}</span>}
              </motion.button>
            </div>
          );
        })}
      </nav>

      {/* User profile dropdown */}
      <div style={{ padding: "0 16px 12px", position: "relative" }}>
        <button
          onClick={() => setOpenUser(o => !o)}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 10,
            padding: collapsed ? "8px" : "8px 12px",
            cursor: "pointer", fontFamily: FONT,
            justifyContent: collapsed ? "center" : "flex-start",
            transition: "background 0.2s",
          }}
          onMouseOver={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
          onMouseOut={e => e.currentTarget.style.background = "transparent"}
        >
          <User size={16} color={MUTED} />
          {!collapsed && (
            <>
              <span style={{ fontSize: 13, color: TEXT, fontWeight: 600, flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displayName}
              </span>
              <ChevronDown size={14} color={MUTED} style={{ transition: "transform 0.2s", transform: openUser ? "rotate(180deg)" : "rotate(0deg)" }} />
            </>
          )}
        </button>

        <AnimatePresence>
          {openUser && !collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute", bottom: "calc(100% + 4px)", left: 16, right: 16,
                background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
                boxShadow: ELEVATION?.card ?? "0 10px 28px rgba(23,26,28,0.07)",
                overflow: "hidden", zIndex: 50,
              }}
            >
              <div style={{ padding: "12px 14px", borderBottom: `1px solid ${BORDER}`, background: "var(--color-bg-panel)" }}>
                <div style={{ fontSize: 11, color: MUTED }}>Cuenta conectada</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: TEXT, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {displayName}
                </div>
                {userEmail && userEmail !== displayName && (
                  <div style={{ fontSize: 10, color: MUTED, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {userEmail}
                  </div>
                )}
              </div>

              <div style={{ padding: 4 }}>
                <button
                  onClick={() => { setOpenUser(false); onLogout?.(); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px", background: "transparent", border: "none", borderRadius: 8,
                    cursor: "pointer", fontFamily: FONT, fontSize: 12, fontWeight: 600, color: MUTED,
                    textAlign: "left", transition: "background 0.15s",
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
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
                    color: PALETTE.danger, textAlign: "left", transition: "background 0.15s", marginTop: 2,
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                  onMouseOut={e => e.currentTarget.style.background = "transparent"}
                >
                  <Trash2 size={14} /> Eliminar cuenta
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer: version + collapse toggle */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
        {!collapsed && <span style={{ fontSize: 11, color: HINT, fontFamily: FONT, whiteSpace: "nowrap" }}>v{APP_CONFIG.modules.torneos.version} · Torneos</span>}
        {/* Hide desktop collapse toggle in mobile drawer — use X button at top instead */}
        {!isMobileDrawer && (
          <button
            onClick={onToggle}
            style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 4, color: MUTED }}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>
    </motion.div>
  );
}
