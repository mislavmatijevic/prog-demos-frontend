import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTime',
  standalone: true,
})
export class FormatTimePipe implements PipeTransform {
  transform(date: Date | string): string {
    const now = new Date();
    if (typeof date === 'string') {
      date = new Date(date);
    }

    const diffTime = now.getTime() - date.getTime();

    const oneMinute = 1000 * 60;
    const oneHour = oneMinute * 60;
    const oneDay = oneHour * 24;
    const oneMonth = oneDay * 30;

    const minutesAgo = Math.floor(diffTime / oneMinute);
    const hoursAgo = Math.floor(diffTime / oneHour);
    const daysAgo = Math.floor(diffTime / oneDay);
    const monthsAgo = Math.floor(diffTime / oneMonth);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const getEnding = (num: number, letter1: string, letter2: string) =>
      num % 10 == 0 || (num % 100 >= 11 && num % 100 <= 14) || num % 10 > 4
        ? letter1
        : letter2;

    const maleNounEnding = (num: number) => getEnding(num, 'i', 'a');
    const femaleNounEnding = (num: number) => getEnding(num, 'a', 'e');

    let relativeTime = '';
    if (monthsAgo > 2) {
      relativeTime = `prije ${monthsAgo} mjesec${maleNounEnding(monthsAgo)}`;
    } else if (daysAgo >= 1) {
      relativeTime = `prije ${daysAgo} dan${
        daysAgo % 10 == 1 && daysAgo % 100 != 11 ? '' : 'a'
      }`;
    } else if (hoursAgo >= 1) {
      relativeTime = `prije ${hoursAgo} sat${maleNounEnding(hoursAgo)}`;
    } else {
      relativeTime = `prije ${minutesAgo} minut${femaleNounEnding(minutesAgo)}`;
    }

    return `${day}.${month}.${year}. (${relativeTime})`;
  }
}
