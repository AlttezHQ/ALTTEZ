"use client";

import dynamic from "next/dynamic";
import PortalLayout from "@/marketing/layout/PortalLayout";

const SportsCRMPage = dynamic(() => import("@/marketing/pages/SportsCRMPage"), { ssr: false });

export default function SportsCRMRoute() {
  return (
    <PortalLayout>
      <SportsCRMPage />
    </PortalLayout>
  );
}
