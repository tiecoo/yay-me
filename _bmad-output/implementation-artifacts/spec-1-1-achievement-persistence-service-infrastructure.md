---
title: 'Story 1.1: Achievement Persistence & Service Infrastructure'
type: 'feature'
created: '2026-08-08'
status: 'ready-for-dev'
review_loop_iteration: 0
context:
  - _bmad-output/implementation-artifacts/epic-1-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The application requires a single source of truth for persisting achievement records in local storage (`yay-me:achievements`) with reactive updates across Angular components.

**Approach:** Create the `Achievement` TypeScript interface (`src/app/shared/models/achievement.model.ts`) and `AchievementService` singleton (`src/app/core/services/achievement.service.ts`) using an RxJS `BehaviorSubject` stream that syncs with `localStorage`.

## Boundaries & Constraints

**Always:**
- Assign UUID v4 to `id` and ISO 8601 UTC string (`new Date().toISOString()`) to `createdAt`.
- Encapsulate all `localStorage['yay-me:achievements']` reads and writes inside `AchievementService`.
- Expose `achievements$: Observable<Achievement[]>` for reactive UI subscriptions.

**Ask First:**
- Modifying storage keys or data schema format.

**Never:**
- Allow UI components to directly manipulate `localStorage` or bypass `AchievementService`.
- Introduce backend HTTP calls or external database dependencies.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Cold Start | `localStorage` empty | `achievements$` emits empty array `[]` | Clean initialization |
| Existing Storage | Valid JSON array in `localStorage` | `achievements$` emits parsed `Achievement[]` array | If JSON parse fails, log error and reset to `[]` |
| Add Achievement | `addAchievement("Ran 5km")` | New achievement prepended; `localStorage` updated; `achievements$` emits updated array | Trim whitespace; reject empty strings |
| Delete Achievement | `deleteAchievement(id)` | Achievement removed; `localStorage` updated; `achievements$` emits updated array | No-op if ID not found |

</frozen-after-approval>

## Code Map

- `src/app/shared/models/achievement.model.ts` -- TypeScript interface definition (`id`, `text`, `createdAt`).
- `src/app/core/services/achievement.service.ts` -- Singleton Angular service managing `BehaviorSubject` state & `localStorage` CRUD.

## Tasks & Acceptance

**Execution:**
- [ ] `src/app/shared/models/achievement.model.ts` -- Create `Achievement` interface -- Defines data shape for achievements.
- [ ] `src/app/core/services/achievement.service.ts` -- Implement `AchievementService` with `BehaviorSubject` & `localStorage` -- Provides reactive CRUD and persistence.

**Acceptance Criteria:**
- Given the application initializes, when `AchievementService` is instantiated, then it reads `localStorage['yay-me:achievements']` and emits the initial `Achievement[]` array on `achievements$`.
- Given a valid text string, when `addAchievement(text)` is called, then a new `Achievement` with UUID `id` and ISO timestamp `createdAt` is saved to `localStorage` and emitted on `achievements$`.
- Given an achievement ID, when `deleteAchievement(id)` is called, then the matching achievement is removed from `localStorage` and `achievements$` emits the updated list.

## Verification

**Commands:**
- `npx ng test --watch=false` -- expected: All unit tests pass cleanly.
