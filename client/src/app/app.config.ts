import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { AppSettings } from './app-settings';
import { routes } from './app.routes';
import { ColorModesService } from './services/color-modes.service';
import { AppTranslations } from './utils/app-translations';
import { AuthInterceptor } from './utils/auth.interceptor';

function initializeApp(settings: AppSettings, translation: AppTranslations, colorModesService: ColorModesService): () => Promise<void> {
  colorModesService.init();
  return async () => {
    await settings.load();
    await translation.load();
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    AppSettings,
    AppTranslations,
    {
      provide: APP_INITIALIZER,
      useFactory: (settings: AppSettings, translation: AppTranslations, colorModesService: ColorModesService): () => Promise<void> =>
        initializeApp(settings, translation, colorModesService),
      deps: [AppTranslations, ColorModesService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideHttpClient(withInterceptorsFromDi())
  ]
};
