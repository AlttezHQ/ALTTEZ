import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { usePageTitle } from "../../shared/hooks/usePageTitle";
import { MARKETING_BRAND as B, MARKETING_FONTS as F } from "../theme/brand";
import {
  RefreshCw, Clock, Layers, Target, Shield, Cloud, Users,
  CheckCircle, TrendingUp, Zap,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
};

const PROMISE_CARDS = [
  { value: "360°",            label: "Lectura integral del club y su operación",                                Icon: RefreshCw },
  { value: "24/7",            label: "Visibilidad continua para decisiones y seguimiento",                     Icon: Clock },
  { value: "Operación clara", label: "Estructura que alinea personas, procesos y objetivos",                   Icon: Layers },
  { value: "Criterio",        label: "Decisiones con contexto, prioridad y foco en lo que realmente importa", Icon: Target },
];

const PILLARS = [
  {
    n: "01", Icon: TrendingUp,
    title: "Operación con estructura",
    body: "Unificamos la coordinación entre dirección deportiva, cuerpo técnico, staff y administración en una sola lectura del club.",
  },
  {
    n: "02", Icon: Zap,
    title: "Decisiones con contexto",
    body: "Cada módulo traduce información en prioridad y criterio para reducir ruido y acelerar la toma de decisiones.",
  },
  {
    n: "03", Icon: Shield,
    title: "Presencia institucional",
    body: "ALTTEZ nace para organizaciones que entienden que la percepción del proyecto también se construye desde su operación.",
  },
];

const PRINCIPLES = [
  { Icon: Layers,       title: "Claridad",   body: "Interfaces que priorizan lo esencial y vuelven más legible la operación diaria." },
  { Icon: Target,       title: "Criterio",   body: "Cada detalle visual y verbal debe reforzar jerarquía, foco y percepción de control." },
  { Icon: CheckCircle,  title: "Confianza",  body: "Mensajes, decisiones y experiencias alineadas con compradores institucionales y proyectos serios." },
];

const TRUST = [
  { Icon: Shield,       label: "Datos seguros" },
  { Icon: Cloud,        label: "Acceso en la nube" },
  { Icon: Users,        label: "Multi-club" },
  { Icon: CheckCircle,  label: "Confiable y profesional" },
];

export default function QuienesSomos() {
  const navigate = useNavigate();
  usePageTitle("Sobre Nosotros");

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "qns-responsive";
    style.textContent = `
      .qns-hero-grid {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 56px;
        align-items: start;
      }
      .qns-pillars-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }
      .qns-principles-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }
      .qns-cta-grid {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 64px;
        align-items: center;
      }
      @media (max-width: 960px) {
        .qns-hero-grid { grid-template-columns: 1fr; gap: 36px; }
        .qns-cta-grid  { grid-template-columns: 1fr; gap: 28px; }
      }
      @media (max-width: 768px) {
        .qns-pillars-grid    { grid-template-columns: 1fr; }
        .qns-principles-grid { grid-template-columns: 1fr; }
        .qns-trust-strip     { flex-wrap: wrap; gap: 18px !important; justify-content: center; }
      }
      @media (max-width: 540px) {
        .qns-page section { padding-left: 20px !important; padding-right: 20px !important; }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (
    <div
      className="qns-page"
      style={{ minHeight: "100vh", background: B.bg, color: B.text, fontFamily: F.body }}
    >
      {/* ── Hero ── */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "80px 40px 40px" }}>
        <div className="qns-hero-grid">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            {/* "QUIENES SOMOS" label with dash */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
              <span style={{ width: 24, height: 1.5, background: B.primary, borderRadius: 2, display: "inline-block" }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.30em", color: B.primary }}>
                Quiénes somos
              </span>
            </div>

            <h1
              style={{
                margin: "0 0 20px",
                fontSize: "clamp(32px, 4.2vw, 58px)",
                lineHeight: 1.03,
                fontWeight: 900,
                letterSpacing: "-0.035em",
                fontFamily: F.display,
                color: B.text,
              }}
            >
              Diseñamos tecnología deportiva para proyectos que quieren ser tomados en serio.
            </h1>

            <p style={{ fontSize: 14, lineHeight: 1.75, color: B.textMuted, maxWidth: 520, margin: 0 }}>
              ALTTEZ nace para ordenar la operación del club y elevar su presencia institucional. Un sistema que combina estructura, criterio y tecnología para que cada decisión tenga impacto dentro y fuera de la cancha.
            </p>
          </motion.div>

          {/* Right — promise panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
          >
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.28em",
              color: B.textMuted,
              marginBottom: 12,
            }}>
              Nuestra promesa
            </div>

            {/* Unified 2×2 panel with internal dividers */}
            <div style={{
              borderRadius: 14,
              border: `1px solid ${B.border}`,
              background: B.cardBg,
              boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
            }}>
              {PROMISE_CARDS.map(({ value, label, Icon }, i) => {
                const borderRight = i % 2 === 0 ? `1px solid ${B.border}` : "none";
                const borderBottom = i < 2 ? `1px solid ${B.border}` : "none";
                return (
                  <motion.div
                    key={value}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.22 + i * 0.09 }}
                    whileHover={{ background: B.bgAlt }}
                    style={{ padding: "18px 16px", borderRight, borderBottom, transition: "background 0.2s" }}
                  >
                    <Icon size={14} color={B.primary} style={{ marginBottom: 9, display: "block" }} />
                    <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.03em", color: B.text, lineHeight: 1.1, marginBottom: 5 }}>
                      {value}
                    </div>
                    <div style={{ fontSize: 11, color: B.textMuted, lineHeight: 1.5 }}>{label}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── Pillars ── */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px 14px" }}>
        <div className="qns-pillars-grid">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.n}
              {...fadeUp}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
              style={{
                padding: "22px 20px",
                borderRadius: 14,
                background: B.cardBg,
                border: `1px solid ${B.border}`,
                boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                cursor: "default",
              }}
            >
              <p.Icon size={16} color={B.primary} style={{ marginBottom: 10, display: "block" }} />
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color: B.primary,
                marginBottom: 8,
              }}>
                Pilar {p.n}
              </div>
              <div style={{
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: B.text,
                marginBottom: 8,
                lineHeight: 1.25,
              }}>
                {p.title}
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: B.textMuted }}>{p.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Principles ── */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px 60px" }}>
        <div className="qns-principles-grid">
          {PRINCIPLES.map(({ Icon, title, body }, i) => (
            <motion.div
              key={title}
              {...fadeUp}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
              style={{
                padding: "20px",
                borderRadius: 14,
                background: B.cardBg,
                border: `1px solid ${B.border}`,
                boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                cursor: "default",
              }}
            >
              <Icon size={15} color={B.primary} style={{ marginBottom: 10, display: "block" }} />
              <div style={{ fontSize: 15, fontWeight: 800, color: B.text, marginBottom: 6 }}>{title}</div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: B.textMuted }}>{body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA — light background, dark text ── */}
      <section style={{
        background: B.bg,
        borderTop: `1px solid ${B.border}`,
        borderBottom: `1px solid ${B.border}`,
      }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "56px 40px" }}>
          <div className="qns-cta-grid">
            <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "clamp(26px, 3.4vw, 48px)",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.05,
                  color: B.text,
                  fontFamily: F.display,
                }}
              >
                Si el proyecto aspira a jugar en otra liga, su operación también tiene que dar esa señal.
              </h2>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }}>
              <p style={{ margin: "0 0 24px", fontSize: 14, lineHeight: 1.8, color: B.textMuted }}>
                Podemos ayudarte a ordenar la experiencia del club, fortalecer la percepción institucional del proyecto y construir una plataforma que respalde con hechos la ambición que comunicas.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <motion.button
                  onClick={() => navigate("/contacto")}
                  whileHover={{ scale: 1.04, boxShadow: `0 14px 32px ${B.primaryGlowStrong}` }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 8,
                    border: "none",
                    background: `linear-gradient(135deg, ${B.primary} 0%, ${B.primaryHover} 100%)`,
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    cursor: "pointer",
                    boxShadow: `0 6px 20px ${B.primaryGlow}`,
                    fontFamily: F.body,
                  }}
                >
                  Solicitar demo
                </motion.button>
                <motion.button
                  onClick={() => navigate("/journal")}
                  whileHover={{ scale: 1.03, borderColor: B.primary, color: B.primary }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 8,
                    border: `1.5px solid ${B.borderStrong}`,
                    background: "transparent",
                    color: B.text,
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    cursor: "pointer",
                    fontFamily: F.body,
                  }}
                >
                  Leer Journal
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px 72px" }}>
        <div
          className="qns-trust-strip"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
            paddingTop: 28,
          }}
        >
          {TRUST.map(({ Icon, label }) => (
            <div key={label} style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: 12,
              fontWeight: 600,
              color: B.textMuted,
            }}>
              <Icon size={13} color={B.primary} />
              {label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
