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

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { isSupabaseReady, supabase, getStoredSession } from "../lib/supabase";
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

import { AuthContext } from "./AuthContext";

// ── Provider ──────────────────────────────────────────────────────────────────

export default function AuthProvider({ children }) {
  // Leer la sesion guardada de forma sincrona al inicializar
  // para evitar el flash de loading cuando el usuario vuelve a la ventana.
  const storedUser = isSupabaseReady ? getStoredSession() : null;

  // undefined = checking initial session, null = no session, object = authenticated
  // Si ya habia usuario guardado, arrancamos con el user pre-cargado (sin flicker).
  const [user, setUser] = useState(storedUser ?? (isSupabaseReady ? undefined : null));
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  // Granular loading states
  // Si ya habia sesion guardada, no necesitamos bloquear la UI con loadingAuth.
  const [loadingAuth, setLoadingAuth] = useState(isSupabaseReady && !storedUser);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Error states
  const [authError, setAuthError] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const authCheckId = useRef(0);
  // Si ya habia usuario guardado al arrancar, marcamos authenticatedOnce=true
  // para que el guard de SIGNED_OUT no limpie el estado incorrectamente.
  const authenticatedOnce = useRef(!!storedUser);
  const explicitSignOut = useRef(false);

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const prof = await getProfile();
      setProfile(prof);
      setProfileError(null);
      return prof;
    } catch (err) {
      setProfileError(err?.message || "Error cargando perfil");
      return null;
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const applyAuthenticatedSession = useCallback(async (authSession, fallbackUser = null) => {
    const signedUser = authSession?.user ?? fallbackUser ?? null;
    if (!signedUser) return null;

    authCheckId.current += 1;
    authenticatedOnce.current = true;
    explicitSignOut.current = false;
    setLoadingProfile(true);
    setUser(signedUser);
    setSession(authSession ?? null);
    setAuthError(null);
    setLoadingAuth(false);

    const prof = await loadProfile();
    return prof;
  }, [loadProfile]);

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
        // Si ya tenemos un usuario del token guardado, cargar perfil inmediatamente
        // sin esperar a getUser(). getUser() sigue corriendo para validar con Supabase.
        if (storedUser && mounted) {
          authenticatedOnce.current = true;
          setLoadingProfile(true);
          setUser(storedUser);
          setLoadingAuth(false);
          // Cargar perfil en background (no bloquea render)
          loadProfile();
        }

        // Safety timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("AUTH_TIMEOUT")), 5000)
        );

        const { data: { user: existingUser } } = await Promise.race([
          supabase.auth.getUser(),
          timeoutPromise
        ]);

        if (!mounted || currentAuthCheck !== authCheckId.current) return;

        if (existingUser) {
          authenticatedOnce.current = true;
          // Solo actualizar user si no lo habiamos pre-cargado (o si cambio)
          if (!storedUser || existingUser.id !== storedUser.id) {
            setLoadingProfile(true);
            setUser(existingUser);
            setLoadingAuth(false);
            await loadProfile();
          } else {
            // storedUser ya cargado — confirmar con el user del servidor
            setUser(existingUser);
            setLoadingAuth(false);
          }
        } else {
          if (authenticatedOnce.current) return;
          setUser(null);
          setLoadingAuth(false);
        }
      } catch (err) {
        console.error("[Auth] Bootstrap error:", err);
        if (mounted && currentAuthCheck === authCheckId.current) {
          // Solo limpiar si no habia sesion guardada valida
          if (!storedUser) {
            setUser(null);
          }
          setLoadingAuth(false);
          setAuthError(err.message === "AUTH_TIMEOUT" 
            ? "No se pudo conectar con el servidor de autenticación" 
            : (err?.message || "Error verificando sesión")
          );
        }
      }
    };

    bootstrap();

    // 2. Subscribe to auth state changes
    const sub = onAuthStateChange(async (event, authSession) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && authSession) {
        await applyAuthenticatedSession(authSession);
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
  }, [applyAuthenticatedSession, loadProfile]);

  // ── Auth actions ────────────────────────────────────────────────────────────

  const handleSignIn = useCallback(async (email, password) => {
    const result = await authSignIn(email, password);
    if (!result?.error) {
      const profile = await applyAuthenticatedSession(result.session, result.user);
      result.profile = profile;
    }

    return result;
  }, [applyAuthenticatedSession]);

  const handleSignUp = useCallback(async (params) => {
    const result = await authSignUp(params);

    if (!result?.error && result?.session) {
      await applyAuthenticatedSession(result.session, result.user);
      return result;
    }

    if (!result?.error && params?.email && params?.password) {
      const signInResult = await authSignIn(params.email, params.password);
      if (!signInResult?.error) {
        await applyAuthenticatedSession(signInResult.session, signInResult.user);
        return { ...result, session: signInResult.session, user: signInResult.user };
      }
      return signInResult;
    }

    return result;
  }, [applyAuthenticatedSession]);

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
      await loadProfile();
    }
    return success;
  }, [loadProfile]);

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
    setProfileError(null);
    return await loadProfile();
  }, [loadProfile]);

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
