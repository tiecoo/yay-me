import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AchievementFormComponent } from './features/achievements/achievement-form/achievement-form.component';
import { AchievementListComponent } from './features/achievements/achievement-list/achievement-list.component';
import { CelebrationModalComponent } from './features/achievements/celebration-modal/celebration-modal.component';
import { StatsDashboardComponent } from './features/achievements/stats-dashboard/stats-dashboard.component';
import { BackupControlsComponent } from './features/achievements/backup-controls/backup-controls.component';
import { AchievementService } from './core/services/achievement.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    AchievementFormComponent,
    AchievementListComponent,
    CelebrationModalComponent,
    StatsDashboardComponent,
    BackupControlsComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild('celebrationModal') private celebrationModal?: CelebrationModalComponent;

  constructor(
    private achievementService: AchievementService,
    private notificationService: NotificationService
  ) {
    this.notificationService.checkDailyReminder();
  }

  public onSaved(text: string): void {
    const achievement = this.achievementService.addAchievement(text);
    if (achievement) {
      // Abrir o modal na próxima iteração do loop de evento garante que
      // o `ViewChild` esteja disponível e evita condições de corrida.
      console.debug('Opening celebration modal for', achievement.id);
      setTimeout(() => this.celebrationModal?.open(achievement.id, achievement.text), 0);
    }
  }
}
