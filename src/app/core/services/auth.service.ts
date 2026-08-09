import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { User } from '../../shared/models/user.model';

interface UserResponse {
  user: User | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Restaura a sessão a partir do cookie, se existir. Sempre resolve (nunca erro), pois "deslogado" é um estado normal. */
  public bootstrap(): Observable<User | null> {
    return this.http.get<UserResponse>('/api/auth/me').pipe(
      map(response => response.user),
      tap(user => this.currentUserSubject.next(user)),
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  public register(email: string, password: string, displayName?: string): Observable<User> {
    return this.http
      .post<UserResponse>('/api/auth/register', { email, password, displayName })
      .pipe(
        map(response => response.user as User),
        tap(user => this.currentUserSubject.next(user))
      );
  }

  public login(email: string, password: string): Observable<User> {
    return this.http.post<UserResponse>('/api/auth/login', { email, password }).pipe(
      map(response => response.user as User),
      tap(user => this.currentUserSubject.next(user))
    );
  }

  public loginWithGoogle(idToken: string): Observable<User> {
    return this.http.post<UserResponse>('/api/auth/google', { idToken }).pipe(
      map(response => response.user as User),
      tap(user => this.currentUserSubject.next(user))
    );
  }

  public logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}).pipe(tap(() => this.currentUserSubject.next(null)));
  }
}
