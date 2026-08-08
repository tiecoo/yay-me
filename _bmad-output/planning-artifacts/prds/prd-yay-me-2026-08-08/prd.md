---
title: Yay-me Product Requirement Document
status: final
created: 2026-08-08
updated: 2026-08-08
---

# PRD — Yay-me

## 1. Executive Summary & Vision

**Yay-me** is a lightweight, privacy-focused Single Page Application (SPA) designed to help users track, celebrate, and reflect on their daily personal accomplishments. Built as a client-only Web PWA, Yay-me turns micro-wins into instant celebrations through motivational messages, random celebratory GIFs, and non-intrusive daily reminders.

### 1.1 Core Value Proposition
- **Instant Positive Feedback:** Every logged achievement triggers a joyful celebration modal.
- **Privacy First & Zero Friction:** 100% client-side persistence (`localStorage`); no accounts, logins, or external databases required.
- **Daily Reflection Habits:** Local reminder notifications encourage consistent daily tracking.

---

## 2. Target Audience & User Journeys

### 2.1 Target Audience
- **Primary Persona:** Solo developers, students, and professionals seeking a frictionless, personal tool to track daily micro-wins without complex project management overhead.

### 2.2 Core User Journey (UJ-1: Logging a Micro-Win)
1. **Trigger:** The user completes a task or personal win during their day.
2. **Action:** The user opens Yay-me and types their accomplishment into the input field (`AchievementFormComponent`).
3. **Submit:** The user clicks "Save Achievement" (or presses Enter).
4. **Celebration:** The `CelebrationModalComponent` pops up immediately, featuring:
   - A random celebration GIF (via GIPHY API or local fallback).
   - A random motivational/funny congratulatory phrase.
5. **Reflection:** The achievement is added to the top of the user's chronological timeline (`AchievementListComponent`).

---

## 3. Functional Requirements (FRs)

### FR-1: Achievement Management
- **FR-1.1:** The system MUST allow users to input achievement text and save it to local storage.
- **FR-1.2:** The system MUST assign a unique identifier (UUID) and an ISO 8601 timestamp (`createdAt`) to each saved achievement.
- **FR-1.3:** The system MUST display all saved achievements in a reverse-chronological timeline or card view grouped by date.
- **FR-1.4:** `[ASSUMPTION]` The system MUST allow users to delete individual achievements from their local history.

### FR-2: Celebration & Micro-Interactions
- **FR-2.1:** Upon saving an achievement, the system MUST display a celebration modal (`CelebrationModal`).
- **FR-2.2:** The celebration modal MUST fetch and display a random celebratory GIF from the GIPHY API (tag: `celebration`).
- **FR-2.3:** The system MUST maintain a curated local fallback list of GIFs to display if the GIPHY API request fails or the user is offline.
- **FR-2.4:** The modal MUST display a randomly selected motivational/humorous phrase alongside the GIF.
- **FR-2.5:** The user MUST be able to dismiss the modal via a close button or backdrop click.

### FR-3: Local Daily Reminder Notifications
- **FR-3.1:** The system MUST request browser Notification permission upon initial user interaction or setup.
- **FR-3.2:** Upon app load, the system MUST check if a daily notification has been triggered for the current calendar date (`yay-me:last-notification`).
- **FR-3.3:** If no notification was sent today and permission is granted, the system MUST trigger a local browser notification with a random motivational message.
- **FR-3.4:** The system MUST register a Service Worker (`@angular/pwa`) to support offline capabilities and local notification triggers.

---

## 4. Non-Functional Requirements (NFRs)

### 4.1 Performance & Responsiveness
- **NFR-1 (Load Time):** Initial page load under 1.5 seconds on average mobile/desktop connections.
- **NFR-2 (Offline First):** Core functionality (viewing history, logging achievements with fallback GIFs) MUST work 100% offline via Service Worker.

### 4.2 Usability & Accessibility
- **NFR-3 (Mobile Responsive):** The UI MUST be fully responsive and optimized for mobile touch interaction (PWA feel).

### 4.3 Security & Privacy
- **NFR-4 (Zero Data Collection):** All user achievement data MUST remain local to the user's browser device (`localStorage`).
- **NFR-5 (API Key Protection):** Third-party API keys (GIPHY) MUST be injected at build time and not committed directly to source code repositories.

---

## 5. System Constraints & Known Limitations

- **Browser Notification Limits:** Local notifications depend on active browser session/background state; notifications cannot be guaranteed when the app is completely closed on iOS.
- **GIPHY API Rate Limits:** API calls are subject to free-tier rate limits; the app must gracefully fallback to local GIF assets without throwing user-facing errors.

---

## 6. Success Metrics & Counter-Metrics

### 6.1 Success Metrics
- **Retention & Consistency:** Number of consecutive days with at least 1 achievement logged.
- **Local Conversion:** High percentage of notification permission acceptance.

### 6.2 Counter-Metrics
- **Modal Fatigue:** User dismissal rate of celebration modals within <1 second (indicates over-stimulation or annoying UX).

---

## 7. Open Items & Assumptions

- **[ASSUMPTION-1]**: Edit capability for existing achievements is omitted in v1 to keep the UX minimal.
- **[ASSUMPTION-2]**: Export/Import of local storage data (JSON backup) is deferred to v2.
