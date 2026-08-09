import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AchievementFormComponent, AchievementFormPayload } from './features/achievements/achievement-form/achievement-form.component';
import { AchievementListComponent } from './features/achievements/achievement-list/achievement-list.component';
import { CelebrationModalComponent } from './features/achievements/celebration-modal/celebration-modal.component';
import { StatsDashboardComponent } from './features/achievements/stats-dashboard/stats-dashboard.component';
import { BackupControlsComponent } from './features/achievements/backup-controls/backup-controls.component';
import { AuthShellComponent } from './features/auth/auth-shell/auth-shell.component';
import { LegacyImportPromptComponent } from './features/auth/legacy-import-prompt/legacy-import-prompt.component';
import { AchievementService } from './core/services/achievement.service';
import { CategoryService } from './core/services/category.service';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { User } from './shared/models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    AchievementFormComponent,
    AchievementListComponent,
    CelebrationModalComponent,
    StatsDashboardComponent,
    BackupControlsComponent,
    AuthShellComponent,
    LegacyImportPromptComponent
  ],
  template: `
    <header class="app-bar">
      <div class="app-bar-inner">
        <span class="app-bar-emoji" aria-hidden="true">🎉</span>
        <div class="app-bar-text">
          <h1>Yay-me</h1>
          <p class="tagline">Pequenas vitórias, grandes celebrações.</p>
        </div>
        <button
          *ngIf="authService.currentUser$ | async as user"
          type="button"
          class="logout-button"
          (click)="onLogout()"
          [attr.aria-label]="'Sair (' + (user.displayName || user.email) + ')'"
        >
          <i class="pi pi-sign-out"></i>
        </button>
      </div>
    </header>

    <ng-container *ngIf="authService.currentUser$ | async as user; else authGate">
      <main class="app-shell">
        <app-stats-dashboard></app-stats-dashboard>

        <section class="form-section">
          <app-achievement-form #achievementForm [errorMessage]="saveError" (saved)="onSaved($event)"></app-achievement-form>
        </section>

        <section class="list-section">
          <app-achievement-list></app-achievement-list>
        </section>

        <app-backup-controls></app-backup-controls>
      </main>

      <app-celebration-modal #celebrationModal></app-celebration-modal>
      <app-legacy-import-prompt></app-legacy-import-prompt>
    </ng-container>

    <ng-template #authGate>
      <app-auth-shell></app-auth-shell>
    </ng-template>
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
    .app-bar-text { flex: 1; min-width: 0; }
    h1 { font-size: 1.375rem; font-weight: 700; color: var(--color-text); }
    .tagline { margin-top: 0.125rem; font-size: 0.875rem; color: var(--color-text-muted); }
    .logout-button {
      flex-shrink: 0;
      width: 2.5rem;
      height: 2.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: var(--color-text-muted);
      border-radius: var(--radius-full);
      cursor: pointer;
    }
    .logout-button:hover { background: var(--color-primary-soft); }

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
export class AppComponent implements OnInit {
  @ViewChild('celebrationModal') private celebrationModal?: CelebrationModalComponent;
  @ViewChild('achievementForm') private achievementForm?: AchievementFormComponent;

  public saveError: string | null = null;

  constructor(
    public authService: AuthService,
    private achievementService: AchievementService,
    private categoryService: CategoryService,
    private notificationService: NotificationService
  ) {
    this.notificationService.checkDailyReminder();
  }

  public ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => this.onAuthChanged(user));
    this.authService.bootstrap().subscribe();
  }

  public async onSaved(payload: AchievementFormPayload): Promise<void> {
    this.saveError = null;
    try {
      const achievement = await this.achievementService.addAchievement(payload.text, payload.categoryId);
      if (achievement) {
        this.achievementForm?.reset();
        this.celebrationModal?.open(achievement.id, achievement.text);
      }
    } catch {
      this.saveError = 'Não foi possível salvar agora. Tente novamente.';
    }
  }

  public onLogout(): void {
    this.authService.logout().subscribe();
  }

  private onAuthChanged(user: User | null): void {
    if (user) {
      this.achievementService.load();
      this.categoryService.load();
    } else {
      this.achievementService.reset();
      this.categoryService.reset();
    }
  }
}
