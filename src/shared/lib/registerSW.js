/**
 * @module registerSW
 * @description Registra el Service Worker de ALTTEZ y emite eventos
 * para que los componentes UI reaccionen a actualizaciones disponibles.
 *
 * Eventos emitidos:
 *   - "sw-update-available" (CustomEvent): { detail: { registration } }
 *     Escuchado por UpdateToast.jsx para mostrar el toast de actualización.
 *
 * Uso: llamar registerSW() una vez en main.jsx (o App root effect).
 * @author @Andres (UI) — PWA Sprint
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
  let refreshing = false;

  const activateUpdate = (registration) => {
    const worker = registration.waiting;
    if (!worker) return;
    worker.postMessage({ type: "SKIP_WAITING" });
  };

  // Only register in production builds to avoid dev cache confusion.
  // Remove the NODE_ENV check if you want SW in dev as well.
  if (import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          // Check for waiting SW on initial load (e.g. user returns after update deployed)
          if (registration.waiting) {
            activateUpdate(registration);
            window.dispatchEvent(
              new CustomEvent("sw-update-available", {
                detail: { registration },
              })
            );
          }

          // SW found an update while the page was open
          registration.addEventListener("updatefound", () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.addEventListener("statechange", () => {
              if (
                installingWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New SW installed and waiting — notify UI
                activateUpdate(registration);
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
          // SW registration failed — silent, no console pollution in prod
        });
    });
  }
}
