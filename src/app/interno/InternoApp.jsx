"use client";

/**
 * @component InternoApp
 * @description Punto de entrada de la herramienta INTERNA de ALTTEZ (propuestas,
 * clientes, administrativo). Standalone, fuera del CRM (producto cliente).
 * Acceso gateado por sesión: requiere usuario autenticado.
 *
 * Nota: por ahora el gate es solo `isAuthenticated`. Endurecer luego con
 * flag `is_internal` en profiles o rol `interno`.
 *
 * @version 1.0.0
 */

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../shared/auth";
import ProposalsWorkspace from "../proposals/ProposalsWorkspace";
import { showToast } from "../../shared/ui/Toast";

const MARFIL = "#F6F1EA";
const CU = "#CE8946";
const INTERNO_DIAG_KEY = "alttez_interno_diag_mounts";

function Loader() {
  return (
    <div style={{ minHeight: "100vh", background: MARFIL, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(31,31,29,0.10)", borderTopColor: CU, animation: "interno-spin 1s linear infinite" }} />
      <style>{`@keyframes interno-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function InternoApp() {
  const router = useRouter();
  const auth = useAuth();

  const handleLogout = useCallback(async () => {
    await auth.signOut();
    router.push("/auth/login");
  }, [auth, router]);

  // Redirect a login si no hay sesión (una vez que auth terminó de cargar)
  useEffect(() => {
    if (!auth.loadingAuth && !auth.loadingProfile && !auth.isAuthenticated) {
      router.replace("/auth/login?redirect=/interno");
    }
  }, [auth.loadingAuth, auth.loadingProfile, auth.isAuthenticated, router]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || typeof window === "undefined") return;

    const navEntry = performance.getEntriesByType("navigation")[0];
    const navType = navEntry?.type || "unknown";
    const wasDiscarded = document.wasDiscarded === true;
    const previousMounts = Number(window.sessionStorage.getItem(INTERNO_DIAG_KEY) || "0");
    const nextMounts = previousMounts + 1;
    window.sessionStorage.setItem(INTERNO_DIAG_KEY, String(nextMounts));

    if (wasDiscarded) {
      console.warn("[interno] La pestaña fue descartada por el navegador y luego restaurada.");
      showToast("La pestaña fue descartada por el navegador y luego restaurada.", "warning", 5000);
      return;
    }

    if (previousMounts > 0) {
      const message = `Interno se remontó. navigation=${navType}. Revisa consola para el diagnóstico.`;
      console.warn("[interno] Remonte detectado", { navType, previousMounts, href: window.location.href });
      showToast(message, "info", 4500);
    }
  }, []);

  if (auth.loadingAuth || auth.loadingProfile || !auth.isAuthenticated) {
    return <Loader />;
  }

  return (
    <ProposalsWorkspace
      clubId={auth.clubId || "local"}
      onLogout={handleLogout}
    />
  );
}
