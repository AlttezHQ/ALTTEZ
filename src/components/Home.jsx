/**
 * @component Home — Dashboard de Comando Operativo
 * @description Reemplazo del launcher decorativo por un grid 2×2 de
 *   Command Cards con datos en tiempo real, glassmorphism y animaciones
 *   estilo consola FIFA/EA FC.
 *
 * @version 6.0 — Command Dashboard
 * @author Andrés (Senior Frontend) · Elevate Sports
 */

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PALETTE as C } from "../constants/palette";
import { calcSaludActual } from "../utils/rpeEngine";
import { showToast } from "./Toast";

// ─────────────────────────────────────────────
// RESPONSIVE — inyectar media queries una sola vez
// ─────────────────────────────────────────────
if (typeof document !== "undefined" && !document.getElementById("cmd-dashboard-responsive")) {
  const s = document.createElement("style");
  s.id = "cmd-dashboard-responsive";
  s.textContent = `
    .cmd-topbar { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .cmd-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding: 12px;
    }
    @media (max-width: 899px) {
      .cmd-grid { grid-template-columns: 1fr !important; }
    }
    @media (max-width: 479px) {
      .cmd-grid { padding: 8px !important; gap: 8px !important; }
      .cmd-topbar-brand { display: none !important; }
      .cmd-club-meta { display: none !important; }
    }
    @keyframes cmd-pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
    @keyframes cmd-spin {
      to { transform: rotate(360deg); }
    }
    @keyframes cmd-glow-pulse {
      0%, 100% { box-shadow: 0 0 6px 1px rgba(226,75,74,0.5); }
      50%       { box-shadow: 0 0 14px 3px rgba(226,75,74,0.9); }
    }
  `;
  document.head.appendChild(s);
}

// ─────────────────────────────────────────────
// NAV ITEMS — conservado del original
// ─────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "home",          label: "Inicio",              navigable: false },
  { key: "entrenamiento", label: "Entrenamiento",        navigable: true  },
  { key: "plantilla",     label: "Gestión de plantilla", navigable: true  },
  { key: "calendario",    label: "Calendario",           navigable: true  },
  { key: "admin",         label: "Administración",       navigable: true  },
  { key: "reportes",      label: "Reportes",             navigable: true  },
  { key: "miclub",        label: "Mi club",              navigable: true  },
];

// ─────────────────────────────────────────────
// ANIMACIONES
// ─────────────────────────────────────────────
const cardVariants = {
  initial:  { opacity: 0, y: 24, scale: 0.97 },
  animate:  { opacity: 1, y: 0,  scale: 1    },
  transition: { type: "spring", stiffness: 280, damping: 28 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const rowVariant = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 320, damping: 28 } },
};

// ─────────────────────────────────────────────
// WEB AUDIO (conservado del original)
// ─────────────────────────────────────────────
function useGameAudio() {
  const ctxRef = useRef(null);
  const getCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctxRef.current;
  }, []);

  const playSelect = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now); osc.stop(now + 0.23);
    } catch { /* silencioso */ }
  }, [getCtx]);

  return { playSelect };
}

// ─────────────────────────────────────────────
// DATOS DEMO DE FINANZAS (hardcoded para mockup)
// ─────────────────────────────────────────────
const DEMO_FINANZAS = {
  meta:       1200000,
  recaudado:  720000,
  morosos: [
    { nombre: "Carlos Méndez",    monto: 85000  },
    { nombre: "Andrés Pedraza",   monto: 120000 },
    { nombre: "Miguel Torrealba", monto: 65000  },
  ],
};

// ─────────────────────────────────────────────
// FORMACIÓN 4-3-3 — posiciones normalizadas [0-100] sobre campo 100×65
// ─────────────────────────────────────────────
const FORMATION_433 = [
  // Portero
  { x: 8,  y: 32.5, num: 1  },
  // Defensa
  { x: 25, y: 8,    num: 2  },
  { x: 25, y: 22,   num: 5  },
  { x: 25, y: 43,   num: 6  },
  { x: 25, y: 57,   num: 3  },
  // Mediocampo
  { x: 50, y: 15,   num: 8  },
  { x: 50, y: 32.5, num: 4  },
  { x: 50, y: 50,   num: 11 },
  // Ataque
  { x: 72, y: 10,   num: 7  },
  { x: 75, y: 32.5, num: 9  },
  { x: 72, y: 55,   num: 10 },
];

// ─────────────────────────────────────────────
// MINI PITCH SVG — campo simplificado inline
// ─────────────────────────────────────────────
function MiniPitch({ formation = FORMATION_433 }) {
  const W = 220;
  const H = 140;
  const pad = 6;
  // Campo real: W×H menos padding
  const fw = W - pad * 2;
  const fh = H - pad * 2;

  // Convertir posiciones normalizadas [0-100] a px del campo
  const toX = (pct) => pad + (pct / 100) * fw;
  const toY = (pct) => pad + (pct / 100) * fh;

  const lineProps = {
    stroke: "rgba(255,255,255,0.18)",
    strokeWidth: 0.8,
    fill: "none",
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      style={{ display: "block", maxHeight: 140 }}
    >
      {/* Fondo césped */}
      <defs>
        <linearGradient id="grass-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#0d4d2a" />
          <stop offset="50%"  stopColor="#0f5a30" />
          <stop offset="100%" stopColor="#0a4225" />
        </linearGradient>
        {/* Bandas de césped */}
        {[0,1,2,3,4,5,6,7,8,9].map(i => (
          <clipPath key={i} id={`band-${i}`}>
            <rect x={pad + (fw/10)*i} y={pad} width={fw/10} height={fh} />
          </clipPath>
        ))}
      </defs>

      {/* Base campo */}
      <rect x={pad} y={pad} width={fw} height={fh} fill="url(#grass-grad)" rx={2} />

      {/* Bandas de césped alternadas */}
      {[0,2,4,6,8].map(i => (
        <rect
          key={i}
          x={pad + (fw/10)*i} y={pad}
          width={fw/10} height={fh}
          fill="rgba(0,0,0,0.08)"
          rx={1}
        />
      ))}

      {/* Borde del campo */}
      <rect x={pad} y={pad} width={fw} height={fh} {...lineProps} rx={2} />

      {/* Línea central */}
      <line x1={toX(50)} y1={pad} x2={toX(50)} y2={pad + fh} {...lineProps} />

      {/* Círculo central */}
      <circle cx={toX(50)} cy={toY(50)} r={fh * 0.18} {...lineProps} />
      <circle cx={toX(50)} cy={toY(50)} r={1.5} fill="rgba(255,255,255,0.35)" />

      {/* Área grande izquierda */}
      <rect
        x={pad} y={toY(18)}
        width={fw * 0.16} height={toY(82) - toY(18)}
        {...lineProps}
      />
      {/* Área pequeña izquierda */}
      <rect
        x={pad} y={toY(32)}
        width={fw * 0.07} height={toY(68) - toY(32)}
        {...lineProps}
      />

      {/* Área grande derecha */}
      <rect
        x={pad + fw - fw * 0.16} y={toY(18)}
        width={fw * 0.16} height={toY(82) - toY(18)}
        {...lineProps}
      />
      {/* Área pequeña derecha */}
      <rect
        x={pad + fw - fw * 0.07} y={toY(32)}
        width={fw * 0.07} height={toY(68) - toY(32)}
        {...lineProps}
      />

      {/* Tokens de jugadores */}
      {formation.map((p) => (
        <g key={p.num}>
          {/* Sombra del disco */}
          <circle
            cx={toX(p.x) + 1}
            cy={toY(p.y) + 1.5}
            r={7}
            fill="rgba(0,0,0,0.45)"
          />
          {/* Disco del jugador */}
          <circle
            cx={toX(p.x)}
            cy={toY(p.y)}
            r={7}
            fill="#7F77DD"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={1.2}
          />
          {/* Número */}
          <text
            x={toX(p.x)}
            y={toY(p.y) + 3.5}
            textAnchor="middle"
            fontSize={6.5}
            fontWeight="700"
            fill="white"
            fontFamily="Arial Narrow, Arial, sans-serif"
          >
            {p.num}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────
// COMMAND CARD — contenedor glassmorphism base
// ─────────────────────────────────────────────
function CommandCard({ accentColor, children, onClick, style = {} }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={cardVariants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        position: "relative",
        borderRadius: 14,
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid rgba(255,255,255,0.08)`,
        borderTop: `4px solid ${accentColor}`,
        boxShadow: hovered
          ? `0 8px 40px rgba(0,0,0,0.6), 0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 20px ${accentColor}22`
          : `0 4px 24px rgba(0,0,0,0.5), 0 1px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 220ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 220ms ease",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        padding: "20px 22px",
        minHeight: 280,
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {/* Glow strip top */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 40,
        background: `linear-gradient(to bottom, ${accentColor}12, transparent)`,
        borderRadius: "14px 14px 0 0",
        pointerEvents: "none",
      }} />
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// CARD HEADER — etiqueta + título
// ─────────────────────────────────────────────
function CardHeader({ tag, title, accentColor, rightSlot }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
      <div>
        <div style={{
          fontSize: 8,
          textTransform: "uppercase",
          letterSpacing: "2.5px",
          color: accentColor,
          marginBottom: 4,
          fontWeight: 700,
          opacity: 0.9,
        }}>
          {tag}
        </div>
        <div style={{
          fontSize: 15,
          fontWeight: 800,
          color: "white",
          textTransform: "uppercase",
          letterSpacing: "-0.3px",
          lineHeight: 1.1,
        }}>
          {title}
        </div>
      </div>
      {rightSlot}
    </div>
  );
}

// ─────────────────────────────────────────────
// ACCIÓN BUTTON
// ─────────────────────────────────────────────
function ActionButton({ label, color = C.neon, onClick, size = "normal", style = {} }) {
  const [hov, setHov] = useState(false);
  const isSmall = size === "small";
  const isBig   = size === "big";

  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: isBig ? 12 : (isSmall ? 9 : 10),
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: isSmall ? "1px" : "1.5px",
        padding: isBig ? "14px 20px" : (isSmall ? "5px 10px" : "9px 18px"),
        height: isBig ? 60 : (isSmall ? "auto" : "auto"),
        background: hov ? color : `${color}1a`,
        color: hov ? "#0a0a0a" : color,
        border: `1px solid ${color}66`,
        borderRadius: 8,
        cursor: "pointer",
        transition: "background 180ms ease, color 180ms ease",
        fontFamily: "'Arial Narrow', Arial, sans-serif",
        minHeight: isSmall ? 36 : 44,
        ...style,
      }}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────
// MÓDULO 1 — ESTADO DE ALERTA
// ─────────────────────────────────────────────
function AlertaCard({ athletes, historial, onNavigate }) {
  const ACCENT = "#E24B4A";

  // Calcular salud de cada atleta
  const athletesWithHealth = useMemo(() => {
    if (!athletes || athletes.length === 0) return [];
    return athletes
      .map(a => {
        const { salud, color, riskLevel } = calcSaludActual(a.rpe, historial, a.id);
        return { ...a, salud, healthColor: color, riskLevel };
      })
      .sort((a, b) => a.salud - b.salud)
      .slice(0, 5);
  }, [athletes, historial]);

  const hasData = athletes && athletes.length > 0;
  const highRisk = athletesWithHealth.filter(a => a.rpe > 8 || a.salud < 30);

  return (
    <CommandCard accentColor={ACCENT}>
      <CardHeader
        tag="Módulo 01"
        title="Estado de Alerta"
        accentColor={ACCENT}
        rightSlot={
          highRisk.length > 0 && (
            <div style={{
              padding: "3px 9px",
              fontSize: 8,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              background: `${ACCENT}22`,
              color: ACCENT,
              border: `1px solid ${ACCENT}66`,
              borderRadius: 4,
              animation: "cmd-glow-pulse 1.8s ease-in-out infinite",
              whiteSpace: "nowrap",
            }}>
              {highRisk.length} en riesgo
            </div>
          )
        }
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
        {!hasData ? (
          <EmptyStateInline
            icon="⚡"
            message="Sin alertas. Registrar sesión"
            actionLabel="Registrar sesión →"
            onAction={() => onNavigate("entrenamiento")}
            accentColor={ACCENT}
          />
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" style={{ flex: 1 }}>
            {athletesWithHealth.map((a, i) => (
              <motion.div
                key={a.id}
                variants={rowVariant}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 0",
                  borderBottom: i < athletesWithHealth.length - 1
                    ? "1px solid rgba(255,255,255,0.05)"
                    : "none",
                }}
              >
                {/* Dot de estado */}
                <div style={{
                  width: 8, height: 8,
                  borderRadius: "50%",
                  background: a.healthColor,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${a.healthColor}`,
                }} />

                {/* Avatar dicebear */}
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(a.nombre || "?")}&backgroundColor=1a1a2e&textColor=ffffff&fontSize=40`}
                  alt={a.nombre}
                  width={28}
                  height={28}
                  style={{ borderRadius: "50%", border: `1px solid ${a.healthColor}55`, flexShrink: 0 }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />

                {/* Nombre */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "white",
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {a.nombre || "—"}
                  </div>
                  {/* Barra de salud thin */}
                  <div style={{
                    marginTop: 3,
                    height: 3,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${a.salud}%` }}
                      transition={{ delay: i * 0.08 + 0.2, duration: 0.6, ease: "easeOut" }}
                      style={{
                        height: "100%",
                        background: `linear-gradient(to right, ${a.healthColor}, ${a.healthColor}aa)`,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>

                {/* Salud % */}
                <div style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: a.healthColor,
                  flexShrink: 0,
                  minWidth: 36,
                  textAlign: "right",
                }}>
                  {a.salud}%
                </div>

                {/* Badge ALTO RIESGO */}
                {(a.rpe > 8 || a.salud < 30) && (
                  <div style={{
                    fontSize: 7,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    padding: "2px 5px",
                    background: `${ACCENT}33`,
                    color: ACCENT,
                    border: `1px solid ${ACCENT}66`,
                    borderRadius: 3,
                    animation: "cmd-pulse 1.4s ease-in-out infinite",
                    flexShrink: 0,
                  }}>
                    Alto riesgo
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <div style={{ marginTop: 14 }}>
        <ActionButton
          label="Ajustar carga →"
          color={ACCENT}
          onClick={() => onNavigate("entrenamiento")}
          style={{ width: "100%" }}
        />
      </div>
    </CommandCard>
  );
}

// ─────────────────────────────────────────────
// MÓDULO 2 — CIERRE DE CAJA
// ─────────────────────────────────────────────
function CajaCard({ userRole, matchStats, onNavigate }) {
  const ACCENT = "#EF9F27";
  const pct = Math.round((DEMO_FINANZAS.recaudado / DEMO_FINANZAS.meta) * 100);

  if (userRole !== "admin") {
    // Resumen deportivo para roles no-admin
    return (
      <CommandCard accentColor={C.green}>
        <CardHeader tag="Módulo 02" title="Resumen Deportivo" accentColor={C.green} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
          {[
            { label: "Ganados",   val: matchStats.won,    color: C.green  },
            { label: "Perdidos",  val: matchStats.lost,   color: C.danger },
            { label: "Empates",   val: matchStats.drawn,  color: C.amber  },
            { label: "Goles",     val: `${matchStats.goalsFor}–${matchStats.goalsAgainst}`, color: "white" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1px", color: C.textMuted }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
        <ActionButton label="Ver partidos →" color={C.green} onClick={() => onNavigate("partidos")} style={{ width: "100%", marginTop: 14 }} />
      </CommandCard>
    );
  }

  return (
    <CommandCard accentColor={ACCENT}>
      <CardHeader tag="Módulo 02" title="Cierre de Caja" accentColor={ACCENT} />

      {/* Monto principal */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 36,
          fontWeight: 900,
          color: ACCENT,
          letterSpacing: "-1px",
          lineHeight: 1,
          textShadow: `0 0 20px ${ACCENT}55`,
        }}>
          ${DEMO_FINANZAS.recaudado.toLocaleString("es-CO")}
        </div>
        <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4, textTransform: "uppercase", letterSpacing: "1px" }}>
          de ${DEMO_FINANZAS.meta.toLocaleString("es-CO")} · {pct}% recaudado
        </div>
      </div>

      {/* Barra de progreso animada */}
      <div style={{
        height: 6,
        background: "rgba(255,255,255,0.08)",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 16,
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.3, duration: 0.9, ease: "easeOut" }}
          style={{
            height: "100%",
            background: `linear-gradient(to right, ${ACCENT}, ${ACCENT}cc)`,
            borderRadius: 4,
            boxShadow: `0 0 8px ${ACCENT}88`,
          }}
        />
      </div>

      {/* Lista de morosos */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "2px", color: C.textMuted, marginBottom: 8 }}>
          Pendientes de cobro
        </div>
        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          {DEMO_FINANZAS.morosos.map((m, i) => (
            <motion.div
              key={i}
              variants={rowVariant}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: i < DEMO_FINANZAS.morosos.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}
            >
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{m.nombre}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT }}>
                  ${m.monto.toLocaleString("es-CO")}
                </div>
                <ActionButton
                  label="Cobrar"
                  color={ACCENT}
                  size="small"
                  onClick={() => showToast(`Recordatorio enviado a ${m.nombre}`, "success")}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <ActionButton
        label="Ver finanzas completas →"
        color={ACCENT}
        onClick={() => onNavigate("admin")}
        style={{ width: "100%", marginTop: 14 }}
      />
    </CommandCard>
  );
}

// ─────────────────────────────────────────────
// MÓDULO 3 — INGESTA RÁPIDA
// ─────────────────────────────────────────────
function IngestaCard({ athletes, historial, onNavigate }) {
  const ACCENT = C.neon; // #c8ff00

  // Último evento del historial
  const ultimaSesion = historial && historial.length > 0 ? historial[0] : null;

  // Atletas sin RPE hoy
  const sinRpeHoy = useMemo(() => {
    if (!athletes || athletes.length === 0) return 0;
    return athletes.filter(a => !a.rpe || a.rpe === null || a.rpe === 0).length;
  }, [athletes]);

  return (
    <CommandCard accentColor={ACCENT}>
      <CardHeader tag="Módulo 03" title="Ingesta Rápida" accentColor={ACCENT} />

      {/* Último evento */}
      {ultimaSesion ? (
        <div style={{
          padding: "12px 14px",
          background: "rgba(200,255,0,0.05)",
          border: "1px solid rgba(200,255,0,0.12)",
          borderRadius: 8,
          marginBottom: 14,
        }}>
          <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "2px", color: C.textMuted, marginBottom: 4 }}>
            Última sesión registrada
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
            #{ultimaSesion.num} — {ultimaSesion.tipo || "Sesión"}
          </div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>
            {ultimaSesion.fecha} · {ultimaSesion.presentes}/{ultimaSesion.total} presentes
            {ultimaSesion.rpeAvg && ` · RPE ${ultimaSesion.rpeAvg}`}
          </div>
        </div>
      ) : (
        <div style={{
          padding: "12px 14px",
          background: "rgba(200,255,0,0.04)",
          border: "1px dashed rgba(200,255,0,0.15)",
          borderRadius: 8,
          marginBottom: 14,
        }}>
          <div style={{ fontSize: 11, color: C.textHint }}>Sin sesiones registradas aún</div>
        </div>
      )}

      {/* Contador sin RPE */}
      {sinRpeHoy > 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: "rgba(226,75,74,0.08)",
          border: "1px solid rgba(226,75,74,0.2)",
          borderRadius: 6,
          marginBottom: 14,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.danger, animation: "cmd-pulse 1.4s ease-in-out infinite" }} />
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
            <span style={{ fontWeight: 800, color: C.danger }}>{sinRpeHoy}</span> atletas sin RPE hoy
          </div>
        </div>
      )}

      {/* Botones de acción grandes */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 10, marginTop: "auto" }}>
        <button
          onClick={() => onNavigate("entrenamiento")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            height: 60,
            background: `${ACCENT}15`,
            border: `1px solid ${ACCENT}55`,
            borderRadius: 10,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: ACCENT,
            fontFamily: "'Arial Narrow', Arial, sans-serif",
            transition: "background 180ms ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${ACCENT}30`; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${ACCENT}15`; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          Registrar RPE
        </button>

        <button
          onClick={() => onNavigate("calendario")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            height: 60,
            background: `${C.purple}15`,
            border: `1px solid ${C.purple}55`,
            borderRadius: 10,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: C.purple,
            fontFamily: "'Arial Narrow', Arial, sans-serif",
            transition: "background 180ms ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${C.purple}30`; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${C.purple}15`; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke={C.purple} strokeWidth="2"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke={C.purple} strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Asistencia hoy
        </button>
      </div>
    </CommandCard>
  );
}

// ─────────────────────────────────────────────
// MÓDULO 4 — PIZARRA DE ESTRATEGIA
// ─────────────────────────────────────────────
function PizarraCard({ onNavigate }) {
  const ACCENT = "#7F77DD";

  return (
    <CommandCard accentColor={ACCENT}>
      <CardHeader
        tag="Módulo 04"
        title="Pizarra de Estrategia"
        accentColor={ACCENT}
        rightSlot={
          <div style={{
            padding: "3px 9px",
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1px",
            background: `${ACCENT}22`,
            color: ACCENT,
            border: `1px solid ${ACCENT}44`,
            borderRadius: 4,
          }}>
            4-3-3
          </div>
        }
      />

      {/* Mini campo SVG */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.25)",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
        marginBottom: 14,
        padding: 6,
        minHeight: 130,
      }}>
        <MiniPitch formation={FORMATION_433} />
      </div>

      {/* Leyenda */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: ACCENT, border: "1.5px solid rgba(255,255,255,0.5)" }} />
        <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>
          Formación activa — 11 jugadores posicionados
        </div>
      </div>

      <ActionButton
        label="Editar táctica →"
        color={ACCENT}
        onClick={() => onNavigate("plantilla")}
        style={{ width: "100%" }}
      />
    </CommandCard>
  );
}

// ─────────────────────────────────────────────
// EMPTY STATE INLINE
// ─────────────────────────────────────────────
function EmptyStateInline({ icon, message, actionLabel, onAction, accentColor }) {
  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "24px 16px",
      gap: 10,
    }}>
      <div style={{ fontSize: 28, opacity: 0.5 }}>{icon}</div>
      <div style={{ fontSize: 11, color: C.textMuted }}>{message}</div>
      {actionLabel && (
        <ActionButton
          label={actionLabel}
          color={accentColor}
          size="small"
          onClick={onAction}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TOPBAR KPI STRIP
// ─────────────────────────────────────────────
function KpiStrip({ athletes, stats, matchStats }) {
  const kpis = [
    { label: "Atletas",       val: athletes.length,       color: C.neon   },
    { label: "Sesiones",      val: stats.sesiones,         color: C.neon   },
    { label: "Asistencia",    val: `${stats.asistencia}%`, color: C.green  },
    { label: "Partidos",      val: matchStats.played,      color: C.purple },
    { label: "Victorias",     val: matchStats.won,         color: C.green  },
    { label: "Puntos",        val: matchStats.points,      color: C.amber  },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      style={{
        display: "flex",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        flexShrink: 0,
      }}
    >
      {kpis.map((k, i) => (
        <div
          key={k.label}
          style={{
            padding: "10px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            borderRight: i < kpis.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            background: i === 0 ? `${C.neon}08` : "transparent",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.val}</div>
          <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "1.5px", color: C.textMuted }}>{k.label}</div>
        </div>
      ))}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// HOME PRINCIPAL — Dashboard de Comando
// ─────────────────────────────────────────────
export default function Home({ club, athletes, historial, stats, matchStats, onNavigate, mode, onLogout, userRole }) {
  const { playSelect } = useGameAudio();

  const clubInitials = (club.nombre || "ES")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const today = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, #070d1a 0%, #050a14 40%, #0a0714 100%)`,
      fontFamily: "'Arial Narrow', Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── TOPBAR ── */}
      <div
        className="cmd-topbar"
        style={{
          height: 44,
          background: "rgba(5,8,18,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid rgba(200,255,0,0.15)`,
          display: "flex",
          alignItems: "stretch",
          flexShrink: 0,
        }}
      >
        {/* Brand */}
        <div
          className="cmd-topbar-brand"
          style={{
            padding: "0 22px",
            display: "flex",
            alignItems: "center",
            background: "rgba(0,0,0,0.5)",
            borderRight: `1px solid ${C.border}`,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
            Elevate<span style={{ color: C.neon }}>Sports</span>
          </span>
        </div>

        {/* Nav items */}
        {NAV_ITEMS.map(({ key, label, navigable }) => (
          <div
            key={key}
            onClick={() => {
              if (navigable) { playSelect(); onNavigate(key); }
            }}
            style={{
              padding: "0 14px",
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "1.8px",
              color: key === "home" ? "white" : C.textMuted,
              display: "flex",
              alignItems: "center",
              cursor: navigable ? "pointer" : "default",
              borderRight: `1px solid ${C.border}`,
              borderBottom: key === "home" ? `2px solid ${C.neon}` : "2px solid transparent",
              background: key === "home" ? "rgba(200,255,0,0.05)" : "transparent",
              whiteSpace: "nowrap",
              transition: "color 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={e => { if (navigable && key !== "home") e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { if (key !== "home") e.currentTarget.style.color = C.textMuted; }}
          >
            {label}
          </div>
        ))}

        {/* Club badge */}
        <div style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 16px",
          borderLeft: `1px solid ${C.border}`,
          flexShrink: 0,
        }}>
          {mode === "demo" && (
            <div style={{ padding: "2px 7px", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", background: "rgba(239,159,39,0.2)", color: C.amber, border: `1px solid rgba(239,159,39,0.4)` }}>
              Demo
            </div>
          )}
          <div style={{
            width: 26, height: 26,
            borderRadius: "50%",
            background: "rgba(200,255,0,0.12)",
            border: `2px solid ${C.neon}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 700, color: C.neon,
          }}>
            {clubInitials}
          </div>
          <div className="cmd-club-meta">
            <div style={{ fontSize: 11, fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: "0.8px", whiteSpace: "nowrap" }}>
              {club.nombre || "Mi Club"}
            </div>
            <div style={{ fontSize: 8, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.4px" }}>
              {(club.categorias||[])[0]||"General"}
            </div>
          </div>
          {onLogout && (
            <div
              onClick={onLogout}
              style={{ marginLeft: 6, padding: "4px 10px", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", whiteSpace: "nowrap", borderRadius: 4 }}
            >
              Salir
            </div>
          )}
        </div>
      </div>

      {/* ── COMMAND HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          padding: "14px 24px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "3px", color: C.neon, marginBottom: 3, opacity: 0.8 }}>
            Dashboard de Comando
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "white", letterSpacing: "-0.5px", lineHeight: 1 }}>
            {club.nombre || "Mi Club"}
            <span style={{ fontSize: 11, fontWeight: 400, color: C.textMuted, marginLeft: 10, letterSpacing: "0.5px" }}>
              {userRole === "admin" ? "Administrador" : userRole === "coach" ? "Entrenador" : "Asistente"}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "1.5px", color: C.textMuted }}>
            {todayCapitalized}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, justifyContent: "flex-end" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, boxShadow: `0 0 5px ${C.green}` }} />
            <div style={{ fontSize: 9, color: C.green, textTransform: "uppercase", letterSpacing: "1px" }}>Sistema activo</div>
          </div>
        </div>
      </motion.div>

      {/* ── KPI STRIP ── */}
      <KpiStrip athletes={athletes} stats={stats} matchStats={matchStats} />

      {/* ── GRID 2×2 ── */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="cmd-grid"
        style={{ flex: 1 }}
      >
        <AlertaCard athletes={athletes} historial={historial} onNavigate={onNavigate} />
        <CajaCard userRole={userRole} matchStats={matchStats} onNavigate={onNavigate} />
        <IngestaCard athletes={athletes} historial={historial} onNavigate={onNavigate} />
        <PizarraCard onNavigate={onNavigate} />
      </motion.div>

      {/* ── FOOTER ── */}
      <div style={{
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 18px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 8, color: C.textHint, textTransform: "uppercase", letterSpacing: "1.5px" }}>
          Elevate Sports v6.0 · Dashboard de Comando Operativo
        </div>
      </div>

    </div>
  );
}
