import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

export interface LoginCredentials {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, PasswordModule, ButtonModule],
  template: `
    <form class="auth-form" (ngSubmit)="submit()">
      <div class="field">
        <label for="login-email">Email</label>
        <input id="login-email" pInputText type="email" name="email" [(ngModel)]="email" autocomplete="email" required />
      </div>
      <div class="field">
        <label for="login-password">Senha</label>
        <p-password
          inputId="login-password"
          name="password"
          [(ngModel)]="password"
          [feedback]="false"
          [toggleMask]="true"
          autocomplete="current-password"
        ></p-password>
      </div>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
      <button pButton type="submit" label="Entrar" icon="pi pi-sign-in" class="submit-button" [loading]="loading" [disabled]="!email || !password"></button>
    </form>
  `,
  styles: [
    `
    .auth-form { display: grid; gap: var(--space-4); width: 100%; }
    .field { display: grid; gap: var(--space-2); }
    .field label { font-size: 0.875rem; font-weight: 600; color: var(--color-text); }
    :host ::ng-deep .p-password, :host ::ng-deep .p-password-input { width: 100%; }
    .error { margin: 0; font-size: 0.875rem; color: var(--color-danger); }
    .submit-button { width: 100%; }
    `
  ]
})
export class LoginFormComponent {
  @Input() public loading = false;
  @Input() public errorMessage: string | null = null;
  @Output() public submitted = new EventEmitter<LoginCredentials>();

  public email = '';
  public password = '';

  public submit(): void {
    if (!this.email || !this.password) {
      return;
    }
    this.submitted.emit({ email: this.email.trim(), password: this.password });
  }
}
