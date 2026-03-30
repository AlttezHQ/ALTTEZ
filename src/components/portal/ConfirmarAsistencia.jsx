/**
 * @component ConfirmarAsistencia
 * @description Pagina publica de confirmacion de asistencia via link de WhatsApp.
 * Ruta: /confirmar/:clubId/:eventId
 *
 * El deportista accede sin login. Escribe su nombre y elige su estado RSVP.
 * El resultado se guarda en Supabase tabla `event_rsvp` via INSERT/UPSERT.
 *
 * Disenio: glassmorphism oscuro, mobile-first (max-width 420px), touch-friendly.
 * No requiere autenticacion — la seguridad es el club_id correcto en la URL.
 *
 * @version 1.0.0
 * @author @Arquitecto (Carlos)
 */

import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, isSupabaseReady } from "../../lib/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

/** @type {"idle"|"submitting"|"success"|"error"} */
const STATUS = {
  IDLE: "idle",
  SUBMITTING: "submitting",
  SUCCESS: "success",
  ERROR: "error",
};

const RSVP_OPTIONS = [
  {
    value: "confirmed",
    label: "Confirmo asistencia",
    icon: "✓",
    color: "#39FF14",
    bg: "rgba(57,255,20,0.12)",
    border: "rgba(57,255,20,0.5)",
    hoverBg: "rgba(57,255,20,0.22)",
    hoverBorder: "#39FF14",
    glow: "rgba(57,255,20,0.35)",
  },
  {
    value: "absent",
    label: "No puedo asistir",
    icon: "✗",
    color: "#E24B4A",
    bg: "rgba(226,75,74,0.12)",
    border: "rgba(226,75,74,0.5)",
    hoverBg: "rgba(226,75,74,0.22)",
    hoverBorder: "#E24B4A",
    glow: "rgba(226,75,74,0.35)",
  },
  {
    value: "maybe",
    label: "Tengo dudas",
    icon: "~",
    color: "#EF9F27",
    bg: "rgba(239,159,39,0.12)",
    border: "rgba(239,159,39,0.5)",
    hoverBg: "rgba(239,159,39,0.22)",
    hoverBorder: "#EF9F27",
    glow: "rgba(239,159,39,0.35)",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Decodifica el eventId de la URL para mostrar el titulo del evento.
 * El eventId puede ser un ID opaco (e.g. "t-2026-2-1") o un slug legible.
 * @param {string} eventId
 * @returns {string}
 */
function decodeEventTitle(eventId) {
  // Si parece un ID estructurado de Elevate (t-YYYY-M-N, m-YYYY-M-N, c-YYYY-M-N)
  // lo dejamos como referencia. El titulo real viene del fetch de Supabase.
  return decodeURIComponent(eventId).replace(/-/g, " ");
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK — Fetch del evento desde Supabase (opcional — enriquece la UI)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Intenta obtener datos del evento desde Supabase.
 * Si no hay Supabase configurado o la tabla no contiene el evento,
 * retorna null y la UI cae a modo basico con el eventId decodificado.
 *
 * @param {string} clubId
 * @param {string} eventId
 * @returns {{ eventData: object|null, loading: boolean }}
 */
function useEventData(clubId, eventId) {
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseReady || !clubId || !eventId) return;

    let cancelled = false;
    setLoading(true);

    // Intentar obtener el evento desde una tabla de eventos si existiera.
    // Por ahora Elevate usa localStorage para eventos — el eventId es suficiente.
    // En el futuro, cuando se migren eventos a Supabase, este fetch enriquecera la UI.
    // Por diseno: no bloqueamos el UI si no hay datos.
    setLoading(false);

    return () => { cancelled = true; };
  }, [clubId, eventId]);

  return { eventData, loading };
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE: Logo Elevate
// ─────────────────────────────────────────────────────────────────────────────

function ElevateLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
      {/* Icono hexagonal */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <polygon
          points="16,2 29,9 29,23 16,30 3,23 3,9"
          stroke="#39FF14"
          strokeWidth="1.5"
          fill="rgba(57,255,20,0.08)"
          strokeLinejoin="round"
        />
        <text
          x="16"
          y="21"
          textAnchor="middle"
          fill="#39FF14"
          fontSize="13"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-0.5"
        >
          E
        </text>
      </svg>
      <div>
        <div style={{
          fontSize: 14,
          fontWeight: 900,
          color: "white",
          textTransform: "uppercase",
          letterSpacing: "3px",
          lineHeight: 1,
        }}>
          ELEVATE
        </div>
        <div style={{
          fontSize: 7,
          color: "#39FF14",
          textTransform: "uppercase",
          letterSpacing: "3px",
          lineHeight: 1,
          marginTop: 2,
        }}>
          SPORTS
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE: Pantalla de exito
// ─────────────────────────────────────────────────────────────────────────────

function SuccessScreen({ selectedOption, athleteName }) {
  const opt = RSVP_OPTIONS.find(o => o.value === selectedOption) || RSVP_OPTIONS[0];

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      style={{ textAlign: "center", padding: "8px 0" }}
    >
      {/* Check animado */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.1 }}
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: opt.bg,
          border: `2px solid ${opt.color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          fontSize: 32,
          color: opt.color,
          boxShadow: `0 0 32px ${opt.glow}`,
        }}
      >
        {opt.icon}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div style={{
          fontSize: 18,
          fontWeight: 900,
          color: "white",
          textTransform: "uppercase",
          letterSpacing: "-0.3px",
          marginBottom: 8,
        }}>
          Respuesta registrada
        </div>
        <div style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.55)",
          lineHeight: 1.6,
          marginBottom: 4,
        }}>
          {athleteName && (
            <span style={{ color: opt.color, fontWeight: 700 }}>{athleteName}</span>
          )}
          {athleteName ? " — " : ""}
          {opt.label}
        </div>
        <div style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginTop: 12,
        }}>
          Puedes cerrar esta ventana
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @component ConfirmarAsistencia
 * Pagina publica — no requiere autenticacion.
 * Acceso via: /confirmar/:clubId/:eventId
 */
export default function ConfirmarAsistencia() {
  const { clubId, eventId } = useParams();
  const { eventData } = useEventData(clubId, eventId);

  const [athleteName, setAthleteName] = useState("");
  const [nameError, setNameError] = useState("");
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [hoveredOption, setHoveredOption] = useState(null);

  // Titulo del evento: del fetch de Supabase o decodificado del URL
  const eventTitle = eventData?.title || decodeEventTitle(eventId || "Evento");
  const eventDate  = eventData?.date  || null;
  const eventLoc   = eventData?.location || null;

  /**
   * Valida el nombre del deportista antes de enviar.
   * @returns {boolean}
   */
  const validateName = useCallback(() => {
    const trimmed = athleteName.trim();
    if (!trimmed) {
      setNameError("Escribe tu nombre para continuar");
      return false;
    }
    if (trimmed.length < 2) {
      setNameError("El nombre debe tener al menos 2 caracteres");
      return false;
    }
    if (trimmed.length > 80) {
      setNameError("El nombre no puede superar 80 caracteres");
      return false;
    }
    setNameError("");
    return true;
  }, [athleteName]);

  /**
   * Envia el RSVP a Supabase.
   * Usa INSERT con ON CONFLICT DO UPDATE (upsert semantics via RLS policy).
   * @param {"confirmed"|"absent"|"maybe"} rsvpStatus
   */
  const handleSubmit = useCallback(async (rsvpStatus) => {
    if (!validateName()) return;
    if (status === STATUS.SUBMITTING) return;

    setSelectedOption(rsvpStatus);
    setStatus(STATUS.SUBMITTING);
    setErrorMsg("");

    const trimmedName = athleteName.trim();

    // Modo sin Supabase: simulacion local para demo
    if (!isSupabaseReady) {
      await new Promise(r => setTimeout(r, 800));
      setStatus(STATUS.SUCCESS);
      return;
    }

    try {
      const { error } = await supabase
        .from("event_rsvp")
        .upsert(
          {
            club_id:      clubId,
            event_id:     eventId,
            athlete_name: trimmedName,
            status:       rsvpStatus,
            responded_at: new Date().toISOString(),
          },
          {
            onConflict: "club_id,event_id,athlete_name",
            ignoreDuplicates: false,
          }
        );

      if (error) {
        throw error;
      }

      setStatus(STATUS.SUCCESS);
    } catch (err) {
      console.error("[ConfirmarAsistencia] RSVP error:", err);
      setErrorMsg("No se pudo registrar la respuesta. Intenta de nuevo.");
      setStatus(STATUS.ERROR);
    }
  }, [athleteName, clubId, eventId, status, validateName]);

  const handleRetry = useCallback(() => {
    setStatus(STATUS.IDLE);
    setErrorMsg("");
    setSelectedOption(null);
  }, []);

  // ── Render ──

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#050a14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Fondo con gradiente sutil */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(57,255,20,0.04) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(139,92,246,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Card principal */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(57,255,20,0.06)",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Borde top neon */}
        <div style={{
          height: 3,
          background: "linear-gradient(90deg, transparent, #39FF14, transparent)",
          opacity: 0.6,
        }} />

        <div style={{ padding: "28px 28px 32px" }}>

          {/* Logo */}
          <ElevateLogo />

          {/* Divisor */}
          <div style={{
            height: 1,
            background: "rgba(255,255,255,0.07)",
            margin: "20px 0",
          }} />

          <AnimatePresence mode="wait">
            {status === STATUS.SUCCESS ? (
              <SuccessScreen
                key="success"
                selectedOption={selectedOption}
                athleteName={athleteName.trim()}
              />
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Etiqueta */}
                <div style={{
                  fontSize: 9,
                  textTransform: "uppercase",
                  letterSpacing: "2.5px",
                  color: "#39FF14",
                  marginBottom: 8,
                  fontWeight: 700,
                }}>
                  Confirmacion de asistencia
                </div>

                {/* Nombre del evento */}
                <div style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "white",
                  textTransform: "uppercase",
                  letterSpacing: "-0.4px",
                  lineHeight: 1.2,
                  marginBottom: 12,
                  wordBreak: "break-word",
                }}>
                  {eventTitle}
                </div>

                {/* Fecha y lugar si disponibles */}
                {(eventDate || eventLoc) && (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    marginBottom: 20,
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}>
                    {eventDate && (
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                        Fecha: <span style={{ color: "white", fontWeight: 600 }}>{eventDate}</span>
                      </div>
                    )}
                    {eventLoc && (
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                        Lugar: <span style={{ color: "white", fontWeight: 600 }}>{eventLoc}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Campo nombre */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{
                    display: "block",
                    fontSize: 9,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    color: "rgba(255,255,255,0.45)",
                    marginBottom: 8,
                    fontWeight: 700,
                  }}>
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    value={athleteName}
                    onChange={e => { setAthleteName(e.target.value); if (nameError) setNameError(""); }}
                    placeholder="Escribe tu nombre completo"
                    maxLength={80}
                    autoComplete="name"
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${nameError ? "#E24B4A" : "rgba(255,255,255,0.12)"}`,
                      borderRadius: 8,
                      color: "white",
                      fontSize: 14,
                      fontFamily: "inherit",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 150ms, box-shadow 150ms",
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = "#39FF14";
                      e.target.style.boxShadow = "0 0 0 2px rgba(57,255,20,0.18)";
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = nameError ? "#E24B4A" : "rgba(255,255,255,0.12)";
                      e.target.style.boxShadow = "none";
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter" && athleteName.trim()) {
                        // No auto-seleccionar opcion, solo remover error
                        validateName();
                      }
                    }}
                  />
                  <AnimatePresence>
                    {nameError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        style={{ fontSize: 10, color: "#E24B4A", marginTop: 6 }}
                      >
                        {nameError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Instruccion */}
                <div style={{
                  fontSize: 9,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color: "rgba(255,255,255,0.3)",
                  marginBottom: 12,
                  fontWeight: 700,
                }}>
                  Selecciona tu respuesta
                </div>

                {/* Botones RSVP */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {RSVP_OPTIONS.map((opt, i) => {
                    const isHovered = hoveredOption === opt.value;
                    const isLoading = status === STATUS.SUBMITTING && selectedOption === opt.value;
                    const isDisabled = status === STATUS.SUBMITTING;

                    return (
                      <motion.button
                        key={opt.value}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07, type: "spring", stiffness: 350, damping: 28 }}
                        onClick={() => handleSubmit(opt.value)}
                        onMouseEnter={() => setHoveredOption(opt.value)}
                        onMouseLeave={() => setHoveredOption(null)}
                        disabled={isDisabled}
                        style={{
                          width: "100%",
                          minHeight: 60,
                          padding: "0 20px",
                          background: isHovered && !isDisabled ? opt.hoverBg : opt.bg,
                          border: `1px solid ${isHovered && !isDisabled ? opt.hoverBorder : opt.border}`,
                          borderRadius: 10,
                          color: opt.color,
                          fontSize: 13,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 12,
                          transition: "background 150ms, border-color 150ms, box-shadow 150ms, transform 100ms",
                          boxShadow: isHovered && !isDisabled ? `0 0 20px ${opt.glow}` : "none",
                          transform: isHovered && !isDisabled ? "translateY(-1px)" : "none",
                          opacity: isDisabled && !isLoading ? 0.5 : 1,
                          fontFamily: "inherit",
                        }}
                      >
                        {isLoading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                              style={{
                                width: 18,
                                height: 18,
                                border: `2px solid ${opt.color}44`,
                                borderTopColor: opt.color,
                                borderRadius: "50%",
                              }}
                            />
                            Registrando...
                          </>
                        ) : (
                          <>
                            <span style={{ fontSize: 18, lineHeight: 1 }}>{opt.icon}</span>
                            {opt.label}
                          </>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Error de envio */}
                <AnimatePresence>
                  {status === STATUS.ERROR && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        marginTop: 16,
                        padding: "12px 16px",
                        background: "rgba(226,75,74,0.12)",
                        border: "1px solid rgba(226,75,74,0.4)",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <span style={{ fontSize: 11, color: "#E24B4A" }}>{errorMsg}</span>
                      <button
                        onClick={handleRetry}
                        style={{
                          background: "none",
                          border: "1px solid rgba(226,75,74,0.5)",
                          borderRadius: 4,
                          color: "#E24B4A",
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          padding: "4px 10px",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Reintentar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer */}
      <div style={{
        marginTop: 24,
        fontSize: 9,
        color: "rgba(255,255,255,0.2)",
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: "1.5px",
        position: "relative",
        zIndex: 1,
      }}>
        Elevate Sports — Sistema de Gestion Deportiva
      </div>

      {/* Spinner global CSS */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        ::placeholder { color: rgba(255,255,255,0.2); }
        body { margin: 0; }
      `}</style>
    </div>
  );
}
