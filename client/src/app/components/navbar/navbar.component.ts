import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { AuthService } from '../../services/auth.service'
import { AppTranslations } from '../../utils/app-translations'
import { MenuModalComponent } from '../modals/menu-modal/menu-modal.component'

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class NavbarComponent {
  protected readonly translations = inject(AppTranslations)
  private readonly authService = inject(AuthService)
  private readonly modalService = inject(NgbModal)

  protected readonly authenticated: Signal<boolean> = this.authService.authenticated
  protected readonly id = computed<string | null>(() => this.authService.me()?.id ?? null)
  protected readonly group = computed<string | null>(() => this.authService.me()?.group ?? null)
  protected readonly name = computed<string | null>(() => this.authService.me()?.name ?? null)
  protected readonly picture = computed<string | null>(() => this.authService.me()?.picture ?? null)

  public openMenu(): void {
    this.modalService.open(MenuModalComponent, { scrollable: true })
  }

}
