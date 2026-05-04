import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calcularPosiciones } from "../utils/fixturesEngine";
import { autoSchedule } from "../utils/schedulingEngine";

const ID  = () => crypto.randomUUID();
const NOW = () => new Date().toISOString();

const DEFAULT_SCHEDULING = {
  diasDisponibles: [6, 0],
  horaInicio:  "10:00",
  horaFin:     "22:00",
  duracionMin:  90,
  descansoDias: 2,
  maxPartidosDia: 3,
};

const FORMAT_MAP = {
  "Todos contra todos": "todos_contra_todos",
  "Eliminación directa": "eliminacion",
  "Grupos + Playoffs":   "grupos_playoffs",
  "Mixto":               "grupos_playoffs",
};

export const useTorneosStore = create(
  persist(
    (set, get) => ({
      torneos:  [],
      equipos:  [],
      partidos: [],
      sedes:    [],
      arbitros: [],
      torneoActivoId: null,
      wizardDraft:    null,

      // ── Torneos ──────────────────────────────────────────────────────────

      crearTorneo(data) {
        const formato = FORMAT_MAP[data.formato] ?? data.formato ?? "todos_contra_todos";
        const torneo = {
          id: ID(),
          nombre:     data.nombre  || "Sin nombre",
          deporte:    data.deporte || "Fútbol",
          formato,
          estado:     "borrador",
          fechaInicio: data.fecha  || null,
          fechaFin:    null,
          slug:        generarSlug(data.nombre || "torneo"),
          numGrupos:   data.numGrupos || 2,
          publicado:   false,
          schedulingConfig: { ...DEFAULT_SCHEDULING },
          createdAt:   NOW(),
          updatedAt:   NOW(),
        };
        set(s => ({ torneos: [...s.torneos, torneo], torneoActivoId: torneo.id }));
        return torneo;
      },

      actualizarTorneo(id, patch) {
        set(s => ({
          torneos: s.torneos.map(t =>
            t.id === id ? { ...t, ...patch, updatedAt: NOW() } : t
          ),
        }));
      },

      eliminarTorneo(id) {
        set(s => ({
          torneos:   s.torneos.filter(t => t.id !== id),
          equipos:   s.equipos.filter(e => e.torneoId !== id),
          partidos:  s.partidos.filter(p => p.torneoId !== id),
          sedes:     s.sedes.filter(se => se.torneoId !== id),
          arbitros:  s.arbitros.filter(a => a.torneoId !== id),
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

      actualizarSchedulingConfig(torneoId, patch) {
        set(s => ({
          torneos: s.torneos.map(t =>
            t.id === torneoId
              ? { ...t, schedulingConfig: { ...t.schedulingConfig, ...patch }, updatedAt: NOW() }
              : t
          ),
        }));
      },

      // ── Sedes ────────────────────────────────────────────────────────────

      agregarSede(torneoId, { nombre, direccion = "" }) {
        const sede = { id: ID(), torneoId, nombre, direccion, createdAt: NOW() };
        set(s => ({ sedes: [...s.sedes, sede] }));
        return sede;
      },

      eliminarSede(sedeId) {
        set(s => ({ sedes: s.sedes.filter(se => se.id !== sedeId) }));
      },

      // ── Árbitros ─────────────────────────────────────────────────────────

      agregarArbitro(torneoId, { nombre, contacto = "" }) {
        const arbitro = { id: ID(), torneoId, nombre, contacto, createdAt: NOW() };
        set(s => ({ arbitros: [...s.arbitros, arbitro] }));
        return arbitro;
      },

      eliminarArbitro(arbitroId) {
        set(s => ({ arbitros: s.arbitros.filter(a => a.id !== arbitroId) }));
      },

      // ── Equipos ──────────────────────────────────────────────────────────

      agregarEquipo(torneoId, data) {
        const equipo = {
          id: ID(), torneoId,
          nombre: data.nombre || "Equipo",
          escudo: data.escudo ?? null,
          color:  data.color  ?? null,
          grupo:  data.grupo  ?? null,
          createdAt: NOW(),
        };
        set(s => ({ equipos: [...s.equipos, equipo] }));
        return equipo;
      },

      agregarEquipos(torneoId, nombres) {
        const nuevos = nombres
          .map(n => n.trim()).filter(Boolean)
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

      autoSchedulePartidos(torneoId) {
        const s        = get();
        const torneo   = s.torneos.find(t => t.id === torneoId);
        if (!torneo) return;

        const partidos = s.partidos.filter(p => p.torneoId === torneoId);
        const equipos  = s.equipos.filter(e => e.torneoId === torneoId);
        const sedes    = s.sedes.filter(se => se.torneoId === torneoId);
        const arbitros = s.arbitros.filter(a => a.torneoId === torneoId);

        const patches = autoSchedule({ partidos, equipos, sedes, arbitros, torneo });

        set(s2 => ({
          partidos: s2.partidos.map(p => {
            const patch = patches.find(pt => pt.id === p.id);
            return patch ? { ...p, ...patch } : p;
          }),
        }));

        return patches.length;
      },

      // ── Wizard draft ─────────────────────────────────────────────────────

      setWizardDraft(data) {
        set(s => ({ wizardDraft: { ...s.wizardDraft, ...data } }));
      },

      clearWizardDraft() {
        set({ wizardDraft: null });
      },

      // ── Selectors ────────────────────────────────────────────────────────

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

      getSedesByTorneo(torneoId) {
        return get().sedes.filter(s => s.torneoId === torneoId);
      },

      getArbitrosByTorneo(torneoId) {
        return get().arbitros.filter(a => a.torneoId === torneoId);
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
