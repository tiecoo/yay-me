import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable, map, scan } from 'rxjs';
import { AchievementService } from '../../../core/services/achievement.service';
import { computeStreakStats, StreakStats } from '../../../core/services/streak.util';

const RING_RADIUS = 34;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const WEEKLY_GOAL_DAYS = 7;

export interface StreakStatsView {
  stats: StreakStats;
  /** true só na emissão em que o streak atual cresceu em relação à anterior — dispara o destaque visual uma vez. */
  streakIncreased: boolean;
}

const INITIAL_VIEW: StreakStatsView = {
  stats: { currentStreak: 0, longestStreak: 0, total: 0 },
  streakIncreased: false
};

@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-dashboard.component.html',
  styleUrl: './stats-dashboard.component.scss'
})
export class StatsDashboardComponent {
  public statsView$: Observable<StreakStatsView>;
  public readonly ringCircumference = RING_CIRCUMFERENCE;

  constructor(private achievementService: AchievementService) {
    this.statsView$ = this.achievementService.achievements$.pipe(
      map(achievements => computeStreakStats(achievements)),
      scan(
        (previous, stats) => ({ stats, streakIncreased: stats.currentStreak > previous.stats.currentStreak }),
        INITIAL_VIEW
      )
    );
  }

  public ringOffset(currentStreak: number): number {
    const progress = Math.min(currentStreak, WEEKLY_GOAL_DAYS) / WEEKLY_GOAL_DAYS;
    return RING_CIRCUMFERENCE * (1 - progress);
  }
}
