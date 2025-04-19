import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { map, Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { AppTranslations } from '../../utils/app-translations';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe]
})
export class UserListComponent {

  protected readonly connectedUserId$: Observable<string | null> = this.authService.me$.pipe(map(me => me?.id ?? null));

  @Input()
  public selectedUser: User | null = null;

  @Output()
  public readonly clickRefresh: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public readonly selectUser: EventEmitter<User> = new EventEmitter<User>();

  @Input()
  public users: User[] = [];

  @Input()
  public loading: boolean | null = false;

  public constructor(
    public readonly translations: AppTranslations,
    private readonly authService: AuthService) { }

}
