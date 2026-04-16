/**
 * @component KpiCard
 * @description Tarjeta de métrica KPI. Reemplaza el patrón css.kpi() y
 * glassmorphism+border-top+valor en Administracion, Reportes y Entrenamiento.
 *
 * Props:
 *  label      {string}   Etiqueta uppercase
 *  value      {string|number}  Valor principal
 *  accent     {string}   Color del border-top y del valor
 *  sparkData  {number[]} Datos para mini sparkline (opcional, max 10 barras)
 *  trend      {number}   Número positivo/negativo para indicador de tendencia
 *  onClick    {function} Si se provee, la tarjeta es clickeable
 */
import { motion } from "framer-motion";
import GlassPanel from "./GlassPanel";

const SPRING = { type: "spring", stiffness: 320, damping: 28 };

export default function KpiCard({ label, value, accent, sparkData, trend, onClick, className = "", style = {} }) {
  const isClickable = Boolean(onClick);

  return (
    <GlassPanel
      accent={accent}
      padding="md"
      as={isClickable ? motion.div : "div"}
      className={className}
      style={{
        cursor: isClickable ? "pointer" : "default",
        ...style,
      }}
      onClick={onClick}
      {...(isClickable ? {
        whileHover: { scale: 1.02, boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 16px ${accent}33` },
        whileTap:   { scale: 0.99 },
        transition: SPRING,
      } : {})}
    >
      {/* Label */}
      <div className="section-label" style={{ marginBottom: "var(--sp-2)" }}>
        {label}
      </div>

      {/* Valor principal */}
      <div style={{
        fontSize: "var(--fs-kpi-md)",
        fontWeight: "var(--fw-ultra)",
        color: accent ?? "white",
        lineHeight: 1.1,
        letterSpacing: "var(--ls-tight)",
        fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
        marginBottom: sparkData || trend != null ? "var(--sp-2)" : 0,
      }}>
        {value}
      </div>

      {/* Sparkline */}
      {sparkData?.length > 0 && (
        <MiniSparkBars data={sparkData} color={accent} />
      )}

      {/* Tendencia */}
      {trend != null && (
        <div style={{
          fontSize: "var(--fs-caption)",
          color: trend >= 0 ? "var(--color-green)" : "var(--color-danger)",
          marginTop: "var(--sp-1)",
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
        </div>
      )}
    </GlassPanel>
  );
}

function MiniSparkBars({ data, color }) {
  const max = Math.max(...data, 1);
  const barWidth = 6;
  const gap = 2;
  const height = 24;
  const width = data.length * (barWidth + gap) - gap;

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
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
            fill={color ?? "rgba(255,255,255,0.3)"}
            opacity={0.7 + (i / data.length) * 0.3}
          />
        );
      })}
    </svg>
  );
}
