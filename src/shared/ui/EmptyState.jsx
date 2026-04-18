/**
 * @component EmptyState
 * @description Estado vacío como momento de marca ALTTEZ:
 * anillo broadcast con corner-accents alrededor del icono, tipografía Orbitron,
 * CTAs primary/ghost con bisel. Convierte pantallas vacías en presencia de marca.
 *
 * @props
 * - icon            {ReactNode}   SVG o emoji (escala 48-64px)
 * - title           {string}      Heading primario (blanco, Orbitron)
 * - subtitle        {string}      Copy secundario (muted)
 * - actionLabel     {string}      Label del CTA principal (opcional)
 * - onAction        {() => void}  Handler del CTA principal (opcional)
 * - secondaryLabel  {string}      Label del CTA secundario (opcional)
 * - onSecondary     {() => void}  Handler del CTA secundario (opcional)
 * - compact         {boolean}     Padding reducido
 *
 * @version  2.0 — Broadcast Arena
 */

import { motion } from "framer-motion";
import { PALETTE as C } from "../tokens/palette";

// ── Animation variants ───────────────────────────────────────────────────────
const containerVariant = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 28, staggerChildren: 0.08 },
  },
};

const childVariant = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 28 },
  },
};

const iconPulse = {
  animate: {
    scale: [1, 1.03, 1],
    transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
  },
};

// ── Component ────────────────────────────────────────────────────────────────
export default function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  compact = false,
}) {
  const py = compact ? "32px" : "56px";
  const ringSize = compact ? 68 : 88;

  return (
    <motion.div
      variants={containerVariant}
      initial="initial"
      animate="animate"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: `${py} 24px`,
        textAlign: "center",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Icon broadcast — anillo con corner-accents */}
      {icon && (
        <motion.div
          variants={childVariant}
          style={{
            position: "relative",
            width: ringSize,
            height: ringSize,
            marginBottom: compact ? 18 : 26,
            flexShrink: 0,
          }}
        >
          {/* Corner-accents alrededor del anillo */}
          <CornerAccent pos="tl" color={C.blue} />
          <CornerAccent pos="tr" color={C.blue} />
          <CornerAccent pos="bl" color={C.blue} />
          <CornerAccent pos="br" color={C.blue} />

          <motion.div
            {...iconPulse}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: `radial-gradient(circle at 30% 30%, ${C.blueDim} 0%, rgba(6,8,14,0.8) 70%)`,
              border: `1px solid ${C.blueBorder}`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 32px ${C.blueGlow}, 0 0 0 1px rgba(47,107,255,0.10)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: compact ? 28 : 34,
            }}
          >
            {icon}
          </motion.div>
        </motion.div>
      )}

      {/* Title — Orbitron */}
      <motion.div
        variants={childVariant}
        style={{
          fontSize: compact ? 14 : 17,
          fontWeight: 900,
          color: "white",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
          marginBottom: 10,
          lineHeight: 1.2,
          maxWidth: 360,
          textShadow: `0 0 20px ${C.blueGlow}`,
        }}
      >
        {title}
      </motion.div>

      {/* Subtitle */}
      {subtitle && (
        <motion.div
          variants={childVariant}
          style={{
            fontSize: compact ? 11 : 12.5,
            color: C.textMuted,
            lineHeight: 1.65,
            maxWidth: 320,
            letterSpacing: "0.2px",
            marginBottom: (actionLabel || secondaryLabel) ? (compact ? 20 : 28) : 0,
          }}
        >
          {subtitle}
        </motion.div>
      )}

      {/* CTAs */}
      {(actionLabel || secondaryLabel) && (
        <motion.div
          variants={childVariant}
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {/* Primary — broadcast bevel */}
          {actionLabel && onAction && (
            <motion.button
              onClick={onAction}
              whileHover={{ y: -1, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.28), 0 10px 28px ${C.blueGlow}` }}
              whileTap={{ scale: 0.97, y: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              style={{
                padding: compact ? "10px 20px" : "12px 26px",
                background: `linear-gradient(180deg, ${C.blue} 0%, ${C.blue} 60%, ${C.blueDeep} 100%)`,
                border: `1px solid ${C.blue}`,
                borderRadius: 6,
                fontSize: compact ? 10 : 11,
                fontWeight: 800,
                color: "white",
                textTransform: "uppercase",
                letterSpacing: "1.4px",
                cursor: "pointer",
                fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.18), 0 6px 18px ${C.blueGlow}`,
                textShadow: "0 1px 0 rgba(0,0,0,0.2)",
              }}
            >
              {actionLabel}
            </motion.button>
          )}

          {/* Secondary — ghost */}
          {secondaryLabel && onSecondary && (
            <motion.button
              onClick={onSecondary}
              whileHover={{ y: -1, borderColor: `${C.blue}88`, backgroundColor: "rgba(47,107,255,0.08)" }}
              whileTap={{ scale: 0.97, y: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              style={{
                padding: compact ? "10px 20px" : "12px 26px",
                background: "transparent",
                border: `1px solid ${C.blueBorder}`,
                borderRadius: 6,
                fontSize: compact ? 10 : 11,
                fontWeight: 700,
                color: C.blueHi,
                textTransform: "uppercase",
                letterSpacing: "1.4px",
                cursor: "pointer",
                fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {secondaryLabel}
            </motion.button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

function CornerAccent({ pos, color }) {
  const base = { position: "absolute", width: 10, height: 10, opacity: 0.85 };
  const map = {
    tl: { top: -6,    left: -6,   borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` },
    tr: { top: -6,    right: -6,  borderTop: `2px solid ${color}`, borderRight:`2px solid ${color}` },
    bl: { bottom: -6, left: -6,   borderBottom:`2px solid ${color}`, borderLeft: `2px solid ${color}` },
    br: { bottom: -6, right: -6,  borderBottom:`2px solid ${color}`, borderRight:`2px solid ${color}` },
  };
  return <span style={{ ...base, ...map[pos] }} />;
}
