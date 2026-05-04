/**
 * @component App
 * @description Raiz de la aplicacion ALTTEZ.
 * BrowserRouter + top-level route declarations + lazy imports.
 * La logica de sesion y CRM vive en CRMApp.
 *
 * @version 9.0
 */

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { setHookErrorHandler } from "./shared/hooks/useLocalStorage";
import { setStorageErrorHandler } from "./shared/services/storageService";
import { setHealthErrorHandler } from "./shared/services/healthService";
import { setValidationErrorHandler } from "./shared/constants/schemas";
import { setSupabaseErrorHandler } from "./shared/services/supabaseService";
import { setAuthErrorHandler } from "./shared/services/authService";
import { showToast } from "./shared/ui/Toast";
import ToastContainer from "./shared/ui/Toast";
import { runMigrations } from "./shared/services/migrationService";
import { PALETTE as C } from "./shared/tokens/palette";

// ── Portal Marketing ──
const PortalLayout   = lazy(() => import("./marketing/layout/PortalLayout"));
const PortalHome     = lazy(() => import("./marketing/pages/PortalHome"));
const SportsCRMPage  = lazy(() => import("./marketing/pages/SportsCRMPage"));
const JournalPage    = lazy(() => import("./marketing/pages/JournalPage"));
const QuienesSomos   = lazy(() => import("./marketing/pages/QuienesSomos"));
const Contacto       = lazy(() => import("./marketing/pages/Contacto"));
const PrivacyPolicy  = lazy(() => import("./marketing/pages/PrivacyPolicy"));
const PricingPage    = lazy(() => import("./marketing/pages/PricingPage"));
const ConfirmarAsistencia = lazy(() => import("./marketing/pages/ConfirmarAsistencia"));

// ── CRM Shell ──
const CRMApp = lazy(() => import("./app/shell/CRMApp"));

// ── ALTTEZ Torneos ──
const TorneosApp = lazy(() => import("./app/torneos/TorneosApp"));

// ── Conectar handlers de error al boot ──
const _toastError = (msg) => showToast(msg, "error");
setStorageErrorHandler(_toastError);
setHookErrorHandler(_toastError);
setHealthErrorHandler(_toastError);
setValidationErrorHandler(_toastError);
setSupabaseErrorHandler(_toastError);
setAuthErrorHandler(_toastError);

// ── Ejecutar migraciones al boot ──
runMigrations();

// ── Loading fallback ──
const LoadingFallback = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh" }}>
    <div style={{ textAlign:"center" }}>
      <div style={{ width:24, height:24, border:`2px solid ${C.border}`, borderTop:`2px solid ${C.blue}`, borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 12px" }} />
      <div style={{ fontSize:11, color:C.textMuted, letterSpacing:"0.12em", textTransform:"uppercase" }}>Inicializando</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Portal Corporativo — rutas con navbar compartida */}
        <Route element={<Suspense fallback={<LoadingFallback />}><PortalLayout /></Suspense>}>
          <Route index element={<PortalHome />} />
          <Route path="quienes-somos" element={<QuienesSomos />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="producto/alttezcrm" element={<SportsCRMPage />} />
          <Route path="servicios/sports-crm" element={<Navigate to="/producto/alttezcrm" replace />} />
          <Route path="precios" element={<PricingPage />} />
          <Route path="journal" element={<JournalPage />} />
        </Route>
        {/* Politica de Privacidad — publica, sin navbar del portal */}
        <Route
          path="/privacidad"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <PrivacyPolicy />
            </Suspense>
          }
        />
        {/* Confirmacion de asistencia — publica */}
        <Route
          path="/confirmar/:clubId/:eventId"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ConfirmarAsistencia />
            </Suspense>
          }
        />
        {/* CRM App — sistema de gestion deportiva */}
        <Route path="/crm/*" element={<Suspense fallback={<LoadingFallback />}><CRMApp /></Suspense>} />
        {/* ALTTEZ Torneos — producto independiente */}
        <Route path="/torneos/*" element={<Suspense fallback={<LoadingFallback />}><TorneosApp /></Suspense>} />
      </Routes>
    </BrowserRouter>
  );
}
