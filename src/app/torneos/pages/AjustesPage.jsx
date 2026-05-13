import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Globe, Copy, Check, Info, Image, Gift, Phone, Users, Plus, Trash2, Shield } from "lucide-react";
import { useTorneosStore } from "../store/useTorneosStore";
import ModuleEmptyState from "../components/shared/ModuleEmptyState";
import { PALETTE, ELEVATION } from "../../../shared/tokens/palette";
import { uploadImage } from "../utils/storageHelper";

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
  const allTorneos       = useTorneosStore(s => s.torneos);
  const actualizarTorneo = useTorneosStore(s => s.actualizarTorneo);
  const publicarTorneo   = useTorneosStore(s => s.publicarTorneo);

  const torneo = allTorneos.find(t => t.id === torneoActivoId) ?? null;

  const [form, setForm]     = useState({ 
    nombre: "", deporte: "", temporada: "", fechaInicio: "", fechaFin: "",
    organizador: "", sedePrincipal: "",
    descripcion: "", contacto: "", premios: "", visibilidad: "publico"
  });
  const [saved, setSaved]   = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState({ perfil: false, portada: false, sponsor: false });

  useEffect(() => {
    if (torneo) {
      setForm({ 
        nombre: torneo.nombre, 
        deporte: torneo.deporte, 
        temporada: torneo.temporada ?? "",
        fechaInicio: torneo.fechaInicio ?? "",
        fechaFin: torneo.fechaFin ?? "",
        organizador: torneo.organizador ?? "",
        sedePrincipal: torneo.sedePrincipal ?? "",
        descripcion: torneo.descripcion ?? "",
        contacto: torneo.contacto ?? "",
        premios: torneo.premios ?? "",
        visibilidad: torneo.visibilidad ?? "publico"
      });
    }
  }, [torneoActivoId, torneo]);

  if (!torneoActivoId || !torneo) {
    return <ModuleEmptyState icon={Settings} title="Selecciona un torneo" subtitle="Abre un torneo para ver y editar sus ajustes." ctaLabel="Ver torneos" onCta={onGoTorneos} />;
  }

  const publicUrl = `${window.location.origin}/t/${torneo.slug}`;

  const handleSave = async () => {
    await actualizarTorneo(torneoActivoId, { ...form });
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
            <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>TEMPORADA</label>
            <input
              type="text" value={form.temporada} placeholder="Ej: 2026-I"
              onChange={e => setForm(f => ({ ...f, temporada: e.target.value }))}
              style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: TEXT, fontFamily: FONT, background: BG, outline: "none" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>FECHA DE INICIO</label>
              <input
                type="date" value={form.fechaInicio}
                onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))}
                style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: TEXT, fontFamily: FONT, background: BG, outline: "none" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>FECHA DE FIN</label>
              <input
                type="date" value={form.fechaFin}
                onChange={e => setForm(f => ({ ...f, fechaFin: e.target.value }))}
                style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: TEXT, fontFamily: FONT, background: BG, outline: "none" }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>ORGANIZADOR</label>
            <input
              type="text" value={form.organizador}
              onChange={e => setForm(f => ({ ...f, organizador: e.target.value }))}
              style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: TEXT, fontFamily: FONT, background: BG, outline: "none" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>SEDE PRINCIPAL</label>
            <input
              type="text" value={form.sedePrincipal}
              onChange={e => setForm(f => ({ ...f, sedePrincipal: e.target.value }))}
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

      {/* Identidad Visual */}
      <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: 24, marginBottom: 16, boxShadow: ELEV }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Image size={16} color={CU} />
          <div style={{ fontSize: 11, fontWeight: 700, color: CU, letterSpacing: "0.1em" }}>IDENTIDAD VISUAL</div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 8 }}>LOGO / PERFIL</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", border: `2px dashed ${BORDER}`, borderRadius: 12, padding: 16 }}>
              {torneo.perfil ? (
                <img src={torneo.perfil} alt="Perfil" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Settings size={32} color={BORDER} />
                </div>
              )}
              <input 
                type="file" accept="image/*"
                disabled={uploading.perfil}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(u => ({ ...u, perfil: true }));
                  const url = await uploadImage(file, "perfil");
                  if (url) await actualizarTorneo(torneo.id, { perfil: url });
                  setUploading(u => ({ ...u, perfil: false }));
                }}
                style={{ fontSize: 10, width: "100%" }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 8 }}>FOTO DE PORTADA</label>
            <div style={{ border: `2px dashed ${BORDER}`, borderRadius: 12, height: 140, background: torneo.portada ? `url(${torneo.portada}) center/cover` : BG, position: "relative", overflow: "hidden" }}>
              <input 
                type="file" accept="image/*"
                disabled={uploading.portada}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(u => ({ ...u, portada: true }));
                  const url = await uploadImage(file, "portada");
                  if (url) await actualizarTorneo(torneo.id, { portada: url });
                  setUploading(u => ({ ...u, portada: false }));
                }}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
              />
              <div style={{ position: "absolute", bottom: 0, width: "100%", background: "rgba(0,0,0,0.4)", color: "#FFF", fontSize: 10, textAlign: "center", padding: "4px 0" }}>
                {uploading.portada ? "Subiendo..." : "Clic para cambiar portada"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información Detallada */}
      <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: 24, marginBottom: 16, boxShadow: ELEV }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Info size={16} color={CU} />
          <div style={{ fontSize: 11, fontWeight: 700, color: CU, letterSpacing: "0.1em" }}>INFORMACIÓN DETALLADA</div>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>DESCRIPCIÓN</label>
            <textarea 
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Habla sobre el torneo, reglas básicas, etc..."
              style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: TEXT, fontFamily: FONT, background: BG, minHeight: 80, resize: "vertical", outline: "none" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}><Phone size={10} /> CONTACTO</label>
              <input 
                type="text" value={form.contacto}
                onChange={e => setForm(f => ({ ...f, contacto: e.target.value }))}
                placeholder="WhatsApp / Celular"
                style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: TEXT, fontFamily: FONT, background: BG, outline: "none" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}><Gift size={10} /> PREMIOS</label>
              <input 
                type="text" value={form.premios}
                onChange={e => setForm(f => ({ ...f, premios: e.target.value }))}
                placeholder="Ej. $1.000.000 + Trofeo"
                style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: TEXT, fontFamily: FONT, background: BG, outline: "none" }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}><Shield size={10} /> VISIBILIDAD</label>
            <div style={{ display: "flex", gap: 10 }}>
              {["publico", "privado"].map(v => (
                <button 
                  key={v}
                  onClick={() => setForm(f => ({ ...f, visibilidad: v }))}
                  style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${form.visibilidad === v ? CU : BORDER}`, background: form.visibilidad === v ? CU_DIM : BG, color: form.visibilidad === v ? CU : MUTED, fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "capitalize" }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>REGLAMENTO (PDF/DOC)</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {torneo.reglamentoUrl ? (
                <a href={torneo.reglamentoUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: CU, fontWeight: 700, textDecoration: "none" }}>Ver reglamento actual</a>
              ) : (
                <span style={{ fontSize: 12, color: MUTED }}>No se ha subido reglamento.</span>
              )}
              <input 
                type="file" 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadImage(file, "docs");
                  if (url) await actualizarTorneo(torneo.id, { reglamentoUrl: url });
                }}
                style={{ fontSize: 10 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Patrocinadores */}
      <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: 24, marginBottom: 16, boxShadow: ELEV }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Users size={16} color={CU} />
          <div style={{ fontSize: 11, fontWeight: 700, color: CU, letterSpacing: "0.1em" }}>PATROCINADORES</div>
        </div>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
          {torneo.patrocinadores?.map(s => (
            <div key={s.id} style={{ position: "relative", width: 60, height: 60, borderRadius: 8, border: `1px solid ${BORDER}`, background: `url(${s.logo}) center/contain no-repeat ${BG}` }}>
              <button 
                onClick={async () => await actualizarTorneo(torneo.id, { patrocinadores: torneo.patrocinadores.filter(x => x.id !== s.id) })}
                style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#EF4444", color: "#FFF", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
          <label style={{ width: 60, height: 60, borderRadius: 8, border: `2px dashed ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: MUTED }}>
            <Plus size={20} />
            <input 
              type="file" accept="image/*"
              style={{ display: "none" }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = await uploadImage(file, "sponsors");
                if (url) {
                  const s = { id: Date.now().toString(), nombre: file.name, logo: url };
                  await actualizarTorneo(torneo.id, { patrocinadores: [...(torneo.patrocinadores || []), s] });
                }
              }}
            />
          </label>
        </div>
        <p style={{ fontSize: 10, color: MUTED, margin: 0 }}>Añade marcas que patrocinan el torneo. Se mostrarán en un banner dinámico en la vista pública.</p>
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
              onClick={async () => await actualizarTorneo(torneoActivoId, { publicado: false, estado: "borrador" })}
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
              onClick={async () => await publicarTorneo(torneoActivoId)}
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
