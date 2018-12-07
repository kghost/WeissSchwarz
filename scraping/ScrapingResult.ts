import { Source, Language, Tag } from '../store'

export class ScrapingSource extends Source {
  constructor(public uri: string, tags?: Tag[]) {
    super('scraping', tags)
  }
}

export class DataEntry {
  constructor(public name: string, public content: any) { }
}

export class DataObject {
  constructor(public path: string) { }
}

export class Link {
  constructor(public uri?: string, public tags?: Tag[]) { }
}

export class ScrapingResult {
  source?: Source
  language?: Language
  results?: Map<DataObject, DataEntry[]>
  follows?: Link[]
}