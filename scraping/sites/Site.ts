import { ScrapingResult, ScrapingSource } from '../ScrapingResult'
import { PageFactory } from '../PageFactory'

export interface IScrapingSite {
  canHandle(url: string): boolean
  scrap(pageFactory: PageFactory, url: string): Promise<ScrapingResult>
}

export abstract class ScrapingSite<U = undefined, V = ScrapingResult> implements IScrapingSite {
  abstract readonly match: RegExp

  public canHandle(url: string) {
    return !!url.match(this.match)
  }

  protected async preFetch(): Promise<U | undefined> {
    return;
  }
  protected abstract fetch(u: U): V
  protected async afterFetch(v: V): Promise<ScrapingResult> {
    return v as any as ScrapingResult;
  }

  async scrap(pageFactory: PageFactory, url: string): Promise<ScrapingResult> {
    const page = await pageFactory.get()
    try {
      console.log(`preparing ${url}`)
      const u = await this.preFetch()
      console.log(`loading ${url}`)
      await page.goto(url)
      console.log(`loaded ${url}`)
      const v = await page.evaluate(this.fetch, [u])
      console.log(`fetched ${url}`)
      const r = await this.afterFetch(v)
      console.log(`done ${url}`)
      r.source = new ScrapingSource(url)
      console.log(JSON.stringify(r))
      return r
    } finally {
      await page.close()
    }
  }
}