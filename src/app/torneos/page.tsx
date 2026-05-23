"use client";

import dynamic from "next/dynamic";
import AlttezLoader from "@/app/torneos/components/shared/AlttezLoader";

// Import TorneosApp dynamically to avoid SSR issues with its heavy client logic
const TorneosApp = dynamic(() => import("./TorneosApp"), {
  ssr: false,
  loading: () => <AlttezLoader fullScreen text="Cargando entorno..." />
});

export default function TorneosPage() {
  return <TorneosApp />;
}
