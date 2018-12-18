import { promises } from 'fs';
const { readdir, lstat } = promises;
import { join } from 'path';
import { deserialize } from 'serializr';

import { parallel } from './parallel';

import { PageFactory } from '../scraping/PageFactory';
import { SourceInfo } from '../store/SourceInfo';
import { dbCacheSrouces } from '../store';
import { lockReadAndWrite } from '../store/utils';
import { scraping } from '../scraping';

export default async function() {
  const factory = new PageFactory();
  await factory.init();
  try {
    const f = parallel(10);
    async function r(dir: string) {
      for (const file of await readdir(dir)) {
        const fullPath = join(dir, file);
        if ((await lstat(fullPath)).isDirectory()) await r(fullPath);
        else {
          console.log(`processing ${fullPath}`);

          const si = (await (async () => {
            return await lockReadAndWrite(fullPath, async (s, write) => {
              return (deserialize(
                SourceInfo,
                JSON.parse(s as string)
              ) as any) as SourceInfo;
            });
          })()) as SourceInfo;

          if (!si.fetched && si.tags.find((tag) => tag.name === 'card')) {
            await f(async () => await scraping(factory, si.source));
          }
        }
      }
    }
    await r(dbCacheSrouces);
  } finally {
    await factory.close();
  }
}
