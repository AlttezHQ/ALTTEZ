import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { useTorneosStore } from "../store/useTorneosStore";
import ModuleEmptyState from "../components/shared/ModuleEmptyState";
import { PALETTE, ELEVATION } from "../../../shared/tokens/palette";

const CU     = PALETTE.bronce;
const CU_DIM = PALETTE.bronceDim;
const CU_BOR = PALETTE.bronceBorder;
const CARD   = PALETTE.surface;
const BG     = PALETTE.bg;
const TEXT   = PALETTE.text;
const MUTED  = PALETTE.textMuted;
const BORDER = PALETTE.border;
const ELEV   = ELEVATION?.card ?? "0 10px 28px rgba(23,26,28,0.07)";
const FONT   = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
const EASE   = [0.22, 1, 0.36, 1];

const GRUPOS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function EquiposPage({ onGoTorneos }) {
  const torneoActivoId   = useTorneosStore(s => s.torneoActivoId);
  const getEquipos       = useTorneosStore(s => s.getEquiposByTorneo);
  const agregarEquipo    = useTorneosStore(s => s.agregarEquipo);
  const actualizarEquipo = useTorneosStore(s => s.actualizarEquipo);
  const eliminarEquipo   = useTorneosStore(s => s.eliminarEquipo);
  const getTorneoById    = useTorneosStore(s => s.getTorneoById);

  const [nuevonombre, setNuevonombre] = useState("");
  const [editId, setEditId]     = useState(null);
  const [editNombre, setEditNombre] = useState("");

  if (!torneoActivoId) {
    return <ModuleEmptyState icon={Users} title="Selecciona un torneo" subtitle="Abre un torneo desde la lista para gestionar sus equipos." ctaLabel="Ver torneos" onCta={onGoTorneos} />;
  }

  const torneo = getTorneoById(torneoActivoId);
  const equipos = getEquipos(torneoActivoId);

  const handleAgregar = () => {
    const nombre = nuevonombre.trim();
    if (!nombre) return;
    agregarEquipo(torneoActivoId, { nombre });
    setNuevonombre("");
  };

  const handleEdit = (eq) => { setEditId(eq.id); setEditNombre(eq.nombre); };
  const handleSaveEdit = () => {
    if (editNombre.trim()) actualizarEquipo(editId, { nombre: editNombre.trim() });
    setEditId(null); setEditNombre("");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: EASE }} style={{ fontFamily: FONT }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>Equipos</h2>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{torneo?.nombre} · {equipos.length} equipo{equipos.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      {/* Add form */}
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 20, marginBottom: 16, boxShadow: ELEV }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: "0.04em", marginBottom: 10 }}>AGREGAR EQUIPO</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={nuevonombre}
            placeholder="Nombre del equipo"
            onChange={e => setNuevonombre(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAgregar()}
            style={{ flex: 1, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: TEXT, fontFamily: FONT, background: BG, outline: "none" }}
          />
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleAgregar}
            style={{ display: "flex", alignItems: "center", gap: 6, background: CU, color: "#FFF", border: "none", borderRadius: 8, padding: "0 16px", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}
          >
            <Plus size={14} />Agregar
          </motion.button>
        </div>
      </div>

      {/* List */}
      {equipos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: MUTED, fontSize: 13 }}>
          No hay equipos. Agrega el primero arriba.
        </div>
      ) : (
        <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: ELEV }}>
          <AnimatePresence>
            {equipos.map((eq, i) => (
              <motion.div
                key={eq.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2, ease: EASE }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px",
                  borderBottom: i < equipos.length - 1 ? `1px solid ${BORDER}` : "none",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 34, height: 34, borderRadius: 10, background: CU_DIM,
                  border: `1px solid ${CU_BOR}`, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 13, fontWeight: 700, color: CU, flexShrink: 0,
                }}>
                  {eq.nombre.charAt(0).toUpperCase()}
                </div>

                {/* Name */}
                {editId === eq.id ? (
                  <input
                    autoFocus
                    value={editNombre}
                    onChange={e => setEditNombre(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") setEditId(null); }}
                    style={{ flex: 1, border: `1px solid ${CU}`, borderRadius: 6, padding: "5px 10px", fontSize: 13, color: TEXT, fontFamily: FONT, background: BG, outline: "none" }}
                  />
                ) : (
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: TEXT }}>{eq.nombre}</span>
                )}

                {/* Grupo selector */}
                {torneo?.formato === "grupos_playoffs" && (
                  <select
                    value={eq.grupo ?? ""}
                    onChange={e => actualizarEquipo(eq.id, { grupo: e.target.value || null })}
                    style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 8px", fontSize: 11, color: MUTED, fontFamily: FONT, background: BG, outline: "none" }}
                  >
                    <option value="">Sin grupo</option>
                    {GRUPOS.map(g => <option key={g} value={g}>Grupo {g}</option>)}
                  </select>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 4 }}>
                  {editId === eq.id ? (
                    <>
                      <button onClick={handleSaveEdit} style={{ background: CU_DIM, border: `1px solid ${CU_BOR}`, borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: CU }}>
                        <Check size={12} />
                      </button>
                      <button onClick={() => setEditId(null)} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: MUTED }}>
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(eq)} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: MUTED }}>
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => eliminarEquipo(eq.id)} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: MUTED }}>
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
