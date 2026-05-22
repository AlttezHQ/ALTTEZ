import { motion } from "framer-motion";
import { PALETTE } from "../../tokens/palette";

const PAGE_BG = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `
    radial-gradient(circle at 15% 15%, var(--color-bronce-dim), transparent 30%),
    radial-gradient(circle at 85% 85%, rgba(216,154,43,0.08), transparent 30%),
    var(--color-bg)
  `,
  padding: "40px 24px",
  position: "relative",
  overflow: "hidden",
};

const GRID = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  backgroundImage: "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
  backgroundSize: "64px 64px",
  maskImage: "radial-gradient(circle at center, rgba(0,0,0,0.6) 0%, transparent 80%)",
  WebkitMaskImage: "radial-gradient(circle at center, rgba(0,0,0,0.6) 0%, transparent 80%)",
};

/**
 * @component AuthShell
 * @description Contenedor base para todas las pantallas de autenticación (Login, Registro, Recuperación).
 * Incluye el fondo con gradiente editorial y la grilla sutil de ALTTEZ.
 */
export default function AuthShell({ children, maxWidth = 1240 }) {
  return (
    <div style={PAGE_BG}>
      <div style={GRID} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ width: "100%", maxWidth, position: "relative", zIndex: 2 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
