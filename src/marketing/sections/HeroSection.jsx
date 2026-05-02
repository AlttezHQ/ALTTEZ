import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Cloud, ShieldCheck, Users } from "lucide-react";
import { MARKETING_BRAND as B, MARKETING_FONTS as F } from "../theme/brand";
import DashboardPreview, { FloatingSessionCard, FloatingBarCard, FloatingDonutCard } from "./DashboardPreview";

const TRUST = [
  { Icon: Cloud, label: "Offline-first" },
  { Icon: Users, label: "Multi-club" },
  { Icon: ShieldCheck, label: "Datos seguros" },
];

const FADE_UP = { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 } };

export default function HeroSection() {
  const navigate = useNavigate();

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "alttez-hero-responsive";
    style.textContent = `
      .hz-grid {
        display: grid;
        grid-template-columns: minmax(360px, 520px) minmax(0, 1fr);
        gap: 44px;
        align-items: center;
      }
      .hz-badge-row {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 24px;
      }
      .hz-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 999px;
        border: 1px solid rgba(206, 137, 70,0.18);
        background: rgba(255,255,255,0.82);
        color: ${B.text};
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.02em;
      }
      .hz-title {
        margin: 0 0 18px;
        font-family: ${F.display};
        font-size: clamp(48px, 5.4vw, 82px);
        line-height: 0.96;
        letter-spacing: -0.07em;
        color: ${B.text};
      }
      .hz-desc {
        margin: 0;
        max-width: 500px;
        color: ${B.textMuted};
        font-size: clamp(17px, 1.65vw, 22px);
        line-height: 1.6;
      }
      .hz-actions {
        display: flex;
        gap: 14px;
        flex-wrap: wrap;
        margin-top: 30px;
      }
      .hz-btn-primary,
      .hz-btn-secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 50px;
        padding: 0 24px;
        border-radius: 14px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
      }
      .hz-btn-primary {
        border: 1px solid rgba(183,131,45,0.28);
        background: linear-gradient(135deg, #CE8946 0%, #A66F38 100%);
        color: #fff;
        box-shadow: 0 16px 32px rgba(206, 137, 70,0.22);
      }
      .hz-btn-secondary {
        border: 1px solid ${B.border};
        background: rgba(255,255,255,0.88);
        color: ${B.text};
        box-shadow: 0 10px 24px rgba(23,26,28,0.08);
      }
      .hz-btn-primary:hover,
      .hz-btn-secondary:hover {
        transform: translateY(-1px);
      }
      .hz-trust {
        display: flex;
        align-items: center;
        gap: 22px;
        flex-wrap: wrap;
        margin-top: 34px;
        padding-top: 22px;
        border-top: 1px solid ${B.border};
      }
      .hz-trust-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: ${B.textMuted};
        font-size: 13px;
        font-weight: 600;
      }
      .hz-figure-shell {
        position: relative;
        padding: 28px;
        border-radius: 30px;
        background: linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(245,241,234,0.74) 100%);
        border: 1px solid rgba(206, 137, 70,0.14);
        box-shadow: 0 28px 72px rgba(23,26,28,0.10);
      }
      .hz-stage {
        position: relative;
        min-height: 640px;
      }
      .hz-dashboard {
        position: relative;
        z-index: 2;
        transform: perspective(1800px) rotateY(-9deg) rotateX(2.4deg);
        transform-origin: left center;
      }
      .hz-float-card {
        position: absolute;
        right: -12px;
        z-index: 3;
        pointer-events: none;
      }
      .hz-float-session { top: 54px; }
      .hz-float-bar { top: 282px; }
      .hz-float-donut { top: 456px; }
      @media (max-width: 1180px) {
        .hz-grid { grid-template-columns: 1fr; }
        .hz-stage { min-height: 500px; }
        .hz-dashboard {
          transform: perspective(1400px) rotateY(-6deg) rotateX(1.6deg) scale(0.94);
          transform-origin: center top;
        }
      }
      @media (max-width: 1020px) {
        .hz-float-card { display: none; }
        .hz-stage { min-height: auto; }
        .hz-dashboard {
          transform: none;
        }
      }
      @media (max-width: 768px) {
        .hz-section { padding: 34px 18px 72px !important; }
        .hz-figure-shell { padding: 16px; border-radius: 22px; }
        .hz-actions { flex-direction: column; }
        .hz-btn-primary, .hz-btn-secondary { width: 100%; }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (
    <section
      className="hz-section"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "44px 32px 92px",
        fontFamily: F.body,
        background: `
          radial-gradient(circle at 10% 12%, rgba(206, 137, 70,0.10), transparent 26%),
          radial-gradient(circle at 88% 16%, rgba(206, 137, 70,0.12), transparent 22%),
          linear-gradient(180deg, #F6F1EA 0%, #F8F4EE 56%, #F6F1EA 100%)
        `,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(23,26,28,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(23,26,28,0.018) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.55), transparent 90%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1480, margin: "0 auto" }}>
        <div className="hz-grid">
          <div>
            <motion.div {...FADE_UP} transition={{ duration: 0.5 }}>
              <div className="hz-badge-row">
                <span className="hz-chip">
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: B.primary, display: "inline-block" }} />
                  Plataforma operativa para clubes
                </span>
                <span className="hz-chip" style={{ background: "rgba(244,231,207,0.72)" }}>
                  Demo aprobada
                </span>
              </div>
            </motion.div>

            <motion.h1 className="hz-title" {...FADE_UP} transition={{ duration: 0.58, delay: 0.06 }}>
              Gestión deportiva
              <br />
              clara, seria
              <br />
              y lista para crecer.
            </motion.h1>

            <motion.p className="hz-desc" {...FADE_UP} transition={{ duration: 0.58, delay: 0.12 }}>
              ALTTEZ unifica plantilla, entrenamiento, calendario, finanzas y operación diaria en un sistema que se siente premium, ordenado y fácil de usar para todo el club.
            </motion.p>

            <motion.div className="hz-actions" {...FADE_UP} transition={{ duration: 0.58, delay: 0.18 }}>
              <button className="hz-btn-primary" onClick={() => navigate("/contacto")}>
                Solicitar demo
                <ArrowRight size={15} />
              </button>
              <button className="hz-btn-secondary" onClick={() => navigate("/producto/alttezcrm")}>
                Ver plataforma
              </button>
            </motion.div>

            <motion.div className="hz-trust" {...FADE_UP} transition={{ duration: 0.58, delay: 0.24 }}>
              {TRUST.map(({ Icon, label }) => (
                <div key={label} className="hz-trust-item">
                  <Icon size={16} color={B.primary} />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.72, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hz-figure-shell">
              <div className="hz-stage">
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: "14% auto auto 12%",
                    width: 260,
                    height: 260,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(206, 137, 70,0.18) 0%, transparent 72%)",
                    filter: "blur(10px)",
                  }}
                />
                <div className="hz-dashboard">
                  <DashboardPreview />
                </div>
                <motion.div className="hz-float-card hz-float-session" animate={{ y: [0, -7, 0] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}>
                  <FloatingSessionCard />
                </motion.div>
                <motion.div className="hz-float-card hz-float-bar" animate={{ y: [0, -5, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}>
                  <FloatingBarCard />
                </motion.div>
                <motion.div className="hz-float-card hz-float-donut" animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}>
                  <FloatingDonutCard />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
