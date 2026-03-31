/**
 * @component WellnessCheckIn
 * @description Panel de check-in de bienestar del atleta.
 * 4 sliders custom (Sueño, Fatiga, Estrés, DOMS) con diseño Glassmorphism Dark Premium.
 * Circular SVG progress ring reactivo al score total.
 * Llama onSubmit(log) al confirmar, donde log tiene la forma WellnessLog.
 *
 * @prop {string|number} athleteId   - ID del atleta
 * @prop {string}        athleteName - Nombre visible en el header
 * @prop {string}        clubId      - ID del club (multi-tenancy — incluido en el log)
 * @prop {Function}      onSubmit    - Callback con el WellnessLog construido
 * @prop {Function}      onClose     - Callback para cerrar el panel
 *
 * @author Andres-UI (Elevate Sports)
 * @version 2.0 — Custom sliders + Circular Progress Ring
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { PALETTE } from "../../constants/palette";
import { calcWellnessScore, getWellnessStatus } from "../../types/wellnessTypes";

/* ── Custom slider CSS — inyectar una vez en el <head> ── */
if (typeof document !== "undefined" && !document.getElementById("wellness-slider-css")) {
  const s = document.createElement("style");
  s.id = "wellness-slider-css";
  s.textContent = `
    .wci-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 4px;
      border-radius: 4px;
      cursor: pointer;
      outline: none;
    }
    .wci-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid rgba(0,0,0,0.4);
      box-shadow: 0 0 8px currentColor, 0 2px 4px rgba(0,0,0,0.6);
      transition: transform 150ms ease, box-shadow 150ms ease;
    }
    .wci-slider::-webkit-slider-thumb:hover {
      transform: scale(1.25);
      box-shadow: 0 0 14px currentColor, 0 2px 6px rgba(0,0,0,0.8);
    }
    .wci-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid rgba(0,0,0,0.4);
    }
  `;
  document.head.appendChild(s);
}

const SLIDERS = [
  { key: "sleep_quality", label: "Sueño",  icon: "🌙", description: "Calidad del descanso nocturno", inverted: false },
  { key: "fatigue_level", label: "Fatiga", icon: "⚡", description: "Nivel de cansancio muscular",   inverted: true  },
  { key: "stress_level",  label: "Estrés", icon: "🧠", description: "Tensión mental / presión",      inverted: true  },
  { key: "doms_level",    label: "DOMS",   icon: "💪", description: "Dolor muscular post-entreno",   inverted: true  },
];

const SLIDER_LABELS = {
  sleep_quality: ["Terrible", "Malo",   "Regular", "Bueno",   "Excelente"],
  fatigue_level: ["Ninguna",  "Leve",   "Moderada","Alta",    "Extrema"  ],
  stress_level:  ["Ninguno",  "Leve",   "Moderado","Alto",    "Extremo"  ],
  doms_level:    ["Sin dolor","Leve",   "Moderado","Intenso", "Severo"   ],
};

export default function WellnessCheckIn({ athleteId, athleteName, clubId, onSubmit, onClose }) {
  const [values, setValues] = useState({
    sleep_quality: 3,
    fatigue_level: 3,
    stress_level:  3,
    doms_level:    3,
  });

  const score         = calcWellnessScore(values);
  const wellnessStatus = getWellnessStatus(score);

  const statusColor =
    wellnessStatus.status === "green"  ? "#1D9E75" :
    wellnessStatus.status === "yellow" ? "#EF9F27" : "#E24B4A";

  const handleSubmit = () => {
    const log = {
      club_id:        clubId || null,
      athlete_id:     athleteId,
      logged_at:      new Date().toISOString(),
      ...values,
      wellness_score: score,
      notes:          null,
    };
    onSubmit?.(log);
    onClose?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 8 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      style={{
        background:           "rgba(8,8,20,0.92)",
        backdropFilter:       "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border:               "1px solid rgba(255,255,255,0.1)",
        borderRadius:         16,
        padding:              "20px 20px 16px",
        width:                280,
        boxShadow:            "0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:"white", textTransform:"uppercase", letterSpacing:"0.5px" }}>
            Wellness Check-in
          </div>
          {athleteName && (
            <div style={{ fontSize:9, color:PALETTE.textMuted, marginTop:2 }}>{athleteName}</div>
          )}
        </div>

        {/* Circular Progress Ring */}
        <svg width="60" height="60" viewBox="0 0 60 60" style={{ flexShrink:0 }}>
          <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4"/>
          <circle
            cx="30" cy="30" r="24"
            fill="none"
            stroke={statusColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 150.8} 150.8`}
            strokeDashoffset="37.7"
            transform="rotate(-90 30 30)"
            style={{ transition:"stroke-dasharray 600ms cubic-bezier(0.34,1.56,0.64,1), stroke 300ms ease" }}
          />
          {/* Inner glow ring */}
          <circle
            cx="30" cy="30" r="24"
            fill="none"
            stroke={statusColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 150.8} 150.8`}
            strokeDashoffset="37.7"
            transform="rotate(-90 30 30)"
            opacity="0.35"
            filter="url(#wellnessGlow)"
            style={{ transition:"stroke-dasharray 600ms ease" }}
          />
          <defs>
            <filter id="wellnessGlow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <text x="30" y="27" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="'JetBrains Mono',monospace">{Math.round(score)}</text>
          <text x="30" y="36" textAnchor="middle" fill={statusColor} fontSize="6" fontWeight="700" letterSpacing="1">{wellnessStatus.label.toUpperCase()}</text>
        </svg>
      </div>

      {/* Sliders */}
      <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:16 }}>
        {SLIDERS.map(({ key, label, icon }) => {
          const val = values[key];
          const sliderColor =
            key === "sleep_quality"
              ? (val >= 4 ? "#1D9E75" : val >= 3 ? "#EF9F27" : "#E24B4A")
              : (val <= 2 ? "#1D9E75" : val <= 3 ? "#EF9F27" : "#E24B4A");

          return (
            <div key={key}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ fontSize:13 }}>{icon}</span>
                  <span style={{ fontSize:10, fontWeight:600, color:"rgba(255,255,255,0.85)" }}>{label}</span>
                </div>
                <span style={{ fontSize:9, color:sliderColor, fontWeight:700 }}>
                  {SLIDER_LABELS[key][val - 1]}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={val}
                onChange={e => setValues(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                className="wci-slider"
                style={{
                  background: `linear-gradient(to right, ${sliderColor} 0%, ${sliderColor} ${(val - 1) / 4 * 100}%, rgba(255,255,255,0.1) ${(val - 1) / 4 * 100}%, rgba(255,255,255,0.1) 100%)`,
                  color: sliderColor,
                }}
              />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
                <span style={{ fontSize:7, color:"rgba(255,255,255,0.2)" }}>1</span>
                <span style={{ fontSize:7, color:"rgba(255,255,255,0.2)" }}>5</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display:"flex", gap:8 }}>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              flex:          1,
              padding:       "8px 0",
              fontSize:      10,
              fontWeight:    600,
              background:    "rgba(255,255,255,0.04)",
              border:        "1px solid rgba(255,255,255,0.1)",
              color:         "rgba(255,255,255,0.5)",
              borderRadius:  7,
              cursor:        "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              minHeight:     44,
            }}
          >
            Cancelar
          </button>
        )}
        <button
          onClick={handleSubmit}
          style={{
            flex:          2,
            padding:       "8px 0",
            fontSize:      10,
            fontWeight:    700,
            background:    `linear-gradient(135deg,${statusColor}22,${statusColor}11)`,
            border:        `1px solid ${statusColor}40`,
            color:         statusColor,
            borderRadius:  7,
            cursor:        "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            minHeight:     44,
          }}
        >
          Registrar
        </button>
      </div>
    </motion.div>
  );
}
