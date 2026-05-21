/**
 * @module proposalsService
 * @description Servicio de propuestas comerciales ALTTEZ.
 * Patrón write-through: escribe a Supabase + localStorage como cache offline.
 * Si Supabase no está disponible, opera en modo localStorage puro.
 *
 * @typedef {Object} Proposal
 * @property {string}  id
 * @property {string}  club_id
 * @property {string}  client_name
 * @property {string}  title
 * @property {string}  subtitle
 * @property {string}  description
 * @property {string}  fecha          - ISO date "YYYY-MM-DD"
 * @property {string}  rol
 * @property {number}  participacion_pct
 * @property {string}  impacto
 * @property {string[]} beneficios
 * @property {string}  objeto_pdf
 * @property {string}  cliff_pdf
 * @property {'creada'|'enviada'|'aceptada'|'contrapropuesta'|'rechazada'} status
 * @property {string|null} signed_name
 * @property {string|null} signed_at
 * @property {string|null} contrapropuesta_text
 * @property {string}  created_at
 * @property {string}  updated_at
 *
 * @version 1.0.0
 */

import { supabase, isSupabaseReady } from "../lib/supabase";
import { DEMO_PROPOSALS } from "../constants/initialStates";

const LS_KEY = "alttez_proposals";

// ── Helpers localStorage ──
function lsRead() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function lsWrite(proposals) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(proposals));
  } catch {
    /* noop */
  }
}

function genId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function resolveProposalId(idOrSlug) {
  const value = String(idOrSlug || "");
  return value.includes("--") ? value.split("--").pop() : value;
}

// ── Obtener club_id desde el servicio de supabase ──
let _clubId = null;
export function setProposalsClubId(id) { _clubId = id; }

// ════════════════════════════════════════════════
// CRUD — Propuestas
// ════════════════════════════════════════════════

/**
 * Lista todas las propuestas del club activo.
 * @returns {Promise<Proposal[]>}
 */
export async function getProposals() {
  // En modo demo: devuelve datos pre-cargados del localStorage
  if (isSupabaseReady && _clubId) {
    try {
      const { data, error } = await supabase
        .from("propuestas")
        .select("*")
        .eq("club_id", _clubId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        lsWrite(data);
        return data;
      }
    } catch {
      /* fallback a localStorage */
    }
  }
  const cached = lsRead();
  let merged = [...cached];
  let changed = false;
  DEMO_PROPOSALS.forEach((demo) => {
    if (!merged.some((p) => p.id === demo.id)) {
      merged.push(demo);
      changed = true;
    }
  });
  if (changed) {
    lsWrite(merged);
  }
  return merged;
}

/**
 * Lee una propuesta por su UUID (pública, sin auth requerida).
 * Primero busca en localStorage (modo demo), luego en Supabase.
 * @param {string} id
 * @returns {Promise<Proposal|null>}
 */
export async function getProposalById(id) {
  const proposalId = resolveProposalId(id);
  // Primero: buscar en localStorage (soporta modo offline y demo)
  const cached = lsRead();
  const local = cached.find((p) => p.id === proposalId || p.id === id);

  // Propuesta demo especial (hardcoded para tests y demo sin Supabase)
  if (!local) {
    const demo = DEMO_PROPOSALS.find((p) => p.id === proposalId || p.id === id);
    if (demo) return demo;
  }

  if (isSupabaseReady) {
    try {
      const { data, error } = await supabase
        .from("propuestas")
        .select("*")
        .eq("id", proposalId)
        .single();
      if (!error && data) return data;
    } catch {
      /* fallback */
    }
  }

  return local || null;
}

/**
 * Crea una nueva propuesta.
 * @param {Omit<Proposal, 'id'|'created_at'|'updated_at'|'signed_name'|'signed_at'|'contrapropuesta_text'>} proposal
 * @returns {Promise<Proposal>}
 */
export async function insertProposal(proposal) {
  const now = new Date().toISOString();
  const newProposal = {
    ...proposal,
    id: genId(),
    status: proposal.status || "creada",
    signed_name: null,
    signed_at: null,
    contrapropuesta_text: null,
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseReady && _clubId) {
    try {
      const { data, error } = await supabase
        .from("propuestas")
        .insert({ ...newProposal, club_id: _clubId })
        .select()
        .single();
      if (!error && data) {
        // Sync localStorage
        const all = lsRead();
        lsWrite([data, ...all]);
        return data;
      }
    } catch {
      /* fallback a localStorage */
    }
  }

  // Modo offline: guardar en localStorage con club_id local
  const saved = { ...newProposal, club_id: _clubId || "local" };
  const all = lsRead();
  lsWrite([saved, ...all]);
  return saved;
}

/**
 * Actualiza campos de una propuesta (autenticado o público por UUID).
 * @param {string} id
 * @param {Partial<Proposal>} fields
 * @returns {Promise<Proposal|null>}
 */
export async function updateProposal(id, fields) {
  const proposalId = resolveProposalId(id);
  const now = new Date().toISOString();
  const updates = { ...fields, updated_at: now };

  if (isSupabaseReady) {
    try {
      const { data, error } = await supabase
        .from("propuestas")
        .update(updates)
        .eq("id", proposalId)
        .select()
        .single();
      if (!error && data) {
        const all = lsRead();
        lsWrite(all.map((p) => (p.id === id ? data : p)));
        return data;
      }
    } catch {
      /* fallback */
    }
  }

  // Offline: actualizar en localStorage
  const all = lsRead();
  const idx = all.findIndex((p) => p.id === proposalId || p.id === id);
  if (idx !== -1) {
    const updated = { ...all[idx], ...updates };
    all[idx] = updated;
    lsWrite(all);
    return updated;
  }

  // Propuesta demo: simular actualización en memoria (no persiste entre recargas en demo)
  const demo = DEMO_PROPOSALS.find((p) => p.id === proposalId || p.id === id);
  if (demo) {
    return { ...demo, ...updates };
  }

  return null;
}

/**
 * Elimina una propuesta.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteProposal(id) {
  const proposalId = resolveProposalId(id);
  if (isSupabaseReady && _clubId) {
    try {
      const { error } = await supabase
        .from("propuestas")
        .delete()
        .eq("id", proposalId)
        .eq("club_id", _clubId);
      if (!error) {
        const all = lsRead();
        lsWrite(all.filter((p) => p.id !== id));
        return true;
      }
    } catch {
      /* fallback */
    }
  }

  // Offline
  const all = lsRead();
  lsWrite(all.filter((p) => p.id !== proposalId && p.id !== id));
  return true;
}

/**
 * Firma una propuesta públicamente (sin auth).
 * @param {string} id
 * @param {string} signedName
 * @returns {Promise<Proposal|null>}
 */
export async function signProposal(id, signedName) {
  return updateProposal(id, {
    status: "aceptada",
    signed_name: signedName,
    signed_at: new Date().toISOString(),
  });
}

/**
 * Envía una contrapropuesta públicamente (sin auth).
 * @param {string} id
 * @param {string} text
 * @returns {Promise<Proposal|null>}
 */
export async function sendCounterProposal(id, text) {
  return updateProposal(id, {
    status: "contrapropuesta",
    contrapropuesta_text: text,
  });
}

export default {
  getProposals,
  getProposalById,
  insertProposal,
  updateProposal,
  deleteProposal,
  signProposal,
  sendCounterProposal,
  setProposalsClubId,
};
