"use client";

import dynamic from "next/dynamic";

const RegistroEquipoPage = dynamic(() => import("@/app/torneos/pages/RegistroEquipoPage"), { ssr: false });

export default function RegistroEquipoRoute() {
  return <RegistroEquipoPage />;
}
