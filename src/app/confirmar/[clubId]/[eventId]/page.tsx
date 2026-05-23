"use client";

import dynamic from "next/dynamic";

const ConfirmarAsistencia = dynamic(() => import("@/marketing/pages/ConfirmarAsistencia"), { ssr: false });

export default function ConfirmarRoute() {
  return <ConfirmarAsistencia />;
}
