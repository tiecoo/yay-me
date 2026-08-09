import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';

const MAX_LENGTH = 280;

@Component({
  selector: 'app-achievement-form',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextareaModule, ButtonModule],
  templateUrl: './achievement-form.component.html',
  styleUrl: './achievement-form.component.scss'
})
export class AchievementFormComponent {
  @Output() saved = new EventEmitter<string>();
  public text = '';
  public readonly maxLength = MAX_LENGTH;

  public get remaining(): number {
    return this.maxLength - this.text.length;
  }

  public save(): void {
    const payload = this.text.trim();
    if (!payload) {
      return;
    }

    console.debug('AchievementForm.save emitting', payload);
    this.saved.emit(payload);
    this.text = '';
  }
}
