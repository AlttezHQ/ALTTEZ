import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PALETTE as C } from "../tokens/palette";

const toastVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97, transition: { duration: 0.18, ease: "easeIn" } },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 340, damping: 28 } },
  exit: { opacity: 0, y: 16, scale: 0.96, transition: { duration: 0.2, ease: "easeIn" } },
};

function UpdateIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16M16 16h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function UpdateToast() {
  const [visible, setVisible] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const handler = (event) => {
      setRegistration(event.detail?.registration ?? null);
      setVisible(true);
    };
    window.addEventListener("sw-update-available", handler);
    return () => window.removeEventListener("sw-update-available", handler);
  }, []);

  const handleUpdate = useCallback(() => {
    setUpdating(true);
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload());
    } else {
      window.location.reload();
    }
  }, [registration]);

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
            maxWidth: 420,
            background: "rgba(255,252,247,0.98)",
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            boxShadow: "0 20px 42px rgba(23,26,28,0.14)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: C.blueDim, border: `1px solid ${C.blueBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.blue, flexShrink: 0 }}>
              <UpdateIcon />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>
                Nueva version disponible
              </div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2, lineHeight: 1.4 }}>
                Recarga para aplicar las mejoras.
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button
                onClick={() => setVisible(false)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: C.bgDeep,
                  border: `1px solid ${C.border}`,
                  color: C.textMuted,
                  fontSize: 17,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  minHeight: "auto",
                }}
                aria-label="Ignorar actualizacion"
              >
                ×
              </button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 12px 24px rgba(206, 137, 70,0.18)" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleUpdate}
                disabled={updating}
                style={{
                  padding: "0 14px",
                  height: 32,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  background: updating ? C.blueBorder : `linear-gradient(135deg, ${C.blue}, ${C.blueDeep})`,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  cursor: updating ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  minHeight: "auto",
                }}
              >
                {updating ? "Actualizando..." : "Actualizar"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
