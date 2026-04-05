/**
 * @component MiniTopbar
 * @description Topbar minimalista para los modulos del CRM.
 * Muestra el nombre del modulo activo, un link de regreso al Dashboard,
 * y el nombre/categoria del club en modo compacto.
 */

import { PALETTE as C } from "../../shared/tokens/palette";

export function MiniTopbar({
  title,
  accent = C.neon,
  accentBg = "rgba(200,255,0,0.05)",
  mode,
  clubName,
  clubCategory,
  onHomeClick,
}) {
  return (
    <div style={{ height:38, background:"rgba(10,10,15,0.85)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:`1px solid ${accent}33`, display:"flex", alignItems:"stretch" }}>
      <div onClick={onHomeClick} style={{ padding:"0 18px", fontSize:10, textTransform:"uppercase", letterSpacing:"2px", color:C.textMuted, display:"flex", alignItems:"center", cursor:"pointer", borderRight:`1px solid ${C.border}`, transition:"color 0.15s" }} onMouseEnter={e=>e.currentTarget.style.color="white"} onMouseLeave={e=>e.currentTarget.style.color=C.textMuted}>
        ← Dashboard
      </div>
      <div style={{ padding:"0 18px", fontSize:10, textTransform:"uppercase", letterSpacing:"2px", color:"white", display:"flex", alignItems:"center", borderBottom:`2px solid ${accent}`, background:accentBg }}>
        {title}
      </div>
      <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10, padding:"0 18px" }}>
        {mode === "demo" && (
          <div style={{ padding:"2px 8px", fontSize:8, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", background:`${C.amber}33`, color:C.amber, border:`1px solid ${C.amber}66` }}>Demo</div>
        )}
        <div style={{ fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:"1px" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:accent, display:"inline-block", marginRight:6 }}/>
          {clubName || "Mi Club"} · {clubCategory || "General"}
        </div>
      </div>
    </div>
  );
}

export default MiniTopbar;
