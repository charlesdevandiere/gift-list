import { Injectable, signal } from '@angular/core'
import { Toast } from '../models/toast.model'

@Injectable({
  providedIn: 'root'
})
export class ToastsService {
  private readonly _toasts = signal<Toast[]>([])
  public readonly toasts = this._toasts.asReadonly()

  public show(
    body: string,
    options?: {
      severity?: 'danger' | 'default' | 'success'
    }) {
    let classname = ''
    if (options?.severity === 'danger') {
      classname = 'text-bg-danger'
    }
    else if (options?.severity === 'success') {
      classname = 'text-bg-success'
    }
    const toast: Toast = {
      body: body,
      classname: classname,
    }
    this._toasts.update(value => [...value, toast])
  }

  public remove(toast: Toast): void {
    this._toasts.update(value => value.filter(element => element != toast))
  }

}
