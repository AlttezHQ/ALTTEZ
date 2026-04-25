import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Compass, Layers } from "lucide-react";
import { MARKETING_BRAND as B, MARKETING_FONTS as F } from "../theme/brand";

const COPPER      = B.primary;
const COPPER_SOFT = "rgba(201,151,58,0.09)";
const COPPER_BDR  = "rgba(201,151,58,0.20)";

const STATUS_MAP = {
  Disponible:   { dot: "#2f9666", text: "#1a7a50", bg: "rgba(47,150,102,0.08)",  bdr: "rgba(47,150,102,0.20)" },
  Activo:       { dot: COPPER,    text: "#8B6020", bg: COPPER_SOFT,              bdr: COPPER_BDR },
  Próximamente: { dot: "#9ca3af", text: "#6b7280", bg: "rgba(156,163,175,0.08)", bdr: "rgba(156,163,175,0.18)" },
};

const SOLUTIONS = [
  {
    Icon: Layers,
    title: "ALTTEZ CRM",
    status: "Disponible",
    description: "La plataforma central del club. Operación deportiva, coordinación diaria y control administrativo en una sola capa de trabajo.",
    points: ["Módulos conectados", "Vista ejecutiva del club", "Flujo operativo unificado"],
    to: "/servicios/sports-crm",
  },
  {
    Icon: BookOpen,
    title: "ALTTEZ Journal",
    status: "Activo",
    description: "La capa editorial de la marca. Ideas, criterio y perspectiva sobre gestión deportiva, producto y profesionalización institucional.",
    points: ["Punto de vista de marca", "Lecturas de industria", "Narrativa de producto"],
    to: "/journal",
  },
  {
    Icon: Compass,
    title: "ALTTEZ Advisory",
    status: "Próximamente",
    description: "Acompañamiento para organizaciones que necesitan ordenar procesos, elevar su operación y ejecutar una transformación con más disciplina.",
    points: ["Diagnóstico operativo", "Rediseño de procesos", "Implementación guiada"],
    to: "/contacto",
  },
];

export default function EcosystemSection() {
  const navigate = useNavigate();

  useEffect(() => {
    const el = document.createElement("style");
    el.id = "ecosystem-styles";
    el.textContent = `
      .eco-sol-card {
        transition: transform 0.22s ease, box-shadow 0.22s ease;
      }
      .eco-sol-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 24px 56px rgba(0,0,0,0.10) !important;
      }
      .eco-cta {
        transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
      }
      .eco-cta:hover {
        background: #F6EFE7 !important;
        border-color: rgba(201,151,58,0.30) !important;
        color: #8B6020 !important;
      }
      @media (max-width: 1100px) {
        .eco-sol-grid { grid-template-columns: repeat(2, 1fr) !important; }
      }
      @media (max-width: 700px) {
        .eco-section  { padding: 64px 20px 72px !important; }
        .eco-sol-grid { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 460px) {
        .eco-section { padding: 48px 16px 56px !important; }
      }
    `;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  return (
    <section
      className="eco-section"
      style={{ padding: "96px 56px 112px", fontFamily: F.body }}
    >
      <div style={{ maxWidth: 1468, margin: "0 auto" }}>

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 999,
            background: COPPER_SOFT, border: `1px solid ${COPPER_BDR}`,
            color: "#8B6020", fontSize: 10, fontWeight: 700,
            letterSpacing: "1.6px", textTransform: "uppercase", marginBottom: 24,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: COPPER, flexShrink: 0 }} />
            Ecosistema ALTTEZ
          </div>

          <h2 style={{
            margin: "0 0 18px", color: B.text,
            fontSize: "clamp(26px, 3.6vw, 48px)",
            lineHeight: 1.06, letterSpacing: "-0.04em",
            fontWeight: 800, fontFamily: F.display,
          }}>
            Una marca. Un sistema.{" "}
            <span style={{ color: COPPER }}>Un ecosistema con criterio.</span>
          </h2>

          <p style={{
            maxWidth: 600, margin: "0 auto",
            color: B.textMuted,
            fontSize: "clamp(14px, 1.2vw, 16px)",
            lineHeight: 1.78,
          }}>
            ALTTEZ no compite por acumular funcionalidades. Compite por ofrecer una operación más clara,
            una mejor lectura del club y una presencia digital coherente con proyectos serios.
          </p>
        </motion.div>

        {/* ── Solutions grid ── */}
        <div
          className="eco-sol-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}
        >
          {SOLUTIONS.map(({ Icon, title, status, description, points, to }, i) => {
            const sc = STATUS_MAP[status] ?? STATUS_MAP.Próximamente;
            return (
              <motion.div
                key={title}
                className="eco-sol-card"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.58, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  borderRadius: 22, padding: "28px",
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 10px 32px rgba(0,0,0,0.06)",
                  display: "flex", flexDirection: "column",
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 46, height: 46, borderRadius: 13,
                  background: COPPER_SOFT, border: `1px solid ${COPPER_BDR}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20,
                }}>
                  <Icon size={20} color={COPPER} strokeWidth={1.8} />
                </div>

                {/* Status */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "4px 11px", borderRadius: 999,
                  background: sc.bg, border: `1px solid ${sc.bdr}`,
                  color: sc.text, fontSize: 9, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "1.2px",
                  marginBottom: 14, width: "fit-content",
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />
                  {status}
                </div>

                <h3 style={{
                  margin: "0 0 10px", color: B.text,
                  fontSize: 20, fontWeight: 800,
                  letterSpacing: "-0.03em", fontFamily: F.display,
                }}>
                  {title}
                </h3>

                <p style={{ margin: "0 0 20px", color: B.textMuted, fontSize: 13.5, lineHeight: 1.72, flex: 1 }}>
                  {description}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                  {points.map((pt) => (
                    <div key={pt} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: COPPER, flexShrink: 0 }} />
                      <span style={{ color: B.textMuted, fontSize: 12.5 }}>{pt}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="eco-cta"
                  onClick={() => navigate(to)}
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.10)",
                    background: "rgba(0,0,0,0.025)", color: B.text,
                    fontSize: 11, fontWeight: 700, letterSpacing: "1.2px",
                    textTransform: "uppercase", cursor: "pointer", fontFamily: F.body,
                  }}
                >
                  Conocer más
                </button>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
