import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AchievementService } from '../../../core/services/achievement.service';
import { Observable } from 'rxjs';
import { Achievement } from '../../../shared/models/achievement.model';

interface GroupedAchievements {
  date: string;
  items: Achievement[];
}

@Component({
  selector: 'app-achievement-list',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <ng-container *ngIf="achievements$ | async as achievements">
      <ng-container *ngIf="achievements.length; else emptyState">
        <div *ngFor="let group of grouped(achievements)" class="group">
          <h3>{{ group.date }}</h3>
          <div class="cards">
            <p-card *ngFor="let item of group.items" class="achievement-card">
              <ng-template pTemplate="title">
                {{ item.createdAt | date: 'shortTime' }}
              </ng-template>
              <p>{{ item.text }}</p>
              <button pButton type="button" label="Excluir" class="p-button-text" (click)="delete(item.id)"></button>
            </p-card>
          </div>
        </div>
      </ng-container>
      <ng-template #emptyState>
        <div class="empty-state">
          <p>Você ainda não registrou nenhuma conquista.</p>
          <p>Use o formulário acima para começar.</p>
        </div>
      </ng-template>
    </ng-container>
  `,
  styles: [
    ".group { margin-bottom: 1.5rem; }",
    ".cards { display: grid; gap: 1rem; }",
    ".achievement-card { width: 100%; }",
    ".empty-state { padding: 2rem; border: 1px dashed #ccc; border-radius: 1rem; text-align: center; color: #666; }"
  ]
})
export class AchievementListComponent {
  public achievements$: Observable<Achievement[]>;

  constructor(private achievementService: AchievementService) {
    this.achievements$ = this.achievementService.achievements$;
  }

  public delete(id: string): void {
    this.achievementService.deleteAchievement(id);
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
