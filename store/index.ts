import stringify from 'json-stable-stringify';

import { Entry, serialize, deserialize } from './dao';
import { lockReadAndWrite } from './utils';

const db = './cache/db';

export class Entity {
  private get filepath() {
    return `${db}/${this.path}.json`;
  }

  constructor(public path: string) {}

  public async update(entries: Entry[]) {
    await lockReadAndWrite(this.filepath, async (s, write) => {
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
      const n = stringify(serialize(data), { space: 2 });
      if (s === n) return;
      console.log(`update ${this.path}`);
      await write(n);
    });
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
