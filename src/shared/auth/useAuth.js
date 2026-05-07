/**
 * @module useAuth
 * @description Hook para consumir el contexto de autenticación global de ALTTEZ.
 * Reemplaza toda lógica duplicada de auth en CRM y Torneos.
 *
 * Uso:
 *   const {
 *     user, profile, signIn, signOut,
 *     loadingAuth, loadingProfile, isAuthenticated, isProfileReady,
 *   } = useAuth();
 *
 * @version 1.1.0
 */

import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

/**
 * Hook que consume el AuthProvider.
 * Debe usarse dentro del árbol de <AuthProvider>.
 *
 * @returns {{
 *   user: Object|null|undefined,
 *   session: Object|null,
 *   profile: Object|null,
 *   loadingAuth: boolean,
 *   loadingProfile: boolean,
 *   loading: boolean,
 *   authError: string|null,
 *   profileError: string|null,
 *   isAuthenticated: boolean,
 *   isProfileReady: boolean,
 *   role: string|null,
 *   clubId: string|null,
 *   fullName: string,
 *   signIn: (email: string, password: string) => Promise,
 *   signUp: (params: Object) => Promise,
 *   signOut: () => Promise,
 *   linkClub: (clubId: string) => Promise<boolean>,
 *   deleteAccount: () => Promise,
 *   refreshProfile: () => Promise,
 * }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth debe usarse dentro de <AuthProvider>. " +
      "Asegúrate de que App.jsx envuelve el contenido con <AuthProvider>."
    );
  }
  return context;
}
