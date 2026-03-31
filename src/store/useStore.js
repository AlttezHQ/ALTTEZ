import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  EMPTY_ATHLETES,
  EMPTY_HISTORIAL,
  EMPTY_MATCH_STATS,
  EMPTY_FINANZAS,
} from '../constants/initialStates';

// Una clave segura (relativa) para detectar manipulacion basica offline
const SECURITY_SALT = "elevate_secure_salt_89231";

function secureHash(obj) {
  const str = JSON.stringify(obj || {});
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

const customStorage = {
  getItem: (name) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    try {
      const parsed = JSON.parse(str);
      // Validar integridad
      if (parsed.state) {
        const { _checksum, ...restState } = parsed.state;
        const expectedChecksum = secureHash({ ...restState, salt: SECURITY_SALT });
        if (_checksum && _checksum !== expectedChecksum) {
          console.error("Local storage integrity check failed. Forcing logout.");
          window.location.href = "/"; // redirect o fallback
          return null; // Corrupto, ignorar
        }
      }
      return parsed;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    const stateVal = value.state || {};
    const { _checksum, ...restState } = stateVal;
    const newChecksum = secureHash({ ...restState, salt: SECURITY_SALT });
    const secureValue = {
      ...value,
      state: {
        ...restState,
        _checksum: newChecksum
      }
    };
    localStorage.setItem(name, JSON.stringify(secureValue));
  },
  removeItem: (name) => localStorage.removeItem(name),
};

export const useStore = create(
  persist(
    (set) => ({
      mode: null,
      session: null,
      activeModule: "home",
      athletes: EMPTY_ATHLETES,
      historial: EMPTY_HISTORIAL,
      clubInfo: { nombre:"", disciplina:"", ciudad:"", entrenador:"", temporada:"", categorias:[], campos:[], descripcion:"", telefono:"", email:"" },
      matchStats: EMPTY_MATCH_STATS,
      finanzas: EMPTY_FINANZAS,
      _checksum: null,

      setMode: (mode) => set({ mode }),
      setSession: (session) => set({ session }),
      setActiveModule: (activeModule) => set({ activeModule }),
      setAthletes: (athletes) => {
        set((state) => ({ 
          athletes: typeof athletes === 'function' ? athletes(state.athletes) : athletes 
        }));
      },
      setHistorial: (historial) => {
        set((state) => ({ 
          historial: typeof historial === 'function' ? historial(state.historial) : historial 
        }));
      },
      setClubInfo: (clubInfo) => {
        set((state) => ({ 
          clubInfo: typeof clubInfo === 'function' ? clubInfo(state.clubInfo) : clubInfo 
        }));
      },
      setMatchStats: (matchStats) => {
        set((state) => ({ 
          matchStats: typeof matchStats === 'function' ? matchStats(state.matchStats) : matchStats 
        }));
      },
      setFinanzas: (finanzas) => {
        set((state) => ({ 
          finanzas: typeof finanzas === 'function' ? finanzas(state.finanzas) : finanzas 
        }));
      },
      clearStore: () => set({
        mode: null,
        session: null,
        activeModule: "home",
        athletes: EMPTY_ATHLETES,
        historial: EMPTY_HISTORIAL,
        clubInfo: { nombre:"", disciplina:"", ciudad:"", entrenador:"", temporada:"", categorias:[], campos:[], descripcion:"", telefono:"", email:"" },
        matchStats: EMPTY_MATCH_STATS,
        finanzas: EMPTY_FINANZAS,
      })
    }),
    {
      name: 'elevate-store',
      storage: createJSONStorage(() => customStorage),
      // No omitimos campos ya que validamos la firma de todo el state
    }
  )
);
