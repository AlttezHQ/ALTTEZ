import { Outlet } from "react-router-dom";
import AuthShell from "../../shared/auth/components/AuthShell";

/**
 * @component AuthPortal
 * @description Contenedor principal de rutas de autenticación (/auth).
 * Renderiza el AuthShell (fondo Marfil y grilla) y maneja las rutas hijas
 * como login, registro y recuperación mediante el Outlet.
 */
export default function AuthPortal() {
  return (
    <AuthShell maxWidth={500}>
      <Outlet />
    </AuthShell>
  );
}
