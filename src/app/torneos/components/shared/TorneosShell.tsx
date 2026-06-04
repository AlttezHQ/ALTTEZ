"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTorneosStore } from "../../store/useTorneosStore";
import { useAuth } from "../../../../shared/auth";
import TorneosSidebar from "./TorneosSidebar";
import TorneosHeader from "./TorneosHeader";
import ConfirmModal from "../../../../shared/ui/ConfirmModal";
import { PALETTE } from "../../../../shared/tokens/palette";
import { showToast } from "../../../../shared/ui/Toast";

export default function TorneosShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  
  // Extract torneoId from URL: /torneos/[torneoId]/...
  // Example: "/torneos" -> segments: ["", "torneos"] -> length 2, so torneoId is undefined
  // Example: "/torneos/123" -> segments: ["", "torneos", "123"] -> length 3
  const segments = pathname.split("/").filter(Boolean);
  let rawTorneoId = segments.length > 1 ? segments[1] : undefined;
  if (rawTorneoId === "crear") rawTorneoId = undefined; // special case

  const torneoId = rawTorneoId;

  const torneos = useTorneosStore(s => s.torneos);
  const equipos = useTorneosStore(s => s.equipos);
  const partidos = useTorneosStore(s => s.partidos);
  const categorias = useTorneosStore(s => s.categorias);

  const torneoActivo = torneos.find((t: any) => t.id === torneoId);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);

  useEffect(() => {
    // Si la URL especifica un torneo pero este no existe (y ya cargaron los datos), devolvemos a lista
    if (torneoId && !torneoActivo && torneos.length > 0) {
      router.replace("/torneos/lista");
    }
  }, [torneoId, torneoActivo, torneos, router]);

  const activeEquipos = useMemo(() => equipos.filter((e: any) => e.torneoId === torneoId), [equipos, torneoId]);
  const activePartidos = useMemo(() => partidos.filter((p: any) => p.torneoId === torneoId), [partidos, torneoId]);
  const activeCategorias = useMemo(() => categorias.filter((c: any) => c.torneoId === torneoId), [categorias, torneoId]);

  const accountDisplayName = (auth.profile as any)?.full_name || (auth.user as any)?.email || "Administrador";

  const headerSearchItems = useMemo(() => {
    if (!torneoActivo) return [];
    // Definimos items de búsqueda por módulos
    const moduleItems = [
      { id: "module-inicio", label: "Inicio", module: "inicio" },
      { id: "module-equipos", label: "Equipos", module: "equipos" },
      { id: "module-fixtures", label: "Fixtures", module: "fixtures" },
      { id: "module-estadisticas", label: "Estadísticas", module: "estadisticas" },
    ];
    // Y le sumamos los datos cargados
    const teamItems = activeEquipos.map((e: any) => ({
      id: `team-${e.id}`, label: e.nombre, module: "equipos"
    }));
    return [...moduleItems, ...teamItems];
  }, [torneoActivo, activeEquipos]);

  const headerNotifications = useMemo(() => {
    if (!torneoActivo) return [];
    const notifs = [];
    if (torneoActivo.estado === "borrador") {
      notifs.push({ id: "draft", title: "Torneo en borrador", desc: "No publicado", time: "Ahora", module: "ajustes", tone: "info" });
    }
    return notifs;
  }, [torneoActivo]);

  const confirmAccountDeletion = async () => {
    setConfirmDeleteAccount(false);
    const { error } = await auth.deleteAccount();
    if (error) { 
      showToast({ message: error.message || error, type: "error" });
      return; 
    }
    window.location.href = "/auth/login?redirect=/torneos";
  };

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <TorneosSidebar
        torneoActivo={torneoActivo}
        categorias={activeCategorias}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => {
          if (mobileDrawerOpen) setMobileDrawerOpen(false);
          else setIsSidebarCollapsed(!isSidebarCollapsed);
        }}
        isMobileDrawer={mobileDrawerOpen}
        userName={accountDisplayName}
        userEmail={(auth.user as any)?.email}
        onLogout={async () => {
          await auth.signOut();
          window.location.href = "/auth/login?redirect=/torneos";
        }}
        onDeleteAccount={() => setConfirmDeleteAccount(true)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TorneosHeader
          userName={accountDisplayName}
          userEmail={(auth.user as any)?.email}
          onMenuToggle={() => setMobileDrawerOpen(true)}
          searchItems={headerSearchItems as any}
          onSearchNavigate={(item: any) => {
            if (!torneoId) return;
            const mod = item.module === "inicio" ? "" : item.module;
            router.push(`/torneos/${torneoId}/${mod}`);
          }}
          notifications={headerNotifications as any}
          onLogout={async () => {
            await auth.signOut();
            window.location.href = "/auth/login?redirect=/torneos";
          }}
          onDeleteAccount={() => setConfirmDeleteAccount(true)}
        />

        <main style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          {children}
        </main>
      </div>

      {confirmDeleteAccount && (
        <ConfirmModal
          title="Eliminar cuenta"
          message="¿Eliminar tu cuenta permanentemente? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          accentColor={PALETTE.danger ?? "#EF4444"}
          onCancel={() => setConfirmDeleteAccount(false)}
          onConfirm={confirmAccountDeletion}
        />
      )}
    </div>
  );
}
