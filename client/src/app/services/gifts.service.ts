import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap, throwError } from 'rxjs';
import { AppSettings } from '../app-settings';
import { Gift } from '../models/gift.model';
import { User } from '../models/user.model';
import { AppStorage } from '../utils/app-storage';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GiftsService {

  private readonly giftsCacheKey: string = 'cache.gifts';

  private readonly storage: AppStorage = new AppStorage(sessionStorage);

  public constructor(
    private settings: AppSettings,
    private authService: AuthService,
    private http: HttpClient) { }

  public getCart(): Observable<User[]> {
    const url = `${this.settings.apiUrl}/users/${this.authService.userId}/cart`;
    return this.http.get<User[]>(url);
  }

  public getUserGifts(userId: string, options?: { noCache?: boolean }): Observable<Gift[]> {
    if (!userId) {
      return throwError(() => new Error('Param userId is required.'));
    }

    if (!options?.noCache) {
      const cache: Gift[] | null = this.getGiftsFromCache(userId);
      if (cache) {
        return of(cache);
      }
    }

    const url = `${this.settings.apiUrl}/users/${userId}/gifts`;
    return this.http.get<Gift[]>(url)
      .pipe(
        tap((gifts: Gift[]): void => this.storeGiftsIntoCache(userId, gifts))
      );
  }

  public getGift(userId: string, giftId: string): Observable<Gift> {
    if (!giftId) {
      return throwError(() => new Error('Param id is required.'));
    }

    const url = `${this.settings.apiUrl}/users/${userId}/gifts/${giftId}`;
    return this.http.get<Gift>(url);
  }

  public addGift(gift: { name: string, link1?: string | null, link2?: string | null, link3?: string | null }): Observable<void> {
    const url = `${this.settings.apiUrl}/users/${this.authService.userId}/gifts`;
    return this.http.post<void>(url, gift)
      .pipe(
        tap(() => {
          if (this.authService.userId) {
            this.clearCache(this.authService.userId);
          }
        })
      );
  }

  public updateGift(gift: { id: string, name: string, link1?: string | null, link2?: string | null, link3?: string | null }): Observable<void> {
    const url = `${this.settings.apiUrl}/users/${this.authService.userId}/gifts/${gift.id}`;
    return this.http.put<void>(url, gift)
      .pipe(
        tap(() => {
          if (this.authService.userId) {
            this.clearCache(this.authService.userId);
          }
        })
      );
  }

  public offerGift(gift: Gift): Observable<void> {
    const url = `${this.settings.apiUrl}/users/${gift.user_id}/gifts/${gift.id}/offer`;
    return this.http.patch<void>(url, null)
      .pipe(
        tap(() => this.clearCache(gift.user_id))
      );
  }

  public unofferGift(gift: Gift): Observable<void> {
    const url = `${this.settings.apiUrl}/users/${gift.user_id}/gifts/${gift.id}/unoffer`;
    return this.http.patch<void>(url, null)
      .pipe(
        tap(() => this.clearCache(gift.user_id))
      );
  }

  public deleteGift(id: string): Observable<void> {
    if (!id) {
      return throwError(() => new Error('Param id is required.'));
    }

    const url = `${this.settings.apiUrl}/users/${this.authService.userId}/gifts/${id}`;
    return this.http.delete<void>(url)
      .pipe(
        tap(() => {
          if (this.authService.userId) {
            this.clearCache(this.authService.userId);
          }
        })
      );
  }

  public reorderGifts(gifts: Gift[]): Observable<void> {
    if (gifts.length == 0) {
      return of(void 0);
    }

    let index = 0;
    const body: { id: string, order: number }[] = gifts.map(gift => ({ id: gift.id, order: index++ }));

    const url = `${this.settings.apiUrl}/users/${this.authService.userId}/gifts`;
    return this.http.patch<void>(url, body)
      .pipe(
        tap(() => {
          if (this.authService.userId) {
            this.clearCache(this.authService.userId);
          }
        })
      );
  }

  private getGiftsFromCache(userId: string): Gift[] | null {
    const cache: Record<string, Gift[]> | null = this.storage.getItem<Record<string, Gift[]>>(this.giftsCacheKey);
    if (cache && userId in cache) {
      return cache[userId] ?? null;
    } else {
      return null;
    }
  }

  private storeGiftsIntoCache(userId: string, gifts: Gift[]): void {
    const cache: Record<string, Gift[]> = this.storage.getItem<Record<string, Gift[]>>(this.giftsCacheKey) ?? {};
    this.storage.setItem(this.giftsCacheKey, { ...cache, [userId]: gifts });
  }

  private clearCache(userId?: string): void {
    if (userId) {
      const cache: Record<string, Gift[]> = this.storage.getItem<Record<string, Gift[]>>(this.giftsCacheKey) ?? {};
      delete cache[userId];
      this.storage.setItem(this.giftsCacheKey, { ...cache });
    }
    else {
      this.storage.removeItem(this.giftsCacheKey);
    }
  }

}
