"use client";

import { useRouter } from "next/navigation";
import TorneosListPage from "../pages/TorneosListPage";

export default function TorneosGlobalPage() {
  const router = useRouter();

  return (
    <div style={{ padding: "32px", flex: 1 }}>
      <TorneosListPage 
        onCreate={(torneo = null) => {
          // Si pasamos un torneo es para clonarlo, por simplicidad enviamos a crear
          router.push("/torneos/crear");
        }}
        onAbrir={(id: string) => {
          if (id) {
            router.push(`/torneos/${id}`);
          }
        }}
        onEdit={(t: any) => {
          router.push(`/torneos/crear?edit=${t.id}`);
        }}
      />
    </div>
  );
}
