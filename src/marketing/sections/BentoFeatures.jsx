import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { MARKETING_BRAND as B, MARKETING_FONTS as F } from "../theme/brand";
import { Coins, Layers, Globe, Smartphone } from "lucide-react";

const FEATURES = [
  {
    title: "Gestión Financiera",
    desc: "Control total sobre las cuotas, inscripciones y pagos. Olvídate de los excels interminables.",
    icon: Coins,
    span: 2,
    color: "#CE8946",
    bgOffset: "rgba(206, 137, 70, 0.05)",
  },
  {
    title: "Bracket Generator",
    desc: "Crea y publica llaves de torneo (eliminatorias) en segundos con nuestra herramienta visual.",
    icon: Layers,
    span: 1,
    color: "#2FA56F",
    bgOffset: "rgba(47, 165, 111, 0.05)",
  },
  {
    title: "Portal Público En Vivo",
    desc: "Tus torneos tendrán su propia web automática para que aficionados y jugadores vean resultados en tiempo real.",
    icon: Globe,
    span: 1,
    color: "#1F1F1D",
    bgOffset: "rgba(31, 31, 29, 0.03)",
  },
  {
    title: "Experiencia Móvil Nativa",
    desc: "Toda la plataforma funciona a la perfección en el navegador de tu celular, como una app nativa.",
    icon: Smartphone,
    span: 2,
    color: "#CE8946",
    bgOffset: "rgba(206, 137, 70, 0.05)",
  }
];

function BentoCard({ feat, idx }) {
  const rectRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 400 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  function handleMouseMove(e) {
    if (!rectRef.current) return;
    const { left, top } = rectRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  }

  return (
    <motion.div
      ref={rectRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: idx * 0.1 }}
      style={{
        gridColumn: `span ${feat.span}`,
        background: B.surfaceStrong,
        borderRadius: 24,
        border: `1px solid ${B.border}`,
        padding: 40,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden"
      }}
      className="hz-bento-card"
    >
      {/* Tracking Glow Layer */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at var(--mouseX) var(--mouseY), rgba(206,137,70,0.06) 0%, transparent 50%)",
          opacity: 0,
          transition: "opacity 0.3s",
          pointerEvents: "none",
          zIndex: 1,
        }}
        className="hz-glow"
      />
      <motion.div style={{ position: "absolute", inset: 0, opacity: 0, zIndex: 0 }} 
        onUpdate={(latest) => {
          if (rectRef.current) {
            rectRef.current.style.setProperty('--mouseX', `${smoothMouseX.get()}px`);
            rectRef.current.style.setProperty('--mouseY', `${smoothMouseY.get()}px`);
          }
        }} 
      />

      <div style={{
        position: "absolute",
        top: 0, right: 0, bottom: 0, left: "50%",
        background: `linear-gradient(90deg, transparent 0%, ${feat.bgOffset} 100%)`,
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div style={{ 
        width: 48, 
        height: 48, 
        borderRadius: 14, 
        background: B.bg,
        border: `1px solid ${B.border}`,
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        color: feat.color,
        marginBottom: 24,
        position: "relative",
        zIndex: 2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
      }}>
        <feat.icon size={24} />
      </div>
      
      <h3 style={{
        fontSize: 22,
        fontWeight: 800,
        color: B.text,
        marginBottom: 12,
        fontFamily: F.display,
        position: "relative",
        zIndex: 2
      }}>
        {feat.title}
      </h3>
      
      <p style={{
        fontSize: 15,
        color: B.textMuted,
        lineHeight: 1.6,
        margin: 0,
        maxWidth: "85%",
        position: "relative",
        zIndex: 2
      }}>
        {feat.desc}
      </p>
    </motion.div>
  );
}

export default function BentoFeatures() {
  return (
    <section style={{
      padding: "100px 24px",
      background: B.bg,
      fontFamily: F.body,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{
            margin: 0,
            fontSize: "clamp(32px, 4vw, 44px)",
            fontFamily: F.display,
            fontWeight: 800,
            color: B.text,
            letterSpacing: "-0.02em",
          }}>
            Características Premium
          </h2>
          <p style={{
            marginTop: 16,
            fontSize: 18,
            color: B.textMuted,
            maxWidth: 600,
            margin: "16px auto 0"
          }}>
            Todo lo que necesitas para llevar tu organización deportiva al siguiente nivel de profesionalismo.
          </p>
        </div>

        <div className="bento-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          autoRows: "minmax(280px, auto)"
        }}>
          {FEATURES.map((feat, idx) => (
            <BentoCard key={idx} feat={feat} idx={idx} />
          ))}
        </div>

      </div>

      <style>{`
        .hz-bento-card:hover .hz-glow {
          opacity: 1 !important;
        }
        @media (max-width: 900px) {
          .bento-grid {
            grid-template-columns: 1fr !important;
          }
          .bento-grid > div {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </section>
  );
}
