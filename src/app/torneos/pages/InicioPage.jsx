import { motion } from "framer-motion";
import { Plus, Download, CheckCircle, Trophy, Globe, BarChart2, Users } from "lucide-react";
import { useTorneosStore } from "../store/useTorneosStore";
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

const STEPS_STRIP = ["Crear torneo", "Agregar equipos", "Configurar fases", "Publicar"];

function MiniTorneosPreview() {
  const rounds = [{ label: "Cuartos", n: 4 }, { label: "Semis", n: 2 }, { label: "Final", n: 1 }];
  return (
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      style={{ background: CARD, borderRadius: 10, padding: "14px 16px", boxShadow: ELEV, border: `1px solid ${BORDER}`, width: 210, flexShrink: 0, fontFamily: FONT }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: CU, letterSpacing: "0.08em", marginBottom: 10 }}>FIXTURE · FASE ELIMINATORIA</div>
      <div style={{ display: "flex", gap: 8 }}>
        {rounds.map(({ label, n }) => (
          <div key={label} style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: HINT, fontWeight: 600, marginBottom: 5, letterSpacing: "0.06em" }}>{label}</div>
            {Array.from({ length: n }).map((_, i) => (
              <div key={i} style={{ height: 20, background: PALETTE.bg, borderRadius: 4, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", padding: "0 6px", gap: 4, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: CU_DIM, border: `1px solid ${CU_BOR}` }} />
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: BORDER }} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 9, color: CU, fontWeight: 600, letterSpacing: "0.06em" }}>● EN PROGRESO</div>
    </motion.div>
  );
}

export default function InicioPage({ onCreate, onImport, onInfoClick }) {
  const torneos         = useTorneosStore(s => s.torneos);
  const torneoActivoId  = useTorneosStore(s => s.torneoActivoId);
  const torneoActivo    = torneoActivoId ? torneos.find(t => t.id === torneoActivoId) : null;

  return (
    <div>
      {/* Welcome + mini wizard */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Welcome card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          style={{ flex: 1, background: CARD, borderRadius: 16, boxShadow: ELEV, border: `1px solid ${BORDER}`, padding: 32, display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}
        >
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: TEXT, lineHeight: 1.15, letterSpacing: "-0.02em", fontFamily: FONT }}>
                Bienvenido a<br />ALTTEZ Torneos
              </h1>
              <p style={{ margin: "10px 0 0", fontSize: 14, color: MUTED, lineHeight: 1.6, fontFamily: FONT }}>
                Gestiona torneos, fases y fixtures desde un solo lugar.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onCreate}
                  style={{ display: "flex", alignItems: "center", gap: 7, background: CU, color: "#FFF", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}>
                  <Plus size={14} />Crear torneo
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onImport}
                  style={{ display: "flex", alignItems: "center", gap: 7, background: "transparent", color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}>
                  <Download size={14} />Importar datos
                </motion.button>
              </div>
            </div>
            <MiniTorneosPreview />
          </div>

          {/* Steps strip */}
          <div style={{ display: "flex", alignItems: "center", borderTop: `1px solid ${BORDER}`, paddingTop: 18 }}>
            {STEPS_STRIP.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: i === 0 ? CU : CU_DIM, border: `1.5px solid ${i === 0 ? CU : CU_BOR}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {i === 0 ? <CheckCircle size={12} color="#FFF" /> : <span style={{ fontSize: 10, fontWeight: 700, color: CU }}>{i + 1}</span>}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? TEXT : HINT, fontFamily: FONT, whiteSpace: "nowrap" }}>{s}</span>
                </div>
                {i < 3 && <div style={{ flex: 1, height: 1.5, margin: "0 8px", background: `linear-gradient(90deg, ${CU_BOR}, ${BORDER})` }} />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick start card */}
        <motion.div
          initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.15 }}
          style={{ width: 300, flexShrink: 0, background: CARD, borderRadius: 16, boxShadow: ELEV, border: `1px solid ${BORDER}`, padding: 24, fontFamily: FONT }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
            {torneoActivo ? `Torneo activo` : "Crear tu primer torneo"}
          </div>
          {torneoActivo ? (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, color: CU, marginBottom: 4 }}>{torneoActivo.nombre}</div>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 14 }}>{torneoActivo.deporte} · {torneos.length} torneo{torneos.length !== 1 ? "s" : ""} en total</div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => onInfoClick("fixtures")}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: CU, color: "#FFF", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}>
                Ver fixtures
              </motion.button>
            </>
          ) : (
            <>
              <p style={{ margin: "0 0 16px", fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
                Completa el formulario para crear tu primer torneo en minutos.
              </p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onCreate}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: CU, color: "#FFF", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}>
                Comenzar →
              </motion.button>
            </>
          )}
        </motion.div>
      </div>

      {/* Info cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 20 }}>
        {[
          { icon: Globe,     title: "Página pública",    desc: "Comparte el torneo con una URL pública",               mod: "publica" },
          { icon: BarChart2, title: "Estadísticas",       desc: "Rendimiento de equipos y jugadores en tiempo real",   mod: "estadisticas" },
          { icon: Users,     title: "Gestión de equipos", desc: "Administra equipos, jugadores y cuerpos técnicos",    mod: "equipos" },
        ].map(({ icon: Icon, title, desc, mod }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE, delay: 0.25 + i * 0.07 }}
            whileHover={{ y: -2 }}
            onClick={() => onInfoClick(mod)}
            style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 20, fontFamily: FONT, cursor: "pointer" }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 9, background: CU_DIM, border: `1px solid ${CU_BOR}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Icon size={16} color={CU} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{desc}</div>
          </motion.div>
        ))}
      </div>

      {/* Empty state — no torneos */}
      {torneos.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ marginTop: 32, padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, fontFamily: FONT }}
        >
          <Trophy size={32} color={CU} style={{ opacity: 0.3 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginTop: 4 }}>Aún no hay torneos creados</div>
          <div style={{ fontSize: 12, color: MUTED, textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>
            Crea tu primer torneo para comenzar.
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onCreate}
            style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 7, background: "transparent", color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}>
            <Plus size={14} />Crear torneo
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
