"use client";

import { useState, useMemo, useEffect } from "react";
import type { ComponentType } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTorneosStore } from "../../store/useTorneosStore";
import { useAuth } from "../../../../shared/auth";
import TorneosSidebarComponent from "./TorneosSidebar";
import TorneosHeaderComponent from "./TorneosHeader";
import ConfirmModal from "../../../../shared/ui/ConfirmModal";
import { PALETTE } from "../../../../shared/tokens/palette";
import { showToast } from "../../../../shared/ui/Toast";

type Tournament = {
  id: string;
  nombre?: string;
  estado?: string;
};

type TournamentTeam = {
  id: string;
  torneoId?: string;
  nombre?: string;
};

type TournamentCategory = {
  id: string;
  torneoId?: string;
  nombre?: string;
};

type AuthUser = {
  email?: string;
};

type AuthProfile = {
  full_name?: string;
};

type SearchItem = {
  id: string;
  label: string;
  module: string;
};

type HeaderNotification = {
  id: string;
  title: string;
  desc: string;
  time: string;
  module: string;
  tone: string;
};

type ConfirmModalError = {
  message?: string;
};

type TorneosSidebarProps = {
  torneoActivo?: Tournament;
  categorias: TournamentCategory[];
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileDrawer: boolean;
  userName: string;
  userEmail?: string;
  onLogout: () => void | Promise<void>;
  onDeleteAccount: () => void;
};

type TorneosHeaderProps = {
  userName: string;
  userEmail?: string;
  onMenuToggle: () => void;
  searchItems: SearchItem[];
  onSearchNavigate: (item: SearchItem) => void;
  notifications: HeaderNotification[];
  onLogout: () => void | Promise<void>;
  onDeleteAccount: () => void;
};

const TorneosSidebar = TorneosSidebarComponent as ComponentType<TorneosSidebarProps>;
const TorneosHeader = TorneosHeaderComponent as ComponentType<TorneosHeaderProps>;

const RESERVED_SEGMENTS = new Set(["crear", "lista"]);

export default function TorneosShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const authUser = auth.user as AuthUser | null;
  const authProfile = auth.profile as AuthProfile | null;
  
  // Extract torneoId from URL: /torneos/[torneoId]/...
  // Example: "/torneos" -> segments: ["", "torneos"] -> length 2, so no URL torneoId
  // Example: "/torneos/123" -> segments: ["", "torneos", "123"] -> length 3
  // Reserved segments are global routes, NOT tournament ids.
  const segments = pathname.split("/").filter(Boolean);
  const segmentTorneoId = segments.length > 1 ? segments[1] : undefined;
  const urlTorneoId = segmentTorneoId && !RESERVED_SEGMENTS.has(segmentTorneoId)
    ? segmentTorneoId
    : undefined;

  const torneos = useTorneosStore(s => s.torneos as Tournament[]);
  const equipos = useTorneosStore(s => s.equipos as TournamentTeam[]);
  const categorias = useTorneosStore(s => s.categorias as TournamentCategory[]);
  const torneoActivoId = useTorneosStore(s => s.torneoActivoId as string | null);

  // URL = fuente de verdad para el RENDER de paginas (cada page lee su torneoId de useParams).
  // Este fallback a torneoActivoId es SOLO para el chrome/navegacion del shell (sidebar/header):
  // cuando la URL no trae torneo (lista, crear, raiz) usamos el "ultimo abierto" como destino
  // de conveniencia para habilitar el navbar y mostrar el badge "EN USO". No alimenta el render
  // de las paginas hijas (children), asi que no acopla estado a navegacion en el contenido.
  const effectiveTorneoId = urlTorneoId ?? torneoActivoId ?? undefined;
  const torneoId = effectiveTorneoId;

  const torneoActivo = torneos.find((t) => t.id === effectiveTorneoId);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);

  useEffect(() => {
    // Solo si la URL especifica un torneo inexistente (y ya cargaron los datos) volvemos a lista.
    // El fallback a torneoActivoId no debe disparar redirect.
    if (urlTorneoId && !torneos.some((t) => t.id === urlTorneoId) && torneos.length > 0) {
      router.replace("/torneos/lista");
    }
  }, [urlTorneoId, torneos, router]);

  const activeEquipos = useMemo(() => equipos.filter((e) => e.torneoId === torneoId), [equipos, torneoId]);
  const activeCategorias = useMemo(() => categorias.filter((c) => c.torneoId === torneoId), [categorias, torneoId]);

  const accountDisplayName = authProfile?.full_name || authUser?.email || "Administrador";

  const headerSearchItems = useMemo<SearchItem[]>(() => {
    if (!torneoActivo) return [];
    // Definimos items de busqueda por modulos
    const moduleItems: SearchItem[] = [
      { id: "module-inicio", label: "Inicio", module: "inicio" },
      { id: "module-equipos", label: "Equipos", module: "equipos" },
      { id: "module-fixtures", label: "Fixtures", module: "fixtures" },
      { id: "module-estadisticas", label: "Estadisticas", module: "estadisticas" },
    ];
    // Y le sumamos los datos cargados
    const teamItems = activeEquipos.map((e) => ({
      id: `team-${e.id}`,
      label: e.nombre || "Equipo",
      module: "equipos",
    }));
    return [...moduleItems, ...teamItems];
  }, [torneoActivo, activeEquipos]);

  const headerNotifications = useMemo<HeaderNotification[]>(() => {
    if (!torneoActivo) return [];
    const notifs: HeaderNotification[] = [];
    if (torneoActivo.estado === "borrador") {
      notifs.push({ id: "draft", title: "Torneo en borrador", desc: "No publicado", time: "Ahora", module: "ajustes", tone: "info" });
    }
    return notifs;
  }, [torneoActivo]);

  const confirmAccountDeletion = async () => {
    setConfirmDeleteAccount(false);
    const { error } = await auth.deleteAccount();
    if (error) { 
      const deleteError = error as ConfirmModalError | string;
      showToast({ message: typeof deleteError === "string" ? deleteError : deleteError.message || "Error", type: "error" });
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
        userEmail={authUser?.email}
        onLogout={async () => {
          await auth.signOut();
          window.location.href = "/auth/login?redirect=/torneos";
        }}
        onDeleteAccount={() => setConfirmDeleteAccount(true)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TorneosHeader
          userName={accountDisplayName}
          userEmail={authUser?.email}
          onMenuToggle={() => setMobileDrawerOpen(true)}
          searchItems={headerSearchItems}
          onSearchNavigate={(item: SearchItem) => {
            if (!torneoId) return;
            const mod = item.module === "inicio" ? "" : item.module;
            router.push(`/torneos/${torneoId}/${mod}`);
          }}
          notifications={headerNotifications}
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
          message="Eliminar tu cuenta permanentemente? Esta accion no se puede deshacer."
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