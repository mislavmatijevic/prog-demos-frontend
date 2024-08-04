import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
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
  ],
};
