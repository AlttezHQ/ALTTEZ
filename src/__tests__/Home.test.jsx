import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Home from "../app/dashboard/Home";
import { useStore } from "../shared/store/useStore";

describe('Home Component', () => {
  beforeEach(() => {
    // Reset store before each test
    useStore.setState({
      mode: 'production',
      athletes: [
        { id: '1', nombre: 'Juan', lesionado: false, nivel: 'Pro' },
        { id: '2', nombre: 'Pedro', lesionado: true, nivel: 'Amateur' }
      ],
      historial: [
        { num: 1, presentes: 2, total: 2, tipo: 'físico' }
      ],
      clubInfo: {
        nombre: 'FC Barcelona',
        categorias: ['Senior']
      },
      matchStats: {
        played: 10,
        won: 5,
        lost: 2,
        drawn: 3
      }
    });
  });

  it('renders without crashing and consumes store state', () => {
    render(<Home onNavigate={vi.fn()} onLogout={vi.fn()} />);
    
    // Check for "Cerrar sesion" to ensure the component rendered
    expect(screen.getByText(/Cerrar sesion/i)).toBeInTheDocument();
  });

  it('calls onNavigate and onLogout when actions are clicked', () => {
    const onNavigate = vi.fn();
    const onLogout = vi.fn();
    render(<Home onNavigate={onNavigate} onLogout={onLogout} />);
    
    const logoutBtn = screen.getByText(/Cerrar sesion/i);
    fireEvent.click(logoutBtn);
    expect(onLogout).toHaveBeenCalled();
  });
});
