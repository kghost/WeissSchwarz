import { launch, Browser, Page } from 'puppeteer';

export class PageFactory {
  private browser: Browser | null = null;

  async close() {
    if (this.browser) await this.browser.close();
  }

  async get(): Promise<Page> {
    if (this.browser == null) {
      this.browser = await launch({
        devtools: true,
        headless: false,
        slowMo: 500,
        args: ['--no-sandbox'],
      });
    }
    return await this.browser.newPage();
  }
}
