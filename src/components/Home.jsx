/**
 * @component Home
 * @description Dashboard principal ALTTEZ — Enterprise SaaS Layout v9.0
 * Bento Grid estilo Teamworks/Linear. Sin imágenes, sin gradientes decorativos.
 * Negro total, tipografía masiva, Action Blue CTAs, hover suave.
 * Pure Tailwind — zero inline styles, zero CSS injection.
 *
 * @version  9.0 — Full Tailwind migration (dynamic PALETTE colors via style prop only)
 * @author   ALTTEZ
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Dumbbell,
  Activity,
  Calendar,
  TrendingUp,
  ChevronRight,
  Circle,
  MapPin,
  Clock,
} from "lucide-react";
import { PALETTE }      from "../constants/palette";
import EmptyState       from "./ui/EmptyState";
import { useStore }     from "../store/useStore";
import { calcStats }    from "../services/storageService";

// ── Animation variants ───────────────────────────────────────────────────────
const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
};

const fadeInItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 28 } },
};

// ── Próximo evento logic ─────────────────────────────────────────────────────
const EVENT_LABELS = { match: "Partido", training: "Entrenamiento", club: "Evento" };

function getDemoEvents() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = (day, hour = 18, min = 0) => new Date(y, m, day, hour, min).toISOString();
  return [
    { type: "training", title: "Entrenamiento físico",         datetime: d(2,  18, 0),  location: "Campo A"         },
    { type: "training", title: "Trabajo táctico",              datetime: d(4,  18, 0),  location: "Campo A"         },
    { type: "match",    title: "vs Atlético Sur",              datetime: d(7,  16, 0),  location: "Estadio Local"   },
    { type: "training", title: "Rondos y pressing",            datetime: d(9,  18, 0),  location: "Campo A"         },
    { type: "training", title: "Entrenamiento precompetición", datetime: d(11, 17, 30), location: "Campo B"         },
    { type: "match",    title: "vs Deportivo Norte",           datetime: d(14, 11, 0),  location: "Est. Norte"      },
    { type: "training", title: "Recuperación activa",          datetime: d(16, 10, 0),  location: "Gimnasio"        },
    { type: "training", title: "Pautas tácticas jornada",      datetime: d(18, 18, 0),  location: "Campo A"         },
    { type: "club",     title: "Jornada de puertas abiertas",  datetime: d(19, 10, 0),  location: "Campo A"         },
    { type: "match",    title: "vs Unión FC",                  datetime: d(21, 16, 30), location: "Estadio Local"   },
    { type: "training", title: "Ensayo de balón parado",       datetime: d(23, 18, 0),  location: "Campo A"         },
    { type: "training", title: "Entrenamiento técnico",        datetime: d(25, 18, 0),  location: "Campo B"         },
    { type: "match",    title: "vs Racing Club",               datetime: d(28, 17, 0),  location: "Estadio Racing"  },
  ];
}

function getNextEvent() {
  const now = new Date();
  try {
    const clubId = localStorage.getItem("alttez_club_id") || "demo";
    const rawEvents = localStorage.getItem(`alttez_events_${clubId}`);
    if (rawEvents) {
      const customEvents = JSON.parse(rawEvents);
      if (Array.isArray(customEvents) && customEvents.length > 0) {
        const future = customEvents
          .filter(e => e.datetime && new Date(e.datetime) > now)
          .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        if (future.length > 0) return future[0];
      }
    }
  } catch { /* continue with fallback */ }
  const demoEvents = getDemoEvents();
  const future = demoEvents
    .filter(e => new Date(e.datetime) > now)
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  return future[0] || null;
}

function fmtEventDate(iso) {
  const d = new Date(iso);
  const dias  = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
  const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]} · ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}h`;
}

function daysUntil(iso) {
  const diff = Math.ceil((new Date(iso) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  return `${diff} días`;
}

// ── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "home",          label: "Inicio",        navigable: false },
  { key: "entrenamiento", label: "Entrenamiento",  navigable: true  },
  { key: "plantilla",     label: "Plantilla",      navigable: true  },
  { key: "calendario",    label: "Calendario",     navigable: true  },
  { key: "admin",         label: "Administración", navigable: true  },
  { key: "reportes",      label: "Reportes",       navigable: true  },
  { key: "miclub",        label: "Mi Club",        navigable: true  },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ label, value, icon, onClick }) {
  return (
    <motion.div
      variants={fadeInItem}
      onClick={onClick}
      className="bg-[#0D0D0D] px-6 py-5 cursor-pointer relative group transition-shadow duration-150 hover:shadow-[inset_0_0_0_1px_rgba(26,106,255,0.35)]"
    >
      <div className="absolute top-4 right-4 text-[#888888] opacity-60 group-hover:opacity-100 transition-opacity duration-150">
        {icon}
      </div>
      <div className="text-[40px] font-black text-white tracking-[-2px] leading-none mb-2 [font-variant-numeric:tabular-nums]">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-[1.5px] text-[#888888] group-hover:text-[#AAAAAA] transition-colors duration-150">
        {label}
      </div>
    </motion.div>
  );
}

function ActionTile({ title, tag, ctaLabel, onClick, className = "" }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`bg-[#0D0D0D] border border-white/[0.08] cursor-pointer flex flex-col justify-between p-6 relative overflow-hidden group min-h-[220px] hover:border-[#1A6AFF]/35 transition-colors duration-150 ${className}`}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-transparent group-hover:bg-[#1A6AFF] transition-colors duration-150" />

      <div>
        <div className="text-[9px] font-semibold uppercase tracking-[2.5px] text-[#555555] mb-4">
          {tag}
        </div>
        <div className="text-[28px] font-black text-white uppercase tracking-[-1.2px] leading-none">
          {title}
        </div>
      </div>

      <div className="mt-6">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[1.5px] px-5 py-2.5 bg-[#1A6AFF] group-hover:bg-[#1557E0] text-white rounded-md transition-colors duration-150 cursor-pointer">
          {ctaLabel}
          <ChevronRight size={12} strokeWidth={1.5} />
        </span>
      </div>
    </motion.div>
  );
}

function ActionTileSmall({ title, tag, ctaLabel, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-[#0D0D0D] border border-white/[0.08] cursor-pointer flex flex-col justify-between p-6 relative overflow-hidden group min-h-[160px] hover:border-[#1A6AFF]/35 transition-colors duration-150"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-transparent group-hover:bg-[#1A6AFF] transition-colors duration-150" />

      <div>
        <div className="text-[9px] font-semibold uppercase tracking-[2.5px] text-[#555555] mb-4">
          {tag}
        </div>
        <div className="text-[22px] font-black text-white uppercase tracking-[-1px] leading-none">
          {title}
        </div>
      </div>

      <div className="mt-4">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[1.5px] px-5 py-2.5 bg-[#1A6AFF] group-hover:bg-[#1557E0] text-white rounded-md transition-colors duration-150 cursor-pointer">
          {ctaLabel}
          <ChevronRight size={12} strokeWidth={1.5} />
        </span>
      </div>
    </motion.div>
  );
}

function BannerTile({ title, description, icon, ctaLabel, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-[#0D0D0D] border border-white/[0.08] cursor-pointer flex items-center justify-between px-7 min-h-[68px] gap-4 group hover:bg-[#111111] hover:border-[#1A6AFF]/40 transition-colors duration-150"
    >
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 border border-white/10 flex items-center justify-center text-[#888888] group-hover:border-[#1A6AFF]/40 group-hover:bg-[#1A6AFF]/[0.08] transition-all duration-150 flex-shrink-0">
          {icon}
        </div>
        <div>
          <div className="text-[13px] font-extrabold text-white uppercase tracking-[-0.2px]">
            {title}
          </div>
          {description && (
            <div className="text-[9px] text-[#555555] uppercase tracking-[0.5px] mt-0.5">
              {description}
            </div>
          )}
        </div>
      </div>
      <div className="text-[9px] font-bold uppercase tracking-[1.5px] px-4 py-1.5 border border-white/[0.12] text-[#888888] group-hover:border-[#1A6AFF]/50 group-hover:text-[#1A6AFF] transition-all duration-150 whitespace-nowrap flex-shrink-0">
        {ctaLabel}
      </div>
    </div>
  );
}

function NextEventTile({ event, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-[#0D0D0D] border border-white/[0.08] cursor-pointer flex flex-col justify-between p-6 relative overflow-hidden group min-h-[220px] hover:border-[#1A6AFF]/35 transition-colors duration-150"
    >
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-transparent group-hover:bg-[#1A6AFF] transition-colors duration-150" />

      <div>
        {/* Tag row */}
        <div className="flex items-center gap-2 mb-4">
          <div className="text-[9px] font-semibold uppercase tracking-[2.5px] text-[#555555]">
            Próximo evento
          </div>
          <div className="text-[8px] font-bold uppercase tracking-[1px] px-2 py-0.5 bg-[#1A6AFF]/10 border border-[#1A6AFF]/25 text-[#1A6AFF]">
            {EVENT_LABELS[event.type] || "Evento"}
          </div>
        </div>

        {/* Title */}
        <div className="text-[22px] font-black text-white uppercase tracking-[-0.8px] leading-[1.05] mb-3">
          {event.title}
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#888888] tracking-[0.5px] mb-2">
          <Clock size={12} strokeWidth={1.5} className="text-[#555555] flex-shrink-0" />
          {fmtEventDate(event.datetime)}
        </div>

        {/* Location + days until */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 text-[10px] text-[#555555]">
            <MapPin size={12} strokeWidth={1.5} className="flex-shrink-0" />
            {event.location}
          </div>
          <div className="text-[9px] font-bold text-[#1A6AFF] px-2 py-0.5 bg-[#1A6AFF]/[0.08] border border-[#1A6AFF]/20">
            {daysUntil(event.datetime)}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-5">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[1.5px] px-5 py-2.5 bg-[#1A6AFF] group-hover:bg-[#1557E0] text-white rounded-md transition-colors duration-150 cursor-pointer">
          Ver calendario
          <ChevronRight size={12} strokeWidth={1.5} />
        </span>
      </div>
    </motion.div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Home({ onNavigate, onLogout }) {
  const mode       = useStore(state => state.mode);
  const athletes   = useStore(state => state.athletes);
  const historial  = useStore(state => state.historial);
  const clubInfo   = useStore(state => state.clubInfo);
  const matchStats = useStore(state => state.matchStats);

  const stats = calcStats(athletes, historial);
  const club  = { ...clubInfo, categoria: (clubInfo.categorias || [])[0] || "General" };

  const clubInitials = (club.nombre || "ALT")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const METRICS = [
    { label: "Plantilla",  value: athletes.length,        icon: <Users       size={16} strokeWidth={1.5} />, route: "plantilla"      },
    { label: "Partidos",   value: matchStats.played,      icon: <Circle      size={16} strokeWidth={1.5} />, route: "partidos"       },
    { label: "Sesiones",   value: stats.sesiones,         icon: <Activity    size={16} strokeWidth={1.5} />, route: "entrenamiento"  },
    { label: "Asistencia", value: stats.asistencia + "%", icon: <TrendingUp  size={16} strokeWidth={1.5} />, route: "calendario"     },
  ];

  const STATS = [
    { val: matchStats.won,   lbl: "Ganados",  color: PALETTE.success },
    { val: matchStats.lost,  lbl: "Perdidos", color: PALETTE.danger  },
    { val: matchStats.points, lbl: "Puntos",  color: "#FFFFFF"       },
    { val: `${matchStats.goalsFor}-${matchStats.goalsAgainst}`, lbl: "Goles F/C", color: "#FFFFFF" },
  ];

  const nextEv = getNextEvent();

  return (
    <div className="min-h-screen bg-black flex flex-col">

      {/* ── TOPBAR ─────────────────────────────────────────────────────────── */}
      <div className="h-11 bg-black border-b border-[#1C1C1C] flex items-stretch flex-shrink-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {/* Brand */}
        <div className="px-5 flex items-center border-r border-[#1C1C1C] flex-shrink-0">
          <span className="text-[14px] font-black text-white tracking-[-0.5px] whitespace-nowrap max-md:hidden">
            ALTTEZ
          </span>
        </div>

        {/* Nav items */}
        {NAV_ITEMS.map(({ key, label, navigable }) => {
          const isActive = key === "home";
          return (
            <div
              key={key}
              onClick={() => navigable && onNavigate(key)}
              className={[
                "px-3.5 text-[10px] uppercase tracking-[2px] flex items-center border-r border-[#1C1C1C] whitespace-nowrap font-medium transition-colors duration-150 border-b-2 flex-shrink-0",
                isActive
                  ? "text-white border-b-[#1A6AFF] font-bold"
                  : "text-[#888888] border-b-transparent hover:text-white",
                !navigable ? "cursor-default" : "cursor-pointer",
              ].join(" ")}
            >
              {label}
            </div>
          );
        })}

        {/* Club badge */}
        <div className="ml-auto flex items-center gap-2.5 px-4 border-l border-[#1C1C1C] flex-shrink-0">
          {mode === "demo" && (
            <div className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-[1px] bg-[#1A6AFF]/10 text-[#1A6AFF] border border-[#1A6AFF]/30">
              Demo
            </div>
          )}

          <div className="w-[26px] h-[26px] border border-[#2A2A2A] bg-[#111111] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 tracking-[0.5px]">
            {clubInitials}
          </div>

          <div className="max-sm:hidden">
            <div className="text-[11px] font-bold text-white uppercase tracking-[0.8px] whitespace-nowrap">
              {club.nombre || "Mi Club"}
            </div>
            <div className="text-[9px] text-[#555555] uppercase tracking-[0.5px] mt-px">
              {(club.categorias || [])[0] || "General"} · {club.temporada || "2025-26"}
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="ml-1.5 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[1px] text-[#555555] border border-[#1C1C1C] hover:text-white hover:border-[#2A2A2A] transition-colors duration-150 whitespace-nowrap cursor-pointer bg-transparent"
            >
              Salir
            </button>
          )}
        </div>
      </div>

      {/* ── KPI METRICS — Bento 4-col ──────────────────────────────────────── */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-4 max-md:grid-cols-2 gap-px bg-[#1C1C1C]"
      >
        {METRICS.map((m) => (
          <MetricCard
            key={m.label}
            label={m.label}
            value={m.value}
            icon={m.icon}
            onClick={() => onNavigate(m.route)}
          />
        ))}
      </motion.div>

      {/* ── EMPTY STATE ────────────────────────────────────────────────────── */}
      {athletes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.15 }}
          className="my-px bg-[#1A6AFF]/[0.04] border-b border-[#1C1C1C] overflow-hidden"
        >
          <EmptyState
            icon={<Users size={28} strokeWidth={1.5} className="text-[#1A6AFF]" />}
            title="Tu plantilla está vacía"
            subtitle="Incorpora deportistas para activar el seguimiento de carga, control de asistencia y analytics de rendimiento"
            actionLabel="Registrar primer deportista"
            onAction={() => onNavigate("plantilla")}
            compact
          />
        </motion.div>
      )}

      {/* ── MAIN BENTO GRID ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-px bg-[#1C1C1C] flex-1"
      >
        {/* TILE 1 — ENTRENAMIENTO */}
        <ActionTile
          title="Entrenamiento"
          tag="Módulo · Carga y sesiones"
          ctaLabel="Abrir módulo"
          onClick={() => onNavigate("entrenamiento")}
        />

        {/* TILE 2 — GESTIÓN DE PLANTILLA */}
        <ActionTile
          title="Gestión de plantilla"
          tag="Módulo · Deportistas y datos"
          ctaLabel="Ver plantilla"
          onClick={() => onNavigate("plantilla")}
        />

        {/* TILE 3 — PRÓXIMO EVENTO */}
        {nextEv ? (
          <NextEventTile event={nextEv} onClick={() => onNavigate("calendario")} />
        ) : (
          <ActionTile
            title="Sin eventos"
            tag="Próximo evento · Calendario"
            ctaLabel="Programar evento"
            onClick={() => onNavigate("calendario")}
          />
        )}

        {/* TILE 4 — STATS (full width) */}
        <div
          className="col-span-3 max-md:col-span-2 max-sm:col-span-1 bg-[#0D0D0D] border border-white/[0.08] cursor-pointer group hover:border-[#1A6AFF]/20 transition-colors duration-150"
          onClick={() => onNavigate("partidos")}
        >
          <div className="grid grid-cols-4 max-sm:grid-cols-2 h-full">
            {STATS.map((m, i) => (
              <div
                key={m.lbl}
                className={[
                  "flex flex-col justify-center items-center py-5 px-4",
                  i < STATS.length - 1 ? "border-r border-white/[0.06]" : "",
                ].join(" ")}
              >
                <div
                  className="text-[32px] font-black leading-none tracking-[-1px] [font-variant-numeric:tabular-nums]"
                  style={{ color: m.color }}
                >
                  {m.val}
                </div>
                <div className="text-[9px] text-[#555555] uppercase tracking-[1.2px] mt-1.5 font-semibold">
                  {m.lbl}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TILE 5 — ADMINISTRACIÓN */}
        <ActionTileSmall
          title="Administración"
          tag="Gestión · Finanzas del club"
          ctaLabel="Entrar"
          onClick={() => onNavigate("admin")}
        />

        {/* TILE 6 — MI CLUB */}
        <ActionTileSmall
          title="Mi club"
          tag="Configuración · Perfil del club"
          ctaLabel="Configurar"
          onClick={() => onNavigate("miclub")}
        />

        {/* TILE 7 — REPORTES */}
        <ActionTileSmall
          title="Reportes"
          tag="Análisis · Datos exportables"
          ctaLabel="Ver reportes"
          onClick={() => onNavigate("reportes")}
        />

        {/* BANNER — MATCH CENTER */}
        <div className="col-span-3 max-md:col-span-2 max-sm:col-span-1">
          <BannerTile
            title="Match Center"
            description="Rendimiento · Player Cards · Analítica post-partido"
            icon={<Circle size={16} strokeWidth={1.5} />}
            ctaLabel="Abrir →"
            onClick={() => onNavigate("partidos")}
          />
        </div>

        {/* BANNER — CALENDARIO */}
        <div className="col-span-3 max-md:col-span-2 max-sm:col-span-1">
          <BannerTile
            title="Calendario & RSVP"
            description="Partidos · Entrenamiento · RSVP en tiempo real"
            icon={<Calendar size={16} strokeWidth={1.5} />}
            ctaLabel="Abrir →"
            onClick={() => onNavigate("calendario")}
          />
        </div>
      </motion.div>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-2 border-t border-[#1C1C1C] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-[#1A6AFF] text-white text-[8px] font-bold px-1.5 py-0.5 tracking-[1px]">
            ALT
          </div>
          <div className="text-[10px] text-[#333333] tracking-[2px] font-bold uppercase">
            ALTTEZ
          </div>
          <div className="text-[9px] text-[#222222] tracking-[0.5px]">v2.0</div>
        </div>
        <div className="text-[9px] text-[#333333] uppercase tracking-[1px]">
          CRM Deportivo Profesional
        </div>
      </div>

    </div>
  );
}
