import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Toast } from '../models/toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastsService {

  private static readonly TOAST_DURATION = 5000;

  private readonly _toasts$ = new Subject<Toast[]>();

  public get toasts$(): Observable<Toast[]> {
    return this._toasts$.asObservable();
  }

  private readonly toastsQueue: Toast[] = [];

  private lastId = 0;

  public hide(toastId: number): void {
    const index: number = this.toastsQueue.findIndex(toast => toast.id === toastId);
    this.toastsQueue.splice(index, 1);
    this.emitToasts();
  }

  public show(
    message: string,
    options?: {
      severity?: 'danger' | 'default' | 'success',
      title?: string
    }): void {
    const toast: Toast = {
      id: ++this.lastId,
      message: message,
      severity: options?.severity,
      title: options?.title
    }
    this.toastsQueue.push(toast);
    this.emitToasts();

    setTimeout(
      () => this.hide(toast.id),
      ToastsService.TOAST_DURATION
    );
  }

  private emitToasts(): void {
    const toasts: Toast[] = this.toastsQueue
      .sort((a, b) => a.id - b.id)
      .reverse();
    this._toasts$.next(toasts);
  }
}
