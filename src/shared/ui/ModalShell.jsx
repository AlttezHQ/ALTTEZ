/**
 * @component ModalShell
 * @description Panel broadcast con elevación profunda, bisel superior,
 * corner-accents en el header y barra de acento con sweep.
 * Reemplaza la estructura overlay+panel duplicada en modales del CRM.
 *
 * Props:
 *  open      {boolean}
 *  onClose   {function}
 *  title     {string}
 *  subtitle  {string}   (opcional)
 *  accent    {string}   Color del sweep superior (default: PALETTE.blue)
 *  maxWidth  {number}   Ancho máximo en px (default: 520)
 *  footer    {ReactNode} Pie con acciones (opcional)
 *  zIndex    {number}   (default: 9000)
 *
 * @version 2.0 — Broadcast Arena
 */
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { PALETTE as C, ELEVATION, BROADCAST_GRADIENT } from "../tokens/palette";
import { SPRING as SPRINGS } from "../tokens/motion";

const SPRING = SPRINGS.snappy;

export default function ModalShell({
  open,
  onClose,
  title,
  subtitle,
  accent = C.blue,
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
            background: "rgba(0,0,0,0.78)",
            backdropFilter: "blur(10px) saturate(120%)",
            WebkitBackdropFilter: "blur(10px) saturate(120%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "var(--sp-4)",
          }}
        >
          <motion.div
            key="modal-panel"
            className="modal-shell"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={SPRING}
            onClick={e => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth,
              background: BROADCAST_GRADIENT.stat,
              border: `1px solid ${C.borderHi}`,
              borderRadius: 12,
              boxShadow: ELEVATION.panel,
              padding: 0,
              overflow: "hidden",
            }}
          >
            {/* Barra de acento superior con sweep */}
            <span style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 3,
              background: `linear-gradient(90deg, ${accent}00 0%, ${accent} 20%, ${C.blueHi} 50%, ${accent} 80%, ${accent}00 100%)`,
              boxShadow: `0 0 14px ${accent}88`,
            }} />
            {/* Bisel — hairline superior */}
            <span style={{
              position: "absolute", top: 3, left: 0, right: 0, height: 1,
              background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0) 100%)",
              pointerEvents: "none",
            }} />

            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              padding: "18px 22px 14px",
              borderBottom: `1px solid ${C.borderHi}`,
              position: "relative",
            }}>
              {/* Corner-accent superior izquierdo */}
              <span style={{
                position: "absolute", top: 10, left: 12,
                width: 6, height: 6,
                borderTop: `1.5px solid ${accent}`,
                borderLeft: `1.5px solid ${accent}`,
                opacity: 0.8,
              }} />
              <div style={{ paddingLeft: 8 }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: "white",
                  textTransform: "uppercase",
                  letterSpacing: "2.5px",
                  fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
                }}>
                  {title}
                </div>
                {subtitle && (
                  <div style={{
                    fontSize: "var(--fs-caption)",
                    color: C.textMuted,
                    marginTop: 6,
                    letterSpacing: "0.3px",
                  }}>
                    {subtitle}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "var(--radius-md)",
                  color: C.textMuted,
                  padding: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  minHeight: "unset",
                  flexShrink: 0,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                  transition: "color 0.15s ease, background 0.15s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.background = "rgba(239,68,68,0.12)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = C.textMuted;
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 22px" }}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div style={{
                display: "flex",
                gap: "var(--sp-2)",
                justifyContent: "flex-end",
                padding: "14px 22px 18px",
                borderTop: `1px solid ${C.borderHi}`,
                background: "rgba(4,6,16,0.4)",
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
