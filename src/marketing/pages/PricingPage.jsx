import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { usePageTitle } from "../../shared/hooks/usePageTitle";
import { MARKETING_BRAND as B, MARKETING_GRADIENTS as G, MARKETING_FONTS as F } from "../theme/brand";

export default function PricingPage() {
  const navigate = useNavigate();
  usePageTitle("Precios — ALTTEZ");

  return (
    <div style={{ overflowX: "hidden", background: B.bg }}>
      <section style={{ padding: "120px 24px 140px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{
              display: "inline-block",
              padding: "6px 14px", borderRadius: 999,
              background: B.primarySoft, border: `1px solid rgba(206, 137, 70,0.25)`,
              color: B.primary, fontSize: 10, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "1.6px", marginBottom: 24,
            }}>
              Próximamente
            </div>

            <h1 style={{
              margin: "0 0 20px",
              color: B.text,
              fontSize: "clamp(36px, 5vw, 60px)",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              fontWeight: 800,
              fontFamily: F.display,
            }}>
              Precios
            </h1>

            <p style={{ margin: "0 0 36px", color: B.textMuted, fontSize: 16, lineHeight: 1.75 }}>
              Estamos preparando los planes y precios de ALTTEZ. Mientras tanto, agenda una demo personalizada y te explicamos todo.
            </p>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: `0 12px 32px ${B.primaryGlow}` }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/contacto")}
              style={{
                padding: "14px 28px", borderRadius: 12,
                border: "none", background: G.button,
                color: "white", fontSize: 13, fontWeight: 700,
                letterSpacing: "0.5px", cursor: "pointer",
              }}
            >
              Solicitar demo
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
