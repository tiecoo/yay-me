import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, switchMap, timeout, timer } from 'rxjs';
import { FALLBACK_GIFS } from './gifs';
import { environment } from '../../../environments/environment';

const GIPHY_ENDPOINT = 'https://api.giphy.com/v1/gifs/random';

@Injectable({ providedIn: 'root' })
export class GifService {
  constructor(private http: HttpClient) {}

  public getRandomCelebrationGif() {
    if (!environment.giphyApiKey) {
      return of(this.getLocalFallbackGif());
    }

    const params = {
      api_key: environment.giphyApiKey,
      tag: 'celebration',
      rating: 'pg'
    };

    return timer(0).pipe(
      switchMap(() => this.http.get<{ data: any }>(GIPHY_ENDPOINT, { params }).pipe(timeout(2000))),
      map(response => response.data?.images?.downsized_medium?.url || response.data?.images?.original?.url),
      catchError(() => of(this.getLocalFallbackGif()))
    );
  }

  private getLocalFallbackGif(): string {
    const index = Math.floor(Math.random() * FALLBACK_GIFS.length);
    return FALLBACK_GIFS[index];
  }
}
