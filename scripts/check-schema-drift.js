#!/usr/bin/env node
/**
 * @file check-schema-drift.js
 * @description Schema drift detector for Elevate Sports.
 *
 * Cross-references three sources of truth:
 *   1. docs/SCHEMA_MODEL.json  — documented entity names
 *   2. src/constants/schemas.js — ENTITIES object (runtime schema registry)
 *   3. supabase/migrations/*.sql — CREATE TABLE statements
 *
 * Reports entities present in one source but absent in another.
 * Exits with code 0 even when drift is found (drift is a warning, not a blocker)
 * so that CI surfaces the report without failing the pipeline.
 *
 * @author @Carlos (Arquitecto)
 */

import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── ANSI helpers ──
const RED    = '\x1b[31m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';

// ═══════════════════════════════════════════════════════════
// SOURCE 1: SCHEMA_MODEL.json — documented entities
// ═══════════════════════════════════════════════════════════

function extractSchemaModelEntities() {
  const schemaPath = join(ROOT, 'docs/SCHEMA_MODEL.json');
  const raw = readFileSync(schemaPath, 'utf8');
  const model = JSON.parse(raw);
  return Object.keys(model.entities || {}).map(k => k.toLowerCase());
}

// ═══════════════════════════════════════════════════════════
// SOURCE 2: schemas.js — ENTITIES runtime registry
// ═══════════════════════════════════════════════════════════

function extractSchemasJsEntities() {
  const schemasPath = join(ROOT, 'src/constants/schemas.js');
  const source = readFileSync(schemasPath, 'utf8');

  // Find: export const ENTITIES = { ... }
  const startToken = 'export const ENTITIES = {';
  const startIdx = source.indexOf(startToken);
  if (startIdx === -1) throw new Error('Cannot find ENTITIES export in schemas.js');

  const braceStart = source.indexOf('{', startIdx);
  let depth = 0, i = braceStart;
  for (; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') { depth--; if (depth === 0) break; }
  }

  const entitiesSource = source.slice(braceStart, i + 1);

  // Extract top-level keys: lines like "  Athlete: {" or "  Sesion: {"
  const keyPattern = /^\s{2}([A-Z][A-Za-z]+)\s*:/gm;
  const keys = [];
  let match;
  while ((match = keyPattern.exec(entitiesSource)) !== null) {
    keys.push(match[1].toLowerCase());
  }
  return keys;
}

// ═══════════════════════════════════════════════════════════
// SOURCE 3: supabase/migrations/*.sql — CREATE TABLE names
// ═══════════════════════════════════════════════════════════

function extractSqlTables() {
  const migrationsDir = join(ROOT, 'supabase/migrations');
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const tables = new Set();

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    // Match: CREATE TABLE [IF NOT EXISTS] tablename
    const pattern = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi;
    let m;
    while ((m = pattern.exec(sql)) !== null) {
      tables.add(m[1].toLowerCase());
    }
  }

  return [...tables];
}

// ── Comparison helpers ──

function setDiff(a, b) {
  return a.filter(x => !b.includes(x));
}

function normalize(name) {
  // Map common plural/singular and naming conventions for comparison
  // e.g. "athletes" ↔ "athlete", "sessions" ↔ "sesion"
  const MAP = {
    'athletes': 'athlete',
    'sessions': 'sesion',
    'healthsnapshots': 'healthsnapshot',
    'health_snapshots': 'healthsnapshot',
    'clubs': 'clubinfo',
    'club': 'clubinfo',
    'pagos': 'pago',
    'movimientos': 'movimiento',
    'matchstats': 'matchstats',
    'match_stats': 'matchstats',
    'finanzas': 'finanzas',
    'payments': 'pago',
    'movements': 'movimiento',
  };
  const lower = name.toLowerCase().replace(/_/g, '');
  return MAP[lower] || MAP[name.toLowerCase()] || lower;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

console.log('\nElevate Sports — Schema Drift Detector');
console.log('━'.repeat(45));

let schemaModelEntities, schemasJsEntities, sqlTables;

try {
  schemaModelEntities = extractSchemaModelEntities();
  console.log(`\n${CYAN}SCHEMA_MODEL.json${RESET} entities (${schemaModelEntities.length}):`);
  schemaModelEntities.forEach(e => console.log(`  · ${e}`));
} catch (err) {
  console.error(`${RED}ERROR${RESET} SCHEMA_MODEL.json: ${err.message}`);
  process.exit(0); // Warning only — do not block CI
}

try {
  schemasJsEntities = extractSchemasJsEntities();
  console.log(`\n${CYAN}schemas.js ENTITIES${RESET} (${schemasJsEntities.length}):`);
  schemasJsEntities.forEach(e => console.log(`  · ${e}`));
} catch (err) {
  console.error(`${RED}ERROR${RESET} schemas.js: ${err.message}`);
  process.exit(0);
}

try {
  sqlTables = extractSqlTables();
  console.log(`\n${CYAN}SQL migrations tables${RESET} (${sqlTables.length}):`);
  sqlTables.forEach(t => console.log(`  · ${t}`));
} catch (err) {
  console.error(`${RED}ERROR${RESET} supabase/migrations: ${err.message}`);
  process.exit(0);
}

// ── Normalize all sources for comparison ──
const normModel  = schemaModelEntities.map(normalize);
const normSchema = schemasJsEntities.map(normalize);
const normSql    = sqlTables.map(normalize);

console.log('\n' + '━'.repeat(45));
console.log(`${BOLD}Drift Analysis${RESET}`);

let hasDrift = false;

function reportDrift(label, missing, present) {
  if (missing.length === 0) {
    console.log(`  ${GREEN}OK${RESET}   ${label}: no drift`);
    return;
  }
  hasDrift = true;
  console.log(`  ${YELLOW}WARN${RESET} ${label}:`);
  missing.forEach(e => console.log(`         ${YELLOW}+${RESET} "${e}" found in ${present} but not in ${label}`));
}

// SCHEMA_MODEL vs schemas.js
const inModelNotInSchemas = setDiff(normModel, normSchema);
const inSchemasNotInModel = setDiff(normSchema, normModel);
reportDrift('SCHEMA_MODEL.json ← schemas.js', inSchemasNotInModel, 'schemas.js');
reportDrift('schemas.js ← SCHEMA_MODEL.json', inModelNotInSchemas, 'SCHEMA_MODEL.json');

// SCHEMA_MODEL vs SQL
const inModelNotInSql = setDiff(normModel, normSql);
const inSqlNotInModel = setDiff(normSql, normModel);
reportDrift('SCHEMA_MODEL.json ← SQL', inSqlNotInModel, 'SQL migrations');
reportDrift('SQL migrations ← SCHEMA_MODEL.json', inModelNotInSql, 'SCHEMA_MODEL.json');

// schemas.js vs SQL
const inSchemasNotInSql = setDiff(normSchema, normSql);
const inSqlNotInSchemas = setDiff(normSql, normSchema);
reportDrift('schemas.js ← SQL', inSqlNotInSchemas, 'SQL migrations');
reportDrift('SQL migrations ← schemas.js', inSchemasNotInSql, 'schemas.js');

console.log('\n' + '━'.repeat(45));

if (hasDrift) {
  console.log(`${YELLOW}Schema drift detected.${RESET} Review the report above.`);
  console.log('This is a WARNING — CI pipeline continues.');
  console.log('');
  // Exit 0: drift is expected during migration phases. Not a CI blocker.
  process.exit(0);
} else {
  console.log(`${GREEN}No schema drift detected across all three sources.${RESET}`);
  console.log('');
  process.exit(0);
}
