import { useState, useEffect, useCallback } from "react";
import { PALETTE as C } from "../tokens/palette";

let globalShow = null;

export function showToast(message, type = "success", duration = 3000) {
  if (globalShow) globalShow(message, type, duration);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type, duration) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), duration);
  }, []);

  useEffect(() => {
    globalShow = show;
    return () => { globalShow = null; };
  }, [show]);

  const colors = {
    success: C.success,
    error: C.danger,
    warning: C.amber,
    info: C.blue,
  };

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: "fixed", top: 12, right: 12, zIndex: 99999, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          aria-live="assertive"
          style={{
            padding: "12px 18px",
            background: "rgba(255,252,247,0.98)",
            borderLeft: `3px solid ${colors[toast.type] || C.blue}`,
            border: `1px solid ${C.border}`,
            color: C.text,
            fontSize: 13,
            boxShadow: "0 14px 30px rgba(23,26,28,0.12)",
            borderRadius: 12,
            pointerEvents: "auto",
            minWidth: 240,
            maxWidth: 360,
            animation: "toast_in 0.28s ease-out",
          }}
        >
          {toast.message}
        </div>
      ))}
      <style>{`@keyframes toast_in{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  );
}
