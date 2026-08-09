import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { LoginCredentials, LoginFormComponent } from '../login-form/login-form.component';
import { RegisterDetails, RegisterFormComponent } from '../register-form/register-form.component';

declare const google: any;

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [CommonModule, LoginFormComponent, RegisterFormComponent],
  template: `
    <div class="auth-shell">
      <div class="auth-card">
        <span class="auth-emoji" aria-hidden="true">🎉</span>
        <h2>Yay-me</h2>
        <p class="auth-tagline">Entre para registrar suas conquistas.</p>

        <div class="google-button" #googleButton></div>
        <p class="google-error" *ngIf="googleErrorMessage">{{ googleErrorMessage }}</p>

        <div class="divider"><span>ou</span></div>

        <app-login-form
          *ngIf="mode === 'login'"
          [loading]="loading"
          [errorMessage]="errorMessage"
          (submitted)="onLogin($event)"
        ></app-login-form>

        <app-register-form
          *ngIf="mode === 'register'"
          [loading]="loading"
          [errorMessage]="errorMessage"
          (submitted)="onRegister($event)"
        ></app-register-form>

        <button type="button" class="switch-mode" (click)="toggleMode()">
          {{ mode === 'login' ? 'Ainda não tem conta? Criar conta' : 'Já tem conta? Entrar' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
    .auth-shell {
      display: flex;
      justify-content: center;
      padding: var(--space-6) var(--space-4);
    }
    .auth-card {
      width: 100%;
      max-width: 360px;
      display: grid;
      justify-items: center;
      gap: var(--space-4);
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      padding: var(--space-6) var(--space-5);
    }
    .auth-emoji { font-size: 2rem; }
    h2 { margin: 0; font-size: 1.25rem; font-weight: 700; color: var(--color-text); }
    .auth-tagline { margin: 0; font-size: 0.875rem; color: var(--color-text-muted); text-align: center; }
    .google-button { min-height: 40px; width: 100%; display: flex; justify-content: center; }
    .google-error { margin: 0; font-size: 0.8125rem; color: var(--color-danger); text-align: center; }
    .divider { display: flex; align-items: center; gap: var(--space-3); width: 100%; color: var(--color-text-muted); font-size: 0.8125rem; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--color-border); }
    .switch-mode {
      background: none;
      border: none;
      color: var(--color-primary);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }
    `
  ]
})
export class AuthShellComponent implements AfterViewInit {
  @ViewChild('googleButton') private googleButtonRef?: ElementRef<HTMLDivElement>;

  public mode: AuthMode = 'login';
  public loading = false;
  public errorMessage: string | null = null;
  public googleErrorMessage: string | null = null;

  constructor(private authService: AuthService) {}

  public ngAfterViewInit(): void {
    this.initGoogleButton();
  }

  public toggleMode(): void {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.errorMessage = null;
  }

  public onLogin(credentials: LoginCredentials): void {
    this.loading = true;
    this.errorMessage = null;
    this.authService.login(credentials.email, credentials.password).subscribe({
      next: () => (this.loading = false),
      error: () => {
        this.loading = false;
        this.errorMessage = 'Email ou senha incorretos.';
      }
    });
  }

  public onRegister(details: RegisterDetails): void {
    this.loading = true;
    this.errorMessage = null;
    this.authService.register(details.email, details.password, details.displayName || undefined).subscribe({
      next: () => (this.loading = false),
      error: httpError => {
        this.loading = false;
        this.errorMessage = httpError?.error?.error || 'Não foi possível criar a conta.';
      }
    });
  }

  private initGoogleButton(): void {
    const clientId = (environment as any).googleClientId;
    if (!clientId || !this.googleButtonRef) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential: string }) => this.onGoogleCredential(response.credential)
        });
        google.accounts.id.renderButton(this.googleButtonRef!.nativeElement, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with'
        });
      } catch {
        this.googleErrorMessage = 'Não foi possível carregar o login com Google.';
      }
    };
    script.onerror = () => {
      this.googleErrorMessage = 'Não foi possível carregar o login com Google.';
    };
    document.head.appendChild(script);
  }

  private onGoogleCredential(idToken: string): void {
    this.loading = true;
    this.errorMessage = null;
    this.authService.loginWithGoogle(idToken).subscribe({
      next: () => (this.loading = false),
      error: () => {
        this.loading = false;
        this.errorMessage = 'Não foi possível entrar com o Google.';
      }
    });
  }
}
