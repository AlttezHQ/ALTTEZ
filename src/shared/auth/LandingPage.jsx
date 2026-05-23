import { useState } from "react";
import { useRouter } from "next/navigation";
import { PALETTE } from "../tokens/palette";

import AuthShell       from "./components/AuthShell";
import AuthHeader      from "./components/AuthHeader";
import AuthModuleCards from "./components/AuthModuleCards";

const CU = PALETTE.bronce;

/**
 * @component LandingPage
 * @description Punto de entrada principal para el ecosistema ALTTEZ.
 * Coordina el flujo de autenticación entre Landing, Login, Registro y Recuperación
 * de contraseña para los módulos de Clubes y Torneos.
 *
 * @param {Function} [onAfterRegister] - Callback invocado tras registro exitoso del CRM.
 *   Recibe los datos del formulario para que CRMApp cree el club y vincule el perfil.
 */
export default function LandingPage() {
  const router = useRouter();

  const handleAction = (actionType, module) => {
    // actionType = "login" | "register"
    // module = "crm" | "torneos" (aunque ahora ambos van al SSO central)
    // Pasamos el módulo destino como ?redirect= (o lo asume el SSO)
    const dest = module === "torneos" ? "/torneos" : "/dashboard";
    router.push(`/auth/${actionType}?redirect=${dest}`);
  };

  const goBack = () => {
    router.push("/");
  };

  return (
    <AuthShell maxWidth={1240}>

      {/* Botón superior de retorno */}
      <button
        onClick={goBack}
        style={{
          border: "none", background: "none", padding: 0,
          marginBottom: 18, cursor: "pointer",
          color: CU, fontSize: 11, fontWeight: 700,
          display: "flex", alignItems: "center", gap: 4,
          position: "absolute", top: -30, left: 0,
        }}
      >
        ← Volver al inicio
      </button>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AuthHeader
          title="El ecosistema completo"
          subtitle="Selecciona tu entorno para empezar. Todos tus datos están conectados y protegidos."
        />
        <AuthModuleCards onAction={handleAction} />
      </div>
    </AuthShell>
  );
}
