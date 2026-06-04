"use client";

import { useParams, useRouter } from "next/navigation";
import CategoriasPage from "../../pages/CategoriasPage";

export default function TorneoCategoriasPage() {
  const params = useParams();
  const router = useRouter();
  
  return (
    <div style={{ flex: 1 }}>
      <CategoriasPage 
        torneoId={params.torneoId}
        onGoTorneos={() => router.push("/torneos")}
        onNavigate={(mod: string) => router.push(`/torneos/${params.torneoId}/${mod}`)}
      />
    </div>
  );
}
