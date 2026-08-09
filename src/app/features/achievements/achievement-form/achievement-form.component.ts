import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Observable } from 'rxjs';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../shared/models/category.model';

const MAX_LENGTH = 280;

export interface AchievementFormPayload {
  text: string;
  categoryId: string | null;
}

@Component({
  selector: 'app-achievement-form',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextareaModule, ButtonModule, DropdownModule],
  template: `
    <div class="achievement-form">
      <label class="form-label" for="achievement-input">Hoje eu consegui...</label>
      <textarea
        id="achievement-input"
        pInputTextarea
        rows="3"
        [(ngModel)]="text"
        [maxlength]="maxLength"
        (keydown.control.enter)="save()"
        (keydown.meta.enter)="save()"
        placeholder="Ex.: terminei aquele relatório chato, fui na academia, liguei pra minha mãe..."
        class="achievement-input"
      ></textarea>

      <p-dropdown
        [options]="categories$ | async"
        [(ngModel)]="categoryId"
        optionLabel="label"
        optionValue="id"
        placeholder="Categoria (opcional)"
        [showClear]="true"
        styleClass="category-dropdown"
      >
        <ng-template let-category pTemplate="item">
          <span>{{ category.icon }} {{ category.label }}</span>
        </ng-template>
        <ng-template let-category pTemplate="selectedItem">
          <span *ngIf="category">{{ category.icon }} {{ category.label }}</span>
        </ng-template>
      </p-dropdown>

      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

      <div class="form-footer">
        <span class="char-count" [class.char-count--limit]="remaining <= 20">{{ remaining }} caracteres restantes</span>
        <button
          pButton
          type="button"
          label="Salvar conquista"
          icon="pi pi-check"
          class="save-button"
          (click)="save()"
          [disabled]="!text.trim()"
        ></button>
      </div>
    </div>
  `,
  styles: [
    `
    .achievement-form {
      display: grid;
      gap: var(--space-3);
      width: 100%;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      padding: var(--space-5);
    }
    .form-label { font-size: 0.9375rem; font-weight: 600; color: var(--color-text); }
    .achievement-input {
      width: 100%;
      min-height: 96px;
      resize: vertical;
      padding: var(--space-4);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      font-size: 1rem;
      line-height: 1.5;
      background: var(--color-primary-soft);
      color: var(--color-text);
    }
    .achievement-input:focus {
      border-color: var(--color-primary);
      outline: none;
    }
    :host ::ng-deep .category-dropdown { width: 100%; }
    .form-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      flex-wrap: wrap;
    }
    .char-count { font-size: 0.8125rem; color: var(--color-text-muted); }
    .char-count--limit { color: var(--color-danger); }
    .error { margin: 0; font-size: 0.8125rem; color: var(--color-danger); }
    .save-button { width: 100%; }
    @media (min-width: 480px) {
      .save-button { width: auto; margin-left: auto; }
    }
    `
  ]
})
export class AchievementFormComponent {
  @Input() errorMessage: string | null = null;
  @Output() saved = new EventEmitter<AchievementFormPayload>();
  public text = '';
  public categoryId: string | null = null;
  public readonly maxLength = MAX_LENGTH;
  public categories$: Observable<Category[]>;

  constructor(private categoryService: CategoryService) {
    this.categories$ = this.categoryService.categories$;
  }

  public get remaining(): number {
    return this.maxLength - this.text.length;
  }

  public save(): void {
    const payload = this.text.trim();
    if (!payload) {
      return;
    }

    this.saved.emit({ text: payload, categoryId: this.categoryId });
  }

  /** Chamado pelo AppComponent só depois que o backend confirma o salvamento. */
  public reset(): void {
    this.text = '';
    this.categoryId = null;
  }
}
