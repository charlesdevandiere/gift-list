import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap, throwError } from 'rxjs';
import { Gift } from '../models/gift.model';
import { AppStorage } from '../utils/app-storage';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GiftsService {

  private readonly giftsCacheKey: string = 'cache.gifts';

  private readonly storage: AppStorage = new AppStorage(sessionStorage);

  public constructor(
    private readonly authService: AuthService,
    private readonly http: HttpClient) { }

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

    const url = `/api/users/${userId}/gifts`;
    return this.http.get<Gift[]>(url)
      .pipe(
        tap((gifts: Gift[]): void => this.storeGiftsIntoCache(userId, gifts))
      );
  }

  public getGift(userId: string, giftId: string): Observable<Gift> {
    if (!giftId) {
      return throwError(() => new Error('Param id is required.'));
    }

    const url = `/api/users/${userId}/gifts/${giftId}`;
    return this.http.get<Gift>(url);
  }

  public addGift(gift: { name: string, link1?: string | null, link2?: string | null, link3?: string | null }): Observable<void> {
    const url = `/api/users/${this.authService.me?.id}/gifts`;
    return this.http.post<void>(url, gift)
      .pipe(
        tap(() => {
          if (this.authService.me?.id) {
            this.clearCache(this.authService.me?.id);
          }
        })
      );
  }

  public updateGift(gift: { id: string, name: string, link1?: string | null, link2?: string | null, link3?: string | null }): Observable<void> {
    const url = `/api/users/${this.authService.me?.id}/gifts/${gift.id}`;
    return this.http.put<void>(url, gift)
      .pipe(
        tap(() => {
          if (this.authService.me?.id) {
            this.clearCache(this.authService.me?.id);
          }
        })
      );
  }

  public offerGift(gift: Gift): Observable<void> {
    const url = `/api/users/${gift.userId}/gifts/${gift.id}/offer`;
    return this.http.post<void>(url, null)
      .pipe(
        tap(() => this.clearCache(gift.userId))
      );
  }

  public unofferGift(gift: Gift): Observable<void> {
    const url = `/api/users/${gift.userId}/gifts/${gift.id}/unoffer`;
    return this.http.post<void>(url, null)
      .pipe(
        tap(() => this.clearCache(gift.userId))
      );
  }

  public deleteGift(id: string): Observable<void> {
    if (!id) {
      return throwError(() => new Error('Param id is required.'));
    }

    const url = `/api/users/${this.authService.me?.id}/gifts/${id}`;
    return this.http.delete<void>(url)
      .pipe(
        tap(() => {
          if (this.authService.me?.id) {
            this.clearCache(this.authService.me?.id);
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

    const url = `/api/users/${this.authService.me?.id}/gifts`;
    return this.http.patch<void>(url, body)
      .pipe(
        tap(() => {
          if (this.authService.me?.id) {
            this.clearCache(this.authService.me?.id);
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
