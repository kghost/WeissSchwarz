import deepEqual from 'deep-equal';

import {
  serializable,
  serialize,
  deserialize,
  getDefaultModelSchema,
  primitive,
  custom,
  raw,
  object,
  list,
} from 'serializr';

import { ScrapingSource } from '../scraping/ScrapingResult';
import { lockReadAndWrite } from './utils';

const sources = './cache/sources';

export const SourceSchema = custom(
  (v) => serialize(getDefaultModelSchema(v), v),
  (json: any, _0: any, _1: any, done: (err: any, result: any) => void) => {
    if ((json as Source).type === 'scraping') {
      return deserialize(getDefaultModelSchema(ScrapingSource), json, done);
    }
    throw new Error(`Unknown source type ${json.type}`);
  }
);

export abstract class Source {
  @serializable(primitive())
  public type: string;

  constructor(type: string) {
    this.type = type;
  }

  abstract get hash(): number;
  abstract get path(): string;

  public get filepath() {
    return `${sources}/${(this.hash % 256).toString(16).padStart(2, '0')}/${
      this.path
    }`;
  }

  public async fetched() {
    await lockReadAndWrite(this.filepath, async (s, write) => {
      const data =
        s === undefined
          ? new SourceInfo(this)
          : ((deserialize(SourceInfo, JSON.parse(s)) as any) as SourceInfo);
      data.fetched = Math.round(new Date().getTime() / 1000);
      const s2 = JSON.stringify(serialize(data));
      console.log(`Source fetched: ${s2}`);
      await write(s2);
    });
  }
}

export class Tag {
  @serializable(primitive())
  public name: string;

  @serializable(raw())
  public attributes?: any;

  constructor(name: string, attributes?: any) {
    this.name = name;
    this.attributes = attributes;
  }
}

export class SourceInfo {
  @serializable(SourceSchema)
  public source: Source;

  @serializable(list(object(Tag)))
  public tags: Tag[];

  @serializable(primitive())
  public updated?: number;

  @serializable(primitive())
  public fetched?: number;

  constructor(
    source: Source,
    tags: Tag[] = [],
    updated?: number,
    fetched?: number
  ) {
    this.source = source;
    this.tags = tags;
    this.updated = updated;
    this.fetched = fetched;
  }

  public async save() {
    await lockReadAndWrite(this.source.filepath, async (s, write) => {
      if (s === undefined) {
        const w = JSON.stringify(serialize(this));
        console.log(`Source created: ${w} ${this.source.filepath}`);
        await write(w);
      } else {
        const data = (deserialize(
          SourceInfo,
          JSON.parse(s)
        ) as any) as SourceInfo;
        if (!deepEqual(data.tags, this.tags)) {
          this.fetched = data.fetched;
          this.updated = Math.round(new Date().getTime() / 1000);
          const w = JSON.stringify(serialize(this));
          console.log(`Source updated: ${w} ${this.source.filepath}`);
          await write(w);
        }
      }
    });
  }
}
