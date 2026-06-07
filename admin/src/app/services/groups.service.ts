import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { throwError } from 'rxjs/internal/observable/throwError';
import { Group } from '../models/group';

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  private readonly http = inject(HttpClient)

  public getGroups(): Observable<Group[]> {
    const url = '/api/groups'
    return this.http.get<Group[]>(url)
  }

  public getGroup(name: string): Observable<Group> {
    const url = `/api/groups/${name}`
    return this.http.get<Group>(url)
  }

  public addUser(group: Group & { password: string }): Observable<Group> {
    const url = '/api/groups'
    return this.http.post<Group>(url, group)
  }

  public updateUser(group: Group & { password: string }): Observable<void> {
    const url = `/api/groups/${group.name}`
    return this.http.put<void>(url, group)
  }

  public deleteUser(name: string): Observable<void> {
    if (!name) {
      return throwError(() => new Error('Param name is required.'))
    }

    const url = `/api/groups/${name}`
    return this.http.delete<void>(url)
  }

}
