/**
 * @component TabBar
 * @description Barra de tabs broadcast: beam de luz en activo, corner-accent,
 * tracking ancho uppercase. Lenguaje visual alineado con MiniTopbar.
 *
 * Props:
 *  tabs       {string[]}
 *  active     {string}
 *  onChange   {(tab: string)=>void}
 *  accent     {string}             (default: PALETTE.blue)
 *  scrollable {boolean}
 *  rightSlot  {React.ReactNode}
 *
 * @version 2.0 — Broadcast Arena
 */
import { PALETTE as C } from "../tokens/palette";

export default function TabBar({
  tabs = [],
  active,
  onChange,
  accent = C.blue,
  scrollable = false,
  rightSlot,
  className = "",
  style = {},
}) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "stretch",
        borderBottom: `1px solid ${C.borderHi}`,
        position: "relative",
        gap: 0,
        ...(rightSlot ? { justifyContent: "space-between" } : {}),
        ...style,
      }}
    >
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          flex: 1,
          ...(scrollable ? { overflowX: "auto", scrollbarWidth: "none" } : {}),
        }}
      >
        {tabs.map(tab => {
          const isActive = tab === active;
          return (
            <button
              key={tab}
              onClick={() => onChange?.(tab)}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.85)";
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.color = C.textMuted;
              }}
              style={{
                position: "relative",
                padding: "12px 20px",
                fontSize: 10,
                fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "2px",
                background: isActive
                  ? "linear-gradient(180deg, rgba(47,107,255,0.12) 0%, rgba(47,107,255,0) 100%)"
                  : "transparent",
                color: isActive ? "white" : C.textMuted,
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                minHeight: "unset",
                outline: "none",
                flexShrink: 0,
                transition: "color 0.18s ease, background 0.18s ease",
              }}
            >
              {/* Corner-accent superior izquierdo (solo activo) */}
              {isActive && (
                <span style={{
                  position: "absolute", top: 6, left: 8,
                  width: 5, height: 5,
                  borderTop: `1.5px solid ${accent}`,
                  borderLeft: `1.5px solid ${accent}`,
                }} />
              )}
              {tab}
              {/* Beam inferior activo */}
              {isActive && (
                <span style={{
                  position: "absolute", bottom: -1, left: 12, right: 12,
                  height: 2,
                  background: `linear-gradient(90deg, ${accent}00 0%, ${accent} 25%, ${C.blueHi} 50%, ${accent} 75%, ${accent}00 100%)`,
                  boxShadow: `0 0 10px ${accent}88`,
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Slot derecho */}
      {rightSlot && (
        <div style={{ display: "flex", alignItems: "center", paddingRight: "var(--sp-3)" }}>
          {rightSlot}
        </div>
      )}
    </div>
  );
}
