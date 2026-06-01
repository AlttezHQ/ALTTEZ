"use client";

import dynamic from "next/dynamic";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";

const PublicProposalPage = dynamic(() => import("@/marketing/pages/PublicProposalPage"), { ssr: false });

export default function ProposalRoute() {
  return (
    <ErrorBoundary>
      <PublicProposalPage />
    </ErrorBoundary>
  );
}
