/**
 * Pure auto-scheduling engine — no store imports.
 * autoSchedule({ partidos, equipos, sedes, arbitros, torneo })
 * → [{ id, fechaHora, sedeId, lugar, arbitroId }]
 */

const DAY_MS = 86_400_000;

function parseTime(timeStr, baseDate) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60_000);
}

function daysBetween(a, b) {
  return Math.abs(Math.round((new Date(a) - new Date(b)) / DAY_MS));
}

function dateKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

export function autoSchedule({ partidos, sedes, arbitros, torneo }) {
  const cfg = torneo.schedulingConfig ?? {
    diasDisponibles: [6, 0],
    horaInicio: "10:00",
    horaFin: "22:00",
    duracionMin: 90,
    descansoDias: 2,
    maxPartidosDia: 3,
  };

  const startDate = torneo.fechaInicio
    ? new Date(torneo.fechaInicio + "T00:00:00")
    : new Date();

  const endDate = torneo.fechaFin
    ? new Date(torneo.fechaFin + "T23:59:59")
    : new Date(startDate.getTime() + 365 * DAY_MS);

  // Build all valid dates (up to endDate)
  const validDates = [];
  const limitDays = Math.min(365, Math.ceil((endDate - startDate) / DAY_MS) + 1);
  
  for (let i = 0; i < limitDays; i++) {
    const d = new Date(startDate.getTime() + i * DAY_MS);
    if (d > endDate) break;
    if (cfg.diasDisponibles.includes(d.getDay())) {
      validDates.push(d);
    }
  }

  // Build slots per date: [{ dateStr, time: Date }]
  const slots = [];
  for (const d of validDates) {
    const start = parseTime(cfg.horaInicio, d);
    const end   = parseTime(cfg.horaFin, d);
    let cur = new Date(start);
    while (addMinutes(cur, cfg.duracionMin) <= end) {
      slots.push({ dateStr: dateKey(d), time: new Date(cur) });
      cur = addMinutes(cur, cfg.duracionMin);
    }
  }

  // Sort partidos: ronda ASC, orden ASC
  const ordered = [...partidos]
    .filter(p => p.equipoLocalId && p.equipoVisitaId)
    .sort((a, b) => (a.ronda - b.ronda) || (a.orden - b.orden));

  // Tracking state
  const teamLastMatch = {};    // equipoId → dateStr
  const dayCount      = {};    // dateStr → count
  const slotCount     = {};    // dateStr_timeStr → count
  const venueSlotUse  = {};
  const venueDayCount = {};
  const refereeSlotUse = {};
  const arbitroIndex  = { v: 0 };
  
  const slotCapacity = Math.max(1, sedes.length);
  const maxMatchesPerVenueDay = cfg.maxPartidosCanchaDia ?? cfg.maxPartidosPorCanchaDia ?? Infinity;

  const patches = [];

  for (const partido of ordered) {
    const local   = partido.equipoLocalId;
    const visita  = partido.equipoVisitaId;

    let assigned = null;
    for (const slot of slots) {
      const usedToday = dayCount[slot.dateStr] ?? 0;
      if (usedToday >= cfg.maxPartidosDia) continue;

      const slotKey = `${slot.dateStr}_${slot.time.toISOString()}`;
      const usedSlot = slotCount[slotKey] ?? 0;
      if (usedSlot >= slotCapacity) continue;

      // Check rest days for both teams
      const lastLocal  = teamLastMatch[local];
      const lastVisita = teamLastMatch[visita];
      if (lastLocal  && daysBetween(slot.dateStr, lastLocal)  < cfg.descansoDias) continue;
      if (lastVisita && daysBetween(slot.dateStr, lastVisita) < cfg.descansoDias) continue;

      assigned = { ...slot, key: slotKey };
      break;
    }

    if (!assigned) continue; // no slot found, skip

    const sede = sedes.find(candidate => {
      const usedSlots = venueSlotUse[candidate.id] ?? new Set();
      const usedDay = venueDayCount[`${candidate.id}_${assigned.dateStr}`] ?? 0;
      return !usedSlots.has(assigned.key) && usedDay < maxMatchesPerVenueDay;
    }) ?? null;

    if (sedes.length > 0 && !sede) continue;

    const arbitro = arbitros.find((_, idx) => {
      const candidate = arbitros[(arbitroIndex.v + idx) % arbitros.length];
      const usedSlots = refereeSlotUse[candidate.id] ?? new Set();
      return !usedSlots.has(assigned.key);
    }) ?? null;

    if (arbitros.length > 0 && !arbitro) continue;

    // Mark slot consumed
    dayCount[assigned.dateStr] = (dayCount[assigned.dateStr] ?? 0) + 1;
    slotCount[assigned.key] = (slotCount[assigned.key] ?? 0) + 1;
    teamLastMatch[local]  = assigned.dateStr;
    teamLastMatch[visita] = assigned.dateStr;

    // Round-robin sede & árbitro
    if (sede) {
      if (!venueSlotUse[sede.id]) venueSlotUse[sede.id] = new Set();
      venueSlotUse[sede.id].add(assigned.key);
      venueDayCount[`${sede.id}_${assigned.dateStr}`] = (venueDayCount[`${sede.id}_${assigned.dateStr}`] ?? 0) + 1;
    }

    if (arbitro) {
      if (!refereeSlotUse[arbitro.id]) refereeSlotUse[arbitro.id] = new Set();
      refereeSlotUse[arbitro.id].add(assigned.key);
      arbitroIndex.v = (arbitroIndex.v + 1) % arbitros.length;
    }

    patches.push({
      id:        partido.id,
      fechaHora: assigned.time.toISOString(),
      sedeId:    sede?.id    ?? null,
      lugar:     sede?.nombre ?? null,
      arbitroId: arbitro?.id  ?? null,
    });
  }

  return patches;
}
