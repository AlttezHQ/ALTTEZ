import { motion } from "framer-motion";
import { Trophy, Plus, Play, Trash2, Clock, CheckCircle } from "lucide-react";
import { useTorneosStore } from "../store/useTorneosStore";
import { PALETTE, ELEVATION } from "../../../shared/tokens/palette";

const CU     = PALETTE.bronce;
const CU_DIM = PALETTE.bronceDim;
const CU_BOR = PALETTE.bronceBorder;
const CARD   = PALETTE.surface;
const BG     = PALETTE.bg;
const TEXT   = PALETTE.text;
const MUTED  = PALETTE.textMuted;
const HINT   = PALETTE.textHint;
const BORDER = PALETTE.border;
const ELEV   = ELEVATION?.card ?? "0 10px 28px rgba(23,26,28,0.07)";
const FONT   = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
const EASE   = [0.22, 1, 0.36, 1];

const ESTADO_CONFIG = {
  borrador:   { label: "Borrador",   color: MUTED,            bg: BG,      icon: Clock },
  activo:     { label: "Activo",     color: PALETTE.success,  bg: PALETTE.successDim, icon: Play },
  finalizado: { label: "Finalizado", color: CU,               bg: CU_DIM,  icon: CheckCircle },
};

const FORMATO_LABELS = {
  todos_contra_todos: "Liga",
  eliminacion:        "Eliminación",
  grupos_playoffs:    "Grupos + Playoffs",
};

export default function TorneosListPage({ onCreate, onAbrir }) {
  const torneos         = useTorneosStore(s => s.torneos);
  const allEquipos      = useTorneosStore(s => s.equipos);
  const allPartidos     = useTorneosStore(s => s.partidos);
  const torneoActivoId  = useTorneosStore(s => s.torneoActivoId);
  const setTorneoActivo = useTorneosStore(s => s.setTorneoActivo);
  const eliminarTorneo  = useTorneosStore(s => s.eliminarTorneo);

  if (torneos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 24px", gap: 12, fontFamily: FONT }}
      >
        <div style={{ width: 52, height: 52, borderRadius: 16, background: CU_DIM, border: `1px solid ${CU_BOR}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Trophy size={22} color={CU} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>No hay torneos aún</div>
        <div style={{ fontSize: 13, color: MUTED, maxWidth: 320, textAlign: "center", lineHeight: 1.6 }}>
          Crea tu primer torneo para empezar a gestionar competencias.
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onCreate}
          style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 7, background: CU, color: "#FFF", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}
        >
          <Plus size={14} />Crear torneo
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE }}
      style={{ fontFamily: FONT }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>Mis torneos</h2>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{torneos.length} torneo{torneos.length !== 1 ? "s" : ""}</div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onCreate}
          style={{ display: "flex", alignItems: "center", gap: 7, background: CU, color: "#FFF", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}
        >
          <Plus size={14} />Nuevo torneo
        </motion.button>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {torneos.map((t, i) => {
          const cfg = ESTADO_CONFIG[t.estado] ?? ESTADO_CONFIG.borrador;
          const EstadoIcon = cfg.icon;
          const equiposCount  = allEquipos.filter(e => e.torneoId === t.id).length;
          const partidosCount = allPartidos.filter(p => p.torneoId === t.id).length;
          const isActivo = t.id === torneoActivoId;

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: EASE, delay: i * 0.05 }}
              style={{
                background: CARD, borderRadius: 12, border: `1.5px solid ${isActivo ? CU : BORDER}`,
                boxShadow: isActivo ? `0 0 0 3px ${CU_DIM}` : ELEV,
                padding: 20, display: "flex", flexDirection: "column", gap: 12,
              }}
            >
              {/* Top */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isActivo && (
                    <div style={{ fontSize: 9, fontWeight: 700, color: CU, letterSpacing: "0.1em", marginBottom: 4 }}>● EN USO</div>
                  )}
                  <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.nombre}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{t.deporte} · {FORMATO_LABELS[t.formato] ?? t.formato}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, background: cfg.bg, border: `1px solid ${cfg.color}22`, borderRadius: 6, padding: "3px 8px", flexShrink: 0 }}>
                  <EstadoIcon size={10} color={cfg.color} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { label: "Equipos",  value: equiposCount },
                  { label: "Partidos", value: partidosCount },
                  { label: "Inicio",   value: t.fechaInicio ? new Date(t.fechaInicio + "T00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short" }) : "—" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{value}</div>
                    <div style={{ fontSize: 10, color: HINT }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setTorneoActivo(t.id); onAbrir?.(); }}
                  style={{ flex: 1, background: isActivo ? CU : CU_DIM, color: isActivo ? "#FFF" : CU, border: `1px solid ${CU_BOR}`, borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}
                >
                  {isActivo ? "Abierto" : "Abrir"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, background: "#FFF0F0" }} whileTap={{ scale: 0.97 }}
                  onClick={() => { if (window.confirm(`¿Eliminar "${t.nombre}"?`)) eliminarTorneo(t.id); }}
                  style={{ width: 36, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <Trash2 size={13} color={MUTED} />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
