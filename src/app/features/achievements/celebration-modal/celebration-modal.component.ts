import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AchievementService } from '../../../core/services/achievement.service';
import { CelebrationPhraseService } from '../../../core/services/celebration-phrase.service';
import { GifService } from '../../../core/services/gif.service';

@Component({
  selector: 'app-celebration-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ProgressSpinnerModule, ButtonModule],
  template: `
    <p-dialog
      [(visible)]="visible"
      modal="modal"
      [dismissableMask]="true"
      [closeOnEscape]="true"
      [showHeader]="false"
      [style]="{ width: '90vw', maxWidth: '420px' }"
      styleClass="celebration-dialog"
      (onHide)="onClose()"
    >
      <div class="celebration-content">
        <span class="celebration-emoji" aria-hidden="true">🎉</span>
        <h2 class="celebration-title">Mandou bem!</h2>
        <ng-container *ngIf="gifUrl && phrase; else loading">
          <img [src]="gifUrl" alt="GIF de celebração" class="celebration-gif" />
          <p class="celebration-phrase">{{ phrase }}</p>
        </ng-container>
        <ng-template #loading>
          <div class="loading-state">
            <p-progressSpinner strokeWidth="4" [style]="{ width: '2.5rem', height: '2.5rem' }"></p-progressSpinner>
            <p>Preparando sua celebração...</p>
          </div>
        </ng-template>
        <button pButton type="button" label="Continuar" class="continue-button" (click)="onClose()"></button>
      </div>
    </p-dialog>
  `,
  styles: [
    `
    .celebration-content {
      display: grid;
      gap: var(--space-3);
      justify-items: center;
      text-align: center;
      padding: var(--space-2) 0;
    }
    .celebration-emoji { font-size: 2.5rem; animation: pop 0.35s ease; }
    .celebration-title { font-size: 1.25rem; font-weight: 700; color: var(--color-text); }
    .celebration-gif {
      width: 100%;
      border-radius: var(--radius-md);
      max-height: 280px;
      object-fit: cover;
      box-shadow: var(--shadow-sm);
    }
    .celebration-phrase {
      margin: 0;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--color-primary-dark);
      background: var(--color-primary-soft);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-full);
    }
    .loading-state { display: grid; gap: var(--space-3); justify-items: center; padding: var(--space-6) 0; color: var(--color-text-muted); }
    .continue-button { width: 100%; margin-top: var(--space-2); }
    @keyframes pop {
      0% { transform: scale(0.5); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    `
  ]
})
export class CelebrationModalComponent {
  public visible = false;
  public gifUrl: string | null = null;
  public phrase: string | null = null;

  constructor(
    private gifService: GifService,
    private celebrationPhraseService: CelebrationPhraseService,
    private achievementService: AchievementService
  ) {}

  public open(achievementId: string, achievementText: string): void {
    this.visible = true;
    this.gifUrl = null;
    this.phrase = null;

    this.gifService.getRandomCelebrationGif().subscribe(url => {
      this.gifUrl = url;
    });

    this.celebrationPhraseService.getCelebrationInsights(achievementText).subscribe(({ phrase, tags }) => {
      this.phrase = phrase;
      this.achievementService.updateTags(achievementId, tags);
    });
  }

  public onClose(): void {
    this.visible = false;
  }
}
