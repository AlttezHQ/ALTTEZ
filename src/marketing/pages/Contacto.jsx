import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { sanitizeText, sanitizeTextFinal, sanitizeNote } from "../../shared/utils/sanitize";
import { usePageTitle } from "../../shared/hooks/usePageTitle";
import { MARKETING_BRAND as B, MARKETING_GRADIENTS as G, MARKETING_FONTS as F } from "../theme/brand";
import { buildMailtoUrl, buildWhatsAppUrl, CALENDAR_URL, COMMERCIAL_EMAIL } from "../data/contactConfig";

const CHANNELS = [
  {
    key: "email",
    title: "Correo directo",
    value: COMMERCIAL_EMAIL,
    detail: "Canal principal para demos, activacion inicial y conversaciones comerciales.",
    cta: "Enviar correo",
  },
  {
    key: "demo",
    title: "Veamos ALTTEZ en acción",
    value: "Solicitar demo",
    detail: "Configurar una demo personalizada para tu club y la sesión.",
    cta: "Solicitar demo",
  },
  {
    key: "meeting",
    title: "Agenda una reunión",
    value: CALENDAR_URL ? "Disponible" : "Agendar reunión",
    detail: "Elige el día y la hora que mejor se adapten a tu equipo.",
    cta: "Agendar reunión",
  },
  {
    key: "process",
    title: "¿Qué sigue después?",
    value: "Ver proceso",
    detail: "Conoce el proceso de activación y acompañamiento con ALTTEZ.",
    cta: "Ver proceso",
  },
];

const FAQS = [
  { q: "¿Cuánto tiempo toma activar ALTTEZ?", a: "La activación inicial toma entre 2 y 7 días. Habla con nosotros para agendar." },
  { q: "¿Necesitamos migrar datos?", a: "No. Puedes empezar de cero o importar lo que tengas desde Excel." },
  { q: "¿Hay contratos mínimos?", a: "No exigimos permanencia mínima. El plan incluye soporte desde el inicio." },
  { q: "¿Qué incluye el piloto?", a: "Incluye configuración, capacitación y acompañamiento activo con el primer equipo." },
];

const MOTIVOS = [
  "Solicitar demo ejecutiva",
  "Conocer planes y capacidades",
  "Soporte tecnico o activacion",
  "Explorar integracion",
  "Propuesta institucional",
  "Otro",
];

function Field({ label, error, children }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <label
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: error ? B.danger : B.textHint,
          fontWeight: 700,
        }}
      >
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error ? (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ fontSize: 12, color: B.danger }}
          >
            {error}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function inputStyle(hasError) {
  return {
    width: "100%",
    padding: "15px 16px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.03)",
    border: `1px solid ${hasError ? B.danger : B.border}`,
    color: B.text,
    outline: "none",
    fontSize: 15,
    transition: "border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
    boxSizing: "border-box",
  };
}

export default function Contacto() {
  usePageTitle("Contacto");
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @media (max-width: 980px) {
        .contact-grid {
          grid-template-columns: 1fr !important;
        }
      }
      @media (max-width: 640px) {
        .contact-page section {
          padding-left: 20px !important;
          padding-right: 20px !important;
        }
        .contact-row {
          grid-template-columns: 1fr !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    club: "",
    whatsapp: "",
    motivo: "",
    mensaje: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const whatsappUrl = buildWhatsAppUrl("Hola, quiero una demo de ALTTEZ para mi club.");

  const handleChange = (field) => (event) => {
    const raw = event.target.value;
    let value = raw;

    if (field === "mensaje") value = sanitizeNote(raw);
    if (field !== "mensaje" && field !== "email") value = sanitizeText(raw);

    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const next = {};
    const nombre = sanitizeTextFinal(form.nombre);
    const email = sanitizeTextFinal(form.email);
    const mensaje = sanitizeTextFinal(form.mensaje);

    if (!nombre || nombre.length < 2) next.nombre = "Ingresa un nombre valido";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Ingresa un email valido";
    if (!form.motivo) next.motivo = "Selecciona el objetivo de la conversacion";
    if (!mensaje || mensaje.length < 20) next.mensaje = "Cuentanos un poco mas sobre tu necesidad";

    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSending(true);
    window.location.href = buildMailtoUrl(form);
    setSending(false);
    setSubmitted(true);
  };

  return (
    <div className="contact-page" style={{ minHeight: "100vh", background: G.hero, color: B.text }}>
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "84px 32px 40px" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          style={{ maxWidth: 820 }}
        >
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.24em", color: B.warning, fontWeight: 700 }}>
            Contacto ALTTEZ
          </div>
          <h1
            style={{
              margin: "18px 0 18px",
              fontSize: "clamp(42px, 7vw, 84px)",
              lineHeight: 0.96,
              fontWeight: 800,
              letterSpacing: "-0.06em",
              fontFamily: F.display,
            }}
          >
            Hablemos de como ordenar la operacion real de tu club.
          </h1>
          <p style={{ maxWidth: 680, fontSize: 18, lineHeight: 1.82, color: B.textMuted }}>
            Si hoy coordinan entre chats, planillas y seguimiento manual, esta conversacion es para aterrizar un piloto claro, una demo util y el camino mas corto para activar ALTTEZ con tu equipo.
          </p>
        </motion.div>
      </section>

      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px 96px" }}>
        <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1.08fr 0.92fr", gap: 24, alignItems: "start" }}>
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  padding: 34,
                  borderRadius: 30,
                  background: G.panel,
                  border: `1px solid ${B.borderStrong}`,
                  boxShadow: "0 28px 80px rgba(0,0,0,0.34)",
                }}
              >
                <div
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: 24,
                    background: B.primarySoft,
                    border: `1px solid ${B.borderStrong}`,
                    display: "grid",
                    placeItems: "center",
                    color: B.primary,
                    fontSize: 30,
                    fontWeight: 800,
                  }}
                >
                  OK
                </div>
                <h2 style={{ margin: "22px 0 10px", fontSize: 34, lineHeight: 1.02, fontFamily: F.display }}>
                  Tu correo ya quedo listo para enviar.
                </h2>
                <p style={{ fontSize: 16, color: B.textMuted, lineHeight: 1.8, maxWidth: 560 }}>
                  Abrimos tu cliente de correo con el contexto precargado para que la solicitud salga completa. Si prefieres una respuesta mas rapida, tambien puedes usar los canales directos de esta pagina.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ nombre: "", email: "", club: "", whatsapp: "", motivo: "", mensaje: "" });
                  }}
                  style={{
                    marginTop: 24,
                    padding: "14px 22px",
                    borderRadius: 999,
                    border: `1px solid ${B.borderStrong}`,
                    background: "transparent",
                    color: B.text,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Preparar otro mensaje
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                ref={formRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65 }}
                onSubmit={handleSubmit}
                style={{
                  padding: 30,
                  borderRadius: 30,
                  background: G.panel,
                  border: `1px solid ${B.border}`,
                  boxShadow: "0 28px 80px rgba(0,0,0,0.34)",
                  display: "grid",
                  gap: 22,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: B.warning, textTransform: "uppercase", letterSpacing: "0.22em", fontWeight: 700 }}>
                    Formulario
                  </div>
                  <h2 style={{ marginTop: 12, fontSize: 34, lineHeight: 1.02, fontFamily: F.display }}>
                    Cuentanos como funciona hoy tu operacion.
                  </h2>
                </div>

                <div className="contact-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Nombre completo" error={errors.nombre}>
                    <input value={form.nombre} onChange={handleChange("nombre")} placeholder="Camila Rodriguez" style={inputStyle(!!errors.nombre)} />
                  </Field>
                  <Field label="Correo" error={errors.email}>
                    <input value={form.email} onChange={handleChange("email")} placeholder="camila@club.co" style={inputStyle(!!errors.email)} />
                  </Field>
                </div>

                <Field label="Club u organizacion">
                  <input value={form.club} onChange={handleChange("club")} placeholder="Academia, liga o institucion" style={inputStyle(false)} />
                </Field>

                <Field label="WhatsApp / Teléfono">
                  <input value={form.whatsapp} onChange={handleChange("whatsapp")} placeholder="+57 300 000 0000" style={inputStyle(false)} />
                </Field>

                <Field label="Motivo principal" error={errors.motivo}>
                  <select value={form.motivo} onChange={handleChange("motivo")} style={inputStyle(!!errors.motivo)}>
                    <option value="">Selecciona una opcion</option>
                    {MOTIVOS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Contexto" error={errors.mensaje}>
                  <textarea
                    rows={6}
                    value={form.mensaje}
                    onChange={handleChange("mensaje")}
                    placeholder="Describe como coordinan hoy plantilla, entrenamientos, pagos, confirmaciones o seguimiento del equipo y que quieren resolver primero."
                    style={{ ...inputStyle(!!errors.mensaje), resize: "vertical", minHeight: 150, lineHeight: 1.7 }}
                  />
                </Field>

                <div
                  style={{
                    padding: "16px 18px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.025)",
                    border: `1px solid ${B.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    color: B.textHint,
                    fontSize: 13,
                  }}
                >
                  <span>Respuesta estimada: menos de 24 horas habiles</span>
                  <span>{form.mensaje.length}/1000</span>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    disabled={sending}
                    style={{
                      padding: "16px 22px",
                      borderRadius: 999,
                      border: "none",
                      background: G.button,
                      color: "white",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.09em",
                      boxShadow: `0 18px 40px ${B.primaryGlow}`,
                      opacity: sending ? 0.75 : 1,
                    }}
                  >
                    {sending ? "Abriendo correo..." : "Enviar por correo"}
                  </button>
                  {whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "16px 22px",
                        borderRadius: 999,
                        border: `1px solid ${B.borderStrong}`,
                        background: "rgba(255,255,255,0.03)",
                        color: B.text,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.09em",
                        textDecoration: "none",
                      }}
                    >
                      Escribir por WhatsApp
                    </a>
                  ) : null}
                  {CALENDAR_URL ? (
                    <a
                      href={CALENDAR_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "16px 22px",
                        borderRadius: 999,
                        border: `1px solid ${B.borderStrong}`,
                        background: "transparent",
                        color: B.textMuted,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.09em",
                        textDecoration: "none",
                      }}
                    >
                      Agendar demo
                    </a>
                  ) : null}
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.72, delay: 0.12 }}
            style={{ display: "grid", gap: 18 }}
          >
            <div
              style={{
                padding: 28,
                borderRadius: 28,
                background: "rgba(255,255,255,0.025)",
                border: `1px solid ${B.border}`,
              }}
            >
              <div style={{ fontSize: 11, color: B.warning, textTransform: "uppercase", letterSpacing: "0.22em", fontWeight: 700 }}>
                Canales
              </div>
              <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
                {CHANNELS.map((channel, index) => {
                  const channelHref = {
                    email: `mailto:${COMMERCIAL_EMAIL}`,
                    meeting: CALENDAR_URL || null,
                  }[channel.key] || null;
                  const channelClick = {
                    demo: () => formRef.current?.scrollIntoView({ behavior: "smooth" }),
                    process: () => navigate("/quienes-somos"),
                  }[channel.key] || null;

                  return (
                    <motion.div
                      key={channel.title}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: 0.14 + index * 0.08 }}
                      style={{
                        padding: 18,
                        borderRadius: 22,
                        background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                        border: `1px solid ${B.border}`,
                      }}
                    >
                      <div style={{ fontSize: 13, color: B.warning, textTransform: "uppercase", letterSpacing: "0.16em", fontWeight: 700 }}>
                        {channel.title}
                      </div>
                      <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.7, color: B.textMuted, marginBottom: 12 }}>{channel.detail}</p>
                      {channelHref ? (
                        <a
                          href={channelHref}
                          target={channel.key === "meeting" ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-block",
                            padding: "10px 16px",
                            borderRadius: 999,
                            border: `1px solid ${B.borderStrong}`,
                            background: "rgba(255,255,255,0.04)",
                            color: B.text,
                            fontWeight: 700,
                            fontSize: 12,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            textDecoration: "none",
                          }}
                        >
                          {channel.cta}
                        </a>
                      ) : (
                        <button
                          onClick={channelClick}
                          style={{
                            padding: "10px 16px",
                            borderRadius: 999,
                            border: `1px solid ${B.borderStrong}`,
                            background: "rgba(255,255,255,0.04)",
                            color: B.text,
                            fontWeight: 700,
                            fontSize: 12,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            cursor: "pointer",
                          }}
                        >
                          {channel.cta}
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                padding: 28,
                borderRadius: 28,
                background: "linear-gradient(135deg, rgba(11,18,32,0.98) 0%, rgba(8,14,24,0.88) 100%)",
                border: `1px solid ${B.borderStrong}`,
              }}
            >
              <div style={{ fontSize: 11, color: B.warning, textTransform: "uppercase", letterSpacing: "0.22em", fontWeight: 700 }}>
                Lo que puedes esperar
              </div>
              <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                {[
                  "Una demo enfocada en operacion diaria del club, no en humo.",
                  "Ruta clara para piloto, activacion inicial y primer equipo dentro del sistema.",
                  "Siguiente paso concreto para propuesta, onboarding o implementacion guiada.",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: B.textMuted, lineHeight: 1.7 }}>
                    <span style={{ color: B.primary, fontWeight: 800 }}>-</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px 96px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: B.warning, textTransform: "uppercase", letterSpacing: "0.24em", fontWeight: 700 }}>
            Preguntas frecuentes
          </div>
          <h2
            style={{
              margin: "16px 0 0",
              fontSize: "clamp(28px, 4vw, 44px)",
              lineHeight: 1.02,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              fontFamily: F.display,
            }}
          >
            Lo que más nos preguntan.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, maxWidth: 960, margin: "0 auto" }}>
          {FAQS.map((faq, index) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              style={{
                padding: "22px 20px",
                borderRadius: 22,
                background: "rgba(255,255,255,0.025)",
                border: `1px solid ${B.border}`,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4, marginBottom: 10 }}>{faq.q}</div>
              <div style={{ fontSize: 13, color: B.textMuted, lineHeight: 1.75 }}>{faq.a}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
