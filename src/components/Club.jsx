import { useState, useRef } from "react";

export default function Club({ clubInfo, setClubInfo }) {
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setClubInfo({ ...clubInfo, logo: ev.target.result });
    reader.readAsDataURL(file);
  };

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inp = {
    width: "100%", fontSize: 13, border: "1px solid #e5e7eb", borderRadius: 8,
    padding: "8px 10px", background: "#f9fafb", color: "#111827",
    fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 500, color: "#6b7280", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        Información del club
      </div>

      {/* Logo */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 12 }}>Logo del club</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            onClick={() => fileRef.current.click()}
            style={{ width: 80, height: 80, borderRadius: 12, border: "2px dashed #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", background: "#f9fafb", flexShrink: 0 }}
          >
            {clubInfo.logo
              ? <img src={clubInfo.logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              : <span style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", padding: 4 }}>Subir logo</span>
            }
          </div>
          <div>
            <div style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>Sube el escudo o logo del club</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}>PNG, JPG — aparece en todos los reportes</div>
            <button onClick={() => fileRef.current.click()} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 8, border: "1px solid #d1d5db", background: "transparent", color: "#374151", cursor: "pointer" }}>
              Seleccionar archivo
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} style={{ display: "none" }} />
        </div>
      </div>

      {/* Datos generales */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 12 }}>Datos generales</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Nombre del club", key: "nombre", placeholder: "Ej: Club Deportivo Medellín" },
            { label: "Disciplina", key: "disciplina", placeholder: "Ej: Fútbol" },
            { label: "Categoría", key: "categoria", placeholder: "Ej: Sub-17" },
            { label: "Ciudad", key: "ciudad", placeholder: "Ej: Medellín, Antioquia" },
            { label: "Nombre del entrenador", key: "entrenador", placeholder: "Ej: Juan García" },
            { label: "Teléfono de contacto", key: "telefono", placeholder: "Ej: 300 123 4567" },
          ].map(f => (
            <div key={f.key}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>{f.label}</div>
              <input
                value={clubInfo[f.key] || ""}
                onChange={e => setClubInfo({ ...clubInfo, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                style={inp}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Descripción */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 12 }}>Descripción del club</div>
        <textarea
          rows={3}
          value={clubInfo.descripcion || ""}
          onChange={e => setClubInfo({ ...clubInfo, descripcion: e.target.value })}
          placeholder="Misión, visión, objetivos de la temporada..."
          style={{ ...inp, resize: "none", lineHeight: 1.6 }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={save} style={{ background: saved ? "#059669" : "#1D9E75", color: "white", border: "none", borderRadius: 8, padding: "8px 24px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          {saved ? "Guardado" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
