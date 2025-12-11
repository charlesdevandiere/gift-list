import { ChangeDetectionStrategy, Component, inject, Signal, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { User } from '../../../models/user.model'
import { AuthService } from '../../../services/auth.service'
import { ColorModesService, Theme } from '../../../services/color-modes.service'
import { PicturePipe } from '../../../utils/picture.pipe'
import { MainPageService } from '../main-page.service'

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PicturePipe],
  host: {
    class: 'h-100 d-flex flex-column overflow-hidden'
  }
})
export class UserListComponent {
  private readonly authService = inject(AuthService)
  private readonly colorModeService = inject(ColorModesService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly service = inject(MainPageService)

  protected readonly theme: Signal<Theme> = this.colorModeService.theme
  protected readonly connectedUserId: Signal<string | null> = this.authService.connectedUserId
  protected readonly loading = this.service.loadingUsers
  protected readonly reordering = signal<boolean>(false)
  protected readonly selectedUser = this.service.selectedUser
  protected readonly users = this.service.users

  protected refresh(): void {
    this.service.loadUsers().catch(console.error)
  }

  public async selectUser(user: User): Promise<void> {
    if (this.service.selectedUser() === user) {
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

  public reorder(id: string, direction: 'up' | 'down'): void {
    this.service.reorder(id, direction)
  }

  public async saveOrder(): Promise<void> {
    this.reordering.set(false)
    await this.service.saveOrder()
  }

  public async toggleReorder(): Promise<void> {
    await this.router.navigate([])
    this.reordering.update(value => !value)
  }

}
