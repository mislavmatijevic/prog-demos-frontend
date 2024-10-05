import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'complexityEmoji',
  standalone: true,
})
export class ComplexityEmojiPipe implements PipeTransform {
  transform(taskComplexity: string | number): string {
    if (taskComplexity === null) return '';
    switch (taskComplexity?.toString()) {
      case '1':
        return '😎';
      case '2':
        return '🧐';
      case '3':
        return '😬';
      case '4':
        return '😵‍💫';
      case '5':
        return '🫠';
      default:
        return '';
    }
  }
}
