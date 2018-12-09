import { dirname } from 'path';
import { promises } from 'fs';
const { open } = promises;
import { mkdirp } from 'fs-extra';

import * as NestedError from 'nested-error-stacks';
import stringyfy from 'json-stable-stringify';
import deepEqual from 'deep-equal';

import { Source } from './source';

export enum Language {
  english,
  japanese,
}

export class Entry {
  constructor(
    public name: string,
    public content: any,
    public sources: Source[],
    public language?: Language
  ) {}

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

const db = './cache/db';

export class Entity {
  private get filepath() {
    return `${db}/${this.path}`;
  }

  constructor(public path: string) {}

  private async openFile() {
    const p = this.filepath;
    await mkdirp(dirname(p));
    try {
      return { fd: await open(p, 'r+'), exist: true };
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
      return { fd: await open(p, 'wx'), exist: false };
    }
  }

  private async readInfo() {
    const { fd, exist } = await this.openFile();
    try {
      if (!exist) return { fd, cache: '', json: {} };
      else {
        const cache = await fd.readFile({ encoding: 'utf8' });
        return {
          fd,
          cache,
          json: JSON.parse(cache) as any,
        };
      }
    } catch (e) {
      fd.close();
      throw new NestedError(`Error ${this.filepath}`, e);
    }
  }

  public async update(entries: Entry[]) {
    const { fd, cache, json } = await this.readInfo();
    try {
      for (const e of entries) {
        const oes = json[e.name] as Entry[];
        if (oes) {
          if (!oes.find((oe) => oe.merge(e))) oes.push(e);
        } else {
          json[e.name] = [e];
        }
      }
      const ns = stringyfy(json, { space: 2 });
      if (cache === ns) return;
      await fd.write(ns, 0);
    } finally {
      fd.close();
    }
  }
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
  const [exp, num] = code.split('-');
  return new EntityCard(title, exp, num);
}

export class EntityCard extends Entity {
  constructor(title: string, exp: string, card: string) {
    super(`${new EntityExpansion(title, exp).path}/${card}`);
  }
}
