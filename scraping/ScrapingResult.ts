import stringHash from 'string-hash';

import { Language, Entity, Entry } from '../store';
import { Source, SourceInfo } from '../store/source';

export class ScrapingSource extends Source {
  constructor(public uri: string) {
    super('scraping');
  }

  public equals(that: Source): boolean {
    return super.equals(that) && this.uri == (that as ScrapingSource).uri;
  }

  get hash(): number {
    return stringHash(this.uri);
  }

  get path(): string {
    return encodeURIComponent(`scraping_${this.uri}`);
  }
}

export class ScrapingResult {
  source?: Source;
  language?: Language;
  results?: Map<Entity, Entry[]>;
  follows?: SourceInfo[];
}
