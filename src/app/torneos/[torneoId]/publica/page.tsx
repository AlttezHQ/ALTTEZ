"use client";

import { Globe } from "lucide-react";
import ModuleEmptyState from "../../components/shared/ModuleEmptyState";

export default function TorneoPublicaPage() {
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
