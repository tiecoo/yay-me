import { Injectable } from '@angular/core';
import { MOTIVATIONAL_PHRASES } from './motivational-phrases';

const STORAGE_KEY = 'yay-me:last-notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  public async checkDailyReminder(): Promise<void> {
    if (!('Notification' in window)) {
      return;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const lastSent = localStorage.getItem(STORAGE_KEY);
    if (lastSent === today) {
      return;
    }

    this.showNotification();
    localStorage.setItem(STORAGE_KEY, today);
  }

  private async requestPermission(): Promise<NotificationPermission> {
    if (Notification.permission === 'granted') {
      return 'granted';
    }

    return await Notification.requestPermission();
  }

  private showNotification(): void {
    const phrase = this.getRandomPhrase();
    new Notification('Yay-me lembra você!', {
      body: phrase,
      icon: undefined
    });
  }

  private getRandomPhrase(): string {
    const index = Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length);
    return MOTIVATIONAL_PHRASES[index];
  }
}
