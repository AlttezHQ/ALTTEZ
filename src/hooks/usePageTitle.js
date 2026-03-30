/**
 * @hook usePageTitle
 * @description Actualiza el document.title dinámicamente según la ruta activa del portal.
 * Mejora SEO en SPA: el título refleja la página actual en cada navegación.
 * Patrón: "[Nombre de Página] — Elevate Sports"
 *
 * @example
 *   usePageTitle("Quiénes Somos"); // → "Quiénes Somos — Elevate Sports"
 *   usePageTitle();                // → "Elevate Sports — Gestión Deportiva"
 *
 * @param {string} [pageTitle] - Título de la página actual. Si se omite, usa el default.
 * @returns {void}
 *
 * @author @Arquitecto (Carlos)
 * @version 1.0.0
 */

import { useEffect } from "react";

const BASE_TITLE = "Elevate Sports";
const DEFAULT_TITLE = "Elevate Sports — Gestión Deportiva Profesional";

/**
 * Hook que actualiza document.title en cada render.
 * @param {string} [pageTitle]
 */
export function usePageTitle(pageTitle) {
  useEffect(() => {
    const prev = document.title;
    document.title = pageTitle ? `${pageTitle} — ${BASE_TITLE}` : DEFAULT_TITLE;
    return () => {
      document.title = prev;
    };
  }, [pageTitle]);
}
