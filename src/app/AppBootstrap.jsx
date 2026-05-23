"use client";

import { useEffect } from "react";
import ToastContainer, { showToast } from "@/shared/ui/Toast";
import { setHookErrorHandler } from "@/shared/hooks/useLocalStorage";
import { setStorageErrorHandler } from "@/shared/services/storageService";
import { setHealthErrorHandler } from "@/shared/services/healthService";
import { setValidationErrorHandler } from "@/shared/constants/schemas";
import { setSupabaseErrorHandler } from "@/shared/services/supabaseService";
import { setAuthErrorHandler } from "@/shared/services/authService";
import { runMigrations } from "@/shared/services/migrationService";
import { registerSW } from "@/shared/lib/registerSW";

let bootstrapped = false;

export default function AppBootstrap() {
  useEffect(() => {
    if (bootstrapped) return;
    bootstrapped = true;

    const toastError = (message) => showToast(message, "error");
    setStorageErrorHandler(toastError);
    setHookErrorHandler(toastError);
    setHealthErrorHandler(toastError);
    setValidationErrorHandler(toastError);
    setSupabaseErrorHandler(toastError);
    setAuthErrorHandler(toastError);
    runMigrations();
    registerSW();
  }, []);

  return <ToastContainer />;
}
