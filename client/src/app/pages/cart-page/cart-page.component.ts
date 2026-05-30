import { ChangeDetectionStrategy, Component, OnInit, Signal, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal'
import { firstValueFrom } from 'rxjs'
import { GiftLinkComponent } from '../../components/gift-link/gift-link.component'
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal.component'
import { ConfirmModalData } from '../../models/confirm-modal-data.model'
import { Gift } from '../../models/gift.model'
import { UserWithGifts } from '../../models/user-with-gifts.model'
import { ColorModesService, Theme } from '../../services/color-modes.service'
import { GiftsService } from '../../services/gifts.service'
import { MeService } from '../../services/me.service'
import { ToastsService } from '../../services/toasts.service'

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GiftLinkComponent, RouterLink]
})
export class CartPageComponent implements OnInit {
  private readonly colorModeService = inject(ColorModesService)
  private readonly giftsService = inject(GiftsService)
  private readonly meService = inject(MeService)
  private readonly modalService = inject(NgbModal)
  private readonly toastsService = inject(ToastsService)

  protected readonly cart = signal<{ name: string, gifts: Gift[] }[]>([])
  protected readonly theme: Signal<Theme> = this.colorModeService.theme
  protected readonly loading = signal<boolean>(false)

  public ngOnInit(): void {
    this.loadCart().catch(console.error)
  }

  public async unoffer(gift: Gift): Promise<void> {
    const data: ConfirmModalData = {
      message: $localize`:@@cartPage.confirmUnofferGift:Are you sure you no longer want to offer the "${gift.name}" gift?`,
      yesButton: {
        color: 'primary',
        value: $localize`:@@cartPage.yes:Yes`
      },
      noButton: {
        value: $localize`:@@cartPage.no:No`
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
        this.toastsService.show(
          $localize`:@@cartPage.unofferError:A error occurred while removing gift "${gift.name}" from cart.`,
          { severity: 'danger' }
        )
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
      this.toastsService.show(
        $localize`:@@cartPage.loadError:A error occurred while loading cart.`,
        { severity: 'danger' }
      )
    }
    this.loading.set(false)
  }

}
