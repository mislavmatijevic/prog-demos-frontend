import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'complexityColor',
  standalone: true,
})
export class ComplexityColorPipe implements PipeTransform {
  transform(taskComplexity: string | number): string {
    if (taskComplexity === null) return '';
    switch (taskComplexity?.toString()) {
      case '1':
        return '#ffcdb3';
      case '2':
        return '#ffb6a3';
      case '3':
        return '#e6999c';
      case '4':
        return '#b4838d';
      case '5':
        return '#f25c5a';
      default:
        return '';
    }
  }
}
