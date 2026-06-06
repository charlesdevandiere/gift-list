import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface SignInForm {
  username: FormControl<string | null>
  password: FormControl<string | null>
}

@Component({
  selector: 'app-sign-in-page',
  imports: [ReactiveFormsModule],
  templateUrl: './sign-in-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInPageComponent implements OnInit {
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)

  protected readonly form: FormGroup<SignInForm>

  protected error = signal<string | null>(null)

  public constructor() {
    const formBuilder = inject(FormBuilder)

    this.form = formBuilder.group<SignInForm>({
      username: formBuilder.control<string>('', [Validators.required, Validators.maxLength(255)]),
      password: formBuilder.control<string>('', [Validators.required, Validators.maxLength(255)])
    })
  }

  public ngOnInit(): void {
    if (this.authService.authenticated()) {
      this.router.navigate(['/']).catch(console.error)
    }
  }

  public async onSubmit(): Promise<void> {
    const username: string | null | undefined = this.form.value.username
    const password: string | null | undefined = this.form.value.password

    if (!username || !password) {
      throw new Error('group and password can not be null.')
    }

    try {
      await this.authService.signIn(username, password)
      await this.router.navigate(['/'])
    }
    catch (err) {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          this.error.set($localize`:@@signInPage.wrongGroupOrPasswordMessage:Incorrect username or password.`)
        } else if (err.status >= 500) {
          this.error.set($localize`:@@signInPage.serviceUnavailableMessage:Service unavailable. Please retry later.`)
        } else {
          this.error.set($localize`:@@signInPage.unknownErrorMessage:An error occurred. Please retry.`)
        }
      }
      console.error(err)
    }
  }

}
