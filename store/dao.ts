import deepEqual from 'deep-equal';

import {
  serializable,
  serialize as s,
  deserialize as d,
  primitive,
  raw,
  list,
  object,
  PropSchema,
  Context,
} from 'serializr';

import { Source } from './Source';
import { SourceSchema } from './SourceSchema';

export enum Language {
  english,
  japanese,
}

function map(propSchema: PropSchema) {
  return {
    serializer(m: Map<string, any>) {
      const result: any = {};
      for (const [key, v] of m) result[key] = propSchema.serializer(v);
      return result;
    },
    deserializer(
      json: any,
      done: (err: any, targetPropertyValue: any) => void,
      context: Context,
      currentPropertyValue: any
    ): void {
      if (!json || typeof json !== 'object') {
        return void done('[serializr] expected JSON object', undefined);
      }
      const keys = Object.keys(json);
      list(propSchema).deserializer(
        keys.map((key) => json[key]),
        (err, values) => {
          if (err) return void done(err, undefined);
          const newValue = new Map();
          for (let i = 0, l = keys.length; i < l; i++) {
            newValue.set(keys[i], values[i]);
          }
          done(null, newValue);
        },
        context,
        undefined
      );
    },
  };
}

export class Entry {
  public name: string;

  @serializable(raw())
  public content: any;

  @serializable(list(SourceSchema))
  public sources: Source[];

  @serializable(primitive())
  public language?: Language;

  constructor(
    name: string,
    content: any,
    sources: Source[],
    language?: Language
  ) {
    this.name = name;
    this.content = content;
    this.sources = sources;
    this.language = language;
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
  public entity = new Map<string, Entry[]>();

  constructor(entity: Map<string, Entry[]>) {
    this.entity = entity;
  }
}

export function serialize(obj: Map<string, Entry[]>) {
  return s(new HelperObject(obj)).entity;
}

export function deserialize(json: any) {
  return d(HelperObject, { entity: json }).entity;
}
