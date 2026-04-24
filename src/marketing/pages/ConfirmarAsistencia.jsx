import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, isSupabaseReady } from "../../shared/lib/supabase";
import { MARKETING_BRAND as B, MARKETING_GRADIENTS as G, MARKETING_FONTS as F } from "../theme/brand";

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
    short: "Confirmado",
    color: B.primary,
    soft: B.primarySoft,
    border: B.primaryGlow,
  },
  {
    value: "absent",
    label: "No puedo asistir",
    short: "Ausente",
    color: B.danger,
    soft: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.28)",
  },
  {
    value: "maybe",
    label: "Tengo dudas",
    short: "Por confirmar",
    color: B.warning,
    soft: B.primarySoft,
    border: B.border,
  },
];

function decodeEventTitle(eventId) {
  return decodeURIComponent(eventId).replace(/-/g, " ");
}

function useEventData(clubId, eventId) {
  const eventData = null;
  const loading = false;

  {
    void clubId;
    void eventId;
    void loading;
  }

  return { eventData, loading };
}

function BrandLockup() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 18,
          background: `linear-gradient(135deg, ${B.primarySoft} 0%, ${B.primaryGlow} 100%)`,
          border: `1px solid ${B.borderStrong}`,
          display: "grid",
          placeItems: "center",
          color: B.primary,
          fontWeight: 800,
          fontSize: 18,
        }}
      >
        A
      </div>
      <div>
        <div style={{ color: B.text, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", fontSize: 15 }}>ALTTEZ</div>
        <div style={{ color: B.textHint, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", marginTop: 2 }}>
          Confirmacion publica
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({ selectedOption, athleteName }) {
  const option = RSVP_OPTIONS.find((item) => item.value === selectedOption) || RSVP_OPTIONS[0];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center" }}>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 26,
          margin: "0 auto",
          display: "grid",
          placeItems: "center",
          background: option.soft,
          border: `1px solid ${option.border}`,
          color: option.color,
          fontSize: 30,
          fontWeight: 800,
          boxShadow: `0 18px 40px ${option.soft}`,
        }}
      >
        ✓
      </div>
      <div style={{ marginTop: 22, fontSize: 13, color: B.warning, textTransform: "uppercase", letterSpacing: "0.22em", fontWeight: 700 }}>
        Respuesta registrada
      </div>
      <h2 style={{ margin: "14px 0 12px", fontSize: 32, lineHeight: 1.02, fontFamily: F.display }}>
        {athleteName ? athleteName : "Tu respuesta"} quedo como {option.short.toLowerCase()}.
      </h2>
      <p style={{ color: B.textMuted, lineHeight: 1.75, margin: 0 }}>
        Ya puedes cerrar esta ventana. El staff recibira tu estado actualizado dentro del flujo operativo del evento.
      </p>
    </motion.div>
  );
}

export default function ConfirmarAsistencia() {
  const { clubId, eventId } = useParams();
  const { eventData } = useEventData(clubId, eventId);

  const [athleteName, setAthleteName] = useState("");
  const [nameError, setNameError] = useState("");
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);

  const eventTitle = eventData?.title || decodeEventTitle(eventId || "Evento");
  const eventDate = eventData?.date || null;
  const eventLoc = eventData?.location || null;

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

  const handleSubmit = useCallback(
    async (rsvpStatus) => {
      if (!validateName()) return;
      if (status === STATUS.SUBMITTING) return;

      setSelectedOption(rsvpStatus);
      setStatus(STATUS.SUBMITTING);
      setErrorMsg("");

      const trimmedName = athleteName.trim();

      if (!isSupabaseReady) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setStatus(STATUS.SUCCESS);
        return;
      }

      try {
        const { error } = await supabase.rpc("submit_rsvp", {
          p_club_id:  clubId,
          p_event_id: eventId,
          p_name:     trimmedName,
          p_status:   rsvpStatus,
        });

        if (error) throw error;

        setStatus(STATUS.SUCCESS);
      } catch (err) {
        console.error("[ConfirmarAsistencia] RSVP error:", err);
        setErrorMsg("No pudimos registrar tu respuesta. Intenta de nuevo.");
        setStatus(STATUS.ERROR);
      }
    },
    [athleteName, clubId, eventId, status, validateName],
  );

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: G.hero,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            `radial-gradient(circle at 50% 12%, ${B.primaryGlow} 0%, transparent 34%), radial-gradient(circle at 80% 82%, ${B.primarySoft} 0%, transparent 22%)`,
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: "100%",
          maxWidth: 460,
          position: "relative",
          zIndex: 1,
          padding: 28,
          borderRadius: 30,
          background: G.panel,
          border: `1px solid ${B.borderStrong}`,
          boxShadow: "0 32px 90px rgba(0,0,0,0.46)",
        }}
      >
        <BrandLockup />

        <div style={{ height: 1, background: B.border, margin: "22px 0" }} />

        <AnimatePresence mode="wait">
          {status === STATUS.SUCCESS ? (
            <SuccessScreen key="success" selectedOption={selectedOption} athleteName={athleteName.trim()} />
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ fontSize: 11, color: B.warning, textTransform: "uppercase", letterSpacing: "0.22em", fontWeight: 700 }}>
                Confirmacion de asistencia
              </div>
              <h1
                style={{
                  margin: "14px 0 14px",
                  fontSize: 34,
                  lineHeight: 1.02,
                  fontFamily: F.display,
                  wordBreak: "break-word",
                }}
              >
                {eventTitle}
              </h1>

              {(eventDate || eventLoc) ? (
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.025)",
                    border: `1px solid ${B.border}`,
                    display: "grid",
                    gap: 6,
                    marginBottom: 18,
                  }}
                >
                  {eventDate ? <div style={{ color: B.textMuted, fontSize: 14 }}>Fecha: <span style={{ color: B.text }}>{eventDate}</span></div> : null}
                  {eventLoc ? <div style={{ color: B.textMuted, fontSize: 14 }}>Lugar: <span style={{ color: B.text }}>{eventLoc}</span></div> : null}
                </div>
              ) : null}

              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    color: nameError ? B.danger : B.textHint,
                    fontWeight: 700,
                  }}
                >
                  Tu nombre
                </label>
                <input
                  value={athleteName}
                  onChange={(event) => {
                    setAthleteName(event.target.value);
                    if (nameError) setNameError("");
                  }}
                  placeholder="Escribe tu nombre completo"
                  maxLength={80}
                  autoComplete="name"
                  style={{
                    width: "100%",
                    padding: "15px 16px",
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${nameError ? B.danger : B.border}`,
                    color: B.text,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {nameError ? <div style={{ marginTop: 8, fontSize: 12, color: B.danger }}>{nameError}</div> : null}
              </div>

              <div style={{ fontSize: 11, color: B.textHint, textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, marginBottom: 12 }}>
                Selecciona una respuesta
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {RSVP_OPTIONS.map((option, index) => {
                  const isLoading = status === STATUS.SUBMITTING && selectedOption === option.value;
                  return (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.42, delay: index * 0.05 }}
                      onClick={() => handleSubmit(option.value)}
                      disabled={status === STATUS.SUBMITTING}
                      style={{
                        minHeight: 58,
                        padding: "0 18px",
                        borderRadius: 18,
                        border: `1px solid ${option.border}`,
                        background: option.soft,
                        color: option.color,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        boxShadow: `0 10px 24px ${option.soft}`,
                        opacity: status === STATUS.SUBMITTING && !isLoading ? 0.5 : 1,
                      }}
                    >
                      {isLoading ? "Registrando..." : option.label}
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {status === STATUS.ERROR ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      marginTop: 16,
                      padding: "14px 16px",
                      borderRadius: 18,
                      background: "rgba(248,113,113,0.12)",
                      border: `1px solid rgba(248,113,113,0.24)`,
                      color: B.danger,
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    {errorMsg}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
