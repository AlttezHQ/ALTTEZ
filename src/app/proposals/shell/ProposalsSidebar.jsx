"use client";

/**
 * @component ProposalsSidebar
 * @description Navegación lateral del módulo INTERNO de propuestas (diseño Stitch).
 * Sidebar grafito, secciones propias (Dashboard/Propuestas/Clientes/Analytics).
 * NO mezcla módulos del CRM — herramienta interna independiente.
 */

import { LayoutDashboard, FileText, Users, BarChart3, Settings, ArrowLeft, LogOut } from "lucide-react";
import {
  FONT, SIDE_BG, SIDE_TEXT, SIDE_MUTED, SIDE_LINE, CU, MARFIL,
} from "./proposalsTokens";

const LOGO = "/branding/alttez-symbol-transparent.png";

const SECTIONS = [
  { id: "dashboard",  label: "Dashboard",  Icon: LayoutDashboard },
  { id: "propuestas", label: "Propuestas", Icon: FileText },
  { id: "clientes",   label: "Clientes",   Icon: Users },
  { id: "analytics",  label: "Analytics",  Icon: BarChart3 },
  { id: "administrativo", label: "Administrativo", Icon: Settings },
];

function Item({ label, Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%",
        padding: "11px 14px", borderRadius: 10, border: "none", cursor: "pointer",
        fontFamily: FONT, fontSize: 14, fontWeight: active ? 700 : 500, textAlign: "left",
        background: active ? CU : "transparent",
        color: active ? "#FFFFFF" : SIDE_MUTED,
        boxShadow: active ? "0 4px 12px rgba(206,137,70,0.30)" : "none",
        transform: active ? "translateY(-1px)" : "none",
        transition: "background 0.18s, color 0.18s, transform 0.18s",
      }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(246,241,234,0.06)"; e.currentTarget.style.color = SIDE_TEXT; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = SIDE_MUTED; } }}
    >
      <Icon size={19} strokeWidth={active ? 2.2 : 1.9} color={active ? "#FFFFFF" : undefined} />
      {label}
    </button>
  );
}

function FooterLink({ label, Icon, danger, onClick }) {
  const base = danger ? "#E88" : SIDE_MUTED;
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%",
        padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer",
        fontFamily: FONT, fontSize: 13, fontWeight: 500, textAlign: "left",
        background: "transparent", color: base, transition: "background 0.18s, color 0.18s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? "rgba(217,92,92,0.12)" : "rgba(246,241,234,0.06)"; e.currentTarget.style.color = danger ? "#F0A0A0" : SIDE_TEXT; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = base; }}
    >
      <Icon size={18} strokeWidth={1.9} />
      {label}
    </button>
  );
}

function Nav({ section, onSelect, onLogout, onCloseMobile }) {
  return (
    <nav style={{
      width: 248, height: "100%", background: SIDE_BG, borderRight: `1px solid ${SIDE_LINE}`,
      display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "0 22px 22px", display: "flex", alignItems: "center", gap: 10 }}>
        <img src={LOGO} alt="ALTTEZ" style={{ height: 26, width: "auto" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
        <div>
          <div style={{ fontFamily: FONT, fontSize: 17, fontWeight: 800, color: MARFIL, letterSpacing: "0.06em", lineHeight: 1 }}>ALTTEZ</div>
          <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 500, color: SIDE_MUTED, marginTop: 3 }}>Propuestas Internas</div>
        </div>
      </div>

      {/* Secciones */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
        {SECTIONS.map((s) => (
          <Item key={s.id} label={s.label} Icon={s.Icon} active={section === s.id} onClick={() => { onSelect(s.id); onCloseMobile?.(); }} />
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: "auto", padding: "14px 16px 0", borderTop: `1px solid ${SIDE_LINE}`, display: "flex", flexDirection: "column", gap: 2 }}>
        <FooterLink label="Salir al inicio" Icon={ArrowLeft} onClick={() => { window.location.href = "/"; }} />
        {onLogout && <FooterLink label="Cerrar sesión" Icon={LogOut} danger onClick={onLogout} />}
      </div>
    </nav>
  );
}

export default function ProposalsSidebar({ section, onSelect, onLogout, mobileOpen, onCloseMobile }) {
  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 50 }} className="alttez-psidebar-desktop">
        <Nav section={section} onSelect={onSelect} onLogout={onLogout} />
      </div>

      {mobileOpen && (
        <div className="alttez-psidebar-mobile" style={{ position: "fixed", inset: 0, zIndex: 60 }}>
          <div onClick={onCloseMobile} style={{ position: "absolute", inset: 0, background: "rgba(10,12,18,0.45)", backdropFilter: "blur(2px)" }} />
          <div style={{ position: "absolute", top: 0, left: 0, height: "100%", boxShadow: "8px 0 32px rgba(0,0,0,0.4)" }}>
            <Nav section={section} onSelect={onSelect} onLogout={onLogout} onCloseMobile={onCloseMobile} />
          </div>
        </div>
      )}

      <style>{`
        .alttez-psidebar-desktop { display: block; }
        .alttez-psidebar-mobile { display: none; }
        @media (max-width: 767px) {
          .alttez-psidebar-desktop { display: none; }
          .alttez-psidebar-mobile { display: block; }
        }
      `}</style>
    </>
  );
}
