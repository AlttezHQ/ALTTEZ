# ADR 0001: Modular Refactor Strategy for Large ALTTEZ Modules

## Status
Accepted

## Context
ALTTEZ has several oversized modules where UI, business rules, persistence, and view state live in the same file. The largest example is `CrearTorneoWizard.jsx`, but the same pressure appears in roster, proposals, competition, and training surfaces.

This creates three recurring risks:
- hard-to-review regressions because JSX and domain rules change together
- low testability because most behavior is hidden inside component bodies
- slow TypeScript migration because contracts are implicit instead of explicit

## Decision
Large modules must be split using the same five-layer boundary:

1. `UI`
   Presentational components and route wrappers only.
2. `domain`
   Types, selectors, mappers, reducers, validation rules, and pure helpers.
3. `services`
   Supabase, storage, share/export, and other I/O.
4. `store`
   Shared or persisted state transitions only.
5. `route/container`
   Feature orchestration, data loading, error boundaries, and composition.

## Rules
- New files created under `src/app/` should be `ts` or `tsx`.
- Business rules must move out of JSX before broad UI rewrites.
- Shared entities and payloads must get typed contracts before service rewrites.
- Components larger than roughly 500 lines should be treated as extraction candidates.
- Route wrappers should own `ErrorBoundary` and client-only dynamic loading when needed.

## Initial Targets
- `src/app/torneos/components/wizard/CrearTorneoWizard.jsx`
- `src/app/roster/GestionPlantilla.jsx`
- `src/app/competition/MatchCenter.jsx`
- `src/marketing/pages/PublicProposalPage.jsx`

## Consequences
- Refactors become safer because tests can target selectors/helpers before UI moves.
- Type migration becomes incremental instead of all-or-nothing.
- Route behavior stays stable while internal modules get reorganized.
