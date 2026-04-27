import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PALETTE as C } from "../tokens/palette";

const bannerVariants = {
  hidden: { opacity: 0, y: -20, transition: { type: "spring", stiffness: 380, damping: 34 } },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 30 } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.22, ease: "easeIn" } },
};

function OfflineIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OnlineIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [showReconnected, setShowReconnected] = useState(false);
  const reconnectTimer = useRef(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = setTimeout(() => setShowReconnected(false), 3000);
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

  const showOffline = !isOnline;
  const showOnline = isOnline && showReconnected;
  const shouldRender = showOffline || showOnline;

  const config = showOnline
    ? { color: C.success, bg: "#F2FBF6", border: C.successBorder, text: "Conexion restaurada", Icon: OnlineIcon }
    : { color: C.amber, bg: "#FFF8EB", border: C.amberBorder, text: "Sin conexion. Los cambios se guardan localmente.", Icon: OfflineIcon };

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
            top: 56,
            left: 0,
            right: 0,
            zIndex: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 16px",
            background: config.bg,
            borderBottom: `1px solid ${config.border}`,
            color: config.color,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.01em",
          }}
        >
          <config.Icon />
          <span>{config.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
