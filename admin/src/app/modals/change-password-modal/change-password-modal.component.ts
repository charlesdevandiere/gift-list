import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap/modal';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { Group } from '../../models/group.model';
import { GroupsService } from '../../services/groups.service';
import { ToastsService } from '../../services/toasts.service';

interface ChangePasswordForm {
  newPassword: FormControl<string | null>
  confirmPassword: FormControl<string | null>
}

@Component({
  selector: 'app-change-password-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './change-password-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordModalComponent {
  private readonly formBuilder = inject(FormBuilder)
  private readonly groupsService = inject(GroupsService)
  private readonly toastsService = inject(ToastsService)
  protected readonly modal = inject(NgbActiveModal)

  public readonly group = signal<Group | undefined>(undefined)

  protected readonly form: FormGroup<ChangePasswordForm>

  public constructor() {
    this.form = this.formBuilder.group<ChangePasswordForm>({
      newPassword: this.formBuilder.control<string>('', [Validators.required, Validators.maxLength(255)]),
      confirmPassword: this.formBuilder.control<string>('', [Validators.required, Validators.maxLength(255)])
    })
    this.form.controls.confirmPassword.addValidators(
      passwordsMatchValidator(this.form.controls.newPassword)
    )
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      throw new Error('invalid form')
    }
    const group: Group | undefined = this.group()
    if (!group) {
      throw new Error('group is undefined')
    }

    try {
      await firstValueFrom(
        this.groupsService.updateGroup({
          ...group,
          password: this.form.controls.newPassword.value!
        })
      )
      this.toastsService.show(
        $localize`:@@changePasswordModal.passwordChanged:The password has been successfully updated.`,
        { severity: 'success' }
      )
      this.modal.close()
    }
    catch (err) {
      console.error(err)
      this.toastsService.show(
        $localize`:@@changePasswordModal.saveError:A error occurred while saving user.`,
        { severity: 'danger' }
      )
    }
  }

}

function passwordsMatchValidator(newPasswordControl: AbstractControl): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === newPasswordControl.value) {
      return null
    } else {
      return { passwordsMatch: false }
    }
  }
}
