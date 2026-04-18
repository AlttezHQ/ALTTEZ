/**
 * @component FieldLayer v2.0 — Broadcast Arena
 * @description Superficie táctica premium — aspecto match-analysis broadcast,
 * no cancha verde genérica. Paleta deep teal desaturado + líneas tape-white con
 * glow sutil, viñeta de estadio, grid de zonas tácticas, chrome broadcast (top sweep,
 * corner-accents). Sin 3D, vista cenital — superficie de análisis.
 *
 * @prop {React.Ref}  ref
 * @prop {"full"|"half"} viewMode
 * @prop {React.ReactNode} children
 *
 * @version 2.0 — premium broadcast surface
 */

"use client";

import { memo, forwardRef } from "react";
import { motion } from "framer-motion";
import { PALETTE as C } from "../../../../shared/tokens/palette";

// Inyectar estilos globales una sola vez
if (typeof document !== "undefined" && !document.getElementById("fl-landscape-styles-v2")) {
  const s = document.createElement("style");
  s.id = "fl-landscape-styles-v2";
  s.textContent = `
    .fl-field-wrap {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      cursor: crosshair;
    }
    @keyframes fl-center-pulse {
      0%,100% { opacity: 0.28; transform: scale(1); }
      50%     { opacity: 0.06; transform: scale(1.8); }
    }
  `;
  document.head.appendChild(s);
}

const PulsingDot = memo(function PulsingDot({ cx, cy, r = 0.8 }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.85)" filter="url(#dotGlow)" />
      <motion.circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.18"
        initial={{ r: r, opacity: 0.3 }}
        animate={{ r: r + 2.6, opacity: 0 }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeOut", repeatDelay: 0.4 }}
      />
    </g>
  );
});

/**
 * SVG de líneas tape-white con glow broadcast.
 * viewBox landscape 105x68 (proporciones reales FIFA).
 */
const FieldLines = memo(function FieldLines({ viewMode = "full" }) {
  const LINE_COLOR = "rgba(255,255,255,0.88)";
  const LINE_THIN = "rgba(255,255,255,0.58)";

  const lineStyle = { stroke: LINE_COLOR, strokeWidth: "0.38", fill: "none" };
  const thinLine  = { stroke: LINE_THIN,  strokeWidth: "0.28", fill: "none" };
  const goalNet   = { fill: "rgba(255,255,255,0.05)", stroke: "rgba(255,255,255,0.45)", strokeWidth: "0.30" };

  const isHalf = viewMode === "half";

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        filter: "drop-shadow(0 0 0.35px rgba(255,255,255,0.55))",
      }}
      viewBox={isHalf ? "52.5 0 52.5 68" : "0 0 105 68"}
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="0.35" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Zones subtle fill */}
        <linearGradient id="zoneShade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(47,107,255,0.03)" />
          <stop offset="100%" stopColor="rgba(47,107,255,0)" />
        </linearGradient>
      </defs>

      {/* ── Tactical zones (tercios + carriles) — solo full ── */}
      {!isHalf && (
        <>
          {/* Tercios verticales (defensivo / medio / ofensivo) */}
          <line x1="37" y1="2" x2="37" y2="66" stroke="rgba(255,255,255,0.06)" strokeWidth="0.18" strokeDasharray="0.8 1.2" />
          <line x1="68" y1="2" x2="68" y2="66" stroke="rgba(255,255,255,0.06)" strokeWidth="0.18" strokeDasharray="0.8 1.2" />
          {/* Carriles horizontales (banda / interior / centro) */}
          <line x1="2" y1="22.67" x2="103" y2="22.67" stroke="rgba(255,255,255,0.05)" strokeWidth="0.16" strokeDasharray="0.8 1.4" />
          <line x1="2" y1="45.33" x2="103" y2="45.33" stroke="rgba(255,255,255,0.05)" strokeWidth="0.16" strokeDasharray="0.8 1.4" />
        </>
      )}

      {/* ── Borde exterior ── */}
      {isHalf ? (
        <rect x="52.5" y="2" width="50.5" height="64" {...lineStyle} />
      ) : (
        <rect x="2" y="2" width="101" height="64" {...lineStyle} />
      )}

      {/* ── Línea de medio campo + círculo central ── */}
      {!isHalf && (
        <>
          <line x1="52.5" y1="2" x2="52.5" y2="66" {...lineStyle} />
          <circle cx="52.5" cy="34" r="9.15" {...lineStyle} />
          <circle cx="52.5" cy="34" r="9.15" fill="url(#zoneShade)" />
          <PulsingDot cx={52.5} cy={34} r={0.7} />
        </>
      )}

      {/* ── Área grande izquierda (rival) ── */}
      {!isHalf && (
        <>
          <rect x="2" y="13.84" width="16.5" height="40.32" {...lineStyle} />
          <rect x="2" y="13.84" width="16.5" height="40.32" fill="rgba(47,107,255,0.025)" />
          <rect x="2" y="24.84" width="5.5" height="18.32" {...thinLine} />
          <PulsingDot cx={13} cy={34} r={0.55} />
          <path d="M 18.5 27 A 10.02 10.02 0 0 0 18.5 41" {...thinLine} />
          <rect x="-2.44" y="29.68" width="2.44" height="8.64" {...goalNet} />
        </>
      )}

      {/* ── Área grande derecha (propia) — siempre visible ── */}
      <rect x="86.5" y="13.84" width="16.5" height="40.32" {...lineStyle} />
      <rect x="86.5" y="13.84" width="16.5" height="40.32" fill="rgba(47,107,255,0.035)" />
      <rect x="97.5" y="24.84" width="5.5" height="18.32" {...thinLine} />
      <PulsingDot cx={92} cy={34} r={0.55} />
      <path d="M 86.5 27 A 10.02 10.02 0 0 1 86.5 41" {...thinLine} />
      <rect x="103" y="29.68" width="2.44" height="8.64" {...goalNet} />

      {/* Half-view divider dashed */}
      {isHalf && (
        <line x1="52.5" y1="2" x2="52.5" y2="66" {...thinLine} strokeDasharray="2 2" />
      )}

      {/* ── Esquinas ── */}
      {!isHalf && (
        <>
          <path d="M 2 5.5 A 3.5 3.5 0 0 1 5.5 2"   {...thinLine} />
          <path d="M 99.5 2 A 3.5 3.5 0 0 1 103 5.5"  {...thinLine} />
          <path d="M 103 62.5 A 3.5 3.5 0 0 1 99.5 66" {...thinLine} />
          <path d="M 5.5 66 A 3.5 3.5 0 0 1 2 62.5"  {...thinLine} />
        </>
      )}
    </svg>
  );
});

/** Corner brackets broadcast — enmarcan el pitch */
function PitchCornerBrackets() {
  const col = C.blue;
  const size = 16;
  const th = 1.5;
  const common = { position: "absolute", width: size, height: size, pointerEvents: "none", zIndex: 2 };
  return (
    <>
      <span style={{ ...common, top: 8, left: 8,     borderTop: `${th}px solid ${col}`, borderLeft: `${th}px solid ${col}`, boxShadow: `0 0 10px ${C.blueGlow}` }} />
      <span style={{ ...common, top: 8, right: 8,    borderTop: `${th}px solid ${col}`, borderRight: `${th}px solid ${col}`, boxShadow: `0 0 10px ${C.blueGlow}` }} />
      <span style={{ ...common, bottom: 8, left: 8,  borderBottom: `${th}px solid ${col}`, borderLeft: `${th}px solid ${col}`, boxShadow: `0 0 10px ${C.blueGlow}` }} />
      <span style={{ ...common, bottom: 8, right: 8, borderBottom: `${th}px solid ${col}`, borderRight: `${th}px solid ${col}`, boxShadow: `0 0 10px ${C.blueGlow}` }} />
    </>
  );
}

/** Compass/orientation tag (top-right) — broadcast HUD detail */
function AttackDirectionTag() {
  return (
    <div style={{
      position: "absolute",
      top: 16, right: 32,
      display: "flex", alignItems: "center", gap: 6,
      padding: "4px 10px",
      background: "rgba(4,6,16,0.6)",
      border: `1px solid ${C.blueBorder}`,
      borderRadius: 999,
      pointerEvents: "none",
      zIndex: 3,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 12px ${C.blueGlow}`,
    }}>
      <span style={{
        fontSize: 8, fontWeight: 800,
        color: C.blueHi,
        letterSpacing: "2px",
        textTransform: "uppercase",
        fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
      }}>
        Ataque
      </span>
      <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
        <path d="M0 4 L11 4 M7 1 L11 4 L7 7" stroke={C.blueHi} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/**
 * @component FieldLayer — premium broadcast pitch
 */
const FieldLayer = forwardRef(function FieldLayer({ children, viewMode = "full" }, ref) {
  const aspect = viewMode === "half" ? "52.5 / 68" : "105 / 68";
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 0,
        minWidth: 0,
        position: "relative",
        padding: "14px 18px",
        background: `
          radial-gradient(ellipse 80% 100% at 50% 50%, rgba(47,107,255,0.06) 0%, transparent 60%),
          linear-gradient(180deg, #060913 0%, #040611 100%)
        `,
      }}
    >
      {/* Outer frame — aspect-ratio lock (FIFA real proportions) */}
      <div style={{
        position: "relative",
        aspectRatio: aspect,
        maxWidth: "100%",
        maxHeight: "100%",
        width: "auto",
        height: "100%",
        borderRadius: 10,
        background: "rgba(4,6,16,0.6)",
        border: `1px solid ${C.borderHi}`,
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.05),
          0 20px 60px rgba(0,0,0,0.7),
          0 0 0 1px rgba(47,107,255,0.08)
        `,
        padding: 6,
        overflow: "hidden",
      }}>
        {/* Top sweep broadcast */}
        <span style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${C.blue}00 0%, ${C.blue} 25%, ${C.blueHi} 50%, ${C.blue} 75%, ${C.blue}00 100%)`,
          boxShadow: `0 0 14px ${C.blueGlow}`,
          zIndex: 4,
        }} />

        <PitchCornerBrackets />
        {viewMode === "full" && <AttackDirectionTag />}

        {/* Pitch surface — deep teal desaturado */}
        <div
          ref={ref}
          className="fl-field-wrap"
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            // Capa 1: franjas de segado muy sutiles (no saturadas)
            // Capa 2: luz cenital centrada
            // Capa 3: viñeta perimetral fuerte
            // Capa 4: base deep teal navy (no verde brillante)
            background: `
              repeating-linear-gradient(
                90deg,
                transparent               0%,
                transparent               6.25%,
                rgba(0,0,0,0.10)          6.25%,
                rgba(0,0,0,0.10)          12.5%
              ),
              radial-gradient(
                ellipse 55% 65% at 50% 45%,
                rgba(255,255,255,0.05) 0%,
                transparent            70%
              ),
              radial-gradient(
                ellipse 140% 140% at 50% 50%,
                transparent            40%,
                rgba(0,0,0,0.55)       100%
              ),
              linear-gradient(
                180deg,
                #102a1f 0%,
                #133728 45%,
                #0d2219 100%
              )
            `,
            boxShadow: `
              inset 0 0 0 1px rgba(255,255,255,0.06),
              inset 0 0 80px rgba(0,0,0,0.55)
            `,
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          {/* Noise/grain layer sutil — broadcast TV */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            opacity: 0.035, mixBlendMode: "overlay",
            background: `
              repeating-conic-gradient(from 0deg at 50% 50%,
                rgba(255,255,255,0.3) 0deg,
                transparent 1deg,
                transparent 2deg
              )
            `,
          }} />

          <FieldLines viewMode={viewMode} />
          {children}
        </div>
      </div>
    </div>
  );
});

export default FieldLayer;
