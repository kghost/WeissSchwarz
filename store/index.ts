export class Tag {
  constructor(public name: string, public attributes?: any) {}
}

export class Source {
  constructor(
    public type: string,
    public tags?: Tag[],
    public fetched?: number
  ) {}
}

export enum Language {
  english,
  japanese,
}

export class Entry {
  constructor(
    public name: string,
    public content: any,
    public language?: Language,
    public sources?: Source[]
  ) {}
}

export class Entity {
  constructor(public path: string) {}
}

export class EntityTitle extends Entity {
  constructor(id: string) {
    super(`${id}`);
  }
}

export class EntityExpansion extends Entity {
  constructor(title: string, exp: string) {
    super(`${new EntityTitle(title).path}/${exp}`);
  }
}

export class EntityPack extends Entity {
  constructor(title: string, pack: string) {
    super(`${new EntityTitle(title).path}/${pack}`);
  }
}

export function EntityCardFromNo(no: string) {
  const [title, code] = no.split('/');
  const [exp, number] = code.split('-');
  return new EntityCard(title, exp, number);
}

export class EntityCard extends Entity {
  constructor(title: string, exp: string, card: string) {
    super(`${new EntityExpansion(title, exp).path}/${card}`);
  }
}
