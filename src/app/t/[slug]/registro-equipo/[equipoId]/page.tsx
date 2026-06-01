"use client";

import dynamic from "next/dynamic";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";

const RegistroEquipoPage = dynamic(() => import("@/app/torneos/pages/RegistroEquipoPage"), { ssr: false });

export default function RegistroEquipoRoute() {
  return (
    <ErrorBoundary>
      <RegistroEquipoPage />
    </ErrorBoundary>
  );
}
