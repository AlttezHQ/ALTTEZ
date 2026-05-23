"use client";

import dynamic from "next/dynamic";

const PublicTorneoPage = dynamic(() => import("@/app/torneos/pages/PublicTorneoPage"), { ssr: false });

export default function PublicTorneoRoute() {
  return <PublicTorneoPage />;
}
