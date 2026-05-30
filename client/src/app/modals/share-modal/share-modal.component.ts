import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap/modal'
import { ToastsService } from '../../services/toasts.service'

@Component({
  selector: 'app-share-modal',
  templateUrl: './share-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareModalComponent {
  protected readonly modal = inject(NgbActiveModal)
  private readonly toastsService = inject(ToastsService)

  public data = signal<ShareData | undefined>(undefined)

  public async copy(): Promise<void> {
    const data: ShareData | undefined = this.data()
    if (data) {
      await navigator.clipboard.writeText(data.text ?? '')
      this.modal.close()
      this.toastsService.show(
        $localize`:@@shareModal.successMessage:Copied to clipboard.`,
        { severity: 'success' }
      )
    }
  }

}
