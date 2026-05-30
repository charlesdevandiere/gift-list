import { ChangeDetectionStrategy, Component, Signal, computed, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { Router } from '@angular/router'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap/modal'
import { ChangeUserComponent } from '../../components/change-user/change-user.component'
import { User } from '../../models/user.model'
import { AuthService } from '../../services/auth.service'
import { ColorModesService, Theme } from '../../services/color-modes.service'
import { UsersService } from '../../services/users.service'
import { PicturePipe } from '../../utils/picture.pipe'
import { MainMenuComponent } from './main-menu/main-menu.component'
import { MenuPage } from './menu-page'

@Component({
  selector: 'app-menu-modal',
  imports: [ChangeUserComponent, MainMenuComponent, PicturePipe],
  templateUrl: './menu-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuModalComponent {
  protected readonly modal = inject(NgbActiveModal)
  private readonly authService = inject(AuthService)
  private readonly colorModeService = inject(ColorModesService)
  private readonly usersService = inject(UsersService)
  private readonly router = inject(Router)

  protected readonly theme: Signal<Theme> = this.colorModeService.theme
  protected readonly page = signal<MenuPage>('main')
  protected readonly users: Signal<User[]> = toSignal(this.usersService.getUsers(), { initialValue: [] })
  protected readonly user: Signal<User | null> = computed(
    () => this.users().find(user => user.id === this.authService.connectedUserId()) ?? null
  )

  protected async changeUser(user: User | null): Promise<void> {
    await this.authService.setCurrentUser(user?.id ?? null)
    this.page.set('main')
    await this.router.navigate(['/'])
  }

  protected dismiss(): void {
    this.modal.dismiss()
  }

  protected move(page: MenuPage): void {
    this.page.set(page)
  }

}
