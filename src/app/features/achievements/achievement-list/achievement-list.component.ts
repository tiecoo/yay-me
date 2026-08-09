import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AchievementService } from '../../../core/services/achievement.service';
import { Observable } from 'rxjs';
import { Achievement } from '../../../shared/models/achievement.model';

interface GroupedAchievements {
  date: string;
  items: Achievement[];
}

const CONFIRM_TIMEOUT_MS = 3000;

@Component({
  selector: 'app-achievement-list',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './achievement-list.component.html',
  styleUrl: './achievement-list.component.scss'
})
export class AchievementListComponent {
  public achievements$: Observable<Achievement[]>;
  public pendingDeleteId: string | null = null;
  private confirmTimer?: ReturnType<typeof setTimeout>;

  constructor(private achievementService: AchievementService) {
    this.achievements$ = this.achievementService.achievements$;
  }

  public onDeleteClick(id: string): void {
    if (this.pendingDeleteId === id) {
      this.clearPendingDelete();
      this.achievementService.deleteAchievement(id);
      return;
    }

    this.clearPendingDelete();
    this.pendingDeleteId = id;
    this.confirmTimer = setTimeout(() => this.clearPendingDelete(), CONFIRM_TIMEOUT_MS);
  }

  private clearPendingDelete(): void {
    if (this.confirmTimer) {
      clearTimeout(this.confirmTimer);
    }
    this.pendingDeleteId = null;
  }

  public grouped(items: Achievement[]): GroupedAchievements[] {
    const groups: Record<string, Achievement[]> = {};
    items.forEach(item => {
      const date = new Date(item.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      groups[date] = groups[date] || [];
      groups[date].push(item);
    });

    return Object.entries(groups)
      .map(([date, items]) => ({
        date,
        items: items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }))
      .sort((a, b) => new Date(b.items[0].createdAt).getTime() - new Date(a.items[0].createdAt).getTime());
  }
}
