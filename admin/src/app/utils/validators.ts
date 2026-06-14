import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms"

export function passwordsMatchValidator(passwordControl: AbstractControl): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === passwordControl.value) {
      return null
    } else {
      return { passwordsMatch: false }
    }
  }
}
