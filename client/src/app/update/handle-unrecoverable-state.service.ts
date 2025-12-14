import { inject, Injectable } from '@angular/core'
import { SwUpdate } from '@angular/service-worker'
import { ToastsService } from '../services/toasts.service'

@Injectable({ providedIn: 'root' })
export class HandleUnrecoverableStateService {
  private readonly swUpdate = inject(SwUpdate)
  private readonly toastsService = inject(ToastsService)

  public constructor() {
    this.swUpdate.unrecoverable.subscribe((event) => {
      console.error(`An error occurred that we cannot recover from: ${event.reason}`)
      this.toastsService.show(
        $localize`:@@handleUnrecoverableState.error:An error occurred. Please reload the page.`,
        {
          callback: () => document.location.reload(),
          button: $localize`:@@handleUnrecoverableState.reload:Reload`
        })
    })
  }
}
