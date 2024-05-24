import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Auth } from '../models/auth.model';
import { AppStorage } from '../utils/app-storage';
import { EventBusService } from './event-bus.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public static readonly CHANGE_USER_EVENT = 'CHANGE_USER_EVENT';

  private readonly _auth: Auth = {
    group: null,
    userId: null,
    password: null
  };

  private readonly _authenticated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private readonly _userId$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  public get authenticated(): boolean {
    return this._authenticated$.getValue();
  }

  public get authenticated$(): Observable<boolean> {
    return this._authenticated$.asObservable();
  }

  public get group(): string | null {
    return this._auth.group;
  }

  public get userId(): string | null {
    return this._auth.userId;
  }

  public get userId$(): Observable<string | null> {
    return this._userId$.asObservable();
  }

  public get token(): string | null {
    return this.getToken(this.group, this.userId, this._auth.password);
  }

  private http: HttpClient;

  private readonly storage: AppStorage = new AppStorage(localStorage);
  private readonly cache: AppStorage = new AppStorage(sessionStorage);

  public constructor(
    httpBackend: HttpBackend,
    private eventBus: EventBusService) {
    this.http = new HttpClient(httpBackend);
    this.load();
  }

  public signIn(group: string, password: string): Observable<void> {
    return this.authenticate(group, password);
  }

  public signOut(): void {
    this.storage.clear();
    this.cache.clear();
    this._auth.group = null;
    this._auth.userId = null;
    this._auth.password = null;
    this._authenticated$.next(false);
    this._userId$.next(null);
  }

  public setCurrentUser(userId: string | null): void {
    this.cache.clear();
    this._auth.userId = userId;
    this._userId$.next(userId);
    this.save();
    this.eventBus.emit(AuthService.CHANGE_USER_EVENT);
  }

  private authenticate(group: string | null, password: string | null): Observable<void> {
    const token: string | null = this.getToken(group, null, password);
    if (token !== null) {
      const authorization = `Basic ${token}`;
      return this.http.get<void>(
        `${environment.apiUrl}?request=sign-in`,
        { headers: { 'Authorization': authorization } })
        .pipe(
          tap(() => {
            this._auth.group = group;
            this._auth.password = password;
            this.save();
            this._authenticated$.next(true);
          }));
    } else {
      return throwError(() => new Error('Invalid authentication informations.'));
    }
  }

  private getToken(group: string | null, userId: string | null, password: string | null): string | null {
    if (!group || !password) {
      return null;
    }

    const login: string = userId ? `${group}|${userId}` : group;
    return window.btoa(`${login}:${password}`);
  }

  private load(): void {
    const auth: Auth | null = AuthService.validateAuth(this.storage.getItem<Auth>('auth'));
    if (auth) {
      this._auth.group = auth.group;
      this._auth.password = auth.password;
      this._auth.userId = auth.userId;
      this._authenticated$.next(true);
      this._userId$.next(auth.userId);
    } else {
      this.storage.removeItem('auth');
    }
  }

  private save(): void {
    this.storage.setItem('auth', this._auth);
  }

  private static validateAuth(auth: Auth | null): Auth | null {
    let result: Auth | null = null;

    // validate auth
    if (typeof auth?.group === 'string'
      && typeof auth?.password === 'string'
      && typeof auth?.userId === 'string') {
      result = {
        group: auth.group,
        password: auth.password,
        userId: auth.userId
      }
    }

    return result;
  }
}
