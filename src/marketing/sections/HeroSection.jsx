import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MARKETING_BRAND as B, MARKETING_GRADIENTS as G } from "../theme/brand";

const BRAND_SYMBOL = "/branding/alttez-symbol-transparent.png";
const PARTICLES = [
  { left: 10, top: 20 },
  { left: 85, top: 15 },
  { left: 30, top: 80 },
  { left: 60, top: 40 },
  { left: 15, top: 60 },
  { left: 75, top: 75 },
  { left: 45, top: 25 },
  { left: 90, top: 50 },
];

const TRUST_ITEMS = [
  "Seguridad y control operativo",
  "Analitica clara para decidir",
  "Experiencia premium para clientes serios",
];

const DASHBOARD_KPIS = [
  { label: "Plantilla", value: "32", note: "Primer equipo" },
  { label: "Sesiones", value: "14", note: "Semana actual" },
  { label: "Asistencia", value: "96%", note: "Staff conectado" },
  { label: "Control", value: "8", note: "Frentes sincronizados" },
];

const FLOW = [
  ["Direccion deportiva", "Prioridades, seguimiento y lectura ejecutiva en una sola capa."],
  ["Cuerpo tecnico", "Sesiones, disponibilidad y coordinacion diaria sin friccion."],
  ["Administracion", "Control, calendario y trazabilidad en el mismo entorno."],
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
  const gridY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.18]);

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
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.12,
          y: gridY,
          pointerEvents: "none",
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 0%, rgba(47,107,255,0.18), transparent 24%), radial-gradient(circle at 82% 86%, rgba(147,180,255,0.12), transparent 20%)",
          opacity: glowOpacity,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {PARTICLES.map((particle, i) => (
          <motion.div
            key={`${particle.left}-${particle.top}`}
            animate={{ y: [0, -26, 0], opacity: [0.18, 0.56, 0.18] }}
            transition={{ duration: 3.2 + i * 0.28, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
            style={{
              position: "absolute",
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#9DBBFF",
              boxShadow: `0 0 16px ${B.primaryGlow}`,
            }}
          />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1280, margin: "0 auto" }}>
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
              background: "rgba(8,14,24,0.7)",
              border: `1px solid ${B.border}`,
              boxShadow: "0 18px 48px rgba(0,0,0,0.2)",
              flexWrap: "wrap",
              justifyContent: "center",
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
              Sistema operativo para clubes que necesitan orden, control y una presencia digital mas seria.
            </span>
          </div>
        </motion.div>

        <div
          className="alttez-hero-top"
          style={{
            display: "grid",
            gridTemplateColumns: "1.02fr 0.98fr",
            gap: 42,
            alignItems: "center",
          }}
        >
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
              <span style={{ display: "block", color: "#AFC6FF" }}>de alto rendimiento.</span>
            </h1>

            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", color: B.textHint, fontSize: 13 }}>
              {TRUST_ITEMS.map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: B.primary,
                      boxShadow: `0 0 14px ${B.primaryGlow}`,
                    }}
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 38 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "grid", gap: 26 }}
          >
            <p style={{ margin: 0, color: B.textMuted, fontSize: "clamp(18px, 1.8vw, 22px)", lineHeight: 1.8 }}>
              ALTTEZ unifica plantilla, entrenamiento, staff, calendario, administracion y analitica en una sola experiencia para organizaciones deportivas que quieren trabajar con mas claridad y verse a la altura del proyecto que lideran.
            </p>

            <div className="alttez-hero-actions" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/contacto")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "16px 24px",
                  borderRadius: 16,
                  border: `1px solid rgba(96,165,250,0.5)`,
                  background: G.button,
                  color: "white",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  boxShadow: `0 16px 40px ${B.primaryGlow}`,
                }}
              >
                Solicitar demo
                <span aria-hidden="true">&rarr;</span>
              </button>
              <button
                onClick={() => navigate("/servicios/sports-crm")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "16px 24px",
                  borderRadius: 16,
                  border: `1px solid ${B.borderStrong}`,
                  background: "rgba(9,14,24,0.58)",
                  color: B.text,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                }}
              >
                Ver plataforma
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 70 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginTop: 54, display: "flex", justifyContent: "center" }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: -24,
                borderRadius: 40,
                background: "radial-gradient(circle, rgba(47,107,255,0.18) 0%, transparent 58%)",
                filter: "blur(30px)",
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
                background: "linear-gradient(180deg, rgba(10,16,28,0.96) 0%, rgba(5,8,14,0.96) 100%)",
                boxShadow: "0 30px 90px rgba(0,0,0,0.45)",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${B.border}`, background: "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", gap: 7 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F87171" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FBBF24" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#60A5FA" }} />
                </div>
                <div style={{ marginLeft: 8, flex: 1, padding: "9px 14px", borderRadius: 999, background: "rgba(255,255,255,0.03)", border: `1px solid ${B.border}`, color: B.textHint, fontSize: 11 }}>
                  app.alttez.com/dashboard
                </div>
              </div>

              <div style={{ padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 16,
                        background: "linear-gradient(135deg, rgba(47,107,255,0.2) 0%, rgba(147,180,255,0.12) 100%)",
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
                          background: i === 0 ? B.primarySoft : "rgba(255,255,255,0.03)",
                          border: `1px solid ${i === 0 ? "rgba(96,165,250,0.22)" : B.border}`,
                        }}
                      >
                        {tab}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="alttez-hero-kpis" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
                  {DASHBOARD_KPIS.map((kpi) => (
                    <div
                      key={kpi.label}
                      style={{
                        padding: "18px 16px",
                        borderRadius: 18,
                        background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                        border: `1px solid ${B.border}`,
                      }}
                    >
                      <div style={{ color: B.textHint, fontSize: 11, marginBottom: 8 }}>{kpi.label}</div>
                      <div style={{ color: B.text, fontSize: 34, fontWeight: 800, lineHeight: 1, fontFamily: "'Orbitron', 'Exo 2', Arial, sans-serif" }}>
                        {kpi.value}
                      </div>
                      <div style={{ color: "#AFC6FF", fontSize: 11, marginTop: 6 }}>{kpi.note}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 18, borderRadius: 20, border: `1px solid ${B.border}`, background: "rgba(255,255,255,0.02)", padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                    <div style={{ color: B.text, fontSize: 18, fontWeight: 700 }}>Flujo operativo del club</div>
                    <div style={{ color: "#DCE7FF", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em" }}>Live</div>
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {FLOW.map((item, i) => (
                      <div
                        key={item[0]}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "42px 1fr",
                          gap: 12,
                          alignItems: "start",
                          padding: "12px 12px",
                          borderRadius: 16,
                          background: i === 0 ? "rgba(47,107,255,0.12)" : "rgba(255,255,255,0.018)",
                          border: `1px solid ${i === 0 ? "rgba(96,165,250,0.24)" : "rgba(148,163,184,0.12)"}`,
                        }}
                      >
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 14,
                            background: i === 0 ? "rgba(47,107,255,0.18)" : "rgba(255,255,255,0.03)",
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
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 40, y: 40 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.9, delay: 0.72 }}
              className="alttez-hero-float"
              style={{ position: "absolute", right: -28, bottom: -34, zIndex: 2 }}
            >
              <div
                className="alttez-phone-shell"
                style={{
                  position: "relative",
                  width: 216,
                  borderRadius: 34,
                  padding: 8,
                  background: "linear-gradient(180deg, rgba(17,24,39,0.96) 0%, rgba(5,8,14,0.96) 100%)",
                  border: `1px solid ${B.borderStrong}`,
                  boxShadow: "0 24px 70px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: -10,
                    borderRadius: 42,
                    background: "radial-gradient(circle, rgba(47,107,255,0.18) 0%, transparent 62%)",
                    filter: "blur(20px)",
                    zIndex: -1,
                  }}
                />
                <div style={{ position: "absolute", left: "50%", top: 10, transform: "translateX(-50%)", width: 72, height: 20, borderRadius: 999, background: "rgba(2,6,23,0.96)" }} />
                <div style={{ minHeight: 392, borderRadius: 28, background: "linear-gradient(180deg, rgba(8,14,24,0.98) 0%, rgba(5,8,14,0.96) 100%)", overflow: "hidden" }}>
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
                          <div style={{ color: B.textHint, fontSize: 10, marginTop: 4 }}>Panel movil del club</div>
                        </div>
                      </div>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: B.primary, boxShadow: `0 0 14px ${B.primaryGlow}` }} />
                    </div>

                    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                      {["Feed", "Club", "Staff"].map((tab, i) => (
                        <div
                          key={tab}
                          style={{
                            flex: 1,
                            padding: "7px 0",
                            borderRadius: 999,
                            background: i === 0 ? B.primarySoft : "rgba(255,255,255,0.03)",
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
                        ["Proxima accion", "Revision de disponibilidad", "Entrenamiento de alta intensidad a las 16:30"],
                        ["Estado del club", "Todos los frentes conectados", "Plantilla, sesiones, staff y control operativo alineados."],
                      ].map((card, i) => (
                        <div
                          key={card[1]}
                          style={{
                            padding: "14px 14px 16px",
                            borderRadius: 18,
                            background: i === 0 ? "rgba(47,107,255,0.12)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${i === 0 ? "rgba(96,165,250,0.24)" : B.border}`,
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}
