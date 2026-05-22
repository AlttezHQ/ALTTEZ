import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { MARKETING_BRAND as B, MARKETING_FONTS as F } from "../theme/brand";
import { Activity, Users, Zap, Search, Bell, Menu } from "lucide-react";

export default function DashboardPreview() {
  const containerRef = useRef(null);
  
  // Parallax physics based on scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [35, -5]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-15, 15]);
  const y = useTransform(scrollYProgress, [0, 1], [150, -150]);

  const COPPER = "#CE8946";
  const OLED = "#0A0A0A";
  const GLASS = "rgba(255,255,255,0.03)";
  const GLASS_BORDER = "rgba(255,255,255,0.08)";

  return (
    <div ref={containerRef} style={{
      perspective: 1200,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "0 20px"
    }}>
      <motion.div style={{
        rotateX,
        rotateY,
        y,
        width: "100%",
        maxWidth: 1100,
        // Double-Bezel: Outer Shell
        background: "rgba(0,0,0,0.03)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderRadius: 40,
        padding: 16,
        border: "1px solid rgba(0,0,0,0.1)",
        boxShadow: "0 80px 140px -20px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.8) inset",
      }}>
        
        {/* Double-Bezel: Inner Core (OLED Ethereal Glass) */}
        <div style={{
          background: OLED,
          borderRadius: 28,
          overflow: "hidden",
          minHeight: 640,
          border: `1px solid rgba(255,255,255,0.1)`,
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1)",
          position: "relative",
          display: "flex",
          fontFamily: F.body
        }}>
          
          {/* Subtle glowing mesh in background of OLED */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 300,
            background: `radial-gradient(ellipse at 50% -50%, ${COPPER}40 0%, transparent 70%)`,
            pointerEvents: "none"
          }} />

          {/* Sidebar */}
          <div style={{ width: 260, borderRight: `1px solid ${GLASS_BORDER}`, padding: "32px 24px", display: "flex", flexDirection: "column", position: "relative", zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src="/branding/alttez-symbol-transparent.png" alt="ALTTEZ" style={{ height: 16, filter: "invert(1)" }} />
              </div>
              <span style={{ color: "white", fontFamily: F.display, fontWeight: 800, fontSize: 18, letterSpacing: "-0.04em" }}>ALTTEZ</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ padding: "12px 16px", borderRadius: 12, background: GLASS, border: `1px solid ${GLASS_BORDER}`, color: "white", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 12 }}>
                <Activity size={18} color={COPPER} />
                Dashboard
              </div>
              <div style={{ padding: "12px 16px", borderRadius: 12, color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 12 }}>
                <Users size={18} />
                Plantilla
              </div>
              <div style={{ padding: "12px 16px", borderRadius: 12, color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 12 }}>
                <Zap size={18} />
                Rendimiento
              </div>
            </div>
            
            <div style={{ marginTop: "auto" }}>
              <div style={{ padding: 16, borderRadius: 16, background: "linear-gradient(135deg, rgba(206,137,70,0.1) 0%, rgba(206,137,70,0.02) 100%)", border: `1px solid rgba(206,137,70,0.2)` }}>
                <div style={{ color: "white", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Plan Pro</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Facturación al día</div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column", position: "relative", zIndex: 10 }}>
            {/* Top Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
              <div style={{ position: "relative", width: 300 }}>
                <Search size={16} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: 16, top: 14 }} />
                <div style={{
                  background: GLASS, border: `1px solid ${GLASS_BORDER}`, borderRadius: 999,
                  height: 44, width: "100%", paddingLeft: 44, color: "white",
                  display: "flex", alignItems: "center", fontSize: 14
                }}>Buscar jugador...</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: GLASS, border: `1px solid ${GLASS_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                  <Bell size={18} />
                </div>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: COPPER, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>
                  JD
                </div>
              </div>
            </div>

            <div style={{ color: "white", fontFamily: F.display, fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.04em" }}>Resumen Semanal</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, marginBottom: 32 }}>Métricas principales del equipo.</div>

            {/* Asymmetrical Bento Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              
              {/* Card 1: Large Performance Stat */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  gridColumn: "span 2",
                  background: GLASS,
                  border: `1px solid ${GLASS_BORDER}`,
                  borderRadius: 24,
                  padding: 32,
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40 }}>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600 }}>Carga Física Media</div>
                  <div style={{ color: COPPER, fontSize: 14, fontWeight: 700 }}>+4.2% ↑</div>
                </div>
                <div style={{ color: "white", fontFamily: F.display, fontSize: 64, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1 }}>
                  84%
                </div>
                
                {/* Fake Graph */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, display: "flex", alignItems: "flex-end", gap: 8, padding: "0 32px" }}>
                  {[40, 60, 45, 80, 50, 90, 84].map((h, i) => (
                    <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} transition={{ delay: 0.4 + (i * 0.05), type: "spring" }} style={{ flex: 1, background: i === 6 ? COPPER : "rgba(255,255,255,0.1)", borderRadius: "8px 8px 0 0" }} />
                  ))}
                </div>
              </motion.div>

              {/* Card 2: Next Match */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                  background: GLASS,
                  border: `1px solid ${GLASS_BORDER}`,
                  borderRadius: 24,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600 }}>Próximo Partido</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", color: "black", fontWeight: 800 }}>AL</div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, fontWeight: 800 }}>VS</div>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#2FA56F", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800 }}>RM</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 999, padding: "8px 0", textAlign: "center", color: "white", fontSize: 12, fontWeight: 700, marginTop: 24 }}>
                  Sáb 14, 18:00
                </div>
              </motion.div>

              {/* Card 3: Finances */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                style={{
                  gridColumn: "span 3",
                  background: GLASS,
                  border: `1px solid ${GLASS_BORDER}`,
                  borderRadius: 24,
                  padding: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Ingresos Mensuales</div>
                  <div style={{ color: "white", fontFamily: F.display, fontSize: 32, fontWeight: 800 }}>€14,250.00</div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ padding: "12px 24px", borderRadius: 12, background: "white", color: "black", fontWeight: 700, fontSize: 14 }}>Exportar</div>
                </div>
              </motion.div>

            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
