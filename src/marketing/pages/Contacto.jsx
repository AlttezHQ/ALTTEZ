import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Monitor, Calendar, HelpCircle, Shield, Cloud, Users, CheckCircle, Zap, Lock } from "lucide-react";
import { sanitizeText, sanitizeTextFinal, sanitizeNote } from "../../shared/utils/sanitize";
import { usePageTitle } from "../../shared/hooks/usePageTitle";
import { MARKETING_BRAND as B, MARKETING_FONTS as F } from "../theme/brand";
import { buildMailtoUrl, buildWhatsAppUrl, CALENDAR_URL, COMMERCIAL_EMAIL } from "../data/contactConfig";
import { Card, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectItem } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { BorderBeam } from "../../components/ui/border-beam";
import { ShimmerButton } from "../../components/ui/shimmer-button";

const CHANNELS = [
  {
    key: "email",
    Icon: Mail,
    title: COMMERCIAL_EMAIL,
    detail: "Configuramos demo, enviamos email inicial y activamos conversación.",
    cta: "Enviar correo",
  },
  {
    key: "demo",
    Icon: Monitor,
    title: "Veamos ALTTEZ en acción",
    detail: "Configuramos una demo personalizada para tu club y la sesión.",
    cta: "Solicitar demo",
  },
  {
    key: "meeting",
    Icon: Calendar,
    title: "Agenda una reunión",
    detail: "Elige el día y la hora que mejor se adapten a tu equipo.",
    cta: "Agendar reunión",
  },
  {
    key: "process",
    Icon: HelpCircle,
    title: "¿Qué sigue después?",
    detail: "Conoce el proceso de activación y acompañamiento con ALTTEZ.",
    cta: "Ver proceso",
  },
];

const FAQS = [
  { Icon: Zap,         q: "¿Cuánto tiempo toma activar ALTTEZ?", a: "La activación inicial toma entre 2 y 7 días. Habla con nosotros para agendar." },
  { Icon: CheckCircle, q: "¿Necesitamos migrar datos?",          a: "No. Puedes empezar de cero o importar lo que tengas desde Excel." },
  { Icon: HelpCircle,  q: "¿Hay contratos mínimos?",             a: "No exigimos permanencia mínima. El plan incluye soporte desde el inicio." },
  { Icon: Shield,      q: "¿Qué incluye el piloto?",             a: "Incluye configuración, capacitación y acompañamiento activo con el primer equipo." },
];

const TRUST = [
  { Icon: Shield,       label: "Datos seguros" },
  { Icon: Cloud,        label: "Acceso en la nube" },
  { Icon: Users,        label: "Multi-club" },
  { Icon: CheckCircle,  label: "Confiable y profesional" },
];

const MOTIVOS = [
  "Solicitar demo ejecutiva",
  "Conocer planes y capacidades",
  "Soporte técnico o activación",
  "Explorar integración",
  "Propuesta institucional",
  "Otro",
];

function Field({ label, error, children }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <Label error={!!error}>{label}</Label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ fontSize: 11, color: B.danger }}
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChatDecoration() {
  return (
    <div style={{ position: "relative", width: 240, height: 210, flexShrink: 0 }}>
      {/* Typing bubble — amber background */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        style={{
          position: "absolute", right: 50, top: 0,
          width: 72, height: 38,
          borderRadius: "14px 14px 14px 4px",
          background: B.primary,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          boxShadow: `0 6px 18px ${B.primaryGlow}`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
            style={{ width: 5, height: 5, borderRadius: "50%", background: "white" }}
          />
        ))}
      </motion.div>
      {/* Main card bubble — ALTTEZ reply */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute", right: 0, top: 50,
          width: 158, height: 96,
          borderRadius: "20px 20px 4px 20px",
          background: B.cardBg,
          border: `1px solid ${B.border}`,
          boxShadow: "0 12px 36px rgba(0,0,0,0.10)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <img src="/branding/alttez-symbol-transparent.png" alt="" width={34} height={34} style={{ opacity: 0.65, objectFit: "contain" }} />
      </motion.div>
      {/* User reply bubble — bottom left */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        style={{
          position: "absolute", left: 0, bottom: 14,
          width: 118, height: 46,
          borderRadius: "14px 14px 14px 4px",
          background: B.bgAlt,
          border: `1px solid ${B.border}`,
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6,
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: B.primary }} />
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: B.primary, opacity: 0.5 }} />
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: B.primary, opacity: 0.25 }} />
      </motion.div>
      {/* Accent dot */}
      <div style={{ position: "absolute", right: 10, bottom: 8, width: 10, height: 10, borderRadius: "50%", background: B.primary, opacity: 0.35 }} />
    </div>
  );
}

export default function Contacto() {
  usePageTitle("Contacto");
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "contact-responsive";
    style.textContent = `
      .contact-main-grid {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 24px;
        align-items: start;
      }
      .contact-hero-grid {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 40px;
        align-items: center;
      }
      .contact-faq-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
      }
      .contact-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      @media (max-width: 980px) {
        .contact-main-grid  { grid-template-columns: 1fr; }
        .contact-hero-grid  { grid-template-columns: 1fr; }
        .contact-faq-grid   { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 640px) {
        .contact-row      { grid-template-columns: 1fr; }
        .contact-faq-grid { grid-template-columns: 1fr; }
        .contact-page section { padding-left: 20px !important; padding-right: 20px !important; }
      }
      .channel-btn {
        padding: 7px 12px;
        border-radius: 8px;
        border: 1px solid rgba(0,0,0,0.14);
        background: transparent;
        color: #6B7280;
        font-weight: 700;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        cursor: pointer;
        white-space: nowrap;
        text-decoration: none;
        font-family: 'Inter', Arial, sans-serif;
        display: inline-flex;
        align-items: center;
        transition: border-color 150ms ease, color 150ms ease;
      }
      .channel-btn:hover {
        border-color: #C9973A;
        color: #C9973A;
      }
      .wa-btn {
        padding: 13px 22px;
        border-radius: 10px;
        border: 1.5px solid rgba(0,0,0,0.14);
        background: transparent;
        color: #0F0F0F;
        font-weight: 700;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        text-decoration: none;
        font-family: 'Inter', Arial, sans-serif;
        display: inline-flex;
        align-items: center;
        transition: border-color 150ms ease;
        cursor: pointer;
      }
      .wa-btn:hover {
        border-color: #C9973A;
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const [form, setForm] = useState({ nombre: "", email: "", club: "", whatsapp: "", motivo: "", mensaje: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const whatsappUrl = buildWhatsAppUrl("Hola, quiero una demo de ALTTEZ para mi club.");

  const handleChange = (field) => (e) => {
    const raw = e.target.value;
    const value = field === "mensaje" ? sanitizeNote(raw) : (field !== "email" ? sanitizeText(raw) : raw);
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const next = {};
    const nombre = sanitizeTextFinal(form.nombre);
    const email = sanitizeTextFinal(form.email);
    const mensaje = sanitizeTextFinal(form.mensaje);
    if (!nombre || nombre.length < 2) next.nombre = "Ingresa un nombre válido";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Ingresa un email válido";
    if (!form.motivo) next.motivo = "Selecciona el objetivo de la conversación";
    if (!mensaje || mensaje.length < 20) next.mensaje = "Cuéntanos un poco más sobre tu necesidad";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setSending(true);
    window.location.href = buildMailtoUrl(form);
    setSending(false);
    setSubmitted(true);
  };

  return (
    <div className="contact-page" style={{ minHeight: "100vh", background: B.bg, color: B.text, fontFamily: F.body }}>

      {/* ── Hero ── */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "96px 40px 44px" }}>
        <div className="contact-hero-grid">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ width: 24, height: 1.5, background: B.primary, borderRadius: 2, display: "inline-block" }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.30em", color: B.primary }}>
                Contacto ALTTEZ
              </span>
            </div>
            <h1 style={{
              margin: "0 0 18px",
              fontSize: "clamp(36px, 5vw, 66px)",
              lineHeight: 1.02,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              fontFamily: F.display,
              color: B.text,
              maxWidth: 680,
            }}>
              Hablemos de cómo ordenar la operación real de tu club.
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.78, color: B.textMuted, maxWidth: 560, margin: 0 }}>
              Si hoy coordinan entre chats, planillas y seguimiento manual, esta conversación es para aterrizar un piloto claro, una demo útil y el camino más corto para activar ALTTEZ con tu equipo.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }}>
            <ChatDecoration />
          </motion.div>
        </div>
      </section>

      {/* ── Form + Channels ── */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px 56px" }}>
        <div className="contact-main-grid">

          {/* Form */}
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <div style={{ padding: 32 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 16, background: B.primarySoft, border: `1px solid ${B.borderStrong}`, display: "grid", placeItems: "center", color: B.primary, fontSize: 22, fontWeight: 800, marginBottom: 20 }}>✓</div>
                    <h2 style={{ margin: "0 0 10px", fontSize: 28, lineHeight: 1.1, fontFamily: F.display, letterSpacing: "-0.03em" }}>
                      Tu correo quedó listo para enviar.
                    </h2>
                    <p style={{ fontSize: 15, color: B.textMuted, lineHeight: 1.75, maxWidth: 480, margin: "0 0 24px" }}>
                      Abrimos tu cliente de correo con el contexto precargado. Si prefieres una respuesta más rápida, usa los canales directos de esta página.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => { setSubmitted(false); setForm({ nombre: "", email: "", club: "", whatsapp: "", motivo: "", mensaje: "" }); }}
                      style={{ padding: "12px 22px", borderRadius: 10, border: `1px solid ${B.borderStrong}`, background: "transparent", color: B.text, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", fontSize: 12, cursor: "pointer", fontFamily: F.body }}
                    >
                      Preparar otro mensaje
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <BorderBeam
                    colorFrom="rgba(201,151,58,0.50)"
                    colorTo="rgba(245,194,102,0.50)"
                    duration={8}
                    borderWidth={1.5}
                  />
                  <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    style={{
                      padding: "32px 32px 28px",
                      display: "grid",
                      gap: 18,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <div>
                      <h2 style={{ margin: "0 0 5px", fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: B.text, fontFamily: F.display }}>
                        Cómo funciona hoy tu operación.
                      </h2>
                      <p style={{ margin: 0, fontSize: 13, color: B.textMuted, lineHeight: 1.55 }}>Completar el formulario y respondemos en menos de 24 horas hábiles.</p>
                    </div>

                    <div className="contact-row">
                      <Field label="Nombre completo" error={errors.nombre}>
                        <Input
                          value={form.nombre}
                          onChange={handleChange("nombre")}
                          placeholder="Camila Rodríguez"
                          hasError={!!errors.nombre}
                        />
                      </Field>
                      <Field label="Correo electrónico" error={errors.email}>
                        <Input
                          value={form.email}
                          onChange={handleChange("email")}
                          placeholder="camila@club.co"
                          hasError={!!errors.email}
                        />
                      </Field>
                    </div>

                    <Field label="Club u organización">
                      <Input
                        value={form.club}
                        onChange={handleChange("club")}
                        placeholder="Academia, liga o institución"
                      />
                    </Field>

                    <Field label="WhatsApp / Teléfono">
                      <Input
                        value={form.whatsapp}
                        onChange={handleChange("whatsapp")}
                        placeholder="+57 300 123 4567"
                      />
                    </Field>

                    <Field label="Tipo de proyecto" error={errors.motivo}>
                      <Select
                        value={form.motivo}
                        onChange={handleChange("motivo")}
                        hasError={!!errors.motivo}
                      >
                        <SelectItem value="">Selecciona una opción</SelectItem>
                        {MOTIVOS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                      </Select>
                    </Field>

                    <Field label="Contexto" error={errors.mensaje}>
                      <Textarea
                        rows={5}
                        value={form.mensaje}
                        onChange={handleChange("mensaje")}
                        placeholder="Cuéntanos sobre tu operación actual y qué quieres resolver primero."
                        hasError={!!errors.mensaje}
                      />
                    </Field>

                    <div style={{
                      padding: "11px 14px", borderRadius: 10,
                      background: B.bgAlt, border: `1px solid ${B.border}`,
                      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap",
                      color: B.textMuted, fontSize: 12,
                    }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Lock size={12} color={B.textMuted} />
                        Tu información está protegida. No compartimos tus datos a terceros.
                      </span>
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>{form.mensaje.length}/1000</span>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <ShimmerButton
                        type="submit"
                        disabled={sending}
                      >
                        {sending ? "Abriendo correo..." : "Enviar solicitud"}
                      </ShimmerButton>
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="wa-btn"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Channels */}
          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
          >
            <Card style={{ overflow: "hidden" }}>
              <CardHeader>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.28em", color: B.primary }}>
                  Líneas directas
                </span>
              </CardHeader>

              {CHANNELS.map((ch, i) => {
                const href = ch.key === "email" ? `mailto:${COMMERCIAL_EMAIL}` : ch.key === "meeting" ? (CALENDAR_URL || null) : null;
                const onClick = ch.key === "demo"
                  ? () => formRef.current?.scrollIntoView({ behavior: "smooth" })
                  : ch.key === "process"
                  ? () => navigate("/quienes-somos")
                  : null;
                return (
                  <motion.div
                    key={ch.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
                    style={{
                      padding: "18px 22px",
                      borderBottom: i < CHANNELS.length - 1 ? `1px solid ${B.border}` : "none",
                      display: "grid",
                      gridTemplateColumns: "32px 1fr auto",
                      gap: 12,
                      alignItems: "start",
                    }}
                  >
                    <ch.Icon size={17} color={B.primary} style={{ marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: B.text, marginBottom: 3 }}>{ch.title}</div>
                      <div style={{ fontSize: 12, color: B.textMuted, lineHeight: 1.55 }}>{ch.detail}</div>
                    </div>
                    {href ? (
                      <a
                        href={href}
                        target={ch.key === "meeting" ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="channel-btn"
                      >
                        {ch.cta}
                      </a>
                    ) : (
                      <button
                        onClick={onClick}
                        className="channel-btn"
                      >
                        {ch.cta}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </Card>
          </motion.div>

        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px 48px" }}>
        <div style={{ marginBottom: 28 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.28em", color: B.primary }}>
            Preguntas frecuentes
          </span>
        </div>
        <div className="contact-faq-grid">
          {FAQS.map((faq, i) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
            >
              <faq.Icon size={16} color={B.primary} style={{ display: "block", marginBottom: 10 }} />
              <div style={{ fontSize: 13, fontWeight: 800, color: B.text, lineHeight: 1.4, marginBottom: 8 }}>{faq.q}</div>
              <div style={{ fontSize: 13, color: B.textMuted, lineHeight: 1.7 }}>{faq.a}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px 80px" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 40, flexWrap: "wrap",
          paddingTop: 28, borderTop: `1px solid ${B.border}`,
        }}>
          {TRUST.map(({ Icon, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600, color: B.textMuted }}>
              <Icon size={13} color={B.primary} />
              {label}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
