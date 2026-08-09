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
  templateUrl: './stats-dashboard.component.html',
  styleUrl: './stats-dashboard.component.scss'
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
