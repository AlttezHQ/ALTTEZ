import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MARKETING_BRAND as B, MARKETING_GRADIENTS as G } from "../theme/brand";

const BRAND_SYMBOL = "/branding/alttez-symbol-transparent.png";

const TRUST_ITEMS = [
  "Menos mensajes sueltos y mas claridad para el equipo",
  "Seguimiento real de asistencia, carga y pagos",
  "Una experiencia que el club puede mostrar con confianza",
];

const KPI_CARDS = [
  { label: "Disponibles hoy", value: "24", note: "Sesion de las 16:30" },
  { label: "Confirmados", value: "27", note: "Partido del sabado" },
  { label: "Cuotas al dia", value: "86%", note: "Corte del mes" },
  { label: "En observacion", value: "3", note: "Seguimiento fisico" },
];

const DAILY_FLOW = [
  {
    tag: "Entrenamiento",
    title: "Sesion lista antes de salir a cancha",
    body: "Disponibilidad, carga reciente y asistencia esperada en una sola vista para decidir rapido.",
  },
  {
    tag: "Calendario",
    title: "RSVP y agenda del fin de semana",
    body: "Eventos, confirmaciones y recordatorios sin depender de cadenas de WhatsApp perdidas.",
  },
  {
    tag: "Administracion",
    title: "Pagos y pendientes con visibilidad real",
    body: "La administracion ve cartera, movimientos y estado del mes sin volver a la planilla.",
  },
];

function BrandGlyph({ size = 22 }) {
  return (
    <img
      src={BRAND_SYMBOL}
      alt="ALTTEZ"
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: "invert(1) brightness(1.45) contrast(1.1)",
        opacity: 0.98,
      }}
    />
  );
}

function PanelCard({ children, style, className }) {
  return (
    <div
      className={className}
      style={{
        borderRadius: 22,
        border: `1px solid ${B.border}`,
        background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.28)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function HeroSection() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const gridY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.12]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @media (max-width: 1080px) {
        .hero-top-grid {
          grid-template-columns: 1fr !important;
          gap: 32px !important;
        }
        .hero-mockup-wrap {
          margin-top: 18px !important;
        }
      }
      @media (max-width: 820px) {
        .hero-section {
          padding: 88px 20px 60px !important;
        }
        .hero-actions {
          flex-direction: column !important;
          align-items: stretch !important;
        }
        .hero-actions a,
        .hero-actions button {
          width: 100% !important;
          justify-content: center !important;
        }
        .hero-kpis {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
        .hero-browser-grid {
          grid-template-columns: 1fr !important;
        }
      }
      @media (max-width: 560px) {
        .hero-kpis {
          grid-template-columns: 1fr !important;
        }
        .hero-phone-card {
          width: 100% !important;
        }
        .hero-title {
          font-size: clamp(40px, 14vw, 64px) !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (
    <section
      ref={ref}
      className="hero-section"
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        padding: "108px 24px 88px",
        background: G.hero,
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
          opacity: 0.18,
          y: gridY,
          pointerEvents: "none",
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 18% 0%, rgba(47,107,255,0.22), transparent 26%), radial-gradient(ellipse at 82% 84%, rgba(96,165,250,0.12), transparent 22%)",
          opacity: glowOpacity,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 50%, transparent 58%, rgba(0,0,0,0.45) 100%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1280, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 999,
              background: "rgba(7,11,18,0.78)",
              border: `1px solid ${B.border}`,
              color: B.textMuted,
              fontSize: 13,
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
                padding: "6px 12px",
                borderRadius: 999,
                background: B.primarySoft,
                color: "#DCE7FF",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontWeight: 700,
              }}
            >
              <BrandGlyph size={12} />
              ALTTEZ
            </span>
            Todo lo que el club necesita para entrenar, coordinar y hacer seguimiento sin saltar entre chats y planillas.
          </div>
        </motion.div>

        <div
          className="hero-top-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.02fr 0.98fr",
            gap: 42,
            alignItems: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, delay: 0.08 }}
          >
            <h1
              className="hero-title"
              style={{
                margin: "0 0 22px",
                fontSize: "clamp(50px, 7vw, 92px)",
                fontWeight: 800,
                lineHeight: 0.95,
                letterSpacing: "-0.06em",
                fontFamily: "'Orbitron', 'Exo 2', Arial, sans-serif",
                color: B.text,
              }}
            >
              <span style={{ display: "block" }}>Tu club puede</span>
              <span style={{ display: "block" }}>operar con mas</span>
              <span
                style={{
                  display: "block",
                  background: "linear-gradient(100deg, #7BABFF 0%, #AFC6FF 48%, #DCE7FF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                claridad y confianza.
              </span>
            </h1>

            <p style={{ margin: 0, maxWidth: 660, color: B.textMuted, fontSize: "clamp(18px, 1.8vw, 22px)", lineHeight: 1.82 }}>
              ALTTEZ junta plantilla, entrenamientos, agenda, confirmaciones, pagos y seguimiento fisico en un solo lugar. Asi el staff sabe que hacer, la administracion ve el estado real del club y las familias reciben una experiencia mas ordenada.
            </p>

            <div className="hero-actions" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 26 }}>
              <motion.button
                onClick={() => navigate("/contacto")}
                whileHover={{ scale: 1.03, boxShadow: `0 24px 56px ${B.primaryGlowStrong}` }}
                whileTap={{ scale: 0.97 }}
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
                Ver demo guiada
              </motion.button>

              <motion.button
                onClick={() => navigate("/servicios/sports-crm")}
                whileHover={{ scale: 1.02, background: "rgba(12,18,32,0.76)" }}
                whileTap={{ scale: 0.97 }}
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
                Conocer modulos
              </motion.button>
            </div>

            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", color: B.textHint, fontSize: 13, marginTop: 22 }}>
              {TRUST_ITEMS.map((item, index) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2.2 + index * 0.4, repeat: Infinity }}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: B.primary,
                      boxShadow: `0 0 12px ${B.primaryGlow}`,
                      flexShrink: 0,
                    }}
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="hero-mockup-wrap"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, delay: 0.14 }}
            style={{ display: "grid", gap: 18 }}
          >
            <PanelCard style={{ overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${B.border}`, background: "rgba(255,255,255,0.018)" }}>
                <div style={{ display: "flex", gap: 7 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F87171" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FBBF24" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#34D399" }} />
                </div>
                <div style={{ marginLeft: 8, flex: 1, padding: "9px 14px", borderRadius: 999, background: "rgba(255,255,255,0.025)", border: `1px solid ${B.border}`, color: B.textHint, fontSize: 11 }}>
                  app.alttez.co/hoy
                </div>
              </div>

              <div style={{ padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
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
                        Vista diaria del club
                      </div>
                      <div style={{ color: B.textHint, fontSize: 12 }}>Sub-17 · Semana competitiva</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["Dashboard", "Plantilla", "Calendario", "Finanzas"].map((tab, i) => (
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

                <div className="hero-kpis" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
                  {KPI_CARDS.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.25 + index * 0.08 }}
                      style={{
                        padding: "18px 16px",
                        borderRadius: 18,
                        background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.012) 100%)",
                        border: `1px solid ${B.border}`,
                      }}
                    >
                      <div style={{ color: B.textHint, fontSize: 11, marginBottom: 8 }}>{item.label}</div>
                      <div style={{ color: B.text, fontSize: 34, fontWeight: 800, lineHeight: 1, fontFamily: "'Orbitron', 'Exo 2', Arial, sans-serif" }}>
                        {item.value}
                      </div>
                      <div style={{ color: "#AFC6FF", fontSize: 11, marginTop: 6 }}>{item.note}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="hero-browser-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16, marginTop: 18 }}>
                  <PanelCard style={{ padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                      <div style={{ color: B.text, fontSize: 18, fontWeight: 700 }}>Lo que pasa hoy dentro de ALTTEZ</div>
                      <div style={{ color: "#34D399", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em" }}>Live</div>
                    </div>
                    <div style={{ display: "grid", gap: 10 }}>
                      {DAILY_FLOW.map((item, index) => (
                        <div
                          key={item.title}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "78px 1fr",
                            gap: 12,
                            alignItems: "start",
                            padding: "12px",
                            borderRadius: 16,
                            background: index === 0 ? "rgba(47,107,255,0.1)" : "rgba(255,255,255,0.018)",
                            border: `1px solid ${index === 0 ? "rgba(96,165,250,0.24)" : B.border}`,
                          }}
                        >
                          <div style={{ color: B.warning, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700 }}>
                            {item.tag}
                          </div>
                          <div>
                            <div style={{ color: B.text, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                            <div style={{ color: B.textHint, fontSize: 11, lineHeight: 1.6 }}>{item.body}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PanelCard>

                  <PanelCard style={{ padding: 18 }}>
                    <div style={{ color: B.warning, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 10 }}>
                      Recordatorios
                    </div>
                    <div style={{ color: B.text, fontSize: 17, fontWeight: 700, lineHeight: 1.35 }}>
                      6 familias aun no confirman el partido del sabado.
                    </div>
                    <div style={{ color: B.textMuted, fontSize: 12, lineHeight: 1.7, marginTop: 10 }}>
                      El evento sigue abierto y el link de RSVP esta listo para compartir desde calendario.
                    </div>
                    <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
                      {["Cancha 2 · 16:30", "Pago abril · 4 pendientes", "Carga alta · 3 atletas"].map((line) => (
                        <div
                          key={line}
                          style={{
                            padding: "10px 12px",
                            borderRadius: 12,
                            background: "rgba(255,255,255,0.025)",
                            border: `1px solid ${B.border}`,
                            color: B.textHint,
                            fontSize: 11,
                          }}
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  </PanelCard>
                </div>
              </div>
            </PanelCard>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <PanelCard
                className="hero-phone-card"
                style={{
                  width: 260,
                  padding: 10,
                  borderRadius: 34,
                  background: "linear-gradient(180deg, rgba(14,20,36,0.97) 0%, rgba(4,6,12,0.97) 100%)",
                }}
              >
                <div style={{ position: "relative", minHeight: 420, borderRadius: 28, background: "linear-gradient(180deg, rgba(6,10,22,0.98) 0%, rgba(3,5,12,0.97) 100%)", overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: "50%", top: 10, transform: "translateX(-50%)", width: 72, height: 20, borderRadius: 999, background: "rgba(2,4,12,0.97)" }} />
                  <div style={{ padding: "36px 16px 16px" }}>
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
                          <div style={{ color: B.text, fontSize: 14, fontWeight: 700 }}>Panel del coach</div>
                          <div style={{ color: B.textHint, fontSize: 10, marginTop: 4 }}>Seguimiento rapido del dia</div>
                        </div>
                      </div>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 16px rgba(52,211,153,0.45)" }} />
                    </div>

                    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                      {["Hoy", "Plantilla", "Agenda"].map((tab, i) => (
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
                        ["Entrenamiento de hoy", "Sesion 16:30 · Cancha 2", "24 jugadores disponibles y 3 en seguimiento de carga antes de entrenar."],
                        ["Recordatorios", "6 familias sin confirmar", "El evento del sabado sigue abierto y el link de RSVP ya esta listo para compartir."],
                      ].map((card, index) => (
                        <div
                          key={card[1]}
                          style={{
                            padding: "14px 14px 16px",
                            borderRadius: 18,
                            background: index === 0 ? "rgba(47,107,255,0.1)" : "rgba(255,255,255,0.022)",
                            border: `1px solid ${index === 0 ? "rgba(96,165,250,0.2)" : B.border}`,
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
              </PanelCard>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
