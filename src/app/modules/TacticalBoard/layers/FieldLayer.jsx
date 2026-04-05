/**
 * @component FieldLayer
 * @description Capa 1 de la pizarra táctica v9 — LANDSCAPE redesign.
 * Campo horizontal con proporciones reales FIFA (105m x 68m = 1.54:1).
 * Vista cenital plana, sin perspectiva 3D — como pizarra magnética profesional.
 *
 * @prop {React.Ref}  ref      - Ref al contenedor del campo (para drag calculations)
 * @prop {"full"|"half"} viewMode - "full" = campo completo | "half" = media cancha ofensiva
 * @prop {React.ReactNode} children - Capas superiores (jugadores, dibujos)
 */

"use client";

import { memo, forwardRef } from "react";
import { motion } from "framer-motion";

// Inyectar estilos globales una sola vez
if (typeof document !== "undefined" && !document.getElementById("fl-landscape-styles")) {
  const s = document.createElement("style");
  s.id = "fl-landscape-styles";
  s.textContent = `
    .fl-field-wrap {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      cursor: crosshair;
    }
  `;
  document.head.appendChild(s);
}

/**
 * Punto pulsante — centro del campo y puntos de penalti.
 * viewBox landscape: cx/cy en coordenadas 105x68.
 */
const PulsingDot = memo(function PulsingDot({ cx, cy, r = 0.8 }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.72)" filter="url(#dotGlow)" />
      <motion.circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.2"
        initial={{ r: r, opacity: 0.3 }}
        animate={{ r: r + 2.8, opacity: 0 }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeOut", repeatDelay: 0.5 }}
      />
    </g>
  );
});

/**
 * SVG de líneas del campo LANDSCAPE.
 * viewBox "0 0 105 68" — proporciones reales FIFA (105m x 68m).
 * GK rival (izquierda), GK propio (derecha).
 *
 * @prop {"full"|"half"} viewMode
 */
const FieldLines = memo(function FieldLines({ viewMode = "full" }) {
  const lineStyle = {
    stroke: "rgba(255,255,255,0.92)",
    strokeWidth: "0.50",
    fill: "none",
  };
  const thinLine = {
    stroke: "rgba(255,255,255,0.60)",
    strokeWidth: "0.32",
    fill: "none",
  };
  const goalNet = {
    fill: "rgba(255,255,255,0.04)",
    stroke: "rgba(255,255,255,0.30)",
    strokeWidth: "0.28",
  };

  const isHalf = viewMode === "half";

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        /* Sin drop-shadow excesivo — líneas TV limpias */
      }}
      viewBox={isHalf ? "52.5 0 52.5 68" : "0 0 105 68"}
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Área de portería: tono ligeramente diferente de césped (desgaste) */}
        <filter id="goalkeeperAreaTint">
          <feColorMatrix type="saturate" values="0.6" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="0.95" />
            <feFuncG type="linear" slope="1.05" />
            <feFuncB type="linear" slope="0.85" />
          </feComponentTransfer>
        </filter>
      </defs>

      {/* ── Sombra interna del borde del campo (desgaste perimetral muy sutil) ── */}
      {!isHalf && (
        <rect x="2" y="2" width="101" height="64" fill="none"
          stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
      )}
      {isHalf && (
        <rect x="52.5" y="2" width="50.5" height="64" fill="none"
          stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
      )}

      {/* ── Borde exterior ── */}
      {isHalf ? (
        <rect x="52.5" y="2" width="50.5" height="64" {...lineStyle} />
      ) : (
        <rect x="2" y="2" width="101" height="64" {...lineStyle} />
      )}

      {/* ── Línea de medio campo (solo en full) ── */}
      {!isHalf && (
        <>
          <line x1="52.5" y1="2" x2="52.5" y2="66" {...lineStyle} />
          {/* Círculo central */}
          <circle cx="52.5" cy="34" r="9.15" {...lineStyle} />
          <PulsingDot cx={52.5} cy={34} r={0.7} />
        </>
      )}

      {/* ── Área grande izquierda (rival) ──
          En campo real: 40.32m desde la línea de fondo × 16.5m de profundidad
          En viewBox 105x68: x=2, ancho=16.5, y=13.84 h=40.32 */}
      {!isHalf && (
        <>
          <rect x="2" y="13.84" width="16.5" height="40.32" {...lineStyle} />
          {/* Área pequeña rival */}
          <rect x="2" y="24.84" width="5.5" height="18.32" {...thinLine} />
          {/* Punto de penalti rival (11m desde la línea) */}
          <PulsingDot cx={13} cy={34} r={0.55} />
          {/* Arco de penalti rival */}
          <path d="M 18.5 27 A 10.02 10.02 0 0 0 18.5 41" {...thinLine} />
          {/* Portería rival (izquierda) */}
          <rect x="-2.44" y="29.68" width="2.44" height="8.64" {...{ ...goalNet }} />
        </>
      )}

      {/* ── Área grande derecha (propia) — siempre visible ── */}
      <rect x="86.5" y="13.84" width="16.5" height="40.32" {...lineStyle} />
      {/* Área pequeña propia */}
      <rect x="97.5" y="24.84" width="5.5" height="18.32" {...thinLine} />
      {/* Punto de penalti propio */}
      <PulsingDot cx={92} cy={34} r={0.55} />
      {/* Arco de penalti propio */}
      <path d="M 86.5 27 A 10.02 10.02 0 0 1 86.5 41" {...thinLine} />
      {/* Portería propia (derecha) */}
      <rect x="103" y="29.68" width="2.44" height="8.64" {...{ ...goalNet }} />

      {/* ── Línea de medio campo en vista half (límite izquierdo del área) ── */}
      {isHalf && (
        <line x1="52.5" y1="2" x2="52.5" y2="66" {...thinLine} strokeDasharray="2 2" />
      )}

      {/* ── Esquinas (solo en full) ── */}
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

/**
 * @component FieldLayer — landscape, sin perspectiva 3D
 */
const FieldLayer = forwardRef(function FieldLayer({ children, viewMode = "full" }, ref) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        minWidth: 0,
        position: "relative",
        padding: "6px 8px",
        background: "#0d1117",
      }}
    >
      {/* Campo centrado con aspect ratio 105:68 (1.544) */}
      <div
        ref={ref}
        className="fl-field-wrap"
        style={{
          flex: 1,
          position: "relative",
          // Textura de césped LANDSCAPE — broadcast TV quality
          // Capa 1: franjas de segado con contraste real (~10% luminosidad)
          //         verde oscuro #166325, verde claro #1e8030 — diferencia visible como TV
          // Capa 2: iluminación cenital muy sutil (estadio con focos)
          // Capa 3: viñeta perimetral MUY sutil — solo en los extremos
          // Capa 4: base de color verde real #1a6b2a
          background: `
            repeating-linear-gradient(
              90deg,
              transparent               0%,
              transparent               6.25%,
              rgba(0,0,0,0.13)          6.25%,
              rgba(0,0,0,0.13)          12.5%
            ),
            radial-gradient(
              ellipse 60% 70% at 50% 50%,
              rgba(255,255,255,0.04) 0%,
              transparent            70%
            ),
            radial-gradient(
              ellipse 120% 120% at 50% 50%,
              transparent            60%,
              rgba(0,0,0,0.22)       100%
            ),
            linear-gradient(
              180deg,
              #1a6b2a 0%,
              #1e8030 50%,
              #1a6b2a 100%
            )
          `,
          boxShadow: `
            inset 0 0 0 2px rgba(255,255,255,0.08)
          `,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <FieldLines viewMode={viewMode} />
        {children}
      </div>
    </div>
  );
});

export default FieldLayer;
