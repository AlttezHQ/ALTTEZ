/**
 * @component KioskMode
 * @description Vista quiosco para tablet — cuadricula de fotos de atletas.
 * Toca una foto → WellnessCheckIn pantalla completa.
 * Ruta: /crm/kiosk
 * No requiere autenticacion completa — accede al store directamente.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../../shared/store/useStore";
import { getAvatarUrl } from "../../shared/utils/helpers";
import { PALETTE } from "../../shared/tokens/palette";
import { calcSaludActual } from "../../shared/utils/rpeEngine";
import { getWellnessStatus } from "../../shared/types/wellnessTypes";
import WellnessCheckIn from "../../shared/ui/WellnessCheckIn";

export default function KioskMode() {
  const athletes = useStore(state => state.athletes);
  const historial = useStore(state => state.historial);
  const addWellnessLog = useStore(state => state.addWellnessLog);
  const wellnessLogs = useStore(state => state.wellnessLogs);
  const clubInfo = useStore(state => state.clubInfo);
  const session = useStore(state => state.session);

  const [selected, setSelected] = useState(null); // athlete
  const [lastChecked, setLastChecked] = useState({}); // athleteId → timestamp

  const presentAthletes = athletes.filter(a => a.status === "P");

  const handleSubmit = (log) => {
    addWellnessLog(log);
    setLastChecked(prev => ({ ...prev, [log.athlete_id]: Date.now() }));
    setSelected(null);
  };

  // Comprueba si el atleta ya hizo check-in hoy
  const checkedToday = (athleteId) => {
    const today = new Date().toDateString();
    return wellnessLogs.some(l =>
      String(l.athlete_id) === String(athleteId) &&
      new Date(l.logged_at).toDateString() === today
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050a0e",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header quiosco */}
      <div style={{
        padding: "16px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(0,0,0,0.4)",
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: "3px" }}>
            {clubInfo.nombre || "ALTTEZ"}
          </div>
          <div style={{ fontSize: 9, color: PALETTE.textMuted, marginTop: 2 }}>
            Check-in de bienestar · {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>
        <div style={{
          padding: "6px 14px",
          background: "rgba(57,255,20,0.08)",
          border: "1px solid rgba(57,255,20,0.25)",
          borderRadius: 6,
          fontSize: 9,
          color: PALETTE.bronce,
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          fontWeight: 700,
        }}>
          Modo Quiosco
        </div>
      </div>

      {/* Instruccion */}
      <div style={{ textAlign: "center", padding: "20px 24px 12px", fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
        Toca tu foto para registrar tu estado de hoy
      </div>

      {/* Grid de atletas */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 12,
        padding: "12px 20px 24px",
        overflowY: "auto",
      }}>
        {presentAthletes.map((athlete) => {
          const done = checkedToday(athlete.id);
          const saludResult = calcSaludActual(athlete.rpe, historial, athlete.id);

          return (
            <motion.div
              key={athlete.id}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => !done && setSelected(athlete)}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                border: `2px solid ${done ? PALETTE.green : "rgba(255,255,255,0.08)"}`,
                background: done
                  ? "rgba(29,158,117,0.08)"
                  : "rgba(255,255,255,0.03)",
                cursor: done ? "default" : "pointer",
                transition: "border-color 300ms",
                position: "relative",
              }}
            >
              {/* Photo */}
              <div style={{ position: "relative" }}>
                <img
                  src={getAvatarUrl(athlete.photo)}
                  alt={athlete.name}
                  style={{ width: "100%", height: 120, objectFit: "cover", objectPosition: "top", display: "block" }}
                />
                {done && (
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(29,158,117,0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                  }}>
                    ✓
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "8px 10px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: "0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {athlete.name.split(" ")[0]}
                </div>
                <div style={{ fontSize: 8, color: PALETTE.textMuted, marginTop: 1 }}>{athlete.posCode}</div>

                {/* Salud mini bar */}
                <div style={{ marginTop: 6, height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                  <div style={{
                    width: `${saludResult.salud}%`,
                    height: "100%",
                    background: saludResult.color,
                    borderRadius: 2,
                    transition: "width 600ms ease",
                  }} />
                </div>
              </div>
            </motion.div>
          );
        })}

        {presentAthletes.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: PALETTE.textMuted, fontSize: 12 }}>
            No hay atletas marcados como presentes.
          </div>
        )}
      </div>

      {/* Wellness Modal fullscreen */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(12px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WellnessCheckIn
              athleteId={selected.id}
              athleteName={selected.name}
              clubId={session?.club_id || ""}
              onSubmit={handleSubmit}
              onClose={() => setSelected(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
