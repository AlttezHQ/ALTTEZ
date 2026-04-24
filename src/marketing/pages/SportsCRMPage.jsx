import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../../shared/hooks/usePageTitle";
import { MARKETING_BRAND as B, MARKETING_GRADIENTS as G } from "../theme/brand";

const MODULES = [
  {
    title: "Plantilla y estructura operativa",
    body: "Informacion del deportista, disponibilidad y seguimiento en una vista que ordena el trabajo diario del club.",
  },
  {
    title: "Entrenamiento y control de carga",
    body: "Sesiones, seguimiento fisico y contexto deportivo en una sola capa de trabajo para el cuerpo tecnico.",
  },
  {
    title: "Calendario y coordinacion",
    body: "Partidos, sesiones, agenda y confirmaciones centralizadas para reducir friccion operativa.",
  },
  {
    title: "Administracion y visibilidad financiera",
    body: "Mensualidades, movimientos y trazabilidad del mes en un lenguaje claro para la direccion del club.",
  },
];

const BENEFITS = [
  "Menos dispersion operativa y menos retrabajo",
  "Mas claridad para cuerpo tecnico, direccion y administracion",
  "Una experiencia consistente con proyectos deportivos serios",
];

const SNAPSHOTS = [
  { label: "Operacion diaria", value: "Centralizada" },
  { label: "Frentes clave", value: "6" },
  { label: "Visibilidad", value: "Tiempo real" },
  { label: "Coordinacion", value: "Mas clara" },
];

function ProductPanel() {
  return (
    <div
      style={{
        borderRadius: 28,
        overflow: "hidden",
        border: `1px solid ${B.border}`,
        background: G.panel,
        boxShadow: "0 24px 64px rgba(0,0,0,0.36)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          borderBottom: `1px solid ${B.border}`,
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {[0, 1, 2].map((item) => (
            <span key={item} style={{ width: 8, height: 8, borderRadius: "50%", background: item === 0 ? "#93B4FF" : "rgba(255,255,255,0.18)" }} />
          ))}
          <span style={{ color: B.textHint, fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px" }}>ALTTEZ CRM</span>
        </div>
        <span style={{ color: "#C7D6FF", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.3px" }}>Executive View</span>
      </div>

      <div style={{ padding: 20, display: "grid", gap: 18 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: 16,
          }}
        >
          <div
            style={{
              borderRadius: 20,
              padding: 18,
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${B.border}`,
            }}
          >
            <div style={{ color: B.textHint, fontSize: 10, textTransform: "uppercase", letterSpacing: "1.4px", marginBottom: 10 }}>
              Flujo operativo
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {MODULES.slice(0, 3).map((item, index) => (
                <div
                  key={item.title}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "34px 1fr",
                    gap: 12,
                    alignItems: "start",
                    padding: "10px 12px",
                    borderRadius: 14,
                    background: index === 0 ? B.primarySoft : "rgba(255,255,255,0.02)",
                    border: `1px solid ${index === 0 ? "rgba(96,165,250,0.18)" : B.border}`,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: index === 0 ? "rgba(47,107,255,0.18)" : "rgba(255,255,255,0.03)",
                      color: "#DCE7FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    0{index + 1}
                  </div>
                  <div>
                    <div style={{ color: B.text, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ color: B.textHint, fontSize: 10, lineHeight: 1.6 }}>{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              borderRadius: 20,
              padding: 18,
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${B.border}`,
              display: "grid",
              gap: 12,
              alignContent: "start",
            }}
          >
            {SNAPSHOTS.map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "12px 12px 14px",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${B.border}`,
                }}
              >
                <div style={{ color: B.textHint, fontSize: 10 }}>{item.label}</div>
                <div
                  style={{
                    marginTop: 7,
                    color: item.value === "6" ? "#C7D6FF" : B.text,
                    fontSize: 23,
                    fontWeight: 800,
                    fontFamily: "'Orbitron', 'Exo 2', Arial, sans-serif",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {MODULES.map((item) => (
            <div
              key={item.title}
              style={{
                padding: "16px 14px",
                borderRadius: 16,
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${B.border}`,
              }}
            >
              <div style={{ color: B.text, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
              <div style={{ color: B.textHint, fontSize: 10, lineHeight: 1.6 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SportsCRMPage() {
  const navigate = useNavigate();
  usePageTitle("ALTTEZ CRM");

  return (
    <div style={{ overflowX: "hidden" }}>
      <section
        style={{
          padding: "88px 24px 72px",
          background: G.hero,
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.95fr) minmax(0, 1.05fr)",
            gap: 40,
            alignItems: "center",
          }}
        >
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 14px",
                borderRadius: 999,
                background: B.primarySoft,
                border: `1px solid ${B.border}`,
                color: "#C7D6FF",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: 22,
              }}
            >
              Plataforma principal
            </div>

            <h1
              style={{
                margin: "0 0 18px",
                color: B.text,
                fontSize: "clamp(34px, 5vw, 68px)",
                lineHeight: 0.98,
                letterSpacing: "-0.045em",
                fontWeight: 800,
                fontFamily: "'Orbitron', 'Exo 2', Arial, sans-serif",
                textTransform: "uppercase",
              }}
            >
              Todo el frente
              <br />
              operativo del club
              <br />
              <span style={{ color: "#9DBBFF" }}>en una sola plataforma.</span>
            </h1>

            <p style={{ margin: "0 0 28px", maxWidth: 560, color: B.textMuted, fontSize: 16, lineHeight: 1.8 }}>
              ALTTEZ CRM reune plantilla, entrenamiento, calendario, control administrativo y reportes en una plataforma pensada para clubes que necesitan orden operativo, visibilidad ejecutiva y una experiencia mas solida hacia adentro y hacia afuera.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: `0 16px 38px ${B.primaryGlow}` }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/contacto")}
                style={{
                  padding: "15px 22px",
                  borderRadius: 12,
                  border: "1px solid rgba(96,165,250,0.28)",
                  background: G.button,
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Solicitar demo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/crm?demo=true")}
                style={{
                  padding: "15px 22px",
                  borderRadius: 12,
                  border: `1px solid ${B.borderStrong}`,
                  background: "rgba(255,255,255,0.02)",
                  color: B.text,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Ver entorno piloto
              </motion.button>
            </div>

            <div style={{ display: "grid", gap: 8, marginBottom: 26 }}>
              {BENEFITS.map((benefit) => (
                <div key={benefit} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: B.primary, boxShadow: `0 0 12px ${B.primaryGlow}` }} />
                  <span style={{ color: B.textHint, fontSize: 12 }}>{benefit}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, maxWidth: 520 }}>
              {[
                { value: "6", label: "frentes conectados" },
                { value: "1", label: "sistema de referencia" },
                { value: "24/7", label: "lectura del club" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "15px 14px",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.025)",
                    border: `1px solid ${B.border}`,
                  }}
                >
                  <div style={{ color: "#C7D6FF", fontSize: 24, fontWeight: 800, lineHeight: 1, fontFamily: "'Orbitron', 'Exo 2', Arial, sans-serif" }}>
                    {item.value}
                  </div>
                  <div style={{ marginTop: 6, color: B.textHint, fontSize: 10, lineHeight: 1.5 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}>
            <ProductPanel />
          </motion.div>
        </div>
      </section>

      <section style={{ padding: "80px 24px", maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 42 }}>
          <div style={{ color: "#C7D6FF", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.6px", marginBottom: 16 }}>
            Que resuelve ALTTEZ
          </div>
          <h2
            style={{
              margin: "0 0 14px",
              color: B.text,
              fontSize: "clamp(28px, 4vw, 52px)",
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              fontWeight: 800,
              fontFamily: "'Orbitron', 'Exo 2', Arial, sans-serif",
              textTransform: "uppercase",
            }}
          >
            La operacion deja de estar fragmentada.
          </h2>
          <p style={{ maxWidth: 720, margin: "0 auto", color: B.textMuted, fontSize: 15, lineHeight: 1.75 }}>
            Pensado para organizaciones que necesitan ordenar la ejecucion, mejorar coordinacion y profesionalizar la gestion cotidiana del equipo.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
          {MODULES.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.07 }}
              whileHover={{ y: -5 }}
              style={{
                borderRadius: 22,
                padding: 22,
                background: G.panel,
                border: `1px solid ${B.border}`,
                boxShadow: "0 16px 42px rgba(0,0,0,0.24)",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: B.primarySoft,
                  border: "1px solid rgba(96,165,250,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#DCE7FF",
                  fontSize: 13,
                  fontWeight: 800,
                  marginBottom: 16,
                }}
              >
                0{index + 1}
              </div>
              <h3 style={{ margin: "0 0 10px", color: B.text, fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", fontFamily: "'Orbitron', 'Exo 2', Arial, sans-serif" }}>
                {module.title}
              </h3>
              <p style={{ margin: 0, color: B.textMuted, fontSize: 13, lineHeight: 1.7 }}>{module.body}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
