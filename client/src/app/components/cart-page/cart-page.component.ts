import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ConfirmModalData } from '../../models/confirm-modal-data.model';
import { Gift } from '../../models/gift.model';
import { UserWithGifts } from '../../models/user.model';
import { GiftsService } from '../../services/gifts.service';
import { MeService } from '../../services/me.service';
import { ToastsService } from '../../services/toasts.service';
import { AppTranslations } from '../../utils/app-translations';
import { ConfirmModalComponent } from '../modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AsyncPipe]
})
export class CartPageComponent implements OnInit {

  protected loading$ = new BehaviorSubject<boolean>(false);

  protected cart: { name: string, gifts: Gift[] }[] = [];

  public constructor(
    public translations: AppTranslations,
    private readonly giftsService: GiftsService,
    private readonly meService: MeService,
    private readonly modalService: NgbModal,
    private readonly toastsService: ToastsService) { }

  public ngOnInit(): void {
    this.loadCart();
  }

  public async unoffer(gift: Gift): Promise<void> {
    const data: ConfirmModalData = {
      message: this.translations.cart.unoffer(gift.name),
      yesButton: {
        color: 'primary',
        value: this.translations.misc.yes
      },
      noButton: {
        value: this.translations.misc.no
      }
    };
    const modal = this.modalService.open(ConfirmModalComponent);
    (modal.componentInstance as ConfirmModalComponent).data = data;

    try {
      await modal.result;
      try {
        await firstValueFrom(this.giftsService.unofferGift(gift));
        this.loadCart();
      }
      catch (err) {
        console.error(err);
        this.toastsService.show(this.translations.misc.error, { severity: 'danger' });
      }
    }
    catch {
      void 0;
    }
  }

  private loadCart(): void {
    this.loading$.next(true);
    this.meService.getCart().subscribe({
      next: (cart: UserWithGifts[]) => {
        this.cart = cart.map(item => ({ name: item.name, gifts: item.gifts ?? [] }));
      },
      error: (err) => {
        console.error(err);
        this.toastsService.show(this.translations.misc.error, { severity: 'danger' });
      },
      complete: () => this.loading$.next(false)
    });
  }

}
