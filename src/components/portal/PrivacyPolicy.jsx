/**
 * @component PrivacyPolicy
 * @description Pagina publica de Politica de Privacidad y Tratamiento de Datos.
 * Cumplimiento: Ley 1581 de 2012 (Colombia), Decreto 1377 de 2013.
 * Cubre: responsable, finalidades, derechos ARCO, datos de menores.
 *
 * Ruta: /privacidad
 * @author @Arquitecto (Carlos)
 * @version 1.0.0
 */

const PALETTE = {
  bg: "#050a14",
  surface: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.08)",
  neon: "rgb(200,255,0)",
  purple: "#8B5CF6",
  textMuted: "rgba(255,255,255,0.45)",
  textHint: "rgba(255,255,255,0.25)",
  danger: "#FF4444",
};

const LAST_UPDATED = "2026-03-28";
const VERSION = "1.0";
const RESPONSIBLE_ENTITY = "Elevate Sports SAS";
const CONTACT_EMAIL = "privacidad@elevatesports.co";

/** @type {Array<{id: string, title: string, content: string|string[]}>} */
const SECTIONS = [
  {
    id: "responsable",
    title: "1. Responsable del Tratamiento",
    content: [
      `${RESPONSIBLE_ENTITY} (en adelante "Elevate Sports") es el Responsable del Tratamiento de los datos personales que sean recopilados a traves de la plataforma digital disponible en elevatesports.co y sus subdominios.`,
      `Para ejercer sus derechos o formular consultas relacionadas con el tratamiento de sus datos personales, puede contactarse con nuestra area de Proteccion de Datos a traves del correo electronico: ${CONTACT_EMAIL}.`,
    ],
  },
  {
    id: "datos",
    title: "2. Datos Personales Recopilados",
    content: [
      "Recopilamos los siguientes datos personales en el contexto de la prestacion de nuestros servicios de gestion deportiva:",
      "Datos de identificacion: nombre completo, documento de identidad, numero de dorsaly fecha de nacimiento de atletas registrados.",
      "Datos de contacto: correo electronico, numero telefonico y ciudad de residencia del responsable del club.",
      "Datos de salud deportiva: indicadores de carga de entrenamiento (RPE), presencia en sesiones, indicadores de riesgo fisico y snapshots de bienestar deportivo.",
      "Datos financieros: registro de pagos de cuotas y movimientos economicos del club.",
      "Datos de acceso: correo electronico y contrasena cifrada para autenticacion en la plataforma.",
    ],
  },
  {
    id: "finalidades",
    title: "3. Finalidades del Tratamiento",
    content: [
      "Los datos personales recopilados son tratados para las siguientes finalidades:",
      "Prestacion del servicio: gestionar la plantilla deportiva, registrar y analizar sesiones de entrenamiento, y generar reportes de rendimiento y salud deportiva.",
      "Administracion del club: facilitar el control financiero, la comunicacion con atletas y el seguimiento de pagos.",
      "Seguridad y autenticacion: verificar la identidad de los usuarios y proteger el acceso a los datos del club.",
      "Mejora del servicio: analizar el uso de la plataforma de forma anonimizada para mejorar funcionalidades.",
      "Cumplimiento legal: atender requerimientos de autoridades competentes conforme a la ley colombiana.",
    ],
  },
  {
    id: "menores",
    title: "4. Tratamiento de Datos de Menores de Edad",
    content: [
      "Elevate Sports reconoce que muchos atletas registrados en la plataforma pueden ser menores de edad. En cumplimiento del Articulo 7 de la Ley 1581 de 2012, el tratamiento de datos de menores de edad requiere autorizacion expresa de sus padres, madres o representantes legales.",
      "Al registrar un club en nuestra plataforma, el responsable del club certifica expresamente que cuenta con la autorizacion de los padres o tutores legales de cada atleta menor de edad cuya informacion sea ingresada en el sistema.",
      "Los datos de salud deportiva de menores de edad son tratados unicamente para las finalidades deportivas descritas en esta politica y no seran compartidos con terceros sin autorizacion expresa.",
      "El responsable del club es el garante frente a los padres y tutores del correcto uso de los datos de los menores a su cargo. Elevate Sports actua como Encargado del Tratamiento en relacion con dichos datos.",
    ],
  },
  {
    id: "derechos",
    title: "5. Derechos ARCO del Titular",
    content: [
      "En virtud de la Ley 1581 de 2012, usted como Titular de los datos personales tiene los siguientes derechos:",
      "Acceso: conocer los datos personales que Elevate Sports tiene sobre usted y la informacion relativa a las condiciones y generalidades de su tratamiento.",
      "Rectificacion: solicitar la actualizacion o correccion de sus datos cuando sean inexactos, incompletos o erroneos.",
      "Cancelacion (Supresion): solicitar la eliminacion de sus datos cuando considere que no estan siendo tratados conforme a los principios, derechos y garantias previstos en la Ley.",
      "Oposicion: oponerse al tratamiento de sus datos para finalidades especificas, en los casos en que ello sea legalmente procedente.",
      "Para ejercer estos derechos, envie su solicitud a " + CONTACT_EMAIL + " indicando su nombre completo, el club al que pertenece y la accion solicitada. Responderemos en un plazo maximo de 15 dias habiles para consultas y 15 dias habiles para reclamos, prorrogables por una vez por el mismo termino.",
    ],
  },
  {
    id: "seguridad",
    title: "6. Medidas de Seguridad",
    content: [
      "Elevate Sports implementa medidas tecnicas y organizativas para proteger sus datos personales contra acceso no autorizado, alteracion, divulgacion o destruccion. Estas medidas incluyen:",
      "Cifrado de contrasenas mediante algoritmos de hashing seguros (bcrypt) implementados por Supabase Auth.",
      "Politicas de Row Level Security (RLS) en base de datos que garantizan que cada club solo puede acceder a sus propios datos.",
      "Transmision de datos mediante protocolos seguros (HTTPS/TLS).",
      "Acceso restringido por roles (RBAC): admin, coach y staff, con permisos diferenciados por modulo.",
      "Almacenamiento de datos en infraestructura cloud con certificaciones de seguridad internacionales (Supabase / AWS).",
    ],
  },
  {
    id: "transferencias",
    title: "7. Transferencias Internacionales",
    content: [
      "Los datos personales pueden ser almacenados y procesados en servidores ubicados fuera de Colombia a traves de nuestros proveedores de infraestructura cloud (Supabase Inc., con servidores en Estados Unidos). Esta transferencia se realiza bajo garantias contractuales adecuadas que aseguran un nivel de proteccion equivalente al exigido por la normativa colombiana.",
      "No vendemos, arrendamos ni compartimos datos personales con terceros para finalidades de mercadeo.",
    ],
  },
  {
    id: "vigencia",
    title: "8. Vigencia de la Politica",
    content: [
      `Esta Politica de Privacidad entra en vigencia el ${LAST_UPDATED} y corresponde a la version ${VERSION}. Nos reservamos el derecho de actualizarla para reflejar cambios en nuestra plataforma o en la normativa aplicable.`,
      "En caso de cambios sustanciales, notificaremos a los usuarios registrados a traves del correo electronico asociado a su cuenta. La continuacion en el uso de la plataforma tras la notificacion implica la aceptacion de la nueva version.",
    ],
  },
  {
    id: "autoridad",
    title: "9. Autoridad de Control",
    content: [
      "La Superintendencia de Industria y Comercio (SIC) es la autoridad de control en materia de proteccion de datos personales en Colombia. Si considera que Elevate Sports ha vulnerado sus derechos, puede presentar una queja ante la SIC una vez haya agotado el tramite de consulta o reclamo ante nuestra empresa.",
      "Superintendencia de Industria y Comercio: www.sic.gov.co | Linea gratuita: 01 8000 910165.",
    ],
  },
];

/* ── Inyeccion de keyframe una sola vez ── */
if (typeof document !== "undefined" && !document.getElementById("privacy-kf")) {
  const s = document.createElement("style");
  s.id = "privacy-kf";
  s.textContent = "@keyframes prv_fade{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}";
  document.head.appendChild(s);
}

export default function PrivacyPolicy() {
  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse at 50% 10%, rgba(139,92,246,0.06) 0%, ${PALETTE.bg} 60%)`,
      fontFamily: "'Arial Narrow', Arial, sans-serif",
      color: "white",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${PALETTE.border}`,
        background: "rgba(10,10,20,0.9)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <a
          href="/crm"
          style={{
            fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px",
            color: PALETTE.textMuted, textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "white"; }}
          onMouseLeave={e => { e.currentTarget.style.color = PALETTE.textMuted; }}
        >
          ← Volver
        </a>
        <div style={{ width: 1, height: 20, background: PALETTE.border }} />
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
          Elevate<span style={{ color: PALETTE.neon }}>Sports</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            fontSize: 9, textTransform: "uppercase", letterSpacing: "2px",
            padding: "3px 8px", background: `${PALETTE.purple}22`,
            border: `1px solid ${PALETTE.purple}44`, color: PALETTE.purple,
          }}>
            v{VERSION}
          </div>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "2px", color: PALETTE.textHint }}>
            {LAST_UPDATED}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "48px 24px 80px",
        animation: "prv_fade 0.5s ease-out",
      }}>
        {/* Hero */}
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <div style={{
            fontSize: 9, textTransform: "uppercase", letterSpacing: "4px",
            color: PALETTE.purple, marginBottom: 12, fontWeight: 700,
          }}>
            Ley 1581 de 2012 · Colombia
          </div>
          <h1 style={{
            fontSize: 36, fontWeight: 900, letterSpacing: "-1px",
            textTransform: "uppercase", marginBottom: 16, lineHeight: 1,
          }}>
            Politica de Tratamiento<br />
            <span style={{ color: PALETTE.purple }}>de Datos Personales</span>
          </h1>
          <p style={{
            fontSize: 13, color: PALETTE.textMuted, lineHeight: 1.7,
            maxWidth: 560, margin: "0 auto",
          }}>
            {RESPONSIBLE_ENTITY} se compromete con la proteccion de sus datos personales
            y el cumplimiento de la normativa colombiana de habeas data.
          </p>

          {/* Barra de confianza */}
          <div style={{
            display: "flex", justifyContent: "center", gap: 24, marginTop: 24,
            flexWrap: "wrap",
          }}>
            {[
              { label: "Ley 1581/2012", icon: "§" },
              { label: "Decreto 1377/2013", icon: "§" },
              { label: "RLS por club_id", icon: "L" },
              { label: "HTTPS/TLS", icon: "S" },
            ].map((tag, i) => (
              <div key={i} style={{
                fontSize: 9, textTransform: "uppercase", letterSpacing: "1.5px",
                color: PALETTE.textMuted, display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ color: PALETTE.purple, fontSize: 12 }}>{tag.icon}</span>
                {tag.label}
              </div>
            ))}
          </div>
        </div>

        {/* Separador */}
        <div style={{
          height: 1, background: `linear-gradient(to right, transparent, ${PALETTE.purple}66, transparent)`,
          marginBottom: 48,
        }} />

        {/* Secciones */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {SECTIONS.map((section, idx) => (
            <section
              key={section.id}
              id={section.id}
              style={{
                background: PALETTE.surface,
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: `1px solid ${PALETTE.border}`,
                borderLeft: `3px solid ${PALETTE.purple}`,
                borderRadius: 8,
                padding: 28,
                animation: `prv_fade ${0.3 + idx * 0.07}s ease-out`,
              }}
            >
              <h2 style={{
                fontSize: 13, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "1px", color: "white", marginBottom: 16,
                paddingBottom: 12, borderBottom: `1px solid ${PALETTE.border}`,
              }}>
                {section.title}
              </h2>
              {(Array.isArray(section.content) ? section.content : [section.content]).map((para, pIdx) => (
                <p
                  key={pIdx}
                  style={{
                    fontSize: 13, color: pIdx === 0 ? "rgba(255,255,255,0.75)" : PALETTE.textMuted,
                    lineHeight: 1.8, marginBottom: pIdx < section.content.length - 1 ? 12 : 0,
                    paddingLeft: pIdx > 0 && section.content.length > 2 ? 12 : 0,
                    borderLeft: pIdx > 0 && section.content.length > 2
                      ? `1px solid ${PALETTE.border}` : "none",
                  }}
                >
                  {para}
                </p>
              ))}
            </section>
          ))}
        </div>

        {/* Footer de contacto */}
        <div style={{
          marginTop: 48,
          padding: 28,
          background: `linear-gradient(135deg, rgba(139,92,246,0.08), rgba(10,10,20,0.8))`,
          border: `1px solid ${PALETTE.purple}44`,
          borderRadius: 8,
          textAlign: "center",
        }}>
          <div style={{
            fontSize: 9, textTransform: "uppercase", letterSpacing: "3px",
            color: PALETTE.purple, marginBottom: 12, fontWeight: 700,
          }}>
            Contacto de Privacidad
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 8 }}>
            {RESPONSIBLE_ENTITY}
          </div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            style={{
              fontSize: 13, color: PALETTE.purple, textDecoration: "none",
              fontWeight: 700, letterSpacing: "0.5px",
            }}
          >
            {CONTACT_EMAIL}
          </a>
          <div style={{ marginTop: 16, fontSize: 10, color: PALETTE.textHint }}>
            Tiempo de respuesta: 15 dias habiles para consultas · 15 dias habiles para reclamos
          </div>
        </div>

        {/* Footer legal minimo */}
        <div style={{
          marginTop: 32, textAlign: "center",
          fontSize: 9, color: PALETTE.textHint,
          textTransform: "uppercase", letterSpacing: "2px",
        }}>
          Elevate Sports SAS · Politica version {VERSION} · Vigente desde {LAST_UPDATED}
        </div>
      </div>
    </div>
  );
}
