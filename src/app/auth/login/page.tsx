"use client";

import { Suspense } from "react";
import AuthLoginForm from "@/shared/auth/components/AuthLoginForm";
import AuthShell from "@/shared/auth/components/AuthShell";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  return (
    <AuthShell maxWidth={500}>
      <Suspense fallback={<div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Cargando...</div>}>
        <AuthLoginForm 
          onRegisterClick={() => router.push("/auth/register")} 
          onRecoverClick={() => router.push("/auth/recover")} 
        />
      </Suspense>
    </AuthShell>
  );
}
