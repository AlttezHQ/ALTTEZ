"use client";

import { useParams, useRouter } from "next/navigation";
import GruposPage from "../../pages/GruposPage";

export default function TorneoGruposPage() {
  const params = useParams();
  const router = useRouter();
  
  return (
    <div style={{ flex: 1 }}>
      <GruposPage 
        torneoId={params.torneoId}
        onGoTorneos={() => router.push("/torneos")}
        onNavigate={(mod: string) => router.push(`/torneos/${params.torneoId}/${mod}`)}
      />
    </div>
  );
}
