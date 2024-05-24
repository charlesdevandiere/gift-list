import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { AppTranslations } from 'src/app/utils/app-translations';

@Component({
  selector: 'app-change-user',
  templateUrl: './change-user.component.html',
  styleUrls: ['./change-user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [AsyncPipe]
})
export class ChangeUserComponent {

  @Input()
  public connectedUser: User | null = null;

  @Input()
  public users: User[] = [];

  @Output()
  public selectedUser = new EventEmitter<User | null>();

  public constructor(public translations: AppTranslations) { }

  public selectUser(user: User | null): void {
    this.selectedUser.emit(user);
  }

}
