import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal, Signal } from '@angular/core'
import { Router } from '@angular/router'
import { NgbCollapseModule, NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { firstValueFrom } from 'rxjs/internal/firstValueFrom'
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal.component'
import { ShareModalComponent } from '../../modals/share-modal/share-modal.component'
import { ConfirmModalData } from '../../models/confirm-modal-data.model'
import { Gift } from '../../models/gift.model'
import { AuthService } from '../../services/auth.service'
import { ColorModesService, Theme } from '../../services/color-modes.service'
import { GiftsService } from '../../services/gifts.service'
import { ToastsService } from '../../services/toasts.service'
import { GiftLinkComponent } from '../gift-link/gift-link.component'

@Component({
  selector: 'app-gift',
  imports: [GiftLinkComponent, NgbCollapseModule],
  templateUrl: './gift.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GiftComponent {
  private readonly authService = inject(AuthService)
  private readonly colorModeService = inject(ColorModesService)
  private readonly giftsService = inject(GiftsService)
  private readonly modalService = inject(NgbModal)
  private readonly router = inject(Router)
  private readonly toastsService = inject(ToastsService)

  protected readonly connectedUserId: Signal<string | null> = this.authService.connectedUserId
  protected readonly isLinksExpanded = signal<boolean>(false)
  protected readonly linksCount = computed(() => {
    let count = 0
    if (this.gift().link1) count++
    if (this.gift().link2) count++
    if (this.gift().link3) count++
    return count
  })
  protected readonly offering = signal<boolean>(false)
  protected readonly theme: Signal<Theme> = this.colorModeService.theme

  public readonly gift = input.required<Gift>()
  public readonly reordering = input<boolean>(false)
  public readonly updatable = input<boolean>(false)
  public readonly giftChange = output()

  // reordering
  public readonly isFirst = input<boolean>(false)
  public readonly isLast = input<boolean>(false)
  public readonly moveUp = output()
  public readonly moveDown = output()

  protected async deleteGift(): Promise<void> {
    const data: ConfirmModalData = {
      message: $localize`:@@gift.confirmDelete:Do you want to delete the "${this.gift().name}:name:" gift?`,
      yesButton: {
        color: 'danger',
        value: $localize`:@@gift.delete:Delete`
      }
    }
    const modal = this.modalService.open(ConfirmModalComponent)
    const component: ConfirmModalComponent = modal.componentInstance as ConfirmModalComponent
    component.data.set(data)
    try {
      await modal.result
      try {
        await firstValueFrom(this.giftsService.deleteGift(this.gift().id))
        this.giftChange.emit()
      }
      catch (err) {
        console.error(err)
        this.toastsService.show(
          $localize`:@@gift.deleteError:A error occurred while deleting gift.`,
          { severity: 'danger' }
        )
      }
    }
    catch {
      console.log('deletion canceled')
    }
  }

  protected async share(): Promise<void> {
    const data: ShareData = {
      title: this.gift().name,
      text: [this.gift().name, this.gift().link1, this.gift().link2, this.gift().link3].filter(link => link?.length).join(' ')
    }

    if (!!navigator.canShare && navigator.canShare(data)) {
      await navigator.share(data)
    }
    else {
      const modal = this.modalService.open(ShareModalComponent)
      const component: ShareModalComponent = modal.componentInstance as ShareModalComponent
      component.data.set(data)
    }
  }

  public async toggleOffer(): Promise<void> {
    const connectedUserId: string | null = this.authService.connectedUserId()
    if (!connectedUserId) {
      throw new Error('no connected user')
    }

    this.offering.set(true)

    try {
      if (!this.gift().offeredByUserId) {
        await firstValueFrom(this.giftsService.offerGift(this.gift()))
      } else if (this.gift().offeredByUserId === connectedUserId) {
        await firstValueFrom(this.giftsService.unofferGift(this.gift()))
      }
    }
    catch (err) {
      console.error(err)
      this.toastsService.show(
        $localize`:@@gift.actionError:A error occurred while saving your action.`,
        { severity: 'danger' }
      )
    }

    this.giftChange.emit()

    this.offering.set(false)
  }

  public async updateGift(): Promise<void> {
    await this.router.navigate(['/gift', this.gift().id])
  }

}
