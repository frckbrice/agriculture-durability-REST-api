import { Injectable } from '@nestjs/common';

@Injectable()
export class Slugify {
  slugify(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-_]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
