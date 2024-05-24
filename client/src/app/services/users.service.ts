import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { v4 } from 'uuid';
import { User } from '../models/user.model';
import { AppStorage } from '../utils/app-storage';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private readonly cacheKey: string = 'cache.users'

  private readonly storage: AppStorage = new AppStorage(sessionStorage);

  private get cache(): User[] | null {
    return this.storage.getItem<User[]>(this.cacheKey);
  }
  private set cache(value: User[] | null) {
    if (value === null) {
      this.storage.removeItem(this.cacheKey);
    } else {
      this.storage.setItem(this.cacheKey, value);
    }
  }

  public constructor(private http: HttpClient) { }

  public getUsers(options?: { noCache?: boolean }): Observable<User[]> {
    if (this.cache !== null && !options?.noCache) {
      return of(this.cache);
    } else {
      const url = `${environment.apiUrl}?request=users`;
      return this.http.get<User[]>(url)
        .pipe(
          tap((users: User[]): void => {
            this.cache = users;
          })
        );
    }
  }

  public getUser(id: string): Observable<User> {
    const url = `${environment.apiUrl}?request=users&id=${id}`;
    return this.http.get<User>(url);
  }

  public addUser(user: { name: string, picture?: string | null }): Observable<void> {
    const url = `${environment.apiUrl}?request=users`;
    const id = v4();
    return this.http.post<void>(url, { ...user, id })
      .pipe(
        tap(() => this.cache = null)
      );
  }

  public updateUser(user: { id: string, name: string, picture?: string | null }): Observable<void> {
    const url = `${environment.apiUrl}?request=users`;
    return this.http.put<void>(url, user)
      .pipe(
        tap(() => this.cache = null)
      );
  }

  public deleteUser(id: string): Observable<void> {
    if (!id) {
      return throwError(() => new Error('Param id is required.'));
    }

    const url = `${environment.apiUrl}?request=users&id=${id}`;
    return this.http.delete<void>(url)
      .pipe(
        tap(() => this.cache = null)
      );
  }

  public importUsers(users: User[]): Observable<{ existing_users: User[], new_users: User[] }> {
    if (users.length == 0) {
      return of({ existing_users: [], new_users: [] });
    }

    const url = `${environment.apiUrl}?request=users&import=true`;
    return this.http.post<{ existing_users: User[], new_users: User[] }>(url, users)
      .pipe(
        tap(() => this.cache = null)
      );
  }

}
