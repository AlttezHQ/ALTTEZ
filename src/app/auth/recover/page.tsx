"use client";

import { Suspense } from "react";
import RecoverPasswordForm from "@/shared/auth/components/RecoverPasswordForm";
import AuthShell from "@/shared/auth/components/AuthShell";
import { useRouter, useSearchParams } from "next/navigation";

function RecoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  return (
    <AuthShell maxWidth={500}>
      <RecoverPasswordForm redirectPath={redirect || ""} onBack={() => router.push(redirect ? `/auth/login?redirect=${encodeURIComponent(redirect)}` : "/auth/login?redirect=/torneos")} />
    </AuthShell>
  );
}

export default function RecoverPage() {
  return <Suspense fallback={<AuthShell maxWidth={500}><p>Cargando recuperación...</p></AuthShell>}><RecoverContent /></Suspense>;
}
