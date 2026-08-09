import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AchievementService } from '../../../core/services/achievement.service';
import { CelebrationPhraseService } from '../../../core/services/celebration-phrase.service';
import { burstConfetti, prefersReducedMotion } from '../../../core/services/confetti.util';
import { GifService } from '../../../core/services/gif.service';

@Component({
  selector: 'app-celebration-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ProgressSpinnerModule, ButtonModule],
  templateUrl: './celebration-modal.component.html',
  styleUrl: './celebration-modal.component.scss'
})
export class CelebrationModalComponent implements OnInit, AfterViewInit {
  @ViewChild('confettiCanvas') confettiCanvas?: ElementRef<HTMLCanvasElement>;

  public visible = false;
  public gifUrl: string | null = null;
  public phrase = '';
  public phraseFromAi = false;

  private stopConfetti: (() => void) | null = null;

  constructor(
    private gifService: GifService,
    private celebrationPhraseService: CelebrationPhraseService,
    private achievementService: AchievementService
  ) {}

  ngOnInit(): void {
    console.debug('CelebrationModalComponent.ngOnInit');
  }

  ngAfterViewInit(): void {
    console.debug('CelebrationModalComponent.ngAfterViewInit');
  }

  public open(achievementId: string, achievementText: string): void {
    console.debug('CelebrationModalComponent.open called with', { achievementId, achievementText });
    this.visible = true;
    this.gifUrl = null;
    this.phraseFromAi = false;
    // Mostra uma celebração completa na hora — a IA só "upgrada" a frase depois, sem travar o modal.
    this.phrase = this.celebrationPhraseService.getInstantPhrase();

    this.gifService.getRandomCelebrationGif().subscribe(url => {
      this.gifUrl = url;
    });

    console.debug('Calling getCelebrationInsights with', achievementText);
    this.celebrationPhraseService.getCelebrationInsights(achievementText).subscribe(({ phrase, tags }) => {
      console.debug('getCelebrationInsights result', { phrase, tags });
      if (phrase) {
        this.phrase = phrase;
        this.phraseFromAi = true;
      }
      this.achievementService.updateTags(achievementId, tags);
    });
  }

  public onShow(): void {
    if (prefersReducedMotion() || !this.confettiCanvas) {
      return;
    }
    this.stopConfetti?.();
    this.stopConfetti = burstConfetti(this.confettiCanvas.nativeElement);
  }

  public onClose(): void {
    this.stopConfetti?.();
    this.stopConfetti = null;
    this.visible = false;
  }
}
