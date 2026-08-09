import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category } from '../../shared/models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$: Observable<Category[]> = this.categoriesSubject.asObservable();

  constructor(private http: HttpClient) {}

  public load(): void {
    this.http.get<{ categories: Category[] }>('/api/categories').subscribe({
      next: response => this.categoriesSubject.next(response.categories),
      error: () => this.categoriesSubject.next([])
    });
  }

  public reset(): void {
    this.categoriesSubject.next([]);
  }
}
