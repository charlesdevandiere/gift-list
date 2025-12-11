import { effect, Injectable, signal } from '@angular/core'
import { AppStorage } from '../utils/app-storage'

export type Theme = 'dark' | 'light'
export type ColorMode = Theme | 'auto'

@Injectable({
  providedIn: 'root'
})
export class ColorModesService {

  private static readonly COLOR_MODE = 'color-mode'

  private readonly _storage: AppStorage = new AppStorage(localStorage)

  private readonly _darkThemeMatchMedia: MediaQueryList = globalThis.matchMedia('(prefers-color-scheme: dark)')

  public readonly colorMode = signal<ColorMode>('auto')

  private readonly _theme = signal<Theme>('light')
  public readonly theme = this._theme.asReadonly()

  public constructor() {
    effect(() => {
      const value = this.colorMode()

      if (value === 'auto') {
        this._storage.removeItem(ColorModesService.COLOR_MODE)
        this._theme.set(this._darkThemeMatchMedia.matches ? 'dark' : 'light')
      }
      else {
        this._storage.setItem<ColorMode>(ColorModesService.COLOR_MODE, value)
        this._theme.set(value)
      }

    })
    effect(() => document.documentElement.dataset['bsTheme'] = this._theme())
  }

  public init(): void {
    this.colorMode.set(this._storage.getItem<ColorMode | null>(ColorModesService.COLOR_MODE) ?? 'auto')

    this._darkThemeMatchMedia.addEventListener('change', () => {
      if (this.colorMode() === 'auto') {
        this._theme.set(this._darkThemeMatchMedia.matches ? 'dark' : 'light')
      }
    })
  }

}
