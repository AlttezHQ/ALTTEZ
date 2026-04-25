import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Calendar, Dumbbell, Users, Wallet } from "lucide-react";
import { MARKETING_BRAND as B, MARKETING_FONTS as F } from "../theme/brand";

const COPPER = B.primary;

const MODULES = [
  {
    Icon: Dumbbell,
    label: "Entrenamiento",
    body: "Planificación de sesiones, control de carga y test físicos en un solo flujo.",
    to: "/servicios/sports-crm",
  },
  {
    Icon: Users,
    label: "Plantilla",
    body: "Perfiles, roles, disponibilidad y estructura por categoría del plantel completo.",
    to: "/servicios/sports-crm",
  },
  {
    Icon: Calendar,
    label: "Calendario",
    body: "Partidos, sesiones y logística centralizada con confirmaciones integradas.",
    to: "/servicios/sports-crm",
  },
  {
    Icon: Wallet,
    label: "Finanzas",
    body: "Cobranzas, cuotas y estado financiero del club en tiempo real.",
    to: "/servicios/sports-crm",
  },
  {
    Icon: BarChart3,
    label: "Rendimiento",
    body: "Métricas, carga física y análisis de partidos para decisiones más claras.",
    to: "/servicios/sports-crm",
  },
];

export default function ModulesSection() {
  const navigate = useNavigate();

  useEffect(() => {
    const el = document.createElement("style");
    el.id = "modules-styles";
    el.textContent = `
      .mod-card {
        transition: transform 0.20s ease, box-shadow 0.20s ease;
      }
      .mod-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 48px rgba(0,0,0,0.09) !important;
      }
      .mod-ver-mas {
        transition: color 0.18s ease, gap 0.18s ease;
      }
      .mod-ver-mas:hover {
        color: #C9973A !important;
      }
      @media (max-width: 1100px) {
        .mod-grid { grid-template-columns: repeat(3, 1fr) !important; }
      }
      @media (max-width: 700px) {
        .mod-section { padding: 64px 20px 72px !important; }
        .mod-grid   { grid-template-columns: repeat(2, 1fr) !important; }
      }
      @media (max-width: 460px) {
        .mod-section { padding: 48px 16px 56px !important; }
        .mod-grid   { grid-template-columns: 1fr !important; }
      }
    `;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  return (
    <section
      className="mod-section"
      style={{ padding: "96px 56px 112px", fontFamily: F.body }}
    >
      <div style={{ maxWidth: 1468, margin: "0 auto" }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <div style={{
            fontSize: 10.5, fontWeight: 700, letterSpacing: "2.5px",
            textTransform: "uppercase", color: B.textMuted, marginBottom: 22,
          }}>
            Módulos destacados
          </div>
          <h2 style={{
            margin: 0, color: B.text,
            fontSize: "clamp(24px, 3.0vw, 44px)",
            fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.08,
            fontFamily: F.display,
          }}>
            Todo lo que tu club necesita para operar con excelencia
            <span style={{ color: COPPER }}>.</span>
          </h2>
        </motion.div>

        {/* ── Module cards ── */}
        <div
          className="mod-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 20 }}
        >
          {MODULES.map(({ Icon, label, body, to }, i) => (
            <motion.div
              key={label}
              className="mod-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.46, delay: i * 0.08 }}
              style={{
                borderRadius: 22,
                padding: "28px 24px",
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.07)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Icon container — matches mockup: ~64px warm-tinted box */}
              <div style={{
                width: 64, height: 64, borderRadius: 14,
                background: "#FBF5EA",
                border: "1.5px solid rgba(201,151,58,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20, flexShrink: 0,
              }}>
                <Icon size={28} color={COPPER} strokeWidth={1.5} />
              </div>

              {/* Title */}
              <div style={{
                color: B.text, fontSize: 17, fontWeight: 800,
                letterSpacing: "-0.02em", marginBottom: 10,
              }}>
                {label}
              </div>

              {/* Body */}
              <p style={{
                margin: "0 0 20px", color: B.textMuted,
                fontSize: 13, lineHeight: 1.68, flex: 1,
              }}>
                {body}
              </p>

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(0,0,0,0.07)", marginBottom: 16 }} />

              {/* Ver más → link */}
              <button
                className="mod-ver-mas"
                onClick={() => navigate(to)}
                style={{
                  background: "none", border: "none", padding: 0,
                  color: B.text, fontSize: 13, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  fontFamily: F.body, textAlign: "left",
                }}
              >
                Ver más <span aria-hidden="true">→</span>
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
