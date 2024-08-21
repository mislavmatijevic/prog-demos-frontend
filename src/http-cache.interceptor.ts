import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

type CachedRequest = {
  params?: any;
  ttl?: number;
  didSucceed: boolean;
  successData: HttpResponse<any>;
  successData$: Subject<HttpResponse<any>>;
  errorData: HttpErrorResponse;
};

const requests = new Map<string, CachedRequest>();

export const httpCacheInterceptor = (options?: {
  urlsToCache?: string[];
  ttls?: { [url: string]: number };
  globalTTL?: number;
}) => {
  const { urlsToCache = [], ttls, globalTTL } = options ?? {};

  const fn: HttpInterceptorFn = (req, next) => {
    const getPreviousRequestLikeThis = () => requests.get(key);
    const checkRequestTTL = (req: CachedRequest) => {
      return req.ttl && req.ttl > new Date().getTime();
    };

    requests.forEach((value, cacheKey) => {
      if (!checkRequestTTL(value)) {
        requests.delete(cacheKey);
      }
    });

    const key = `${req.method}_${
      req.url
    }_${req.params.toString()}_${JSON.stringify(req.body)}`;
    const useCache = urlsToCache.some((x) =>
      new RegExp(`.*${x}$`).test(req.url)
    );
    const prevReq = getPreviousRequestLikeThis();
    const getTTL = () =>
      new Date().getTime() + (ttls?.[req.url] ?? globalTTL ?? 0);

    if (useCache) {
      if (prevReq) {
        if (prevReq.didSucceed && !prevReq.successData$.closed) {
          return prevReq.successData$.asObservable();
        }

        if (checkRequestTTL(prevReq)) {
          if (prevReq.didSucceed && prevReq.successData) {
            return of(prevReq.successData);
          } else if (prevReq.errorData) {
            return throwError(
              () =>
                new HttpResponse<HttpErrorResponse>({
                  url: prevReq.errorData.url ?? undefined,
                  body: prevReq.errorData.error,
                  headers: prevReq.errorData.headers,
                  status: prevReq.errorData.status,
                  statusText: prevReq.errorData.statusText,
                })
            );
          }
        } else {
          requests.delete(key);
        }
      } else {
        requests.set(key, {
          successData$: new Subject<HttpResponse<any>>(),
          successData: new HttpResponse(),
          params: req.body,
          ttl: getTTL(),
          didSucceed: false,
          errorData: new HttpErrorResponse({ url: req.url }),
        });

        return next(req).pipe(
          tap({
            next: (res) => {
              const req = getPreviousRequestLikeThis();

              if (!req) return;

              if (res instanceof HttpResponse) {
                req.didSucceed = true;
                req.successData = res;
                req.ttl = getTTL();
                req.successData$.next(res);
                req.successData$.complete();
              } else if (res instanceof HttpErrorResponse) {
                req.didSucceed = false;
                req.errorData = res;

                req.ttl = getTTL();
                req.successData$.complete();
              }
            },
          }),
          finalize(() => {
            const req = getPreviousRequestLikeThis();
            req?.successData$.unsubscribe();
          })
        );
      }
    }

    return next(req);
  };

  return fn;
};
