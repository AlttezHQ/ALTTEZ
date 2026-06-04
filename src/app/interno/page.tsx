"use client";

import dynamic from "next/dynamic";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";

const InternoApp = dynamic(() => import("./InternoApp"), {
  ssr: false,
  loading: () => <div style={{ minHeight: "100vh", background: "#F6F1EA" }} />,
});

export default function InternoRoute() {
  return (
    <ErrorBoundary>
      <InternoApp />
    </ErrorBoundary>
  );
}
