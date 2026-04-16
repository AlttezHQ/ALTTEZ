/**
 * @component CreateEventModal
 * @description Modal de creación de nuevos eventos del calendario.
 * Uso: renderizar condicionalmente; la animación es de entrada.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PALETTE as C } from "../../shared/tokens/palette";
import FieldInput from "../../shared/ui/FieldInput";

const TYPE_ACCENTS = {
  match:    { color: C.neon,    border: C.neonBorder,                 dim: C.neonDim   },
  training: { color: C.purple,  border: "rgba(127,119,221,0.35)",     dim: "rgba(127,119,221,0.08)" },
  club:     { color: C.amber,   border: C.amberBorder,                dim: C.amberDim  },
};

const EMPTY_FORM = {
  type: "training",
  title: "",
  date: "",
  time: "18:00",
  location: "",
  rival: "",
  esLocal: true,
  convocados: 22,
};

export default function CreateEventModal({ onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const accent = TYPE_ACCENTS[form.type];

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "El título es obligatorio";
    if (!form.date)         e.date  = "La fecha es obligatoria";
    if (!form.time)         e.time  = "La hora es obligatoria";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const [year, month, day] = form.date.split("-").map(Number);
    const [hour, minute]     = form.time.split(":").map(Number);
    const datetime = new Date(year, month - 1, day, hour, minute).toISOString();

    onSave({
      type:       form.type,
      title:      form.title.trim(),
      datetime,
      location:   form.location.trim() || null,
      convocados: form.type === "match" ? Number(form.convocados) : null,
      ...(form.type === "match" ? { rival: form.rival.trim() || null, esLocal: form.esLocal } : {}),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        key="create-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
      />
      {/* Modal */}
      <motion.div
        key="create-modal"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        style={{ position: "fixed", inset: 0, zIndex: 9001, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", pointerEvents: "none" }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            pointerEvents: "all",
            width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto",
            background: C.surfaceModal,
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            border: `1px solid ${accent.border}`,
            borderTop: `3px solid ${accent.color}`,
            borderRadius: "var(--radius-xl)",
            boxShadow: `var(--shadow-modal), 0 0 0 1px ${accent.color}11`,
          }}
        >
          {/* Header */}
          <div style={{ padding: "16px 20px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "2px", color: C.textHint, marginBottom: 4 }}>Nuevo evento</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: "-0.3px" }}>Crear evento</div>
            </div>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "2px 6px" }}
              aria-label="Cerrar modal"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>

            {/* Tipo de evento */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-1)" }}>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "1.2px", color: C.textMuted }}>Tipo de evento</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--sp-2)" }}>
                {[
                  { value: "match",    label: "Partido" },
                  { value: "training", label: "Entreno" },
                  { value: "club",     label: "Club" },
                ].map(opt => {
                  const a = TYPE_ACCENTS[opt.value];
                  const active = form.type === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => set("type", opt.value)}
                      style={{
                        padding: "9px 8px", minHeight: 44,
                        background: active ? a.dim : "rgba(255,255,255,0.03)",
                        border: `1px solid ${active ? a.border : "rgba(255,255,255,0.08)"}`,
                        borderRadius: "var(--radius-md)",
                        color: active ? a.color : C.textMuted,
                        fontSize: 10, fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.8px",
                        cursor: "pointer", transition: "all 150ms",
                        boxShadow: active ? `0 0 12px ${a.color}22` : "none",
                        fontFamily: "inherit",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Título */}
            <FieldInput
              label="Título"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder={form.type === "match" ? "vs Deportivo Norte" : "Entrenamiento físico"}
              error={errors.title}
              onFocus={e => { e.target.style.borderColor = accent.color; e.target.style.boxShadow = `0 0 0 2px ${accent.color}22`; }}
              onBlur={e => { e.target.style.borderColor = errors.title ? C.danger : "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
            />

            {/* Fecha + Hora */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)" }}>
              <FieldInput
                label="Fecha"
                type="date"
                value={form.date}
                onChange={e => set("date", e.target.value)}
                error={errors.date}
                style={{ colorScheme: "dark" }}
                onFocus={e => { e.target.style.borderColor = accent.color; e.target.style.boxShadow = `0 0 0 2px ${accent.color}22`; }}
                onBlur={e => { e.target.style.borderColor = errors.date ? C.danger : "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
              <FieldInput
                label="Hora"
                type="time"
                value={form.time}
                onChange={e => set("time", e.target.value)}
                error={errors.time}
                style={{ colorScheme: "dark" }}
                onFocus={e => { e.target.style.borderColor = accent.color; e.target.style.boxShadow = `0 0 0 2px ${accent.color}22`; }}
                onBlur={e => { e.target.style.borderColor = errors.time ? C.danger : "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Ubicación */}
            <FieldInput
              label="Ubicación"
              value={form.location}
              onChange={e => set("location", e.target.value)}
              placeholder="Campo A, Estadio Local..."
              onFocus={e => { e.target.style.borderColor = accent.color; e.target.style.boxShadow = `0 0 0 2px ${accent.color}22`; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
            />

            {/* Campos extra para Partido */}
            <AnimatePresence>
              {form.type === "match" && (
                <motion.div
                  key="match-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}
                >
                  <FieldInput
                    label="Rival"
                    value={form.rival}
                    onChange={e => set("rival", e.target.value)}
                    placeholder="Atlético Sur"
                    onFocus={e => { e.target.style.borderColor = C.neon; e.target.style.boxShadow = `0 0 0 2px ${C.neonDim}`; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)" }}>
                    {/* Localía */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-1)" }}>
                      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "1.2px", color: C.textMuted }}>Localía</div>
                      <button
                        onClick={() => set("esLocal", !form.esLocal)}
                        style={{
                          width: "100%", textAlign: "left", cursor: "pointer", minHeight: 44,
                          display: "flex", alignItems: "center", gap: 8,
                          background: form.esLocal ? C.neonDim : "rgba(255,255,255,0.04)",
                          border: `1px solid ${form.esLocal ? C.neonBorder : "rgba(255,255,255,0.1)"}`,
                          borderRadius: "var(--radius-md)",
                          color: "white", fontSize: 12, padding: "8px 10px",
                          transition: "all 150ms", fontFamily: "inherit",
                        }}
                      >
                        <span style={{
                          width: 14, height: 14, borderRadius: 3,
                          border: `1.5px solid ${form.esLocal ? C.neon : "rgba(255,255,255,0.25)"}`,
                          background: form.esLocal ? C.neon : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, transition: "all 150ms",
                        }}>
                          {form.esLocal && <span style={{ color: C.bgDark, fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                        </span>
                        <span style={{ color: form.esLocal ? C.neon : C.textMuted, fontSize: 11 }}>
                          {form.esLocal ? "Somos local" : "Visitante"}
                        </span>
                      </button>
                    </div>
                    {/* Convocados */}
                    <FieldInput
                      label="Convocados"
                      type="number"
                      value={form.convocados}
                      onChange={e => set("convocados", e.target.value)}
                      min={1}
                      max={50}
                      style={{ minHeight: 44 }}
                      onFocus={e => { e.target.style.borderColor = C.neon; e.target.style.boxShadow = `0 0 0 2px ${C.neonDim}`; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div style={{ padding: "14px 20px 18px", borderTop: `1px solid ${C.border}`, display: "flex", gap: "var(--sp-2)" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: "11px 16px", minHeight: 44,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                color: C.textMuted, fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "1px",
                borderRadius: "var(--radius-md)", cursor: "pointer",
                fontFamily: "inherit", transition: "background 150ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              style={{
                flex: 2, padding: "11px 16px", minHeight: 44,
                background: accent.dim, border: `1px solid ${accent.border}`,
                color: accent.color, fontSize: 10, fontWeight: 900,
                textTransform: "uppercase", letterSpacing: "1.5px",
                borderRadius: "var(--radius-md)", cursor: "pointer",
                fontFamily: "inherit", transition: "all 150ms",
                boxShadow: `0 0 12px ${accent.color}22`,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${accent.color}18`; e.currentTarget.style.boxShadow = `0 0 20px ${accent.color}44`; }}
              onMouseLeave={e => { e.currentTarget.style.background = accent.dim; e.currentTarget.style.boxShadow = `0 0 12px ${accent.color}22`; }}
            >
              Guardar evento
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
