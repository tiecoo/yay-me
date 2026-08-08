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
    <main class="app-shell">
      <section class="hero">
        <h1>Yay-me</h1>
        <p>Registre sua conquista e receba uma celebração instantânea.</p>
      </section>

      <section class="form-section">
        <app-achievement-form (saved)="onSaved($event)"></app-achievement-form>
      </section>

      <section class="list-section">
        <app-achievement-list></app-achievement-list>
      </section>

      <app-celebration-modal #celebrationModal></app-celebration-modal>
    </main>
  `,
  styles: [
    ".app-shell { max-width: 960px; margin: 0 auto; padding: 1.5rem; display: grid; gap: 2rem; }",
    ".hero { text-align: center; }",
    ".form-section, .list-section { width: 100%; }",
    "h1 { margin-bottom: 0.5rem; font-size: 2.5rem; }",
    "p { margin: 0; color: #555; }"
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
