import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Auth } from '../models/auth.model';
import { Me } from '../models/me.model';
import { AppStorage } from '../utils/app-storage';
import { EventBusService } from './event-bus.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public static readonly CHANGE_USER_EVENT = 'CHANGE_USER_EVENT';

  private static readonly AUTH_STORAGE_KEY = 'auth';

  private readonly _auth: Auth = {
    group: null,
    userId: null,
    password: null
  };

  private readonly _authenticated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private readonly _me$: BehaviorSubject<Me | null> = new BehaviorSubject<Me | null>(null);

  public get authenticated(): boolean {
    return this._authenticated$.getValue();
  }

  public get authenticated$(): Observable<boolean> {
    return this._authenticated$.asObservable();
  }

  public get group(): string | null {
    return this._auth.group;
  }

  public get me(): Me | null {
    return this._me$.getValue();
  }

  public get me$(): Observable<Me | null> {
    return this._me$.asObservable();
  }

  public get token(): string | null {
    if (this._auth.group && this._auth.password) {
      return this.getToken(this._auth.group, this._auth.userId, this._auth.password);
    }
    else {
      return null;
    }
  }

  private readonly http: HttpClient;

  private readonly storage: AppStorage = new AppStorage(localStorage);
  private readonly cache: AppStorage = new AppStorage(sessionStorage);

  public constructor(
    httpBackend: HttpBackend,
    private readonly eventBus: EventBusService) {
    this.http = new HttpClient(httpBackend);
  }

  public async load(): Promise<void> {
    const auth: Auth | null = this.restoreAuth();
    if (auth) {
      this._auth.group = auth.group;
      this._auth.password = auth.password;
      this._auth.userId = auth.userId;
      try {
        await this.setCurrentUser(auth.userId);
        this._authenticated$.next(true);
      }
      catch (err) {
        console.error(err);
      }
    } else {
      this.storage.removeItem(AuthService.AUTH_STORAGE_KEY);
    }
  }

  public signIn(group: string, password: string): Promise<void> {
    return this.authenticate(group, password);
  }

  public signOut(): void {
    this.storage.clear();
    this.cache.clear();
    this._auth.group = null;
    this._auth.userId = null;
    this._auth.password = null;
    this._authenticated$.next(false);
    this._me$.next(null);
  }

  public async setCurrentUser(userId: string | null): Promise<void> {
    const oldUserId: string | null = this._auth.userId
    this._auth.userId = userId ?? null;
    try {
      const me: Me = await this.getMe();
      this.cache.clear();
      this._me$.next(me);
      this.save();
      this.eventBus.emit(AuthService.CHANGE_USER_EVENT);
    }
    catch (err) {
      this._auth.userId = oldUserId;
      console.error(err);
      throw new Error('Invalid user');
    }
  }

  private async authenticate(group: string, password: string, userId?: string): Promise<void> {
    const me: Me = await this.getMe({ group, userId: userId, password });
    this._auth.group = group;
    this._auth.password = password;
    this._auth.userId = userId ?? null;
    this._me$.next(me);
    this.save();
    this.eventBus.emit(AuthService.CHANGE_USER_EVENT);
    this.save();
    this._authenticated$.next(true);
  }

  private async getMe(options?: { group: string, userId?: string, password: string }): Promise<Me> {
    const group: string = options?.group ?? this._auth.group ?? '';
    const userId: string | null = options?.userId ?? this._auth.userId ?? null;
    const password: string = options?.password ?? this._auth.password ?? '';

    const token: string | null = this.getToken(group, userId, password);
    const authorization = `Basic ${token}`;

    return await firstValueFrom(
      this.http.get<Me>('/api/me', { headers: { 'Authorization': authorization } })
    );
  }

  private getToken(group: string, userId: string | null, password: string): string {
    if (!group?.length || !password?.length) {
      throw new Error('group and password are required.');
    }

    const login: string = userId?.length ? `${group}@${userId}` : group;
    return window.btoa(`${login}:${password}`);
  }

  private save(): void {
    this.storage.setItem(AuthService.AUTH_STORAGE_KEY, this._auth);
  }

  private restoreAuth(): Auth | null {
    const auth: Auth | null = this.storage.getItem<Auth>(AuthService.AUTH_STORAGE_KEY);
    let result: Auth | null = null;

    if (typeof auth?.group === 'string'
      && typeof auth?.password === 'string') {
      result = {
        group: auth.group,
        password: auth.password,
        userId: null
      }
    }

    if (result && typeof auth?.userId === 'string') {
      result.userId = auth.userId;
    }

    return result;
  }
}
