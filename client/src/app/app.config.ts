import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection, inject, provideAppInitializer } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { AppSettings } from './app-settings';
import { routes } from './app.routes';
import { ColorModesService } from './services/color-modes.service';
import { AppTranslations } from './utils/app-translations';
import { AuthInterceptor } from './utils/auth.interceptor';

async function initializeApp(): Promise<void> {
  const colorModesService: ColorModesService = inject(ColorModesService);
  const settings: AppSettings = inject(AppSettings);
  const translation: AppTranslations = inject(AppTranslations);

  colorModesService.init();
  await settings.load();
  await translation.load();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    AppSettings,
    AppTranslations,
    provideAppInitializer(initializeApp),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideHttpClient(withInterceptorsFromDi())
  ]
};
