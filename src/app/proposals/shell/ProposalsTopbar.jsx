"use client";

/**
 * @component ProposalsTopbar
 * @description Barra superior del módulo interno de propuestas (diseño Stitch).
 */

import { Menu, Bell } from "lucide-react";
import { FONT, GRAFITO, MUTED, CU, WHISPER } from "./proposalsTokens";

export default function ProposalsTopbar({ title, mode, onMenuClick }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40, height: 64, flexShrink: 0,
      background: "rgba(246,241,234,0.92)",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      borderBottom: `1px solid ${WHISPER}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <button
          onClick={onMenuClick}
          className="alttez-ptopbar-menu"
          style={{
            width: 40, height: 40, borderRadius: 10, border: `1px solid ${WHISPER}`,
            background: "#FFFFFF", cursor: "pointer", display: "none",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
          aria-label="Abrir menú"
        >
          <Menu size={20} color={GRAFITO} />
        </button>
        <h1 style={{ margin: 0, fontFamily: FONT, fontSize: 16, fontWeight: 700, color: GRAFITO, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {title}
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {mode === "demo" && (
          <span style={{
            padding: "5px 10px", fontFamily: FONT, fontSize: 11, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.08em",
            background: "rgba(183,131,31,0.12)", color: "#B7831F",
            border: "1px solid rgba(183,131,31,0.28)", borderRadius: 999,
          }}>Demo</span>
        )}
        <button
          style={{
            width: 40, height: 40, borderRadius: 10, border: `1px solid ${WHISPER}`,
            background: "#FFFFFF", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", color: MUTED,
            transition: "color 0.18s, border-color 0.18s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = CU; e.currentTarget.style.borderColor = "rgba(206,137,70,0.28)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = WHISPER; }}
          aria-label="Notificaciones"
        >
          <Bell size={19} />
        </button>
      </div>

      <style>{`
        @media (max-width: 767px) { .alttez-ptopbar-menu { display: flex !important; } }
      `}</style>
    </header>
  );
}
