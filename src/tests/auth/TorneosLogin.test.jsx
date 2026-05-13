/**
 * @file TorneosLogin.test.jsx
 * Cubre el flujo de login/register de ALTTEZ Torneos:
 *  - authService: signIn, signUp, error mapping, guard isSupabaseReady
 *  - TorneosApp: gate de auth (estados undefined/null/user)
 *  - TorneosAuthScreen: validación de formulario, llamadas correctas
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Supabase mock ─────────────────────────────────────────────────────────────
// vi.hoisted garantiza que las variables existen cuando el factory de vi.mock corre

let authListener = null;

const triggerAuth = (user, session = { access_token: "tok" }) => {
  if (authListener) {
    // Simulate async emission
    setTimeout(() => {
      authListener("SIGNED_IN", { ...session, user });
    }, 0);
  }
};

const {
  mockSignInWithPassword,
  mockSignUp,
  mockSignOut,
  mockGetUser,
  mockOnAuthStateChange,
  mockRpc,
} = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockSignUp:             vi.fn(),
  mockSignOut:            vi.fn(),
  mockGetUser:            vi.fn(),
  mockOnAuthStateChange:  vi.fn((cb) => {
    authListener = cb;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  }),
  mockRpc:                vi.fn(),
}));

vi.mock("../../shared/lib/supabase", () => ({
  isSupabaseReady: true,
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp:             mockSignUp,
      signOut:            mockSignOut,
      getUser:            mockGetUser,
      onAuthStateChange:  mockOnAuthStateChange,
    },
    rpc:  mockRpc,
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnThis(),
    }),
  },
}));

// ── framer-motion mock ────────────────────────────────────────────────────────

vi.mock("framer-motion", () => {
  const tags = ["div", "button", "span", "h1", "h2", "p", "section", "article"];
  const motion = {};
  tags.forEach((tag) => {
    motion[tag] = ({ children, whileHover, whileTap, animate, initial, exit, transition, ...rest }) =>
      React.createElement(tag, rest, children);
  });
  return {
    motion,
    AnimatePresence: ({ children }) => children,
  };
});

// ── TorneosApp dependencies mock ──────────────────────────────────────────────

vi.mock("../../app/torneos/store/useTorneosStore", () => ({
  useTorneosStore: (sel) => sel({ torneoActivoId: null, torneos: [] }),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../app/torneos/components/shared/TorneosSidebar",    () => ({ default: () => null }));
vi.mock("../../app/torneos/components/shared/TorneosHeader",     () => ({ default: ({ userName }) => <div data-testid="crm-header">{userName}</div> }));
vi.mock("../../app/torneos/components/shared/ModuleEmptyState",  () => ({ default: () => null }));
vi.mock("../../app/torneos/pages/InicioPage",                    () => ({ default: () => <div data-testid="inicio-page">Inicio</div> }));
vi.mock("../../app/torneos/pages/TorneosListPage",               () => ({ default: () => null }));
vi.mock("../../app/torneos/pages/EquiposPage",                   () => ({ default: () => null }));
vi.mock("../../app/torneos/pages/FixturesPage",                  () => ({ default: () => null }));
vi.mock("../../app/torneos/pages/EstadisticasPage",              () => ({ default: () => null }));
vi.mock("../../app/torneos/pages/CalendarioPage",                () => ({ default: () => null }));
vi.mock("../../app/torneos/pages/AjustesPage",                   () => ({ default: () => null }));
vi.mock("../../app/torneos/components/wizard/CrearTorneoWizard", () => ({ default: () => null }));

// ── DOMPurify mock (used by authValidation → sanitize) ────────────────────────

vi.mock("dompurify", () => ({
  default: { sanitize: (str) => str },
}));

// ── Imports bajo test (después de mocks) ──────────────────────────────────────

import { signIn, signUp, signOut, deleteAccount } from "../../shared/services/authService";
import TorneosApp from "../../app/torneos/TorneosApp";
import AuthProvider from "../../shared/auth/AuthProvider";

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderApp() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <TorneosApp />
      </AuthProvider>
    </MemoryRouter>
  );
}

/** Configura mocks para que getUser retorne null → muestra TorneosAuthScreen */
function setupNoSession() {
  mockGetUser.mockResolvedValueOnce({ data: { user: null } });
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
}

/** Configura mocks para que getUser retorne un usuario autenticado.
 *  AuthProvider llama getUser (bootstrap) + getProfile llama getUser (internal). */
function setupActiveSession(user = { id: "u1", email: "liga@norte.com" }) {
  // 1st call: AuthProvider bootstrap
  mockGetUser.mockResolvedValue({ data: { user } });
  
  // Si el listener ya está registrado, disparar SIGNED_IN
  if (authListener) {
    authListener("SIGNED_IN", { user, session: { access_token: "tok" } });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. authService — signIn
// ─────────────────────────────────────────────────────────────────────────────

describe("authService — signIn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authListener = null;
  });
  beforeEach(() => vi.clearAllMocks());

  it("retorna user y session en éxito", async () => {
    const fakeUser = { id: "u1", email: "a@b.com" };
    const fakeSession = { access_token: "tok" };
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: fakeUser, session: fakeSession },
      error: null,
    });

    const result = await signIn("a@b.com", "pass123");

    expect(result.error).toBeNull();
    expect(result.user).toEqual(fakeUser);
    expect(result.session).toEqual(fakeSession);
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "pass123",
    });
  });

  it("mapea 'Invalid login credentials' → mensaje en español", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: {},
      error: { message: "Invalid login credentials", code: null },
    });

    const result = await signIn("a@b.com", "wrong");

    expect(result.user).toBeNull();
    expect(result.error).toBe("Email o contraseña incorrectos");
  });

  it("mapea 'Email not confirmed' → mensaje en español", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: {},
      error: { message: "Email not confirmed", code: null },
    });

    const result = await signIn("a@b.com", "pass");

    expect(result.error).toBe("Confirma tu email antes de iniciar sesion");
  });

  it("mapea 'Email rate limit exceeded' → mensaje en español", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: {},
      error: { message: "Email rate limit exceeded", code: null },
    });

    const result = await signIn("a@b.com", "pass");

    expect(result.error).toBe("Demasiados intentos. Espera unos minutos");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. authService — signUp (torneos siempre envía role: "admin")
// ─────────────────────────────────────────────────────────────────────────────

describe("authService — signUp", () => {
  beforeEach(() => vi.clearAllMocks());

  it("envía full_name y role en user_metadata", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: "u2", email: "liga@norte.com" }, session: null },
      error: null,
    });

    const result = await signUp({
      email: "liga@norte.com",
      password: "pass123",
      fullName: "Liga Norte",
      role: "admin",
    });

    expect(result.error).toBeNull();
    expect(mockSignUp).toHaveBeenCalledWith({
      email: "liga@norte.com",
      password: "pass123",
      options: {
        data: { full_name: "Liga Norte", role: "admin" },
      },
    });
  });

  it("mapea 'User already registered' → mensaje en español", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: {},
      error: { message: "User already registered", code: null },
    });

    const result = await signUp({
      email: "dup@b.com",
      password: "pass123",
      fullName: "Test",
      role: "admin",
    });

    expect(result.user).toBeNull();
    expect(result.error).toBe("Ya existe una cuenta con ese email");
  });

  it("mapea 'Password should be at least' → mensaje en español", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: {},
      error: { message: "Password should be at least 6 characters", code: null },
    });

    const result = await signUp({ email: "a@b.com", password: "123", fullName: "X", role: "admin" });

    expect(result.error).toBe("La contraseña debe tener al menos 6 caracteres");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. authService — signOut y deleteAccount
// ─────────────────────────────────────────────────────────────────────────────

describe("authService — signOut y deleteAccount", () => {
  beforeEach(() => vi.clearAllMocks());

  it("signOut llama supabase.auth.signOut y retorna true", async () => {
    mockSignOut.mockResolvedValueOnce({ error: null });

    const result = await signOut();

    expect(result).toBe(true);
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it("deleteAccount llama rpc('delete_user') luego signOut", async () => {
    mockRpc.mockResolvedValueOnce({ error: null });
    mockSignOut.mockResolvedValueOnce({ error: null });

    const result = await deleteAccount();

    expect(result.error).toBeNull();
    expect(mockRpc).toHaveBeenCalledWith("delete_user");
    expect(mockSignOut).toHaveBeenCalledOnce();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. TorneosApp — gate de autenticación
// ─────────────────────────────────────────────────────────────────────────────

describe("TorneosApp — gate de autenticación", () => {
  beforeEach(() => vi.clearAllMocks());

  it("muestra loading spinner mientras verifica sesión (authUser === undefined)", () => {
    // getUser nunca resuelve → estado queda en undefined
    mockGetUser.mockReturnValue(new Promise(() => {}));
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    renderApp();

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it("muestra TorneosAuthScreen cuando no hay sesión activa", async () => {
    setupNoSession();

    renderApp();

    await waitFor(() => {
      expect(screen.getByText("ALTTEZ Torneos")).toBeInTheDocument();
    });
    // Tabs del formulario de auth
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /registrarse/i })).toBeInTheDocument();
  });

  it("renderiza la app completa tras sesión activa", async () => {
    setupActiveSession({ id: "u1", email: "coach@club.com" });

    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId("inicio-page")).toBeInTheDocument();
    });
    // TorneosAuthScreen NO debe estar visible
    expect(screen.queryByText("ALTTEZ Torneos")).not.toBeInTheDocument();
  });

  it("suscribe a onAuthStateChange en mount y desuscribe en unmount", async () => {
    const unsubscribeMock = vi.fn();
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } },
    });

    const { unmount } = renderApp();

    await waitFor(() => screen.getByText("ALTTEZ Torneos"));

    unmount();
    expect(unsubscribeMock).toHaveBeenCalledOnce();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. TorneosAuthScreen — formulario de login
// ─────────────────────────────────────────────────────────────────────────────

describe("TorneosAuthScreen — formulario de login", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    authListener = null;
    setupNoSession();
    renderApp();
    await waitFor(() => screen.getByText("ALTTEZ Torneos"));
  });

  it("muestra errores de validación con campos vacíos", async () => {
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => {
      const requeridos = screen.getAllByText("Requerido");
      expect(requeridos.length).toBeGreaterThanOrEqual(2); // email + password
    });
  });

  it("llama signIn con email y password correctos", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: "u1", email: "liga@norte.com" }, session: {} },
      error: null,
    });
    // onAuthStateChange para la re-suscripción tras login
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    fireEvent.change(screen.getByPlaceholderText("tu@email.com"), {
      target: { value: "liga@norte.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Tu contraseña"), {
      target: { value: "pass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));
    
    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "liga@norte.com",
        password: "pass123",
      });
    });
  });

  it("muestra mensaje de error cuando signIn falla", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: {},
      error: { message: "Invalid login credentials", code: null },
    });

    fireEvent.change(screen.getByPlaceholderText("tu@email.com"), {
      target: { value: "bad@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Tu contraseña"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByText("Email o contraseña incorrectos")).toBeInTheDocument();
    });
  });

  it("submit con Enter en campo contraseña dispara login", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: "u1" }, session: {} },
      error: null,
    });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    fireEvent.change(screen.getByPlaceholderText("tu@email.com"), {
      target: { value: "a@b.com" },
    });
    const passInput = screen.getByPlaceholderText("Tu contraseña");
    fireEvent.change(passInput, { target: { value: "pass123" } });
    fireEvent.keyDown(passInput, { key: "Enter" });

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledOnce();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. TorneosAuthScreen — formulario de registro
// ─────────────────────────────────────────────────────────────────────────────

describe("TorneosAuthScreen — formulario de registro", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    setupNoSession();
    renderApp();
    await waitFor(() => screen.getByText("ALTTEZ Torneos"));
    // Cambiar a tab registro
    fireEvent.click(screen.getByRole("button", { name: /registrarse/i }));
  });

  it("solo requiere nombre + email + password (no entrenador ni categorias)", () => {
    // El form de torneos NO tiene campo entrenador ni categorias
    expect(screen.queryByPlaceholderText(/director técnico/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/categoría/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ej: Liga Norte")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("tu@email.com")).toBeInTheDocument();
  });

  it("no muestra selector de rol (torneos siempre admin)", () => {
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("envía signUp con role='admin' hardcodeado", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: "u2" }, session: { access_token: "tok" } },
      error: null,
    });

    fireEvent.change(screen.getByPlaceholderText("Ej: Liga Norte"), {
      target: { value: "Liga Norte" },
    });
    fireEvent.change(screen.getByPlaceholderText("tu@email.com"), {
      target: { value: "liga@norte.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Mínimo 6 caracteres"), {
      target: { value: "pass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "liga@norte.com",
        password: "pass123",
        options: {
          data: { full_name: "Liga Norte", role: "admin" },
        },
      });
    });
  });

  it("tras registro exitoso entra directo a la app sin pantalla intermedia", async () => {
    mockSignUp.mockImplementationOnce(async () => {
      triggerAuth({ id: "u1", email: "mi@liga.com" });
      return {
        data: { user: { id: "u1", email: "mi@liga.com" }, session: { access_token: "tok" } },
        error: null,
      };
    });

    fireEvent.change(screen.getByPlaceholderText("Ej: Liga Norte"), {
      target: { value: "Mi Liga" },
    });
    fireEvent.change(screen.getByPlaceholderText("tu@email.com"), {
      target: { value: "mi@liga.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Mínimo 6 caracteres"), {
      target: { value: "pass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    // App completa renderiza (InicioPage), sin "Revisa tu correo"
    await waitFor(() => {
      expect(screen.getByTestId("inicio-page")).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(screen.queryByText(/revisa tu correo/i)).not.toBeInTheDocument();
  });

  it("si signUp no devuelve sesión, hace signIn inmediato y entra directo", async () => {
    // 1. signUp retorna user pero sin session
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: "u2", email: "mi@liga.com" }, session: null },
      error: null,
    });
    // 2. AuthProvider intentará signIn inmediatamente
    mockSignInWithPassword.mockImplementationOnce(async () => {
      triggerAuth({ id: "u2", email: "mi@liga.com" });
      return {
        data: { user: { id: "u2", email: "mi@liga.com" }, session: { access_token: "tok" } },
        error: null,
      };
    });

    fireEvent.change(screen.getByPlaceholderText("Ej: Liga Norte"), {
      target: { value: "Mi Liga" },
    });
    fireEvent.change(screen.getByPlaceholderText("tu@email.com"), {
      target: { value: "mi@liga.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Mínimo 6 caracteres"), {
      target: { value: "pass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalled();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByTestId("inicio-page")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("muestra error si signUp falla (email duplicado)", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: {},
      error: { message: "User already registered", code: null },
    });

    fireEvent.change(screen.getByPlaceholderText("Ej: Liga Norte"), {
      target: { value: "Liga Norte" },
    });
    fireEvent.change(screen.getByPlaceholderText("tu@email.com"), {
      target: { value: "dup@b.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Mínimo 6 caracteres"), {
      target: { value: "pass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(screen.getByText("Ya existe una cuenta con ese email")).toBeInTheDocument();
    });
  });

  it("valida que password tenga mínimo 6 caracteres antes de llamar signUp", async () => {
    fireEvent.change(screen.getByPlaceholderText("Ej: Liga Norte"), {
      target: { value: "Liga Norte" },
    });
    fireEvent.change(screen.getByPlaceholderText("tu@email.com"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Mínimo 6 caracteres"), {
      target: { value: "123" }, // muy corto
    });
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(screen.getByText("Mínimo 6 caracteres")).toBeInTheDocument();
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });
});
