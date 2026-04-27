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
        borderBottom: `1px solid ${C.border}`,
        position: "relative",
        gap: 0,
        ...(rightSlot ? { justifyContent: "space-between" } : {}),
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          flex: 1,
          ...(scrollable ? { overflowX: "auto", scrollbarWidth: "none" } : {}),
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab === active;
          return (
            <button
              key={tab}
              onClick={() => onChange?.(tab)}
              onMouseEnter={(event) => {
                if (!isActive) event.currentTarget.style.color = C.text;
              }}
              onMouseLeave={(event) => {
                if (!isActive) event.currentTarget.style.color = C.textMuted;
              }}
              style={{
                position: "relative",
                padding: "12px 18px",
                fontSize: 13,
                fontWeight: isActive ? 700 : 600,
                letterSpacing: "0.01em",
                background: "transparent",
                color: isActive ? C.text : C.textMuted,
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                minHeight: "unset",
                outline: "none",
                flexShrink: 0,
                transition: "color 0.18s ease",
              }}
            >
              {tab}
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    bottom: -1,
                    left: 12,
                    right: 12,
                    height: 3,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${accent}, ${C.blueHi})`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {rightSlot && (
        <div style={{ display: "flex", alignItems: "center", paddingRight: "var(--sp-3)" }}>
          {rightSlot}
        </div>
      )}
    </div>
  );
}
