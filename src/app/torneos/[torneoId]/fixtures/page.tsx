"use client";

import { useParams, useRouter } from "next/navigation";
import FixturesPage from "../../pages/FixturesPage";

export default function TorneoFixturesPage() {
  const params = useParams();
  const router = useRouter();
  
  return (
    <div style={{ flex: 1 }}>
      <FixturesPage 
        torneoId={params.torneoId}
        onGoTorneos={() => router.push("/torneos")}
      />
    </div>
  );
}
