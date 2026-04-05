/**
 * @hook useInstallPWA
 * @description Encapsula la lógica de instalación PWA:
 *   - Captura beforeinstallprompt (Android/Desktop Chrome)
 *   - Detecta iOS Safari para mostrar instrucciones manuales
 *   - Detecta si ya está corriendo en standalone (ya instalada)
 *   - Persiste el dismiss por 7 días en localStorage
 *
 * @returns {{ canInstall, isIOS, isStandalone, isDismissed, prompt, dismiss }}
 * @author @Andres (UI) — PWA Sprint
 */
import { useState, useEffect, useCallback } from "react";

const DISMISS_KEY = "alttez_pwa_dismissed_until";
const DISMISS_DAYS = 7;

function isDismissedNow() {
  try {
    const until = localStorage.getItem(DISMISS_KEY);
    if (!until) return false;
    return Date.now() < Number(until);
  } catch {
    return false;
  }
}

function setDismissed() {
  try {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISS_KEY, String(until));
  } catch {
    // localStorage unavailable — dismiss is session-only
  }
}

export function useInstallPWA() {
  // beforeinstallprompt event (Android/Chrome)
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissedState] = useState(isDismissedNow);

  // Detect iOS Safari: no beforeinstallprompt, needs manual steps
  const isIOS =
    typeof navigator !== "undefined" &&
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    // Exclude Chrome on iOS (it can't install PWAs the same way)
    !/crios/i.test(navigator.userAgent);

  // Detect if already running as standalone (PWA installed)
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Also listen for appinstalled to clear the prompt
  useEffect(() => {
    const handler = () => {
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  /** Triggers the native install dialog on Android/Chrome */
  const prompt = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  /** Persists dismiss for DISMISS_DAYS days */
  const dismiss = useCallback(() => {
    setDismissed();
    setDismissedState(true);
  }, []);

  // canInstall: true when there's something to show (native prompt or iOS instructions)
  const canInstall = !isStandalone && !dismissed && (!!deferredPrompt || isIOS);

  return {
    canInstall,
    isIOS,
    isStandalone,
    isDismissed: dismissed,
    hasNativePrompt: !!deferredPrompt,
    prompt,
    dismiss,
  };
}
