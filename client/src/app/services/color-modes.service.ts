import { effect, Injectable, signal } from '@angular/core'
import { AppStorage } from '../utils/app-storage'

type Theme = 'dark' | 'light'
export type ColorMode = 'dark' | 'light' | 'auto'

@Injectable({
  providedIn: 'root'
})
export class ColorModesService {

  private static readonly COLOR_MODE = 'color-mode'

  private readonly _storage: AppStorage = new AppStorage(localStorage)

  private readonly _darkThemeMatchMedia: MediaQueryList = globalThis.matchMedia('(prefers-color-scheme: dark)')

  public readonly colorMode = signal<ColorMode>('auto')

  public constructor() {
    effect(() => {
      const value = this.colorMode()
      let theme: Theme

      if (value === 'auto') {
        this._storage.removeItem(ColorModesService.COLOR_MODE)
        theme = this._darkThemeMatchMedia.matches ? 'dark' : 'light'
      }
      else {
        this._storage.setItem<ColorMode>(ColorModesService.COLOR_MODE, value)
        theme = value
      }

      this.setTheme(theme)
    })
  }

  public init(): void {
    this.colorMode.set(this._storage.getItem<ColorMode | null>(ColorModesService.COLOR_MODE) ?? 'auto')

    this._darkThemeMatchMedia.addEventListener('change', () => {
      if (this.colorMode() === 'auto') {
        const theme: Theme = this._darkThemeMatchMedia.matches ? 'dark' : 'light'
        this.setTheme(theme)
      }
    })
  }

  private setTheme(theme: Theme): void {
    document.documentElement.dataset['bsTheme'] = theme
  }

}
