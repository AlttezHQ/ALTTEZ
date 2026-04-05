/**
 * @component DemoGate
 * @description Gate de conversión para el modo demo de ALTTEZ.
 *
 * Estrategia: Banner persistente (Opción D) + timeout de 15 minutos (Opción A).
 *
 * COMPORTAMIENTO:
 * - Desde el minuto 0: banner inferior fijo "MODO DEMO" con contador regresivo.
 * - A los 15 minutos: modal de conversión con CTA de registro. No bloquea de forma
 *   abrupta — el usuario puede cerrar el modal pero el banner persiste.
 * - El temporizador persiste en sessionStorage para sobrevivir navegación intra-CRM
 *   pero se reinicia en cada sesión nueva (no acumulativo entre días).
 *
 * RATIONALE (conversión):
 * - La Opción D (watermark) mantiene al usuario dentro del producto, aumentando el
 *   tiempo de exposición a las features.
 * - La Opción A (tiempo) crea urgencia sin bloquear la exploración inicial.
 * - El modal a los 15 min aparece cuando el usuario ya ha visto suficiente valor
 *   para tomar la decisión de registrarse.
 *
 * @param {{ onRegister: () => void, onLogout: () => void }} props
 * @author @Arquitecto (Carlos)
 * @version 1.0.0
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PALETTE as C } from "../../shared/tokens/palette";

/** Duración del demo en segundos antes de mostrar el modal (15 minutos) */
const DEMO_DURATION_SEC = 15 * 60;

/** Clave de sessionStorage para el tiempo de inicio del demo */
const DEMO_START_KEY = "alttez_demo_start";

/**
 * Obtiene o inicializa el timestamp de inicio del demo en sessionStorage.
 * @returns {number} timestamp en ms
 */
function getOrInitDemoStart() {
  const stored = sessionStorage.getItem(DEMO_START_KEY);
  if (stored) {
    const ts = parseInt(stored, 10);
    if (!isNaN(ts)) return ts;
  }
  const now = Date.now();
  sessionStorage.setItem(DEMO_START_KEY, String(now));
  return now;
}

/**
 * Formatea segundos restantes a "MM:SS"
 * @param {number} seconds
 * @returns {string}
 */
function formatCountdown(seconds) {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Modal de conversión que aparece cuando expira el timer.
 */
function ConversionModal({ onClose, onRegister }) {
  return (
    <motion.div
      key="demo-conversion-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 460,
          background: "linear-gradient(135deg, rgba(15,15,24,0.98) 0%, rgba(10,10,18,0.98) 100%)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: "40px 36px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Orbe decorativo */}
        <div style={{
          position: "absolute", top: "-40%", left: "50%",
          transform: "translateX(-50%)",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,255,0,0.06) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none",
        }} />

        {/* Icono */}
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: `linear-gradient(135deg, ${C.neon}18, rgba(124,58,237,0.15))`,
          border: `1px solid ${C.neon}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 3l2.5 5 5.5.8-4 3.9.9 5.5L14 15.6l-4.9 2.6.9-5.5-4-3.9 5.5-.8L14 3z"
              stroke={C.neon} strokeWidth="1.5" strokeLinejoin="round"
              fill={`${C.neon}20`}
            />
            <circle cx="14" cy="20" r="5" stroke={C.neon} strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          </svg>
        </div>

        {/* Título */}
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "2px",
          textTransform: "uppercase", color: C.neon, marginBottom: 12,
        }}>
          Demo expirado
        </div>
        <h2 style={{
          fontSize: "clamp(20px, 4vw, 28px)",
          fontWeight: 800, color: "white",
          margin: "0 0 14px",
          fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
          lineHeight: 1.1,
        }}>
          Ya viste el potencial.{"\n"}Ahora hazlo tuyo.
        </h2>
        <p style={{
          fontSize: 13, color: C.textMuted, lineHeight: 1.7,
          margin: "0 0 32px", maxWidth: 340, marginLeft: "auto", marginRight: "auto",
        }}>
          Registra tu club en 2 minutos y accede a todas las funcionalidades sin límite.
          Sin costo durante el piloto.
        </p>

        {/* Beneficios */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 8,
          marginBottom: 28, textAlign: "left",
        }}>
          {[
            "Plantilla ilimitada",
            "Datos reales de tu club — no demo",
            "Sincronización en la nube",
            "Sin tarjeta de crédito",
          ].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 16, height: 16, borderRadius: "50%",
                background: `${C.neon}18`,
                border: `1px solid ${C.neon}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4l2 2 3-3" stroke={C.neon} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{item}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: `0 0 28px ${C.neonGlow}` }}
          whileTap={{ scale: 0.97 }}
          onClick={onRegister}
          style={{
            width: "100%", padding: "14px 0",
            fontSize: 13, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "1.5px",
            background: C.neon, color: "#0a0a0f",
            border: "none", borderRadius: 10,
            cursor: "pointer", fontFamily: "inherit",
            marginBottom: 10,
          }}
        >
          Registrar mi club — es gratis
        </motion.button>

        <button
          onClick={onClose}
          style={{
            background: "none", border: "none",
            fontSize: 11, color: C.textMuted,
            cursor: "pointer", padding: "8px 16px",
            fontFamily: "inherit",
          }}
        >
          Continuar explorando el demo
        </button>
      </motion.div>
    </motion.div>
  );
}

/**
 * Banner inferior persistente del modo demo con countdown.
 */
function DemoBanner({ secondsLeft, onRegister, onClose, expired }) {
  const progress = Math.max(0, secondsLeft / DEMO_DURATION_SEC);

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 360, damping: 32, delay: 1.5 }}
      style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        zIndex: 1000,
        background: "rgba(5,10,20,0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: `1px solid ${expired ? C.amber : "rgba(255,255,255,0.08)"}`,
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      {/* Badge DEMO */}
      <div style={{
        padding: "3px 10px",
        fontSize: 8, fontWeight: 800,
        textTransform: "uppercase", letterSpacing: "2px",
        background: `${C.amber}22`,
        color: C.amber,
        border: `1px solid ${C.amber}55`,
        borderRadius: 5, flexShrink: 0,
        whiteSpace: "nowrap",
      }}>
        Modo Demo
      </div>

      {/* Barra de progreso */}
      <div style={{
        flex: 1,
        height: 3,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 2, overflow: "hidden",
        display: "none",
      }}
        className="demo-banner-progress"
      >
        <motion.div
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1, ease: "linear" }}
          style={{
            height: "100%",
            background: expired
              ? `linear-gradient(90deg, ${C.amber}, #E24B4A)`
              : `linear-gradient(90deg, ${C.neon}, ${C.amber})`,
            borderRadius: 2,
          }}
        />
      </div>

      {/* Texto */}
      <div style={{ flex: 1, fontSize: 11, color: C.textMuted, minWidth: 0 }}>
        {expired
          ? "El demo ha expirado — registra tu club para continuar con acceso completo"
          : `Estás en el entorno demo de ALTTEZ. Tiempo restante: `
        }
        {!expired && (
          <span style={{
            fontWeight: 700, color: secondsLeft < 120 ? C.amber : "rgba(255,255,255,0.6)",
            fontFamily: "monospace",
          }}>
            {formatCountdown(secondsLeft)}
          </span>
        )}
      </div>

      {/* CTA Registro */}
      <motion.button
        whileHover={{ scale: 1.04, boxShadow: `0 0 16px ${C.neonGlow}` }}
        whileTap={{ scale: 0.97 }}
        onClick={onRegister}
        style={{
          padding: "7px 18px",
          fontSize: 11, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "1px",
          background: C.neon, color: "#0a0a0f",
          border: "none", borderRadius: 6,
          cursor: "pointer", fontFamily: "inherit",
          flexShrink: 0, whiteSpace: "nowrap",
        }}
      >
        Registrar club
      </motion.button>

      {/* Cerrar (solo si no expiró) */}
      {!expired && (
        <button
          onClick={onClose}
          aria-label="Cerrar banner demo"
          style={{
            background: "none", border: "none",
            color: C.textHint, cursor: "pointer",
            padding: "4px", display: "flex",
            alignItems: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}

      <style>{`
        @media (min-width: 600px) { .demo-banner-progress { display: block !important; } }
        @media (max-width: 599px) {
          .demo-banner-progress { display: none !important; }
        }
      `}</style>
    </motion.div>
  );
}

/**
 * @component DemoGate
 * @description Gate de conversión del modo demo. Renderiza banner persistente
 * y modal de conversión cuando el timer expira.
 *
 * @param {{ onNavigateToRegister: () => void }} props
 * @returns {JSX.Element | null}
 */
export default function DemoGate({ onNavigateToRegister }) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const demoStart = getOrInitDemoStart();
    const elapsed = Math.floor((Date.now() - demoStart) / 1000);
    return Math.max(0, DEMO_DURATION_SEC - elapsed);
  });
  const [showModal, setShowModal] = useState(() => secondsLeft === 0);
  const [bannerVisible, setBannerVisible] = useState(true);

  const expired = secondsLeft === 0;

  // Tick del countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        const next = s - 1;
        if (next <= 0) {
          clearInterval(interval);
          setShowModal(true);
          setBannerVisible(true); // re-mostrar si fue cerrado
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
      {/* Banner persistente */}
      {bannerVisible && (
        <DemoBanner
          secondsLeft={secondsLeft}
          onRegister={handleRegister}
          onClose={() => setBannerVisible(false)}
          expired={expired}
        />
      )}

      {/* Modal de conversión cuando expira */}
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
