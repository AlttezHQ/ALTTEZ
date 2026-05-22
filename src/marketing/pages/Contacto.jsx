import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { usePageTitle } from "../../shared/hooks/usePageTitle";
import { MARKETING_BRAND as B, MARKETING_FONTS as F } from "../theme/brand";

const INPUT_STYLE = {
  width: "100%",
  padding: "16px 20px",
  borderRadius: 12,
  border: `1px solid ${B.border}`,
  background: B.bgSoft,
  fontSize: 16,
  fontFamily: F.body,
  outline: "none",
  transition: "all 0.2s ease"
};

export default function Contacto() {
  usePageTitle("Contacto — ALTTEZ");

  return (
    <div style={{ background: B.bg, minHeight: "100vh", fontFamily: F.body, display: "flex", flexDirection: "column" }}>
      
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", minHeight: "calc(100vh - 80px)" }}>
        
        {/* Left Side: Contact Info & Value Prop */}
        <div style={{ 
          background: B.surfaceStrong, 
          padding: "120px 8% 80px", 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center",
          borderRight: `1px solid ${B.border}`
        }}>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h1 style={{
              margin: "0 0 24px",
              color: B.text,
              fontSize: "clamp(40px, 5vw, 64px)",
              letterSpacing: "-0.04em",
              fontWeight: 800,
              fontFamily: F.display,
              lineHeight: 1.1
            }}>
              Hablemos.
            </h1>
            <p style={{ color: B.textMuted, fontSize: 20, lineHeight: 1.6, maxWidth: 440, marginBottom: 60 }}>
              ¿Listo para transformar la gestión de tu organización deportiva? Llena el formulario y nuestro equipo te contactará en menos de 24 horas.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: B.bg, border: `1px solid ${B.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: B.primary }}>
                  <Mail size={20} />
                </div>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: B.text }}>Soporte y Ventas</h4>
                  <a href="mailto:contacto@alttez.com" style={{ color: B.textMuted, fontSize: 16, textDecoration: "none" }}>contacto@alttez.com</a>
                </div>
              </div>

              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: B.bg, border: `1px solid ${B.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: B.primary }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: B.text }}>Oficinas Centrales</h4>
                  <span style={{ color: B.textMuted, fontSize: 16 }}>Madrid, España. Edificio Central Alttez.</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Form */}
        <div style={{ 
          padding: "120px 8% 80px", 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center"
        }}>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <form style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 500 }} onSubmit={e => e.preventDefault()}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 700, color: B.text }}>Nombre</label>
                  <input type="text" placeholder="Ej. Juan Pérez" style={INPUT_STYLE} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 700, color: B.text }}>Organización / Club</label>
                  <input type="text" placeholder="Ej. FC Madrid" style={INPUT_STYLE} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: B.text }}>Correo electrónico laboral</label>
                <input type="email" placeholder="juan@club.com" style={INPUT_STYLE} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: B.text }}>¿En qué podemos ayudarte?</label>
                <textarea rows={4} placeholder="Dime más sobre tus necesidades..." style={{ ...INPUT_STYLE, resize: "vertical" }} />
              </div>

              <button 
                type="submit"
                style={{
                  marginTop: 16,
                  padding: "18px 32px",
                  borderRadius: 14,
                  background: B.primary,
                  border: "none",
                  color: "#FFF",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: `0 12px 32px ${B.primarySoft}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  transition: "transform 0.2s"
                }}
                onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseOut={e => e.currentTarget.style.transform = "none"}
              >
                Enviar mensaje
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
