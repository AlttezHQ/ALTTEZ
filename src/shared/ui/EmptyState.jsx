/**
 * @component EmptyState
 * @description Reusable empty state panel with glow icon, title, subtitle, and optional CTA(s).
 * Designed for ALTTEZ dark UI — charcoal bg, neon-to-violet gradient CTA.
 *
 * @props
 * - icon        {ReactNode}          SVG or emoji icon (rendered at 48-64px visual scale)
 * - title       {string}             Primary heading (white)
 * - subtitle    {string}             Secondary copy (muted gray)
 * - actionLabel {string}             Label for the primary CTA button (optional)
 * - onAction    {() => void}         Primary CTA handler (optional)
 * - secondaryLabel {string}          Label for a secondary CTA button (optional)
 * - onSecondary {() => void}         Secondary CTA handler (optional)
 * - compact     {boolean}            Reduced padding for tight containers
 *
 * @palette  Charcoal bg, #8B5CF6 violet glow, neon→violet gradient CTA
 * @version  1.0
 */

import { motion } from "framer-motion";

// ── Animation variants ───────────────────────────────────────────────────────
const containerVariant = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 26, staggerChildren: 0.08 },
  },
};

const childVariant = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
};

const iconPulse = {
  animate: {
    scale: [1, 1.04, 1],
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
      }}
    >
      {/* Icon with violet glow ring */}
      {icon && (
        <motion.div
          variants={childVariant}
          {...iconPulse}
          style={{
            width: compact ? 56 : 72,
            height: compact ? 56 : 72,
            borderRadius: "50%",
            background: "rgba(139,92,246,0.10)",
            border: "1px solid rgba(139,92,246,0.28)",
            boxShadow: "0 0 28px rgba(139,92,246,0.22), 0 0 8px rgba(139,92,246,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: compact ? 16 : 22,
            fontSize: compact ? 26 : 32,
            flexShrink: 0,
          }}
        >
          {icon}
        </motion.div>
      )}

      {/* Title */}
      <motion.div
        variants={childVariant}
        style={{
          fontSize: compact ? 14 : 16,
          fontWeight: 700,
          color: "white",
          letterSpacing: "-0.3px",
          marginBottom: 8,
          lineHeight: 1.3,
          maxWidth: 320,
        }}
      >
        {title}
      </motion.div>

      {/* Subtitle */}
      {subtitle && (
        <motion.div
          variants={childVariant}
          style={{
            fontSize: compact ? 11 : 12,
            color: "rgba(255,255,255,0.42)",
            lineHeight: 1.6,
            maxWidth: 300,
            marginBottom: (actionLabel || secondaryLabel) ? (compact ? 20 : 28) : 0,
          }}
        >
          {subtitle}
        </motion.div>
      )}

      {/* CTA buttons */}
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
          {/* Primary CTA — neon→violet gradient */}
          {actionLabel && onAction && (
            <motion.button
              onClick={onAction}
              whileHover={{ scale: 1.04, boxShadow: "0 0 18px rgba(139,92,246,0.45)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                padding: compact ? "8px 18px" : "10px 22px",
                background: "linear-gradient(135deg, #c8ff00 0%, #8B5CF6 100%)",
                border: "none",
                borderRadius: 6,
                fontSize: compact ? 10 : 11,
                fontWeight: 700,
                color: "#0a0a0a",
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                cursor: "pointer",
                fontFamily: "inherit",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
              }}
            >
              {actionLabel}
            </motion.button>
          )}

          {/* Secondary CTA — ghost outline with violet tint */}
          {secondaryLabel && onSecondary && (
            <motion.button
              onClick={onSecondary}
              whileHover={{ scale: 1.03, borderColor: "rgba(139,92,246,0.6)", color: "white" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                padding: compact ? "8px 18px" : "10px 22px",
                background: "transparent",
                border: "1px solid rgba(139,92,246,0.35)",
                borderRadius: 6,
                fontSize: compact ? 10 : 11,
                fontWeight: 600,
                color: "rgba(139,92,246,0.85)",
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                cursor: "pointer",
                fontFamily: "inherit",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                transition: "border-color 180ms, color 180ms",
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
