"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AlertTriangle, Building2 } from "lucide-react";
import { useAuth } from "../../shared/auth";
import { useTorneosStore } from "./store/useTorneosStore";
import { isSupabaseReady } from "../../shared/lib/supabase";
import AlttezLoader from "./components/shared/AlttezLoader";
import ToastContainer from "../../shared/ui/Toast";
import TorneosOnboarding from "./TorneosOnboarding";
import ModuleEmptyState from "./components/shared/ModuleEmptyState";
import TorneosShell from "./components/shared/TorneosShell";
import { PALETTE } from "../../shared/tokens/palette";

const BG = PALETTE.bg;
const CARD = PALETTE.surface;
const BORDER = PALETTE.border;

function TorneosStatusScreen({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG, padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 720, background: CARD, borderRadius: 24, border: `1px solid ${BORDER}`, boxShadow: "0 24px 64px rgba(23,26,28,0.10)", padding: "24px 20px" }}>
        <ModuleEmptyState icon={Icon} title={title} subtitle={subtitle} />
      </div>
    </div>
  );
}

export default function TorneosGlobalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const auth = useAuth();
  
  const loadTorneos = useTorneosStore((s) => s.loadTorneosFromSupabase);
  const torneos = useTorneosStore((s) => s.torneos);
  const storeLoading = useTorneosStore((s) => s.loading);
  const storeError = useTorneosStore((s) => s.error);

  const [initialLoading, setInitialLoading] = useState(true);
  const [initStatus, setInitStatus] = useState<string>("loading");
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        if (!isSupabaseReady) throw new Error("Supabase no está configurado para cargar ALTTEZ Torneos");
        
        if (auth.loadingAuth || auth.loadingProfile) return;
        
        if (!auth.user) {
          if (!cancelled) {
            router.replace(`/auth/login?redirect=/torneos`);
          }
          return;
        }

        const profile = auth.profile;
        if (!profile) {
          if (!cancelled) {
            setInitStatus("missing-profile");
            setInitError("No encontramos un perfil asociado a tu cuenta de torneos.");
            setInitialLoading(false);
          }
          return;
        }

        const organization = {
          id: (profile as any).club_id ?? (auth.user as any).id,
          nombre: (profile as any).full_name ?? (auth.user as any).email ?? "Organización ALTTEZ",
        };

        if (!organization?.id) {
          if (!cancelled) {
            setInitStatus("missing-organization");
            setInitialLoading(false);
          }
          return;
        }

        // Cargar torneos
        if (torneos.length === 0) {
          await loadTorneos();
        }

        if (!cancelled) {
          setInitStatus("ready");
          setInitialLoading(false);
        }
      } catch (error: any) {
        console.error("[TORNEOS INIT ERROR]", error);
        if (!cancelled) {
          setInitStatus("error");
          setInitError(error?.message || "Error al inicializar");
          setInitialLoading(false);
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [auth.loadingAuth, auth.loadingProfile, auth.user, auth.profile, loadTorneos, router, torneos.length]);

  if (initialLoading || auth.loadingAuth || auth.loadingProfile || storeLoading) {
    return <AlttezLoader fullScreen text="Cargando entorno..." />;
  }

  const userRoles = (auth.user as any)?.user_metadata?.roles || [];
  const hasOrganizadorRole = userRoles.includes("organizador");

  if (!hasOrganizadorRole) {
    return (
      <div style={{ minHeight: "100vh", background: BG, position: "relative" }}>
        <ToastContainer />
        <Suspense fallback={<AlttezLoader fullScreen text="Cargando entorno..." />}>
          <TorneosOnboarding onComplete={() => window.location.reload()} />
        </Suspense>
      </div>
    );
  }

  if (initStatus === "missing-profile") {
    return <TorneosStatusScreen icon={AlertTriangle} title="No encontramos tu perfil" subtitle={initError || ""} />;
  }

  if (initStatus === "missing-organization") {
    return <TorneosStatusScreen icon={Building2} title="No hay organización disponible" subtitle="La sesión está activa, pero no encontramos una organización válida." />;
  }

  if (initStatus === "error" || storeError) {
    return <TorneosStatusScreen icon={AlertTriangle} title="Error al cargar" subtitle={initError || storeError} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column" }}>
      <ToastContainer />
      <TorneosShell>
        {children}
      </TorneosShell>
    </div>
  );
}
