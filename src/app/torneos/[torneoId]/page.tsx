"use client";

import { useParams, useRouter } from "next/navigation";
import InicioPage from "../pages/InicioPage";

export default function TorneoInicioPage() {
  const params = useParams();
  const router = useRouter();
  
  return (
    <div style={{ flex: 1, padding: "24px" }}>
      <InicioPage 
        torneoId={params.torneoId}
        onNavigate={(mod: string) => {
          if (mod === "torneos") router.push("/torneos");
          else router.push(`/torneos/${params.torneoId}/${mod}`);
        }}
        onCreate={() => {}}
        onImport={() => {}}
        onInfoClick={(mod: string) => router.push(`/torneos/${params.torneoId}/${mod}`)}
      />
    </div>
  );
}
