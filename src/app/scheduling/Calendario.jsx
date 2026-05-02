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
 * @version 3.0
 */

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PALETTE as C } from "../../shared/tokens/palette";
import { useStore } from "../../shared/store/useStore";
import EventPanel, { PanelEmpty } from "./EventPanel";
import CreateEventModal from "./CreateEventModal";
import { EVENT_TYPES, fmtTime } from "./calendarConstants";
import { showToast } from "../../shared/ui/Toast";

// CSS responsivo movido a index.css (.cal-layout, .cal-rsvp-btn, etc.)

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES LOCALES
// ─────────────────────────────────────────────────────────────────────────────
const DAYS_OF_WEEK  = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS_ES     = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS DE CALENDARIO
// ─────────────────────────────────────────────────────────────────────────────

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startDow; i++) {
    cells.push({ date: new Date(year, month, -startDow + i + 1), isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    cells.push({ date: next, isCurrentMonth: false });
  }
  return cells;
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate();
}
function isToday(d) { return isSameDay(d, new Date()); }

// ─────────────────────────────────────────────────────────────────────────────
// GENERADOR DE EVENTOS DEMO
// ─────────────────────────────────────────────────────────────────────────────
function generateDemoEvents(year, month) {
  const d = (day, hour = 18, min = 0) => new Date(year, month, day, hour, min).toISOString();
  return [
    { id:`t-${year}-${month}-1`, type:"training", title:"Entrenamiento físico",       datetime:d(2,18,0),   location:"Campo A",            convocados:null },
    { id:`t-${year}-${month}-2`, type:"training", title:"Trabajo táctico",             datetime:d(4,18,0),   location:"Campo A",            convocados:null },
    { id:`t-${year}-${month}-3`, type:"training", title:"Rondos y pressing",           datetime:d(9,18,0),   location:"Campo A",            convocados:null },
    { id:`t-${year}-${month}-4`, type:"training", title:"Entrenamiento precompetición",datetime:d(11,17,30), location:"Campo B",            convocados:null },
    { id:`t-${year}-${month}-5`, type:"training", title:"Recuperación activa",         datetime:d(16,10,0),  location:"Gimnasio",           convocados:null },
    { id:`t-${year}-${month}-6`, type:"training", title:"Pautas tácticas jornada",     datetime:d(18,18,0),  location:"Campo A",            convocados:null },
    { id:`t-${year}-${month}-7`, type:"training", title:"Ensayo de balón parado",      datetime:d(23,18,0),  location:"Campo A",            convocados:null },
    { id:`t-${year}-${month}-8`, type:"training", title:"Entrenamiento técnico",       datetime:d(25,18,0),  location:"Campo B",            convocados:null },
    { id:`m-${year}-${month}-1`, type:"match",    title:"vs Atlético Sur",             datetime:d(7,16,0),   location:"Estadio Local",      convocados:22, rival:"Atlético Sur",  esLocal:true  },
    { id:`m-${year}-${month}-2`, type:"match",    title:"vs Deportivo Norte",          datetime:d(14,11,0),  location:"Est. Norte",         convocados:22, rival:"Dep. Norte",    esLocal:false },
    { id:`m-${year}-${month}-3`, type:"match",    title:"vs Unión FC",                 datetime:d(21,16,30), location:"Estadio Local",      convocados:22, rival:"Unión FC",      esLocal:true  },
    { id:`m-${year}-${month}-4`, type:"match",    title:"vs Racing Club",              datetime:d(28,17,0),  location:"Estadio Racing",     convocados:22, rival:"Racing Club",   esLocal:false },
    { id:`c-${year}-${month}-1`, type:"club",     title:"Reunión de cuerpo técnico",  datetime:d(5,10,0),   location:"Sala de reuniones" },
    { id:`c-${year}-${month}-2`, type:"club",     title:"Jornada de puertas abiertas",datetime:d(19,10,0),  location:"Campo A" },
  ].filter(ev => {
    const evDate = new Date(ev.datetime);
    return evDate.getMonth() === month && evDate.getFullYear() === year;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK — EVENTOS PERSONALIZADOS
// ─────────────────────────────────────────────────────────────────────────────
function useCustomEvents(clubId) {
  const storageKey = `alttez_events_${clubId || "demo"}`;
  const [customEvents, setCustomEvents] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const addEvent = useCallback((eventData) => {
    const newEvent = { ...eventData, id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
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
// HOOK — RSVP
// ─────────────────────────────────────────────────────────────────────────────
function useRsvp(clubId) {
  const storageKey = `alttez_rsvp_${clubId || "demo"}`;
  const [rsvpMap, setRsvpMap] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const persist = useCallback((next) => {
    setRsvpMap(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* quota */ }
  }, [storageKey]);

  const getRsvp = useCallback((eventId, athleteId) => {
    return rsvpMap?.[eventId]?.[athleteId] || "PENDIENTE";
  }, [rsvpMap]);

  const setRsvp = useCallback((eventId, athleteId, state) => {
    const next = { ...rsvpMap, [eventId]: { ...(rsvpMap[eventId] || {}), [athleteId]: state } };
    persist(next);
    const cid = clubId || "demo";
    localStorage.setItem(`alttez_rsvp_absent_${cid}_${eventId}_${athleteId}`, state === "AUSENTE" ? "1" : "0");
  }, [rsvpMap, persist, clubId]);

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
// SUB-COMPONENTE: BADGE EN EL GRID
// ─────────────────────────────────────────────────────────────────────────────
function EventBadge({ event, onClick, isSelected }) {
  const def = EVENT_TYPES[event.type];
  return (
    <div
      className="cal-event-badge"
      onClick={(e) => { e.stopPropagation(); onClick(event); }}
      style={{
        fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
        padding: "2px 6px", borderRadius: 3,
        background: isSelected ? def.color : def.colorDim,
        color: isSelected ? C.text : def.color,
        border: `1px solid ${def.border}`,
        cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
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
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function Calendario({ clubId = "" }) {
  const athletes = useStore(state => state.athletes);
  const today    = new Date();

  const [year, setYear]             = useState(today.getFullYear());
  const [month, setMonth]           = useState(today.getMonth());
  const [selected, setSelected]     = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const { getRsvp, setRsvp, getAvailability } = useRsvp(clubId);
  const { customEvents, addEvent }            = useCustomEvents(clubId);

  const demoEvents     = useMemo(() => generateDemoEvents(year, month), [year, month]);
  const hasCustom      = customEvents.length > 0;
  const filteredCustom = useMemo(() => customEvents.filter(ev => {
    const d = new Date(ev.datetime);
    return d.getFullYear() === year && d.getMonth() === month;
  }), [customEvents, year, month]);

  const events = hasCustom ? filteredCustom : demoEvents;
  const grid   = useMemo(() => buildCalendarGrid(year, month), [year, month]);

  const eventsByDay = useMemo(() => {
    const map = {};
    for (const ev of events) {
      const d   = new Date(ev.datetime);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    }
    return map;
  }, [events]);

  const prevMonth = useCallback(() => {
    setSelected(null);
    setMonth(m => { if (m === 0) { setYear(y => y - 1); return 11; } return m - 1; });
  }, [setYear]);

  const nextMonth = useCallback(() => {
    setSelected(null);
    setMonth(m => { if (m === 11) { setYear(y => y + 1); return 0; } return m + 1; });
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
    setSelected(saved);
    const evDate = new Date(saved.datetime);
    setYear(evDate.getFullYear());
    setMonth(evDate.getMonth());
  }, [addEvent, setYear]);

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

      {/* Topbar */}
      <div style={{
        padding: "10px 16px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 8,
        background: "rgba(10,10,18,0.9)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      }}>
        {/* Navegación de mes */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={prevMonth}
            style={{ background: "none", border: `1px solid ${C.border}`, color: C.textMuted, cursor: "pointer", padding: "4px 10px", fontSize: 12, transition: "border-color 150ms, color 150ms" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.bronce; e.currentTarget.style.color = C.bronce; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}
          >‹</button>

          <motion.div
            key={`${year}-${month}`}
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", alignItems: "baseline", gap: 8 }}
          >
            <span style={{ fontSize: 18, fontWeight: 900, color:"#1F1F1D", textTransform: "uppercase", letterSpacing: "-0.5px" }}>
              {MONTHS_ES[month]}
            </span>
            <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>{year}</span>
          </motion.div>

          <button
            onClick={nextMonth}
            style={{ background: "none", border: `1px solid ${C.border}`, color: C.textMuted, cursor: "pointer", padding: "4px 10px", fontSize: 12, transition: "border-color 150ms, color 150ms" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.bronce; e.currentTarget.style.color = C.bronce; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}
          >›</button>

          <button
            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelected(null); }}
            style={{ background: "none", border: `1px solid ${C.bronceBorder}`, color: C.bronce, cursor: "pointer", padding: "4px 10px", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}
          >
            Hoy
          </button>
        </div>

        {/* Leyenda */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {LEGEND.map(({ label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, background: color, boxShadow: `0 0 4px ${color}` }} />
              <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.8px", color: C.textMuted }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Contador + Crear */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>
            <span style={{ color:"#1F1F1D", fontWeight: 700 }}>{events.length}</span> eventos este mes
            {hasCustom && <span style={{ marginLeft: 6, fontSize: 8, color: C.purple }}>(propios)</span>}
          </div>

          <motion.button
            whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setShowCreate(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 13px", minHeight: 34,
              background: "rgba(127,119,221,0.15)", border: "1px solid rgba(127,119,221,0.45)",
              borderRadius: 5, color: C.purple,
              fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px",
              cursor: "pointer", boxShadow: "0 0 12px rgba(127,119,221,0.18)",
              fontFamily: "inherit", flexShrink: 0,
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

      {/* Layout principal */}
      <div className="cal-layout">

        {/* Grid mensual */}
        <div>
          {/* Cabecera días */}
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

          {/* Celdas */}
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
                    minHeight: 72, padding: 5,
                    background: hasSelectedEvent
                      ? "rgba(206, 137, 70,0.06)"
                      : today_ ? "rgba(127,119,221,0.08)"
                      : isCurrentMonth ? "rgba(255,255,255,0.02)"
                      : "transparent",
                    border: hasSelectedEvent
                      ? `1px solid ${C.bronceBorder}`
                      : today_ ? `1px solid rgba(127,119,221,0.3)`
                      : `1px solid ${C.border}`,
                    cursor: dayEvents.length > 0 ? "pointer" : "default",
                    transition: "background 150ms, border-color 150ms",
                    position: "relative", borderRadius: 4,
                  }}
                  onMouseEnter={dayEvents.length > 0 ? e => { if (!hasSelectedEvent) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; } } : undefined}
                  onMouseLeave={dayEvents.length > 0 ? e => { if (!hasSelectedEvent) { e.currentTarget.style.background = isCurrentMonth ? "rgba(255,255,255,0.02)" : "transparent"; e.currentTarget.style.borderColor = today_ ? "rgba(127,119,221,0.3)" : C.border; } } : undefined}
                >
                  <div style={{
                    fontSize: 11, fontWeight: today_ ? 900 : 500,
                    color: today_ ? C.purple : isCurrentMonth ? "rgba(255,255,255,0.7)" : C.textHint,
                    marginBottom: 3, display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <span>{date.getDate()}</span>
                    {today_ && (
                      <span style={{ fontSize: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: C.purple, background: "rgba(127,119,221,0.15)", padding: "1px 4px" }}>
                        Hoy
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {dayEvents.slice(0, 3).map(ev => (
                      <EventBadge key={ev.id} event={ev} onClick={handleSelectEvent} isSelected={selectedEvent?.id === ev.id} />
                    ))}
                    {dayEvents.length > 3 && (
                      <div style={{ fontSize: 7, color: C.textMuted, paddingLeft: 2 }}>+{dayEvents.length - 3} más</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Agenda del mes */}
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
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 12px",
                        background: isSelected ? def.colorDim : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isSelected ? def.border : C.border}`,
                        borderLeft: `3px solid ${def.color}`,
                        borderRadius: 4, cursor: "pointer",
                        transition: "background 150ms, border-color 150ms",
                        boxShadow: isSelected ? `0 2px 12px ${def.color}22` : "none",
                      }}
                    >
                      <div style={{ minWidth: 36, textAlign: "center", flexShrink: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: def.color, lineHeight: 1 }}>
                          {new Date(ev.datetime).getDate()}
                        </div>
                        <div style={{ fontSize: 7, color: C.textMuted, textTransform: "uppercase" }}>
                          {DAYS_OF_WEEK[new Date(ev.datetime).getDay() === 0 ? 6 : new Date(ev.datetime).getDay() - 1]}
                        </div>
                      </div>
                      <div style={{ width: 1, height: 30, background: C.border, flexShrink: 0 }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color:"#1F1F1D", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {ev.title}
                        </div>
                        <div style={{ fontSize: 9, color: C.textMuted }}>
                          {fmtTime(ev.datetime)} · {ev.location}
                        </div>
                      </div>
                      <div style={{ fontSize: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: def.color, background: def.colorDim, padding: "2px 6px", flexShrink: 0 }}>
                        {def.label}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Panel lateral */}
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
