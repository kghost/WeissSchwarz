import { RBTree } from 'bintrees';
import { promises } from 'fs';
const { readdir, lstat } = promises;
import { join } from 'path';

import { dbCache, EntityFromPath, Entity } from '../store';
import { RuleCopy, EntityIsCard, Result, RuleCopyIfType } from './rules/rule';
import { RuleImage } from './rules/image';
import { RuleTitles } from './rules/titles';
import { RuleText, RuleFlavor } from './rules/card';
import { RuleTitle } from './rules/title';
import { RuleExpansion } from './rules/expansion';

export class Results {
  private tree = new RBTree<Result>((e1, e2) => e1.entity.compare(e2.entity));

  public *[Symbol.iterator]() {
    const it = this.tree.iterator();
    for (let item = it.next(); item != null; item = it.next()) {
      yield item as Result;
    }
  }

  public async get(entity: Entity): Promise<Result> {
    const t = new Result(entity);
    const r = this.tree.find(t);
    if (r != null) return r;
    this.tree.insert(t);
    await t.init();
    return t;
  }
}

export default async function() {
  const results = new Results();
  const rules = [
    ...['name', 'color', 'rarity', 'side', 'trigger', 'type'].map((f) =>
      RuleCopy(EntityIsCard, f)
    ),
    ...['power', 'level', 'cost', 'soul', 'trait'].map((f) =>
      RuleCopyIfType(EntityIsCard, f, 'Character')
    ),
    ...['level', 'cost'].map((f) => RuleCopyIfType(EntityIsCard, f, 'Event')),
    new RuleText(),
    new RuleFlavor(),
    new RuleImage(),
    new RuleTitles(),
    new RuleTitle(),
    new RuleExpansion(),
  ];

  async function r(dir: string) {
    for (const file of await readdir(dir)) {
      const fullPath = join(dir, file);
      if ((await lstat(fullPath)).isDirectory()) await r(fullPath);
      else {
        console.log(`processing ${fullPath}`);
        const e = EntityFromPath(fullPath);
        for (const rule of rules) await rule.process(e, results);
      }
    }
  }
  await r(dbCache);

  for (const result of results) await result.finalize();
}
