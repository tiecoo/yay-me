import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Achievement } from '../../shared/models/achievement.model';

const LEGACY_STORAGE_KEY = 'yay-me:achievements';
const LEGACY_IMPORTED_FLAG_KEY = 'yay-me:legacy-imported';

interface LegacyItem {
  legacyId: string;
  text: string;
  createdAt: string;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private achievementsSubject = new BehaviorSubject<Achievement[]>([]);
  public achievements$: Observable<Achievement[]> = this.achievementsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Carrega as conquistas do usuário logado. Chamado pelo AppComponent após login/bootstrap. */
  public load(): void {
    this.http.get<{ achievements: Achievement[] }>('/api/achievements').subscribe({
      next: response => this.achievementsSubject.next(response.achievements),
      error: () => this.achievementsSubject.next([])
    });
  }

  /** Limpa o estado em memória no logout — os dados continuam no servidor. */
  public reset(): void {
    this.achievementsSubject.next([]);
  }

  public async addAchievement(text: string, categoryId: string | null = null): Promise<Achievement | null> {
    const trimmed = text.trim();
    if (!trimmed) {
      return null;
    }

    const response = await firstValueFrom(
      this.http.post<{ achievement: Achievement }>('/api/achievements', { text: trimmed, categoryId })
    );

    this.achievementsSubject.next([response.achievement, ...this.achievementsSubject.value]);
    return response.achievement;
  }

  public deleteAchievement(id: string): void {
    const previous = this.achievementsSubject.value;
    const nextState = previous.filter(item => item.id !== id);
    if (nextState.length === previous.length) {
      return;
    }

    this.achievementsSubject.next(nextState);
    this.http.delete(`/api/achievements/${id}`).subscribe({
      error: () => this.achievementsSubject.next(previous)
    });
  }

  public updateTags(id: string, tags: string[]): void {
    if (!tags.length) {
      return;
    }
    this.patchAchievement(id, { tags });
  }

  public updateCategory(id: string, categoryId: string | null): void {
    this.patchAchievement(id, { categoryId });
  }

  private patchAchievement(id: string, patch: { tags?: string[]; categoryId?: string | null }): void {
    const previous = this.achievementsSubject.value;
    const nextState = previous.map(item => (item.id === id ? { ...item, ...patch } : item));
    this.achievementsSubject.next(nextState);

    this.http.patch(`/api/achievements/${id}`, patch).subscribe({
      error: () => this.achievementsSubject.next(previous)
    });
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

    const items: LegacyItem[] = incoming.map(item => ({
      legacyId: item.id,
      text: item.text,
      createdAt: item.createdAt,
      tags: item.tags ?? []
    }));

    const result = await this.bulkImport(items);
    this.load();
    return result;
  }

  /** Verdadeiro quando há conquistas antigas no localStorage deste navegador ainda não importadas para a conta. */
  public hasPendingLegacyImport(): boolean {
    if (localStorage.getItem(LEGACY_IMPORTED_FLAG_KEY)) {
      return false;
    }
    return this.readLegacyLocalAchievements().length > 0;
  }

  public countPendingLegacyItems(): number {
    return this.readLegacyLocalAchievements().length;
  }

  public async importLegacyLocalAchievements(): Promise<{ imported: number; skipped: number }> {
    const legacyItems = this.readLegacyLocalAchievements();
    const items: LegacyItem[] = legacyItems.map(item => ({
      legacyId: item.id,
      text: item.text,
      createdAt: item.createdAt,
      tags: item.tags ?? []
    }));

    const result = await this.bulkImport(items);
    localStorage.setItem(LEGACY_IMPORTED_FLAG_KEY, 'true');
    this.load();
    return result;
  }

  public dismissLegacyImport(): void {
    localStorage.setItem(LEGACY_IMPORTED_FLAG_KEY, 'true');
  }

  private bulkImport(items: LegacyItem[]): Promise<{ imported: number; skipped: number }> {
    if (!items.length) {
      return Promise.resolve({ imported: 0, skipped: 0 });
    }
    return firstValueFrom(this.http.post<{ imported: number; skipped: number }>('/api/achievements/import', { items }));
  }

  private readLegacyLocalAchievements(): Achievement[] {
    try {
      const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!stored) {
        return [];
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.filter(this.isValidAchievement) : [];
    } catch {
      return [];
    }
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
