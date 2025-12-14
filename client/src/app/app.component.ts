import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { RouterOutlet } from '@angular/router'
import { NavbarComponent } from './components/navbar/navbar.component'
import { ToastsComponent } from './components/toasts/toasts.component'
import { CheckForUpdateService } from './update/check-for-update.service'
import { HandleUnrecoverableStateService } from './update/handle-unrecoverable-state.service'
import { LogUpdateService } from './update/log-update.service'
import { PromptUpdateService } from './update/prompt-update.service'

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
    inject(LogUpdateService)
    inject(CheckForUpdateService)
    inject(PromptUpdateService)
    inject(HandleUnrecoverableStateService)

    const title = inject(Title)
    title.setTitle($localize`:@@application.title:Gift list`)
  }

}
