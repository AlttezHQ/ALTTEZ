"use client";

import { useRouter } from "next/navigation";
import InicioPage from "./pages/InicioPage";

export default function TorneosGlobalInicio() {
  const router = useRouter();

  return (
    <div style={{ flex: 1, padding: "24px" }}>
      <InicioPage
        torneoId={null}
        onNavigate={(mod: string) => {
          if (mod === "torneos") router.push("/torneos/lista");
        }}
        onCreate={() => router.push("/torneos/crear")}
        onImport={() => {}}
        onInfoClick={(mod: string) => {
           router.push("/torneos/lista");
        }}
      />
    </div>
  );
}
