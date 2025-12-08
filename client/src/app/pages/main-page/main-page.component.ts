import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Params } from '@angular/router'
import { MainPageService } from './main-page.service'
import { UserGiftsComponent } from './user-gifts/user-gifts.component'
import { UserListComponent } from './user-list/user-list.component'

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserListComponent, UserGiftsComponent],
  providers: [MainPageService]
})
export class MainPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly service = inject(MainPageService)

  protected readonly selectedUser = this.service.selectedUser

  public constructor() {
    this.route.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe((params: Params): void => {
        const userId: string | null = params['user-id'] as string ?? null
        this.service.userId.set(userId)
      })
  }

  public ngOnInit(): void {
    this.service.loadUsers().catch(console.error)
  }

}
