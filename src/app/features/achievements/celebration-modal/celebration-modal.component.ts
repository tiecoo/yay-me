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

        <div class="gif-slot">
          <img *ngIf="gifUrl" [src]="gifUrl" alt="GIF de celebração" class="celebration-gif" />
          <div *ngIf="!gifUrl" class="gif-placeholder">
            <p-progressSpinner strokeWidth="4" [style]="{ width: '2rem', height: '2rem' }"></p-progressSpinner>
          </div>
        </div>

        <p class="celebration-phrase" [class.celebration-phrase--updated]="phraseFromAi">{{ phrase }}</p>

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
    .gif-slot { width: 100%; }
    .celebration-gif {
      width: 100%;
      border-radius: var(--radius-md);
      max-height: 280px;
      object-fit: cover;
      box-shadow: var(--shadow-sm);
      animation: pop 0.25s ease;
    }
    .gif-placeholder {
      width: 100%;
      height: 160px;
      border-radius: var(--radius-md);
      background: var(--color-primary-soft);
      display: grid;
      place-items: center;
    }
    .celebration-phrase {
      margin: 0;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--color-primary-dark);
      background: var(--color-primary-soft);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-full);
      transition: background-color 0.2s ease;
    }
    .celebration-phrase--updated { animation: pulse 0.4s ease; }
    .continue-button { width: 100%; margin-top: var(--space-2); }
    @keyframes pop {
      0% { transform: scale(0.5); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      40% { transform: scale(1.04); }
      100% { transform: scale(1); }
    }
    `
  ]
})
export class CelebrationModalComponent {
  public visible = false;
  public gifUrl: string | null = null;
  public phrase = '';
  public phraseFromAi = false;

  constructor(
    private gifService: GifService,
    private celebrationPhraseService: CelebrationPhraseService,
    private achievementService: AchievementService
  ) {}

  public open(achievementId: string, achievementText: string): void {
    this.visible = true;
    this.gifUrl = null;
    this.phraseFromAi = false;
    // Mostra uma celebração completa na hora — a IA só "upgrada" a frase depois, sem travar o modal.
    this.phrase = this.celebrationPhraseService.getInstantPhrase();

    this.gifService.getRandomCelebrationGif().subscribe(url => {
      this.gifUrl = url;
    });

    this.celebrationPhraseService.getCelebrationInsights(achievementText).subscribe(({ phrase, tags }) => {
      if (phrase) {
        this.phrase = phrase;
        this.phraseFromAi = true;
      }
      this.achievementService.updateTags(achievementId, tags);
    });
  }

  public onClose(): void {
    this.visible = false;
  }
}
