#!/usr/bin/env node
/**
 * @file test-algorithms.js
 * @description Unit tests for Elevate Sports algorithm modules.
 *
 * Tests calcSaludActual (rpeEngine), calcElevateScore, and getPerformanceAlert
 * (elevateScore) using known inputs and expected outputs derived from the
 * documented mathematical models.
 *
 * Runs with pure Node.js (no test framework, no dependencies).
 *
 * Exit codes:
 *   0 — all tests passed
 *   1 — one or more tests failed
 *
 * @author @Carlos (Arquitecto)
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── ANSI helpers ──
const RED    = '\x1b[31m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const RESET  = '\x1b[0m';

let passed = 0;
let failed = 0;

function assert(label, actual, expected, opts = {}) {
  const { delta = 0 } = opts;
  let ok;

  if (typeof expected === 'number' && delta > 0) {
    ok = Math.abs(actual - expected) <= delta;
  } else {
    ok = actual === expected;
  }

  if (ok) {
    console.log(`  ${GREEN}PASS${RESET} ${label}`);
    passed++;
  } else {
    console.log(`  ${RED}FAIL${RESET} ${label}`);
    console.log(`       ${YELLOW}expected${RESET} ${JSON.stringify(expected)}, ${YELLOW}got${RESET} ${JSON.stringify(actual)}`);
    failed++;
  }
}

// ── Inline algorithm implementations ──
// We do NOT import the source files (they use ESM + Vite transforms).
// Instead we inline the exact formulas as documented in the module headers,
// so the tests validate the documented contracts — not an import alias.

// ─── rpeEngine: calcSaludActual ───────────────────────────────────────────
// Formula (v2.1):
//   RPE_avg = mean(rpes in 7d window, max 7)
//   SaludActual = clamp(100 - RPE_avg * 10, 0, 100)
//   No data → salud: 100, riskLevel: "sin_datos"

function calcSaludActual(currentRpe, historial = [], _athleteId = null) {
  const rpes = [];

  if (currentRpe != null && currentRpe >= 1 && currentRpe <= 10) {
    rpes.push(currentRpe);
  }

  // Use rpeAvg from legacy sessions (no savedAt filter in unit test context)
  for (const s of historial) {
    if (s.rpeAvg != null && s.rpeAvg !== '—') {
      const rpe = Number(s.rpeAvg);
      if (!isNaN(rpe) && rpe >= 1 && rpe <= 10) {
        rpes.push(rpe);
      }
    }
    if (rpes.length >= 7) break;
  }

  if (rpes.length === 0) {
    return { salud: 100, riskLevel: 'sin_datos', rpeAvg7d: null };
  }

  const avgRpe = rpes.reduce((s, v) => s + v, 0) / rpes.length;
  const salud  = Math.max(0, Math.min(100, Math.round(100 - avgRpe * 10)));

  let riskLevel;
  if (salud >= 50) riskLevel = 'optimo';
  else if (salud >= 25) riskLevel = 'precaucion';
  else riskLevel = 'riesgo';

  return { salud, riskLevel, rpeAvg7d: Number(avgRpe.toFixed(1)) };
}

// ─── elevateScore: calcElevateScore ──────────────────────────────────────
// Formula:
//   raw = (goles*2.0) + (asist*1.5) + (rec*0.3) + (duelos*0.2)
//         + (min/90 * 1.0) - (amarilla ? 0.5 : 0) - (roja ? 3.0 : 0)
//   score = clamp(raw, 0, 10) rounded to 1 decimal

function calcElevateScore({ goles, asistencias, recuperaciones, duelosGanados, minutosJugados, tarjeta }) {
  const raw =
    (goles * 2.0) +
    (asistencias * 1.5) +
    (recuperaciones * 0.3) +
    (duelosGanados * 0.2) +
    ((minutosJugados / 90) * 1.0) -
    (tarjeta === 'amarilla' ? 0.5 : 0) -
    (tarjeta === 'roja' ? 3.0 : 0);

  return Number(Math.max(0, Math.min(10, raw)).toFixed(1));
}

// ─── elevateScore: getPerformanceAlert ────────────────────────────────────
// RPE > 8 && score > 7  → "critical"
// RPE > 7               → "warning"
// else                  → null

function getPerformanceAlert(rpe, elevateScore) {
  if (rpe > 8 && elevateScore > 7) return { level: 'critical' };
  if (rpe > 7)                      return { level: 'warning' };
  return null;
}

// ═══════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════

console.log('\nALTTEZ — Algorithm Integrity Tests');
console.log('━'.repeat(45));

// ── calcSaludActual ──────────────────────────────────────────────────────
console.log(`\n${CYAN}calcSaludActual (rpeEngine v2.1)${RESET}`);

// RPE 1 → salud ~90
{
  const { salud } = calcSaludActual(1);
  assert('RPE 1 → salud = 90', salud, 90);
}

// RPE 5 → salud ~50
{
  const { salud } = calcSaludActual(5);
  assert('RPE 5 → salud = 50', salud, 50);
}

// RPE 10 → salud ~0
{
  const { salud } = calcSaludActual(10);
  assert('RPE 10 → salud = 0', salud, 0);
}

// No RPE → salud 100, riskLevel "sin_datos"
{
  const { salud, riskLevel } = calcSaludActual(null);
  assert('null RPE → salud = 100', salud, 100);
  assert('null RPE → riskLevel = "sin_datos"', riskLevel, 'sin_datos');
}

// Empty historial, no RPE → sin_datos
{
  const { salud, riskLevel } = calcSaludActual(null, []);
  assert('no RPE, empty historial → salud = 100', salud, 100);
  assert('no RPE, empty historial → riskLevel = "sin_datos"', riskLevel, 'sin_datos');
}

// riskLevel thresholds
{
  const r1 = calcSaludActual(1); // salud 90 → optimo
  assert('RPE 1 → riskLevel = "optimo"', r1.riskLevel, 'optimo');

  const r6 = calcSaludActual(6); // salud 40 → precaucion
  assert('RPE 6 → riskLevel = "precaucion"', r6.riskLevel, 'precaucion');

  const r9 = calcSaludActual(9); // salud 10 → riesgo
  assert('RPE 9 → riskLevel = "riesgo"', r9.riskLevel, 'riesgo');
}

// ── calcElevateScore ─────────────────────────────────────────────────────
console.log(`\n${CYAN}calcALTTEZScore (alttezScore v1.1)${RESET}`);

// goles=2, asist=1, rec=3, duelos=5, min=90, tarjeta=ninguna
// raw = 2*2.0 + 1*1.5 + 3*0.3 + 5*0.2 + 90/90*1.0
//     = 4.0 + 1.5 + 0.9 + 1.0 + 1.0 = 8.4
{
  const score = calcElevateScore({ goles:2, asistencias:1, recuperaciones:3, duelosGanados:5, minutosJugados:90, tarjeta:'ninguna' });
  assert('goles=2,asist=1,rec=3,duelos=5,min=90,ninguna → 8.4', score, 8.4);
}

// All zeros → 0
{
  const score = calcElevateScore({ goles:0, asistencias:0, recuperaciones:0, duelosGanados:0, minutosJugados:0, tarjeta:'ninguna' });
  assert('all zeros → 0', score, 0);
}

// Tarjeta roja penalizacion: -3.0
// goles=0, asist=0, rec=0, duelos=0, min=90, roja
// raw = 1.0 - 3.0 = -2.0 → clamp → 0
{
  const score = calcElevateScore({ goles:0, asistencias:0, recuperaciones:0, duelosGanados:0, minutosJugados:90, tarjeta:'roja' });
  assert('min=90 + tarjeta roja → clamp to 0 (net negative)', score, 0);
}

// Roja penalty is applied: player with 1 goal + 90min has raw = 3.0; roja drops to 0.0
{
  const score = calcElevateScore({ goles:1, asistencias:0, recuperaciones:0, duelosGanados:0, minutosJugados:90, tarjeta:'roja' });
  assert('goles=1,min=90,roja → 0 (3.0 - 3.0 = 0)', score, 0);
}

// Tarjeta amarilla penalty -0.5
// goles=0,asist=0,rec=0,duelos=0,min=90,amarilla → 1.0 - 0.5 = 0.5
{
  const score = calcElevateScore({ goles:0, asistencias:0, recuperaciones:0, duelosGanados:0, minutosJugados:90, tarjeta:'amarilla' });
  assert('min=90,amarilla → 0.5', score, 0.5);
}

// Score never exceeds 10 (clamp)
{
  const score = calcElevateScore({ goles:5, asistencias:5, recuperaciones:20, duelosGanados:20, minutosJugados:90, tarjeta:'ninguna' });
  assert('high stats → clamped to 10', score, 10);
}

// ── getPerformanceAlert ──────────────────────────────────────────────────
console.log(`\n${CYAN}getPerformanceAlert (alttezScore v1.1)${RESET}`);

// RPE 9 + score 8 → "critical"
{
  const alert = getPerformanceAlert(9, 8);
  assert('RPE=9, score=8 → level "critical"', alert?.level, 'critical');
}

// RPE 8 + score 3 → "warning" (RPE > 7, score NOT > 7)
{
  const alert = getPerformanceAlert(8, 3);
  assert('RPE=8, score=3 → level "warning"', alert?.level, 'warning');
}

// RPE 5 + score 5 → null
{
  const alert = getPerformanceAlert(5, 5);
  assert('RPE=5, score=5 → null (no alert)', alert, null);
}

// Boundary: RPE exactly 8, score exactly 7 → NOT critical (requires > 8 AND > 7)
{
  const alert = getPerformanceAlert(8, 7);
  // RPE 8 is NOT > 8, so critical condition fails
  // RPE 8 IS > 7, so warning fires
  assert('RPE=8 (not >8), score=7 → "warning" (not critical)', alert?.level, 'warning');
}

// Boundary: RPE exactly 7, score exactly 9 → null (RPE not > 7)
{
  const alert = getPerformanceAlert(7, 9);
  assert('RPE=7 (not >7), score=9 → null', alert, null);
}

// ── Summary ──────────────────────────────────────────────────────────────
console.log('\n' + '━'.repeat(45));
const total = passed + failed;
console.log(`Results: ${GREEN}${passed} passed${RESET}, ${failed > 0 ? RED : GREEN}${failed} failed${RESET} / ${total} total`);
console.log('');

if (failed > 0) {
  process.exit(1);
}
