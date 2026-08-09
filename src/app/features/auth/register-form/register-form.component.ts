import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

export interface RegisterDetails {
  email: string;
  password: string;
  displayName: string;
}

const MIN_PASSWORD_LENGTH = 8;

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, PasswordModule, ButtonModule],
  template: `
    <form class="auth-form" (ngSubmit)="submit()">
      <div class="field">
        <label for="register-name">Nome (opcional)</label>
        <input id="register-name" pInputText type="text" name="displayName" [(ngModel)]="displayName" autocomplete="name" />
      </div>
      <div class="field">
        <label for="register-email">Email</label>
        <input id="register-email" pInputText type="email" name="email" [(ngModel)]="email" autocomplete="email" required />
      </div>
      <div class="field">
        <label for="register-password">Senha</label>
        <p-password
          inputId="register-password"
          name="password"
          [(ngModel)]="password"
          [toggleMask]="true"
          autocomplete="new-password"
          promptLabel="Escolha uma senha"
          weakLabel="Fraca"
          mediumLabel="Média"
          strongLabel="Forte"
        ></p-password>
        <span class="hint">Mínimo de {{ minPasswordLength }} caracteres.</span>
      </div>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
      <button
        pButton
        type="submit"
        label="Criar conta"
        icon="pi pi-user-plus"
        class="submit-button"
        [loading]="loading"
        [disabled]="!email || password.length < minPasswordLength"
      ></button>
    </form>
  `,
  styles: [
    `
    .auth-form { display: grid; gap: var(--space-4); width: 100%; }
    .field { display: grid; gap: var(--space-2); }
    .field label { font-size: 0.875rem; font-weight: 600; color: var(--color-text); }
    :host ::ng-deep .p-password, :host ::ng-deep .p-password-input { width: 100%; }
    .hint { font-size: 0.75rem; color: var(--color-text-muted); }
    .error { margin: 0; font-size: 0.875rem; color: var(--color-danger); }
    .submit-button { width: 100%; }
    `
  ]
})
export class RegisterFormComponent {
  @Input() public loading = false;
  @Input() public errorMessage: string | null = null;
  @Output() public submitted = new EventEmitter<RegisterDetails>();

  public readonly minPasswordLength = MIN_PASSWORD_LENGTH;
  public email = '';
  public password = '';
  public displayName = '';

  public submit(): void {
    if (!this.email || this.password.length < MIN_PASSWORD_LENGTH) {
      return;
    }
    this.submitted.emit({ email: this.email.trim(), password: this.password, displayName: this.displayName.trim() });
  }
}
