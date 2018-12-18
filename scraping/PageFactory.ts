import { launch, Browser, Page } from 'puppeteer';

export class PageFactory {
  private browser: Browser | null = null;

  public async init() {
    this.browser = await launch();
  }

  public async close() {
    if (this.browser) await this.browser.close();
  }

  public async get(): Promise<Page> {
    return await (this.browser as Browser).newPage();
  }
}
