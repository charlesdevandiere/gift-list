import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core'
import { User } from '../../models/user.model'
import { AppTranslations } from '../../utils/app-translations'
import { PicturePipe } from '../../utils/picture.pipe'

@Component({
  selector: 'app-change-user',
  templateUrl: './change-user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PicturePipe]
})
export class ChangeUserComponent {
  protected readonly translations = inject(AppTranslations)

  public currentUser = input<User | null>()

  public users = input.required<User[]>()

  public readonly selectedUser = output<User | null>();

  public selectUser(user?: User | null): void {
    this.selectedUser.emit(user ?? null)
  }

}
