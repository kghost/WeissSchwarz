import { sites } from './sites';
import { PageFactory } from './PageFactory';
import { ScrapingSource } from './ScrapingResult';

export default async function(recursive: boolean, url: string) {
  const factory = new PageFactory();
  try {
    for (const site of Object.values(sites)) {
      if (site.canHandle(url)) {
        const result = await site.scrap(factory, new ScrapingSource(url));
        if (result.results) {
          for (const [entity, entries] of result.results)
            await entity.update(entries);
        }
        if (result.follows) {
          for (const source of result.follows) await source.save();
        }
      }
    }
  } finally {
    await factory.close();
  }
}
