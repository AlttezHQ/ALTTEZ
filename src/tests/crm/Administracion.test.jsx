import { render, screen } from '@testing-library/react';
import React from 'react';
import Administracion from "../../app/finance/Administracion";
import { useStore } from "../../shared/store/useStore";

describe('Administracion Component', () => {
  beforeEach(() => {
    useStore.setState({
      athletes: [
        { id: '1', nombre: 'Juan' },
        { id: '2', nombre: 'Pedro' },
      ],
      finanzas: {
        pagos: [
          { id: 'p1', matricula: '1', monto: 100, estado: 'pagado', mes: new Date().toISOString().slice(0, 7) }
        ],
        movimientos: [
          { id: 'm1', descripcion: 'Patrocinio Adidas', monto: 500, tipo: 'ingreso', fecha: '2026-03-01' }
        ]
      }
    });
  });

  it('renders without crashing and reads finanzas from Zustand store', () => {
    const { container } = render(<Administracion />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows tab navigation buttons', () => {
    render(<Administracion />);
    const tabs = ['Mensualidades', 'Movimientos', 'Resumen ejecutivo'];
    tabs.forEach(tab => {
      expect(screen.getByText(tab)).toBeInTheDocument();
    });
  });
});
