import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, firstValueFrom, zip } from 'rxjs';
import { ConfirmModalComponent } from '../modals/confirm-modal/confirm-modal.component';
import { Gift } from '../../models/gift.model';
import { User } from '../../models/user.model';
import { AppTranslations } from '../../utils/app-translations';
import { GiftsService } from '../../services/gifts.service';
import { ToastsService } from '../../services/toasts.service';
import { UsersService } from '../../services/users.service';
import { ConfirmModalData } from '../../models/confirm-modal-data.model';

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, AsyncPipe]
})
export class CartPageComponent implements OnInit {

  protected loading$ = new BehaviorSubject<boolean>(false);

  protected cart: { name: string, gifts: Gift[] }[] = [];

  protected users: User[] = [];

  public constructor(
    public translations: AppTranslations,
    private giftsService: GiftsService,
    private modalService: NgbModal,
    private toastsService: ToastsService,
    private usersService: UsersService) { }

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
    zip(
      this.giftsService.getCart(),
      this.usersService.getUsers()
    )
      .subscribe({
        next: ([gifts, users]: [Gift[], User[]]) => {
          this.cart = this.buildCart(gifts, users);
        },
        error: (err) => {
          console.error(err);
          this.toastsService.show(this.translations.misc.error, { severity: 'danger' });
        },
        complete: () => this.loading$.next(false)
      });
  }

  private buildCart(gifts: Gift[], users: User[]): { name: string, gifts: Gift[] }[] {
    const cart: { name: string, gifts: Gift[] }[] = [];

    gifts.forEach((value: Gift) => {
      const user: string = users.find(u => u.id === value.user_id)?.name ?? '';
      let group = cart.find(g => g.name === user);
      if (!group) {
        group = { name: user, gifts: [] };
        cart.push(group);
      }
      group.gifts.push(value);
    });

    return cart;
  }

}
