"use client";

import { Suspense } from "react";
import AuthLoginForm from "@/shared/auth/components/AuthLoginForm";
import AuthShell from "@/shared/auth/components/AuthShell";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const withRedirect = (path: string) => redirect ? `${path}?redirect=${encodeURIComponent(redirect)}` : path;
  return (
    <AuthShell maxWidth={500}>
        <AuthLoginForm 
          onRegisterClick={() => router.push(withRedirect("/auth/register"))}
          onRecoverClick={() => router.push(withRedirect("/auth/recover"))}
        />
    </AuthShell>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<AuthShell maxWidth={500}><p>Cargando acceso...</p></AuthShell>}><LoginContent /></Suspense>;
}
