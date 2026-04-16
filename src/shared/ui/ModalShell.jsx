/**
 * @component ModalShell
 * @description Contenedor modal reutilizable con AnimatePresence + spring.
 * Reemplaza la estructura overlay+panel duplicada en AddAthleteModal,
 * CreateEventModal y otros modales del CRM.
 *
 * Props:
 *  open      {boolean}
 *  onClose   {function}
 *  title     {string}
 *  subtitle  {string}   (opcional)
 *  accent    {string}   Color del border-top (default: PALETTE.neon)
 *  maxWidth  {number}   Ancho máximo en px (default: 520)
 *  footer    {ReactNode} Botones de acción en el pie (opcional)
 *  zIndex    {number}   (default: 9000)
 */
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { PALETTE as C } from "../tokens/palette";

const SPRING = { type: "spring", stiffness: 320, damping: 28 };

export default function ModalShell({
  open,
  onClose,
  title,
  subtitle,
  accent = C.neon,
  maxWidth = 520,
  footer,
  zIndex = 9000,
  children,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex,
            background: "rgba(0,0,0,0.72)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "var(--sp-4)",
          }}
        >
          <motion.div
            key="modal-panel"
            className="glass-panel modal-shell"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={SPRING}
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth,
              borderTop: `3px solid ${accent}`,
              padding: 0,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              padding: "var(--sp-4) var(--sp-5) var(--sp-3)",
              borderBottom: `1px solid ${C.border}`,
            }}>
              <div>
                <div style={{
                  fontSize: "var(--fs-title-sm)",
                  fontWeight: "var(--fw-ultra)",
                  color: "white",
                  textTransform: "uppercase",
                  letterSpacing: "var(--ls-caps-sm)",
                }}>
                  {title}
                </div>
                {subtitle && (
                  <div style={{
                    fontSize: "var(--fs-caption)",
                    color: C.textMuted,
                    marginTop: 3,
                  }}>
                    {subtitle}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "var(--radius-md)",
                  color: C.textMuted,
                  padding: "var(--sp-1)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  minHeight: "unset",
                  flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "var(--sp-5)" }}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div style={{
                display: "flex",
                gap: "var(--sp-2)",
                justifyContent: "flex-end",
                padding: "var(--sp-3) var(--sp-5) var(--sp-4)",
                borderTop: `1px solid ${C.border}`,
              }}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
