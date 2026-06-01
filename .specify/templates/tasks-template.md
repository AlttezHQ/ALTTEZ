---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**: `plan.md` and `spec.md`; add supporting docs only when they
exist for the feature

**Tests**: Add test tasks whenever the feature changes domain rules, selectors,
stores, services, auth, storage, or another behavior with regression risk. Only
omit tests when the specification makes the omission explicit and low-risk.

**Organization**: Group tasks by user story so each story can be implemented,
validated and demonstrated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js app**: `src/app/` for routes and feature modules
- **Shared frontend code**: `src/components/`, `src/shared/`, `src/marketing/`
- **Tests**: `src/tests/`
- **Analytics pipeline**: `data/` only when explicitly in scope
- Adapt all sample paths below to the structure captured in `plan.md`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm placement, scaffolding and validation strategy.

- [ ] T001 Create or confirm the target directories from `plan.md`
- [ ] T002 [P] Add or update feature scaffolding in the correct module boundary
- [ ] T003 [P] Capture the validation commands required by the constitution

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user stories.

- [ ] T004 Setup or update shared state/store contracts
- [ ] T005 [P] Add domain selectors, constants, types or mappers
- [ ] T006 [P] Add service/integration adapters and validation boundaries
- [ ] T007 Create base UI shells/components required across stories
- [ ] T008 Protect environment/config usage and shared error handling
- [ ] T009 Confirm no unintended scope bleed into `docs/`, `artifacts/`, or `data/`

**Checkpoint**: Foundational work complete; user stories can proceed.

---

## Phase 3: User Story 1 - [Title] (Priority: P1)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1

- [ ] T010 [P] [US1] Add or update targeted tests in `src/tests/`
- [ ] T011 [P] [US1] Verify the independent journey manually or through
      integration coverage as specified

### Implementation for User Story 1

- [ ] T012 [P] [US1] Implement or update domain/state logic in planned files
- [ ] T013 [P] [US1] Implement or update local UI components/styles
- [ ] T014 [US1] Wire services, store and presentation layers together
- [ ] T015 [US1] Add validation, loading and error states
- [ ] T016 [US1] Confirm styling uses existing tokens and responsive behavior
- [ ] T017 [US1] Run required validation commands for this story

**Checkpoint**: User Story 1 is functional and testable on its own.

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2

- [ ] T018 [P] [US2] Add or update targeted tests in `src/tests/`
- [ ] T019 [P] [US2] Verify the independent journey manually or through
      integration coverage as specified

### Implementation for User Story 2

- [ ] T020 [P] [US2] Implement or update domain/state logic in planned files
- [ ] T021 [US2] Implement the route, component or service layer changes
- [ ] T022 [US2] Integrate with existing shared components/contracts if needed
- [ ] T023 [US2] Run required validation commands for this story

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3

- [ ] T024 [P] [US3] Add or update targeted tests in `src/tests/`
- [ ] T025 [P] [US3] Verify the independent journey manually or through
      integration coverage as specified

### Implementation for User Story 3

- [ ] T026 [P] [US3] Implement or update domain/state logic in planned files
- [ ] T027 [US3] Implement the route, component or service layer changes
- [ ] T028 [US3] Run required validation commands for this story

**Checkpoint**: All user stories are independently functional.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [ ] TXXX [P] Versioned documentation updates outside `docs/`
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional targeted tests in `src/tests/`
- [ ] TXXX Security hardening
- [ ] TXXX Run `npm run lint`
- [ ] TXXX Run `npm run build` when routes, providers, config or shared
      contracts changed
- [ ] TXXX Confirm temporary artifacts stayed inside `artifacts/`

---

## Dependencies & Execution Order

- Setup completes first.
- Foundational work blocks all user stories.
- User stories proceed by priority once foundations are ready.
- Polish happens after the selected user stories are complete.
- Within each story, tests and domain contracts come before broad UI wiring.

## Notes

- Every task MUST name the file path it affects.
- Avoid creating parallel architecture outside the module boundaries in `plan.md`.
- If `data/` is out of scope, keep it untouched.
- If validation is skipped, the task list MUST say why.
