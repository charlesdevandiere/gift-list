import { inject, Injectable } from '@angular/core'
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker'
import { filter } from 'rxjs/internal/operators/filter'
import { ToastsService } from '../services/toasts.service'

@Injectable({ providedIn: 'root' })
export class PromptUpdateService {
  private readonly swUpdate = inject(SwUpdate)
  private readonly toastsService = inject(ToastsService)

  public constructor() {
    this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(() => {
        this.toastsService.show(
          $localize`:@@promptUpdate.update:Update to the latest version?`,
          {
            callback: () => document.location.reload(),
            button: $localize`:@@promptUpdate.install:Install`,
            delay: 15000
          })
      })
  }
}
