import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, timeout } from 'rxjs';
import { MOTIVATIONAL_PHRASES } from './motivational-phrases';

const CELEBRATE_PHRASE_ENDPOINT = '/.netlify/functions/celebrate-phrase';
// Deve ficar acima do timeout interno da function (6000ms em celebrate-phrase.js),
// senão o cliente desiste antes da function terminar e cai no fallback sempre.
const REQUEST_TIMEOUT_MS = 8000;

export interface CelebrationInsights {
  phrase: string;
  tags: string[];
}

@Injectable({ providedIn: 'root' })
export class CelebrationPhraseService {
  constructor(private http: HttpClient) {}

  public getCelebrationInsights(achievementText: string): Observable<CelebrationInsights> {
    return this.http
      .post<{ phrase: string | null; tags?: string[] }>(CELEBRATE_PHRASE_ENDPOINT, { text: achievementText })
      .pipe(
        timeout(REQUEST_TIMEOUT_MS),
        map(response => ({
          phrase: response.phrase?.trim() || this.getRandomFallbackPhrase(),
          tags: Array.isArray(response.tags) ? response.tags : []
        })),
        catchError(() => of({ phrase: this.getRandomFallbackPhrase(), tags: [] }))
      );
  }

  private getRandomFallbackPhrase(): string {
    const index = Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length);
    return MOTIVATIONAL_PHRASES[index];
  }
}
