import deepEqual from 'deep-equal';

import {
  serializable,

  serialize as s,
  deserialize as d,

  primitive,
  raw,
  map,
  list,
  object
} from 'serializr';

import { Source, SourceSchema } from './source';

export enum Language {
  english,
  japanese,
}

export class Entry {
  @serializable(primitive())
  public name: string

  @serializable(raw())
  public content: any

  @serializable(list(SourceSchema))
  public sources: Source[]

  @serializable(primitive())
  public language?: Language

  constructor(
    name: string,
    content: any,
    sources: Source[],
    language?: Language
  ) {
    this.name = name
    this.content = content
    this.sources = sources
    this.language = language
  }

  public merge(that: Entry) {
    if (deepEqual(this.content, that.content)) {
      for (const source of that.sources) {
        if (!this.sources.find((os) => deepEqual(source, os))) {
          this.sources.push(source);
        }
      }
      return true;
    }
    return false;
  }
}

class HelperObject {
  @serializable(map(list(object(Entry))))
  public entity = new Map<string, Entry[]>()

  constructor(entity: Map<string, Entry[]>) {
    this.entity = entity
  }
}

export function serialize(obj: Map<string, Entry[]>) {
  s(HelperObject, new HelperObject(obj))
}

export function deserialize(json: any) {
  return d(HelperObject, json)[0].entity
}