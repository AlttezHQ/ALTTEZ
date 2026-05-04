import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Globe, Copy, Check } from "lucide-react";
import { useTorneosStore } from "../store/useTorneosStore";
import ModuleEmptyState from "../components/shared/ModuleEmptyState";
import { PALETTE, ELEVATION } from "../../../shared/tokens/palette";

const CU     = PALETTE.bronce;
const CU_DIM = PALETTE.bronceDim;
const CU_BOR = PALETTE.bronceBorder;
const CARD   = PALETTE.surface;
const BG     = PALETTE.bg;
const TEXT   = PALETTE.text;
const MUTED  = PALETTE.textMuted;
const BORDER = PALETTE.border;
const ELEV   = ELEVATION?.card ?? "0 10px 28px rgba(23,26,28,0.07)";
const FONT   = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
const EASE   = [0.22, 1, 0.36, 1];
const SPORTS  = ["Fútbol", "Básquet", "Vóleibol", "Tenis", "Pádel", "Rugby", "Otro"];

export default function AjustesPage({ onGoTorneos }) {
  const torneoActivoId   = useTorneosStore(s => s.torneoActivoId);
  const getTorneoById    = useTorneosStore(s => s.getTorneoById);
  const actualizarTorneo = useTorneosStore(s => s.actualizarTorneo);
  const publicarTorneo   = useTorneosStore(s => s.publicarTorneo);

  const torneo = getTorneoById(torneoActivoId);

  const [form, setForm]     = useState({ nombre: "", deporte: "", fechaInicio: "" });
  const [saved, setSaved]   = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (torneo) setForm({ nombre: torneo.nombre, deporte: torneo.deporte, fechaInicio: torneo.fechaInicio ?? "" });
  }, [torneoActivoId]);

  if (!torneoActivoId || !torneo) {
    return <ModuleEmptyState icon={Settings} title="Selecciona un torneo" subtitle="Abre un torneo para ver y editar sus ajustes." ctaLabel="Ver torneos" onCta={onGoTorneos} />;
  }

  const publicUrl = `${window.location.origin}/t/${torneo.slug}`;

  const handleSave = () => {
    actualizarTorneo(torneoActivoId, { nombre: form.nombre, deporte: form.deporte, fechaInicio: form.fechaInicio });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: EASE }} style={{ fontFamily: FONT, maxWidth: 560 }}>
      <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>Ajustes del torneo</h2>

      {/* Edit form */}
      <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: 24, marginBottom: 16, boxShadow: ELEV }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: CU, letterSpacing: "0.1em", marginBottom: 16 }}>INFORMACIÓN BÁSICA</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>NOMBRE DEL TORNEO</label>
            <input
              type="text" value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: TEXT, fontFamily: FONT, background: BG, outline: "none" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>DEPORTE</label>
            <select
              value={form.deporte}
              onChange={e => setForm(f => ({ ...f, deporte: e.target.value }))}
              style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: TEXT, fontFamily: FONT, background: BG, outline: "none", appearance: "none" }}
            >
              {SPORTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>FECHA DE INICIO</label>
            <input
              type="date" value={form.fechaInicio}
              onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))}
              style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: TEXT, fontFamily: FONT, background: BG, outline: "none" }}
            />
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 7, background: saved ? PALETTE.success : CU, color: "#FFF", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer", transition: "background 0.2s" }}
        >
          {saved ? <><Check size={14} />Guardado</> : "Guardar cambios"}
        </motion.button>
      </div>

      {/* Vista pública */}
      <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: 24, boxShadow: ELEV }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Globe size={16} color={CU} />
          <span style={{ fontSize: 11, fontWeight: 700, color: CU, letterSpacing: "0.1em" }}>VISTA PÚBLICA</span>
        </div>

        {torneo.publicado ? (
          <>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 12, lineHeight: 1.6 }}>
              El torneo es público. Cualquiera con el enlace puede ver el fixture y la tabla de posiciones.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px", fontSize: 11, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {publicUrl}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleCopy}
                style={{ display: "flex", alignItems: "center", gap: 6, background: copied ? PALETTE.successDim : CU_DIM, color: copied ? PALETTE.success : CU, border: `1px solid ${copied ? PALETTE.successBorder : CU_BOR}`, borderRadius: 8, padding: "0 14px", fontSize: 12, fontWeight: 600, fontFamily: FONT, cursor: "pointer", transition: "all 0.2s" }}
              >
                {copied ? <><Check size={12} />Copiado</> : <><Copy size={12} />Copiar</>}
              </motion.button>
            </div>
            <button
              onClick={() => actualizarTorneo(torneoActivoId, { publicado: false, estado: "borrador" })}
              style={{ marginTop: 12, background: "none", border: "none", color: MUTED, fontSize: 11, fontFamily: FONT, cursor: "pointer", padding: 0 }}
            >
              Despublicar torneo
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 14, lineHeight: 1.6 }}>
              Publica el torneo para generar una URL pública que puedes compartir con equipos y seguidores.
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => publicarTorneo(torneoActivoId)}
              style={{ display: "flex", alignItems: "center", gap: 7, background: CU, color: "#FFF", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}
            >
              <Globe size={14} />Publicar torneo
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}
