import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection, inject, provideAppInitializer } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { ColorModesService } from './services/color-modes.service';
import { AppTranslations } from './utils/app-translations';
import { AuthInterceptor } from './utils/auth.interceptor';
import { AuthService } from './services/auth.service';

async function initializeApp(): Promise<void> {
  const colorModesService: ColorModesService = inject(ColorModesService);
  const translation: AppTranslations = inject(AppTranslations);
  const auth: AuthService = inject(AuthService);

  colorModesService.init();
  await translation.load();
  await auth.load();
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
