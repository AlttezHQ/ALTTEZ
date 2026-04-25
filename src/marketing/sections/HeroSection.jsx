import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Cloud, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { MARKETING_BRAND as B, MARKETING_FONTS as F } from "../theme/brand";
import DashboardPreview, { FloatingSessionCard, FloatingBarCard, FloatingDonutCard } from "./DashboardPreview";

const TRUST = [
  { Icon: Cloud,       label: "Offline-first" },
  { Icon: Users,       label: "Multi-club" },
  { Icon: ShieldCheck, label: "Datos seguros" },
];

const FADE_UP = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

export default function HeroSection() {
  const navigate = useNavigate();

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "alttez-hero-responsive";
    style.textContent = `
      .hz-grid {
        display: grid;
        grid-template-columns: 500px 1fr;
        gap: 48px;
        align-items: center;
      }
      .hz-right {
        overflow: visible;
        position: relative;
      }
      .hz-float-card {
        position: absolute;
        right: 0;
        z-index: 30;
        pointer-events: none;
        filter: drop-shadow(0 8px 24px rgba(0,0,0,0.14));
      }
      .hz-float-session { top: 58px; }
      .hz-float-bar     { top: 284px; }
      .hz-float-donut   { top: 458px; }
      @media (max-width: 1020px) {
        .hz-float-card { display: none; }
      }
      .hz-title {
        font-size: clamp(52px, 5.5vw, 88px);
        font-weight: 900;
        line-height: 0.95;
        letter-spacing: -0.06em;
        margin: 0 0 24px;
        color: #171a1c;
      }
      .hz-desc {
        font-size: clamp(17px, 1.6vw, 22px);
        line-height: 1.55;
        color: #5f6368;
        max-width: 450px;
        margin: 0;
      }
      .hz-actions {
        display: flex;
        gap: 14px;
        flex-wrap: wrap;
        margin-top: 28px;
      }
      .hz-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 15px 34px;
        border-radius: 12px;
        background: linear-gradient(135deg, #D4A240 0%, #B87A22 100%);
        color: white;
        font-size: 14px;
        font-weight: 700;
        border: none;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(184,122,34,0.35), 0 2px 6px rgba(184,122,34,0.20), inset 0 1px 0 rgba(255,255,255,0.15);
        transition: transform 0.18s ease, box-shadow 0.18s ease;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        font-size: 12px;
      }
      .hz-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 36px rgba(184,122,34,0.45), 0 4px 10px rgba(184,122,34,0.22), inset 0 1px 0 rgba(255,255,255,0.15);
      }
      .hz-btn-primary:active {
        transform: translateY(0px);
        box-shadow: 0 4px 14px rgba(184,122,34,0.30);
      }
      .hz-btn-secondary {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 14px 32px;
        border-radius: 12px;
        border: 1.5px solid rgba(0,0,0,0.14);
        background: rgba(255,255,255,0.80);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: #171a1c;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }
      .hz-btn-secondary:hover {
        border-color: rgba(201,151,58,0.45);
        background: white;
        box-shadow: 0 6px 20px rgba(0,0,0,0.07);
      }
      .hz-trust {
        display: flex;
        align-items: center;
        gap: 28px;
        flex-wrap: wrap;
        margin-top: 32px;
        padding-top: 28px;
        border-top: 1px solid rgba(0,0,0,0.08);
      }
      .hz-trust-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 600;
        color: #3d3d3d;
      }
      .hz-rise {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 36px;
      }
      .hz-scene {
        perspective: 1400px;
        perspective-origin: 30% 40%;
      }
      .hz-dashboard-3d {
        transform: rotateY(-14deg) rotateX(4deg) scale(1);
        transform-origin: left top;
        transform-style: preserve-3d;
        filter:
          drop-shadow(0 48px 80px rgba(0,0,0,0.26))
          drop-shadow(0 12px 24px rgba(0,0,0,0.14))
          drop-shadow(0 2px 4px rgba(0,0,0,0.10));
        transition: transform 0.7s cubic-bezier(0.22,1,0.36,1), filter 0.7s ease;
        border-radius: 20px;
        /* device highlight — light catch on top-left edge */
        outline: 1px solid rgba(255,255,255,0.55);
        outline-offset: -1px;
      }
      .hz-dashboard-3d:hover {
        transform: rotateY(-9deg) rotateX(2deg) scale(1.01);
        filter:
          drop-shadow(0 56px 96px rgba(0,0,0,0.30))
          drop-shadow(0 16px 32px rgba(0,0,0,0.16))
          drop-shadow(0 3px 6px rgba(0,0,0,0.10));
      }
      @media (max-width: 1400px) {
        .hz-scene { perspective: 1200px; }
        .hz-dashboard-3d {
          transform: rotateY(-12deg) rotateX(3.5deg) scale(0.92);
          transform-origin: left top;
        }
      }
      @media (max-width: 1180px) {
        .hz-grid {
          grid-template-columns: 440px 1fr;
          gap: 32px;
        }
        .hz-scene { perspective: 1000px; }
        .hz-dashboard-3d {
          transform: rotateY(-10deg) rotateX(3deg) scale(0.82);
          transform-origin: left top;
        }
      }
      @media (max-width: 1020px) {
        .hz-grid {
          grid-template-columns: 1fr;
          gap: 48px;
        }
        .hz-right {
          order: -1;
        }
        .hz-scene { perspective: 900px; perspective-origin: 50% 40%; }
        .hz-dashboard-3d {
          transform: rotateY(-8deg) rotateX(2deg) scale(0.72);
          transform-origin: center top;
        }
      }
      @media (max-width: 768px) {
        .hz-section {
          padding: 48px 20px 64px !important;
        }
        .hz-title {
          font-size: clamp(40px, 12vw, 56px);
        }
        .hz-actions {
          flex-direction: column;
        }
        .hz-btn-primary,
        .hz-btn-secondary {
          width: 100%;
          justify-content: center;
        }
        .hz-scene { perspective: 800px; }
        .hz-dashboard-3d {
          transform: rotateY(-5deg) rotateX(1.5deg) scale(0.60);
          transform-origin: left top;
          filter: drop-shadow(0 20px 48px rgba(0,0,0,0.20)) drop-shadow(0 4px 8px rgba(0,0,0,0.10));
        }
        .hz-right {
          overflow: hidden;
          height: 340px;
        }
        .hz-trust {
          gap: 18px;
        }
        .hz-rise {
          display: none;
        }
      }
      @media (max-width: 480px) {
        .hz-scene { perspective: 700px; }
        .hz-dashboard-3d {
          transform: rotateY(-3deg) rotateX(1deg) scale(0.48);
          transform-origin: left top;
        }
        .hz-right {
          height: 280px;
        }
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
        background: B.bg,
        padding: "72px 56px 100px",
        overflow: "hidden",
        fontFamily: F.body,
      }}
    >
      {/* Stadium / pitch background — matches mockup bottom-right faint image */}
      {/* Replace /brand/hero-stadium-bg.png with real asset when available */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "68%",
          backgroundImage: "url('/brand/hero-stadium-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center 55%",
          opacity: 0.55,
          pointerEvents: "none",
          maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.85) 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.85) 100%)",
        }}
      />
      {/* Warm accent glow — top right */}
      <div style={{
        position: "absolute",
        top: -100,
        right: -120,
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,151,58,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1580, margin: "0 auto" }}>
        <div className="hz-grid">

          {/* ── Left column ── */}
          <div>
            {/* Eyebrow */}
            <motion.div
              {...FADE_UP}
              transition={{ duration: 0.55, delay: 0.0 }}
              style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}
            >
              <span style={{ height: 2, width: 32, background: B.primary, borderRadius: 2, display: "inline-block" }} />
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.42em",
                color: B.textMuted,
              }}>
                Software deportivo todo en uno
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="hz-title"
              {...FADE_UP}
              transition={{ duration: 0.65, delay: 0.07 }}
            >
              Eleva la<br />gestión de<br />tu club<span style={{ color: B.primary }}>.</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              className="hz-desc"
              {...FADE_UP}
              transition={{ duration: 0.65, delay: 0.14 }}
            >
              Jugadores, entrenamientos, calendario, pagos y rendimiento en una sola plataforma profesional.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="hz-actions"
              {...FADE_UP}
              transition={{ duration: 0.65, delay: 0.20 }}
            >
              <button className="hz-btn-primary" onClick={() => navigate("/contacto")}>
                Solicitar demo
              </button>
              <button className="hz-btn-secondary" onClick={() => navigate("/servicios/sports-crm")}>
                Ver plataforma
              </button>
            </motion.div>

            {/* Trust items */}
            <motion.div
              className="hz-trust"
              {...FADE_UP}
              transition={{ duration: 0.65, delay: 0.26 }}
            >
              {TRUST.map(({ Icon, label }) => (
                <div key={label} className="hz-trust-item">
                  <Icon size={16} color={B.primary} />
                  {label}
                </div>
              ))}
            </motion.div>

            {/* Rise Above mark */}
            <motion.div
              className="hz-rise"
              {...FADE_UP}
              transition={{ duration: 0.65, delay: 0.32 }}
            >
              <TrendingUp size={22} color={B.primary} />
              <div style={{ width: 1, height: 28, background: "rgba(0,0,0,0.10)" }} />
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: B.textMuted,
              }}>
                ALTTEZ — Rise Above.
              </span>
            </motion.div>
          </div>

          {/* ── Right column: dashboard mockup ── */}
          <div className="hz-right hz-scene">
            {/* Dashboard — 3D perspective transform */}
            <motion.div
              initial={{ opacity: 0, x: 36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="hz-dashboard-3d"
            >
              <DashboardPreview />
            </motion.div>

            {/* Floating cards — OUTSIDE the 3D transform, independent depth plane */}
            <motion.div
              className="hz-float-card hz-float-session"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.72, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 1.0 }}
              >
                <FloatingSessionCard />
              </motion.div>
            </motion.div>

            <motion.div
              className="hz-float-card hz-float-bar"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.88, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4.1, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <FloatingBarCard />
              </motion.div>
            </motion.div>

            <motion.div
              className="hz-float-card hz-float-donut"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 1.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
              >
                <FloatingDonutCard />
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
