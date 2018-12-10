import { dirname } from 'path';
import { promises } from 'fs';
const { open } = promises;
import { mkdirp } from 'fs-extra';

import { default as NestedError } from 'nested-error-stacks';
import stringify from 'json-stable-stringify';

import { Entry, serialize, deserialize } from './dao';
import deepEqual = require('deep-equal');

const db = './cache/db';

export async function lockReadAndWrite(path: string, work: () => Promise<void>) {
  await mkdirp(dirname(path));

  let close: () => Promise<void> = async () => { return }

  try {
    let write: (s: string) => Promise<void> = async (s) => { return }
    try {
      const fd = await open(path, 'r+')
      write = async (s) => {
        await fd.truncate(0)
        await fd.write(stringify(s, { space: 2 }), 0);
      }
      close = async () => await fd.close()
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
      const fd = await open(path, 'wx')

      write = async (s) => {
        await fd.truncate(0)
        await fd.write(stringify(s, { space: 2 }), 0);
      }
    }
  } finally {
    await close()
  }
}

export class Entity {
  private get filepath() {
    return `${db}/${this.path}.json`;
  }

  constructor(public path: string) { }

  private async readInfo() {
    const p = this.filepath;
    await mkdirp(dirname(p));
    let write: (s: string) => Promise<void> = async (s) => { return }
    let close: () => Promise<void> = async () => { return }
    try {
      const fd = await open(p, 'r+')
      write = async (s) => {
        await fd.truncate(0)
        await fd.write(stringify(s, { space: 2 }), 0);
      }
      close = async () => await fd.close()
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
      write = async (s) => {
        const fd = await open(p, 'wx')
        await fd.truncate(0)
        await fd.write(stringify(s, { space: 2 }), 0);
      }
    }

    try {
      if (!exist) return { fd, cache: {}, json: deserialize({}) };
      else {
        const cache = JSON.parse(await fd.readFile({ encoding: 'utf8' }));
        return {
          fd,
          cache,
          json: deserialize(cache),
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
        const oes = json.get(e.name) as Entry[];
        if (oes) {
          if (!oes.find((oe) => oe.merge(e))) oes.push(e);
        } else {
          json.set(e.name, [e]);
        }
      }
      const nj = serialize(json)
      if (deepEqual(cache, nj)) return;
      console.log(`update ${this.path}`)
      await fd.write(stringify(nj, { space: 2 }), 0);
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
