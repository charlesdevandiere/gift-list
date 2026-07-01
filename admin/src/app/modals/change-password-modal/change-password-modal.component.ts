import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { Group } from '../../models/group.model';
import { GroupsService } from '../../services/groups.service';
import { ToastsService } from '../../services/toasts.service';
import { passwordsMatchValidator } from '../../utils/validators';

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
  private readonly groupsService = inject(GroupsService)
  private readonly toastsService = inject(ToastsService)
  protected readonly modal = inject(NgbActiveModal)

  public readonly group = signal<Group | undefined>(undefined)

  protected readonly form: FormGroup<ChangePasswordForm>

  public constructor() {
    const formBuilder = inject(FormBuilder)

    this.form = formBuilder.group<ChangePasswordForm>({
      newPassword: formBuilder.control<string>('', [Validators.required, Validators.min(4), Validators.maxLength(18)]),
      confirmPassword: formBuilder.control<string>('', [Validators.required, Validators.min(4), Validators.maxLength(18)])
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
        $localize`:@@changePasswordModal.saveError:A error occurred while saving password.`,
        { severity: 'danger' }
      )
    }
  }

}
