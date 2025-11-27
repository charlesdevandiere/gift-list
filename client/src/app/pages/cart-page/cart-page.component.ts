import { ChangeDetectionStrategy, Component, OnInit, Signal, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { firstValueFrom } from 'rxjs'
import { GiftLinkComponent } from '../../components/gift-link/gift-link.component'
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal.component'
import { ConfirmModalData } from '../../models/confirm-modal-data.model'
import { Gift } from '../../models/gift.model'
import { UserWithGifts } from '../../models/user-with-gifts.model'
import { ColorMode, ColorModesService } from '../../services/color-modes.service'
import { GiftsService } from '../../services/gifts.service'
import { MeService } from '../../services/me.service'
import { ToastsService } from '../../services/toasts.service'
import { AppTranslations } from '../../utils/app-translations'

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GiftLinkComponent, RouterLink]
})
export class CartPageComponent implements OnInit {
  protected readonly translations = inject(AppTranslations)
  private readonly colorModeService = inject(ColorModesService)
  private readonly giftsService = inject(GiftsService)
  private readonly meService = inject(MeService)
  private readonly modalService = inject(NgbModal)
  private readonly toastsService = inject(ToastsService)

  protected readonly cart = signal<{ name: string, gifts: Gift[] }[]>([])
  protected readonly colorMode: Signal<ColorMode> = this.colorModeService.colorMode.asReadonly()
  protected readonly loading = signal<boolean>(false)

  public ngOnInit(): void {
    this.loadCart().catch(console.error)
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
    }
    const modal = this.modalService.open(ConfirmModalComponent)
    const component: ConfirmModalComponent = modal.componentInstance as ConfirmModalComponent
    component.data.set(data)

    try {
      await modal.result
      try {
        await firstValueFrom(this.giftsService.unofferGift(gift))
        await this.loadCart()
      }
      catch (err) {
        console.error(err)
        this.toastsService.show(this.translations.misc.error, { severity: 'danger' })
      }
    }
    catch (err) {
      console.error(err)
    }
  }

  private async loadCart(): Promise<void> {
    this.loading.set(true)
    try {
      const cart: UserWithGifts[] = await firstValueFrom(this.meService.getCart())
      this.cart.set(cart.map(item => ({ name: item.name, gifts: item.gifts ?? [] })))
    } catch (err) {
      console.error(err)
      this.toastsService.show(this.translations.misc.error, { severity: 'danger' })
    }
    this.loading.set(false)
  }

}
