import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { ToastsService } from '../../../services/toasts.service'
import { AppTranslations } from '../../../utils/app-translations'

@Component({
  selector: 'app-share-modal',
  templateUrl: './share-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ShareModalComponent {
  protected readonly modal = inject(NgbActiveModal)
  protected readonly translations = inject(AppTranslations)
  private readonly toastsService = inject(ToastsService)

  public data = signal<ShareData | undefined>(undefined)

  public async copy(): Promise<void> {
    const data: ShareData | undefined = this.data()
    if (data) {
      await navigator.clipboard.writeText(data.text ?? '')
      this.modal.close()
      this.toastsService.show(this.translations.share.successMessage, { severity: 'success' })
    }
  }

}
