import stringHash from 'string-hash';

import { serializable, primitive } from 'serializr';

import { Entity } from '../store';
import { Entry, Language } from '../store/dao';

import { Source, SourceInfo } from '../store/source';

export class ScrapingSource extends Source {
  @serializable(primitive())
  public uri: string;

  constructor(uri: string) {
    super('scraping');
    this.uri = uri;
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
