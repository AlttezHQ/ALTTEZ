/**
 * @component KpiCard
 * @description Stat-card broadcast de ALTTEZ. Inspirado en overlays de transmisión
 * deportiva y cartas FUT: barra de acento superior con sweep, número XL en Orbitron,
 * label micro-uppercase con tracking ancho, delta chip tipo pill, corner-accents
 * angulares y luz direccional superior-izquierda.
 *
 * API estable (compat con usos previos):
 *  label     {string}
 *  value     {string|number}
 *  accent    {string}        color principal (default: C.blue)
 *  sparkData {number[]}      mini sparkline (max ~10 barras)
 *  trend     {number}        % positivo/negativo → delta chip
 *  onClick   {function}      hace la card clickeable
 */
import { motion } from "framer-motion";
import { PALETTE as C, ELEVATION, BROADCAST_GRADIENT } from "../tokens/palette";
import { SPRING as SPRINGS } from "../tokens/motion";

const SPRING = SPRINGS.snappy;

export default function KpiCard({ label, value, accent, sparkData, trend, onClick, className = "", style = {} }) {
  const isClickable = Boolean(onClick);
  const hue = accent || C.blue;
  const Tag = isClickable ? motion.div : "div";

  return (
    <Tag
      className={className}
      onClick={onClick}
      {...(isClickable ? {
        whileHover: { y: -2 },
        whileTap:   { y: 0, scale: 0.995 },
        transition: SPRING,
      } : {})}
      style={{
        position: "relative",
        padding: "18px 18px 16px",
        background: BROADCAST_GRADIENT.stat,
        border: `1px solid ${C.borderHi}`,
        borderRadius: 16,
        boxShadow: ELEVATION.stat,
        cursor: isClickable ? "pointer" : "default",
        overflow: "hidden",
        transition: "box-shadow 0.22s ease, border-color 0.22s ease",
        ...style,
      }}
      onMouseEnter={isClickable ? e => {
        e.currentTarget.style.boxShadow = ELEVATION.statHi;
        e.currentTarget.style.borderColor = C.blueBorder;
      } : undefined}
      onMouseLeave={isClickable ? e => {
        e.currentTarget.style.boxShadow = ELEVATION.stat;
        e.currentTarget.style.borderColor = C.borderHi;
      } : undefined}
    >
      {/* Barra de acento superior con sweep (3px) */}
      <span style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${hue}00 0%, ${hue} 25%, ${C.blueHi} 50%, ${hue} 75%, ${hue}00 100%)`,
      }} />

      {/* Bisel superior — hairline de luz */}
      <span style={{
        position: "absolute", top: 2, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)",
        pointerEvents: "none",
      }} />

      {/* Corner-accents — marcas angulares tipo HUD broadcast */}
      <CornerMark corner="tl" color={hue} />
      <CornerMark corner="br" color={hue} />

      {/* Label */}
      <div style={{
        fontSize: 9,
        fontWeight: 700,
        color: C.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        marginBottom: 10,
      }}>
        {label}
      </div>

      {/* Valor principal */}
      <div style={{
        fontSize: 34,
        fontWeight: 900,
        color: C.text,
        lineHeight: 1.02,
        letterSpacing: "-1.2px",
        marginBottom: sparkData || trend != null ? 10 : 0,
        display: "flex",
        alignItems: "baseline",
        gap: 8,
      }}>
        <span>{value}</span>
      </div>

      {/* Footer: sparkline + trend delta */}
      {(sparkData?.length > 0 || trend != null) && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}>
          {sparkData?.length > 0 ? <MiniSparkBars data={sparkData} color={hue} /> : <span />}
          {trend != null && <DeltaChip trend={trend} />}
        </div>
      )}
    </Tag>
  );
}

// ── Delta chip (pill con gradient suave según signo) ──
function DeltaChip({ trend }) {
  const up = trend >= 0;
  const color = up ? C.success : C.danger;
  const bg   = up ? C.successDim : C.dangerDim;
  const brd  = up ? C.successBorder : C.dangerBorder;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "4px 8px",
      fontSize: 10,
      fontWeight: 700,
      color,
      background: bg,
      border: `1px solid ${brd}`,
      borderRadius: 999,
      letterSpacing: "0.03em",
    }}>
      <span style={{ fontSize: 8, lineHeight: 1 }}>{up ? "▲" : "▼"}</span>
      {Math.abs(trend)}%
    </span>
  );
}

// ── Corner-accent (marca angular en esquinas) ──
function CornerMark({ corner, color }) {
  const base = { position: "absolute", width: 8, height: 8, pointerEvents: "none", opacity: 0.7 };
  const map = {
    tl: { top: 6,  left: 6,  borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` },
    tr: { top: 6,  right: 6, borderTop: `1px solid ${color}`, borderRight:`1px solid ${color}` },
    bl: { bottom: 6, left: 6, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` },
    br: { bottom: 6, right:6, borderBottom: `1px solid ${color}`, borderRight:`1px solid ${color}` },
  };
  return <span style={{ ...base, ...map[corner] }} />;
}

function MiniSparkBars({ data, color }) {
  const max = Math.max(...data, 1);
  const barWidth = 5;
  const gap = 2;
  const height = 22;
  const width = data.length * (barWidth + gap) - gap;

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`spark-${color.replace(/[^a-z0-9]/gi,"")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.45" />
        </linearGradient>
      </defs>
      {data.map((v, i) => {
        const barH = Math.max(2, (v / max) * height);
        return (
          <rect
            key={i}
            x={i * (barWidth + gap)}
            y={height - barH}
            width={barWidth}
            height={barH}
            rx={1}
            fill={`url(#spark-${color.replace(/[^a-z0-9]/gi,"")})`}
            opacity={0.55 + (i / data.length) * 0.45}
          />
        );
      })}
    </svg>
  );
}
