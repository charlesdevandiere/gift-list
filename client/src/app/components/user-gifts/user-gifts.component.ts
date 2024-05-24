import { AsyncPipe, JsonPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, Subject, firstValueFrom, takeUntil } from 'rxjs';
import { ConfirmModalData } from 'src/app/models/confirm-modal-data.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { ToastsService } from 'src/app/services/toasts.service';
import { AppTranslations } from 'src/app/utils/app-translations';
import { Gift } from '../../models/gift.model';
import { GiftsService } from '../../services/gifts.service';
import { ConfirmModalComponent } from '../modals/confirm-modal/confirm-modal.component';
import { ShareModalComponent } from '../modals/share-modal/share-modal.component';

interface State {
  connectedUserId: string | null;
  gifts: Gift[];
  offerings: string[];
  loading: boolean;
  reordering: boolean;
  user: User | null;
};

@Component({
  selector: 'app-user-gifts',
  templateUrl: './user-gifts.component.html',
  styleUrls: ['./user-gifts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, AsyncPipe, NgClass, JsonPipe]
})
export class UserGiftsComponent implements OnDestroy {

  protected state$: Observable<State>;

  private readonly _state$: BehaviorSubject<State> = new BehaviorSubject<State>({ connectedUserId: null, gifts: [], offerings: [], loading: false, reordering: false, user: null });

  private readonly _unsubscriber$: Subject<void> = new Subject<void>();

  @ViewChild('back')
  private backButton?: ElementRef<HTMLElement>;

  @Input()
  public set user(value: User | null) {
    const state: State = {
      ...this._state$.getValue(),
      user: value
    };
    this._state$.next(state);
    this.getUserGifts().then(() => void 0).catch(() => void 0);
    this.backButton?.nativeElement.focus();
  }

  public constructor(
    private authService: AuthService,
    private giftsService: GiftsService,
    private router: Router,
    private modalService: NgbModal,
    private toastsService: ToastsService,
    public translations: AppTranslations) {
    this.state$ = this._state$.asObservable();
    this.authService.userId$
      .pipe(takeUntil(this._unsubscriber$))
      .subscribe((value: string | null) => {
        const state: State = {
          ...this._state$.getValue(),
          connectedUserId: value
        };
        this._state$.next(state);
      });
  }

  public ngOnDestroy(): void {
    this._unsubscriber$.next();
    this._unsubscriber$.complete();
  }

  protected async addGift(): Promise<void> {
    await this.router.navigate(['/new-gift']);
  }

  protected async deleteGift(gift: Gift): Promise<void> {
    try {
      const data: ConfirmModalData = {
        message: this.translations.home.giftList.deleteGift(gift.name),
        yesButton: {
          color: 'danger',
          value: this.translations.misc.delete
        }
      };
      const modal = this.modalService.open(ConfirmModalComponent);
      (modal.componentInstance as ConfirmModalComponent).data = data;
      await modal.result;
      await firstValueFrom(this.giftsService.deleteGift(gift.id));
      await this.getUserGifts({ noLoader: true })
    }
    catch {
      void 0;
    }
  }

  protected async refresh(): Promise<void> {
    await this.getUserGifts({ noCache: true });
  }

  protected reorder(id: string, direction: 'up' | 'down'): void {
    const gifts: Gift[] = this._state$.getValue().gifts;
    const from: number = gifts.findIndex(gift => gift.id == id);
    const gift: Gift | undefined = gifts.splice(from, 1)[0];
    if (!gift) {
      throw new Error(`Unable to reorder gift ${id}.`);
    }
    const to: number = direction == 'up' ? from - 1 : from + 1;
    gifts.splice(to, 0, gift);
    this._state$.next({
      ...this._state$.getValue(),
      gifts: gifts
    });
  }

  protected async saveOrder(): Promise<void> {
    const gifts: Gift[] = this._state$.getValue().gifts;
    this._state$.next({
      ...this._state$.getValue(),
      reordering: false
    });
    await firstValueFrom(this.giftsService.reorderGifts(gifts));
    await this.getUserGifts();
  }

  protected share(gift: Gift): void {
    let text: string = gift.name;
    [gift.link1, gift.link2, gift.link3].forEach(link => {
      if (link) {
        text += ` ${link}`;
      }
    });
    const modal = this.modalService.open(ShareModalComponent);
    (modal.componentInstance as ShareModalComponent).text = text;
  }

  public async toggleOffer(gift: Gift): Promise<void> {
    let action: Observable<void> | null = null;

    if (!gift.offered_by) {
      action = this.giftsService.offerGift(gift);
    } else if (gift.offered_by === this.authService.userId) {
      action = this.giftsService.unofferGift(gift);
    }

    const offerings = this._state$.getValue().offerings;
    this._state$.next({
      ...this._state$.getValue(),
      offerings: [...offerings, gift.id]
    });

    const removeFromOfferings = (giftId: string) => {
      const offerings = this._state$.getValue().offerings;
      const index: number = offerings.indexOf(giftId);
      if (index >= 0) {
        offerings.splice(index, 1);
        this._state$.next({
          ...this._state$.getValue(),
          offerings: offerings
        });
      }
    }

    if (action) {
      try {
        await firstValueFrom(action);
        await this.getUserGifts({ noLoader: true });
        removeFromOfferings(gift.id);
      }
      catch (err) {
        console.error(err);
        this.toastsService.show(this.translations.misc.error, { severity: 'danger' });
        removeFromOfferings(gift.id);
      }
    }
  }

  public toggleReorder(): void {
    const state: State = {
      ...this._state$.getValue()
    };
    state.reordering = !state.reordering;
    this._state$.next(state);
  }

  public async updateGift(gift: Gift): Promise<void> {
    await this.router.navigate(['/gift', gift.id]);
  }

  private async getUserGifts(options?: { noCache?: boolean, noLoader?: boolean }): Promise<void> {
    const displayLoader = !options?.noLoader;
    const user: User | null = this._state$.getValue().user;
    if (user) {
      if (displayLoader) {
        this._state$.next({
          ...this._state$.getValue(),
          loading: true,
          reordering: false
        });
      }

      try {
        const gifts: Gift[] = await firstValueFrom(this.giftsService.getUserGifts(user.id, { noCache: options?.noCache }));
        const state: State = {
          ...this._state$.getValue(),
          gifts: gifts
        };
        if (displayLoader) {
          state.loading = false;
        }
        this._state$.next(state);
      }
      catch (err) {
        console.error(err);
        if (displayLoader) {
          this._state$.next({
            ...this._state$.getValue(),
            loading: false
          });
        }
        this.toastsService.show(this.translations.misc.error, { severity: 'danger' });
      }
    } else {
      const state: State = {
        ...this._state$.getValue(),
        gifts: []
      };
      this._state$.next(state);
    }
  }

}
