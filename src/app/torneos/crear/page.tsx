"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CrearTorneoWizard from "../components/wizard/CrearTorneoWizard";
import { useTorneosStore } from "../store/useTorneosStore";
import AlttezLoader from "../components/shared/AlttezLoader";

import { Suspense } from "react";

function CrearTorneoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("edit");
  const torneos = useTorneosStore((s) => s.torneos);
  const categorias = useTorneosStore((s) => s.categorias);
  const equipos = useTorneosStore((s) => s.equipos);
  
  const [editingTorneo, setEditingTorneo] = useState<any>(null);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      const t = torneos.find((t: any) => t.id === editId);
      if (t) {
        const cat = categorias.filter((c: any) => c.torneoId === t.id);
        const eq = equipos.filter((e: any) => e.torneoId === t.id);
        setEditingTorneo({ ...t, categorias: cat, equipos: eq });
      }
      setLoading(false);
    } else {
      setEditingTorneo(null);
      setLoading(false);
    }
  }, [editId, torneos, categorias, equipos]);

  if (loading) return <AlttezLoader text="Cargando datos del torneo..." />;

  return (
    <div style={{ flex: 1, padding: "24px" }}>
      <CrearTorneoWizard
        initialData={editingTorneo}
        onFinish={() => router.push("/torneos")}
        onBack={() => router.push("/torneos")}
      />
    </div>
  );
}

export default function CrearTorneoPage() {
  return (
    <Suspense fallback={<AlttezLoader text="Cargando..." />}>
      <CrearTorneoContent />
    </Suspense>
  );
}
