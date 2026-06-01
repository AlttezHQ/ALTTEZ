"use client";

import dynamic from "next/dynamic";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";

const CRMApp = dynamic(() => import("@/app/shell/CRMApp").then((mod) => mod.CRMApp), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#FAFAF8", color: "#1F1F1D" }}>
      Cargando ALTTEZ CRM...
    </div>
  ),
});

export default function CRMRoute() {
  return (
    <ErrorBoundary>
      <CRMApp />
    </ErrorBoundary>
  );
}
