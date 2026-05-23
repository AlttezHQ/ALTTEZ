"use client";

import dynamic from "next/dynamic";

const PublicProposalPage = dynamic(() => import("@/marketing/pages/PublicProposalPage"), { ssr: false });

export default function ProposalsRoute() {
  return <PublicProposalPage />;
}
