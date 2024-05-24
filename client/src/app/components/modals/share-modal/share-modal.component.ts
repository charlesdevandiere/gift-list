import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastsService } from 'src/app/services/toasts.service';
import { AppTranslations } from 'src/app/utils/app-translations';

@Component({
  selector: 'app-share-modal',
  templateUrl: './share-modal.component.html',
  styleUrls: ['./share-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ShareModalComponent {

  @Input()
  public text: string | null = null;

  @ViewChild('textToShare', { static: true })
  public input!: ElementRef<HTMLInputElement>;

  public constructor(
    public modal: NgbActiveModal,
    public toastsService: ToastsService,
    public translations: AppTranslations) { }

  public copy(): void {
    this.input.nativeElement.focus();
    this.input.nativeElement.select();
    document.execCommand('copy');
    this.modal.close();
    this.toastsService.show(this.translations.share.successMessage, { severity: 'success' });
  }

}
