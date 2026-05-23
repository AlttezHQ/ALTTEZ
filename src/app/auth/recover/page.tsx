"use client";

import RecoverPasswordForm from "@/shared/auth/components/RecoverPasswordForm";
import AuthShell from "@/shared/auth/components/AuthShell";
import { useRouter } from "next/navigation";

export default function RecoverPage() {
  const router = useRouter();
  return (
    <AuthShell maxWidth={500}>
      <RecoverPasswordForm onBack={() => router.push("/auth/login")} />
    </AuthShell>
  );
}
