"use client";

import dynamic from "next/dynamic";
import PortalLayout from "@/marketing/layout/PortalLayout";

const QuienesSomos = dynamic(() => import("@/marketing/pages/QuienesSomos"), { ssr: false });

export default function QuienesSomosRoute() {
  return (
    <PortalLayout>
      <QuienesSomos />
    </PortalLayout>
  );
}
