"use client";

import { useParams, useRouter } from "next/navigation";
import FaseFinalPage from "../../pages/FaseFinalPage";

export default function TorneoFaseFinalPage() {
  const params = useParams();
  const router = useRouter();
  
  return (
    <div style={{ flex: 1 }}>
      <FaseFinalPage 
        torneoId={params.torneoId}
        onGoTorneos={() => router.push("/torneos")}
      />
    </div>
  );
}
