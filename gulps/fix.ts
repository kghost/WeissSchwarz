import { promises } from 'fs';
const { readdir, lstat } = promises;
import { join } from 'path';

import { dbCache, EntityFromPath, Entity } from '../store';
import { Entry } from 'store/dao';

export default async function() {
  async function r(dir: string) {
    for (const file of await readdir(dir)) {
      const fullPath = join(dir, file);
      if ((await lstat(fullPath)).isDirectory()) await r(fullPath);
      else {
        console.log(`processing ${fullPath}`);
        const entity = EntityFromPath(fullPath);
        await entity.handle(async (data) => {
          const x = data.get('title') as Entry[];
          data.delete('title');
          data.set('product', x);
          return data;
        });
      }
    }
  }
  await r(dbCache);
}
