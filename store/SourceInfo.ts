import deepEqual from 'deep-equal';

import {
  serializable,
  serialize,
  deserialize,
  primitive,
  raw,
  object,
  list,
} from 'serializr';

import { lockReadAndWrite } from './utils';
import { Source } from './Source';
import { SourceSchema } from './sourceSchema';

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
    await lockReadAndWrite(this.source.cachepath, async (s, write) => {
      if (s === undefined) {
        const w = JSON.stringify(serialize(this));
        console.log(`Source created: ${w} ${this.source.cachepath}`);
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
          console.log(`Source updated: ${w} ${this.source.cachepath}`);
          await write(w);
        }
      }
    });
  }
}
