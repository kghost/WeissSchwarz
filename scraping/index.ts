import { RBTree } from 'bintrees';

import { sites } from './sites';
import { PageFactory } from './PageFactory';
import { ScrapingSource } from './ScrapingSource';
import { Source } from '../store/Source';
import { SourceInfo } from '../store/SourceInfo';
import { ScrapingResult } from './ScrapingResult';

export async function scraping(
  factory: PageFactory,
  si: SourceInfo
): Promise<ScrapingResult | null> {
  for (const site of Object.values(sites)) {
    if (site.canHandle(si.source)) {
      const result = await site.scrap(factory, si.source);
      if (result.results) {
        for (const [entity, entries] of result.results) {
          await entity.update(entries);
        }
      }
      if (result.follows) {
        for (const sif of result.follows) await sif.save();
      }
      await si.updateFetched();
      return result;
    }
  }
  return null;
}

export default async function(
  recursive: boolean,
  url: string,
  filter: (si: SourceInfo) => boolean = (si) => false
) {
  const factory = new PageFactory();
  await factory.init();
  const visited = new RBTree((sa: Source, sb: Source) => sa.compare(sb));
  try {
    const q: SourceInfo[] = [new SourceInfo(new ScrapingSource(url))];
    function* sis() {
      while (q.length > 0) yield q.pop() as SourceInfo;
    }

    for (const si of sis()) {
      if (!visited.find(si.source)) {
        visited.insert(si.source);
        const result = await scraping(factory, si);
        if (result != null && result.follows) {
          for (const sif of result.follows) if (filter(sif)) q.push(sif);
        }
      }
    }
  } finally {
    await factory.close();
  }
}
