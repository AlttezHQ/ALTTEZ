"use client";

import { useParams, useRouter } from "next/navigation";
import AjustesPage from "../../pages/AjustesPage";

export default function TorneoAjustesPage() {
  const params = useParams();
  const router = useRouter();
  
  return (
    <div style={{ flex: 1 }}>
      <AjustesPage 
        torneoId={params.torneoId}
        onGoTorneos={() => router.push("/torneos")}
      />
    </div>
  );
}
