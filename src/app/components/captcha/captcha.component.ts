import {
  Component,
  EventEmitter,
  HostBinding,
  inject,
  Input,
  isDevMode,
  NgZone,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import {
  Appearance,
  Config,
  DevSiteKey,
  Language,
  NgCloudflareTurnstile,
  RefreshExpiry,
  RefreshTimeout,
  Result,
  Size,
  Theme,
} from '@pangz/ng-cloudflare-turnstile';
import { MessageService } from 'primeng/api';
import { sizes } from '../../../styles/variables';
import { CAPTCHA_SITE_KEYS } from '../../app.config';
import { CaptchaProtectedActions, SiteKeys } from './settings/captcha-settings';

@Component({
  selector: 'captcha',
  standalone: true,
  imports: [NgCloudflareTurnstile],
  templateUrl: './captcha.component.html',
})
export class CaptchaComponent implements OnInit {
  constructor(private messageService: MessageService, private ngZone: NgZone) {}

  @Input({ required: true }) action!: CaptchaProtectedActions;
  @Input({ required: true }) captchaToken!: string | null;
  @Output() captchaTokenChange = new EventEmitter<string | null>();

  isDisplayed = signal(false);
  turnstileConfig!: Config;
  siteKeys: SiteKeys = inject(CAPTCHA_SITE_KEYS);

  ngOnInit(): void {
    const currentSiteKey = this.siteKeys.find(
      (value) => value.action === this.action
    )?.key;

    if (currentSiteKey === undefined) {
      throw new Error(`No site key defined for view: ${this.action}`);
    }

    this.turnstileConfig = {
      action: this.action,
      siteKey: isDevMode()
        ? DevSiteKey.FORCE_INTERACTIVE_CHALLENGE
        : currentSiteKey,
      theme: Theme.DARK,
      size:
        window.innerWidth <= sizes.smallWidth ? Size.COMPACT : Size.FLEXIBLE,
      appearance: Appearance.INTERACTION_ONLY,
      language: Language.CROATIAN,
      feedbackEnabled: true,
      refreshExpired: RefreshExpiry.AUTO,
      refreshTimeout: RefreshTimeout.AUTO,
      onCreate: () => this.notifyError(),
      onTimeout: () => this.notifyError(),
      onSuccess: (result: Result) => this.notifySuccess(result),
      onExpired: () => {
        this.messageService.add({
          key: 'general',
          severity: 'warn',
          summary: 'Provjera je istekla',
          detail: 'Još jednom izvrši CAPTCHA provjeru.',
        });
        this.notifyError();
      },
      onBeforeInteractive: () => {
        this.notifyError();
        this.isDisplayed.set(true);
      },
      onError: () => {
        this.messageService.add({
          key: 'central',
          severity: 'error',
          summary: 'CAPTCHA je prijavila problem',
          detail:
            'Captcha je prijavila sumnjivo ponašanje. Ako nisi bot, pričekaj malo. Ako si bot, ne treba ti C++.',
        });
        this.notifyError();
      },
      onReset: () => {
        this.messageService.add({
          key: 'central',
          severity: 'error',
          summary: 'CAPTCHA se resetira',
          detail: 'Ako ne uspiješ, osvježi stranicu!',
        });
        this.notifyError();
      },
    };
  }

  private notifySuccess(result: Result) {
    this.ngZone.run(() => this.captchaTokenChange.emit(result.data));
  }

  private notifyError(): void {
    this.ngZone.run(() => this.captchaTokenChange.emit(null));
  }

  @HostBinding('style.display')
  get hostHeightPx(): string {
    return this.isDisplayed() ? 'block' : 'none';
  }
}
