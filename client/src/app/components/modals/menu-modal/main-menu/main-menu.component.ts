import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { ColorModesService } from 'src/app/services/color-modes.service';
import { AppTranslations } from 'src/app/utils/app-translations';
import { MenuPage } from '../menu-modal.component';

@Component({
  selector: 'app-main-menu',
  standalone: true,
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
    private authService: AuthService,
    private router: Router) { }

  protected async editProfile(): Promise<void> {
    this.dismiss.emit();
    await this.router.navigate(['/user', this.authService.userId]);
  }

  protected async addUser(): Promise<void> {
    this.dismiss.emit();
    await this.router.navigate(['/new-user']);
  }

  protected changeUser(): void {
    this.move.emit('change-user');
  }

  protected async importExport(): Promise<void> {
    this.dismiss.emit();
    await this.router.navigate(['/import-export']);
  }

  protected async signOut(): Promise<void> {
    this.dismiss.emit();
    this.authService.signOut();
    await this.router.navigate(['/sign-in']);
  }

}
