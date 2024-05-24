import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventBusService implements OnDestroy {

  private _bus$ = new Subject<string>();

  public listen(event?: string): Observable<string> {
    if (event) {
      return this._bus$.pipe(
        filter((value: string): boolean => value === event)
      );
    } else {
      return this._bus$.asObservable();
    }
  }

  public emit(event: string): void {
    if (!event) {
      throw new Error('Param event is required.');
    }

    this._bus$.next(event);
  }

  public ngOnDestroy(): void {
    this._bus$.complete();
  }

}
