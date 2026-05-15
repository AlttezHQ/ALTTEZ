import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PALETTE } from "../tokens/palette";

// Components
import AuthShell from "./components/AuthShell";
import AuthHeader from "./components/AuthHeader";
import AuthModuleCards from "./components/AuthModuleCards";
import AuthLoginForm from "./components/AuthLoginForm";
import AuthRegisterForm from "./components/AuthRegisterForm";

const CU = PALETTE.bronce;

/**
 * @component LandingPage
 * @description Punto de entrada principal para el ecosistema ALTTEZ.
 * Coordina el flujo de autenticación entre Landing, Login y Registro para los módulos de Clubes y Torneos.
 */
export default function LandingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("landing"); // landing | login | register | recover
  const [source, setSource] = useState(null); // null (clubes) | "torneos"

  const handleAction = (newStep, newSource) => {
    if (newSource === "torneos") {
      navigate(newStep === "register" ? "/torneos?auth=register" : "/torneos");
      return;
    }
    setStep(newStep);
    setSource(newSource);
  };

  const goBack = () => {
    if (step === "landing") navigate("/");
    else setStep("landing");
  };

  return (
    <AuthShell maxWidth={step === "landing" ? 1240 : 960}>
      
      {/* Botón superior de retorno */}
      <button
        onClick={goBack}
        style={{
          border: "none", background: "none", padding: 0,
          marginBottom: 18, cursor: "pointer",
          color: CU, fontSize: 11, fontWeight: 700,
          display: "flex", alignItems: "center", gap: 4,
          position: "absolute", top: -30, left: 0
        }}
      >
        ← {step === "landing" ? "Volver al inicio" : "Volver"}
      </button>

      {step === "landing" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <AuthHeader />
          <AuthModuleCards onAction={handleAction} />
        </div>
      )}

      {step === "login" && (
        <AuthLoginForm 
          source={source}
          onRegisterClick={() => setStep("register")}
          onRecoverClick={() => setStep("recover")}
        />
      )}

      {step === "register" && (
        <AuthRegisterForm 
          source={source}
          onLoginClick={() => setStep("login")}
        />
      )}

      {step === "recover" && (
        <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 20 }}>
          <h2 style={{ color: PALETTE.text }}>Recuperar contraseña</h2>
          <p style={{ color: PALETTE.textMuted }}>Módulo en desarrollo. Por ahora, contacta a soporte.</p>
          <button 
            onClick={() => setStep("login")}
            style={{ marginTop: 20, padding: '10px 20px', borderRadius: 10, border: 'none', background: CU, color: '#fff', fontWeight: 700, cursor: 'pointer' }}
          >
            Volver al login
          </button>
        </div>
      )}

    </AuthShell>
  );
}
