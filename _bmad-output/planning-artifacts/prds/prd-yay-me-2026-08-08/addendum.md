# Addendum — Technical Specifications & Pipeline (Yay-me)

## 1. Technical Stack Architecture
- **Framework:** Angular (Standalone Components, latest stable)
- **UI Design System:** PrimeNG + PrimeIcons + PrimeFlex
- **State Management:** Angular Services + RxJS (`BehaviorSubject` for `localStorage` reactive updates)
- **Persistence:** Browser `localStorage` key `yay-me:achievements`
- **PWA:** Angular Service Worker (`@angular/pwa`) + Web Notifications API
- **Testing:**
  - Unit Tests: Jest
  - End-to-End Tests: Playwright
- **Hosting & CI/CD:** GitHub Actions + Netlify (automatic deploy on `main` push & PR previews)

## 2. File Organization (`src/app/`)
```text
src/app/
  core/
    services/
      achievement.service.ts
      notification.service.ts
      motivational-phrases.ts
      gifs.ts
  features/
    achievements/
      achievement-list/
      achievement-form/
      celebration-modal/
  shared/
    models/
      achievement.model.ts
  app.config.ts
  app.routes.ts
```

## 3. Environment & Secret Management
- **GIPHY_API_KEY**:
  - Local Dev: `.env` (git-ignored)
  - GitHub Actions: Repository secret `GIPHY_API_KEY`
  - Netlify: Environment variable in site settings
