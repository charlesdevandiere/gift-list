import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core'
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap/toast'
import { Toast } from '../../models/toast.model'
import { ToastsService } from '../../services/toasts.service'

@Component({
  selector: 'app-toasts',
  templateUrl: './toasts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbToastModule],
  host: {
    class: 'toast-container bottom-0 w-100 p-3',
    style: 'z-index: 1200'
  }
})
export class ToastsComponent {
  private readonly toastsService = inject(ToastsService)

  protected readonly toasts: Signal<Toast[]> = this.toastsService.toasts

  protected callback(toast: Toast): void {
    if (toast.callback) {
      toast.callback()
    }
  }

  protected hide(toast: Toast): void {
    this.toastsService.remove(toast)
  }

}
