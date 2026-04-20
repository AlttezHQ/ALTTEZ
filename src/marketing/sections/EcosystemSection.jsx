import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MARKETING_BRAND as B, MARKETING_GRADIENTS as G } from "../theme/brand";

const SOLUTIONS = [
  {
    title: "ALTTEZ CRM",
    status: "Disponible",
    description: "El sistema operativo del club. Plantilla, entrenamiento, calendario, pagos y analítica en un entorno diseñado para decidir, no para administrar.",
    points: ["9 módulos conectados", "Dashboard ejecutivo en vivo", "Tablero táctico broadcast-grade"],
    to: "/servicios/sports-crm",
  },
  {
    title: "ALTTEZ Journal",
    status: "Activo",
    description: "Capa editorial del ecosistema. Visión de producto, lecturas sobre gestión deportiva moderna y decisiones que dan forma al futuro de ALTTEZ.",
    points: ["Notas de producto", "Tesis de industria", "Historial de releases"],
    to: "/journal",
  },
  {
    title: "ALTTEZ Advisory",
    status: "Próximamente",
    description: "Consultoría para clubes que quieren dejar el caos operativo atrás. Diagnóstico, rediseño de procesos y profesionalización estructurada.",
    points: ["Auditoría operativa", "Rediseño de procesos", "Implementación acompañada"],
    to: "/contacto",
  },
];

export default function EcosystemSection() {
  const navigate = useNavigate();

  return (
    <section style={{ padding: "100px 24px", maxWidth: 1180, margin: "0 auto" }}>

      {/* Section header — viewport entrance */}
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: "center", marginBottom: 58 }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 16px",
            borderRadius: 999,
            background: B.primarySoft,
            border: `1px solid ${B.border}`,
            color: "#C7D6FF",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: 22,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <motion.span
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            style={{ width: 5, height: 5, borderRadius: "50%", background: "#60A5FA", display: "block" }}
          />
          Ecosistema ALTTEZ
        </div>

        <h2
          style={{
            margin: "0 0 18px",
            color: B.text,
            fontSize: "clamp(30px, 4.4vw, 54px)",
            lineHeight: 1.02,
            letterSpacing: "-0.04em",
            fontWeight: 800,
            fontFamily: "'Orbitron', 'Exo 2', Arial, sans-serif",
            textTransform: "uppercase",
          }}
        >
          Una marca. Un sistema.
          <br />
          <span
            style={{
              background: "linear-gradient(100deg, #7BABFF 0%, #AFC6FF 48%, #DCE7FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Múltiples frentes conectados.
          </span>
        </h2>

        <p style={{ maxWidth: 680, margin: "0 auto", color: B.textMuted, fontSize: 16, lineHeight: 1.8 }}>
          ALTTEZ no es un software con features. Es una dirección operativa para clubes que dejaron de resolver con planillas, WhatsApp y decisiones por intuición.
        </p>
      </motion.div>

      {/* Cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {SOLUTIONS.map((solution, index) => (
          <motion.div
            key={solution.title}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.62, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{
              y: -8,
              boxShadow: "0 36px 80px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(47,107,255,0.26)",
            }}
            style={{
              borderRadius: 24,
              padding: 26,
              background: G.panel,
              border: `1px solid ${B.border}`,
              boxShadow: "0 18px 48px rgba(0,0,0,0.34)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Status badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "5px 12px",
                borderRadius: 999,
                background: B.primarySoft,
                border: `1px solid rgba(96,165,250,0.16)`,
                color: "#C7D6FF",
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.3px",
                marginBottom: 18,
                width: "fit-content",
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#60A5FA", display: "block", flexShrink: 0 }} />
              {solution.status}
            </div>

            <h3
              style={{
                margin: "0 0 12px",
                color: B.text,
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                fontFamily: "'Orbitron', 'Exo 2', Arial, sans-serif",
              }}
            >
              {solution.title}
            </h3>

            <p style={{ margin: "0 0 20px", color: B.textMuted, fontSize: 13, lineHeight: 1.75, flex: 1 }}>
              {solution.description}
            </p>

            <div style={{ display: "grid", gap: 10, marginBottom: 26 }}>
              {solution.points.map((point) => (
                <div key={point} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: B.primary,
                      boxShadow: `0 0 10px ${B.primaryGlow}`,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: B.textHint, fontSize: 12 }}>{point}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{
                scale: 1.02,
                background: "rgba(47,107,255,0.08)",
                boxShadow: `0 0 22px ${B.primaryGlow}`,
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              onClick={() => navigate(solution.to)}
              style={{
                width: "100%",
                padding: "13px 16px",
                borderRadius: 12,
                border: `1px solid ${B.borderStrong}`,
                background: "rgba(255,255,255,0.018)",
                color: B.text,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Ver más
            </motion.button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
