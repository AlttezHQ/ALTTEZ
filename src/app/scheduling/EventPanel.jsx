/**
 * @component EventPanel
 * @description Panel lateral de evento seleccionado con RSVP, disponibilidad y WhatsApp reminder.
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PALETTE as C } from "../../shared/tokens/palette";
import GlassPanel from "../../shared/ui/GlassPanel";
import Badge from "../../shared/ui/Badge";
import { supabase, isSupabaseReady } from "../../shared/lib/supabase";
import { showToast } from "../../shared/ui/Toast";
import { EVENT_TYPES, RSVP_STATES, fmtTime, fmtDateLong } from "./calendarConstants";

// ── Widget de disponibilidad ────────────────────────────────────────────────
function AvailabilityWidget({ availability }) {
  const { confirmados, ausentes, dudas, pendientes, total } = availability;
  const pct = total > 0 ? Math.round((confirmados / total) * 100) : 0;

  return (
    <div style={{ background: "rgba(0,0,0,0.45)", border: `1px solid ${C.border}`, borderRadius: 6, padding: "12px 16px", marginBottom: 12 }}>
      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "2px", color: C.textMuted, marginBottom: 10 }}>
        Disponibilidad
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.07)", marginBottom: 10, borderRadius: 3, overflow: "hidden", position: "relative" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          style={{ height: "100%", background: `linear-gradient(90deg, ${C.neon}cc, ${C.neon})`, boxShadow: `0 0 10px ${C.neon}88`, borderRadius: 3 }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: C.neon, lineHeight: 1 }}>{confirmados}</span>
        <span style={{ fontSize: 12, color: C.textMuted }}>de {total} confirmados</span>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {[
          { label: "Confirm.", val: confirmados, color: C.neon },
          { label: "Ausentes", val: ausentes,    color: C.danger },
          { label: "Duda",     val: dudas,       color: C.amber },
          { label: "Pendiente",val: pendientes,  color: C.textMuted },
        ].map(({ label, val, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 24 }}
            style={{ textAlign: "center", flex: 1 }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.4px", color: C.textHint, marginTop: 2 }}>{label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Fila de atleta + RSVP toggle ────────────────────────────────────────────
function AthleteRsvpRow({ athlete, currentState, onChangeState }) {
  const stateDef = RSVP_STATES[currentState] || RSVP_STATES.PENDIENTE;

  const cycle = useCallback(() => {
    const order = ["CONFIRMADO", "DUDA", "AUSENTE", "PENDIENTE"];
    const idx = order.indexOf(currentState);
    const next = order[(idx + 1) % order.length];
    onChangeState(next);
  }, [currentState, onChangeState]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "7px 0",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <div style={{
          width: 26, height: 26, borderRadius: "50%",
          background: stateDef.bg,
          border: `1px solid ${stateDef.color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 700, color: stateDef.color,
          flexShrink: 0,
        }}>
          {(athlete.nombre || "?")[0]?.toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {athlete.nombre || "Deportista"}
          </div>
          <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {athlete.posicion || "—"}
          </div>
        </div>
      </div>
      <button
        onClick={cycle}
        title={`Click para cambiar estado (actual: ${stateDef.label})`}
        className="cal-rsvp-btn"
        style={{
          background: stateDef.bg,
          border: `1px solid ${stateDef.color}55`,
          color: stateDef.color,
          fontSize: 9, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.5px",
          flexShrink: 0,
          borderRadius: 4,
          boxShadow: `0 0 6px ${stateDef.color}22`,
        }}
      >
        <span style={{ fontSize: 12 }}>{stateDef.icon}</span>
        {stateDef.label}
      </button>
    </motion.div>
  );
}

// ── Panel vacío ──────────────────────────────────────────────────────────────
export function PanelEmpty() {
  return (
    <motion.div
      className="cal-event-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        background: "rgba(10,10,18,0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 240,
        padding: 24,
        textAlign: "center",
      }}
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 16, opacity: 0.3 }}>
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="white" strokeWidth="1.5"/>
        <path d="M3 10h18M8 2v4M16 2v4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
        Selecciona un evento
      </div>
      <div style={{ fontSize: 10, color: C.textHint, lineHeight: 1.5 }}>
        Selecciona cualquier evento para gestionar la convocatoria, registrar disponibilidad y enviar recordatorios al plantel.
      </div>
    </motion.div>
  );
}

// ── Panel principal ──────────────────────────────────────────────────────────
export default function EventPanel({ event, athletes, getRsvp, setRsvp, getAvailability, onClose, clubId = "" }) {
  const def = EVENT_TYPES[event.type];
  const athleteIds = athletes.map(a => a.id ?? `ath-${athletes.indexOf(a)}`);

  const [remoteRsvp, setRemoteRsvp] = useState([]);

  useEffect(() => {
    if (!isSupabaseReady || !clubId || !event.id) return;
    let cancelled = false;
    supabase
      .from("event_rsvp")
      .select("athlete_name, status, responded_at")
      .eq("club_id", clubId)
      .eq("event_id", event.id)
      .order("responded_at", { ascending: false })
      .then(({ data, error }) => {
        if (!cancelled && !error && data) setRemoteRsvp(data);
      });
    return () => { cancelled = true; };
  }, [clubId, event.id]);

  const convocadoIds = event.convocados
    ? athleteIds.slice(0, event.convocados)
    : athleteIds;
  const convocadoAvail = getAvailability(event.id, convocadoIds);

  const handleReminder = () => {
    const fecha     = fmtDateLong(event.datetime);
    const hora      = fmtTime(event.datetime);
    const titulo    = event.title;
    const ubicacion = event.location || "Por confirmar";

    const effectiveClubId = clubId || "demo";
    const encodedEventId  = encodeURIComponent(event.id);
    const confirmLink = `https://alttez.co/confirmar /* TODO: update to ALTTEZ production domain *//${effectiveClubId}/${encodedEventId}`;

    let mensajeTexto;
    if (event.type === "match") {
      mensajeTexto = `*CONVOCATORIA OFICIAL*\n*${titulo}*\n---\nFecha: ${fecha}\nHora: ${hora} hrs\nLugar: ${ubicacion}\n---\nConfirma tu disponibilidad a la brevedad.\n\nConfirma aqui: ${confirmLink}\n\n_Cuerpo Tecnico - ${titulo}_`;
    } else if (event.type === "training") {
      mensajeTexto = `*SESION DE ENTRENAMIENTO*\n*${titulo}*\n---\nFecha: ${fecha}\nHora: ${hora} hrs\nLugar: ${ubicacion}\n---\nConfirma tu asistencia.\n\nConfirma aqui: ${confirmLink}\n\n_Cuerpo Tecnico - ${titulo}_`;
    } else {
      mensajeTexto = `*EVENTO INSTITUCIONAL*\n*${titulo}*\n---\nFecha: ${fecha}\nHora: ${hora} hrs\nLugar: ${ubicacion}\n---\nSe espera tu participacion.\n\nConfirma aqui: ${confirmLink}\n\n_${titulo} - ALTTEZ_`;
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(mensajeTexto)}`, "_blank", "noopener,noreferrer");
    showToast("Link de WhatsApp abierto", "success");
  };

  return (
    <motion.div
      key={event.id}
      className="cal-event-panel"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ type: "spring", stiffness: 340, damping: 30 }}
      style={{
        background: "rgba(10,10,18,0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${def.border}`,
        borderTop: `3px solid ${def.color}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${def.color}11`,
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        minHeight: 320,
        maxHeight: "calc(100vh - 80px)",
        position: "sticky",
        top: 12,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <Badge color={def.color} variant="solid" size="xs" style={{ marginBottom: 6 }}>
              {def.label}
            </Badge>
            <div style={{ fontSize: 14, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              {event.title}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 2, flexShrink: 0 }}
          >
            ×
          </button>
        </div>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 10, color: C.textMuted, textTransform: "capitalize" }}>
            {fmtDateLong(event.datetime)} · {fmtTime(event.datetime)}
          </div>
          {event.location && (
            <div style={{ fontSize: 10, color: C.textMuted }}>
              Lugar: <span style={{ color: "rgba(255,255,255,0.6)" }}>{event.location}</span>
            </div>
          )}
          {event.rival && (
            <div style={{ fontSize: 10, color: C.textMuted }}>
              Rival: <span style={{ color: def.color, fontWeight: 700 }}>{event.rival}</span>
              {" "}<span style={{ color: C.textHint }}>({event.esLocal ? "Local" : "Visitante"})</span>
            </div>
          )}
        </div>
      </div>

      {/* Disponibilidad */}
      <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
        <AvailabilityWidget availability={convocadoAvail} />
      </div>

      {/* Botón WhatsApp */}
      <div style={{ padding: "0 16px 12px", flexShrink: 0 }}>
        <button
          onClick={handleReminder}
          className="cal-reminder-btn"
          style={{
            background: "transparent",
            border: "1px solid rgba(37,211,102,0.5)",
            color: C.whatsapp,
            fontSize: 9, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "1.5px",
            borderRadius: 4, gap: 8,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,211,102,0.1)"; e.currentTarget.style.borderColor = C.whatsapp; e.currentTarget.style.boxShadow = "0 0 12px rgba(37,211,102,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(37,211,102,0.5)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={C.whatsapp} style={{ flexShrink: 0 }}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Recordar por WhatsApp
        </button>
      </div>

      {/* Lista de deportistas */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "2px", color: C.textMuted, marginBottom: 8 }}>
          Deportistas ({convocadoIds.length})
        </div>
        {convocadoIds.length === 0 ? (
          <div style={{ fontSize: 11, color: C.textHint, textAlign: "center", padding: "20px 0" }}>
            La plantilla esta vacia. Incorpora deportistas al sistema para activar el RSVP.
          </div>
        ) : (
          athletes
            .filter(a => convocadoIds.includes(a.id ?? `ath-${athletes.indexOf(a)}`))
            .map(athlete => {
              const aid = athlete.id || athlete.nombre;
              return (
                <AthleteRsvpRow
                  key={aid}
                  athlete={athlete}
                  currentState={getRsvp(event.id, aid)}
                  onChangeState={(state) => setRsvp(event.id, aid, state)}
                />
              );
            })
        )}

        {/* Confirmaciones remotas via link */}
        {remoteRsvp.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{
              fontSize: 9, textTransform: "uppercase", letterSpacing: "2px", color: C.textMuted,
              marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
            }}>
              Confirmaciones via link
              <span style={{ fontSize: 8, fontWeight: 700, color: "#39FF14", background: "rgba(57,255,20,0.12)", border: "1px solid rgba(57,255,20,0.3)", borderRadius: 3, padding: "1px 5px" }}>
                {remoteRsvp.length}
              </span>
            </div>
            {remoteRsvp.map((r, i) => {
              const colorMap = { confirmed: "#39FF14", absent: C.danger, maybe: C.amber };
              const labelMap = { confirmed: "Confirmo", absent: "No puede", maybe: "Duda" };
              const iconMap  = { confirmed: "✓", absent: "✗", maybe: "~" };
              const color = colorMap[r.status] || C.textMuted;
              return (
                <motion.div
                  key={`remote-${i}`}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "6px 0", borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: `${color}18`, border: `1px solid ${color}55`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700, color, flexShrink: 0,
                    }}>
                      {iconMap[r.status] || "?"}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "white" }}>{r.athlete_name}</span>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color }}>
                    {labelMap[r.status] || r.status}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
