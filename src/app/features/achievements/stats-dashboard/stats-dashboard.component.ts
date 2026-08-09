import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AchievementService } from '../../../core/services/achievement.service';
import { computeStreakStats, StreakStats } from '../../../core/services/streak.util';

const RING_RADIUS = 34;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const WEEKLY_GOAL_DAYS = 7;

@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dials" *ngIf="stats$ | async as stats" [class.dials--hidden]="!stats.total">
      <div class="dial dial--secondary" title="Recorde de dias seguidos">
        <span class="dial-icon" aria-hidden="true">🏆</span>
        <span class="dial-value">{{ stats.longestStreak }}</span>
      </div>

      <div class="dial dial--primary" title="Sequência atual de dias seguidos">
        <svg class="dial-ring" viewBox="0 0 80 80" aria-hidden="true">
          <circle class="dial-ring-track" cx="40" cy="40" r="34"></circle>
          <circle
            class="dial-ring-progress"
            cx="40"
            cy="40"
            r="34"
            [attr.stroke-dasharray]="ringCircumference"
            [attr.stroke-dashoffset]="ringOffset(stats.currentStreak)"
          ></circle>
        </svg>
        <div class="dial-center">
          <span class="dial-icon" aria-hidden="true">🔥</span>
          <span class="dial-value">{{ stats.currentStreak }}</span>
        </div>
      </div>

      <div class="dial dial--secondary" title="Total de conquistas registradas">
        <span class="dial-icon" aria-hidden="true">✅</span>
        <span class="dial-value">{{ stats.total }}</span>
      </div>
    </div>
  `,
  styles: [
    `
    .dials {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-4);
    }
    .dials--hidden { display: none; }

    .dial { display: grid; place-items: center; }

    .dial--secondary {
      width: 3.25rem;
      height: 3.25rem;
      border-radius: 50%;
      background: var(--color-primary-soft);
      box-shadow: var(--shadow-sm);
    }
    .dial--secondary .dial-icon { font-size: 1rem; line-height: 1; }
    .dial--secondary .dial-value { font-size: 0.9375rem; font-weight: 700; color: var(--color-primary-dark); }

    .dial--primary {
      position: relative;
      width: 5rem;
      height: 5rem;
    }
    .dial-ring { width: 100%; height: 100%; transform: rotate(-90deg); }
    .dial-ring-track {
      fill: none;
      stroke: var(--color-primary-soft);
      stroke-width: 7;
    }
    .dial-ring-progress {
      fill: none;
      stroke: var(--color-accent);
      stroke-width: 7;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.4s ease;
    }
    .dial-center {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      line-height: 1.1;
    }
    .dial-center .dial-icon { font-size: 1.25rem; }
    .dial-center .dial-value { font-size: 1.0625rem; font-weight: 800; color: var(--color-text); }
    `
  ]
})
export class StatsDashboardComponent {
  public stats$: Observable<StreakStats>;
  public readonly ringCircumference = RING_CIRCUMFERENCE;

  constructor(private achievementService: AchievementService) {
    this.stats$ = this.achievementService.achievements$.pipe(map(achievements => computeStreakStats(achievements)));
  }

  public ringOffset(currentStreak: number): number {
    const progress = Math.min(currentStreak, WEEKLY_GOAL_DAYS) / WEEKLY_GOAL_DAYS;
    return RING_CIRCUMFERENCE * (1 - progress);
  }
}
