"use client";

import { useParams, useRouter } from "next/navigation";
import EquiposPage from "../../pages/EquiposPage";

export default function TorneoEquiposPage() {
  const params = useParams();
  const router = useRouter();
  
  return (
    <div style={{ flex: 1 }}>
      <EquiposPage 
        torneoId={params.torneoId}
        onGoTorneos={() => router.push("/torneos")}
      />
    </div>
  );
}
