/**
 * @component MiniTopbar
 * @description Topbar del CRM — dark premium, alineado con identidad ALTTEZ.
 */

import { PALETTE as C } from "../../shared/tokens/palette";

export function MiniTopbar({
  title,
  accent = C.neon,
  accentBg = "rgba(200,255,0,0.04)",
  mode,
  clubName,
  clubCategory,
  onHomeClick,
}) {
  return (
    <div
      style={{
        height: 40,
        background: "rgba(3,5,10,0.94)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: `1px solid rgba(255,255,255,0.05)`,
        boxShadow: `0 1px 0 ${accent}22, 0 4px 20px rgba(0,0,0,0.5)`,
        display: "flex",
        alignItems: "stretch",
        flexShrink: 0,
      }}
    >
      {/* Back link */}
      <div
        onClick={onHomeClick}
        style={{
          padding: "0 18px",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "2px",
          color: C.textMuted,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          borderRight: `1px solid ${C.border}`,
          transition: "color 0.15s, background 0.15s",
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = "white";
          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = C.textMuted;
          e.currentTarget.style.background = "transparent";
        }}
      >
        ← Dashboard
      </div>

      {/* Current module */}
      <div
        style={{
          padding: "0 18px",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "2px",
          color: "white",
          display: "flex",
          alignItems: "center",
          borderBottom: `2px solid ${accent}`,
          background: accentBg,
          flexShrink: 0,
        }}
      >
        {title}
      </div>

      {/* Right: club info + demo badge */}
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 18px",
          borderLeft: `1px solid ${C.border}`,
        }}
      >
        {mode === "demo" && (
          <div
            style={{
              padding: "2px 8px",
              fontSize: 8,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              background: `${C.amber}22`,
              color: C.amber,
              border: `1px solid ${C.amber}44`,
              borderRadius: 4,
            }}
          >
            Demo
          </div>
        )}
        <div
          style={{
            fontSize: 10,
            color: C.textMuted,
            textTransform: "uppercase",
            letterSpacing: "1px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: accent,
              display: "inline-block",
              boxShadow: `0 0 6px ${accent}88`,
              flexShrink: 0,
            }}
          />
          {clubName || "Mi Club"} · {clubCategory || "General"}
        </div>
      </div>
    </div>
  );
}

export default MiniTopbar;
