import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AchievementFormComponent } from './features/achievements/achievement-form/achievement-form.component';
import { AchievementListComponent } from './features/achievements/achievement-list/achievement-list.component';
import { CelebrationModalComponent } from './features/achievements/celebration-modal/celebration-modal.component';
import { AchievementService } from './core/services/achievement.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AchievementFormComponent, AchievementListComponent, CelebrationModalComponent],
  template: `
    <header class="app-bar">
      <div class="app-bar-inner">
        <span class="app-bar-emoji" aria-hidden="true">🎉</span>
        <div>
          <h1>Yay-me</h1>
          <p class="tagline">Pequenas vitórias, grandes celebrações.</p>
        </div>
      </div>
    </header>

    <main class="app-shell">
      <section class="form-section">
        <app-achievement-form (saved)="onSaved($event)"></app-achievement-form>
      </section>

      <section class="list-section">
        <app-achievement-list></app-achievement-list>
      </section>
    </main>

    <app-celebration-modal #celebrationModal></app-celebration-modal>
  `,
  styles: [
    `
    .app-bar {
      position: sticky;
      top: 0;
      z-index: 10;
      padding: env(safe-area-inset-top, 0) 0 0;
      background: rgba(245, 244, 255, 0.85);
      -webkit-backdrop-filter: blur(8px);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--color-border);
    }
    .app-bar-inner {
      max-width: 640px;
      margin: 0 auto;
      padding: var(--space-4) var(--space-5);
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    .app-bar-emoji { font-size: 1.75rem; line-height: 1; }
    h1 { font-size: 1.375rem; font-weight: 700; color: var(--color-text); }
    .tagline { margin-top: 0.125rem; font-size: 0.875rem; color: var(--color-text-muted); }

    .app-shell {
      max-width: 640px;
      margin: 0 auto;
      padding: var(--space-5) clamp(1rem, 4vw, 1.5rem) calc(var(--space-6) + env(safe-area-inset-bottom, 0));
      display: grid;
      gap: var(--space-6);
    }
    `
  ]
})
export class AppComponent {
  @ViewChild('celebrationModal') private celebrationModal?: CelebrationModalComponent;

  constructor(
    private achievementService: AchievementService,
    private notificationService: NotificationService
  ) {
    this.notificationService.checkDailyReminder();
  }

  public onSaved(text: string): void {
    const achievement = this.achievementService.addAchievement(text);
    if (achievement) {
      this.openModal();
    }
  }

  private openModal(): void {
    this.celebrationModal?.open();
  }
}
