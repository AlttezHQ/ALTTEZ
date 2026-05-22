import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { MARKETING_BRAND as B, MARKETING_FONTS as F } from "../theme/brand";
import DashboardPreview from "./DashboardPreview";

export default function HeroSection() {
  return (
    <section style={{ 
      position: "relative",
      paddingTop: 180,
      paddingBottom: 120,
      background: B.bg,
      overflow: "hidden",
      backgroundImage: `
        linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
      `,
      backgroundSize: "40px 40px"
    }}>
      {/* Soft Structuralism Radial Mesh */}
      <div style={{
        position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
        width: "120vw", height: "80vh",
        background: `radial-gradient(ellipse at top, ${B.primarySoft} 0%, transparent 60%)`,
        opacity: 0.5, pointerEvents: "none", zIndex: 0
      }} />

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          >
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 999,
              background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)",
              fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em",
              color: B.textMuted, marginBottom: 40
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: B.primary }} />
              El Nuevo Estándar Operativo
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
            style={{
              margin: 0,
              fontSize: "clamp(56px, 9vw, 110px)",
              fontFamily: F.display,
              fontWeight: 800,
              color: B.text,
              lineHeight: 0.9,
              letterSpacing: "-0.05em",
              maxWidth: 1100
            }}
          >
            Menos gestión.<br/>
            <span style={{ color: B.primary }}>Más fútbol.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
            style={{
              marginTop: 32, marginBottom: 48,
              fontSize: "clamp(18px, 2.5vw, 24px)",
              color: B.textMuted,
              lineHeight: 1.5,
              maxWidth: 680
            }}
          >
            El sistema operativo definitivo que automatiza la logística de tu club y la gestión de tus competiciones.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
            style={{ display: "flex", gap: 16, alignItems: "center" }}
          >
            <button className="group" style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "8px 8px 8px 32px",
              background: B.text, color: "white",
              border: "none", borderRadius: 999,
              fontSize: 16, fontWeight: 700, cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.32,0.72,0,1)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.15)"
            }}>
              Solicitar Demo
              <div style={{
                width: 40, height: 40, borderRadius: 999,
                background: "rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s cubic-bezier(0.32,0.72,0,1)"
              }} className="nested-arrow-circle">
                <ArrowRight size={18} className="nested-arrow" />
              </div>
            </button>

            <button style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "16px 32px",
              background: "transparent", color: B.text,
              border: `1px solid ${B.border}`, borderRadius: 999,
              fontSize: 16, fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s"
            }}>
              <Play size={18} />
              Ver plataforma
            </button>
          </motion.div>
        </div>

        {/* Dashboard Preview Injection */}
        <div style={{ marginTop: 100 }}>
          <DashboardPreview />
        </div>
      </div>

      <style>{`
        .group:hover { transform: scale(0.98); }
        .group:hover .nested-arrow-circle { background: white; color: #1F1F1D; transform: scale(1.05); }
        .group:hover .nested-arrow { transform: translateX(2px) translateY(-1px); }
      `}</style>
    </section>
  );
}
