import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { GiftOrder } from '../models/gift-order.model';
import { Gift } from '../models/gift.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GiftsService {

  public constructor(
    private readonly authService: AuthService,
    private readonly http: HttpClient) { }

  public getUserGifts(userId: string): Observable<Gift[]> {
    if (!userId) {
      return throwError(() => new Error('Param userId is required.'));
    }

    const url = `/api/users/${userId}/gifts`;
    return this.http.get<Gift[]>(url);
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
    return this.http.post<void>(url, gift);
  }

  public updateGift(gift: { id: string, name: string, link1?: string | null, link2?: string | null, link3?: string | null }): Observable<void> {
    const url = `/api/users/${this.authService.me?.id}/gifts/${gift.id}`;
    return this.http.put<void>(url, gift);
  }

  public offerGift(gift: Gift): Observable<void> {
    const url = `/api/users/${gift.userId}/gifts/${gift.id}/offer`;
    return this.http.post<void>(url, null);
  }

  public unofferGift(gift: Gift): Observable<void> {
    const url = `/api/users/${gift.userId}/gifts/${gift.id}/unoffer`;
    return this.http.post<void>(url, null);
  }

  public deleteGift(id: string): Observable<void> {
    if (!id) {
      return throwError(() => new Error('Param id is required.'));
    }

    const url = `/api/users/${this.authService.me?.id}/gifts/${id}`;
    return this.http.delete<void>(url);
  }

  public reorderGifts(gifts: Gift[]): Observable<void> {
    if (gifts.length == 0) {
      return of(void 0);
    }

    let index = 0;
    const body: GiftOrder[] = gifts.map(gift => ({ giftId: gift.id, order: index++ }));

    const url = `/api/users/${this.authService.me?.id}/gifts`;
    return this.http.patch<void>(url, body);
  }

}
