import { Injectable } from '@angular/core';
import turnstileSettings from '../../../../../config/turnstile-keys.json';

export type CaptchaProtectedActions =
  | 'login'
  | 'register'
  | 'password-reset'
  | 'request-password-reset'
  | 'report-issue';

export type SiteKeys = Array<{
  action: CaptchaProtectedActions;
  key: string;
}>;

@Injectable({ providedIn: 'root' })
export class CaptchaSettings {
  public siteKeys: SiteKeys;
  constructor() {
    this.siteKeys = turnstileSettings as SiteKeys;
  }
}
