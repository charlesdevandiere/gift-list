import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { User } from '../../models/user.model';
import { PicturePipe } from '../../utils/picture.pipe';

@Component({
  selector: 'app-change-user',
  templateUrl: './change-user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PicturePipe]
})
export class ChangeUserComponent {
  public currentUser = input<User | null>()

  public users = input.required<User[]>()

  public readonly selectedUser = output<User | null>();

  public selectUser(user?: User | null): void {
    this.selectedUser.emit(user ?? null)
  }

}
