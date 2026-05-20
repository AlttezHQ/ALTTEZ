import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Shield, Users, Upload, Plus, Trash2, CheckCircle2, ChevronRight, Save, Info, AlertTriangle } from "lucide-react";
import { PALETTE, ELEVATION } from "../../../shared/tokens/palette";
import { supabase, isSupabaseReady } from "../../../shared/lib/supabase";
import { uploadImage } from "../utils/storageHelper";

const CU      = PALETTE.bronce;
const CU_DIM  = PALETTE.bronceDim;
const CU_BOR  = PALETTE.bronceBorder;
const BG      = PALETTE.bg;
const CARD    = PALETTE.surface;
const TEXT    = PALETTE.text;
const MUTED   = PALETTE.textMuted;
const BORDER  = PALETTE.border;
const HINT    = PALETTE.textHint;
const FONT    = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";

export default function RegistroEquipoPage() {
  const { slug, equipoId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [torneo, setTorneo] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: "",
    escudo: "",
    entrenador: "",
    delegado: "",
    jugadores: []
  });

  const [nuevoJugador, setNuevoJugador] = useState({ nombre: "", dorsal: "", documento: "" });
  const nombreInputRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      if (!isSupabaseReady) return;
      try {
        // Fetch torneo
        const { data: tData } = await supabase.from("torneos").select("id, nombre, portada, perfil").eq("slug", slug).single();
        if (tData) setTorneo(tData);

        // Fetch equipo
        const { data: eData } = await supabase.from("torneo_equipos").select("*").eq("id", equipoId).single();
        if (eData) {
          setFormData({
            nombre: eData.nombre || "",
            escudo: eData.escudo || eData.logo || "",
            entrenador: eData.entrenador || "",
            delegado: eData.delegado || "",
            jugadores: eData.jugadores || []
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, equipoId]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    const url = await uploadImage(file);
    if (url) setFormData({ ...formData, escudo: url });
    setSaving(false);
  };

  const handleAddJugador = () => {
    if (!nuevoJugador.nombre.trim()) return;
    const j = { 
      id: crypto.randomUUID(), 
      nombre: nuevoJugador.nombre.trim(), 
      dorsal: nuevoJugador.dorsal.trim(),
      documento: nuevoJugador.documento.trim()
    };
    setFormData(prev => ({ ...prev, jugadores: [...prev.jugadores, j] }));
    setNuevoJugador({ nombre: "", dorsal: "", documento: "" });
    nombreInputRef.current?.focus();
  };

  const removeJugador = (id) => {
    setFormData(prev => ({ ...prev, jugadores: prev.jugadores.filter(p => p.id !== id) }));
  };

  const handleSave = async () => {
    if (!isSupabaseReady) return;
    setSaving(true);
    const { error } = await supabase.rpc("update_equipo_public", {
      p_equipo_id: equipoId,
      p_escudo: formData.escudo,
      p_entrenador: formData.entrenador,
      p_delegado: formData.delegado,
      p_jugadores: formData.jugadores
    });
    setSaving(false);
    if (!error) {
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setErrorMsg("No se pudieron guardar los datos en la base de datos. Por favor, intenta nuevamente en unos momentos.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: BG, fontFamily: FONT }}>
        <div style={{ textAlign: "center", color: MUTED }}>Cargando información del equipo...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: CARD, borderRadius: 24, padding: 40, maxWidth: 460, width: "100%", textAlign: "center", border: `1px solid ${BORDER}`, boxShadow: ELEVATION.card }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: PALETTE.successDim, border: `1px solid ${PALETTE.successBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <CheckCircle2 size={40} color={PALETTE.success} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 12px", color: TEXT }}>¡Registro completado!</h2>
            <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>La información del equipo y la plantilla han sido guardadas correctamente en la base de datos del torneo.</p>
            <Link to={`/t/${slug}?tab=equipos`} style={{ display: "inline-block", background: CU, color: "#FFF", padding: "14px 32px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
              Ir a la página del Torneo
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT }}>
      {/* Error Modal */}
      <AnimatePresence>
        {errorMsg && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} style={{ background: CARD, borderRadius: 24, width: 400, padding: 32, boxShadow: ELEVATION.panel, border: `1px solid ${BORDER}`, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${PALETTE.danger}15`, border: `1px solid ${PALETTE.danger}33`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <AlertTriangle size={32} color={PALETTE.danger} />
              </div>
              <h3 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 800, color: TEXT }}>Error al guardar</h3>
              <p style={{ margin: "0 0 24px", fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{errorMsg}</p>
              <button onClick={() => setErrorMsg(null)} style={{ width: "100%", padding: "14px", borderRadius: 12, border: `1px solid ${BORDER}`, background: BG, color: TEXT, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Compacto del Torneo */}
      <div style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, padding: "16px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          {torneo?.perfil ? (
            <img src={torneo.perfil} alt="Logo Torneo" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: 8, background: CU_DIM, display: "flex", alignItems: "center", justifyContent: "center" }}><Trophy size={20} color={CU}/></div>
          )}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em" }}>Registro de Equipo</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: TEXT }}>{torneo?.nombre || "Torneo"}</div>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 800, margin: "40px auto", padding: "0 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: CU_DIM, border: `1px solid ${CU_BOR}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {formData.escudo ? <img src={formData.escudo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Shield size={32} color={CU} />}
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>{formData.nombre}</h1>
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>Completa la información técnica y la plantilla de jugadores.</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Sección 1: Información General */}
          <section style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: ELEVATION.card }}>
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${BORDER}`, background: "#FDFDFB", display: "flex", alignItems: "center", gap: 10 }}>
              <Info size={18} color={CU} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Información General</h3>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center", padding: 16, background: BG, borderRadius: 16, border: `1px dashed ${BORDER}`, marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: 12, background: CARD, border: `1px solid ${BORDER}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {formData.escudo ? <img src={formData.escudo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Upload size={24} color={HINT} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: TEXT, marginBottom: 4 }}>ESCUDO O LOGO DEL EQUIPO</div>
                  <label style={{ fontSize: 13, color: CU, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, background: CU_DIM, padding: "6px 12px", borderRadius: 8, border: `1px solid ${CU_BOR}` }}>
                    <Plus size={14} /> {formData.escudo ? "Cambiar imagen" : "Subir imagen"}
                    <input type="file" hidden accept="image/*" onChange={handleLogoUpload} disabled={saving} />
                  </label>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: MUTED, marginBottom: 8 }}>NOMBRE DEL ENTRENADOR</label>
                  <input type="text" placeholder="Ej: Carlos Silva" value={formData.entrenador} onChange={e => setFormData({ ...formData, entrenador: e.target.value })} style={inputStyles} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: MUTED, marginBottom: 8 }}>DELEGADO / CONTACTO</label>
                  <input type="text" placeholder="Ej: Juan Pérez" value={formData.delegado} onChange={e => setFormData({ ...formData, delegado: e.target.value })} style={inputStyles} />
                </div>
              </div>
            </div>
          </section>

          {/* Sección 2: Plantilla de Jugadores */}
          <section style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: ELEVATION.card }}>
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${BORDER}`, background: "#FDFDFB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Users size={18} color={CU} />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Plantilla de Jugadores</h3>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: CU, background: CU_DIM, padding: "4px 10px", borderRadius: 8 }}>{formData.jugadores.length} registrados</div>
            </div>
            
            <div style={{ padding: 24 }}>
              {/* Formulario rápido para añadir */}
              <div style={{ display: "flex", gap: 10, marginBottom: 24, padding: 16, background: BG, borderRadius: 16, border: `1px solid ${BORDER}` }}>
                <div style={{ width: 60 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: MUTED, marginBottom: 4 }}>N°</label>
                  <input type="text" placeholder="10" value={nuevoJugador.dorsal} onChange={e => setNuevoJugador({ ...nuevoJugador, dorsal: e.target.value })} style={inputStyles} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: MUTED, marginBottom: 4 }}>NOMBRE COMPLETO</label>
                  <input ref={nombreInputRef} type="text" placeholder="Ej: Lionel Messi" value={nuevoJugador.nombre} onChange={e => setNuevoJugador({ ...nuevoJugador, nombre: e.target.value })} onKeyDown={e => e.key === "Enter" && handleAddJugador()} style={inputStyles} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: MUTED, marginBottom: 4 }}>DOCUMENTO (Opcional)</label>
                  <input type="text" placeholder="DNI / ID" value={nuevoJugador.documento} onChange={e => setNuevoJugador({ ...nuevoJugador, documento: e.target.value })} onKeyDown={e => e.key === "Enter" && handleAddJugador()} style={inputStyles} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button onClick={handleAddJugador} style={{ height: 42, width: 42, borderRadius: 10, background: CU, border: "none", color: "#FFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Agregar jugador">
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Lista de Jugadores */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {formData.jugadores.length === 0 ? (
                  <div style={{ padding: "40px 0", textAlign: "center", color: MUTED, background: BG, borderRadius: 12, border: `1px dashed ${BORDER}` }}>
                    <Users size={32} style={{ opacity: 0.2, margin: "0 auto 12px" }} />
                    <div style={{ fontSize: 14, fontWeight: 700 }}>No hay jugadores registrados</div>
                    <div style={{ fontSize: 12 }}>Añade tu plantilla usando el formulario superior.</div>
                  </div>
                ) : (
                  formData.jugadores.map((j) => (
                    <div key={j.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#FDFDFB", borderRadius: 12, border: `1px solid ${BORDER}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: CARD, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: CU }}>{j.dorsal || "-"}</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{j.nombre}</div>
                          {j.documento && <div style={{ fontSize: 11, color: MUTED }}>ID: {j.documento}</div>}
                        </div>
                      </div>
                      <button onClick={() => removeJugador(j.id)} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", padding: 8 }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Acciones */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button 
              disabled={saving || formData.jugadores.length === 0}
              onClick={handleSave}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 32px", borderRadius: 14, border: "none", background: formData.jugadores.length === 0 ? BORDER : CU, color: formData.jugadores.length === 0 ? MUTED : "#FFF", fontSize: 15, fontWeight: 800, cursor: formData.jugadores.length === 0 ? "not-allowed" : "pointer", boxShadow: formData.jugadores.length > 0 ? `0 8px 24px ${CU}40` : "none" }}
            >
              <Save size={18} /> {saving ? "Guardando..." : "Guardar Equipo"}
            </button>
          </div>
          {formData.jugadores.length === 0 && (
            <div style={{ textAlign: "right", fontSize: 12, color: MUTED, marginTop: 8 }}>Debes agregar al menos un jugador para poder guardar.</div>
          )}
        </div>
      </main>
    </div>
  );
}

const inputStyles = {
  width: "100%", boxSizing: "border-box", border: `1px solid ${BORDER}`, borderRadius: 10,
  padding: "10px 14px", fontSize: 13, color: TEXT, fontFamily: FONT, background: BG, outline: "none",
  height: 42
};
