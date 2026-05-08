import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider } from "../../shared/auth";
import LandingPage from "../../shared/auth/LandingPage";

// ── Mocks ───────────────────────────────────────────────────────────────────

const { mockGetUser, mockOnAuthStateChange } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockOnAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
}));

vi.mock("../../shared/lib/supabase", () => ({
  isSupabaseReady: true,
  supabase: {
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));

vi.mock("framer-motion", () => {
  const motion = {};
  ["div", "button", "span"].forEach((tag) => {
    motion[tag] = ({ children, ...rest }) => React.createElement(tag, rest, children);
  });
  return { motion, AnimatePresence: ({ children }) => children };
});

// ── Test Setup ──────────────────────────────────────────────────────────────

const renderWithAuth = (ui) =>
  render(
    <MemoryRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </MemoryRouter>
  );

describe('LandingPage Modular Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null } });
  });

  it('renders landing step with Clubes and Torneos cards', async () => {
    renderWithAuth(<LandingPage />);
    
    // Esperamos a que el AuthProvider termine el bootstrap
    await waitFor(() => {
      expect(screen.getByText('Gestionar clubes')).toBeInTheDocument();
      expect(screen.getByText('Gestionar torneos')).toBeInTheDocument();
    });
  });

  it('navigates to register form when "Registrar club" is clicked', async () => {
    renderWithAuth(<LandingPage />);
    
    await waitFor(() => screen.getByRole('button', { name: /registrar club/i }));
    fireEvent.click(screen.getByRole('button', { name: /registrar club/i }));
    
    expect(screen.getByText('Registrar club', { selector: 'div' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: Águilas del Lucero')).toBeInTheDocument();
  });

  it('navigates to login form when "Login" is clicked in any card', async () => {
    renderWithAuth(<LandingPage />);
    
    await waitFor(() => screen.getAllByRole('button', { name: /login/i }));
    const loginButtons = screen.getAllByRole('button', { name: /login/i });
    
    fireEvent.click(loginButtons[0]);
    
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
  });

  it('allows going back to landing step from login', async () => {
    renderWithAuth(<LandingPage />);
    
    await waitFor(() => screen.getAllByRole('button', { name: /login/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /login/i })[0]);
    
    const backBtn = screen.getByText(/volver/i);
    fireEvent.click(backBtn);
    
    expect(screen.getByText('Gestionar clubes')).toBeInTheDocument();
  });
});
