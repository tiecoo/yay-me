import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AchievementService } from '../../../core/services/achievement.service';

@Component({
  selector: 'app-legacy-import-prompt',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule],
  template: `
    <p-dialog
      header="Conquistas encontradas neste navegador"
      [(visible)]="visible"
      [modal]="true"
      [closable]="false"
      [style]="{ maxWidth: '360px' }"
    >
      <p>Encontramos {{ count }} conquista(s) salvas neste navegador antes de você criar a conta. Quer importar para a sua conta?</p>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
      <div class="actions">
        <button pButton type="button" label="Ignorar" class="p-button-text" (click)="dismiss()" [disabled]="loading"></button>
        <button pButton type="button" label="Importar" icon="pi pi-download" (click)="importItems()" [loading]="loading"></button>
      </div>
    </p-dialog>
  `,
  styles: [
    `
    p { margin: 0 0 var(--space-3); color: var(--color-text); }
    .error { color: var(--color-danger); font-size: 0.875rem; }
    .actions { display: flex; justify-content: flex-end; gap: var(--space-2); }
    `
  ]
})
export class LegacyImportPromptComponent implements OnInit {
  public visible = false;
  public loading = false;
  public errorMessage: string | null = null;
  public count = 0;

  constructor(private achievementService: AchievementService) {}

  public ngOnInit(): void {
    // Este componente só existe no DOM quando o usuário está logado (AppComponent
    // o renderiza condicionalmente), então checar aqui cobre tanto o pós-login
    // quanto uma sessão já restaurada via cookie no boot do app.
    this.check();
  }

  private check(): void {
    if (this.achievementService.hasPendingLegacyImport()) {
      this.count = this.achievementService.countPendingLegacyItems();
      this.visible = true;
    }
  }

  public dismiss(): void {
    this.achievementService.dismissLegacyImport();
    this.visible = false;
  }

  public async importItems(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    try {
      await this.achievementService.importLegacyLocalAchievements();
      this.visible = false;
    } catch {
      this.errorMessage = 'Não foi possível importar agora. Tente novamente mais tarde.';
    } finally {
      this.loading = false;
    }
  }
}
