import { sites } from './sites';
import { PageFactory } from './PageFactory';

export default async function(recursive: boolean, url: string) {
  const factory = new PageFactory();
  try {
    for (const site of Object.values(sites)) {
      if (site.canHandle(url)) {
        const result = await site.scrap(factory, url);
      }
    }
  } finally {
    await factory.close();
  }
}
