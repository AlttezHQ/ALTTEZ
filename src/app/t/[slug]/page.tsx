"use client";

import dynamic from "next/dynamic";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";

const PublicTorneoPage = dynamic(() => import("@/app/torneos/pages/PublicTorneoPage"), { ssr: false });

export default function PublicTorneoRoute() {
  return (
    <ErrorBoundary>
      <PublicTorneoPage />
    </ErrorBoundary>
  );
}
