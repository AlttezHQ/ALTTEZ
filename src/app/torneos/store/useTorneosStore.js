import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calcularPosiciones } from "../utils/fixturesEngine";
import { autoSchedule } from "../utils/schedulingEngine";
import * as svc from "../services/torneosService";
import { showToast } from "../../../shared/ui/Toast";

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
      loading:        false,
      error:          null,

      // ── Torneos ──────────────────────────────────────────────────────────

      async crearTorneo(data) {
        const formato = FORMAT_MAP[data.formato] ?? data.formato ?? "todos_contra_todos";
        const torneo = {
          id: ID(),
          nombre:     data.nombre  || "Sin nombre",
          deporte:    data.deporte || "Fútbol",
          formato,
          estado:     "borrador",
          fechaInicio: data.fecha  || null,
          fechaFin:    data.fechaFin || null,
          slug:        generarSlug(data.nombre || "torneo"),
          numGrupos:   data.numGrupos || 2,
          publicado:   false,
          descripcion: "",
          portada:     null,
          perfil:      null,
          contacto:    "",
          premios:     "",
          patrocinadores: [], // [{ id, nombre, logo }]
          visibilidad: "publico", // publico | privado
          reglamentoUrl: null,
          seguidoresCount: 0,
          vistasCount: 0,
          schedulingConfig: { ...DEFAULT_SCHEDULING },
          createdAt:   NOW(),
          updatedAt:   NOW(),
        };
        set(s => ({ torneos: [...s.torneos, torneo], torneoActivoId: torneo.id }));
        await svc.saveTorneo(torneo);
        return torneo;
      },

      async actualizarTorneo(id, patch) {
        const s = get();
        const t = s.torneos.find(x => x.id === id);
        if (!t) return;
        
        const updated = { ...t, ...patch, updatedAt: NOW() };
        set(state => ({
          torneos: state.torneos.map(x => x.id === id ? updated : x),
        }));
        await svc.saveTorneo(updated);
      },

      async eliminarTorneo(id) {
        set(s => ({
          torneos:   s.torneos.filter(t => t.id !== id),
          equipos:   s.equipos.filter(e => e.torneoId !== id),
          partidos:  s.partidos.filter(p => p.torneoId !== id),
          sedes:     s.sedes.filter(se => se.torneoId !== id),
          arbitros:  s.arbitros.filter(a => a.torneoId !== id),
          torneoActivoId: s.torneoActivoId === id ? null : s.torneoActivoId,
        }));
        await svc.deleteTorneoRemote(id);
      },

      setTorneoActivo(id) {
        set({ torneoActivoId: id });
      },

      async publicarTorneo(id) {
        set(s => ({
          torneos: s.torneos.map(t =>
            t.id === id ? { ...t, estado: "activo", publicado: true, updatedAt: NOW() } : t
          ),
        }));
        const t = get().torneos.find(x => x.id === id);
        if (t) await svc.saveTorneo(t);
      },

      async actualizarSchedulingConfig(torneoId, patch) {
        set(s => ({
          torneos: s.torneos.map(t =>
            t.id === torneoId
              ? { ...t, schedulingConfig: { ...t.schedulingConfig, ...patch }, updatedAt: NOW() }
              : t
          ),
        }));
        const t = get().torneos.find(x => x.id === torneoId);
        if (t) await svc.saveTorneo(t);
      },

      // ── Sedes ────────────────────────────────────────────────────────────

      async agregarSede(torneoId, { nombre, direccion = "" }) {
        const sede = { id: ID(), torneoId, nombre, direccion, createdAt: NOW() };
        set(s => ({ sedes: [...s.sedes, sede] }));
        await svc.saveSedes(torneoId, get().sedes.filter(se => se.torneoId === torneoId));
        return sede;
      },

      async eliminarSede(sedeId) {
        const s = get();
        const sede = s.sedes.find(x => x.id === sedeId);
        if (!sede) return;
        set(state => ({ sedes: state.sedes.filter(se => se.id !== sedeId) }));
        await svc.deleteSedeRemote(sedeId);
      },

      // ── Árbitros ─────────────────────────────────────────────────────────

      async agregarArbitro(torneoId, { nombre, contacto = "" }) {
        const arbitro = { id: ID(), torneoId, nombre, contacto, createdAt: NOW() };
        set(s => ({ arbitros: [...s.arbitros, arbitro] }));
        await svc.saveArbitros(torneoId, get().arbitros.filter(a => a.torneoId === torneoId));
        return arbitro;
      },

      async eliminarArbitro(arbitroId) {
        const s = get();
        const arbitro = s.arbitros.find(x => x.id === arbitroId);
        if (!arbitro) return;
        set(state => ({ arbitros: state.arbitros.filter(a => a.id !== arbitroId) }));
        await svc.deleteArbitroRemote(arbitroId);
      },

      // ── Equipos ──────────────────────────────────────────────────────────

      async agregarEquipo(torneoId, data) {
        const equipo = {
          id: ID(), torneoId,
          nombre: data.nombre || "Equipo",
          logo:   data.logo || data.escudo || null,
          escudo: data.logo || data.escudo || null,
          color:  data.color  ?? null,
          grupo:  data.grupo  ?? null,
          delegado: data.delegado ?? "",
          entrenador: data.entrenador ?? "",
          jugadores: data.jugadores ?? [],
          createdAt: NOW(),
        };
        set(s => ({ equipos: [...s.equipos, equipo] }));
        const { ok, error } = await svc.saveEquipos(torneoId, [equipo]);
        if (!ok) showToast("Error al guardar en la nube: " + (error?.message || "Servidor no responde"), "error");
        return equipo;
      },

      async agregarEquipos(torneoId, nombres) {
        const nuevos = nombres
          .map(n => n.trim()).filter(Boolean)
          .map(nombre => ({
            id: ID(), torneoId, nombre,
            logo: null, escudo: null, color: null, grupo: null, 
            delegado: "", entrenador: "", jugadores: [], 
            createdAt: NOW(),
          }));
        set(s => ({ equipos: [...s.equipos, ...nuevos] }));
        await svc.saveEquipos(torneoId, nuevos);
        return nuevos;
      },

      async actualizarEquipo(id, patch) {
        let torneoId = null;
        set(s => ({
          equipos: s.equipos.map(e => {
            if (e.id === id) {
              torneoId = e.torneoId;
              return { ...e, ...patch };
            }
            return e;
          })
        }));
        if (torneoId) {
          const { ok, error } = await svc.saveEquipos(torneoId, get().equipos.filter(e => e.torneoId === torneoId));
          if (!ok) showToast("Error al sincronizar cambios: " + (error?.message || "Inténtalo de nuevo"), "error");
        }
      },

      async eliminarEquipo(id) {
        const s = get();
        const eq = s.equipos.find(x => x.id === id);
        if (!eq) return;
        set(state => ({ equipos: state.equipos.filter(e => e.id !== id) }));
        await svc.deleteEquipoRemote(id);
      },

      async asignarGrupo(equipoId, grupo) {
        await get().actualizarEquipo(equipoId, { grupo });
      },

      // ── Partidos ─────────────────────────────────────────────────────────

      async setPartidos(torneoId, partidos) {
        set(s => ({
          partidos: [
            ...s.partidos.filter(p => p.torneoId !== torneoId),
            ...partidos,
          ],
        }));
        await svc.savePartidos(torneoId, partidos);
      },

      async registrarResultado(partidoId, golesLocal, golesVisita) {
        let torneoId = null;
        set(s => {
          const updated = s.partidos.map(p => {
            if (p.id === partidoId) {
              torneoId = p.torneoId;
              return { ...p, golesLocal, golesVisita, estado: "finalizado" };
            }
            return p;
          });
          return { partidos: updated };
        });
        if (torneoId) {
          const torneoPartidos = get().partidos.filter(p => p.torneoId === torneoId);
          await svc.savePartidos(torneoId, torneoPartidos);
        }
      },

      async actualizarPartido(id, patch) {
        let torneoId = null;
        set(s => {
          const updated = s.partidos.map(p => {
            if (p.id === id) {
              torneoId = p.torneoId;
              return { ...p, ...patch };
            }
            return p;
          });
          return { partidos: updated };
        });
        if (torneoId) {
          const torneoPartidos = get().partidos.filter(p => p.torneoId === torneoId);
          await svc.savePartidos(torneoId, torneoPartidos);
        }
      },

      async reprogramarPartido(partidoId) {
        const s = get();
        const partido = s.partidos.find(p => p.id === partidoId);
        if (!partido) return false;

        const torneoId = partido.torneoId;
        const partidoFuturo = s.partidos.find(p => p.torneoId === torneoId && p.ronda > partido.ronda && p.estado === "propuesto");
        
        const updatedPartidos = s.partidos.map(p => {
          if (p.id === partidoId) {
            return { ...p, estado: "aplazado", fechaHora: null, ronda: partidoFuturo ? partidoFuturo.ronda : p.ronda };
          }
          if (partidoFuturo && p.id === partidoFuturo.id) {
            return { ...p, fechaHora: partido.fechaHora, ronda: partido.ronda, estado: "propuesto" };
          }
          return p;
        });

        set({ partidos: updatedPartidos });
        const torneoPartidos = updatedPartidos.filter(p => p.torneoId === torneoId);
        await svc.savePartidos(torneoId, torneoPartidos);
        return !!partidoFuturo;
      },

      async reprogramarPartidoAvanzado(partidoOriginalId, partidoReemplazoId) {
        const s = get();
        const original = s.partidos.find(p => p.id === partidoOriginalId);
        const reemplazo = s.partidos.find(p => p.id === partidoReemplazoId);
        if (!original || !reemplazo) return false;

        const torneoId = original.torneoId;
        const updatedPartidos = s.partidos.map(p => {
          if (p.id === partidoOriginalId) {
            return { ...p, estado: "aplazado", fechaHora: null };
          }
          if (p.id === partidoReemplazoId) {
            return { ...p, estado: "programado", fechaHora: original.fechaHora, sedeId: original.sedeId, arbitroId: original.arbitroId };
          }
          return p;
        });

        set({ partidos: updatedPartidos });
        const torneoPartidos = updatedPartidos.filter(p => p.torneoId === torneoId);
        await svc.savePartidos(torneoId, torneoPartidos);
        return true;
      },

      async autoSchedulePartidos(torneoId) {
        const s        = get();
        const torneo   = s.torneos.find(t => t.id === torneoId);
        if (!torneo) return;

        const partidos = s.partidos.filter(p => p.torneoId === torneoId);
        const equipos  = s.equipos.filter(e => e.torneoId === torneoId);
        const sedes    = s.sedes.filter(se => se.torneoId === torneoId);
        const arbitros = s.arbitros.filter(a => a.torneoId === torneoId);

        const patches = autoSchedule({ partidos, equipos, sedes, arbitros, torneo });

        const updatedPartidos = s.partidos.map(p => {
          const patch = patches.find(pt => pt.id === p.id);
          return patch ? { ...p, ...patch, estado: "propuesto" } : p;
        });

        set({ partidos: updatedPartidos });
        
        // Sync the updated ones of this tournament
        const torneoPartidos = updatedPartidos.filter(p => p.torneoId === torneoId);
        await svc.savePartidos(torneoId, torneoPartidos);

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

      async loadTorneosFromSupabase() {
        set({ loading: true, error: null });
        try {
          const results = await svc.fetchAllTorneos();
          const allTorneos = results.map(r => r.torneo);
          const allEquipos = results.flatMap(r => r.equipos);
          const allPartidos = results.flatMap(r => r.partidos);
          const allSedes    = results.flatMap(r => r.sedes);
          const allArbitros = results.flatMap(r => r.arbitros);
          
          set({ 
            torneos: allTorneos, 
            equipos: allEquipos, 
            partidos: allPartidos,
            sedes: allSedes,
            arbitros: allArbitros,
            loading: false 
          });
        } catch (err) {
          set({ error: err.message, loading: false });
        }
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
