import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastsComponent } from './components/toasts/toasts.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    ToastsComponent,
    RouterOutlet
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html'
})
export class AppComponent {
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)

  protected async signOut(): Promise<void> {
    this.authService.signOut()
    await this.router.navigate(['/sign-in'])
  }

}
