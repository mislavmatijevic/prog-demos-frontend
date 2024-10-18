import { inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ProgDemosHeadPipe } from './prog-demos-head.pipe';

describe('ProgDemosHeadPipe', () => {
  it('create an instance', () => {
    const pipe = new ProgDemosHeadPipe(inject(DomSanitizer));
    expect(pipe).toBeTruthy();
  });
});
