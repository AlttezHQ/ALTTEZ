import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { PALETTE } from "../../../../shared/tokens/palette";

const CU = PALETTE.bronce;
const CARD = PALETTE.surface;
const BG = PALETTE.bg;
const TEXT = PALETTE.text;
const MUTED = PALETTE.textMuted;
const HINT = PALETTE.textHint;
const BORDER = PALETTE.border;
const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
const EASE = [0.22, 1, 0.36, 1];

export default function ResultModal({ partido, equipos, onSave, onClose }) {
  const [gl, setGl] = useState(partido.golesLocal ?? 0);
  const [gv, setGv] = useState(partido.golesVisita ?? 0);
  const [eventos, setEventos] = useState(partido.eventos ?? []);
  const [tab, setTab] = useState("general");

  const localObj = equipos.find((team) => team.id === partido.equipoLocalId);
  const visitaObj = equipos.find((team) => team.id === partido.equipoVisitaId);
  const localName = localObj?.nombre ?? "Local";
  const visitaName = visitaObj?.nombre ?? "Visita";

  const [newEvent, setNewEvent] = useState({
    equipoId: localObj?.id ?? "",
    jugadorId: "",
    tipo: "gol",
    minuto: "",
  });

  const addEvent = () => {
    if (!newEvent.equipoId || !newEvent.jugadorId || !newEvent.tipo) return;
    setEventos([
      ...eventos,
      {
        ...newEvent,
        id: crypto.randomUUID(),
        minuto: parseInt(newEvent.minuto, 10) || null,
      },
    ]);
    setNewEvent({ ...newEvent, jugadorId: "", minuto: "" });
  };

  const removeEvent = (id) => {
    setEventos(eventos.filter((event) => event.id !== id));
  };

  const getPlayerName = (equipoId, jugadorId) => {
    const team = equipoId === localObj?.id ? localObj : visitaObj;
    const player = team?.jugadores?.find((item) => item.id === jugadorId);
    return player ? player.nombre : "Desconocido";
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(23,26,28,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        fontFamily: FONT,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18, ease: EASE }}
        style={{
          background: CARD,
          borderRadius: 16,
          padding: 28,
          width: 420,
          boxShadow: "0 24px 64px rgba(23,26,28,0.2)",
          border: `1px solid ${BORDER}`,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: TEXT,
              letterSpacing: "-0.01em",
            }}
          >
            Registrar resultado
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: MUTED,
              padding: 4,
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
            borderBottom: `1px solid ${BORDER}`,
            paddingBottom: 12,
          }}
        >
          <button
            onClick={() => setTab("general")}
            style={{
              background: "none",
              border: "none",
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 700,
              color: tab === "general" ? CU : MUTED,
              borderBottom: tab === "general" ? `2px solid ${CU}` : "none",
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            Marcador General
          </button>
          <button
            onClick={() => setTab("eventos")}
            style={{
              background: "none",
              border: "none",
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 700,
              color: tab === "eventos" ? CU : MUTED,
              borderBottom: tab === "eventos" ? `2px solid ${CU}` : "none",
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            Eventos y Jugadores
          </button>
        </div>

        {tab === "general" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0" }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 10 }}>
                {localName}
              </div>
              <input
                type="number"
                min={0}
                max={99}
                value={gl}
                onChange={(event) => setGl(Math.max(0, Number(event.target.value)))}
                style={{
                  width: 64,
                  height: 64,
                  textAlign: "center",
                  fontSize: 28,
                  fontWeight: 800,
                  border: `2px solid ${BORDER}`,
                  borderRadius: 12,
                  color: TEXT,
                  background: BG,
                  fontFamily: FONT,
                  outline: "none",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: HINT,
                padding: "0 4px",
                marginTop: 20,
              }}
            >
              -
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 10 }}>
                {visitaName}
              </div>
              <input
                type="number"
                min={0}
                max={99}
                value={gv}
                onChange={(event) => setGv(Math.max(0, Number(event.target.value)))}
                style={{
                  width: 64,
                  height: 64,
                  textAlign: "center",
                  fontSize: 28,
                  fontWeight: 800,
                  border: `2px solid ${BORDER}`,
                  borderRadius: 12,
                  color: TEXT,
                  background: BG,
                  fontFamily: FONT,
                  outline: "none",
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: BG,
                padding: 16,
                borderRadius: 12,
                border: `1px solid ${BORDER}`,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, marginBottom: 10 }}>
                NUEVO EVENTO
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <select
                  value={newEvent.equipoId}
                  onChange={(event) =>
                    setNewEvent({
                      ...newEvent,
                      equipoId: event.target.value,
                      jugadorId: "",
                    })
                  }
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    background: "#FFF",
                    fontSize: 12,
                    fontFamily: FONT,
                  }}
                >
                  <option value={localObj?.id}>{localName}</option>
                  <option value={visitaObj?.id}>{visitaName}</option>
                </select>

                <select
                  value={newEvent.jugadorId}
                  onChange={(event) =>
                    setNewEvent({ ...newEvent, jugadorId: event.target.value })
                  }
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    background: "#FFF",
                    fontSize: 12,
                    fontFamily: FONT,
                  }}
                >
                  <option value="">Seleccionar Jugador...</option>
                  {(newEvent.equipoId === localObj?.id
                    ? localObj?.jugadores
                    : visitaObj?.jugadores
                  )?.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.nombre} {player.dorsal ? `(#${player.dorsal})` : ""}
                    </option>
                  ))}
                </select>

                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    value={newEvent.tipo}
                    onChange={(event) =>
                      setNewEvent({ ...newEvent, tipo: event.target.value })
                    }
                    style={{
                      flex: 2,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                      background: "#FFF",
                      fontSize: 12,
                      fontFamily: FONT,
                    }}
                  >
                    <option value="gol">Gol</option>
                    <option value="amarilla">Amarilla</option>
                    <option value="roja">Roja</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Min"
                    value={newEvent.minuto}
                    onChange={(event) =>
                      setNewEvent({ ...newEvent, minuto: event.target.value })
                    }
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                      background: "#FFF",
                      fontSize: 12,
                      fontFamily: FONT,
                    }}
                  />
                  <button
                    onClick={addEvent}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      border: "none",
                      background: CU,
                      color: "#FFF",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 180,
                overflowY: "auto",
                paddingRight: 4,
              }}
            >
              {eventos.length === 0 ? (
                <div style={{ textAlign: "center", padding: "16px 0", color: HINT, fontSize: 12 }}>
                  Sin eventos registrados
                </div>
              ) : (
                eventos.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                      background: "#FFF",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14 }}>
                        {event.tipo === "gol"
                          ? "⚽"
                          : event.tipo === "amarilla"
                            ? "🟨"
                            : "🟥"}
                      </span>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>
                          {getPlayerName(event.equipoId, event.jugadorId)}
                        </span>
                        <span style={{ fontSize: 10, color: MUTED }}>
                          {event.equipoId === localObj?.id ? localName : visitaName}
                          {event.minuto ? ` · Min ${event.minuto}'` : ""}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeEvent(event.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: PALETTE.danger || "#EF4444",
                        cursor: "pointer",
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 24, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 8,
              border: `1px solid ${BORDER}`,
              background: "transparent",
              fontSize: 13,
              fontWeight: 700,
              color: MUTED,
              fontFamily: FONT,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSave(gl, gv, eventos)}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 8,
              border: "none",
              background: CU,
              color: "#FFF",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: FONT,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Check size={14} />
            Guardar Resultado
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
