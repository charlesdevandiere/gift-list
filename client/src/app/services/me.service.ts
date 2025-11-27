import { HttpClient } from '@angular/common/http'
import { Injectable, inject, signal } from '@angular/core'
import { toObservable } from '@angular/core/rxjs-interop'
import { Observable, tap } from 'rxjs'
import { Me } from '../models/me.model'
import { UserWithGifts } from '../models/user-with-gifts.model'
import { AuthService } from './auth.service'

@Injectable({
  providedIn: 'root'
})
export class MeService {
  private readonly http = inject(HttpClient)
  private readonly authService = inject(AuthService)

  private readonly _cartCount = signal<number>(0)
  public readonly cartCount = this._cartCount.asReadonly()

  public constructor() {
    toObservable(this.authService.me)
      .subscribe(() => this.refreshCart())
  }

  public getMe(): Observable<Me> {
    return this.http.get<Me>('/api/me')
  }

  public getCart(): Observable<UserWithGifts[]> {
    const url = '/api/me/cart'
    return this.http.get<UserWithGifts[]>(url)
      .pipe(
        tap((value: UserWithGifts[]) => {
          if (value?.length > 0) {
            this._cartCount.set(
              value
                .map(user => user.gifts.length)
                .reduce((previous, current) => previous + current, 0)
            )
          } else {
            this._cartCount.set(0)
          }
        })
      )
  }

  public refreshCart(): void {
    this.getCart().subscribe()
  }

}
