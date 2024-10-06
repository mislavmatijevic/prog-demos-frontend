import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'complexityDescription',
  standalone: true,
})
export class ComplexityDescriptionPipe implements PipeTransform {
  transform(taskComplexity: string | number): string {
    if (taskComplexity === null) return '';
    switch (taskComplexity?.toString()) {
      case '1':
        return 'Laganica za početnike';
      case '2':
        return 'Zadatak za vježbu';
      case '3':
        return 'Zadatak za razmišljanje';
      case '4':
        return 'Vrtoglavi zadatak';
      case '5':
        return 'Za najizdržljivije';
      default:
        return '';
    }
  }
}
