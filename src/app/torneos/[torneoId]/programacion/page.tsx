"use client";

import { useParams, useRouter } from "next/navigation";
import ProgramacionPage from "../../pages/ProgramacionPage";

export default function TorneoProgramacionPage() {
  const params = useParams();
  const router = useRouter();
  
  return (
    <div style={{ flex: 1 }}>
      <ProgramacionPage 
        torneoId={params.torneoId}
        onGoTorneos={() => router.push("/torneos")}
      />
    </div>
  );
}
