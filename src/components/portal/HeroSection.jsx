/**
 * @component HeroSection
 * @description Modulo Hero del Portal Corporativo Elevate.
 * Vision global: "Solucionador de Problemas y Moldeador de Deportistas"
 * Framer Motion: parallax, stagger, spring hover.
 * @author @Desarrollador (Andres)
 */
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PALETTE as C } from "../../constants/palette";

const STATS = [
  { value: "500+", label: "Deportistas bajo seguimiento" },
  { value: "98%", label: "Retencion de clubes" },
  { value: "24/7", label: "Disponibilidad operativa" },
  { value: "<3s", label: "Tiempo de carga" },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function HeroSection() {
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @media (max-width: 767px) {
        .hero-cta-row {
          flex-direction: column !important;
          align-items: stretch !important;
          width: 100% !important;
          max-width: 320px !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
        .hero-cta-row button {
          text-align: center !important;
          justify-content: center !important;
        }
        .hero-stats-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          max-width: 100% !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "80px 24px 60px",
      }}
    >
      {/* Orbes atmosfericos */}
      <motion.div
        style={{
          position: "absolute", top: "-20%", left: "-10%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
          filter: "blur(80px)", y: bgY, opacity,
          pointerEvents: "none",
        }}
      />
      <motion.div
        style={{
          position: "absolute", bottom: "-15%", right: "-5%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,255,0,0.1) 0%, transparent 70%)",
          filter: "blur(60px)", y: bgY, opacity,
          pointerEvents: "none",
        }}
      />

      {/* Grid sutil de fondo */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        pointerEvents: "none",
      }} />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        style={{
          position: "relative", zIndex: 2,
          maxWidth: 900, width: "100%", textAlign: "center",
        }}
      >
        {/* Badge */}
        <motion.div variants={fadeUp} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 16px", borderRadius: 20,
          background: "rgba(200,255,0,0.06)", border: `1px solid ${C.neonBorder}`,
          fontSize: 11, fontWeight: 600, letterSpacing: "1.5px",
          textTransform: "uppercase", color: C.neon, marginBottom: 32,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.neon, boxShadow: `0 0 8px ${C.neonGlow}` }} />
          Sistema de Inteligencia Deportiva
        </motion.div>

        {/* Titulo principal */}
        <motion.h1 variants={fadeUp} style={{
          fontSize: "clamp(36px, 6vw, 72px)",
          fontWeight: 800, lineHeight: 1.05,
          color: "white", margin: "0 0 24px",
          fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
        }}>
          Solucionador de{" "}
          <span style={{
            background: `linear-gradient(135deg, ${C.neon}, #7C3AED)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Problemas
          </span>
          <br />y Moldeador de{" "}
          <span style={{
            background: `linear-gradient(135deg, #7C3AED, ${C.neon})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Deportistas
          </span>
        </motion.h1>

        {/* Subtitulo */}
        <motion.p variants={fadeUp} style={{
          fontSize: "clamp(14px, 2vw, 18px)",
          color: C.textMuted, maxWidth: 600,
          margin: "0 auto 40px", lineHeight: 1.7,
        }}>
          Elevate es el ecosistema tecnologico que estandariza la gestion deportiva en Colombia
          al nivel de las grandes ligas. Desde la periodizacion del entrenamiento hasta la salud
          financiera del club, en una sola plataforma.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="hero-cta-row" style={{
          display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap",
          marginBottom: 60,
        }}>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: `0 0 30px ${C.neonGlow}` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/servicios/sports-crm")}
            style={{
              padding: "14px 36px", fontSize: 14, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "1.5px",
              background: C.neon, color: "#0a0a0f", border: "none",
              borderRadius: 8, cursor: "pointer",
              fontFamily: "'Barlow', Arial, sans-serif",
            }}
          >
            Explorar el CRM
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04, borderColor: C.neon }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/journal")}
            style={{
              padding: "14px 36px", fontSize: 14, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "1.5px",
              background: "transparent", color: "white",
              border: `1px solid ${C.borderHi}`,
              borderRadius: 8, cursor: "pointer",
              fontFamily: "'Barlow', Arial, sans-serif",
            }}
          >
            Ver Bitacora
          </motion.button>
        </motion.div>

        {/* Stats badges glassmorphism */}
        <motion.div variants={fadeUp} className="hero-stats-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 16, maxWidth: 700, margin: "0 auto",
        }}>
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, borderColor: "rgba(200,255,0,0.3)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{
                padding: "20px 16px",
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: `1px solid ${C.border}`,
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: C.neon, marginBottom: 4 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

    </section>
  );
}
