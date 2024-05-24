import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { v4 } from 'uuid';
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
    private authService: AuthService,
    private http: HttpClient) { }

  public getCart(): Observable<Gift[]> {
    const url = `${environment.apiUrl}?request=gifts`;
    return this.http.get<Gift[]>(url);
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

    const url = `${environment.apiUrl}?request=gifts&user_id=${userId}`;
    return this.http.get<Gift[]>(url)
      .pipe(
        tap((gifts: Gift[]): void => this.storeGiftsIntoCache(userId, gifts))
      );
  }

  public getGift(id: string): Observable<Gift> {
    if (!id) {
      return throwError(() => new Error('Param id is required.'));
    }

    const url = `${environment.apiUrl}?request=gifts&id=${id}`;
    return this.http.get<Gift>(url);
  }

  public addGift(gift: { name: string, link1?: string | null, link2?: string | null, link3?: string | null }): Observable<void> {
    const url = `${environment.apiUrl}?request=gifts`;
    const id = v4();
    return this.http.post<void>(url, { ...gift, id })
      .pipe(
        tap(() => {
          if (this.authService.userId) {
            this.clearCache(this.authService.userId);
          }
        })
      );
  }

  public updateGift(gift: { id: string, name: string, link1?: string | null, link2?: string | null, link3?: string | null }): Observable<void> {
    const url = `${environment.apiUrl}?request=gifts`;
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
    const url = `${environment.apiUrl}?request=gifts&id=${gift.id}&action=offer`;
    return this.http.patch<void>(url, null)
      .pipe(
        tap(() => this.clearCache(gift.user_id))
      );
  }

  public unofferGift(gift: Gift): Observable<void> {
    const url = `${environment.apiUrl}?request=gifts&id=${gift.id}&action=unoffer`;
    return this.http.patch<void>(url, null)
      .pipe(
        tap(() => this.clearCache(gift.user_id))
      );
  }

  public deleteGift(id: string): Observable<void> {
    if (!id) {
      return throwError(() => new Error('Param id is required.'));
    }

    const url = `${environment.apiUrl}?request=gifts&id=${id}`;
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

    const url = `${environment.apiUrl}?request=gifts&action=reorder`;
    return this.http.patch<void>(url, body)
      .pipe(
        tap(() => {
          if (this.authService.userId) {
            this.clearCache(this.authService.userId);
          }
        })
      );
  }

  public importGifts(userId: string, gifts: Gift[]): Observable<{ new_gifts: Gift[] }> {
    if (!userId) {
      return throwError(() => new Error('Param userId is required.'));
    }
    if (gifts.length == 0) {
      return of({ new_gifts: [] });
    }

    const url = `${environment.apiUrl}?request=gifts&import=true&user_id=${userId}`;
    return this.http.post<{ new_gifts: Gift[] }>(url, gifts)
      .pipe(
        tap(() => this.clearCache(userId))
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
