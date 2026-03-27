/**
 * @component CommercialLanding
 * @description Dashboard-style landing page for Elevate Sports.
 * Modular grid of elevated 3D panels showing live data previews.
 * Charcoal palette, pure SVG charts, framer-motion animations.
 *
 * @props { onDemo, onRegister }
 * @author @Desarrollador (Andres)
 * @version 2.0.0
 */

import { useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { PALETTE } from "../constants/palette";

const LegalDisclaimer = lazy(() => import("./LegalDisclaimer"));

/* ── Landing-specific palette (charcoal override) ── */
const LP = {
  bg: "#1A1A2E",
  panel: "#2A2A3A",
  border: "rgba(255,255,255,0.08)",
  shadow: "0 8px 32px rgba(0,0,0,0.4)",
  neon: "#c8ff00",
  purple: "#7C3AED",
  danger: "#E24B4A",
  amber: "#EF9F27",
  green: "#1D9E75",
  text: "white",
  muted: "rgba(255,255,255,0.5)",
  hint: "rgba(255,255,255,0.25)",
};

const font = {
  display: "'Barlow Condensed', 'Arial Narrow', sans-serif",
  body: "'Barlow', Arial, sans-serif",
};

/* ── Keyframes globales ── */
if (typeof document !== "undefined" && !document.getElementById("cl2-kf")) {
  const s = document.createElement("style");
  s.id = "cl2-kf";
  s.textContent = `
    @keyframes cl2_pulse{0%,100%{opacity:.6}50%{opacity:1}}
    @keyframes cl2_float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes cl2_draw{from{stroke-dashoffset:800}to{stroke-dashoffset:0}}
    @keyframes cl2_gaugeIn{from{stroke-dashoffset:200}to{stroke-dashoffset:0}}
    @keyframes cl2_glow{0%,100%{text-shadow:0 0 4px rgba(200,255,0,.25)}50%{text-shadow:0 0 14px rgba(200,255,0,.55)}}
    .cl2-card-hover{transition:transform .22s ease,background .22s ease,border-color .22s ease;cursor:default}
    .cl2-card-hover:hover{transform:translateY(-2px);background:rgba(255,255,255,.06)!important;border-color:rgba(255,255,255,.15)!important}
    .cl2-nav-link{transition:color .2s ease;position:relative;display:inline-block}
    .cl2-nav-link:hover{color:white!important}
    .cl2-nav-link::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:1.5px;background:#c8ff00;transition:width .25s ease}
    .cl2-nav-link:hover::after{width:100%}
    .cl2-acwr-line{stroke-dasharray:800;stroke-dashoffset:800;animation:cl2_draw 1.8s ease-out .6s forwards}
    .cl2-gauge-arc{animation:cl2_gaugeIn 1.2s ease-out .4s both}
    .cl2-donut-arc{animation:cl2_gaugeIn 1.4s ease-out .5s both}
    @media(prefers-reduced-motion:reduce){.cl2-acwr-line,.cl2-gauge-arc,.cl2-donut-arc{animation:none!important;stroke-dashoffset:0!important}*{animation-duration:.01ms!important}}
    @media(max-width:768px){
      .cl2-grid{grid-template-columns:1fr!important;grid-template-rows:auto!important}
      .cl2-grid>*{grid-column:span 1!important;grid-row:span 1!important}
      .cl2-nav-links{display:none!important}
    }
  `;
  document.head.appendChild(s);
}

/* ── Panel wrapper ── */
const panelStyle = {
  background: LP.panel,
  borderRadius: 16,
  border: `1px solid ${LP.border}`,
  boxShadow: LP.shadow,
  padding: 20,
  overflow: "hidden",
  position: "relative",
};

const headerStyle = {
  fontFamily: font.display,
  fontSize: 10,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "2.5px",
  color: LP.muted,
  marginBottom: 14,
};

/* ─────────────────────── SVG: ACWR Line Chart ─────────────────────── */
function ACWRChart({ width = 260, height = 140 }) {
  const data = [32,45,38,52,60,55,68,62,74,70,65,78,72,80,76,82,70,58,63,72];
  const xStep = width / (data.length - 1);
  const dangerY = 80;
  const scaleY = (v) => height - (v / 100) * height;
  const points = data.map((v, i) => `${i * xStep},${scaleY(v)}`).join(" ");
  const areaPath = `M0,${scaleY(data[0])} ${data.map((v, i) => `L${i * xStep},${scaleY(v)}`).join(" ")} L${(data.length - 1) * xStep},${height} L0,${height} Z`;
  const dangerLine = scaleY(dangerY);

  return (
    <svg width={width} height={height + 20} viewBox={`0 0 ${width} ${height + 20}`} style={{ display: "block" }} role="img" aria-label="Grafica ACWR - Carga aguda vs cronica del atleta, mostrando zona de riesgo de lesion por encima de 80%">
      <defs>
        <linearGradient id="acwr-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={LP.neon} stopOpacity="0.4" />
          <stop offset="100%" stopColor={LP.neon} stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="danger-zone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={LP.danger} stopOpacity="0.35" />
          <stop offset="100%" stopColor={LP.danger} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {/* Danger zone */}
      <rect x="0" y="0" width={width} height={dangerLine} fill="url(#danger-zone)" />
      <line x1="0" y1={dangerLine} x2={width} y2={dangerLine} stroke={LP.danger} strokeWidth="1" strokeDasharray="4,3" opacity="0.7" />
      <text x={width - 4} y={dangerLine - 4} fill={LP.danger} fontSize="8" fontFamily={font.body} textAnchor="end">Lesión</text>
      {/* Area fill */}
      <path d={areaPath} fill="url(#acwr-fill)" />
      {/* Line */}
      <polyline className="cl2-acwr-line" points={points} fill="none" stroke={LP.neon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Axis labels */}
      {[0, 25, 50, 75, 100].map((v) => (
        <text key={v} x={-2} y={scaleY(v) + 3} fill={LP.hint} fontSize="7" fontFamily={font.body} textAnchor="end">{v}</text>
      ))}
      {/* X axis ticks */}
      {[0, 5, 10, 15, 19].map((i) => (
        <text key={i} x={i * xStep} y={height + 12} fill={LP.hint} fontSize="7" fontFamily={font.body} textAnchor="middle">{i * 5}</text>
      ))}
    </svg>
  );
}

/* ─────────────────────── SVG: Health Donut ─────────────────────── */
function HealthDonut({ size = 100 }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const fatiga = 0.47; // proportion
  const rendimiento = 0.53;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Indicador de salud RPE: fatiga 47%, rendimiento 53%">
      {/* Background ring */}
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      {/* Rendimiento (green) */}
      <circle className="cl2-donut-arc" cx="50" cy="50" r={r} fill="none" stroke={LP.green} strokeWidth="10"
        strokeDasharray={`${rendimiento * circ} ${circ}`}
        strokeDashoffset="0" transform="rotate(-90 50 50)" strokeLinecap="round" />
      {/* Fatiga (amber) */}
      <circle className="cl2-donut-arc" cx="50" cy="50" r={r} fill="none" stroke={LP.amber} strokeWidth="10"
        strokeDasharray={`${fatiga * circ} ${circ}`}
        strokeDashoffset={`${-rendimiento * circ}`} transform="rotate(-90 50 50)" strokeLinecap="round" />
      {/* Center text */}
      <text x="50" y="46" fill={LP.text} fontSize="11" fontFamily={font.display} fontWeight="700" textAnchor="middle">SALUD</text>
      <text x="50" y="60" fill={LP.muted} fontSize="8" fontFamily={font.body} textAnchor="middle">RPE Index</text>
    </svg>
  );
}

/* ─────────────────────── SVG: Financial Gauge ─────────────────────── */
function FinancialGauge({ size = 160 }) {
  const r = 60;
  const halfCirc = Math.PI * r;
  const greenPct = 0.82;
  const redPct = 0.18;

  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 160 96" role="img" aria-label="Gauge financiero: 82% recaudo mensual, 18% en mora">
      {/* Green arc */}
      <circle className="cl2-gauge-arc" cx="80" cy="80" r={r} fill="none" stroke={LP.green} strokeWidth="14"
        strokeDasharray={`${greenPct * halfCirc} ${2 * Math.PI * r}`}
        strokeDashoffset="0" transform="rotate(180 80 80)" strokeLinecap="round" />
      {/* Red arc */}
      <circle className="cl2-gauge-arc" cx="80" cy="80" r={r} fill="none" stroke={LP.danger} strokeWidth="14"
        strokeDasharray={`${redPct * halfCirc} ${2 * Math.PI * r}`}
        strokeDashoffset={`${-greenPct * halfCirc}`} transform="rotate(180 80 80)" strokeLinecap="round" />
      {/* Center text */}
      <text x="80" y="68" fill={LP.neon} fontSize="24" fontFamily={font.display} fontWeight="900" textAnchor="middle" style={{ animation: "cl2_glow 3s ease infinite" }}>82%</text>
      <text x="80" y="82" fill={LP.muted} fontSize="8" fontFamily={font.body} textAnchor="middle">RECAUDO MENSUAL</text>
      {/* Labels */}
      <text x="20" y="92" fill={LP.green} fontSize="8" fontFamily={font.display} fontWeight="700" textAnchor="middle">GREEN</text>
      <text x="140" y="92" fill={LP.danger} fontSize="8" fontFamily={font.display} fontWeight="700" textAnchor="middle">MORA</text>
    </svg>
  );
}

/* ─────────────────────── SVG: Methodology Flow ─────────────────────── */
function MethodologyFlow({ width = 240, height = 80 }) {
  const cx = [40, 120, 200];
  const cy = 40;
  const icons = [null, null, null]; // SVG paths rendered below
  const labels = ["Asistencia", "Entrenamiento", "RPE/Obs"];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Flujo metodologico: Asistencia, Entrenamiento, RPE">
      {/* Curved connectors */}
      <path d={`M58,${cy} Q90,${cy - 20} 102,${cy}`} fill="none" stroke={LP.purple} strokeWidth="2" strokeDasharray="4,3" />
      <path d={`M138,${cy} Q170,${cy - 20} 182,${cy}`} fill="none" stroke={LP.purple} strokeWidth="2" strokeDasharray="4,3" />
      {/* Circles + icons */}
      {cx.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={cy} r="18" fill="rgba(124,58,237,0.15)" stroke={LP.purple} strokeWidth="1.5" />
          {i === 0 && <path d={`M${x-6},${cy} L${x-2},${cy+5} L${x+7},${cy-5}`} fill="none" stroke={LP.neon} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
          {i === 1 && <><circle cx={x} cy={cy} r="4" fill="none" stroke={LP.text} strokeWidth="1.5" /><circle cx={x} cy={cy} r="8" fill="none" stroke={LP.text} strokeWidth="1" strokeDasharray="3,3" /></>}
          {i === 2 && <><rect x={x-7} y={cy-2} width="4" height="8" rx="1" fill={LP.neon} opacity=".7"/><rect x={x-1.5} y={cy-6} width="4" height="12" rx="1" fill={LP.neon} opacity=".85"/><rect x={x+4} y={cy-9} width="4" height="15" rx="1" fill={LP.neon}/></>}
          <text x={x} y={cy + 34} fill={LP.muted} fontSize="7" fontFamily={font.body} textAnchor="middle" fontWeight="600" style={{ textTransform: "uppercase" }}>{labels[i]}</text>
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────── Tactical Field (3D) ─────────────────────── */
function TacticalField() {
  const players = [
    { x: 50, y: 90, rpe: "GK", gk: true },
    { x: 20, y: 74, rpe: 8 }, { x: 40, y: 76, rpe: 9 }, { x: 60, y: 76, rpe: 10 }, { x: 80, y: 74, rpe: 8 },
    { x: 30, y: 54, rpe: 9 }, { x: 50, y: 50, rpe: 10 }, { x: 70, y: 54, rpe: 8 },
    { x: 20, y: 28, rpe: 9 }, { x: 50, y: 20, rpe: 10 }, { x: 80, y: 28, rpe: 8 },
  ];

  return (
    <div style={{
      width: "100%", aspectRatio: "4/3", borderRadius: 12, overflow: "hidden", position: "relative",
      perspective: "800px",
    }}>
      <div style={{
        width: "100%", height: "100%", position: "relative",
        background: "linear-gradient(180deg, #1a5c0e 0%, #237215 30%, #1e6412 60%, #1a5c0e 100%)",
        transform: "rotateX(8deg)", transformOrigin: "center bottom",
      }}>
        {/* Field lines */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 75" preserveAspectRatio="none">
          <rect x="5" y="3" width="90" height="69" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.4" />
          <line x1="5" y1="37.5" x2="95" y2="37.5" stroke="rgba(255,255,255,0.35)" strokeWidth="0.3" />
          <circle cx="50" cy="37.5" r="9" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
          <circle cx="50" cy="37.5" r="0.8" fill="rgba(255,255,255,0.4)" />
          {/* Top box */}
          <rect x="28" y="3" width="44" height="14" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.3" />
          <rect x="36" y="3" width="28" height="6" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.25" />
          {/* Bottom box */}
          <rect x="28" y="58" width="44" height="14" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.3" />
          <rect x="36" y="66" width="28" height="6" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.25" />
          {/* Corner arcs */}
          <path d="M5,6 Q8,3 11,3" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.25" />
          <path d="M89,3 Q92,3 95,6" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.25" />
          <path d="M5,69 Q8,72 11,72" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.25" />
          <path d="M89,72 Q92,72 95,69" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.25" />
        </svg>
        {/* Player tokens */}
        {players.map((p, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 200, damping: 15 }}
            style={{
              position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)",
              width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: p.gk ? LP.green : LP.neon,
              boxShadow: `0 0 14px ${p.gk ? LP.green : LP.neon}99, 0 3px 8px rgba(0,0,0,0.6)`,
              border: "2.5px solid rgba(255,255,255,0.5)",
              fontFamily: font.display, fontSize: p.gk ? 8 : 13, fontWeight: 900, color: "#111",
            }}
          >
            {p.rpe}
          </motion.div>
        ))}
        {/* Formation label */}
        <div style={{
          position: "absolute", bottom: 8, right: 12, fontFamily: font.display,
          fontSize: 11, fontWeight: 700, color: LP.neon, letterSpacing: "1px",
          background: "rgba(0,0,0,0.5)", padding: "3px 8px", borderRadius: 6,
        }}>
          4-3-3
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ── Main Component ── */
/* ═══════════════════════════════════════════════════════════════════ */
export default function CommercialLanding({ onDemo, onRegister }) {
  const navItems = ["Home", "Pizarra", "Data", "Finanzas", "Journal", "Demo"];
  const [activeNav] = useState("Home");
  const [showLegal, setShowLegal] = useState(false);

  return (
    <div role="main" aria-label="Elevate Sports - Landing Page" style={{ minHeight: "100vh", background: LP.bg, color: LP.text, fontFamily: font.body }}>

      {/* ── NAVBAR ── */}
      <nav aria-label="Navegacion principal" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px", height: 54, background: "rgba(26,26,46,0.95)",
        borderBottom: `1px solid ${LP.border}`, position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(10px)",
      }}>
        {/* Left: Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, background: LP.neon,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: font.display, fontSize: 16, fontWeight: 900, color: "#111",
          }}>E</div>
          <span style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: LP.text }}>
            ELEVATE SPORTS
          </span>
        </div>
        {/* Center: Nav links */}
        <div className="cl2-nav-links" style={{ display: "flex", gap: 24 }}>
          {navItems.map((item) => (
            <span key={item} className="cl2-nav-link" style={{
              fontFamily: font.body, fontSize: 12, fontWeight: 500, cursor: "pointer",
              color: item === activeNav ? LP.text : LP.muted, letterSpacing: "0.5px",
            }}>{item}</span>
          ))}
        </div>
        {/* Right: Login */}
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={onRegister}
          style={{
            padding: "7px 22px", borderRadius: 8, background: LP.purple, color: LP.text,
            fontFamily: font.display, fontSize: 12, fontWeight: 700, border: "none",
            cursor: "pointer", letterSpacing: "0.5px", textTransform: "uppercase",
          }}
        aria-label="Iniciar sesion o registrarse"
        >Login</motion.button>
      </nav>

      {/* ── DASHBOARD GRID ── */}
      <div className="cl2-grid" style={{
        display: "grid",
        gridTemplateColumns: "3fr 2fr",
        gridTemplateRows: "auto auto",
        gap: 16, padding: 16, maxWidth: 1280, margin: "0 auto",
      }}>

        {/* ════ PANEL 1: HERO — Tactical Board ════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -3, boxShadow: "0 14px 44px rgba(0,0,0,0.5), 0 0 20px rgba(200,255,0,0.04)" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ ...panelStyle, gridColumn: "1", gridRow: "1", display: "flex", flexDirection: "column", cursor: "default" }}
        >
          <TacticalField />
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={onDemo}
            style={{
              marginTop: 16, alignSelf: "center", padding: "12px 40px", borderRadius: 10,
              background: LP.purple, color: LP.text, border: "none", cursor: "pointer",
              fontFamily: font.display, fontSize: 14, fontWeight: 700, letterSpacing: "2px",
              textTransform: "uppercase", boxShadow: `0 4px 20px ${LP.purple}55`,
            }}
          aria-label="Probar la plataforma con datos de ejemplo"
          >PROBAR DEMO</motion.button>
        </motion.div>

        {/* ════ PANEL 2: MÓDULO DE CIENCIA ════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -3, boxShadow: "0 14px 44px rgba(0,0,0,0.5), 0 0 20px rgba(200,255,0,0.04)" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ ...panelStyle, gridColumn: "2", gridRow: "1", cursor: "default" }}
        >
          <div style={headerStyle}>MÓDULO DE CIENCIA (RPE Borg CR-10)</div>

          {/* Inner card: Inteligencia Deportiva */}
          <div style={{
            background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14,
            border: `1px solid ${LP.border}`, marginBottom: 12,
          }}>
            <div style={{ fontFamily: font.display, fontSize: 13, fontWeight: 700, color: LP.text, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>
              INTELIGENCIA DEPORTIVA
            </div>
            <div style={{ fontSize: 9, color: LP.muted, marginBottom: 10 }}>Borg CR-10</div>

            {/* Player label */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
              }}>👤</div>
              <span style={{ fontFamily: font.display, fontSize: 11, fontWeight: 600, color: LP.muted }}>
                MATEO <span style={{ color: LP.hint }}>(ID: 12)</span>
              </span>
            </div>

            {/* ACWR Chart */}
            <ACWRChart width={240} height={120} />
          </div>

          {/* Health Snapshot */}
          <div style={{
            background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14,
            border: `1px solid ${LP.border}`, display: "flex", alignItems: "center", gap: 16,
          }}>
            <HealthDonut size={90} />
            <div>
              <div style={{ fontFamily: font.display, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                Health Snapshot
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 11, fontFamily: font.body }}>
                  <span style={{ color: LP.amber, fontWeight: 700 }}>FATIGA: 6.5</span>
                  <span style={{ color: LP.muted, fontSize: 9, marginLeft: 4 }}>(MED)</span>
                </div>
                <div style={{ fontSize: 11, fontFamily: font.body }}>
                  <span style={{ color: LP.green, fontWeight: 700 }}>RENDIMIENTO: 7.2</span>
                  <span style={{ color: LP.muted, fontSize: 9, marginLeft: 4 }}>(ALTA)</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ════ PANEL 3: MÓDULO DE GESTIÓN ════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -3, boxShadow: "0 14px 44px rgba(0,0,0,0.5), 0 0 20px rgba(200,255,0,0.04)" }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ ...panelStyle, gridColumn: "1", gridRow: "2", cursor: "default" }}
        >
          <div style={headerStyle}>MÓDULO DE GESTIÓN (Estandarización)</div>
          <div style={{ display: "flex", gap: 12 }}>
            {/* Sub-panel: Metodología Única */}
            <div style={{
              flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14,
              border: `1px solid ${LP.border}`,
            }}>
              <div style={{ fontFamily: font.display, fontSize: 12, fontWeight: 700, color: LP.text, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
                METODOLOGÍA ÚNICA
              </div>
              <MethodologyFlow width={220} height={75} />
              <div style={{ fontSize: 10, color: LP.muted, marginTop: 8, lineHeight: 1.5, fontFamily: font.body }}>
                Automatice el flujo de su staff técnico.
              </div>
            </div>
            {/* Sub-panel: Intel miniature */}
            <div style={{
              flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14,
              border: `1px solid ${LP.border}`,
            }}>
              <div style={{ fontFamily: font.display, fontSize: 12, fontWeight: 700, color: LP.text, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                INTELIGENCIA DEPORTIVA
              </div>
              <ACWRChart width={200} height={80} />
              <div style={{ marginTop: 8 }}>
                <HealthDonut size={60} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ════ BOTTOM ROW: Financial + Journal side by side ════ */}
        <div style={{ gridColumn: "2", gridRow: "2", display: "flex", gap: 16, minHeight: 0 }}>

          {/* ════ PANEL 4: MÓDULO FINANCIERO ════ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, boxShadow: "0 14px 44px rgba(0,0,0,0.5), 0 0 20px rgba(200,255,0,0.04)" }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ ...panelStyle, flex: 1, display: "flex", flexDirection: "column", cursor: "default" }}
          >
            <div style={headerStyle}>MÓDULO FINANCIERO (CRM)</div>
            <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              SALUD DEL CLUB
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <FinancialGauge size={150} />
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <div style={{
                flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px",
                border: `1px solid ${LP.border}`,
              }}>
                <div style={{ fontSize: 8, color: LP.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>POR COBRAR</div>
                <div style={{ fontFamily: font.display, fontSize: 13, fontWeight: 800, color: LP.amber, animation: "cl2_pulse 4s ease infinite" }}>$1,200,000</div>
                <div style={{ fontSize: 7, color: LP.hint }}>COP</div>
              </div>
              <div style={{
                flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px",
                border: `1px solid ${LP.border}`,
              }}>
                <div style={{ fontSize: 8, color: LP.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>PAGOS HOY</div>
                <div style={{ fontFamily: font.display, fontSize: 13, fontWeight: 800, color: LP.green, animation: "cl2_pulse 4s ease infinite 1s" }}>$350,000</div>
                <div style={{ fontSize: 7, color: LP.hint }}>COP</div>
              </div>
            </div>

            {/* Player cards */}
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { name: "Carlos M.", paid: true },
                { name: "Valentina R.", paid: false },
              ].map((p, i) => (
                <div key={i} className="cl2-card-hover" style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "6px 10px",
                  border: `1px solid ${LP.border}`,
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
                  }}>👤</div>
                  <span style={{ flex: 1, fontFamily: font.body, fontSize: 10, color: LP.muted }}>{p.name}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, fontFamily: font.display,
                    color: p.paid ? LP.green : LP.danger,
                  }}>
                    {p.paid ? "✓ Pagado" : "✗ Mora"}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ════ PANEL 5: MÓDULO JOURNAL ════ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, boxShadow: "0 14px 44px rgba(0,0,0,0.5), 0 0 20px rgba(200,255,0,0.04)" }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ ...panelStyle, flex: 1, display: "flex", flexDirection: "column", cursor: "default" }}
          >
            <div style={headerStyle}>MÓDULO JOURNAL (Noticias & Updates)</div>
            <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, color: LP.neon }}>
              ELEVATE JOURNAL
            </div>

            {/* News items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              {/* Item 1 */}
              <div className="cl2-card-hover" style={{
                background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 12,
                border: `1px solid ${LP.border}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontFamily: font.display, fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: LP.neon }}>
                    ACTUALIZACIÓN 2.1
                  </span>
                  <span style={{ fontSize: 8, color: LP.hint }}>15 Mar</span>
                </div>
                <div style={{ fontSize: 10, color: LP.muted, lineHeight: 1.5 }}>
                  Nuevo motor de rebote en Pizarra Táctica para animaciones fluidas.
                </div>
              </div>

              {/* Item 2 — purple accent */}
              <div className="cl2-card-hover" style={{
                background: `linear-gradient(135deg, ${LP.purple}22, ${LP.purple}08)`, borderRadius: 10, padding: 12,
                border: `1px solid ${LP.purple}33`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontFamily: font.display, fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: LP.purple }}>
                    RECOMENDACIÓN TÉCNICA
                  </span>
                  <span style={{ fontSize: 8, color: LP.hint }}>12 Mar</span>
                </div>
                <div style={{ fontSize: 10, color: LP.muted, lineHeight: 1.5 }}>
                  RPE Borg CR-10 reduce lesiones en un 34% cuando se monitorea semanalmente.
                </div>
              </div>

              {/* Item 3 */}
              <div className="cl2-card-hover" style={{
                background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 12,
                border: `1px solid ${LP.border}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontFamily: font.display, fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: LP.amber }}>
                    CONSEJO ADMIN
                  </span>
                  <span style={{ fontSize: 8, color: LP.hint }}>10 Mar</span>
                </div>
                <div style={{ fontSize: 10, color: LP.muted, lineHeight: 1.5 }}>
                  Automatiza el semáforo de pagos para reducir mora en tu club.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Footer con links legales ── */}
      <footer role="contentinfo" style={{ textAlign: "center", padding: "20px 16px 16px" }}>
        <div style={{ fontSize: 9, color: LP.hint, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>
          © 2026 Elevate Sports · Gestion deportiva profesional · Medellin, Colombia
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, fontSize: 9 }}>
          <button
            onClick={() => setShowLegal(true)}
            aria-label="Ver politica de datos personales"
            style={{ background: "none", border: "none", color: LP.muted, cursor: "pointer", textDecoration: "underline", fontSize: 9, fontFamily: font.body }}
          >
            Politica de datos
          </button>
          <button
            onClick={() => setShowLegal(true)}
            aria-label="Ver terminos de servicio"
            style={{ background: "none", border: "none", color: LP.muted, cursor: "pointer", textDecoration: "underline", fontSize: 9, fontFamily: font.body }}
          >
            Terminos de servicio
          </button>
        </div>
        <div style={{ fontSize: 8, color: LP.hint, marginTop: 6, fontFamily: font.body }}>
          Datos almacenados localmente en tu navegador · Ley 1581 de 2012
        </div>
      </footer>

      {/* ── Modal Legal ── */}
      {showLegal && (
        <Suspense fallback={null}>
          <LegalDisclaimer onClose={() => setShowLegal(false)} />
        </Suspense>
      )}
    </div>
  );
}
