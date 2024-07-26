import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { AppTranslations } from '../../utils/app-translations';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [AsyncPipe]
})
export class UserListComponent {

  protected connectedUserId$: Observable<string | null> = this.authService.userId$;

  @Input()
  public selectedUser: User | null = null;

  @Output()
  public clickRefresh: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public selectUser: EventEmitter<User> = new EventEmitter<User>();

  @Input()
  public users: User[] = [];

  @Input()
  public loading: boolean | null = false;

  public constructor(
    public translations: AppTranslations,
    private authService: AuthService) { }

}
