import { render, screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from "../../shared/auth/LandingPage";

const renderWithRouter = (ui) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('LandingPage Component', () => {
  it('renders landing step with both product cards', () => {
    renderWithRouter(
      <LandingPage onRegister={vi.fn()} onLogin={vi.fn()} />
    );
    expect(screen.getByText('Gestionar clubes')).toBeInTheDocument();
    expect(screen.getByText('Gestionar torneos')).toBeInTheDocument();
  });

  it('shows register form when "Registrar club" is clicked', () => {
    renderWithRouter(
      <LandingPage onRegister={vi.fn()} onLogin={vi.fn()} />
    );
    fireEvent.click(screen.getByRole('button', { name: /registrar club/i }));
    expect(screen.getByText('Registrar club', { selector: 'div' })).toBeInTheDocument();
  });

  it('renders Iniciar sesión button in Clubes card', () => {
    renderWithRouter(
      <LandingPage onRegister={vi.fn()} onLogin={vi.fn()} />
    );
    // Buscar el card de Clubes por su texto característico y luego el botón dentro de él
    const clubesCard = screen.getByText('Gestionar clubes').closest('div');
    expect(within(clubesCard).getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });
});
