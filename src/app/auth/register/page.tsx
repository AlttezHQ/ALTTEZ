"use client";

import { Suspense } from "react";
import AuthRegisterForm from "@/shared/auth/components/AuthRegisterForm";
import AuthShell from "@/shared/auth/components/AuthShell";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  return (
    <AuthShell maxWidth={500}>
      <AuthRegisterForm 
        onLoginClick={() => router.push(redirect ? `/auth/login?redirect=${encodeURIComponent(redirect)}` : "/auth/login")}
      />
    </AuthShell>
  );
}

export default function RegisterPage() {
  return <Suspense fallback={<AuthShell maxWidth={500}><p>Cargando registro...</p></AuthShell>}><RegisterContent /></Suspense>;
}
