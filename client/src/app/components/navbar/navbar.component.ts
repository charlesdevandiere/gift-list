import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal'
import { MenuModalComponent } from '../../modals/menu-modal/menu-modal.component'
import { AuthService } from '../../services/auth.service'
import { MeService } from '../../services/me.service'
import { PicturePipe } from '../../utils/picture.pipe'

@Component({
  selector: 'app-navbar',
  imports: [
    PicturePipe,
    RouterLink
  ],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private readonly authService = inject(AuthService)
  private readonly meService = inject(MeService)
  private readonly modalService = inject(NgbModal)

  protected readonly authenticated: Signal<boolean> = this.authService.authenticated
  protected readonly cartCount: Signal<number> = this.meService.cartCount
  protected readonly id = computed<string | null>(() => this.authService.me()?.id ?? null)
  protected readonly group = computed<string | null>(() => this.authService.me()?.group ?? null)
  protected readonly name = computed<string | null>(() => this.authService.me()?.name ?? null)
  protected readonly picture = computed<string | null>(() => this.authService.me()?.picture ?? null)

  public openMenu(): void {
    this.modalService.open(MenuModalComponent, { scrollable: true })
  }

}
