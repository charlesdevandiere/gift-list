import { HttpBackend, HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { Auth } from '../models/auth';
import { Group } from '../models/group';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly http: HttpClient

  private readonly _auth = signal<Auth | null>(null)

  public readonly authenticated = computed(() => !!this._auth())

  public readonly token = computed(() => {
    const auth = this._auth();
    if (auth) {
      return this.buildToken(auth.username, auth.password)
    } else {
      return null
    }
  })

  public constructor() {
    const httpBackend = inject(HttpBackend)

    this.http = new HttpClient(httpBackend)
  }

  public async signIn(username: string, password: string): Promise<void> {
    const token: string = this.buildToken(username, password)
    const authorization = `Basic ${token}`

    try {
      await firstValueFrom(
        this.http.get<Group[]>('/api/groups', { headers: { 'Authorization': authorization } })
      )
      this._auth.set({ username, password })
    }
    catch (err) {
      throw new Error('wrong username or password.', { cause: err })
    }
  }

  public signOut(): void {
    this._auth.set(null)
  }

  private buildToken(username: string, password: string): string {
    return globalThis.btoa(`${username}:${password}`)
  }

}
