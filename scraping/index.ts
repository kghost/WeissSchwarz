import { RBTree } from 'bintrees';

import { sites } from './sites';
import { PageFactory } from './PageFactory';
import { ScrapingSource } from './ScrapingSource';
import { Source } from '../store/Source';
import { SourceInfo } from '../store/SourceInfo';
import { ScrapingResult } from './ScrapingResult';

export async function scraping(
  factory: PageFactory,
  source: Source
): Promise<ScrapingResult | null> {
  for (const site of Object.values(sites)) {
    if (site.canHandle(source)) {
      const result = await site.scrap(factory, source);
      if (result.results) {
        for (const [entity, entries] of result.results) {
          await entity.update(entries);
        }
      }
      if (result.follows) {
        for (const si of result.follows) await si.save();
      }
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
    const q: Source[] = [new ScrapingSource(url)];
    function* sources() {
      while (q.length > 0) yield q.pop() as ScrapingSource;
    }

    for (const source of sources()) {
      if (!visited.find(source)) {
        visited.insert(source);
        const result = await scraping(factory, source);
        if (result != null && result.follows) {
          for (const si of result.follows) {
            if (filter(si)) q.push(si.source);
          }
        }
      }
    }
  } finally {
    await factory.close();
  }
}
