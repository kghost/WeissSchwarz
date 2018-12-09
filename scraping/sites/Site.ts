import { ScrapingResult, ScrapingSource } from '../ScrapingResult';
import { PageFactory } from '../PageFactory';
import { Source } from '../../store/source';

export interface IScrapingSite {
  canHandle(url: string): boolean;
  scrap(pageFactory: PageFactory, source: Source): Promise<ScrapingResult>;
}

export abstract class ScrapingSite<U = undefined, V = ScrapingResult>
  implements IScrapingSite {
  public abstract readonly match: RegExp;

  public canHandle(url: string) {
    return !!url.match(this.match);
  }

  protected async preFetch(): Promise<U | undefined> {
    return;
  }
  protected abstract fetch(u: U): V;
  protected async afterFetch(source: Source, v: V): Promise<ScrapingResult> {
    return (v as any) as ScrapingResult;
  }

  public async scrap(
    pageFactory: PageFactory,
    source: Source
  ): Promise<ScrapingResult> {
    const page = await pageFactory.get();
    const url = (source as ScrapingSource).uri;
    try {
      console.log(`preparing ${url}`);
      const u = await this.preFetch();
      console.log(`loading ${url}`);
      await page.goto(url);
      console.log(`loaded ${url}`);
      const v = await page.evaluate(this.fetch, [u]);
      console.log(`fetched ${url}`);
      const r = await this.afterFetch(source, v);
      console.log(`done ${url}`);
      await source.fetched();
      r.source = source;
      return r;
    } finally {
      await page.close();
    }
  }
}
