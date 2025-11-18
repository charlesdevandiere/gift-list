import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { RouterOutlet } from '@angular/router'
import { NavbarComponent } from './components/navbar/navbar.component'
import { ToastsComponent } from './components/toasts/toasts.component'
import { AppTranslations } from './utils/app-translations'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavbarComponent,
    RouterOutlet,
    ToastsComponent,
  ],
  standalone: true
})
export class AppComponent {

  public constructor() {
    const title = inject(Title)
    const translations = inject(AppTranslations)
    title.setTitle(translations.title)
  }

}
