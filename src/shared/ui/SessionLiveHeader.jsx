/**
 * @component SessionLiveHeader
 * @description Banner broadcast "EN VIVO" para sesiones de entrenamiento.
 * Punto live pulsante, timer, KPIs compactos (Presentes / RPE / Carga),
 * top sweep, corner-accents. Reemplaza headers de sesión activa.
 *
 * Props:
 *  title         {string}  Título de la sesión (default: "SESIÓN ACTIVA")
 *  subtitle      {string}  Coach/categoría/hora
 *  isLive        {boolean} Muestra punto live pulsante (default: true)
 *  kpis          {Array<{label, value, unit?, accent?}>}  Máx 4
 *  rightSlot     {ReactNode}  Botones (pausar, finalizar, etc.)
 *  accent        {string}  default: PALETTE.blue
 *
 * @version 1.0 — Broadcast Arena
 */
import { motion } from "framer-motion";
import { PALETTE as C, ELEVATION, BROADCAST_GRADIENT } from "../tokens/palette";

const SPRING = { type: "spring", stiffness: 360, damping: 28 };

export default function SessionLiveHeader({
  title = "SESIÓN ACTIVA",
  subtitle,
  isLive = true,
  kpis = [],
  rightSlot,
  accent = C.blue,
  className = "",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      className={className}
      style={{
        position: "relative",
        background: BROADCAST_GRADIENT.statAccent,
        border: `1px solid ${C.borderHi}`,
        borderRadius: 12,
        boxShadow: ELEVATION.stat,
        overflow: "hidden",
      }}
    >
      {/* Top sweep */}
      <span style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: isLive
          ? `linear-gradient(90deg, ${C.danger}00 0%, ${C.danger} 18%, ${C.dangerHi || C.danger} 50%, ${C.danger} 82%, ${C.danger}00 100%)`
          : `linear-gradient(90deg, ${accent}00 0%, ${accent} 20%, ${C.blueHi} 50%, ${accent} 80%, ${accent}00 100%)`,
      }} />
      {/* Hairline */}
      <span style={{
        position: "absolute", top: 3, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0) 100%)",
        pointerEvents: "none",
      }} />

      {/* Corner accents */}
      <CornerMark pos="tl" color={accent} />
      <CornerMark pos="tr" color={accent} />

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 22px 16px",
        gap: 18,
        flexWrap: "wrap",
      }}>
        {/* Left: LIVE + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          {isLive && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "5px 12px",
              background: C.dangerDim,
              border: `1px solid ${C.danger}66`,
              borderRadius: 999,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: C.danger,
                animation: "alttez-live 1.4s ease-in-out infinite",
              }} />
              <span style={{
                fontSize: 9,
                fontWeight: 900,
                color: C.text,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}>
                EN VIVO
              </span>
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 15,
              fontWeight: 900,
              color: C.text,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {title}
            </div>
            {subtitle && (
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginTop: 4,
              }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Right slot */}
        {rightSlot && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {rightSlot}
          </div>
        )}
      </div>

      {/* KPI strip */}
      {kpis.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(kpis.length, 4)}, 1fr)`,
          gap: 0,
          borderTop: `1px solid ${C.borderHi}`,
          background: "rgba(245,241,234,0.72)",
        }}>
          {kpis.slice(0, 4).map((k, i) => (
            <div
              key={i}
              style={{
                padding: "12px 14px",
                borderRight: i < Math.min(kpis.length, 4) - 1 ? `1px solid ${C.border}` : "none",
                textAlign: "center",
                position: "relative",
              }}
            >
              <div style={{
                fontSize: 8.5,
                fontWeight: 800,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 5,
              }}>
                {k.label}
              </div>
              <div style={{
                fontSize: 22,
                fontWeight: 900,
                color: k.accent || C.text,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.5px",
              }}>
                {k.value}
                {k.unit && (
                  <span style={{ fontSize: 11, marginLeft: 2, color: C.textHint, fontWeight: 700 }}>
                    {k.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function CornerMark({ pos, color }) {
  const base = { position: "absolute", width: 10, height: 10, pointerEvents: "none", opacity: 0.85 };
  const map = {
    tl: { top: 10, left: 10, borderTop: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}` },
    tr: { top: 10, right: 10, borderTop: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}` },
  };
  return <span style={{ ...base, ...map[pos] }} />;
}
