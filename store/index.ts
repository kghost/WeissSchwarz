export class Tag {
  constructor(public name: string, public attributes?: any) { }
}

export class Source {
  constructor(public type: string, public tags?: Tag[]) { }
}

export enum Language {
  english,
  japanese,
}

export class DataEntry {
  constructor(public name: string, public content: any, public language?: Language, public sources?: Source[]) { }
}

export class DataLocation {
  constructor(public path: string) { }
}