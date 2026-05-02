/**
 * @component StatBlockDual
 * @description Comparativa broadcast Home vs Away con barra proporcional central.
 * Úsalo para posesión, tiros, pases, duelos, distancia, etc.
 *
 * Props:
 *  label     {string}  Nombre de la métrica (uppercase)
 *  home      {number|string}
 *  away      {number|string}
 *  unit      {string}  "%", "km", "" ...
 *  accent    {string}  color del bar del lado home (default: PALETTE.bronce)
 *  accentAway{string}  color del bar del lado away (default: PALETTE.bronceHi)
 *  size      {"sm"|"md"}  default "md"
 *
 * @version 1.0 — Broadcast Arena
 */
import { motion } from "framer-motion";
import { PALETTE as C, ELEVATION, BROADCAST_GRADIENT } from "../tokens/palette";

const SPRING = { type: "spring", stiffness: 380, damping: 28 };

export default function StatBlockDual({
  label = "STAT",
  home = 0,
  away = 0,
  unit = "",
  accent = C.blue,
  accentAway = C.blueHi,
  size = "md",
  className = "",
}) {
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const hv = num(home);
  const av = num(away);
  const total = hv + av || 1;
  const hPct = Math.max(4, Math.round((hv / total) * 100));
  const aPct = 100 - hPct;

  const SZ = size === "sm"
    ? { valFs: 22, labFs: 8.5, pad: "10px 14px", bar: 4 }
    : { valFs: 28, labFs: 9.5, pad: "14px 18px", bar: 6 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      className={className}
      style={{
        position: "relative",
        background: BROADCAST_GRADIENT.stat,
        border: `1px solid ${C.borderHi}`,
        borderRadius: 10,
        boxShadow: ELEVATION.stat,
        padding: SZ.pad,
        overflow: "hidden",
      }}
    >
      {/* Top sweep */}
      <span style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${accent}00 0%, ${accent} 30%, ${C.blueHi} 50%, ${accentAway} 70%, ${accentAway}00 100%)`,
        opacity: 0.9,
      }} />
      {/* Hairline */}
      <span style={{
        position: "absolute", top: 2, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 100%)",
        pointerEvents: "none",
      }} />

      {/* Label centered */}
      <div style={{
        fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
        fontSize: SZ.labFs,
        fontWeight: 800,
        color: C.textMuted,
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: "3px",
        marginBottom: 8,
      }}>
        {label}
      </div>

      {/* Values row */}
      <div style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 8,
      }}>
        <div style={{
          fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
          fontSize: SZ.valFs,
          fontWeight: 900,
          color: "white",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          textShadow: `0 0 16px ${accent}55`,
          letterSpacing: "-0.5px",
        }}>
          {home}{unit && <span style={{ fontSize: SZ.valFs * 0.42, marginLeft: 2, color: C.textHint }}>{unit}</span>}
        </div>
        <div style={{
          fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
          fontSize: SZ.valFs,
          fontWeight: 900,
          color: "white",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          textShadow: `0 0 16px ${accentAway}55`,
          letterSpacing: "-0.5px",
        }}>
          {away}{unit && <span style={{ fontSize: SZ.valFs * 0.42, marginLeft: 2, color: C.textHint }}>{unit}</span>}
        </div>
      </div>

      {/* Proportional bar */}
      <div style={{
        position: "relative",
        width: "100%",
        height: SZ.bar,
        borderRadius: SZ.bar / 2,
        background: "rgba(0,0,0,0.45)",
        overflow: "hidden",
        border: `1px solid ${C.border}`,
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${hPct}%` }}
          transition={{ type: "spring", stiffness: 220, damping: 30, delay: 0.05 }}
          style={{
            position: "absolute", top: 0, left: 0, bottom: 0,
            background: `linear-gradient(90deg, ${accent} 0%, ${C.blueHi} 100%)`,
            boxShadow: `0 0 10px ${accent}88`,
          }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${aPct}%` }}
          transition={{ type: "spring", stiffness: 220, damping: 30, delay: 0.05 }}
          style={{
            position: "absolute", top: 0, right: 0, bottom: 0,
            background: `linear-gradient(270deg, ${accentAway} 0%, ${C.blueHi} 100%)`,
            opacity: 0.55,
          }}
        />
        {/* Center divider */}
        <span style={{
          position: "absolute",
          top: -2, bottom: -2,
          left: `${hPct}%`,
          width: 2,
          background: "white",
          boxShadow: `0 0 8px ${C.blueGlow}`,
          transform: "translateX(-50%)",
        }} />
      </div>
    </motion.div>
  );
}
