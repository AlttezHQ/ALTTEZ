"use client";

import { useParams, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import ModuleEmptyState from "../../components/shared/ModuleEmptyState";

export default function TorneoPublicaPage() {
  const params = useParams();
  
  return (
    <div style={{ flex: 1, padding: 24 }}>
      <ModuleEmptyState 
        icon={Globe}
        title="Vista Pública"
        subtitle="Portal público del torneo en construcción."
      />
    </div>
  );
}
