"use client";

import dynamic from "next/dynamic";
import PortalLayout from "@/marketing/layout/PortalLayout";

const JournalPage = dynamic(() => import("@/marketing/pages/JournalPage"), { ssr: false });

export default function JournalRoute() {
  return (
    <PortalLayout>
      <JournalPage />
    </PortalLayout>
  );
}
