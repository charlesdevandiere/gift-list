import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Params, Router } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { User } from '../../models/user.model'
import { ToastsService } from '../../services/toasts.service'
import { UsersService } from '../../services/users.service'
import { AppTranslations } from '../../utils/app-translations'
import { UserGiftsComponent } from '../user-gifts/user-gifts.component'
import { UserListComponent } from '../user-list/user-list.component'

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserListComponent, UserGiftsComponent],
  standalone: true
})
export class MainPageComponent implements OnInit {
  protected readonly translations = inject(AppTranslations)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly toastsService = inject(ToastsService)
  private readonly usersService = inject(UsersService)

  protected readonly loading = signal<boolean>(false)

  protected readonly users = signal<User[]>([])

  protected readonly userId = signal<string | null>(null)

  protected readonly selectedUser = computed<User | undefined>(
    () => this.users().find(user => user.id === this.userId())
  )

  public constructor() {
    this.route.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe((params: Params): void => {
        this.userId.set(params['user-id'] as string ?? null)
      })
  }

  public ngOnInit(): void {
    this.loadUsers().catch(console.error)
  }

  public refresh(): void {
    this.loadUsers().catch(console.error)
  }

  public async selectUser(user: User): Promise<void> {
    if (this.selectedUser() === user) {
      // unselect current user
      await this.router.navigate([])
    } else {
      // select new user
      await this.router.navigate(
        [],
        {
          relativeTo: this.route,
          queryParams: { 'user-id': user.id },
        })
    }
  }

  private async loadUsers(): Promise<void> {
    this.loading.set(true)
    try {
      this.users.set(await firstValueFrom(this.usersService.getUsers()))
    } catch (err) {
      console.error(err)
      this.toastsService.show(this.translations.misc.error, { severity: 'danger' })
    }
    this.loading.set(false)
  }

}
