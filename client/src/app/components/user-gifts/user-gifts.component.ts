import { ChangeDetectionStrategy, Component, ElementRef, Signal, effect, inject, input, signal, viewChild } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Observable, firstValueFrom } from 'rxjs'
import { ConfirmModalData } from '../../models/confirm-modal-data.model'
import { Gift } from '../../models/gift.model'
import { User } from '../../models/user.model'
import { AuthService } from '../../services/auth.service'
import { GiftsService } from '../../services/gifts.service'
import { ToastsService } from '../../services/toasts.service'
import { AppTranslations } from '../../utils/app-translations'
import { ConfirmModalComponent } from '../modals/confirm-modal/confirm-modal.component'
import { ShareModalComponent } from '../modals/share-modal/share-modal.component'

@Component({
  selector: 'app-user-gifts',
  templateUrl: './user-gifts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  standalone: true
})
export class UserGiftsComponent {
  protected readonly translations = inject(AppTranslations)
  private readonly authService = inject(AuthService)
  private readonly giftsService = inject(GiftsService)
  private readonly router = inject(Router)
  private readonly modalService = inject(NgbModal)
  private readonly toastsService = inject(ToastsService)

  protected readonly connectedUserId: Signal<string | null> = this.authService.connectedUserId
  protected readonly gifts = signal<Gift[]>([])
  protected readonly offerings = signal<string[]>([])
  protected readonly loading = signal<boolean>(false)
  protected readonly reordering = signal<boolean>(false)

  private readonly backButton = viewChild<ElementRef<HTMLElement>>('back')

  public readonly user = input<User>()

  public constructor() {
    effect(() => {
      if (this.user()) {
        this.backButton()?.nativeElement.focus()
        this.getUserGifts().catch(console.error)
      }
    })
  }

  protected async addGift(): Promise<void> {
    await this.router.navigate(['/new-gift'])
  }

  protected async deleteGift(gift: Gift): Promise<void> {
    try {
      const data: ConfirmModalData = {
        message: this.translations.home.giftList.deleteGift(gift.name),
        yesButton: {
          color: 'danger',
          value: this.translations.misc.delete
        }
      }
      const modal = this.modalService.open(ConfirmModalComponent)
      const component: ConfirmModalComponent = modal.componentInstance as ConfirmModalComponent
      component.data.set(data)
      await modal.result
      await firstValueFrom(this.giftsService.deleteGift(gift.id))
      await this.getUserGifts({ noLoader: true })
    }
    catch (err) {
      console.error(err)
    }
  }

  protected async refresh(): Promise<void> {
    await this.getUserGifts({ noCache: true })
  }

  protected reorder(id: string, direction: 'up' | 'down'): void {
    this.gifts.update((gifts: Gift[]) => {
      const from: number = gifts.findIndex(gift => gift.id == id)
      const gift: Gift | undefined = gifts.splice(from, 1)[0]
      if (!gift) {
        throw new Error(`Unable to reorder gift ${id}.`)
      }
      const to: number = direction == 'up' ? from - 1 : from + 1
      gifts.splice(to, 0, gift)
      return gifts
    })
  }

  protected async saveOrder(): Promise<void> {
    this.reordering.set(false)
    await firstValueFrom(this.giftsService.reorderGifts(this.gifts()))
    await this.getUserGifts()
  }

  protected async share(gift: Gift): Promise<void> {
    const data: ShareData = {
      title: gift.name,
      text: [gift.name, gift.link1, gift.link2, gift.link3].filter(link => link?.length).join(' ')
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

  public async toggleOffer(gift: Gift): Promise<void> {
    const connectedUserId: string | null = this.authService.connectedUserId()
    if (!connectedUserId) {
      throw new Error('no connected user')
    }

    const userId: string | undefined = this.user()?.id
    if (!userId) {
      throw new Error('userId cannot be null.')
    }
    if (userId === connectedUserId) {
      throw new Error('forbidden')
    }

    let action: Observable<void> | null = null

    if (!gift.offeredByUserId) {
      action = this.giftsService.offerGift(gift)
    } else if (gift.offeredByUserId === connectedUserId) {
      action = this.giftsService.unofferGift(gift)
    }

    if (action) {
      this.offerings.update(value => [...value, gift.id])

      try {
        await firstValueFrom(action)
        await this.getUserGifts({ noLoader: true })
      }
      catch (err) {
        console.error(err)
        this.toastsService.show(this.translations.misc.error, { severity: 'danger' })
      }

      this.offerings.update(offerings => {
        const index: number = offerings.indexOf(gift.id)
        if (index >= 0) {
          offerings.splice(index, 1)
        }
        return offerings
      })
    }
  }

  public toggleReorder(): void {
    this.reordering.update(value => !value)
  }

  public async updateGift(gift: Gift): Promise<void> {
    await this.router.navigate(['/gift', gift.id])
  }

  private async getUserGifts(options?: { noCache?: boolean, noLoader?: boolean }): Promise<void> {
    const displayLoader = !options?.noLoader
    const user: User | undefined = this.user()
    this.reordering.set(false)
    if (user) {
      if (displayLoader) {
        this.loading.set(true)
      }

      try {
        this.gifts.set(await firstValueFrom(this.giftsService.getUserGifts(user.id)))
      }
      catch (err) {
        console.error(err)
        this.toastsService.show(this.translations.misc.error, { severity: 'danger' })
      }

      if (displayLoader) {
        this.loading.set(false)
      }
    } else {
      this.gifts.set([])
    }
  }

}
