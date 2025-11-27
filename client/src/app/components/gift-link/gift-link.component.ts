import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';

const urlRegex = /^(https?:\/\/)?(?<host>[^:/\s]*)(:\d+)?(?<route>\/.*)?$/

@Component({
  selector: 'app-gift-link',
  imports: [],
  templateUrl: './gift-link.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GiftLinkComponent {

  public link = input.required<string>()

  protected host = signal<string>('')
  protected route = signal<string>('')

  public constructor() {
    effect(() => {
      const match = urlRegex.exec(this.link().trim())
      if (match) {
        this.host.set(match.groups?.['host'] ?? '')
        this.route.set(match.groups?.['route'] ?? '')
      }
    })
  }

}
