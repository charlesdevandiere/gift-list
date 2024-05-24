import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { ToastsService } from 'src/app/services/toasts.service';
import { UsersService } from 'src/app/services/users.service';
import { AppTranslations } from 'src/app/utils/app-translations';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgClass, AsyncPipe]
})
export class UserPageComponent implements OnInit {

  public static readonly ADD_USER_EVENT = 'ADD_USER_EVENT';

  public static readonly UPDATE_USER_EVENT = 'UPDATE_USER_EVENT';

  public userId: string | null = this.route.snapshot.paramMap.get('id');

  protected action: 'add' | 'update' = 'add';

  protected readonly form: FormGroup<{
    id: FormControl<string | null>,
    name: FormControl<string | null>
  }>;

  protected readonly pictures: string[] = [
    'airplane-fill',
    'balloon-fill',
    'balloon-heart-fill',
    'bicycle',
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
    'tree-fill',
    'truck',
    'umbrella-fill',
    'wrench-adjustable'
  ];

  protected readonly selectedPicture$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  public constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private eventBus: EventBusService,
    formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public toastsService: ToastsService,
    public translations: AppTranslations) {
    this.form = formBuilder.group({
      id: [null as string | null],
      name: [null as string | null, [Validators.required, Validators.maxLength(250)]]
    });
  }

  public ngOnInit(): void {
    if (this.userId) {
      this.prepareForUpdate(this.userId);
    } else {
      this.prepareForAdd();
    }
  }

  protected async onSubmit(): Promise<void> {
    try {
      if (this.action === 'add' && this.form.value.name) {
        await firstValueFrom(
          this.usersService.addUser({
            name: this.form.value.name,
            picture: this.selectedPicture$.getValue()
          })
        );
        this.eventBus.emit(UserPageComponent.ADD_USER_EVENT);
        this.toastsService.show(this.translations.user.userAddedMessage, { severity: 'success' });
        await this.router.navigate(['/']);
      }
      else if (this.action === 'update' && this.form.value.id && this.form.value.name) {
        const user: User = {
          id: this.form.value.id,
          name: this.form.value.name,
          picture: this.selectedPicture$.getValue()
        };
        await firstValueFrom(this.usersService.updateUser(user));
        this.eventBus.emit(UserPageComponent.UPDATE_USER_EVENT);
        if (this.authService.userId === this.userId) {
          this.authService.setCurrentUser(user.id);
        }
        this.toastsService.show(this.translations.user.userUpdatedMessage, { severity: 'success' });
        await this.router.navigate(['/']);
      }
    }
    catch (err) {
      console.error(err);
      this.toastsService.show(this.translations.misc.error, { severity: 'danger' });
    }
  }

  protected selectPicture(picture: string): void {
    this.selectedPicture$.next(this.selectedPicture$.getValue() !== picture ? picture : null);
  }

  private prepareForAdd(): void {
    this.action = 'add';
    this.form.reset({
      id: null,
      name: null
    });
    this.selectedPicture$.next(null);
  }

  private prepareForUpdate(userId: string): void {
    this.action = 'update';
    this.usersService.getUser(userId)
      .subscribe((user: User): void => {
        this.selectedPicture$.next(user.picture);
        this.form.reset({
          id: userId,
          name: user.name
        });
      });
  }

}
