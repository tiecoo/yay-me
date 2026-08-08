---
stepsCompleted:
- step-01-validate-prerequisites
- step-02-design-epics
- step-03-create-stories
inputDocuments:
- _bmad-output/planning-artifacts/prds/prd-yay-me-2026-08-08/prd.md
- _bmad-output/planning-artifacts/architecture/architecture-yay-me-2026-08-08/ARCHITECTURE-SPINE.md
---

# yay-me - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for yay-me, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- **FR-1.1:** Input achievement text and save to local storage.
- **FR-1.2:** Assign unique identifier (UUID) and ISO 8601 timestamp (`createdAt`) to each achievement.
- **FR-1.3:** Display achievements in reverse-chronological timeline or card view grouped by date.
- **FR-1.4:** Allow users to delete individual achievements from local history.
- **FR-2.1:** Display celebration modal (`CelebrationModal`) upon saving an achievement.
- **FR-2.2:** Fetch and display random celebratory GIF from GIPHY API (tag: `celebration`).
- **FR-2.3:** Maintain curated local fallback list of GIFs to display if GIPHY request fails or user is offline.
- **FR-2.4:** Display randomly selected motivational/humorous phrase alongside GIF in celebration modal.
- **FR-2.5:** Allow user to dismiss celebration modal via close button or backdrop click.
- **FR-3.1:** Request browser Notification permission upon initial user interaction/setup.
- **FR-3.2:** Check upon app load if daily notification has been triggered for current calendar date (`yay-me:last-notification`).
- **FR-3.3:** Trigger local browser notification with random motivational message if no notification was sent today and permission is granted.
- **FR-3.4:** Register Service Worker (`@angular/pwa`) to support offline capabilities and local notification triggers.

### NonFunctional Requirements

- **NFR-1:** Initial page load under 1.5 seconds on average mobile/desktop connections.
- **NFR-2:** Core functionality (viewing history, logging achievements with fallback GIFs) MUST work 100% offline via Service Worker.
- **NFR-3:** UI MUST be fully responsive and optimized for mobile touch interaction (PWA feel).
- **NFR-4:** All user achievement data MUST remain local to the user's browser device (`localStorage`).
- **NFR-5:** Third-party API keys (GIPHY) MUST be injected at build time and not committed directly to source code repositories.

### Additional Requirements

- **AD-1 (Architecture):** Feature-driven directory isolation (`core/services/`, `features/achievements/`, `shared/models/`).
- **AD-2 (Architecture):** Single Source of Truth `AchievementService` persisting to `localStorage` under `yay-me:achievements` via RxJS `BehaviorSubject`.
- **AD-3 (Architecture):** Resilient GIPHY API Fallback Strategy with `catchError` operator (2000ms timeout).
- **AD-4 (Architecture):** Idempotent Daily Notification Reminder Pattern using `yay-me:last-notification`.
- **AD-5 (Architecture):** Secret Injection via `environment.ts` for GitHub Actions and Netlify CI/CD.

### UX Design Requirements

*None (Standard PrimeNG UI controls and responsive mobile layout configured in PRD/Architecture).*

### FR Coverage Map

- **FR-1.1:** Epic 1 (Story 1.1, Story 1.2)
- **FR-1.2:** Epic 1 (Story 1.1)
- **FR-1.3:** Epic 1 (Story 1.3)
- **FR-1.4:** Epic 1 (Story 1.4)
- **FR-2.1:** Epic 2 (Story 2.2)
- **FR-2.2:** Epic 2 (Story 2.1)
- **FR-2.3:** Epic 2 (Story 2.1)
- **FR-2.4:** Epic 2 (Story 2.2)
- **FR-2.5:** Epic 2 (Story 2.2)
- **FR-3.1:** Epic 3 (Story 3.1)
- **FR-3.2:** Epic 3 (Story 3.1)
- **FR-3.3:** Epic 3 (Story 3.1)
- **FR-3.4:** Epic 3 (Story 3.2)

## Epic List

### Epic 1: Achievement Creation & Timeline Management
Users can log their personal accomplishments with automatic UUID/timestamps, view their history in a reverse-chronological PrimeNG timeline/card view, and delete past achievements stored locally.
**FRs covered:** FR-1.1, FR-1.2, FR-1.3, FR-1.4

### Epic 2: Instant Micro-Celebration & GIF Integration
Saving an achievement immediately triggers a celebratory PrimeNG modal displaying random GIPHY GIFs (or offline static GIF fallback) and motivational phrases.
**FRs covered:** FR-2.1, FR-2.2, FR-2.3, FR-2.4, FR-2.5

### Epic 3: Local Daily Reminder & PWA Integration
Users are prompted once per day with local browser notifications encouraging them to reflect and log micro-wins, with offline support powered by Angular Service Worker (`@angular/pwa`).
**FRs covered:** FR-3.1, FR-3.2, FR-3.3, FR-3.4

---

## Epic 1: Achievement Creation & Timeline Management

Users can log their personal accomplishments with automatic UUID/timestamps, view their history in a reverse-chronological PrimeNG timeline/card view, and delete past achievements stored locally.

### Story 1.1: Achievement Persistence & Service Infrastructure

As a user,  
I want a reactive achievement service that persists entries to local storage,  
So that my accomplishments are saved reliably on my device without losing data.

**Acceptance Criteria:**

**Given** the application initializes  
**When** `AchievementService` is instantiated  
**Then** it reads `localStorage['yay-me:achievements']` and initializes a reactive `BehaviorSubject<Achievement[]>` stream.

**Given** a new achievement text string  
**When** `addAchievement(text: string)` is called on `AchievementService`  
**Then** a unique UUID v4 `id` and an ISO 8601 timestamp string (`createdAt`) are automatically assigned  
**And** the entry is prepended to the `yay-me:achievements` array in `localStorage` and emitted on the reactive stream.

---

### Story 1.2: Achievement Input Form Component

As a user,  
I want an intuitive text area and submit button,  
So that I can quickly type and record my micro-wins.

**Acceptance Criteria:**

**Given** the `AchievementFormComponent` is rendered  
**When** the user types text into PrimeNG `p-inputTextarea` and clicks the "Save" `p-button` (or presses Enter)  
**Then** `AchievementService.addAchievement()` is invoked with the input text  
**And** the input text area is cleared automatically upon successful save.

**Given** the user attempts to submit an empty or whitespace-only input  
**When** the save action is triggered  
**Then** validation prevents submission and highlights the input field.

---

### Story 1.3: Reverse-Chronological Timeline View

As a user,  
I want to view my past achievements grouped by date in a timeline,  
So that I can reflect on my micro-wins over time.

**Acceptance Criteria:**

**Given** achievements exist in `localStorage`  
**When** `AchievementListComponent` renders  
**Then** achievements are grouped by calendar date and displayed in reverse-chronological order using PrimeNG `p-timeline` or `p-card` controls.

**Given** no achievements exist in storage  
**When** `AchievementListComponent` renders  
**Then** an empty state message is displayed encouraging the user to log their first win.

---

### Story 1.4: Achievement Deletion

As a user,  
I want to delete individual past achievements,  
So that I can manage and clean up my history.

**Acceptance Criteria:**

**Given** an achievement entry displayed in the timeline  
**When** the user clicks the delete button on that entry  
**Then** `AchievementService.deleteAchievement(id)` is called  
**And** the item is removed from `localStorage['yay-me:achievements']` and updated reactively in the UI.

---

## Epic 2: Instant Micro-Celebration & GIF Integration

Saving an achievement immediately triggers a celebratory PrimeNG modal displaying random GIPHY GIFs (or offline static GIF fallback) and motivational phrases.

### Story 2.1: GIPHY API Service & Resilient Fallback Strategy

As a user,  
I want a resilient GIF service that fetches celebratory GIFs with an automatic offline fallback,  
So that my celebration modal always displays a GIF even when offline or rate-limited.

**Acceptance Criteria:**

**Given** `GifService.getRandomCelebrationGif()` is invoked  
**When** the network is online and GIPHY API responds within 2000ms  
**Then** it returns a random GIF URL from `https://api.giphy.com/v1/gifs/random?api_key={{GIPHY_API_KEY}}&tag=celebration`.

**Given** the network is offline or GIPHY API request times out / errors  
**When** `catchError` is triggered  
**Then** `GifService` returns a random GIF URL from the local fallback array (`src/app/core/services/gifs.ts`).

---

### Story 2.2: Celebration Modal & Micro-Interactions

As a user,  
I want a pop-up celebration modal to appear immediately after saving an achievement,  
So that I receive instant positive reinforcement.

**Acceptance Criteria:**

**Given** an achievement is successfully saved  
**When** `CelebrationModalComponent` triggers  
**Then** a PrimeNG `p-dialog` opens immediately displaying a celebratory GIF and a randomly selected motivational/humorous phrase from `MotivationalPhrasesService`.

**Given** the celebration modal is open  
**When** the user clicks the close button, presses the ESC key, or clicks the backdrop  
**Then** the modal closes smoothly and returns focus to the achievement input.

---

## Epic 3: Local Daily Reminder & PWA Integration

Users are prompted once per day with local browser notifications encouraging them to reflect and log micro-wins, with offline support powered by Angular Service Worker (`@angular/pwa`).

### Story 3.1: Idempotent Daily Notification Reminder Service

As a user,  
I want a daily notification service that checks whether I've been reminded today,  
So that I receive a single daily reminder without duplicate popups.

**Acceptance Criteria:**

**Given** the application loads in a browser  
**When** `NotificationService.checkDailyReminder()` executes  
**Then** it compares the current date (`YYYY-MM-DD`) with `localStorage['yay-me:last-notification']`.

**Given** notification permission is granted and no notification has been sent today  
**When** the date check completes  
**Then** a local Web Notification is dispatched with a random motivational message  
**And** `localStorage['yay-me:last-notification']` is updated with today's date.

---

### Story 3.2: Angular PWA Service Worker & Asset Caching

As a user,  
I want Angular Service Worker registered,  
So that the application works 100% offline and behaves like a native PWA on mobile.

**Acceptance Criteria:**

**Given** a production build of Yay-me  
**When** loaded in a supporting browser  
**Then** `@angular/pwa` Service Worker registers successfully and caches static assets for offline usage.

**Given** the application is offline  
**When** the user opens the application  
**Then** the UI loads completely from Service Worker cache without network errors.
