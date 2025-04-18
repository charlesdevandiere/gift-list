import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../../models/user.model';
import { AuthService } from '../../../../services/auth.service';
import { ColorModesService } from '../../../../services/color-modes.service';
import { ExportService } from '../../../../services/export.service';
import { AppTranslations } from '../../../../utils/app-translations';
import { MenuPage } from '../menu-modal.component';

@Component({
  selector: 'app-main-menu',
  imports: [],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainMenuComponent {

  @Output()
  public dismiss: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public move: EventEmitter<MenuPage> = new EventEmitter<MenuPage>();

  @Input()
  public user: User | null = null;

  public constructor(
    public colorModesService: ColorModesService,
    public translations: AppTranslations,
    private readonly authService: AuthService,
    private readonly exportService: ExportService,
    private readonly router: Router) { }

  protected async editProfile(): Promise<void> {
    this.dismiss.emit();
    await this.router.navigate(['/user', this.authService.me?.id]);
  }

  protected async addUser(): Promise<void> {
    this.dismiss.emit();
    await this.router.navigate(['/new-user']);
  }

  protected changeUser(): void {
    this.move.emit('change-user');
  }

  protected async import(): Promise<void> {
    this.dismiss.emit();
    await this.router.navigate(['/import']);
  }

  protected export(): void {
    this.dismiss.emit();
    this.exportService.export();
  }

  protected async signOut(): Promise<void> {
    this.dismiss.emit();
    this.authService.signOut();
    await this.router.navigate(['/sign-in']);
  }

}
