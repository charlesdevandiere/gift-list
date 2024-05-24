import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalData } from 'src/app/models/confirm-modal-data.model';
import { AppTranslations } from 'src/app/utils/app-translations';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
  standalone: true
})
export class ConfirmModalComponent {

  @Input()
  public data: ConfirmModalData | null = null;

  public constructor(
    public modal: NgbActiveModal,
    public translations: AppTranslations) { }

}
