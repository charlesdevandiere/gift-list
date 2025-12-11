import { ChangeDetectionStrategy, Component, OnInit, Signal, inject } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { Gift } from '../../models/gift.model'
import { AuthService } from '../../services/auth.service'
import { ColorModesService, Theme } from '../../services/color-modes.service'
import { GiftsService } from '../../services/gifts.service'
import { ToastsService } from '../../services/toasts.service'

@Component({
  selector: 'app-gift-page',
  templateUrl: './gift-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule]
})
export class GiftPageComponent implements OnInit {
  private readonly authService = inject(AuthService)
  private readonly colorModeService = inject(ColorModesService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly giftsService = inject(GiftsService)
  private readonly toastsService = inject(ToastsService)

  protected readonly theme: Signal<Theme> = this.colorModeService.theme
  protected action: 'add' | 'update' = 'add'

  protected readonly form: FormGroup<{
    id: FormControl<string | null>,
    name: FormControl<string | null>,
    link1: FormControl<string | null>,
    link2: FormControl<string | null>,
    link3: FormControl<string | null>
  }>

  public readonly giftId: string | null = this.route.snapshot.paramMap.get('id')

  public constructor() {
    const formBuilder = inject(FormBuilder)

    this.form = formBuilder.group({
      id: [null as string | null],
      name: [null as string | null, [Validators.required, Validators.maxLength(250)]],
      link1: [null as string | null, [Validators.maxLength(2000)]],
      link2: [null as string | null, [Validators.maxLength(2000)]],
      link3: [null as string | null, [Validators.maxLength(2000)]]
    })
  }

  public ngOnInit(): void {
    if (this.giftId) {
      this.prepareForUpdate(this.giftId)
    } else {
      this.prepareForAdd()
    }
  }

  protected async back(): Promise<void> {
    await this.router.navigate(
      ['/'],
      { queryParams: { 'user-id': this.authService.me()?.id } }
    )
  }

  public async onSubmit(): Promise<void> {
    try {
      if (this.action === 'add' && this.form.value.name) {
        await firstValueFrom(this.giftsService
          .addGift({
            name: this.form.value.name,
            link1: this.form.value.link1,
            link2: this.form.value.link2,
            link3: this.form.value.link3
          })
        )
        this.toastsService.show($localize`:@@giftPage.giftAddedMessage:Gift added.`, { severity: 'success' })
        await this.back()
      } else if (this.action === 'update' && this.form.value.id && this.form.value.name) {
        await firstValueFrom(this.giftsService
          .updateGift({
            id: this.form.value.id,
            name: this.form.value.name,
            link1: this.form.value.link1,
            link2: this.form.value.link2,
            link3: this.form.value.link3
          })
        )
        this.toastsService.show($localize`:@@giftPage.giftUpdatedMessage:Gift updated.`, { severity: 'success' })
        await this.back()
      }
    }
    catch (err) {
      console.error(err)
      this.toastsService.show($localize`:@@giftPage.saveError:A error occurred while saving gift.`, { severity: 'danger' })
    }
  }

  private prepareForAdd(): void {
    this.action = 'add'
  }

  private prepareForUpdate(giftId: string): void {
    this.action = 'update'
    const userId = this.authService.me()?.id
    if (!userId) {
      throw new Error('not identified')
    }

    this.giftsService.getGift(userId, giftId)
      .subscribe((gift: Gift): void => {
        this.form.reset({
          id: giftId,
          name: gift.name,
          link1: gift.link1,
          link2: gift.link2,
          link3: gift.link3
        })
        this.form.updateValueAndValidity()
      })
  }

}
