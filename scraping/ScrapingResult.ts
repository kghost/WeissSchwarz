import { Source, Language, Tag, Entity, Entry } from '../store';

export class ScrapingSource extends Source {
  constructor(public uri: string, tags?: Tag[]) {
    super('scraping', tags);
  }
}

export class ScrapingResult {
  source?: Source;
  language?: Language;
  results?: Map<Entity, Entry[]>;
  follows?: ScrapingSource[];
}
