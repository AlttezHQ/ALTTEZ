/**
 * @component LegalDisclaimer
 * @description Politica de Tratamiento de Datos Personales (Ley 1581 de 2012, Colombia)
 * y Terminos de Servicio basicos para Elevate Sports.
 *
 * @author @QA (Sara-QA_Seguridad)
 * @version 1.0.0
 */

import { useState } from "react";

const font = {
  display: "'Barlow Condensed', 'Arial Narrow', sans-serif",
  body: "'Barlow', Arial, sans-serif",
};

const LP = {
  bg: "#1A1A2E",
  panel: "#2A2A3A",
  border: "rgba(255,255,255,0.08)",
  neon: "#c8ff00",
  purple: "#7C3AED",
  text: "white",
  muted: "rgba(255,255,255,0.5)",
  hint: "rgba(255,255,255,0.25)",
};

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <h3 style={{
      fontFamily: font.display, fontSize: 14, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "1.5px",
      color: LP.neon, marginBottom: 8,
    }}>{title}</h3>
    <div style={{ fontSize: 12, color: LP.muted, lineHeight: 1.8, fontFamily: font.body }}>
      {children}
    </div>
  </div>
);

export default function LegalDisclaimer({ onClose }) {
  const [activeTab, setActiveTab] = useState("privacy");

  const tabs = [
    { key: "privacy", label: "Politica de datos" },
    { key: "terms", label: "Terminos de servicio" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Informacion legal"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.8)", display: "flex",
        alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 640, maxHeight: "85vh",
          background: LP.panel, borderRadius: 16,
          border: `1px solid ${LP.border}`,
          boxShadow: "0 16px 64px rgba(0,0,0,0.6)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${LP.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", gap: 16 }}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                aria-selected={activeTab === t.key}
                role="tab"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: font.display, fontSize: 12, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "1.5px",
                  color: activeTab === t.key ? LP.neon : LP.muted,
                  borderBottom: activeTab === t.key ? `2px solid ${LP.neon}` : "2px solid transparent",
                  paddingBottom: 4,
                }}
              >{t.label}</button>
            ))}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: LP.muted, fontSize: 18, padding: "0 4px",
            }}
          >✕</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>

          {activeTab === "privacy" && (
            <div role="tabpanel" aria-label="Politica de datos personales">
              <h2 style={{
                fontFamily: font.display, fontSize: 20, fontWeight: 800,
                textTransform: "uppercase", letterSpacing: "1px",
                color: LP.text, marginBottom: 20,
              }}>
                Politica de Tratamiento de Datos Personales
              </h2>

              <div style={{ fontSize: 10, color: LP.hint, marginBottom: 16, fontFamily: font.body }}>
                En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013 de la Republica de Colombia.
              </div>

              <Section title="1. Responsable del tratamiento">
                <p><strong style={{ color: LP.text }}>Elevate Sports</strong> con domicilio en Medellin, Colombia, es responsable del tratamiento de los datos personales recolectados a traves de esta plataforma.</p>
              </Section>

              <Section title="2. Datos recolectados">
                <p>La plataforma recolecta los siguientes datos para la prestacion del servicio:</p>
                <ul style={{ paddingLeft: 20, marginTop: 4 }}>
                  <li>Nombre del club, ciudad, disciplina deportiva</li>
                  <li>Nombre del entrenador/director tecnico</li>
                  <li>Email y telefono de contacto (opcionales)</li>
                  <li>Nombres y fechas de nacimiento de jugadores</li>
                  <li>Datos deportivos: asistencia, RPE, estadisticas</li>
                  <li>Datos financieros: pagos y movimientos del club</li>
                </ul>
              </Section>

              <Section title="3. Finalidad del tratamiento">
                <p>Los datos personales seran utilizados exclusivamente para:</p>
                <ul style={{ paddingLeft: 20, marginTop: 4 }}>
                  <li>Gestionar el funcionamiento del club deportivo dentro de la plataforma</li>
                  <li>Generar reportes y estadisticas para el entrenador</li>
                  <li>Calcular indicadores de salud y rendimiento deportivo (RPE)</li>
                  <li>Administrar pagos y finanzas del club</li>
                </ul>
              </Section>

              <Section title="4. Almacenamiento y seguridad">
                <p>En la version actual (V1), los datos se almacenan <strong style={{ color: LP.text }}>localmente en el navegador del usuario</strong> (localStorage). No se transmiten a servidores externos. El usuario es responsable de la seguridad de su dispositivo.</p>
                <p style={{ marginTop: 6 }}>Cuando se active la sincronizacion en la nube (V2), los datos seran almacenados en servidores de <strong style={{ color: LP.text }}>Supabase Inc.</strong> (infraestructura AWS), con cifrado en transito (TLS) y en reposo (AES-256).</p>
              </Section>

              <Section title="5. Derechos del titular">
                <p>Conforme a la Ley 1581 de 2012, el titular de los datos tiene derecho a:</p>
                <ul style={{ paddingLeft: 20, marginTop: 4 }}>
                  <li>Conocer, actualizar y rectificar sus datos personales</li>
                  <li>Solicitar prueba de la autorizacion otorgada</li>
                  <li>Ser informado sobre el uso dado a sus datos</li>
                  <li>Revocar la autorizacion y solicitar la supresion de datos</li>
                  <li>Acceder gratuitamente a sus datos</li>
                </ul>
              </Section>

              <Section title="6. Datos de menores de edad">
                <p>La plataforma puede almacenar datos de menores de edad (jugadores). El tratamiento de estos datos se realiza <strong style={{ color: LP.text }}>bajo la responsabilidad del entrenador/director tecnico</strong>, quien declara contar con la autorizacion de los padres o representantes legales, conforme al articulo 7 de la Ley 1581 de 2012.</p>
              </Section>

              <Section title="7. Contacto">
                <p>Para ejercer sus derechos puede escribir a: <strong style={{ color: LP.neon }}>soporte@elevatesports.co</strong></p>
              </Section>

              <div style={{ fontSize: 9, color: LP.hint, marginTop: 20, fontFamily: font.body }}>
                Ultima actualizacion: Marzo 2026
              </div>
            </div>
          )}

          {activeTab === "terms" && (
            <div role="tabpanel" aria-label="Terminos de servicio">
              <h2 style={{
                fontFamily: font.display, fontSize: 20, fontWeight: 800,
                textTransform: "uppercase", letterSpacing: "1px",
                color: LP.text, marginBottom: 20,
              }}>
                Terminos de Servicio
              </h2>

              <Section title="1. Aceptacion">
                <p>Al utilizar Elevate Sports, el usuario acepta estos terminos en su totalidad. Si no esta de acuerdo, debe abstenerse de usar la plataforma.</p>
              </Section>

              <Section title="2. Descripcion del servicio">
                <p>Elevate Sports es una plataforma web de gestion deportiva que permite a entrenadores y clubes deportivos administrar plantillas, entrenamientos, finanzas y estadisticas.</p>
              </Section>

              <Section title="3. Uso aceptable">
                <p>El usuario se compromete a:</p>
                <ul style={{ paddingLeft: 20, marginTop: 4 }}>
                  <li>Proporcionar informacion veraz y actualizada</li>
                  <li>No utilizar la plataforma para fines ilegales</li>
                  <li>No intentar acceder a datos de otros usuarios</li>
                  <li>Contar con autorizacion para registrar datos de terceros (jugadores)</li>
                </ul>
              </Section>

              <Section title="4. Responsabilidad sobre los datos">
                <p>En la version actual (V1), los datos se almacenan exclusivamente en el navegador del usuario. <strong style={{ color: LP.text }}>Elevate Sports no se hace responsable por la perdida de datos</strong> causada por limpieza del navegador, cambio de dispositivo, o fallos del hardware.</p>
                <p style={{ marginTop: 6 }}>Se recomienda usar la funcion de <strong style={{ color: LP.neon }}>Exportar Backup</strong> regularmente.</p>
              </Section>

              <Section title="5. Disponibilidad">
                <p>El servicio se proporciona "tal como esta" (as-is). Elevate Sports no garantiza disponibilidad ininterrumpida y se reserva el derecho de modificar o descontinuar funcionalidades con previo aviso.</p>
              </Section>

              <Section title="6. Propiedad intelectual">
                <p>Todo el contenido de la plataforma (codigo, diseno, graficos, textos) es propiedad de Elevate Sports y esta protegido por las leyes de propiedad intelectual de Colombia.</p>
              </Section>

              <Section title="7. Modificaciones">
                <p>Elevate Sports se reserva el derecho de modificar estos terminos. Los cambios seran notificados dentro de la plataforma.</p>
              </Section>

              <Section title="8. Legislacion aplicable">
                <p>Estos terminos se rigen por las leyes de la Republica de Colombia. Cualquier controversia sera resuelta ante los tribunales competentes de Medellin, Antioquia.</p>
              </Section>

              <div style={{ fontSize: 9, color: LP.hint, marginTop: 20, fontFamily: font.body }}>
                Ultima actualizacion: Marzo 2026
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
