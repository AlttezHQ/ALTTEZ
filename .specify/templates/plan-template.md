# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See
`.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

**Language/Version**: TypeScript preferred in `src/app/`, React 19, Next.js 16

**Primary Dependencies**: Next.js App Router, React, Tailwind CSS v4, CSS
Modules, Zustand, Supabase

**Storage**: Supabase and browser/local persisted state where already present

**Testing**: `npm run lint`, targeted tests in `src/tests/`, optional
`npm run build` for integration-risky changes

**Target Platform**: Web application, responsive desktop/mobile

**Project Type**: Single Next.js application with isolated analytics pipeline

**Performance Goals**: Preserve current UX responsiveness and avoid regressions
in route transitions, client state, and core views

**Constraints**: Respect `src/app` TypeScript rule for new files, keep `docs/`
local, emit artifacts only inside `artifacts/`, do not change `data/` unless
explicitly requested

**Scale/Scope**: Feature-local changes inside the existing modular frontend and
shared platform services

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] Domain placement is explicit and uses the real project boundaries:
      `src/app/`, `src/components/`, `src/shared/`, `src/marketing/`, `data/`
- [ ] Any new file inside `src/app/` is planned as TypeScript/TSX
- [ ] Business rules, selectors, mappers and persistence are separated from
      presentational components
- [ ] Styling reuses `src/index.css` tokens and local encapsulation
      (CSS Modules and/or aligned Tailwind v4 usage)
- [ ] The plan protects secrets, keeps `docs/` local, writes temporary outputs
      only to `artifacts/`, and does not modify `data/` unless explicitly asked
- [ ] Validation covers `npm run lint` and any required `src/tests` and/or
      `npm run build` checks proportional to the change

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── app/                # Next.js App Router routes and feature modules
├── components/         # Global reusable React components
├── marketing/          # Landing and commercial experiences
├── shared/             # Shared auth, API clients, layouts, UI primitives
└── tests/              # Automated tests

data/
├── dags/               # Airflow workflows when applicable
├── dbt/                # dbt models and transformations
└── ...                 # Analytics scripts and pipeline assets
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above, including any module-specific `domain/`,
`components/`, `services/`, `store/`, or `utils/` folders created under
`src/app/<feature>/`]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., new route in JS] | [current need] | [why TSX migration is blocked] |
| [e.g., new global token] | [specific design need] | [why existing tokens fail] |
