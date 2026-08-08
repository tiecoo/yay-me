import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, timeout } from 'rxjs';
import { MOTIVATIONAL_PHRASES } from './motivational-phrases';

const CELEBRATE_PHRASE_ENDPOINT = '/.netlify/functions/celebrate-phrase';
const REQUEST_TIMEOUT_MS = 5000;

@Injectable({ providedIn: 'root' })
export class CelebrationPhraseService {
  constructor(private http: HttpClient) {}

  public getPhrase(achievementText: string): Observable<string> {
    return this.http.post<{ phrase: string | null }>(CELEBRATE_PHRASE_ENDPOINT, { text: achievementText }).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      map(response => response.phrase?.trim() || this.getRandomFallbackPhrase()),
      catchError(() => of(this.getRandomFallbackPhrase()))
    );
  }

  private getRandomFallbackPhrase(): string {
    const index = Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length);
    return MOTIVATIONAL_PHRASES[index];
  }
}
