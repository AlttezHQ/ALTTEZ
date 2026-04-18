/**
 * @component OfflineBanner
 * @description Banner de estado de conexión.
 *   - Sin conexión: fondo amber semi-transparente, mensaje informativo
 *   - Al reconectar: cambia a verde "Conexión restaurada" por 3s y desaparece
 *   - Posición: fixed top, debajo de la navbar (offset 56px)
 *   - Animación: Framer Motion spring en entrada/salida
 *
 * Uso: colocar dentro del root de la app (PortalLayout o App).
 * No requiere props — lee navigator.onLine y escucha eventos de red.
 *
 * @author @Andres (UI) — PWA Sprint
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PALETTE as C } from "../tokens/palette";

// ── Animation variants ───────────────────────────────────────────────────────

const bannerVariants = {
  hidden: {
    opacity: 0,
    y: -20,
    transition: { type: "spring", stiffness: 380, damping: 34 },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 380, damping: 30 },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.22, ease: "easeIn" },
  },
};

// ── Offline icon ─────────────────────────────────────────────────────────────

function OfflineIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OnlineIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Pulse dot ────────────────────────────────────────────────────────────────

function PulseDot({ color }) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        width: 8,
        height: 8,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: color,
          opacity: 0.4,
          animation: "elv-pulse 1.8s ease-in-out infinite",
        }}
      />
      <span
        style={{
          position: "relative",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
        }}
      />
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  // "reconnected" state: briefly show green banner after coming back online
  const [showReconnected, setShowReconnected] = useState(false);
  const reconnectTimer = useRef(null);

  useEffect(() => {
    // Inject keyframe for pulse animation (project pattern: no CSS modules)
    if (!document.getElementById("elv-offline-kf")) {
      const s = document.createElement("style");
      s.id = "elv-offline-kf";
      s.textContent = [
        "@keyframes elv-pulse{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(2.2);opacity:0}}",
      ].join("");
      document.head.appendChild(s);
    }

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
      clearTimeout(reconnectTimer.current);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearTimeout(reconnectTimer.current);
    };
  }, []);

  // Determine what to show
  const showOffline = !isOnline;
  const showOnline = isOnline && showReconnected;
  const shouldRender = showOffline || showOnline;

  const AMBER = "#EF9F27";
  const GREEN = C.success;

  const config = showOnline
    ? {
        color: GREEN,
        bg: "rgba(0,255,136,0.08)",
        border: "rgba(0,255,136,0.25)",
        text: "Conexión restaurada",
        Icon: OnlineIcon,
      }
    : {
        color: AMBER,
        bg: "rgba(239,159,39,0.08)",
        border: "rgba(239,159,39,0.25)",
        text: "Sin conexión \u2014 los cambios se guardan localmente",
        Icon: OfflineIcon,
      };

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          key={showOnline ? "online-banner" : "offline-banner"}
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: 56, // below navbar
            left: 0,
            right: 0,
            zIndex: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "8px 16px",
            background: config.bg,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: `1px solid ${config.border}`,
            color: config.color,
            fontSize: 12,
            fontFamily: "'Barlow', Arial, sans-serif",
            fontWeight: 500,
            letterSpacing: "0.2px",
          }}
        >
          <PulseDot color={config.color} />
          <config.Icon />
          <span>{config.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
