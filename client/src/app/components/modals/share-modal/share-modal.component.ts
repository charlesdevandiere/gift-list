import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastsService } from '../../../services/toasts.service';
import { AppTranslations } from '../../../utils/app-translations';

@Component({
  selector: 'app-share-modal',
  templateUrl: './share-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ShareModalComponent {

  @Input()
  public data: ShareData | null = null;

  public constructor(
    public readonly modal: NgbActiveModal,
    public readonly translations: AppTranslations,
    private readonly toastsService: ToastsService) { }

  public async copy(): Promise<void> {
    if (this.data) {
      await navigator.clipboard.writeText(this.data.text ?? '');
      this.modal.close();
      this.toastsService.show(this.translations.share.successMessage, { severity: 'success' });
    }
  }

}
