"use client";

import dynamic from "next/dynamic";
import PortalLayout from "@/marketing/layout/PortalLayout";

const PricingPage = dynamic(() => import("@/marketing/pages/PricingPage"), { ssr: false });

export default function PricingRoute() {
  return (
    <PortalLayout>
      <PricingPage />
    </PortalLayout>
  );
}
