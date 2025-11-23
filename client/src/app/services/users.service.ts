import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { Observable, of, throwError } from 'rxjs'
import { UserOrder } from '../models/user-order.model'
import { User } from '../models/user.model'

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient)

  public getUsers(): Observable<User[]> {
    const url = '/api/users'
    return this.http.get<User[]>(url)
  }

  public getUser(id: string): Observable<User> {
    const url = `/api/users/${id}`
    return this.http.get<User>(url)
  }

  public addUser(user: { name: string, picture?: string | null }): Observable<void> {
    const url = '/api/users'
    return this.http.post<void>(url, user)
  }

  public updateUser(user: { id: string, name: string, picture?: string | null }): Observable<void> {
    const url = `/api/users/${user.id}`
    return this.http.put<void>(url, user)
  }

  public deleteUser(id: string): Observable<void> {
    if (!id) {
      return throwError(() => new Error('Param id is required.'))
    }

    const url = `/api/users/${id}`
    return this.http.delete<void>(url)
  }

  public reorderUsers(users: User[]): Observable<void> {
    if (users.length == 0) {
      return of(void 0)
    }

    let index = 0
    const body: UserOrder[] = users.map(user => ({ userId: user.id, order: index++ }))

    const url = `/api/users`
    return this.http.patch<void>(url, body)
  }

}
