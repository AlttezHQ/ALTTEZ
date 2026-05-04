import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calcularPosiciones } from "../utils/fixturesEngine";

/**
 * @typedef {Object} Torneo
 * @property {string} id
 * @property {string} nombre
 * @property {string} deporte
 * @property {"todos_contra_todos"|"eliminacion"|"grupos_playoffs"} formato
 * @property {"borrador"|"activo"|"finalizado"} estado
 * @property {string} fechaInicio
 * @property {string|null} fechaFin
 * @property {string} slug
 * @property {number} numGrupos
 * @property {boolean} publicado
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Equipo
 * @property {string} id
 * @property {string} torneoId
 * @property {string} nombre
 * @property {string|null} escudo
 * @property {string|null} color
 * @property {string|null} grupo
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Partido
 * @property {string} id
 * @property {string} torneoId
 * @property {"grupos"|"octavos"|"cuartos"|"semis"|"final"|"tercer_puesto"} fase
 * @property {number} ronda
 * @property {string|null} grupo
 * @property {string|null} equipoLocalId
 * @property {string|null} equipoVisitaId
 * @property {number|null} golesLocal
 * @property {number|null} golesVisita
 * @property {"programado"|"en_curso"|"finalizado"} estado
 * @property {string|null} fechaHora
 * @property {string|null} lugar
 * @property {number} orden
 * @property {string} createdAt
 */

const ID = () => crypto.randomUUID();
const NOW = () => new Date().toISOString();

const FORMAT_MAP = {
  "Todos contra todos": "todos_contra_todos",
  "Eliminación directa": "eliminacion",
  "Grupos + Playoffs": "grupos_playoffs",
  "Mixto": "grupos_playoffs",
};

export const useTorneosStore = create(
  persist(
    (set, get) => ({
      torneos: [],
      equipos: [],
      partidos: [],
      torneoActivoId: null,
      wizardDraft: null,

      // ── Torneos ──────────────────────────────────────────────────────────

      crearTorneo(data) {
        const formato = FORMAT_MAP[data.formato] ?? data.formato ?? "todos_contra_todos";
        const torneo = {
          id: ID(),
          nombre: data.nombre || "Sin nombre",
          deporte: data.deporte || "Fútbol",
          formato,
          estado: "borrador",
          fechaInicio: data.fecha || null,
          fechaFin: null,
          slug: generarSlug(data.nombre || "torneo"),
          numGrupos: data.numGrupos || 2,
          publicado: false,
          createdAt: NOW(),
          updatedAt: NOW(),
        };
        set(s => ({ torneos: [...s.torneos, torneo], torneoActivoId: torneo.id }));
        return torneo;
      },

      actualizarTorneo(id, patch) {
        set(s => ({
          torneos: s.torneos.map(t => t.id === id ? { ...t, ...patch, updatedAt: NOW() } : t),
        }));
      },

      eliminarTorneo(id) {
        set(s => ({
          torneos:  s.torneos.filter(t => t.id !== id),
          equipos:  s.equipos.filter(e => e.torneoId !== id),
          partidos: s.partidos.filter(p => p.torneoId !== id),
          torneoActivoId: s.torneoActivoId === id ? null : s.torneoActivoId,
        }));
      },

      setTorneoActivo(id) {
        set({ torneoActivoId: id });
      },

      publicarTorneo(id) {
        set(s => ({
          torneos: s.torneos.map(t =>
            t.id === id ? { ...t, estado: "activo", publicado: true, updatedAt: NOW() } : t
          ),
        }));
      },

      // ── Equipos ──────────────────────────────────────────────────────────

      agregarEquipo(torneoId, data) {
        const equipo = {
          id: ID(),
          torneoId,
          nombre: data.nombre || "Equipo",
          escudo: data.escudo ?? null,
          color: data.color ?? null,
          grupo: data.grupo ?? null,
          createdAt: NOW(),
        };
        set(s => ({ equipos: [...s.equipos, equipo] }));
        return equipo;
      },

      agregarEquipos(torneoId, nombres) {
        const nuevos = nombres
          .map(n => n.trim())
          .filter(Boolean)
          .map(nombre => ({
            id: ID(), torneoId, nombre,
            escudo: null, color: null, grupo: null, createdAt: NOW(),
          }));
        set(s => ({ equipos: [...s.equipos, ...nuevos] }));
        return nuevos;
      },

      actualizarEquipo(id, patch) {
        set(s => ({ equipos: s.equipos.map(e => e.id === id ? { ...e, ...patch } : e) }));
      },

      eliminarEquipo(id) {
        set(s => ({ equipos: s.equipos.filter(e => e.id !== id) }));
      },

      asignarGrupo(equipoId, grupo) {
        set(s => ({ equipos: s.equipos.map(e => e.id === equipoId ? { ...e, grupo } : e) }));
      },

      // ── Partidos ─────────────────────────────────────────────────────────

      setPartidos(torneoId, partidos) {
        set(s => ({
          partidos: [
            ...s.partidos.filter(p => p.torneoId !== torneoId),
            ...partidos,
          ],
        }));
      },

      registrarResultado(partidoId, golesLocal, golesVisita) {
        set(s => ({
          partidos: s.partidos.map(p =>
            p.id === partidoId
              ? { ...p, golesLocal, golesVisita, estado: "finalizado" }
              : p
          ),
        }));
      },

      actualizarPartido(id, patch) {
        set(s => ({ partidos: s.partidos.map(p => p.id === id ? { ...p, ...patch } : p) }));
      },

      // ── Wizard draft ─────────────────────────────────────────────────────

      setWizardDraft(data) {
        set(s => ({ wizardDraft: { ...s.wizardDraft, ...data } }));
      },

      clearWizardDraft() {
        set({ wizardDraft: null });
      },

      // ── Selectores ───────────────────────────────────────────────────────

      getTorneoById(id) {
        return get().torneos.find(t => t.id === id) ?? null;
      },

      getEquiposByTorneo(torneoId) {
        return get().equipos.filter(e => e.torneoId === torneoId);
      },

      getPartidosByTorneo(torneoId) {
        return get().partidos.filter(p => p.torneoId === torneoId);
      },

      getPartidosByFase(torneoId, fase) {
        return get().partidos.filter(p => p.torneoId === torneoId && p.fase === fase);
      },

      getPartidosByGrupo(torneoId, grupo) {
        return get().partidos.filter(p => p.torneoId === torneoId && p.grupo === grupo);
      },

      getPosicionesByTorneo(torneoId) {
        const partidos = get().partidos.filter(p => p.torneoId === torneoId);
        const equipos  = get().equipos.filter(e => e.torneoId === torneoId);
        return calcularPosiciones(partidos, equipos);
      },

      getTorneoActivo() {
        const id = get().torneoActivoId;
        return id ? get().torneos.find(t => t.id === id) ?? null : null;
      },
    }),
    { name: "alttez-torneos-store" }
  )
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function generarSlug(nombre) {
  const base = nombre.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "torneo";
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}
