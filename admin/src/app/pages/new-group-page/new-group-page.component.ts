import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { GroupsService } from '../../services/groups.service';
import { ToastsService } from '../../services/toasts.service';
import { passwordsMatchValidator } from '../../utils/validators';

interface NewGroupForm {
  name: FormControl<string | null>
  password: FormControl<string | null>
  confirmPassword: FormControl<string | null>
}

@Component({
  selector: 'app-new-group-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './new-group-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewGroupPageComponent {
  protected readonly toastsService = inject(ToastsService)
  private readonly groupsService = inject(GroupsService)
  private readonly router = inject(Router)

  protected readonly form: FormGroup<NewGroupForm>

  public constructor() {
    const formBuilder = inject(FormBuilder)

    this.form = formBuilder.group({
      name: formBuilder.control<string>('', [Validators.required, Validators.maxLength(255)]),
      password: formBuilder.control<string>('', [Validators.required, Validators.maxLength(255)]),
      confirmPassword: formBuilder.control<string>('', [Validators.required, Validators.maxLength(255)]),
    })
    this.form.controls.confirmPassword.addValidators(
      passwordsMatchValidator(this.form.controls.password)
    )
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.form.value.name || !this.form.value.password) {
      throw new Error('invalid form.')
    }

    try {
      await firstValueFrom(
        this.groupsService.addGroup({
          name: this.form.value.name,
          password: this.form.value.password
        })
      )
      this.toastsService.show(
        $localize`:@@newGroupPage.groupAddedMessage:Group added.`,
        { severity: 'success' }
      )
      await this.router.navigate(['/'])
    }
    catch (err) {
      console.error(err)
      this.toastsService.show(
        $localize`:@@newGroupPage.saveError:A error occurred while saving group.`,
        { severity: 'danger' }
      )
    }
  }

}
