"use client";

import dynamic from "next/dynamic";

const PrivacyPolicy = dynamic(() => import("@/marketing/pages/PrivacyPolicy"), { ssr: false });

export default function PrivacyRoute() {
  return <PrivacyPolicy />;
}
