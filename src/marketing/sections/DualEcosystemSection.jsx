import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, Users, Trophy, ShieldCheck, PieChart, Activity, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MARKETING_BRAND as B, MARKETING_FONTS as F } from "../theme/brand";

const CONTENT = [
  {
    id: "club",
    title: "El motor operativo de tu Club",
    desc: "Unifica la gestión de plantilla, planificación de entrenamientos, calendarios y finanzas en una sola plataforma profesional, diseñada para ahorrarte horas de trabajo semanal.",
    cta: "Descubre el CRM",
    path: "/producto/alttezcrm",
    color: B.primary,
    features: [
      { icon: Users, label: "Gestión de Plantilla" },
      { icon: Activity, label: "Control de Entrenamiento" },
      { icon: PieChart, label: "Finanzas y Cuotas" },
    ],
  },
  {
    id: "torneos",
    title: "Automatiza tu Competición",
    desc: "Crea torneos en minutos. Genera fixtures, administra inscripciones, gestiona resultados y publica automáticamente un portal profesional para jugadores y aficionados.",
    cta: "Descubre Torneos",
    path: "/torneos",
    color: "#2FA56F",
    features: [
      { icon: Trophy, label: "Generador de Fixtures" },
      { icon: Megaphone, label: "Portal Público en vivo" },
      { icon: ShieldCheck, label: "Control de Inscripciones" },
    ],
  }
];

export default function DualEcosystemSection() {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });

  useEffect(() => {
    return smoothProgress.onChange((latest) => {
      if (latest > 0.5 && activeIndex !== 1) setActiveIndex(1);
      if (latest <= 0.5 && activeIndex !== 0) setActiveIndex(0);
    });
  }, [smoothProgress, activeIndex]);

  const activeData = CONTENT[activeIndex];

  return (
    <section ref={containerRef} style={{
      position: "relative",
      background: B.bgSoft,
      fontFamily: F.body,
      borderTop: `1px solid ${B.border}`,
      // 200vh allows scrolling while sticky
      height: "200vh"
    }}>
      <div style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden"
      }}>
        <div style={{ width: "100%", maxWidth: 1400, margin: "0 auto", padding: "0 32px" }}>
          
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ 
              display: "inline-block", 
              padding: "8px 16px", 
              borderRadius: 999, 
              background: B.primarySoft, 
              color: B.primary, 
              fontSize: 12, 
              fontWeight: 800, 
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 20
            }}>
              Ecosistema Dual
            </span>
            <h2 style={{
              margin: 0,
              fontSize: "clamp(32px, 4vw, 48px)",
              fontFamily: F.display,
              fontWeight: 800,
              color: B.text,
              letterSpacing: "-0.03em",
              lineHeight: 1.2
            }}>
              Soluciones especializadas para <br />
              cada actor del deporte.
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "center",
            background: B.bg,
            borderRadius: 32,
            border: `1px solid ${B.border}`,
            padding: 40,
            boxShadow: "0 24px 64px rgba(23,26,28,0.04)"
          }}>
            
            {/* Left Column: Text Content */}
            <div style={{ position: "relative", minHeight: 360 }}>
              {CONTENT.map((item, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <motion.div
                    key={item.id}
                    initial={false}
                    animate={{ 
                      opacity: isActive ? 1 : 0, 
                      y: isActive ? 0 : 20,
                      pointerEvents: isActive ? "auto" : "none"
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ position: "absolute", top: 0, left: 0, right: 0 }}
                  >
                    <h3 style={{
                      fontSize: 36,
                      fontFamily: F.display,
                      fontWeight: 800,
                      color: B.text,
                      marginBottom: 16,
                      letterSpacing: "-0.02em"
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      fontSize: 18,
                      color: B.textMuted,
                      lineHeight: 1.6,
                      marginBottom: 32
                    }}>
                      {item.desc}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
                      {item.features.map((feat, fidx) => (
                        <div key={fidx} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ 
                            width: 36, 
                            height: 36, 
                            borderRadius: 10, 
                            background: B.surfaceStrong, 
                            border: `1px solid ${B.border}`,
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            color: item.color
                          }}>
                            <feat.icon size={18} />
                          </div>
                          <span style={{ fontSize: 16, fontWeight: 600, color: B.text }}>{feat.label}</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => navigate(item.path)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "16px 32px",
                        borderRadius: 14,
                        background: item.color,
                        border: "none",
                        color: "#FFF",
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: `0 8px 24px rgba(0,0,0,0.15)`,
                        transition: "transform 0.2s ease"
                      }}
                      onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                      onMouseOut={e => e.currentTarget.style.transform = "none"}
                    >
                      {item.cta}
                      <ArrowRight size={18} />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Column: Visualizer */}
            <div style={{
              height: 480,
              background: "linear-gradient(135deg, rgba(237,232,208,0.4) 0%, rgba(206,137,70,0.05) 100%)",
              borderRadius: 24,
              border: `1px solid ${B.border}`,
              position: "relative",
              overflow: "hidden"
            }}>
              {CONTENT.map((item, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <motion.div
                    key={`img-${item.id}`}
                    initial={false}
                    animate={{ 
                      opacity: isActive ? 1 : 0, 
                      scale: isActive ? 1 : 0.95
                    }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{ 
                      position: "absolute", inset: 24, 
                      borderRadius: 16,
                      background: B.surfaceStrong,
                      border: `1px solid ${B.border}`,
                      boxShadow: "0 24px 64px rgba(23,26,28,0.06)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: B.textHint, fontSize: 16, fontWeight: 600
                    }}
                  >
                    Visualización de {item.id === "club" ? "ALTTEZ CRM" : "ALTTEZ Torneos"}
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
      
      {/* ProgressBar indicating scroll status */}
      <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 4, background: "transparent" }}>
        <motion.div style={{ height: "100%", background: B.primary, scaleX: smoothProgress, transformOrigin: "left" }} />
      </div>
    </section>
  );
}
