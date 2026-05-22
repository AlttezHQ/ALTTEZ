/**
 * FaseFinalPage.jsx
 * Vista de la fase final / eliminatoria.
 * Renderiza el bracket eliminatorio y permite avanzar ganadores.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, LayoutGrid, CheckCircle, ChevronRight, Clock, X } from "lucide-react";
import { useTorneosStore } from "../store/useTorneosStore";
import { PALETTE, ELEVATION } from "../../../shared/tokens/palette";
import ModuleEmptyState from "../components/shared/ModuleEmptyState";
import { advanceKnockoutWinner, canGenerateKnockout } from "../utils/competitionEngine";

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

// ── MatchNode ──────────────────────────────────────────────────────────────────

function MatchNode({ match, equipos, onRegisterResult }) {
  if (!match) return <div style={{ width: 220, height: 72, background: "transparent" }} />;

  const getEq = id => equipos.find(e => e.id === id);
  const local  = getEq(match.equipoLocalId);
  const visita = getEq(match.equipoVisitaId);
  const isDone = match.estado === "finalizado";

  const renderTeam = (team, isLocal) => {
    const isWinner = isDone && (
      (isLocal && match.golesLocal > match.golesVisita) ||
      (!isLocal && match.golesVisita > match.golesLocal)
    );
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "6px 12px", borderBottom: isLocal ? `1px solid ${BORDER}` : "none",
        background: isWinner ? "#FDFDFB" : "transparent",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: team?.color ?? BORDER }} />
          <span style={{ fontSize: 12, fontWeight: isWinner ? 800 : 600, color: team ? TEXT : HINT }}>
            {team?.nombre ?? "TBD"}
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: isWinner ? CU : TEXT }}>
          {isDone ? (isLocal ? match.golesLocal : match.golesVisita) : "-"}
        </span>
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(23,26,28,0.1)" }}
      onClick={() => { if (local && visita && !isDone) onRegisterResult(match); }}
      style={{
        width: 220, background: CARD, borderRadius: 10,
        border: `1px solid ${isDone ? `${CU}40` : BORDER}`,
        boxShadow: ELEV, overflow: "hidden", cursor: (local && visita && !isDone) ? "pointer" : "default",
        fontFamily: FONT, position: "relative",
      }}
    >
      {renderTeam(local, true)}
      {renderTeam(visita, false)}
    </motion.div>
  );
}

// ── FaseFinalPage ──────────────────────────────────────────────────────────────

function KnockoutResultModal({ match, equipos, onSave, onClose }) {
  const local = equipos.find(e => e.id === match.equipoLocalId);
  const visita = equipos.find(e => e.id === match.equipoVisitaId);
  const [golesLocal, setGolesLocal] = useState(match.golesLocal ?? 0);
  const [golesVisita, setGolesVisita] = useState(match.golesVisita ?? 0);
  const [winnerId, setWinnerId] = useState("");
  const isDraw = Number(golesLocal) === Number(golesVisita);
  const inferredWinner = Number(golesLocal) > Number(golesVisita)
    ? match.equipoLocalId
    : Number(golesVisita) > Number(golesLocal)
      ? match.equipoVisitaId
      : "";
  const selectedWinner = isDraw ? winnerId : inferredWinner;
  const canSave = Number.isFinite(Number(golesLocal)) && Number.isFinite(Number(golesVisita)) && (!isDraw || Boolean(winnerId));

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.68)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={{ width: "100%", maxWidth: 430, background: CARD, border: `1px solid ${BORDER}`, borderTop: `3px solid ${CU}`, borderRadius: 16, padding: 24, boxShadow: "0 24px 64px rgba(0,0,0,0.25)", fontFamily: FONT }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: TEXT }}>Registrar resultado</div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{local?.nombre ?? "Local"} vs {visita?.nombre ?? "Visita"}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", padding: 4 }}><X size={18} /></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
          {[
            { label: local?.nombre ?? "Local", value: golesLocal, setValue: setGolesLocal },
            { label: visita?.nombre ?? "Visita", value: golesVisita, setValue: setGolesVisita },
          ].map(field => (
            <label key={field.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: MUTED }}>{field.label.toUpperCase()}</span>
              <input type="number" min={0} value={field.value} onChange={e => field.setValue(Math.max(0, Number(e.target.value)))} style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: 10, border: `1px solid ${BORDER}`, background: BG, color: TEXT, fontSize: 22, fontWeight: 900, textAlign: "center", outline: "none" }} />
            </label>
          ))}
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: MUTED, marginBottom: 8 }}>GANADOR</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[local, visita].filter(Boolean).map(team => (
              <label key={team.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: `1px solid ${selectedWinner === team.id ? CU_BOR : BORDER}`, background: selectedWinner === team.id ? CU_DIM : BG, color: selectedWinner === team.id ? CU : TEXT, fontSize: 13, fontWeight: 800 }}>
                <input type="radio" checked={selectedWinner === team.id} disabled={!isDraw} onChange={() => setWinnerId(team.id)} />
                {team.nombre}
              </label>
            ))}
          </div>
          {isDraw && <div style={{ fontSize: 11, color: MUTED, marginTop: 8 }}>El marcador esta empatado. Selecciona el ganador definido por penales o reglamento.</div>}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "transparent", color: MUTED, fontWeight: 800, cursor: "pointer" }}>Cancelar</button>
          <button disabled={!canSave} onClick={() => onSave(Number(golesLocal), Number(golesVisita), selectedWinner)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: canSave ? CU : BORDER, color: "#FFF", fontWeight: 900, cursor: canSave ? "pointer" : "not-allowed" }}>Guardar</button>
        </div>
      </motion.div>
    </div>
  );
}
export default function FaseFinalPage({ onGoTorneos }) {
  const torneoActivoId  = useTorneosStore(s => s.torneoActivoId);
  const allPartidos     = useTorneosStore(s => s.partidos);
  const allEquipos      = useTorneosStore(s => s.equipos);
  const allCategorias   = useTorneosStore(s => s.categorias);
  const setPartidos     = useTorneosStore(s => s.setPartidos);

  const [activeCatId, setActiveCatId] = useState(null);
  const [resultMatch, setResultMatch] = useState(null);

  if (!torneoActivoId) {
    return <ModuleEmptyState icon={Trophy} title="Selecciona un torneo" subtitle="Debes abrir un torneo para ver la fase final." ctaLabel="Ver torneos" onCta={onGoTorneos} />;
  }

  const categorias = allCategorias.filter(c => c.torneoId === torneoActivoId && (c.format === "grupos_playoffs" || c.format === "eliminacion"));
  if (categorias.length === 0) {
    return <ModuleEmptyState icon={Trophy} title="Sin fase final" subtitle='Este torneo no tiene categorías con fase final.' />;
  }

  const activeCat = categorias.find(c => c.id === activeCatId) ?? categorias[0];
  const partidos  = allPartidos.filter(p => p.torneoId === torneoActivoId && p.categoriaId === activeCat.id && p.source === "knockout");
  const equipos   = allEquipos.filter(e => e.torneoId === torneoActivoId);

  if (partidos.length === 0) {
    return (
      <ModuleEmptyState
        icon={Trophy}
        title="Fase final no generada"
        subtitle="Aún no se ha generado la fase final para esta categoría."
      />
    );
  }

  // Agrupar por fase
  const matchPhases = { octavos: [], cuartos: [], semis: [], final: [] };
  partidos.forEach(p => {
    if (matchPhases[p.fase]) matchPhases[p.fase].push(p);
  });

  // Identificar las fases que tienen partidos
  const activePhases = Object.keys(matchPhases).filter(k => matchPhases[k].length > 0);

  const saveKnockoutResult = async (match, gl, gv, winnerId) => {
    // Actualizar resultado
    await useTorneosStore.getState().registrarResultado(match.id, gl, gv);

    // Avanzar ganador
    if (winnerId) {
      const storeState = useTorneosStore.getState();
      const currentMatches = storeState.partidos.filter(p => p.torneoId === torneoActivoId);
      const nextMatches = advanceKnockoutWinner(currentMatches, match.id, winnerId);
      const targetMatch = nextMatches.find(next => {
        const current = currentMatches.find(prev => prev.id === next.id);
        if (!current || next.id === match.id) return false;
        const changedSlot =
          current.equipoLocalId !== next.equipoLocalId ||
          current.equipoVisitaId !== next.equipoVisitaId;
        const containsWinner =
          next.equipoLocalId === winnerId ||
          next.equipoVisitaId === winnerId;
        return changedSlot && containsWinner;
      });

      await setPartidos(torneoActivoId, nextMatches);

      if (targetMatch) {
        await storeState.registrarAvanceFase({
          torneoId: torneoActivoId,
          matchId: match.id,
          winnerTeamId: winnerId,
          fromPhase: match.fase,
          toPhase: targetMatch.fase,
          targetMatchId: targetMatch.id,
        });
      }
    }
    setResultMatch(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: FONT }}>
      <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em" }}>
            Fase Final
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: MUTED }}>
            Llaves eliminatorias de la categoría {activeCat.nombre}
          </p>
        </div>
      </header>

      {/* Tabs de categorías si hay más de una */}
      {categorias.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCatId(cat.id)}
              style={{
                padding: "7px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                border: `1px solid ${activeCat.id === cat.id ? CU : BORDER}`,
                background: activeCat.id === cat.id ? CU_DIM : "#FFF",
                color: activeCat.id === cat.id ? CU : MUTED,
                cursor: "pointer", fontFamily: FONT,
              }}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Bracket Layout — scroll-snap for touch precision on mobile */}
      <div style={{ display: "flex", gap: 40, overflowX: "auto", padding: "10px 0 40px", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
        {activePhases.map((phaseName, i) => {
          const phaseMatches = matchPhases[phaseName].sort((a, b) => a.orden - b.orden);
          return (
            <div key={phaseName} style={{ display: "flex", flexDirection: "column", gap: 32, flexShrink: 0, scrollSnapAlign: "start", minWidth: 220 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: MUTED, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {phaseName}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 32, justifyContent: "space-around", flex: 1 }}>
                {phaseMatches.map(m => (
                  <MatchNode key={m.id} match={m} equipos={equipos} onRegisterResult={setResultMatch} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {resultMatch && (
        <KnockoutResultModal
          match={resultMatch}
          equipos={equipos}
          onClose={() => setResultMatch(null)}
          onSave={(gl, gv, winnerId) => saveKnockoutResult(resultMatch, gl, gv, winnerId)}
        />
      )}
    </motion.div>
  );
}
