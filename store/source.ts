import { dirname } from 'path';
import { promises } from 'fs';
const { open } = promises;
import { mkdirp } from 'fs-extra';

import stringify from 'json-stable-stringify';
import deepEqual = require('deep-equal');

export class Tag {
  constructor(public name: string, public attributes?: any) {}
}

const sources = './cache/sources';

export abstract class Source {
  constructor(public type: string) {}
  abstract get hash(): number;
  abstract get path(): string;

  private get filepath() {
    return `${sources}/${(this.hash % 256).toString(16).padStart(2, '0')}/${
      this.path
    }`;
  }

  private async openFile(discard = false) {
    const p = this.filepath;
    await mkdirp(dirname(p));
    if (!discard) {
      try {
        return { fd: await open(p, 'r+'), exist: true };
      } catch (e) {
        if (e.code != 'ENOENT') throw e;
        return { fd: await open(p, 'wx'), exist: false };
      }
    } else {
      return { fd: await open(p, 'w+'), exist: false };
    }
  }

  public async readInfo() {
    const { fd, exist } = await this.openFile();
    try {
      if (!exist) return { fd, json: new SourceInfo(this) };
      else
        return {
          fd,
          json: JSON.parse(
            await fd.readFile({ encoding: 'utf8' })
          ) as SourceInfo,
        };
    } catch (e) {
      console.log(`discard ${this.filepath}: ${e}`);
      fd.close();
      return { fd: (await this.openFile(true)).fd, json: new SourceInfo(this) };
    }
  }

  public async fetched() {
    const { fd, json } = await this.readInfo();
    try {
      json.fetched = Math.round(new Date().getTime() / 1000);
      await fd.truncate(0);
      await fd.write(JSON.stringify(json), 0);
      console.log(`Source fetched: ${JSON.stringify(json)}`);
    } finally {
      await fd.close();
    }
  }
}

export class SourceInfo {
  constructor(
    public source: Source,
    public tags?: Tag[],
    public updated?: number,
    public fetched?: number
  ) {}

  public async save() {
    const { fd, json } = await this.source.readInfo();
    try {
      if (!deepEqual(json.tags, this.tags)) {
        await fd.truncate(0);
        await fd.write(
          JSON.stringify({
            ...json,
            ...(this as any),
            updated: Math.round(new Date().getTime() / 1000),
          }),
          0
        );
        console.log(`Source updated: ${JSON.stringify(this)}`);
      }
    } finally {
      await fd.close();
    }
  }
}
