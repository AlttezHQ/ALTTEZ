"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, Suspense } from "react";
import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import { useTorneosStore } from "../store/useTorneosStore";
import AlttezLoader from "../components/shared/AlttezLoader";

type TorneoDraft = {
  id: string;
  categorias?: Array<{ torneoId?: string }>;
  equipos?: Array<{ torneoId?: string }>;
  [key: string]: unknown;
};

type CrearTorneoWizardProps = {
  initialData: TorneoDraft | null;
  onFinish: () => void;
  onBack: () => void;
};

// El wizard (~4k lineas + xlsx/jspdf) se carga solo en esta ruta y bajo demanda.
// ssr:false evita renderizar/hidratar en servidor un componente cliente tan pesado.
const CrearTorneoWizard = dynamic<CrearTorneoWizardProps>(
  () => import("../components/wizard/CrearTorneoWizard").then((mod) => mod.default as ComponentType<CrearTorneoWizardProps>),
  { ssr: false, loading: () => <AlttezLoader text="Cargando asistente..." /> }
);

function CrearTorneoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("edit");
  const torneos = useTorneosStore((s) => s.torneos as TorneoDraft[]);
  const categorias = useTorneosStore((s) => s.categorias as Array<{ torneoId?: string }>);
  const equipos = useTorneosStore((s) => s.equipos as Array<{ torneoId?: string }>);

  const editingTorneo = useMemo(() => {
    if (!editId) return null;
    const torneo = torneos.find((item) => item.id === editId);
    if (!torneo) return null;

    return {
      ...torneo,
      categorias: categorias.filter((category) => category.torneoId === torneo.id),
      equipos: equipos.filter((team) => team.torneoId === torneo.id),
    };
  }, [categorias, editId, equipos, torneos]);

  if (editId && torneos.length === 0) {
    return <AlttezLoader text="Cargando datos del torneo..." />;
  }

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