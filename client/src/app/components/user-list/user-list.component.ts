import { ChangeDetectionStrategy, Component, computed, inject, input, Signal, output } from '@angular/core'
import { User } from '../../models/user.model'
import { AuthService } from '../../services/auth.service'
import { AppTranslations } from '../../utils/app-translations'

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class UserListComponent {
  protected readonly translations = inject(AppTranslations)
  private readonly authService = inject(AuthService)

  protected readonly connectedUserId: Signal<string | null> = computed(() => this.authService.me()?.id ?? null)

  public selectedUser = input<User>()

  public readonly clickRefresh = output<void>();

  public readonly selectUser = output<User>();

  public users = input.required<User[]>()

  public loading = input<boolean>(false)

}
