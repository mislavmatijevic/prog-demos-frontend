import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'editor-code',
  standalone: true,
})
export class EditorCodePipe implements PipeTransform {
  transform(value: string): string {
    return value; // Placeholder for any future code handling before render.
  }
}
