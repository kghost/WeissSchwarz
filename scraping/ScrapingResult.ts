import stringHash from 'string-hash';

import { Language, Entity, Entry } from '../store';
import { Source, SourceInfo } from '../store/source';

export class ScrapingSource extends Source {
  constructor(public uri: string) {
    super('scraping');
  }

  get hash(): number {
    return stringHash(this.uri);
  }

  get path(): string {
    return encodeURIComponent(`scraping_${this.uri}`);
  }
}

export class ScrapingResult {
  public source?: Source;
  public language?: Language;
  public results?: Map<Entity, Entry[]>;
  public follows?: SourceInfo[];
}
