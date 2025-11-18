import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { User } from '../../models/user.model'
import { AuthService } from '../../services/auth.service'
import { EventBusService } from '../../services/event-bus.service'
import { ToastsService } from '../../services/toasts.service'
import { UsersService } from '../../services/users.service'
import { AppTranslations } from '../../utils/app-translations'

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  standalone: true
})
export class UserPageComponent implements OnInit {
  protected readonly toastsService = inject(ToastsService)
  protected readonly translations = inject(AppTranslations)
  private readonly authService = inject(AuthService)
  private readonly usersService = inject(UsersService)
  private readonly eventBus = inject(EventBusService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)

  public static readonly ADD_USER_EVENT = 'ADD_USER_EVENT'

  public static readonly UPDATE_USER_EVENT = 'UPDATE_USER_EVENT'

  public readonly userId: string | null = this.route.snapshot.paramMap.get('id')

  protected action: 'add' | 'update' = 'add'

  protected readonly form: FormGroup<{
    id: FormControl<string | null>,
    name: FormControl<string | null>
  }>

  protected readonly pictures: string[] = [
    'airplane-fill',
    'balloon-fill',
    'balloon-heart-fill',
    'bicycle',
    'binoculars-fill',
    'book-fill',
    'briefcase-fill',
    'brush-fill',
    'bus-front-fill',
    'camera2',
    'car-front-fill',
    'cone-striped',
    'controller',
    'cup-hot-fill',
    'cup-straw',
    'emoji-heart-eyes-fill',
    'emoji-kiss-fill',
    'emoji-laughing-fill',
    'emoji-smile-fill',
    'emoji-smile-upside-down-fill',
    'emoji-sunglasses-fill',
    'emoji-wink-fill',
    'fire',
    'flag-fill',
    'flower3',
    'hammer',
    'headphones',
    'heart-fill',
    'house-fill',
    'joystick',
    'lamp-fill',
    'lightning-fill',
    'moon-stars-fill',
    'music-player-fill',
    'palette-fill',
    'puzzle-fill',
    'robot',
    'rocket-takeoff-fill',
    'snow',
    'suitcase-fill',
    'sunglasses',
    'tree-fill',
    'truck',
    'umbrella-fill',
    'wrench-adjustable'
  ]

  protected readonly selectedPicture = signal<string | null>(null)

  public constructor() {
    const formBuilder = inject(FormBuilder)

    this.form = formBuilder.group({
      id: [null as string | null],
      name: [null as string | null, [Validators.required, Validators.maxLength(250)]]
    })
  }

  public ngOnInit(): void {
    if (this.userId) {
      this.prepareForUpdate(this.userId)
    } else {
      this.prepareForAdd()
    }
  }

  protected async onSubmit(): Promise<void> {
    try {
      if (this.action === 'add' && this.form.value.name) {
        await firstValueFrom(
          this.usersService.addUser({
            name: this.form.value.name,
            picture: this.selectedPicture()
          })
        )
        this.eventBus.emit(UserPageComponent.ADD_USER_EVENT)
        this.toastsService.show(this.translations.user.userAddedMessage, { severity: 'success' })
        await this.router.navigate(['/'])
      }
      else if (this.action === 'update' && this.form.value.id && this.form.value.name) {
        const user: User = {
          id: this.form.value.id,
          name: this.form.value.name,
          picture: this.selectedPicture()
        }
        await firstValueFrom(this.usersService.updateUser(user))
        this.eventBus.emit(UserPageComponent.UPDATE_USER_EVENT)
        if (this.authService.me()?.id === this.userId) {
          await this.authService.setCurrentUser(user.id)
        }
        this.toastsService.show(this.translations.user.userUpdatedMessage, { severity: 'success' })
        await this.router.navigate(['/'])
      }
    }
    catch (err) {
      console.error(err)
      this.toastsService.show(this.translations.misc.error, { severity: 'danger' })
    }
  }

  protected selectPicture(picture: string): void {
    this.selectedPicture.set(this.selectedPicture() === picture ? null : picture)
  }

  private prepareForAdd(): void {
    this.action = 'add'
    this.form.reset({
      id: null,
      name: null
    })
    this.selectedPicture.set(null)
  }

  private prepareForUpdate(userId: string): void {
    this.action = 'update'
    this.usersService.getUser(userId)
      .subscribe((user: User): void => {
        this.selectedPicture.set(user.picture)
        this.form.reset({
          id: userId,
          name: user.name
        })
      })
  }

}
