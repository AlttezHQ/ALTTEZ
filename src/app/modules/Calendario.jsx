/**
 * @component Calendario
 * @description Competition Planner + RSVP Engine unificado.
 *
 * Módulos integrados:
 *  - Vista de calendario mensual custom (sin FullCalendar — bundle ligero)
 *  - Diferenciación visual por tipo de evento: entrenamiento / partido / club
 *  - Panel lateral de evento seleccionado con lista de deportistas + estados RSVP
 *  - Widget de disponibilidad en tiempo real ("18 confirmados de 22 convocados")
 *  - Botón "Recordar por WhatsApp" — abre wa.me con mensaje pre-armado
 *  - Modal de creación de eventos con persistencia en localStorage
 *  - Navegación prev/next mes
 *  - Bloqueo de RPE para inasistencia confirmada (expuesto via localStorage)
 *  - Responsive mobile: panel cae debajo del grid en viewport < 768px
 *
 * @persistencia localStorage namespace `alttez_rsvp_{clubId}` / `alttez_events_{clubId}`
 * @version 2.0
 * @author @Arquitecto Carlos / @Andres UI
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PALETTE as C } from "../../shared/tokens/palette";
import { showToast } from "../../shared/ui/Toast";
import { supabase, isSupabaseReady } from "../../shared/lib/supabase";
import { useStore } from "../../shared/store/useStore";

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVE CSS — inyectado una sola vez en el DOM
// ─────────────────────────────────────────────────────────────────────────────
if (typeof document !== "undefined" && !document.getElementById("cal-responsive")) {
  const s = document.createElement("style");
  s.id = "cal-responsive";
  s.textContent = `
    .cal-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 12px;
      padding: 12px;
      min-height: calc(100vh - 38px);
      box-sizing: border-box;
      align-items: start;
    }
    @media (max-width: 900px) {
      .cal-layout {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto;
      }
    }
    @media (max-width: 479px) {
      .cal-layout { padding: 6px; gap: 6px; }
      .cal-day-cell { min-height: 52px !important; padding: 3px !important; }
      .cal-event-badge { font-size: 7px !important; padding: 1px 4px !important; }
      .cal-header-label { font-size: 10px !important; }
    }
    .cal-day-cell:hover .cal-day-hover-ring {
      opacity: 1;
    }
    .cal-rsvp-btn {
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 6px 10px;
      cursor: pointer;
      transition: background 150ms, border-color 150ms;
      box-sizing: border-box;
    }
    .cal-reminder-btn {
      min-height: 44px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 150ms, border-color 150ms, box-shadow 150ms;
      box-sizing: border-box;
    }
    /* On mobile, the panel must not collapse — enforce a visible min-height */
    @media (max-width: 900px) {
      .cal-event-panel {
        min-height: 300px !important;
        position: static !important;
      }
    }
  `;
  document.head.appendChild(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES DE TIPO DE EVENTO
// ─────────────────────────────────────────────────────────────────────────────
const EVENT_TYPES = {
  training:    { label: "Entrenamiento",    color: C.purple,  colorDim: "rgba(127,119,221,0.18)", border: "rgba(127,119,221,0.5)" },
  match:       { label: "Partido oficial",  color: C.neon,    colorDim: "rgba(200,255,0,0.12)",   border: "rgba(200,255,0,0.45)"  },
  club:        { label: "Evento de club",   color: C.amber,   colorDim: "rgba(239,159,39,0.15)",  border: "rgba(239,159,39,0.45)" },
};

// ─────────────────────────────────────────────────────────────────────────────
// ESTADOS RSVP
// ─────────────────────────────────────────────────────────────────────────────
const RSVP_STATES = {
  PENDIENTE:    { label: "Pendiente",   color: "rgba(255,255,255,0.25)", bg: "rgba(255,255,255,0.05)", icon: "?" },
  CONFIRMADO:   { label: "Confirmado",  color: C.neon,                  bg: "rgba(200,255,0,0.12)",   icon: "✓" },
  AUSENTE:      { label: "Ausente",     color: C.danger,                bg: "rgba(226,75,74,0.12)",   icon: "✗" },
  DUDA:         { label: "Duda",        color: C.amber,                 bg: "rgba(239,159,39,0.12)",  icon: "~" },
};

// ─────────────────────────────────────────────────────────────────────────────
// GENERADOR DE EVENTOS DEMO para el mes actual y adyacentes
// Genera datos realistas sin necesitar backend.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Genera un array de eventos demo centrados en el mes dado.
 * @param {number} year
 * @param {number} month - 0-indexed
 * @returns {Array<EventDef>}
 */
function generateDemoEvents(year, month) {
  const d = (day, hour = 18, min = 0) => {
    const dt = new Date(year, month, day, hour, min);
    return dt.toISOString();
  };

  return [
    // Entrenamientos — martes y jueves habituales
    { id: `t-${year}-${month}-1`,  type: "training", title: "Entrenamiento físico",      datetime: d(2,  18, 0),  location: "Campo A",       convocados: null },
    { id: `t-${year}-${month}-2`,  type: "training", title: "Trabajo táctico",            datetime: d(4,  18, 0),  location: "Campo A",       convocados: null },
    { id: `t-${year}-${month}-3`,  type: "training", title: "Rondos y pressing",          datetime: d(9,  18, 0),  location: "Campo A",       convocados: null },
    { id: `t-${year}-${month}-4`,  type: "training", title: "Entrenamiento precompetición",datetime: d(11, 17, 30), location: "Campo B",       convocados: null },
    { id: `t-${year}-${month}-5`,  type: "training", title: "Recuperación activa",        datetime: d(16, 10, 0),  location: "Gimnasio",      convocados: null },
    { id: `t-${year}-${month}-6`,  type: "training", title: "Pautas tácticas jornada",    datetime: d(18, 18, 0),  location: "Campo A",       convocados: null },
    { id: `t-${year}-${month}-7`,  type: "training", title: "Ensayo de balón parado",     datetime: d(23, 18, 0),  location: "Campo A",       convocados: null },
    { id: `t-${year}-${month}-8`,  type: "training", title: "Entrenamiento técnico",      datetime: d(25, 18, 0),  location: "Campo B",       convocados: null },

    // Partidos oficiales
    { id: `m-${year}-${month}-1`,  type: "match",    title: "vs Atlético Sur",            datetime: d(7,  16, 0),  location: "Estadio Local", convocados: 22, rival: "Atlético Sur",  esLocal: true  },
    { id: `m-${year}-${month}-2`,  type: "match",    title: "vs Deportivo Norte",         datetime: d(14, 11, 0),  location: "Est. Norte",    convocados: 22, rival: "Dep. Norte",    esLocal: false },
    { id: `m-${year}-${month}-3`,  type: "match",    title: "vs Unión FC",                datetime: d(21, 16, 30), location: "Estadio Local", convocados: 22, rival: "Unión FC",      esLocal: true  },
    { id: `m-${year}-${month}-4`,  type: "match",    title: "vs Racing Club",             datetime: d(28, 17, 0),  location: "Estadio Racing",convocados: 22, rival: "Racing Club",   esLocal: false },

    // Eventos de club
    { id: `c-${year}-${month}-1`,  type: "club",     title: "Reunión de cuerpo técnico",  datetime: d(5,  10, 0),  location: "Sala de reuniones" },
    { id: `c-${year}-${month}-2`,  type: "club",     title: "Jornada de puertas abiertas",datetime: d(19, 10, 0),  location: "Campo A" },
  ].filter(ev => {
    const evDate = new Date(ev.datetime);
    return evDate.getMonth() === month && evDate.getFullYear() === year;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS DE CALENDARIO
// ─────────────────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

/**
 * Genera la grilla de días para un mes dado.
 * Lunes como primer día de la semana.
 * @returns {Array<{ date: Date|null, isCurrentMonth: boolean }>}
 */
function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  // getDay() 0=Sun..6=Sat — convertir a 0=Mon..6=Sun
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  // Días del mes anterior para rellenar
  for (let i = 0; i < startDow; i++) {
    const d = new Date(year, month, -startDow + i + 1);
    cells.push({ date: d, isCurrentMonth: false });
  }
  // Días del mes actual
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }
  // Rellenar hasta 42 celdas (6 semanas)
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    cells.push({ date: next, isCurrentMonth: false });
  }
  return cells;
}

/** Formatea hora HH:MM desde un ISO string */
function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });
}

/** Formatea fecha larga */
function fmtDateLong(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
}

/** Compara si dos fechas son el mismo día */
function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate();
}

/** Compara si una fecha es hoy */
function isToday(d) {
  return isSameDay(d, new Date());
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK — EVENTOS PERSONALIZADOS PERSISTIDOS EN LOCALSTORAGE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gestiona eventos creados por el entrenador.
 * @param {string} clubId
 */
function useCustomEvents(clubId) {
  const storageKey = `alttez_events_${clubId || "demo"}`;

  const [customEvents, setCustomEvents] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const addEvent = useCallback((eventData) => {
    const newEvent = {
      ...eventData,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    setCustomEvents(prev => {
      const next = [...prev, newEvent];
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* quota */ }
      return next;
    });
    return newEvent;
  }, [storageKey]);

  return { customEvents, addEvent };
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK — RSVP STATE PERSISTIDO EN LOCALSTORAGE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Devuelve el estado RSVP de un evento y funciones para mutarlo.
 * Persiste en `alttez_rsvp_{clubId}`.
 * @param {string} clubId
 */
function useRsvp(clubId) {
  const storageKey = `alttez_rsvp_${clubId || "demo"}`;

  const [rsvpMap, setRsvpMap] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const persist = useCallback((next) => {
    setRsvpMap(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // quota exceeded — fail silently
    }
  }, [storageKey]);

  /**
   * Obtiene el estado RSVP de un atleta para un evento.
   * @returns {"PENDIENTE"|"CONFIRMADO"|"AUSENTE"|"DUDA"}
   */
  const getRsvp = useCallback((eventId, athleteId) => {
    return rsvpMap?.[eventId]?.[athleteId] || "PENDIENTE";
  }, [rsvpMap]);

  /**
   * Actualiza el estado RSVP de un atleta para un evento.
   */
  const setRsvp = useCallback((eventId, athleteId, state) => {
    const next = {
      ...rsvpMap,
      [eventId]: {
        ...(rsvpMap[eventId] || {}),
        [athleteId]: state,
      },
    };
    persist(next);

    // Publicar en localStorage para que Entrenamiento pueda leer el bloqueo RPE
    // Clave: `alttez_rsvp_absent_{clubId}_{eventId}_{athleteId}` = "1" | "0"
    const cid = clubId || "demo";
    const absentKey = `alttez_rsvp_absent_${cid}_${eventId}_${athleteId}`;
    localStorage.setItem(absentKey, state === "AUSENTE" ? "1" : "0");
  }, [rsvpMap, persist, clubId]);

  /**
   * Calcula el resumen de disponibilidad para un evento.
   * @returns {{ confirmados: number, ausentes: number, dudas: number, pendientes: number, total: number }}
   */
  const getAvailability = useCallback((eventId, athleteIds) => {
    const eventRsvp = rsvpMap[eventId] || {};
    let confirmados = 0, ausentes = 0, dudas = 0, pendientes = 0;
    for (const id of athleteIds) {
      const s = eventRsvp[id] || "PENDIENTE";
      if (s === "CONFIRMADO") confirmados++;
      else if (s === "AUSENTE") ausentes++;
      else if (s === "DUDA") dudas++;
      else pendientes++;
    }
    return { confirmados, ausentes, dudas, pendientes, total: athleteIds.length };
  }, [rsvpMap]);

  return { getRsvp, setRsvp, getAvailability };
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE: BADGE DE EVENTO EN EL GRID
// ─────────────────────────────────────────────────────────────────────────────

function EventBadge({ event, onClick, isSelected }) {
  const def = EVENT_TYPES[event.type];
  return (
    <div
      className="cal-event-badge"
      onClick={(e) => { e.stopPropagation(); onClick(event); }}
      style={{
        fontSize: 8,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        padding: "2px 6px",
        borderRadius: 3,
        background: isSelected ? def.color : def.colorDim,
        color: isSelected ? "#0a0a0a" : def.color,
        border: `1px solid ${def.border}`,
        cursor: "pointer",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "100%",
        transition: "background 150ms, color 150ms, box-shadow 150ms",
        boxShadow: isSelected ? `0 0 10px ${def.color}55, inset 0 1px 0 rgba(255,255,255,0.15)` : "none",
      }}
    >
      {event.title}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE: WIDGET DE DISPONIBILIDAD
// ─────────────────────────────────────────────────────────────────────────────

function AvailabilityWidget({ availability }) {
  const { confirmados, ausentes, dudas, pendientes, total } = availability;
  const pct = total > 0 ? Math.round((confirmados / total) * 100) : 0;

  return (
    <div style={{ background: "rgba(0,0,0,0.45)", border: `1px solid ${C.border}`, borderRadius: 6, padding: "12px 16px", marginBottom: 12 }}>
      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "2px", color: C.textMuted, marginBottom: 10 }}>
        Disponibilidad
      </div>

      {/* Barra de progreso */}
      <div style={{ height: 6, background: "rgba(255,255,255,0.07)", marginBottom: 10, borderRadius: 3, overflow: "hidden", position: "relative" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          style={{ height: "100%", background: `linear-gradient(90deg, ${C.neon}cc, ${C.neon})`, boxShadow: `0 0 10px ${C.neon}88`, borderRadius: 3 }}
        />
      </div>

      {/* Cifra principal */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: C.neon, lineHeight: 1 }}>{confirmados}</span>
        <span style={{ fontSize: 12, color: C.textMuted }}>de {total} confirmados</span>
      </div>

      {/* Desglose */}
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

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE: FILA DE ATLETA + RSVP TOGGLE
// ─────────────────────────────────────────────────────────────────────────────

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
      {/* Avatar + nombre */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <div style={{
          width: 26, height: 26, borderRadius: "50%",
          background: `${stateDef.bg}`,
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

      {/* Estado RSVP — click para ciclar */}
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

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE: PANEL LATERAL DE EVENTO SELECCIONADO
// ─────────────────────────────────────────────────────────────────────────────

function EventPanel({ event, athletes, getRsvp, setRsvp, getAvailability, onClose, clubId = "" }) {
  const def = EVENT_TYPES[event.type];
  const athleteIds = athletes.map(a => a.id ?? `ath-${athletes.indexOf(a)}`);

  // ── Respuestas remotas desde Supabase (deportistas que confirmaron via link) ──
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
        if (!cancelled && !error && data) {
          setRemoteRsvp(data);
        }
      });

    return () => { cancelled = true; };
  }, [clubId, event.id]);

  // Atletas convocados: para partido usa el número convocados (tomar primeros N)
  // Para entrenamiento y club: todos los atletas
  const convocadoIds = event.convocados
    ? athleteIds.slice(0, event.convocados)
    : athleteIds;

  const convocadoAvail = getAvailability(event.id, convocadoIds);

  const handleReminder = () => {
    const fecha     = fmtDateLong(event.datetime);
    const hora      = fmtTime(event.datetime);
    const titulo    = event.title;
    const ubicacion = event.location || "Por confirmar";

    // Link publico de confirmacion — el deportista confirma sin login
    const effectiveClubId = clubId || "demo";
    const encodedEventId  = encodeURIComponent(event.id);
    const confirmLink = `https://alttez.co/confirmar /* TODO: update to ALTTEZ production domain *//${effectiveClubId}/${encodedEventId}`;

    let mensajeTexto;

    if (event.type === "match") {
      mensajeTexto =
        `*CONVOCATORIA OFICIAL*\n` +
        `*${titulo}*\n` +
        `---\n` +
        `Fecha: ${fecha}\n` +
        `Hora: ${hora} hrs\n` +
        `Lugar: ${ubicacion}\n` +
        `---\n` +
        `Confirma tu disponibilidad a la brevedad. Tu respuesta es parte de la preparacion del equipo.\n\n` +
        `Confirma aqui: ${confirmLink}\n\n` +
        `_Cuerpo Tecnico - ${titulo}_`;
    } else if (event.type === "training") {
      mensajeTexto =
        `*SESION DE ENTRENAMIENTO*\n` +
        `*${titulo}*\n` +
        `---\n` +
        `Fecha: ${fecha}\n` +
        `Hora: ${hora} hrs\n` +
        `Lugar: ${ubicacion}\n` +
        `---\n` +
        `Confirma tu asistencia. La puntualidad y presencia son parte del rendimiento.\n\n` +
        `Confirma aqui: ${confirmLink}\n\n` +
        `_Cuerpo Tecnico - ${titulo}_`;
    } else {
      // club — institucional
      mensajeTexto =
        `*EVENTO INSTITUCIONAL*\n` +
        `*${titulo}*\n` +
        `---\n` +
        `Fecha: ${fecha}\n` +
        `Hora: ${hora} hrs\n` +
        `Lugar: ${ubicacion}\n` +
        `---\n` +
        `Se espera tu participacion. Confirma tu asistencia a la brevedad.\n\n` +
        `Confirma aqui: ${confirmLink}\n\n` +
        `_${titulo} - ALTTEZ_`;
    }

    const mensaje = encodeURIComponent(mensajeTexto);
    const url = `https://wa.me/?text=${mensaje}`;
    window.open(url, "_blank", "noopener,noreferrer");
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
      {/* Header del panel */}
      <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            {/* Tipo de evento */}
            <div style={{
              display: "inline-block",
              fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px",
              color: "#0a0a0a",
              background: def.color,
              padding: "2px 8px",
              borderRadius: 3,
              marginBottom: 6,
              boxShadow: `0 0 8px ${def.color}66`,
            }}>
              {def.label}
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              {event.title}
            </div>
          </div>
          {/* Cerrar panel */}
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 2, flexShrink: 0 }}
          >
            ×
          </button>
        </div>

        {/* Metadatos */}
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
              {" "}
              <span style={{ color: C.textHint }}>({event.esLocal ? "Local" : "Visitante"})</span>
            </div>
          )}
        </div>
      </div>

      {/* Widget de disponibilidad */}
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
            color: "#25D366",
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            borderRadius: 4,
            gap: 8,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,211,102,0.1)"; e.currentTarget.style.borderColor = "#25D366"; e.currentTarget.style.boxShadow = "0 0 12px rgba(37,211,102,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(37,211,102,0.5)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          {/* WhatsApp SVG */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366" style={{ flexShrink: 0 }}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Recordar por WhatsApp
        </button>
      </div>

      {/* Lista de deportistas + RSVP — scrollable */}
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

        {/* ── Respuestas remotas (confirmadas via link de WhatsApp) ── */}
        {remoteRsvp.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "2px",
              color: C.textMuted,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              Confirmaciones via link
              <span style={{
                fontSize: 8,
                fontWeight: 700,
                color: "#39FF14",
                background: "rgba(57,255,20,0.12)",
                border: "1px solid rgba(57,255,20,0.3)",
                borderRadius: 3,
                padding: "1px 5px",
              }}>
                {remoteRsvp.length}
              </span>
            </div>
            {remoteRsvp.map((r, i) => {
              const colorMap = { confirmed: "#39FF14", absent: "#E24B4A", maybe: "#EF9F27" };
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: `${color}18`,
                      border: `1px solid ${color}55`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color,
                      flexShrink: 0,
                    }}>
                      {iconMap[r.status] || "?"}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "white" }}>
                      {r.athlete_name}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 8,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color,
                  }}>
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

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE: EMPTY STATE (sin evento seleccionado)
// ─────────────────────────────────────────────────────────────────────────────

function PanelEmpty() {
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
      {/* Icono calendario */}
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

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE: MODAL DE CREACIÓN DE EVENTOS
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_ACCENTS = {
  match:    { color: "#c8ff00", border: "rgba(200,255,0,0.35)",    dim: "rgba(200,255,0,0.08)"   },
  training: { color: "#7F77DD", border: "rgba(127,119,221,0.35)",  dim: "rgba(127,119,221,0.08)" },
  club:     { color: "#EF9F27", border: "rgba(239,159,39,0.35)",   dim: "rgba(239,159,39,0.08)"  },
};

const EMPTY_FORM = {
  type: "training",
  title: "",
  date: "",
  time: "18:00",
  location: "",
  rival: "",
  esLocal: true,
  convocados: 22,
};

function CreateEventModal({ onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const accent = TYPE_ACCENTS[form.type];

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())  e.title = "El título es obligatorio";
    if (!form.date)          e.date  = "La fecha es obligatoria";
    if (!form.time)          e.time  = "La hora es obligatoria";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const [year, month, day] = form.date.split("-").map(Number);
    const [hour, minute]     = form.time.split(":").map(Number);
    const datetime = new Date(year, month - 1, day, hour, minute).toISOString();

    const eventData = {
      type:      form.type,
      title:     form.title.trim(),
      datetime,
      location:  form.location.trim() || null,
      convocados: form.type === "match" ? Number(form.convocados) : null,
      ...(form.type === "match" ? { rival: form.rival.trim() || null, esLocal: form.esLocal } : {}),
    };

    onSave(eventData);
    onClose();
  };

  // Shared input style
  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid rgba(255,255,255,0.1)`,
    borderRadius: 4,
    color: "white",
    fontSize: 12,
    padding: "8px 10px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 150ms",
    fontFamily: "inherit",
  };

  const labelStyle = {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: "1.2px",
    color: "rgba(255,255,255,0.4)",
    marginBottom: 4,
    display: "block",
  };

  const fieldStyle = { display: "flex", flexDirection: "column", gap: 4 };

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        key="create-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9000,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />
      {/* Modal */}
      <motion.div
        key="create-modal"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        style={{
          position: "fixed", inset: 0, zIndex: 9001,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
          pointerEvents: "none",
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            pointerEvents: "all",
            width: "100%",
            maxWidth: 440,
            maxHeight: "90vh",
            overflowY: "auto",
            background: "rgba(10,10,20,0.97)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: `1px solid ${accent.border}`,
            borderTop: `3px solid ${accent.color}`,
            borderRadius: 10,
            boxShadow: `0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px ${accent.color}11`,
          }}
        >
          {/* Header */}
          <div style={{
            padding: "16px 20px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "2px", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>
                Nuevo evento
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: "-0.3px" }}>
                Crear evento
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "2px 6px" }}
              aria-label="Cerrar modal"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Tipo de evento */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Tipo de evento</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { value: "match",    label: "Partido" },
                  { value: "training", label: "Entreno" },
                  { value: "club",     label: "Club" },
                ].map(opt => {
                  const a = TYPE_ACCENTS[opt.value];
                  const active = form.type === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => set("type", opt.value)}
                      style={{
                        padding: "9px 8px",
                        background: active ? a.dim : "rgba(255,255,255,0.03)",
                        border: `1px solid ${active ? a.border : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 5,
                        color: active ? a.color : "rgba(255,255,255,0.4)",
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        cursor: "pointer",
                        transition: "all 150ms",
                        boxShadow: active ? `0 0 12px ${a.color}22` : "none",
                        minHeight: 44,
                        fontFamily: "inherit",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Título */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Título</label>
              <input
                type="text"
                placeholder={form.type === "match" ? "vs Deportivo Norte" : "Entrenamiento físico"}
                value={form.title}
                onChange={e => set("title", e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: errors.title ? "#E24B4A" : "rgba(255,255,255,0.1)",
                }}
                onFocus={e => { e.target.style.borderColor = accent.color; e.target.style.boxShadow = `0 0 0 2px ${accent.color}22`; }}
                onBlur={e => { e.target.style.borderColor = errors.title ? "#E24B4A" : "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
              {errors.title && <span style={{ fontSize: 9, color: "#E24B4A" }}>{errors.title}</span>}
            </div>

            {/* Fecha + Hora */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Fecha</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => set("date", e.target.value)}
                  style={{
                    ...inputStyle,
                    colorScheme: "dark",
                    borderColor: errors.date ? "#E24B4A" : "rgba(255,255,255,0.1)",
                  }}
                  onFocus={e => { e.target.style.borderColor = accent.color; e.target.style.boxShadow = `0 0 0 2px ${accent.color}22`; }}
                  onBlur={e => { e.target.style.borderColor = errors.date ? "#E24B4A" : "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                />
                {errors.date && <span style={{ fontSize: 9, color: "#E24B4A" }}>{errors.date}</span>}
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Hora</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={e => set("time", e.target.value)}
                  style={{
                    ...inputStyle,
                    colorScheme: "dark",
                    borderColor: errors.time ? "#E24B4A" : "rgba(255,255,255,0.1)",
                  }}
                  onFocus={e => { e.target.style.borderColor = accent.color; e.target.style.boxShadow = `0 0 0 2px ${accent.color}22`; }}
                  onBlur={e => { e.target.style.borderColor = errors.time ? "#E24B4A" : "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                />
                {errors.time && <span style={{ fontSize: 9, color: "#E24B4A" }}>{errors.time}</span>}
              </div>
            </div>

            {/* Ubicación */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Ubicación</label>
              <input
                type="text"
                placeholder="Campo A, Estadio Local..."
                value={form.location}
                onChange={e => set("location", e.target.value)}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = accent.color; e.target.style.boxShadow = `0 0 0 2px ${accent.color}22`; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Campos extra para Partido */}
            <AnimatePresence>
              {form.type === "match" && (
                <motion.div
                  key="match-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {/* Rival */}
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Rival</label>
                    <input
                      type="text"
                      placeholder="Atlético Sur"
                      value={form.rival}
                      onChange={e => set("rival", e.target.value)}
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = "#c8ff00"; e.target.style.boxShadow = "0 0 0 2px rgba(200,255,0,0.12)"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>

                  {/* Localía + Convocados */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {/* Localía */}
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Localía</label>
                      <button
                        onClick={() => set("esLocal", !form.esLocal)}
                        style={{
                          ...inputStyle,
                          textAlign: "left",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          minHeight: 44,
                          borderColor: form.esLocal ? "rgba(200,255,0,0.35)" : "rgba(255,255,255,0.1)",
                          background: form.esLocal ? "rgba(200,255,0,0.06)" : "rgba(255,255,255,0.04)",
                        }}
                      >
                        <span style={{
                          width: 14, height: 14, borderRadius: 3,
                          border: `1.5px solid ${form.esLocal ? "#c8ff00" : "rgba(255,255,255,0.25)"}`,
                          background: form.esLocal ? "#c8ff00" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 150ms",
                        }}>
                          {form.esLocal && <span style={{ color: "#000", fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                        </span>
                        <span style={{ color: form.esLocal ? "#c8ff00" : "rgba(255,255,255,0.4)", fontSize: 11 }}>
                          {form.esLocal ? "Somos local" : "Visitante"}
                        </span>
                      </button>
                    </div>

                    {/* Convocados */}
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Convocados</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={form.convocados}
                        onChange={e => set("convocados", e.target.value)}
                        style={{ ...inputStyle, minHeight: 44 }}
                        onFocus={e => { e.target.style.borderColor = "#c8ff00"; e.target.style.boxShadow = "0 0 0 2px rgba(200,255,0,0.12)"; }}
                        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div style={{
            padding: "14px 20px 18px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            gap: 10,
          }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "11px 16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
                borderRadius: 5,
                cursor: "pointer",
                minHeight: 44,
                fontFamily: "inherit",
                transition: "background 150ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              style={{
                flex: 2,
                padding: "11px 16px",
                background: accent.dim,
                border: `1px solid ${accent.border}`,
                color: accent.color,
                fontSize: 10,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                borderRadius: 5,
                cursor: "pointer",
                minHeight: 44,
                fontFamily: "inherit",
                transition: "all 150ms",
                boxShadow: `0 0 12px ${accent.color}22`,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${accent.color}18`; e.currentTarget.style.boxShadow = `0 0 20px ${accent.color}44`; }}
              onMouseLeave={e => { e.currentTarget.style.background = accent.dim; e.currentTarget.style.boxShadow = `0 0 12px ${accent.color}22`; }}
            >
              Guardar evento
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL: CALENDARIO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @component Calendario
 * @param {Array}   athletes - Lista de deportistas del club (desde App state)
 * @param {string}  clubId   - ID del club (para namespacing de localStorage)
 */
export default function Calendario({ clubId = "" }) {
  const athletes = useStore(state => state.athletes);
  const today = new Date();
  const [year, setYear]         = useState(today.getFullYear());
  const [month, setMonth]       = useState(today.getMonth());
  const [selected, setSelected] = useState(null); // EventDef | null
  const [showCreate, setShowCreate] = useState(false);

  const { getRsvp, setRsvp, getAvailability } = useRsvp(clubId);
  const { customEvents, addEvent } = useCustomEvents(clubId);

  // Events shown: custom events if any exist, otherwise demo events for the month
  const demoEvents   = useMemo(() => generateDemoEvents(year, month), [year, month]);
  const hasCustom    = customEvents.length > 0;

  // Filter custom events to the visible month
  const filteredCustom = useMemo(() => customEvents.filter(ev => {
    const d = new Date(ev.datetime);
    return d.getFullYear() === year && d.getMonth() === month;
  }), [customEvents, year, month]);

  const events = hasCustom ? filteredCustom : demoEvents;

  // Grid de 42 celdas
  const grid = useMemo(() => buildCalendarGrid(year, month), [year, month]);

  // Índice: día -> eventos
  const eventsByDay = useMemo(() => {
    const map = {};
    for (const ev of events) {
      const d = new Date(ev.datetime);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    }
    return map;
  }, [events]);

  const prevMonth = useCallback(() => {
    setSelected(null);
    setMonth(m => {
      if (m === 0) { setYear(y => y - 1); return 11; }
      return m - 1;
    });
  }, [setYear]);

  const nextMonth = useCallback(() => {
    setSelected(null);
    setMonth(m => {
      if (m === 11) { setYear(y => y + 1); return 0; }
      return m + 1;
    });
  }, [setYear]);

  const selectedEvent = useMemo(
    () => (selected ? events.find(e => e.id === selected.id) ?? null : null),
    [events, selected]
  );

  const handleSelectEvent = useCallback((event) => {
    setSelected(prev => prev?.id === event.id ? null : event);
  }, []);

  const handleSaveEvent = useCallback((eventData) => {
    const saved = addEvent(eventData);
    showToast("Evento creado correctamente", "success");
    // Auto-select the newly created event
    setSelected(saved);
    // Navigate to the event's month if different
    const evDate = new Date(saved.datetime);
    setYear(evDate.getFullYear());
    setMonth(evDate.getMonth());
  }, [addEvent, setYear]);

  // Leyenda de tipos de evento
  const LEGEND = Object.entries(EVENT_TYPES).map(([, v]) => ({ label: v.label, color: v.color }));

  return (
    <div style={{ minHeight: "calc(100vh - 38px)", background: C.bg }}>

      {/* Modal de creación */}
      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onSave={handleSaveEvent}
        />
      )}

      {/* ── TOPBAR DEL MÓDULO ── */}
      <div style={{
        padding: "10px 16px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8,
        background: "rgba(10,10,18,0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>

        {/* Navegación de mes */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={prevMonth}
            style={{ background: "none", border: `1px solid ${C.border}`, color: C.textMuted, cursor: "pointer", padding: "4px 10px", fontSize: 12, transition: "border-color 150ms, color 150ms" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.neon; e.currentTarget.style.color = C.neon; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}
          >
            ‹
          </button>

          <motion.div
            key={`${year}-${month}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", alignItems: "baseline", gap: 8 }}
          >
            <span style={{ fontSize: 18, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: "-0.5px" }}>
              {MONTHS_ES[month]}
            </span>
            <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>
              {year}
            </span>
          </motion.div>

          <button
            onClick={nextMonth}
            style={{ background: "none", border: `1px solid ${C.border}`, color: C.textMuted, cursor: "pointer", padding: "4px 10px", fontSize: 12, transition: "border-color 150ms, color 150ms" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.neon; e.currentTarget.style.color = C.neon; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}
          >
            ›
          </button>

          {/* Botón "Hoy" */}
          <button
            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelected(null); }}
            style={{ background: "none", border: `1px solid ${C.neonBorder}`, color: C.neon, cursor: "pointer", padding: "4px 10px", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}
          >
            Hoy
          </button>
        </div>

        {/* Leyenda de tipos */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {LEGEND.map(({ label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, background: color, boxShadow: `0 0 4px ${color}` }} />
              <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.8px", color: C.textMuted }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Contador + botón crear */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>
            <span style={{ color: "white", fontWeight: 700 }}>{events.length}</span> eventos este mes
            {hasCustom && (
              <span style={{ marginLeft: 6, fontSize: 8, color: C.purple }}>(propios)</span>
            )}
          </div>

          {/* Botón Crear evento */}
          <motion.button
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setShowCreate(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 13px",
              background: "rgba(127,119,221,0.15)",
              border: "1px solid rgba(127,119,221,0.45)",
              borderRadius: 5,
              color: C.purple,
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              cursor: "pointer",
              minHeight: 34,
              boxShadow: "0 0 12px rgba(127,119,221,0.18)",
              fontFamily: "inherit",
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(127,119,221,0.25)"; e.currentTarget.style.boxShadow = "0 0 18px rgba(127,119,221,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(127,119,221,0.15)"; e.currentTarget.style.boxShadow = "0 0 12px rgba(127,119,221,0.18)"; }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <line x1="6" y1="1" x2="6" y2="11" stroke={C.purple} strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="1" y1="6" x2="11" y2="6" stroke={C.purple} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Crear evento
          </motion.button>
        </div>
      </div>

      {/* ── LAYOUT PRINCIPAL: GRID + PANEL ── */}
      <div className="cal-layout">

        {/* ── GRID MENSUAL ── */}
        <div>
          {/* Cabecera de días */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 2 }}>
            {DAYS_OF_WEEK.map(d => (
              <div
                key={d}
                className="cal-header-label"
                style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: C.textMuted, textAlign: "center", padding: "6px 0" }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Celdas del grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {grid.map(({ date, isCurrentMonth }, idx) => {
              const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
              const dayEvents = eventsByDay[key] || [];
              const today_ = isToday(date);
              const hasSelectedEvent = selectedEvent && isSameDay(date, new Date(selectedEvent.datetime));

              return (
                <div
                  key={idx}
                  className="cal-day-cell"
                  style={{
                    minHeight: 72,
                    padding: 5,
                    background: hasSelectedEvent
                      ? "rgba(200,255,0,0.06)"
                      : today_
                        ? "rgba(127,119,221,0.08)"
                        : isCurrentMonth
                          ? "rgba(255,255,255,0.02)"
                          : "transparent",
                    border: hasSelectedEvent
                      ? `1px solid ${C.neonBorder}`
                      : today_
                        ? `1px solid rgba(127,119,221,0.3)`
                        : `1px solid ${C.border}`,
                    cursor: dayEvents.length > 0 ? "pointer" : "default",
                    transition: "background 150ms, border-color 150ms",
                    position: "relative",
                    borderRadius: 4,
                  }}
                  onMouseEnter={dayEvents.length > 0 ? e => { if (!hasSelectedEvent) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; } } : undefined}
                  onMouseLeave={dayEvents.length > 0 ? e => { if (!hasSelectedEvent) { e.currentTarget.style.background = isCurrentMonth ? "rgba(255,255,255,0.02)" : "transparent"; e.currentTarget.style.borderColor = today_ ? "rgba(127,119,221,0.3)" : C.border; } } : undefined}
                >
                  {/* Número de día */}
                  <div style={{
                    fontSize: 11,
                    fontWeight: today_ ? 900 : 500,
                    color: today_ ? C.purple : isCurrentMonth ? "rgba(255,255,255,0.7)" : C.textHint,
                    marginBottom: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <span>{date.getDate()}</span>
                    {today_ && (
                      <span style={{ fontSize: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: C.purple, background: "rgba(127,119,221,0.15)", padding: "1px 4px" }}>
                        Hoy
                      </span>
                    )}
                  </div>

                  {/* Badges de eventos — máx 3 visibles */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {dayEvents.slice(0, 3).map(ev => (
                      <EventBadge
                        key={ev.id}
                        event={ev}
                        onClick={handleSelectEvent}
                        isSelected={selectedEvent?.id === ev.id}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div style={{ fontSize: 7, color: C.textMuted, paddingLeft: 2 }}>
                        +{dayEvents.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lista de eventos del mes — debajo del grid en mobile */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "2px", color: C.textMuted, marginBottom: 10, paddingLeft: 2 }}>
              Agenda del mes
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {events
                .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
                .map(ev => {
                  const def = EVENT_TYPES[ev.type];
                  const isSelected = selectedEvent?.id === ev.id;
                  return (
                    <motion.div
                      key={ev.id}
                      whileHover={{ x: 3 }}
                      onClick={() => handleSelectEvent(ev)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 12px",
                        background: isSelected ? def.colorDim : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isSelected ? def.border : C.border}`,
                        borderLeft: `3px solid ${def.color}`,
                        borderRadius: 4,
                        cursor: "pointer",
                        transition: "background 150ms, border-color 150ms",
                        boxShadow: isSelected ? `0 2px 12px ${def.color}22` : "none",
                      }}
                    >
                      {/* Fecha */}
                      <div style={{ minWidth: 36, textAlign: "center", flexShrink: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: def.color, lineHeight: 1 }}>
                          {new Date(ev.datetime).getDate()}
                        </div>
                        <div style={{ fontSize: 7, color: C.textMuted, textTransform: "uppercase" }}>
                          {DAYS_OF_WEEK[new Date(ev.datetime).getDay() === 0 ? 6 : new Date(ev.datetime).getDay() - 1]}
                        </div>
                      </div>
                      {/* Separador */}
                      <div style={{ width: 1, height: 30, background: C.border, flexShrink: 0 }} />
                      {/* Info */}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {ev.title}
                        </div>
                        <div style={{ fontSize: 9, color: C.textMuted }}>
                          {fmtTime(ev.datetime)} · {ev.location}
                        </div>
                      </div>
                      {/* Tipo */}
                      <div style={{ fontSize: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: def.color, background: def.colorDim, padding: "2px 6px", flexShrink: 0 }}>
                        {def.label}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* ── PANEL LATERAL — EVENTO SELECCIONADO ── */}
        <div>
          <AnimatePresence mode="wait">
            {selectedEvent ? (
              <EventPanel
                key={selectedEvent.id}
                event={selectedEvent}
                athletes={athletes}
                getRsvp={getRsvp}
                setRsvp={setRsvp}
                getAvailability={getAvailability}
                onClose={() => setSelected(null)}
                clubId={clubId}
              />
            ) : (
              <PanelEmpty key="empty" />
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
