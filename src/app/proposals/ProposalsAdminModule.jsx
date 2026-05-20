/**
 * @component ProposalsAdminModule
 * @description Panel de gestión de propuestas comerciales — módulo interno CRM ALTTEZ.
 * Permite crear, ver, compartir y monitorear propuestas enviadas a clientes, socios e inversionistas.
 *
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getProposals, insertProposal, updateProposal, deleteProposal,
  setProposalsClubId,
} from "../../shared/services/proposalsService";
import { showToast } from "../../shared/ui/Toast";
import { PALETTE as C } from "../../shared/tokens/palette";

const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
const CU   = "#CE8946";
const CU_HI = "#D8A06B";
const CU_DIM = "rgba(206,137,70,0.10)";
const CU_BOR = "rgba(206,137,70,0.28)";
const BG   = "#F6F1EA";
const CARD = "#FFFFFF";
const TEXT = "#1F1F1D";
const MUTED = "#667085";
const HINT = "#9ca3af";
const BORDER = "#E9E2D7";
const DANGER = "#D95C5C";
const SUCCESS = "#2FA56F";

const EASE = [0.22, 1, 0.36, 1];

// ── Status config ──
const STATUS_MAP = {
  creada:          { label:"Creada",         color:"#667085", bg:"rgba(102,112,133,0.10)", border:"rgba(102,112,133,0.24)" },
  enviada:         { label:"Enviada",         color:"#2563eb", bg:"rgba(37,99,235,0.08)",  border:"rgba(37,99,235,0.24)" },
  aceptada:        { label:"Aceptada ✓",     color: SUCCESS,  bg:"rgba(47,165,111,0.08)", border:"rgba(47,165,111,0.24)" },
  contrapropuesta: { label:"Contrapropuesta", color: CU,       bg: CU_DIM,                 border: CU_BOR },
  rechazada:       { label:"Rechazada",       color: DANGER,   bg:"rgba(217,92,92,0.08)",  border:"rgba(217,92,92,0.24)" },
};

// ── Icons ──
const Ico = {
  Plus: () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={CARD} strokeWidth="2" strokeLinecap="round"/></svg>,
  Copy: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke={MUTED} strokeWidth="1.8"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke={MUTED} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  Eye: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={MUTED} strokeWidth="1.8"/><circle cx="12" cy="12" r="3" stroke={MUTED} strokeWidth="1.8"/></svg>,
  Trash: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none"><polyline points="3,6 5,6 21,6" stroke={DANGER} strokeWidth="1.8" strokeLinecap="round"/><path d="M19 6l-1 14H6L5 6" stroke={DANGER} strokeWidth="1.8" strokeLinecap="round"/><path d="M10 11v6M14 11v6M9 6V4h6v2" stroke={DANGER} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  Send: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={CU} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  X: () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke={MUTED} strokeWidth="2" strokeLinecap="round"/></svg>,
  ChevDown: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={MUTED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Check: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={SUCCESS} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Lock: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="3" stroke={MUTED} strokeWidth="1.8"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={MUTED} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  Briefcase: () => <svg width={22} height={22} viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke={CU} strokeWidth="1.8"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke={CU} strokeWidth="1.8"/><line x1="12" y1="12" x2="12" y2="16" stroke={CU} strokeWidth="1.8" strokeLinecap="round"/><line x1="8" y1="14" x2="16" y2="14" stroke={CU} strokeWidth="1.8" strokeLinecap="round"/></svg>,
};

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { day:"2-digit", month:"short", year:"numeric" });
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.creada;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"4px 10px", borderRadius:999, fontSize:11, fontWeight:700, color: s.color, background: s.bg, border:`1px solid ${s.border}`, letterSpacing:"0.06em", whiteSpace:"nowrap" }}>
      {s.label}
    </span>
  );
}

// ── Empty State ──
function EmptyProposals({ onCreate }) {
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, ease: EASE }}
      style={{ textAlign:"center", padding:"80px 24px" }}>
      <div style={{ width:72, height:72, borderRadius:22, background: CU_DIM, border:`1.5px solid ${CU_BOR}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
        <Ico.Briefcase />
      </div>
      <div style={{ fontFamily: FONT, fontSize:20, fontWeight:800, color: TEXT, marginBottom:10 }}>Sin propuestas todavía</div>
      <div style={{ fontFamily: FONT, fontSize:14, color: MUTED, maxWidth:340, margin:"0 auto 28px", lineHeight:1.6 }}>
        Crea tu primera propuesta personalizada para enviar a clientes, socios o inversionistas con un enlace confidencial único.
      </div>
      <button onClick={onCreate} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 22px", borderRadius:12, border:"none", background:`linear-gradient(135deg, ${CU} 0%, #B7832D 100%)`, color: CARD, fontSize:14, fontWeight:800, fontFamily: FONT, cursor:"pointer", boxShadow:`0 8px 24px ${CU_DIM}` }}>
        <Ico.Plus /> Crear primera propuesta
      </button>
    </motion.div>
  );
}

// ════════════════════════════════════════════════
// Create Form Modal
// ════════════════════════════════════════════════
const EMPTY_FORM = {
  client_name:"", title:"Construyamos juntos el futuro de ALTTEZ.", subtitle:"Una alianza estratégica para impulsar ALTTEZ.",
  description:"Gracias a tu red, contactos y visión comercial, podemos abrir juntos las puertas del próximo nivel. Esta es una invitación a ser parte del proyecto desde el inicio.",
  fecha: new Date().toISOString().slice(0,10),
  rol:"", participacion_pct: 10, impacto:"", beneficios:["","","",""],
};

function CreateModal({ clubId, onCreated, onClose }) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1); // 1: datos cliente, 2: términos, 3: revisión

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setBeneficio = (i, v) => setForm(f => { const b = [...f.beneficios]; b[i] = v; return { ...f, beneficios: b }; });
  const addBeneficio = () => setForm(f => ({ ...f, beneficios: [...f.beneficios, ""] }));
  const removeBeneficio = (i) => setForm(f => ({ ...f, beneficios: f.beneficios.filter((_,idx) => idx !== i) }));

  async function handleSave(status = "creada") {
    if (!form.client_name.trim() || !form.title.trim()) {
      showToast("El nombre del cliente y el título son obligatorios.", "warning");
      return;
    }
    setSaving(true);
    try {
      const p = await insertProposal({
        club_id: clubId || "local",
        ...form,
        beneficios: form.beneficios.filter(b => b.trim()),
        participacion_pct: Number(form.participacion_pct),
        status,
      });
      showToast(`Propuesta para ${form.client_name} creada exitosamente.`, "success");
      onCreated(p);
    } catch {
      showToast("Error al crear la propuesta. Inténtalo de nuevo.", "error");
    }
    setSaving(false);
  }

  const inputStyle = {
    fontFamily: FONT, width:"100%", padding:"11px 14px", border:`1px solid ${BORDER}`,
    borderRadius:10, background: CARD, color: TEXT, fontSize:14, outline:"none",
    transition:"border-color 0.2s",
  };

  const labelStyle = { fontFamily: FONT, fontSize:12, fontWeight:700, color: MUTED, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:6 };

  const steps = [
    { n:1, label:"Cliente" },
    { n:2, label:"Términos" },
    { n:3, label:"Revisar" },
  ];

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(10,12,18,0.60)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div initial={{ opacity:0, scale:0.95, y:16 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.97, y:8 }} transition={{ duration:0.35, ease: EASE }}
        style={{ width:"100%", maxWidth:580, background: CARD, borderRadius:22, overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.22)", display:"flex", flexDirection:"column", maxHeight:"90vh" }}
      >
        {/* Header */}
        <div style={{ padding:"22px 24px 18px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:12, background: CU_DIM, border:`1px solid ${CU_BOR}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ico.Briefcase />
            </div>
            <div>
              <div style={{ fontFamily: FONT, fontWeight:800, fontSize:16, color: TEXT }}>Nueva propuesta</div>
              <div style={{ fontFamily: FONT, fontSize:12, color: MUTED, marginTop:2 }}>Enlace confidencial único</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:36, height:36, minHeight:36, borderRadius:10, border:`1px solid ${BORDER}`, background: BG, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Ico.X />
          </button>
        </div>

        {/* Stepper */}
        <div style={{ padding:"16px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:0, flexShrink:0 }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ display:"flex", alignItems:"center", flex: i < steps.length-1 ? 1 : 0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{
                  width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                  background: step > s.n ? CU : step === s.n ? CU : BORDER,
                  color: step >= s.n ? CARD : MUTED, fontSize:12, fontWeight:800, fontFamily: FONT,
                  flexShrink:0, transition:"all 0.25s",
                }}>
                  {step > s.n ? <Ico.Check /> : s.n}
                </div>
                <span style={{ fontSize:12, fontWeight: step === s.n ? 700 : 500, color: step >= s.n ? TEXT : HINT, fontFamily: FONT }}>{s.label}</span>
              </div>
              {i < steps.length-1 && <div style={{ flex:1, height:1, background: step > s.n ? CU : BORDER, margin:"0 12px", transition:"background 0.25s" }} />}
            </div>
          ))}
        </div>

        {/* Form Body */}
        <div style={{ overflowY:"auto", padding:"24px" }}>
          {step === 1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div>
                <label style={labelStyle}>Nombre del cliente / inversionista *</label>
                <input style={inputStyle} value={form.client_name} onChange={e => set("client_name", e.target.value)} placeholder="Ej. Juan Pérez" onFocus={e => { e.target.style.borderColor=CU; }} onBlur={e => { e.target.style.borderColor=BORDER; }} />
              </div>
              <div>
                <label style={labelStyle}>Fecha de la propuesta</label>
                <input type="date" style={inputStyle} value={form.fecha} onChange={e => set("fecha", e.target.value)} onFocus={e => { e.target.style.borderColor=CU; }} onBlur={e => { e.target.style.borderColor=BORDER; }} />
              </div>
              <div>
                <label style={labelStyle}>Título de la propuesta *</label>
                <input style={inputStyle} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ej. Construyamos juntos el futuro de ALTTEZ." onFocus={e => { e.target.style.borderColor=CU; }} onBlur={e => { e.target.style.borderColor=BORDER; }} />
              </div>
              <div>
                <label style={labelStyle}>Descripción / párrafo introductorio</label>
                <textarea rows={3} style={{ ...inputStyle, resize:"vertical", lineHeight:1.6 }} value={form.description} onChange={e => set("description", e.target.value)} onFocus={e => { e.target.style.borderColor=CU; }} onBlur={e => { e.target.style.borderColor=BORDER; }} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div>
                <label style={labelStyle}>Tu rol (descripción del rol del cliente)</label>
                <textarea rows={2} style={{ ...inputStyle, resize:"vertical", lineHeight:1.6 }} value={form.rol} onChange={e => set("rol", e.target.value)} placeholder="Ej. Serás el puente clave para que ALTTEZ ingrese al piloto con el club." onFocus={e => { e.target.style.borderColor=CU; }} onBlur={e => { e.target.style.borderColor=BORDER; }} />
              </div>
              <div>
                <label style={labelStyle}>% de participación</label>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <input type="number" min={0} max={100} step={0.5} style={{ ...inputStyle, width:120 }} value={form.participacion_pct} onChange={e => set("participacion_pct", e.target.value)} onFocus={e => { e.target.style.borderColor=CU; }} onBlur={e => { e.target.style.borderColor=BORDER; }} />
                  <span style={{ fontFamily: FONT, fontSize:18, fontWeight:900, color: CU }}>%</span>
                  <span style={{ fontFamily: FONT, fontSize:13, color: MUTED }}>de acciones de ALTTEZ</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Tu impacto</label>
                <textarea rows={2} style={{ ...inputStyle, resize:"vertical", lineHeight:1.6 }} value={form.impacto} onChange={e => set("impacto", e.target.value)} placeholder="Ej. Serás parte fundamental del crecimiento y éxito de ALTTEZ desde el inicio." onFocus={e => { e.target.style.borderColor=CU; }} onBlur={e => { e.target.style.borderColor=BORDER; }} />
              </div>
              <div>
                <label style={labelStyle}>¿Qué nos aportas? (puntos clave)</label>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {form.beneficios.map((b, i) => (
                    <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <input style={{ ...inputStyle, flex:1 }} value={b} onChange={e => setBeneficio(i, e.target.value)} placeholder={`Beneficio ${i+1}`} onFocus={e => { e.target.style.borderColor=CU; }} onBlur={e => { e.target.style.borderColor=BORDER; }} />
                      <button onClick={() => removeBeneficio(i)} style={{ width:36, height:36, minHeight:36, borderRadius:10, border:`1px solid rgba(217,92,92,0.24)`, background:"rgba(217,92,92,0.06)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Ico.Trash />
                      </button>
                    </div>
                  ))}
                  <button onClick={addBeneficio} style={{ alignSelf:"flex-start", padding:"8px 16px", borderRadius:10, border:`1px solid ${CU_BOR}`, background: CU_DIM, color: CU, fontSize:13, fontWeight:700, fontFamily: FONT, cursor:"pointer" }}>
                    + Agregar punto
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ padding:"18px 20px", borderRadius:14, background: BG, border:`1px solid ${BORDER}` }}>
                <div style={{ fontFamily: FONT, fontSize:12, fontWeight:700, color: MUTED, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Resumen de la propuesta</div>
                <div style={{ display:"grid", gap:10 }}>
                  {[
                    { label:"Cliente", value: form.client_name },
                    { label:"Fecha", value: form.fecha },
                    { label:"Título", value: form.title },
                    { label:"Participación", value: `${form.participacion_pct}% de ALTTEZ` },
                    { label:"Beneficios", value: `${form.beneficios.filter(b => b.trim()).length} puntos configurados` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display:"flex", gap:12, alignItems:"baseline" }}>
                      <span style={{ fontFamily: FONT, fontSize:12, color: MUTED, fontWeight:700, minWidth:90, flexShrink:0 }}>{label}</span>
                      <span style={{ fontFamily: FONT, fontSize:13, color: TEXT, fontWeight:600, flex:1 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding:"14px 18px", borderRadius:12, background:"rgba(47,165,111,0.06)", border:"1px solid rgba(47,165,111,0.20)", display:"flex", gap:10, alignItems:"center" }}>
                <Ico.Lock />
                <div style={{ fontFamily: FONT, fontSize:13, color: MUTED, lineHeight:1.5 }}>
                  Se generará un <strong>enlace confidencial único</strong> para {form.client_name || "el cliente"}. Solo quien tenga el link podrá acceder a esta propuesta.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding:"18px 24px", borderTop:`1px solid ${BORDER}`, display:"flex", gap:10, flexShrink:0 }}>
          {step > 1 && (
            <button onClick={() => setStep(s => s-1)} style={{ flex:1, padding:"12px", borderRadius:12, border:`1px solid ${BORDER}`, background: BG, color: TEXT, fontSize:14, fontWeight:700, fontFamily: FONT, cursor:"pointer" }}>
              ← Anterior
            </button>
          )}
          {step < 3 && (
            <button onClick={() => setStep(s => s+1)} style={{ flex:2, padding:"12px 20px", borderRadius:12, border:"none", background:`linear-gradient(135deg, ${CU} 0%, #B7832D 100%)`, color: CARD, fontSize:14, fontWeight:800, fontFamily: FONT, cursor:"pointer", boxShadow:`0 6px 18px rgba(206,137,70,0.26)` }}>
              Continuar →
            </button>
          )}
          {step === 3 && (
            <>
              <button
                onClick={() => handleSave("creada")}
                disabled={saving}
                style={{ flex:1, padding:"12px", borderRadius:12, border:`1px solid ${BORDER}`, background: BG, color: TEXT, fontSize:13, fontWeight:700, fontFamily: FONT, cursor:"pointer" }}
              >
                Guardar borrador
              </button>
              <button
                onClick={() => handleSave("enviada")}
                disabled={saving}
                style={{ flex:2, padding:"12px 20px", borderRadius:12, border:"none", background:`linear-gradient(135deg, ${CU} 0%, #B7832D 100%)`, color: CARD, fontSize:14, fontWeight:800, fontFamily: FONT, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:`0 6px 18px rgba(206,137,70,0.26)` }}
              >
                {saving
                  ? <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.8, ease:"linear" }} style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor: CARD, borderRadius:"50%" }} />
                  : <><Ico.Send /> Crear y enviar</>
                }
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════
// Detail Panel (slide-in)
// ════════════════════════════════════════════════
function DetailPanel({ proposal, onClose, onStatusChange }) {
  const [markingStatus, setMarkingStatus] = useState(false);
  const link = `${window.location.origin}/propuesta/${proposal.id}`;

  function copyLink() {
    navigator.clipboard.writeText(link).then(() => showToast("Enlace copiado al portapapeles.", "success")).catch(() => showToast("No se pudo copiar el enlace.", "error"));
  }

  async function markStatus(status) {
    setMarkingStatus(true);
    await updateProposal(proposal.id, { status });
    onStatusChange(proposal.id, status);
    setMarkingStatus(false);
    showToast(`Estado cambiado a "${STATUS_MAP[status]?.label || status}".`, "success");
  }

  return (
    <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:40 }} transition={{ duration:0.3, ease: EASE }}
      style={{ position:"fixed", top:0, right:0, bottom:0, width:"min(420px, 100vw)", background: CARD, borderLeft:`1px solid ${BORDER}`, boxShadow:"-12px 0 40px rgba(23,26,28,0.10)", zIndex:200, display:"flex", flexDirection:"column", overflowY:"auto" }}
    >
      <div style={{ padding:"20px 22px 16px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ fontFamily: FONT, fontWeight:800, fontSize:16, color: TEXT }}>Detalle de propuesta</div>
        <button onClick={onClose} style={{ width:36, height:36, minHeight:36, borderRadius:10, border:`1px solid ${BORDER}`, background: BG, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Ico.X />
        </button>
      </div>

      <div style={{ padding:"22px", flex:1, display:"flex", flexDirection:"column", gap:20 }}>
        {/* Client */}
        <div>
          <div style={{ fontFamily: FONT, fontSize:11, fontWeight:700, color: MUTED, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>Cliente</div>
          <div style={{ fontFamily: FONT, fontSize:20, fontWeight:900, color: TEXT, marginBottom:4 }}>{proposal.client_name}</div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <StatusBadge status={proposal.status} />
            <span style={{ fontFamily: FONT, fontSize:12, color: MUTED }}>· {fmtDate(proposal.fecha)}</span>
          </div>
        </div>

        {/* Link */}
        <div style={{ padding:"14px 16px", borderRadius:12, background: BG, border:`1px solid ${BORDER}` }}>
          <div style={{ fontFamily: FONT, fontSize:11, fontWeight:700, color: MUTED, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
            <Ico.Lock /> Enlace confidencial
          </div>
          <div style={{ fontFamily: FONT, fontSize:12, color: MUTED, wordBreak:"break-all", marginBottom:10 }}>{link}</div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={copyLink} style={{ flex:1, padding:"9px 14px", borderRadius:10, border:`1px solid ${BORDER}`, background: CARD, color: TEXT, fontSize:13, fontWeight:700, fontFamily: FONT, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <Ico.Copy /> Copiar enlace
            </button>
            <a href={link} target="_blank" rel="noopener noreferrer" style={{ flex:1, padding:"9px 14px", borderRadius:10, border:`1px solid ${CU_BOR}`, background: CU_DIM, color: CU, fontSize:13, fontWeight:700, fontFamily: FONT, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, textDecoration:"none" }}>
              <Ico.Eye /> Vista previa
            </a>
          </div>
        </div>

        {/* Details */}
        {[
          { label:"Título", value: proposal.title },
          { label:"Rol asignado", value: proposal.rol },
          { label:"Participación", value: `${proposal.participacion_pct}% de ALTTEZ` },
          { label:"Impacto", value: proposal.impacto },
        ].filter(d => d.value).map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontFamily: FONT, fontSize:11, fontWeight:700, color: MUTED, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>{label}</div>
            <div style={{ fontFamily: FONT, fontSize:14, color: TEXT, lineHeight:1.6 }}>{value}</div>
          </div>
        ))}

        {/* Firma */}
        {proposal.status === "aceptada" && (() => {
          let displayName = proposal.signed_name;
          let displayEmail = "";
          let displaySig = "";
          if (proposal.signed_name && proposal.signed_name.startsWith("{")) {
            try {
              const parsed = JSON.parse(proposal.signed_name);
              displayName = parsed.name;
              displayEmail = parsed.email;
              displaySig = parsed.sig;
            } catch (e) {}
          }
          return (
            <div style={{ padding:"16px", borderRadius:12, background:"rgba(47,165,111,0.07)", border:"1px solid rgba(47,165,111,0.24)", display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <div style={{ fontFamily: FONT, fontSize:11, fontWeight:700, color: SUCCESS, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>✓ Propuesta aceptada</div>
                <div style={{ fontFamily: FONT, fontSize:14, color: TEXT, fontWeight:700 }}>{displayName}</div>
                {displayEmail && <div style={{ fontFamily: FONT, fontSize:12, color: MUTED, marginTop: 2 }}>{displayEmail}</div>}
                <div style={{ fontFamily: FONT, fontSize:11, color: MUTED, marginTop: 4 }}>Firmado el {fmtDate(proposal.signed_at)}</div>
              </div>
              {displaySig && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontFamily: FONT, fontSize:10, fontWeight:700, color: MUTED, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Firma digitalizada:</div>
                  <div style={{ background: "#FFFFFF", border: "1px solid #E9E2D7", borderRadius: 8, padding: "8px", display: "inline-block", maxWidth: "100%" }}>
                    <img src={displaySig} alt="Firma" style={{ maxHeight: 60, display: "block" }} />
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Contrapropuesta */}
        {proposal.status === "contrapropuesta" && proposal.contrapropuesta_text && (
          <div style={{ padding:"16px", borderRadius:12, background: CU_DIM, border:`1px solid ${CU_BOR}` }}>
            <div style={{ fontFamily: FONT, fontSize:11, fontWeight:700, color: CU, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>Contrapropuesta recibida</div>
            <div style={{ fontFamily: FONT, fontSize:14, color: TEXT, lineHeight:1.65 }}>{proposal.contrapropuesta_text}</div>
          </div>
        )}

        {/* Actions */}
        {(proposal.status === "contrapropuesta" || proposal.status === "enviada") && (
          <div>
            <div style={{ fontFamily: FONT, fontSize:11, fontWeight:700, color: MUTED, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>Cambiar estado</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { status:"aceptada", label:"Marcar como aceptada", color: SUCCESS, bg:"rgba(47,165,111,0.08)", border:"rgba(47,165,111,0.28)" },
                { status:"rechazada", label:"Marcar como rechazada", color: DANGER, bg:"rgba(217,92,92,0.08)", border:"rgba(217,92,92,0.28)" },
              ].map(({ status, label, color, bg, border }) => (
                <button key={status} onClick={() => markStatus(status)} disabled={markingStatus}
                  style={{ padding:"10px 16px", borderRadius:10, border:`1px solid ${border}`, background: bg, color, fontSize:13, fontWeight:700, fontFamily: FONT, cursor:"pointer", textAlign:"left" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════
// Main Module
// ════════════════════════════════════════════════
export default function ProposalsAdminModule({ clubId, mode }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState("todas");

  useEffect(() => {
    if (clubId) setProposalsClubId(clubId);
    getProposals().then(data => {
      setProposals(data || []);
      setLoading(false);
    });
  }, [clubId]);

  const handleCreated = useCallback((p) => {
    setProposals(prev => [p, ...prev]);
    setShowCreate(false);
    // Auto-abrir detalle para copiar el link
    setSelected(p);
  }, []);

  const handleStatusChange = useCallback((id, status) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
  }, [selected]);

  async function handleDelete(id) {
    setDeleting(id);
    await deleteProposal(id);
    setProposals(prev => prev.filter(p => p.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleting(null);
    showToast("Propuesta eliminada.", "success");
  }

  function copyLink(id) {
    const link = `${window.location.origin}/propuesta/${id}`;
    navigator.clipboard.writeText(link).then(() => showToast("Enlace copiado.", "success")).catch(() => showToast("No se pudo copiar.", "error"));
  }

  const FILTERS = ["todas","creada","enviada","aceptada","contrapropuesta","rechazada"];
  const filtered = filter === "todas" ? proposals : proposals.filter(p => p.status === filter);

  const counts = proposals.reduce((acc, p) => { acc[p.status] = (acc[p.status]||0)+1; return acc; }, {});

  return (
    <div style={{ fontFamily: FONT, background: BG, minHeight:"calc(100vh - 64px)", position:"relative" }}>
      {/* ── Main Content ── */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 24px 60px" }}>

        {/* Page Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:20, marginBottom:28, flexWrap:"wrap" }}>
          <div>
            <h1 style={{ margin:0, fontFamily: FONT, fontSize:28, fontWeight:900, color: TEXT, letterSpacing:"-0.02em" }}>Propuestas comerciales</h1>
            <p style={{ margin:"6px 0 0", fontFamily: FONT, fontSize:14, color: MUTED }}>
              Gestiona y envía propuestas confidenciales a clientes, socios e inversionistas.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 20px", borderRadius:13, border:"none", background:`linear-gradient(135deg, ${CU} 0%, #B7832D 100%)`, color: CARD, fontSize:14, fontWeight:800, fontFamily: FONT, cursor:"pointer", boxShadow:`0 8px 24px rgba(206,137,70,0.28)`, flexShrink:0 }}
          >
            <Ico.Plus /> Nueva propuesta
          </button>
        </div>

        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:14, marginBottom:24 }}>
          {[
            { label:"Total", value: proposals.length, color: TEXT },
            { label:"Aceptadas", value: counts.aceptada || 0, color: SUCCESS },
            { label:"Pendientes", value: (counts.enviada || 0) + (counts.creada || 0), color:"#2563eb" },
            { label:"Contrapropuestas", value: counts.contrapropuesta || 0, color: CU },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding:"18px 20px", borderRadius:14, background: CARD, border:`1px solid ${BORDER}`, boxShadow:"0 4px 12px rgba(23,26,28,0.05)" }}>
              <div style={{ fontFamily: FONT, fontSize:11, fontWeight:700, color: MUTED, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>{label}</div>
              <div style={{ fontFamily: FONT, fontSize:30, fontWeight:900, color, lineHeight:1 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding:"7px 14px", borderRadius:999, border:`1px solid ${filter===f ? CU_BOR : BORDER}`,
                background: filter===f ? CU_DIM : CARD,
                color: filter===f ? CU : MUTED, fontSize:12, fontWeight:700, fontFamily: FONT, cursor:"pointer",
                textTransform: f === "todas" ? "none" : "capitalize", transition:"all 0.15s",
              }}
            >
              {f === "todas" ? "Todas" : (STATUS_MAP[f]?.label || f)}
              {f === "todas" ? ` (${proposals.length})` : (counts[f] ? ` (${counts[f]})` : "")}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign:"center", padding:60 }}>
            <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1, ease:"linear" }} style={{ width:36, height:36, border:`3px solid ${BORDER}`, borderTopColor: CU, borderRadius:"50%", margin:"0 auto" }} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyProposals onCreate={() => setShowCreate(true)} />
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {filtered.map((p, i) => {
              const link = `${window.location.origin}/propuesta/${p.id}`;
              const isDemo = p.id === "demo-juan-perez";
              return (
                <motion.div key={p.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3, ease: EASE, delay: i * 0.04 }}
                  style={{ background: CARD, border:`1px solid ${BORDER}`, borderRadius:16, padding:"18px 20px", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap", boxShadow:"0 4px 12px rgba(23,26,28,0.04)", cursor:"pointer", transition:"box-shadow 0.2s, border-color 0.2s" }}
                  onClick={() => setSelected(p)}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow="0 8px 24px rgba(23,26,28,0.08)"; e.currentTarget.style.borderColor=CU_BOR; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow="0 4px 12px rgba(23,26,28,0.04)"; e.currentTarget.style.borderColor=BORDER; }}
                >
                  {/* Avatar */}
                  <div style={{ width:46, height:46, borderRadius:14, background:`linear-gradient(135deg, ${CU_DIM}, rgba(206,137,70,0.05))`, border:`1.5px solid ${CU_BOR}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:18, fontWeight:900, color: CU }}>
                    {(p.client_name || "?").charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <div style={{ fontFamily: FONT, fontWeight:800, fontSize:15, color: TEXT, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:200 }}>{p.client_name}</div>
                      <StatusBadge status={p.status} />
                      {isDemo && <span style={{ fontSize:10, padding:"2px 8px", borderRadius:999, background:"rgba(216,154,43,0.12)", border:"1px solid rgba(216,154,43,0.28)", color:"#d89a2b", fontWeight:700 }}>DEMO</span>}
                    </div>
                    <div style={{ fontFamily: FONT, fontSize:13, color: MUTED, marginTop:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.title}</div>
                    <div style={{ display:"flex", gap:16, marginTop:5, flexWrap:"wrap" }}>
                      <span style={{ fontFamily: FONT, fontSize:11, color: HINT }}>📅 {fmtDate(p.fecha)}</span>
                      <span style={{ fontFamily: FONT, fontSize:11, color: CU, fontWeight:700 }}>◎ {p.participacion_pct}%</span>
                      {p.status === "aceptada" && p.signed_name && (() => {
                        let displayName = p.signed_name;
                        if (p.signed_name && p.signed_name.startsWith("{")) {
                          try {
                            displayName = JSON.parse(p.signed_name).name;
                          } catch (e) {}
                        }
                        return (
                          <span style={{ fontFamily: FONT, fontSize:11, color: SUCCESS }}>✓ Firmado por {displayName}</span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display:"flex", gap:8, flexShrink:0 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      title="Copiar enlace"
                      onClick={() => copyLink(p.id)}
                      style={{ width:36, height:36, minHeight:36, borderRadius:10, border:`1px solid ${BORDER}`, background: BG, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background=CU_DIM; e.currentTarget.style.borderColor=CU_BOR; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background=BG; e.currentTarget.style.borderColor=BORDER; }}
                    >
                      <Ico.Copy />
                    </button>
                    <a href={link} target="_blank" rel="noopener noreferrer"
                      title="Ver propuesta"
                      style={{ width:36, height:36, minHeight:36, borderRadius:10, border:`1px solid ${BORDER}`, background: BG, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", transition:"all 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background=CU_DIM; e.currentTarget.style.borderColor=CU_BOR; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background=BG; e.currentTarget.style.borderColor=BORDER; }}
                    >
                      <Ico.Eye />
                    </a>
                    {!isDemo && (
                      <button
                        title="Eliminar"
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        style={{ width:36, height:36, minHeight:36, borderRadius:10, border:"1px solid rgba(217,92,92,0.24)", background:"rgba(217,92,92,0.06)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background="rgba(217,92,92,0.14)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background="rgba(217,92,92,0.06)"; }}
                      >
                        {deleting === p.id
                          ? <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.8, ease:"linear" }} style={{ width:14, height:14, border:"2px solid rgba(217,92,92,0.3)", borderTopColor: DANGER, borderRadius:"50%" }} />
                          : <Ico.Trash />
                        }
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showCreate && <CreateModal clubId={clubId} onCreated={handleCreated} onClose={() => setShowCreate(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <DetailPanel
            proposal={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>

      {/* Backdrop for detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, zIndex:199, background:"rgba(10,12,18,0.20)" }}
            onClick={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
