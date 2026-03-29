/**
 * @component UpdateToast
 * @description Toast persistente para notificar nueva versión del Service Worker.
 * Aparece cuando el SW detecta una actualización disponible.
 * El botón "Actualizar" envía el mensaje SKIP_WAITING al SW y recarga la página.
 *
 * Uso:
 *   1. Renderizar <UpdateToast /> en el root de la app.
 *   2. Desde el registro del SW, disparar el evento global:
 *      window.dispatchEvent(new CustomEvent("sw-update-available", { detail: { registration } }))
 *
 * @author @Andres (UI) — PWA Sprint
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PALETTE as C } from "../../constants/palette";

// ── Animation variants ───────────────────────────────────────────────────────

const toastVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.97,
    transition: { duration: 0.18, ease: "easeIn" },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 340, damping: 28 },
  },
  exit: {
    opacity: 0,
    y: 16,
    scale: 0.96,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// ── Update icon ───────────────────────────────────────────────────────────────

function UpdateIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 3v5h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 16h5v5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function UpdateToast() {
  const [visible, setVisible] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const handler = (/** @type {CustomEvent} */ e) => {
      setRegistration(e.detail?.registration ?? null);
      setVisible(true);
    };
    window.addEventListener("sw-update-available", handler);
    return () => window.removeEventListener("sw-update-available", handler);
  }, []);

  const handleUpdate = useCallback(() => {
    setUpdating(true);

    if (registration?.waiting) {
      // Tell the waiting SW to take control immediately
      registration.waiting.postMessage({ type: "SKIP_WAITING" });

      // Once the SW has taken control, reload
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    } else {
      // Fallback: just reload — browser will pick up the new SW on next load
      window.location.reload();
    }
  }, [registration]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="update-toast"
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="alert"
          aria-live="assertive"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9500,
            width: "calc(100vw - 32px)",
            maxWidth: 400,
            background: "rgba(10,10,20,0.97)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: `1px solid ${C.purple}44`,
            borderLeft: `3px solid ${C.purple}`,
            borderRadius: 12,
            boxShadow: `0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04), 0 0 24px rgba(127,119,221,0.12)`,
            overflow: "hidden",
          }}
        >
          {/* Top shimmer line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 3, // align with border-left offset
              right: 0,
              height: 1,
              background: `linear-gradient(90deg, ${C.purple}88, transparent)`,
            }}
          />

          <div
            style={{
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* Icon container */}
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: `${C.purple}18`,
                border: `1px solid ${C.purple}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: C.purple,
                flexShrink: 0,
              }}
            >
              <UpdateIcon />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "white",
                  letterSpacing: "-0.1px",
                  lineHeight: 1.2,
                }}
              >
                Nueva version disponible
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
                  marginTop: 2,
                  lineHeight: 1.4,
                }}
              >
                Recarga para aplicar las mejoras
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {/* Dismiss */}
              <button
                onClick={handleDismiss}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 17,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  minHeight: "auto",
                }}
                aria-label="Ignorar actualización"
              >
                ×
              </button>

              {/* Update CTA */}
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: `0 0 18px ${C.purple}60` }}
                whileTap={{ scale: 0.96 }}
                onClick={handleUpdate}
                disabled={updating}
                style={{
                  padding: "0 14px",
                  height: 32,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  background: updating
                    ? `${C.purple}60`
                    : `linear-gradient(135deg, ${C.purple}, #5b21b6)`,
                  color: updating ? "rgba(255,255,255,0.5)" : "white",
                  border: "none",
                  borderRadius: 7,
                  cursor: updating ? "not-allowed" : "pointer",
                  fontFamily: "'Barlow', Arial, sans-serif",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  minHeight: "auto",
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                {updating ? (
                  <>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        border: "1.5px solid rgba(255,255,255,0.4)",
                        borderTop: "1.5px solid white",
                        animation: "elv-spin 0.7s linear infinite",
                        display: "inline-block",
                      }}
                    />
                    Actualizando
                  </>
                ) : (
                  "Actualizar"
                )}
              </motion.button>
            </div>
          </div>

          {/* Inject spin keyframe (project pattern) */}
          <style>{`@keyframes elv-spin{to{transform:rotate(360deg)}}`}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
