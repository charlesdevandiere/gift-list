import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap/modal'
import { ConfirmModalData } from '../../models/confirm-modal-data.model'

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmModalComponent {
  protected readonly modal = inject(NgbActiveModal)

  public readonly data = signal<ConfirmModalData | undefined>(undefined)

}
