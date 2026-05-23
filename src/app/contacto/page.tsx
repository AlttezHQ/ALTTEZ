"use client";

import dynamic from "next/dynamic";
import PortalLayout from "@/marketing/layout/PortalLayout";

const Contacto = dynamic(() => import("@/marketing/pages/Contacto"), { ssr: false });

export default function ContactoRoute() {
  return (
    <PortalLayout>
      <Contacto />
    </PortalLayout>
  );
}
