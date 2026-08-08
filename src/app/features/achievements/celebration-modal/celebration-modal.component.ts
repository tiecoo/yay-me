import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { GifService } from '../../../core/services/gif.service';
import { MOTIVATIONAL_PHRASES } from '../../../core/services/motivational-phrases';

@Component({
  selector: 'app-celebration-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ProgressSpinnerModule],
  template: `
    <p-dialog header="Parabéns!" [(visible)]="visible" modal="modal" [dismissableMask]="true" [closeOnEscape]="true" [style]="{ width: '90vw', maxWidth: '420px' }" (onHide)="onClose()">
      <ng-container *ngIf="gifUrl; else loading">
        <div class="celebration-content">
          <img [src]="gifUrl" alt="Celebration GIF" class="celebration-gif" />
          <p class="celebration-text">{{ phrase }}</p>
        </div>
      </ng-container>
      <ng-template #loading>
        <div class="loading-state">
          <p-progressSpinner></p-progressSpinner>
          <p>Carregando celebração...</p>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [
    ".celebration-content { display: grid; gap: 1rem; place-items: center; text-align: center; }",
    ".celebration-gif { width: 100%; border-radius: 1rem; max-height: 320px; object-fit: contain; }",
    ".celebration-text { margin: 0; font-size: 1rem; font-weight: 600; }",
    ".loading-state { display: grid; gap: 1rem; place-items: center; padding: 2rem 0; }"
  ]
})
export class CelebrationModalComponent {
  public visible = false;
  public gifUrl: string | null = null;
  public phrase = '';

  constructor(private gifService: GifService) {}

  public open(): void {
    this.visible = true;
    this.phrase = this.getRandomPhrase();
    this.gifUrl = null;

    this.gifService.getRandomCelebrationGif().subscribe(url => {
      this.gifUrl = url;
    });
  }

  public onClose(): void {
    this.visible = false;
  }

  private getRandomPhrase(): string {
    const index = Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length);
    return MOTIVATIONAL_PHRASES[index];
  }
}
