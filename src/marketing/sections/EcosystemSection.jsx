import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MARKETING_BRAND as B, MARKETING_GRADIENTS as G } from "../theme/brand";

const SOLUTIONS = [
  {
    title: "ALTTEZ CRM",
    status: "Disponible",
    description: "La capa central para operación diaria, control de plantilla, planificación, calendario y seguimiento ejecutivo del club.",
    points: ["Gestión integral", "Vista operativa clara", "Módulos conectados"],
    to: "/servicios/sports-crm",
  },
  {
    title: "ALTTEZ Journal",
    status: "Activo",
    description: "Una capa editorial para visión de producto, decisiones del ecosistema y análisis sobre deporte y gestión moderna.",
    points: ["Actualizaciones", "Visión estratégica", "Lanzamientos"],
    to: "/journal",
  },
  {
    title: "ALTTEZ Advisory",
    status: "Próximamente",
    description: "Acompañamiento para clubes que necesitan ordenar procesos, definir operación y profesionalizar su estructura interna.",
    points: ["Operación", "Procesos", "Diagnóstico"],
    to: "/contacto",
  },
];

export default function EcosystemSection() {
  const navigate = useNavigate();

  return (
    <section style={{ padding: "92px 24px", maxWidth: 1180, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            borderRadius: 999,
            background: B.primarySoft,
            border: `1px solid ${B.border}`,
            color: "#C7D6FF",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Ecosistema ALTTEZ
        </div>
        <h2
          style={{
            margin: "0 0 14px",
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
          Múltiples frentes conectados.
        </h2>
        <p style={{ maxWidth: 720, margin: "0 auto", color: B.textMuted, fontSize: 16, lineHeight: 1.75 }}>
          ALTTEZ no es una colección de herramientas separadas. Es una dirección operativa clara para clubes que quieren trabajar con más estructura, mejor comunicación y mayor control.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 18,
        }}
      >
        {SOLUTIONS.map((solution, index) => (
          <motion.div
            key={solution.title}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.52, delay: index * 0.08 }}
            whileHover={{ y: -6 }}
            style={{
              borderRadius: 24,
              padding: 24,
              background: G.panel,
              border: `1px solid ${B.border}`,
              boxShadow: "0 18px 48px rgba(0,0,0,0.28)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 10px",
                borderRadius: 999,
                background: B.primarySoft,
                border: `1px solid rgba(96,165,250,0.2)`,
                color: "#C7D6FF",
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.3px",
                marginBottom: 16,
              }}
            >
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

            <p style={{ margin: "0 0 18px", color: B.textMuted, fontSize: 13, lineHeight: 1.7 }}>{solution.description}</p>

            <div style={{ display: "grid", gap: 8, marginBottom: 22 }}>
              {solution.points.map((point) => (
                <div key={point} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: B.primary,
                      boxShadow: `0 0 12px ${B.primaryGlow}`,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: B.textHint, fontSize: 11 }}>{point}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(solution.to)}
              style={{
                width: "100%",
                padding: "13px 16px",
                borderRadius: 12,
                border: `1px solid ${B.borderStrong}`,
                background: "rgba(255,255,255,0.02)",
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
