import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
              navigate("/auth/login");
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
              onClick={() => navigate("/crm")}
              className="glass-panel"
              style={{
                display: "flex", flexDirection: "column",
                padding: "40px 32px", cursor: "pointer",
                transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                height: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-bronce)";
                e.currentTarget.style.boxShadow = "var(--shadow-bronce)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
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
              onClick={() => navigate("/torneos")}
              className="glass-panel"
              style={{
                display: "flex", flexDirection: "column",
                padding: "40px 32px", cursor: "pointer",
                transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                height: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-bronce)";
                e.currentTarget.style.boxShadow = "var(--shadow-bronce)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
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
