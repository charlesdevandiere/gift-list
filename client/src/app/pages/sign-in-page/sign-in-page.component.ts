import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { ChangeUserComponent } from '../../components/change-user/change-user.component'
import { User } from '../../models/user.model'
import { AuthService } from '../../services/auth.service'
import { ToastsService } from '../../services/toasts.service'
import { UsersService } from '../../services/users.service'

@Component({
  selector: 'app-sign-in-page',
  templateUrl: './sign-in-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChangeUserComponent, ReactiveFormsModule]
})
export class SignInPageComponent implements OnInit {
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)
  private readonly toastsService = inject(ToastsService)
  private readonly usersService = inject(UsersService)

  protected readonly form: FormGroup<{ group: FormControl<string | null>, password: FormControl<string | null> }>

  protected readonly step = signal<'sign-in' | 'choose-user'>('sign-in')
  protected readonly users = signal<User[]>([])

  public constructor() {
    const formBuilder = inject(FormBuilder)

    this.form = formBuilder.group({
      group: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  public ngOnInit(): void {
    if (this.authService.authenticated()) {
      this.router.navigate(['/']).then(() => void 0).catch(() => void 0)
    }
  }

  public async onSubmit(): Promise<void> {
    const group: string | null | undefined = this.form.value.group
    const password: string | null | undefined = this.form.value.password

    if (!group || !password) {
      throw new Error('group and password can not be null.')
    }

    try {
      await this.authService.signIn(group, password)
    } catch (error: unknown) {
      this.toastsService.show(
        $localize`:@@signInPage.wrongGroupOrPasswordMessage:Incorrect group or password.`,
        { severity: 'danger' }
      )
      console.error(error)
      throw new Error('wrong group or password.')
    }

    const users: User[] = await firstValueFrom(this.usersService.getUsers())
    this.users.set(users)

    if (users.length === 0) {
      await this.authService.setCurrentUser(null)
      await this.router.navigate(['/'])
    } else {
      this.step.set('choose-user')
    }
  }

  public async selectUser(user: User | null): Promise<void> {
    await this.authService.setCurrentUser(user?.id ?? null)
    await this.router.navigate(['/'])
  }

}
