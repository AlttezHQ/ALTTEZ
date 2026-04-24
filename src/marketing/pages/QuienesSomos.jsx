import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { usePageTitle } from "../../shared/hooks/usePageTitle";
import { MARKETING_BRAND as B, MARKETING_GRADIENTS as G } from "../theme/brand";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
};

const STORY_PILLARS = [
  {
    title: "Operacion con estructura",
    body: "Unificamos la coordinacion entre direccion deportiva, cuerpo tecnico, staff y administracion en una sola lectura del club.",
  },
  {
    title: "Decisiones con contexto",
    body: "Cada modulo traduce informacion en prioridad y criterio para reducir ruido y acelerar la toma de decisiones.",
  },
  {
    title: "Presencia institucional",
    body: "ALTTEZ nace para organizaciones que entienden que la percepcion del proyecto tambien se construye desde su operacion.",
  },
];

const PRINCIPLES = [
  ["Claridad", "Interfaces que priorizan lo esencial y vuelven mas legible la operacion diaria."],
  ["Criterio", "Cada detalle visual y verbal debe reforzar jerarquia, foco y percepcion de control."],
  ["Confianza", "Mensajes, decisiones y experiencias alineadas con compradores institucionales y proyectos serios."],
];

function SectionEyebrow({ children }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.24em",
        color: B.warning,
      }}
    >
      <span style={{ width: 28, height: 1, background: B.warning, opacity: 0.7 }} />
      {children}
    </div>
  );
}

function MetricCard({ value, label }) {
  return (
    <div
      style={{
        padding: "22px 20px",
        borderRadius: 24,
        background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        border: `1px solid ${B.border}`,
        boxShadow: "0 18px 50px rgba(0,0,0,0.24)",
      }}
    >
      <div style={{ fontSize: 34, fontWeight: 800, color: B.text }}>{value}</div>
      <div style={{ fontSize: 13, color: B.textHint, lineHeight: 1.6 }}>{label}</div>
    </div>
  );
}

export default function QuienesSomos() {
  const navigate = useNavigate();
  usePageTitle("Quienes Somos");

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @media (max-width: 900px) {
        .about-hero-grid,
        .about-story-grid,
        .about-principles-grid,
        .about-cta-grid {
          grid-template-columns: 1fr !important;
        }
      }
      @media (max-width: 640px) {
        .about-page section {
          padding-left: 20px !important;
          padding-right: 20px !important;
        }
        .about-stats-grid {
          grid-template-columns: 1fr 1fr !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (
    <div
      className="about-page"
      style={{
        minHeight: "100vh",
        color: B.text,
        background: G.hero,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 20%, rgba(47,107,255,0.2), transparent 24%), radial-gradient(circle at 82% 78%, rgba(147,180,255,0.1), transparent 22%)",
          pointerEvents: "none",
        }}
      />

      <section
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1240,
          margin: "0 auto",
          padding: "84px 32px 40px",
        }}
      >
        <div
          className="about-hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 32,
            alignItems: "stretch",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ padding: "40px 0 28px" }}
          >
            <SectionEyebrow>Quienes somos</SectionEyebrow>
            <h1
              style={{
                margin: "20px 0 20px",
                fontSize: "clamp(44px, 8vw, 86px)",
                lineHeight: 0.96,
                fontWeight: 800,
                letterSpacing: "-0.06em",
                fontFamily: "'Orbitron', 'Exo 2', Arial, sans-serif",
                maxWidth: 760,
              }}
            >
              Diseñamos tecnologia deportiva para proyectos que quieren ser tomados en serio.
            </h1>
            <p
              style={{
                maxWidth: 620,
                fontSize: 18,
                lineHeight: 1.8,
                color: B.textMuted,
              }}
            >
              ALTTEZ no nace para decorar dashboards. Nace para darle estructura al dia a dia del club, elevar la forma en que se coordina el trabajo y proyectar una imagen institucional acorde con la ambicion del proyecto.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 28 }}>
              <button
                onClick={() => navigate("/contacto")}
                style={{
                  padding: "15px 24px",
                  borderRadius: 999,
                  border: "none",
                  background: G.button,
                  color: "white",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  boxShadow: `0 16px 40px ${B.primaryGlow}`,
                }}
              >
                Hablar con ALTTEZ
              </button>
              <button
                onClick={() => navigate("/servicios/sports-crm")}
                style={{
                  padding: "15px 24px",
                  borderRadius: 999,
                  border: `1px solid ${B.borderStrong}`,
                  background: "rgba(255,255,255,0.02)",
                  color: B.text,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Ver plataforma
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            style={{
              position: "relative",
              padding: 28,
              borderRadius: 32,
              background: G.panel,
              border: `1px solid ${B.border}`,
              boxShadow: "0 28px 90px rgba(0,0,0,0.45)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(47,107,255,0.18) 0%, transparent 45%), radial-gradient(circle at 88% 18%, rgba(147,180,255,0.18), transparent 22%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: B.warning }}>
                    Brand brief
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>ALTTEZ</div>
                </div>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    background: "rgba(47,107,255,0.14)",
                    border: `1px solid ${B.borderStrong}`,
                    display: "grid",
                    placeItems: "center",
                    color: B.primary,
                    fontSize: 22,
                    fontWeight: 800,
                  }}
                >
                  A
                </div>
              </div>

              <div style={{ display: "grid", gap: 14 }}>
                {[
                  "Lenguaje claro para compradores institucionales.",
                  "Jerarquia visual pensada para dirigir la lectura.",
                  "Una marca que comunica estructura, no improvisacion.",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 18,
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${B.border}`,
                      color: B.textMuted,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="about-stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>
                <MetricCard value="360°" label="Lectura integral del club y su operacion" />
                <MetricCard value="24/7" label="Visibilidad continua para decisiones y seguimiento" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 1, maxWidth: 1240, margin: "0 auto", padding: "32px 32px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 18 }}>
          {STORY_PILLARS.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              {...fadeUp}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              style={{
                padding: 24,
                borderRadius: 24,
                background: "rgba(255,255,255,0.028)",
                border: `1px solid ${B.border}`,
                boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
              }}
            >
              <div style={{ fontSize: 13, color: B.warning, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                Pilar {String(index + 1).padStart(2, "0")}
              </div>
              <div style={{ marginTop: 14, fontSize: 24, fontWeight: 700, lineHeight: 1.15 }}>{pillar.title}</div>
              <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.75, color: B.textMuted }}>{pillar.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 1, maxWidth: 1240, margin: "0 auto", padding: "48px 32px 72px" }}>
        <div className="about-story-grid" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 28 }}>
          <motion.div
            {...fadeUp}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            style={{
              padding: 30,
              borderRadius: 28,
              background: "rgba(255,255,255,0.025)",
              border: `1px solid ${B.border}`,
            }}
          >
            <SectionEyebrow>Posicionamiento</SectionEyebrow>
            <h2
              style={{
                margin: "18px 0 14px",
                fontSize: "clamp(28px, 5vw, 48px)",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                fontFamily: "'Orbitron', 'Exo 2', Arial, sans-serif",
              }}
            >
              La marca tiene que sostener la promesa del producto.
            </h2>
            <p style={{ color: B.textMuted, lineHeight: 1.8, fontSize: 16 }}>
              El paso a ALTTEZ no es solo un cambio de nombre. Es una definicion de posicionamiento para hablarle con mas precision a clubes, ligas e instituciones que compran con criterio y esperan estructura.
            </p>
          </motion.div>

          <div className="about-principles-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
            {PRINCIPLES.map(([title, body], index) => (
              <motion.div
                key={title}
                {...fadeUp}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                style={{
                  padding: 22,
                  borderRadius: 22,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                  border: `1px solid ${B.border}`,
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
                <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.7, color: B.textMuted }}>{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 1, maxWidth: 1240, margin: "0 auto", padding: "0 32px 96px" }}>
        <div
          className="about-cta-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "0.95fr 1.05fr",
            gap: 20,
            padding: 28,
            borderRadius: 30,
            background: "linear-gradient(135deg, rgba(11,18,32,0.96) 0%, rgba(8,14,24,0.88) 100%)",
            border: `1px solid ${B.borderStrong}`,
            boxShadow: "0 30px 90px rgba(0,0,0,0.38)",
          }}
        >
          <div>
            <SectionEyebrow>Siguiente paso</SectionEyebrow>
            <h3
              style={{
                margin: "18px 0 12px",
                fontSize: "clamp(30px, 5vw, 52px)",
                lineHeight: 0.98,
                fontWeight: 800,
                letterSpacing: "-0.05em",
                fontFamily: "'Orbitron', 'Exo 2', Arial, sans-serif",
              }}
            >
              Si el proyecto aspira a jugar en otra liga, su operacion tambien tiene que dar esa señal.
            </h3>
          </div>
          <div style={{ display: "grid", gap: 16, alignContent: "center" }}>
            <p style={{ fontSize: 16, lineHeight: 1.85, color: B.textMuted, margin: 0 }}>
              Podemos ayudarte a ordenar la experiencia del club, fortalecer la percepcion institucional del proyecto y construir una plataforma que respalde con hechos la ambicion que comunicas.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/contacto")}
                style={{
                  padding: "15px 24px",
                  borderRadius: 999,
                  border: "none",
                  background: G.button,
                  color: "white",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Solicitar reunion
              </button>
              <button
                onClick={() => navigate("/journal")}
                style={{
                  padding: "15px 24px",
                  borderRadius: 999,
                  border: `1px solid ${B.borderStrong}`,
                  background: "transparent",
                  color: B.text,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Leer journal
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
