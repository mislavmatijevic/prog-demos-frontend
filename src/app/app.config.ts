import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha-2';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { httpCacheInterceptor } from './interceptors/http-cache.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        httpCacheInterceptor({
          urlsToCache: [
            'videos/public',
            'tasks',
            'tasks/.*',
            'auth/password/.*',
            'statistics/.*',
          ],
          globalTTL: 60000,
        }),
        authInterceptor,
      ])
    ),
    importProvidersFrom(MonacoEditorModule.forRoot()),
    provideAnimations(),
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: '6LfXFWoqAAAAAKlAm0PU3qHqEisqNCUBBHyclOTR',
    },
  ],
};
