import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core'
import { provideRouter, withHashLocation } from '@angular/router'
import { provideServiceWorker } from '@angular/service-worker'
import { routes } from './app.routes'
import { AuthService } from './services/auth.service'
import { ColorModesService } from './services/color-modes.service'
import { AuthInterceptor } from './utils/auth.interceptor'

async function initializeApp(): Promise<void> {
  const colorModesService: ColorModesService = inject(ColorModesService)
  const auth: AuthService = inject(AuthService)

  colorModesService.init()
  await auth.load()
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideAppInitializer(initializeApp),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideHttpClient(withInterceptorsFromDi()),
    provideServiceWorker('ngsw-worker.js')
  ]
}
