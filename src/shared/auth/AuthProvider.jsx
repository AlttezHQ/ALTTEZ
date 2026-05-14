/**
 * @module AuthProvider
 * @description Proveedor global de autenticación para ALTTEZ.
 * Una sola fuente de verdad para sesión, usuario y perfil.
 * CRM y Torneos consumen este contexto en vez de manejar auth por separado.
 *
 * Responsabilidades:
 *  - Escuchar onAuthStateChange una sola vez (a nivel global)
 *  - Mantener user, session, profile con estados de carga granulares
 *  - Exponer funciones de auth (signIn, signUp, signOut)
 *  - Cargar perfil (club_id, role) cuando hay sesión activa
 *
 * Estados de carga:
 *  - loadingAuth:    true mientras se verifica si hay sesión activa
 *  - loadingProfile: true mientras se carga el perfil (club_id, role)
 *  - isAuthenticated: true si hay user
 *  - isProfileReady:  true si profile ya fue cargado (puede ser null si no tiene)
 *
 * Nota arquitectónica (v1):
 *  La tabla `profiles` actual almacena un solo club_id y role por usuario.
 *  Para soportar múltiples organizaciones y roles por producto, ALTTEZ
 *  necesitará una tabla `memberships` en el futuro. Esta versión del
 *  AuthProvider está diseñada para que ese cambio solo impacte la carga
 *  del perfil, no la interfaz del hook useAuth().
 *
 * @version 1.1.0
 */

import { createContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { isSupabaseReady, supabase } from "../lib/supabase";
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  getProfile,
  onAuthStateChange,
  linkProfileToClub,
  deleteAccount as authDeleteAccount,
} from "../services/authService";

// ── Context ───────────────────────────────────────────────────────────────────

export const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export default function AuthProvider({ children }) {
  // undefined = checking initial session, null = no session, object = authenticated
  const [user, setUser] = useState(isSupabaseReady ? undefined : null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  // Granular loading states
  const [loadingAuth, setLoadingAuth] = useState(isSupabaseReady);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Error states
  const [authError, setAuthError] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const authCheckId = useRef(0);
  const authenticatedOnce = useRef(false);
  const explicitSignOut = useRef(false);

  // ── Bootstrap: check existing session + subscribe to changes ──

  useEffect(() => {
    if (!isSupabaseReady) {
      setLoadingAuth(false);
      return;
    }

    let mounted = true;
    const currentAuthCheck = ++authCheckId.current;

    // 1. Check existing session
    const bootstrap = async () => {
      try {
        const { data: { user: existingUser } } = await supabase.auth.getUser();
        if (!mounted || currentAuthCheck !== authCheckId.current) return;

        if (existingUser) {
          authenticatedOnce.current = true;
          setUser(existingUser);
          setLoadingAuth(false);

          // Load profile separately
          setLoadingProfile(true);
          try {
            const prof = await getProfile();
            if (mounted) {
              setProfile(prof);
              setProfileError(null);
            }
          } catch (err) {
            if (mounted) setProfileError(err?.message || "Error cargando perfil");
          } finally {
            if (mounted) setLoadingProfile(false);
          }
        } else {
          if (authenticatedOnce.current) return;
          setUser(null);
          setLoadingAuth(false);
        }
      } catch (err) {
        if (mounted && currentAuthCheck === authCheckId.current && !authenticatedOnce.current) {
          setUser(null);
          setAuthError(err?.message || "Error verificando sesión");
          setLoadingAuth(false);
        }
      }
    };

    bootstrap();

    // 2. Subscribe to auth state changes
    const sub = onAuthStateChange(async (event, authSession) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && authSession) {
        authCheckId.current += 1;
        authenticatedOnce.current = true;
        explicitSignOut.current = false;
        setUser(authSession.user);
        setSession(authSession);
        setAuthError(null);

        // Load profile after sign-in
        setLoadingProfile(true);
        try {
          const prof = await getProfile();
          if (mounted) {
            setProfile(prof);
            setProfileError(null);
          }
        } catch (err) {
          if (mounted) setProfileError(err?.message || "Error cargando perfil");
        } finally {
          if (mounted) setLoadingProfile(false);
        }
      } else if (event === "SIGNED_OUT") {
        if (!explicitSignOut.current && authenticatedOnce.current) return;
        explicitSignOut.current = false;
        authenticatedOnce.current = false;
        authCheckId.current += 1;
        setUser(null);
        setSession(null);
        setProfile(null);
        setAuthError(null);
        setProfileError(null);
      } else if (event === "TOKEN_REFRESHED" && authSession) {
        setSession(authSession);
      }
    });

    return () => {
      mounted = false;
      sub.unsubscribe();
    };
  }, []);

  // ── Auth actions ────────────────────────────────────────────────────────────

  const handleSignIn = useCallback(async (email, password) => {
    const result = await authSignIn(email, password);
    const signedUser = result?.session?.user ?? result?.user ?? null;

    if (!result?.error && signedUser) {
      authCheckId.current += 1;
      authenticatedOnce.current = true;
      explicitSignOut.current = false;
      setUser(signedUser);
      setSession(result.session ?? null);
      setAuthError(null);
      setLoadingAuth(false);

      setLoadingProfile(true);
      try {
        const prof = await getProfile();
        setProfile(prof);
        setProfileError(null);
      } catch (err) {
        setProfileError(err?.message || "Error cargando perfil");
      } finally {
        setLoadingProfile(false);
      }
    }

    return result;
  }, []);

  const handleSignUp = useCallback(async (params) => {
    return await authSignUp(params);
  }, []);

  const handleSignOut = useCallback(async () => {
    explicitSignOut.current = true;
    // 1. Call Supabase signOut
    if (isSupabaseReady) {
      await authSignOut();
    }
    // 2. Clear all local auth state
    // (onAuthStateChange listener handles Supabase mode,
    //  manual clear covers non-Supabase/offline mode)
    authenticatedOnce.current = false;
    setUser(null);
    setSession(null);
    setProfile(null);
    setAuthError(null);
    setProfileError(null);
    // 3. Destination is decided by the caller using authRedirects
    //    — this layer does NOT navigate
  }, []);

  const handleLinkClub = useCallback(async (clubId) => {
    const success = await linkProfileToClub(clubId);
    if (success) {
      setLoadingProfile(true);
      const prof = await getProfile();
      setProfile(prof);
      setLoadingProfile(false);
    }
    return success;
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    const result = await authDeleteAccount();
    if (!result.error) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setAuthError(null);
      setProfileError(null);
    }
    return result;
  }, []);

  /**
   * Recarga el perfil desde Supabase.
   * Útil después de crear un club o cambiar roles.
   */
  const refreshProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const prof = await getProfile();
      setProfile(prof);
      return prof;
    } catch (err) {
      setProfileError(err?.message || "Error recargando perfil");
      return null;
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // ── Context value ───────────────────────────────────────────────────────────

  const value = useMemo(() => ({
    // State
    user,
    session,
    profile,

    // Granular loading
    loadingAuth,
    loadingProfile,
    /** Convenience: true while either auth or profile is loading */
    loading: loadingAuth || loadingProfile,

    // Error states
    authError,
    profileError,

    // Derived booleans
    isAuthenticated: !!user,
    /** true once profile has been loaded (even if null/empty) */
    isProfileReady: !loadingAuth && !loadingProfile,

    // Derived data
    /** Role del usuario (del perfil Supabase) */
    role: profile?.role ?? null,
    /** club_id del usuario (del perfil Supabase) */
    clubId: profile?.club_id ?? null,
    /** Nombre completo del perfil */
    fullName: profile?.full_name ?? user?.email ?? "",

    // Actions
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    linkClub: handleLinkClub,
    deleteAccount: handleDeleteAccount,
    refreshProfile,
  }), [user, session, profile, loadingAuth, loadingProfile, authError, profileError, handleSignIn, handleSignUp, handleSignOut, handleLinkClub, handleDeleteAccount, refreshProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
