import {
  ApplicationConfig,
  importProvidersFrom,
  InjectionToken,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { routes } from './app.routes';
import {
  TurnstileSettings,
  TurnstileSiteKeys,
} from './components/captcha/settings/turnstile-settings';
import { authInterceptor } from './interceptors/auth.interceptor';
import { httpCacheInterceptor } from './interceptors/http-cache.interceptor';

export const CAPTCHA_SITE_KEYS = new InjectionToken<TurnstileSiteKeys>(
  'captcha-site-keys'
);

function provideCaptchaSiteKeys() {
  return {
    provide: CAPTCHA_SITE_KEYS,
    useFactory: (settings: TurnstileSettings) => settings.siteKeys,
    deps: [TurnstileSettings],
  };
}

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
    provideCaptchaSiteKeys(),
  ],
};
