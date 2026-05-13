import { motion } from "framer-motion";
import { PALETTE } from "../../../../shared/tokens/palette";

const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";

export default function AlttezLoader({ text = "Cargando...", fullScreen = false }) {
  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        fontFamily: FONT,
      }}
    >
      <div style={{ position: "relative", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Glowing ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: "50%",
            border: `2px solid transparent`,
            borderTopColor: PALETTE.bronce,
            borderRightColor: PALETTE.bronceDim,
            opacity: 0.5,
          }}
        />
        {/* Alttez Symbol */}
        <motion.img
          src="/branding/alttez-symbol-transparent.png"
          alt="Alttez Loading"
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 48,
            height: 48,
            objectFit: "contain",
            filter: "drop-shadow(0 4px 12px rgba(201, 151, 58, 0.2))"
          }}
        />
      </div>
      {text && (
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: PALETTE.bronce,
            letterSpacing: "0.04em",
          }}
        >
          {text}
        </motion.span>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(250, 250, 248, 0.85)", // PALETTE.bg with opacity
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 0", display: "flex", justifyContent: "center", width: "100%" }}>
      {content}
    </div>
  );
}
