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
}
