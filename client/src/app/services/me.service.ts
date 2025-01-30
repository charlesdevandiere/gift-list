import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Me } from '../models/me.model';
import { UserWithGifts } from '../models/user-with-gifts.model';

@Injectable({
  providedIn: 'root'
})
export class MeService {

  public constructor(
    private readonly http: HttpClient) { }

  public getMe(): Observable<Me> {
    return this.http.get<Me>('/api/me');
  }

  public getCart(): Observable<UserWithGifts[]> {
    const url = '/api/me/cart';
    return this.http.get<UserWithGifts[]>(url);
  }

}
