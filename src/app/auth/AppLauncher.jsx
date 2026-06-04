"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, Trophy, LogOut } from "lucide-react";
import { PALETTE } from "../../shared/tokens/palette";
import AuthShell from "../../shared/auth/components/AuthShell";
import { useAuth } from "../../shared/auth";
import PageTransition from "../../shared/ui/animations/PageTransition";
import { StaggeredList, StaggeredItem } from "../../shared/ui/animations/StaggeredList";
import FadeIn from "../../shared/ui/animations/FadeIn";

/**
 * @component AppLauncher
 * @description Pantalla intermedia para usuarios con acceso a múltiples módulos.
 * Rediseñada con Glassmorphism y animaciones.
 */
export default function AppLauncher() {
  const router = useRouter();
  const auth = useAuth();

  return (
    <PageTransition>
      <AuthShell maxWidth={840}>
        <div style={{ textAlign: "center", marginBottom: 48, position: "relative" }}>
          <FadeIn delay={0.1}>
            <h1 style={{ fontSize: 34, fontWeight: 900, color: "var(--color-text)", letterSpacing: "-0.04em", marginBottom: 12 }}>
              Bienvenido a ALTTEZ
            </h1>
            <p style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
              Selecciona el entorno al que deseas ingresar
            </p>
          </FadeIn>

          {/* Botón de Logout */}
          <motion.button
            whileHover={{ scale: 1.05, color: "var(--color-danger)" }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              await auth.signOut();
              router.push("/auth/login");
            }}
            style={{
              position: "absolute", top: 0, right: 0,
              background: "none", border: "none", padding: "8px 12px",
              color: "var(--color-text-muted)", fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <LogOut size={14} /> Cerrar sesión
          </motion.button>
        </div>

        <StaggeredList style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {/* CRM Card */}
          <StaggeredItem>
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/crm")}
              className="flex flex-col p-10 cursor-pointer h-full bg-[#181B2A] border border-[#22273F] rounded-2xl shadow-[0_14px_34px_rgba(0,0,0,0.5)] transition-all duration-300 group"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-cobre)";
                e.currentTarget.style.boxShadow = "0 10px 24px rgba(194,122,66,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#22273F";
                e.currentTarget.style.boxShadow = "0 14px 34px rgba(0,0,0,0.5)";
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 16, marginBottom: 20,
                background: "linear-gradient(135deg, var(--color-bronce-dim), transparent)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-bronce)",
              }}>
                <Building2 size={28} strokeWidth={1.5} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text)", marginBottom: 10 }}>CRM Clubes</h2>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                Gestión integral deportiva, administrativa y financiera para tu club u organización.
              </p>
            </motion.div>
          </StaggeredItem>

          {/* Torneos Card */}
          <StaggeredItem>
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/torneos")}
              className="flex flex-col p-10 cursor-pointer h-full bg-[#181B2A] border border-[#22273F] rounded-2xl shadow-[0_14px_34px_rgba(0,0,0,0.5)] transition-all duration-300 group"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-cobre)";
                e.currentTarget.style.boxShadow = "0 10px 24px rgba(194,122,66,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#22273F";
                e.currentTarget.style.boxShadow = "0 14px 34px rgba(0,0,0,0.5)";
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 16, marginBottom: 20,
                background: "linear-gradient(135deg, var(--color-bronce-dim), transparent)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-bronce)",
              }}>
                <Trophy size={28} strokeWidth={1.5} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text)", marginBottom: 10 }}>Torneos</h2>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                Gestor competitivo para crear competiciones, ligas y manejar el registro de equipos.
              </p>
            </motion.div>
          </StaggeredItem>
        </StaggeredList>
      </AuthShell>
    </PageTransition>
  );
}
