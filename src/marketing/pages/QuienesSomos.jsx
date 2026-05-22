import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { usePageTitle } from "../../shared/hooks/usePageTitle";
import { MARKETING_BRAND as B, MARKETING_FONTS as F } from "../theme/brand";

export default function QuienesSomos() {
  usePageTitle("Quiénes Somos — ALTTEZ");
  
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div style={{ background: B.bg, minHeight: "100vh", fontFamily: F.body, overflowX: "hidden" }}>
      
      {/* Hero Editorial */}
      <section style={{ paddingTop: 160, paddingBottom: 100, paddingX: 24 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              margin: "0 0 32px",
              color: B.text,
              fontSize: "clamp(48px, 8vw, 84px)",
              letterSpacing: "-0.05em",
              fontWeight: 800,
              fontFamily: F.display,
              lineHeight: 1.1
            }}
          >
            El deporte merece <br />
            software <span style={{ color: B.primary }}>de este siglo.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ color: B.textMuted, fontSize: "clamp(18px, 2vw, 24px)", lineHeight: 1.6, maxWidth: 700, margin: "0 auto" }}
          >
            Nacimos con una misión simple: liberar a los clubes y organizadores de las tareas manuales para que puedan enfocarse en lo que realmente importa: el juego.
          </motion.p>
        </div>
      </section>

      {/* Parallax Image */}
      <section ref={targetRef} style={{ height: "60vh", overflow: "hidden", position: "relative" }}>
        <motion.div style={{
          position: "absolute", inset: "-20% 0",
          backgroundImage: "url('https://images.unsplash.com/photo-1518605368461-1e1e114051bf?q=80&w=2000&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          y
        }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(31,31,29,0.4)" }} />
        </motion.div>
      </section>

      {/* Story Section */}
      <section style={{ padding: "120px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 80 }}>
          
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}>
            <div style={{ width: 48, height: 48, background: B.primarySoft, color: B.primary, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, fontSize: 20, fontWeight: 800 }}>01</div>
            <h2 style={{ fontSize: 32, fontFamily: F.display, fontWeight: 800, color: B.text, marginBottom: 20 }}>El problema</h2>
            <p style={{ color: B.textMuted, fontSize: 18, lineHeight: 1.7 }}>
              Durante décadas, la gestión deportiva se ha basado en libretas, hojas de cálculo de Excel interminables y grupos de WhatsApp caóticos. La pasión por el deporte a menudo se veía ahogada por la burocracia administrativa.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ delay: 0.2 }}>
            <div style={{ width: 48, height: 48, background: B.primarySoft, color: B.primary, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, fontSize: 20, fontWeight: 800 }}>02</div>
            <h2 style={{ fontSize: 32, fontFamily: F.display, fontWeight: 800, color: B.text, marginBottom: 20 }}>Nuestra solución</h2>
            <p style={{ color: B.textMuted, fontSize: 18, lineHeight: 1.7 }}>
              Construimos ALTTEZ para ser el ecosistema operativo definitivo. Una plataforma de clase mundial, rápida y hermosa, diseñada específicamente para las necesidades únicas del deporte amateur y profesional moderno.
            </p>
          </motion.div>

        </div>
      </section>

    </div>
  );
}
