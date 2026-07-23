import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createBracketSeededEvent,
  createRoundAdvancedEvent,
  createTiebreakerAppliedEvent,
  DEFAULT_POINTS_CONFIG,
  DEFAULT_TIEBREAKERS,
} from "../utils/competitionEngine";
import {
  selectTorneoById,
  selectEquiposByTorneo,
  selectPartidosByTorneo,
  selectPartidosByFase,
  selectPartidosByGrupo,
  selectSedesByTorneo,
  selectArbitrosByTorneo,
  selectCategoriasByTorneo,
  selectTorneoActivo,
  selectPosicionesByTorneo,
  selectCompetitionConfig,
  selectPosicionesByGrupo,
  selectClasificados,
} from "./selectors";
import { LEGACY_MATCH_STATUS, MATCH_STATUS, toLegacyMatchStatus } from "../domain/fixtureState";
import { optimizeSchedule } from "../utils/scheduleOptimizer";
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
  "Todos contra todos":    "todos_contra_todos",
  "Eliminación directa":   "eliminacion",
  "Grupos + Playoffs":     "grupos_playoffs",
  "Grupos + Fase Final":   "grupos_playoffs",
  "GROUPS_PLUS_KNOCKOUT":  "grupos_playoffs",
  "Mixto":                 "grupos_playoffs",
};

export const useTorneosStore = create(
  persist(
    (set, get) => ({
      torneos:    [],
      equipos:    [],
      partidos:   [],
      sedes:      [],
      arbitros:   [],
      categorias: [],
      matchChangeLogs: [],
      torneoActivoId: null,
      wizardDraft:    null,
      loading:        false,
      error:          null,

      // ── Torneos ──────────────────────────────────────────────────────────

      async crearTorneo(data) {
        const formato = FORMAT_MAP[data.formato] ?? data.formato ?? "todos_contra_todos";
        const torneo = {
          id: ID(),
          nombre:        data.nombre  || "Sin nombre",
          deporte:       data.deporte || "Fútbol",
          temporada:     data.temporada || "",
          formato,
          estado:        "borrador",
          fechaInicio:   data.fechaInicio || null,
          fechaFin:      data.fechaFin || null,
          sedePrincipal: data.sedePrincipal || "",
          organizador:   data.organizador || "",
          slug:          generarSlug(data.nombre || "torneo"),
          numGrupos:     data.numGrupos || 2,
          publicado:     false,
          descripcion:   data.descripcion || "",
          portada:       null,
          perfil:        null,
          contacto:      "",
          premios:       "",
          patrocinadores: [], 
          visibilidad:   "publico", 
          reglamentoUrl:  null,
          seguidoresCount: 0,
          vistasCount:     0,
          schedulingConfig: { ...DEFAULT_SCHEDULING },
          createdAt:     NOW(),
          updatedAt:     NOW(),
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
          torneos:    s.torneos.filter(t => t.id !== id),
          equipos:    s.equipos.filter(e => e.torneoId !== id),
          partidos:   s.partidos.filter(p => p.torneoId !== id),
          sedes:      s.sedes.filter(se => se.torneoId !== id),
          arbitros:   s.arbitros.filter(a => a.torneoId !== id),
          categorias: s.categorias.filter(c => c.torneoId !== id),
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

      async agregarMuchosEquipos(torneoId, list) {
        const nuevos = list.map(d => ({
          id: ID(), torneoId,
          nombre: d.nombre || "Equipo",
          logo:   d.logo || d.escudo || null,
          escudo: d.logo || d.escudo || null,
          color:  d.color  ?? null,
          grupo:  d.grupo  ?? null,
          delegado: d.delegado ?? "",
          entrenador: d.entrenador ?? "",
          jugadores: d.jugadores ?? [],
          createdAt: NOW(),
        }));
        set(s => ({ equipos: [...s.equipos, ...nuevos] }));
        const { ok, error } = await svc.saveEquipos(torneoId, nuevos);
        if (!ok) showToast("Error al guardar equipos en la nube: " + (error?.message || "Servidor no responde"), "error");
        return nuevos;
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

      async actualizarEquiposBatch(torneoId, equiposActualizados) {
        set(s => {
          const dict = {};
          equiposActualizados.forEach(e => { dict[e.id] = e; });
          return {
            equipos: s.equipos.map(e => dict[e.id] ? { ...e, ...dict[e.id] } : e)
          };
        });
        const { ok, error } = await svc.saveEquipos(torneoId, get().equipos.filter(e => e.torneoId === torneoId));
        if (!ok) showToast("Error al sincronizar grupos: " + (error?.message || "Inténtalo de nuevo"), "error");
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

      async registrarResultado(partidoId, golesLocal, golesVisita, eventos = []) {
        let torneoId = null;
        let updatedMatch = null;
        set(s => {
          const updated = s.partidos.map(p => {
            if (p.id === partidoId) {
              torneoId = p.torneoId;
              updatedMatch = { ...p, golesLocal, golesVisita, estado: toLegacyMatchStatus(MATCH_STATUS.COMPLETED), status: MATCH_STATUS.COMPLETED, eventos };
              return updatedMatch;
            }
            return p;
          });
          return { partidos: updated };
        });
        if (torneoId) {
          const torneoPartidos = get().partidos.filter(p => p.torneoId === torneoId);
          await svc.savePartidos(torneoId, torneoPartidos);
          if (updatedMatch) {
            const winnerTeamId = golesLocal > golesVisita
              ? updatedMatch.equipoLocalId
              : golesVisita > golesLocal
                ? updatedMatch.equipoVisitaId
                : null;
            await svc.enqueueCompetitionEvent({
              tournamentId: torneoId,
              eventType: "competition.match_result_recorded",
              payload: {
                tournamentId: torneoId,
                matchId: partidoId,
                categoryId: updatedMatch.categoriaId ?? null,
                phase: updatedMatch.fase ?? null,
                homeTeamId: updatedMatch.equipoLocalId ?? null,
                awayTeamId: updatedMatch.equipoVisitaId ?? null,
                homeScore: golesLocal,
                awayScore: golesVisita,
                winnerTeamId,
                recordedAt: NOW(),
              },
            });
          }
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
            return { ...p, estado: LEGACY_MATCH_STATUS.POSTPONED, status: MATCH_STATUS.DRAFT, fechaHora: null, ronda: partidoFuturo ? partidoFuturo.ronda : p.ronda };
          }
          if (partidoFuturo && p.id === partidoFuturo.id) {
            return { ...p, fechaHora: partido.fechaHora, ronda: partido.ronda, estado: LEGACY_MATCH_STATUS.PROPOSED, status: MATCH_STATUS.DRAFT };
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
            return { ...p, estado: LEGACY_MATCH_STATUS.POSTPONED, status: MATCH_STATUS.DRAFT, fechaHora: null };
          }
          if (p.id === partidoReemplazoId) {
            return { ...p, estado: toLegacyMatchStatus(MATCH_STATUS.SCHEDULED), status: MATCH_STATUS.SCHEDULED, fechaHora: original.fechaHora, sedeId: original.sedeId, arbitroId: original.arbitroId };
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

        const partidos = s.partidos.filter(p =>
          p.torneoId === torneoId &&
          p.equipoLocalId &&
          p.equipoVisitaId &&
          p.estado !== LEGACY_MATCH_STATUS.BYE &&
          !p.metadata?.placeholder
        );
        const equipos  = s.equipos.filter(e => e.torneoId === torneoId);
        const sedes    = s.sedes.filter(se => se.torneoId === torneoId);
        const arbitros = s.arbitros.filter(a => a.torneoId === torneoId);

        const optimization = await optimizeSchedule({ partidos, equipos, sedes, arbitros, torneo });
        const patches = optimization.patches;

        const updatedPartidos = s.partidos.map(p => {
          const patch = patches.find(pt => pt.id === p.id);
          return patch ? { ...p, ...patch, estado: LEGACY_MATCH_STATUS.SCHEDULED, status: MATCH_STATUS.SCHEDULED } : p;
        });

        set({ partidos: updatedPartidos });
        
        // Sync the updated ones of this tournament
        const torneoPartidos = updatedPartidos.filter(p => p.torneoId === torneoId);
        await svc.savePartidos(torneoId, torneoPartidos);
        const scheduledIds = new Set(patches.map(patch => patch.id));
        const unscheduledMatches = partidos
          .filter(partido => !scheduledIds.has(partido.id))
          .map(partido => ({
            id: partido.id,
            categoriaId: partido.categoriaId ?? null,
            fase: partido.fase ?? null,
            ronda: partido.ronda ?? null,
            grupo: partido.grupo ?? null,
            estado: partido.estado ?? null,
            equipoLocalId: partido.equipoLocalId ?? null,
            equipoVisitaId: partido.equipoVisitaId ?? null,
          }));
        await svc.enqueueCompetitionEvent({
          tournamentId: torneoId,
          eventType: "competition.fixture_global_scheduled",
          payload: {
            optimizer: optimization.kind,
            feasible: optimization.feasible,
            scheduledCount: patches.length,
            unscheduledCount: Math.max(0, partidos.length - patches.length),
            categoryIds: [...new Set(partidos.map(p => p.categoriaId).filter(Boolean))],
            venueIds: sedes.map(sede => sede.id),
            refereeIds: arbitros.map(arbitro => arbitro.id),
            diagnostics: optimization.diagnostics ?? {},
          },
        });

        return {
          total: partidos.length,
          scheduled: patches.length,
          unscheduled: unscheduledMatches.length,
          unscheduledMatches,
        };
      },

      // ── Categorías ─────────────────────────────────────────────────────

      async agregarCategorias(torneoId, cats) {
        const nuevas = cats.map(c => ({
          id: c.id || ID(),
          torneoId,
          nombre:    c.nombre || "Sin nombre",
          teams:     parseInt(c.teams) || 0,
          format:    c.format || "todos_contra_todos",
          fases:     c.fases || "ida",
          vueltas:   parseInt(c.vueltas) || 1,
          grupos:    parseInt(c.grupos) || 2,
          tpg:       parseInt(c.tpg) || 4,
          cpg:       parseInt(c.cpg) || 2,
          faseFinal: c.faseFinal || "final",
          desempate: c.desempate || "goal_diff",
          // ── Nuevos campos Grupos + Fase Final ──────────────────────────
          groupsCount:          parseInt(c.groupsCount)     || 2,
          groupLegs:            parseInt(c.groupLegs)       || 1,
          qualifyPerGroup:      parseInt(c.qualifyPerGroup)  || 2,
          assignmentMethod:     c.assignmentMethod     || "auto_serpentina",
          allowBestThirds:      c.allowBestThirds      ?? false,
          bestThirdsCount:      parseInt(c.bestThirdsCount)  || 0,
          pointsConfig:         c.pointsConfig         || { ...DEFAULT_POINTS_CONFIG },
          tiebreakers:          c.tiebreakers          || [...DEFAULT_TIEBREAKERS],
          initialKnockoutRound: c.initialKnockoutRound || "auto",
          crossingMethod:       c.crossingMethod       || "auto_position",
          knockoutTiebreakRule: c.knockoutTiebreakRule  || "penalties",
          playoffLegs:          parseInt(c.playoffLegs)      || 1,
          finalLegs:            parseInt(c.finalLegs)        || 1,
          createdAt: NOW(),
        }));
        set(s => ({ categorias: [...s.categorias, ...nuevas] }));
        await svc.saveCategorias(torneoId, nuevas);
        return nuevas;
      },

      async actualizarCategoria(id, patch) {
        let torneoId = null;
        set(s => ({
          categorias: s.categorias.map(c => {
            if (c.id === id) {
              torneoId = c.torneoId;
              return { ...c, ...patch };
            }
            return c;
          }),
        }));
        if (torneoId) {
          const updatedCat = get().categorias.find(c => c.id === id);
          if (updatedCat) {
            await svc.saveCategorias(torneoId, [updatedCat]);
          }
        }
      },

      getCategoriasByTorneo(torneoId) {
        return selectCategoriasByTorneo(get(), torneoId);
      },

      /** Configuración de competencia de una categoría (merge con defaults). */
      getCompetitionConfig(categoriaId) {
        return selectCompetitionConfig(get(), categoriaId);
      },

      /**
       * Calcula tabla de posiciones por grupo para una categoría concreta.
       * @returns {{ [groupLabel]: standingRow[] }}
       */
      getPosicionesByGrupo(torneoId, categoriaId) {
        return selectPosicionesByGrupo(get(), torneoId, categoriaId);
      },

      /**
       * Devuelve equipos clasificados para la fase final.
       */
      getClasificados(torneoId, categoriaId) {
        return selectClasificados(get(), torneoId, categoriaId);
      },

      /**
       * Registra un cambio de partido en el historial (reprogramación con traza).
       */
      async registrarCambioPartido(partidoId, change) {
        const s = get();
        const partido = s.partidos.find(p => p.id === partidoId);
        if (!partido) return;
        const log = {
          id:         ID(),
          partidoId,
          torneoId:   partido.torneoId,
          tipo:       change.tipo   || "reprogramacion",
          motivo:     change.motivo || "",
          fechaAnterior: partido.fechaHora,
          fechaNueva:    change.fechaNueva ?? null,
          realizadoPor:  change.realizadoPor ?? null,
          timestamp:  NOW(),
        };
        set(s => ({ matchChangeLogs: [...(s.matchChangeLogs ?? []), log] }));
        return log;
      },

      // ── Wizard draft ─────────────────────────────────────────────────────

      async registrarEventoCompeticion(event) {
        const { ok, error } = await svc.enqueueCompetitionEvent(event);
        if (!ok && error) {
          console.warn("[TORNEOS] No se pudo encolar evento de competencia", error);
        }
        return { ok, error };
      },

      async registrarBracketSeeded(payload) {
        return get().registrarEventoCompeticion(createBracketSeededEvent(payload));
      },

      async registrarAvanceFase(payload) {
        return get().registrarEventoCompeticion(createRoundAdvancedEvent(payload));
      },

      async registrarDesempateAplicado(payload) {
        return get().registrarEventoCompeticion(createTiebreakerAppliedEvent(payload));
      },

      setWizardDraft(data) {
        set(s => ({ wizardDraft: { ...s.wizardDraft, ...data } }));
      },

      clearWizardDraft() {
        set({ wizardDraft: null });
      },

      // ── Selectors ────────────────────────────────────────────────────────

      getTorneoById(id) {
        return selectTorneoById(get(), id);
      },

      getEquiposByTorneo(torneoId) {
        return selectEquiposByTorneo(get(), torneoId);
      },

      getPartidosByTorneo(torneoId) {
        return selectPartidosByTorneo(get(), torneoId);
      },

      getPartidosByFase(torneoId, fase) {
        return selectPartidosByFase(get(), torneoId, fase);
      },

      getPartidosByGrupo(torneoId, grupo) {
        return selectPartidosByGrupo(get(), torneoId, grupo);
      },

      getPosicionesByTorneo(torneoId) {
        return selectPosicionesByTorneo(get(), torneoId);
      },

      getSedesByTorneo(torneoId) {
        return selectSedesByTorneo(get(), torneoId);
      },

      getArbitrosByTorneo(torneoId) {
        return selectArbitrosByTorneo(get(), torneoId);
      },

      getCategoriasTorneo(torneoId) {
        return selectCategoriasByTorneo(get(), torneoId);
      },

      getTorneoActivo() {
        return selectTorneoActivo(get());
      },

      async loadTorneosFromSupabase() {
        set({ loading: true, error: null });
        try {
          const results = await svc.fetchAllTorneos();
          const allTorneos = results.map(r => ({
            ...r.torneo,
            patrocinadores: Array.isArray(r.torneo.patrocinadores) ? r.torneo.patrocinadores : [],
          }));
          const allEquipos = results.flatMap(r => r.equipos);
          const allPartidos = results.flatMap(r => r.partidos);
          const allSedes    = results.flatMap(r => r.sedes);
          const allArbitros = results.flatMap(r => r.arbitros);
          const allCategorias = results.flatMap(r => r.categorias || []);

          const currentActivoId = get().torneoActivoId;
          const torneoActivoId = allTorneos.some(t => t.id === currentActivoId)
            ? currentActivoId
            : (allTorneos[0]?.id ?? null);

          set({
            torneos: allTorneos, 
            equipos: allEquipos, 
            partidos: allPartidos,
            sedes: allSedes,
            arbitros: allArbitros,
            categorias: allCategorias,
            torneoActivoId,
          });

          return {
            torneos: allTorneos,
            equipos: allEquipos,
            partidos: allPartidos,
            sedes: allSedes,
            arbitros: allArbitros,
            categorias: allCategorias,
          };
        } catch (err) {
          console.error("[TORNEOS] error", err);
          set({ error: err?.message || "No se pudo cargar el módulo de torneos" });
          throw err;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "alttez-torneos-store",
      // La verdad de los datos es Supabase (loadTorneosFromSupabase revalida al entrar).
      // Solo persistimos preferencias ligeras: torneo "último abierto" y borrador del wizard.
      // Persistir los datasets completos causaba (a) riesgo de quota con cientos de equipos
      // y (b) datos stale entre sesiones (el guard `torneos.length===0` saltaba el refetch).
      partialize: (state) => ({
        torneoActivoId: state.torneoActivoId,
        wizardDraft: state.wizardDraft,
      }),
    }
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
