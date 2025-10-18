import { Injectable } from '@angular/core';
import turnstileSettings from '../../../../../config/turnstile-keys.json';

export type ITurnstileProtectedViews = 'login' | 'register' | 'password-reset';

export type TurnstileSiteKeys = Array<{
  view: ITurnstileProtectedViews;
  key: string;
}>;

@Injectable({ providedIn: 'root' })
export class TurnstileSettings {
  public siteKeys: TurnstileSiteKeys;
  constructor() {
    this.siteKeys = turnstileSettings as TurnstileSiteKeys;
  }
}
