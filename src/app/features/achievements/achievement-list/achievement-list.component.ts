import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AchievementService } from '../../../core/services/achievement.service';
import { CategoryService } from '../../../core/services/category.service';
import { map, Observable } from 'rxjs';
import { Achievement } from '../../../shared/models/achievement.model';
import { Category } from '../../../shared/models/category.model';

interface GroupedAchievements {
  date: string;
  items: Achievement[];
}

const CONFIRM_TIMEOUT_MS = 3000;

@Component({
  selector: 'app-achievement-list',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <ng-container *ngIf="achievements$ | async as achievements">
      <ng-container *ngIf="achievements.length; else emptyState">
        <div *ngFor="let group of grouped(achievements)" class="group">
          <h3 class="group-title">{{ group.date }}</h3>
          <div class="cards">
            <article *ngFor="let item of group.items" class="achievement-card">
              <div class="card-body">
                <span class="time-chip"><i class="pi pi-clock"></i>{{ item.createdAt | date: 'shortTime' }}</span>
                <p class="achievement-text">{{ item.text }}</p>
                <div class="tags" *ngIf="item.tags?.length || (item.categoryId && (categoriesById | async)?.[item.categoryId])">
                  <span class="tag category-tag" *ngIf="item.categoryId && (categoriesById | async)?.[item.categoryId] as category">
                    {{ category.icon }} {{ category.label }}
                  </span>
                  <span class="tag" *ngFor="let tag of item.tags">{{ tag }}</span>
                </div>
              </div>
              <button
                pButton
                type="button"
                [attr.aria-label]="pendingDeleteId === item.id ? 'Confirmar exclusão' : 'Excluir conquista'"
                [icon]="pendingDeleteId === item.id ? 'pi pi-check' : 'pi pi-trash'"
                [label]="pendingDeleteId === item.id ? 'Confirmar' : undefined"
                class="delete-button"
                [class.delete-button--confirming]="pendingDeleteId === item.id"
                (click)="onDeleteClick(item.id)"
              ></button>
            </article>
          </div>
        </div>
      </ng-container>
      <ng-template #emptyState>
        <div class="empty-state">
          <span class="empty-emoji" aria-hidden="true">🌱</span>
          <p class="empty-title">Sua jornada começa aqui.</p>
          <p class="empty-subtitle">Registre a primeira conquista do dia acima — pode ser pequena, ela ainda conta.</p>
        </div>
      </ng-template>
    </ng-container>
  `,
  styles: [
    `
    .group { display: grid; gap: var(--space-3); }
    .group-title {
      display: inline-flex;
      align-self: flex-start;
      font-size: 0.8125rem;
      font-weight: 600;
      text-transform: capitalize;
      color: var(--color-primary-dark);
      background: var(--color-primary-soft);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
    }
    .cards { display: grid; gap: var(--space-3); }
    .achievement-card {
      width: 100%;
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: var(--space-4);
      transition: box-shadow 0.15s ease;
    }
    .achievement-card:hover { box-shadow: var(--shadow-md); }
    .card-body { flex: 1; min-width: 0; display: grid; gap: var(--space-2); }
    .time-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      align-self: flex-start;
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }
    .achievement-text { margin: 0; color: var(--color-text); line-height: 1.5; word-break: break-word; }
    .tags { display: flex; flex-wrap: wrap; gap: var(--space-1); }
    .tag {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-primary-dark);
      background: var(--color-primary-soft);
      padding: 0.125rem var(--space-2);
      border-radius: var(--radius-full);
    }
    .category-tag {
      color: var(--color-text);
      background: var(--color-border);
    }
    .delete-button {
      flex-shrink: 0;
      color: var(--color-text-muted) !important;
      background: transparent !important;
      border: none !important;
      width: 2.5rem;
      height: 2.5rem;
    }
    .delete-button--confirming {
      width: auto !important;
      color: var(--color-danger) !important;
      background: var(--color-danger-soft) !important;
      padding: 0 var(--space-3) !important;
    }
    .empty-state {
      display: grid;
      justify-items: center;
      gap: var(--space-2);
      padding: var(--space-6) var(--space-4);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-lg);
      text-align: center;
      background: var(--color-surface);
    }
    .empty-emoji { font-size: 2.5rem; }
    .empty-title { font-weight: 600; color: var(--color-text); }
    .empty-subtitle { color: var(--color-text-muted); font-size: 0.9375rem; max-width: 32ch; }
    `
  ]
})
export class AchievementListComponent {
  public achievements$: Observable<Achievement[]>;
  public categoriesById: Observable<Record<string, Category>>;
  public pendingDeleteId: string | null = null;
  private confirmTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private achievementService: AchievementService,
    private categoryService: CategoryService
  ) {
    this.achievements$ = this.achievementService.achievements$;
    this.categoriesById = this.categoryService.categories$.pipe(
      map(categories => Object.fromEntries(categories.map(category => [category.id, category])))
    );
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
