# Epic 1 Context: Achievement Creation & Timeline Management

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Enable users to log their personal accomplishments with automatic UUID and ISO 8601 timestamps, view their complete history in a reverse-chronological timeline or card layout, and delete past achievements—all persisted client-side in browser `localStorage`.

## Stories

- Story 1.1: Achievement Persistence & Service Infrastructure
- Story 1.2: Achievement Input Form Component
- Story 1.3: Reverse-Chronological Timeline View
- Story 1.4: Achievement Deletion

## Requirements & Constraints

- **Data Privacy & Storage**: All achievement data must remain strictly local to the user's browser device in `localStorage` under the key `yay-me:achievements`. No server or remote backend is involved (`NFR-4`).
- **Data Integrity**: Every achievement record must contain a unique UUID v4 `id` and an ISO 8601 timestamp string `createdAt` (`FR-1.2`).
- **Timeline Ordering**: Achievements must be displayed grouped by calendar date in reverse-chronological order (`FR-1.3`).
- **Performance & UX**: Page initial load under 1.5s (`NFR-1`) with a responsive mobile-first touch UI (`NFR-3`).

## Technical Decisions

- **Feature-Driven Architecture (`AD-1`)**: Core services live under `src/app/core/services/`, UI components under `src/app/features/achievements/`, and domain models under `src/app/shared/models/`.
- **Single Source of Truth (`AD-2`)**: All `localStorage` reads/writes are encapsulated within `AchievementService`. UI components subscribe to a reactive RxJS `BehaviorSubject<Achievement[]>` stream exposed by `AchievementService`.
- **Data Contract (`achievement.model.ts`)**:
  ```ts
  export interface Achievement {
    id: string;        // UUID v4
    text: string;
    createdAt: string; // ISO 8601 UTC
  }
  ```

## Cross-Story Dependencies

- Story 1.1 provides `AchievementService` and `Achievement` model, which Stories 1.2, 1.3, and 1.4 consume.
