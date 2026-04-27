import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { PALETTE as C, ELEVATION } from "../tokens/palette";
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
            position: "fixed",
            inset: 0,
            zIndex,
            background: "rgba(23,26,28,0.26)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--sp-4)",
          }}
        >
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 18 }}
            transition={SPRING}
            onClick={(event) => event.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth,
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 18,
              boxShadow: ELEVATION.panel,
              padding: 0,
              overflow: "hidden",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${accent}00 0%, ${accent} 30%, ${C.blueHi} 50%, ${accent} 70%, ${accent}00 100%)`,
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                padding: "20px 22px 16px",
                borderBottom: `1px solid ${C.border}`,
                position: "relative",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: C.text,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.15,
                  }}
                >
                  {title}
                </div>
                {subtitle && (
                  <div
                    style={{
                      fontSize: "var(--fs-caption)",
                      color: C.textMuted,
                      marginTop: 6,
                      lineHeight: 1.5,
                    }}
                  >
                    {subtitle}
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                aria-label="Cerrar"
                style={{
                  background: C.bgDeep,
                  border: `1px solid ${C.border}`,
                  borderRadius: "var(--radius-md)",
                  color: C.textMuted,
                  padding: 6,
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

            <div style={{ padding: "20px 22px" }}>
              {children}
            </div>

            {footer && (
              <div
                style={{
                  display: "flex",
                  gap: "var(--sp-2)",
                  justifyContent: "flex-end",
                  padding: "14px 22px 18px",
                  borderTop: `1px solid ${C.border}`,
                  background: C.bgDeep,
                }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
