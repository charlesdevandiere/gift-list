import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection, inject, provideAppInitializer } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { ColorModesService } from './services/color-modes.service';
import { AppTranslations } from './utils/app-translations';
import { AuthInterceptor } from './utils/auth.interceptor';

async function initializeApp(): Promise<void> {
  const colorModesService: ColorModesService = inject(ColorModesService);
  const translation: AppTranslations = inject(AppTranslations);

  colorModesService.init();
  await translation.load();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
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
