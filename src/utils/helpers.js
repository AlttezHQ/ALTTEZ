/**
 * @module helpers
 * @description Funciones utilitarias compartidas en ALTTEZ.
 * Centraliza logica duplicada que existia en GestionPlantilla, TacticalBoard y Entrenamiento.
 *
 * @version 1.0
 * @author ALTTEZ
 */

/**
 * Devuelve la URL de foto de un jugador usando randomuser.me como fuente de
 * retratos realistas. La asignación es completamente determinista: el mismo
 * valor de `photo` siempre produce la misma URL.
 *
 * Lógica de resolución (en orden de prioridad):
 *  1. Si `photo` comienza con "data:" → imagen base64 subida por el usuario,
 *     se devuelve tal cual.
 *  2. Si `photo` comienza con "http"  → URL externa ya resuelta, se devuelve
 *     tal cual.
 *  3. Cualquier otro string (slug, nombre, etc.) → se convierte a un índice
 *     determinista via hash djb2 y se mapea a un retrato de randomuser.me.
 *  4. Valor falsy (null, undefined, "")  → retrato de fallback fijo (id 1).
 *
 * @param {string|null|undefined} photo - Slug, URL o base64 del jugador
 * @param {string} [_bg] - Ignorado (legado dicebear, mantenido para
 *   compatibilidad de llamadas existentes)
 * @returns {string} URL de retrato JPEG
 */
export const getAvatarUrl = (photo, _bg) => {
  // Caso 1 — base64 subida por el usuario
  if (typeof photo === "string" && photo.startsWith("data:")) return photo;

  // Caso 2 — URL externa ya resuelta
  if (typeof photo === "string" && photo.startsWith("http")) return photo;

  // Caso 3 — slug o nombre → hash djb2 determinista
  if (photo) {
    let hash = 5381;
    for (let i = 0; i < photo.length; i++) {
      hash = ((hash << 5) + hash) ^ photo.charCodeAt(i);
      hash = hash >>> 0; // mantener sin signo
    }
    // Mapear al rango 1-50 de retratos masculinos de randomuser.me
    // (rango probado, fotos de buena calidad y sin artefactos)
    const id = (hash % 50) + 1;
    return `https://randomuser.me/api/portraits/men/${id}.jpg`;
  }

  // Caso 4 — sin foto → retrato de fallback fijo
  return "https://randomuser.me/api/portraits/men/1.jpg";
};

/**
 * Calcula la edad en anios a partir de una fecha de nacimiento.
 * @param {string|null} dob - Fecha ISO string
 * @returns {number|string} Edad numerica o "—" si no hay fecha
 */
export const calculateAge = (dob) => {
  if (!dob) return "—";
  return Math.floor(
    (Date.now() - new Date(dob)) / (1000 * 60 * 60 * 24 * 365.25)
  );
};

/**
 * Devuelve estilo visual (color + label) segun el estado del jugador.
 * @param {string} status - "P" | "A" | "L"
 * @returns {{ color: string, label: string }}
 */
export const getStatusStyle = (status) => ({
  P: { color: "#1D9E75", label: "Disponible" },
  A: { color: "#E24B4A", label: "Ausente"    },
  L: { color: "#EF9F27", label: "Lesionado"  },
}[status] || { color: "rgba(255,255,255,0.4)", label: "—" });
