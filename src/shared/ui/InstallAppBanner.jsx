/**
 * @component InstallAppBanner
 * @description CTA "Instalar App" con lógica PWA diferenciada:
 *   - Android/Chrome: trigger nativo beforeinstallprompt
 *   - iOS Safari: modal con instrucciones paso a paso
 *   - Oculto si ya instalado (standalone) o dismissado (7 días)
 *
 * Estilo: glassmorphism, gradiente neon/violeta, ícono de descarga.
 * Animaciones: Framer Motion spring con peso físico.
 *
 * @prop {boolean} [compact=false] — versión compacta para navbar/footer
 * @author @Andres (UI) — PWA Sprint
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInstallPWA } from "../hooks/useInstallPWA";
import { PALETTE as C } from "../tokens/palette";

// ── Animation variants ───────────────────────────────────────────────────────

const bannerVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 28, delay: 1.2 },
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.96,
    transition: { duration: 0.22, ease: "easeIn" },
  },
};

const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const modalPanelVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 360, damping: 30 },
  },
  exit: {
    opacity: 0,
    y: 24,
    scale: 0.97,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const stepVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 340, damping: 28, delay: 0.1 + i * 0.08 },
  }),
};

// ── iOS Step data ────────────────────────────────────────────────────────────

const IOS_STEPS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M8.684 4.684A4.5 4.5 0 0 1 12 3a4.5 4.5 0 0 1 3.316 1.684M12 3v9m0 0-3-3m3 3 3-3"
          stroke={C.blueIce}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="3" y="14" width="18" height="7" rx="2" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4" />
        <path d="M7 17.5h2m3 0h4" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    label: "Toca el ícono de Compartir",
    hint: "El botón del cuadro con flecha hacia arriba, en la barra inferior de Safari.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="3" stroke={C.blueDeep} strokeWidth="1.5" />
        <path d="M12 8v8M8 12h8" stroke={C.blueDeep} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    label: "Selecciona \"Agregar a pantalla de inicio\"",
    hint: "Desplaza hacia abajo en la hoja de compartir hasta encontrar la opción.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 12l2 2 4-4"
          stroke="#c8ff00"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="9" stroke="#c8ff00" strokeWidth="1.4" />
      </svg>
    ),
    label: "Confirma tocando \"Agregar\"",
    hint: "ALTTEZ aparecerá en tu pantalla de inicio como una app nativa.",
  },
];

// ── iOS Modal ────────────────────────────────────────────────────────────────

function IOSInstructionsModal({ onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        key="ios-backdrop"
        variants={modalBackdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 9000,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          padding: "0 16px 32px",
        }}
      >
        <motion.div
          key="ios-panel"
          variants={modalPanelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 420,
            background: "rgba(14,14,24,0.98)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px 20px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${C.blueIce}, ${C.blueDeep})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#0a0a0f",
                  flexShrink: 0,
                  boxShadow: "0 0 20px rgba(0,255,136,0.35)",
                }}
              >
                E
              </div>
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "white",
                    letterSpacing: "-0.2px",
                  }}
                >
                  Instalar ALTTEZ
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                  Instrucciones para iPhone y iPad
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                minHeight: "auto",
              }}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          {/* Steps */}
          <div style={{ padding: "16px 20px 20px" }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "rgba(255,255,255,0.25)",
                marginBottom: 14,
              }}
            >
              Sigue estos 3 pasos
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {IOS_STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {step.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "white",
                        letterSpacing: "-0.1px",
                        marginBottom: 3,
                      }}
                    >
                      {step.label}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.4)",
                        lineHeight: 1.5,
                      }}
                    >
                      {step.hint}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.35)",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div
            style={{
              padding: "12px 20px 20px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(206, 137, 70,0.05)",
                border: "1px solid rgba(206, 137, 70,0.15)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="#c8ff00" strokeWidth="1.4" />
                <path d="M12 8v4m0 4h.01" stroke="#c8ff00" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(206, 137, 70,0.8)",
                  lineHeight: 1.4,
                }}
              >
                Funciona sin conexión y recibe actualizaciones automáticas.
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Download icon ────────────────────────────────────────────────────────────

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M12 3v13M7 11l5 5 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 20h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {{ compact?: boolean }} props
 */
export default function InstallAppBanner({ compact = false }) {
  const { canInstall, isIOS, hasNativePrompt, prompt, dismiss } = useInstallPWA();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (!canInstall) return null;

  const handleInstallClick = () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else if (hasNativePrompt) {
      prompt();
    }
  };

  if (compact) {
    // Minimal pill for use inside navbar or footer
    return (
      <>
        <AnimatePresence>
          <motion.button
            key="install-pill"
            variants={bannerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover={{ scale: 1.05, boxShadow: "0 0 18px rgba(0,255,136,0.3)" }}
            whileTap={{ scale: 0.96 }}
            onClick={handleInstallClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.8px",
              background: `linear-gradient(135deg, rgba(0,255,136,0.12), ${C.violetDim})`,
              color: C.blueIce,
              border: "1px solid rgba(0,255,136,0.3)",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "'Barlow', Arial, sans-serif",
              minHeight: 36,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              whiteSpace: "nowrap",
            }}
            aria-label="Instalar ALTTEZ"
          >
            <DownloadIcon />
            Instalar App
          </motion.button>
        </AnimatePresence>
        {showIOSModal && <IOSInstructionsModal onClose={() => setShowIOSModal(false)} />}
      </>
    );
  }

  // Full floating banner — fixed bottom-right on desktop, bottom center on mobile
  return (
    <>
      <AnimatePresence>
        <motion.div
          key="install-banner"
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            position: "fixed",
            bottom: 24,
            right: 20,
            left: "auto",
            zIndex: 8000,
            maxWidth: 360,
            width: "calc(100vw - 40px)",
            background: "rgba(10,10,20,0.95)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(0,255,136,0.18)",
            borderRadius: 16,
            boxShadow:
              "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), 0 0 32px rgba(0,255,136,0.06)",
            overflow: "hidden",
          }}
        >
          {/* Gradient top accent line */}
          <div
            style={{
              height: 2,
              background: `linear-gradient(90deg, ${C.blueIce}, ${C.blueDeep})`,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
            }}
          />

          <div style={{ padding: "18px 18px 16px" }}>
            {/* Header row */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${C.blueIce}, ${C.blueDeep})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#0a0a0f",
                    flexShrink: 0,
                    boxShadow: "0 0 24px rgba(0,255,136,0.3)",
                  }}
                >
                  E
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "white",
                      letterSpacing: "-0.2px",
                      lineHeight: 1.2,
                    }}
                  >
                    Instalar ALTTEZ
                  </div>
                  <div
                    style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}
                  >
                    {isIOS
                      ? "Acceso rápido desde iPhone"
                      : "App completa, funciona sin conexión"}
                  </div>
                </div>
              </div>

              <button
                onClick={dismiss}
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
                  flexShrink: 0,
                  minHeight: "auto",
                }}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {/* Feature pills */}
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 14,
              }}
            >
              {["Sin conexion", "Notificaciones", "Acceso rapido"].map((feat) => (
                <span
                  key={feat}
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    borderRadius: 5,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  {feat}
                </span>
              ))}
            </div>

            {/* CTA button */}
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 24px rgba(0,255,136,0.35)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={handleInstallClick}
              style={{
                width: "100%",
                padding: "12px 0",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                background: `linear-gradient(135deg, ${C.blueIce}, ${C.blueDeep})`,
                color: "#0a0a0f",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "'Barlow', Arial, sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: 46,
              }}
            >
              <DownloadIcon />
              {isIOS ? "Ver instrucciones" : "Instalar ahora"}
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {showIOSModal && (
        <IOSInstructionsModal onClose={() => setShowIOSModal(false)} />
      )}
    </>
  );
}
