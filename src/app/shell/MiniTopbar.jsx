/**
 * @component MiniTopbar
 * @description Topbar broadcast del CRM — identidad ALTTEZ con presencia de marca,
 * beam de módulo activo y chip de club tipo HUD de transmisión.
 *
 * @version 2.0 — Broadcast Arena
 */

import { PALETTE as C, BROADCAST_GRADIENT, ELEVATION } from "../../shared/tokens/palette";

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
        height: 48,
        background: BROADCAST_GRADIENT.topbar,
        backdropFilter: "blur(24px) saturate(140%)",
        WebkitBackdropFilter: "blur(24px) saturate(140%)",
        borderBottom: `1px solid ${C.borderHi}`,
        boxShadow: ELEVATION.card,
        display: "flex",
        alignItems: "stretch",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {/* Seam superior — hairline luz */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, rgba(255,255,255,0) 100%)",
        pointerEvents: "none",
      }} />

      {/* Brand: logo ALTTEZ + back — presencia estratégica */}
      <div
        onClick={onHomeClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 16px 0 18px",
          cursor: "pointer",
          borderRight: `1px solid ${C.borderHi}`,
          transition: "background 0.15s",
          flexShrink: 0,
          position: "relative",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(47,107,255,0.06)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        title="Volver al dashboard"
      >
        <img
          src={LOGO_URL}
          alt="ALTTEZ"
          style={{
            height: 22,
            width: "auto",
            display: "block",
            filter: "drop-shadow(0 0 8px rgba(47,107,255,0.35))",
          }}
          onError={e => { e.currentTarget.style.display = "none"; }}
        />
        <span style={{
          fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "3px",
          color: "white",
          textTransform: "uppercase",
        }}>
          ALTTEZ
        </span>
        <span style={{
          fontSize: 9,
          color: C.textMuted,
          textTransform: "uppercase",
          letterSpacing: "2px",
          paddingLeft: 10,
          borderLeft: `1px solid ${C.borderHi}`,
          marginLeft: 2,
        }}>
          ← Home
        </span>
      </div>

      {/* Módulo activo — beam inferior + corner accent */}
      <div
        style={{
          padding: "0 22px",
          display: "flex",
          alignItems: "center",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Corner accent superior izquierdo */}
        <span style={{
          position: "absolute", top: 8, left: 10,
          width: 6, height: 6,
          borderTop: `2px solid ${accent}`,
          borderLeft: `2px solid ${accent}`,
          opacity: 0.9,
        }} />
        <span style={{
          fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "3px",
          color: "white",
        }}>
          {title}
        </span>
        {/* Beam activo */}
        <span style={{
          position: "absolute", bottom: 0, left: 16, right: 16,
          height: 2,
          background: `linear-gradient(90deg, ${accent} 0%, ${C.blueHi} 50%, ${accent} 100%)`,
          boxShadow: `0 0 12px ${accent}88`,
        }} />
      </div>

      {/* Right: club HUD + demo badge */}
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 18px",
          borderLeft: `1px solid ${C.borderHi}`,
        }}
      >
        {mode === "demo" && (
          <div
            style={{
              padding: "3px 9px",
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              background: `${C.amber}1A`,
              color: C.amber,
              border: `1px solid ${C.amberBorder}`,
              borderRadius: 4,
              fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
            }}
          >
            Demo
          </div>
        )}

        {/* Club HUD chip — live dot + nombre + categoría */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 12px",
          background: "rgba(47,107,255,0.06)",
          border: `1px solid ${C.blueBorder}`,
          borderRadius: 4,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}>
          <span
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: C.blue,
              boxShadow: `0 0 8px ${C.blueGlow}, 0 0 0 2px rgba(47,107,255,0.18)`,
              flexShrink: 0,
              animation: "alttez-live 1.8s ease-in-out infinite",
            }}
          />
          <span style={{
            fontSize: 10,
            color: "white",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            fontWeight: 600,
            fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
          }}>
            {clubName || "Mi Club"}
          </span>
          <span style={{
            fontSize: 9,
            color: C.textMuted,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            paddingLeft: 8,
            borderLeft: `1px solid ${C.borderHi}`,
          }}>
            {clubCategory || "General"}
          </span>
        </div>
      </div>

      {/* Live-dot keyframes (inyectadas una vez; CSS global ya tiene otras) */}
      <style>{`
        @keyframes alttez-live {
          0%,100% { opacity: 1; transform: scale(1); }
          50%     { opacity: 0.55; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}

export default MiniTopbar;
