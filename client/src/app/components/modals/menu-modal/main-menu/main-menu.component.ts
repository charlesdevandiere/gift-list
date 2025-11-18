import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core'
import { Router } from '@angular/router'
import { User } from '../../../../models/user.model'
import { AuthService } from '../../../../services/auth.service'
import { ColorModesService } from '../../../../services/color-modes.service'
import { ExportService } from '../../../../services/export.service'
import { AppTranslations } from '../../../../utils/app-translations'
import { MenuPage } from '../menu-modal.component'

@Component({
  selector: 'app-main-menu',
  imports: [],
  templateUrl: './main-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class MainMenuComponent {
  protected readonly colorModesService = inject(ColorModesService)
  protected readonly translations = inject(AppTranslations)
  private readonly authService = inject(AuthService)
  private readonly exportService = inject(ExportService)
  private readonly router = inject(Router)

  public readonly dismiss = output<void>();

  public readonly move = output<MenuPage>();

  public user = input<User | null>()

  protected async editProfile(): Promise<void> {
    this.dismiss.emit()
    await this.router.navigate(['/user', this.authService.me()?.id])
  }

  protected async addUser(): Promise<void> {
    this.dismiss.emit()
    await this.router.navigate(['/new-user'])
  }

  protected changeUser(): void {
    this.move.emit('change-user')
  }

  protected async import(): Promise<void> {
    this.dismiss.emit()
    await this.router.navigate(['/import'])
  }

  protected export(): void {
    this.dismiss.emit()
    this.exportService.export()
  }

  protected async signOut(): Promise<void> {
    this.dismiss.emit()
    this.authService.signOut()
    await this.router.navigate(['/sign-in'])
  }

}
