import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { RouterOutlet } from '@angular/router'
import { NavbarComponent } from './components/navbar/navbar.component'
import { ToastsComponent } from './components/toasts/toasts.component'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavbarComponent,
    RouterOutlet,
    ToastsComponent,
  ]
})
export class AppComponent {

  public constructor() {
    const title = inject(Title)
    title.setTitle($localize`:@@application.title:Gift list`)
  }

}
