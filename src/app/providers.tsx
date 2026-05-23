"use client";

import { AuthProvider } from "@/shared/auth";
import AppBootstrap from "./AppBootstrap";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppBootstrap />
      {children}
    </AuthProvider>
  );
}
