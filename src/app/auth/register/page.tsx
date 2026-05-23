"use client";

import AuthRegisterForm from "@/shared/auth/components/AuthRegisterForm";
import AuthShell from "@/shared/auth/components/AuthShell";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  return (
    <AuthShell maxWidth={500}>
      <AuthRegisterForm 
        onLoginClick={() => router.push("/auth/login")} 
      />
    </AuthShell>
  );
}
