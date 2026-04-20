import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MARKETING_BRAND as B, MARKETING_GRADIENTS as G } from "../theme/brand";

const BRAND_SYMBOL = "/branding/alttez-symbol-transparent.png";

const PARTICLES = [
  { left: 10, top: 20, size: 3 },
  { left: 85, top: 15, size: 4 },
  { left: 30, top: 80, size: 3 },
  { left: 60, top: 40, size: 5 },
  { left: 15, top: 60, size: 3 },
  { left: 75, top: 75, size: 4 },
  { left: 45, top: 25, size: 3 },
  { left: 90, top: 50, size: 4 },
  { left: 25, top: 45, size: 3 },
  { left: 68, top: 88, size: 3 },
  { left: 50, top: 65, size: 5 },
  { left: 5,  top: 85, size: 3 },
];

const TRUST_ITEMS = [
  "Menos coordinación, más entrenamiento",
  "Decisiones con datos, no con intuición",
  "Imagen profesional para tu club",
];

const DASHBOARD_KPIS = [
  { label: "Plantilla", value: "32", note: "Jugadores activos" },
  { label: "Sesiones", value: "14", note: "Esta semana" },
  { label: "Asistencia", value: "96%", note: "Últimas 4 semanas" },
  { label: "Módulos", value: "9", note: "Un solo entorno" },
];

const FLOW = [
  ["Dirección deportiva", "Visión ejecutiva del club: KPIs, riesgos y decisiones sin cruzar planillas."],
  ["Cuerpo técnico", "Sesiones, cargas y disponibilidad del plantel en tiempo real."],
  ["Administración", "Pagos, calendario y trazabilidad del club bajo un mismo sistema."],
];

function BrandGlyph({ size = 22, glow = false }) {
  return (
    <img
      src={BRAND_SYMBOL}
      alt="ALTTEZ"
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: glow
          ? `invert(1) brightness(1.45) contrast(1.1) drop-shadow(0 0 18px ${B.primaryGlow})`
          : "invert(1) brightness(1.45) contrast(1.1)",
        opacity: 0.98,
      }}
    />
  );
}

export default function HeroSection() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const gridY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.08]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @media (max-width: 1024px) {
        .alttez-hero-top {
          grid-template-columns: 1fr !important;
          gap: 28px !important;
        }
        .alttez-hero-float {
          right: 12px !important;
        }
      }
      @media (max-width: 768px) {
        .alttez-hero-section {
          padding: 88px 20px 56px !important;
        }
        .alttez-hero-title {
          font-size: clamp(38px, 15vw, 66px) !important;
        }
        .alttez-hero-actions {
          flex-direction: column !important;
          align-items: stretch !important;
        }
        .alttez-hero-actions button {
          width: 100% !important;
          justify-content: center !important;
        }
        .alttez-hero-browser {
          width: 100% !important;
        }
        .alttez-hero-kpis {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
        .alttez-hero-float {
          position: relative !important;
          right: auto !important;
          bottom: auto !important;
          margin: 18px auto 0 !important;
        }
      }
      @media (max-width: 520px) {
        .alttez-hero-kpis {
          grid-template-columns: 1fr !important;
        }
        .alttez-hero-banner {
          padding: 10px !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (
    <section
      ref={ref}
      className="alttez-hero-section"
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        padding: "110px 24px 90px",
        background: G.hero,
      }}
    >
      {/* Fine grid — small cells */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.2,
          y: gridY,
          pointerEvents: "none",
        }}
      />
      {/* Macro grid — large cells for depth */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px)",
          backgroundSize: "192px 192px",
          opacity: 0.28,
          y: gridY,
          pointerEvents: "none",
        }}
      />

      {/* Ambient glow — fades on scroll */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(47,107,255,0.2), transparent 28%), radial-gradient(ellipse at 88% 82%, rgba(20,50,180,0.1), transparent 22%)",
          opacity: glowOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Edge vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Particles */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {PARTICLES.map((p, i) => (
          <motion.div
            key={`${p.left}-${p.top}`}
            animate={{
              y: [0, -(18 + i * 3), 0],
              opacity: [0.1, 0.45 + (i % 3) * 0.12, 0.1],
            }}
            transition={{
              duration: 3.4 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.18,
            }}
            style={{
              position: "absolute",
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: i % 3 === 0 ? "#7BABFF" : i % 3 === 1 ? "#AFC6FF" : "#9DBBFF",
              boxShadow: `0 0 ${8 + p.size * 4}px ${B.primaryGlow}`,
            }}
          />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1280, margin: "0 auto" }}>

        {/* Banner pill */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}
        >
          <div
            className="alttez-hero-banner"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 14px",
              borderRadius: 999,
              background: "rgba(6,10,20,0.82)",
              border: `1px solid ${B.border}`,
              boxShadow: "0 18px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
              flexWrap: "wrap",
              justifyContent: "center",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 12px",
                borderRadius: 999,
                background: B.primarySoft,
                color: "#DCE7FF",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              <BrandGlyph size={12} />
              ALTTEZ
            </span>
            <span style={{ color: B.textMuted, fontSize: 13 }}>
              Sistema operativo para clubes de alto rendimiento — orden, datos y presencia profesional en un solo entorno.
            </span>
          </div>
        </motion.div>

        {/* Two-column layout */}
        <div
          className="alttez-hero-top"
          style={{
            display: "grid",
            gridTemplateColumns: "1.02fr 0.98fr",
            gap: 42,
            alignItems: "center",
          }}
        >
          {/* Left: headline + trust */}
          <motion.div
            initial={{ opacity: 0, x: -38 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1
              className="alttez-hero-title"
              style={{
                margin: "0 0 26px",
                fontSize: "clamp(48px, 7vw, 92px)",
                fontWeight: 800,
                lineHeight: 0.94,
                letterSpacing: "-0.06em",
                fontFamily: "'Orbitron', 'Exo 2', Arial, sans-serif",
                color: B.text,
                textTransform: "uppercase",
              }}
            >
              <span style={{ display: "block" }}>La capa operativa</span>
              <span style={{ display: "block" }}>para clubes</span>
              <span
                style={{
                  display: "block",
                  background: "linear-gradient(100deg, #7BABFF 0%, #AFC6FF 48%, #DCE7FF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                de alto rendimiento.
              </span>
            </h1>

            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", color: B.textHint, fontSize: 13 }}>
              {TRUST_ITEMS.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.55 + i * 0.09 }}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <motion.span
                    animate={{ opacity: [0.55, 1, 0.55] }}
                    transition={{ duration: 2.4 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: B.primary,
                      boxShadow: `0 0 10px ${B.primaryGlow}`,
                      display: "block",
                      flexShrink: 0,
                    }}
                  />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: body copy + CTAs */}
          <motion.div
            initial={{ opacity: 0, x: 38 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "grid", gap: 26 }}
          >
            <p style={{ margin: 0, color: B.textMuted, fontSize: "clamp(18px, 1.8vw, 22px)", lineHeight: 1.8 }}>
              Un solo entorno para plantilla, entrenamiento, staff, calendario y analítica. Diseñado para clubes que ya no encajan en planillas dispersas y quieren operar con la precisión de una organización profesional.
            </p>

            <div className="alttez-hero-actions" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <motion.button
                onClick={() => navigate("/contacto")}
                whileHover={{
                  scale: 1.04,
                  boxShadow: `0 24px 56px ${B.primaryGlowStrong}, 0 0 0 1px rgba(96,165,250,0.6)`,
                }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 26 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "16px 28px",
                  borderRadius: 14,
                  border: "1px solid rgba(96,165,250,0.38)",
                  background: G.button,
                  color: "white",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  boxShadow: `0 14px 38px ${B.primaryGlow}`,
                  cursor: "pointer",
                }}
              >
                Solicitar demo
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  aria-hidden="true"
                  style={{ display: "inline-block" }}
                >
                  →
                </motion.span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/servicios/sports-crm")}
                whileHover={{
                  scale: 1.03,
                  background: "rgba(12,18,32,0.76)",
                  boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
                }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 26 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "16px 28px",
                  borderRadius: 14,
                  border: `1px solid ${B.borderStrong}`,
                  background: "rgba(8,12,22,0.5)",
                  color: B.text,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  cursor: "pointer",
                }}
              >
                Ver plataforma
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Browser mockup — entrance animation, then continuous float */}
        <motion.div
          initial={{ opacity: 0, y: 72 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginTop: 54, display: "flex", justifyContent: "center" }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
            style={{ position: "relative" }}
          >
            {/* Ambient glow behind browser */}
            <div
              style={{
                position: "absolute",
                inset: -36,
                borderRadius: 52,
                background: "radial-gradient(ellipse, rgba(47,107,255,0.22) 0%, transparent 62%)",
                filter: "blur(40px)",
              }}
            />

            <div
              className="alttez-hero-browser"
              style={{
                position: "relative",
                zIndex: 1,
                width: "min(1040px, 100%)",
                borderRadius: 26,
                border: `1px solid ${B.border}`,
                background: "linear-gradient(180deg, rgba(8,13,24,0.97) 0%, rgba(4,6,12,0.97) 100%)",
                boxShadow: "0 40px 100px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.04)",
                overflow: "hidden",
              }}
            >
              {/* Browser chrome */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${B.border}`, background: "rgba(255,255,255,0.018)" }}>
                <div style={{ display: "flex", gap: 7 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F87171" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FBBF24" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#34D399" }} />
                </div>
                <div style={{ marginLeft: 8, flex: 1, padding: "9px 14px", borderRadius: 999, background: "rgba(255,255,255,0.025)", border: `1px solid ${B.border}`, color: B.textHint, fontSize: 11 }}>
                  app.alttez.com/dashboard
                </div>
              </div>

              <div style={{ padding: 22 }}>
                {/* Dashboard header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 16,
                        background: "linear-gradient(135deg, rgba(47,107,255,0.18) 0%, rgba(147,180,255,0.1) 100%)",
                        border: `1px solid ${B.borderStrong}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <BrandGlyph size={26} />
                    </div>
                    <div>
                      <div style={{ color: B.text, fontSize: 24, fontWeight: 800, fontFamily: "'Orbitron', 'Exo 2', Arial, sans-serif" }}>
                        Dashboard ejecutivo
                      </div>
                      <div style={{ color: B.textHint, fontSize: 12 }}>Club Deportivo Profesional</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["Overview", "Analytics", "Team", "Schedule"].map((tab, i) => (
                      <div
                        key={tab}
                        style={{
                          padding: "9px 14px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 700,
                          color: i === 0 ? "#DCE7FF" : B.textHint,
                          background: i === 0 ? B.primarySoft : "rgba(255,255,255,0.025)",
                          border: `1px solid ${i === 0 ? "rgba(96,165,250,0.2)" : B.border}`,
                        }}
                      >
                        {tab}
                      </div>
                    ))}
                  </div>
                </div>

                {/* KPI cards — staggered entrance */}
                <div className="alttez-hero-kpis" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
                  {DASHBOARD_KPIS.map((kpi, i) => (
                    <motion.div
                      key={kpi.label}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.72 + i * 0.09 }}
                      style={{
                        padding: "18px 16px",
                        borderRadius: 18,
                        background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.012) 100%)",
                        border: `1px solid ${B.border}`,
                      }}
                    >
                      <div style={{ color: B.textHint, fontSize: 11, marginBottom: 8 }}>{kpi.label}</div>
                      <div style={{ color: B.text, fontSize: 34, fontWeight: 800, lineHeight: 1, fontFamily: "'Orbitron', 'Exo 2', Arial, sans-serif" }}>
                        {kpi.value}
                      </div>
                      <div style={{ color: "#AFC6FF", fontSize: 11, marginTop: 6 }}>{kpi.note}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Flow section */}
                <div style={{ marginTop: 18, borderRadius: 20, border: `1px solid ${B.border}`, background: "rgba(255,255,255,0.012)", padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                    <div style={{ color: B.text, fontSize: 18, fontWeight: 700 }}>Flujo operativo del club</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <motion.div
                        animate={{ opacity: [0.35, 1, 0.35] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                        style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399" }}
                      />
                      <div style={{ color: "#34D399", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em" }}>Live</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {FLOW.map((item, i) => (
                      <motion.div
                        key={item[0]}
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.95 + i * 0.1 }}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "42px 1fr",
                          gap: 12,
                          alignItems: "start",
                          padding: "12px 12px",
                          borderRadius: 16,
                          background: i === 0 ? "rgba(47,107,255,0.1)" : "rgba(255,255,255,0.014)",
                          border: `1px solid ${i === 0 ? "rgba(96,165,250,0.2)" : "rgba(148,163,184,0.08)"}`,
                        }}
                      >
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 14,
                            background: i === 0 ? "rgba(47,107,255,0.16)" : "rgba(255,255,255,0.03)",
                            color: "#DCE7FF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 800,
                          }}
                        >
                          0{i + 1}
                        </div>
                        <div>
                          <div style={{ color: B.text, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{item[0]}</div>
                          <div style={{ color: B.textHint, fontSize: 11, lineHeight: 1.6 }}>{item[1]}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Phone mockup — own float cycle */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: 40 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.9, delay: 0.72 }}
              className="alttez-hero-float"
              style={{ position: "absolute", right: -28, bottom: -34, zIndex: 2 }}
            >
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2.2 }}
              >
                <div
                  className="alttez-phone-shell"
                  style={{
                    position: "relative",
                    width: 216,
                    borderRadius: 34,
                    padding: 8,
                    background: "linear-gradient(180deg, rgba(14,20,36,0.97) 0%, rgba(4,6,12,0.97) 100%)",
                    border: `1px solid ${B.borderStrong}`,
                    boxShadow: "0 28px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: -14,
                      borderRadius: 46,
                      background: "radial-gradient(circle, rgba(47,107,255,0.24) 0%, transparent 62%)",
                      filter: "blur(24px)",
                      zIndex: -1,
                    }}
                  />
                  {/* Notch */}
                  <div style={{ position: "absolute", left: "50%", top: 10, transform: "translateX(-50%)", width: 72, height: 20, borderRadius: 999, background: "rgba(2,4,12,0.97)" }} />

                  <div style={{ minHeight: 392, borderRadius: 28, background: "linear-gradient(180deg, rgba(6,10,22,0.98) 0%, rgba(3,5,12,0.97) 100%)", overflow: "hidden" }}>
                    <div style={{ padding: "34px 16px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 10,
                              background: B.primarySoft,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <BrandGlyph size={14} />
                          </div>
                          <div>
                            <div style={{ color: B.text, fontSize: 14, fontWeight: 700 }}>Primer equipo</div>
                            <div style={{ color: B.textHint, fontSize: 10, marginTop: 4 }}>Panel móvil del club</div>
                          </div>
                        </div>
                        <motion.div
                          animate={{
                            opacity: [0.5, 1, 0.5],
                            boxShadow: [`0 0 8px ${B.primaryGlow}`, `0 0 20px ${B.primaryGlowStrong}`, `0 0 8px ${B.primaryGlow}`],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{ width: 10, height: 10, borderRadius: "50%", background: B.primary }}
                        />
                      </div>

                      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                        {["Feed", "Club", "Staff"].map((tab, i) => (
                          <div
                            key={tab}
                            style={{
                              flex: 1,
                              padding: "7px 0",
                              borderRadius: 999,
                              background: i === 0 ? B.primarySoft : "rgba(255,255,255,0.025)",
                              color: i === 0 ? "#DCE7FF" : B.textHint,
                              textAlign: "center",
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            {tab}
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "grid", gap: 10 }}>
                        {[
                          ["Próxima acción", "Revisión de disponibilidad", "Entrenamiento de alta intensidad a las 16:30"],
                          ["Estado del club", "Todos los frentes conectados", "Plantilla, sesiones, staff y control operativo alineados."],
                        ].map((card, i) => (
                          <div
                            key={card[1]}
                            style={{
                              padding: "14px 14px 16px",
                              borderRadius: 18,
                              background: i === 0 ? "rgba(47,107,255,0.1)" : "rgba(255,255,255,0.022)",
                              border: `1px solid ${i === 0 ? "rgba(96,165,250,0.2)" : B.border}`,
                            }}
                          >
                            <div style={{ color: B.warning, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
                              {card[0]}
                            </div>
                            <div style={{ color: B.text, fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{card[1]}</div>
                            <div style={{ color: B.textMuted, fontSize: 11, lineHeight: 1.6, marginTop: 8 }}>{card[2]}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
