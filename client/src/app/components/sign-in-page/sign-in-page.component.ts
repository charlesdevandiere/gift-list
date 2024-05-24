import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { ToastsService } from 'src/app/services/toasts.service';
import { UsersService } from 'src/app/services/users.service';
import { AppTranslations } from 'src/app/utils/app-translations';
import { ChangeUserComponent } from '../change-user/change-user.component';

interface State {
  authenticated: boolean;
  users: User[];
};

@Component({
  selector: 'app-sign-in-page',
  templateUrl: './sign-in-page.component.html',
  styleUrls: ['./sign-in-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [AsyncPipe, ChangeUserComponent, ReactiveFormsModule]
})
export class SignInPageComponent implements OnInit {

  protected readonly form: FormGroup<{ group: FormControl<string | null>, password: FormControl<string | null> }>;

  private readonly _state$: BehaviorSubject<State> = new BehaviorSubject<State>({ authenticated: false, users: [] });

  protected readonly state$: Observable<State> = this._state$.asObservable();

  public constructor(
    private authService: AuthService,
    private router: Router,
    formBuilder: FormBuilder,
    private toastsService: ToastsService,
    public translations: AppTranslations,
    private usersService: UsersService) {
    this.form = formBuilder.group({
      group: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  public ngOnInit(): void {
    if (this.authService.authenticated) {
      this.router.navigate(['/']).then(() => void 0).catch(() => void 0);
    }
  }

  public async onSubmit(): Promise<void> {
    const group: string | null | undefined = this.form.value.group;
    const password: string | null | undefined = this.form.value.password;

    if (!group || !password) {
      throw new Error('group and password can not be null.');
    }

    try {
      await firstValueFrom(this.authService.signIn(group, password));
    } catch {
      this.toastsService.show(this.translations.signIn.wrongGroupOrPasswordMessage, { severity: 'danger' });
      throw new Error('wrong group or password.');
    }

    const users: User[] = await firstValueFrom(this.usersService.getUsers({ noCache: true }));
    this._state$.next({
      authenticated: true,
      users: users
    });
  }

  public async selectUser(user: User | null): Promise<void> {
    this.authService.setCurrentUser(user?.id ?? null);
    await this.router.navigate(['/']);
  }

}
