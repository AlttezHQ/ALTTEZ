import { motion } from "framer-motion";
import { PALETTE as C } from "../tokens/palette";

const containerVariant = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 28, staggerChildren: 0.06 },
  },
};

const childVariant = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
};

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
  const py = compact ? "28px" : "48px";
  const ringSize = compact ? 68 : 84;

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
      {icon && (
        <motion.div
          variants={childVariant}
          style={{
            width: ringSize,
            height: ringSize,
            marginBottom: compact ? 18 : 24,
            borderRadius: 20,
            background: C.bgDeep,
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 24px rgba(23,26,28,0.06)",
            fontSize: compact ? 28 : 34,
          }}
        >
          {icon}
        </motion.div>
      )}

      <motion.div
        variants={childVariant}
        style={{
          fontSize: compact ? 18 : 22,
          fontWeight: 800,
          color: C.text,
          letterSpacing: "-0.02em",
          marginBottom: 10,
          lineHeight: 1.2,
          maxWidth: 460,
        }}
      >
        {title}
      </motion.div>

      {subtitle && (
        <motion.div
          variants={childVariant}
          style={{
            fontSize: compact ? 13 : 15,
            color: C.textMuted,
            lineHeight: 1.65,
            maxWidth: 420,
            marginBottom: (actionLabel || secondaryLabel) ? (compact ? 18 : 26) : 0,
          }}
        >
          {subtitle}
        </motion.div>
      )}

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
          {actionLabel && onAction && (
            <motion.button
              onClick={onAction}
              whileHover={{ y: -1, boxShadow: "0 14px 28px rgba(201,151,58,0.24)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              style={{
                padding: compact ? "11px 18px" : "13px 24px",
                background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDeep} 100%)`,
                border: `1px solid ${C.blue}`,
                borderRadius: 12,
                fontSize: compact ? 12 : 13,
                fontWeight: 700,
                color: "white",
                letterSpacing: "0.06em",
                cursor: "pointer",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                boxShadow: "0 10px 24px rgba(201,151,58,0.18)",
              }}
            >
              {actionLabel}
            </motion.button>
          )}

          {secondaryLabel && onSecondary && (
            <motion.button
              onClick={onSecondary}
              whileHover={{ y: -1, borderColor: `${C.blue}`, color: `${C.blue}` }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              style={{
                padding: compact ? "11px 18px" : "13px 24px",
                background: "#FFFFFF",
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                fontSize: compact ? 12 : 13,
                fontWeight: 700,
                color: C.text,
                letterSpacing: "0.04em",
                cursor: "pointer",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
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
