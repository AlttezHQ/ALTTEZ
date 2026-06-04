/**
 * @module registerSW
 * @description Registra el Service Worker de ALTTEZ y emite eventos
 * para que los componentes UI reaccionen a actualizaciones disponibles.
 *
 * Eventos emitidos:
 *   - "sw-update-available" (CustomEvent): { detail: { registration } }
 *     Escuchado por UpdateToast.jsx para mostrar el toast de actualizacion.
 *
 * Uso: llamar registerSW() una vez desde el bootstrap cliente de Next.
 * @author @Andres (UI) - PWA Sprint
 */

export function registerSW() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const isRecoveryMode = new URLSearchParams(window.location.search).has("recovery");
  if (isRecoveryMode) {
    const url = new URL(window.location.href);
    url.searchParams.delete("recovery");
    window.history.replaceState({}, "", url.toString());
    return;
  }

  // Only register in production builds to avoid dev cache confusion.
  // Remove the NODE_ENV check if you want SW in dev as well.
  if (process.env.NODE_ENV === "production") {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          // If a newer service worker is already waiting, notify the UI.
          if (registration.waiting) {
            window.dispatchEvent(
              new CustomEvent("sw-update-available", {
                detail: { registration },
              })
            );
          }

          // SW found an update while the page was open.
          registration.addEventListener("updatefound", () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.addEventListener("statechange", () => {
              if (
                installingWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New SW installed and waiting. Let the UI decide when to reload.
                window.dispatchEvent(
                  new CustomEvent("sw-update-available", {
                    detail: { registration },
                  })
                );
              }
            });
          });
        })
        .catch(() => {
          // SW registration failed - silent, no console pollution in prod
        });
    });
  }
}
