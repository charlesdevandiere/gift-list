import { ChangeDetectionStrategy, Component, inject, input, output, WritableSignal } from '@angular/core'
import { Router } from '@angular/router'
import { User } from '../../../models/user.model'
import { AuthService } from '../../../services/auth.service'
import { ColorMode, ColorModesService } from '../../../services/color-modes.service'
import { ExportService } from '../../../services/export.service'
import { MenuPage } from '../menu-page'

@Component({
  selector: 'app-main-menu',
  imports: [],
  templateUrl: './main-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainMenuComponent {
  private readonly authService = inject(AuthService)
  private readonly colorModesService = inject(ColorModesService)
  private readonly exportService = inject(ExportService)
  private readonly router = inject(Router)

  public readonly dismiss = output<void>()

  public readonly move = output<MenuPage>()

  public readonly user = input<User | null>()

  protected readonly colorMode: WritableSignal<ColorMode> = this.colorModesService.colorMode

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

  protected setColorMode(value: ColorMode): void {
    this.colorModesService.colorMode.set(value)
  }

  protected async signOut(): Promise<void> {
    this.dismiss.emit()
    this.authService.signOut()
    await this.router.navigate(['/sign-in'])
  }

  protected reload(): void {
    document.location.reload()
  }

}
