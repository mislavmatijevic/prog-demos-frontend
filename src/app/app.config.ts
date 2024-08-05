import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { httpCacheInterceptor } from '../http-cache.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        httpCacheInterceptor({
          urlsToCache: ['/videos/public'],
          globalTTL: 60000,
        }),
      ])
    ),
    importProvidersFrom(MonacoEditorModule.forRoot()),
  ],
};
