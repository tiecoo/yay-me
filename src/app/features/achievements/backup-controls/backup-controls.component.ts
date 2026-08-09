import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AchievementService } from '../../../core/services/achievement.service';

const STATUS_TIMEOUT_MS = 4000;

@Component({
  selector: 'app-backup-controls',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './backup-controls.component.html',
  styleUrl: './backup-controls.component.scss'
})
export class BackupControlsComponent {
  public statusMessage: string | null = null;
  public statusIsError = false;
  private statusTimer?: ReturnType<typeof setTimeout>;

  constructor(private achievementService: AchievementService) {}

  public onExport(): void {
    this.achievementService.exportBackup();
    this.showStatus('Backup exportado!', false);
  }

  public async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    try {
      const { imported, skipped } = await this.achievementService.importBackup(file);
      const summary = skipped ? `${imported} importadas, ${skipped} já existiam` : `${imported} conquistas importadas`;
      this.showStatus(summary, false);
    } catch {
      this.showStatus('Não deu pra importar esse arquivo — confira se é um backup válido.', true);
    } finally {
      input.value = '';
    }
  }

  private showStatus(message: string, isError: boolean): void {
    if (this.statusTimer) {
      clearTimeout(this.statusTimer);
    }
    this.statusMessage = message;
    this.statusIsError = isError;
    this.statusTimer = setTimeout(() => {
      this.statusMessage = null;
    }, STATUS_TIMEOUT_MS);
  }
}
