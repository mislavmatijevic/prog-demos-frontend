import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export const PD_HEAD_PLCHLDR = '[{pd_head}]';

@Pipe({
  name: 'progDemosHead',
  standalone: true,
})
export class ProgDemosHeadPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: number): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<div class='skill-points'>
        ${value} <img class='skill-points__icon' src='assets/images/prog_demos_head.png' alt='skill_point'>
      </div>`
    );
  }
}
