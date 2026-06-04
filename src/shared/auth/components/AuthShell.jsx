import { motion } from "framer-motion";

/**
 * @component AuthShell
 * @description Marco de autenticación ALTTEZ — diseño split-screen premium.
 * Izquierda: panel de marca (grafito + bronce). Derecha: formulario sobre marfil.
 * En móvil el panel de marca se oculta y el formulario ocupa todo.
 *
 * Inyecta estilos globales scoped (.alttez-auth-root): tipografía Manrope,
 * corrección de autofill (relleno gris del navegador) y focus ring bronce.
 */

const FONT = "var(--font-manrope), 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
const LOGO = "/branding/alttez-symbol-transparent.png";

const AUTH_CSS = `
  .alttez-auth-root, .alttez-auth-root input, .alttez-auth-root button, .alttez-auth-root h1, .alttez-auth-root p, .alttez-auth-root span, .alttez-auth-root label {
    font-family: ${FONT};
  }
  /* Fix autofill: el navegador pinta un relleno gris/azul sobre el input */
  .alttez-auth-root input:-webkit-autofill,
  .alttez-auth-root input:-webkit-autofill:hover,
  .alttez-auth-root input:-webkit-autofill:focus,
  .alttez-auth-root input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 1000px #FFFFFF inset !important;
    -webkit-text-fill-color: #1F1F1D !important;
    caret-color: #1F1F1D;
    transition: background-color 9999s ease-in-out 0s;
  }
  /* Focus ring bronce uniforme (vence el border inline vía !important) */
  .alttez-auth-root input:focus {
    border-color: #CE8946 !important;
    box-shadow: 0 0 0 3px rgba(206,137,70,0.15) !important;
  }
`;

function BrandPanel() {
  return (
    <div
      className="alttez-auth-brand"
      style={{
        position: "relative", width: "48%", maxWidth: 620, minHeight: "100vh", flexShrink: 0,
        background: "linear-gradient(160deg, #232019 0%, #161310 100%)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        justifyContent: "space-between", padding: "48px 44px",
      }}
    >
      {/* Glow bronce + grilla sutil */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 30% 25%, rgba(206,137,70,0.16) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(246,241,234,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(246,241,234,0.05) 1px, transparent 1px)", backgroundSize: "56px 56px", maskImage: "radial-gradient(circle at 30% 30%, rgba(0,0,0,1) 0%, transparent 75%)", WebkitMaskImage: "radial-gradient(circle at 30% 30%, rgba(0,0,0,1) 0%, transparent 75%)" }} />

      {/* Logo */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
        <img src={LOGO} alt="ALTTEZ" style={{ height: 30, width: "auto" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
        <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, letterSpacing: "0.08em", color: "#F6F1EA" }}>ALTTEZ</span>
      </div>

      {/* Tagline */}
      <div style={{ position: "relative", maxWidth: 380 }}>
        <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: "#CE8946", marginBottom: 20 }}>
          Ecosistema operativo deportivo
        </div>
        <h2 style={{ fontFamily: FONT, fontSize: "clamp(30px, 3.4vw, 40px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em", color: "#F6F1EA", margin: 0 }}>
          Organiza hoy.<br />Escala mañana.
        </h2>
        <p style={{ fontFamily: FONT, fontSize: 14.5, lineHeight: 1.65, color: "rgba(246,241,234,0.55)", marginTop: 22 }}>
          Todos los deportes, un solo sistema. Gestión de clubes, torneos y operación en una sola plataforma.
        </p>
      </div>

      {/* Footer */}
      <div style={{ position: "relative", fontFamily: FONT, fontSize: 12, color: "rgba(246,241,234,0.4)" }}>
        © {new Date().getFullYear()} ALTTEZ S.A.S.
      </div>
    </div>
  );
}

export default function AuthShell({ children, maxWidth = 440 }) {
  return (
    <div className="alttez-auth-root light" style={{ minHeight: "100vh", display: "flex", background: "#F6F1EA", fontFamily: FONT }}>
      <style>{AUTH_CSS}</style>

      {/* Panel de marca (oculto en móvil) */}
      <div className="alttez-auth-brand-wrap">
        <BrandPanel />
      </div>

      {/* Columna del formulario */}
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", overflow: "hidden" }}>
        {/* Grilla sutil de fondo */}
        <div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.4,
            backgroundImage: "linear-gradient(#EDE8D0 1px, transparent 1px), linear-gradient(90deg, #EDE8D0 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(circle at center, rgba(0,0,0,1) 0%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(circle at center, rgba(0,0,0,1) 0%, transparent 80%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", maxWidth, position: "relative", zIndex: 2 }}
        >
          {children}
        </motion.div>
      </div>

      <style>{`
        .alttez-auth-brand-wrap { display: block; }
        @media (max-width: 860px) {
          .alttez-auth-brand-wrap { display: none; }
        }
      `}</style>
    </div>
  );
}
