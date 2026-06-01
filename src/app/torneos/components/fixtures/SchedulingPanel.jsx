import { motion } from "framer-motion";
import {
  Calendar,
  CalendarPlus,
  Clock,
  MapPin,
  User,
  X,
  Zap,
} from "lucide-react";
import { PALETTE } from "../../../../shared/tokens/palette";

const CU = PALETTE.bronce;
const CU_DIM = PALETTE.bronceDim;
const CU_BOR = PALETTE.bronceBorder;
const CARD = PALETTE.surface;
const BG = PALETTE.bg;
const TEXT = PALETTE.text;
const MUTED = PALETTE.textMuted;
const HINT = PALETTE.textHint;
const BORDER = PALETTE.border;
const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";

const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: `1px solid ${BORDER}`,
  background: BG,
  fontSize: 13,
  fontFamily: FONT,
  outline: "none",
  boxSizing: "border-box",
};

export default function SchedulingPanel({
  scheduling,
  venueDraft,
  refereeDraft,
  schedRound,
  schedFrom,
  schedTo,
  selectedMatch,
  onVenueDraftChange,
  onRefereeDraftChange,
  onRoundChange,
  onFromChange,
  onToChange,
  onOpenMatch,
  onCloseMatch,
  onAddVenue,
  onRemoveVenue,
  onAddReferee,
  onRemoveReferee,
  onScheduleRound,
  onScheduleGlobal,
}) {
  return (
    <motion.div
      key="p"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
        {[
          { label: "Total partidos", value: scheduling.stats.totalMatches, color: TEXT },
          { label: "Programados", value: scheduling.stats.scheduledMatches, color: PALETTE.success },
          { label: "Sin programar", value: scheduling.stats.pendingMatches, color: scheduling.stats.pendingMatches > 0 ? PALETTE.amber ?? "#F59E0B" : HINT },
          { label: "Fechas usadas", value: scheduling.stats.usedDates, color: CU },
        ].map((item) => (
          <div key={item.label} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: item.color, letterSpacing: "-0.02em" }}>{item.value}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: MUTED, marginTop: 2, letterSpacing: "0.04em" }}>{item.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Calendar size={18} color={CU} />
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Calendario de Partidos</h4>
            </div>
            {scheduling.scheduledDates.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: HINT, fontSize: 13 }}>
                <Calendar size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                <div style={{ fontWeight: 600 }}>Sin partidos programados</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Programa fechas usando las herramientas de abajo.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {scheduling.scheduledDates.map((dateGroup) => (
                  <div key={dateGroup.key} style={{ background: BG, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                    <div style={{ padding: "10px 14px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: CU, textTransform: "capitalize" }}>{dateGroup.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "2px 8px" }}>
                        {dateGroup.count} partido{dateGroup.count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div style={{ padding: "8px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                      {dateGroup.matches.map((match) => (
                        <motion.div
                          key={match.id}
                          whileHover={{ scale: 1.01, backgroundColor: BG, borderColor: CU_BOR }}
                          onClick={() => onOpenMatch(match.raw)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 14px",
                            borderBottom: `1px solid ${BORDER}`,
                            cursor: "pointer",
                            borderRadius: 8,
                            transition: "all 0.2s",
                          }}
                        >
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: match.state.dot, flexShrink: 0, boxShadow: `0 0 0 3px ${match.state.dot}20` }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {match.localName} vs {match.visitaName}
                            </div>
                            <div style={{ fontSize: 11, color: HINT, display: "flex", gap: 12, marginTop: 4 }}>
                              {match.hourLabel && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} /> {match.hourLabel}</span>}
                              {match.venueLabel && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} /> {match.venueLabel}</span>}
                              {match.refereeLabel && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><User size={11} /> {match.refereeLabel}</span>}
                            </div>
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 800, color: match.state.color, flexShrink: 0, background: `${match.state.color}15`, padding: "4px 8px", borderRadius: 6 }}>
                            {match.state.label.toUpperCase()}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <CalendarPlus size={18} color={CU} />
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>Programación global</h4>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: MUTED }}>CATEGORÍAS</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: TEXT }}>{scheduling.globalStats.categories}</div>
              </div>
              <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: MUTED }}>CANCHAS</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: TEXT }}>{scheduling.globalStats.venues}</div>
              </div>
            </div>
            <button onClick={onScheduleGlobal} style={{ width: "100%", background: CU, color: "#FFF", border: "none", borderRadius: 8, padding: 10, fontWeight: 800, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <CalendarPlus size={14} /> Programar torneo completo
            </button>
            {scheduling.scheduleReport && (
              <div style={{ marginTop: 14, borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                  {[
                    { label: "Total", value: scheduling.scheduleReport.total },
                    { label: "Programados", value: scheduling.scheduleReport.scheduled },
                    { label: "No programados", value: scheduling.scheduleReport.unscheduled },
                  ].map((item) => (
                    <div key={item.label} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }}>
                      <div style={{ fontSize: 15, fontWeight: 900, color: TEXT }}>{item.value}</div>
                      <div style={{ fontSize: 9, fontWeight: 800, color: MUTED }}>{item.label.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
                {scheduling.scheduleReport.unscheduledMatches.length > 0 && (
                  <div style={{ maxHeight: 180, overflow: "auto", border: `1px solid ${BORDER}`, borderRadius: 10 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                      <thead>
                        <tr style={{ background: BG, color: MUTED }}>
                          <th style={{ padding: 8, textAlign: "left" }}>Partido</th>
                          <th style={{ padding: 8, textAlign: "left" }}>Ronda</th>
                          <th style={{ padding: 8, textAlign: "left" }}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scheduling.scheduleReport.unscheduledMatches.map((match) => (
                          <tr key={match.id} style={{ borderTop: `1px solid ${BORDER}` }}>
                            <td style={{ padding: 8, color: TEXT, fontWeight: 700 }}>{match.matchLabel}</td>
                            <td style={{ padding: 8, color: MUTED }}>{match.roundLabel}</td>
                            <td style={{ padding: 8, color: MUTED }}>{match.stateLabel}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {selectedMatch && (
            <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>Detalle rápido</h4>
                <button onClick={onCloseMatch} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer" }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>
                {selectedMatch.localName} vs {selectedMatch.visitaName}
              </div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: MUTED }}>
                {selectedMatch.hourLabel ? <span><Clock size={12} /> {selectedMatch.hourLabel}</span> : null}
                {selectedMatch.venueLabel ? <span><MapPin size={12} /> {selectedMatch.venueLabel}</span> : null}
                {selectedMatch.refereeLabel ? <span><User size={12} /> {selectedMatch.refereeLabel}</span> : null}
                <span style={{ color: selectedMatch.state.color, fontWeight: 700 }}>
                  {selectedMatch.state.label}
                </span>
              </div>
            </section>
          )}

          <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <MapPin size={18} color={CU} />
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Sedes</h4>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {scheduling.venues.map((venue) => (
                <div key={venue.id} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "4px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  {venue.nombre}
                  <X size={12} onClick={() => onRemoveVenue(venue.id)} style={{ cursor: "pointer" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="text" placeholder="Nueva sede..." value={venueDraft} onChange={(event) => onVenueDraftChange(event.target.value)} style={inputStyle} />
              <button onClick={onAddVenue} style={{ background: CU_DIM, color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 8, padding: "0 12px", cursor: "pointer" }}>+</button>
            </div>
          </section>

          <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <User size={18} color={CU} />
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Árbitros</h4>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {scheduling.referees.map((referee) => (
                <div key={referee.id} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "4px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  {referee.nombre}
                  <X size={12} onClick={() => onRemoveReferee(referee.id)} style={{ cursor: "pointer" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="text" placeholder="Nuevo árbitro..." value={refereeDraft} onChange={(event) => onRefereeDraftChange(event.target.value)} style={inputStyle} />
              <button onClick={onAddReferee} style={{ background: CU_DIM, color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 8, padding: "0 12px", cursor: "pointer" }}>+</button>
            </div>
          </section>

          <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Zap size={18} color={CU} />
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Programar Jornada</h4>
            </div>
            <div style={{ background: BG, borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: MUTED }}>SELECCIONAR FECHA (RONDA)</label>
                <select value={schedRound} onChange={(event) => onRoundChange(event.target.value)} style={{ ...inputStyle, marginTop: 4 }}>
                  {scheduling.roundsOptions.map((round) => (
                    <option key={round} value={round}>Fecha {round}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: MUTED }}>DESDE</label>
                  <input type="date" value={schedFrom} onChange={(event) => onFromChange(event.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: MUTED }}>HASTA</label>
                  <input type="date" value={schedTo} onChange={(event) => onToChange(event.target.value)} style={inputStyle} />
                </div>
              </div>
              <button onClick={onScheduleRound} style={{ width: "100%", marginTop: 14, background: CU, color: "#FFF", border: "none", borderRadius: 8, padding: 10, fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Zap size={14} /> Programar Fecha {schedRound}
              </button>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
