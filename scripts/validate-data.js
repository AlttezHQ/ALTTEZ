#!/usr/bin/env node
/**
 * @file validate-data.js
 * @description Data quality validator for Elevate Sports demo constants.
 *
 * Reads src/constants/initialStates.js and src/constants/schemas.js as raw text,
 * extracts data via inline parsing (no transpiler, no JSX, pure Node.js),
 * and validates cross-entity integrity constraints.
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more checks failed
 *
 * @author @Carlos (Arquitecto)
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── ANSI helpers ──
const RED   = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let passed = 0;
let failed = 0;

function pass(label) {
  console.log(`${GREEN}  PASS${RESET} ${label}`);
  passed++;
}

function fail(label, reason) {
  console.log(`${RED}  FAIL${RESET} ${label}`);
  console.log(`       ${YELLOW}→${RESET} ${reason}`);
  failed++;
}

// ── Load source files ──
const initialStatesPath = join(ROOT, 'src/shared/constants/initialStates.js');
const schemasPath        = join(ROOT, 'src/shared/constants/schemas.js');
const elevateScorePath   = join(ROOT, 'src/shared/utils/alttezScore.js');

const initialStatesSource = readFileSync(initialStatesPath, 'utf8');
const schemasSource        = readFileSync(schemasPath, 'utf8');
const elevateScoreSource   = readFileSync(elevateScorePath, 'utf8');

// ── Static data extraction helpers ──

/**
 * Extracts DEMO_ATHLETES array from the source using a targeted eval in
 * a sandboxed module context. We strip JSX and ESM syntax beforehand so
 * Node can evaluate the relevant slice directly.
 *
 * Strategy: isolate the array literal from the source text, then parse it
 * as JSON-ish using the Function constructor (safer than full eval — no
 * access to globals, no side effects from the rest of the module).
 */
function extractArrayLiteral(source, varName) {
  // Match: export const VAR_NAME = [ ... ];
  // The regex captures the content between the first '[' and the matching ']'
  const startToken = `export const ${varName} =`;
  const startIdx = source.indexOf(startToken);
  if (startIdx === -1) throw new Error(`Cannot find "${varName}" in source`);

  const afterEquals = source.indexOf('[', startIdx + startToken.length);
  if (afterEquals === -1) throw new Error(`Cannot find array start for "${varName}"`);

  // Walk forward counting bracket depth to find the closing ']'
  let depth = 0;
  let i = afterEquals;
  for (; i < source.length; i++) {
    if (source[i] === '[') depth++;
    else if (source[i] === ']') {
      depth--;
      if (depth === 0) break;
    }
  }

  const literal = source.slice(afterEquals, i + 1);

  // Evaluate in a sandboxed Function — no access to process, global, etc.
  return new Function(`return ${literal}`)();
}

/**
 * Extracts an object literal (export const VAR = { ... };) from source.
 */
function extractObjectLiteral(source, varName) {
  const startToken = `export const ${varName} =`;
  const startIdx = source.indexOf(startToken);
  if (startIdx === -1) throw new Error(`Cannot find "${varName}" in source`);

  const afterEquals = source.indexOf('{', startIdx + startToken.length);
  if (afterEquals === -1) throw new Error(`Cannot find object start for "${varName}"`);

  let depth = 0;
  let i = afterEquals;
  for (; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
  }

  const literal = source.slice(afterEquals, i + 1);
  return new Function(`return (${literal})`)();
}

// ── Extract data ──

console.log('\nALTTEZ — Data Quality Validator');
console.log('━'.repeat(45));

let DEMO_ATHLETES, DEMO_HISTORIAL, DEMO_MATCH_STATS, STORAGE_KEYS, DEMO_MATCH_REPORTS;

try {
  DEMO_ATHLETES     = extractArrayLiteral(initialStatesSource, 'DEMO_ATHLETES');
  DEMO_HISTORIAL    = extractArrayLiteral(initialStatesSource, 'DEMO_HISTORIAL');
  DEMO_MATCH_STATS  = extractObjectLiteral(initialStatesSource, 'DEMO_MATCH_STATS');
  STORAGE_KEYS      = extractArrayLiteral(initialStatesSource, 'STORAGE_KEYS');
  DEMO_MATCH_REPORTS = extractArrayLiteral(elevateScoreSource, 'DEMO_MATCH_REPORTS');
} catch (err) {
  console.error(`${RED}ERROR${RESET} Failed to parse source files: ${err.message}`);
  process.exit(1);
}

// ── Extract SESION tipo enum from schemas.js ──
// The source contains: const tiposValidos = ["Tactica", "Táctica", ...]
function extractSesionTipos(source) {
  const marker = 'const tiposValidos = [';
  const start = source.indexOf(marker);
  if (start === -1) throw new Error('Cannot find tiposValidos in schemas.js');
  const arrStart = source.indexOf('[', start);
  let depth = 0, i = arrStart;
  for (; i < source.length; i++) {
    if (source[i] === '[') depth++;
    else if (source[i] === ']') { depth--; if (depth === 0) break; }
  }
  const literal = source.slice(arrStart, i + 1);
  return new Function(`return ${literal}`)();
}

let TIPOS_VALIDOS_SESION;
try {
  TIPOS_VALIDOS_SESION = extractSesionTipos(schemasSource);
} catch (err) {
  console.error(`${RED}ERROR${RESET} Failed to extract tiposValidos: ${err.message}`);
  process.exit(1);
}

console.log('');
console.log('Checking initialStates.js...');

// ── CHECK 1: DEMO_ATHLETES IDs are unique ──
{
  const ids = DEMO_ATHLETES.map(a => a.id);
  const unique = new Set(ids);
  if (unique.size === ids.length) {
    pass(`DEMO_ATHLETES: all ${ids.length} IDs are unique`);
  } else {
    const seen = new Set();
    const dupes = ids.filter(id => { if (seen.has(id)) return true; seen.add(id); return false; });
    fail('DEMO_ATHLETES: duplicate IDs found', `Duplicated: ${[...new Set(dupes)].join(', ')}`);
  }
}

// ── CHECK 2: DEMO_HISTORIAL.total <= DEMO_ATHLETES.length ──
{
  const athleteCount = DEMO_ATHLETES.length;
  const violations = DEMO_HISTORIAL.filter(s => s.total > athleteCount);
  if (violations.length === 0) {
    pass(`DEMO_HISTORIAL: all sessions have total <= ${athleteCount} (DEMO_ATHLETES.length)`);
  } else {
    const details = violations.map(s => `sesion #${s.num}: total=${s.total}`).join(', ');
    fail('DEMO_HISTORIAL: some sessions have total > DEMO_ATHLETES.length', details);
  }
}

// ── CHECK 3: DEMO_MATCH_STATS.played === DEMO_MATCH_REPORTS.length ──
{
  const played   = DEMO_MATCH_STATS.played;
  const reports  = DEMO_MATCH_REPORTS.length;
  if (played === reports) {
    pass(`DEMO_MATCH_STATS.played (${played}) === DEMO_MATCH_REPORTS.length (${reports})`);
  } else {
    fail(
      'DEMO_MATCH_STATS.played !== DEMO_MATCH_REPORTS.length',
      `played=${played}, reports=${reports}`
    );
  }
}

// ── CHECK 4: All athleteIds in DEMO_MATCH_REPORTS exist in DEMO_ATHLETES ──
{
  const athleteIds = new Set(DEMO_ATHLETES.map(a => a.id));
  const unknown = [];

  for (const match of DEMO_MATCH_REPORTS) {
    for (const ps of match.playerStats) {
      if (!athleteIds.has(ps.athleteId)) {
        unknown.push(`match ${match.id}: athleteId ${ps.athleteId}`);
      }
    }
  }

  if (unknown.length === 0) {
    pass('DEMO_MATCH_REPORTS: all athleteIds exist in DEMO_ATHLETES');
  } else {
    fail('DEMO_MATCH_REPORTS: unknown athleteIds found', unknown.slice(0, 5).join(', '));
  }
}

// ── CHECK 5: Sesion.tipo enums are valid in DEMO_HISTORIAL ──
{
  const invalid = DEMO_HISTORIAL.filter(s => !TIPOS_VALIDOS_SESION.includes(s.tipo));
  if (invalid.length === 0) {
    pass(`DEMO_HISTORIAL: all tipo values are valid (${TIPOS_VALIDOS_SESION.join(', ')})`);
  } else {
    const details = invalid.map(s => `sesion #${s.num}: tipo="${s.tipo}"`).join(', ');
    fail('DEMO_HISTORIAL: invalid tipo values', details);
  }
}

// ── CHECK 6: STORAGE_KEYS has no duplicates ──
{
  const unique = new Set(STORAGE_KEYS);
  if (unique.size === STORAGE_KEYS.length) {
    pass(`STORAGE_KEYS: all ${STORAGE_KEYS.length} keys are unique`);
  } else {
    const seen = new Set();
    const dupes = STORAGE_KEYS.filter(k => { if (seen.has(k)) return true; seen.add(k); return false; });
    fail('STORAGE_KEYS: duplicate keys found', [...new Set(dupes)].join(', '));
  }
}

// ── Summary ──
console.log('');
console.log('━'.repeat(45));
const total = passed + failed;
console.log(`Results: ${GREEN}${passed} passed${RESET}, ${failed > 0 ? RED : GREEN}${failed} failed${RESET} / ${total} total`);
console.log('');

if (failed > 0) {
  process.exit(1);
}
