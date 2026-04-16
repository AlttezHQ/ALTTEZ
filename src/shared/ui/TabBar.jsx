/**
 * @component TabBar
 * @description Barra de navegación por tabs. Reemplaza el patrón
 * css.tab()/tabStyle() + TABS.map() en Administracion, Entrenamiento y GestionPlantilla.
 *
 * Props:
 *  tabs       {string[]}           Array de etiquetas
 *  active     {string}             Tab activo
 *  onChange   {(tab: string)=>void}
 *  accent     {string}             Color del indicador activo (default: PALETTE.neon)
 *  scrollable {boolean}            overflow-x:auto en mobile
 *  rightSlot  {React.ReactNode}    Contenido alineado a la derecha (ej: selector de mes)
 */
import { PALETTE as C } from "../tokens/palette";

export default function TabBar({
  tabs = [],
  active,
  onChange,
  accent = C.neon,
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
        borderBottom: `1px solid ${C.border}`,
        gap: 0,
        ...(rightSlot ? { justifyContent: "space-between" } : {}),
        ...style,
      }}
    >
      {/* Tabs scrollables */}
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
              style={{
                padding: "10px 18px",
                fontSize: "var(--fs-label)",
                fontWeight: "var(--fw-bold)",
                textTransform: "uppercase",
                letterSpacing: "var(--ls-caps-sm)",
                background: "transparent",
                color: isActive ? accent : C.textMuted,
                border: "none",
                borderBottom: isActive ? `2px solid ${accent}` : "2px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
                minHeight: "unset",
                transition: "color var(--t-base), border-color var(--t-base)",
                flexShrink: 0,
              }}
            >
              {tab}
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
