# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yay-me is a mobile-first PWA (Angular 17, standalone components) for logging small daily achievements. Entries are stored client-side in `localStorage` only — there is no backend database. A single Netlify Function calls an LLM to generate a personalized celebration phrase and tags for each achievement.

## Commands

```bash
npm install --legacy-peer-deps   # required — CI also uses --legacy-peer-deps
npm start                        # ng serve --open, dev server
npm run build                    # generate-environment.js + production build
npm run generate-env             # regenerates src/environments/environment.ci.ts from env vars
```

`npm run test` and `npm run lint` exist as scripts but are **not functional**: `angular.json` has no `test` or `lint` architect target, and no testing framework (karma/jasmine) or ESLint config is installed. There are no `*.spec.ts` files in the repo. Don't assume test/lint tooling works — verify manually (e.g. `ng build`, or exercise the UI) instead of running `npm test`/`npm run lint`.

There is no dedicated CI step for a single test — CI (`.github/workflows/ci.yml`) only runs `npm run build:ci` on push/PR to `main`.

## Git Workflow

- Branch naming: always prefix new branches with `feature/` (e.g. `feature/adicionar-sdd-template`), per `AGENTS.md`.
- **Update `README.md` before every `git push`** if the change affects app structure, features, or dependencies — this is a repo-mandated convention (`AGENTS.md`), not optional.
- Pushing any branch other than `main` auto-opens/updates a PR into `main` via `.github/workflows/auto-pr-to-main.yml` (uses `gh pr create`/`edit` with an auto-generated commit/diff summary body).
- New Software Design Documents (SDDs) go in `docs/sdd/XXXX-nome-do-recurso.md`, numbered sequentially, following the structure in `docs/sdd/0000-template.md`.

## Architecture

### Data flow — everything is local-first
`AchievementService` (`src/app/core/services/achievement.service.ts`) is the single source of truth: a `BehaviorSubject<Achievement[]>` backed by `localStorage` (`yay-me:achievements`). All reads/writes to achievements go through it — components subscribe to `achievements$`, never touch `localStorage` directly. Export/import (JSON backup) also lives here, merging by `id` and never overwriting/duplicating existing records.

### Celebration flow — AI is always an optional upgrade, never a blocker
When an achievement is saved (`AppComponent.onSaved` → `CelebrationModalComponent.open`):
1. The modal opens **immediately** with a GIF (from Giphy, or a local fallback in `gifs.ts` if no API key / request fails) and a phrase picked synchronously from the static `MOTIVATIONAL_PHRASES` list (`motivational-phrases.ts`).
2. In parallel, `CelebrationPhraseService.getCelebrationInsights()` POSTs to `/.netlify/functions/celebrate-phrase`. If it returns a phrase in time, the modal's phrase and the achievement's tags are updated in place — otherwise the static phrase silently remains and the achievement gets no tags.
3. This pattern (instant fallback UI + best-effort async AI enrichment, never awaited/blocking) is a deliberate convention — replicate it for any future AI-backed feature rather than adding loading states that block the UI.

The Netlify Function (`netlify/functions/celebrate-phrase.js`) calls Hugging Face's OpenAI-compatible router (`router.huggingface.co`, model `deepseek-ai/DeepSeek-V4-Flash-0731:novita`) using the `HF_TOKEN` env var, which exists **only server-side** (unlike `GIPHY_API_KEY`, which is baked into the client bundle at build time — see below). It has its own internal timeout (6000ms) shorter than the client's request timeout (8000ms, `CelebrationPhraseService.REQUEST_TIMEOUT_MS`) — keep that ordering if either changes, or the client will always hit its own timeout first and never see a real response.

### Build-time environment generation
There's no `.env`-driven runtime config. `scripts/generate-environment.js` runs before every build (`npm run build`/`build:ci`) and writes `src/environments/environment.ci.ts` (gitignored) from process env vars (`GIPHY_API_KEY`, `NEW_RELIC_*`, plus `GIT_SHA`/`GIT_BRANCH`/`BUILD_DATE` derived from git or CI env). Angular's `production` file replacement swaps `environment.ts` → `environment.ci.ts` at build time. `GIPHY_API_KEY` ends up client-side/public by design; secrets that must stay server-only (like `HF_TOKEN`) belong in the Netlify Function's env, never in this generated file.

### New Relic init ordering
`src/main.ts` manually constructs `window.NREUM.loader_config`/`NREUM.info` and injects the agent `<script>` tag itself — this is intentional and must stay in `main.ts` (not `index.html`), because the license key/IDs are only known after Angular's environment is resolved. Moving it back to a static `index.html` script reintroduces a prior bug where the agent loaded before the license key was available. If `newRelicLicenseKey` is empty, the agent is skipped entirely (no error).

### Streak calculation
`streak.util.ts`'s `computeStreakStats` is a pure function (easy to unit test even though no test harness currently exists). Key behavior: the current streak counts backward from today, but if today has no entry yet, the streak is still considered "alive" starting from yesterday — it only breaks after a full day passes with nothing logged. Days are grouped by local calendar day, not by 24h windows.

### Component structure
Standalone Angular components only (no NgModules). Feature components live under `src/app/features/achievements/<name>/<name>.component.ts` (inline template + styles, one file per component); shared services under `src/app/core/services/`; shared types under `src/app/shared/models/`. UI is built on PrimeNG (`lara-light-indigo` theme) plus custom CSS variables defined in `src/styles.css` (`--color-*`, `--space-*`, `--radius-*`, `--shadow-*`) — reuse these tokens rather than hardcoding colors/spacing in component styles.

### PWA / service worker
`ngsw-config.json` controls the Angular service worker (enabled only in the `production` build configuration). `src/manifest.webmanifest` + `src/assets/icons/` provide installability.

## Planning artifacts (context, not something to maintain in lockstep)

`_bmad-output/` and `_bmad/` contain BMAD-method planning output (PRDs, epics, architecture spine, sprint status) — useful for background on *why* things were built, but not guaranteed to reflect current code state. `docs/sdd/` contains the authoritative, versioned design docs for major features (celebration AI, streak/backup) and is the convention to follow for new ones.
