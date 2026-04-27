import { PALETTE as C, ELEVATION } from "../../shared/tokens/palette";

const LOGO_URL = "/branding/alttez-symbol-transparent.png";

export function MiniTopbar({
  title,
  accent = C.blue,
  mode,
  clubName,
  clubCategory,
  onHomeClick,
}) {
  return (
    <div
      style={{
        minHeight: 64,
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: `1px solid ${C.border}`,
        boxShadow: ELEVATION.card,
        display: "flex",
        alignItems: "stretch",
        flexShrink: 0,
        position: "relative",
        flexWrap: "wrap",
      }}
    >
      <div
        onClick={onHomeClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 18px",
          cursor: "pointer",
          borderRight: `1px solid ${C.border}`,
          flexShrink: 0,
          minHeight: 64,
        }}
        title="Volver al dashboard"
      >
        <img
          src={LOGO_URL}
          alt="ALTTEZ"
          style={{ height: 22, width: "auto", display: "block" }}
          onError={(event) => { event.currentTarget.style.display = "none"; }}
        />
        <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "0.14em", color: C.text }}>
          ALTTEZ
        </span>
        <span style={{ fontSize: 11, color: C.textMuted, paddingLeft: 10, borderLeft: `1px solid ${C.border}` }}>
          Home
        </span>
      </div>

      <div
        style={{
          padding: "0 22px",
          display: "flex",
          alignItems: "center",
          position: "relative",
          flexShrink: 0,
          minHeight: 64,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: "-0.01em" }}>
          {title}
        </span>
        <span
          style={{
            position: "absolute",
            bottom: 0,
            left: 16,
            right: 16,
            height: 3,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${accent}, ${C.blueHi})`,
          }}
        />
      </div>

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 18px",
          borderLeft: `1px solid ${C.border}`,
          minHeight: 64,
          flexWrap: "wrap",
        }}
      >
        {mode === "demo" && (
          <div
            style={{
              padding: "5px 10px",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              background: C.amberDim,
              color: C.amber,
              border: `1px solid ${C.amberBorder}`,
              borderRadius: 999,
            }}
          >
            Demo
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 12px",
            background: C.bgDeep,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: accent,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 13, color: C.text, fontWeight: 700 }}>
            {clubName || "Mi Club"}
          </span>
          <span style={{ fontSize: 12, color: C.textMuted, paddingLeft: 8, borderLeft: `1px solid ${C.border}` }}>
            {clubCategory || "General"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default MiniTopbar;
