import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { ColorModesService } from './app/services/color-modes.service';
import { AppTranslations } from './app/utils/app-translations';
import { AuthInterceptor } from './app/utils/auth.interceptor';
import { routes } from './app.routes';

function initializeApp(translation: AppTranslations, colorModesService: ColorModesService): () => Promise<void> {
  colorModesService.init();
  return () => translation.load();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    AppTranslations,
    {
      provide: APP_INITIALIZER,
      useFactory: (translation: AppTranslations, colorModesService: ColorModesService): () => Promise<void> =>
        initializeApp(translation, colorModesService),
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
