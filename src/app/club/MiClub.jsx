import { useState } from "react";
import { sanitizeText } from "../../shared/utils/sanitize";
import { PALETTE as C } from "../../shared/tokens/palette";
import { useStore } from "../../shared/store/useStore";
import GlassPanel  from "../../shared/ui/GlassPanel";
import SectionLabel from "../../shared/ui/SectionLabel";
import Button      from "../../shared/ui/Button";
import FieldInput  from "../../shared/ui/FieldInput";

// Focus ring handled globally by .field-input:focus in index.css

const CATEGORIAS_DEFAULT = [
  "Sub-7","Sub-8","Sub-9","Sub-10","Sub-11","Sub-12",
  "Sub-13","Sub-14","Sub-15","Sub-16","Sub-17","Sub-18",
  "Sub-20","Sub-23","Mayores","Femenino"
];

export default function MiClub() {
  const clubInfo  = useStore(state => state.clubInfo);
  const setClubInfo = useStore(state => state.setClubInfo);
  const [newCat, setNewCat]     = useState("");
  const [newCampo, setNewCampo] = useState("");
  const [saved, setSaved]       = useState(false);

  const toggleCat = (cat) => {
    const cats = clubInfo.categorias || [];
    setClubInfo({ ...clubInfo, categorias: cats.includes(cat) ? cats.filter(c => c !== cat) : [...cats, cat] });
  };

  const addCat = () => {
    if (!newCat.trim()) return;
    const cats = clubInfo.categorias || [];
    if (!cats.includes(newCat.trim())) setClubInfo({ ...clubInfo, categorias: [...cats, newCat.trim()] });
    setNewCat("");
  };

  const addCampo = () => {
    if (!newCampo.trim()) return;
    const campos = clubInfo.campos || [];
    setClubInfo({ ...clubInfo, campos: [...campos, newCampo.trim()] });
    setNewCampo("");
  };

  const removeCampo = (i) => {
    const campos = [...(clubInfo.campos || [])];
    campos.splice(i, 1);
    setClubInfo({ ...clubInfo, campos });
  };

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="miclub-container" style={{ padding: "var(--sp-4)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)" }}>

      {/* COLUMNA IZQUIERDA */}
      <div>
        {/* Datos generales */}
        <GlassPanel accent={C.purple} style={{ marginBottom: "var(--sp-3)" }}>
          <SectionLabel accent={C.purple} style={{ marginBottom: "var(--sp-3)" }}>Datos operativos del club</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)" }}>
            {[
              ["Nombre del club","nombre","Club Deportivo"],
              ["Disciplina","disciplina","Fútbol"],
              ["Ciudad","ciudad","Medellín"],
              ["Entrenador","entrenador",""],
              ["Teléfono","telefono",""],
              ["Email","email",""],
            ].map(([lbl, key, placeholder]) => (
              <FieldInput
                key={key}
                label={lbl}
                value={clubInfo[key] || ""}
                onChange={e => setClubInfo({ ...clubInfo, [key]: sanitizeText(e.target.value) })}
                placeholder={placeholder}
                maxLength={80}
              />
            ))}
          </div>
          <div style={{ marginTop: "var(--sp-3)" }}>
            <FieldInput
              as="textarea"
              label="Identidad del club"
              value={clubInfo.descripcion || ""}
              onChange={e => setClubInfo({ ...clubInfo, descripcion: sanitizeText(e.target.value) })}
              rows={3}
              placeholder="Misión institucional, modelo de juego, objetivos de la temporada..."
              style={{ resize: "none", lineHeight: 1.6 }}
              maxLength={500}
            />
          </div>
        </GlassPanel>

        {/* Instalaciones */}
        <GlassPanel accent={C.green}>
          <SectionLabel accent={C.green} style={{ marginBottom: "var(--sp-3)" }}>Instalaciones de entrenamiento</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)", marginBottom: "var(--sp-3)" }}>
            {(clubInfo.campos || ["Campo principal", "Campo auxiliar"]).map((campo, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",
                  border: `1px solid ${C.border}`,
                  borderRadius: "var(--radius-lg)",
                  padding: "9px var(--sp-3)",
                  boxShadow: "var(--shadow-subtle)",
                }}
              >
                <span style={{ fontSize: "var(--fs-body-lg)", color: "rgba(255,255,255,0.7)" }}>{campo}</span>
                <button
                  onClick={() => removeCampo(i)}
                  style={{ fontSize: "var(--fs-caption)", color: C.danger, cursor: "pointer", padding: "2px 6px", background: "none", border: "none", minHeight: "unset" }}
                >✕</button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "var(--sp-2)" }}>
            <FieldInput
              value={newCampo}
              onChange={e => setNewCampo(sanitizeText(e.target.value))}
              onKeyDown={e => e.key === "Enter" && addCampo()}
              placeholder="Nombre de la instalación..."
              style={{ flex: 1 }}
              maxLength={60}
            />
            <Button variant="ghost" accent={C.green} size="sm" onClick={addCampo} style={{ whiteSpace: "nowrap" }}>
              + Registrar
            </Button>
          </div>
        </GlassPanel>
      </div>

      {/* COLUMNA DERECHA */}
      <div>
        <GlassPanel accent={C.purple} style={{ marginBottom: "var(--sp-3)" }}>
          <SectionLabel accent={C.purple} style={{ marginBottom: "var(--sp-3)" }}>Categorías bajo gestión</SectionLabel>
          <div style={{ fontSize: "var(--fs-caption)", color: C.textHint, marginBottom: "var(--sp-3)" }}>
            Selecciona las categorías activas en tu estructura deportiva
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-2)", marginBottom: "var(--sp-3)" }}>
            {CATEGORIAS_DEFAULT.map(cat => {
              const active = (clubInfo.categorias || []).includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCat(cat)}
                  style={{
                    fontSize: "var(--fs-body)",
                    padding: "6px 14px",
                    cursor: "pointer",
                    borderRadius: "var(--radius-pill)",
                    border: `1px solid ${active ? C.green : C.border}`,
                    background: active ? C.greenDim : "rgba(255,255,255,0.03)",
                    color: active ? C.green : C.textMuted,
                    transition: "all 0.18s",
                    boxShadow: active ? `0 0 12px ${C.greenDim}, var(--shadow-sm)` : "var(--shadow-subtle)",
                    minHeight: "unset",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "var(--sp-3)", marginTop: "var(--sp-1)" }}>
            <SectionLabel style={{ marginBottom: "var(--sp-2)", color: C.textHint }}>Categoría personalizada</SectionLabel>
            <div style={{ display: "flex", gap: "var(--sp-2)" }}>
              <FieldInput
                value={newCat}
                onChange={e => setNewCat(sanitizeText(e.target.value))}
                onKeyDown={e => e.key === "Enter" && addCat()}
                placeholder="Ej: Femenino Sub-17..."
                style={{ flex: 1 }}
                maxLength={30}
              />
              <Button variant="ghost" accent={C.green} size="sm" onClick={addCat} style={{ whiteSpace: "nowrap" }}>
                + Incorporar
              </Button>
            </div>
          </div>

          {(clubInfo.categorias || []).length > 0 && (
            <div style={{ marginTop: "var(--sp-3)", padding: "var(--sp-3)", background: C.greenDim, border: `1px solid ${C.greenBorder}`, borderRadius: "var(--radius-lg)" }}>
              <SectionLabel style={{ color: C.green, marginBottom: "var(--sp-2)" }}>
                Categorías activas ({(clubInfo.categorias || []).length})
              </SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-2)" }}>
                {(clubInfo.categorias || []).map(cat => (
                  <div
                    key={cat}
                    style={{
                      fontSize: "var(--fs-body)",
                      padding: "4px var(--sp-3)",
                      background: C.greenDim,
                      border: `1px solid ${C.greenBorder}`,
                      color: C.green,
                      borderRadius: "var(--radius-md)",
                      display: "flex", alignItems: "center", gap: "var(--sp-2)",
                    }}
                  >
                    {cat}
                    <button
                      onClick={() => toggleCat(cat)}
                      style={{ fontSize: "var(--fs-caption)", cursor: "pointer", opacity: 0.6, background: "none", border: "none", color: "inherit", minHeight: "unset", padding: 0 }}
                    >✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassPanel>

        {/* Guardar */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="primary"
            onClick={save}
            style={{
              background: saved
                ? `linear-gradient(135deg,${C.green},#047857)`
                : `linear-gradient(135deg,${C.greenBright},#00cc6a)`,
              color: saved ? "white" : C.text,
              boxShadow: saved
                ? `0 4px 16px ${C.greenBorder}`
                : `0 4px 16px rgba(0,255,136,0.35)`,
            }}
          >
            {saved ? "Configuración confirmada ✓" : "Confirmar cambios →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
