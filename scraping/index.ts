import { sites } from './sites';
import { PageFactory } from './PageFactory';
import { ScrapingSource } from './ScrapingResult';
import { Source, SourceInfo } from '../store/source';

export default async function (recursive: boolean, url: string, filter: (si: SourceInfo) => boolean = (si) => false) {
  const factory = new PageFactory();
  try {
    const q: Source[] = [new ScrapingSource(url)]
    function* sources() {
      while (q.length > 0) yield q.pop() as ScrapingSource
    }

    for (const source of sources()) {
      for (const site of Object.values(sites)) {
        if (site.canHandle(source)) {
          const result = await site.scrap(factory, source);
          if (result.results) {
            for (const [entity, entries] of result.results) {
              await entity.update(entries);
            }
          }
          if (result.follows) {
            for (const si of result.follows) {
              await si.save();
              if (filter(si)) q.push(si.source)
            }
          }
        }
      }
    }
  } finally {
    await factory.close();
  }
}
