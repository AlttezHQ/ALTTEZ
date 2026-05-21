/**
 * @component PublicProposalPage
 * @description Landing page confidencial de propuestas comerciales ALTTEZ.
 * Diseño 100% alineado al Manual de Marca ALTTEZ v1.1:
 *   - Soporte para Tema Oscuro Editorial (Grafito) y Tema Claro (Marfil)
 *   - Switcher premium para alternar entre ambas perspectivas del manual
 *   - 70% neutros / 20% contraste / 10% bronce
 *   - Tipografía Manrope oficial
 *   - Email de contacto alttezsas@gmail.com
 *   - Descriptor de marca correcto "Tecnología de Gestión y Operación Deportiva"
 *   - Adaptación automática del logo (filtro invert) y botones según contraste
 *   - Integración de propuesta personalizada para Fabián Mora con lógica de decisiones de WhatsApp, Vesting y Firma Digital
 *
 * @version 4.3.0 — Canvas-based digital signature flow with Name, Email, Checkboxes and Drawing pad
 */

import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  motion, AnimatePresence, useInView,
  useScroll, useTransform, animate as fmAnimate,
} from "framer-motion";
import jsPDF from "jspdf";
import {
  getProposalById, signProposal, sendCounterProposal,
} from "../../shared/services/proposalsService";
import { WHATSAPP_NUMBER } from "../data/contactConfig";

// ══════════════════════════════════════════════════
// BRAND CONSTANTS — Manual de Marca ALTTEZ v1.1
// ══════════════════════════════════════════════════
const B = {
  // Bronce ALTTEZ (10%)
  bronce:    "#CE8946",
  bronceSft: "#D8A06B",
  bronceDeep:"#B47938",
  bronceDim: "rgba(206,137,70,0.08)",
  bronceMid: "rgba(206,137,70,0.15)",
  bronceBor: "rgba(206,137,70,0.28)",

  // Neutros fijos para Hero
  heroBase:  "#0E1117",
  heroBor:   "rgba(255,255,255,0.10)",
  heroW:     "#FFFFFF",
  heroW80:   "rgba(255,255,255,0.80)",
  heroW55:   "rgba(255,255,255,0.55)",
  heroW30:   "rgba(255,255,255,0.30)",

  // Grafito oficial (20% contraste)
  grafito:   "#1F1F1D",

  // Estado
  success:   "#2FA56F",
  danger:    "#D95C5C",
};

// Tipografía Manrope
const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
const W = { bold:900, semibold:700, medium:600, regular:400 };

// Email y tagline oficial
const ALTTEZ_EMAIL = "alttezsas@gmail.com";
const ALTTEZ_TAGLINE = "Tecnología de Gestión y Operación Deportiva";

// Assets
const IMG_PLAYER    = "/brand/alttez-player-stadium.jpg";
const IMG_HANDSHAKE = "/brand/alttez-handshake.jpg";
const IMG_LOGO      = "/branding/alttez-symbol-transparent.png";

// Animaciones
const E = [0.16, 1, 0.3, 1];
const premiumSpring = { type: "spring", stiffness: 80, damping: 15 };
const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: E } }
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } }
};

// ══════════════════════════════════════════════════
// ICONOS SVG — Adaptables a color dinámico
// ══════════════════════════════════════════════════
const Ico = {
  Lock:     ({ s=14, c }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="3" stroke={c} strokeWidth="1.8"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>
  ),
  Check:    ({ s=20, c=B.bronce }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.7"/><path d="M8 12l3 3 5-5" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  CheckFill:({ s=16, c=B.bronce }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  Edit:     ({ s=20, c }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={c} strokeWidth="1.7" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  Arrow:    ({ s=16, c }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  Calendar: ({ s=15, c }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke={c} strokeWidth="1.7"/><path d="M3 10h18M8 2v4M16 2v4" stroke={c} strokeWidth="1.7" strokeLinecap="round"/></svg>
  ),
  Person:   ({ s=22, c=B.bronce }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.7"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={c} strokeWidth="1.7" strokeLinecap="round"/></svg>
  ),
  Percent:  ({ s=22, c=B.bronce }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3.5" stroke={c} strokeWidth="1.7"/><circle cx="15" cy="15" r="3.5" stroke={c} strokeWidth="1.7"/><path d="M7 17L17 7" stroke={c} strokeWidth="1.7" strokeLinecap="round"/></svg>
  ),
  Star:     ({ s=22, c=B.bronce }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={c} strokeWidth="1.7" strokeLinejoin="round"/></svg>
  ),
  Shield:   ({ s=22, c=B.bronce }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={c} strokeWidth="1.7" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  Globe:    ({ s=22, c=B.bronce }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.7"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={c} strokeWidth="1.7" strokeLinecap="round"/></svg>
  ),
  Key:      ({ s=22, c=B.bronce }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  File:     ({ s=22, c=B.bronce }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={c} strokeWidth="1.7"/><polyline points="14,2 14,8 20,8" stroke={c} strokeWidth="1.7" strokeLinecap="round"/><line x1="16" y1="13" x2="8" y2="13" stroke={c} strokeWidth="1.7" strokeLinecap="round"/></svg>
  ),
  Email:    ({ s=16, c }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={c} strokeWidth="1.6"/><polyline points="22,6 12,13 2,6" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>
  ),
};

// ══════════════════════════════════════════════════
// SIGN MODAL
// ══════════════════════════════════════════════════
function SignModal({ proposal, onSign, onComplete, onClose, colors, isDark, logoBase64 }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cc, setCc] = useState("");
  const [chkTerms, setChkTerms] = useState(false);
  const [chkConfid, setChkConfid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [step, setStep] = useState("form"); // "form" | "signing" | "success"
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [downloadPdfDecision, setDownloadPdfDecision] = useState(true);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [finalPayload, setFinalPayload] = useState("");

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasEmpty, setCanvasEmpty] = useState(true);

  const nameInputRef = useRef(null);

  // Focus on name input on mount
  useEffect(() => {
    if (step === "form") {
      setTimeout(() => nameInputRef.current?.focus(), 160);
    }
  }, [step]);

  // Initialize Canvas stroke color & dynamic sizes
  useEffect(() => {
    if (step !== "form") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#1F1F1D"; // Always charcoal black for PDF high contrast
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [step]);

  function getCoordinates(e) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function handleStart(e) {
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setCanvasEmpty(false);
  }

  function handleMove(e) {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  }

  function handleEnd() {
    setIsDrawing(false);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasEmpty(true);
  }

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSign = name.trim().length >= 3 && cc.trim().length >= 5 && isEmailValid && chkTerms && chkConfid && !canvasEmpty;

  async function handleSignSubmit() {
    if (!canSign) return;
    setErr("");
    
    const canvas = canvasRef.current;
    const signatureImg = canvas ? canvas.toDataURL("image/png") : "";

    const payload = JSON.stringify({
      name: name.trim(),
      email: email.trim(),
      cc: cc.trim(),
      sig: signatureImg
    });

    setFinalPayload(payload);
    setStep("signing");
    setProgress(0);
    setStatusText("Procesando trazos de firma...");

    // Start progress simulation
    let currentProgress = 0;
    const interval = setInterval(async () => {
      currentProgress += Math.floor(Math.random() * 8) + 4;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        // Finalize signature
        try {
          const updatedProposal = await onSign(payload);
          if (updatedProposal) {
            const parsed = JSON.parse(payload);
            const doc = generateCleanPDF(updatedProposal, parsed, logoBase64);
            setPdfDoc(doc);
            setStep("success");
          } else {
            setErr("No se pudo registrar la firma en el servidor.");
            setStep("form");
          }
        } catch (e) {
          setErr("Error de red o de base de datos. Inténtalo de nuevo.");
          setStep("form");
        }
      }
      
      setProgress(currentProgress);
      if (currentProgress < 30) {
        setStatusText("Procesando trazos de firma digital...");
      } else if (currentProgress >= 30 && currentProgress < 65) {
        setStatusText("Generando acuerdo comercial PDF...");
      } else if (currentProgress >= 65 && currentProgress < 90) {
        setStatusText("Registrando firma en base de datos...");
      } else {
        setStatusText("Guardando acuerdo confidencial...");
      }
    }, 80);
  }

  function handleFinalize() {
    if (downloadPdfDecision && pdfDoc) {
      const parsed = JSON.parse(finalPayload);
      pdfDoc.save(`Acuerdo_Alianza_${parsed.name.replace(/\s+/g, '_')}.pdf`);
    }
    onComplete();
  }

  const inputStyle = {
    fontFamily: FONT,
    width: "100%",
    padding: "14px 18px",
    borderRadius: 12,
    border: `1.5px solid ${colors.border}`,
    background: colors.modalInputBg,
    color: colors.text,
    fontSize: 14.5,
    outline: "none",
    fontWeight: W.regular,
    transition: "border-color 0.2s, box-shadow 0.2s"
  };

  const labelStyle = {
    fontSize: 11.5,
    fontWeight: W.bold,
    color: colors.textMuted,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    marginBottom: 8,
    display: "block"
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: colors.overlay,
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      zIndex: 1000,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.4, ease: E }}
        style={{
          width: "100%",
          maxWidth: 500,
          background: colors.modalBg,
          border: `1.5px solid ${colors.border}`,
          borderRadius: 24,
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.4)",
          padding: 36,
          fontFamily: FONT,
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: W.bold, color: colors.text, letterSpacing: "-0.01em" }}>
              {step === "form" && "Aceptar Propuesta"}
              {step === "signing" && "Formalizando Alianza"}
              {step === "success" && "¡Alianza Establecida!"}
            </div>
            <div style={{ fontSize: 13.5, color: colors.textMuted, marginTop: 4 }}>
              {step === "form" && "Completa tus datos para formalizar la alianza"}
              {step === "signing" && "Procesando documentación digital confidencial"}
              {step === "success" && "El acuerdo ha sido firmado con éxito"}
            </div>
          </div>
          {step === "form" && (
            <button
              onClick={onClose}
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(31,31,29,0.05)",
                border: "none",
                width: 32,
                height: 32,
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.textMuted
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* STEP 1: FORM AND SIGNATURE */}
        {step === "form" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Nombre */}
            <div>
              <label style={labelStyle}>Nombre Completo</label>
              <input
                ref={nameInputRef}
                type="text"
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = B.bronce}
                onBlur={e => e.currentTarget.style.borderColor = colors.border}
              />
            </div>

            {/* Documento */}
            <div>
              <label style={labelStyle}>C.C. / Documento de Identidad</label>
              <input
                type="text"
                placeholder="Ej. 123456789"
                value={cc}
                onChange={e => setCc(e.target.value)}
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = B.bronce}
                onBlur={e => e.currentTarget.style.borderColor = colors.border}
              />
            </div>

            {/* Correo */}
            <div>
              <label style={labelStyle}>Correo Electrónico</label>
              <input
                type="email"
                placeholder="Ej. juan.perez@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = B.bronce}
                onBlur={e => e.currentTarget.style.borderColor = colors.border}
              />
            </div>

            {/* Checkboxes */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, margin: "6px 0" }}>
              <label style={{ display: "flex", gap: 12, cursor: "pointer", userSelect: "none" }}>
                <input
                  type="checkbox"
                  checked={chkTerms}
                  onChange={e => setChkTerms(e.target.checked)}
                  style={{
                    width: 18,
                    height: 18,
                    accentColor: B.bronce,
                    cursor: "pointer",
                    marginTop: 2
                  }}
                />
                <span style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.5 }}>
                  Acepto los términos y condiciones de la propuesta de ALTTEZ y las políticas de tratamiento de datos.
                </span>
              </label>

              <label style={{ display: "flex", gap: 12, cursor: "pointer", userSelect: "none" }}>
                <input
                  type="checkbox"
                  checked={chkConfid}
                  onChange={e => setChkConfid(e.target.checked)}
                  style={{
                    width: 18,
                    height: 18,
                    accentColor: B.bronce,
                    cursor: "pointer",
                    marginTop: 2
                  }}
                />
                <span style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.5 }}>
                  Acepto el acuerdo de confidencialidad y me comprometo a no divulgar la información compartida en esta propuesta.
                </span>
              </label>
            </div>

            {/* Canvas de Firma */}
            <div>
              <label style={labelStyle}>Firma Digital</label>
              <div style={{
                position: "relative",
                width: "100%",
                height: 140,
                background: "#FFFFFF",
                border: "1.5px dashed #DCD4C9",
                borderRadius: 12,
                overflow: "hidden"
              }}>
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleStart}
                  onMouseMove={handleMove}
                  onMouseUp={handleEnd}
                  onMouseLeave={handleEnd}
                  onTouchStart={handleStart}
                  onTouchMove={handleMove}
                  onTouchEnd={handleEnd}
                  style={{ width: "100%", height: "100%", cursor: "crosshair" }}
                />
                {canvasEmpty && (
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    fontSize: 13,
                    color: "#8C8375",
                    fontWeight: W.medium
                  }}>
                    Dibuja tu firma aquí usando el mouse o dedo
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={clearCanvas}
                style={{
                  alignSelf: "flex-end",
                  background: "none",
                  border: "none",
                  color: B.bronce,
                  fontSize: 12,
                  fontWeight: W.bold,
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontFamily: FONT,
                  marginTop: 8,
                  display: "block"
                }}
              >
                Limpiar Firma
              </button>
            </div>

            {err && (
              <div style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: "rgba(217,92,92,0.07)",
                border: "1px solid rgba(217,92,92,0.22)",
                color: B.danger,
                fontSize: 13.5
              }}>
                {err}
              </div>
            )}

            {/* Action button */}
            <div style={{ marginTop: 10 }}>
              <motion.button
                onClick={handleSignSubmit}
                disabled={!canSign}
                whileHover={canSign ? { y: -1, boxShadow: `0 8px 24px rgba(206,137,70,0.22)` } : {}}
                whileTap={canSign ? { scale: 0.98 } : {}}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: 12,
                  border: "none",
                  background: !canSign ? colors.btnDisabledBg : `linear-gradient(135deg, ${B.bronce} 0%, ${B.bronceDeep} 100%)`,
                  color: !canSign ? colors.textDim : B.heroW,
                  fontSize: 15,
                  fontWeight: W.bold,
                  fontFamily: FONT,
                  cursor: !canSign ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
              >
                Firmar y Aceptar Alianza
              </motion.button>
            </div>
          </div>
        )}

        {/* STEP 2: PROCESSING / PROGRESS BAR */}
        {step === "signing" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 0", textAlign: "center" }}>
            <div style={{ position: "relative", width: 100, height: 100, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="80" height="80" viewBox="0 0 50 50" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="25" cy="25" r="20" fill="none" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(31,31,29,0.05)"} strokeWidth="4" />
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke={B.bronce}
                  strokeWidth="4"
                  strokeDasharray="125.6"
                  strokeDashoffset={125.6 - (125.6 * progress) / 100}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.1s ease" }}
                />
              </svg>
              <div style={{ position: "absolute", fontSize: 18, fontWeight: W.bold, color: colors.text }}>
                {progress}%
              </div>
            </div>
            
            <div style={{ fontSize: 15, fontWeight: W.semibold, color: colors.text, marginBottom: 8 }}>
              {statusText}
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted }}>
              No cierres esta ventana
            </div>

            <div style={{ width: "100%", height: 6, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(31,31,29,0.05)", borderRadius: 3, marginTop: 32, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${B.bronce} 0%, ${B.bronceSft} 100%)`,
                  borderRadius: 3,
                  transition: "width 0.1s ease"
                }}
              />
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS AND DOWNLOAD DECISION */}
        {step === "success" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, textAlign: "center", padding: "10px 0" }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(47,165,111,0.08)",
              border: "2.5px solid #2FA56F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              color: "#2FA56F",
              fontSize: 32,
              boxShadow: "0 8px 24px rgba(47,165,111,0.12)"
            }}>
              ✓
            </div>

            <div>
              <div style={{ fontSize: 22, fontWeight: W.bold, color: colors.text, marginBottom: 8 }}>¡Firma Registrada!</div>
              <div style={{ fontSize: 14.5, color: colors.textMuted, lineHeight: 1.6, maxWidth: 400, margin: "0 auto" }}>
                El acuerdo de alianza estratégica con ALTTEZ ha sido formalizado y guardado con éxito en nuestro sistema de forma confidencial.
              </div>
            </div>

            <div style={{
              background: isDark ? "rgba(255,255,255,0.02)" : "rgba(31,31,29,0.02)",
              border: `1.5px solid ${colors.border}`,
              borderRadius: 16,
              padding: "18px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              textAlign: "left",
              marginTop: 10
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: W.bold, color: colors.text }}>Descargar copia del Acuerdo (PDF)</div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4, lineHeight: 1.4 }}>
                  Al finalizar, se descargará un documento PDF limpio con las firmas digitales para tu respaldo personal.
                </div>
              </div>
              <input
                type="checkbox"
                checked={downloadPdfDecision}
                onChange={e => setDownloadPdfDecision(e.target.checked)}
                style={{
                  width: 22,
                  height: 22,
                  accentColor: B.bronce,
                  cursor: "pointer"
                }}
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <motion.button
                onClick={handleFinalize}
                whileHover={{ y: -1, boxShadow: `0 8px 24px rgba(47,165,111,0.22)` }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: 12,
                  border: "none",
                  background: `linear-gradient(135deg, #2FA56F 0%, #208B57 100%)`,
                  color: "#FFFFFF",
                  fontSize: 15,
                  fontWeight: W.bold,
                  fontFamily: FONT,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Finalizar y Continuar
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// Animated Number Counter
// ══════════════════════════════════════════════════
function Counter({ target, suffix = "" }) {
  const ref    = useRef(null);
  const [val, setVal] = useState(0);
  const inView = useInView(ref, { once:true, margin:"-80px" });

  useEffect(() => {
    if (!inView) return;
    const ctrl = fmAnimate(0, target, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: v => setVal(Math.round(v * 10) / 10),
    });
    return ctrl.stop;
  }, [inView, target]);

  return <span ref={ref}>{val}{suffix}</span>;
}

function fmtFecha(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00Z");
  const M = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${d.getUTCDate()} de ${M[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

// ══════════════════════════════════════════════════
// LOADING
// ══════════════════════════════════════════════════
function LoadingPage({ colors, isDark }) {
  return (
    <div style={{ minHeight:"100vh", background:colors.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:FONT, transition:"background 0.4s ease" }}>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ textAlign:"center" }}>
        <motion.img
          src={IMG_LOGO} alt="ALTTEZ"
          animate={{ opacity:[0.4,1,0.4] }}
          transition={{ repeat:Infinity, duration:2, ease:"easeInOut" }}
          style={{ height:46, marginBottom:24, display:"block", margin:"0 auto 24px", filter: isDark ? "brightness(0) invert(1)" : "none" }}
          onError={e => { e.currentTarget.style.display="none"; }}
        />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          {[0,1,2].map(i => (
            <motion.div key={i}
              animate={{ scale:[1,1.5,1], opacity:[0.3,1,0.3] }}
              transition={{ repeat:Infinity, duration:1, ease:"easeInOut", delay:i*0.18 }}
              style={{ width:8, height:8, borderRadius:"50%", background:B.bronce }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// NOT FOUND
// ══════════════════════════════════════════════════
function NotFoundPage({ colors, isDark }) {
  return (
    <div style={{ minHeight:"100vh", background:colors.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:FONT, padding:24, transition:"background 0.4s ease" }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, ease:E }}
        style={{ textAlign:"center", maxWidth:440 }}>
        <img src={IMG_LOGO} alt="ALTTEZ" style={{ height:38, marginBottom:28, filter: isDark ? "brightness(0) invert(1)" : "none" }} onError={e => { e.currentTarget.style.display="none"; }} />
        <div style={{ fontSize:88, fontWeight:W.bold, color:B.bronce, lineHeight:1, letterSpacing:"-0.05em", marginBottom:16 }}>404</div>
        <div style={{ fontSize:24, fontWeight:W.semibold, color:colors.text, marginBottom:14, letterSpacing:"-0.02em" }}>Propuesta no encontrada</div>
        <div style={{ color:colors.textMuted, fontSize:15, lineHeight:1.75, fontWeight:W.regular }}>
          Este enlace es inválido, ha expirado o no está disponible.<br />Verifica que el enlace sea correcto.
        </div>
        <div style={{ marginTop:36, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <Ico.Lock s={13} c={colors.textDim} />
          <span style={{ fontSize:12, color:colors.textDim, letterSpacing:"0.06em" }}>Propuesta Confidencial · ALTTEZ</span>
        </div>
      </motion.div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// SUCCESS SCREEN
// ══════════════════════════════════════════════════
function SuccessScreen({ type, proposal, colors, isDark }) {
  const isAccepted = type === "aceptada";
  return (
    <div style={{ minHeight:"100vh", background:colors.bg, fontFamily:FONT, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, textAlign:"center", position:"relative", transition:"background 0.4s ease" }}>
      {/* Subtle background texture */}
      <div style={{ position:"absolute", inset:0, backgroundImage:`url(${IMG_PLAYER})`, backgroundSize:"cover", backgroundPosition:"center", opacity:0.04 }} />

      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, ease:E }}
        style={{ position:"relative", zIndex:1, maxWidth:540 }}>

        {/* Icon circle */}
        <div style={{ position:"relative", width:96, height:96, margin:"0 auto 40px" }}>
          <motion.div
            initial={{ scale:0 }} animate={{ scale:1 }}
            transition={{ duration:0.6, ease:[0.175, 0.885, 0.32, 1.275], delay:0.1 }}
            style={{ width:96, height:96, borderRadius:"50%", background:B.bronceDim, border:`2px solid ${B.bronceBor}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {isAccepted ? <Ico.Check s={40} c={B.bronce} /> : <Ico.Edit s={40} c={colors.textMuted} />}
          </motion.div>
        </div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}>
          <div style={{ fontSize:"clamp(28px, 4.5vw, 44px)", fontWeight:W.bold, color:colors.text, lineHeight:1.1, letterSpacing:"-0.035em", marginBottom:20 }}>
            {isAccepted ? `Bienvenido, ${proposal.client_name}.` : "Contrapropuesta enviada."}
          </div>
          <div style={{ fontSize:16.5, color:colors.textMuted, lineHeight:1.8, fontWeight:W.regular, marginBottom:40, maxWidth:450, margin:"0 auto 40px" }}>
            {isAccepted
              ? "Has dado el primer paso hacia una alianza estratégica real. Nos pondremos en contacto a la brevedad para los próximos pasos."
              : "Recibimos tu propuesta alternativa. La evaluaremos y te responderemos en menos de 24 horas."
            }
          </div>
          <a href={`mailto:${ALTTEZ_EMAIL}`}
            style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"15px 30px", borderRadius:12, background:`linear-gradient(135deg, ${B.bronce} 0%, ${B.bronceDeep} 100%)`, color:B.heroW, fontSize:15, fontWeight:W.semibold, fontFamily:FONT, textDecoration:"none", boxShadow:`0 10px 28px rgba(206,137,70,0.28)`, transition:"transform 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <Ico.Email s={18} c={B.heroW} /> {ALTTEZ_EMAIL}
          </a>
        </motion.div>
      </motion.div>

      <div style={{ position:"absolute", bottom:36, textAlign:"center" }}>
        <img src={IMG_LOGO} alt="ALTTEZ" style={{ height:26, opacity:0.35, filter: isDark ? "brightness(0) invert(1)" : "none" }} onError={e => { e.currentTarget.style.display="none"; }} />
      </div>
    </div>
  );
}

// ── PDF GENERATOR & NOTIFIER UTILS ──
// ══════════════════════════════════════════════════
function drawRunningHeader(doc, logoBase64, PAGE_W, MARGIN, COLOR_ACCENT, COLOR_PRIMARY, COLOR_MUTED, COLOR_LIGHT) {
  // Orange thin line at the top
  doc.setFillColor(...COLOR_ACCENT);
  doc.rect(0, 0, PAGE_W, 3, "F");

  // Logo in header
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", MARGIN, 6, 8, 8);
    } catch (e) {
      console.error("Error drawing logo in header:", e);
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text("ALTTEZ", logoBase64 ? MARGIN + 10 : MARGIN, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text("ACUERDO DE ALIANZA ESTRATÉGICA Y VESTING (TERM SHEET)", PAGE_W - MARGIN, 12, { align: "right" });

  doc.setDrawColor(...COLOR_LIGHT);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, 18, PAGE_W - MARGIN, 18);
}

function drawRunningFooter(doc, pageNum, totalPages, PAGE_W, PAGE_H, MARGIN, COLOR_MUTED) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COLOR_MUTED);
  doc.text("ALTTEZ. Tecnología de Gestión y Operación Deportiva.", MARGIN, PAGE_H - 12);
  doc.text("Documento Confidencial · Identidad visual clara, premium y consistente.", MARGIN, PAGE_H - 8);
  doc.text(`Página ${pageNum} de ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 8, { align: "right" });
}

function drawElegantJulianSignature(doc, x, y) {
  doc.setDrawColor(20, 50, 150); // Navy blue ink
  doc.setLineWidth(0.45);
  
  // J
  doc.line(x + 5, y + 13, x + 9, y + 3);
  doc.line(x + 9, y + 3, x + 8, y + 16);
  doc.line(x + 8, y + 16, x + 13, y + 13);
  // u
  doc.line(x + 13, y + 13, x + 15, y + 16);
  doc.line(x + 15, y + 16, x + 17, y + 13);
  // l
  doc.line(x + 17, y + 13, x + 18, y + 6);
  doc.line(x + 18, y + 6, x + 20, y + 16);
  // i
  doc.line(x + 20, y + 16, x + 22, y + 13);
  doc.line(x + 22, y + 13, x + 23, y + 16);
  
  doc.setFillColor(20, 50, 150);
  try {
    doc.circle(x + 21.5, y + 10, 0.25, "F");
  } catch (e) {
    // Fallback if circle fails
    doc.line(x + 21.4, y + 10, x + 21.6, y + 10);
  }
  
  // a
  doc.line(x + 23, y + 16, x + 26, y + 13);
  doc.line(x + 26, y + 13, x + 25, y + 16);
  doc.line(x + 25, y + 16, x + 28, y + 16);
  // n
  doc.line(x + 28, y + 16, x + 30, y + 13);
  doc.line(x + 30, y + 13, x + 32, y + 16);
  
  // H
  doc.line(x + 36, y + 4, x + 35, y + 16);
  doc.line(x + 35, y + 10, x + 39, y + 10);
  doc.line(x + 39, y + 3, x + 38, y + 16);
  
  // eredia
  doc.line(x + 38, y + 16, x + 41, y + 13); // e
  doc.line(x + 41, y + 13, x + 43, y + 16); // r
  doc.line(x + 43, y + 16, x + 45, y + 13); // e
  doc.line(x + 45, y + 13, x + 48, y + 8);  // d
  doc.line(x + 48, y + 8, x + 48, y + 16);
  doc.line(x + 48, y + 16, x + 50, y + 13); // i
  doc.line(x + 50, y + 13, x + 51, y + 16);
  
  try {
    doc.circle(x + 50.5, y + 10, 0.25, "F");
  } catch (e) {
    doc.line(x + 50.4, y + 10, x + 50.6, y + 10);
  }
  
  doc.line(x + 51, y + 16, x + 54, y + 13); // a
  doc.line(x + 54, y + 13, x + 53, y + 16);
  
  // Underscore flourish
  doc.line(x + 3, y + 17, x + 57, y + 16);
}

function renderSectionCard(doc, title, items, yStart, MARGIN, CONTENT_W, COLOR_ACCENT, COLOR_PRIMARY, COLOR_MUTED) {
  let padding = 8;
  
  // Set font and size for calculation to ensure text split is mathematically correct
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.2);

  const maxW = CONTENT_W - padding * 2; // 154 mm

  let titleH = 6;
  let dividerH = 4;

  // Format all items and calculate height
  const formattedItems = items.map(item => {
    if (item.type === "paragraph") {
      const lines = doc.splitTextToSize(item.text, maxW);
      return { type: "paragraph", lines, h: lines.length * 4.8 + 4 };
    } else if (item.type === "bullet") {
      const indent = 6;
      const div = item.divider !== undefined ? item.divider : ":";
      const fullText = `• ${item.label}${div} ${item.text}`;
      const lines = doc.splitTextToSize(fullText, maxW - indent);
      return { type: "bullet", label: item.label, divider: div, textLines: lines, h: lines.length * 4.8 + 3 };
    }
    return { h: 0 };
  });

  const cardH = padding * 2 + titleH + dividerH + formattedItems.reduce((acc, it) => acc + it.h, 0);

  // Draw card background
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 225, 218);
  doc.setLineWidth(0.35);
  doc.roundedRect(MARGIN, yStart, CONTENT_W, cardH, 4, 4, "FD");

  let currentY = yStart + padding + 4;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_ACCENT);
  doc.text(title.toUpperCase(), MARGIN + padding, currentY);

  // Divider
  currentY += 3;
  doc.setDrawColor(240, 235, 228);
  doc.line(MARGIN + padding, currentY, MARGIN + CONTENT_W - padding, currentY);
  currentY += 6;

  // Render items
  formattedItems.forEach((fItem, idx) => {
    const raw = items[idx];
    if (fItem.type === "paragraph") {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.2);
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text(raw.text, MARGIN + padding, currentY, {
        align: "justify",
        maxWidth: maxW,
        lineHeightFactor: 1.48
      });
      currentY += fItem.h;
    } else if (fItem.type === "bullet") {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.2);
      doc.setTextColor(...COLOR_PRIMARY);
      
      const lines = fItem.textLines;
      const div = fItem.divider;
      lines.forEach((line, lineIdx) => {
        if (lineIdx === 0) {
          doc.setFont("helvetica", "bold");
          doc.text(`• ${raw.label}${div}`, MARGIN + padding + 2, currentY);
          const labelW = doc.getTextWidth(`• ${raw.label}${div} `);
          
          doc.setFont("helvetica", "normal");
          const prefix = `• ${raw.label}${div}`;
          let restOfLine = "";
          if (line.startsWith(prefix)) {
            restOfLine = line.substring(prefix.length).trim();
          } else {
            restOfLine = line;
          }
          doc.text(restOfLine, MARGIN + padding + 2 + labelW, currentY);
        } else {
          doc.setFont("helvetica", "normal");
          doc.text(line, MARGIN + padding + 8, currentY);
        }
        currentY += 4.8;
      });
      currentY += 3; // bullet spacing
    }
  });

  return cardH;
}

function generateCleanPDF(proposal, parsedPayload, logoBase64) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  
  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 20;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  
  const COLOR_PRIMARY = [31, 31, 29];   // Charcoal (#1F1F1D)
  const COLOR_ACCENT = [206, 137, 70];   // Bronze (#CE8946)
  const COLOR_MUTED = [120, 120, 120];   // Gray
  const COLOR_LIGHT = [246, 241, 234];   // Cream (#F6F1EA)
  
  // ── PAGE 1 ──
  // Header / Cover
  doc.setFillColor(...COLOR_ACCENT);
  doc.rect(0, 0, PAGE_W, 3, "F");

  // Center logo on cover
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", PAGE_W / 2 - 12, 12, 24, 24);
    } catch (e) {
      console.error("Error drawing logo on cover:", e);
    }
  }

  doc.setTextColor(...COLOR_PRIMARY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("ALTTEZ.", PAGE_W / 2, 44, { align: "center" });

  doc.setDrawColor(...COLOR_ACCENT);
  doc.setLineWidth(0.6);
  doc.line(PAGE_W / 2 - 12, 48, PAGE_W / 2 + 12, 48);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("ACUERDO DE ALIANZA ESTRATÉGICA Y VESTING", PAGE_W / 2, 58, { align: "center" });
  doc.text("(TERM SHEET)", PAGE_W / 2, 63, { align: "center" });
  
  let y = 72;
  
  // Section 1: Partes del Acuerdo
  const partesItems = [
    {
      type: "paragraph",
      text: "Entre los suscritos, quienes de manera libre y voluntaria celebran el presente memorando de entendimiento:"
    },
    {
      type: "bullet",
      label: "ALTTEZ S.A.S.",
      divider: ",",
      text: "en adelante \"La Compañía\", representada legalmente por Julián Heredia Arrauz, identificada con NIT 1007221884."
    },
    {
      type: "bullet",
      label: parsedPayload.name,
      divider: ",",
      text: `en adelante "El Aliado Estratégico", identificado con C.C. ${parsedPayload.cc || "[Número de documento]"}.`
    }
  ];
  
  const card1H = renderSectionCard(doc, "1. Partes del Acuerdo", partesItems, y, MARGIN, CONTENT_W, COLOR_ACCENT, COLOR_PRIMARY, COLOR_MUTED);
  y += card1H + 8;
  
  // Section 2: Objeto de la Alianza
  const objetoText = proposal.objeto_pdf || `Integrar, validar y escalar el software de gestión y operation deportiva de ALTTEZ, iniciando en un club deportivo piloto para validar el modelo de negocio en un entorno real, y posteriormente expandirlo a nivel regional. El Aliado aportará su red de contactos y visión comercial para acelerar la tracción de La Compañía en el mercado. En particular, el Aliado se desempeñará en el rol de: ${proposal.rol || "Líder / Embajador de Alianza"}.`;
  
  const objetoItems = [
    {
      type: "paragraph",
      text: objetoText
    }
  ];
  
  const card2H = renderSectionCard(doc, "2. Objeto de la Alianza", objetoItems, y, MARGIN, CONTENT_W, COLOR_ACCENT, COLOR_PRIMARY, COLOR_MUTED);
  
  // ── PAGE 2 ──
  doc.addPage();
  drawRunningHeader(doc, logoBase64, PAGE_W, MARGIN, COLOR_ACCENT, COLOR_PRIMARY, COLOR_MUTED, COLOR_LIGHT);
  
  y = 26;
  
  // Section 3: Participación y Esquema de Vesting
  const pct = proposal.participacion_pct || 10;
  const vestingItems = [
    {
      type: "paragraph",
      text: `Como contraprestación estratégica, se otorga al Aliado el derecho a consolidar un ${pct}% de las acciones ordinarias de La Compañía. Esta participación no se entrega de forma inmediata, sino que está sujeta al siguiente cronograma de consolidación (Vesting) basado en hitos, con una duración de 2 años:`
    },
    {
      type: "bullet",
      label: "Trimestre 1-2",
      text: "Validación e integración exitosa del piloto de ALTTEZ en el club destino."
    },
    {
      type: "bullet",
      label: "Trimestre 3-4",
      text: "Expansión del software a tres (3) clubes o ligas deportivas clave de la región."
    },
    {
      type: "bullet",
      label: "Año 2",
      text: "Escalamiento, consolidación de la operation regional y monetización activa de los clientes adquiridos."
    }
  ];
  
  const card3H = renderSectionCard(doc, "3. Participación y Esquema de Vesting", vestingItems, y, MARGIN, CONTENT_W, COLOR_ACCENT, COLOR_PRIMARY, COLOR_MUTED);
  y += card3H + 8;
  
  // Section 4: Cláusula de Cliff (Periodo de Carencia)
  const cliffText = proposal.cliff_pdf || "Se establece un periodo de carencia o \"Cliff\" estricto de seis (6) meses, o hasta la firma formal del contrato de integración con el primer club piloto (lo que ocurra primero). Si el Aliado abandona el proyecto, es desvinculado o la alianza se disuelve antes de cumplirse este hito, la participación consolidada será del 0%, sin derecho a reclamación económica, indemnización o emisión de acciones.";
  const cliffItems = [
    {
      type: "paragraph",
      text: cliffText
    }
  ];
  const card4H = renderSectionCard(doc, "4. Cláusula de Cliff (Periodo de Carencia)", cliffItems, y, MARGIN, CONTENT_W, COLOR_ACCENT, COLOR_PRIMARY, COLOR_MUTED);
  
  // ── PAGE 3 ──
  doc.addPage();
  drawRunningHeader(doc, logoBase64, PAGE_W, MARGIN, COLOR_ACCENT, COLOR_PRIMARY, COLOR_MUTED, COLOR_LIGHT);
  
  y = 26;
  
  // Section 5: Eventos de Salida (Leaver Provisions)
  const salidaItems = [
    {
      type: "paragraph",
      text: "En caso de terminación anticipada de la relación con el Aliado, el tratamiento de sus acciones dependerá de la naturaleza de su salida:"
    },
    {
      type: "bullet",
      label: "Salida Justificada (Good Leaver)",
      text: "En caso de fuerza mayor, incapacidad permanente o mutuo acuerdo formal, el Aliado conservará el porcentaje de acciones que haya logrado consolidar efectivamente hasta la fecha de retiro."
    },
    {
      type: "bullet",
      label: "Salida Penalizada (Bad Leaver)",
      text: "Si el Aliado abandona el proyecto de manera injustificada, incumple el régimen de confidencialidad, incurre en conflicto de intereses (competencia desleal) o negligencia comercial comprobada, La Compañía tendrá la opción unilateral e irrevocable de recomprar la totalidad de sus acciones (consolidadas o no consolidadas) por su valor nominal ($1 COP por acción), procediendo a su exclusión inmediata del Cap Table."
    }
  ];
  const card5H = renderSectionCard(doc, "5. Eventos de Salida (Leaver Provisions)", salidaItems, y, MARGIN, CONTENT_W, COLOR_ACCENT, COLOR_PRIMARY, COLOR_MUTED);
  y += card5H + 8;
  
  // Section 6: Confidencialidad y Propiedad Intelectual
  const confidText = "Toda la tecnología, código fuente, diseño UI/UX, estrategias comerciales, bases de datos y manuales generados en el marco de este acuerdo son propiedad exclusiva y patrimonial de ALTTEZ S.A.S. El Aliado asume un compromiso de estricta confidencialidad sobre la información privilegiada a la que tenga acceso, cuyo incumplimiento activará automáticamente la cláusula de Bad Leaver y las respectivas acciones legales por daños y perjuicios.";
  const confidItems = [
    {
      type: "paragraph",
      text: confidText
    }
  ];
  const card6H = renderSectionCard(doc, "6. Confidencialidad y Propiedad Intelectual", confidItems, y, MARGIN, CONTENT_W, COLOR_ACCENT, COLOR_PRIMARY, COLOR_MUTED);
  y += card6H + 12;
  
  // Signatures safety check
  if (y + 50 > PAGE_H - 15) {
    doc.addPage();
    drawRunningHeader(doc, logoBase64, PAGE_W, MARGIN, COLOR_ACCENT, COLOR_PRIMARY, COLOR_MUTED, COLOR_LIGHT);
    y = 26;
  }

  // Signatures line separator
  doc.setDrawColor(...COLOR_LIGHT);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  
  y += 8;
  
  let colX1 = MARGIN;
  let colX2 = MARGIN + 100;
  
  // Left Column: ALTTEZ
  doc.setDrawColor(31, 31, 29);
  doc.setLineWidth(0.5);
  doc.line(colX1, y + 18, colX1 + 60, y + 18);
  
  // Draw Julian's Signature as standard normal text in black above the line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11.5);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text("Julián Heredia Arrauz", colX1 + 2, y + 12);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text("Julián Heredia Arrauz", colX1, y + 22);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text("Representante Legal", colX1, y + 26);
  doc.text("ALTTEZ S.A.S.", colX1, y + 30);
  doc.text("NIT: 1007221884", colX1, y + 34);
  
  // Right Column: Colaborador
  doc.setDrawColor(31, 31, 29);
  doc.setLineWidth(0.5);
  doc.line(colX2, y + 18, colX2 + 60, y + 18);
  
  // Draw Collaborator's Signature above the line
  if (parsedPayload.sig) {
    try {
      doc.addImage(parsedPayload.sig, "PNG", colX2 + 5, y - 2, 45, 18);
    } catch (e) {
      console.error("Error drawing signature on PDF:", e);
    }
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text(parsedPayload.name, colX2, y + 22);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text("Aliado Estratégico", colX2, y + 26);
  doc.text(`C.C. ${parsedPayload.cc || "[Número de documento]"}`, colX2, y + 30);
  
  // Draw footers on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawRunningFooter(doc, p, totalPages, PAGE_W, PAGE_H, MARGIN, COLOR_MUTED);
  }
  
  return doc;
}

async function sendPDFNotification(proposal, name, email, cc, pdfBlob) {
  try {
    const formData = new FormData();
    formData.append("nombre_colaborador", name);
    formData.append("email", email);
    formData.append("documento_colaborador", cc);
    formData.append("propuesta_titulo", proposal.title || "Alianza Estratégica");
    formData.append("mensaje", `¡Excelente noticia! El colaborador ${name} (${email}), con documento de identidad C.C. ${cc}, ha firmado y aceptado la propuesta de Alianza Estratégica.\n\nSe adjunta el PDF del acuerdo comercial con la firma digitalizada.`);
    formData.append("attachment", pdfBlob, `propuesta_firmada_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`);
    formData.append("_subject", `¡Propuesta Aceptada y Firmada! - ${name}`);
    formData.append("_cc", email);
    formData.append("_honey", "");
    formData.append("_captcha", "false");

    const res = await fetch("https://formsubmit.co/ajax/alttezsas@gmail.com", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) console.warn("FormSubmit error:", await res.text());
  } catch (error) {
    console.error("Error al enviar notificación por correo:", error);
  }
}

// ══════════════════════════════════════════════════
// INTERACTIVE ENVELOPE EXPERIENCE (ACTUALIZADO - ESTÁNDAR MODULAR ELEVADO)
// ══════════════════════════════════════════════════
function InteractiveEnvelope({ clientName, onOpen }) {
  const [phase, setPhase] = useState("closed");
  // phases: "closed" → "opening-flap" → "sliding-letter" → "zooming"

  const handleOpen = () => {
    if (phase !== "closed") return;
    setPhase("opening-flap");
    setTimeout(() => setPhase("sliding-letter"), 600); // Ligeramente más rápido para no perder retención
    setTimeout(() => setPhase("zooming"), 1500);
    setTimeout(() => onOpen(), 2100);
  };

  const isOpening = phase !== "closed";
  const isSliding = phase === "sliding-letter" || phase === "zooming";
  const isZooming = phase === "zooming";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "linear-gradient(160deg, #0E0E0C 0%, #070705 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: FONT, overflow: "hidden",
        perspective: "1200px" // CRÍTICO: Añade profundidad 3D real al giro de la solapa
      }}
    >
      {/* Glow ambiental con latido sutil para invitar a la acción */}
      <motion.div 
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 55% 45% at 50% 50%, rgba(206,137,70,0.08) 0%, transparent 100%)", pointerEvents:"none" }} 
      />

      {/* Contenedor del sobre — hace zoom al salir */}
      <motion.div
        animate={isZooming ? { scale: 1.6, opacity: 0, y: -40, transition: { duration: 0.65, ease: [0.4, 0, 1, 1] } } : { scale: 1, opacity: 1 }}
        style={{ 
          position:"relative", width:"min(520px, 90vw)", height:360, 
          display:"flex", alignItems:"center", justifyContent:"center",
          transformStyle: "preserve-3d" // Mantiene los hijos en el espacio 3D
        }}
      >
        {/* ── CUERPO DEL SOBRE (fondo) ── */}
        <div style={{
          position:"absolute", inset:0,
          background:"#131311",
          borderRadius:20,
          border:"1.5px solid rgba(206,137,70,0.22)",
          boxShadow:"0 40px 100px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.04)",
          zIndex:1,
        }} />

        {/* ── CARTA (emerge hacia arriba) ── */}
        <motion.div
          animate={isSliding
            ? { y: -180, scale: 1, zIndex: 10, transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } }
            : { y: 0, scale: 0.92, zIndex: 2 }
          }
          style={{
            position:"absolute",
            width:"84%", height:"80%",
            background:"#FAFAF8", // Ajuste a tono marfil premium
            borderRadius:12,
            padding:"22px 26px",
            boxShadow:"0 -4px 20px rgba(0,0,0,0.4)",
            display:"flex", flexDirection:"column", justifyContent:"space-between",
          }}
        >
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:9.5, fontWeight:W.bold, color:B.bronce, letterSpacing:"0.18em", textTransform:"uppercase" }}>Documento Confidencial</div>
              <div style={{ fontSize:17, fontWeight:W.bold, color:"#1F1F1D", marginTop:4 }}>Alianza Estratégica</div>
            </div>
            <img src={IMG_LOGO} alt="ALTTEZ" style={{ height:17, opacity:0.7, filter: "brightness(0)" }} onError={e => { e.currentTarget.style.display="none"; }} />
          </div>
          <div>
            <div style={{ fontSize:11, color:"#888", fontWeight:W.medium }}>Estimado(a)</div>
            <div style={{ fontSize:20, fontWeight:W.bold, color:"#1F1F1D", marginTop:3, lineHeight:1.2 }}>{clientName}</div>
            <div style={{ fontSize:11, color:"#666", lineHeight:1.6, marginTop:10 }}>Hemos preparado una propuesta exclusiva de alianza estratégica para ti. La apertura digital garantiza la confidencialidad de este documento.</div>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid #EBE6DF", paddingTop:12 }}>
            <div style={{ fontSize:9, color:"#A5A098", fontWeight:W.semibold, letterSpacing:"0.1em" }}>VIGENCIA · 30 DÍAS</div>
            <div style={{ fontSize:9, color:B.bronce, fontWeight:W.bold, letterSpacing:"0.1em" }}>ALTTEZ S.A.S. ✦</div>
          </div>
        </motion.div>

        {/* ── SOLAPAS LATERALES ── */}
        <div style={{ position:"absolute", inset:0, background:"#161614", clipPath:"polygon(0% 0%, 50% 52%, 0% 100%)", borderRadius:"20px 0 0 20px", zIndex:3 }} />
        <div style={{ position:"absolute", inset:0, background:"#161614", clipPath:"polygon(100% 0%, 50% 52%, 100% 100%)", borderRadius:"0 20px 20px 0", zIndex:3 }} />

        {/* ── SOLAPA INFERIOR ── */}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, #121210 0%, #1A1A18 100%)", clipPath:"polygon(0% 100%, 50% 50%, 100% 100%)", borderRadius:"0 0 20px 20px", zIndex:4 }} />

        {/* ── SOLAPA SUPERIOR — gira al abrir en 3D real ── */}
        <motion.div
          animate={isOpening
            ? { rotateX: 180, zIndex: 0, transition: { duration: 0.8, ease: [0.34, 1.2, 0.64, 1] } } // Efecto spring sutil al abrir
            : { rotateX: 0, zIndex: 6 }
          }
          style={{
            position:"absolute", top:0, left:0, right:0, height:"50%",
            background:"linear-gradient(to bottom, #1E1D1B 0%, #151412 100%)",
            clipPath:"polygon(0% 0%, 50% 100%, 100% 0%)",
            borderRadius:"20px 20px 0 0",
            transformOrigin:"top center",
            backfaceVisibility:"hidden",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06)" // Borde superior sutil (Glassmorphism de profundidad)
          }}
        />

        {/* ── SELLO DE LACRE ── */}
        <AnimatePresence>
          {phase === "closed" && (
            <motion.div
              key="seal"
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.25 } }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              onClick={handleOpen}
              style={{
                position:"absolute",
                top:"50%", left:"50%",
                x: "-50%", y: "-50%", // SOLUCIÓN: Control nativo de ejes en Framer Motion
                zIndex:7, cursor:"pointer",
                width:84, height:84, borderRadius:"50%",
                background:"radial-gradient(circle at 38% 35%, #EAA95E 0%, #CE8946 50%, #A06830 100%)",
                boxShadow:"0 8px 28px rgba(206,137,70,0.5), inset 0 2px 5px rgba(255,255,255,0.25), inset 0 -3px 5px rgba(0,0,0,0.2)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}
            >
              <div style={{ position:"absolute", inset:6, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,0.2)" }} />
              <img
                src={IMG_LOGO} alt="ALTTEZ"
                // Logo en bajo relieve oscuro en lugar de negro plano
                style={{ width:42, height:42, objectFit:"contain", filter:"brightness(0) opacity(0.65) drop-shadow(0px 1px 0px rgba(255,255,255,0.3))", pointerEvents:"none" }}
                onError={e => { e.currentTarget.style.display="none"; }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── TEXTO CTA ── */}
      <AnimatePresence>
        {phase === "closed" && (
          <motion.div
            key="cta"
            initial={{ opacity:0, y:10 }}
            animate={{ opacity:1, y:0, transition:{ delay:0.5, duration:0.4 } }}
            exit={{ opacity:0, transition:{ duration:0.2 } }}
            style={{
              position:"absolute",
              top:"calc(50% + 58px)", left:"50%",
              x: "-50%", // SOLUCIÓN: Anclaje correcto del eje X sin afectar la animación de Y
              zIndex:20, pointerEvents:"none",
              display:"flex", flexDirection:"column", alignItems:"center", gap:5,
              whiteSpace:"nowrap",
            }}
          >
            <div style={{ fontSize:11, fontWeight:W.bold, color:B.bronce, letterSpacing:"0.14em", textTransform:"uppercase" }}>Presiona el sello</div>
            <div style={{ fontSize:10.5, color:"rgba(246,241,234,0.35)", fontWeight:W.medium }}>Para abrir tu propuesta confidencial</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════
export default function PublicProposalPage() {
  const { id } = useParams();
  const [proposal, setProposal]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [finalStatus, setFinalStatus] = useState(null);
  const [scrolled, setScrolled]       = useState(false);

  // Switch de tema: Default OSCURO
  const [isDark, setIsDark]           = useState(true);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);

  // Estados interactivos para Vesting y decisiones
  const [vestingOpen, setVestingOpen] = useState(false);
  const [showInlineCounter, setShowInlineCounter] = useState(false);
  const [counterText, setCounterText] = useState("");
  const [counterLoading, setCounterLoading] = useState(false);
  const [counterErr, setCounterErr] = useState("");

  // Control del modal de firma
  const [showSignModal, setShowSignModal] = useState(false);
  const [logoBase64, setLogoBase64] = useState("");

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      try {
        const dataURL = canvas.toDataURL("image/png");
        setLogoBase64(dataURL);
      } catch (err) {
        console.error("Error converting logo to base64:", err);
      }
    };
    img.src = IMG_LOGO;
  }, []);

  const heroRef = useRef(null);
  const { scrollY, scrollYProgress } = useScroll();
  const bgY       = useTransform(scrollY, [0, 800], [0, 220]);
  const heroAlpha = useTransform(scrollY, [0, 600], [1, 0]);
  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Paleta Dinámica para Dark / Light
  const colors = isDark ? {
    bg: "#121210",               // Grafito de fondo adaptado (#1F1F1D)
    bgAlt: "#1A1A18",            // Beige alternativo en oscuro
    card: "#181816",             // Tarjetas en oscuro
    text: "#F6F1EA",             // Marfil para el texto
    textMuted: "rgba(246, 241, 234, 0.65)",
    textDim: "rgba(246, 241, 234, 0.35)",
    border: "rgba(226, 217, 204, 0.12)",
    borderSft: "rgba(226, 217, 204, 0.07)",
    shadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
    overlay: "rgba(10, 10, 8, 0.75)",
    modalBg: "#181816",
    modalInputBg: "#20201E",
    btnSecondaryBg: "#1A1A18",
    btnDisabledBg: "#20201E",
    headerBg: "rgba(18, 18, 16, 0.94)",
  } : {
    bg: "#F6F1EA",               // Marfil principal
    bgAlt: "#EDE8D0",            // Beige de apoyo
    card: "#FFFFFF",             // Blanco
    text: "#1F1F1D",             // Grafito
    textMuted: "rgba(31, 31, 29, 0.58)",
    textDim: "rgba(31, 31, 29, 0.35)",
    border: "#E2D9CC",           // Divisor claro
    borderSft: "#EDE8DF",
    shadow: "0 6px 24px rgba(31, 31, 29, 0.05)",
    overlay: "rgba(31, 31, 29, 0.55)",
    modalBg: "#FFFFFF",
    modalInputBg: "#FFFFFF",
    btnSecondaryBg: "#F6F1EA",
    btnDisabledBg: "#EDE8D0",
    headerBg: "rgba(246, 241, 234, 0.96)",
  };

  useEffect(() => {
    getProposalById(id).then(d => {
      setProposal(d);
      if (d?.status === "aceptada" || d?.status === "contrapropuesta") setFinalStatus(d.status);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  async function handleSignConfirm(serializedPayload) {
    // Al realizar la firma digital
    try {
      const u = await signProposal(proposal?.id || id, serializedPayload);
      if (u) {
        setProposal(u);

        // Generar, descargar y enviar PDF de manera asíncrona
        try {
          const parsed = JSON.parse(serializedPayload);
          const doc = generateCleanPDF(u, parsed, logoBase64);
          
          // Generar blob y enviar por correo al equipo de ALTTEZ
          const pdfBlob = doc.output("blob");
          sendPDFNotification(u, parsed.name, parsed.email, parsed.cc, pdfBlob);
        } catch (pdfErr) {
          console.error("Error generating or sending PDF receipt:", pdfErr);
        }
        
        return u;
      }
    } catch (err) {
      console.error("Error signing proposal:", err);
      throw err;
    }
    return null;
  }

  async function handleSendInlineCounter() {
    if (counterText.trim().length < 10) {
      setCounterErr("Describe tu propuesta con más detalle (mínimo 10 caracteres).");
      return;
    }
    setCounterLoading(true);
    setCounterErr("");
    try {
      const u = await sendCounterProposal(proposal?.id || id, counterText.trim());
      if (u) {
        setProposal(u);
        setFinalStatus("contrapropuesta");
      }
    } catch {
      setCounterErr("Error al enviar. Inténtalo de nuevo.");
      setCounterLoading(false);
    }
  }

  if (loading) return <LoadingPage colors={colors} isDark={isDark} />;
  if (!proposal) return <NotFoundPage colors={colors} isDark={isDark} />;
  if (finalStatus) return <SuccessScreen type={finalStatus} proposal={proposal} colors={colors} isDark={isDark} />;

  const { client_name, title, subtitle, fecha, rol, participacion_pct, impacto, beneficios = [], description } = proposal;

  if (!envelopeOpened) return <InteractiveEnvelope clientName={client_name} onOpen={() => setEnvelopeOpened(true)} />;
  const pct      = Number(participacion_pct || 0);
  const bensRaw  = Array.isArray(beneficios) ? beneficios.filter(b => b?.trim()) : [];
  const isClosed = proposal.status === "rechazada";

  const DEFAULT_BENS = [
    "Acceso a oportunidades y contactos clave en el mundo del fútbol.",
    "Apertura de puertas para el piloto con el club.",
    "Validación de nuestro modelo de negocio en un entorno real.",
    "Inicio de una relación estratégica a largo plazo.",
  ];
  const bens = bensRaw.length ? bensRaw : DEFAULT_BENS;
  const BEN_ICONS = [Ico.Key, Ico.Globe, Ico.Shield, Ico.Star];

  // Section label component — SaaS badge style
  const SectionLabel = ({ n, label }) => (
    <motion.div
      initial={{ opacity:0, x:-15 }}
      whileInView={{ opacity:1, x:0 }}
      viewport={{ once:true, margin:"-100px" }}
      transition={{ duration:0.5, ease:E }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 36,
        padding: "6px 14px",
        borderRadius: 8,
        background: isDark ? "rgba(255,255,255,0.02)" : "rgba(31,31,29,0.03)",
        border: `1px solid ${colors.border}`,
        transition: "all 0.4s ease"
      }}>
      <span style={{ fontSize:10.5, fontWeight:W.bold, color:B.bronce, letterSpacing:"0.12em" }}>{n}</span>
      <div style={{ width:1, height:12, background:colors.border }} />
      <span style={{ fontFamily:FONT, fontSize:10.5, fontWeight:W.bold, color:colors.textMuted, letterSpacing:"0.16em", textTransform:"uppercase" }}>
        {label}
      </span>
    </motion.div>
  );

  // Primary CTA button
  const PrimaryBtn = ({ onClick, disabled, children }) => (
    <motion.button onClick={onClick} disabled={disabled}
      whileHover={!disabled ? { y:-2, boxShadow:`0 12px 32px rgba(206,137,70,0.36)` } : {}}
      whileTap={!disabled ? { scale:0.975 } : {}}
      transition={premiumSpring}
      style={{ width:"100%", padding:"17px 24px", borderRadius:12, border:"none", background:disabled ? colors.btnDisabledBg : `linear-gradient(135deg, ${B.bronce} 0%, ${B.bronceDeep} 100%)`, color:disabled ? colors.textDim : B.heroW, fontSize:15.5, fontWeight:W.semibold, fontFamily:FONT, cursor:disabled ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, transition:"background 0.22s, box-shadow 0.22s, color 0.22s", boxShadow:disabled ? "none" : `0 6px 24px rgba(206,137,70,0.24)`, letterSpacing:"0.02em" }}>
      {children}
      {!disabled && <Ico.Arrow s={18} c={B.heroW} />}
    </motion.button>
  );

  // Secondary CTA button
  const SecondaryBtn = ({ onClick, disabled, children }) => (
    <motion.button onClick={onClick} disabled={disabled}
      whileHover={!disabled ? { y:-2, borderColor:colors.text, boxShadow:colors.shadow } : {}}
      whileTap={!disabled ? { scale:0.975 } : {}}
      transition={premiumSpring}
      style={{ width:"100%", padding:"17px 24px", borderRadius:12, border:`1.5px solid ${colors.border}`, background:colors.card, color:disabled ? colors.textDim : colors.text, fontSize:15.5, fontWeight:W.semibold, fontFamily:FONT, cursor:disabled ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, transition:"all 0.22s" }}>
      {children}
      {!disabled && <Ico.Arrow s={18} c={colors.text} />}
    </motion.button>
  );

  const isHeaderLight = !scrolled || isDark;

  return (
    <div style={{ fontFamily:FONT, background:colors.bg, color:colors.text, minHeight:"100vh", overflowX:"hidden", transition:"background 0.4s ease, color 0.4s ease" }}>

      {/* ━━ GLOBAL STYLES ━━ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Manrope', sans-serif; -webkit-font-smoothing: antialiased; }
        .proposal-grid-2 { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 64px 96px; align-items: start; }
        .proposal-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .proposal-cards-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        @media (max-width: 960px) {
          .proposal-grid-2 { grid-template-columns: 1fr !important; gap: 48px !important; }
          .proposal-grid-3 { grid-template-columns: 1fr !important; gap: 36px !important; }
          .proposal-cards-3 { grid-template-columns: 1fr !important; gap: 24px !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>

      {/* Scroll progress bar */}
      <motion.div
        style={{
          scaleX: progressScaleX,
          transformOrigin: "left",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: B.bronce,
          zIndex: 1000,
        }}
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TOPBAR — Glass adaptativo
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <motion.header
        animate={{
          background: scrolled ? colors.headerBg : "rgba(14,17,23,0.00)",
          borderBottomColor: scrolled ? colors.border : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          height: scrolled ? 72 : 84,
        }}
        transition={{ duration:0.3, ease:E }}
        style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, borderBottom:"1px solid transparent", padding:"0 max(6vw, 32px)", display:"flex", alignItems:"center", justifyContent:"space-between" }}
      >
        {/* Logo adaptable */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <img
            src={IMG_LOGO}
            alt="ALTTEZ"
            style={{
              height: 30,
              filter: isHeaderLight ? "brightness(0) invert(1)" : "none",
              transition: "filter 0.3s ease"
            }}
            onError={e => { e.currentTarget.style.display="none"; }}
          />
          <span style={{ fontSize:18, fontWeight:W.bold, letterSpacing:"0.18em", color: isHeaderLight ? B.heroW : colors.text, transition:"color 0.3s ease" }}>ALTTEZ.</span>
        </div>

        {/* Widgets derechas */}
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          {/* Switcher de tema — Alto Contraste */}
          <motion.button
            onClick={() => setIsDark(!isDark)}
            whileHover={{ scale:1.04, background: isHeaderLight ? "rgba(255,255,255,0.12)" : "rgba(31,31,29,0.10)" }}
            whileTap={{ scale:0.96 }}
            style={{
              background: isHeaderLight ? "rgba(255,255,255,0.06)" : "rgba(31,31,29,0.05)",
              border: `1px solid ${isHeaderLight ? "rgba(255,255,255,0.22)" : "rgba(31,31,29,0.18)"}`,
              padding: "8px 16px",
              borderRadius: 999,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: FONT,
              fontSize: 12,
              fontWeight: W.bold,
              color: isHeaderLight ? B.heroW : colors.text,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              transition: "all 0.3s ease"
            }}
          >
            {isDark ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                Ver en Claro
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                Ver en Oscuro
              </>
            )}
          </motion.button>

          {/* Confidential badge */}
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 18px", border:`1px solid ${scrolled ? colors.border : B.heroBor}`, borderRadius:999, background: scrolled ? colors.card : "rgba(255,255,255,0.06)", transition:"all 0.3s ease" }} className="hide-mobile">
            <Ico.Lock s={13} c={scrolled ? colors.textDim : B.heroW30} />
            <span style={{ fontSize:12, fontWeight:W.semibold, color: scrolled ? colors.textMuted : B.heroW55, letterSpacing:"0.04em" }}>Confidencial</span>
          </div>
        </div>
      </motion.header>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO — Editorial
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section ref={heroRef} style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", overflow:"hidden", background:B.heroBase }}>
        {/* Parallax background */}
        <motion.div style={{ position:"absolute", inset:"-12%", y: bgY, zIndex:0 }}>
          <div style={{ position:"absolute", inset:0, backgroundImage:`url(${IMG_PLAYER})`, backgroundSize:"cover", backgroundPosition:"center 22%", filter:"brightness(0.32) saturate(0.7)" }} />
        </motion.div>

        {/* Overlays */}
        <div style={{ position:"absolute", inset:0, zIndex:1, background:"linear-gradient(110deg, rgba(14,17,23,0.94) 0%, rgba(14,17,23,0.72) 45%, rgba(14,17,23,0.36) 80%, transparent 100%)" }} />
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"50%", zIndex:1, background:`linear-gradient(to bottom, transparent, ${B.heroBase})` }} />

        {/* Ambient light */}
        <div style={{ position:"absolute", top:"25%", left:"4%", width:600, height:600, zIndex:1, borderRadius:"50%", background:"radial-gradient(circle, rgba(206,137,70,0.04) 0%, transparent 65%)", pointerEvents:"none" }} />

        <motion.div style={{ position:"relative", zIndex:2, width:"100%", maxWidth:1280, margin:"0 auto", padding:"156px max(6vw, 32px) 112px", opacity: heroAlpha }}>
          <motion.div variants={stagger} initial="hidden" animate="show" style={{ maxWidth:740 }}>

            {/* Eyebrow */}
            <motion.div variants={fadeUp} style={{ marginBottom:32 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:11, padding:"9px 18px", border:`1px solid ${B.bronceBor}`, borderRadius:999, background:"rgba(206,137,70,0.07)" }}>
                <motion.span animate={{ scale:[1,1.4,1], opacity:[1,0.5,1] }} transition={{ repeat:Infinity, duration:2.5, ease:"easeInOut" }}
                  style={{ width:7, height:7, borderRadius:"50%", background:B.bronce, display:"inline-block", flexShrink:0 }} />
                <span style={{ fontSize:11.5, fontWeight:W.semibold, color:B.bronce, letterSpacing:"0.18em", textTransform:"uppercase" }}>
                  Propuesta exclusiva y confidencial para: {client_name}
                </span>
              </div>
            </motion.div>

            {/* Main headline */}
            <motion.h1 variants={fadeUp}
              style={{ margin:0, fontSize:"clamp(44px, 6vw, 80px)", fontWeight:W.bold, lineHeight:1.02, letterSpacing:"-0.035em", color:B.heroW }}>
              {title.split("ALTTEZ").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length-1 && (
                    <span style={{
                      background: `linear-gradient(135deg, ${B.bronce} 0%, ${B.bronceSft} 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}> ALTTEZ</span>
                  )}
                </span>
              ))}
            </motion.h1>

            {/* Description */}
            <motion.p variants={fadeUp}
              style={{ margin:"30px 0 52px", fontSize:18.5, color:B.heroW80, lineHeight:1.75, maxWidth:580, fontWeight:W.regular }}>
              {description || subtitle}
            </motion.p>

            {/* Meta pills */}
            <motion.div variants={fadeUp} style={{ display:"flex", flexWrap:"wrap", gap:14, alignItems:"center" }}>
              {[
                { Icon: Ico.Person, label:"Para", value: client_name },
                { Icon: Ico.Calendar, label:"Fecha", value: fmtFecha(fecha) },
              ].map(({ Icon: Ic, label, value }) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 20px", borderRadius:14, border:`1px solid ${B.heroBor}`, background:"rgba(255,255,255,0.05)" }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:"rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Ic s={18} c={B.bronce} />
                  </div>
                  <div>
                    <div style={{ fontSize:10.5, color:B.heroW30, fontWeight:W.semibold, textTransform:"uppercase", letterSpacing:"0.14em" }}>{label}</div>
                    <div style={{ fontSize:15, color:B.heroW, fontWeight:W.semibold, marginTop:2 }}>{value}</div>
                  </div>
                </div>
              ))}
              {/* Scroll cue */}
              <div style={{ display:"flex", alignItems:"center", gap:8, color:B.heroW30, fontSize:13.5, fontWeight:W.medium, marginLeft:8 }}>
                <motion.div animate={{ y:[0,-5,0] }} transition={{ repeat:Infinity, duration:2.0, ease:"easeInOut" }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7 7 7-7" stroke={B.heroW30} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </motion.div>
                Desliza para explorar
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom divider */}
        <div style={{ position:"absolute", bottom:0, left:"max(6vw, 32px)", right:"max(6vw, 32px)", zIndex:2, height:1, background:`linear-gradient(90deg, transparent, ${B.bronceBor}, transparent)` }} />
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          01 — LA PROPUESTA (GRID ANCHO & EDITORIAL)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background:colors.bg, padding:"132px max(6vw, 32px) 120px", transition:"background 0.4s ease" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <SectionLabel n="01" label="La propuesta" />

          <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
            {/* Top Row: Context & Quote */}
            <div className="proposal-grid-2">
              <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:"-100px" }} transition={{ duration:0.65, ease:E }}>
                <h2 style={{ margin:"0 0 24px", fontSize:"clamp(32px, 3.8vw, 54px)", fontWeight:W.bold, lineHeight:1.06, letterSpacing:"-0.035em", color:colors.text, transition:"color 0.4s ease" }}>
                  Una alianza estratégica<br />para impulsar <span style={{ color:B.bronce }}>ALTTEZ.</span>
                </h2>
                <p style={{ color:colors.textMuted, fontSize:17, lineHeight:1.75, fontWeight:W.regular, maxWidth:620, transition:"color 0.4s ease" }}>
                  Buscamos un socio estratégico que nos acompañe en la validación y consolidación de nuestra plataforma de gestión y operation deportiva. Esta alianza busca integrar el software en un club piloto para validar el modelo y escalar regionalmente.
                </p>
              </motion.div>

              {/* Right Column: Quote (elegant styling) */}
              <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.65, delay:0.1 }}
                style={{
                  padding: "32px",
                  background: colors.card,
                  borderLeft: `4px solid ${B.bronce}`,
                  borderTopRightRadius: 20,
                  borderBottomRightRadius: 20,
                  boxShadow: colors.shadow,
                  marginTop: 8
                }}>
                <div style={{ fontSize:16, color:colors.text, lineHeight:1.7, fontWeight:W.regular, fontStyle:"italic", transition:"color 0.4s ease" }}>
                  "Tu red y visión comercial son exactamente lo que necesitamos para abrir las primeras puertas y acelerar nuestra tracción en el mercado."
                </div>
                <div style={{ marginTop:16, fontSize:12, fontWeight:W.semibold, color:B.bronce, letterSpacing:"0.12em", textTransform:"uppercase" }}>
                  Equipo ALTTEZ
                </div>
              </motion.div>
            </div>

            {/* Bottom Row: Full-width Cards Grid (Balanced aspect ratio) */}
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true, margin:"-100px" }}
              className="proposal-cards-3">
              {[
                {
                  Icon: Ico.Person, n:"01", title:"Tu rol",
                  body: rol || "Serás el conector clave para integrar el software de ALTTEZ en el club deportivo piloto, abriendo las puertas a la validación en el mercado real.",
                  accent: false,
                },
                {
                  Icon: Ico.Percent, n:"02", title:"Tu participación",
                  body: <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start" }}>
                    <div style={{ fontSize:14.5, color:colors.textMuted, lineHeight:1.65, fontWeight:W.medium, marginBottom:16 }}>
                      Recibes el {pct}% de las acciones de ALTTEZ, integrándote directamente al equipo fundador desde el inicio del proyecto.
                    </div>
                    
                    {/* Link de acción sutil */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setVestingOpen(!vestingOpen);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: B.bronce,
                        fontFamily: FONT,
                        fontSize: 13,
                        fontWeight: W.bold,
                        textDecoration: "underline",
                        textUnderlineOffset: "4px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        transition: "color 0.2s ease",
                        textAlign: "left"
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = B.bronceSft}
                      onMouseLeave={e => e.currentTarget.style.color = B.bronce}
                    >
                      ¿Cómo funciona este porcentaje? (Esquema Vesting)
                      <motion.span animate={{ rotate: vestingOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </motion.span>
                    </button>

                    {/* Desplegable AnimatePresence */}
                    <AnimatePresence initial={false}>
                      {vestingOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          transition={{ duration: 0.35, ease: E }}
                          style={{ overflow: "hidden", textAlign: "left", width: "100%" }}
                        >
                          <div style={{
                            padding: "20px",
                            background: isDark ? "rgba(255,255,255,0.02)" : "rgba(31,31,29,0.03)",
                            border: `1px solid ${colors.border}`,
                            borderRadius: 14,
                          }}>
                            <div style={{ fontSize: 11, fontWeight: W.bold, color: B.bronce, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 12 }}>
                              01.B EL ACUERDO & PLANIFICACIÓN
                            </div>
                            <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6, fontWeight: W.medium }}>
                              <p style={{ marginBottom: 10 }}>
                                El porcentaje se consolida bajo un esquema de vesting a 2 años estructurado en objetivos trimestrales:
                              </p>
                              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
                                <div>
                                  <span style={{ color: B.bronce, fontWeight: W.bold }}>• Trimestre 1-2:</span> Validación e integración del piloto de ALTTEZ en el club destino.
                                </div>
                                <div>
                                  <span style={{ color: B.bronce, fontWeight: W.bold }}>• Trimestre 3-4:</span> Expansión del software a 3 clubes/ligas deportivas clave de la región.
                                </div>
                                <div>
                                  <span style={{ color: B.bronce, fontWeight: W.bold }}>• Año 2:</span> Escalamiento, consolidación de la operación regional y monetización activa.
                                </div>
                              </div>
                              <p style={{ fontSize: 11, color: colors.textDim, borderTop: `1px solid ${colors.border}`, paddingTop: 8, marginTop: 8 }}>
                                * Este esquema asegura que ambas partes consolidan su valor a medida que se alcanzan los hitos del proyecto.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>,
                  accent: true,
                },
                {
                  Icon: Ico.Star, n:"03", title:"Tu impacto",
                  body: impacto || "Liderarás el éxito de ALTTEZ en la región, convirtiéndote en parte fundamental del crecimiento y la tracción comercial a largo plazo.",
                  accent: false,
                },
              ].map(({ Icon: Ic, n, title, body, accent }) => (
                <motion.div key={n} variants={fadeUp}
                  whileHover={{ y:-6, boxShadow: accent ? `0 16px 44px rgba(206,137,70,0.22)` : colors.shadow }}
                  transition={premiumSpring}
                  style={{
                    padding:"36px 30px", textAlign: "left",
                    background: colors.card,
                    border:`1.5px solid ${accent ? B.bronce : colors.border}`,
                    borderRadius:24,
                    boxShadow: accent ? `0 8px 24px rgba(206,137,70,0.12)` : colors.shadow,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "stretch",
                    transition:"all 0.4s ease, box-shadow 0.25s, transform 0.25s",
                  }}>
                  {/* Top Row: Icon & Step Badge */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                    {/* Icon */}
                    <div style={{ width:48, height:48, borderRadius:14, background: accent ? B.bronceDim : colors.bg, border:`1px solid ${accent ? B.bronceBor : colors.border}`, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.4s ease" }}>
                      <Ic s={22} c={B.bronce} />
                    </div>
                    {/* Badge */}
                    <div style={{ padding:"4px 10px", borderRadius:999, background: accent ? B.bronceDim : colors.bg, border:`1px solid ${accent ? B.bronceBor : colors.border}`, transition:"all 0.4s ease" }}>
                      <span style={{ fontSize:10.5, fontWeight:W.bold, color: accent ? B.bronce : colors.textDim, letterSpacing:"0.12em" }}>{n}</span>
                    </div>
                  </div>
                  {/* Label */}
                  <div style={{ fontSize:11.5, fontWeight:W.semibold, color:colors.textDim, textTransform:"uppercase", letterSpacing:"0.16em", marginBottom:14 }}>{title}</div>
                  {/* Value */}
                  <div style={{ fontSize:14.5, color:colors.textMuted, lineHeight:1.65, fontWeight:W.medium }}>{body}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          02 — ¿QUÉ NOS APORTAS TÚ?
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background:colors.card, padding:"132px max(6vw, 32px) 120px", transition:"background 0.4s ease" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <SectionLabel n="02" label="¿Qué nos aportas tú?" />

          <div className="proposal-grid-2" style={{ alignItems:"start", gap:"64px 104px" }}>
            {/* Left: benefits */}
            <div>
              <motion.h2 initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:"-100px" }} transition={{ duration:0.6, ease:E }}
                style={{ margin:"0 0 44px", fontSize:"clamp(30px, 3.2vw, 48px)", fontWeight:W.bold, lineHeight:1.08, letterSpacing:"-0.035em", color:colors.text }}>
                Tu red. Tu experiencia.<br />
                <span style={{ color:colors.textMuted, fontWeight:W.semibold }}>Nuestro crecimiento.</span>
              </motion.h2>

              <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true, margin:"-100px" }}
                style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {bens.slice(0, 4).map((b, i) => {
                  const Ic = BEN_ICONS[i % BEN_ICONS.length];
                  return (
                    <motion.div key={i} variants={fadeUp}
                      whileHover={{ x:6, boxShadow:colors.shadow }}
                      transition={premiumSpring}
                      style={{ display:"flex", alignItems:"flex-start", gap:20, padding:"20px 26px", borderRadius:16, border:`1px solid ${colors.border}`, background:colors.bg, transition:"all 0.4s ease, box-shadow 0.22s, transform 0.22s" }}>
                      <div style={{ width:48, height:48, borderRadius:14, background:B.bronceDim, border:`1px solid ${B.bronceBor}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <Ic s={22} c={B.bronce} />
                      </div>
                      <div style={{ paddingTop:4 }}>
                        <div style={{ fontSize:11.5, fontWeight:W.semibold, color:B.bronce, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6 }}>
                          {["Tu red de contactos", "Tu acceso al mercado", "Tu validación del modelo", "Tu visión a largo plazo"][i] || `Beneficio ${i+1}`}
                        </div>
                        <div style={{ fontSize:14.5, color:colors.textMuted, lineHeight:1.65, fontWeight:W.regular }}>{b}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* Right: handshake image */}
            <motion.div initial={{ opacity:0, scale:0.97 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true, margin:"-100px" }} transition={{ duration:0.8, ease:E }}>
              <div style={{ position:"relative", borderRadius:24, overflow:"hidden", boxShadow:colors.shadow, border:`1px solid ${colors.border}`, transition:"all 0.4s ease" }}>
                <div style={{ paddingTop:"75%", position:"relative", overflow:"hidden" }}>
                  <motion.img
                    whileHover={{ scale:1.045 }}
                    transition={{ duration:0.6, ease:E }}
                    src={IMG_HANDSHAKE} alt="Alianza ALTTEZ"
                    style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transformOrigin:"center" }}
                    onError={e => { e.currentTarget.style.background=B.bronceDim; }}
                  />
                </div>
                {/* Image overlay badge */}
                <div style={{ position:"absolute", bottom:24, left:24, right:24, padding:"16px 20px", borderRadius:14, background:colors.headerBg, backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", border:`1px solid ${colors.border}`, display:"flex", alignItems:"center", gap:14, transition:"all 0.4s ease" }}>
                  <img
                    src={IMG_LOGO}
                    alt="ALTTEZ"
                    style={{
                      height: 24,
                      flexShrink: 0,
                      filter: isDark ? "brightness(0) invert(1)" : "none"
                    }}
                    onError={e => { e.currentTarget.style.display="none"; }}
                  />
                  <div>
                    <div style={{ fontSize:13, fontWeight:W.bold, color:colors.text, letterSpacing:"0.08em" }}>ALTTEZ · Alianza estratégica</div>
                    <div style={{ fontSize:11.5, color:colors.textMuted, marginTop:2, fontWeight:W.semibold, letterSpacing:"0.02em" }}>{ALTTEZ_TAGLINE}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          03 — TU DECISIÓN
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background:colors.bgAlt, padding:"132px max(6vw, 32px) 120px", transition:"background 0.4s ease" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <SectionLabel n="03" label="Tu decisión" />

          <div className="proposal-grid-2" style={{ alignItems:"start" }}>
            {/* Left: context */}
            <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:"-100px" }} transition={{ duration:0.6, ease:E }}>
              <h2 style={{ margin:"0 0 24px", fontSize:"clamp(32px, 3.5vw, 52px)", fontWeight:W.bold, lineHeight:1.06, letterSpacing:"-0.035em", color:colors.text }}>
                ¿Listo para dar<br />el primer paso?
              </h2>
              <p style={{ color:colors.textMuted, fontSize:17, lineHeight:1.75, fontWeight:W.regular, maxWidth:420, margin:"0 0 44px" }}>
                Revisa los términos, acepta la propuesta y hagamos esta alianza oficial. Si tienes condiciones diferentes, estamos listos para escucharte.
              </p>

              {/* Trust items */}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {[
                  "Proceso 100% digital y seguro.",
                  "Sin intermediarios ni pasos complicados.",
                  "Respondemos en menos de 24 horas.",
                  "Enlace confidencial e intransferible.",
                ].map((txt, i) => (
                  <motion.div key={i} initial={{ opacity:0, x:-15 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:i*0.09, duration:0.5, ease:E }}
                    style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:26, height:26, borderRadius:8, background:B.bronceDim, border:`1px solid ${B.bronceBor}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Ico.CheckFill s={13} c={B.bronce} />
                    </div>
                    <span style={{ fontSize:14.5, color:colors.textMuted, fontWeight:W.semibold, transition:"color 0.4s ease" }}>{txt}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: CTA cards */}
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true, margin:"-100px" }}
              style={{ display:"flex", flexDirection:"column", gap:20 }}>

              {/* Aceptar */}
              <motion.div variants={fadeUp}
                whileHover={{ y:-4, boxShadow:`0 16px 44px rgba(206,137,70,0.22)` }}
                style={{ padding:"32px", background:colors.card, border:`2px solid ${B.bronce}`, borderRadius:24, boxShadow:colors.shadow, transition:"all 0.4s ease, box-shadow 0.25s, transform 0.25s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:26 }}>
                  <div style={{ width:54, height:54, borderRadius:16, background:B.bronceDim, border:`1.5px solid ${B.bronceBor}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.4s ease" }}>
                    <Ico.Check s={26} c={B.bronce} />
                  </div>
                  <div>
                    <div style={{ fontWeight:W.bold, fontSize:19, color:colors.text, letterSpacing:"-0.01em" }}>Aceptar propuesta</div>
                    <div style={{ fontSize:13.5, color:colors.textMuted, marginTop:4, fontWeight:W.regular }}>Completa tus datos y firma digitalmente para iniciar.</div>
                  </div>
                </div>
                <PrimaryBtn onClick={() => !isClosed && setShowSignModal(true)} disabled={isClosed}>
                  Aceptar y continuar
                </PrimaryBtn>
                <div style={{ textAlign:"center", marginTop:14, fontSize:12.5, color:colors.textDim, fontWeight:W.bold, letterSpacing:"0.02em" }}>
                  Rápido · Seguro · 100% Digital
                </div>
              </motion.div>

              {/* Contrapropuesta */}
              <motion.div variants={fadeUp}
                whileHover={{ y:-4, boxShadow:colors.shadow }}
                style={{ padding:"32px", background:colors.card, border:`1.5px solid ${colors.border}`, borderRadius:24, boxShadow:colors.shadow, transition:"all 0.4s ease, box-shadow 0.25s, transform 0.25s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:26 }}>
                  <div style={{ width:54, height:54, borderRadius:16, background:colors.bg, border:`1px solid ${colors.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.4s ease" }}>
                    <Ico.Edit s={26} c={colors.textMuted} />
                  </div>
                  <div>
                    <div style={{ fontWeight:W.bold, fontSize:19, color:colors.text, letterSpacing:"-0.01em" }}>Hacer contrapropuesta</div>
                    <div style={{ fontSize:13.5, color:colors.textMuted, marginTop:4, fontWeight:W.regular }}>Propón tus términos y te respondemos en 24h.</div>
                  </div>
                </div>
                <SecondaryBtn onClick={() => !isClosed && setShowInlineCounter(!showInlineCounter)} disabled={isClosed}>
                  Prefiero proponer otra idea
                </SecondaryBtn>
                <div style={{ textAlign:"center", marginTop:14, fontSize:12.5, color:colors.textDim, fontWeight:W.bold, letterSpacing:"0.02em" }}>
                  {ALTTEZ_EMAIL}
                </div>
              </motion.div>

              {/* Formulario de Contrapropuesta en línea */}
              <AnimatePresence>
                {showInlineCounter && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, scale: 0.98 }}
                    animate={{ height: "auto", opacity: 1, scale: 1 }}
                    exit={{ height: 0, opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: E }}
                    style={{ overflow: "hidden", width: "100%" }}
                  >
                    <div style={{
                      padding: "32px",
                      background: colors.card,
                      border: `1.5px solid ${B.bronce}`,
                      borderRadius: 24,
                      boxShadow: colors.shadow,
                      marginTop: 8
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: B.bronceDim, border: `1px solid ${B.bronceBor}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Ico.Edit s={20} c={B.bronce} />
                        </div>
                        <div>
                          <div style={{ fontWeight: W.bold, fontSize: 16.5, color: colors.text, letterSpacing: "-0.01em" }}>Detalles de la contrapropuesta</div>
                          <div style={{ fontSize: 12.5, color: colors.textMuted }}>Escribe a continuación tus sugerencias</div>
                        </div>
                      </div>

                      <textarea
                        value={counterText}
                        onChange={e => setCounterText(e.target.value)}
                        rows={5}
                        placeholder="Escribe detalladamente las condiciones, porcentajes o términos que deseas proponer..."
                        style={{
                          fontFamily: FONT,
                          width: "100%",
                          padding: "14px 18px",
                          border: `1.5px solid ${counterText.trim().length >= 10 ? B.bronce : colors.border}`,
                          borderRadius: 12,
                          color: colors.text,
                          fontSize: 14.5,
                          outline: "none",
                          resize: "vertical",
                          lineHeight: 1.65,
                          background: colors.modalInputBg,
                          fontWeight: W.regular,
                          boxShadow: counterText.trim().length >= 10 ? `0 0 0 4px ${B.bronceDim}` : "none",
                          transition: "all 0.18s ease"
                        }}
                      />

                      {counterErr && (
                        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 12, background: "rgba(217,92,92,0.07)", border: "1px solid rgba(217,92,92,0.22)", color: B.danger, fontSize: 13.5 }}>
                          {counterErr}
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
                        <button
                          onClick={() => setShowInlineCounter(false)}
                          style={{
                            padding: "12px 24px",
                            borderRadius: 12,
                            border: `1.5px solid ${colors.border}`,
                            background: colors.btnSecondaryBg,
                            color: colors.textMuted,
                            fontSize: 14,
                            fontWeight: W.medium,
                            fontFamily: FONT,
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          Cancelar
                        </button>
                        <motion.button
                          onClick={handleSendInlineCounter}
                          disabled={counterLoading}
                          whileHover={{ y: -1, boxShadow: `0 8px 24px rgba(31,31,29,0.15)` }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            padding: "12px 24px",
                            borderRadius: 12,
                            border: "none",
                            background: colors.text,
                            color: colors.bg,
                            fontSize: 14,
                            fontWeight: W.bold,
                            fontFamily: FONT,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            transition: "all 0.2s"
                          }}
                        >
                          {counterLoading ? "Enviando..." : "Enviar contrapropuesta"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          04 — ¿CÓMO FUNCIONA?
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background:colors.bg, padding:"132px max(6vw, 32px) 120px", borderTop:`1px solid ${colors.borderSft}`, transition:"background 0.4s ease" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <SectionLabel n="04" label="¿Cómo funciona?" />

          <motion.h2 initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:"-100px" }} transition={{ duration:0.6, ease:E }}
            style={{ margin:"0 0 76px", fontSize:"clamp(30px, 3.2vw, 48px)", fontWeight:W.bold, lineHeight:1.08, letterSpacing:"-0.035em", color:colors.text }}>
            Un proceso simple,<br />
            <span style={{ color:colors.textMuted, fontWeight:W.semibold }}>rápido y seguro.</span>
          </motion.h2>

          {/* Steps */}
          <div style={{ position:"relative" }}>
            {/* Line */}
            <div style={{ position:"absolute", top:44, left:"18%", right:"18%", height:1.5, background:`linear-gradient(90deg, ${colors.borderSft}, ${B.bronce}, ${colors.borderSft})`, opacity:0.6 }} />

            <div className="proposal-grid-3">
              {[
                { n:"01", Icon: Ico.File,   label:"Revisas la propuesta", desc:"Analiza cada término de la alianza estratégica con detenimiento y sin presión." },
                { n:"02", Icon: Ico.Check,  label:"Firma de arranque",     desc:"Conecta directamente para validar la propuesta y definir los primeros pasos." },
                { n:"03", Icon: Ico.Shield, label:"Bienvenido al equipo", desc:"Serás parte oficial de ALTTEZ y del crecimiento desde el primer día." },
              ].map(({ n, Icon: Ic, label, desc }, i) => (
                <motion.div key={n}
                  initial={{ opacity:0, y:28 }}
                  whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true, margin:"-100px" }}
                  transition={{ duration:0.6, ease:E, delay:i*0.14 }}
                  style={{ textAlign:"center", padding:"0 28px" }}>
                  {/* Step circle */}
                  <div style={{ position:"relative", width:88, height:88, margin:"0 auto 28px" }}>
                    <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:colors.card, border:`2px solid ${colors.border}`, boxShadow:colors.shadow, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.4s ease" }}>
                      <Ic s={32} c={B.bronce} />
                    </div>
                    {/* Number badge */}
                    <div style={{ position:"absolute", top:-4, right:-4, width:26, height:26, borderRadius:"50%", background:B.bronce, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 3px 10px rgba(206,137,70,0.4)` }}>
                      <span style={{ fontSize:11, fontWeight:W.bold, color:B.heroW }}>{n}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:16, fontWeight:W.semibold, color:colors.text, marginBottom:12, letterSpacing:"-0.01em" }}>{label}</div>
                  <div style={{ fontSize:14.5, color:colors.textMuted, lineHeight:1.75, fontWeight:W.regular }}>{desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MODAL DE FIRMA DIGITAL
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <AnimatePresence>
        {showSignModal && (
          <SignModal
            proposal={proposal}
            colors={colors}
            isDark={isDark}
            logoBase64={logoBase64}
            onClose={() => setShowSignModal(false)}
            onSign={handleSignConfirm}
            onComplete={() => {
              setFinalStatus("aceptada");
              setShowSignModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FOOTER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer style={{
        background: colors.bgAlt,
        padding: "56px max(6vw, 32px)",
        borderTop: `1px solid ${colors.border}`,
        transition: "background 0.4s ease, border-color 0.4s ease"
      }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          {/* Top row */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 28,
            paddingBottom: 32,
            borderBottom: `1px solid ${colors.border}`,
            marginBottom: 32,
            transition: "border-color 0.4s ease"
          }}>
            {/* Brand */}
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <img
                src={IMG_LOGO}
                alt="ALTTEZ"
                style={{
                  height: 30,
                  opacity: 0.9,
                  filter: isDark ? "brightness(0) invert(1)" : "none",
                  transition: "filter 0.3s ease"
                }}
                onError={e => { e.currentTarget.style.display="none"; }}
              />
              <div>
                <div style={{ fontSize:16, fontWeight:W.bold, color:colors.text, letterSpacing:"0.18em", transition:"color 0.4s ease" }}>ALTTEZ.</div>
                <div style={{ fontSize:11.5, color:colors.textMuted, letterSpacing:"0.04em", fontWeight:W.semibold, marginTop:2, transition:"color 0.4s ease" }}>{ALTTEZ_TAGLINE}</div>
              </div>
            </div>

            {/* Confidential badge */}
            <div style={{ display:"flex", alignItems:"center", gap:11, padding:"12px 20px", border:`1px solid ${colors.border}`, borderRadius:14, background:colors.bg, transition:"all 0.4s ease" }}>
              <Ico.Lock s={13} c={colors.textDim} />
              <div>
                <div style={{ fontSize:12, fontWeight:W.semibold, color:colors.textMuted, transition:"color 0.4s ease" }}>Propuesta Confidencial</div>
                <div style={{ fontSize:11, color:colors.textDim, fontWeight:W.medium, marginTop:1, transition:"color 0.4s ease" }}>Enlace personal e intransferible</div>
              </div>
            </div>

            {/* Contact */}
            <a href={`mailto:${ALTTEZ_EMAIL}`} style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", transition:"transform 0.2s" }}
               onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
               onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <Ico.Email s={18} c={colors.textDim} />
              <span style={{ fontSize:14, color:colors.textMuted, fontWeight:W.medium, transition:"color 0.4s ease" }}>{ALTTEZ_EMAIL}</span>
            </a>
          </div>

          {/* Bottom row */}
          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:14 }}>
            <div style={{ fontSize:12.5, color:colors.textDim, fontWeight:W.regular, transition:"color 0.4s ease" }}>© 2024 ALTTEZ. Todos los derechos reservados.</div>
            <div style={{ fontSize:12.5, color:colors.textDim, fontWeight:W.regular, transition:"color 0.4s ease" }}>Clara · Premium · Editorial · Profesional · Comercial</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
