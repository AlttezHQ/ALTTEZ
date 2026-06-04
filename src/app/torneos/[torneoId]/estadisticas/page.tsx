"use client";

import { useParams, useRouter } from "next/navigation";
import EstadisticasPage from "../../pages/EstadisticasPage";

export default function TorneoEstadisticasPage() {
  const params = useParams();
  const router = useRouter();
  
  return (
    <div style={{ flex: 1 }}>
      <EstadisticasPage 
        torneoId={params.torneoId}
        onGoTorneos={() => router.push("/torneos")}
      />
    </div>
  );
}
