import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePageTitle } from "../../shared/hooks/usePageTitle";
import { MARKETING_BRAND as B, MARKETING_FONTS as F } from "../theme/brand";

const PLANS = [
  {
    name: "Starter",
    desc: "Para clubes pequeños o academias empezando su digitalización.",
    price: { monthly: 0, annual: 0 },
    highlight: false,
    features: [
      "Hasta 50 jugadores",
      "Gestión de plantilla básica",
      "Calendario compartido",
      "Soporte por correo"
    ],
    cta: "Comenzar gratis",
  },
  {
    name: "Pro Club",
    desc: "El ecosistema completo para organizaciones deportivas profesionales.",
    price: { monthly: 99, annual: 79 },
    highlight: true,
    features: [
      "Jugadores ilimitados",
      "Módulos de rendimiento y finanzas",
      "Bracket generator para torneos",
      "Portal público personalizado",
      "Soporte prioritario 24/7"
    ],
    cta: "Prueba gratuita de 14 días",
  },
  {
    name: "Enterprise",
    desc: "Soluciones a medida para federaciones y múltiples sucursales.",
    price: { monthly: "Personalizado", annual: "Personalizado" },
    highlight: false,
    features: [
      "Múltiples clubes / sedes",
      "API y webhooks",
      "Despliegue On-Premise opcional",
      "Gestor de cuenta dedicado"
    ],
    cta: "Hablar con ventas",
  }
];

export default function PricingPage() {
  const router = useRouter();
  usePageTitle("Precios — ALTTEZ");
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div style={{ background: B.bg, minHeight: "100vh", fontFamily: F.body, paddingBottom: 120 }}>
      <section style={{ paddingTop: 140, paddingBottom: 60, textAlign: "center", paddingX: 24 }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              margin: "0 0 24px",
              color: B.text,
              fontSize: "clamp(40px, 6vw, 64px)",
              letterSpacing: "-0.04em",
              fontWeight: 800,
              fontFamily: F.display,
            }}
          >
            Invierte en el futuro <br /> de tu organización
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ color: B.textMuted, fontSize: 20, lineHeight: 1.6, maxWidth: 600, margin: "0 auto 48px" }}
          >
            Planes escalables diseñados para clubes de barrio, academias de élite y federaciones enteras.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{ display: "inline-flex", background: B.surfaceStrong, border: `1px solid ${B.border}`, borderRadius: 999, padding: 6 }}
          >
            <button
              onClick={() => setIsAnnual(false)}
              style={{
                padding: "10px 24px", borderRadius: 999, border: "none", cursor: "pointer",
                background: !isAnnual ? B.bg : "transparent",
                color: !isAnnual ? B.text : B.textMuted,
                fontWeight: 700, fontSize: 15, transition: "all 0.2s",
                boxShadow: !isAnnual ? "0 2px 8px rgba(0,0,0,0.06)" : "none"
              }}
            >
              Mensual
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              style={{
                padding: "10px 24px", borderRadius: 999, border: "none", cursor: "pointer",
                background: isAnnual ? B.bg : "transparent",
                color: isAnnual ? B.text : B.textMuted,
                fontWeight: 700, fontSize: 15, transition: "all 0.2s",
                boxShadow: isAnnual ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                display: "flex", alignItems: "center", gap: 8
              }}
            >
              Anual <span style={{ background: B.primarySoft, color: B.primary, padding: "2px 8px", borderRadius: 999, fontSize: 11 }}>Ahorra 20%</span>
            </button>
          </motion.div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, alignItems: "center" }}>
          {PLANS.map((plan, idx) => {
            const isCustom = typeof plan.price.monthly === "string";
            const currentPrice = isCustom ? plan.price.monthly : (isAnnual ? plan.price.annual : plan.price.monthly);
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                style={{
                  background: B.surfaceStrong,
                  borderRadius: 32,
                  padding: 40,
                  border: plan.highlight ? `2px solid ${B.primary}` : `1px solid ${B.border}`,
                  boxShadow: plan.highlight ? `0 24px 64px ${B.primarySoft}` : "0 12px 32px rgba(23,26,28,0.02)",
                  transform: plan.highlight ? "scale(1.02)" : "scale(1)",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {plan.highlight && (
                  <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", background: B.primary, color: "white", padding: "6px 20px", borderRadius: "0 0 16px 16px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Más popular
                  </div>
                )}
                <h3 style={{ fontSize: 24, fontWeight: 800, color: B.text, marginBottom: 12, marginTop: plan.highlight ? 16 : 0 }}>{plan.name}</h3>
                <p style={{ color: B.textMuted, fontSize: 15, lineHeight: 1.5, marginBottom: 32, minHeight: 45 }}>{plan.desc}</p>
                
                <div style={{ marginBottom: 40 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    {!isCustom && <span style={{ fontSize: 28, fontWeight: 700, color: B.text }}>€</span>}
                    <span style={{ fontSize: isCustom ? 32 : 54, fontWeight: 800, color: B.text, letterSpacing: "-0.04em" }}>
                      {currentPrice}
                    </span>
                  </div>
                  {!isCustom && <div style={{ color: B.textMuted, fontSize: 14 }}>por mes, facturado {isAnnual ? "anualmente" : "mensualmente"}</div>}
                </div>

                <button 
                  onClick={() => router.push("/contacto")}
                  style={{
                    width: "100%",
                    padding: 16,
                    borderRadius: 14,
                    background: plan.highlight ? B.primary : B.bg,
                    border: plan.highlight ? "none" : `1px solid ${B.border}`,
                    color: plan.highlight ? "white" : B.text,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    marginBottom: 40,
                    transition: "transform 0.2s",
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseOut={e => e.currentTarget.style.transform = "none"}
                >
                  {plan.cta}
                </button>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {plan.features.map((feat, fidx) => (
                    <div key={fidx} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ color: B.primary, marginTop: 2 }}>
                        <Check size={18} strokeWidth={3} />
                      </div>
                      <span style={{ color: B.text, fontSize: 15, fontWeight: 500 }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
