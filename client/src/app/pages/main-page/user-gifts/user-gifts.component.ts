import { ChangeDetectionStrategy, Component, ElementRef, Signal, effect, inject, signal, viewChild } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { Observable, firstValueFrom } from 'rxjs'
import { GiftComponent } from '../../../components/gift/gift.component'
import { Gift } from '../../../models/gift.model'
import { User } from '../../../models/user.model'
import { AuthService } from '../../../services/auth.service'
import { ColorModesService, Theme } from '../../../services/color-modes.service'
import { GiftsService } from '../../../services/gifts.service'
import { ToastsService } from '../../../services/toasts.service'
import { MainPageService } from '../main-page.service'

@Component({
  selector: 'app-user-gifts',
  templateUrl: './user-gifts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GiftComponent, RouterLink],
  host: {
    class: 'h-100 d-flex flex-column overflow-hidden'
  }
})
export class UserGiftsComponent {
  private readonly authService = inject(AuthService)
  private readonly colorModeService = inject(ColorModesService)
  private readonly giftsService = inject(GiftsService)
  private readonly router = inject(Router)
  private readonly service = inject(MainPageService)
  private readonly toastsService = inject(ToastsService)

  protected readonly theme: Signal<Theme> = this.colorModeService.theme
  protected readonly connectedUserId: Signal<string | null> = this.authService.connectedUserId
  protected readonly gifts = signal<Gift[]>([])
  protected readonly loading = signal<boolean>(false)
  protected readonly offerings = signal<string[]>([])
  protected readonly reordering = signal<boolean>(false)
  protected readonly user = this.service.selectedUser

  private readonly backButton = viewChild<ElementRef<HTMLElement>>('back')

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

  protected async refresh(options?: { noLoader?: boolean }): Promise<void> {
    await this.getUserGifts(options)
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
      }
      catch (err) {
        console.error(err)
        this.toastsService.show(
          $localize`:@@mainPage.userGift.actionError:A error occurred while saving your action.`,
          { severity: 'danger' }
        )
      }

      await this.getUserGifts({ noLoader: true })

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

  private async getUserGifts(options?: { noLoader?: boolean }): Promise<void> {
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
        this.toastsService.show(
          $localize`:@@mainPage.userGift.loadError:A error occurred while loading gifts.`,
          { severity: 'danger' }
        )
      }

      if (displayLoader) {
        this.loading.set(false)
      }
    } else {
      this.gifts.set([])
    }
  }

}
