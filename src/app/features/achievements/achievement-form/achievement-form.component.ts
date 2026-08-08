import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  selector: 'app-achievement-form',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextareaModule, ButtonModule],
  template: `
    <div class="achievement-form">
      <textarea
        rows="4"
        [(ngModel)]="text"
        placeholder="Escreva sua conquista..."
        class="achievement-input"
      ></textarea>
      <button pButton type="button" label="Salvar" (click)="save()" [disabled]="!text.trim()"></button>
    </div>
  `,
  styles: [
    ".achievement-form { display: grid; gap: 1rem; width: 100%; }",
    ".achievement-input { width: 100%; min-height: 120px; resize: vertical; padding: 1rem; border-radius: 0.75rem; border: 1px solid #ccc; font-size: 1rem; }"
  ]
})
export class AchievementFormComponent {
  @Output() saved = new EventEmitter<string>();
  public text = '';

  public save(): void {
    const payload = this.text.trim();
    if (!payload) {
      return;
    }

    this.saved.emit(payload);
    this.text = '';
  }
}
