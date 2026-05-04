import { motion } from "framer-motion";
import { BarChart2 } from "lucide-react";
import { useTorneosStore } from "../store/useTorneosStore";
import ModuleEmptyState from "../components/shared/ModuleEmptyState";
import { PALETTE, ELEVATION } from "../../../shared/tokens/palette";

const CU     = PALETTE.bronce;
const CU_DIM = PALETTE.bronceDim;
const CU_BOR = PALETTE.bronceBorder;
const CARD   = PALETTE.surface;
const TEXT   = PALETTE.text;
const MUTED  = PALETTE.textMuted;
const HINT   = PALETTE.textHint;
const BORDER = PALETTE.border;
const ELEV   = ELEVATION?.card ?? "0 10px 28px rgba(23,26,28,0.07)";
const FONT   = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
const EASE   = [0.22, 1, 0.36, 1];

const COLS = [
  { key: "pos",  label: "#",   width: 32,  align: "center" },
  { key: "nombre", label: "Equipo", flex: 1,  align: "left" },
  { key: "pj",   label: "PJ",  width: 36,  align: "center" },
  { key: "pg",   label: "PG",  width: 36,  align: "center" },
  { key: "pe",   label: "PE",  width: 36,  align: "center" },
  { key: "pp",   label: "PP",  width: 36,  align: "center" },
  { key: "gf",   label: "GF",  width: 36,  align: "center" },
  { key: "gc",   label: "GC",  width: 36,  align: "center" },
  { key: "dg",   label: "DG",  width: 40,  align: "center" },
  { key: "pts",  label: "PTS", width: 44,  align: "center" },
];

function TablaPosiciones({ posiciones, titulo }) {
  if (!posiciones.length) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      {titulo && (
        <div style={{ fontSize: 11, fontWeight: 700, color: CU, letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>
          {titulo}
        </div>
      )}
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: ELEV }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", padding: "8px 16px", background: PALETTE.bgDeep ?? "#F5F1EA", borderBottom: `1px solid ${BORDER}` }}>
          {COLS.map(col => (
            <div key={col.key} style={{ width: col.width, flex: col.flex, textAlign: col.align, fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.08em" }}>
              {col.label}
            </div>
          ))}
        </div>
        {/* Data rows */}
        {posiciones.map((pos, i) => (
          <motion.div
            key={pos.equipoId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: EASE, delay: i * 0.04 }}
            style={{
              display: "flex", alignItems: "center", padding: "11px 16px",
              borderBottom: i < posiciones.length - 1 ? `1px solid ${BORDER}` : "none",
              background: i < 2 ? CU_DIM : "transparent",
            }}
          >
            <div style={{ width: 32, textAlign: "center", fontSize: 12, fontWeight: 700, color: i < 2 ? CU : HINT }}>{i + 1}</div>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pos.nombre}</div>
            {["pj", "pg", "pe", "pp", "gf", "gc"].map(k => (
              <div key={k} style={{ width: 36, textAlign: "center", fontSize: 12, color: MUTED }}>{pos[k]}</div>
            ))}
            <div style={{ width: 40, textAlign: "center", fontSize: 12, color: pos.dg > 0 ? PALETTE.success : pos.dg < 0 ? PALETTE.danger : MUTED, fontWeight: 600 }}>
              {pos.dg > 0 ? `+${pos.dg}` : pos.dg}
            </div>
            <div style={{ width: 44, textAlign: "center", fontSize: 14, fontWeight: 800, color: CU }}>{pos.pts}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function EstadisticasPage({ onGoTorneos }) {
  const torneoActivoId       = useTorneosStore(s => s.torneoActivoId);
  const getTorneoById        = useTorneosStore(s => s.getTorneoById);
  const getPosiciones        = useTorneosStore(s => s.getPosicionesByTorneo);
  const getEquipos           = useTorneosStore(s => s.getEquiposByTorneo);
  const getPartidos          = useTorneosStore(s => s.getPartidosByTorneo);

  if (!torneoActivoId) {
    return <ModuleEmptyState icon={BarChart2} title="Selecciona un torneo" subtitle="Abre un torneo para ver sus estadísticas." ctaLabel="Ver torneos" onCta={onGoTorneos} />;
  }

  const torneo   = getTorneoById(torneoActivoId);
  const equipos  = getEquipos(torneoActivoId);
  const partidos = getPartidos(torneoActivoId);
  const finalizados = partidos.filter(p => p.estado === "finalizado").length;

  if (!equipos.length) {
    return <ModuleEmptyState icon={BarChart2} title="Sin equipos" subtitle="Agrega equipos y registra resultados para ver la tabla de posiciones." />;
  }

  const posiciones = getPosiciones(torneoActivoId);

  // Para grupos_playoffs, agrupar por grupo
  const grupos = torneo?.formato === "grupos_playoffs"
    ? [...new Set(equipos.map(e => e.grupo).filter(Boolean))]
    : [];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: EASE }} style={{ fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>Estadísticas</h2>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{torneo?.nombre} · {finalizados} partido{finalizados !== 1 ? "s" : ""} jugado{finalizados !== 1 ? "s" : ""}</div>
        </div>
      </div>

      {finalizados === 0 && (
        <div style={{ background: CU_DIM, border: `1px solid ${CU_BOR}`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 12, color: CU }}>
          Registra resultados en la sección Fixtures para ver la tabla de posiciones actualizada.
        </div>
      )}

      {grupos.length > 0 ? (
        grupos.map(g => {
          const eqs = equipos.filter(e => e.grupo === g);
          const pos = posiciones.filter(p => eqs.some(e => e.id === p.equipoId));
          return <TablaPosiciones key={g} posiciones={pos} titulo={`Grupo ${g}`} />;
        })
      ) : (
        <TablaPosiciones posiciones={posiciones} titulo={null} />
      )}
    </motion.div>
  );
}
