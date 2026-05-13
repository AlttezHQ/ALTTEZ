import { motion } from "framer-motion";
import { PALETTE } from "../../tokens/palette";

const PAGE_BG = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `
    radial-gradient(circle at 12% 12%, rgba(201,151,58,0.08), transparent 24%),
    radial-gradient(circle at 88% 18%, rgba(201,151,58,0.10), transparent 22%),
    linear-gradient(180deg, #F6F1EA 0%, #FDFDFB 100%)
  `,
  padding: "40px 24px",
  position: "relative",
  overflow: "hidden",
};

const GRID = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  backgroundImage: "linear-gradient(rgba(23,26,28,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(23,26,28,0.018) 1px, transparent 1px)",
  backgroundSize: "60px 60px",
  maskImage: "linear-gradient(180deg, rgba(0,0,0,0.52), transparent 92%)",
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
