import { dirname } from 'path';
import { promises } from 'fs';
const { readFile, writeFile } = promises;
import { mkdirp } from 'fs-extra';

import { basename, sep, relative } from 'path';
import stringify from 'json-stable-stringify';

import { Entry, serialize, deserialize } from './dao';
import { lockReadAndWrite } from './utils';

export const dbFile = './data';
export const dbCache = './cache/db';

export abstract class Entity {
  private cache: Map<string, Entry[]> | null = null;
  protected abstract get filepath(): string;

  private get datapath() {
    return `${dbFile}/${this.filepath}.json`;
  }

  private get cachepath() {
    return `${dbCache}/${this.filepath}.json`;
  }

  constructor(public path: string) {}

  public compare(that: Entity) {
    return this.path === that.path ? 0 : this.path > that.path ? 1 : -1;
  }

  public async load() {
    try {
      const s = await readFile(this.datapath, { encoding: 'utf8' });
      return JSON.parse(s);
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
      return {};
    }
  }
  public async save(obj: any) {
    await mkdirp(dirname(this.datapath));
    try {
      const s = await readFile(this.datapath, { encoding: 'utf8' });
      const n = stringify(obj, { space: 2 });
      if (s !== n) {
        await writeFile(this.datapath, n, { encoding: 'utf8' });
        console.log(`updated ${this.datapath}`);
      }
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
      await writeFile(this.datapath, stringify(obj, { space: 2 }), {
        encoding: 'utf8',
      });
      console.log(`created ${this.datapath}`);
    }
  }

  public async update(entries: Entry[]) {
    await lockReadAndWrite(this.cachepath, async (s, write) => {
      const data =
        s === undefined ? deserialize({}) : deserialize(JSON.parse(s));
      for (const e of entries) {
        const oes = data.get(e.name) as Entry[];
        if (oes) {
          if (!oes.find((oe) => oe.merge(e))) oes.push(e);
        } else {
          data.set(e.name, [e]);
        }
      }
      this.cache = data;
      const n = stringify(serialize(data), { space: 2 });
      if (s === n) return;
      console.log(`update ${this.path}`);
      await write(n);
    });
  }

  public async read(): Promise<Map<string, Entry[]>> {
    if (this.cache !== null) return this.cache;
    else {
      this.cache = await lockReadAndWrite(this.cachepath, async (s, _0) => {
        return s === undefined ? deserialize({}) : deserialize(JSON.parse(s));
      });
      return this.cache as Map<string, Entry[]>;
    }
  }
}

export class EntityRoot extends Entity {
  constructor() {
    super('');
  }

  protected get filepath(): string {
    return 'database';
  }
}

export class EntityTitle extends Entity {
  constructor(public readonly id: string) {
    super(`${id}`);
  }

  protected get filepath(): string {
    return `${this.path}/title`;
  }
}

export class EntityExpansion extends Entity {
  constructor(public readonly title: string, public readonly exp: string) {
    super(`${new EntityTitle(title).path}/${exp}`);
  }

  protected get filepath(): string {
    return `${this.path}/expansion`;
  }
}

export class EntityCard extends Entity {
  constructor(
    public readonly title: string,
    public readonly exp: string,
    public readonly card: string
  ) {
    super(`${new EntityExpansion(title, exp).path}/${card}`);
  }

  protected get filepath(): string {
    return this.path;
  }
}

export function EntityCardFromNo(no: string) {
  const [title, code] = no.split('/');
  const [exp, num] = code.split('-');
  return new EntityCard(title, exp, num);
}

export function EntityFromPath(path: string) {
  const [title, exp, card] = relative(dbCache, path).split(sep);
  if (card) return new EntityCard(title, exp, basename(card, '.json'));
  if (exp) return new EntityExpansion(title, basename(exp, '.json'));
  return new EntityTitle(basename(title, '.json'));
}
