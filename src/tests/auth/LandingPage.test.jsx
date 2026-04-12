import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from "../../shared/auth/LandingPage";

// LandingPage usa useNavigate → necesita un Router provider
const renderWithRouter = (ui) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('LandingPage Component', () => {
  it('renders landing step with both action cards', () => {
    renderWithRouter(
      <LandingPage onDemo={vi.fn()} onRegister={vi.fn()} onLogin={vi.fn()} />
    );
    expect(screen.getByText('Explorar Demo')).toBeInTheDocument();
    expect(screen.getByText('Registrar Club')).toBeInTheDocument();
  });

  it('calls onDemo when the demo button is clicked', () => {
    const onDemo = vi.fn();
    renderWithRouter(
      <LandingPage onDemo={onDemo} onRegister={vi.fn()} onLogin={vi.fn()} />
    );
    fireEvent.click(screen.getByText('Explorar Demo'));
    expect(onDemo).toHaveBeenCalledTimes(1);
  });

  it('navigates to register step when "Registrar Club" is clicked', () => {
    renderWithRouter(
      <LandingPage onDemo={vi.fn()} onRegister={vi.fn()} onLogin={vi.fn()} />
    );
    fireEvent.click(screen.getByText('Registrar Club'));
    // After click, register form should appear
    expect(screen.getByText('Incorporar tu club')).toBeInTheDocument();
  });
});
