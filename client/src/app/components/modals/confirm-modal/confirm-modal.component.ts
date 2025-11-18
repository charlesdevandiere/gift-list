import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { ConfirmModalData } from '../../../models/confirm-modal-data.model'
import { AppTranslations } from '../../../utils/app-translations'

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ConfirmModalComponent {
  protected readonly modal = inject(NgbActiveModal)
  protected readonly translations = inject(AppTranslations)

  public data = signal<ConfirmModalData | undefined>(undefined)

}
