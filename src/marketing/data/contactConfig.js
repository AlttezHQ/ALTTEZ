const DEFAULT_COMMERCIAL_EMAIL = "hola@alttez.co";

export const COMMERCIAL_EMAIL = import.meta.env.VITE_MARKETING_CONTACT_EMAIL?.trim() || DEFAULT_COMMERCIAL_EMAIL;
export const PRIVACY_EMAIL = import.meta.env.VITE_MARKETING_PRIVACY_EMAIL?.trim() || COMMERCIAL_EMAIL;
export const WHATSAPP_NUMBER = import.meta.env.VITE_MARKETING_WA_NUMBER?.trim() || "";
export const CALENDAR_URL = import.meta.env.VITE_MARKETING_CALENDAR_URL?.trim() || "";

const DEFAULT_WA_MESSAGE = "Hola, quiero conocer ALTTEZ para mi club.";

export function buildWhatsAppUrl(message = DEFAULT_WA_MESSAGE) {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildMailtoUrl({ nombre = "", email = "", club = "", motivo = "", mensaje = "" }) {
  const subject = ["ALTTEZ", motivo || "Solicitud de demo", club].filter(Boolean).join(" - ");
  const body = [
    "Hola equipo ALTTEZ,",
    "",
    `Nombre: ${nombre || "-"}`,
    `Correo: ${email || "-"}`,
    `Club u organizacion: ${club || "-"}`,
    `Motivo: ${motivo || "-"}`,
    "",
    "Contexto:",
    mensaje || "-",
  ].join("\n");

  return `mailto:${COMMERCIAL_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
