import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PreloaderService {
  private selector = 'preloader';

  constructor(@Inject(DOCUMENT) private document: Document) {}

  private getElement() {
    return this.document.getElementById(this.selector);
  }

  hide() {
    const el = this.getElement();
    if (el) {
      const intervalHandler = parseInt(
        el.getAttribute('intervalHandler') ?? ''
      );
      clearInterval(intervalHandler);

      const timeoutHandler = parseInt(el.getAttribute('timeoutHandler') ?? '');
      clearTimeout(timeoutHandler);

      const timeoutHandlerSentence = parseInt(
        el.getAttribute('timeoutHandlerSentence') ?? ''
      );
      clearTimeout(timeoutHandlerSentence);

      el.remove();
    }
  }
}
