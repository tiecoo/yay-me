import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Achievement } from '../../shared/models/achievement.model';

const STORAGE_KEY = 'yay-me:achievements';

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private achievementsSubject = new BehaviorSubject<Achievement[]>(this.loadAchievements());
  public achievements$: Observable<Achievement[]> = this.achievementsSubject.asObservable();

  private loadAchievements(): Achievement[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to load achievements from localStorage:', error);
      return [];
    }
  }

  private saveAchievements(achievements: Achievement[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
    this.achievementsSubject.next(achievements);
  }

  public addAchievement(text: string): Achievement | null {
    const trimmed = text.trim();
    if (!trimmed) {
      return null;
    }

    const achievement: Achievement = {
      id: self.crypto.randomUUID(),
      text: trimmed,
      createdAt: new Date().toISOString()
    };

    const nextState = [achievement, ...this.achievementsSubject.value];
    this.saveAchievements(nextState);
    return achievement;
  }

  public deleteAchievement(id: string): void {
    const nextState = this.achievementsSubject.value.filter(item => item.id !== id);
    if (nextState.length === this.achievementsSubject.value.length) {
      return;
    }
    this.saveAchievements(nextState);
  }

  public updateTags(id: string, tags: string[]): void {
    if (!tags.length) {
      return;
    }

    const nextState = this.achievementsSubject.value.map(item => (item.id === id ? { ...item, tags } : item));
    this.saveAchievements(nextState);
  }

  public exportBackup(): void {
    const json = JSON.stringify(this.achievementsSubject.value, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);

    const link = document.createElement('a');
    link.href = url;
    link.download = `yay-me-backup-${date}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  public async importBackup(file: File): Promise<{ imported: number; skipped: number }> {
    const text = await file.text();
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed)) {
      throw new Error('O arquivo não contém uma lista de conquistas.');
    }

    const incoming = parsed.filter(this.isValidAchievement);
    if (incoming.length !== parsed.length) {
      throw new Error('O arquivo tem itens em formato inválido.');
    }

    const existingIds = new Set(this.achievementsSubject.value.map(item => item.id));
    const newOnes = incoming.filter(item => !existingIds.has(item.id));

    if (newOnes.length) {
      const nextState = [...this.achievementsSubject.value, ...newOnes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      this.saveAchievements(nextState);
    }

    return { imported: newOnes.length, skipped: incoming.length - newOnes.length };
  }

  private isValidAchievement(value: unknown): value is Achievement {
    if (!value || typeof value !== 'object') {
      return false;
    }
    const candidate = value as Record<string, unknown>;
    return (
      typeof candidate['id'] === 'string' &&
      typeof candidate['text'] === 'string' &&
      typeof candidate['createdAt'] === 'string'
    );
  }
}
