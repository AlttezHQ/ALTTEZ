import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEMO_DURATION_SEC = 15 * 60;
const DEMO_START_KEY = "alttez_demo_start";

function getOrInitDemoStart() {
  const stored = sessionStorage.getItem(DEMO_START_KEY);
  if (stored) {
    const ts = parseInt(stored, 10);
    if (!Number.isNaN(ts)) return ts;
  }
  const now = Date.now();
  sessionStorage.setItem(DEMO_START_KEY, String(now));
  return now;
}

function formatCountdown(seconds) {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.max(0, seconds) % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function ConversionModal({ onClose, onRegister }) {
  return (
    <motion.div
      key="demo-conversion-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(23,26,28,0.38)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 14 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#FFFCF7",
          border: "1px solid #E9E2D7",
          borderRadius: 24,
          padding: "34px 32px",
          boxShadow: "0 28px 70px rgba(23,26,28,0.18)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "auto -10% -35% auto",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,151,58,0.18) 0%, rgba(201,151,58,0) 72%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: 20,
            background: "#F4E7CF",
            border: "1px solid #E4C98C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 22px",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3l2.3 4.7 5.2.8-3.8 3.7.9 5.2-4.6-2.4-4.6 2.4.9-5.2-3.8-3.7 5.2-.8L12 3Z" stroke="#C9973A" strokeWidth="1.6" strokeLinejoin="round" fill="rgba(201,151,58,0.14)" />
          </svg>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "#B7832D" }}>
          DEMO EXPIRADO
        </div>
        <h2 style={{ margin: "12px 0 12px", fontSize: "clamp(24px, 4vw, 30px)", lineHeight: 1.08, color: "#171A1C" }}>
          Ya viste el potencial.
          <br />
          Ahora hazlo tuyo.
        </h2>
        <p style={{ margin: "0 auto 26px", maxWidth: 340, fontSize: 15, color: "#667085", lineHeight: 1.65 }}>
          Registra tu club en 2 minutos y accede a todas las funcionalidades con tus datos reales.
        </p>

        <div style={{ display: "grid", gap: 10, textAlign: "left", marginBottom: 28 }}>
          {[
            "Plantilla ilimitada",
            "Datos reales de tu club",
            "Sincronizacion en la nube",
            "Sin tarjeta de credito",
          ].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#F4E7CF", border: "1px solid #E4C98C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                  <path d="M1.5 4l1.8 1.8L6.5 2.7" stroke="#C9973A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontSize: 14, color: "#475467" }}>{item}</span>
            </div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 16px 34px rgba(201,151,58,0.24)" }}
          whileTap={{ scale: 0.98 }}
          onClick={onRegister}
          style={{
            width: "100%",
            padding: "14px 0",
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            background: "#C9973A",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            marginBottom: 10,
          }}
        >
          Registrar mi club
        </motion.button>

        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: 13,
            color: "#667085",
            cursor: "pointer",
            padding: "8px 16px",
            fontFamily: "inherit",
          }}
        >
          Continuar explorando el demo
        </button>
      </motion.div>
    </motion.div>
  );
}

function DemoBanner({ secondsLeft, onRegister, onClose, expired }) {
  const progress = Math.max(0, secondsLeft / DEMO_DURATION_SEC);

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 360, damping: 32, delay: 1.5 }}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "rgba(255,255,252,0.96)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderTop: `1px solid ${expired ? "#D8B16A" : "#E9E2D7"}`,
        boxShadow: "0 -12px 28px rgba(23,26,28,0.08)",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          padding: "5px 12px",
          fontSize: 10,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "2px",
          background: "#FFF8EB",
          color: "#B7832D",
          border: "1px solid #E4C98C",
          borderRadius: 999,
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        Modo Demo
      </div>

      <div
        className="demo-banner-progress"
        style={{
          flex: 1,
          height: 6,
          background: "#F3ECE1",
          borderRadius: 999,
          overflow: "hidden",
          display: "none",
        }}
      >
        <motion.div
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1, ease: "linear" }}
          style={{
            height: "100%",
            background: expired
              ? "linear-gradient(90deg, #D89A2B, #D95C5C)"
              : "linear-gradient(90deg, #C9973A, #E3B868)",
            borderRadius: 999,
          }}
        />
      </div>

      <div style={{ flex: 1, fontSize: 14, color: "#667085", minWidth: 0, textAlign: "center" }}>
        {expired
          ? "El demo ha expirado. Registra tu club para continuar con acceso completo."
          : "Estas en el entorno demo de ALTTEZ. Tiempo restante: "}
        {!expired && (
          <span
            style={{
              fontWeight: 700,
              color: secondsLeft < 120 ? "#B7832D" : "#171A1C",
              fontFamily: "monospace",
            }}
          >
            {formatCountdown(secondsLeft)}
          </span>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.02, boxShadow: "0 14px 28px rgba(201,151,58,0.22)" }}
        whileTap={{ scale: 0.97 }}
        onClick={onRegister}
        style={{
          padding: "11px 18px",
          fontSize: 13,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1px",
          background: "#C9973A",
          color: "#FFFFFF",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontFamily: "inherit",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        Registrar club
      </motion.button>

      {!expired && (
        <button
          onClick={onClose}
          aria-label="Cerrar banner demo"
          style={{
            background: "none",
            border: "none",
            color: "#98A2B3",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}

      <style>{`
        @media (min-width: 600px) { .demo-banner-progress { display: block !important; } }
        @media (max-width: 599px) { .demo-banner-progress { display: none !important; } }
      `}</style>
    </motion.div>
  );
}

export default function DemoGate({ onNavigateToRegister }) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const demoStart = getOrInitDemoStart();
    const elapsed = Math.floor((Date.now() - demoStart) / 1000);
    return Math.max(0, DEMO_DURATION_SEC - elapsed);
  });
  const [showModal, setShowModal] = useState(() => secondsLeft === 0);
  const [bannerVisible, setBannerVisible] = useState(true);

  const expired = secondsLeft === 0;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((value) => {
        const next = value - 1;
        if (next <= 0) {
          clearInterval(interval);
          setShowModal(true);
          setBannerVisible(true);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRegister = useCallback(() => {
    setShowModal(false);
    onNavigateToRegister();
  }, [onNavigateToRegister]);

  if (!bannerVisible && !expired) return null;

  return (
    <>
      {bannerVisible && (
        <DemoBanner
          secondsLeft={secondsLeft}
          onRegister={handleRegister}
          onClose={() => setBannerVisible(false)}
          expired={expired}
        />
      )}

      <AnimatePresence>
        {showModal && (
          <ConversionModal
            onClose={() => setShowModal(false)}
            onRegister={handleRegister}
          />
        )}
      </AnimatePresence>
    </>
  );
}
