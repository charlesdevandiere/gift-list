import { ApplicationRef, inject, Injectable } from '@angular/core'
import { SwUpdate } from '@angular/service-worker'
import { first } from 'rxjs/internal/operators/first'

@Injectable({
  providedIn: 'root',
})
export class CheckForUpdateService {
  private readonly swUpdate = inject(SwUpdate)
  private readonly appRef = inject(ApplicationRef)

  public constructor() {
    this.appRef.isStable.pipe(first((isStable) => isStable === true))
      .subscribe(() => {
        this.swUpdate.checkForUpdate()
          .then(updateFound => console.log(updateFound ? 'A new version is available.' : 'Already on the latest version.'))
          .catch(err => console.error('Failed to check for updates:', err))
      })
  }

}
